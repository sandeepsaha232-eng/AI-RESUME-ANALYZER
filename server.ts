import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';
import { supabase } from './src/supabaseClient';
import { calculateAtsScore } from './src/scoringEngine';
import { Resume, AnalyzerResult, JDMatchResult, SkillGap } from './src/types';

// Load environment variables
dotenv.config();

// Fix for ESModules and CommonJS compatibility for __dirname and __filename
let __filename = '';
let __dirname = '';

try {
  __filename = fileURLToPath(import.meta.url);
  __dirname = path.dirname(__filename);
} catch (e) {
  __filename = path.join(process.cwd(), 'server.js');
  __dirname = process.cwd();
}

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Google Gen AI client
const geminiApiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey: geminiApiKey });

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));

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

// ==========================================
// JWT AUTHENTICATION MIDDLEWARE
// ==========================================
const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Access token is required. Please sign in.'
        }
      });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Your session has expired or is invalid. Please login again.'
        }
      });
    }

    // Attach verified user info to the request
    (req as any).user = {
      id: user.id,
      email: user.email || ''
    };

    next();
  } catch (err) {
    next(err);
  }
};

// Basic health check route
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// ==========================================
// AUTHENTICATION ENDPOINTS
// ==========================================

// 1. POST /api/v1/auth/signup
app.post('/api/v1/auth/signup', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, fullName } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        error: {
          code: 'BAD_REQUEST',
          message: 'Email and password are required'
        }
      });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || splitEmailName(email)
        }
      }
    });

    if (error) {
      return res.status(400).json({
        error: {
          code: 'SIGNUP_FAILED',
          message: error.message
        }
      });
    }

    res.status(201).json({
      message: 'Signup successful',
      data: {
        user: data.user,
        session: data.session
      }
    });
  } catch (err) {
    next(err);
  }
});

function splitEmailName(email: string): string {
  return email.split('@')[0];
}

// 2. POST /api/v1/auth/login
app.post('/api/v1/auth/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        error: {
          code: 'BAD_REQUEST',
          message: 'Email and password are required'
        }
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(400).json({
        error: {
          code: 'LOGIN_FAILED',
          message: error.message
        }
      });
    }

    res.json({
      message: 'Login successful',
      data: {
        user: data.user,
        session: data.session
      }
    });
  } catch (err) {
    next(err);
  }
});

// 3. GET /api/v1/auth/me
app.get('/api/v1/auth/me', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return res.status(404).json({
        error: {
          code: 'PROFILE_NOT_FOUND',
          message: 'User profile was not initialized automatically'
        }
      });
    }

    res.json({ data: profile });
  } catch (err) {
    next(err);
  }
});

// 4. PUT /api/v1/auth/profile
app.put('/api/v1/auth/profile', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { fullName, targetTitle, experienceLevel } = req.body;

    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        onboarded_target_title: targetTitle,
        experience_level: experienceLevel,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        error: {
          code: 'PROFILE_UPDATE_FAILED',
          message: error.message
        }
      });
    }

    res.json({ data });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// DATABASE RELATIONAL MAPPERS
// ==========================================

