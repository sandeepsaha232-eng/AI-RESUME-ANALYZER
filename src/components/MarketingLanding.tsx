import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Award, Briefcase, ChevronRight, FileText, Sparkles, Target, Zap, UploadCloud,
  AlertCircle, ArrowRight, MessageSquare, Send, Check, Paperclip, Star, Info,
  Volume2, Flame, Shield, HelpCircle, Laptop, Settings, Eye, Users, Cpu, FileUp, ListFilter, Play, Github
} from 'lucide-react';
import CanvasVisualizer from './three/CanvasVisualizer';
import AladdinBot from './three/AladdinBot';
import { Resume } from '../types';

// Simple and highly optimized typewriter helper component
function TypewriterText({ text, speed = 20 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    setDisplayed('');
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayed((prev) => prev + text.charAt(index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return <span>{displayed}</span>;
}

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

  // 2. Genie Bot States
  const [botState, setBotState] = useState<'idle' | 'thinking' | 'success' | 'pointing'>('idle');
  const [chatOpen, setChatOpen] = useState(true);
  const [userMsg, setUserMsg] = useState('');
  const [highlightPortal, setHighlightPortal] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'bot'; text: string; hasTypewriter?: boolean }>>([
    { sender: 'bot', text: "Hey! I am your Aladdin Guide Jin. 🔮 How's your life going? Tell me, are you searching for a magical career upgrade or just chatting? Ask me anything, or guide me to read your scrolls!", hasTypewriter: false }
  ]);

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

  // Conversational Handler
  const handleSendMessage = (e?: React.FormEvent, customMsg?: string) => {
    if (e) e.preventDefault();
    const msgToSend = customMsg || userMsg;
    if (!msgToSend.trim()) return;

    const userClean = msgToSend.trim();
    setChatHistory((prev) => [...prev, { sender: 'user', text: userClean }]);
    if (!customMsg) setUserMsg('');
    setBotState('thinking');

    // Simulate thinking delay
    setTimeout(() => {
      const lower = userClean.toLowerCase();
      let reply = "Mmm, that's deep. Life has its waves, but I am here to make sure your career isn't one of those sinking ships! 🚢 Directly upload your PDF, DOCX, or JPG resume in the portal, or right here in the chat, and let's get you set up with a luxurious rating!";

      if (lower.includes('how are you') || lower.includes('how\'s it going') || lower.includes('how is it going')) {
        reply = "I'm floating on cloud nine! ✨ Literally, since my tail is pure glowing neon cosmic energy rising from my magic lamp. How is your life going today, master?";
      } else if (lower.includes('life') || lower.includes('sad') || lower.includes('happy') || lower.includes('struggle') || lower.includes('how is your life')) {
        reply = "My life is bound to this magic lamp, but helping you beat recruiting algorithms is my supreme joy! Tell me, how has your job search been? Hard or smooth?";
      } else if (lower.includes('what is this') || lower.includes('website') || lower.includes('how does this work') || lower.includes('elevate')) {
        reply = "This is Elevate Resume! A cosmic sanctuary where we audit resumes with bulletproof, deterministic recruiter logic and power up highlights with Gemini AI. None of that lazy, hallucinating LLM prompt stuff!";
      } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
        reply = "Hello there, beautiful human! 👋 Ready to cast a magic spell on your career today?";
      } else if (lower.includes('love') || lower.includes('marry') || lower.includes('date')) {
        reply = "Oh my, you're making my neon eyes glow magenta! 😳 I'm extremely flattered, but my true love is auditing bullet points and optimizing ATS scores!";
      } else if (lower.includes('premium') || lower.includes('cost') || lower.includes('price')) {
        reply = "It looks absolutely premium and luxurious, doesn't it? But here's the best part: you can analyze and get rated entirely for free! Let's get started!";
      } else if (lower.includes('how to upload') || lower.includes('guide') || lower.includes('upload') || lower.includes('where to upload')) {
        triggerGuideAnimation();
        return;
      }

      setChatHistory((prev) => [...prev, { sender: 'bot', text: reply, hasTypewriter: true }]);
      setBotState('idle');
    }, 90000 / 90);
  };

  const triggerGuideAnimation = () => {
    setBotState('pointing');
    setHighlightPortal(true);
    setChatHistory((prev) => [
      ...prev,
      {
        sender: 'bot',
        text: "LOOK OVER THERE, MASTER! 🌟 I am focusing my cosmic gold energy on the center of the screen! Simply drop your scroll (PDF, DOCX, or JPG/PNG image resume) right into that glowing portal, or click 'Select File' to begin our magical evaluation!",
        hasTypewriter: true,
      },
    ]);

    setTimeout(() => {
      setHighlightPortal(false);
      setBotState('idle');
    }, 4500);
  };

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
    setBotState('thinking');
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/v1/resumes/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await response.json();
      if (!response.ok || json.error) {
        throw new Error(json.error?.message || 'Genie magic hiccuped while parsing.');
      }

      const { resume, analysis } = json.data;
      const score = analysis.atsScore;

      setAnalysisResult({
        score,
        pickupLine: getCheekyPickupLine(score),
        parsedResume: resume,
      });

      setBotState('success');
      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `Incredible! I finished evaluating your resume. It scores ${score}%. ${getCheekyPickupLine(score).split('.')[0]}. Check out your gorgeous profile rating card on the screen! 👇`,
          hasTypewriter: true,
        },
      ]);
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || 'Parser is temporarily resting in its lamp. Ensure server is online!');
      setBotState('idle');
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

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden bg-[#05050C] text-slate-100 transition-colors duration-300 font-sans">

      {/* Cosmic Stars Dynamic Mesh */}
      <CanvasVisualizer intensity="high" reduceMotion={reduceMotion} />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-[#05050C]/75 backdrop-blur-2xl border-b border-white/5 h-18 flex items-center justify-between px-6">
        <div className="flex items-center space-x-3 cursor-pointer">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]">
            <Sparkles className="w-5 h-5 text-cyan-200" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">Elevate Resume</span>
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Genie Edition</span>
          </div>
        </div>
        <div className="flex items-center space-x-5">
          <button onClick={onLogin} className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Sign In</button>
          <button onClick={onGetStarted} className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 text-white font-black text-xs rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all uppercase tracking-wider">Build Workspace</button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow space-y-32 py-16 px-6 max-w-7xl mx-auto w-full relative z-10 text-center">

        {/* SECTION 1: HERO */}
        <section className="space-y-8 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-indigo-950/40 text-indigo-300 px-4 py-1.5 rounded-full border border-indigo-500/30 text-[10px] font-extrabold uppercase tracking-widest animate-pulse">
            <Zap className="w-4.5 h-4.5 text-cyan-400" />
            <span>AI Resume Builder • ATS Analyzer • Job Tailoring</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white leading-none tracking-tight">
            Elevate your career. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-pink-400 to-cyan-400">
              Outperform boring LLMs.
            </span>
          </h1>

          <p className="text-lg text-slate-300 font-light max-w-2xl mx-auto leading-relaxed">
            Stop pasting raw prompts into ChatGPT. Elevate combines <span className="text-cyan-400 font-semibold">deterministic recruiter rules</span> and custom Gemini optimization to audit, rate, and tailor your resume flawlessly.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4 max-w-md mx-auto">
            <button onClick={onGetStarted} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-black text-xs rounded-xl shadow-xl uppercase tracking-wider flex items-center justify-center space-x-2">
              <span>Create Free Resume</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={triggerGuideAnimation} className="w-full py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs rounded-xl transition-all uppercase tracking-wider flex items-center justify-center space-x-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Ask Genie to Rate</span>
            </button>
          </div>
        </section>

        {/* Live Statistics Block */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center max-w-4xl mx-auto">
          <div className="p-6 bg-white/5 border border-white/5 backdrop-blur-md rounded-2xl">
            <p className="text-3xl font-black text-cyan-400">10K+</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Resumes Created</p>
          </div>
          <div className="p-6 bg-white/5 border border-white/5 backdrop-blur-md rounded-2xl">
            <p className="text-3xl font-black text-pink-400">95%</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">ATS Accuracy</p>
          </div>
          <div className="p-6 bg-white/5 border border-white/5 backdrop-blur-md rounded-2xl">
            <p className="text-3xl font-black text-indigo-400">100+</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Templates Built</p>
          </div>
          <div className="p-6 bg-[#0c0c1b] border border-cyan-500/10 rounded-2xl shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <p className="text-3xl font-black text-yellow-400">{counter}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">AI Ratings Today</p>
          </div>
        </section>

        {/* SECTION FOR UPLOADING */}
        <div className="w-full max-w-2xl mx-auto space-y-6">
          <AnimatePresence mode="wait">
            {!analysisResult ? (
              <motion.div
                key="dropzone"
                className={`relative rounded-3xl p-0.5 transition-all duration-700 ${
                  highlightPortal
                    ? 'bg-gradient-to-r from-yellow-400 via-pink-500 to-yellow-300 scale-105 ring-4 ring-yellow-400/50 shadow-[0_0_40px_rgba(234,179,8,0.4)]'
                    : 'bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 hover:from-indigo-500'
                }`}
              >
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`relative rounded-[22px] bg-[#0c0c16]/95 p-10 md:p-14 text-center transition-all ${
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
                      <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping" />
                        <div className="w-16 h-16 border-4 border-indigo-500 border-t-cyan-400 rounded-full animate-spin" />
                      </div>
                      <p className="text-sm font-black text-white">Genie is analyzing your scroll... No forms required!</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <UploadCloud className="w-10 h-10 text-cyan-400 mx-auto" />
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white">Drop your resume scroll here</h3>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">Supports PDF, DOCX, and JPG/PNG resume formats. Drag and drop to immediately see your rating.</p>
                      </div>
                      <label htmlFor="frictionless-file-upload" className="inline-flex items-center space-x-2 px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 text-xs font-black rounded-xl cursor-pointer shadow-lg uppercase tracking-wider">
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
                className="relative rounded-3xl p-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 shadow-2xl"
              >
                <div className="rounded-[20px] bg-[#0b0b14] p-8 md:p-12 text-center space-y-8 relative overflow-hidden">
                  <h3 className="text-2xl font-black text-white">Your Premium Profile Rating</h3>
                  <div className="flex justify-center">
                    <div className="relative w-32 h-32">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
                        <circle cx="50" cy="50" r="40" fill="transparent" strokeDasharray={2 * Math.PI * 40} strokeDashoffset={2 * Math.PI * 40 * (1 - analysisResult.score / 100)} strokeWidth="7" strokeLinecap="round" className="stroke-cyan-400" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-white">{analysisResult.score}%</span>
                        <span className="text-[8px] font-bold uppercase text-slate-400">Match Aura</span>
                      </div>
                    </div>
                  </div>
                  <div className="max-w-md mx-auto p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">"{analysisResult.pickupLine}"</p>
                  </div>
                  <button onClick={claimWorkspace} className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-black text-xs rounded-xl shadow-xl uppercase tracking-wider flex items-center justify-center space-x-2 mx-auto">
                    <span>Claim Workspace & Fix Resume</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SECTION 2: CORE FEATURES */}
        <section className="space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">Built for Perfection</span>
            <h2 className="text-3xl md:text-4xl font-black text-white">Core Platform Features</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
            {[
              { icon: Cpu, title: "🤖 AI Resume Builder", desc: "Interactive workspace powered by Gemini API to construct beautiful, robust, section-perfect resumes." },
              { icon: FileText, title: "📄 Resume Analyzer", desc: "Automated parser auditing that checks formatting grids, keyword density indexes, and grammar alignment." },
              { icon: Target, title: "🎯 ATS Compatibility Checker", desc: "Verify formatting consistency, missing technical keywords, and structural requirements instantly." },
              { icon: ListFilter, title: "🔍 Job Description Matcher", desc: "Paste any target job description and get immediate, itemized technical skill-gap feedback." },
              { icon: Sparkles, title: "✨ AI Content Enhancer", desc: "Transform passive sentences into highly punchy, results-focused quantified achievements." },
              { icon: FileUp, title: "📝 Resume Summary Generator", desc: "Generate premium professional summary profiles optimized with action verbs in seconds." },
              { icon: Award, title: "📈 Resume Score", desc: "Get an analytical 0-100 score detailing exactly how aligned you are with hiring standards." },
              { icon: ArrowRight, title: "📤 PDF Export", desc: "High-fidelity single-click export optimized for applicant tracking scanners." }
            ].map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md space-y-3 hover:border-indigo-500/30 transition-all">
                  <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center text-cyan-400"><Icon className="w-5 h-5" /></div>
                  <h4 className="text-sm font-bold text-white">{feat.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* OPTIONAL WOW: TEMPLATE GALLERY SHOWCASE */}
        <section className="space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">Aesthetic layouts</span>
            <h2 className="text-3xl md:text-4xl font-black text-white">Recruiter-Approved Templates</h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">Explore premium grid options optimized for top applicant tracking algorithms.</p>
          </div>

          {/* Selector tabs */}
          <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto bg-white/5 p-1 rounded-xl">
            {templatesList.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTemplate(t)}
                className={`px-3 py-1.5 rounded-lg text-xxs font-black uppercase transition-all ${
                  activeTemplate === t ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Template Live Preview Area */}
          <div className="max-w-xl mx-auto rounded-2xl p-0.5 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10 border border-white/10 shadow-xl overflow-hidden bg-slate-950/80 p-8 text-left space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{activeTemplate} Layout Preview</span>
            </div>

            <div className="space-y-4 text-[10px] font-mono text-slate-400">
              <p className="text-xs text-white font-sans font-black">Alex Mercer • Software Engineer</p>
              <div className="h-px bg-white/5" />
              <p className="font-sans leading-relaxed"><strong>Professional Summary:</strong> Driven engineer with hands-on expertise building cloud-native SaaS systems using React, TypeScript, and Docker.</p>
              <div className="space-y-2 font-sans">
                <p className="text-white font-bold uppercase tracking-wider text-[9px]">Technical Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'AWS'].map((sk) => (
                    <span key={sk} className="px-2 py-0.5 bg-white/5 rounded border border-white/5 text-[8px] font-medium text-slate-300">{sk}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: AI CAPABILITIES */}
        <section className="space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">Intelligent Engine</span>
            <h2 className="text-3xl md:text-4xl font-black text-white">AI Capabilities</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-4xl mx-auto">
            {[
              { title: "Bullet Point Enhancement", desc: "Upgrades passive phrases with strong recruiter-approved action verbs and quantified impact metrics." },
              { title: "Grammar Correction", desc: "Ensures flawless professional business writing syntax with perfect passive-active transitions." },
              { title: "Achievement Generator", desc: "Brainstorms and quantifies custom achievements based on your target level and tech stack." },
              { title: "Resume Rewrite", desc: "Polishes entire sections into refined, premium layouts matching executive prose style." },
              { title: "Keyword Optimization", desc: "Embeds target skills seamlessly within summaries and experience items for high parsing rates." },
              { title: "Professional Summary Generator", desc: "Assembles compelling summary highlights from customized role inputs instantly." }
            ].map((cap, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-[#090915] border border-white/5 hover:border-indigo-500/20 transition-all">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 text-cyan-300">{cap.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-light">{cap.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 5: ATS INTELLIGENCE */}
        <section className="p-8 md:p-12 rounded-3xl bg-[#090915] border border-cyan-500/10 text-left max-w-4xl mx-auto space-y-8 shadow-[0_0_30px_rgba(6,182,212,0.05)]">
          <div className="space-y-3">
            <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">Scan Metrics</span>
            <h3 className="text-2xl md:text-3xl font-black text-white">ATS Intelligence Radar</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-slate-300 text-xs font-light">
            {[
              { label: "ATS Score Rating", desc: "Deterministic compatibility assessment based on scanning standards." },
              { label: "Missing Keywords Check", desc: "Audit technical keyword density matches for targeted roles." },
              { label: "Formatting Analysis", desc: "Validate columns, tables, grids, and font-scannability." },
              { label: "Readability Index Score", desc: "Analyze sentence length, simplicity, and flow of experience items." },
              { label: "Grammar Check Check", desc: "Deep grammar scan preventing minor typographic rejections." },
              { label: "Section Completeness Check", desc: "Verify essential candidate contact info and coordinate structures." }
            ].map((item, idx) => (
              <div key={idx} className="space-y-1.5 border-l border-indigo-500/30 pl-4 py-1">
                <p className="font-bold text-white text-xs">{item.label}</p>
                <p className="text-slate-400 leading-relaxed text-[11px]">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6: JOB MATCH ANALYSIS */}
        <section className="space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">Alignment Analytics</span>
            <h2 className="text-3xl md:text-4xl font-black text-white">Job Match Analysis</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-left max-w-5xl mx-auto">
            {[
              { title: "Match Percentage", val: "92%", desc: "Direct compatibility score matching skills to JD requirements." },
              { title: "Missing Skills", val: "TypeScript • AWS", desc: "Pinpoints exactly which hard technical requirements are missing." },
              { title: "Required Keywords", val: "8 / 10", desc: "Evaluates keyword frequency match for high ATS scoring potential." },
              { title: "Experience Gap", val: "Junior level Match", desc: "Analytically maps seniority criteria with your resume milestones." },
              { title: "Suggested Improvements", val: "5 action recommendations", desc: "Actionable, step-by-step guidance to adapt phrasing." }
            ].map((gap, idx) => (
              <div key={idx} className="p-5 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{gap.title}</span>
                  <p className="text-lg font-black text-white mt-1">{gap.val}</p>
                </div>
                <p className="text-[11px] text-slate-400 mt-4 leading-normal font-light">{gap.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 7: WHY CHOOSE US */}
        <section className="space-y-12 max-w-4xl mx-auto">
          <div className="text-center space-y-3">
            <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">Unrivaled Excellence</span>
            <h2 className="text-3xl md:text-4xl font-black text-white">Why Choose Our Platform</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {[
              { title: "AI Powered", desc: "Advanced Gemini model integration offering zero-hallucination, high-fidelity advice." },
              { title: "ATS Optimized", desc: "Engineered around deterministic recruiter-tested grading structures." },
              { title: "Recruiter Approved Templates", desc: "Stunning minimalist layouts designed to catch any hiring manager's eye." },
              { title: "Multiple Resume Versions", desc: "Build, duplicate, and tailor as many active resume versions as you need." },
              { title: "Secure Cloud Storage", desc: "Encrypted local browser persistence alongside premium sync safeguards." },
              { title: "Fast PDF Export", desc: "Export high-resolution scannable PDF documents instantly in one click." }
            ].map((choose, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-[#090915] border border-white/5 hover:border-indigo-500/20 transition-all">
                <Check className="w-5 h-5 text-cyan-400 mb-3" />
                <h4 className="text-sm font-bold text-white mb-1">{choose.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-light">{choose.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 9: TESTIMONIALS */}
        <section className="space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">User success</span>
            <h2 className="text-3xl md:text-4xl font-black text-white">Real success stories</h2>
          </div>

          {/* Tab Selector */}
          <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto bg-white/5 p-1 rounded-xl">
            {testimonialTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTestimonialTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xxs font-black uppercase transition-all ${
                  activeTestimonialTab === tab ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Testimonials Filtered Output */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto text-left">
            {filteredTestimonials.map((t, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md space-y-4 hover:border-indigo-500/35 transition-all">
                <p className="text-xs text-slate-300 italic leading-relaxed font-light">"{t.quote}"</p>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center font-bold text-xs text-white">{t.avatar}</div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{t.name}</h4>
                    <p className="text-[10px] text-slate-400">{t.category} at <span className="text-cyan-400 font-semibold">{t.company}</span></p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* OPTIONAL WOW: WHY RECRUITERS PREFER ATS-FRIENDLY */}
        <section className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-indigo-950/20 to-cyan-950/20 border border-indigo-500/20 text-left max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center shadow-xl">
          <div className="space-y-4">
            <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">Recruiter perspective</span>
            <h3 className="text-2xl md:text-3xl font-black text-white">Why recruiters demand ATS-Friendly layouts</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Recruiters read over 300 resumes per day. Over 90% of Fortune 500 companies run initial candidates through parsing engines. If your layout features multiple columns, custom graphs, or illegible fonts, you are rejected before a human even lays eyes on your profile.
            </p>
          </div>
          <div className="p-6 bg-[#05050C]/90 rounded-2xl border border-white/5 space-y-3 font-mono text-[10px] text-slate-400">
            <p className="text-white font-bold text-xs uppercase">Scan Checklist</p>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2"><Check className="w-3.5 h-3.5 text-green-400" /><span>Scannable Experience bullet points</span></li>
              <li className="flex items-center space-x-2"><Check className="w-3.5 h-3.5 text-green-400" /><span>Zero tables, graphs, or graphic stars</span></li>
              <li className="flex items-center space-x-2"><Check className="w-3.5 h-3.5 text-green-400" /><span>Parsed contactCoordinates structure</span></li>
            </ul>
          </div>
        </section>

        {/* SECTION 10: FAQ */}
        <section className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">Clarifications</span>
            <h2 className="text-3xl md:text-4xl font-black text-white">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4 text-left">
            {faqData.map((faq, idx) => (
              <div key={idx} className="border-b border-white/5 pb-4">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex justify-between items-center py-2.5 text-xs font-bold text-white hover:text-cyan-400 transition-colors focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <span className="text-slate-400 text-lg">{openFaq === idx ? '−' : '+'}</span>
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-slate-400 text-xs font-light leading-relaxed mt-2 overflow-hidden pl-1"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* SUPPORTED JOB ROLES SECTION */}
        <section className="space-y-6">
          <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Perfectly catering to top industry paths</p>
          <div className="flex flex-wrap justify-center gap-2.5 max-w-2xl mx-auto">
            {['Software Engineer', 'Data Analyst', 'Product Manager', 'Mechanical Engineer', 'Business Analyst', 'Financial Consultant', 'Creative Director', 'Sales Executive'].map((role) => (
              <span key={role} className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-slate-300 hover:text-white transition-colors">{role}</span>
            ))}
          </div>
        </section>

        {/* SECTION 11: FINAL CALL TO ACTION */}
        <section className="p-12 md:p-16 rounded-3xl bg-gradient-to-r from-indigo-950 via-purple-950 to-cyan-950 border border-indigo-500/30 text-center max-w-4xl mx-auto space-y-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-3">
            <h2 className="text-3xl md:text-5xl font-black text-white">Upgrade your career match today.</h2>
            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">Claim your luxury-grade workspace workspace, fix layout formatting errors, and maximize ATS scanning compatibility indices.</p>
          </div>
          <button onClick={onGetStarted} className="px-8 py-4 bg-white hover:bg-slate-100 text-slate-900 font-black text-xs rounded-xl shadow-xl uppercase tracking-wider inline-flex items-center space-x-2">
            <span>Start Workspace Free</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>

      </main>

      {/* Floating Aladdin's Jin Guide & Interactive Chat HUD */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-3">
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="w-80 md:w-96 rounded-2xl bg-[#090912]/95 border border-indigo-500/20 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col max-h-[440px] md:max-h-[480px]"
            >
              {/* Chat Title bar */}
              <div className="p-4 bg-indigo-950/40 border-b border-indigo-500/20 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-xs font-black tracking-wide text-white uppercase flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Aladdin's Jin Guide</span>
                  </span>
                </div>
                <button
                  onClick={() => setChatOpen(false)}
                  className="text-slate-400 hover:text-white text-xs font-bold"
                >
                  Hide
                </button>
              </div>

              {/* Chat Log Message Scroller */}
              <div className="flex-grow p-4 overflow-y-auto space-y-3.5 text-xs scrollbar-thin">
                {chatHistory.map((item, index) => (
                  <div
                    key={index}
                    className={`flex ${item.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl leading-relaxed ${
                        item.sender === 'user'
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-white/5 text-slate-200 border border-white/5 rounded-tl-none'
                      }`}
                    >
                      {item.sender === 'bot' && item.hasTypewriter ? (
                        <TypewriterText text={item.text} speed={12} />
                      ) : (
                        <span>{item.text}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Interactive Quick-Action buttons inside the conversation HUD */}
              <div className="p-2 bg-black/40 border-t border-white/5 flex flex-wrap gap-1.5 justify-center">
                <button
                  onClick={triggerGuideAnimation}
                  className="px-2.5 py-1 bg-white/5 hover:bg-indigo-500/20 border border-white/10 rounded-full text-[10px] font-bold text-slate-300 hover:text-white transition-colors"
                >
                  🎯 How to upload?
                </button>
                <button
                  onClick={() => handleSendMessage(undefined, "how does this website work?")}
                  className="px-2.5 py-1 bg-white/5 hover:bg-indigo-500/20 border border-white/10 rounded-full text-[10px] font-bold text-slate-300 hover:text-white transition-colors"
                >
                  🔮 How do you work?
                </button>

                {/* PDF/DOCX/JPG Attachment helper directly inside Chat Box */}
                <label
                  htmlFor="chat-direct-file-upload"
                  className="px-2.5 py-1 bg-white/5 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-full text-[10px] font-bold text-cyan-300 hover:text-cyan-200 cursor-pointer transition-colors flex items-center gap-1"
                >
                  <Paperclip className="w-3 h-3" />
                  <span>Upload Resume Scroll</span>
                </label>
                <input
                  type="file"
                  id="chat-direct-file-upload"
                  accept=".pdf,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="p-3 bg-[#07070d] border-t border-indigo-500/10 flex gap-2">
                <input
                  type="text"
                  placeholder="Type to talk with Jin..."
                  value={userMsg}
                  onChange={(e) => setUserMsg(e.target.value)}
                  className="flex-grow px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500/50"
                />
                <button
                  type="submit"
                  className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Aladdin Genie floating launcher and toggle */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="px-4 py-2 bg-indigo-950/90 border border-indigo-500/30 text-white rounded-full text-xxs font-black shadow-lg hover:bg-indigo-900 transition-colors uppercase tracking-widest flex items-center space-x-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
            <span>{chatOpen ? 'Hide Guide' : 'Consult Genie'}</span>
          </button>

          <div
            onClick={() => setChatOpen(true)}
            className="w-24 h-24 bg-gradient-to-tr from-[#0b0b14] to-[#12122b] rounded-full border border-indigo-500/30 shadow-[0_0_25px_rgba(99,102,241,0.35)] cursor-pointer hover:scale-105 active:scale-95 transition-all relative overflow-hidden"
          >
            <AladdinBot state={botState} />
          </div>
        </div>
      </div>

      {/* SECTION 12: DETAILED PREMIUM FOOTER */}
      <footer className="w-full bg-[#030308] border-t border-white/5 py-16 px-6 relative z-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 mb-12 text-left">

          <div className="col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-lg text-white shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-sm text-white uppercase tracking-wider">Elevate Resume</span>
            </div>
            <p className="text-slate-400 leading-relaxed font-light">
              Crafting premium ATS-optimized scannable resumes with deterministic recruiter algorithms and secure zero-hallucination guardrails.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider">Product</h4>
            <ul className="space-y-2 font-medium">
              <li><a href="#" className="hover:text-cyan-400 transition-colors">AI Resume Builder</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">ATS Analyzer</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Job Matcher</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2 font-medium">
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Resume Templates</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Career Blog</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">ATS Scan Rules</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider">Connect</h4>
            <ul className="space-y-2 font-medium">
              <li><a href="#" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5"><Github className="w-3.5 h-3.5" /><span>GitHub</span></a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Contact Support</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-8 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/5 font-medium">
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
