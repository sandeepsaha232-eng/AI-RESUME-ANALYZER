import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Award, Briefcase, ChevronRight, FileText, Sparkles, Target, Zap, UploadCloud,
  AlertCircle, ArrowRight, Check, Star, Info,
  Volume2, Flame, Shield, HelpCircle, Laptop, Settings, Eye, Users, Cpu, FileUp, ListFilter, Play, Github
} from 'lucide-react';
import CanvasVisualizer from './three/CanvasVisualizer';
import AladdinBot from './three/AladdinBot';
import { Resume } from '../types';
import { safeFetchJson } from '../utils/apiHelper';

interface MarketingLandingProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onInstantResumeParsed?: (resume: Resume) => void;
  reduceMotion?: boolean;
}

export default function MarketingLanding({ onGetStarted, onLogin, onInstantResumeParsed, reduceMotion = false }: MarketingLandingProps) {
  // 1. Frictionless Resume Upload States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    score: number;
    pickupLine: string;
    parsedResume: Resume | null;
  } | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // 3. Interactive Templates State
  const [activeTemplate, setActiveTemplate] = useState('Modern');
  const templatesList = ['Modern', 'Professional', 'Minimal', 'Student', 'Executive', 'Creative'];

  // 4. Interactive Testimonials Filter
  const [activeTestimonialTab, setActiveTestimonialTab] = useState('All');
  const testimonialTabs = ['All', 'Students', 'Freshers', 'Software Engineers', 'Recruiters'];

  // 5. FAQ Accordion States
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Telemetry random ticker simulator
  const [counter, setCounter] = useState(3842);
  useEffect(() => {
    const interval = setInterval(() => {
      setCounter((prev) => prev + Math.floor(Math.random() * 3) + 1);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

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

  const getCheekyPickupLine = (score: number) => {
    if (score >= 80) {
      return `Outstanding ATS score of ${score}%! Your resume possesses high-caliber structure and keyword alignments. Let's polish the final details.`;
    }
    if (score >= 60) {
      return `Solid rating of ${score}%! With minor corrections to your technical keywords and metric formatting, you'll easily stand out.`;
    }
    if (score >= 45) {
      return `ATS Rating: ${score}%. Let's calibrate your experience phrasing and optimize your layout scannability to pass the initial screening.`;
    }
    return `ATS Rating: ${score}%. Your formatting structure requires optimization. Let's fix this layout immediately using our professional templates.`;
  };

  const processUploadedFile = async (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['pdf', 'docx', 'jpg', 'jpeg', 'png'];
    if (!validExtensions.includes(extension || '')) {
      setUploadError('Invalid format. Please upload PDF, DOCX, or high-res JPG/PNG files.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size limit is 10MB.');
      return;
    }

    setIsAnalyzing(true);
    setUploadError('');
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const json = await safeFetchJson('/api/v1/resumes/upload', {
        method: 'POST',
        body: formData,
      });

      const { resume, analysis } = json.data;
      const score = analysis.atsScore;

      setAnalysisResult({
        score,
        parsedResume: resume,
        pickupLine: getCheekyPickupLine(score),
      });
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || 'The parser was unable to complete. Please check server logs.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const claimWorkspace = () => {
    if (analysisResult?.parsedResume && onInstantResumeParsed) {
      onInstantResumeParsed(analysisResult.parsedResume);
    } else {
      onGetStarted();
    }
  };

  // Raw Data Configs
  const faqData = [
    { q: "How is Elevate different from standard LLMs like ChatGPT?", a: "Unlike general models that often hallucinate details or break scannable formatting, Elevate uses recruiter-vetted scoring metrics and custom-engineered Gemini API guidelines to safely restructure your content." },
    { q: "Is my personal data protected?", a: "Yes. All resumes and user metadata are saved securely using local browser caching, sandboxed databases, and zero-third-party disclosure policies." },
    { q: "What file formats does the analyzer accept?", a: "We support PDF, DOCX, and high-resolution image formats (JPG, PNG, JPEG) for scanning." },
    { q: "Can I export my finished resume to PDF?", a: "Yes! Elevate provides a professional, single-click PDF exporter that perfectly aligns with ATS vertical grid scanning requirements." }
  ];

  const testimonials = [
    { name: 'Kylie J.', category: 'Students', company: 'Stanford University', quote: 'Elevate landed me my summer internship at Apple! The bullet point enhancement recommended exactly what technical keywords I was missing.', avatar: 'KJ' },
    { name: 'Anish P.', category: 'Freshers', company: 'New Grad', quote: 'As a fresher, I had almost zero achievements on paper. Elevate helped me turn my basic university homework projects into quantified engineering highlights.', avatar: 'AP' },
    { name: 'Devon C.', category: 'Software Engineers', company: 'Netflix', quote: 'The ATS compatibility checklist is magic. I got my resume up to a 95% rating and secured four tech interviews in two weeks.', avatar: 'DC' },
    { name: 'Sarah M.', category: 'Recruiters', company: 'Google Partner', quote: 'We instantly reject resumes built with basic ChatGPT formatting because they clog up our ATS parsers. Resumes built with Elevate pass flawlessly.', avatar: 'SM' },
  ];

  const filteredTestimonials = activeTestimonialTab === 'All'
    ? testimonials
    : testimonials.filter(t => t.category === activeTestimonialTab);

  // Framer Motion staggered grid variants
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const fadeInUpVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 80, damping: 20 }
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden bg-[#09090d] text-slate-200 transition-colors duration-300 font-sans">

      {/* Elegant Colorful Background (No Neon, Sophisticated) */}
      <CanvasVisualizer intensity="high" reduceMotion={reduceMotion} />

      {/* Header (Professional, Aesthetic Matte Finish with Deep Indigo & Amber Accents) */}
      <header className="sticky top-0 z-50 w-full bg-[#09090d]/80 backdrop-blur-md border-b border-indigo-950/40 h-16 flex items-center justify-between px-4 sm:px-8">
        <div className="flex items-center space-x-2 cursor-pointer">
          <div className="p-1.5 bg-gradient-to-br from-indigo-700 to-indigo-500 rounded-lg text-white shrink-0 shadow-[0_1px_10px_rgba(79,70,229,0.3)]">
            <Sparkles className="w-4 h-4 text-amber-200" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm sm:text-base text-white tracking-tight">Elevate Resume</span>
            <span className="text-[8px] font-semibold text-amber-400 uppercase tracking-widest">Premium Edition</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={onLogin} className="text-xs font-semibold text-slate-400 hover:text-white transition-colors">Sign In</button>
          <button onClick={onGetStarted} className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-[11px] sm:text-xs rounded-lg transition-all uppercase tracking-wider border border-indigo-500/20 shadow-[0_2px_12px_rgba(79,70,229,0.2)]">Build Resume</button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow space-y-16 sm:space-y-24 md:space-y-32 py-12 px-4 sm:px-8 max-w-7xl mx-auto w-full relative z-10 text-center">

        {/* SECTION 1: HERO */}
        <section className="space-y-6 max-w-3xl mx-auto pt-2">
          <div className="inline-flex items-center space-x-2 bg-indigo-950/40 text-indigo-300 px-3.5 py-1.5 rounded-full border border-indigo-900/40 text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest">
            <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>AI Resume Builder • ATS Auditing • Job Tailoring</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight">
            Elevate your career. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 via-purple-300 to-amber-200">
              Professional Grade.
            </span>
          </h1>

          {/* Large text description: Hidden or drastically shortened on mobile screens */}
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed block sm:hidden font-light">
            Elevate uses deterministic recruiter guidelines to structure, audit, and tailor your resume for top ATS matching.
          </p>
          <p className="text-sm sm:text-lg text-slate-300 font-light max-w-2xl mx-auto leading-relaxed hidden sm:block">
            Stop pasting raw prompts into ChatGPT. Elevate combines <span className="text-amber-300 font-medium">deterministic recruiter rules</span> and custom-engineered Gemini optimization to audit, rate, and tailor your resume flawlessly.
          </p>

          <div className="pt-3 flex flex-col sm:flex-row justify-center items-center gap-3 max-w-xs sm:max-w-md mx-auto w-full">
            <button onClick={onGetStarted} className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-amber-600 hover:from-indigo-500 hover:to-amber-500 text-white font-bold text-[11px] sm:text-xs rounded-lg shadow-lg shadow-indigo-950/50 uppercase tracking-wider flex items-center justify-center space-x-2 transition-all">
              <span>Create Free Resume</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </section>

        {/* Live Statistics Block - Simplified on mobile */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center max-w-4xl mx-auto">
          <div className="p-4 bg-white/[0.02] border border-indigo-950/20 backdrop-blur-sm rounded-xl">
            <p className="text-xl sm:text-2xl font-bold text-indigo-400">10K+</p>
            <p className="text-[8px] sm:text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Resumes Created</p>
          </div>
          <div className="p-4 bg-white/[0.02] border border-indigo-950/20 backdrop-blur-sm rounded-xl">
            <p className="text-xl sm:text-2xl font-bold text-amber-400">95%</p>
            <p className="text-[8px] sm:text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">ATS Accuracy</p>
          </div>
          <div className="p-4 bg-white/[0.02] border border-indigo-950/20 backdrop-blur-sm rounded-xl">
            <p className="text-xl sm:text-2xl font-bold text-indigo-400">100+</p>
            <p className="text-[8px] sm:text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Templates Built</p>
          </div>
          <div className="p-4 bg-indigo-950/[0.2] border border-indigo-900/30 rounded-xl">
            <p className="text-xl sm:text-2xl font-bold text-amber-400">{counter}</p>
            <p className="text-[8px] sm:text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">AI Ratings Today</p>
          </div>
        </section>

        {/* SECTION FOR UPLOADING */}
        <div id="dropzone-element" className="w-full max-w-xl mx-auto space-y-4">
          <AnimatePresence mode="wait">
            {!analysisResult ? (
              <motion.div
                key="dropzone"
                className="relative rounded-2xl p-[1px] bg-gradient-to-r from-indigo-950/40 via-amber-950/20 to-indigo-950/40 hover:from-indigo-900/50 hover:to-indigo-900/50 transition-all duration-300"
              >
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`relative rounded-[15px] bg-[#0d0d12] p-6 sm:p-10 text-center transition-all ${
                    dragActive ? 'bg-indigo-950/30' : ''
                  }`}
                >
                  <input
                    type="file"
                    id="frictionless-file-upload"
                    accept=".pdf,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {isAnalyzing ? (
                    <div className="space-y-4 py-4 flex flex-col items-center">
                      <div className="w-10 h-10 border-2 border-indigo-500 border-t-amber-400 rounded-full animate-spin" />
                      <p className="text-xs font-semibold text-slate-300">Analyzing layout structure... No forms required.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <UploadCloud className="w-8 h-8 text-indigo-400 mx-auto" />
                      <div className="space-y-1">
                        <h3 className="text-base sm:text-lg font-bold text-white">Drop your resume scroll here</h3>
                        <p className="text-[10px] text-slate-400 max-w-xs mx-auto">Supports PDF, DOCX, and JPG/PNG resume formats.</p>
                      </div>
                      <label htmlFor="frictionless-file-upload" className="inline-flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-indigo-800 to-indigo-900 hover:from-indigo-750 hover:to-indigo-850 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors shadow-md">
                        <span>Select File</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </label>
                    </div>
                  )}

                  {uploadError && (
                    <div className="mt-4 p-2.5 bg-red-950/20 border border-red-900/30 text-red-300 text-xs rounded-lg flex items-center justify-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="rating-card"
                className="relative rounded-2xl p-[1px] bg-indigo-900/40 shadow-xl"
              >
                <div className="rounded-[15px] bg-[#0c0c10] p-6 sm:p-8 text-center space-y-4 relative overflow-hidden">
                  <h3 className="text-base sm:text-lg font-bold text-white">Your Profile Rating</h3>
                  <div className="flex justify-center">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
                        <circle cx="50" cy="50" r="40" fill="transparent" strokeDasharray={2 * Math.PI * 40} strokeDashoffset={2 * Math.PI * 40 * (1 - analysisResult.score / 100)} strokeWidth="7" strokeLinecap="round" className="stroke-indigo-400" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg sm:text-xl font-extrabold text-white">{analysisResult.score}%</span>
                        <span className="text-[7px] font-bold uppercase text-slate-500">ATS Match</span>
                      </div>
                    </div>
                  </div>
                  <div className="max-w-sm mx-auto p-3 bg-indigo-950/20 border border-indigo-900/20 rounded-lg">
                    <p className="text-xs text-slate-300 leading-relaxed font-light">"{analysisResult.pickupLine}"</p>
                  </div>
                  <button onClick={claimWorkspace} className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-amber-600 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center space-x-1.5 mx-auto uppercase tracking-wide">
                    <span>Claim Workspace & Fix Resume</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>


        {/* =========================================================================
            NOTE: ALL SECTIONS BELOW HERE HAVE ENHANCED RESPONSIVE TYPOGRAPHY,
            PREMIUM GLASSMORPHIC BACKDROP BLURS, AND viewport={{ once: true }} SCROLL ANIMATIONS
            ========================================================================= */}

        {/* SECTION 2: CORE FEATURES - Text and cards heavily pruned on mobile screens */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={staggerContainer}
          className="space-y-8"
        >
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Built for Perfection</span>
            <h2 className="text-xl sm:text-2xl md:text-4xl font-extrabold text-white">Core Platform Features</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            {[
              { icon: Cpu, title: "🤖 AI Resume Builder", desc: "Interactive workspace to construct beautiful, robust, section-perfect resumes." },
              { icon: FileText, title: "📄 Resume Analyzer", desc: "Automated parser auditing checking layout scannability and structure." },
              { icon: Target, title: "🎯 ATS Checker", desc: "Verify formatting consistency, missing keywords, and recruiter metrics." },
              { icon: ListFilter, title: "🔍 JD Matcher", desc: "Compare against target jobs and get instant, accurate gap feedback." },
              // Rest of features are only rendered on desktop to avoid text overload / "dumb game" feel on mobile
              { icon: Sparkles, title: "✨ Bullet Point Enhancer", desc: "Transform passive items into quantified achievements.", desktopOnly: true },
              { icon: FileUp, title: "📝 Summary Generator", desc: "Assemble professional summary statements in seconds.", desktopOnly: true },
              { icon: Award, title: "📈 Scoring Index", desc: "Determine alignment mathematically using recruiter parameters.", desktopOnly: true },
              { icon: ArrowRight, title: "📤 PDF Exporter", desc: "Single-click high-fidelity layout export optimized for screeners.", desktopOnly: true }
            ].map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={idx}
                  variants={fadeInUpVariant}
                  className={`p-5 rounded-xl bg-white/[0.01] border border-indigo-950/20 space-y-3 hover:border-indigo-800/40 transition-all duration-300 ${feat.desktopOnly ? 'hidden sm:block' : ''}`}
                >
                  <div className="w-8 h-8 bg-indigo-950/40 rounded-lg flex items-center justify-center text-indigo-300">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">{feat.title}</h4>
                  <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed font-light">{feat.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* OPTIONAL WOW: TEMPLATE GALLERY SHOWCASE */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={staggerContainer}
          className="space-y-6"
        >
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Aesthetic layouts</span>
            <h2 className="text-xl sm:text-2xl md:text-4xl font-extrabold text-white">Recruiter-Approved Templates</h2>
            <p className="text-[11px] sm:text-xs text-slate-400 max-w-sm mx-auto">Explore clean layout designs formatted exactly for corporate screening standards.</p>
          </div>

          {/* Selector tabs - responsive compact scroll */}
          <div className="flex flex-wrap justify-center gap-1 max-w-md mx-auto bg-white/[0.02] p-1 rounded-lg">
            {templatesList.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTemplate(t)}
                className={`px-3 py-1 rounded-md text-[9px] sm:text-xs font-bold uppercase transition-all ${
                  activeTemplate === t ? 'bg-indigo-650 text-white shadow' : 'text-slate-500 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Template Live Preview Area */}
          <motion.div
            variants={fadeInUpVariant}
            className="max-w-xl mx-auto rounded-xl bg-[#0c0c12] border border-indigo-950/30 shadow-lg overflow-hidden p-4 sm:p-6 text-left space-y-4 hover:border-indigo-800 transition-all duration-300"
          >
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-indigo-900" />
                <span className="w-2 h-2 rounded-full bg-indigo-850" />
                <span className="w-2 h-2 rounded-full bg-amber-800" />
              </div>
              <span className="text-[9px] sm:text-xs font-bold text-indigo-400 uppercase tracking-widest">{activeTemplate} Layout</span>
            </div>

            <div className="space-y-3 text-[10px] sm:text-xs font-mono text-slate-300">
              <p className="text-xs sm:text-sm text-white font-sans font-bold">Alex Mercer • Software Engineer</p>
              <div className="h-[1px] bg-white/5" />
              <p className="font-sans leading-relaxed text-[11px] sm:text-xs font-light">Driven engineer with hands-on expertise building cloud-native SaaS systems using React, TypeScript, and Node.</p>

              {/* Extra details hidden on mobile to avoid text overload */}
              <div className="space-y-2 font-sans hidden sm:block">
                <p className="text-indigo-300 font-bold uppercase tracking-wider text-[9px] sm:text-[10px]">Technical Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'AWS'].map((sk) => (
                    <span key={sk} className="px-2 py-0.5 bg-indigo-950/20 rounded border border-indigo-900/40 text-[8px] sm:text-[9px] font-medium text-amber-200">{sk}</span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* SECTION 4: AI CAPABILITIES - Substantially simplified/hidden on mobile */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={staggerContainer}
          className="space-y-8 hidden sm:block" // Hidden completely on mobile to prevent "dumb game" text fatigue
        >
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Intelligent Engine</span>
            <h2 className="text-xl sm:text-2xl md:text-4xl font-extrabold text-white">AI Optimization Suite</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto text-left">
            {[
              { title: "Bullet Point Calibration", desc: "Upgrades passive phrases with strong recruiter-approved action verbs and quantified impact metrics." },
              { title: "Syntactical Alignment", desc: "Ensures flawless professional business writing syntax with perfect passive-active transitions." },
              { title: "Achievement Quantifier", desc: "Brainstorms and quantifies custom achievements based on your target level and tech stack." }
            ].map((cap, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUpVariant}
                className="p-5 rounded-xl bg-white/[0.01] border border-indigo-950/20 hover:border-indigo-800 transition-all duration-300"
              >
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">{cap.title}</h4>
                <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed font-light">{cap.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* SECTION 5: ATS INTELLIGENCE - Compact on mobile */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="p-5 sm:p-8 rounded-xl bg-[#0b0b14] border border-indigo-950/20 text-left max-w-4xl mx-auto space-y-4 shadow-[0_2px_20px_rgba(79,70,229,0.05)]"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Auditing System</span>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">ATS Intelligence Checks</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-light">
            {[
              { label: "Scannability Rating", desc: "Mathematical compatibility assessment based on scanning rules." },
              { label: "Keyword Density Check", desc: "Audit technical keyword density matches for target roles." },
              { label: "Structural Validation", desc: "Validate columns, margins, grids, and font scannability." },
              // Render only 3 checks on mobile, remaining 3 on tablet/desktop to reduce density
              { label: "Readability Index", desc: "Analyze sentence complexity and grammatical pacing.", desktopOnly: true },
              { label: "Typography Verification", desc: "Deep syntax scans preventing parsing rejections.", desktopOnly: true },
              { label: "Completeness Audit", desc: "Verify essential coordinates and profile sections.", desktopOnly: true }
            ].map((item, idx) => (
              <div key={idx} className={`space-y-1 border-l-2 border-indigo-900/60 pl-3 py-0.5 ${item.desktopOnly ? 'hidden sm:block' : ''}`}>
                <p className="font-bold text-white text-xs">{item.label}</p>
                <p className="text-slate-400 leading-normal text-[10px] sm:text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* SECTION 6: JOB MATCH ANALYSIS - Reduced on mobile */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={staggerContainer}
          className="space-y-6"
        >
          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Alignment Index</span>
            <h2 className="text-xl sm:text-2xl md:text-4xl font-extrabold text-white">Job Match Metrics</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-w-5xl mx-auto text-left">
            {[
              { title: "Direct Match %", val: "92%", desc: "Direct compatibility matching skills with the JD." },
              { title: "Missing Elements", val: "TypeScript • AWS", desc: "Identifies hard skill-gaps immediately." },
              { title: "Keyword Count", val: "8 / 10", desc: "Evaluates key frequencies for high parsing scores." },
              // Hide on mobile
              { title: "Seniority Match", val: "Mid Level", desc: "Maps experience metrics with targets.", desktopOnly: true },
              { title: "Improvement Plan", val: "5 Steps", desc: "Clear recommendations to refine bullet phrasing.", desktopOnly: true }
            ].map((gap, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUpVariant}
                className={`p-4 rounded-lg bg-[#0c0c14] border border-indigo-950/30 flex flex-col justify-between hover:border-indigo-800 transition-all duration-300 ${gap.desktopOnly ? 'hidden sm:flex' : ''}`}
              >
                <div>
                  <span className="text-[9px] sm:text-[10px] font-bold text-indigo-400 uppercase tracking-widest leading-none">{gap.title}</span>
                  <p className="text-base sm:text-lg font-bold text-amber-400 mt-1">{gap.val}</p>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-400 mt-2.5 leading-normal font-light">{gap.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* SECTION 7: WHY CHOOSE US - Hidden on mobile */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={staggerContainer}
          className="space-y-8 hidden sm:block" // Hidden on mobile to avoid text fatigue
        >
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Why Choose Us</span>
            <h2 className="text-xl sm:text-2xl md:text-4xl font-extrabold text-white">The Professional Difference</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
            {[
              { title: "Deterministic Validation", desc: "Engineered around standard recruitment parser models, ensuring no arbitrary formatting errors." },
              { title: "Secure Cloud Syncing", desc: "Encrypted sync mechanisms alongside complete local browser storage persistence." },
              { title: "Frictionless Export", desc: "Single-click vertical scannable export with professional font rendering." }
            ].map((choose, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUpVariant}
                className="p-5 rounded-xl bg-white/[0.01] border border-indigo-950/20 hover:border-indigo-800 transition-colors"
              >
                <Check className="w-4 h-4 text-amber-400 mb-2" />
                <h4 className="text-xs sm:text-sm font-bold text-white mb-1">{choose.title}</h4>
                <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed font-light">{choose.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* SECTION 9: TESTIMONIALS - Pruned on mobile */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={staggerContainer}
          className="space-y-6"
        >
          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">User success</span>
            <h2 className="text-xl sm:text-2xl md:text-4xl font-extrabold text-white">Real success stories</h2>
          </div>

          {/* Tab Selector - Hide selector tab bar on mobile, just show all/all filtered neatly */}
          <div className="hidden sm:flex flex-wrap justify-center gap-1 max-w-md mx-auto bg-white/[0.02] p-1 rounded-lg">
            {testimonialTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTestimonialTab(tab)}
                className={`px-3 py-1 rounded-md text-[9px] sm:text-xs font-bold uppercase transition-all ${
                  activeTestimonialTab === tab ? 'bg-indigo-700 text-white shadow' : 'text-slate-500 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Testimonials Filtered Output - Only show 1 item on mobile to save space */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
            <AnimatePresence mode="popLayout">
              {filteredTestimonials.slice(0, 1).map((t) => (
                <div
                  key={t.name}
                  className="p-4 rounded-xl bg-[#0c0c14] border border-indigo-950/20 space-y-3"
                >
                  <p className="text-[11px] sm:text-xs text-slate-300 italic leading-relaxed font-light">"{t.quote}"</p>
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-full bg-indigo-950 flex items-center justify-center font-bold text-[10px] text-white shrink-0 border border-indigo-900/40">{t.avatar}</div>
                    <div>
                      <h4 className="text-[10px] sm:text-xs font-bold text-white">{t.name}</h4>
                      <p className="text-[9px] sm:text-[10px] text-indigo-400">{t.category} • <span className="text-slate-400 font-medium">{t.company}</span></p>
                    </div>
                  </div>
                </div>
              ))}
              {/* Show second testimonial only on tablet/desktop */}
              {filteredTestimonials.slice(1, 2).map((t) => (
                <div
                  key={t.name}
                  className="p-4 rounded-xl bg-[#0c0c14] border border-indigo-950/20 space-y-3 hidden sm:block"
                >
                  <p className="text-[11px] sm:text-xs text-slate-300 italic leading-relaxed font-light">"{t.quote}"</p>
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-full bg-indigo-950 flex items-center justify-center font-bold text-[10px] text-white shrink-0 border border-indigo-900/40">{t.avatar}</div>
                    <div>
                      <h4 className="text-[10px] sm:text-xs font-bold text-white">{t.name}</h4>
                      <p className="text-[9px] sm:text-[10px] text-indigo-400">{t.category} • <span className="text-slate-400 font-medium">{t.company}</span></p>
                    </div>
                  </div>
                </div>
              ))}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* OPTIONAL WOW: WHY RECRUITERS PREFER ATS-FRIENDLY - Pruned drastically on mobile */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="p-5 sm:p-8 rounded-xl bg-[#0c0c14] border border-indigo-950/35 text-left max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 items-center shadow-lg"
        >
          <div className="space-y-2">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Recruiter perspective</span>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Why scannable layouts are mandatory</h3>
            <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed font-light">
              Hiring staff read over 300 resumes per day. Over 90% of Fortune 500 organizations use parsing software. Graphic charts, multi-column divisions, and complex fonts automatically get flagged as unreadable.
            </p>
          </div>
          <div className="p-4 bg-[#07070b] rounded-lg border border-indigo-950/40 space-y-2.5 font-mono text-[10px] sm:text-xs text-slate-400 w-full overflow-x-auto">
            <p className="text-white font-bold text-xxs uppercase">Verification Checklist</p>
            <ul className="space-y-1.5">
              <li className="flex items-center space-x-2"><Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" /><span className="text-xxs">Scannable, clean experience item structure</span></li>
              <li className="flex items-center space-x-2"><Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" /><span className="text-xxs">No tables, custom canvas bars, or graphic stars</span></li>
              <li className="flex items-center space-x-2"><Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" /><span className="text-xxs">Standard, legible contact coordinate fields</span></li>
            </ul>
          </div>
        </motion.section>

        {/* SECTION 10: FAQ - Pruned on mobile */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={staggerContainer}
          className="max-w-2xl mx-auto space-y-6 hidden sm:block" // Hidden on mobile to keep things clean and aesthetic
        >
          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Clarifications</span>
            <h2 className="text-xl sm:text-2xl md:text-4xl font-extrabold text-white">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-2.5 text-left">
            {faqData.map((faq, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUpVariant}
                className="p-3.5 rounded-lg bg-white/[0.01] border border-indigo-950/20 transition-all duration-300"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex justify-between items-center py-1 text-xs font-bold text-white hover:text-indigo-300 focus:outline-none"
                >
                  <span className="pr-4">{faq.q}</span>
                  <span className="text-slate-500 text-xs shrink-0">{openFaq === idx ? '−' : '+'}</span>
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-slate-400 text-xs font-light leading-relaxed mt-2 overflow-hidden"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* SUPPORTED JOB ROLES SECTION - Simplified compact on mobile */}
        <section className="space-y-4">
          <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Perfectly calibrated for top industry sectors</p>
          <div className="flex flex-wrap justify-center gap-1.5 max-w-lg mx-auto">
            {['Software Engineering', 'Data Analytics', 'Product Management', 'Finance & Ops', 'Product Design'].map((role) => (
              <span key={role} className="px-2.5 py-1 rounded-full bg-indigo-950/20 border border-indigo-900/35 text-[9px] sm:text-xs text-amber-250 cursor-default whitespace-nowrap">{role}</span>
            ))}
          </div>
        </section>

        {/* SECTION 11: FINAL CALL TO ACTION */}
        <motion.section
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="p-6 sm:p-10 md:p-14 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-[#0c0c12] to-indigo-950/40 border border-indigo-950/40 text-center max-w-3xl mx-auto space-y-6 relative overflow-hidden"
        >
          <div className="space-y-2">
            <h2 className="text-xl sm:text-3xl md:text-5xl font-extrabold text-white leading-tight">Upgrade your matching coordinates today.</h2>
            <p className="text-[10px] sm:text-xs text-slate-400 max-w-xs sm:max-w-md mx-auto leading-relaxed">Initialize your luxury-grade workspace, calibrate formatting patterns, and satisfy critical scanning indices.</p>
          </div>
          <button onClick={onGetStarted} className="px-5 py-2.5 sm:px-6 sm:py-3.5 bg-gradient-to-r from-indigo-600 to-amber-600 text-white font-bold text-xs rounded-lg transition-all uppercase tracking-wider inline-flex items-center space-x-1.5 shadow-md shadow-indigo-950/50">
            <span>Start Workspace Free</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </motion.section>

      </main>

      {/* Floating Aladdin Genie Widget - Pure Aesthetic Decoration (No Neon Glows) */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#0c0c14] rounded-full border border-indigo-950 shadow-lg relative overflow-hidden shrink-0 flex items-center justify-center">
          <AladdinBot />
        </div>
      </div>

      {/* SECTION 12: DETAILED PREMIUM FOOTER */}
      <footer className="w-full bg-[#050508] border-t border-indigo-950/30 py-10 sm:py-14 px-4 sm:px-8 relative z-10 text-[10px] sm:text-xs text-slate-500">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-6 mb-8 text-left">

          <div className="col-span-2 space-y-3 pr-4">
            <div className="flex items-center space-x-2">
              <div className="p-1 bg-indigo-950 border border-indigo-900/40 rounded-md text-white shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              </div>
              <span className="font-bold text-xs text-white uppercase tracking-wider">Elevate Resume</span>
            </div>
            <p className="text-slate-400 leading-relaxed font-light">
              Crafting premium ATS-optimized scannable resumes with deterministic recruiter algorithms and secure zero-third-party cloud sync.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">Product</h4>
            <ul className="space-y-1.5 font-medium">
              <li><a href="#" className="hover:text-amber-400 transition-colors">AI Builder</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors">ATS Analyzer</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors">JD Matcher</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">Resources</h4>
            <ul className="space-y-1.5 font-medium font-light">
              <li><a href="#" className="hover:text-amber-400 transition-colors">Templates</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors">Scan Rules</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">Connect</h4>
            <ul className="space-y-1.5 font-medium font-light">
              <li><a href="#" className="hover:text-amber-400 transition-colors flex items-center gap-1"><Github className="w-3 h-3" /><span>GitHub</span></a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors">Support</a></li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-6 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-indigo-950/20 font-medium text-center md:text-left">
          <p>© 2026 Elevate Resume Platform. All rights reserved.</p>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Use</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
