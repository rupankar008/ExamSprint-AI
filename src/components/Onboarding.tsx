'use client';

import React, { useState } from 'react';
import { UserProfile, saveProfile } from '../lib/localDb';
import { EXAM_LIST, SYLLABUS_CHAPTERS } from '../lib/syllabus';
import { 
  User, BookOpen, Target, Shield, Compass, Sparkles, 
  ArrowRight, ArrowLeft, Check, Flame, Award, BookOpenCheck 
} from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const AVATARS = [
  { id: 'aryabhata', name: 'Aryabhata', emoji: '🧑‍🚀', desc: 'Math Pioneer' },
  { id: 'ramanujan', name: 'Ramanujan', emoji: '🧐', desc: 'Number Theory' },
  { id: 'shakti', name: 'Shakti', emoji: '👮‍♀️', desc: 'Police Badge' },
  { id: 'agni', name: 'Agni', emoji: '🚀', desc: 'Strategic Aim' },
  { id: 'lakshya', name: 'Lakshya', emoji: '🎯', desc: 'Focus Archer' }
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // State for onboarding form
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: '',
    avatar: 'lakshya',
    age: '',
    gender: 'Prefer not to say',
    qualification: 'Graduate',
    occupation: 'Student',
    language: 'English',
    targetExam: 'ssc-cgl',
    targetYear: '2026',
    dailyHours: 4,
    weakSubject: 'Quantitative Aptitude',
    strongSubject: 'General Intelligence',
    dailyGoal: '100 XP - Scholar',
    themePreference: 'auto',
    xp: 150, // Starting bonus
    coins: 50,
    level: 1,
    streakCount: 0
  });

  const nextStep = () => {
    if (step === 1 && !formData.name?.trim()) {
      alert("Please enter your name to proceed!");
      return;
    }
    setStep(s => s + 1);
  };

  const prevStep = () => {
    setStep(s => s - 1);
  };

  const handleFinish = async () => {
    setLoading(true);
    // Simulate smart AI algorithm generating study layout
    setTimeout(async () => {
      const fullProfile: UserProfile = {
        name: formData.name || 'Student',
        avatar: formData.avatar || 'lakshya',
        age: formData.age || '22',
        gender: formData.gender || 'Prefer not to say',
        qualification: formData.qualification || 'Graduate',
        occupation: formData.occupation || 'Student',
        language: formData.language || 'English',
        targetExam: formData.targetExam || 'ssc-cgl',
        targetYear: formData.targetYear || '2026',
        dailyHours: formData.dailyHours || 4,
        weakSubject: formData.weakSubject || 'Quantitative Aptitude',
        strongSubject: formData.strongSubject || 'General Intelligence',
        dailyGoal: formData.dailyGoal || '100 XP',
        themePreference: formData.themePreference || 'auto',
        xp: 150,
        coins: 50,
        level: 1,
        streakCount: 1 // Start with day 1 streak
      };
      
      await saveProfile(fullProfile);
      setLoading(false);
      onComplete(fullProfile);
    }, 2500);
  };

  const selectedAvatar = AVATARS.find(a => a.id === formData.avatar) || AVATARS[0];

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] p-4 text-white">
      {/* Brand logo showcase */}
      <div className="flex flex-col items-center mb-6">
        <img 
          src="/logo.jpg" 
          alt="ExamSprint AI Logo" 
          className="w-20 h-20 rounded-2xl shadow-2xl border border-white/10 object-cover" 
        />
        <h1 className="text-xl font-black mt-2 tracking-wide text-gradient font-sans">ExamSprint AI</h1>
        <p className="text-[10px] text-[var(--theme-text-secondary)] uppercase tracking-wider font-semibold">Learn Faster • Solve Smarter</p>
      </div>

      {/* ProgressBar */}
      <div className="w-full max-w-md mb-8">
        <div className="flex justify-between items-center text-xs text-[var(--theme-text-secondary)] mb-2">
          <span>Profile Setup</span>
          <span>Step {step} of 4</span>
        </div>
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-[var(--theme-accent)] transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      <div className="w-full max-w-lg glass-panel p-6 sm:p-8 rounded-2xl animate-fade-in">
        {step === 1 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
                <User size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold font-sans text-gradient">Who is preparing?</h2>
                <p className="text-sm text-[var(--theme-text-secondary)]">Let&apos;s personalize your ExamSprint learning space.</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--theme-text-secondary)] mb-2">Name / Nickname</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-[var(--theme-accent)] focus:outline-none transition-all text-white placeholder-white/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--theme-text-secondary)] mb-2">Choose Study Avatar</label>
                <div className="grid grid-cols-5 gap-3">
                  {AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, avatar: av.id })}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                        formData.avatar === av.id 
                          ? 'bg-[var(--theme-accent)]/20 border-[var(--theme-accent)]' 
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <span className="text-2xl mb-1">{av.emoji}</span>
                      <span className="text-[10px] truncate max-w-full font-medium">{av.name}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-[var(--theme-text-secondary)] mt-2 italic text-center">
                  Selected avatar: {selectedAvatar.emoji} <strong>{selectedAvatar.name}</strong> - {selectedAvatar.desc}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--theme-text-secondary)] mb-2">Age</label>
                  <input 
                    type="number" 
                    value={formData.age}
                    onChange={e => setFormData({ ...formData, age: e.target.value })}
                    placeholder="e.g. 21"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-[var(--theme-accent)] focus:outline-none transition-all text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--theme-text-secondary)] mb-2">Education</label>
                  <select 
                    value={formData.qualification}
                    onChange={e => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl focus:border-[var(--theme-accent)] focus:outline-none transition-all text-white"
                  >
                    <option>Secondary</option>
                    <option>Higher Secondary</option>
                    <option>Graduate</option>
                    <option>Post Graduate</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button 
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl font-semibold hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-lg shadow-indigo-600/30"
              >
                Continue <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
                <Target size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold font-sans text-gradient">Your Target Goal</h2>
                <p className="text-sm text-[var(--theme-text-secondary)]">We customize previous question models and formulas based on this.</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--theme-text-secondary)] mb-2">Target Exam</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
                  {EXAM_LIST.map((exam) => (
                    <button
                      key={exam.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, targetExam: exam.id })}
                      className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                        formData.targetExam === exam.id 
                          ? 'bg-[var(--theme-accent)]/20 border-[var(--theme-accent)]' 
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="mt-0.5">
                        {exam.theme === 'police' && <Shield size={16} className="text-blue-400" />}
                        {exam.theme === 'railway' && <Compass size={16} className="text-cyan-400" />}
                        {exam.theme === 'ssc' && <Award size={16} className="text-amber-400" />}
                        {exam.theme === 'banking' && <BookOpenCheck size={16} className="text-teal-400" />}
                        {exam.theme === 'defence' && <Flame size={16} className="text-lime-400" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold">{exam.name}</div>
                        <div className="text-[10px] text-[var(--theme-text-secondary)] mt-0.5">{exam.category.toUpperCase()} • {exam.durationMinutes} mins</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--theme-text-secondary)] mb-2">Language</label>
                  <select 
                    value={formData.language}
                    onChange={e => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl focus:border-[var(--theme-accent)] focus:outline-none transition-all text-white"
                  >
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Bengali</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--theme-text-secondary)] mb-2">Target Year</label>
                  <select 
                    value={formData.targetYear}
                    onChange={e => setFormData({ ...formData, targetYear: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl focus:border-[var(--theme-accent)] focus:outline-none transition-all text-white"
                  >
                    <option>2026</option>
                    <option>2027</option>
                    <option>2028</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--theme-text-secondary)] mb-2">Daily Study hours: {formData.dailyHours} Hours</label>
                <input 
                  type="range" 
                  min={1} 
                  max={12}
                  value={formData.dailyHours}
                  onChange={e => setFormData({ ...formData, dailyHours: parseInt(e.target.value) })}
                  className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[var(--theme-accent)]"
                />
                <div className="flex justify-between text-[10px] text-[var(--theme-text-secondary)] mt-1">
                  <span>1 Hour</span>
                  <span>6 Hours</span>
                  <span>12 Hours</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button 
                onClick={prevStep}
                className="flex items-center gap-2 px-5 py-3 border border-white/10 rounded-xl font-semibold hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
              >
                <ArrowLeft size={18} /> Back
              </button>
              <button 
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl font-semibold hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-lg"
              >
                Continue <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
                <BookOpen size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold font-sans text-gradient">Weaknesses & Strengths</h2>
                <p className="text-sm text-[var(--theme-text-secondary)]">Your AI tutor will customize mock formulas and practice cards for these chapters.</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--theme-text-secondary)] mb-2">Weak Subject</label>
                  <select 
                    value={formData.weakSubject}
                    onChange={e => setFormData({ ...formData, weakSubject: e.target.value })}
                    className="w-full px-3 py-3 bg-slate-900 border border-white/10 rounded-xl focus:border-[var(--theme-accent)] focus:outline-none transition-all text-white text-sm"
                  >
                    <option>Quantitative Aptitude</option>
                    <option>General Intelligence</option>
                    <option>English Language</option>
                    <option>General Awareness</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--theme-text-secondary)] mb-2">Strong Subject</label>
                  <select 
                    value={formData.strongSubject}
                    onChange={e => setFormData({ ...formData, strongSubject: e.target.value })}
                    className="w-full px-3 py-3 bg-slate-900 border border-white/10 rounded-xl focus:border-[var(--theme-accent)] focus:outline-none transition-all text-white text-sm"
                  >
                    <option>Quantitative Aptitude</option>
                    <option>General Intelligence</option>
                    <option>English Language</option>
                    <option>General Awareness</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--theme-text-secondary)] mb-2">Daily Practice Goal</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { val: '50 XP - Casual', desc: '10-15m / day' },
                    { val: '100 XP - Scholar', desc: '30-40m / day' },
                    { val: '200 XP - Master', desc: '1h+ / day' }
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setFormData({ ...formData, dailyGoal: item.val })}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                        formData.dailyGoal === item.val 
                          ? 'bg-[var(--theme-accent)]/20 border-[var(--theme-accent)]' 
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <span className="text-xs font-bold truncate max-w-full">{item.val.split(' ')[0]} XP</span>
                      <span className="text-[9px] text-[var(--theme-text-secondary)] mt-0.5">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--theme-text-secondary)] mb-2">Theme Preference</label>
                <select 
                  value={formData.themePreference}
                  onChange={e => setFormData({ ...formData, themePreference: e.target.value as any })}
                  className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl focus:border-[var(--theme-accent)] focus:outline-none transition-all text-white"
                >
                  <option value="auto">🌟 Auto Exam Theme (Highly Recommended)</option>
                  <option value="railway">🚈 Railway Theme (Slate/Blue)</option>
                  <option value="police">🛡️ Police Theme (Navy/Gold)</option>
                  <option value="ssc">🏛️ SSC Theme (Professional Charcoal/Orange)</option>
                  <option value="banking">💰 Banking Theme (Forest Green/Teal)</option>
                  <option value="defence">🎖️ Defence Theme (Tactical Carbon/Olive)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button 
                onClick={prevStep}
                className="flex items-center gap-2 px-5 py-3 border border-white/10 rounded-xl font-semibold hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
              >
                <ArrowLeft size={18} /> Back
              </button>
              <button 
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl font-semibold hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-lg"
              >
                Next <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="text-center py-6">
            {!loading ? (
              <div>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-tr from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white text-3xl shadow-lg shadow-emerald-500/20">
                    <Check size={32} />
                  </div>
                </div>
                <h2 className="text-2xl font-bold font-sans text-gradient mb-2">Ready to Sprint!</h2>
                <p className="text-sm text-[var(--theme-text-secondary)] max-w-sm mx-auto mb-8">
                  Your personalized study schedule is prepared. Click below to compile your exam dashboard.
                </p>

                <div className="flex justify-center">
                  <button 
                    onClick={handleFinish}
                    className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-lg w-full sm:w-auto justify-center"
                  >
                    <Sparkles size={20} /> Compile My Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                {/* Micro animation for generating dashboard */}
                <div className="relative w-24 h-24 mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-white/10" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-[var(--theme-accent)] animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center text-4xl animate-pulse">
                    🤖
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gradient mb-2">Analyzing Target Core Syllabus...</h3>
                <p className="text-xs text-[var(--theme-text-secondary)] animate-pulse">
                  Preloading formulas, loading shortcut solvers, and compiling local mock benchmarks...
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