async function fetchFullResume(resumeId: string, userId: string): Promise<Resume | null> {
  // 1. Fetch main resume row
  const { data: resumeRow, error: resErr } = await supabase
    .from('resumes')
    .select('*')
    .eq('id', resumeId)
    .eq('user_id', userId)
    .single();

  if (resErr || !resumeRow) return null;

  // 2. Fetch profile details
  const { data: profileRow } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  // 3. Fetch experience rows
  const { data: expRows } = await supabase
    .from('experience')
    .select('*')
    .eq('resume_id', resumeId)
    .order('created_at', { ascending: true });

  // 4. Fetch education rows
  const { data: eduRows } = await supabase
    .from('education')
    .select('*')
    .eq('resume_id', resumeId)
    .order('created_at', { ascending: true });

  // 5. Fetch project rows
  const { data: projRows } = await supabase
    .from('projects')
    .select('*')
    .eq('resume_id', resumeId)
    .order('created_at', { ascending: true });

  // 6. Fetch skills
  const { data: skillRows } = await supabase
    .from('skills')
    .select('skill_name')
    .eq('resume_id', resumeId);

  const personalInfo = {
    fullName: profileRow?.full_name || '',
    email: profileRow?.email || '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    github: ''
  };

  return {
    id: resumeRow.id,
    title: resumeRow.title,
    lastEdited: resumeRow.updated_at,
    atsScore: resumeRow.ats_score,
    summary: resumeRow.summary || '',
    personalInfo,
    experience: (expRows || []).map(row => ({
      id: row.id,
      company: row.company,
      position: row.position,
      location: row.location || '',
      startDate: row.start_date || '',
      endDate: row.end_date || '',
      current: row.current || false,
      bullets: row.bullets || []
    })),
    education: (eduRows || []).map(row => ({
      id: row.id,
      institution: row.institution,
      degree: row.degree,
      fieldOfStudy: row.field_of_study || '',
      location: row.location || '',
      startDate: row.start_date || '',
      endDate: row.end_date || '',
      current: row.current || false,
      gpa: row.gpa || ''
    })),
    projects: (projRows || []).map(row => ({
      id: row.id,
      name: row.name,
      role: row.role || '',
      url: row.url || '',
      startDate: row.start_date || '',
      endDate: row.end_date || '',
      bullets: row.bullets || []
    })),
    skills: (skillRows || []).map(row => row.skill_name),
    certifications: resumeRow.certifications || [],
    languages: resumeRow.languages || []
  };
}

async function saveFullResume(resume: Resume, userId: string): Promise<string> {
  const isNew = !resume.id || !resume.id.includes('-'); // check if standard uuid, if not generate one
  const resumeId = isNew ? crypto.randomUUID() : resume.id;

  // 1. Upsert resumes main record
  const { error: resErr } = await supabase
    .from('resumes')
    .upsert({
      id: resumeId,
      user_id: userId,
      title: resume.title || 'Untitled Resume',
      summary: resume.summary || '',
      ats_score: resume.atsScore || 0,
      certifications: resume.certifications || [],
      languages: resume.languages || [],
      updated_at: new Date().toISOString()
    });

  if (resErr) throw resErr;

  // 2. Clear old child elements
  await supabase.from('experience').delete().eq('resume_id', resumeId);
  await supabase.from('education').delete().eq('resume_id', resumeId);
  await supabase.from('projects').delete().eq('resume_id', resumeId);
  await supabase.from('skills').delete().eq('resume_id', resumeId);

  // 3. Re-insert Experiences
  if (resume.experience && resume.experience.length > 0) {
    const experiencesToInsert = resume.experience.map(exp => ({
      resume_id: resumeId,
      company: exp.company,
      position: exp.position,
      location: exp.location || '',
      start_date: exp.startDate || '',
      end_date: exp.endDate || '',
      current: exp.current || false,
      bullets: exp.bullets || []
    }));
    const { error: expErr } = await supabase.from('experience').insert(experiencesToInsert);
    if (expErr) throw expErr;
  }

  // 4. Re-insert Education
  if (resume.education && resume.education.length > 0) {
    const educationToInsert = resume.education.map(edu => ({
      resume_id: resumeId,
      institution: edu.institution,
      degree: edu.degree,
      field_of_study: edu.fieldOfStudy || '',
      location: edu.location || '',
      start_date: edu.startDate || '',
      end_date: edu.endDate || '',
      current: edu.current || false,
      gpa: edu.gpa || ''
    }));
    const { error: eduErr } = await supabase.from('education').insert(educationToInsert);
    if (eduErr) throw eduErr;
  }

  // 5. Re-insert Projects
  if (resume.projects && resume.projects.length > 0) {
    const projectsToInsert = resume.projects.map(proj => ({
      resume_id: resumeId,
      name: proj.name,
      role: proj.role || '',
      url: proj.url || '',
      start_date: proj.startDate || '',
      end_date: proj.endDate || '',
      bullets: proj.bullets || []
    }));
    const { error: projErr } = await supabase.from('projects').insert(projectsToInsert);
    if (projErr) throw projErr;
  }

  // 6. Re-insert Skills
  if (resume.skills && resume.skills.length > 0) {
    const skillsToInsert = resume.skills.map(skill => ({
      resume_id: resumeId,
      skill_name: skill
    }));
    const { error: skillErr } = await supabase.from('skills').insert(skillsToInsert);
    if (skillErr) throw skillErr;
  }

  return resumeId;
}

// ==========================================
// RESUMES CRUD API ENDPOINTS
// ==========================================

