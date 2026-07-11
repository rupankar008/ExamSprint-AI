'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from './AppContext';
import { solveMultiQuestionsWithAI, chatWithGemini } from '../lib/aiService';
import { 
  Sparkles, Camera, Upload, CheckCircle2, ChevronRight,
  Printer, Bookmark, Copy, RefreshCw,
  ListOrdered, CheckSquare, MessageSquare, ArrowLeft, Send,
  X, Zap, AlertCircle, Brain
} from 'lucide-react';
import { addBookmark, getBookmarks, removeBookmark } from '../lib/localDb';

interface MultiQuestionSolverProps {
  initialFileBase64?: string;
  initialFileName?: string;
  onBackToHomework?: () => void;
}

export default function MultiQuestionSolver({ initialFileBase64, initialFileName, onBackToHomework }: MultiQuestionSolverProps) {
  const { profile, awardXP } = useApp();
  
  const [capturedImage, setCapturedImage] = useState<string | null>(initialFileBase64 || null);
  const [fileName, setFileName] = useState(initialFileName || '');
  const [solving, setSolving] = useState(false);
  const [solveError, setSolveError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [solutionTab, setSolutionTab] = useState<'steps' | 'tricks' | 'mistakes'>('steps');
  const [followUpQuery, setFollowUpQuery] = useState('');
  const [followUpChats, setFollowUpChats] = useState<Record<number, { role: 'user' | 'assistant', text: string }[]>>({});
  const [followUpTyping, setFollowUpTyping] = useState(false);
  const [contrastLevel, setContrastLevel] = useState(100);
  const [brightnessLevel, setBrightnessLevel] = useState(100);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const solveAttempted = useRef(false);

  useEffect(() => {
    async function loadBookmarks() {
      const bms = await getBookmarks();
      setBookmarks(bms.map((b: any) => b.id));
    }
    loadBookmarks();
  }, []);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [followUpChats, followUpTyping]);

  useEffect(() => {
    if (initialFileBase64 && !solveAttempted.current) {
      solveAttempted.current = true;
      handleSolveWorksheet(initialFileBase64);
    }
  }, [initialFileBase64]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setSolveError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setCapturedImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1920 } } 
      });
      setCameraStream(stream);
      setShowCamera(true);
      setTimeout(() => {
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      }, 100);
    } catch { alert('Camera access denied. Please allow camera permission.'); }
  };

  const stopCamera = () => {
    if (cameraStream) { cameraStream.getTracks().forEach(t => t.stop()); setCameraStream(null); }
    setShowCamera(false);
  };

  const captureFromCamera = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0);
    setCapturedImage(canvas.toDataURL('image/jpeg', 0.92));
    setFileName('Camera Capture');
    setSolveError(null);
    stopCamera();
  };

  const handleSolveWorksheet = async (imageOverride?: string) => {
    const image = imageOverride || capturedImage;
    if (!image) return;
    setSolving(true);
    setSolveError(null);
    setQuestions([]);
    try {
      const key = typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') : null;
      const targetExam = profile?.targetExam || 'ssc-cgl';
      const results = await solveMultiQuestionsWithAI(image, targetExam, key);
      if (!results || results.length === 0) {
        setSolveError('No questions detected. Try a clearer photo with better lighting.');
        return;
      }
      setQuestions(results);
      setActiveQuestionIndex(0);
      setSelectedQuestions(results.map((q: any) => q.number));
      awardXP(25, 10);
    } catch (e: any) {
      setSolveError(e?.message || 'Scan failed. Check your Gemini API key in Settings.');
    } finally {
      setSolving(false);
    }
  };

  useEffect(() => {
    // Auto-solve is now handled via solveAttempted ref above
  }, []);

  const handleToggleSelectQuestion = (qNum: number) => {
    setSelectedQuestions(prev => 
      prev.includes(qNum) ? prev.filter(n => n !== qNum) : [...prev, qNum]
    );
  };

  const handleBookmarkQuestion = async (q: any) => {
    const bookmarkId = `mq-${fileName}-${q.number}`;
    const isBookmarked = bookmarks.includes(bookmarkId);

    if (isBookmarked) {
      await removeBookmark(bookmarkId);
      setBookmarks(prev => prev.filter(id => id !== bookmarkId));
    } else {
      await addBookmark({
        id: bookmarkId,
        type: 'question',
        title: `Q${q.number} in ${fileName || 'Worksheet'}`,
        content: q.text,
        chapter: q.topic,
        shortcut: q.shortcutMethod,
        timestamp: Date.now()
      });
      setBookmarks(prev => [...prev, bookmarkId]);
    }
  };

  const handleCopySolution = (q: any) => {
    const text = `Question ${q.number}: ${q.text}\n\nAnswer: ${q.correctAnswer}\n\nSteps:\n${q.stepByStep.join('\n')}\n\nShortcut:\n${q.shortcutMethod}`;
    navigator.clipboard.writeText(text);
    alert("📋 Solution copied to clipboard!");
  };

  const handleExportPDF = () => {
    // Open a beautifully formatted window layout and print it
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const selectedList = questions.filter(q => selectedQuestions.includes(q.number));
    
    let html = `
      <html>
        <head>
          <title>${fileName || 'Worksheet'} AI Solutions - ExamSprint</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
            h1 { color: #1e3a8a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 30px; }
            .meta { font-size: 12px; color: #64748b; margin-bottom: 20px; }
            .q-card { margin-bottom: 40px; page-break-inside: avoid; border-bottom: 1px dashed #cbd5e1; padding-bottom: 20px; }
            .q-num { font-weight: 800; color: #2563eb; font-size: 18px; margin-bottom: 10px; }
            .q-text { font-weight: bold; background: #f8fafc; padding: 12px; border-left: 4px solid #3b82f6; margin-bottom: 15px; }
            .steps { margin-left: 20px; margin-bottom: 15px; }
            .steps li { margin-bottom: 6px; }
            .box { background: #f1f5f9; padding: 12px; border-radius: 8px; font-size: 13px; margin-top: 10px; }
            .trick { border-left: 4px solid #10b981; background: #ecfdf5; }
            .mistake { border-left: 4px solid #ef4444; background: #fef2f2; }
          </style>
        </head>
        <body>
          <h1>ExamSprint AI Worksheet Solutions</h1>
          <div class="meta">Worksheet: ${fileName || 'Multi-Question Sheet'} | Target Exam: ${profile?.targetExam.toUpperCase()} | Generated: ${new Date().toLocaleDateString()}</div>
    `;

    selectedList.forEach(q => {
      html += `
        <div class="q-card">
          <div class="q-num">Question ${q.number} [${q.topic} - ${q.difficulty}]</div>
          <div class="q-text">${q.text}</div>
          <div><strong>Correct Answer:</strong> ${q.correctAnswer}</div>
          <h3>Step-by-Step Solving:</h3>
          <ol class="steps">
            ${q.stepByStep.map((s: string) => `<li>${s}</li>`).join('')}
          </ol>
          <div class="box trick">
            <strong>Exam Shortcut Method:</strong> ${q.shortcutMethod}
          </div>
          <div class="box">
            <strong>Formula Reference:</strong> ${q.formulaUsed}
          </div>
        </div>
      `;
    });

    html += `
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const handleSendFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpQuery.trim() || followUpTyping) return;
    const qIndex = activeQuestionIndex;
    const currentQ = questions[qIndex];
    const chats = followUpChats[qIndex] || [];
    const userMsg = { role: 'user' as const, text: followUpQuery };
    const updatedChats = [...chats, userMsg];
    setFollowUpChats(prev => ({ ...prev, [qIndex]: updatedChats }));
    setFollowUpQuery('');
    setFollowUpTyping(true);
    try {
      const key = typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') : null;
      const contextMsg = {
        role: 'user' as const,
        content: `Context: Solved Q from ${profile?.targetExam || 'SSC'} worksheet:\nQuestion: ${currentQ.text}\nAnswer: ${currentQ.correctAnswer}\nSteps: ${(currentQ.stepByStep || []).join(' -> ')}\nShortcut: ${currentQ.shortcutMethod}\n\nStudent asks: ${userMsg.text}`
      };
      const aiResponse = await chatWithGemini([contextMsg], key);
      setFollowUpChats(prev => ({ ...prev, [qIndex]: [...updatedChats, { role: 'assistant' as const, text: aiResponse }] }));
      awardXP(5, 1);
    } catch {
      setFollowUpChats(prev => ({ ...prev, [qIndex]: [...updatedChats, { role: 'assistant' as const, text: 'Unable to get AI response. Check your internet connection.' }] }));
    } finally {
      setFollowUpTyping(false);
    }
  };

  const activeQ = questions[activeQuestionIndex];

  return (
    <div className="w-full space-y-4 text-white pb-24 animate-fade-in">
      {/* HEADER */}
      <div className="glass-panel p-4 rounded-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {onBackToHomework && (
            <button onClick={onBackToHomework} className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
              <ArrowLeft size={14} />
            </button>
          )}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shrink-0">
            <ListOrdered size={16} />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-gradient">Multi-Question AI Solver</h2>
            <p className="text-[10px] text-[var(--theme-text-secondary)]">Photograph or upload any worksheet — AI solves everything</p>
          </div>
        </div>
        {questions.length > 0 && (
          <button onClick={handleExportPDF} className="flex items-center gap-1 py-1.5 px-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-[10px] font-bold transition-all cursor-pointer shrink-0">
            <Printer size={12} /> Export PDF
          </button>
        )}
      </div>

      {/* CAMERA MODAL */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black aspect-video">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-6 border-2 border-white/20 rounded-lg" />
                <div className="absolute top-6 left-6 w-6 h-6 border-t-2 border-l-2 border-blue-400 rounded-tl" />
                <div className="absolute top-6 right-6 w-6 h-6 border-t-2 border-r-2 border-blue-400 rounded-tr" />
                <div className="absolute bottom-6 left-6 w-6 h-6 border-b-2 border-l-2 border-blue-400 rounded-bl" />
                <div className="absolute bottom-6 right-6 w-6 h-6 border-b-2 border-r-2 border-blue-400 rounded-br" />
              </div>
            </div>
            <p className="text-center text-xs text-[var(--theme-text-secondary)]">Position your worksheet within the frame</p>
            <div className="flex gap-3">
              <button onClick={stopCamera} className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all">
                <X size={16} /> Cancel
              </button>
              <button onClick={captureFromCamera} className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all shadow-lg shadow-blue-500/30">
                <Camera size={16} /> Capture
              </button>
            </div>
          </div>
        </div>
      )}

      {questions.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--theme-text-secondary)]">Upload or Scan Worksheet</h3>
            
            {!capturedImage ? (
              <div className="space-y-3">
                <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center space-y-3 hover:border-blue-500/40 transition-all">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto text-blue-400">
                    <Upload size={20} />
                  </div>
                  <p className="text-xs text-[var(--theme-text-secondary)]">Supports JPG, PNG — multi-question exam sheets</p>
                  <label className="inline-flex items-center gap-1.5 py-2 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-xs font-bold rounded-xl cursor-pointer hover:opacity-90 active:scale-95 transition-all">
                    <Upload size={13} /> Choose File
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
                <button onClick={startCamera} className="w-full py-3 flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95">
                  <Camera size={15} className="text-blue-400" /> Use Camera to Scan Worksheet
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-video flex items-center justify-center border border-white/5">
                  <img src={capturedImage} alt="Worksheet"
                    className="max-h-full max-w-full object-contain transition-all"
                    style={{ filter: `contrast(${contrastLevel}%) brightness(${brightnessLevel}%)` }}
                  />
                  {solving && (
                    <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        <Brain size={16} className="absolute inset-0 m-auto text-indigo-400" />
                      </div>
                      <p className="text-xs font-bold text-gradient animate-pulse">Gemini 2.5 Flash scanning questions...</p>
                      <p className="text-[10px] text-[var(--theme-text-secondary)]">OCR + AI solving all detected questions</p>
                    </div>
                  )}
                </div>
                {solveError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2 text-xs text-red-300">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span>{solveError}</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => { setCapturedImage(null); setSolveError(null); }}
                    className="py-2 px-3 bg-white/5 hover:bg-white/10 text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-95">Clear</button>
                  <button onClick={startCamera} className="py-2 px-3 bg-white/5 hover:bg-white/10 text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-95 flex items-center gap-1">
                    <Camera size={12} /> Retake
                  </button>
                  <button onClick={() => handleSolveWorksheet()} disabled={solving}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-xs font-bold rounded-xl text-white cursor-pointer active:scale-95 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-60 disabled:cursor-wait">
                    {solving ? <RefreshCw size={13} className="animate-spin" /> : <Zap size={13} />}
                    {solving ? 'AI Solving...' : 'Detect & Solve All'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Enhancement Controls */}
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--theme-text-secondary)]">Image Enhancement</h3>
            <p className="text-[11px] text-[var(--theme-text-secondary)] leading-relaxed">
              Adjust contrast and brightness to help AI recognize handwriting better.
            </p>
            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <div className="flex justify-between font-bold text-[var(--theme-text-secondary)]">
                  <span>Contrast</span><span className="text-white">{contrastLevel}%</span>
                </div>
                <input type="range" min="80" max="200" value={contrastLevel} onChange={e => setContrastLevel(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500" />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between font-bold text-[var(--theme-text-secondary)]">
                  <span>Brightness</span><span className="text-white">{brightnessLevel}%</span>
                </div>
                <input type="range" min="80" max="150" value={brightnessLevel} onChange={e => setBrightnessLevel(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500" />
              </div>
              <button onClick={() => { setContrastLevel(125); setBrightnessLevel(108); }}
                className="w-full py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold rounded-xl cursor-pointer active:scale-95 transition-all">
                Auto Enhance for Handwriting
              </button>
            </div>
            <div className="pt-2 border-t border-white/5 space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--theme-text-secondary)]">Tips for best results</p>
              {['Use good lighting — avoid shadows','Keep camera parallel to paper','All questions must be in frame','Higher contrast helps faint pencil writing'].map((tip, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[10px] text-[var(--theme-text-secondary)]">
                  <CheckCircle2 size={10} className="text-green-400 mt-0.5 shrink-0" /><span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* SOLUTIONS VIEW */
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="glass-panel p-3 rounded-xl text-center">
              <div className="text-xl font-black text-[var(--theme-accent)]">{questions.length}</div>
              <div className="text-[9px] uppercase tracking-wider text-[var(--theme-text-secondary)] font-bold">Questions</div>
            </div>
            <div className="glass-panel p-3 rounded-xl text-center">
              <div className="text-xl font-black text-green-400">{questions.filter(q => q.difficulty === 'Easy').length}</div>
              <div className="text-[9px] uppercase tracking-wider text-[var(--theme-text-secondary)] font-bold">Easy</div>
            </div>
            <div className="glass-panel p-3 rounded-xl text-center">
              <div className="text-xl font-black text-orange-400">{questions.filter(q => q.difficulty !== 'Easy').length}</div>
              <div className="text-[9px] uppercase tracking-wider text-[var(--theme-text-secondary)] font-bold">Med/Hard</div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
            {/* QUESTION INDEX */}
            <div className="glass-panel p-4 rounded-2xl space-y-3">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--theme-text-secondary)]">Questions</h3>
                <span className="text-[10px] text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">{questions.length} total</span>
              </div>
              <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
                {questions.map((q, idx) => {
                  const isActive = activeQuestionIndex === idx;
                  const isSelected = selectedQuestions.includes(q.number);
                  const diffColor = q.difficulty === 'Easy' ? 'text-green-400' : q.difficulty === 'Hard' ? 'text-red-400' : 'text-orange-400';
                  return (
                    <div key={q.number} onClick={() => setActiveQuestionIndex(idx)}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                        isActive ? 'bg-[var(--theme-accent)]/15 border-[var(--theme-accent)]/50' : 'bg-white/3 border-white/5 hover:bg-white/8'
                      }`}
                    >
                      <button type="button"
                        onClick={e => { e.stopPropagation(); setSelectedQuestions(prev => prev.includes(q.number) ? prev.filter(n => n !== q.number) : [...prev, q.number]); }}
                        className={`shrink-0 ${isSelected ? 'text-[var(--theme-accent)]' : 'text-slate-600'}`}>
                        <CheckSquare size={13} />
                      </button>
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[11px]">Q{q.number}</span>
                          <span className={`text-[8px] font-bold uppercase ${diffColor}`}>{q.difficulty}</span>
                        </div>
                        <p className="text-[9px] text-[var(--theme-text-secondary)] truncate">{q.text}</p>
                      </div>
                      <ChevronRight size={12} className="text-[var(--theme-text-secondary)] shrink-0" />
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-2 border-t border-white/5 pt-2">
                <button onClick={() => setSelectedQuestions(questions.map(q => q.number))}
                  className="flex-1 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-[9px] font-bold rounded-lg cursor-pointer">All</button>
                <button onClick={() => setSelectedQuestions([])}
                  className="flex-1 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-[9px] font-bold rounded-lg cursor-pointer">None</button>
                <button onClick={() => { setQuestions([]); setCapturedImage(null); setSolveError(null); }}
                  className="flex-1 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-[9px] font-bold rounded-lg cursor-pointer flex items-center justify-center gap-1">
                  <RefreshCw size={9} /> New
                </button>
              </div>
            </div>

          {/* RIGHT SOLUTION DETAILS PANEL */}
          {activeQ && (
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-panel p-5 rounded-2xl space-y-4">
                {/* Active Solution header actions */}
                <div className="flex justify-between items-start gap-4">
                  <div className="text-left">
                    <span className="px-2.5 py-0.5 rounded bg-[var(--theme-accent)]/20 text-[var(--theme-accent)] border border-[var(--theme-accent)]/30 font-bold uppercase tracking-wider text-[9px]">
                      {activeQ.topic}
                    </span>
                    <h3 className="font-black text-base mt-2">Question {activeQ.number} Summary</h3>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBookmarkQuestion(activeQ)}
                      className={`p-2 rounded bg-white/5 border border-white/5 transition-all cursor-pointer ${
                        bookmarks.includes(`mq-${fileName}-${activeQ.number}`) ? 'text-yellow-400 bg-yellow-500/15' : 'text-[var(--theme-text-secondary)] hover:text-white'
                      }`}
                    >
                      <Bookmark size={13} />
                    </button>
                    <button
                      onClick={() => handleCopySolution(activeQ)}
                      className="p-2 rounded bg-white/5 border border-white/5 hover:text-white text-[var(--theme-text-secondary)] transition-all cursor-pointer"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                </div>

                {/* Question text box */}
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl font-medium text-xs leading-relaxed text-left">
                  {activeQ.text}
                </div>

                {/* Solution Tab selectors */}
                <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-xl">
                  {[
                    { id: 'steps', label: 'Detailed Solution' },
                    { id: 'tricks', label: 'Shortcuts & Tricks' },
                    { id: 'mistakes', label: 'Mistakes to Avoid' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setSolutionTab(tab.id as any)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        solutionTab === tab.id ? 'bg-[var(--theme-accent)] text-white shadow-sm' : 'text-[var(--theme-text-secondary)] hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                {solutionTab === 'steps' && (
                  <div className="space-y-4 text-left animate-fade-in text-xs">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="font-bold text-[var(--theme-text-secondary)]">Correct Option/Answer:</span>
                      <span className="font-black text-green-400 text-sm bg-green-500/10 px-3 py-0.5 rounded border border-green-500/20">{activeQ.correctAnswer}</span>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold text-[var(--theme-text-secondary)]">Step-by-Step Derivation</h4>
                      <ol className="list-decimal list-inside space-y-2 pl-1 leading-relaxed">
                        {activeQ.stepByStep.map((step: string, sIdx: number) => (
                          <li key={sIdx}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    {activeQ.alternativeSolution && (
                      <div className="space-y-1 text-[var(--theme-text-secondary)] leading-relaxed">
                        <span className="font-bold text-white">Alternative Solution:</span>
                        <p>{activeQ.alternativeSolution}</p>
                      </div>
                    )}
                  </div>
                )}

                {solutionTab === 'tricks' && (
                  <div className="space-y-4 text-left animate-fade-in text-xs">
                    <div className="p-3 bg-green-500/5 border border-green-500/10 rounded-xl space-y-1">
                      <span className="font-bold text-green-400 block uppercase tracking-wider text-[10px]">⚡ Formula Shortcut</span>
                      <p className="leading-relaxed text-white">{activeQ.shortcutMethod}</p>
                    </div>

                    <div className="p-3 bg-purple-500/5 border border-purple-500/10 rounded-xl space-y-1">
                      <span className="font-bold text-purple-400 block uppercase tracking-wider text-[10px]">✨ Vedic Master Trick</span>
                      <p className="leading-relaxed text-white">{activeQ.fastTrick}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-[10px] text-[var(--theme-text-secondary)]">
                      <div>
                        <span className="font-bold text-white block">Formula Reference</span>
                        <span className="block mt-1 font-mono">{activeQ.formulaUsed}</span>
                      </div>
                      <div>
                        <span className="font-bold text-white block">Mnemonic / Memory Mnemonic</span>
                        <span className="block mt-1">{activeQ.memoryTrick}</span>
                      </div>
                    </div>
                  </div>
                )}

                {solutionTab === 'mistakes' && (
                  <div className="space-y-4 text-left animate-fade-in text-xs">
                    <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl space-y-1">
                      <span className="font-bold text-red-400 block uppercase tracking-wider text-[10px]">⚠️ Common Pitfalls & Mistakes</span>
                      <p className="leading-relaxed text-white">{activeQ.commonMistakes}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-[10px] text-center pt-2">
                      <div className="p-2 bg-white/5 rounded-lg">
                        <span className="text-[var(--theme-text-secondary)] block mb-0.5">Complexity</span>
                        <span className="font-bold text-white text-xs">{activeQ.difficulty}</span>
                      </div>
                      <div className="p-2 bg-white/5 rounded-lg">
                        <span className="text-[var(--theme-text-secondary)] block mb-0.5">Avg Solve Speed</span>
                        <span className="font-bold text-white text-xs">{activeQ.solvingTime}</span>
                      </div>
                      <div className="p-2 bg-white/5 rounded-lg">
                        <span className="text-[var(--theme-text-secondary)] block mb-0.5">Chapter</span>
                        <span className="font-bold text-white text-xs truncate max-w-full block">{activeQ.chapter}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

                {/* AI TUTOR CHAT */}
                <div className="glass-panel p-4 rounded-2xl space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--theme-text-secondary)] flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <MessageSquare size={13} className="text-[var(--theme-accent)]" /> Ask AI Tutor about Q{activeQ.number}
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    <div className="p-2.5 bg-slate-900 border border-white/5 rounded-xl text-[11px] text-[var(--theme-text-secondary)]">
                      Ask me anything about this question — shortcuts, explanation in Hindi/Bengali, alternative methods...
                    </div>
                    {(followUpChats[activeQuestionIndex] || []).map((msg, i) => (
                      <div key={i} className={`p-2.5 rounded-xl text-xs max-w-[85%] ${
                        msg.role === 'user' ? 'bg-[var(--theme-accent)] text-white ml-auto' : 'bg-white/5 border border-white/5 text-[var(--theme-text-primary)]'
                      }`}>{msg.text}</div>
                    ))}
                    {followUpTyping && (
                      <div className="flex gap-1 items-center p-2.5 bg-white/5 border border-white/5 rounded-xl w-16">
                        <div className="w-1.5 h-1.5 bg-[var(--theme-accent)] rounded-full animate-bounce" style={{animationDelay:'0ms'}} />
                        <div className="w-1.5 h-1.5 bg-[var(--theme-accent)] rounded-full animate-bounce" style={{animationDelay:'150ms'}} />
                        <div className="w-1.5 h-1.5 bg-[var(--theme-accent)] rounded-full animate-bounce" style={{animationDelay:'300ms'}} />
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  <form onSubmit={handleSendFollowUp} className="flex gap-2">
                    <input type="text" value={followUpQuery} onChange={e => setFollowUpQuery(e.target.value)}
                      placeholder="Explain step 2... or Explain in Hindi..."
                      className="flex-1 py-2 px-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[var(--theme-accent)] text-xs text-white" />
                    <button type="submit" disabled={!followUpQuery.trim() || followUpTyping}
                      className="p-2.5 bg-[var(--theme-accent)] hover:opacity-90 rounded-xl text-white transition-all cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                      <Send size={14} />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
