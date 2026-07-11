import express, { Request as ExpressRequest, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { GoogleGenAI } from '@google/genai';
import { createSupabaseContext } from '@supabase/server';
import { calculateAtsScore } from './src/scoringEngine';
import { Resume, AnalyzerResult, JDMatchResult } from './src/types';

// Load environment variables
dotenv.config();

// Fix for ESModules __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Google Gen AI client
const geminiApiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey: geminiApiKey });

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Helper: Convert Express request to standard Web Request for @supabase/server
function toWebRequest(req: ExpressRequest): Request {
  const url = `${req.protocol}://${req.get('host') || 'localhost'}${req.originalUrl}`;
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) {
      if (Array.isArray(value)) {
        value.forEach(v => headers.append(key, v));
      } else {
        headers.set(key, value);
      }
    }
  }
  return new Request(url, {
    method: req.method,
    headers: headers,
  });
}

// Optional Supabase Authentication Middleware using @supabase/server
async function supabaseAuthMiddleware(req: ExpressRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  // If no auth header or Supabase is not configured, skip verification
  if (!authHeader || !process.env.SUPABASE_URL) {
    return next();
  }

  try {
    const webRequest = toWebRequest(req);
    const { data: ctx, error } = await createSupabaseContext(webRequest, {
      auth: 'user',
      env: {
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY,
        SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
        SUPABASE_JWKS_URL: process.env.SUPABASE_JWKS_URL,
      }
    });

    if (error) {
      return res.status(error.status || 401).json({
        error: {
          code: error.code || 'UNAUTHORIZED_TOKEN',
          message: error.message || 'Invalid or expired Supabase token.',
          requestId: req.headers['x-request-id'] || `req-${Date.now()}`
        }
      });
    }

    // Attach verified user claims and client context to request
    (req as any).supabaseContext = ctx;
    (req as any).user = ctx.userClaims;
    next();
  } catch (err) {
    next(err);
  }
}

// Apply authentication middleware globally to all API routes
app.use('/api/', supabaseAuthMiddleware);

// Configure Multer for file uploads (in-memory storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Helper: Clean JSON response from Gemini (stripping markdown)
function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(json)?/, '').replace(/```$/, '');
  }
  return cleaned.trim();
}

// Basic health check route
app.get('/api/health', (req: ExpressRequest, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// 1. POST /api/v1/analyze
// Performs deterministic scoring and generates recommendations via Gemini API
app.post('/api/v1/analyze', async (req: ExpressRequest, res: Response, next: NextFunction) => {
  try {
    const { resume } = req.body as { resume: Resume };
    if (!resume) {
      const err: any = new Error('Resume object is required');
      err.status = 400;
      err.code = 'RESUME_REQUIRED';
      return next(err);
    }

    // A. Run deterministic scoring engine
    const analysisResult = calculateAtsScore(resume);

    // B. Call Gemini to generate recommendations explaining/tailoring to the score
    if (!geminiApiKey) {
      analysisResult.recommendations = [
        {
          id: 'rec-1',
          category: 'keywords',
          text: 'No Gemini API key configured. Please set GEMINI_API_KEY to receive real-time personalized recommendations.',
          severity: 'medium',
          section: 'skills'
        }
      ];
      return res.json({ data: analysisResult });
    }

    const prompt = `You are an elite Career Coach and ATS Expert.
The candidate's resume has been evaluated deterministically by our scoring engine.
Here are the scores (out of 100):
- Overall ATS Rating: ${analysisResult.atsScore}
- Formatting Density: ${analysisResult.categoryScores.formatting}
- Keyword Optimization: ${analysisResult.categoryScores.keywords}
- Readability Index: ${analysisResult.categoryScores.readability}
- Grammar Accuracy: ${analysisResult.categoryScores.grammar}
- Structural Completeness: ${analysisResult.categoryScores.completeness}

Here is the candidate's resume content:
${JSON.stringify(resume, null, 2)}

Your task is to analyze this resume and the computed scores, then compile a list of highly actionable, section-specific recommendations to improve the resume and increase its ATS score.
Return a valid JSON object conforming exactly to this structure:
{
  "recommendations": [
    {
      "id": "rec-1",
      "category": "formatting" | "keywords" | "readability" | "grammar" | "completeness",
      "text": "Detailed, specific advice on what to change, what to add, or how to rephrase.",
      "severity": "high" | "medium" | "low",
      "section": "experience" | "summary" | "skills" | "certifications" | "languages" | "education" | "projects" | "personal"
    }
  ]
}
Provide at least 3-5 high-quality, practical recommendations. Focus on incorporating action verbs, adding quantified achievements/metrics, resolving formatting issues, and adding missing details.
Output ONLY a valid JSON object. No markdown block, no intro, no wrap.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    try {
      const jsonText = cleanJsonResponse(response.text || '{}');
      const parsed = JSON.parse(jsonText);
      if (parsed && Array.isArray(parsed.recommendations)) {
        analysisResult.recommendations = parsed.recommendations;
      }
    } catch (parseError) {
      console.error('Error parsing Gemini recommendations JSON:', parseError);
      analysisResult.recommendations = [
        {
          id: 'rec-f1',
          category: 'keywords',
          text: 'Incorporate more specific technical skills corresponding to your target engineering track.',
          severity: 'high',
          section: 'skills'
        },
        {
          id: 'rec-f2',
          category: 'completeness',
          text: 'Complete all professional coordinates and links like LinkedIn or Github.',
          severity: 'medium',
          section: 'personal'
        }
      ];
    }

    res.json({ data: analysisResult });
  } catch (err) {
    next(err);
  }
});

