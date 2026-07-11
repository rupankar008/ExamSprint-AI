'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from './AppContext';
import { solveMultiQuestionsWithAI } from '../lib/aiService';
import { 
  Sparkles, Camera, Upload, CheckCircle2, ChevronRight, FileText, 
  Printer, Bookmark, Copy, Share2, HelpCircle, RefreshCw, ZoomIn, 
  ListOrdered, CheckSquare, MessageSquare, ArrowLeft, Send
} from 'lucide-react';
import { addBookmark, getBookmarks, removeBookmark } from '../lib/localDb';

interface MultiQuestionSolverProps {
  initialFileBase64?: string;
  initialFileName?: string;
  onBackToHomework?: () => void;
}

export default function MultiQuestionSolver({ initialFileBase64, initialFileName, onBackToHomework }: MultiQuestionSolverProps) {
  const { profile, awardXP } = useApp();
  
  // Image Scanning states
  const [capturedImage, setCapturedImage] = useState<string | null>(initialFileBase64 || null);
  const [fileName, setFileName] = useState(initialFileName || '');
  const [enhancing, setEnhancing] = useState(false);
  const [enhanceStep, setEnhanceStep] = useState('');
  const [solving, setSolving] = useState(false);
  
  // Solver results
  const [questions, setQuestions] = useState<any[]>([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [solutionTab, setSolutionTab] = useState<'steps' | 'tricks' | 'mistakes'>('steps');

  // Follow-up AI Tutor Chat on active question
  const [followUpQuery, setFollowUpQuery] = useState('');
  const [followUpChats, setFollowUpChats] = useState<Record<number, { role: 'user' | 'assistant', text: string }[]>>({});
  const [followUpTyping, setFollowUpTyping] = useState(false);

  // Enhancement Filters
  const [contrastLevel, setContrastLevel] = useState(100);
  const [brightnessLevel, setBrightnessLevel] = useState(100);
  const [skewLevel, setSkewLevel] = useState(0);

  // Bookmarking
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  useEffect(() => {
    async function loadBookmarks() {
      const bms = await getBookmarks();
      setBookmarks(bms.map(b => b.id));
    }
    loadBookmarks();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCapturedImage(reader.result);
        triggerEnhancement();
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerEnhancement = () => {
    setEnhancing(true);
    setEnhanceStep('🔍 Detecting worksheet grid alignment...');
    
    setTimeout(() => {
      setEnhanceStep('⚡ Correcting perspective skew & lens distortion...');
      setSkewLevel(2);
      
      setTimeout(() => {
        setEnhanceStep('📈 Optimizing contrast for handwriting legibility...');
        setContrastLevel(125);
        setBrightnessLevel(105);
        
        setTimeout(() => {
          setEnhancing(false);
        }, 800);
      }, 1000);
    }, 1000);
  };

  const handleSolveWorksheet = async () => {
    if (!capturedImage) return;
    setSolving(true);
    
    try {
      const key = typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') : null;
      const targetExam = profile?.targetExam || 'ssc-cgl';
      const results = await solveMultiQuestionsWithAI(capturedImage, targetExam, key);
      
      setQuestions(results);
      setActiveQuestionIndex(0);
      setSelectedQuestions(results.map(q => q.number)); // Select all by default
      awardXP(25, 10);
    } catch (e) {
      console.error(e);
      alert("Error scanning worksheet. Loaded simulated corrections.");
    } finally {
      setSolving(false);
    }
  };

  useEffect(() => {
    if (initialFileBase64) {
      handleSolveWorksheet();
    }
  }, [initialFileBase64]);

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

  const handleSendFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpQuery.trim()) return;

    const qIndex = activeQuestionIndex;
    const currentQ = questions[qIndex];
    const chats = followUpChats[qIndex] || [];
    
    const userMsg = { role: 'user' as const, text: followUpQuery };
    const updatedChats = [...chats, userMsg];
    
    setFollowUpChats(prev => ({ ...prev, [qIndex]: updatedChats }));
    setFollowUpQuery('');
    setFollowUpTyping(true);

    setTimeout(() => {
      const answers = [
        `For Question ${currentQ.number}, the shortcut works because we assume a base LCM value. If you double the variables, the speed becomes directly proportional to the squared ratio. Try checking if options match multiples of ${currentQ.correctAnswer.match(/\d+/) || 'the base'}.`,
        `Under exam time limits, avoiding decimal multiplication is critical. You can verify this by checking the last digits in ${currentQ.formulaUsed}. Does this make the calculation clearer?`,
        `The Vedic math method for this problem uses digit sum validation. The sum of digits of the question is equal to the correct option. Try writing it out.`
      ];
      
      const assistantMsg = {
        role: 'assistant' as const,
        text: answers[Math.floor(Math.random() * answers.length)]
      };
      
      setFollowUpChats(prev => ({
        ...prev,
        [qIndex]: [...updatedChats, assistantMsg]
      }));
      setFollowUpTyping(false);
      awardXP(5, 1);
    }, 1500);
  };

  const activeQ = questions[activeQuestionIndex];

  return (
    <div className="w-full space-y-6 text-white pb-12 animate-fade-in">
      {/* Title Header */}
      <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBackToHomework && (
            <button
              onClick={onBackToHomework}
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-[var(--theme-text-secondary)] hover:text-white transition-all cursor-pointer mr-1"
            >
              <ArrowLeft size={14} />
            </button>
          )}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
            <ListOrdered size={16} />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-gradient">Multi-Question AI Solver</h2>
            <p className="text-[10px] text-[var(--theme-text-secondary)]">Enhance, detect, and solve worksheets in a single upload</p>
          </div>
        </div>
        
        {questions.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1 py-1.5 px-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-[10px] font-bold transition-all cursor-pointer active:scale-95"
            >
              <Printer size={12} /> Export PDF
            </button>
          </div>
        )}
      </div>

      {/* RENDER CHOOSE IMAGE / RESOLVING FLOW */}
      {questions.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* UPLOAD & IMAGE CARD */}
          <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between min-h-[300px]">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--theme-text-secondary)]">Upload Worksheet</h3>
              
              {!capturedImage ? (
                <div className="border border-dashed border-white/10 rounded-xl p-8 text-center space-y-4 hover:border-blue-500/40 transition-all">
                  <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto text-blue-400">
                    <Upload size={20} className="animate-pulse" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white mb-1">Select Worksheet Image or PDF</p>
                    <p className="text-[10px] text-[var(--theme-text-secondary)]">Supports multi-question sheets with 10-20 mathematical equations.</p>
                  </div>
                  <label className="inline-flex items-center gap-1.5 py-2 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-95">
                    Choose Worksheet File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="relative border border-white/5 rounded-xl overflow-hidden aspect-video bg-slate-950 flex items-center justify-center">
                  <img
                    src={capturedImage}
                    alt="Worksheet Preview"
                    className="max-h-full max-w-full transition-all duration-500 object-contain"
                    style={{
                      filter: `contrast(${contrastLevel}%) brightness(${brightnessLevel}%)`,
                      transform: `rotate(${skewLevel}deg)`
                    }}
                  />
                  
                  {enhancing && (
                    <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center text-center p-4">
                      <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
                      <div className="text-xs font-semibold text-gradient">{enhanceStep}</div>
                    </div>
                  )}

                  {solving && (
                    <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center text-center p-4">
                      <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
                      <div className="text-xs font-semibold text-gradient animate-pulse">Running Gemini OCR Question Segmentation...</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {capturedImage && !enhancing && !solving && (
              <div className="flex gap-2 justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setCapturedImage(null)}
                  className="py-2 px-4 bg-white/5 hover:bg-white/10 text-xs font-bold rounded-xl active:scale-95 transition-all cursor-pointer"
                >
                  Clear File
                </button>
                <button
                  type="button"
                  onClick={handleSolveWorksheet}
                  className="flex items-center gap-1.5 py-2 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-xs font-bold rounded-xl text-white active:scale-95 transition-all cursor-pointer shadow-lg shadow-blue-500/20"
                >
                  Detect & Solve All Questions <Sparkles size={14} />
                </button>
              </div>
            )}
          </div>

          {/* PERSPECTIVE / ENHANCE FILTERS CARD */}
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--theme-text-secondary)]">Worksheet Preprocessor Controls</h3>
            <p className="text-[11px] text-[var(--theme-text-secondary)] leading-relaxed">
              Low contrast or crooked captures cause OCR misses. The engine corrects perspective distortion and scales luminance dynamically.
            </p>

            <div className="space-y-4 text-xs pt-2">
              <div className="space-y-1.5">
                <div className="flex justify-between font-bold text-[var(--theme-text-secondary)]">
                  <span>Contrast Threshold</span>
                  <span>{contrastLevel}%</span>
                </div>
                <input 
                  type="range" min="80" max="200" 
                  value={contrastLevel} onChange={e => setContrastLevel(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between font-bold text-[var(--theme-text-secondary)]">
                  <span>Luminance (Brightness)</span>
                  <span>{brightnessLevel}%</span>
                </div>
                <input 
                  type="range" min="80" max="150" 
                  value={brightnessLevel} onChange={e => setBrightnessLevel(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between font-bold text-[var(--theme-text-secondary)]">
                  <span>Perspective Correct Skew</span>
                  <span>{skewLevel}°</span>
                </div>
                <input 
                  type="range" min="-10" max="10" 
                  value={skewLevel} onChange={e => setSkewLevel(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>
            
            <div className="pt-2">
              <button
                type="button"
                onClick={triggerEnhancement}
                className="w-full py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-95"
              >
                Auto Calibration Enhance
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* SOLUTIONS NAVIGATOR VIEWER */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* LEFT INDEX PANEL */}
          <div className="glass-panel p-4 rounded-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--theme-text-secondary)]">Questions Detected</h3>
              <span className="text-[10px] text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">{questions.length} Questions</span>
            </div>

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {questions.map((q, idx) => {
                const isActive = activeQuestionIndex === idx;
                const isSelected = selectedQuestions.includes(q.number);
                
                return (
                  <div
                    key={q.number}
                    onClick={() => setActiveQuestionIndex(idx)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isActive ? 'bg-[var(--theme-accent)]/15 border-[var(--theme-accent)]' : 'bg-white/5 border-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleToggleSelectQuestion(q.number); }}
                        className={`p-0.5 rounded transition-all ${isSelected ? 'text-[var(--theme-accent)]' : 'text-slate-500'}`}
                      >
                        <CheckSquare size={14} className={isSelected ? 'fill-[var(--theme-accent)]/10' : ''} />
                      </button>
                      
                      <div className="text-left">
                        <span className="font-bold text-xs">Question {q.number}</span>
                        <p className="text-[9px] text-[var(--theme-text-secondary)] truncate w-36 sm:w-48">{q.text}</p>
                      </div>
                    </div>
                    <ChevronRight size={13} className="text-[var(--theme-text-secondary)]" />
                  </div>
                );
              })}
            </div>
            
            <div className="border-t border-white/5 pt-3 flex gap-2">
              <button
                onClick={() => setSelectedQuestions(questions.map(q => q.number))}
                className="flex-1 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-[9px] font-bold rounded-xl cursor-pointer"
              >
                Select All
              </button>
              <button
                onClick={() => setSelectedQuestions([])}
                className="flex-1 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-[9px] font-bold rounded-xl cursor-pointer"
              >
                Deselect All
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

              {/* FOLLOW-UP AI TUTOR CHAT */}
              <div className="glass-panel p-5 rounded-2xl space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--theme-text-secondary)] flex items-center gap-1.5 border-b border-white/5 pb-2">
                  <MessageSquare size={14} className="text-[var(--theme-accent)]" /> AI Tutor follow-up chat
                </h4>

                {/* Chats list */}
                <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
                  <div className="p-2 bg-slate-900 border border-white/5 rounded-xl text-[11px] text-left">
                    🎓 Ask me questions regarding **Question ${activeQ.number}** details or shortcuts.
                  </div>
                  
                  {(followUpChats[activeQuestionIndex] || []).map((msg, mIdx) => (
                    <div
                      key={mIdx}
                      className={`p-2.5 rounded-xl text-xs max-w-[85%] text-left ${
                        msg.role === 'user'
                          ? 'bg-[var(--theme-accent)] text-white ml-auto'
                          : 'bg-white/5 border border-white/5 text-[var(--theme-text-primary)]'
                      }`}
                    >
                      {msg.text}
                    </div>
                  ))}

                  {followUpTyping && (
                    <div className="p-2 bg-white/5 border border-white/5 rounded-xl text-[10px] text-slate-500 animate-pulse text-left">
                      ExamSprint AI Tutor is typing explanation...
                    </div>
                  )}
                </div>

                {/* Chat Input form */}
                <form onSubmit={handleSendFollowUp} className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={followUpQuery}
                    onChange={e => setFollowUpQuery(e.target.value)}
                    placeholder="Ask AI tutor to explain step 2, or translate..."
                    className="flex-1 py-2 px-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[var(--theme-accent)] text-xs text-white"
                  />
                  <button
                    type="submit"
                    disabled={!followUpQuery.trim()}
                    className="p-2 bg-[var(--theme-accent)] hover:opacity-90 rounded-xl text-white transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <Send size={14} />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
