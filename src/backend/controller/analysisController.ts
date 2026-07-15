import { Router, Request, Response, NextFunction } from 'express';
import { calculateAtsScore } from '../../scoringEngine';
import { Resume } from '../../types';
import { hasAiKey, generateContent } from '../util/aiClient';

const router = Router();

// Helper: Clean JSON response from Gemini
function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(json)?/, '').replace(/```$/, '');
  }
  return cleaned.trim();
}

// POST /api/v1/analyze
// Performs deterministic scoring and generates recommendations via Gemini API
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
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

    // B. Call AI to generate recommendations explaining/tailoring to the score
    if (!hasAiKey) {
      analysisResult.recommendations = [
        {
          id: 'rec-1',
          category: 'keywords',
          text: 'No Gemini or Groq API key configured. Please set GEMINI_API_KEY or GROQ_API_KEY to receive real-time personalized recommendations.',
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

    const responseText = await generateContent(prompt, true);

    try {
      const jsonText = cleanJsonResponse(responseText || '{}');
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

export default router;