// 2. POST /api/v1/resumes/upload
// Parses uploaded document, creates a structured Resume, runs ATS scoring & recommendations
app.post('/api/v1/resumes/upload', upload.single('file'), async (req: ExpressRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      const err: any = new Error('No resume file uploaded');
      err.status = 400;
      err.code = 'FILE_REQUIRED';
      return next(err);
    }

    // A. Extract text depending on file type
    let extractedText = '';
    const mime = req.file.mimetype;
    const filename = req.file.originalname.toLowerCase();

    if (mime === 'application/pdf') {
      const parsedPdf = await pdfParse(req.file.buffer);
      extractedText = parsedPdf.text;
    } else if (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || filename.endsWith('.docx')) {
      const parsedDoc = await mammoth.extractRawText({ buffer: req.file.buffer });
      extractedText = parsedDoc.value;
    } else {
      extractedText = req.file.buffer.toString('utf-8');
    }

    if (!extractedText || extractedText.trim().length < 50) {
      const err: any = new Error('Unable to extract sufficient text from the uploaded file.');
      err.status = 400;
      err.code = 'TEXT_EXTRACTION_FAILED';
      return next(err);
    }

    // B. Call Gemini to parse and structure raw text into Resume JSON object
    if (!geminiApiKey) {
      const err: any = new Error('Gemini API key is required to parse uploaded documents.');
      err.status = 500;
      err.code = 'GEMINI_KEY_MISSING';
      return next(err);
    }

    const parsePrompt = `You are an expert ATS Resume Parser. Your job is to extract resume data from raw text and structure it into a perfect, valid JSON conforming exactly to this TypeScript interface:
\`\`\`typescript
export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
}
export interface Experience {
  company: string;
  position: string;
  location: string;
  startDate: string; // YYYY-MM or similar
  endDate: string;   // YYYY-MM or Present
  current: boolean;
  bullets: string[];
}
export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  gpa: string;
}
export interface Project {
  name: string;
  role: string;
  url: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}
export interface Certification {
  name: string;
  issuer: string;
  date: string;
  url: string;
}
export interface Language {
  name: string;
  proficiency: string;
}
export interface Resume {
  title: string;
  personalInfo: PersonalInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  projects: Project[];
  skills: string[];
  certifications: Certification[];
  languages: Language[];
}
\`\`\`
If some sections are missing, return empty arrays or empty strings.
Do not invent or add extra information. Only extract what is present in the text.
Use the candidate's name or target role to create a nice default "title" field.
Output ONLY a valid JSON object. No markdown block, no comments, no intro, no wrap.

Raw Resume Text to Parse:
${extractedText}`;

    const parseResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: parsePrompt,
    });

    const parsedResumeJsonText = cleanJsonResponse(parseResponse.text || '{}');
    const parsedResume: Resume = JSON.parse(parsedResumeJsonText);

    // Assign IDs to experiences, educations, projects to keep consistent with local types
    if (parsedResume.experience) {
      parsedResume.experience = parsedResume.experience.map((e, idx) => ({
        id: `exp-${Date.now()}-${idx}`,
        ...e
      })) as any;
    }
    if (parsedResume.education) {
      parsedResume.education = parsedResume.education.map((edu, idx) => ({
        id: `edu-${Date.now()}-${idx}`,
        ...edu
      })) as any;
    }
    if (parsedResume.projects) {
      parsedResume.projects = parsedResume.projects.map((p, idx) => ({
        id: `proj-${Date.now()}-${idx}`,
        ...p
      })) as any;
    }
    if (parsedResume.certifications) {
      parsedResume.certifications = parsedResume.certifications.map((c, idx) => ({
        id: `cert-${Date.now()}-${idx}`,
        ...c
      })) as any;
    }
    if (parsedResume.languages) {
      parsedResume.languages = parsedResume.languages.map((l, idx) => ({
        id: `lang-${Date.now()}-${idx}`,
        ...l
      })) as any;
    }

    // Set fallback title if none extracted
    if (!parsedResume.title) {
      parsedResume.title = parsedResume.personalInfo?.fullName
        ? `${parsedResume.personalInfo.fullName} Resume`
        : 'Uploaded Resume Draft';
    }
    parsedResume.id = `res-${Date.now()}`;
    parsedResume.lastEdited = new Date().toISOString();

    // C. Perform deterministic scoring
    const analysisResult = calculateAtsScore(parsedResume);

    // D. Call Gemini to generate recommendations for this newly parsed resume
    const recPrompt = `You are an elite Career Coach and ATS Expert.
Analyze the following parsed resume and computed scores, and return a list of actionable recommendations.
Here are the scores:
- Overall ATS Rating: ${analysisResult.atsScore}
- Formatting Density: ${analysisResult.categoryScores.formatting}
- Keyword Optimization: ${analysisResult.categoryScores.keywords}
- Readability Index: ${analysisResult.categoryScores.readability}
- Grammar Accuracy: ${analysisResult.categoryScores.grammar}
- Structural Completeness: ${analysisResult.categoryScores.completeness}

Here is the parsed resume content:
${JSON.stringify(parsedResume, null, 2)}

Return a valid JSON object conforming exactly to this structure:
{
  "recommendations": [
    {
      "id": "rec-1",
      "category": "formatting" | "keywords" | "readability" | "grammar" | "completeness",
      "text": "Detailed recommendation.",
      "severity": "high" | "medium" | "low",
      "section": "experience" | "summary" | "skills" | "certifications" | "languages" | "education" | "projects" | "personal"
    }
  ]
}
Output ONLY a valid JSON object. No markdown block, no comments, no intro, no wrap.`;

    const recResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: recPrompt,
    });

    try {
      const recJsonText = cleanJsonResponse(recResponse.text || '{}');
      const recParsed = JSON.parse(recJsonText);
      if (recParsed && Array.isArray(recParsed.recommendations)) {
        analysisResult.recommendations = recParsed.recommendations;
      }
    } catch (e) {
      console.error('Error parsing recommendations for upload:', e);
      analysisResult.recommendations = [
        {
          id: 'rec-u1',
          category: 'keywords',
          text: 'Flesh out more action achievements to maximize keywords alignment index.',
          severity: 'medium',
          section: 'experience'
        }
      ];
    }

    // Return BOTH the parsed Resume JSON object AND the ATS Analyzer Result!
    res.json({
      data: {
        resume: parsedResume,
        analysis: analysisResult
      }
    });

  } catch (err) {
    next(err);
  }
});

