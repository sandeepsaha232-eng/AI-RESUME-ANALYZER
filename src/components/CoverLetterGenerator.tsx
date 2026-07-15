import { useState, useEffect } from 'react';
import { FileText, Send, Sparkles, Copy, Download, Trash2, RefreshCw, PenTool, Check } from 'lucide-react';
import { Resume } from '../types';
import { safeFetchJson } from '../utils/apiHelper';

interface CoverLetterGeneratorProps {
  resumes: Resume[];
  token: string | null;
}

export default function CoverLetterGenerator({ resumes, token }: CoverLetterGeneratorProps) {
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [company, setCompany] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [jdText, setJdText] = useState<string>('');

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [fullLetter, setFullLetter] = useState<string>('');
  const [displayedLetter, setDisplayedLetter] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Initialize selected resume
  useEffect(() => {
    if (resumes.length > 0 && !selectedResumeId) {
      setSelectedResumeId(resumes[0].id);
    }
  }, [resumes, selectedResumeId]);

  // Typewriter/Letter Writing Animation
  useEffect(() => {
    if (!fullLetter) {
      setDisplayedLetter('');
      return;
    }

    setDisplayedLetter('');
    let currentIndex = 0;
    const intervalTime = fullLetter.length > 1000 ? 5 : 12; // Adjust typing speed dynamically based on length

    const timer = setInterval(() => {
      if (currentIndex < fullLetter.length) {
        setDisplayedLetter((prev) => prev + fullLetter.charAt(currentIndex));
        currentIndex++;
      } else {
        clearInterval(timer);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [fullLetter]);

  const handleGenerate = async () => {
    const activeResume = resumes.find((r) => r.id === selectedResumeId);
    if (!activeResume) return;

    setIsGenerating(true);
    setFullLetter('');
    setDisplayedLetter('');
    setIsCopied(false);

    try {
      const response = await safeFetchJson('/api/v1/generate-cover-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          resume: activeResume,
          company,
          role,
          jdText,
        }),
      });

      if (response && response.suggestion) {
        setFullLetter(response.suggestion);
      } else {
        throw new Error('No suggestion returned');
      }
    } catch (e) {
      console.error('Failed to generate cover letter:', e);
      // Fallback in case of any backend connection/Gemini error
      const activeRole = role || activeResume.title || 'Professional';
      const fallbackText = `Dear Hiring Manager${company ? ' at ' + company : ''},\n\nI am writing to express my enthusiastic interest in the ${activeRole} position. With a strong background in ${activeResume.skills?.slice(0, 4).join(', ') || 'software engineering'} and a proven track record as a ${activeResume.experience?.[0]?.position || 'professional'}, I am confident in my ability to deliver immediate value to your organization.\n\nThroughout my career, I have consistently demonstrated a commitment to high-quality standards and results-driven project execution. I look forward to the possibility of discussing how my skills and experiences align with your team's objectives.\n\nSincerely,\n${activeResume.personalInfo?.fullName || 'Candidate'}`;
      setFullLetter(fallbackText);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fullLetter);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([fullLetter], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${company ? company.replace(/\s+/g, '_') : 'Company'}_Cover_Letter.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Top Banner Greetings & Quick Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans text-slate-900 dark:text-white flex items-center space-x-2">
            <span>AI Cover Letter Writer</span>
            <Sparkles className="w-5 h-5 text-blue-500" />
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-sans mt-1">
            Generate custom cover letters tailored perfectly to target roles with realistic live typewriter drafting.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Control Panel: Form Inputs */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-5">
          <div className="space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Letter Parameters</h3>
            <p className="text-xs text-slate-500">Fill in the role details to customize the AI alignment engine.</p>
          </div>

          {/* Select Resume */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Select Source Resume</label>
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-colors"
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} ({r.personalInfo?.fullName || 'Anonymous'})
                </option>
              ))}
            </select>
          </div>

          {/* Target Company */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Target Company Name</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Google, Stripe, Tesla"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Target Role */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Target Role Title</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Job Description (Optional) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Job Description text (Optional)</label>
            <textarea
              rows={4}
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste target job description to match skills and accomplishments dynamically..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || resumes.length === 0}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm active:scale-98 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:pointer-events-none"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Drafting Letter...</span>
              </>
            ) : (
              <>
                <PenTool className="w-4 h-4" />
                <span>Generate Cover Letter</span>
              </>
            )}
          </button>
        </div>

        {/* Right Preview Panel: Live Typewriter Animation Sheet */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col justify-between min-h-[500px]">

          {/* Header toolbar */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-4">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="w-3 h-3 rounded-full bg-green-400" />
              <span className="text-xs font-bold text-slate-400 pl-2">Live Writer Output</span>
            </div>

            {fullLetter && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopy}
                  className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-lg transition-colors flex items-center space-x-1"
                  title="Copy to Clipboard"
                >
                  {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  <span className="text-xxs font-bold">{isCopied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-lg transition-colors flex items-center space-x-1"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-xxs font-bold">Download</span>
                </button>
              </div>
            )}
          </div>

          {/* Paper Sheet Content area with typewriter animation cursor */}
          <div className="flex-grow py-6 overflow-y-auto max-h-[380px] scrollbar-thin">
            {isGenerating && !displayedLetter ? (
              <div className="h-full flex flex-col items-center justify-center space-y-3 py-20 text-slate-400">
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                <p className="text-xs font-bold animate-pulse uppercase tracking-wider">Casting AI Phrasing spells...</p>
              </div>
            ) : displayedLetter ? (
              <div className="font-serif text-sm leading-relaxed text-slate-800 dark:text-slate-100 whitespace-pre-line px-2">
                {displayedLetter}
                <span className="inline-block w-1.5 h-4 bg-blue-500 ml-0.5 animate-pulse" />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center space-y-3 py-20 text-slate-400 text-center">
                <FileText className="w-12 h-12 stroke-1" />
                <div>
                  <p className="text-sm font-bold">No Cover Letter Generated Yet</p>
                  <p className="text-xs max-w-sm mt-1">Configure parameters on the left and click "Generate" to watch AI craft a personalized letter scroll.</p>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 dark:border-slate-850 pt-4 text-right">
            <span className="text-xxs text-slate-400 dark:text-slate-500">
              *Designed around recruiter templates ensuring high impact delivery.
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}
