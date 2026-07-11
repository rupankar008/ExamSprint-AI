'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from './AppContext';
import { getExamConfig, EXAM_LIST } from '../lib/syllabus';
import { cloudDb } from '../lib/cloudDb';
import { getRandomQuote, Quote } from '../lib/quotes';
import { solveMathOffline } from '../lib/mathEngine';
import { 
  Flame, Award, Sparkles, Brain, Clock, ChevronRight, 
  RefreshCw, TrendingUp, CheckCircle, BookOpen, AlertCircle 
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { profile, activeTheme, changeExam, awardXP, incrementStreak, streakDays } = useApp();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [examSelectorOpen, setExamSelectorOpen] = useState(false);
  const [solvedChallenge, setSolvedChallenge] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  const examConfig = profile ? getExamConfig(profile.targetExam) : EXAM_LIST[0];

  // Rotate motivational quotes
  useEffect(() => {
    if (profile) {
      setQuote(getRandomQuote(examConfig.category));
    }
  }, [profile, examConfig]);

  const rotateQuote = () => {
    if (profile) {
      setQuote(getRandomQuote(examConfig.category, quote ? [quote.id] : []));
    }
  };

  // Exam Target Countdown calculation
  const targetYear = profile?.targetYear || '2026';
  const examDate = new Date(`2026-09-15T09:00:00`); // Simulated target date
  const [daysLeft, setDaysLeft] = useState(60);

  useEffect(() => {
    const diff = examDate.getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    setDaysLeft(days > 0 ? days : 45);
  }, []);

  // 31 High-Yield dynamic math questions (one for each day of the month)
  const DAILY_CHALLENGES = [
    {
      text: "A and B can do a work in 12 days, B and C in 15 days, and C and A in 20 days. How many days will they take to complete it together?",
      options: ["8 days", "10 days", "12 days", "6 days"],
      correctIndex: 1, // 10 days
      xpReward: 30,
      coinReward: 10
    },
    {
      text: "Find the unit digit in the product 4387^245 × 621^72.",
      options: ["7", "9", "3", "1"],
      correctIndex: 0, // 7
      xpReward: 30,
      coinReward: 10
    },
    {
      text: "The price of sugar increases by 25%. By what percentage should consumption be reduced to keep expenditure constant?",
      options: ["25%", "20%", "15%", "16.66%"],
      correctIndex: 1, // 20%
      xpReward: 30,
      coinReward: 10
    },
    {
      text: "If standard deviation of a dataset is 6, what is its variance?",
      options: ["36", "12", "6", "3"],
      correctIndex: 0, // 36
      xpReward: 35,
      coinReward: 12
    },
    {
      text: "A boat goes 24 km upstream and 28 km downstream in 6 hours. It goes 30 km upstream and 21 km downstream in 6.5 hours. Find the speed of the boat in still water.",
      options: ["10 km/h", "8 km/h", "12 km/h", "14 km/h"],
      correctIndex: 0, // 10 km/h
      xpReward: 40,
      coinReward: 15
    },
    {
      text: "Find the remainder when 2^100 is divided by 101.",
      options: ["1", "2", "100", "99"],
      correctIndex: 0, // 1
      xpReward: 30,
      coinReward: 10
    },
    {
      text: "If x + 1/x = 5, find the value of x^5 + 1/x^5.",
      options: ["2525", "2530", "2500", "2480"],
      correctIndex: 0, // 2525
      xpReward: 35,
      coinReward: 12
    },
    {
      text: "Two pipes A and B can fill a cistern in 37.5 minutes and 45 minutes respectively. Both pipes are opened. The cistern will be filled in just half an hour, if pipe B is turned off after how many minutes?",
      options: ["9 minutes", "15 minutes", "5 minutes", "12 minutes"],
      correctIndex: 0, // 9 minutes
      xpReward: 35,
      coinReward: 12
    },
    {
      text: "A dishonest shopkeeper sells sugar at cost price but uses a weight of 950g for a kg. Find his gain percentage.",
      options: ["5.26%", "5.0%", "5.5%", "4.76%"],
      correctIndex: 0, // 5.26%
      xpReward: 30,
      coinReward: 10
    },
    {
      text: "In a triangle ABC, if angle bisector of B and C meet at O. If angle A is 70°, find angle BOC.",
      options: ["125°", "110°", "145°", "135°"],
      correctIndex: 0, // 125°
      xpReward: 30,
      coinReward: 10
    },
    {
      text: "If a:b = 2:3 and b:c = 4:5, find the ratio a:b:c.",
      options: ["8:12:15", "8:10:15", "6:9:15", "2:4:5"],
      correctIndex: 0, // 8:12:15
      xpReward: 30,
      coinReward: 10
    },
    {
      text: "The speed of a train is 72 km/h. How much time will it take to cross a pole of length 0 if train length is 200m?",
      options: ["10 seconds", "12 seconds", "8 seconds", "15 seconds"],
      correctIndex: 0, // 10 seconds
      xpReward: 30,
      coinReward: 10
    }
  ];

  // Rotate based on current day of month (1-based index)
  const currentDay = new Date().getDate();
  const challengeQuestion = DAILY_CHALLENGES[(currentDay - 1) % DAILY_CHALLENGES.length];

  const handleChallengeSubmit = () => {
    if (selectedOption === challengeQuestion.options[challengeQuestion.correctIndex]) {
      awardXP(challengeQuestion.xpReward, challengeQuestion.coinReward);
      incrementStreak(); // Award day streak
      setSolvedChallenge(true);
      alert(`🎉 Correct Answer! You earned +${challengeQuestion.xpReward} XP and +${challengeQuestion.coinReward} Coins.`);
    } else {
      alert("❌ Incorrect. Try using the Vedic shortcuts in the Solver!");
    }
  };

  // Get active registered students from virtual cloud DB to create dynamic rankings
  const activeStudents = cloudDb.getStudents();
  
  // Format dynamic leaderboard ranking
  const mockLeaderboard = activeStudents.map((stud) => {
    let badge = "👑 Master";
    if (stud.level < 2) badge = "🏃 Runner";
    else if (stud.level < 4) badge = "🎖️ Officer";
    else if (stud.level < 5) badge = "⚡ Scholar";
    
    return {
      name: stud.name,
      exam: stud.targetExam,
      xp: stud.level * 100 + stud.xp,
      badge: badge
    };
  });

  // Append logged-in profile if not already present
  if (profile && !mockLeaderboard.some(l => l.name === profile.name)) {
    let badge = "👑 Master";
    if (profile.level < 2) badge = "🏃 Runner";
    else if (profile.level < 4) badge = "🎖️ Officer";
    else if (profile.level < 5) badge = "⚡ Scholar";

    mockLeaderboard.push({
      name: profile.name,
      exam: profile.targetExam,
      xp: profile.level * 100 + profile.xp,
      badge: badge
    });
  }

  // Sort and assign rank
  const sortedLeaderboard = mockLeaderboard
    .sort((a, b) => b.xp - a.xp)
    .map((item, idx) => ({
      rank: idx + 1,
      ...item
    }));


  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-12">
      {/* Dynamic Theme Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--theme-border)] bg-gradient-to-r from-[var(--theme-card)] to-transparent p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-44 h-44 bg-[var(--theme-accent)]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--theme-accent)]/20 text-[var(--theme-accent)] border border-[var(--theme-accent)]/30">
                Active Prep Mode
              </span>
              <button 
                onClick={() => setExamSelectorOpen(true)}
                className="text-xs text-[var(--theme-text-secondary)] hover:text-white underline cursor-pointer"
              >
                Switch Exam
              </button>
            </div>
            <h1 className="text-3xl font-extrabold font-sans text-gradient tracking-tight">
              Targeting {examConfig.name}
            </h1>
            <p className="text-sm text-[var(--theme-text-secondary)] mt-1 max-w-md">
              Philosophy: <span className="text-white italic">{examConfig.shortcutsPhilosophy}</span>
            </p>
          </div>

          {/* Countdown timer badge */}
          <div className="glass-panel p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center min-w-[120px]">
            <span className="text-3xl font-black text-[var(--theme-accent)]">{daysLeft}</span>
            <span className="text-[10px] uppercase tracking-wider text-[var(--theme-text-secondary)] font-bold mt-1">Days to Exam</span>
          </div>
        </div>
      </div>

      {/* Grid of stats & rotation quotes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Streak & XP Tracker Card */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--theme-text-secondary)] mb-4">Streak & XP Engine</h3>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-500/20 text-orange-400 rounded-xl animate-pulse">
                <Flame size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold">{profile?.streakCount || 1} Days Active</div>
                <div className="text-[11px] text-[var(--theme-text-secondary)]">Solve daily challenge to secure streak!</div>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-xs text-[var(--theme-text-secondary)]">
            <span>Level {profile?.level}</span>
            <span>XP: {profile?.xp || 0}/{(profile?.level || 1) * 100}</span>
          </div>
        </div>

        {/* Dynamic Quote Rotator Card */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between md:col-span-2">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--theme-text-secondary)]">Daily Focus Mindset</h3>
              <button 
                onClick={rotateQuote}
                className="p-1 bg-white/5 rounded hover:bg-white/10 text-[var(--theme-text-secondary)] hover:text-white transition-all"
                title="Next Quote"
              >
                <RefreshCw size={12} />
              </button>
            </div>
            {quote && (
              <p className="text-sm font-medium italic text-[var(--theme-text-primary)] leading-relaxed">
                &ldquo;{quote.text}&rdquo;
              </p>
            )}
          </div>
          <div className="mt-3 text-right">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--theme-accent)]">
              — {quote?.author || 'Mentor'}
            </span>
          </div>
        </div>
      </div>

      {/* Practice Grid Actions */}
      <div>
        <h2 className="text-lg font-bold font-sans mb-4 flex items-center gap-2">
          <Brain size={18} className="text-[var(--theme-accent)]" /> Quick Training Slots
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { title: "AI Math Solver", desc: "OCR / Draw / Type formulas", icon: Sparkles, color: "from-blue-500/10 to-indigo-500/10", border: "hover:border-blue-500/40", tab: "solver" },
            { title: "Mock Tests", desc: "Full papers, speed diagnostics", icon: Clock, color: "from-amber-500/10 to-orange-500/10", border: "hover:border-amber-500/40", tab: "mock-tests" },
            { title: "Study Center", desc: "Formulas & revision mindmaps", icon: BookOpen, color: "from-emerald-500/10 to-teal-500/10", border: "hover:border-emerald-500/40", tab: "study-center" },
            { title: "Analytics", desc: "Consistency & weakness maps", icon: TrendingUp, color: "from-purple-500/10 to-pink-500/10", border: "hover:border-purple-500/40", tab: "analytics" }
          ].map((item) => (
            <button
              key={item.title}
              onClick={() => onNavigate(item.tab)}
              className={`p-4 rounded-xl border border-white/5 bg-gradient-to-br ${item.color} text-left transition-all ${item.border} hover:translate-y-[-2px] hover:shadow-lg cursor-pointer flex flex-col justify-between h-32`}
            >
              <div className="p-2.5 bg-white/5 rounded-lg w-max">
                <item.icon size={18} className="text-white" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">{item.title}</div>
                <div className="text-[9px] text-[var(--theme-text-secondary)] mt-0.5 leading-tight">{item.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Daily Challenge & Leaderboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Daily Mathematical Challenge */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--theme-text-secondary)] mb-3">Daily Maths Challenge</h3>
            <p className="text-xs font-medium text-white mb-4 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
              {challengeQuestion.text}
            </p>

            {!solvedChallenge ? (
              <div className="space-y-2">
                {challengeQuestion.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => setSelectedOption(option)}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                      selectedOption === option 
                        ? 'bg-[var(--theme-accent)]/20 border-[var(--theme-accent)] text-white' 
                        : 'bg-white/5 border-white/5 text-[var(--theme-text-secondary)] hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {option}
                  </button>
                ))}
                
                <button
                  onClick={handleChallengeSubmit}
                  disabled={!selectedOption}
                  className="w-full mt-2 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-xs font-bold text-white shadow-lg active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                >
                  Verify Answer
                </button>
              </div>
            ) : (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3">
                <CheckCircle className="text-green-400 shrink-0" size={20} />
                <div>
                  <div className="text-xs font-bold text-green-400">Challenge Solved!</div>
                  <div className="text-[10px] text-[var(--theme-text-secondary)] mt-0.5">Come back tomorrow for your next Vedic speed test.</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Local Leaderboards */}
        <div className="glass-panel p-5 rounded-2xl">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--theme-text-secondary)] mb-4">State Rankings (Weekly)</h3>
          <div className="space-y-3">
            {mockLeaderboard.map((item, idx) => (
              <div 
                key={item.name}
                className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                  item.name === profile?.name 
                    ? 'bg-[var(--theme-accent)]/15 border-[var(--theme-accent)]' 
                    : 'bg-white/5 border-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-[var(--theme-text-secondary)] w-4 text-center">{idx + 1}</span>
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">
                    {item.name === profile?.name ? '🧑' : '👤'}
                  </div>
                  <div>
                    <span className="font-bold">{item.name}</span>
                    <span className="text-[9px] uppercase font-semibold text-[var(--theme-text-secondary)] ml-2">
                      {item.exam.replace('-', ' ')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-yellow-400 font-bold bg-yellow-400/10 px-2 py-0.5 rounded-full">{item.badge}</span>
                  <span className="font-extrabold text-[var(--theme-text-primary)]">{item.xp} XP</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* EXAM SWITCHER MODAL */}
      {examSelectorOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-5 sm:p-6 animate-fade-in">
            <h2 className="text-lg font-bold text-gradient mb-1">Select Target Exam</h2>
            <p className="text-xs text-[var(--theme-text-secondary)] mb-4">The solver engine adjusts diagnostic patterns and Vedic shortcut models instantly.</p>
            
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {EXAM_LIST.map((exam) => (
                <button
                  key={exam.id}
                  onClick={async () => {
                    await changeExam(exam.id);
                    setExamSelectorOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left text-xs transition-all ${
                    profile?.targetExam === exam.id 
                      ? 'bg-[var(--theme-accent)]/20 border-[var(--theme-accent)] text-white' 
                      : 'bg-white/5 border-white/5 text-[var(--theme-text-secondary)] hover:border-white/20 hover:text-white'
                  }`}
                >
                  <div>
                    <span className="font-bold">{exam.name}</span>
                    <div className="text-[9px] text-[var(--theme-text-secondary)] mt-0.5">{exam.category.toUpperCase()} • Duration: {exam.durationMinutes}m</div>
                  </div>
                  <ChevronRight size={14} />
                </button>
              ))}
            </div>

            <button
              onClick={() => setExamSelectorOpen(false)}
              className="w-full mt-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-semibold hover:bg-white/10 transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
