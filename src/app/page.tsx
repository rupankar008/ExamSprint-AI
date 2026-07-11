'use client';

import React, { useState } from 'react';
import { useApp } from '@/components/AppContext';
import AuthScreen from '@/components/AuthScreen';
import TeacherPortal from '@/components/TeacherPortal';
import Onboarding from '@/components/Onboarding';
import DynamicBackground from '@/components/DynamicBackground';
import Dashboard from '@/components/Dashboard';
import SolverView from '@/components/SolverView';
import MockTests from '@/components/MockTests';
import StudyCenter from '@/components/StudyCenter';
import AnalyticsView from '@/components/AnalyticsView';
import StudentHomework from '@/components/StudentHomework';
import MultiQuestionSolver from '@/components/MultiQuestionSolver';
import { getExamConfig } from '@/lib/syllabus';
import { 
  Compass, Sparkles, Clock, BookOpen, BarChart, 
  Flame, Award, LogOut, Info, Settings, HelpCircle, BookOpenCheck, ListOrdered
} from 'lucide-react';

export default function Home() {
  const { 
    profile, loading, activeTheme, updateProfile, 
    sessionEmail, login, logout, activeHomeworkWorksheet, setActiveHomeworkWorksheet 
  } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') || '' : '');

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#05070c] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[var(--theme-accent)] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Encrypting Sync Engine...</span>
        </div>
      </main>
    );
  }

  // Route to Auth if not logged in
  if (!sessionEmail || !profile) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-[#05070c] relative overflow-hidden select-none">
        <DynamicBackground />
        <AuthScreen onAuthComplete={(prof, email) => login(prof, email)} />
      </main>
    );
  }

  // Route to Teacher Portal if logged in as teacher role
  if (profile.role === 'teacher') {
    return (
      <main className="min-h-screen bg-[#05070c] text-white relative">
        <DynamicBackground />
        <TeacherPortal profile={profile} onLogout={() => logout()} />
      </main>
    );
  }

  const examConfig = getExamConfig(profile.targetExam);

  const handleResetProfile = () => {
    if (confirm("Reset local database and clear all sync caches?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <main 
      className="min-h-screen flex flex-col pb-24 sm:pb-6 relative text-white transition-colors duration-500 overflow-x-hidden font-sans"
      style={{
        background: 'radial-gradient(circle at top, #090e1a 0%, #03050a 100%)',
      }}
    >
      <DynamicBackground theme={activeTheme as any} />

      {/* TOP DESKTOP HEADER BAR */}
      <header className="w-full max-w-6xl mx-auto px-4 py-4.5 flex justify-between items-center z-10 border-b border-white/5 bg-[#03050a]/40 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg overflow-hidden border border-white/10 shadow-md shadow-blue-500/10 flex items-center justify-center bg-slate-950">
            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-extrabold text-sm tracking-tight text-gradient">ExamSprint AI</span>
          <span className="text-[8px] bg-blue-500/10 text-blue-400 font-black border border-blue-500/20 px-1.5 py-0.5 rounded tracking-wide uppercase">LMS PRO</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-orange-400 font-black text-xs" title="Daily solved streak">
              <Flame size={14} fill="currentColor" />
              <span>{profile.streakCount || 1}</span>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs" title="XP level progress">
              <Award size={15} className="text-yellow-400" />
              <span>Lv. {profile.level}</span>
              <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-400 to-amber-500"
                  style={{ width: `${profile.xp}%` }}
                />
              </div>
            </div>

            <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider text-[var(--theme-text-primary)]">
              {examConfig.name.split(' ')[0]}
            </span>

            <button 
              onClick={() => setSettingsOpen(true)}
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-[var(--theme-text-secondary)] hover:text-white transition-all cursor-pointer"
            >
              <Settings size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN VIEW CONTENT CONTAINER */}
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 overflow-y-auto mb-6">
        {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
        {activeTab === 'solver' && <SolverView />}
        {activeTab === 'mock-tests' && <MockTests />}
        {activeTab === 'study-center' && <StudyCenter />}
        {activeTab === 'analytics' && <AnalyticsView />}
        {activeTab === 'homework' && (
          <StudentHomework 
            profile={profile} 
          />
        )}
        {activeTab === 'multi-solver' && (
          <MultiQuestionSolver 
            initialFileBase64={activeHomeworkWorksheet?.fileData}
            initialFileName={activeHomeworkWorksheet?.fileName}
            onBackToHomework={() => {
              setActiveHomeworkWorksheet(null);
              setActiveTab('homework');
            }}
          />
        )}
        {activeTab === 'creator' && <StudyCenter initialTab="creator" />}
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-4 inset-x-4 z-40 max-w-lg mx-auto sm:hidden glass-panel px-3 py-2.5 rounded-2xl flex items-center justify-between">
        {[
          { id: 'dashboard', label: 'Home', icon: Compass },
          { id: 'solver', label: 'Solver', icon: Sparkles },
          { id: 'homework', label: 'Tasks', icon: BookOpenCheck },
          { id: 'study-center', label: 'Library', icon: BookOpen },
          { id: 'creator', label: 'Creator', icon: Info }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center p-1 cursor-pointer transition-all ${
                isActive ? 'text-[var(--theme-accent)] scale-110' : 'text-[var(--theme-text-secondary)] hover:text-white'
              }`}
            >
              <tab.icon size={17} className={isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'} />
              <span className="text-[7.5px] font-bold mt-1 tracking-wider">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* DESKTOP SIDEBAR/NAVBAR OPTION (Shown on tablet and up) */}
      <div className="hidden sm:flex justify-center mb-6 shrink-0 z-10">
        <div className="glass-panel p-1 rounded-xl flex gap-1.5">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Compass },
            { id: 'solver', label: 'AI Math Solver', icon: Sparkles },
            { id: 'homework', label: 'Homework & Batches', icon: BookOpenCheck },
            { id: 'mock-tests', label: 'Mock Test Engine', icon: Clock },
            { id: 'study-center', label: 'Study Center', icon: BookOpen },
            { id: 'analytics', label: 'Analytics', icon: BarChart },
            { id: 'creator', label: 'Meet Creator', icon: Info }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 py-2 px-4 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  isActive ? 'bg-[var(--theme-accent)] text-white shadow-md' : 'text-[var(--theme-text-secondary)] hover:text-white'
                }`}
              >
                <tab.icon size={13} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SYSTEM SETTINGS MODAL */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-2xl p-5 sm:p-6 animate-fade-in text-left">
            <h2 className="text-lg font-bold text-gradient mb-2">User Workspace</h2>
            <p className="text-xs text-[var(--theme-text-secondary)] mb-6">Manage settings and profile caches locally.</p>

            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center p-2.5 bg-white/5 border border-white/5 rounded-xl">
                <div>
                  <span className="font-bold text-white block">Username</span>
                  <span className="text-[10px] text-[var(--theme-text-secondary)]">{profile.name} ({profile.role})</span>
                </div>
                <span className="text-lg">🧑</span>
              </div>

              {profile.email && (
                <div className="flex justify-between items-center p-2.5 bg-white/5 border border-white/5 rounded-xl">
                  <div>
                    <span className="font-bold text-white block">Email</span>
                    <span className="text-[10px] text-[var(--theme-text-secondary)]">{profile.email}</span>
                  </div>
                  <span className="text-lg">✉️</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-white block">Gemini API Key</label>
                <input
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => {
                    setTempApiKey(e.target.value);
                    localStorage.setItem('gemini_api_key', e.target.value);
                  }}
                  placeholder="Paste your Gemini AI API Key here..."
                  className="w-full py-2 px-3 bg-white/5 border border-white/10 rounded-xl focus:border-[var(--theme-accent)] focus:outline-none text-[11px] text-white"
                />
                <span className="text-[9px] text-slate-500">API Key is saved locally in your browser storage.</span>
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-6 border-t border-white/5 pt-4">
              <button 
                onClick={handleResetProfile}
                className="py-2 px-4 bg-red-600/20 hover:bg-red-600/30 border border-red-500/20 text-red-400 font-bold text-xs rounded-xl transition-all cursor-pointer mr-auto"
              >
                Reset Database
              </button>
              <button 
                onClick={() => logout()}
                className="py-2 px-4 bg-white/5 hover:bg-white/10 text-xs font-bold rounded-xl mr-1"
              >
                Logout
              </button>
              <button 
                onClick={() => setSettingsOpen(false)}
                className="py-2 px-4 bg-[var(--theme-accent)] text-xs font-bold rounded-xl text-white shadow-md"
              >
                Close Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