// 3. POST /api/v1/compare
// Performs AI-based matching and gap analysis against a job description
app.post('/api/v1/compare', async (req: ExpressRequest, res: Response, next: NextFunction) => {
  try {
    const { resume, jdText } = req.body as { resume: Resume; jdText: string };
    if (!resume || !jdText) {
      const err: any = new Error('Resume and job description text are required');
      err.status = 400;
      err.code = 'COMPARE_INPUTS_REQUIRED';
      return next(err);
    }

    if (!geminiApiKey) {
      const mockResult: JDMatchResult = {
        matchPercentage: 70,
        missingKeywords: ['system design', 'kubernetes', 'graphql'],
        skillGaps: [
          { skill: 'system design', status: 'missing' },
          { skill: 'kubernetes', status: 'missing' },
          { skill: 'graphql', status: 'missing' },
          { skill: 'react', status: 'found' },
          { skill: 'typescript', status: 'found' }
        ],
        experienceGapNotes: 'No API key configured. Set GEMINI_API_KEY to receive custom AI phrasing guidance.'
      };
      return res.json({ data: mockResult });
    }

    const prompt = `You are a professional Technical Recruiter and Job Fit Analyst.
We are comparing a candidate's resume against a target job description.
Your job is to perform a detailed skill gap analysis and keyword density comparison.

Candidate's Resume JSON:
${JSON.stringify(resume, null, 2)}

Target Job Description:
${jdText}

Analyze their skills, experience levels, and coordinates. Then output a valid JSON object conforming exactly to this structure:
{
  "matchPercentage": (integer between 0 and 100 representing how well the candidate aligns with the role),
  "missingKeywords": (array of strings, core missing technical keywords or tools extracted from the job description that are missing from the resume),
  "skillGaps": [
    {
      "skill": "name of skill",
      "status": "missing" | "found"
    }
  ],
  "experienceGapNotes": (string, 2-3 sentences explaining any experience gaps, e.g., leadership seniority or technical depth gaps, and how they should tailor their wording to fit better)
}
Include up to 8 key skills/tools from the JD in the skillGaps array, classifying which ones are found or missing on the resume.
Output ONLY a valid JSON object. No markdown block, no comments, no intro, no wrap.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    try {
      const jsonText = cleanJsonResponse(response.text || '{}');
      const parsedResult: JDMatchResult = JSON.parse(jsonText);
      res.json({ data: parsedResult });
    } catch (parseErr) {
      console.error('Error parsing JD match comparison result:', parseErr);
      res.status(500).json({
        error: {
          code: 'JSON_PARSE_ERROR',
          message: 'Failed to process AI-generated match result correctly.'
        }
      });
    }

  } catch (err) {
    next(err);
  }
});

// 4. POST /api/v1/improve
// Enhances a resume bullet point using Gemini AI
app.post('/api/v1/improve', async (req: ExpressRequest, res: Response, next: NextFunction) => {
  try {
    const { bullet, action, title } = req.body as { bullet: string; action: 'enhance-bullet' | 'fix-grammar'; title?: string };
    if (!bullet) {
      const err: any = new Error('Bullet text is required');
      err.status = 400;
      err.code = 'BULLET_REQUIRED';
      return next(err);
    }

    if (!geminiApiKey) {
      const fallback = action === 'enhance-bullet'
        ? `Spearheaded key strategic initiatives as ${title || 'Developer'}, improving core workflow performance by 25% and accelerating deployment latency.`
        : bullet.replace(/i did/gi, 'Successfully orchestrated').replace(/and got/gi, 'resulting in').trim();
      return res.json({ suggestion: fallback });
    }

    const prompt = `For the job role '${title || 'Professional'}', rewrite the following resume bullet point using a strong action verb, focusing on quantified results, metric indicators, and professional phrasing.
Action required: ${action === 'enhance-bullet' ? 'Focus on high impact, leadership achievements, and concrete metrics (e.g. percentages or cost/time savings).' : 'Ensure perfect business grammar, active voice, and professional phrasing.'}
Original bullet point: '${bullet}'

Output ONLY the rewritten bullet point in plain text. Do not wrap in quotes. No explanation, intro, or markdown.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.json({ suggestion: (response.text || '').trim() });
  } catch (err) {
    next(err);
  }
});

