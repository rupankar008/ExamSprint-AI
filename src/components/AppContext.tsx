'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, getProfile, saveProfile, getStreakLog, addStreakDay, initDb } from '../lib/localDb';
import { getExamConfig } from '../lib/syllabus';
import { cloudDb } from '../lib/cloudDb';

interface AppContextType {
  profile: UserProfile | null;
  loading: boolean;
  activeTheme: 'railway' | 'police' | 'ssc' | 'banking' | 'defence';
  updateProfile: (newProfile: UserProfile) => Promise<void>;
  awardXP: (xpAmount: number, coinAmount: number) => Promise<void>;
  changeExam: (examId: string) => Promise<void>;
  incrementStreak: () => Promise<void>;
  streakDays: string[];
  sessionEmail: string | null;
  login: (profile: UserProfile, email: string) => Promise<void>;
  logout: () => Promise<void>;
  activeHomeworkWorksheet: any | null;
  setActiveHomeworkWorksheet: (hw: any | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [streakDays, setStreakDays] = useState<string[]>([]);
  const [activeTheme, setActiveTheme] = useState<'railway' | 'police' | 'ssc' | 'banking' | 'defence'>('railway');
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [activeHomeworkWorksheet, setActiveHomeworkWorksheet] = useState<any | null>(null);

  // Load profile from database on startup
  useEffect(() => {
    async function loadData() {
      try {
        const storedEmail = typeof window !== 'undefined' ? localStorage.getItem('auth_email') : null;
        if (storedEmail) {
          setSessionEmail(storedEmail);
        }

        const prof = await getProfile();
        if (prof) {
          setProfile(prof);
          
          // Apply theme
          let theme = prof.themePreference;
          if (theme === 'auto') {
            const config = getExamConfig(prof.targetExam);
            theme = config.theme;
          }
          setActiveTheme(theme as any);
          document.documentElement.setAttribute('data-exam-theme', theme);
        }
        
        const streaks = await getStreakLog();
        setStreakDays(streaks);
      } catch (e) {
        console.error("Failed to load database details", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const login = async (prof: UserProfile, email: string) => {
    setSessionEmail(email);
    localStorage.setItem('auth_email', email);
    await updateProfile(prof);
  };

  const logout = async () => {
    setProfile(null);
    setSessionEmail(null);
    localStorage.removeItem('auth_email');
    // Clear user cache in profiles store
    try {
      const db = await initDb();
      const transaction = db.transaction("profiles", "readwrite");
      transaction.objectStore("profiles").delete("user");
    } catch (e) {}
  };

  const updateProfile = async (newProfile: UserProfile) => {
    setProfile(newProfile);
    await saveProfile(newProfile);

    // Sync profile to cloud database if it is a student role
    if (sessionEmail && newProfile.role !== 'teacher') {
      cloudDb.registerUserProfile(newProfile, sessionEmail);
    }
    
    // Dynamically update document themes
    let theme = newProfile.themePreference;
    if (theme === 'auto') {
      const config = getExamConfig(newProfile.targetExam);
      theme = config.theme;
    }
    setActiveTheme(theme as any);
    document.documentElement.setAttribute('data-exam-theme', theme);
  };

  const changeExam = async (examId: string) => {
    if (!profile) return;
    const updated = { ...profile, targetExam: examId };
    await updateProfile(updated);
  };

  const awardXP = async (xpAmount: number, coinAmount: number) => {
    if (!profile) return;
    
    let newXp = profile.xp + xpAmount;
    let newCoins = profile.coins + coinAmount;
    let newLevel = profile.level;
    
    // Dynamic level-up calculation (100 XP per level)
    const requiredXpForNextLevel = newLevel * 100;
    if (newXp >= requiredXpForNextLevel) {
      newXp = newXp - requiredXpForNextLevel;
      newLevel += 1;
    }

    const updated = {
      ...profile,
      xp: newXp,
      coins: newCoins,
      level: newLevel
    };
    await updateProfile(updated);
  };

  const incrementStreak = async () => {
    if (!profile) return;
    const today = new Date().toISOString().split('T')[0];
    if (streakDays.includes(today)) return; // Already completed today

    await addStreakDay(today);
    const newStreaks = [...streakDays, today];
    setStreakDays(newStreaks);

    const updated = {
      ...profile,
      streakCount: profile.streakCount + 1
    };
    await updateProfile(updated);
    
    // Award streak reward bonus
    await awardXP(50, 10);
  };

  return (
    <AppContext.Provider value={{
      profile,
      loading,
      activeTheme,
      updateProfile,
      awardXP,
      changeExam,
      incrementStreak,
      streakDays,
      sessionEmail,
      login,
      logout,
      activeHomeworkWorksheet,
      setActiveHomeworkWorksheet
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside an AppProvider");
  return context;
}
