import React, { useState } from 'react';
import { AlertTriangle, Bell, Laptop, Lock, Moon, Shield, Sparkles, Sun, Trash2, User } from 'lucide-react';
import { UserSettings, UserSession } from '../types';

interface SettingsProps {
  userEmail: string;
  settings: UserSettings;
  onUpdateSettings: (updated: UserSettings) => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
}

export default function Settings({
  userEmail,
  settings,
  onUpdateSettings,
  onLogout,
  onDeleteAccount
}: SettingsProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'appearance' | 'notifications' | 'devices'>('profile');

  // Security mocks
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Deletion locks
  const [deleteEmailConfirm, setDeleteEmailConfirm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Session mocks
  const [sessions, setSessions] = useState<UserSession[]>([
    { id: 'sess-1', deviceName: 'MacBook Pro (Chrome)', lastActive: 'Active now', isCurrent: true },
    { id: 'sess-2', deviceName: 'iPhone 15 Pro (Safari)', lastActive: '2 hours ago', isCurrent: false },
    { id: 'sess-3', deviceName: 'Windows Desktop (Firefox)', lastActive: 'Yesterday', isCurrent: false }
  ]);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword || !newPassword) return;
    setPasswordSuccess(true);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  const handleRevokeSession = (id: string) => {
    setSessions(sessions.filter((s) => s.id !== id));
  };

  const handleThemeChange = (theme: 'system' | 'light' | 'dark') => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    onUpdateSettings({
      ...settings,
      theme
    });
  };

  const handleToggleNotification = (key: keyof UserSettings['notifications']) => {
    onUpdateSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: !settings.notifications[key]
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">Settings & Profiles</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-sans font-light mt-1">Configure profile coordinates, local security keys, and display preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        
        {/* Navigation Accordion/Tabs */}
        <div className="w-full md:w-1/4 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible p-1 border-b md:border-b-0 md:border-r border-slate-200/50 dark:border-slate-800/50 shrink-0 space-x-2 md:space-x-0 md:space-y-1 scrollbar-none">
          {[
            { id: 'profile', label: 'User Profile', icon: User },
            { id: 'security', label: 'Security & Access', icon: Shield },
            { id: 'appearance', label: 'Display Theme', icon: Sun },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'devices', label: 'Logged Devices', icon: Laptop }
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center space-x-2.5 px-4 py-3 rounded-lg text-xs font-semibold transition-all shrink-0 text-left ${
                  activeTab === t.id
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/10'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-900/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Configurations Forms Content */}
        <div className="flex-grow w-full md:w-3/4">
          
          {/* 1. Profile coordinate values */}
          {activeTab === 'profile' && (
            <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-6">
              <span className="block text-xxs font-bold text-slate-400 uppercase tracking-wider">Account Credentials</span>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xxs font-semibold uppercase text-slate-400">Registered Email</label>
                  <input
                    type="email"
                    disabled
                    value={userEmail}
                    className="w-full max-w-md px-3.5 py-2.5 bg-slate-100 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 text-slate-400 rounded-xl text-xs select-none cursor-not-allowed"
                  />
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-850">
                  <button
                    onClick={onLogout}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold"
                  >
                    Sign Out Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. Security Option forms */}
          {activeTab === 'security' && (
            <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-6">
              <span className="block text-xxs font-bold text-slate-400 uppercase tracking-wider">Modify Security Password</span>

              {passwordSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 text-emerald-600 rounded-xl text-xs">
                  Your profile secure password key was updated successfully.
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                <div className="space-y-1">
                  <label className="text-xxs font-semibold uppercase text-slate-400">Current Password</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xxs font-semibold uppercase text-slate-400">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xxs font-semibold uppercase text-slate-400">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!newPassword || newPassword !== confirmPassword}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                >
                  Save Password
                </button>
              </form>
            </div>
          )}

          {/* 3. Appearance Light/Dark toggle + Reduce Motion */}
          {activeTab === 'appearance' && (
            <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-6">
              <span className="block text-xxs font-bold text-slate-400 uppercase tracking-wider">Display Appearances</span>

              <div className="space-y-6">
                
                {/* Theme toggles */}
                <div className="space-y-2">
                  <label className="block text-xxs font-bold text-slate-400 uppercase tracking-wider">Theme Mode</label>
                  <div className="flex gap-2 max-w-sm">
                    {[
                      { id: 'light', label: 'Light', icon: Sun },
                      { id: 'dark', label: 'Dark', icon: Moon },
                      { id: 'system', label: 'System', icon: Laptop }
                    ].map((mode) => {
                      const Icon = mode.icon;
                      return (
                        <button
                          key={mode.id}
                          onClick={() => handleThemeChange(mode.id as any)}
                          className={`flex-1 flex flex-col items-center justify-center p-3 border rounded-xl transition-all ${
                            settings.theme === mode.id
                              ? 'border-blue-600 bg-blue-50/10 text-blue-600 dark:text-blue-400'
                              : 'border-slate-200 dark:border-slate-800 text-slate-500'
                          }`}
                        >
                          <Icon className="w-4 h-4 mb-1.5" />
                          <span className="text-xxs font-bold">{mode.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Reduce Motion */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="block text-xs font-semibold">Reduce System Motion</span>
                    <span className="block text-xxs text-slate-400 font-light">Disables the interactive 3D/constellation rendering for battery efficiency.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.reduceMotion}
                    onChange={(e) => onUpdateSettings({ ...settings, reduceMotion: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                </div>

              </div>
            </div>
          )}

          {/* 4. Notification Schedules */}
          {activeTab === 'notifications' && (
            <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-6">
              <span className="block text-xxs font-bold text-slate-400 uppercase tracking-wider">Notification Subscriptions</span>

              <div className="space-y-4">
                {[
                  { key: 'analysisComplete', label: 'ATS Analysis Complete', desc: 'Alert when a resume rating or parser benchmark completes compiling.' },
                  { key: 'jdMatchReady', label: 'Job Alignment Match Reports', desc: 'Alert when target role skills-gap comparison matrices are compiled.' },
                  { key: 'syncStatus', label: 'Syncing & Backup States', desc: 'Telemetry alerts about local backup sync status records.' },
                  { key: 'productUpdates', label: 'Product releases', desc: 'Occasional brief notifications about structural templates or tool features.' }
                ].map((item) => (
                  <div key={item.key} className="flex items-start justify-between py-2">
                    <div className="space-y-0.5 pr-4">
                      <span className="block text-xs font-semibold">{item.label}</span>
                      <span className="block text-xxs text-slate-400 font-light leading-normal">{item.desc}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications[item.key as keyof UserSettings['notifications']]}
                      onChange={() => handleToggleNotification(item.key as any)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 shrink-0 mt-0.5"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Active Devices/Sessions */}
          {activeTab === 'devices' && (
            <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-6">
              <span className="block text-xxs font-bold text-slate-400 uppercase tracking-wider">Active Secure Sessions</span>

              <div className="space-y-4">
                {sessions.map((sess) => (
                  <div key={sess.id} className="p-3.5 bg-slate-50 dark:bg-slate-950/30 border border-slate-200/35 dark:border-slate-800/35 rounded-2xl flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="block text-xs font-semibold text-slate-900 dark:text-slate-100">{sess.deviceName}</span>
                        {sess.isCurrent && (
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 text-[9px] font-bold rounded">
                            This Device
                          </span>
                        )}
                      </div>
                      <span className="block text-xxs text-slate-400">Last activity: {sess.lastActive}</span>
                    </div>

                    {!sess.isCurrent && (
                      <button
                        onClick={() => handleRevokeSession(sess.id)}
                        className="text-xxs font-bold text-red-600 hover:text-red-500 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-950/10"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Account Deletion card (always nested safely in bottom settings) */}
          <div className="p-6 bg-red-50/20 dark:bg-red-950/10 rounded-xl border border-red-200/40 dark:border-red-900/40 shadow-sm mt-8 space-y-5">
            <div className="flex items-start space-x-3 text-red-700 dark:text-red-400">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="font-bold text-sm">Destructive Account Deletion</h3>
                <p className="text-xs text-red-600 dark:text-red-350 leading-relaxed font-light">
                  Once initiated, your entire resume portfolio, ATS analytics history, target role JD-gaps, and device logs are permanently wiped.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-600/15"
            >
              Request Account Deletion
            </button>
          </div>

        </div>

      </div>

      {/* Protective Account Deletion Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
            <div className="space-y-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Are you absolutely sure?</h3>
              <p className="text-xs text-slate-500 font-light leading-relaxed">
                To prevent accidental clicks, type your registered email <strong className="font-semibold text-slate-700 dark:text-slate-300">{userEmail}</strong> below to authorize deletion.
              </p>
            </div>

            <input
              type="text"
              value={deleteEmailConfirm}
              onChange={(e) => setDeleteEmailConfirm(e.target.value)}
              placeholder="Type your email"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl text-xs"
            />

            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteEmailConfirm('');
                }}
                className="px-4 py-2 text-xs font-semibold hover:bg-slate-100 rounded-xl text-slate-500"
              >
                Cancel
              </button>
              <button
                disabled={deleteEmailConfirm !== userEmail}
                onClick={() => {
                  onDeleteAccount();
                  setShowDeleteModal(false);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold disabled:opacity-40 flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Erasure</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
