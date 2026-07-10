import { useState, useEffect } from 'react';
import { Award, Bell, Briefcase, FileText, Laptop, LayoutDashboard, LogOut, Menu, Moon, Shield, Sparkles, Sun, Target, User, X } from 'lucide-react';
import { Resume, AppNotification, UserSettings } from './types';
import { mockResumes } from './data/mockResumes';

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

export default function App() {
  // 1. Session States
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    return localStorage.getItem('elevate_user_email') || null;
  });
  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    return localStorage.getItem('elevate_is_onboarded') === 'true';
  });

  // 2. Navigation Routing
  // 'dashboard' | 'builder' | 'analyzer' | 'jd-match' | 'settings' | 'notifications' | 'export'
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [activeResumeId, setActiveResumeId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 3. Central Resume Database with localStorage Persistence
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
        createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        read: false
      },
      {
        id: 'notif-2',
        type: 'info',
        title: 'ATS Parser Auditing Configured',
        body: 'We updated keyword density benchmark indices to match the 2026 hiring metrics. Run an analysis to check alignments.',
        createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
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
      // Trigger a clean reconnection notification
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
    localStorage.setItem('elevate_resumes', JSON.stringify(resumes));
  }, [resumes]);

  useEffect(() => {
    localStorage.setItem('elevate_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('elevate_settings', JSON.stringify(settings));
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
  const handleAuthSuccess = (email: string) => {
    setUserEmail(email);
    localStorage.setItem('elevate_user_email', email);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUserEmail(null);
    setIsOnboarded(false);
    localStorage.removeItem('elevate_user_email');
    localStorage.removeItem('elevate_is_onboarded');
    setCurrentView('dashboard');
  };

  const handleDeleteAccount = () => {
    // Completely wipe all local states
    setUserEmail(null);
    setIsOnboarded(false);
    setResumes(mockResumes);
    setNotifications([]);
    localStorage.clear();
    setCurrentView('dashboard');
  };

  // Onboarding Completed
  const handleOnboardingComplete = (data: {
    targetTitle: string;
    experienceLevel: string;
    skills: string[];
  }) => {
    setIsOnboarded(true);
    localStorage.setItem('elevate_is_onboarded', 'true');

    // Create initial custom template resume for the onboarded target role
    const newResume: Resume = {
      id: `res-${Date.now()}`,
      title: `${data.targetTitle} Template`,
      lastEdited: new Date().toISOString(),
      atsScore: 50,
      personalInfo: {
        fullName: userEmail ? userEmail.split('@')[0] : 'Professional Candidate',
        email: userEmail || 'candidate@example.com',
        phone: '',
        location: '',
        website: '',
        linkedin: '',
        github: ''
      },
      summary: `Motivated and goal-driven professional targeting a career advancement as a ${data.targetTitle}. Dedicated to utilizing solid competencies in ${data.skills.slice(0, 3).join(', ')} to coordinate operations and deliver valuable engineering milestones.`,
      experience: [],
      education: [],
      projects: [],
      skills: data.skills,
      certifications: [],
      languages: []
    };

    setResumes([newResume, ...resumes]);
    setActiveResumeId(newResume.id);
    setCurrentView('builder');

    // Emit confirmation notification
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
  const handleCreateResume = () => {
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

    setResumes([newResume, ...resumes]);
    setActiveResumeId(newResume.id);
    setCurrentView('builder');
  };

  const handleDuplicateResume = (id: string) => {
    const source = resumes.find(r => r.id === id);
    if (!source) return;

    const copy: Resume = JSON.parse(JSON.stringify(source));
    copy.id = `res-${Date.now()}`;
    copy.title = `${source.title} (Copy)`;
    copy.lastEdited = new Date().toISOString();

    setResumes([copy, ...resumes]);

    // Push notification
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

  const handleDeleteResume = (id: string) => {
    const target = resumes.find(r => r.id === id);
    setResumes(resumes.filter(r => r.id !== id));
    
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

  const handleSaveResume = (updated: Resume) => {
    setResumes(resumes.map(r => r.id === updated.id ? updated : r));
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
          />
        );

      case 'jd-match':
        return <JDMatch resumes={resumes} />;

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

  // View-checking for global shell visibility (hide shell on landing/auth/onboarding)
  const isGlobalShellVisible = userEmail !== null && isOnboarded;

  // Unread notification counter
  const unreadCount = notifications.filter(n => !n.read).length;

  // Render entry views depending on Auth/Onboarding levels
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
        reduceMotion={settings.reduceMotion}
      />
    );
  }

  if (!isOnboarded) {
    return (
      <Onboarding
        onComplete={handleOnboardingComplete}
        onCancel={handleLogout}
      />
    );
  }

  // Large Navigation Frame
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Persisted Offline Banner */}
      {isOffline && (
        <div className="bg-amber-500 text-white text-xs font-bold py-2 px-4 text-center flex items-center justify-center space-x-2 z-50 shrink-0 no-print">
          <CircleWarning />
          <span>You are currently offline. Local changes will save and backup sync automatically when connection restores.</span>
        </div>
      )}

      {/* Primary Global App Navigation Shell */}
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 h-16 shrink-0 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          
          {/* Logo brand */}
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

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-1.5">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'analyzer', label: 'ATS Analyzer', icon: FileText },
              { id: 'jd-match', label: 'JD Matcher', icon: Target },
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

          {/* Right utility toolbar */}
          <div className="flex items-center space-x-3">
            
            {/* Notification bell utility */}
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

            {/* Avatar Profile */}
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

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 bg-slate-100 dark:bg-slate-900 text-slate-500 rounded-xl md:hidden"
            >
              <Menu className="w-4.5 h-4.5" />
            </button>
          </div>

        </div>
      </nav>

      {/* Mobile Drawer Menu overlays */}
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

      {/* Core Display Content frame */}
      <main className="flex-grow">
        {renderCurrentView()}
      </main>

    </div>
  );
}

// Simple internal alert indicator helper
function CircleWarning() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}
