import { Resume, CategoryScores, AnalyzerResult } from './types';

/**
 * Calculates a fully deterministic ATS score and subcategory scores
 * based on the resume contents. No LLM or external API calls are made.
 */
export function calculateAtsScore(resume: Resume): AnalyzerResult {
  // 1. Formatting score (Max 100)
  let formatting = 60;
  if (resume.experience && resume.experience.length > 0) formatting += 15;
  if (resume.education && resume.education.length > 0) formatting += 15;
  if (resume.skills && resume.skills.length > 0) formatting += 10;

  // Formatting penalty: extremely long bullet points can break parsing
  let formattingPenalty = 0;
  const allBullets = [
    ...(resume.experience || []).flatMap(e => e.bullets || []),
    ...(resume.projects || []).flatMap(p => p.bullets || [])
  ];
  allBullets.forEach(bullet => {
    if (bullet && bullet.length > 250) {
      formattingPenalty += 5;
    }
  });
  formatting = Math.max(40, formatting - Math.min(20, formattingPenalty));

  // 2. Keyword Optimization score (Max 100)
  const skillsCount = resume.skills ? resume.skills.length : 0;
  let keywords = 30;
  if (skillsCount >= 12) {
    keywords = 100;
  } else if (skillsCount >= 8) {
    keywords = 85;
  } else if (skillsCount >= 4) {
    keywords = 70;
  } else if (skillsCount >= 1) {
    keywords = 50;
  }

  // 3. Readability score (Max 100)
  let readability = 0;
  // Summary presence
  if (resume.summary && resume.summary.trim().length > 0) readability += 20;
  // Experience count
  const expCount = resume.experience ? resume.experience.length : 0;
  if (expCount >= 3) {
    readability += 40;
  } else if (expCount >= 1) {
    readability += 25;
  }
  // Bullet counts per experience
  if (expCount > 0) {
    let totalBullets = 0;
    resume.experience.forEach(exp => {
      totalBullets += exp.bullets ? exp.bullets.length : 0;
    });
    const avgBullets = totalBullets / expCount;
    if (avgBullets >= 2 && avgBullets <= 5) {
      readability += 40;
    } else if (avgBullets > 0) {
      readability += 25;
    } else {
      readability += 10;
    }
  } else {
    readability += 10; // Base readability if no experience
  }

  // 4. Grammar score (Max 100)
  // Standard default grammar score
  const grammar = 92;

  // 5. Completeness score (Max 100)
  let completeness = 0;
  const hasContact = resume.personalInfo && resume.personalInfo.fullName && resume.personalInfo.email && resume.personalInfo.phone;
  if (hasContact) completeness += 20;
  if (resume.summary && resume.summary.trim().length > 0) completeness += 20;
  if (resume.experience && resume.experience.length > 0) completeness += 25;
  if (resume.education && resume.education.length > 0) completeness += 15;
  if (resume.projects && resume.projects.length > 0) completeness += 10;
  if (resume.skills && resume.skills.length > 0) completeness += 10;

  // Calculate average ATS Score
  const categoryScores: CategoryScores = {
    formatting,
    keywords,
    readability,
    grammar,
    completeness
  };

  const atsScore = Math.round((formatting + keywords + readability + grammar + completeness) / 5);

  // Identify missing sections
  const missingSections: string[] = [];
  if (!resume.summary) missingSections.push('Summary / Profile');
  if (!resume.experience || resume.experience.length === 0) missingSections.push('Work Experience');
  if (!resume.education || resume.education.length === 0) missingSections.push('Education');
  if (!resume.projects || resume.projects.length === 0) missingSections.push('Projects');
  if (!resume.skills || resume.skills.length === 0) missingSections.push('Skills');
  if (!resume.certifications || resume.certifications.length === 0) missingSections.push('Certifications');
  if (!resume.languages || resume.languages.length === 0) missingSections.push('Languages');

  return {
    atsScore,
    categoryScores,
    missingSections,
    recommendations: [] // Will be populated by AI explanation phase if needed
  };
}
