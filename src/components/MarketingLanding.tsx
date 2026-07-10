import { motion } from 'motion/react';
import { Award, Briefcase, ChevronRight, FileText, Sparkles, Target, Zap } from 'lucide-react';
import CanvasVisualizer from './three/CanvasVisualizer';

interface MarketingLandingProps {
  onGetStarted: () => void;
  onLogin: () => void;
  reduceMotion?: boolean;
}

export default function MarketingLanding({ onGetStarted, onLogin, reduceMotion = false }: MarketingLandingProps) {
  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <CanvasVisualizer intensity="low" reduceMotion={reduceMotion} />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-950/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-sans font-bold text-lg tracking-tight text-slate-800 dark:text-white">
              Elevate Resume
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={onLogin}
              className="text-sm font-semibold text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors px-3 py-1.5"
            >
              Sign In
            </button>
            <button
              onClick={onGetStarted}
              className="group flex items-center space-x-1 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm active:scale-98 transition-all"
            >
              <span>Build Free</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center px-6 py-12 md:py-24 max-w-7xl mx-auto w-full relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl space-y-6"
        >
          <div className="inline-flex items-center space-x-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-750 dark:text-blue-300 px-3.5 py-1.5 rounded border border-blue-100 dark:border-blue-900/50 text-xs font-semibold uppercase tracking-wider mb-2">
            <Zap className="w-3.5 h-3.5" />
            <span>Next Generation AI Engine</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold font-sans tracking-tight text-slate-900 dark:text-slate-50 leading-none md:leading-tight">
            Craft the perfect resume. <br />
            <span className="text-blue-600 dark:text-blue-400">
              Beat the ATS algorithm.
            </span>
          </h1>

          <p className="text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-sans leading-relaxed">
            Create a highly tailored, visually spectacular, and ATS-optimized resume in minutes. Get instantaneous category scoring, skill-gap analysis, and expert bullet enhancements.
          </p>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-base font-semibold shadow-sm active:scale-98 transition-all flex items-center justify-center space-x-2 group"
            >
              <span>Build My Resume Now</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-3.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg text-base font-semibold border border-slate-200 dark:border-slate-800 transition-all flex items-center justify-center space-x-2"
            >
              <Target className="w-5 h-5 text-blue-550" />
              <span>Match Job Description</span>
            </button>
          </div>
        </motion.div>

        {/* Feature Grid Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-20 md:mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-left"
        >
          {/* Card 1 */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 transition-all">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/50 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-sans text-slate-900 dark:text-white mb-2">
              Intuitive Resume Builder
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-sans">
              Step-by-step guidance to assemble a clean, premium, structurally consistent resume. Reorder sections with ease and let autosave protect your hard work.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 transition-all">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/50 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-sans text-slate-900 dark:text-white mb-2">
              ATS Scoring & Checklist
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-sans">
              Get an instant ATS compatibility breakdown. Track grammar, readability, formatting, keyword density, and structural completeness on an elegant radial gauge.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 transition-all">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/50 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-sans text-slate-900 dark:text-white mb-2">
              Job Description Matcher
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-sans">
              Paste a target job posting and get tailored feedback. Spot skill gaps, pinpoint missing keywords, and adapt your phrasing directly to match the employer's needs.
            </p>
          </div>
        </motion.section>

        {/* Dynamic Metric Block */}
        <div className="mt-20 py-6 px-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap justify-center gap-12 w-full max-w-4xl mx-auto shadow-sm">
          <div className="text-center">
            <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">85%</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">Interview Increase</p>
          </div>
          <div className="w-px bg-slate-200 dark:bg-slate-800 h-12 hidden md:block" />
          <div className="text-center">
            <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">10k+</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">Resumes Analyzed</p>
          </div>
          <div className="w-px bg-slate-200 dark:bg-slate-800 h-12 hidden md:block" />
          <div className="text-center">
            <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">100%</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">Data Privacy Secure</p>
          </div>
        </div>
      </main>

      {/* Footer without any build engine references */}
      <footer className="w-full py-8 px-6 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 transition-colors text-center text-xs text-slate-500 dark:text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Briefcase className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-slate-700 dark:text-slate-400">Elevate Resume</span>
          </div>
          <p>© 2026 Elevate Resume. All rights reserved. Your career companion.</p>
          <div className="flex space-x-6 text-slate-400 dark:text-slate-600 font-medium">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
