import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Briefcase, ChevronRight, GraduationCap, Sparkles, Star } from 'lucide-react';

interface OnboardingProps {
  onComplete: (onboardingData: {
    targetTitle: string;
    experienceLevel: string;
    skills: string[];
  }) => void;
  onCancel: () => void;
}

export default function Onboarding({ onComplete, onCancel }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [targetTitle, setTargetTitle] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('mid'); // entry, mid, senior, executive
  const [skillsText, setSkillsText] = useState('');
  const [skillsList, setSkillsList] = useState<string[]>([]);

  const handleSkillsAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillsText.trim()) return;
    const cleanSkill = skillsText.trim();
    if (!skillsList.includes(cleanSkill)) {
      setSkillsList([...skillsList, cleanSkill]);
    }
    setSkillsText('');
  };

  const handleRemoveSkill = (skill: string) => {
    setSkillsList(skillsList.filter((s) => s !== skill));
  };

  const popularSkills = [
    'React', 'TypeScript', 'Node.js', 'Python', 'Marketing', 'Product Strategy', 'SEO', 'Data Analysis', 'Figma', 'Project Management'
  ];

  const handleNext = () => {
    if (step === 1 && !targetTitle.trim()) {
      return;
    }
    if (step < 3) {
      setStep(step + 1);
    } else {
      onComplete({
        targetTitle,
        experienceLevel,
        skills: skillsList.length > 0 ? skillsList : ['Problem Solving', 'Communication']
      });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onCancel();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 sm:p-6 transition-colors duration-300">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl overflow-hidden flex flex-col justify-between min-h-[500px]">
        
        {/* Onboarding Header */}
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <span className="font-sans font-semibold text-sm">Personalize Experience</span>
          </div>
          
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400">
            <span className={step >= 1 ? 'text-indigo-600 dark:text-indigo-400' : ''}>1</span>
            <span>/</span>
            <span className={step >= 2 ? 'text-indigo-600 dark:text-indigo-400' : ''}>2</span>
            <span>/</span>
            <span className={step >= 3 ? 'text-indigo-600 dark:text-indigo-400' : ''}>3</span>
          </div>
        </div>

        {/* Step Contents */}
        <div className="p-6 sm:p-8 flex-grow flex flex-col justify-center">
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 font-sans flex items-center space-x-2">
                  <Briefcase className="w-6 h-6 text-indigo-500" />
                  <span>What role are you targeting?</span>
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-normal font-sans font-light">
                  We use this target role to configure custom keyword recommendations, ATS benchmark analysis, and structural advice.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Target Job Title
                </label>
                <input
                  type="text"
                  required
                  value={targetTitle}
                  onChange={(e) => setTargetTitle(e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full px-4 py-3 bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 font-sans flex items-center space-x-2">
                  <Star className="w-6 h-6 text-indigo-500" />
                  <span>Choose your level of experience</span>
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-normal font-sans font-light">
                  This customizes the length advice, section prominence, and summary tone parameters for your resume template.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'entry', label: 'Entry Level', desc: '0 - 2 Years' },
                  { id: 'mid', label: 'Midweight', desc: '2 - 5 Years' },
                  { id: 'senior', label: 'Senior Tier', desc: '5 - 10 Years' },
                  { id: 'executive', label: 'Executive', desc: '10+ Years' }
                ].map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setExperienceLevel(level.id)}
                    className={`p-4 border text-left rounded-2xl transition-all relative ${
                      experienceLevel === level.id
                        ? 'border-indigo-600 bg-indigo-50/10 dark:bg-indigo-950/20 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <span className="block font-semibold text-sm text-slate-900 dark:text-slate-100">
                      {level.label}
                    </span>
                    <span className="block text-xs text-slate-400 dark:text-slate-500 mt-1">
                      {level.desc}
                    </span>
                    {experienceLevel === level.id && (
                      <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 font-sans flex items-center space-x-2">
                  <GraduationCap className="w-6 h-6 text-indigo-500" />
                  <span>Add your core keywords/skills</span>
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-normal font-sans font-light">
                  Add 3-5 core professional competencies to seed your initial skills block.
                </p>
              </div>

              <form onSubmit={handleSkillsAdd} className="flex gap-2">
                <input
                  type="text"
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                  placeholder="Enter a skill (e.g. React)"
                  className="flex-grow px-4 py-2.5 bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold transition-all shrink-0"
                >
                  Add
                </button>
              </form>

              {skillsList.length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200/30 dark:border-slate-800/40">
                  {skillsList.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-medium border border-indigo-100/40 dark:border-indigo-900/40"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:text-indigo-800 dark:hover:text-indigo-200 font-bold ml-1 text-xs px-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="space-y-1.5">
                <span className="block text-xxs font-bold text-slate-400 uppercase tracking-wide">Popular Choices</span>
                <div className="flex flex-wrap gap-1">
                  {popularSkills.map((ps) => {
                    const isAdded = skillsList.includes(ps);
                    return (
                      <button
                        key={ps}
                        type="button"
                        onClick={() => {
                          if (isAdded) {
                            handleRemoveSkill(ps);
                          } else {
                            setSkillsList([...skillsList, ps]);
                          }
                        }}
                        className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                          isAdded
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-600/10'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {ps}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Toolbar Footer */}
        <div className="p-6 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/10">
          <button
            onClick={handleBack}
            className="flex items-center space-x-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors py-2 px-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{step === 1 ? 'Cancel' : 'Back'}</span>
          </button>

          <button
            onClick={handleNext}
            disabled={step === 1 && !targetTitle.trim()}
            className="flex items-center space-x-1 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/10 transition-all cursor-pointer"
          >
            <span>{step === 3 ? 'Complete Setup' : 'Continue'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
