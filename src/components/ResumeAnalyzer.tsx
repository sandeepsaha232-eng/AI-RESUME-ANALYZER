import React, { useState } from 'react';
import { AlertCircle, ArrowRight, Award, CheckCircle, FileText, UploadCloud, Zap, Sparkles } from 'lucide-react';
import { Resume, AnalyzerResult } from '../types';

interface ResumeAnalyzerProps {
  resumes: Resume[];
  onSelectResumeToEdit: (id: string) => void;
}

export default function ResumeAnalyzer({ resumes, onSelectResumeToEdit }: ResumeAnalyzerProps) {
  const [selectedResumeId, setSelectedResumeId] = useState<string>(resumes[0]?.id || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzerResult | null>(null);
  
  // Local File uploading mocks
  const [uploadError, setUploadError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setUploadError('');

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  const processUploadedFile = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension !== 'pdf' && extension !== 'docx') {
      setUploadError('Invalid format. Only PDF and DOCX files are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size limits exceeded. Max allowed size is 5MB.');
      return;
    }

    // Trigger parsing simulation
    setIsAnalyzing(true);
    setAnalysisResult(null);

    setTimeout(() => {
      setIsAnalyzing(false);
      // Compile highly realistic mock analysis parameters
      setAnalysisResult({
        atsScore: 78,
        categoryScores: {
          formatting: 85,
          keywords: 62,
          readability: 74,
          grammar: 90,
          completeness: 80
        },
        missingSections: ['Certifications'],
        recommendations: [
          {
            id: 'rec-1',
            category: 'keywords',
            text: 'Integrate more cloud infrastructure metrics (e.g. AWS, GCP) in your Senior role bullet points.',
            severity: 'high',
            section: 'experience'
          },
          {
            id: 'rec-2',
            category: 'readability',
            text: 'Shorten experiences bullet points containing more than 3 lines of narrative. Focus on brief action outputs.',
            severity: 'medium',
            section: 'experience'
          },
          {
            id: 'rec-3',
            category: 'completeness',
            text: 'Add a professional certification to authorize your credentials.',
            severity: 'low',
            section: 'certifications'
          }
        ]
      });
    }, 2000);
  };

  const handleAnalyzeSelectedResume = () => {
    if (!selectedResumeId) return;
    const res = resumes.find((r) => r.id === selectedResumeId);
    if (!res) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);

    setTimeout(() => {
      setIsAnalyzing(false);
      
      // Calculate dynamic score depending on resume fields
      const bulletCount = res.experience.reduce((acc, curr) => acc + curr.bullets.length, 0);
      const formatting = res.experience.length > 0 && res.education.length > 0 ? 88 : 45;
      const keywords = res.skills.length >= 8 ? 84 : res.skills.length >= 4 ? 65 : 40;
      const completeness = res.summary && res.experience.length && res.skills.length ? 90 : 60;
      const ats = Math.round((formatting + keywords + completeness + 85) / 4);

      setAnalysisResult({
        atsScore: ats,
        categoryScores: {
          formatting,
          keywords,
          readability: bulletCount >= 4 ? 78 : 55,
          grammar: 92,
          completeness
        },
        missingSections: res.certifications.length === 0 ? ['Certifications'] : [],
        recommendations: [
          {
            id: 'rec-r1',
            category: 'keywords',
            text: `Tailor skills tags denser. Your current list contains ${res.skills.length} parameters; target at least 10 key technical skills.`,
            severity: res.skills.length < 8 ? 'high' : 'medium',
            section: 'skills'
          },
          {
            id: 'rec-r2',
            category: 'completeness',
            text: res.summary ? 'Refine executive summary metrics with concrete career milestones.' : 'Complete an executive summary to outline leadership coordinates.',
            severity: 'medium',
            section: 'summary'
          }
        ]
      });
    }, 1800);
  };

  // Score visual utilities
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'stroke-emerald-500 text-emerald-500';
    if (score >= 50) return 'stroke-amber-500 text-amber-500';
    return 'stroke-red-500 text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-100';
    if (score >= 50) return 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-100';
    return 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 45) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans flex items-center space-x-2.5">
          <span>ATS Resume Analyzer</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-sans font-light mt-1">
          Upload an existing document or audit one of your pre-configured templates against parsing rules.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Control Column */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Picker Panel */}
          {resumes.length > 0 && (
            <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-4">
              <span className="block text-xxs font-bold text-slate-400 uppercase tracking-wider">Audit Local Resumes</span>
              
              <div className="flex gap-2">
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="flex-grow px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/10 focus:outline-none"
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title} ({r.personalInfo.fullName})
                    </option>
                  ))}
                </select>
                
                <button
                  onClick={handleAnalyzeSelectedResume}
                  disabled={isAnalyzing || !selectedResumeId}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm disabled:opacity-40"
                >
                  Audit
                </button>
              </div>
            </div>
          )}

          {/* Upload Dropzone */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-4">
            <span className="block text-xxs font-bold text-slate-400 uppercase tracking-wider">Upload New Document</span>

            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`p-8 border-2 border-dashed rounded-xl text-center transition-all ${
                dragActive
                  ? 'border-blue-500 bg-blue-50/5 dark:bg-blue-950/10'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Drag & drop your resume file</p>
              <p className="text-xxs text-slate-400 mt-1">PDF, DOCX formats (Max 5MB)</p>
              
              <div className="relative mt-4">
                <input
                  type="file"
                  id="dropzone-file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="dropzone-file"
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xxs font-semibold rounded-lg cursor-pointer inline-block"
                >
                  Browse Files
                </label>
              </div>
            </div>

            {uploadError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-600 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}
          </div>

        </div>

        {/* Right Output Column */}
        <div className="lg:col-span-7">
          {isAnalyzing && (
            /* Skeleton Loading states */
            <div className="p-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-6">
              <div className="flex flex-col items-center space-y-4 py-8">
                <div className="w-12 h-12 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                <div className="text-center space-y-1">
                  <h3 className="font-bold text-sm">Evaluating parser compliance...</h3>
                  <p className="text-xxs text-slate-400 font-light">Auditing keyword density indexes and formatting grids.</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/3 animate-pulse" />
                <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded w-full animate-pulse" />
                <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded w-full animate-pulse" />
              </div>
            </div>
          )}

          {!isAnalyzing && !analysisResult && (
            /* Empty state */
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-4">
              <div className="w-14 h-14 bg-slate-50 dark:bg-slate-950 rounded-xl flex items-center justify-center text-slate-400 mx-auto">
                <FileText className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Audit Results Sandbox</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal max-w-sm mx-auto font-light">
                  Select an active resume or upload a document to compile ATS density evaluations.
                </p>
              </div>
            </div>
          )}

          {!isAnalyzing && analysisResult && (
            /* Analysis Results output */
            <div className="space-y-6 animate-fade-in">
              <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                
                {/* SVG Radial Gauge */}
                <div className="md:col-span-5 flex flex-col items-center">
                  <div className="relative w-36 h-36">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      {/* Grey bg ring */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="rgba(0,0,0,0.05)"
                        className="dark:stroke-white/5"
                        strokeWidth="8"
                      />
                      {/* Colored active arc */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 40}
                        strokeDashoffset={2 * Math.PI * 40 * (1 - analysisResult.atsScore / 100)}
                        className={`transition-all duration-1000 ${getScoreColor(analysisResult.atsScore)}`}
                        strokeWidth="8"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{analysisResult.atsScore}</span>
                      <span className="text-xxs font-semibold uppercase text-slate-400">ATS Rating</span>
                    </div>
                  </div>

                  <span className={`px-3 py-1 text-xs font-bold rounded-full border mt-4 ${getScoreBg(analysisResult.atsScore)}`}>
                    Score: {getScoreLabel(analysisResult.atsScore)}
                  </span>
                </div>

                {/* Sub-categories progression */}
                <div className="md:col-span-7 space-y-4">
                  <span className="block text-xxs font-bold text-slate-400 uppercase tracking-wider">Metrics Breakdown</span>
                  
                  {[
                    { label: 'Formatting Density', val: analysisResult.categoryScores.formatting },
                    { label: 'Keyword Optimization', val: analysisResult.categoryScores.keywords },
                    { label: 'Readability Index', val: analysisResult.categoryScores.readability },
                    { label: 'Grammar Accuracy', val: analysisResult.categoryScores.grammar },
                    { label: 'Structural Completeness', val: analysisResult.categoryScores.completeness }
                  ].map((cat, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-baseline text-xxs font-semibold text-slate-500">
                        <span>{cat.label}</span>
                        <span>{cat.val}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${
                            cat.val >= 80 ? 'bg-emerald-500' : cat.val >= 50 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${cat.val}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

              </div>

              {/* Action items Recommendations */}
              <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-4">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-blue-500" />
                  <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">Ranked Action Recommendations</span>
                </div>

                <div className="space-y-3.5">
                  {analysisResult.recommendations.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-850 rounded-2xl flex items-start justify-between gap-4 group hover:border-slate-300 transition-colors"
                    >
                      <div className="space-y-1 max-w-[80%]">
                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            rec.severity === 'high'
                              ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                              : rec.severity === 'medium'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                          }`}>
                            {rec.severity} Priority
                          </span>
                          <span className="text-xxs font-medium text-slate-400 uppercase">Category: {rec.category}</span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-normal font-sans font-light">
                          {rec.text}
                        </p>
                      </div>

                      {/* Deep-link action to Builder if available */}
                      {resumes.find(r => r.id === selectedResumeId) && (
                        <button
                          onClick={() => onSelectResumeToEdit(selectedResumeId)}
                          className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors rounded-lg text-xxs font-bold shrink-0 flex items-center space-x-1"
                        >
                          <span>Fix</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
}
