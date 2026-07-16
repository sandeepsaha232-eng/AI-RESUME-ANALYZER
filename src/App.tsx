import { useState, useEffect } from 'react';
import { Award, Bell, Briefcase, FileText, Laptop, LayoutDashboard, LogOut, Menu, Moon, Shield, Sparkles, Sun, Target, User, X } from 'lucide-react';
import { Resume, AppNotification, UserSettings } from './types';
import { mockResumes } from './data/mockResumes';
import { safeFetchJson } from './utils/apiHelper';
import { calculateAtsScore } from './scoringEngine';

// Component imports
import MarketingLanding from './components/MarketingLanding';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import ResumeBuilder from './components/ResumeBuilder';
import ResumeAnalyzer from './components/ResumeAnalyzer';
import JDMatch from './components/JDMatch';
import Settings from './components/Settings';
import NotificationCenter from './components/NotificationCenter';
import ExportView from './components/ExportView';
import CoverLetterGenerator from './components/CoverLetterGenerator';

export default function App() {
  // 1. Session States
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    return localStorage.getItem('elevate_user_email') || null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('elevate_session_token') || null;
  });
  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    return localStorage.getItem('elevate_is_onboarded') === 'true';
  });

  // 2. Navigation Routing
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [activeResumeId, setActiveResumeId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 3. Central Resume Database
  const [resumes, setResumes] = useState<Resume[]>(() => {
    const saved = localStorage.getItem('elevate_resumes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return mockResumes;
      }
    }
    return mockResumes;
  });

  // Load from remote database on session init
  useEffect(() => {
    if (!token) return;

    const fetchResumes = async () => {
      try {
        const result = await safeFetchJson('/api/v1/resumes', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (result.data) {
          setResumes(result.data);
        }
      } catch (e) {
        console.error('Failed to load remote portfolio resumes:', e);
      }
    };

    fetchResumes();
  }, [token]);

  // 4. Notifications Seed Database
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('elevate_notifications');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [
      {
        id: 'notif-1',
        type: 'success',
        title: 'Welcome to Elevate Resume!',
        body: 'Your carrier workspace has been initialized successfully. Cloud backup sync state is active.',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        read: false
      },
      {
        id: 'notif-2',
        type: 'info',
        title: 'ATS Parser Auditing Configured',
        body: 'We updated keyword density benchmark indices to match the 2026 hiring metrics. Run an analysis to check alignments.',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        read: true
      }
    ];
  });

  // 5. Visual System Settings
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('elevate_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      theme: 'system',
      reduceMotion: false,
      notifications: {
        analysisComplete: true,
        jdMatchReady: true,
        syncStatus: true,
        productUpdates: false
      }
    };
  });

  // Offline status tracking
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      const newNotif: AppNotification = {
        id: `notif-online-${Date.now()}`,
        type: 'success',
        title: 'Back Online',
        body: 'Network connection re-established. Synchronizing local portfolio revisions...',
        createdAt: new Date().toISOString(),
        read: false
      };
      setNotifications(prev => [newNotif, ...prev]);
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync state mutations to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('elevate_resumes', JSON.stringify(resumes));
    } catch (e: any) {
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        console.warn('LocalStorage quota exceeded. Stripping heavy base64 profile pictures to save space...');
        const stripped = resumes.map(r => ({
          ...r,
          personalInfo: {
            ...r.personalInfo,
            photoUrl: r.personalInfo.photoUrl && r.personalInfo.photoUrl.length > 2000 ? '[Stripped Base64 Photo to Prevent Storage Quota Crash]' : r.personalInfo.photoUrl
          }
        }));
        try {
          localStorage.setItem('elevate_resumes', JSON.stringify(stripped));
        } catch (innerErr) {
          console.error('Failed to save resumes even after stripping photos:', innerErr);
        }
      } else {
        console.error('Failed to save resumes to localStorage:', e);
      }
    }
  }, [resumes]);

  useEffect(() => {
    try {
      localStorage.setItem('elevate_notifications', JSON.stringify(notifications));
    } catch (e) {
      console.error('Failed to save notifications to localStorage:', e);
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem('elevate_settings', JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to localStorage:', e);
    }
  }, [settings]);

  // Apply dark mode theme on initial paint
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (settings.theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(settings.theme);
    }
  }, [settings.theme]);

  // Auth Triggers
  const handleAuthSuccess = (email: string, sessionToken: string) => {
    setUserEmail(email);
    setToken(sessionToken);
    localStorage.setItem('elevate_user_email', email);
    localStorage.setItem('elevate_session_token', sessionToken);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUserEmail(null);
    setToken(null);
    setIsOnboarded(false);
    localStorage.removeItem('elevate_user_email');
    localStorage.removeItem('elevate_session_token');
    localStorage.removeItem('elevate_is_onboarded');
    setCurrentView('dashboard');
  };

  const handleDeleteAccount = () => {
    setUserEmail(null);
    setToken(null);
    setIsOnboarded(false);
    setResumes(mockResumes);
    setNotifications([]);
    localStorage.clear();
    setCurrentView('dashboard');
  };

  const handleOnboardingWithParsedResume = async (parsedResume: Resume) => {
    setIsOnboarded(true);
    localStorage.setItem('elevate_is_onboarded', 'true');

    if (token) {
      try {
        const result = await safeFetchJson('/api/v1/resumes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ resume: parsedResume })
        });
        if (result.data) {
          setResumes([result.data, ...resumes]);
          setActiveResumeId(result.data.id);
          setCurrentView('dashboard');
          return;
        }
      } catch (err) {
        console.error('Failed to save parsed onboarding resume:', err);
      }
    }

    setResumes([parsedResume, ...resumes]);
    setActiveResumeId(parsedResume.id);
    setCurrentView('dashboard');
  };

  // Onboarding Completed
  const handleOnboardingComplete = async (data: {
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
  }) => {
    setIsOnboarded(true);
    localStorage.setItem('elevate_is_onboarded', 'true');

    // Build seeded lists from onboarding queries
    const educationList = data.education ? [{
      id: `edu-${Date.now()}`,
      institution: data.education.institution,
      degree: data.education.degree,
      fieldOfStudy: data.education.fieldOfStudy,
      location: data.location || '',
      startDate: new Date().getFullYear().toString(),
      endDate: new Date().getFullYear().toString(),
      current: true,
      gpa: data.education.gpa
    }] : [];

    const projectsList = data.projects ? [{
      id: `proj-${Date.now()}`,
      name: data.projects.name,
      role: data.projects.role,
      url: '',
      startDate: new Date().getFullYear().toString(),
      endDate: new Date().getFullYear().toString(),
      bullets: data.projects.bullets
    }] : [];

    const certificationsList = data.certifications ? [{
      id: `cert-${Date.now()}`,
      name: data.certifications.name,
      issuer: data.certifications.issuer,
      date: new Date().getFullYear().toString(),
      url: ''
    }] : [];

    // Create initial custom template resume with all the queried details
    const newResume: Resume = {
      id: `res-${Date.now()}`,
      title: `${data.targetTitle} Template`,
      lastEdited: new Date().toISOString(),
      atsScore: 50,
      personalInfo: {
        fullName: userEmail ? userEmail.split('@')[0] : 'Professional Candidate',
        email: userEmail || 'candidate@example.com',
        phone: data.phone || '',
        location: data.location || '',
        website: '',
        linkedin: '',
        github: '',
        photoUrl: data.photoUrl
      },
      summary: `Motivated and goal-driven professional targeting a career advancement as a ${data.targetTitle}. Dedicated to utilizing solid competencies in ${data.skills.slice(0, 3).join(', ')} to coordinate operations and deliver valuable engineering milestones.${data.education?.honors ? ` Proud recipient of ${data.education.honors}.` : ''}`,
      experience: [],
      education: educationList,
      projects: projectsList,
      skills: data.skills,
      certifications: certificationsList,
      languages: []
    };

    // Calculate initial ATS score
    const initialAnalysis = calculateAtsScore(newResume);
    newResume.atsScore = initialAnalysis.atsScore;

    // Save profile attributes to DB
    if (token) {
      try {
        await safeFetchJson('/api/v1/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            fullName: userEmail ? userEmail.split('@')[0] : 'Professional Candidate',
            targetTitle: data.targetTitle,
            experienceLevel: data.experienceLevel
          })
        });

        const result = await safeFetchJson('/api/v1/resumes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ resume: newResume })
        });
        if (result.data) {
          setResumes([result.data, ...resumes]);
          setActiveResumeId(result.data.id);
          setCurrentView('dashboard');
          return;
        }
      } catch (err) {
        console.error('Failed to sync onboarding details with DB:', err);
      }
    }

    setResumes([newResume, ...resumes]);
    setActiveResumeId(newResume.id);
    setCurrentView('dashboard');

    const welcomeNotif: AppNotification = {
      id: `notif-onboard-${Date.now()}`,
      type: 'success',
      title: 'First Template Generated',
      body: `We customized a template matching your target role: "${data.targetTitle}". Complete the builder forms to calculate a rating.`,
      createdAt: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [welcomeNotif, ...prev]);
  };

  // Resume Database Operations
  const handleCreateResume = async () => {
    const newResume: Resume = {
      id: `res-${Date.now()}`,
      title: 'Untitled Resume Draft',
      lastEdited: new Date().toISOString(),
      atsScore: 35,
      personalInfo: {
        fullName: '',
        email: userEmail || '',
        phone: '',
        location: '',
        website: '',
        linkedin: '',
        github: ''
      },
      summary: '',
      experience: [],
      education: [],
      projects: [],
      skills: [],
      certifications: [],
      languages: []
    };

    if (token) {
      try {
        const result = await safeFetchJson('/api/v1/resumes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ resume: newResume })
        });
        if (result.data) {
          setResumes([result.data, ...resumes]);
          setActiveResumeId(result.data.id);
          setCurrentView('builder');
          return;
        }
      } catch (err) {
        console.error('Failed to create resume in remote DB:', err);
      }
    }

    setResumes([newResume, ...resumes]);
    setActiveResumeId(newResume.id);
    setCurrentView('builder');
  };

  const handleDuplicateResume = async (id: string) => {
    const source = resumes.find(r => r.id === id);
    if (!source) return;

    const copy: Resume = JSON.parse(JSON.stringify(source));
    copy.id = `res-${Date.now()}`;
    copy.title = `${source.title} (Copy)`;
    copy.lastEdited = new Date().toISOString();

    if (token) {
      try {
        const result = await safeFetchJson('/api/v1/resumes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ resume: copy })
        });
        if (result.data) {
          setResumes([result.data, ...resumes]);
          return;
        }
      } catch (err) {
        console.error('Failed to duplicate resume in remote DB:', err);
      }
    }

    setResumes([copy, ...resumes]);

    const dupNotif: AppNotification = {
      id: `notif-dup-${Date.now()}`,
      type: 'info',
      title: 'Resume Duplicated',
      body: `Successfully compiled clone of template: "${source.title}".`,
      createdAt: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [dupNotif, ...prev]);
  };

  const handleDeleteResume = async (id: string) => {
    const target = resumes.find(r => r.id === id);
    setResumes(resumes.filter(r => r.id !== id));
    
    if (token) {
      try {
        await safeFetchJson(`/api/v1/resumes/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (err) {
        console.error('Failed to delete resume from remote DB:', err);
      }
    }

    if (target) {
      const delNotif: AppNotification = {
        id: `notif-del-${Date.now()}`,
        type: 'warning',
        title: 'Resume Deleted',
        body: `Removed draft file: "${target.title}" from local storage database records.`,
        createdAt: new Date().toISOString(),
        read: false
      };
      setNotifications(prev => [delNotif, ...prev]);
    }
  };

  const handleSaveResume = async (updated: Resume) => {
    setResumes(resumes.map(r => r.id === updated.id ? updated : r));

    if (token) {
      try {
        await safeFetchJson(`/api/v1/resumes/${updated.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ resume: updated })
        });
      } catch (err) {
        console.error('Failed to save resume updates in remote DB:', err);
      }
    }
  };

  // Notification actions
  const handleMarkRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  // Routing render helper
  const renderCurrentView = () => {
    if (currentView.startsWith('export-')) {
      const resId = currentView.replace('export-', '');
      const res = resumes.find(r => r.id === resId);
      if (res) {
        return <ExportView resume={res} onBack={() => setCurrentView('dashboard')} />;
      }
    }

    switch (currentView) {
      case 'builder':
        const activeRes = resumes.find(r => r.id === activeResumeId);
        if (activeRes) {
          return (
            <ResumeBuilder
              resume={activeRes}
              onSave={handleSaveResume}
              onBack={() => setCurrentView('dashboard')}
              onNavigateToExport={() => setCurrentView(`export-${activeRes.id}`)}
            />
          );
        }
        return <Dashboard resumes={resumes} userEmail={userEmail!} onEdit={(id) => { setActiveResumeId(id); setCurrentView('builder'); }} onDuplicate={handleDuplicateResume} onDelete={handleDeleteResume} onCreate={handleCreateResume} onNavigate={setCurrentView} />;
      
      case 'analyzer':
        return (
          <ResumeAnalyzer
            resumes={resumes}
            onSelectResumeToEdit={(id) => {
              setActiveResumeId(id);
              setCurrentView('builder');
            }}
            onAddResume={(newResume) => {
              setResumes((prev) => [newResume, ...prev]);
              const uploadNotif: AppNotification = {
                id: `notif-upload-${Date.now()}`,
                type: 'success',
                title: 'Resume Parsed & Scored',
                body: `Successfully imported "${newResume.title}" from raw document. Try editing in Workspace!`,
                createdAt: new Date().toISOString(),
                read: false,
              };
              setNotifications((prev) => [uploadNotif, ...prev]);
            }}
          />
        );

      case 'jd-match':
        return <JDMatch resumes={resumes} />;

      case 'cover-letter':
        return <CoverLetterGenerator resumes={resumes} token={token} />;

      case 'settings':
        return (
          <Settings
            userEmail={userEmail!}
            settings={settings}
            onUpdateSettings={setSettings}
            onLogout={handleLogout}
            onDeleteAccount={handleDeleteAccount}
          />
        );

      case 'notifications':
        return (
          <NotificationCenter
            notifications={notifications}
            onMarkRead={handleMarkRead}
            onMarkAllRead={handleMarkAllRead}
            onClearAll={handleClearAll}
          />
        );

      default:
        return (
          <Dashboard
            resumes={resumes}
            userEmail={userEmail!}
            onEdit={(id) => {
              setActiveResumeId(id);
              setCurrentView('builder');
            }}
            onDuplicate={handleDuplicateResume}
            onDelete={handleDeleteResume}
            onCreate={handleCreateResume}
            onNavigate={setCurrentView}
          />
        );
    }
  };

  const isGlobalShellVisible = userEmail !== null && isOnboarded;
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleInstantResumeParsed = async (parsed: Resume) => {
    // Generate random secure password for guest users so they are registered securely to Supabase
    const guestEmail = `guest-${Math.floor(1000 + Math.random() * 9000)}@elevateresume.space`;
    const guestPassword = `pwd-${Math.random().toString(36).substring(2, 10)}X1!`;

    try {
      // 1. Sign up guest
      const signUpJson = await safeFetchJson('/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: guestEmail, password: guestPassword, fullName: 'Aladdin Guest' })
      });

      if (signUpJson.data?.session?.access_token) {
        const guestToken = signUpJson.data.session.access_token;
        setUserEmail(guestEmail);
        setToken(guestToken);
        setIsOnboarded(true);
        localStorage.setItem('elevate_user_email', guestEmail);
        localStorage.setItem('elevate_session_token', guestToken);
        localStorage.setItem('elevate_is_onboarded', 'true');

        // 2. Save parsed resume to guest's remote database account
        const saveJson = await safeFetchJson('/api/v1/resumes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${guestToken}`
          },
          body: JSON.stringify({ resume: parsed })
        });
        if (saveJson.data) {
          setResumes([saveJson.data, ...resumes]);
          setActiveResumeId(saveJson.data.id);
          setCurrentView('builder');
          return;
        }
      }
    } catch (err) {
      console.error('Failed to securely register instant guest account:', err);
    }

    // Fallback if API fails
    setUserEmail(guestEmail);
    setIsOnboarded(true);
    localStorage.setItem('elevate_user_email', guestEmail);
    localStorage.setItem('elevate_is_onboarded', 'true');
    setResumes([parsed, ...resumes]);
    setActiveResumeId(parsed.id);
    setCurrentView('builder');
  };

  if (!userEmail) {
    if (currentView === 'auth-login' || currentView === 'auth-register') {
      return (
        <Auth
          onSuccess={handleAuthSuccess}
          onCancel={() => setCurrentView('landing')}
        />
      );
    }
    return (
      <MarketingLanding
        onGetStarted={() => setCurrentView('auth-register')}
        onLogin={() => setCurrentView('auth-login')}
        onInstantResumeParsed={handleInstantResumeParsed}
        reduceMotion={settings.reduceMotion}
      />
    );
  }

  if (!isOnboarded) {
    return (
      <Onboarding
        onComplete={handleOnboardingComplete}
        onCompleteWithParsedResume={handleOnboardingWithParsedResume}
        onCancel={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {isOffline && (
        <div className="bg-amber-500 text-white text-xs font-bold py-2 px-4 text-center flex items-center justify-center space-x-2 z-50 shrink-0 no-print">
          <CircleWarning />
          <span>You are currently offline. Local changes will save and backup sync automatically when connection restores.</span>
        </div>
      )}

      {/* Primary Global App Navigation Shell */}
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 h-16 shrink-0 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          
          <div
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center space-x-2.5 cursor-pointer hover:opacity-85 select-none"
          >
            <div className="p-2 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <span className="font-display font-bold text-base tracking-tight text-slate-800 dark:text-white">
              Elevate Resume
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-1.5">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'analyzer', label: 'ATS Analyzer', icon: FileText },
              { id: 'jd-match', label: 'JD Matcher', icon: Target },
              { id: 'cover-letter', label: 'Cover Letter', icon: Sparkles },
              { id: 'settings', label: 'Settings', icon: User }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = currentView === tab.id || (tab.id === 'dashboard' && currentView === 'builder');
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentView(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/35 text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/30 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-3">
            
            <button
              onClick={() => setCurrentView('notifications')}
              className={`p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors relative ${
                currentView === 'notifications' ? 'bg-slate-100 dark:bg-slate-900' : ''
              }`}
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-blue-600 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentView('settings')}
              className={`p-2 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg transition-all flex items-center space-x-2 ${
                currentView === 'settings' ? 'bg-slate-100 dark:bg-slate-900' : ''
              }`}
            >
              <div className="w-7.5 h-7.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs uppercase border border-blue-100 dark:border-blue-900/30">
                {userEmail.substring(0, 2)}
              </div>
              <span className="text-xxs font-bold text-slate-600 dark:text-slate-400 hidden sm:inline max-w-[80px] truncate">
                {userEmail.split('@')[0]}
              </span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 bg-slate-100 dark:bg-slate-900 text-slate-500 rounded-xl md:hidden"
            >
              <Menu className="w-4.5 h-4.5" />
            </button>
          </div>

        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm md:hidden flex justify-end no-print">
          <div className="w-2/3 max-w-[280px] bg-white dark:bg-slate-950 h-full p-6 border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-sm text-blue-600">Navigation</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 hover:bg-slate-100 rounded">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="flex flex-col space-y-2">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                  { id: 'analyzer', label: 'ATS Analyzer', icon: FileText },
                  { id: 'jd-match', label: 'JD Matcher', icon: Target },
                  { id: 'cover-letter', label: 'Cover Letter', icon: Sparkles },
                  { id: 'settings', label: 'Settings', icon: User },
                  { id: 'notifications', label: 'Notifications', icon: Bell }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = currentView === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setCurrentView(tab.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-xs font-semibold ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                          : 'text-slate-500 hover:text-slate-850'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-2.5 px-4 py-3 text-red-500 font-bold text-xs"
            >
              <LogOut className="w-4.5 h-4.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      <main className="flex-grow">
        {renderCurrentView()}
      </main>

    </div>
  );
}

function CircleWarning() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}
