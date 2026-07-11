import React, { useState } from 'react';
import { ChevronLeft, Eye, EyeOff, Lock, Mail, Sparkles, User } from 'lucide-react';

interface AuthProps {
  onSuccess: (email: string, token: string) => void;
  onCancel: () => void;
}

export default function Auth({ onSuccess, onCancel }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Validation and UI Feedbacks
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [serverError, setServerError] = useState('');
  const [showForgotSuccess, setShowForgotSuccess] = useState(false);

  const validateEmail = (val: string) => {
    if (!val) {
      setEmailError('Email is required');
      return false;
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(val)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (val: string) => {
    if (!val) {
      setPasswordError('Password is required');
      return false;
    }
    if (val.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const getStrengthColor = (score: number) => {
    if (score <= 25) return 'bg-red-500';
    if (score <= 50) return 'bg-amber-500';
    if (score <= 75) return 'bg-indigo-400';
    return 'bg-emerald-500';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    setShowForgotSuccess(false);

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) return;

    setIsSubmitting(true);

    try {
      const endpoint = isLogin ? '/api/v1/auth/login' : '/api/v1/auth/signup';
      const body: any = { email, password };
      if (!isLogin) {
        body.fullName = fullName;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Authentication failed');
      }

      const sessionToken = result.data?.session?.access_token;
      const verifiedEmail = result.data?.user?.email || email;

      if (!sessionToken) {
        throw new Error('No session token returned from registration.');
      }

      onSuccess(verifiedEmail, sessionToken);
    } catch (err: any) {
      console.error(err);
      setServerError(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter your email to request a reset link');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowForgotSuccess(true);
      setServerError('');
    }, 800);
  };

  const strengthScore = getPasswordStrength();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-300 font-sans">
      {/* Decorative Side Column on desktop */}
      <div className="hidden md:flex md:w-5/12 bg-indigo-600 dark:bg-indigo-900 relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent)] pointer-events-none" />
        
        <div className="relative z-10 flex items-center space-x-2.5">
          <div className="p-2 bg-white/10 rounded-xl flex items-center justify-center text-white border border-white/10">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <span className="font-sans font-semibold text-lg tracking-tight">
            Elevate Resume
          </span>
        </div>

        <div className="relative z-10 space-y-4">
          <h2 className="text-3xl font-bold tracking-tight font-sans">Unlock Your True Career Potential</h2>
          <p className="text-white/80 font-light leading-relaxed text-sm font-sans">
            Join thousands of professionals securing interviews at leading companies. Build your perfect ATS-optimized resume, evaluate score matrices, and bridge the skill gaps easily.
          </p>
        </div>

        <p className="relative z-10 text-xs text-white/50 font-sans">
          © 2026 Elevate Resume. Fully private. Saved securely to database.
        </p>
      </div>

      {/* Main Auth Form Column */}
      <div className="flex-grow flex flex-col justify-between p-6 sm:p-12 md:w-7/12 max-w-xl mx-auto w-full">
        <div className="flex items-center justify-between">
          <button
            onClick={onCancel}
            className="flex items-center space-x-1 text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors py-2 px-1 focus:outline-none"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          
          <div className="flex items-center space-x-1.5 md:hidden">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-sm bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
              Elevate
            </span>
          </div>
        </div>

        {/* Core Form Card */}
        <div className="my-auto py-8">
          <div className="space-y-2 mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 font-sans">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-sans font-light">
              {isLogin
                ? 'Sign in to access your resumes, analytical history, and preferences.'
                : 'Get started and build highly customized resumes tailored to target roles.'}
            </p>
          </div>

          {serverError && (
            <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl mb-6 text-sm text-red-700 dark:text-red-300">
              {serverError}
            </div>
          )}

          {showForgotSuccess && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl mb-6 text-sm text-emerald-700 dark:text-emerald-300">
              A secure password reset link has been dispatched to <strong className="font-semibold">{email}</strong>. Check your inbox.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => validateEmail(email)}
                  placeholder="name@example.com"
                  className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors text-slate-900 dark:text-slate-100 ${
                    emailError ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-slate-800'
                  }`}
                />
              </div>
              {emailError && (
                <p className="text-xs text-red-500 font-sans mt-1">{emailError}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-500 transition-colors focus:outline-none"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => validatePassword(password)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-3 bg-white dark:bg-slate-900 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors text-slate-900 dark:text-slate-100 ${
                    passwordError ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-slate-800'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordError && (
                <p className="text-xs text-red-500 font-sans mt-1">{passwordError}</p>
              )}

              {!isLogin && password && (
                <div className="space-y-1.5 mt-2">
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${getStrengthColor(strengthScore)}`}
                      style={{ width: `${strengthScore}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xxs text-slate-400 dark:text-slate-500 font-medium tracking-wide uppercase">
                    <span>Complexity</span>
                    <span className="font-semibold text-slate-500 dark:text-slate-400">
                      {strengthScore <= 25 ? 'Weak' : strengthScore <= 50 ? 'Medium' : strengthScore <= 75 ? 'Strong' : 'Excellent'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/15 hover:shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
              )}
            </button>
          </form>

          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <span className="relative px-3 bg-slate-50 dark:bg-slate-950 text-xs text-slate-400 dark:text-slate-500 font-medium">
              OR CONTINUING WITH
            </span>
          </div>

          <div className="text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setServerError('');
                setEmailError('');
                setPasswordError('');
                setShowForgotSuccess(false);
              }}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors focus:outline-none"
            >
              {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
            </button>
          </div>
        </div>

        <p className="text-center text-xxs text-slate-400 dark:text-slate-500 leading-normal">
          By signing in, you consent to our automatic database security guidelines. <br />
          Data transmissions are fully sandboxed and stored using enterprise encryption standards.
        </p>
      </div>
    </div>
  );
}