// 1. GET /api/v1/resumes (List all resumes)
app.get('/api/v1/resumes', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { data: resumeRows, error } = await supabase
      .from('resumes')
      .select('id')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: { message: error.message } });
    }

    const fullResumes: Resume[] = [];
    for (const row of resumeRows || []) {
      const fullRes = await fetchFullResume(row.id, userId);
      if (fullRes) fullResumes.push(fullRes);
    }

    res.json({ data: fullResumes });
  } catch (err) {
    next(err);
  }
});

// 2. GET /api/v1/resumes/:id (Fetch single resume details)
app.get('/api/v1/resumes/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const resumeId = req.params.id;
    const fullRes = await fetchFullResume(resumeId, userId);

    if (!fullRes) {
      return res.status(404).json({
        error: {
          code: 'RESUME_NOT_FOUND',
          message: 'The requested resume scroll was not found.'
        }
      });
    }

    res.json({ data: fullRes });
  } catch (err) {
    next(err);
  }
});

// 3. POST /api/v1/resumes (Create/save new resume)
app.post('/api/v1/resumes', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { resume } = req.body;

    if (!resume) {
      return res.status(400).json({
        error: {
          code: 'BAD_REQUEST',
          message: 'Resume object is required'
        }
      });
    }

    const savedId = await saveFullResume(resume, userId);
    const savedResume = await fetchFullResume(savedId, userId);

    res.status(201).json({ data: savedResume });
  } catch (err) {
    next(err);
  }
});

// 4. PUT /api/v1/resumes/:id (Update existing resume details)
app.put('/api/v1/resumes/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { resume } = req.body;

    if (!resume) {
      return res.status(400).json({
        error: {
          code: 'BAD_REQUEST',
          message: 'Resume object is required'
        }
      });
    }

    resume.id = req.params.id; // enforce url param id
    const savedId = await saveFullResume(resume, userId);
    const savedResume = await fetchFullResume(savedId, userId);

    res.json({ data: savedResume });
  } catch (err) {
    next(err);
  }
});

// 5. DELETE /api/v1/resumes/:id (Delete resume details)
app.delete('/api/v1/resumes/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const resumeId = req.params.id;

    const { error } = await supabase
      .from('resumes')
      .delete()
      .eq('id', resumeId)
      .eq('user_id', userId);

    if (error) {
      return res.status(400).json({ error: { message: error.message } });
    }

    res.json({ message: 'Resume successfully deleted from database records.' });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// JOB DESCRIPTIONS API
// ==========================================

// GET /api/v1/job-descriptions
app.get('/api/v1/job-descriptions', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { data, error } = await supabase
      .from('job_descriptions')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) return res.status(400).json({ error: { message: error.message } });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/job-descriptions
app.post('/api/v1/job-descriptions', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { title, company, jdText } = req.body;

    const { data, error } = await supabase
      .from('job_descriptions')
      .insert({
        user_id: userId,
        title: title || 'Target Role',
        company: company || '',
        jd_text: jdText
      })
      .select()
      .single();

    if (error) return res.status(400).json({ error: { message: error.message } });
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// CORE RESUME RECONSTRUCTION AND ANALYSIS ENDPOINTS
// ==========================================

// POST /api/v1/analyze
// Performs deterministic scoring and generates recommendations via Gemini API
app.post('/api/v1/analyze', async (req: Request, res: Response, next: NextFunction) => {
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
      // Fallback recommendations if JSON parse fails
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

// POST /api/v1/resumes/upload
// Parses uploaded document, creates a structured Resume, runs ATS scoring & recommendations
app.post('/api/v1/resumes/upload', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
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

// POST /api/v1/compare
// Performs AI-based matching and gap analysis against a job description
app.post('/api/v1/compare', async (req: Request, res: Response, next: NextFunction) => {
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

// POST /api/v1/improve
// Enhances a resume bullet point using Gemini AI
app.post('/api/v1/improve', async (req: Request, res: Response, next: NextFunction) => {
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

// POST /api/v1/generate-summary
// Generates a professional summary from a resume profile using Gemini AI
app.post('/api/v1/generate-summary', async (req: Request, res: Response, next: NextFunction) => {
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

app.use((err: AppError, req: Request, res: Response, next: NextFunction) => {
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
app.get('*', (req: Request, res: Response, next: NextFunction) => {
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
