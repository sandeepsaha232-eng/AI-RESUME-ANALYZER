import { Router, Request, Response, NextFunction } from 'express';
import { GoogleGenAI } from '@google/genai';
import { requireAuth } from '../security/authMiddleware';
import { fetchJobDescriptions, saveJobDescription } from '../repository/jdRepository';
import { Resume, JDMatchResult } from '../../types';

const router = Router();

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

// 1. POST /api/v1/compare (AI-based matching and gap analysis against a job description)
router.post('/compare', async (req: Request, res: Response, next: NextFunction) => {
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

    const response = await generateContentWithFallback(prompt);

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

// 2. POST /api/v1/improve (Enhances a resume bullet point using Gemini AI)
router.post('/improve', async (req: Request, res: Response, next: NextFunction) => {
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

    const response = await generateContentWithFallback(prompt);

    res.json({ suggestion: (response.text || '').trim() });
  } catch (err) {
    next(err);
  }
});

// 3. POST /api/v1/generate-summary (Generates professional summary profile using Gemini AI)
router.post('/generate-summary', async (req: Request, res: Response, next: NextFunction) => {
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

    const response = await generateContentWithFallback(prompt);

    res.json({ suggestion: (response.text || '').trim() });
  } catch (err) {
    next(err);
  }
});

// 4. GET /api/v1/job-descriptions
router.get('/job-descriptions', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const data = await fetchJobDescriptions(userId);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

// 5. POST /api/v1/job-descriptions
router.post('/job-descriptions', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { title, company, jdText } = req.body;
    const data = await saveJobDescription(userId, title, company, jdText);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;
