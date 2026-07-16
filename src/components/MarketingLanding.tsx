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
      return `Wow, an ATS rating of ${score}%! Honestly, you're a major catch. Recruiters would be crazy to skip you. Let's make this official, marry your workspace already!`;
    }
    if (score >= 60) {
      return `Ooh, ${score}%! Not bad at all, you definitely have some high-quality charm. With just a little polish, we'll have everyone chasing after you.`;
    }
    if (score >= 45) {
      return `Mmm, ${score}%... We need to talk. Your ex ignored your potential, let's not let hiring managers do the exact same thing to you. Let me fix you.`;
    }
    return `An ATS rating of ${score}%... Ouch. 💔 This is a critical SOS. But don't panic, your Jin is here to sweep you off your feet and fix this immediately!`;
  };

  const processUploadedFile = async (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['pdf', 'docx', 'jpg', 'jpeg', 'png'];
    if (!validExtensions.includes(extension || '')) {
      setUploadError('Wait, let\'s stay compatible! Please upload PDF, DOCX, or JPG/PNG image formats only.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('That\'s a hefty document! Let\'s keep it under 10MB.');
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
      setUploadError(err.message || 'Parser is temporarily resting in its lamp. Ensure server is online!');
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
    { q: "How is Elevate different from normal LLMs like ChatGPT?", a: "ChatGPT hallucinates achievements, messes up complex PDF parsing grids, and is blind to real ATS density parsing filters. Elevate uses deterministic recruiter-designed algorithms for scoring, and custom Gemini API guardrails to rewrite sections without hallucinating." },
    { q: "Is my resume data secure?", a: "100% secure. Your resume information is cached entirely in your local browser instance via secure LocalStorage and we enforce robust, zero-third-party encrypted cloud sync policies." },
    { q: "What resume formats do you support?", a: "We support PDF, DOCX, as well as JPG, PNG, and JPEG image resumes. We'll automatically extract metadata, structure it, and grade it instantly." },
    { q: "Can I export my finished resume to PDF?", a: "Yes! Elevate features a lightning-fast, high-fidelity PDF exporter that matches exact standard recruiter formatting layout standards perfectly." }
  ];

  const testimonials = [
    { name: 'Kylie Jen', category: 'Students', company: 'Stanford University', quote: 'Elevate landed me my summer internship at Apple! The bullet point enhancement recommended exactly what technical keywords I was missing.', avatar: 'KJ' },
    { name: 'Anish Patil', category: 'Freshers', company: 'New Grad', quote: 'As a fresher, I had almost zero achievements on paper. Elevate helped me turn my basic university homework projects into quantified engineering highlights.', avatar: 'AP' },
    { name: 'Devon Cole', category: 'Software Engineers', company: 'Netflix', quote: 'The ATS compatibility checklist is magic. I got my resume up to a 95% rating and secured four tech interviews in two weeks.', avatar: 'DC' },
    { name: 'Sarah Miller', category: 'Recruiters', company: 'Google Partner', quote: 'We instantly reject resumes built with basic ChatGPT formatting because they clog up our ATS parsers. Resumes built with Elevate pass flawlessly.', avatar: 'SM' },
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
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 60, damping: 15 }
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden bg-[#05050C] text-slate-100 transition-colors duration-300 font-sans">

      {/* Cosmic Stars Dynamic Mesh */}
      <CanvasVisualizer intensity="high" reduceMotion={reduceMotion} />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-[#05050C]/75 backdrop-blur-2xl border-b border-white/5 h-18 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] shrink-0">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-200" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-sm sm:text-lg text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300 whitespace-nowrap">Elevate Resume</span>
            <span className="text-[8px] sm:text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Genie Edition</span>
          </div>
        </div>
        <div className="flex items-center space-x-3 sm:space-x-5">
          <button onClick={onLogin} className="text-xs sm:text-sm font-bold text-slate-400 hover:text-white transition-colors">Sign In</button>
          <button onClick={onGetStarted} className="px-3 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 text-white font-black text-[10px] sm:text-xs rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all uppercase tracking-wider">Build Workspace</button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow space-y-20 sm:space-y-28 md:space-y-36 py-10 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full relative z-10 text-center">

        {/* SECTION 1: HERO */}
        <section className="space-y-6 sm:space-y-8 max-w-3xl mx-auto pt-4">
          <div className="inline-flex items-center space-x-2 bg-indigo-950/40 text-indigo-300 px-3.5 py-1.5 rounded-full border border-indigo-500/30 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest animate-pulse max-w-full">
            <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="truncate">AI Resume Builder • ATS Analyzer • Job Tailoring</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-white leading-none tracking-tight">
            Elevate your career. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-pink-400 to-cyan-400 animate-gradient">
              Outperform boring LLMs.
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 font-light max-w-2xl mx-auto leading-relaxed">
            Stop pasting raw prompts into ChatGPT. Elevate combines <span className="text-cyan-400 font-semibold">deterministic recruiter rules</span> and custom Gemini optimization to audit, rate, and tailor your resume flawlessly.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-3.5 max-w-md mx-auto w-full">
            <button onClick={onGetStarted} className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-black text-[11px] sm:text-xs rounded-xl shadow-xl uppercase tracking-wider flex items-center justify-center space-x-2">
              <span>Create Free Resume</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* Live Statistics Block */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center max-w-4xl mx-auto">
          <div className="p-4 sm:p-6 bg-white/5 border border-white/5 backdrop-blur-md rounded-2xl">
            <p className="text-2xl sm:text-3xl font-black text-cyan-400">10K+</p>
            <p className="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Resumes Created</p>
          </div>
          <div className="p-4 sm:p-6 bg-white/5 border border-white/5 backdrop-blur-md rounded-2xl">
            <p className="text-2xl sm:text-3xl font-black text-pink-400">95%</p>
            <p className="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">ATS Accuracy</p>
          </div>
          <div className="p-4 sm:p-6 bg-white/5 border border-white/5 backdrop-blur-md rounded-2xl">
            <p className="text-2xl sm:text-3xl font-black text-indigo-400">100+</p>
            <p className="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Templates Built</p>
          </div>
          <div className="p-4 sm:p-6 bg-[#0c0c1b] border border-cyan-500/10 rounded-2xl shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <p className="text-2xl sm:text-3xl font-black text-yellow-400">{counter}</p>
            <p className="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">AI Ratings Today</p>
          </div>
        </section>

        {/* SECTION FOR UPLOADING */}
        <div id="dropzone-element" className="w-full max-w-2xl mx-auto space-y-6">
          <AnimatePresence mode="wait">
            {!analysisResult ? (
              <motion.div
                key="dropzone"
                className="relative rounded-3xl p-0.5 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 hover:from-indigo-500/40 transition-all duration-700"
              >
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`relative rounded-[22px] bg-[#0c0c16]/95 p-6 sm:p-10 md:p-14 text-center transition-all ${
                    dragActive ? 'bg-[#0f0f22]/90' : ''
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
                    <div className="space-y-6 py-6 flex flex-col items-center">
                      <div className="relative w-12 h-12 sm:w-16 sm:h-16">
                        <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping" />
                        <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-indigo-500 border-t-cyan-400 rounded-full animate-spin" />
                      </div>
                      <p className="text-xs sm:text-sm font-black text-white">Genie is analyzing your scroll... No forms required!</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400 mx-auto" />
                      <div className="space-y-2">
                        <h3 className="text-lg sm:text-xl font-bold text-white">Drop your resume scroll here</h3>
                        <p className="text-[11px] sm:text-xs text-slate-400 max-w-sm mx-auto">Supports PDF, DOCX, and JPG/PNG resume formats. Drag and drop to immediately see your rating.</p>
                      </div>
                      <label htmlFor="frictionless-file-upload" className="inline-flex items-center space-x-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-white hover:bg-slate-100 text-slate-900 text-xs font-black rounded-xl cursor-pointer shadow-lg uppercase tracking-wider">
                        <span>Select File</span>
                        <ArrowRight className="w-4 h-4" />
                      </label>
                    </div>
                  )}

                  {uploadError && (
                    <div className="mt-4 p-3 bg-red-950/40 border border-red-500/30 text-red-300 text-xs rounded-xl flex items-center justify-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="rating-card"
                className="relative rounded-3xl p-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 shadow-2xl"
              >
                <div className="rounded-[22px] bg-[#0b0b14] p-6 sm:p-8 md:p-12 text-center space-y-6 sm:space-y-8 relative overflow-hidden">
                  <h3 className="text-xl sm:text-2xl font-black text-white">Your Premium Profile Rating</h3>
                  <div className="flex justify-center">
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
                        <circle cx="50" cy="50" r="40" fill="transparent" strokeDasharray={2 * Math.PI * 40} strokeDashoffset={2 * Math.PI * 40 * (1 - analysisResult.score / 100)} strokeWidth="7" strokeLinecap="round" className="stroke-cyan-400" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl sm:text-3xl font-black text-white">{analysisResult.score}%</span>
                        <span className="text-[7px] sm:text-[8px] font-bold uppercase text-slate-400">Match Aura</span>
                      </div>
                    </div>
                  </div>

                  <div className="max-w-md mx-auto p-3.5 sm:p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">"{analysisResult.pickupLine}"</p>
                  </div>

                  {/* Locked Recruiter Diagnostic Preview */}
                  <div className="relative border border-white/5 bg-white/[0.01] rounded-2xl p-6 overflow-hidden">
                    {/* Blurry report blocks */}
                    <div className="filter blur-[5px] select-none pointer-events-none space-y-4 text-left">
                      <div>
                        <span className="text-xxs font-bold text-red-400 uppercase">⚠️ Recruiter Rejection Risk (Critical)</span>
                        <p className="text-xs text-slate-300 mt-1">This resume is at high risk of automatic rejection because of passive phrasing and non-ATS compliant section headings...</p>
                      </div>
                      <div className="h-px bg-white/5" />
                      <div>
                        <span className="text-xxs font-bold text-amber-400 uppercase">🔍 Found 14 Red-flag Buzzwords</span>
                        <p className="text-xs text-slate-300 mt-1">Found words like "dynamic", "motivated", "detail-oriented" which weaken impact. Passive phrasing identified in experience section...</p>
                      </div>
                    </div>

                    {/* Locking Glassmorphic Overlay */}
                    <div className="absolute inset-0 bg-[#0b0b14]/75 backdrop-blur-sm flex flex-col items-center justify-center p-4">
                      <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400 mb-2.5">
                        <Shield className="w-5 h-5 animate-pulse" />
                      </div>
                      <p className="text-xs sm:text-sm font-extrabold text-white">Recruiter Report Locked</p>
                      <p className="text-[10px] sm:text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                        To protect privacy and unlock the full breakdown of rejection reasons, missing skills, and improvement advice, please log in first.
                      </p>
                    </div>
                  </div>

                  <button onClick={claimWorkspace} className="w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-black text-xs rounded-xl shadow-xl uppercase tracking-wider flex items-center justify-center space-x-2 mx-auto">
                    <span>Create Account & Unlock Full Report</span>
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

        {/* SECTION 2: CORE FEATURES */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={staggerContainer}
          className="space-y-10 sm:space-y-14"
        >
          <div className="text-center space-y-3">
            <span className="text-xs sm:text-sm font-black text-cyan-400 uppercase tracking-widest">Built for Perfection</span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white">Core Platform Features</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 text-left">
            {[
              { icon: Cpu, title: "🤖 AI Resume Builder", desc: "Interactive workspace powered by Gemini API to construct beautiful, robust, section-perfect resumes." },
              { icon: FileText, title: "📄 Resume Analyzer", desc: "Automated parser auditing that checks formatting grids, keyword density indexes, and grammar alignment." },
              { icon: Target, title: "🎯 ATS Checker", desc: "Verify formatting consistency, missing technical keywords, and structural requirements instantly." },
              { icon: ListFilter, title: "🔍 JD Matcher", desc: "Paste any target job description and get immediate, itemized technical skill-gap feedback." },
              { icon: Sparkles, title: "✨ AI Content Enhancer", desc: "Transform passive sentences into highly punchy, results-focused quantified achievements." },
              { icon: FileUp, title: "📝 Summary Generator", desc: "Generate premium professional summary profiles optimized with action verbs in seconds." },
              { icon: Award, title: "📈 Resume Score", desc: "Get an analytical 0-100 score detailing exactly how aligned you are with hiring standards." },
              { icon: ArrowRight, title: "📤 PDF Export", desc: "High-fidelity single-click export optimized for applicant tracking scanners." }
            ].map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={idx}
                  variants={fadeInUpVariant}
                  className="p-5 sm:p-6 rounded-2xl bg-[#0c0c16]/50 border border-white/10 backdrop-blur-xl space-y-3.5 hover:border-indigo-500/40 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] transition-all duration-300"
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 bg-indigo-500/10 rounded-xl flex items-center justify-center text-cyan-400">
                    <Icon className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-white">{feat.title}</h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">{feat.desc}</p>
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
          className="space-y-10 sm:space-y-14"
        >
          <div className="text-center space-y-3">
            <span className="text-xs sm:text-sm font-black text-cyan-400 uppercase tracking-widest">Aesthetic layouts</span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white">Recruiter-Approved Templates</h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">Explore premium grid options optimized for top applicant tracking algorithms.</p>
          </div>

          {/* Selector tabs */}
          <div className="flex flex-wrap justify-center gap-1.5 max-w-lg mx-auto bg-white/5 p-1 rounded-xl">
            {templatesList.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTemplate(t)}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-[10px] sm:text-xs font-black uppercase transition-all ${
                  activeTemplate === t ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Template Live Preview Area */}
          <motion.div
            variants={fadeInUpVariant}
            className="max-w-2xl mx-auto rounded-2xl bg-[#0c0c16]/70 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden p-5 sm:p-8 text-left space-y-4 sm:space-y-5 hover:border-cyan-500/30 transition-all duration-300"
          >
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-indigo-400 uppercase tracking-widest">{activeTemplate} Layout Preview</span>
            </div>

            <div className="space-y-3.5 text-xxs sm:text-xs font-mono text-slate-300">
              <p className="text-xs sm:text-sm text-white font-sans font-black">Alex Mercer • Software Engineer</p>
              <div className="h-px bg-white/10" />
              <p className="font-sans leading-relaxed text-xs sm:text-sm"><strong>Professional Summary:</strong> Driven engineer with hands-on expertise building cloud-native SaaS systems using React, TypeScript, and Docker.</p>
              <div className="space-y-2 font-sans">
                <p className="text-white font-bold uppercase tracking-wider text-[9px] sm:text-[10px]">Technical Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'AWS'].map((sk) => (
                    <span key={sk} className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-white/5 rounded border border-white/10 text-[8px] sm:text-[9px] font-medium text-slate-200">{sk}</span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* SECTION 4: AI CAPABILITIES */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={staggerContainer}
          className="space-y-10 sm:space-y-14"
        >
          <div className="text-center space-y-3">
            <span className="text-xs sm:text-sm font-black text-cyan-400 uppercase tracking-widest">Intelligent Engine</span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white">AI Capabilities</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 text-left max-w-4xl mx-auto">
            {[
              { title: "Bullet Point Enhancement", desc: "Upgrades passive phrases with strong recruiter-approved action verbs and quantified impact metrics." },
              { title: "Grammar Correction", desc: "Ensures flawless professional business writing syntax with perfect passive-active transitions." },
              { title: "Achievement Generator", desc: "Brainstorms and quantifies custom achievements based on your target level and tech stack." },
              { title: "Resume Rewrite", desc: "Polishes entire sections into refined, premium layouts matching executive prose style." },
              { title: "Keyword Optimization", desc: "Embeds target skills seamlessly within summaries and experience items for high parsing rates." },
              { title: "Professional Summary Generator", desc: "Assembles compelling summary highlights from customized role inputs instantly." }
            ].map((cap, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUpVariant}
                className="p-5 sm:p-6 rounded-2xl bg-[#0c0c16]/50 border border-white/10 backdrop-blur-xl hover:border-indigo-500/30 hover:shadow-[0_0_20px_rgba(99,102,241,0.1)] transition-all duration-300"
              >
                <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-2 text-cyan-300">{cap.title}</h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">{cap.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* SECTION 5: ATS INTELLIGENCE */}
        <motion.section
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="p-5 sm:p-8 md:p-12 rounded-3xl bg-[#0c0c16]/60 border border-white/10 backdrop-blur-2xl text-left max-w-4xl mx-auto space-y-6 sm:space-y-8 shadow-[0_8px_32px_0_rgba(6,182,212,0.05)]"
        >
          <div className="space-y-3">
            <span className="text-xs sm:text-sm font-black text-cyan-400 uppercase tracking-widest">Scan Metrics</span>
            <h3 className="text-xl sm:text-2xl md:text-4xl font-black text-white">ATS Intelligence Radar</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 text-slate-200 text-xs sm:text-sm font-light">
            {[
              { label: "ATS Score Rating", desc: "Deterministic compatibility assessment based on scanning standards." },
              { label: "Missing Keywords Check", desc: "Audit technical keyword density matches for targeted roles." },
              { label: "Formatting Analysis", desc: "Validate columns, tables, grids, and font-scannability." },
              { label: "Readability Index Score", desc: "Analyze sentence length, simplicity, and flow of experience items." },
              { label: "Grammar Check Check", desc: "Deep grammar scan preventing minor typographic rejections." },
              { label: "Section Completeness Check", desc: "Verify essential candidate contact info and coordinate structures." }
            ].map((item, idx) => (
              <div key={idx} className="space-y-1.5 border-l-2 border-indigo-500/30 pl-3.5 py-1">
                <p className="font-bold text-white text-xs sm:text-sm">{item.label}</p>
                <p className="text-slate-300 leading-relaxed text-[11px] sm:text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* SECTION 6: JOB MATCH ANALYSIS */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={staggerContainer}
          className="space-y-10 sm:space-y-14"
        >
          <div className="text-center space-y-3">
            <span className="text-xs sm:text-sm font-black text-cyan-400 uppercase tracking-widest">Alignment Analytics</span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white">Job Match Analysis</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 text-left max-w-5xl mx-auto">
            {[
              { title: "Match Percentage", val: "92%", desc: "Direct compatibility score matching skills to JD requirements." },
              { title: "Missing Skills", val: "TypeScript • AWS", desc: "Pinpoints exactly which hard technical requirements are missing." },
              { title: "Required Keywords", val: "8 / 10", desc: "Evaluates keyword frequency match for high ATS scoring potential." },
              { title: "Experience Gap", val: "Junior level Match", desc: "Analytically maps seniority criteria with your resume milestones." },
              { title: "Suggested Improvements", val: "5 action recommendations", desc: "Actionable, step-by-step guidance to adapt phrasing." }
            ].map((gap, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUpVariant}
                className="p-4 sm:p-5 rounded-xl bg-[#0c0c16]/50 border border-white/10 backdrop-blur-xl flex flex-col justify-between hover:border-indigo-500/30 hover:shadow-[0_0_20px_rgba(99,102,241,0.05)] transition-all duration-300"
              >
                <div>
                  <span className="text-[10px] sm:text-xs font-bold text-indigo-400 uppercase tracking-widest leading-none">{gap.title}</span>
                  <p className="text-base sm:text-xl font-black text-white mt-1.5">{gap.val}</p>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-300 mt-3.5 leading-normal font-light">{gap.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* SECTION 7: WHY CHOOSE US */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={staggerContainer}
          className="space-y-10 sm:space-y-14"
        >
          <div className="text-center space-y-3">
            <span className="text-xs sm:text-sm font-black text-cyan-400 uppercase tracking-widest">Unrivaled Excellence</span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white">Why Choose Our Platform</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 text-left">
            {[
              { title: "AI Powered", desc: "Advanced Gemini model integration offering zero-hallucination, high-fidelity advice." },
              { title: "ATS Optimized", desc: "Engineered around deterministic recruiter-tested grading structures." },
              { title: "Recruiter Approved Templates", desc: "Stunning minimalist layouts designed to catch any hiring manager's eye." },
              { title: "Multiple Resume Versions", desc: "Build, duplicate, and tailor as many active resume versions as you need." },
              { title: "Secure Cloud Storage", desc: "Encrypted local browser persistence alongside premium sync safeguards." },
              { title: "Fast PDF Export", desc: "Export high-resolution scannable PDF documents instantly in one click." }
            ].map((choose, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUpVariant}
                className="p-5 sm:p-6 rounded-2xl bg-[#0c0c16]/50 border border-white/10 backdrop-blur-xl hover:border-indigo-500/30 hover:shadow-[0_0_20px_rgba(99,102,241,0.1)] transition-all duration-300"
              >
                <Check className="w-5 h-5 text-cyan-400 mb-2.5" />
                <h4 className="text-sm sm:text-base font-bold text-white mb-1.5">{choose.title}</h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">{choose.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* SECTION 9: TESTIMONIALS */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={staggerContainer}
          className="space-y-10 sm:space-y-14"
        >
          <div className="text-center space-y-3">
            <span className="text-xs sm:text-sm font-black text-cyan-400 uppercase tracking-widest">User success</span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white">Real success stories</h2>
          </div>

          {/* Tab Selector */}
          <div className="flex flex-wrap justify-center gap-1.5 max-w-lg mx-auto bg-white/5 p-1 rounded-xl">
            {testimonialTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTestimonialTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-black uppercase transition-all ${
                  activeTestimonialTab === tab ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Testimonials Filtered Output */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 max-w-3xl mx-auto text-left">
            <AnimatePresence mode="popLayout">
              {filteredTestimonials.map((t, idx) => (
                <motion.div
                  key={t.name}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="p-5 sm:p-6 rounded-2xl bg-[#0c0c16]/50 border border-white/10 backdrop-blur-xl space-y-3.5 hover:border-indigo-500/40 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] transition-all duration-300"
                >
                  <p className="text-xs sm:text-sm text-slate-200 italic leading-relaxed font-light">"{t.quote}"</p>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center font-bold text-xs text-white shrink-0">{t.avatar}</div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">{t.name}</h4>
                      <p className="text-[10px] sm:text-xs text-slate-300">{t.category} at <span className="text-cyan-400 font-semibold">{t.company}</span></p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* OPTIONAL WOW: WHY RECRUITERS PREFER ATS-FRIENDLY */}
        <motion.section
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="p-5 sm:p-8 md:p-12 rounded-3xl bg-[#0c0c16]/60 border border-indigo-500/20 backdrop-blur-2xl text-left max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-center shadow-2xl"
        >
          <div className="space-y-3">
            <span className="text-xs sm:text-sm font-black text-cyan-400 uppercase tracking-widest">Recruiter perspective</span>
            <h3 className="text-xl sm:text-2xl md:text-4xl font-black text-white">Why recruiters demand ATS-Friendly layouts</h3>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-light">
              Recruiters read over 300 resumes per day. Over 90% of Fortune 500 companies run initial candidates through parsing engines. If your layout features multiple columns, custom graphs, or illegible fonts, you are rejected before a human even lays eyes on your profile.
            </p>
          </div>
          <div className="p-4 sm:p-6 bg-[#05050C]/80 rounded-2xl border border-white/10 backdrop-blur-xl space-y-3 font-mono text-[11px] sm:text-xs text-slate-300 w-full overflow-x-auto">
            <p className="text-white font-bold text-xs uppercase">Scan Checklist</p>
            <ul className="space-y-2 min-w-[220px]">
              <li className="flex items-center space-x-2"><Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400 shrink-0" /><span className="text-xs">Scannable Experience bullet points</span></li>
              <li className="flex items-center space-x-2"><Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400 shrink-0" /><span className="text-xs">Zero tables, graphs, or graphic stars</span></li>
              <li className="flex items-center space-x-2"><Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400 shrink-0" /><span className="text-xs">Parsed contactCoordinates structure</span></li>
            </ul>
          </div>
        </motion.section>

        {/* SECTION 10: FAQ */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={staggerContainer}
          className="max-w-3xl mx-auto space-y-10 sm:space-y-14"
        >
          <div className="text-center space-y-3">
            <span className="text-xs sm:text-sm font-black text-cyan-400 uppercase tracking-widest">Clarifications</span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3 text-left">
            {faqData.map((faq, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUpVariant}
                className="p-4 rounded-xl bg-[#0c0c16]/30 border border-white/5 backdrop-blur-xl transition-all duration-300 hover:border-indigo-500/20 mb-3"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex justify-between items-center py-2 text-xs sm:text-sm font-bold text-white hover:text-cyan-400 transition-colors focus:outline-none"
                >
                  <span className="pr-4">{faq.q}</span>
                  <span className="text-slate-400 text-base shrink-0">{openFaq === idx ? '−' : '+'}</span>
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-slate-300 text-xs sm:text-sm font-light leading-relaxed mt-2 overflow-hidden pl-1"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* SUPPORTED JOB ROLES SECTION */}
        <section className="space-y-6">
          <p className="text-xs sm:text-sm font-black text-slate-500 uppercase tracking-wider">Perfectly catering to top industry paths</p>
          <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
            {['Software Engineer', 'Data Analyst', 'Product Manager', 'Mechanical Engineer', 'Business Analyst', 'Financial Consultant', 'Creative Director', 'Sales Executive'].map((role) => (
              <span key={role} className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] sm:text-xs font-bold text-slate-200 hover:text-white hover:bg-indigo-500/10 hover:border-indigo-500/25 transition-colors cursor-default whitespace-nowrap">{role}</span>
            ))}
          </div>
        </section>

        {/* SECTION 11: FINAL CALL TO ACTION */}
        <motion.section
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="p-6 sm:p-12 md:p-16 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-purple-950/60 to-cyan-950/60 border border-indigo-500/30 backdrop-blur-2xl text-center max-w-4xl mx-auto space-y-6 sm:space-y-8 relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-2xl sm:text-4xl md:text-6xl font-black text-white leading-tight">Upgrade your career match today.</h2>
            <p className="text-xs sm:text-sm text-slate-200 max-w-md mx-auto leading-relaxed">Claim your luxury-grade workspace, fix layout formatting errors, and maximize ATS scanning compatibility indices.</p>
          </div>
          <button onClick={onGetStarted} className="px-6 py-3 sm:px-8 sm:py-4 bg-white hover:bg-slate-100 text-slate-900 font-black text-xs sm:text-sm rounded-xl shadow-xl uppercase tracking-wider inline-flex items-center space-x-2">
            <span>Start Workspace Free</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.section>

      </main>

      {/* Floating Aladdin Genie Widget - Pure Aesthetic Decoration */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-tr from-[#0b0b14] to-[#12122b] rounded-full border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.3)] relative overflow-hidden shrink-0">
          <AladdinBot />
        </div>
      </div>

      {/* SECTION 12: DETAILED PREMIUM FOOTER */}
      <footer className="w-full bg-[#030308] border-t border-white/5 py-12 sm:py-16 px-4 sm:px-6 relative z-10 text-[11px] sm:text-xs text-slate-500">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8 mb-12 text-left">

          <div className="col-span-2 space-y-4 pr-4">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-lg text-white shadow-sm shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="font-extrabold text-xs sm:text-sm text-white uppercase tracking-wider">Elevate Resume</span>
            </div>
            <p className="text-slate-400 leading-relaxed font-light">
              Crafting premium ATS-optimized scannable resumes with deterministic recruiter algorithms and secure zero-hallucination guardrails.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">Product</h4>
            <ul className="space-y-2 font-medium">
              <li><a href="#" className="hover:text-cyan-400 transition-colors">AI Resume Builder</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">ATS Analyzer</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Job Matcher</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">Resources</h4>
            <ul className="space-y-2 font-medium">
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Resume Templates</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Career Blog</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">ATS Scan Rules</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">Connect</h4>
            <ul className="space-y-2 font-medium">
              <li><a href="#" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5"><Github className="w-3.5 h-3.5" /><span>GitHub</span></a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Contact Support</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-6 sm:pt-8 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/5 font-medium text-center md:text-left">
          <p>© 2026 Elevate Resume Platform. All rights reserved. Your ultimate companion.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Terms of Use</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
