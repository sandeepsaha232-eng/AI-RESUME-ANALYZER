import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Briefcase, Camera, ChevronRight, FileText, GraduationCap, Sparkles, Star, UploadCloud, AlertCircle } from 'lucide-react';
import { safeFetchJson } from '../utils/apiHelper';
import { Resume } from '../types';

interface OnboardingProps {
  onComplete: (onboardingData: {
    targetTitle: string;
    experienceLevel: string;
    skills: string[];
    photoUrl?: string;
  }) => void;
  onCompleteWithParsedResume: (parsedResume: Resume) => void;
  onCancel: () => void;
}

export default function Onboarding({ onComplete, onCompleteWithParsedResume, onCancel }: OnboardingProps) {
  const [flow, setFlow] = useState<'choice' | 'upload' | 'manual'>('choice');

  // Manual Flow Steps
  const [step, setStep] = useState(1);
  const [targetTitleSelect, setTargetTitleSelect] = useState('Software Engineer');
  const [targetTitleCustom, setTargetTitleCustom] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('mid'); // entry, mid, senior, executive

  // Step 1: Contact
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);

  // Step 3: Education & Honors
  const [institution, setInstitution] = useState('');
  const [degree, setDegree] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [gpa, setGpa] = useState('');
  const [honors, setHonors] = useState('');

  // Step 4: Projects & Work
  const [projectName, setProjectName] = useState('');
  const [projectRole, setProjectRole] = useState('');
  const [projectBullets, setProjectBullets] = useState('');

  // Step 5: Certifications & Skills
  const [certName, setCertName] = useState('');
  const [certIssuer, setCertIssuer] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);

  // Upload Flow States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Upload Flow States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragActive, setDragActive] = useState(false);

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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const popularSkills = [
    'React', 'TypeScript', 'Node.js', 'Python', 'Marketing', 'Product Strategy', 'SEO', 'Data Analysis', 'Figma', 'Project Management'
  ];

  const getTargetTitle = () => {
    if (targetTitleSelect === 'Other') {
      return targetTitleCustom.trim() || 'Custom Professional Role';
    }
    if (step < 4) {
      setStep(step + 1);
    } else {
      onComplete({
        targetTitle,
        experienceLevel,
        skills: skillsList.length > 0 ? skillsList : ['Problem Solving', 'Communication'],
        photoUrl
      });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      setFlow('choice');
    }
  };

  // Upload Logic
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

  const processUploadedFile = async (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension !== 'pdf' && extension !== 'docx') {
      setUploadError('Invalid format. Only PDF and DOCX files are allowed.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size limit is 10MB.');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const json = await safeFetchJson('/api/v1/resumes/upload', {
        method: 'POST',
        body: formData,
      });

      const { resume } = json.data;
      onCompleteWithParsedResume(resume);
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || 'Error parsing document. Please try again or create manually.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 sm:p-6 transition-colors duration-300">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl overflow-hidden flex flex-col justify-between min-h-[520px]">
        
        {/* Onboarding Header */}
        <div className="p-6 border-b border-white/10 dark:border-slate-800/50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 animate-pulse" />
            </div>
            <span className="font-sans font-bold text-sm tracking-wide bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Configure Your CV Workspace</span>
          </div>
          
          {flow === 'manual' && (
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400">
              <span className={step >= 1 ? 'text-indigo-600 dark:text-indigo-400' : ''}>1</span>
              <span>/</span>
              <span className={step >= 2 ? 'text-indigo-600 dark:text-indigo-400' : ''}>2</span>
              <span>/</span>
              <span className={step >= 3 ? 'text-indigo-600 dark:text-indigo-400' : ''}>3</span>
              <span>/</span>
              <span className={step >= 4 ? 'text-indigo-600 dark:text-indigo-400' : ''}>4</span>
            </div>
          )}
        </div>

        {/* 1. Choice Flow */}
        {flow === 'choice' && (
          <div className="p-8 sm:p-10 flex-grow flex flex-col justify-center space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-none">How would you like to build your CV?</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-light max-w-sm mx-auto">
                Get started with your perfect scannable resume within minutes. Choose your starting path.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Option 1: Fast upload */}
              <button
                onClick={() => setFlow('upload')}
                className="p-6 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl text-left transition-all bg-slate-50/50 dark:bg-slate-950/20 hover:shadow-lg flex flex-col justify-between group h-48"
              >
                <div className="p-3 bg-indigo-100 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400 w-fit">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Upload Existing CV</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </h3>
                  <p className="text-xxs sm:text-xs text-slate-400 mt-1 font-light leading-normal">
                    Import PDF or Word scroll to extract details, score layout, and go straight to dashboard.
                  </p>
                </div>
              </button>

              {/* Option 2: Step-by-Step Manual */}
              <button
                onClick={() => {
                  setFlow('manual');
                  setStep(1);
                }}
                className="p-6 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl text-left transition-all bg-slate-50/50 dark:bg-slate-950/20 hover:shadow-lg flex flex-col justify-between group h-48"
              >
                <div className="p-3 bg-indigo-100 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400 w-fit">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Create Manually</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </h3>
                  <p className="text-xxs sm:text-xs text-slate-400 mt-1 font-light leading-normal">
                    Build from scratch with professional multi-step queries, core keywords, and photo upload.
                  </p>
                </div>
              </button>
            </div>

            <button
              onClick={onCancel}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold mx-auto w-fit py-1"
            >
              Cancel and Logout
            </button>
          </div>
        )}

        {/* 2. Upload Flow */}
        {flow === 'upload' && (
          <div className="p-8 flex-grow flex flex-col justify-center space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Upload Your Scroll</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-light max-w-sm mx-auto">
                Select your pre-made CV. We will analyze your experience, calculate scores, and redirect you straight to the dashboard.
              </p>
            </div>

            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`p-10 border-2 border-dashed rounded-2xl text-center transition-all ${
                dragActive
                  ? 'border-indigo-500 bg-indigo-50/5 dark:bg-indigo-950/10'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              {isUploading ? (
                <div className="space-y-4 py-4 flex flex-col items-center">
                  <div className="w-12 h-12 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                  <p className="text-xs font-semibold">Parsing compliance details...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <UploadCloud className="w-10 h-10 text-indigo-500 mx-auto" />
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-750 dark:text-slate-350">Drag and drop your CV file</p>
                    <p className="text-[10px] text-slate-400">PDF, DOCX formats (Max 10MB)</p>
                  </div>
                  <div className="relative inline-block mt-2">
                    <input
                      type="file"
                      id="onboard-file-upload"
                      accept=".pdf,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="onboard-file-upload"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xxs font-black uppercase rounded-lg cursor-pointer"
                    >
                      Browse Files
                    </label>
                  </div>
                </div>
              )}
            </div>

            {uploadError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-600 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <button
              onClick={() => setFlow('choice')}
              className="flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors mx-auto pt-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to choices</span>
            </button>
          </div>
        )}

        {/* 3. Manual Step-by-Step Flow */}
        {flow === 'manual' && (
          <>
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

              {step === 4 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 font-sans flex items-center space-x-2">
                      <Camera className="w-6 h-6 text-indigo-500" />
                      <span>Upload Profile Photo</span>
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-normal font-sans font-light">
                      Add a professional photo/avatar to personalize your profile layout (Optional).
                    </p>
                  </div>

                  <div className="flex flex-col items-center justify-center p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 space-y-4">
                    {photoUrl ? (
                      <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-indigo-500 group shadow-lg">
                        <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setPhotoUrl(undefined)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 bg-white dark:bg-slate-900 relative">
                        <Camera className="w-8 h-8 mb-1" />
                        <span className="text-[10px]">Upload Photo</span>
                      </div>
                    )}

                    <input
                      type="file"
                      id="onboard-photo-upload"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="onboard-photo-upload"
                      className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      {photoUrl ? 'Change Photo' : 'Select Photo'}
                    </label>
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
                <span>{step === 4 ? 'Complete Setup' : 'Continue'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
