'use client';

import React, { useState } from 'react';
import { UserProfile } from '../lib/localDb';
import { EXAM_LIST } from '../lib/syllabus';
import { ShieldCheck, User, KeyRound, Loader2, AlertCircle } from 'lucide-react';
import { cloudDb } from '../lib/cloudDb';
import { signInWithGoogleReal, isFirebaseConfigured, checkRedirectResultReal } from '../lib/firebase';

interface AuthScreenProps {
  onAuthComplete: (profile: UserProfile, sessionEmail: string) => void;
}

export default function AuthScreen({ onAuthComplete }: AuthScreenProps) {
  const [loading, setLoading] = useState(false);
  
  // Teacher Passcode States
  const [teacherPassOpen, setTeacherPassOpen] = useState(false);
  const [teacherPasscode, setTeacherPasscode] = useState('');

  // Student Profile Completion States
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileData, setProfileData] = useState<Partial<UserProfile>>({
    name: '',
    age: '',
    gender: 'Male',
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
    mobileNumber: '',
    email: '',
    collegeSchool: '',
    district: '',
    state: '',
    role: 'student',
    avatar: 'lakshya',
    profilePicture: '',
    xp: 150,
    coins: 50,
    level: 1,
    streakCount: 1
  });

  // Check for mobile redirect logins on mount
  React.useEffect(() => {
    async function checkRedirect() {
      if (!isFirebaseConfigured) return;
      try {
        setLoading(true);
        const res = await checkRedirectResultReal();
        if (res && res.email) {
          handleAuthSuccess(res.email, res.name);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Redirect check failed", err);
        setLoading(false);
      }
    }
    checkRedirect();
  }, []);

  const handleGoogleSignInClick = async () => {
    if (!isFirebaseConfigured) {
      alert("⚠️ Firebase Config Missing:\n\nPlease setup your real Firebase Web Project credentials in '.env.local' to initiate live Google OAuth Sign-In.");
      return;
    }

    setLoading(true);
    try {
      // Run Real Google Authentication via Firebase Auth SDK
      const res = await signInWithGoogleReal();
      if (res) {
        if (res.redirectStarted) {
          // Redirect has initiated, keep the spinner going
          console.log("Redirect sign-in initiated. Waiting for user reload...");
          return;
        }
        handleAuthSuccess(res.email, res.name);
      } else {
        setLoading(false);
      }
    } catch (err: any) {
      console.error(err);
      alert(`❌ Firebase Auth Error: ${err?.message || err || 'Unknown Connection Failure'}\n\nCheck that Google Authentication is enabled in your Firebase Console and localhost is added to Authorized Domains.`);
      setLoading(false);
    }
  };

  const handleAuthSuccess = (email: string, displayName: string) => {
    setLoading(true);
    const registeredStudents = cloudDb.getStudents();
    const existing = registeredStudents.find(s => s.email.toLowerCase() === email.toLowerCase());
    
    setTimeout(() => {
      setLoading(false);
      if (existing) {
        // Log in returning user directly
        const userProf: UserProfile = {
          name: existing.name,
          avatar: 'lakshya',
          age: '22',
          gender: 'Male',
          qualification: existing.highestQualification,
          occupation: 'Student',
          language: 'English',
          targetExam: existing.targetExam,
          targetYear: '2026',
          dailyHours: existing.studyHoursPerDay,
          weakSubject: existing.weakestSubject,
          strongSubject: existing.strongestSubject,
          dailyGoal: '100 XP',
          themePreference: 'auto',
          email: existing.email,
          mobileNumber: '9988776655',
          collegeSchool: existing.highestQualification === 'B.Tech' ? 'Calcutta University' : 'Jadavpur University',
          district: existing.district,
          state: existing.state,
          role: 'student',
          xp: existing.xp,
          coins: 50,
          level: existing.level,
          streakCount: existing.streakCount
        };
        onAuthComplete(userProf, email.toLowerCase());
      } else {
        // Register new student
        setProfileData(prev => ({
          ...prev,
          email: email.toLowerCase(),
          name: displayName,
          role: 'student'
        }));
        setShowProfileForm(true);
      }
    }, 1000);
  };

  const handleTeacherPasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Secure Master Password for Ankush Santra
    if (teacherPasscode !== 'ankush-santra-examsprint-master-2026') {
      alert("❌ Access Denied: Invalid Teacher Master Key.");
      return;
    }

    setLoading(true);
    setTeacherPassOpen(false);
    
    setTimeout(() => {
      setLoading(false);
      const teacherProf: UserProfile = {
        name: "ANKUSH SANTRA",
        avatar: 'ramanujan',
        age: '35',
        gender: 'Male',
        qualification: 'M.Sc Mathematics',
        occupation: 'Main Educator & Director',
        language: 'English',
        targetExam: 'ssc-cgl',
        targetYear: '2026',
        dailyHours: 8,
        weakSubject: '',
        strongSubject: 'Mathematics',
        dailyGoal: 'Teacher Mode',
        themePreference: 'ssc',
        role: 'teacher',
        email: 'ankush.santra@examsprint.ai',
        xp: 0,
        coins: 0,
        level: 1,
        streakCount: 0
      };
      onAuthComplete(teacherProf, 'ankush.santra@examsprint.ai');
    }, 1000);
  };

  const handleProfileFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData.name || !profileData.email) {
      alert("Please fill all required profile fields.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const fullProfile: UserProfile = {
        name: profileData.name || 'New Student',
        avatar: 'lakshya',
        age: profileData.age || '22',
        gender: profileData.gender || 'Prefer not to say',
        qualification: profileData.qualification || 'Graduate',
        occupation: 'Student',
        language: profileData.language || 'English',
        targetExam: profileData.targetExam || 'ssc-cgl',
        targetYear: profileData.targetYear || '2026',
        dailyHours: profileData.dailyHours || 4,
        weakSubject: profileData.weakSubject || 'Quantitative Aptitude',
        strongSubject: profileData.strongSubject || 'General Intelligence',
        dailyGoal: '100 XP',
        themePreference: 'auto',
        email: profileData.email!.toLowerCase(),
        mobileNumber: profileData.mobileNumber || '9999999999',
        collegeSchool: profileData.collegeSchool || 'State College',
        district: profileData.district || 'Kolkata',
        state: profileData.state || 'West Bengal',
        role: 'student',
        profilePicture: profileData.profilePicture || '',
        xp: 150,
        coins: 50,
        level: 1,
        streakCount: 1
      };
      
      cloudDb.registerUserProfile(fullProfile, fullProfile.email!);
      onAuthComplete(fullProfile, fullProfile.email!);
    }, 1200);
  };

  return (
    <div className="w-full max-w-md mx-auto glass-panel p-8 rounded-3xl animate-fade-in text-white shadow-2xl relative overflow-hidden border border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Brand details */}
      <div className="text-center mb-6">
        <div className="w-24 h-24 rounded-2xl overflow-hidden mx-auto mb-4 border border-white/15 shadow-xl shadow-blue-500/10 bg-slate-950 flex items-center justify-center">
          <img src="/logo.jpg" alt="ExamSprint AI Logo" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-gradient bg-gradient-to-r from-blue-400 via-indigo-200 to-indigo-400">ExamSprint AI</h1>
        <p className="text-xs text-[var(--theme-text-secondary)] mt-1 font-semibold">Learn Faster. Solve Smarter. Get Selected.</p>
      </div>

      {!showProfileForm ? (
        <div className="space-y-6">
          <div className="space-y-4 text-center">
            <p className="text-xs text-[var(--theme-text-secondary)] leading-relaxed">
              Login or register securely using your Google account to sync all progress, batches, and homework to the cloud database.
            </p>

            <button
              onClick={handleGoogleSignInClick}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl active:scale-98 transition-all cursor-pointer shadow-lg shadow-white/5 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-slate-900" />
              ) : (
                <>
                  <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5.04c1.62 0 3.08.56 4.22 1.64l3.15-3.15C17.45 1.74 14.9 1 12 1 7.28 1 3.26 3.74 1.34 7.74l3.78 2.93C6.01 7.42 8.79 5.04 12 5.04z" />
                    <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.45h6.44c-.28 1.48-1.11 2.73-2.37 3.58v2.98h3.84c2.24-2.06 3.58-5.1 3.58-8.67z" />
                    <path fill="#FBBC05" d="M5.12 14.81c-.23-.69-.36-1.43-.36-2.2s.13-1.51.36-2.2L1.34 7.48C.48 9.19 0 11.04 0 13s.48 3.81 1.34 5.52l3.78-2.71z" />
                    <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.84-2.98c-1.06.71-2.42 1.14-4.12 1.14-3.21 0-5.99-2.38-6.88-5.63L1.34 15.34C3.26 19.34 7.28 22 12 23z" />
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            {!isFirebaseConfigured && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-left flex gap-2.5 items-start mt-2">
                <AlertCircle className="text-amber-400 shrink-0 mt-0.5" size={15} />
                <div className="text-[10px] text-amber-200 leading-normal">
                  <strong>Firebase Keys Unconfigured:</strong> Copy the template parameters from <code className="bg-black/35 px-1 rounded">.env.local.example</code> into a new file <code className="bg-black/35 px-1 rounded">.env.local</code> to enable Google popup sign-in.
                </div>
              </div>
            )}
          </div>

          {/* Secure Teacher Gate link */}
          <div className="border-t border-white/5 pt-5 text-center">
            <button
              onClick={() => setTeacherPassOpen(true)}
              className="inline-flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-purple-400 font-bold transition-all cursor-pointer"
            >
              <KeyRound size={11} /> Secure Educator Portal Gate
            </button>
          </div>

          {/* TEACHER ACCESS GATE MODAL */}
          {teacherPassOpen && (
            <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm">
              <form onSubmit={handleTeacherPasscodeSubmit} className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-2xl p-5 text-left space-y-4 animate-fade-in">
                <div>
                  <h3 className="font-extrabold text-sm text-gradient">Secure Educator Access</h3>
                  <p className="text-[10px] text-[var(--theme-text-secondary)] mt-0.5">Enter main teacher master key to launch Ankush Santra portal.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-[var(--theme-text-secondary)]">Master Passcode</label>
                  <input
                    type="password"
                    required
                    value={teacherPasscode}
                    onChange={e => setTeacherPasscode(e.target.value)}
                    placeholder="Enter Ankush Santra Master Key"
                    className="w-full py-2.5 px-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 text-xs text-white"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => { setTeacherPassOpen(false); setTeacherPasscode(''); }}
                    className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-1.5 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-white"
                  >
                    Authenticate
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      ) : (
        /* Detailed Student Profile Registration Form */
        <form onSubmit={handleProfileFormSubmit} className="space-y-4 text-left animate-fade-in max-h-[70vh] overflow-y-auto pr-1">
          <div className="flex items-center gap-2 mb-2 border-b border-white/5 pb-1">
            <User size={15} className="text-[var(--theme-accent)]" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Complete Student Profile</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Name */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase tracking-wider text-[var(--theme-text-secondary)]">Full Name *</label>
              <input
                type="text"
                required
                value={profileData.name}
                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="E.g., Subhasis Chatterjee"
                className="w-full py-1.5 px-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[var(--theme-accent)] text-xs text-white"
              />
            </div>

            {/* Mobile */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase tracking-wider text-[var(--theme-text-secondary)]">Mobile Number</label>
              <input
                type="tel"
                value={profileData.mobileNumber}
                onChange={(e) => setProfileData(prev => ({ ...prev, mobileNumber: e.target.value }))}
                placeholder="E.g., 9876543210"
                className="w-full py-1.5 px-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[var(--theme-accent)] text-xs text-white"
              />
            </div>

            {/* Age */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase tracking-wider text-[var(--theme-text-secondary)]">Age</label>
              <input
                type="number"
                value={profileData.age}
                onChange={(e) => setProfileData(prev => ({ ...prev, age: e.target.value }))}
                placeholder="E.g., 22"
                className="w-full py-1.5 px-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[var(--theme-accent)] text-xs text-white"
              />
            </div>

            {/* Gender */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase tracking-wider text-[var(--theme-text-secondary)]">Gender</label>
              <select
                value={profileData.gender}
                onChange={(e) => setProfileData(prev => ({ ...prev, gender: e.target.value }))}
                className="w-full py-1.5 px-3 bg-[#0f172a] border border-white/10 rounded-xl focus:outline-none focus:border-[var(--theme-accent)] text-xs text-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            {/* Highest Qualification */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase tracking-wider text-[var(--theme-text-secondary)]">Highest Qualification</label>
              <input
                type="text"
                value={profileData.qualification}
                onChange={(e) => setProfileData(prev => ({ ...prev, qualification: e.target.value }))}
                placeholder="E.g., B.Tech / Graduate"
                className="w-full py-1.5 px-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[var(--theme-accent)] text-xs text-white"
              />
            </div>

            {/* College/School */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase tracking-wider text-[var(--theme-text-secondary)]">College / School</label>
              <input
                type="text"
                value={profileData.collegeSchool}
                onChange={(e) => setProfileData(prev => ({ ...prev, collegeSchool: e.target.value }))}
                placeholder="E.g., Calcutta University"
                className="w-full py-1.5 px-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[var(--theme-accent)] text-xs text-white"
              />
            </div>

            {/* District */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase tracking-wider text-[var(--theme-text-secondary)]">District</label>
              <input
                type="text"
                value={profileData.district}
                onChange={(e) => setProfileData(prev => ({ ...prev, district: e.target.value }))}
                placeholder="E.g., Kolkata"
                className="w-full py-1.5 px-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[var(--theme-accent)] text-xs text-white"
              />
            </div>

            {/* State */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase tracking-wider text-[var(--theme-text-secondary)]">State</label>
              <input
                type="text"
                value={profileData.state}
                onChange={(e) => setProfileData(prev => ({ ...prev, state: e.target.value }))}
                placeholder="E.g., West Bengal"
                className="w-full py-1.5 px-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[var(--theme-accent)] text-xs text-white"
              />
            </div>

            {/* Target Exam */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase tracking-wider text-[var(--theme-text-secondary)]">Target Exam</label>
              <select
                value={profileData.targetExam}
                onChange={(e) => setProfileData(prev => ({ ...prev, targetExam: e.target.value }))}
                className="w-full py-1.5 px-3 bg-[#0f172a] border border-white/10 rounded-xl focus:outline-none focus:border-[var(--theme-accent)] text-xs text-white"
              >
                {EXAM_LIST.map(ex => (
                  <option key={ex.id} value={ex.id}>{ex.name}</option>
                ))}
              </select>
            </div>

            {/* Study Hours */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase tracking-wider text-[var(--theme-text-secondary)]">Daily Study Hours</label>
              <input
                type="number"
                value={profileData.dailyHours}
                onChange={(e) => setProfileData(prev => ({ ...prev, dailyHours: Number(e.target.value) }))}
                className="w-full py-1.5 px-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[var(--theme-accent)] text-xs text-white"
              />
            </div>

            {/* Weak Subjects */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase tracking-wider text-[var(--theme-text-secondary)]">Weak Subject</label>
              <input
                type="text"
                value={profileData.weakSubject}
                onChange={(e) => setProfileData(prev => ({ ...prev, weakSubject: e.target.value }))}
                className="w-full py-1.5 px-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[var(--theme-accent)] text-xs text-white"
              />
            </div>

            {/* Strong Subjects */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase tracking-wider text-[var(--theme-text-secondary)]">Strong Subject</label>
              <input
                type="text"
                value={profileData.strongSubject}
                onChange={(e) => setProfileData(prev => ({ ...prev, strongSubject: e.target.value }))}
                className="w-full py-1.5 px-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[var(--theme-accent)] text-xs text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 font-bold rounded-xl active:scale-98 transition-all cursor-pointer shadow-lg disabled:opacity-50 flex items-center justify-center text-xs"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-white" />
            ) : (
              "Save Profile & Enter Platform"
            )}
          </button>
        </form>
      )}
    </div>
  );
}
