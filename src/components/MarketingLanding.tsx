import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Briefcase, ChevronRight, FileText, Sparkles, Target, Zap, UploadCloud, AlertCircle, ArrowRight, MessageSquare, Send, Check } from 'lucide-react';
import CanvasVisualizer from './three/CanvasVisualizer';
import AladdinBot from './three/AladdinBot';
import { Resume } from '../types';

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
  const [botState, setBotState] = useState<'idle' | 'thinking' | 'success'>('idle');
  const [chatOpen, setChatOpen] = useState(true);
  const [userMsg, setUserMsg] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    { sender: 'bot', text: "Hey! I am your Genie. 🔮 How's your life going? Tell me, are you searching for a magical career upgrade or just chatting? Ask me anything!" }
  ]);

  // 3. Simple Dictionary conversational handler for Genie
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userMsg.trim()) return;

    const userClean = userMsg.trim();
    const historyUpdate = [...chatHistory, { sender: 'user' as const, text: userClean }];
    setChatHistory(historyUpdate);
    setUserMsg('');
    setBotState('thinking');

    // Simulate thinking delay
    setTimeout(() => {
      const lower = userClean.toLowerCase();
      let reply = "Mmm, that's deep. Life has its waves, but I am here to make sure your career isn't one of those sinking ships! 🚢 Upload your resume and let's get you set up with a luxurious rating!";

      if (lower.includes('how are you') || lower.includes('how\'s it going') || lower.includes('how is it going')) {
        reply = "I'm floating on cloud nine! ✨ Literally, since my tail is pure glowing neon cosmic energy. How are you doing today?";
      } else if (lower.includes('life') || lower.includes('sad') || lower.includes('happy') || lower.includes('struggle')) {
        reply = "Life is an adventure! Full of unexpected plots and turns. Just remember, a bad day is temporary, but a premium resume is forever. 💎 Ready to boost yours?";
      } else if (lower.includes('what is this') || lower.includes('website') || lower.includes('how does this work') || lower.includes('elevate')) {
        reply = "This is Elevate Resume! A cosmic sanctuary where we audit resumes with bulletproof, deterministic recruiter logic and power up highlights with Gemini AI. None of that lazy, hallucinating LLM prompt stuff!";
      } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
        reply = "Hello there, beautiful human! 👋 Ready to cast a magic spell on your career today?";
      } else if (lower.includes('love') || lower.includes('marry') || lower.includes('date')) {
        reply = "Oh my, you're making my neon eyes glow magenta! 😳 I'm extremely flattered, but my true love is auditing bullet points and optimizing ATS scores!";
      } else if (lower.includes('premium') || lower.includes('cost') || lower.includes('price')) {
        reply = "It looks absolutely premium and luxurious, doesn't it? But here's the best part: you can analyze and get rated entirely for free! Let's get started!";
      }

      setChatHistory(prev => [...prev, { sender: 'bot' as const, text: reply }]);
      setBotState('idle');
    }, 1000);
  };

  // Frictionless File Upload Process
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

  // Calculate cheeky pick-up lines based on the score
  const getCheekyPickupLine = (score: number) => {
    if (score >= 80) {
      return `Wow, an ATS rating of ${score}%! Honestly, you're a major catch. Recruiters would be crazy to skip you. Let's make this official.`;
    }
    if (score >= 60) {
      return `Ooh, ${score}%! Not bad at all, you definitely have some high-quality charm. With just a little polish, we'll have everyone chasing after you.`;
    }
    if (score >= 45) {
      return `Mmm, ${score}%... We need to talk. Your ex ignored your potential, let's not let hiring managers do the exact same thing to you.`;
    }
    return `An ATS rating of ${score}%... Ouch. 💔 This is a critical SOS. But don't panic, your Genie is here to sweep you off your feet and fix this immediately!`;
  };

  const processUploadedFile = async (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension !== 'pdf' && extension !== 'docx') {
      setUploadError('Wait, let\'s stay compatible! Please upload PDF or DOCX format only.');
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
        parsedResume: resume
      });

      setBotState('success');
      // Genie comments on success
      setChatHistory(prev => [
        ...prev,
        { sender: 'bot', text: `Incredible! I finished evaluating your resume. It scores ${score}%. ${getCheekyPickupLine(score).split('.')[0]}. Check it out! 👇` }
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

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden bg-[#07070E] text-slate-100 transition-colors duration-300">

      {/* Dynamic Cosmic Stars Mesh */}
      <CanvasVisualizer intensity="high" reduceMotion={reduceMotion} />

      {/* Premium Space Header */}
      <header className="sticky top-0 z-50 w-full bg-[#07070E]/70 backdrop-blur-xl border-b border-white/5 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] group-hover:scale-105 transition-all">
              <Sparkles className="w-5 h-5 text-cyan-200" />
            </div>
            <div className="flex flex-col">
              <span className="font-sans font-black text-lg tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                Elevate Resume
              </span>
              <span className="text-[10px] font-bold text-indigo-400 tracking-widest uppercase">Cosmic Edition</span>
            </div>
          </div>
          <div className="flex items-center space-x-5">
            <button
              onClick={onLogin}
              className="text-sm font-bold text-slate-400 hover:text-white transition-colors px-3 py-1.5"
            >
              Sign In
            </button>
            <button
              onClick={onGetStarted}
              className="group relative flex items-center space-x-2 text-xs font-black bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white px-5 py-2.5 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.25)] active:scale-95 transition-all uppercase tracking-wider"
            >
              <span>Build Free Workspace</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center px-6 py-12 md:py-24 max-w-7xl mx-auto w-full relative z-10 text-center space-y-16">

        <div className="max-w-3xl space-y-8">
          <div className="inline-flex items-center space-x-2 bg-indigo-950/40 text-indigo-300 px-4 py-2 rounded-full border border-indigo-500/30 text-xs font-extrabold uppercase tracking-widest shadow-[0_0_15px_rgba(99,102,241,0.15)] animate-pulse">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Outperform Generic LLMs</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black font-sans tracking-tight text-white leading-none md:leading-[1.1]">
            Why settle for <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
              boring AI templates?
            </span>
          </h1>

          <p className="text-lg text-slate-300 max-w-2xl mx-auto font-sans leading-relaxed font-light">
            Elevate is engineered with <span className="text-cyan-400 font-semibold">deterministic recruiter algorithms</span> that parse and audit your resume precisely how top companies score talent. No hallucinations. No broken templates.
          </p>

          {/* Interactive Annotation Pick-up Line */}
          <div className="relative inline-block px-6 py-2.5 bg-gradient-to-r from-pink-500/10 to-indigo-500/10 border border-pink-500/30 rounded-2xl text-xs font-semibold text-pink-300 shadow-[0_0_15px_rgba(236,72,153,0.1)]">
            ✨ <span className="italic">"We are matches waiting to happen. Let me find your ultimate recruiter match."</span>
          </div>
        </div>

        {/* Dynamic & Frictionless Resume Drop / Upload Area */}
        <div className="w-full max-w-2xl mx-auto space-y-6">
          <AnimatePresence mode="wait">
            {!analysisResult ? (
              <motion.div
                key="dropzone"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="relative group rounded-3xl p-0.5 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 hover:from-indigo-500 hover:via-purple-500 hover:to-cyan-500 transition-all duration-700 shadow-2xl"
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
                    accept=".pdf,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {isAnalyzing ? (
                    <div className="space-y-6 py-6 flex flex-col items-center">
                      <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping" />
                        <div className="w-16 h-16 border-4 border-indigo-500 border-t-cyan-400 rounded-full animate-spin" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-base font-black tracking-wide text-white">Genie is reading your stars...</p>
                        <p className="text-xs text-indigo-300 font-medium">Extracting metadata and analyzing your compatibility score.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600/30 to-cyan-600/30 rounded-2xl flex items-center justify-center mx-auto border border-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
                        <UploadCloud className="w-8 h-8 text-cyan-400" />
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white tracking-tight">
                          Drop your resume to get immediately rated
                        </h3>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                          We don't do boring government forms. Drag PDF or DOCX to instantly see where you stand.
                        </p>
                      </div>

                      <label
                        htmlFor="frictionless-file-upload"
                        className="inline-flex items-center space-x-2 px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 text-xs font-black rounded-xl cursor-pointer shadow-lg active:scale-95 transition-all uppercase tracking-wider"
                      >
                        <span>Select File</span>
                        <ArrowRight className="w-4 h-4" />
                      </label>
                    </div>
                  )}

                  {uploadError && (
                    <div className="mt-6 p-4 bg-red-950/40 border border-red-500/30 text-red-300 text-xs rounded-2xl flex items-center justify-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                      <span>{uploadError}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              /* Premium Abstract Rating Card with Cosmic Radial Meter & Pick-up Line */
              <motion.div
                key="rating-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative rounded-3xl p-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 shadow-[0_0_50px_rgba(99,102,241,0.25)]"
              >
                <div className="rounded-[20px] bg-[#0b0b14] p-8 md:p-12 text-center space-y-8 relative overflow-hidden">

                  {/* Decorative background aura */}
                  <div className="absolute -top-12 -left-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Aura Checked Results</span>
                    <h3 className="text-2xl font-black text-white">Your Premium Profile Rating</h3>
                  </div>

                  <div className="flex flex-col items-center justify-center space-y-4">
                    {/* Glowing Cosmic Meter */}
                    <div className="relative w-36 h-36">
                      <div className="absolute inset-0 rounded-full bg-indigo-500/5 blur-xl animate-pulse" />
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke="rgba(255,255,255,0.03)"
                          strokeWidth="6"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 40}
                          strokeDashoffset={2 * Math.PI * 40 * (1 - analysisResult.score / 100)}
                          strokeWidth="7"
                          strokeLinecap="round"
                          className="stroke-cyan-400"
                          style={{
                            filter: 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.6))',
                            transition: 'stroke-dashoffset 1.5s ease-out'
                          }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-black text-white tracking-tighter">{analysisResult.score}%</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Match Aura</span>
                      </div>
                    </div>
                  </div>

                  {/* Relationship / Cheeky Pick-up Evaluation */}
                  <div className="max-w-md mx-auto p-5 rounded-2xl bg-white/5 border border-white/10 relative">
                    <p className="text-sm md:text-base text-slate-200 leading-relaxed font-sans font-medium">
                      "{analysisResult.pickupLine}"
                    </p>
                  </div>

                  {/* Luxury CTA to enter the App */}
                  <div className="pt-2">
                    <button
                      onClick={claimWorkspace}
                      className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-black text-sm rounded-xl shadow-xl active:scale-98 transition-all flex items-center justify-center space-x-3 mx-auto uppercase tracking-wider"
                    >
                      <span>Claim your Space & Auto-Fix Resume</span>
                      <ArrowRight className="w-5 h-5 text-white animate-bounce-right" />
                    </button>
                    <button
                      onClick={() => setAnalysisResult(null)}
                      className="mt-4 text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors block mx-auto"
                    >
                      Upload a different file
                    </button>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Comparison Section: Generative LLMs vs Elevate Resume */}
        <section className="w-full max-w-5xl mx-auto space-y-12 pt-12">
          <div className="space-y-4 text-center">
            <h2 className="text-3xl md:text-4xl font-black text-white">How we are different</h2>
            <p className="text-sm text-slate-400 max-w-lg mx-auto">
              Generic LLMs are helpful for chit-chat, but they fall completely flat when it comes to formatting compliance and ATS standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">

            {/* Box 1: Generic LLM (ChatGPT) */}
            <div className="p-8 rounded-3xl bg-red-950/10 border border-red-500/10 space-y-6 relative overflow-hidden group hover:border-red-500/20 transition-colors">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl" />
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Generic Chat Assistants</span>
                <h3 className="text-2xl font-black text-white">Normal LLM Output</h3>
              </div>

              <ul className="space-y-4 text-slate-400 text-sm">
                <li className="flex items-start space-x-3">
                  <span className="text-red-500 font-black shrink-0">✕</span>
                  <span><strong>Hallucinates Experience:</strong> Blindly invents achievements or metrics that don't match your actual career milestones.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-red-500 font-black shrink-0">✕</span>
                  <span><strong>Messes up PDF Formats:</strong> Generates beautiful Markdown that completely breaks once copy-pasted into layout grids.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-red-500 font-black shrink-0">✕</span>
                  <span><strong>Blind to ATS Scoring Rules:</strong> Lacks actual parser algorithms to evaluate keyword density or structural criteria.</span>
                </li>
              </ul>
            </div>

            {/* Box 2: Elevate Resume */}
            <div className="p-8 rounded-3xl bg-[#0d0d1c] border border-cyan-500/20 space-y-6 relative overflow-hidden group hover:border-cyan-500/40 transition-colors shadow-[0_0_30px_rgba(6,182,212,0.05)]">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl" />
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Elevate Platform Advantage</span>
                <h3 className="text-2xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-300">Elevate Resume</h3>
              </div>

              <ul className="space-y-4 text-slate-300 text-sm">
                <li className="flex items-start space-x-3">
                  <span className="text-cyan-400 font-black shrink-0">✓</span>
                  <span><strong>Deterministic Auditing:</strong> Exact recruiter-designed scoring engines map out real keyword compliance.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-cyan-400 font-black shrink-0">✓</span>
                  <span><strong>Zero Hallucinations:</strong> Guided enhancements ensure and protect the authentic accuracy of your work.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-cyan-400 font-black shrink-0">✓</span>
                  <span><strong>Seamless Live Editor:</strong> Clean, responsive, premium workspace structures ready to export directly.</span>
                </li>
              </ul>
            </div>

          </div>
        </section>

      </main>

      {/* Floating 3D Aladdin Genie Bot & Interactive Chat HUD */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-3">
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="w-80 md:w-96 rounded-2xl bg-[#090912]/95 border border-indigo-500/20 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col max-h-[380px] md:max-h-[420px]"
            >
              {/* Chat Title bar */}
              <div className="p-4 bg-indigo-950/40 border-b border-indigo-500/20 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-xs font-black tracking-wide text-white uppercase">Aladdin's Guide Jin</span>
                </div>
                <button
                  onClick={() => setChatOpen(false)}
                  className="text-slate-400 hover:text-white text-xs font-bold"
                >
                  Hide
                </button>
              </div>

              {/* Chat Log Message Scroller */}
              <div className="flex-grow p-4 overflow-y-auto space-y-3 text-xs scrollbar-thin">
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
                      {item.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="p-3 bg-[#07070d] border-t border-indigo-500/10 flex gap-2">
                <input
                  type="text"
                  placeholder="Ask me how my life is going..."
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

        {/* 3D Bot sphere launcher */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="px-4 py-2 bg-indigo-950/90 border border-indigo-500/30 text-white rounded-full text-xxs font-black shadow-lg hover:bg-indigo-900 transition-colors uppercase tracking-widest flex items-center space-x-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
            <span>{chatOpen ? 'Hide Chat' : 'Chat with Genie'}</span>
          </button>

          <div
            onClick={() => setChatOpen(true)}
            className="w-24 h-24 bg-gradient-to-tr from-[#0b0b14] to-[#12122b] rounded-full border border-indigo-500/30 shadow-[0_0_25px_rgba(99,102,241,0.35)] cursor-pointer hover:scale-105 active:scale-95 transition-all relative overflow-hidden"
          >
            <AladdinBot state={botState} />
          </div>
        </div>
      </div>

      {/* Premium Dark Space Footer */}
      <footer className="w-full py-8 px-6 bg-[#04040a] border-t border-white/5 transition-colors text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Briefcase className="w-4 h-4 text-indigo-500" />
            <span className="font-extrabold text-slate-300">Elevate Resume</span>
          </div>
          <p>© 2026 Elevate Resume. All rights reserved. Crafted by Genie's Sparkles.</p>
          <div className="flex space-x-6 text-slate-500 font-medium">
            <a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
