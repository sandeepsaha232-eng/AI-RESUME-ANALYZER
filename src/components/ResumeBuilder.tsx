import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowUp, ArrowDown, Download, Eye, Layout, Plus, Sparkles, Trash2, Check, X } from 'lucide-react';
import { Resume, Experience, Education, Project, Certification, Language } from '../types';

interface ResumeBuilderProps {
  resume: Resume;
  onSave: (updated: Resume) => void;
  onBack: () => void;
  onNavigateToExport: () => void;
}

export default function ResumeBuilder({ resume, onSave, onBack, onNavigateToExport }: ResumeBuilderProps) {
  const [activeSection, setActiveSection] = useState<'personal' | 'summary' | 'experience' | 'education' | 'projects' | 'skills' | 'certifications' | 'languages'>('personal');
  const [localResume, setLocalResume] = useState<Resume>(JSON.parse(JSON.stringify(resume)));
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'failed'>('saved');
  const [showPreviewMobile, setShowPreviewMobile] = useState(false);

  // AI Assist Panel state
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiAction, setAiAction] = useState<'enhance-bullet' | 'generate-summary' | 'fix-grammar' | null>(null);
  const [aiTargetField, setAiTargetField] = useState<{ section: string; id?: string; index?: number } | null>(null);
  const [aiInputText, setAiInputText] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Autosave simulation on change
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setSaveStatus('saving');
      // Update metadata lastEdited timestamp
      const updated = {
        ...localResume,
        lastEdited: new Date().toISOString()
      };
      
      // Calculate dynamic mock ATS score based on profile completion density
      let rawScore = 30;
      if (updated.personalInfo.fullName) rawScore += 5;
      if (updated.personalInfo.email) rawScore += 5;
      if (updated.summary) rawScore += 10;
      if (updated.experience.length > 0) rawScore += 20;
      if (updated.education.length > 0) rawScore += 15;
      if (updated.projects.length > 0) rawScore += 10;
      if (updated.skills.length > 0) rawScore += 15;
      if (updated.certifications.length > 0) rawScore += 5;
      if (updated.languages.length > 0) rawScore += 5;
      updated.atsScore = Math.min(rawScore, 100);

      onSave(updated);
      setLocalResume(updated);
      
      setTimeout(() => {
        setSaveStatus('saved');
      }, 600);
    }, 1500);

    return () => clearTimeout(delayDebounce);
  }, [localResume.personalInfo, localResume.summary, localResume.experience, localResume.education, localResume.projects, localResume.skills, localResume.certifications, localResume.languages, localResume.title]);

  const updatePersonal = (field: string, val: string) => {
    setLocalResume({
      ...localResume,
      personalInfo: {
        ...localResume.personalInfo,
        [field]: val
      }
    });
  };

  // Section List Reorder helpers
  const moveItem = (section: 'experience' | 'education' | 'projects', index: number, direction: 'up' | 'down') => {
    const list = [...localResume[section]] as any[];
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === list.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    setLocalResume({
      ...localResume,
      [section]: list
    });
  };

  // Experiences helpers
  const addExperience = () => {
    const newExp: Experience = {
      id: `exp-${Date.now()}`,
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      bullets: ['']
    };
    setLocalResume({
      ...localResume,
      experience: [...localResume.experience, newExp]
    });
  };

  const removeExperience = (id: string) => {
    setLocalResume({
      ...localResume,
      experience: localResume.experience.filter((exp) => exp.id !== id)
    });
  };

  const updateExperience = (id: string, field: string, val: any) => {
    setLocalResume({
      ...localResume,
      experience: localResume.experience.map((exp) =>
        exp.id === id ? { ...exp, [field]: val } : exp
      )
    });
  };

  const updateExpBullet = (expId: string, bulletIndex: number, val: string) => {
    setLocalResume({
      ...localResume,
      experience: localResume.experience.map((exp) => {
        if (exp.id !== expId) return exp;
        const copy = [...exp.bullets];
        copy[bulletIndex] = val;
        return { ...exp, bullets: copy };
      })
    });
  };

  const addExpBullet = (expId: string) => {
    setLocalResume({
      ...localResume,
      experience: localResume.experience.map((exp) => {
        if (exp.id !== expId) return exp;
        return { ...exp, bullets: [...exp.bullets, ''] };
      })
    });
  };

  const removeExpBullet = (expId: string, bulletIndex: number) => {
    setLocalResume({
      ...localResume,
      experience: localResume.experience.map((exp) => {
        if (exp.id !== expId) return exp;
        return { ...exp, bullets: exp.bullets.filter((_, idx) => idx !== bulletIndex) };
      })
    });
  };

  // Education Helpers
  const addEducation = () => {
    const newEdu: Education = {
      id: `edu-${Date.now()}`,
      institution: '',
      degree: '',
      fieldOfStudy: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      gpa: ''
    };
    setLocalResume({
      ...localResume,
      education: [...localResume.education, newEdu]
    });
  };

  const updateEducationItem = (id: string, field: string, val: any) => {
    setLocalResume({
      ...localResume,
      education: localResume.education.map((edu) =>
        edu.id === id ? { ...edu, [field]: val } : edu
      )
    });
  };

  // Projects Helpers
  const addProject = () => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name: '',
      role: '',
      url: '',
      startDate: '',
      endDate: '',
      bullets: ['']
    };
    setLocalResume({
      ...localResume,
      projects: [...localResume.projects, newProj]
    });
  };

  const updateProjectItem = (id: string, field: string, val: any) => {
    setLocalResume({
      ...localResume,
      projects: localResume.projects.map((p) =>
        p.id === id ? { ...p, [field]: val } : p
      )
    });
  };

  const updateProjBullet = (projId: string, bulletIndex: number, val: string) => {
    setLocalResume({
      ...localResume,
      projects: localResume.projects.map((p) => {
        if (p.id !== projId) return p;
        const copy = [...p.bullets];
        copy[bulletIndex] = val;
        return { ...p, bullets: copy };
      })
    });
  };

  // Skills helpers
  const [skillInput, setSkillInput] = useState('');
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillInput.trim()) return;
    const clean = skillInput.trim();
    if (!localResume.skills.includes(clean)) {
      setLocalResume({
        ...localResume,
        skills: [...localResume.skills, clean]
      });
    }
    setSkillInput('');
  };

  const removeSkill = (skill: string) => {
    setLocalResume({
      ...localResume,
      skills: localResume.skills.filter((s) => s !== skill)
    });
  };

  // Certifications
  const addCertification = () => {
    const newCert: Certification = {
      id: `cert-${Date.now()}`,
      name: '',
      issuer: '',
      date: '',
      url: ''
    };
    setLocalResume({
      ...localResume,
      certifications: [...localResume.certifications, newCert]
    });
  };

  const updateCert = (id: string, field: string, val: string) => {
    setLocalResume({
      ...localResume,
      certifications: localResume.certifications.map((c) =>
        c.id === id ? { ...c, [field]: val } : c
      )
    });
  };

  // Languages
  const addLanguage = () => {
    const newLang: Language = {
      id: `lang-${Date.now()}`,
      name: '',
      proficiency: 'Professional'
    };
    setLocalResume({
      ...localResume,
      languages: [...localResume.languages, newLang]
    });
  };

  const updateLang = (id: string, field: string, val: string) => {
    setLocalResume({
      ...localResume,
      languages: localResume.languages.map((l) =>
        l.id === id ? { ...l, [field]: val } : l
      )
    });
  };

  // AI Actions Real Helpers
  const triggerAiAssist = async (
    action: 'enhance-bullet' | 'generate-summary' | 'fix-grammar',
    text: string,
    target: typeof aiTargetField
  ) => {
    setAiAction(action);
    setAiTargetField(target);
    setAiInputText(text);
    setAiSuggestion('');
    setAiPanelOpen(true);
    setAiLoading(true);

    try {
      let response: Response;
      if (action === 'enhance-bullet' || action === 'fix-grammar') {
        response = await fetch('/api/v1/improve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bullet: text,
            action,
            title: localResume.title,
          }),
        });
      } else {
        response = await fetch('/api/v1/generate-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resume: localResume }),
        });
      }

      const json = await response.json();
      if (!response.ok || json.error) {
        throw new Error(json.error?.message || 'Failed to generate AI suggestion.');
      }

      setAiSuggestion(json.suggestion);
    } catch (err: any) {
      console.error(err);
      setAiSuggestion(`Error: ${err.message || 'Could not reach AI model.'}`);
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplyAiSuggestion = () => {
    if (!aiTargetField || !aiSuggestion) return;

    if (aiTargetField.section === 'summary') {
      setLocalResume({ ...localResume, summary: aiSuggestion });
    } else if (aiTargetField.section === 'experience' && aiTargetField.id && aiTargetField.index !== undefined) {
      updateExpBullet(aiTargetField.id, aiTargetField.index, aiSuggestion);
    } else if (aiTargetField.section === 'projects' && aiTargetField.id && aiTargetField.index !== undefined) {
      updateProjBullet(aiTargetField.id, aiTargetField.index, aiSuggestion);
    }

    setAiPanelOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
      
      {/* Header Toolbar */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-950 border-b border-slate-200/50 dark:border-slate-800/50 px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex flex-col">
            <input
              type="text"
              value={localResume.title}
              onChange={(e) => setLocalResume({ ...localResume, title: e.target.value })}
              className="text-base font-bold bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-600 focus:outline-none py-0.5 tracking-tight"
            />
            <span className="text-xxs font-medium text-slate-400">Workspace Editor</span>
          </div>
        </div>

        {/* Save & Preview Statuses */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-medium">
            {saveStatus === 'saving' && (
              <>
                <div className="w-3.5 h-3.5 border border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                <span>Saving draft...</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500">Autosaved</span>
              </>
            )}
          </div>

          <button
            onClick={() => setShowPreviewMobile(!showPreviewMobile)}
            className="flex sm:hidden p-2.5 bg-slate-100 dark:bg-slate-900 rounded-xl"
          >
            {showPreviewMobile ? <Layout className="w-4.5 h-4.5 text-blue-500" /> : <Eye className="w-4.5 h-4.5" />}
          </button>

          <button
            onClick={onNavigateToExport}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center space-x-1.5 active:scale-98 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex-grow flex items-stretch overflow-hidden relative">
        
        {/* Left Side: Builder Sidebar tabs + inputs */}
        <div className={`w-full ${showPreviewMobile ? 'hidden' : 'flex'} sm:w-1/2 lg:w-5/12 border-r border-slate-200/50 dark:border-slate-800/50 overflow-y-auto flex flex-col bg-white dark:bg-slate-950/40`}>
          
          {/* Section Selector Quick Tabs */}
          <div className="sticky top-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md z-10 border-b border-slate-100 dark:border-slate-900/60 flex space-x-1 overflow-x-auto p-3 shrink-0 scrollbar-none">
            {[
              { id: 'personal', label: 'Contact' },
              { id: 'summary', label: 'Profile' },
              { id: 'experience', label: 'Work' },
              { id: 'education', label: 'Education' },
              { id: 'projects', label: 'Projects' },
              { id: 'skills', label: 'Skills' },
              { id: 'certifications', label: 'Certs' },
              { id: 'languages', label: 'Languages' }
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id as any)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 transition-all ${
                  activeSection === s.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Form Inputs Container */}
          <div className="p-6 flex-grow space-y-6">
            
            {/* 1. Personal Information */}
            {activeSection === 'personal' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold font-sans">Personal Identity</h2>
                  <p className="text-xs text-slate-500 font-light">Input your primary coordinates for job contacts.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xxs font-semibold uppercase tracking-wider text-slate-400">Full Name</label>
                    <input
                      type="text"
                      value={localResume.personalInfo.fullName}
                      onChange={(e) => updatePersonal('fullName', e.target.value)}
                      placeholder="e.g. Sandeep Sharma"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/10 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xxs font-semibold uppercase tracking-wider text-slate-400">Email Address</label>
                    <input
                      type="email"
                      value={localResume.personalInfo.email}
                      onChange={(e) => updatePersonal('email', e.target.value)}
                      placeholder="e.g. sandeep@example.com"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/10 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xxs font-semibold uppercase tracking-wider text-slate-400">Phone Number</label>
                    <input
                      type="text"
                      value={localResume.personalInfo.phone}
                      onChange={(e) => updatePersonal('phone', e.target.value)}
                      placeholder="e.g. +1 (555) 012-3456"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/10 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xxs font-semibold uppercase tracking-wider text-slate-400">Location</label>
                    <input
                      type="text"
                      value={localResume.personalInfo.location}
                      onChange={(e) => updatePersonal('location', e.target.value)}
                      placeholder="e.g. San Francisco, CA"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/10 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xxs font-semibold uppercase tracking-wider text-slate-400">Personal Website</label>
                    <input
                      type="text"
                      value={localResume.personalInfo.website}
                      onChange={(e) => updatePersonal('website', e.target.value)}
                      placeholder="e.g. https://sandeepdev.io"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/10 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xxs font-semibold uppercase tracking-wider text-slate-400">LinkedIn Link</label>
                    <input
                      type="text"
                      value={localResume.personalInfo.linkedin}
                      onChange={(e) => updatePersonal('linkedin', e.target.value)}
                      placeholder="e.g. linkedin.com/in/sandeep"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/10 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. Professional Summary */}
            {activeSection === 'summary' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-lg font-bold font-sans">Executive Summary</h2>
                    <p className="text-xs text-slate-500 font-light">Outline your key accomplishments and pathing focus.</p>
                  </div>
                  
                  <button
                    onClick={() => triggerAiAssist('generate-summary', localResume.summary, { section: 'summary' })}
                    className="flex items-center space-x-1 px-2.5 py-1.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 text-xxs font-bold rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate AI Profile</span>
                  </button>
                </div>

                <div className="space-y-1">
                  <textarea
                    rows={6}
                    value={localResume.summary}
                    onChange={(e) => setLocalResume({ ...localResume, summary: e.target.value })}
                    placeholder="Describe your career goals, competencies, achievements..."
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/10 focus:outline-none leading-relaxed"
                  />
                  <div className="flex items-center justify-between text-xxs text-slate-400">
                    <span>Target characters: 300 - 500</span>
                    <span>{localResume.summary.length} characters</span>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Experiences List */}
            {activeSection === 'experience' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-lg font-bold font-sans">Work Experience</h2>
                    <p className="text-xs text-slate-500 font-light">Add and structure previous work placements.</p>
                  </div>
                  
                  <button
                    onClick={addExperience}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Role</span>
                  </button>
                </div>

                <div className="space-y-6">
                  {localResume.experience.map((exp, idx) => (
                    <div key={exp.id} className="p-4 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl relative space-y-4">
                      
                      {/* Controls bar */}
                      <div className="absolute top-4 right-4 flex items-center space-x-1">
                        <button
                          onClick={() => moveItem('experience', idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 hover:bg-white dark:hover:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 rounded text-slate-400 disabled:opacity-30"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveItem('experience', idx, 'down')}
                          disabled={idx === localResume.experience.length - 1}
                          className="p-1 hover:bg-white dark:hover:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 rounded text-slate-400 disabled:opacity-30"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removeExperience(exp.id)}
                          className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/10 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-[85%]">
                        <div className="space-y-1">
                          <label className="text-xxs font-semibold uppercase text-slate-400">Job Title</label>
                          <input
                            type="text"
                            value={exp.position}
                            onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                            placeholder="e.g. Senior Backend Engineer"
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xxs font-semibold uppercase text-slate-400">Company Name</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                            placeholder="e.g. CloudScale"
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xxs font-semibold uppercase text-slate-400">Timeline / Start</label>
                          <input
                            type="text"
                            value={exp.startDate}
                            onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                            placeholder="YYYY-MM (e.g. 2023-01)"
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xxs font-semibold uppercase text-slate-400">Timeline / End</label>
                          <input
                            type="text"
                            disabled={exp.current}
                            value={exp.current ? '' : exp.endDate}
                            onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                            placeholder="YYYY-MM or Present"
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs disabled:opacity-40"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`curr-${exp.id}`}
                          checked={exp.current}
                          onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor={`curr-${exp.id}`} className="text-xs font-semibold text-slate-500 select-none">
                          I currently work in this role
                        </label>
                      </div>

                      {/* Bullets Subforms */}
                      <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-900">
                        <div className="flex items-center justify-between">
                          <span className="text-xxs font-bold uppercase text-slate-400">Bullet points achievements</span>
                          <button
                            type="button"
                            onClick={() => addExpBullet(exp.id)}
                            className="text-xxs font-bold text-blue-600 hover:text-blue-50"
                          >
                            + Add Bullet
                          </button>
                        </div>

                        {exp.bullets.map((bullet, bIdx) => (
                          <div key={bIdx} className="flex gap-2 items-start group/bullet">
                            <textarea
                              rows={2}
                              value={bullet}
                              onChange={(e) => updateExpBullet(exp.id, bIdx, e.target.value)}
                              placeholder="Describe structural output using strong action verbs (e.g. Orchestrated scaling pipeline...)"
                              className="flex-grow p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
                            />
                            
                            <div className="flex flex-col space-y-1 shrink-0 opacity-0 group-hover/bullet:opacity-100 focus-within:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => triggerAiAssist('enhance-bullet', bullet, { section: 'experience', id: exp.id, index: bIdx })}
                                title="Enhance bullet with AI"
                                className="p-1 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeExpBullet(exp.id, bIdx)}
                                className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/10 rounded"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Education List */}
            {activeSection === 'education' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-lg font-bold font-sans">Educational History</h2>
                    <p className="text-xs text-slate-500 font-light">Structure your degrees and academic qualifications.</p>
                  </div>
                  
                  <button
                    onClick={addEducation}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Degree</span>
                  </button>
                </div>

                <div className="space-y-6">
                  {localResume.education.map((edu, idx) => (
                    <div key={edu.id} className="p-4 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl relative space-y-4">
                      
                      {/* Reorder/Delete */}
                      <div className="absolute top-4 right-4 flex items-center space-x-1">
                        <button
                          onClick={() => moveItem('education', idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 hover:bg-white dark:hover:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 rounded text-slate-400 disabled:opacity-30"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveItem('education', idx, 'down')}
                          disabled={idx === localResume.education.length - 1}
                          className="p-1 hover:bg-white dark:hover:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 rounded text-slate-400 disabled:opacity-30"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setLocalResume({ ...localResume, education: localResume.education.filter(e => e.id !== edu.id) })}
                          className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/10 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-[85%]">
                        <div className="space-y-1">
                          <label className="text-xxs font-semibold uppercase text-slate-400">Institution</label>
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) => updateEducationItem(edu.id, 'institution', e.target.value)}
                            placeholder="e.g. UC Berkeley"
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xxs font-semibold uppercase text-slate-400">Degree</label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => updateEducationItem(edu.id, 'degree', e.target.value)}
                            placeholder="e.g. Bachelor of Science"
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xxs font-semibold uppercase text-slate-400">Field of Study</label>
                          <input
                            type="text"
                            value={edu.fieldOfStudy}
                            onChange={(e) => updateEducationItem(edu.id, 'fieldOfStudy', e.target.value)}
                            placeholder="e.g. Computer Science"
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xxs font-semibold uppercase text-slate-400">GPA Score</label>
                          <input
                            type="text"
                            value={edu.gpa}
                            onChange={(e) => updateEducationItem(edu.id, 'gpa', e.target.value)}
                            placeholder="e.g. 3.85 / 4.0"
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xxs font-semibold uppercase text-slate-400">Start Date</label>
                          <input
                            type="text"
                            value={edu.startDate}
                            onChange={(e) => updateEducationItem(edu.id, 'startDate', e.target.value)}
                            placeholder="YYYY-MM (e.g. 2016-09)"
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xxs font-semibold uppercase text-slate-400">End Date</label>
                          <input
                            type="text"
                            value={edu.endDate}
                            onChange={(e) => updateEducationItem(edu.id, 'endDate', e.target.value)}
                            placeholder="YYYY-MM or Present"
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Projects list */}
            {activeSection === 'projects' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-lg font-bold font-sans">Projects Portfolio</h2>
                    <p className="text-xs text-slate-500 font-light">Showcase open-source or commercial developments.</p>
                  </div>
                  
                  <button
                    onClick={addProject}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Project</span>
                  </button>
                </div>

                <div className="space-y-6">
                  {localResume.projects.map((p, idx) => (
                    <div key={p.id} className="p-4 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl relative space-y-4">
                      
                      <div className="absolute top-4 right-4 flex items-center space-x-1">
                        <button
                          onClick={() => moveItem('projects', idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 hover:bg-white dark:hover:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 rounded text-slate-400 disabled:opacity-30"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveItem('projects', idx, 'down')}
                          disabled={idx === localResume.projects.length - 1}
                          className="p-1 hover:bg-white dark:hover:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 rounded text-slate-400 disabled:opacity-30"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setLocalResume({ ...localResume, projects: localResume.projects.filter(proj => proj.id !== p.id) })}
                          className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/10 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-[85%]">
                        <div className="space-y-1">
                          <label className="text-xxs font-semibold uppercase text-slate-400">Project Name</label>
                          <input
                            type="text"
                            value={p.name}
                            onChange={(e) => updateProjectItem(p.id, 'name', e.target.value)}
                            placeholder="e.g. SyncFlow Board"
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xxs font-semibold uppercase text-slate-400">Your Role</label>
                          <input
                            type="text"
                            value={p.role}
                            onChange={(e) => updateProjectItem(p.id, 'role', e.target.value)}
                            placeholder="e.g. Lead Frontend"
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xxs font-semibold uppercase text-slate-400">URL Link</label>
                          <input
                            type="text"
                            value={p.url}
                            onChange={(e) => updateProjectItem(p.id, 'url', e.target.value)}
                            placeholder="e.g. https://github.com..."
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="block text-xxs font-bold uppercase text-slate-400">Project Details</span>
                        {p.bullets.map((bullet, bIdx) => (
                          <div key={bIdx} className="flex gap-2">
                            <textarea
                              rows={2}
                              value={bullet}
                              onChange={(e) => updateProjBullet(p.id, bIdx, e.target.value)}
                              className="flex-grow p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => triggerAiAssist('enhance-bullet', bullet, { section: 'projects', id: p.id, index: bIdx })}
                              className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Skills Tags */}
            {activeSection === 'skills' && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold font-sans">Core Skills & Tech</h2>
                  <p className="text-xs text-slate-500 font-light">Compile individual tagging values representing your stack.</p>
                </div>

                <form onSubmit={handleAddSkill} className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Type skill and click Add (e.g. React)"
                    className="flex-grow px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/10 focus:outline-none"
                  />
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">
                    Add
                  </button>
                </form>

                <div className="flex flex-wrap gap-1.5 p-4 bg-slate-50/50 dark:bg-slate-900/10 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl">
                  {localResume.skills.length === 0 && (
                    <span className="text-xs text-slate-400">No skills added yet. Complete the form to build tags.</span>
                  )}
                  {localResume.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100/40 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="font-bold hover:text-blue-800 dark:hover:text-blue-200"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 7. Certifications */}
            {activeSection === 'certifications' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-lg font-bold font-sans">Certifications</h2>
                    <p className="text-xs text-slate-500 font-light">Add licensing and vendor certifications.</p>
                  </div>
                  
                  <button
                    onClick={addCertification}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Cert</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {localResume.certifications.map((c) => (
                    <div key={c.id} className="p-4 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl relative space-y-3">
                      <button
                        onClick={() => setLocalResume({ ...localResume, certifications: localResume.certifications.filter(cert => cert.id !== c.id) })}
                        className="absolute top-4 right-4 text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-[85%]">
                        <div className="space-y-1">
                          <label className="text-xxs font-semibold uppercase text-slate-400">Certificate Name</label>
                          <input
                            type="text"
                            value={c.name}
                            onChange={(e) => updateCert(c.id, 'name', e.target.value)}
                            placeholder="e.g. AWS Solutions Architect"
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xxs font-semibold uppercase text-slate-400">Issuer</label>
                          <input
                            type="text"
                            value={c.issuer}
                            onChange={(e) => updateCert(c.id, 'issuer', e.target.value)}
                            placeholder="e.g. Amazon Web Services"
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xxs font-semibold uppercase text-slate-400">Date Issued</label>
                          <input
                            type="text"
                            value={c.date}
                            onChange={(e) => updateCert(c.id, 'date', e.target.value)}
                            placeholder="e.g. 2024-03"
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 8. Languages */}
            {activeSection === 'languages' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-lg font-bold font-sans">Languages spoken</h2>
                    <p className="text-xs text-slate-500 font-light">Detail linguistic competencies and proficiencies.</p>
                  </div>
                  
                  <button
                    onClick={addLanguage}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Language</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {localResume.languages.map((l) => (
                    <div key={l.id} className="p-4 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl relative flex items-center justify-between">
                      <button
                        onClick={() => setLocalResume({ ...localResume, languages: localResume.languages.filter(lang => lang.id !== l.id) })}
                        className="absolute top-4 right-4 text-slate-400 hover:text-red-500 sm:relative sm:top-0 sm:right-0 sm:order-last"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="grid grid-cols-2 gap-3 max-w-[85%] items-center">
                        <div className="space-y-1">
                          <label className="text-xxs font-semibold uppercase text-slate-400">Language</label>
                          <input
                            type="text"
                            value={l.name}
                            onChange={(e) => updateLang(l.id, 'name', e.target.value)}
                            placeholder="e.g. English"
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xxs font-semibold uppercase text-slate-400">Proficiency</label>
                          <select
                            value={l.proficiency}
                            onChange={(e) => updateLang(l.id, 'proficiency', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                          >
                            <option value="Native">Native</option>
                            <option value="Full Professional">Full Professional</option>
                            <option value="Professional Working">Professional Working</option>
                            <option value="Limited Working">Limited Working</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right Side: High Fidelity Print Preview rendering */}
        <div className={`w-full ${showPreviewMobile ? 'flex' : 'hidden'} sm:flex sm:w-1/2 lg:w-7/12 overflow-y-auto bg-slate-100 dark:bg-slate-900/40 p-6 items-start justify-center`}>
          <div className="bg-white text-slate-950 p-12 rounded-lg border border-slate-200 shadow-lg w-full max-w-[800px] min-h-[1050px] font-sans text-xs flex flex-col justify-between">
            
            {/* Header Identity Block */}
            <div className="space-y-4">
              <div className="text-center space-y-2 border-b border-slate-300 pb-5">
                <h1 className="text-3xl font-bold tracking-tight uppercase text-slate-900">
                  {localResume.personalInfo.fullName || 'Candidate Name'}
                </h1>
                
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-slate-600 font-light font-sans">
                  {localResume.personalInfo.email && <span>{localResume.personalInfo.email}</span>}
                  {localResume.personalInfo.phone && <span>• {localResume.personalInfo.phone}</span>}
                  {localResume.personalInfo.location && <span>• {localResume.personalInfo.location}</span>}
                  {localResume.personalInfo.website && (
                    <a href={localResume.personalInfo.website} target="_blank" className="hover:underline text-blue-600">
                      • {localResume.personalInfo.website.replace('https://', '')}
                    </a>
                  )}
                </div>
              </div>

              {/* Summary */}
              {localResume.summary && (
                <div className="space-y-1.5">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 border-b border-slate-200 pb-0.5">Professional Summary</h2>
                  <p className="text-slate-700 leading-relaxed font-light text-xxs">{localResume.summary}</p>
                </div>
              )}

              {/* Experiences */}
              {localResume.experience.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 border-b border-slate-200 pb-0.5">Work Experience</h2>
                  <div className="space-y-4">
                    {localResume.experience.map((exp) => (
                      <div key={exp.id} className="space-y-1">
                        <div className="flex justify-between items-baseline font-semibold">
                          <span className="text-slate-900 text-xs">{exp.position || 'Position Name'} • <span className="font-light text-slate-500">{exp.company || 'Company'}</span></span>
                          <span className="text-slate-500 text-xxs font-medium">
                            {exp.startDate || 'YYYY-MM'} – {exp.current ? 'Present' : exp.endDate || 'YYYY-MM'}
                          </span>
                        </div>
                        <ul className="list-disc pl-4 space-y-1 text-slate-700 font-light text-xxs">
                          {exp.bullets.map((b, idx) => b && (
                            <li key={idx}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {localResume.education.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 border-b border-slate-200 pb-0.5">Education</h2>
                  <div className="space-y-3">
                    {localResume.education.map((edu) => (
                      <div key={edu.id} className="space-y-0.5">
                        <div className="flex justify-between items-baseline font-semibold">
                          <span className="text-slate-900 text-xs">{edu.degree || 'Degree'} in {edu.fieldOfStudy || 'Field'}</span>
                          <span className="text-slate-500 text-xxs font-medium">{edu.startDate || 'YYYY-MM'} – {edu.endDate || 'YYYY-MM'}</span>
                        </div>
                        <div className="flex justify-between text-xxs font-light text-slate-600">
                          <span>{edu.institution || 'University Name'}</span>
                          {edu.gpa && <span>GPA: {edu.gpa}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {localResume.projects.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 border-b border-slate-200 pb-0.5">Key Projects</h2>
                  <div className="space-y-3">
                    {localResume.projects.map((p) => (
                      <div key={p.id} className="space-y-1">
                        <div className="flex justify-between items-baseline font-semibold">
                          <span className="text-slate-900 text-xs">{p.name || 'Project Name'} <span className="font-light text-slate-500">| {p.role || 'Role'}</span></span>
                          {p.url && <span className="text-xxs font-medium text-blue-600">{p.url.replace('https://', '')}</span>}
                        </div>
                        <ul className="list-disc pl-4 space-y-0.5 text-slate-700 font-light text-xxs">
                          {p.bullets.map((b, idx) => b && (
                            <li key={idx}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Grid: Skills & Other attributes */}
              <div className="grid grid-cols-2 gap-6 border-t border-slate-200 pt-4">
                {localResume.skills.length > 0 && (
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700">Competencies</h3>
                    <div className="flex flex-wrap gap-1">
                      {localResume.skills.map((s) => (
                        <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-medium text-xxs">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications and languages together */}
                <div className="space-y-3">
                  {localResume.certifications.length > 0 && (
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700">Certifications</h3>
                      <ul className="list-disc pl-4 text-slate-700 text-xxs font-light">
                        {localResume.certifications.map((c) => (
                          <li key={c.id}>
                            <strong>{c.name}</strong> {c.issuer && `(${c.issuer})`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {localResume.languages.length > 0 && (
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700">Linguistic Profile</h3>
                      <div className="flex flex-wrap gap-x-3 text-slate-700 text-xxs font-light">
                        {localResume.languages.map((l) => (
                          <span key={l.id}>{l.name} ({l.proficiency})</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Footer stamp (print safe) */}
            <div className="text-center text-slate-400 font-sans tracking-wide text-xxxxs uppercase border-t border-slate-100 pt-4">
              Generated securely via Elevate Resume. All data privately compiled.
            </div>

          </div>
        </div>

      </div>

      {/* AI Assist Sliding Drawer panel */}
      {aiPanelOpen && (
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-end">
          <div className="w-full max-w-md bg-white dark:bg-slate-950 h-full shadow-2xl border-l border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
                <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">AI Assistant</span>
              </div>
              <button
                onClick={() => setAiPanelOpen(false)}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content body */}
            <div className="p-6 flex-grow space-y-6 overflow-y-auto">
              <div className="space-y-2">
                <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xxs font-bold uppercase rounded-md border border-blue-100/40">
                  {aiAction === 'enhance-bullet' ? 'Bullet Enhancer' : aiAction === 'generate-summary' ? 'Summary Generator' : 'Grammar Corrector'}
                </span>
                <p className="text-xs text-slate-500 font-sans font-light leading-normal">
                  Our model converts loose drafts into achievements containing strong metrics and verbs.
                </p>
              </div>

              {aiInputText && (
                <div className="space-y-1.5">
                  <span className="block text-xxs font-bold uppercase tracking-wider text-slate-400">Original text</span>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/40 dark:border-slate-800/40 text-xs text-slate-600 dark:text-slate-400 leading-normal italic font-light">
                    "{aiInputText}"
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <span className="block text-xxs font-bold uppercase tracking-wider text-slate-400">Model Output Suggestion</span>
                <div className="p-4 bg-blue-50/20 dark:bg-blue-950/25 border border-blue-200/40 dark:border-blue-900/40 rounded-xl relative min-h-[100px] flex items-center justify-center">
                  {aiLoading ? (
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                      <span className="text-xxs font-semibold text-slate-400">Processing draft...</span>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                      {aiSuggestion || 'No suggestion compiled.'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-2.5 bg-slate-50 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setAiPanelOpen(false)}
                className="px-4 py-2 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500"
              >
                Reject
              </button>
              <button
                type="button"
                disabled={aiLoading || !aiSuggestion || aiSuggestion.startsWith('Error:')}
                onClick={handleApplyAiSuggestion}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm flex items-center space-x-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply & Insert</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
