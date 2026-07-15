import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Briefcase, Camera, ChevronRight, FileText, GraduationCap, Sparkles, Star, UploadCloud, AlertCircle, Award, Phone, MapPin, User, Mail, FolderGit2 } from 'lucide-react';
import { safeFetchJson } from '../utils/apiHelper';
import { Resume } from '../types';

interface OnboardingProps {
  onComplete: (onboardingData: {
    targetTitle: string;
    experienceLevel: string;
    skills: string[];
    photoUrl?: string;
    phone?: string;
    location?: string;
    education?: {
      institution: string;
      degree: string;
      fieldOfStudy: string;
      gpa: string;
      honors: string;
    };
    projects?: {
      name: string;
      role: string;
      bullets: string[];
    };
    certifications?: {
      name: string;
      issuer: string;
    };
  }) => void;
  onCompleteWithParsedResume: (parsedResume: Resume) => void;
  onCancel: () => void;
}

const POPULAR_ROLES = [
  'Software Engineer',
  'Data Analyst',
  'Product Manager',
  'UI/UX Designer',
  'Financial Analyst',
  'Marketing Specialist',
  'Human Resources Generalist',
  'Project Manager',
  'Other'
];

export default function Onboarding({ onComplete, onCompleteWithParsedResume, onCancel }: OnboardingProps) {
  const [flow, setFlow] = useState<'choice' | 'upload' | 'manual'>('choice');

  // Manual Flow Steps (5 Steps)
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

  const getTargetTitle = () => {
    if (targetTitleSelect === 'Other') {
      return targetTitleCustom.trim() || 'Custom Professional Role';
    }
    return targetTitleSelect;
  };

  const handleNext = () => {
    if (flow === 'manual') {
      if (step < 5) {
        setStep(step + 1);
      } else {
        const finalTitle = getTargetTitle();
        onComplete({
          targetTitle: finalTitle,
          experienceLevel,
          skills: skillsList.length > 0 ? skillsList : ['Problem Solving', 'Communication'],
          photoUrl,
          phone,
          location,
          education: institution ? { institution, degree, fieldOfStudy, gpa, honors } : undefined,
          projects: projectName ? { name: projectName, role: projectRole, bullets: projectBullets ? projectBullets.split('\n').filter(Boolean) : [] } : undefined,
          certifications: certName ? { name: certName, issuer: certIssuer } : undefined
        });
      }
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 transition-colors duration-300 font-sans relative overflow-hidden">

      {/* Premium Glassmorphic Moving Background Blobs */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-indigo-600/10 dark:bg-indigo-600/5 blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-yellow-500/5 dark:bg-yellow-500/3 blur-3xl animate-bounce pointer-events-none" style={{ animationDuration: '8s' }} />

      <div className="w-full max-w-xl bg-white/10 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-800/60 shadow-[0_0_40px_rgba(99,102,241,0.15)] overflow-hidden flex flex-col justify-between min-h-[550px] relative z-10">
        
        {/* Onboarding Header */}
        <div className="p-6 border-b border-white/10 dark:border-slate-800/50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(99,102,241,0.2)]">
              <Sparkles className="w-4.5 h-4.5 animate-spin" style={{ animationDuration: '4s' }} />
            </div>
            <span className="font-sans font-bold text-sm tracking-wide bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Configure Your CV Workspace</span>
          </div>
          
          {flow === 'manual' && (
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-indigo-400">
              <span className={step >= 1 ? 'text-indigo-400 font-extrabold' : 'text-slate-500'}>1</span>
              <span className="text-slate-600">/</span>
              <span className={step >= 2 ? 'text-indigo-400 font-extrabold' : 'text-slate-500'}>2</span>
              <span className="text-slate-600">/</span>
              <span className={step >= 3 ? 'text-indigo-400 font-extrabold' : 'text-slate-500'}>3</span>
              <span className="text-slate-600">/</span>
              <span className={step >= 4 ? 'text-indigo-400 font-extrabold' : 'text-slate-500'}>4</span>
              <span className="text-slate-600">/</span>
              <span className={step >= 5 ? 'text-indigo-400 font-extrabold' : 'text-slate-500'}>5</span>
            </div>
          )}
        </div>

        {/* 1. Choice Flow */}
        {flow === 'choice' && (
          <div className="p-8 sm:p-10 flex-grow flex flex-col justify-center space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-none">How would you like to build your CV?</h1>
              <p className="text-xs sm:text-sm text-slate-400 font-light max-w-sm mx-auto">
                Get started with your perfect scannable resume within minutes. Choose your starting path.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Option 1: Fast upload */}
              <button
                onClick={() => setFlow('upload')}
                className="p-6 border border-white/10 hover:border-indigo-500/50 rounded-2xl text-left transition-all bg-white/[0.02] hover:bg-white/[0.05] hover:shadow-2xl flex flex-col justify-between group h-48"
              >
                <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 w-fit">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-1.5">
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
                className="p-6 border border-white/10 hover:border-indigo-500/50 rounded-2xl text-left transition-all bg-white/[0.02] hover:bg-white/[0.05] hover:shadow-2xl flex flex-col justify-between group h-48"
              >
                <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 w-fit">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-1.5">
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
              className="text-xs text-slate-400 hover:text-white font-bold mx-auto w-fit py-1 transition-colors"
            >
              Cancel and Logout
            </button>
          </div>
        )}

        {/* 2. Upload Flow */}
        {flow === 'upload' && (
          <div className="p-8 flex-grow flex flex-col justify-center space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-xl sm:text-2xl font-black text-white">Upload Your Scroll</h2>
              <p className="text-xs text-slate-400 font-light max-w-sm mx-auto">
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
                  ? 'border-indigo-500 bg-indigo-50/5'
                  : 'border-white/10 hover:border-white/20 bg-white/[0.01]'
              }`}
            >
              {isUploading ? (
                <div className="space-y-4 py-4 flex flex-col items-center">
                  <div className="w-12 h-12 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                  <p className="text-xs font-semibold text-slate-300">Parsing compliance details...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <UploadCloud className="w-10 h-10 text-indigo-400 mx-auto" />
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-200">Drag and drop your CV file</p>
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
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xxs font-black uppercase rounded-lg cursor-pointer transition-colors shadow-lg"
                    >
                      Browse Files
                    </label>
                  </div>
                </div>
              )}
            </div>

            {uploadError && (
              <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-300 text-xs rounded-xl flex items-center justify-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{uploadError}</span>
              </div>
            )}

            <button
              onClick={() => setFlow('choice')}
              className="flex items-center space-x-1 text-xs font-semibold text-slate-400 hover:text-white transition-colors mx-auto pt-2"
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

              {/* Step 1: Contact details & Photo */}
              {step === 1 && (
                <div className="space-y-5 text-left">
                  <div className="space-y-2">
                    <h1 className="text-xl sm:text-2xl font-black text-white flex items-center space-x-2">
                      <User className="w-6 h-6 text-indigo-400" />
                      <span>Contact Details & Photo</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-400 font-light leading-normal">
                      Let's set up your profile details. Professional details are used to auto-fill scannable header layers.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+1 (555) 019-2834"
                          className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location / City</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="San Francisco, CA"
                          className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Photo picker */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Profile Avatar (Optional)</label>
                    <div className="flex items-center space-x-4 bg-slate-900/60 p-4 border border-white/10 rounded-xl">
                      {photoUrl ? (
                        <div className="relative w-16 h-14 rounded-full overflow-hidden border border-indigo-500 shadow">
                          <img src={photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-16 h-14 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-500">
                          <Camera className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <input
                          type="file"
                          id="avatar-photo-file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                        <label
                          htmlFor="avatar-photo-file"
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xxs font-black uppercase cursor-pointer"
                        >
                          Upload Photo
                        </label>
                        <p className="text-[10px] text-slate-500 mt-1">Accepts JPG, PNG up to 1MB</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Dropdown options for applying role */}
              {step === 2 && (
                <div className="space-y-5 text-left">
                  <div className="space-y-2">
                    <h1 className="text-xl sm:text-2xl font-black text-white flex items-center space-x-2">
                      <Briefcase className="w-6 h-6 text-indigo-400" />
                      <span>Target Role & Level</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-400 font-light leading-normal">
                      What is your targeted career path? Select a target role dropdown, or select 'Other' to write your custom role.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Applying For</label>
                      <select
                        value={targetTitleSelect}
                        onChange={(e) => setTargetTitleSelect(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      >
                        {POPULAR_ROLES.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>

                    {targetTitleSelect === 'Other' && (
                      <div className="space-y-1 animate-fade-in">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type Your Custom Role</label>
                        <input
                          type="text"
                          required
                          value={targetTitleCustom}
                          onChange={(e) => setTargetTitleCustom(e.target.value)}
                          placeholder="e.g. Lead Devops Architect"
                          className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Level of Experience</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'entry', label: 'Entry Level', desc: '0 - 2 Years' },
                        { id: 'mid', label: 'Midweight', desc: '2 - 5 Years' },
                        { id: 'senior', label: 'Senior Tier', desc: '5 - 10 Years' },
                        { id: 'executive', label: 'Executive', desc: '10+ Years' }
                      ].map((level) => (
                        <button
                          key={level.id}
                          type="button"
                          onClick={() => setExperienceLevel(level.id)}
                          className={`p-3 border text-left rounded-xl transition-all relative ${
                            experienceLevel === level.id
                              ? 'border-indigo-500 bg-indigo-500/10'
                              : 'border-white/10 bg-slate-900/40 hover:bg-slate-800'
                          }`}
                        >
                          <span className="block font-bold text-xs text-white">{level.label}</span>
                          <span className="block text-[10px] text-slate-500">{level.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Education & Medals / Honors */}
              {step === 3 && (
                <div className="space-y-5 text-left">
                  <div className="space-y-2">
                    <h1 className="text-xl sm:text-2xl font-black text-white flex items-center space-x-2">
                      <GraduationCap className="w-6 h-6 text-indigo-400" />
                      <span>Education & Honors</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-400 font-light leading-normal">
                      Query your educational background. Describe any medals, honors, high GPA, or academic merits.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Institution Name</label>
                        <input
                          type="text"
                          value={institution}
                          onChange={(e) => setInstitution(e.target.value)}
                          placeholder="Stanford University"
                          className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Degree Obtained</label>
                        <input
                          type="text"
                          value={degree}
                          onChange={(e) => setDegree(e.target.value)}
                          placeholder="Bachelor of Science"
                          className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Field of Study</label>
                        <input
                          type="text"
                          value={fieldOfStudy}
                          onChange={(e) => setFieldOfStudy(e.target.value)}
                          placeholder="Computer Science"
                          className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">GPA Score</label>
                        <input
                          type="text"
                          value={gpa}
                          onChange={(e) => setGpa(e.target.value)}
                          placeholder="3.8 / 4.0"
                          className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Medals / Honors / Academic Awards</label>
                      <input
                        type="text"
                        value={honors}
                        onChange={(e) => setHonors(e.target.value)}
                        placeholder="Dean's List Honoree, Golden Medalist in Physics Competition"
                        className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Projects & Work Description */}
              {step === 4 && (
                <div className="space-y-5 text-left">
                  <div className="space-y-2">
                    <h1 className="text-xl sm:text-2xl font-black text-white flex items-center space-x-2">
                      <FolderGit2 className="w-6 h-6 text-indigo-400" />
                      <span>Featured Work & Projects</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-400 font-light leading-normal">
                      What is the primary project or work experience you've built? Detail your accomplishments in descriptions.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project / Company Name</label>
                        <input
                          type="text"
                          value={projectName}
                          onChange={(e) => setProjectName(e.target.value)}
                          placeholder="e.g. Elevate SaaS Portal"
                          className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Role</label>
                        <input
                          type="text"
                          value={projectRole}
                          onChange={(e) => setProjectRole(e.target.value)}
                          placeholder="e.g. Lead Developer"
                          className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Accomplishments & Descriptions (One per line)</label>
                      <textarea
                        value={projectBullets}
                        onChange={(e) => setProjectBullets(e.target.value)}
                        placeholder="Built high-performance full-stack dashboard utilizing React 19 and Vite.&#10;Integrated Google Gemini AI client to automate CV analysis queries.&#10;Reduced page load times by 40% using esbuild bundling."
                        rows={4}
                        className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors font-sans"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Certifications & Skills */}
              {step === 5 && (
                <div className="space-y-5 text-left">
                  <div className="space-y-2">
                    <h1 className="text-xl sm:text-2xl font-black text-white flex items-center space-x-2">
                      <Award className="w-6 h-6 text-indigo-400" />
                      <span>Certifications & Skills</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-400 font-light leading-normal">
                      Input your certificates and professional core skills to maximize ATS scannability.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Certificate Name</label>
                        <input
                          type="text"
                          value={certName}
                          onChange={(e) => setCertName(e.target.value)}
                          placeholder="AWS Certified Solutions Architect"
                          className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Issuer</label>
                        <input
                          type="text"
                          value={certIssuer}
                          onChange={(e) => setCertIssuer(e.target.value)}
                          placeholder="Amazon Web Services"
                          className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Add Competency Skills</label>
                      <form onSubmit={handleSkillsAdd} className="flex gap-2">
                        <input
                          type="text"
                          value={skillsText}
                          onChange={(e) => setSkillsText(e.target.value)}
                          placeholder="Enter a skill (e.g. React)"
                          className="flex-grow px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-all shrink-0 uppercase tracking-wider"
                        >
                          Add
                        </button>
                      </form>
                    </div>

                    {skillsList.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 p-3.5 bg-slate-950/60 rounded-xl border border-white/10">
                        {skillsList.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg text-xs font-medium border border-indigo-500/20"
                          >
                            <span>{skill}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill)}
                              className="hover:text-indigo-200 font-bold ml-1 text-xs px-0.5"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="space-y-1">
                      <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide">Popular Choices</span>
                      <div className="flex flex-wrap gap-1">
                        {['React', 'TypeScript', 'Node.js', 'Python', 'Marketing', 'SEO', 'Data Analysis', 'Project Management'].map((ps) => {
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
                              className={`px-2 py-0.5 text-xxs rounded border transition-all uppercase font-bold tracking-wider ${
                                isAdded
                                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-600/10'
                                  : 'bg-slate-900 border-white/5 hover:border-white/10 text-slate-400 hover:text-white'
                              }`}
                            >
                              {ps}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Action Toolbar Footer */}
            <div className="p-6 border-t border-white/10 dark:border-slate-800/50 flex items-center justify-between bg-white/[0.01]">
              <button
                onClick={handleBack}
                className="flex items-center space-x-1.5 text-sm font-medium text-slate-400 hover:text-white transition-colors py-2 px-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{step === 1 ? 'Cancel' : 'Back'}</span>
              </button>

              <button
                onClick={handleNext}
                disabled={step === 2 && targetTitleSelect === 'Other' && !targetTitleCustom.trim()}
                className="flex items-center space-x-1 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/10 transition-all cursor-pointer"
              >
                <span>{step === 5 ? 'Finish & View Score' : 'Continue'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
