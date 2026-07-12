'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile } from '../lib/localDb';
import { EXAM_LIST } from '../lib/syllabus';
import { cloudDb, subscribeToCloudSync, Batch, Homework, StudentProgress, Announcement } from '../lib/cloudDb';
import { 
  Users, Layers, BookOpen, BarChart3, Plus, Search, Check, Send, 
  Clock, LogOut, Flame, Sparkles, Award, UserCheck, Calendar, Bell, Upload, BookOpenCheck
} from 'lucide-react';

interface TeacherPortalProps {
  profile: UserProfile;
  onLogout: () => void;
}

export default function TeacherPortal({ profile, onLogout }: TeacherPortalProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'batches' | 'students' | 'homework'>('dashboard');
  
  // Real-time synchronization state variables
  const [batches, setBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [studentBatchesMap, setStudentBatchesMap] = useState<Record<string, string[]>>({});
  
  // Modals & Forms
  const [createBatchOpen, setCreateBatchOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentProgress | null>(null);
  
  // New Batch Form Fields
  const [newBatchName, setNewBatchName] = useState('');
  const [newBatchDesc, setNewBatchDesc] = useState('');
  const [newBatchCategory, setNewBatchCategory] = useState('ssc-cgl');
  const [newBatchSchedule, setNewBatchSchedule] = useState('Mon, Wed, Fri - 6:00 PM');
  const [newBatchCode, setNewBatchCode] = useState('');
  const [newBatchColor, setNewBatchColor] = useState('#3b82f6');
  const [newBatchTags, setNewBatchTags] = useState('Quant, Practice');

  // Homework Upload Fields
  const [hwTitle, setHwTitle] = useState('');
  const [hwNotes, setHwNotes] = useState('');
  const [hwDeadline, setHwDeadline] = useState('');
  const [hwBatchId, setHwBatchId] = useState('');
  const [hwFile, setHwFile] = useState<File | null>(null);
  const [hwFileBase64, setHwFileBase64] = useState('');
  
  // Announcement Fields
  const [annMessage, setAnnMessage] = useState('');
  const [annBatchId, setAnnBatchId] = useState('');

  // Search Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Load and subscribe to real-time updates
  const loadDatabaseState = () => {
    setBatches(cloudDb.getBatches());
    setStudents(cloudDb.getStudents());
    setHomeworks(cloudDb.getHomeworks());
    setAnnouncements(cloudDb.getAnnouncements());
    setStudentBatchesMap(cloudDb.getStudentBatchesMap());
  };

  useEffect(() => {
    loadDatabaseState();
    
    // Subscribe to BroadcastChannel alerts to sync changes instantly
    const unsubscribe = subscribeToCloudSync((key) => {
      loadDatabaseState();
    });
    return () => unsubscribe();
  }, []);

  // Form handlers
  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchName || !newBatchCode) return;
    
    const newBatch: Batch = {
      id: 'batch-' + Math.random().toString(36).substring(7),
      name: newBatchName,
      description: newBatchDesc,
      examCategory: newBatchCategory,
      schedule: newBatchSchedule,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2026-12-31',
      color: newBatchColor,
      tags: newBatchTags.split(',').map(t => t.trim()),
      batchCode: newBatchCode
    };

    cloudDb.saveBatch(newBatch);
    setCreateBatchOpen(false);
    
    // Reset fields
    setNewBatchName('');
    setNewBatchDesc('');
    setNewBatchCode('');
    setNewBatchTags('Quant, Practice');
  };

  const handleDeleteBatch = (batchId: string) => {
    if (confirm("⚠️ Warning: Deleting this batch will remove it permanently for all enrolled students. Proceed?")) {
      cloudDb.deleteBatch(batchId);
      loadDatabaseState();
    }
  };

  const handleAssignStudent = (email: string, batchId: string) => {
    cloudDb.assignStudentToBatch(email, batchId);
    loadDatabaseState();
  };

  const handleRemoveStudent = (email: string, batchId: string) => {
    if (confirm("Are you sure you want to remove this student from the batch?")) {
      cloudDb.removeStudentFromBatch(email, batchId);
      loadDatabaseState();
    }
  };

  const handleFileUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setHwFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setHwFileBase64(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUploadHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hwTitle || !hwBatchId || !hwDeadline) {
      alert("Please fill all required fields");
      return;
    }

    const batch = batches.find(b => b.id === hwBatchId);
    cloudDb.addHomework({
      batchId: hwBatchId,
      batchName: batch?.name || 'Class',
      title: hwTitle,
      notes: hwNotes,
      deadline: hwDeadline,
      teacherName: profile.name,
      fileName: hwFile?.name || 'Classwork_Questions_Sheet.png',
      fileType: hwFile?.type?.includes('pdf') ? 'pdf' : 'image',
      fileData: hwFileBase64 || '/placeholder.png'
    });

    alert("🎉 Homework assigned & students notified successfully!");
    setHwTitle('');
    setHwNotes('');
    setHwDeadline('');
    setHwFile(null);
    setHwFileBase64('');
    loadDatabaseState();
  };

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annMessage || !annBatchId) return;

    const batch = batches.find(b => b.id === annBatchId);
    cloudDb.addAnnouncement({
      batchId: annBatchId,
      batchName: batch?.name || 'Class',
      message: annMessage,
      teacherName: profile.name
    });

    alert("📣 Announcement posted!");
    setAnnMessage('');
    loadDatabaseState();
  };

  // Search filtered student queue
  const filteredStudents = students.filter(s => {
    const searchLower = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(searchLower) ||
      s.email.toLowerCase().includes(searchLower) ||
      s.district.toLowerCase().includes(searchLower) ||
      s.targetExam.toLowerCase().includes(searchLower);
  });

  return (
    <div className="min-h-screen text-white pb-24">
      {/* Teacher Hub Header */}
      <div className="glass-panel p-4 rounded-2xl mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center font-black">
            🧑‍🏫
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gradient">Teacher Hub: {profile.name}</h1>
            <p className="text-xs text-[var(--theme-text-secondary)]">Manage batches, homeworks, and student portfolios.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 self-end">
          <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-bold uppercase text-[9px] border border-purple-500/20">
            LMS ADMINISTRATOR
          </span>
          <button 
            onClick={onLogout}
            className="flex items-center gap-1.5 py-1.5 px-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 font-semibold text-xs rounded-lg transition-all border border-red-500/20 cursor-pointer"
          >
            <LogOut size={13} /> Log Out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-xl mb-6 max-w-lg">
        {[
          { id: 'dashboard', label: 'Overview', icon: BarChart3 },
          { id: 'batches', label: 'Manage Batches', icon: Layers },
          { id: 'students', label: 'Students Queue', icon: Users },
          { id: 'homework', label: 'Publish Work', icon: BookOpen }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === tab.id ? 'bg-purple-600 text-white shadow-md' : 'text-[var(--theme-text-secondary)] hover:text-white'
            }`}
          >
            <tab.icon size={13} /> {tab.label}
          </button>
        ))}
      </div>

      {/* RENDER ACTIVE TAB */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-fade-in">
          {/* Key Analytics Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Total Registered Students', value: students.length, desc: 'Across all courses', color: 'from-blue-600 to-cyan-600', icon: Users },
              { title: 'Active Class Batches', value: batches.length, desc: 'Weekly live sessions', color: 'from-purple-600 to-indigo-600', icon: Layers },
              { title: 'Assignments Published', value: homeworks.length, desc: 'Multi-question solver enabled', color: 'from-amber-600 to-orange-600', icon: BookOpen },
              { title: 'Announcements Live', value: announcements.length, desc: 'Real-time broadcasted', color: 'from-green-600 to-emerald-600', icon: Bell }
            ].map((stat, i) => (
              <div key={i} className="glass-panel p-4 rounded-xl relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 rounded-full blur-xl`} />
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--theme-text-secondary)]">{stat.title}</span>
                  <stat.icon size={14} className="text-[var(--theme-text-secondary)]" />
                </div>
                <div className="text-2xl font-black">{stat.value}</div>
                <span className="text-[9px] text-[var(--theme-text-secondary)]">{stat.desc}</span>
              </div>
            ))}
          </div>

          {/* Student Activity and batched layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Uploaded Homeworks */}
            <div className="glass-panel p-5 rounded-2xl space-y-4 lg:col-span-2">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                  <BookOpenCheck size={15} className="text-purple-400" /> Published Homework Logs
                </h3>
              </div>
              
              {homeworks.length === 0 ? (
                <div className="text-center py-8 text-xs text-[var(--theme-text-secondary)]">
                  No homework assignments published yet. Go to the "Publish Work" tab to assign sheets.
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {homeworks.map((hw) => {
                    const assignedStudents = Object.entries(studentBatchesMap)
                      .filter(([email, batchIds]) => batchIds.includes(hw.batchId) && students.some(s => s.email.toLowerCase() === email.toLowerCase())).length;
                    const completedCount = hw.completedBy.length;
                    const completionPercent = assignedStudents > 0 ? Math.round((completedCount / assignedStudents) * 100) : 0;
                    
                    return (
                      <div key={hw.id} className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="font-bold text-xs">{hw.title}</div>
                          <div className="text-[10px] text-[var(--theme-text-secondary)]">Batch: {hw.batchName} | Deadline: {hw.deadline}</div>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-400 font-bold text-[9px]">
                            {completionPercent}% Completed
                          </span>
                          <div className="text-[9px] text-[var(--theme-text-secondary)] mt-1">{completedCount}/{assignedStudents} submissions</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* General Announcements Feed */}
            <div className="glass-panel p-5 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <Bell size={15} className="text-yellow-400" /> Announcements Feed
              </h3>
              
              {announcements.length === 0 ? (
                <div className="text-center py-8 text-xs text-[var(--theme-text-secondary)]">
                  No announcements published.
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {announcements.map((ann) => (
                    <div key={ann.id} className="p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-xl space-y-1">
                      <p className="text-[11px] leading-relaxed">{ann.message}</p>
                      <div className="flex justify-between items-center text-[8px] text-[var(--theme-text-secondary)]">
                        <span>Batch: {ann.batchName}</span>
                        <span>{new Date(ann.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'batches' && (
        <div className="space-y-6 animate-fade-in">
          {/* Batches Hub Action */}
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold uppercase tracking-wider">Class Batches Overview</h2>
            <button
              onClick={() => setCreateBatchOpen(true)}
              className="flex items-center gap-1.5 py-2 px-4 bg-purple-600 hover:bg-purple-700 active:scale-95 text-xs text-white font-bold rounded-xl transition-all cursor-pointer shadow-lg"
            >
              <Plus size={14} /> Create New Batch
            </button>
          </div>

          {/* Batch Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {batches.map((batch) => {
              // Count assigned students
              const studentCount = Object.entries(studentBatchesMap)
                .filter(([email, ids]) => ids.includes(batch.id) && students.some(s => s.email.toLowerCase() === email.toLowerCase())).length;
                
              return (
                <div key={batch.id} className="glass-panel p-5 rounded-2xl space-y-4 border-t-4" style={{ borderTopColor: batch.color }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-extrabold text-sm text-white">{batch.name}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 font-bold uppercase tracking-wider text-[var(--theme-text-secondary)] mt-1.5 inline-block">
                        Exam: {batch.examCategory.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-black text-xs text-purple-400">Code: {batch.batchCode}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteBatch(batch.id)}
                        className="text-[9px] font-extrabold text-red-400 hover:underline hover:text-red-300 transition-all cursor-pointer"
                      >
                        Delete Batch
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-[var(--theme-text-secondary)] leading-relaxed h-12 overflow-hidden">{batch.description}</p>

                  <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-3 text-[10px] text-[var(--theme-text-secondary)]">
                    <div className="flex items-center gap-1">
                      <Clock size={12} /> {batch.schedule}
                    </div>
                    <div className="flex items-center gap-1 justify-end font-bold text-white">
                      <Users size={12} /> {studentCount} Enrolled
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CREATE BATCH MODAL */}
          {createBatchOpen && (
            <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
              <form onSubmit={handleCreateBatch} className="w-full max-w-md bg-slate-900 border border-white/10 p-6 rounded-2xl text-left space-y-4 animate-fade-in">
                <h3 className="text-lg font-bold text-gradient">Create New Batch</h3>

                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-[var(--theme-text-secondary)]">Batch Name</label>
                    <input 
                      type="text" 
                      required 
                      value={newBatchName} 
                      onChange={e => setNewBatchName(e.target.value)}
                      placeholder="E.g., Target SSC CGL 2026 Batch"
                      className="w-full py-2 px-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 text-white text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[var(--theme-text-secondary)]">Description</label>
                    <textarea 
                      value={newBatchDesc} 
                      onChange={e => setNewBatchDesc(e.target.value)}
                      placeholder="Provide notes, targets, or schedule details..."
                      className="w-full min-h-[60px] py-2 px-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 text-white text-xs resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-[var(--theme-text-secondary)]">Exam Category</label>
                      <select 
                        value={newBatchCategory} 
                        onChange={e => setNewBatchCategory(e.target.value)}
                        className="w-full py-2 px-3 bg-[#0f172a] border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 text-white text-xs"
                      >
                        {EXAM_LIST.map(ex => (
                          <option key={ex.id} value={ex.id}>{ex.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-[var(--theme-text-secondary)]">Unique Batch Code</label>
                      <input 
                        type="text" 
                        required 
                        value={newBatchCode} 
                        onChange={e => setNewBatchCode(e.target.value)}
                        placeholder="E.g., CGL2026"
                        className="w-full py-2 px-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 text-white text-xs font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-[var(--theme-text-secondary)]">Schedule Details</label>
                      <input 
                        type="text" 
                        value={newBatchSchedule} 
                        onChange={e => setNewBatchSchedule(e.target.value)}
                        className="w-full py-2 px-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 text-white text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-[var(--theme-text-secondary)]">Color Theme</label>
                      <input 
                        type="color" 
                        value={newBatchColor} 
                        onChange={e => setNewBatchColor(e.target.value)}
                        className="w-full h-8 bg-transparent border-0 cursor-pointer rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-3 border-t border-white/5">
                  <button 
                    type="button" 
                    onClick={() => setCreateBatchOpen(false)}
                    className="py-2 px-4 bg-white/5 hover:bg-white/10 text-xs font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="py-2 px-5 bg-purple-600 hover:bg-purple-700 text-xs font-bold rounded-xl text-white shadow-lg"
                  >
                    Publish Batch
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {activeTab === 'students' && (
        <div className="space-y-6 animate-fade-in">
          {/* Search Queue Header */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <h2 className="text-sm font-bold uppercase tracking-wider">Student Enrolment Queue</h2>
            <div className="relative w-full sm:max-w-xs">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500"><Search size={14} /></span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name, district, target..."
                className="w-full py-2 pl-9 pr-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 text-xs text-white placeholder-slate-500"
              />
            </div>
          </div>

          {/* Student Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredStudents.map((stud) => {
              const enrolledBatches = batches.filter(b => (studentBatchesMap[stud.email] || []).includes(b.id));
              const notEnrolledBatches = batches.filter(b => !(studentBatchesMap[stud.email] || []).includes(b.id));
              
              return (
                <div key={stud.email} className="glass-panel p-5 rounded-2xl flex flex-col justify-between gap-4">
                  {/* Student details header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-extrabold text-base border border-white/15">
                        {stud.name[0]}
                      </div>
                      <div>
                        <h4 
                          onClick={() => setSelectedStudent(stud)}
                          className="font-bold text-sm text-purple-300 hover:underline cursor-pointer flex items-center gap-1.5"
                        >
                          {stud.name} <Sparkles size={12} className="text-yellow-400" />
                        </h4>
                        <span className="text-[10px] text-[var(--theme-text-secondary)]">{stud.email}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="text-[9px] px-2 py-0.5 rounded bg-white/5 text-[var(--theme-text-secondary)] uppercase tracking-wider font-bold">
                        {stud.district}, {stud.state}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`⚠️ Are you sure you want to permanently REMOVE student "${stud.name}" (${stud.email}) from the portal?\n\nThis will delete their profile registry and assignments.`)) {
                            cloudDb.deleteStudentProfile(stud.email);
                            alert("Student profile permanently deleted.");
                            loadDatabaseState();
                          }
                        }}
                        className="text-[9px] font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-1.5 py-0.5 rounded transition-all cursor-pointer"
                      >
                        Remove Student
                      </button>
                    </div>
                  </div>

                  {/* Batches Sub-panel */}
                  <div className="space-y-2 border-t border-white/5 pt-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--theme-text-secondary)] block">Current Batches</span>
                    {enrolledBatches.length === 0 ? (
                      <span className="text-[10px] text-yellow-400 italic block">⚠️ Pending Assignment</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {enrolledBatches.map(b => (
                          <div key={b.id} className="flex items-center gap-1 px-2 py-1 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[9px] font-bold">
                            {b.name}
                            <button 
                              type="button" 
                              onClick={() => handleRemoveStudent(stud.email, b.id)}
                              className="text-red-400 hover:text-red-300 ml-1 font-bold text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Enroll action selector */}
                  {notEnrolledBatches.length > 0 && (
                    <div className="flex items-center gap-2 border-t border-white/5 pt-3 mt-1 text-[10px]">
                      <span className="text-[var(--theme-text-secondary)]">Enroll in:</span>
                      <div className="flex flex-wrap gap-1.5 flex-1">
                        {notEnrolledBatches.map(b => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => handleAssignStudent(stud.email, b.id)}
                            className="px-2 py-1 bg-white/5 border border-white/10 hover:border-purple-500/30 hover:bg-purple-950/20 text-white rounded text-[9px] font-bold cursor-pointer transition-all active:scale-95"
                          >
                            + {b.name.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* DETAILED STUDENT ANALYTICS OVERLAY (Drawer) */}
          {selectedStudent && (
            <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl p-6 text-left space-y-4 animate-fade-in relative max-h-[90vh] overflow-y-auto">
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold text-sm"
                >
                  ✕ Close
                </button>
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center font-bold text-lg">
                    {selectedStudent.name[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-black">{selectedStudent.name}</h3>
                    <p className="text-xs text-[var(--theme-text-secondary)]">{selectedStudent.email} | Target: {selectedStudent.targetExam.toUpperCase()}</p>
                  </div>
                </div>

                {/* Grid of stats */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-center space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-[var(--theme-text-secondary)] block">Solved Questions</span>
                    <span className="text-xl font-bold text-white">{selectedStudent.questionsSolved}</span>
                  </div>
                  <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-center space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-[var(--theme-text-secondary)] block">Average Accuracy</span>
                    <span className="text-xl font-bold text-green-400">{selectedStudent.accuracy}%</span>
                  </div>
                  <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-center space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-[var(--theme-text-secondary)] block">Daily Streak</span>
                    <span className="text-xl font-bold text-orange-400 flex items-center justify-center gap-1"><Flame size={16} /> {selectedStudent.streakCount}</span>
                  </div>
                  <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-center space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-[var(--theme-text-secondary)] block">Average Solve Speed</span>
                    <span className="text-xl font-bold text-blue-400">{selectedStudent.avgSolvingTimeSeconds}s</span>
                  </div>
                </div>

                {/* Sub-details */}
                <div className="space-y-2 border-t border-white/5 pt-4 text-xs">
                  <div className="flex justify-between"><span className="text-[var(--theme-text-secondary)]">District / Location:</span><span className="font-bold">{selectedStudent.district}, {selectedStudent.state}</span></div>
                  <div className="flex justify-between"><span className="text-[var(--theme-text-secondary)]">Qualification:</span><span className="font-bold">{selectedStudent.highestQualification}</span></div>
                  <div className="flex justify-between"><span className="text-[var(--theme-text-secondary)]">Homework Completion Rate:</span><span className="font-bold text-yellow-400">{selectedStudent.homeworkCompletionRate}%</span></div>
                  <div className="flex justify-between"><span className="text-[var(--theme-text-secondary)]">Study Streak Level:</span><span className="font-bold text-purple-400">Level {selectedStudent.level} (XP: {selectedStudent.xp})</span></div>
                  <div className="flex justify-between"><span className="text-[var(--theme-text-secondary)]">Weakest Subject / Chapter:</span><span className="font-bold text-red-400">{selectedStudent.weakestSubject}</span></div>
                  <div className="flex justify-between"><span className="text-[var(--theme-text-secondary)]">Strongest Subject:</span><span className="font-bold text-emerald-400">{selectedStudent.strongestSubject}</span></div>
                </div>

                {/* AI Improvement Advisor */}
                <div className="p-4 bg-purple-950/20 border border-purple-500/20 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                    <Sparkles size={13} /> AI Mentor Advice
                  </h4>
                  <p className="text-[11px] text-[var(--theme-text-secondary)] leading-relaxed">
                    Student exhibits strong skills in {selectedStudent.strongestSubject} (Avg solve speed: {selectedStudent.avgSolvingTimeSeconds}s). However, target exam {selectedStudent.targetExam.toUpperCase()} demands speed improvements in {selectedStudent.weakestSubject}. Recommend assigning focused homework sheets, focusing on speed shortcuts, and revising daily formulas.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'homework' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          {/* ASSIGN HOMEWORK PANEL */}
          <form onSubmit={handleUploadHomework} className="glass-panel p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Upload size={15} className="text-purple-400" /> Assign Batch Homework
            </h3>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[var(--theme-text-secondary)]">Target Batch *</label>
                <select
                  required
                  value={hwBatchId}
                  onChange={e => setHwBatchId(e.target.value)}
                  className="w-full py-2.5 px-3 bg-[#0f172a] border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 text-white text-xs"
                >
                  <option value="">-- Select Class Batch --</option>
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[var(--theme-text-secondary)]">Homework Title *</label>
                <input
                  type="text"
                  required
                  value={hwTitle}
                  onChange={e => setHwTitle(e.target.value)}
                  placeholder="E.g., Time & Work Practice - Part 1"
                  className="w-full py-2.5 px-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[var(--theme-text-secondary)]">Motivational Notes & Instructions</label>
                <textarea
                  value={hwNotes}
                  onChange={e => setHwNotes(e.target.value)}
                  placeholder="Write instructions, math trick references, and motivation for the students..."
                  className="w-full min-h-[90px] py-2.5 px-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 text-white text-xs resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[var(--theme-text-secondary)]">Submission Deadline *</label>
                  <input
                    type="date"
                    required
                    value={hwDeadline}
                    onChange={e => setHwDeadline(e.target.value)}
                    className="w-full py-2.5 px-3 bg-[#0f172a] border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 text-white text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[var(--theme-text-secondary)]">Worksheet / PDF File</label>
                  <label className="flex items-center justify-center gap-1.5 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
                    <Plus size={13} /> {hwFile ? hwFile.name.substring(0, 15) : 'Select Image/PDF'}
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileUploadChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 font-bold rounded-xl active:scale-98 transition-all cursor-pointer shadow-lg shadow-purple-500/20 text-xs text-white"
            >
              Publish Homework to Batch
            </button>
          </form>

          {/* ANNOUNCEMENT PUBLISHER */}
          <form onSubmit={handlePostAnnouncement} className="glass-panel p-5 rounded-2xl space-y-4 self-start">
            <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Send size={15} className="text-yellow-400" /> Broadcast Announcement
            </h3>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[var(--theme-text-secondary)]">Target Batch *</label>
                <select
                  required
                  value={annBatchId}
                  onChange={e => setAnnBatchId(e.target.value)}
                  className="w-full py-2.5 px-3 bg-[#0f172a] border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 text-white text-xs"
                >
                  <option value="">-- Select Class Batch --</option>
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[var(--theme-text-secondary)]">Announcement Message *</label>
                <textarea
                  required
                  value={annMessage}
                  onChange={e => setAnnMessage(e.target.value)}
                  placeholder="Write the announcement message broadcasted in real time..."
                  className="w-full min-h-[90px] py-2.5 px-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 text-white text-xs resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 mt-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:opacity-90 font-bold rounded-xl active:scale-98 transition-all cursor-pointer shadow-lg text-xs text-slate-950"
            >
              Post Broadcast Announcement
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
