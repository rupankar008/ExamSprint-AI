'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile } from '../lib/localDb';
import { cloudDb, subscribeToCloudSync, Batch, Homework, Announcement } from '../lib/cloudDb';
import { BookOpen, Calendar, CheckCircle2, Bookmark, Search, Bell, FileText, Download, Copy, Eye, X, Check } from 'lucide-react';

interface StudentHomeworkProps {
  profile: UserProfile;
  // Kept prop signature to prevent breaking parents, but won't trigger "Solve Now"
  onSolveWorksheet?: (homework: Homework) => void;
}

export default function StudentHomework({ profile }: StudentHomeworkProps) {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [studentBatches, setStudentBatches] = useState<string[]>([]);
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'completed' | 'bookmarked'>('all');

  // Preview Modal
  const [previewHw, setPreviewHw] = useState<Homework | null>(null);
  const [copied, setCopied] = useState(false);

  const loadStudentState = () => {
    if (!profile.email) return;
    const allBatches = cloudDb.getBatches();
    const map = cloudDb.getStudentBatchesMap();
    const assignedIds = map[profile.email] || [];
    setStudentBatches(assignedIds);
    
    // Filter active batches
    setBatches(allBatches.filter(b => assignedIds.includes(b.id)));
    
    // Filter homework assigned to student's batches
    const allHws = cloudDb.getHomeworks();
    setHomeworks(allHws.filter(h => assignedIds.includes(h.batchId)));

    // Filter announcements
    const allAnns = cloudDb.getAnnouncements();
    setAnnouncements(allAnns.filter(a => assignedIds.includes(a.batchId)));
  };

  useEffect(() => {
    loadStudentState();

    // Subscribe to cloud updates for real-time synchronization
    const unsubscribe = subscribeToCloudSync(() => {
      loadStudentState();
    });
    return () => unsubscribe();
  }, [profile.email]);

  const toggleHomeworkAction = (hwId: string, action: 'complete' | 'bookmark' | 'archive', currentValue: boolean) => {
    if (!profile.email) return;
    cloudDb.updateHomeworkStatus(hwId, profile.email, action, !currentValue);
    loadStudentState();
    
    // Auto-update modal if open
    if (previewHw && previewHw.id === hwId) {
      const updatedHw = cloudDb.getHomeworks().find(h => h.id === hwId);
      if (updatedHw) setPreviewHw(updatedHw);
    }
  };

  const handleCopyNotes = (notes: string) => {
    navigator.clipboard.writeText(notes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = (hw: Homework) => {
    if (!hw.fileData) return;
    const link = document.createElement('a');
    link.href = hw.fileData;
    link.download = hw.fileName || 'homework-file';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredHomeworks = homeworks.filter(hw => {
    const matchesSearch = hw.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      hw.teacherName.toLowerCase().includes(searchQuery.toLowerCase());
      
    if (!matchesSearch) return false;
    if (!profile.email) return false;

    if (filterTab === 'pending') return !hw.completedBy.includes(profile.email);
    if (filterTab === 'completed') return hw.completedBy.includes(profile.email);
    if (filterTab === 'bookmarked') return hw.bookmarkedBy.includes(profile.email);
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto p-4 sm:p-0">
      {/* Target Batches List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--theme-text-secondary)]">Your Assigned Classes</h3>
        {batches.length === 0 ? (
          <div className="glass-panel p-5 rounded-xl text-xs text-yellow-400 font-semibold text-center border border-yellow-500/10">
            ⚠️ You are not enrolled in any batches yet. Ask educator Ankush Santra to assign you using your Google email: <span className="underline font-bold text-white ml-1">{profile.email}</span>.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {batches.map(batch => (
              <div key={batch.id} className="glass-panel p-4 rounded-xl relative overflow-hidden border-t-2" style={{ borderTopColor: batch.color }}>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 font-mono text-[var(--theme-text-secondary)] font-bold absolute top-2.5 right-3.5">
                  CODE: {batch.batchCode}
                </span>
                <h4 className="font-extrabold text-xs text-white">{batch.name}</h4>
                <p className="text-[10px] text-[var(--theme-text-secondary)] mt-1">{batch.schedule}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Announcements Broadcast Panel */}
      {announcements.length > 0 && (
        <div className="glass-panel p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-yellow-400 flex items-center gap-1.5">
            <Bell size={13} /> Class Announcement Feed
          </h4>
          <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
            {announcements.map(ann => (
              <div key={ann.id} className="text-xs border-b border-white/5 pb-2 last:border-0 last:pb-0">
                <p className="leading-relaxed text-white font-medium">{ann.message}</p>
                <span className="text-[9px] text-[var(--theme-text-secondary)] block mt-1">
                  Posted by {ann.teacherName} in {ann.batchName} • {new Date(ann.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Homework list and tools */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-xl overflow-x-auto w-full sm:w-auto scrollbar-none">
            {[
              { id: 'all', label: 'All Tasks' },
              { id: 'pending', label: 'Pending' },
              { id: 'completed', label: 'Completed' },
              { id: 'bookmarked', label: 'Bookmarked' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id as any)}
                className={`py-1.5 px-3 text-[10px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  filterTab === tab.id ? 'bg-[var(--theme-accent)] text-white' : 'text-[var(--theme-text-secondary)] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:max-w-xs">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500"><Search size={13} /></span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search homework..."
              className="w-full py-1.5 pl-9 pr-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[var(--theme-accent)] text-xs text-white"
            />
          </div>
        </div>

        {filteredHomeworks.length === 0 ? (
          <div className="text-center py-12 text-xs text-[var(--theme-text-secondary)]">
            No homework assignments matching the filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHomeworks.map(hw => {
              const isCompleted = profile.email ? hw.completedBy.includes(profile.email) : false;
              const isBookmarked = profile.email ? hw.bookmarkedBy.includes(profile.email) : false;
              
              return (
                <div key={hw.id} className="glass-panel p-4 rounded-xl flex flex-col justify-between gap-3 border border-white/5 hover:border-white/10 transition-all">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-extrabold text-sm text-white">{hw.title}</h4>
                        <span className="text-[9px] text-[var(--theme-text-secondary)] font-medium">Assigned by {hw.teacherName} • Batch: {hw.batchName}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                        isCompleted ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {isCompleted ? 'Done' : 'Pending'}
                      </span>
                    </div>

                    {hw.notes && (
                      <p className="text-[11px] text-[var(--theme-text-secondary)] leading-relaxed italic bg-white/5 p-2.5 rounded-lg border border-white/5 line-clamp-2">
                        "{hw.notes}"
                      </p>
                    )}

                    {hw.fileName && (
                      <div className="flex items-center gap-1.5 text-[10px] text-[var(--theme-text-primary)] font-semibold mt-1">
                        <FileText size={12} className="text-[var(--theme-accent)]" /> Attachment: {hw.fileName}
                      </div>
                    )}
                  </div>

                  {/* Actions footer */}
                  <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-1">
                    <span className="text-[9px] text-[var(--theme-text-secondary)] flex items-center gap-1">
                      <Calendar size={12} /> Due: {hw.deadline}
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Bookmark toggle */}
                      <button
                        type="button"
                        onClick={() => toggleHomeworkAction(hw.id, 'bookmark', isBookmarked)}
                        className={`p-1.5 rounded bg-white/5 border border-white/5 transition-all cursor-pointer ${
                          isBookmarked ? 'text-yellow-400 bg-yellow-500/15' : 'text-[var(--theme-text-secondary)] hover:text-white'
                        }`}
                        title="Bookmark homework"
                      >
                        <Bookmark size={12} />
                      </button>

                      {/* Open Homework Sheet Modal Button */}
                      <button
                        type="button"
                        onClick={() => setPreviewHw(hw)}
                        className="flex items-center gap-1.5 py-1.5 px-3 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-[9px] rounded-lg transition-all active:scale-95 cursor-pointer"
                      >
                        <Eye size={11} /> View Sheet
                      </button>

                      {/* Complete status checkbox */}
                      <button
                        type="button"
                        onClick={() => toggleHomeworkAction(hw.id, 'complete', isCompleted)}
                        className={`p-1.5 rounded border transition-all cursor-pointer flex items-center gap-1 text-[9px] font-bold ${
                          isCompleted ? 'bg-green-600 text-white border-green-500' : 'bg-white/5 text-[var(--theme-text-secondary)] border-white/10 hover:text-white'
                        }`}
                      >
                        <CheckCircle2 size={12} /> Done
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FULL HOMEWORK SHEET PREVIEW MODAL */}
      {previewHw && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl p-5 sm:p-6 text-left space-y-5 animate-scale-up relative">
            
            {/* Close Button */}
            <button
              onClick={() => setPreviewHw(null)}
              className="absolute top-4 right-4 p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X size={16} />
            </button>

            {/* Header */}
            <div className="border-b border-white/5 pb-3">
              <span className="text-[10px] text-purple-400 uppercase font-black tracking-wider block">Homework Sheet</span>
              <h3 className="text-base sm:text-lg font-extrabold text-white mt-1">{previewHw.title}</h3>
              <p className="text-[10px] text-[var(--theme-text-secondary)] mt-1">
                Assigned by {previewHw.teacherName} • Batch: {previewHw.batchName} • Date: {previewHw.uploadDate}
              </p>
            </div>

            {/* Sheet Content / Notes */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-[var(--theme-text-secondary)] uppercase">Homework Notes / Instructions:</span>
                <button
                  onClick={() => handleCopyNotes(previewHw.notes)}
                  className="flex items-center gap-1 text-[9px] text-blue-400 font-bold hover:underline cursor-pointer"
                >
                  {copied ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
                  {copied ? 'Copied!' : 'Copy Notes'}
                </button>
              </div>
              <div className="bg-slate-950 border border-white/5 p-4 rounded-xl text-xs leading-relaxed text-slate-100 font-medium whitespace-pre-wrap max-h-48 overflow-y-auto">
                {previewHw.notes}
              </div>
            </div>

            {/* Attachment preview / details */}
            {previewHw.fileName && (
              <div className="space-y-2 pt-1">
                <span className="text-[10px] font-bold text-[var(--theme-text-secondary)] uppercase block">Attached File / Drawing:</span>
                <div className="border border-white/5 bg-slate-950 p-3 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-purple-400" />
                    <div>
                      <strong className="text-white block truncate max-w-[200px]">{previewHw.fileName}</strong>
                      <span className="text-[9px] text-[var(--theme-text-secondary)] block">Type: {previewHw.fileType?.toUpperCase()}</span>
                    </div>
                  </div>
                  
                  {previewHw.fileData && (
                    <button
                      onClick={() => handleDownloadFile(previewHw)}
                      className="flex items-center gap-1.5 py-1.5 px-3 bg-purple-600 hover:bg-purple-700 font-bold text-[10px] rounded-lg text-white transition-all cursor-pointer shadow-md w-full sm:w-auto justify-center"
                    >
                      <Download size={12} /> Download File
                    </button>
                  )}
                </div>

                {/* Inline Base64 Image preview if applicable */}
                {previewHw.fileType === 'image' && previewHw.fileData && (
                  <div className="border border-white/5 rounded-xl overflow-hidden max-h-64 flex justify-center bg-slate-950 mt-2">
                    <img 
                      src={previewHw.fileData} 
                      alt="Homework Attachment" 
                      className="max-h-64 object-contain w-full"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 border-t border-white/5 text-[11px] text-[var(--theme-text-secondary)] font-bold">
              <span className="flex items-center gap-1 text-red-400">
                <Calendar size={13} /> Deadline: {previewHw.deadline}
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => toggleHomeworkAction(previewHw.id, 'complete', previewHw.completedBy.includes(profile.email || ''))}
                  className={`flex-1 sm:flex-none py-1.5 px-4 rounded-xl font-bold border transition-all cursor-pointer text-center text-xs flex items-center justify-center gap-1.5 ${
                    previewHw.completedBy.includes(profile.email || '') 
                      ? 'bg-green-600 text-white border-green-500' 
                      : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                  }`}
                >
                  <CheckCircle2 size={13} /> 
                  {previewHw.completedBy.includes(profile.email || '') ? 'Marked Done' : 'Mark Completed'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