// 5. POST /api/v1/generate-summary
// Generates a professional summary from a resume profile using Gemini AI
app.post('/api/v1/generate-summary', async (req: ExpressRequest, res: Response, next: NextFunction) => {
  try {
    const { resume } = req.body as { resume: Resume };
    if (!resume) {
      const err: any = new Error('Resume object is required');
      err.status = 400;
      err.code = 'RESUME_REQUIRED';
      return next(err);
    }

    if (!geminiApiKey) {
      const fallback = `Results-oriented ${resume.title || 'Professional'} with hands-on expertise in ${resume.skills?.slice(0, 4).join(', ') || 'software engineering'}. Proven track record designing scalable solutions, coordinating cross-functional deliverables, and engineering milestones.`;
      return res.json({ suggestion: fallback });
    }

    const prompt = `Draft a compelling, results-focused professional summary for a resume (length: 300-500 characters, about 3-4 sentences) based on the following candidate profile:
Candidate Title: ${resume.title || 'Professional'}
Skills: ${resume.skills?.join(', ') || 'N/A'}
Experiences: ${JSON.stringify(resume.experience || [], null, 2)}
Projects: ${JSON.stringify(resume.projects || [], null, 2)}

Focus on high-impact language, strong action verbs, and highlight core competencies. Keep it professional, and do not use generic filler words.
Output ONLY the summary text in plain text. Do not wrap in quotes. No explanation, intro, or markdown.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.json({ suggestion: (response.text || '').trim() });
  } catch (err) {
    next(err);
  }
});

// Serve static assets from Vite's build output (dist)
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Standard Error Envelope Middleware
interface AppError extends Error {
  status?: number;
  code?: string;
}

app.use((err: AppError, req: ExpressRequest, res: Response, next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  const status = err.status || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  res.status(status).json({
    error: {
      code: code,
      message: err.message || 'An unexpected error occurred',
      requestId: req.headers['x-request-id'] || `req-${Date.now()}`
    }
  });
});

// Fallback all other routes to SPA index.html in production
app.get('*', (req: ExpressRequest, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api/')) {
    const err: AppError = new Error(`API endpoint ${req.path} not found`);
    err.status = 404;
    err.code = 'ENDPOINT_NOT_FOUND';
    return next(err);
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).send('Not Found');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
