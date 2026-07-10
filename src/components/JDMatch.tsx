import { useState } from 'react';
import { AlertCircle, Award, CheckCircle, CircleAlert, Sparkles, Target, Zap } from 'lucide-react';
import { Resume, JDMatchResult } from '../types';

interface JDMatchProps {
  resumes: Resume[];
}

export default function JDMatch({ resumes }: JDMatchProps) {
  const [selectedResumeId, setSelectedResumeId] = useState<string>(resumes[0]?.id || '');
  const [jdText, setJdText] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<JDMatchResult | null>(null);

  const handleMatchComparison = () => {
    if (!selectedResumeId || !jdText.trim()) return;

    setIsMatching(true);
    setMatchResult(null);

    // Simulate Match calculations
    setTimeout(() => {
      setIsMatching(false);

      const resume = resumes.find(r => r.id === selectedResumeId);
      const cleanJd = jdText.toLowerCase();

      // Simple keyword match indexing mock
      const standardKeywords = ['react', 'typescript', 'kubernetes', 'aws', 'docker', 'graphql', 'system design', 'rest api', 'ci/cd', 'leadership'];
      const missing: string[] = [];
      const found: string[] = [];

      standardKeywords.forEach((kw) => {
        if (cleanJd.includes(kw)) {
          // Check if resume contains it
          const inSkills = resume?.skills.some(s => s.toLowerCase() === kw) || false;
          const inSummary = resume?.summary.toLowerCase().includes(kw) || false;
          if (inSkills || inSummary) {
            found.push(kw);
          } else {
            missing.push(kw);
          }
        }
      });

      // Default to some items if JD is short
      if (missing.length === 0 && found.length === 0) {
        missing.push('system design', 'kubernetes', 'graphql');
        found.push('react', 'typescript');
      }

      const matchPercent = Math.round((found.length / (found.length + missing.length)) * 100) || 45;

      setMatchResult({
        matchPercentage: Math.max(matchPercent, 35),
        missingKeywords: missing,
        skillGaps: [
          ...missing.map(m => ({ skill: m, status: 'missing' as const })),
          ...found.map(f => ({ skill: f, status: 'found' as const }))
        ],
        experienceGapNotes: cleanJd.includes('senior') || cleanJd.includes('lead')
          ? 'The job posting calls for leadership coordinates and architectural decision-making. Ensure your experience bullet points lead with high-impact phrasing (e.g. Led, Spearheaded).'
          : 'Your qualifications match the target experience tier. Focus your phrasing on execution reliability.'
      });

    }, 2000);
  };

  const getPercentageColor = (pct: number) => {
    if (pct >= 80) return 'stroke-emerald-500 text-emerald-500';
    if (pct >= 50) return 'stroke-amber-500 text-amber-500';
    return 'stroke-red-500 text-red-500';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans flex items-center space-x-2.5">
          <span>JD Matching Comparison</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-sans font-light mt-1">
          Paste the target job description to evaluate keyword densities, alignment index, and skills gaps.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Inputs Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-5">
            
            <div className="space-y-1.5">
              <label className="block text-xxs font-bold text-slate-400 uppercase tracking-wider">1. Pick Resume</label>
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/10 focus:outline-none"
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline">
                <label className="block text-xxs font-bold text-slate-400 uppercase tracking-wider">2. Job Description Text</label>
                <span className={`text-xxs ${jdText.length > 9000 ? 'text-red-500' : 'text-slate-400'}`}>
                  {jdText.length} / 10,000
                </span>
              </div>
              <textarea
                rows={10}
                maxLength={10000}
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste the raw text of the job description here..."
                className="w-full p-3.5 bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/10 focus:outline-none leading-relaxed"
              />
            </div>

            <button
              onClick={handleMatchComparison}
              disabled={isMatching || !selectedResumeId || !jdText.trim()}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center justify-center space-x-1.5"
            >
              <Target className="w-4 h-4" />
              <span>Analyze Alignment Gaps</span>
            </button>

          </div>
        </div>

        {/* Right Output Panel */}
        <div className="lg:col-span-7">
          {isMatching && (
            <div className="p-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex flex-col items-center justify-center space-y-4 py-12">
              <div className="w-10 h-10 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <div className="text-center space-y-1">
                <h3 className="font-bold text-xs">Cross-referencing core indices...</h3>
                <p className="text-xxs text-slate-400 font-light">Compiling missing competency profiles and structural alignment.</p>
              </div>
            </div>
          )}

          {!isMatching && !matchResult && (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-4">
              <div className="w-14 h-14 bg-slate-50 dark:bg-slate-950 rounded-xl flex items-center justify-center text-slate-400 mx-auto">
                <Target className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Job Fit Alignments</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal max-w-sm mx-auto font-light">
                  Input target role descriptions to calculate match coordinates and isolate skills gaps.
                </p>
              </div>
            </div>
          )}

          {!isMatching && matchResult && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                
                {/* Donut chart for JD Match */}
                <div className="md:col-span-5 flex flex-col items-center">
                  <div className="relative w-36 h-36">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      {/* Inner grey ring */}
                      <circle
                        cx="50"
                        cy="50"
                        r="35"
                        fill="transparent"
                        stroke="rgba(0,0,0,0.05)"
                        className="dark:stroke-white/5"
                        strokeWidth="12"
                      />
                      {/* Color slice */}
                      <circle
                        cx="50"
                        cy="50"
                        r="35"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 35}
                        strokeDashoffset={2 * Math.PI * 35 * (1 - matchResult.matchPercentage / 100)}
                        className={`transition-all duration-1000 ${getPercentageColor(matchResult.matchPercentage)}`}
                        strokeWidth="12"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{matchResult.matchPercentage}%</span>
                      <span className="text-xxs font-semibold uppercase text-slate-400">Match rating</span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-7 space-y-4">
                  <span className="block text-xxs font-bold text-slate-400 uppercase tracking-wider">Isolate Skill Gaps</span>
                  <div className="grid grid-cols-2 gap-2.5">
                    {matchResult.skillGaps.map((sg, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        {sg.status === 'found' ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <CircleAlert className="w-4 h-4 text-amber-500 shrink-0" />
                        )}
                        <span className="text-xs text-slate-700 dark:text-slate-300 capitalize">{sg.skill}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Missing keywords blocks */}
              <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-4">
                <div className="space-y-1">
                  <span className="block text-xxs font-bold text-slate-400 uppercase tracking-wider">Critical Missing Keywords</span>
                  <p className="text-xxs text-slate-500 font-light">Add these parameters directly to your resume sections to increase parsing matches.</p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {matchResult.missingKeywords.length === 0 ? (
                    <span className="text-xs text-slate-400">Perfect keyword alignment detected!</span>
                  ) : (
                    matchResult.missingKeywords.map((kw) => (
                      <span
                        key={kw}
                        className="px-2.5 py-1 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100/40 rounded-lg text-xs font-semibold capitalize"
                      >
                        {kw}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Experience gap text box */}
              {matchResult.experienceGapNotes && (
                <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-3">
                  <div className="flex items-center space-x-2 text-blue-500">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    <span className="font-bold text-xs uppercase tracking-wider">AI Phrasing Guidance</span>
                  </div>
                  <p className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed font-sans font-light">
                    {matchResult.experienceGapNotes}
                  </p>
                </div>
              )}

            </div>
          )}
        </div>

      </div>

    </div>
  );
}
