import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { GoogleGenAI } from '@google/genai';
import { requireAuth } from '../security/authMiddleware';
import { fetchFullResume, saveFullResume } from '../repository/resumeRepository';
import { calculateAtsScore } from '../../scoringEngine';
import { Resume } from '../../types';
import { supabase } from '../../supabaseClient';

const router = Router();

// Configure Multer for file uploads (in-memory storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Initialize Google Gen AI client
const geminiApiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey: geminiApiKey });

// Helper: Clean JSON response from Gemini
function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(json)?/, '').replace(/```$/, '');
  }
  return cleaned.trim();
}

// Helper: Run generation with robust newer model fallbacks to prevent 404/NOT_FOUND errors
async function generateContentWithFallback(contents: string): Promise<any> {
  const models = ['gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'];
  let lastError: any = null;
  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
      });
      if (response && response.text) {
        return response;
      }
    } catch (e: any) {
      console.warn(`Model ${model} failed, trying next fallback:`, e.message || e);
      lastError = e;
    }
  }
  throw lastError || new Error('All Gemini model fallbacks exhausted.');
}

// 1. GET /api/v1/resumes (List all resumes)
router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
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
router.get('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
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
router.post('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
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
router.put('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
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

    // IDOR Security Check: Ensure authenticated user owns the resume if it already exists
    const { data: existingResume } = await supabase
      .from('resumes')
      .select('user_id')
      .eq('id', req.params.id)
      .single();

    if (existingResume && existingResume.user_id !== userId) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied. You do not own this resume scroll.'
        }
      });
    }

    const savedId = await saveFullResume(resume, userId);
    const savedResume = await fetchFullResume(savedId, userId);

    res.json({ data: savedResume });
  } catch (err) {
    next(err);
  }
});

// 5. DELETE /api/v1/resumes/:id (Delete resume details)
router.delete('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
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

// 6. POST /api/v1/resumes/upload
// Parses uploaded document, creates a structured Resume, runs ATS scoring & recommendations
router.post('/upload', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
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

    try {
      if (mime === 'application/pdf') {
        try {
          const parsedPdf = await pdfParse(req.file.buffer);
          extractedText = parsedPdf.text;
        } catch (pdfErr: any) {
          console.error('pdf-parse failed, attempting fallback parsing:', pdfErr);
          // Fallback basic text decoder to prevent crash on 'bad XRef entry' or encrypted/protected PDFs
          extractedText = req.file.buffer.toString('utf-8').replace(/[\x00-\x08\x0b-\x0c\x0e-\x1f\x7f-\xff]/g, ' ');
        }
      } else if (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || filename.endsWith('.docx')) {
        try {
          const parsedDoc = await mammoth.extractRawText({ buffer: req.file.buffer });
          extractedText = parsedDoc.value;
        } catch (docxErr: any) {
          console.error('mammoth failed, fallback to raw buffer string:', docxErr);
          extractedText = req.file.buffer.toString('utf-8');
        }
      } else {
        extractedText = req.file.buffer.toString('utf-8');
      }
    } catch (extractErr: any) {
      console.error('Universal extractor failed, fallback to string representation:', extractErr);
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

    const parseResponse = await generateContentWithFallback(parsePrompt);

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

    const recResponse = await generateContentWithFallback(recPrompt);

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

export default router;
