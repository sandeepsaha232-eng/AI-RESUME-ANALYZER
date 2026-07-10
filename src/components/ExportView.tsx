import { useState } from 'react';
import { ArrowLeft, Download, Info, LayoutGrid, Printer, Sparkles } from 'lucide-react';
import { Resume } from '../types';

interface ExportViewProps {
  resume: Resume;
  onBack: () => void;
}

export default function ExportView({ resume, onBack }: ExportViewProps) {
  const [marginSize, setMarginSize] = useState<'compact' | 'balanced' | 'spacious'>('balanced');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');

  const getMarginClass = () => {
    switch (marginSize) {
      case 'compact':
        return 'p-6 sm:p-8';
      case 'spacious':
        return 'p-16 sm:p-20';
      default:
        return 'p-12 sm:p-14';
    }
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'small':
        return 'text-[10px] leading-relaxed';
      case 'large':
        return 'text-xs leading-loose';
      default:
        return 'text-[11px] leading-relaxed';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 no-print">
      
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-slate-800/50 pb-5">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-colors text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">Print & Export</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">Adjust dimensions and print vector-perfect, searchable PDF documents.</p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="w-full sm:w-auto px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm flex items-center justify-center space-x-2"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save to PDF</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side Controls */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Format Settings */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-5">
            <div className="flex items-center space-x-2 text-blue-500">
              <LayoutGrid className="w-4 h-4" />
              <span className="text-xxs font-bold uppercase tracking-wider">Layout Formatting</span>
            </div>

            {/* Margin Selectors */}
            <div className="space-y-2">
              <span className="block text-xxs font-bold text-slate-400 uppercase tracking-wide">Page Margins</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'compact', label: 'Compact' },
                  { id: 'balanced', label: 'Balanced' },
                  { id: 'spacious', label: 'Spacious' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setMarginSize(item.id as any)}
                    className={`py-2 text-xxs font-bold rounded-lg border transition-all ${
                      marginSize === item.id
                        ? 'border-blue-600 bg-blue-50/10 text-blue-600 dark:text-blue-400'
                        : 'border-slate-250 dark:border-slate-800 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Selectors */}
            <div className="space-y-2">
              <span className="block text-xxs font-bold text-slate-400 uppercase tracking-wide">Font Scaling</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'small', label: 'Compact' },
                  { id: 'medium', label: 'Standard' },
                  { id: 'large', label: 'Generous' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setFontSize(item.id as any)}
                    className={`py-2 text-xxs font-bold rounded-lg border transition-all ${
                      fontSize === item.id
                        ? 'border-blue-600 bg-blue-50/10 text-blue-600 dark:text-blue-400'
                        : 'border-slate-250 dark:border-slate-800 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Guidelines info card */}
          <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border border-slate-250/50 dark:border-slate-800 rounded-xl space-y-3.5">
            <div className="flex items-start space-x-2.5 text-slate-600 dark:text-slate-400">
              <Info className="w-5 h-5 shrink-0 mt-0.5 text-blue-500" />
              <div className="space-y-1">
                <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">How to export perfectly:</span>
                <p className="text-xxs text-slate-500 dark:text-slate-400 leading-normal font-sans font-light">
                  Clicking "Print" launches your browser's print utility. To save as a PDF file: <br />
                  1. Set the Destination to <strong>"Save as PDF"</strong>. <br />
                  2. Disable <strong>"Headers and Footers"</strong>. <br />
                  3. Enable <strong>"Background graphics"</strong> to capture styling colors.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: High Fidelity print frame template preview */}
        <div className="lg:col-span-8 flex justify-center bg-slate-150/40 dark:bg-slate-900/20 p-4 sm:p-8 rounded-xl border border-slate-250/20 border-dashed">
          <div
            id="printable-area"
            className={`bg-white text-slate-950 rounded-lg border border-slate-200 shadow-xl w-full max-w-[794px] min-h-[1123px] font-sans flex flex-col justify-between transition-all ${getMarginClass()} ${getFontSizeClass()}`}
          >
            {/* Header coordinates */}
            <div className="space-y-4">
              <div className="text-center space-y-2 border-b border-slate-300 pb-5">
                <h1 className="text-3xl font-bold tracking-tight uppercase text-slate-900">
                  {resume.personalInfo.fullName || 'Candidate Name'}
                </h1>
                
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-slate-600 font-light font-sans text-xxs">
                  {resume.personalInfo.email && <span>{resume.personalInfo.email}</span>}
                  {resume.personalInfo.phone && <span>• {resume.personalInfo.phone}</span>}
                  {resume.personalInfo.location && <span>• {resume.personalInfo.location}</span>}
                  {resume.personalInfo.website && (
                    <a href={resume.personalInfo.website} target="_blank" className="text-blue-650">
                      • {resume.personalInfo.website.replace('https://', '')}
                    </a>
                  )}
                </div>
              </div>

              {/* Summary */}
              {resume.summary && (
                <div className="space-y-1.5 break-inside-avoid">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 border-b border-slate-200 pb-0.5">Professional Summary</h2>
                  <p className="text-slate-700 leading-relaxed font-light text-[11px]">{resume.summary}</p>
                </div>
              )}

              {/* Experiences */}
              {resume.experience.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 border-b border-slate-200 pb-0.5 break-inside-avoid">Work Experience</h2>
                  <div className="space-y-4">
                    {resume.experience.map((exp) => (
                      <div key={exp.id} className="space-y-1 break-inside-avoid">
                        <div className="flex justify-between items-baseline font-semibold">
                          <span className="text-slate-900 text-xs">{exp.position || 'Position Name'} • <span className="font-light text-slate-500">{exp.company || 'Company'}</span></span>
                          <span className="text-slate-500 text-xxs font-medium">
                            {exp.startDate || 'YYYY-MM'} – {exp.current ? 'Present' : exp.endDate || 'YYYY-MM'}
                          </span>
                        </div>
                        <ul className="list-disc pl-4 space-y-1 text-slate-700 font-light text-[11px]">
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
              {resume.education.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 border-b border-slate-200 pb-0.5 break-inside-avoid">Education</h2>
                  <div className="space-y-3">
                    {resume.education.map((edu) => (
                      <div key={edu.id} className="space-y-0.5 break-inside-avoid">
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
              {resume.projects.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 border-b border-slate-200 pb-0.5 break-inside-avoid">Key Projects</h2>
                  <div className="space-y-3">
                    {resume.projects.map((p) => (
                      <div key={p.id} className="space-y-1 break-inside-avoid">
                        <div className="flex justify-between items-baseline font-semibold">
                          <span className="text-slate-900 text-xs">{p.name || 'Project Name'} <span className="font-light text-slate-500">| {p.role || 'Role'}</span></span>
                          {p.url && <span className="text-xxs font-medium text-blue-650">{p.url.replace('https://', '')}</span>}
                        </div>
                        <ul className="list-disc pl-4 space-y-0.5 text-slate-700 font-light text-[11px]">
                          {p.bullets.map((b, idx) => b && (
                            <li key={idx}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Competencies */}
              <div className="grid grid-cols-2 gap-6 border-t border-slate-200 pt-4 break-inside-avoid">
                {resume.skills.length > 0 && (
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700">Competencies</h3>
                    <div className="flex flex-wrap gap-1">
                      {resume.skills.map((s) => (
                        <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-medium text-xxs">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {resume.certifications.length > 0 && (
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700">Certifications</h3>
                      <ul className="list-disc pl-4 text-slate-700 text-xxs font-light">
                        {resume.certifications.map((c) => (
                          <li key={c.id}>
                            <strong>{c.name}</strong> {c.issuer && `(${c.issuer})`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {resume.languages.length > 0 && (
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700">Linguistic Profile</h3>
                      <div className="flex flex-wrap gap-x-3 text-slate-700 text-xxs font-light">
                        {resume.languages.map((l) => (
                          <span key={l.id}>{l.name} ({l.proficiency})</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Print Safe Footer */}
            <div className="text-center text-slate-400 font-sans tracking-wide text-xxxxs uppercase border-t border-slate-100 pt-4">
              Generated securely via Elevate Resume. All data privately compiled.
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
