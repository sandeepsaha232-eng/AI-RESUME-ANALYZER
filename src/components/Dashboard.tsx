import { useState } from 'react';
import { Award, Copy, Download, Edit2, FileText, Plus, Search, Sparkles, Trash2, Calendar, Target, User } from 'lucide-react';
import { Resume } from '../types';

interface DashboardProps {
  resumes: Resume[];
  userEmail: string;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  onNavigate: (view: string) => void;
}

export default function Dashboard({
  resumes,
  userEmail,
  onEdit,
  onDuplicate,
  onDelete,
  onCreate,
  onNavigate
}: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Time-of-day greeting
  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good Morning';
    if (hrs < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const filteredResumes = resumes.filter((r) =>
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.personalInfo.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats Calculations
  const resumeCount = resumes.length;
  const avgAtsScore = resumeCount
    ? Math.round(resumes.reduce((acc, curr) => acc + (curr.atsScore || 0), 0) / resumeCount)
    : 0;

  const lastEditedResume = resumes.reduce((latest, current) => {
    if (!latest) return current;
    return new Date(current.lastEdited) > new Date(latest.lastEdited) ? current : latest;
  }, null as Resume | null);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/40';
    if (score >= 50) return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/40';
    return 'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900/40';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Strong';
    if (score >= 50) return 'Good';
    return 'Needs Work';
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Banner Greetings & Quick Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans text-slate-900 dark:text-white flex items-center space-x-2">
            <span>{getGreeting()}, {userEmail.split('@')[0]}</span>
            <Sparkles className="w-5 h-5 text-blue-500 hidden sm:inline" />
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-sans mt-1">
            Build and optimize your candidate profile to secure your next career milestone.
          </p>
        </div>

        <button
          onClick={onCreate}
          className="w-full sm:w-auto px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm active:scale-98 transition-all flex items-center justify-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Resume</span>
        </button>
      </div>

      {/* Metric Cards Row */}
      {resumeCount > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Total Resumes */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="block text-xxs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Resumes</span>
              <span className="block text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{resumeCount}</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-400">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: Avg ATS Score */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="block text-xxs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Average ATS</span>
              <span className={`block text-2xl sm:text-3xl font-black ${avgAtsScore >= 80 ? 'text-emerald-500' : avgAtsScore >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                {avgAtsScore}%
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50/50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600">
              <Award className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: JD Matches */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="block text-xxs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">JD Match Rating</span>
              <span className="block text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Active</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50/50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600">
              <Target className="w-5 h-5" />
            </div>
          </div>

          {/* Card 4: Completeness */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="block text-xxs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Profile Status</span>
              <span className="block text-2xl sm:text-3xl font-black text-emerald-500">Verified</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-500">
              <User className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Continue Last Edited Resume Banner */}
      {lastEditedResume && (
        <div className="relative p-6 bg-blue-50/40 dark:bg-blue-950/15 rounded-xl border border-blue-100 dark:border-blue-900/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-600 rounded-lg text-white shadow-sm hidden sm:flex">
              <FileText className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <span className="block text-xxs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Quick Resume Launchpad</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{lastEditedResume.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span>Last updated {new Date(lastEditedResume.lastEdited).toLocaleDateString()}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => onEdit(lastEditedResume.id)}
            className="w-full md:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm active:scale-98 transition-all flex items-center justify-center space-x-1.5"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Continue Editing</span>
          </button>
        </div>
      )}

      {/* Main Resumes Workspace Grid */}
      {resumeCount === 0 ? (
        /* Empty State */
        <div className="py-16 px-6 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-xl mx-auto space-y-5">
          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-950 rounded-lg flex items-center justify-center text-slate-400 mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 font-sans">No Resumes Registered</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-normal max-w-sm mx-auto font-sans">
              You haven't crafted any resumes yet. Start fresh using our step-by-step assistant or import sample layouts.
            </p>
          </div>
          <button
            onClick={onCreate}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm active:scale-98 transition-all inline-flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Build First Resume</span>
          </button>
        </div>
      ) : (
        /* Populated State */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-sans">Your Resumes ({resumeCount})</h2>
            
            {/* Search inputs */}
            <div className="relative flex-grow sm:flex-grow-0 sm:min-w-[320px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search resumes..."
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResumes.map((resume) => (
              <div
                key={resume.id}
                className="group relative p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 max-w-[70%]">
                      <h3 className="font-bold text-base text-slate-900 dark:text-slate-50 tracking-tight leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {resume.title}
                      </h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-sans">
                        Candidate: {resume.personalInfo.fullName || 'Anonymous'}
                      </p>
                    </div>

                    {/* ATS Score Badge */}
                    {resume.atsScore !== undefined && (
                      <span className={`px-2.5 py-1 text-xs font-bold rounded border shrink-0 flex items-center space-x-1 ${getScoreColor(resume.atsScore)}`}>
                        <span>{resume.atsScore}</span>
                        <span className="text-xxs font-medium opacity-85">ATS</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 font-sans">
                    {resume.summary || 'No summary or description profile supplied yet. Start editing to outline key career competencies.'}
                  </p>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-850/50 pt-4 mt-5 flex items-center justify-between">
                  <span className="text-xxs font-medium text-slate-400">
                    Edited {new Date(resume.lastEdited).toLocaleDateString()}
                  </span>

                  <div className="flex items-center space-x-1">
                    {/* Primary actions */}
                    <button
                      onClick={() => onEdit(resume.id)}
                      title="Edit Resume"
                      className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDuplicate(resume.id)}
                      title="Duplicate Template"
                      className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-lg transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onNavigate(`export-${resume.id}`)}
                      title="Export Options"
                      className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    {/* Delete handler */}
                    {deleteConfirmId === resume.id ? (
                      <div className="flex items-center space-x-1.5 shrink-0 bg-red-50 dark:bg-red-950/20 px-2 py-1 rounded-lg border border-red-100 dark:border-red-900/35">
                        <button
                          onClick={() => {
                            onDelete(resume.id);
                            setDeleteConfirmId(null);
                          }}
                          className="text-xxs font-extrabold text-red-600 dark:text-red-400 uppercase tracking-wider"
                        >
                          Confirm
                        </button>
                        <span className="text-red-300">|</span>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="text-xxs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(resume.id)}
                        title="Delete Resume"
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredResumes.length === 0 && (
            <div className="py-12 text-center bg-slate-50/30 dark:bg-slate-950/20 rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
              <span className="text-sm text-slate-500">No resumes match "{searchTerm}"</span>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
