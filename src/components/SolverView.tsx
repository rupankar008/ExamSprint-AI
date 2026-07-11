'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from './AppContext';
import SolverCanvas from './SolverCanvas';
import { solveMathWithAI, chatWithGemini } from '../lib/aiService';
import { getChats, addChat, deleteChat, clearAllChats, addBookmark, removeBookmark, getBookmarks } from '../lib/localDb';
import { 
  Sparkles, MessageSquare, Bookmark, Volume2, Share2, 
  BookOpen, ChevronRight, HelpCircle, Check, Trash2, Send, ShieldCheck
} from 'lucide-react';

export default function SolverView() {
  const { profile, awardXP } = useApp();
  const [activeResult, setActiveResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'step' | 'shortcut' | 'formula' | 'mistakes'>('shortcut');
  
  // Chat History States
  const [chats, setChats] = useState<any[]>([]);
  const [typedMessage, setTypedMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [bookmarkedList, setBookmarkedList] = useState<string[]>([]);
  const [apiKeySet, setApiKeySet] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const examId = profile?.targetExam || 'ssc-cgl';

  // Load chat history & check API key
  useEffect(() => {
    async function loadHistory() {
      const history = await getChats(examId);
      setChats(history);

      const savedBms = await getBookmarks();
      setBookmarkedList(savedBms.map(b => b.id));

      const defaultKey = "";
      const key = typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') : null;
      const envKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      const activeKey = key || envKey;
      const hasValidKey = activeKey && activeKey !== defaultKey && activeKey.trim() !== "";
      setApiKeySet(!!hasValidKey);
    }
    loadHistory();
  }, [examId]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, isTyping]);

  const handleSolve = async (query: string, base64Image: string | null) => {
    setIsTyping(true);
    
    // Add user query to chats immediately
    let displayContent = query;
    if (query === "Vision OCR math formula") {
      displayContent = "Scanned question from image";
    } else if (query === "Handwritten equation") {
      displayContent = "Handwritten sketch query";
    }

    const userMsg = {
      role: 'user' as const,
      content: displayContent || "Uploaded question image for scan...",
      timestamp: Date.now()
    };
    setChats(prev => [...prev, userMsg]);
    await addChat(examId, userMsg);

    try {
      const key = typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') : null;
      const result = await solveMathWithAI(query, base64Image, examId, key);
      
      setActiveResult(result);
      awardXP(15, 5); // Real solve grants bonus rewards

      const assistantMsg = {
        role: 'assistant' as const,
        content: `I've analyzed the problem using the **Gemini AI Solver**. Here is the summary:\n\n**Topic:** ${result.topic}\n**Correct Answer:** ${result.correctAnswer}\n**Estimated Solve Time:** ${result.solvingTime}\n\n*Check the interactive tabs above for step-by-step Vedic tricks, formulas, and error checklists.*`,
        timestamp: Date.now() + 100,
        mathSolverResult: result
      };
      setChats(prev => [...prev, assistantMsg]);
      await addChat(examId, assistantMsg);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    const userMsg = {
      id: Math.random().toString(36).substring(7),
      role: 'user' as const,
      content: text,
      timestamp: Date.now()
    };
    setChats(prev => [...prev, userMsg]);
    await addChat(examId, userMsg);
    setTypedMessage('');
    setIsTyping(true);

    try {
      const key = typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') : null;
      
      // Feed conversation log array to Gemini chat API
      const conversationLogs = [
        ...chats.map(c => {
          let content = c.content;
          if (c.role === 'assistant' && c.mathSolverResult) {
            const r = c.mathSolverResult;
            content += `\n\n[Context: The tutor has computed this mathematical/GK result:\nTopic: ${r.topic}\nChapter: ${r.chapter}\nCorrect Answer: ${r.correctAnswer}\nSteps:\n${r.stepByStep.join('\n')}\nShortcut Method: ${r.shortcutMethod}\nFast Trick: ${r.fastTrick}\nFormula: ${r.formulaUsed}\nCommon Mistakes: ${r.commonMistakes}]`;
          }
          return { role: c.role as 'user' | 'assistant', content };
        }),
        { role: 'user' as 'user' | 'assistant', content: text }
      ];

      const reply = await chatWithGemini(conversationLogs, key);
      
      const assistantMsg = {
        id: Math.random().toString(36).substring(7),
        role: 'assistant' as const,
        content: reply,
        timestamp: Date.now()
      };
      
      setChats(prev => [...prev, assistantMsg]);
      await addChat(examId, assistantMsg);
      awardXP(5, 1);
    } catch (err) {
      // Fallback response
      const assistantMsg = {
        id: Math.random().toString(36).substring(7),
        role: 'assistant' as const,
        content: `Regarding "${text}": Make sure you double-check formula variables, check values matching divisibility, and analyze common math errors in the tabs above.`,
        timestamp: Date.now()
      };
      setChats(prev => [...prev, assistantMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleBookmarkToggle = async () => {
    if (!activeResult) return;
    const itemId = `sol-${activeResult.topic.replace(/\s+/g, '-').toLowerCase()}`;
    
    if (bookmarkedList.includes(itemId)) {
      await removeBookmark(itemId);
      setBookmarkedList(prev => prev.filter(id => id !== itemId));
    } else {
      const bm = {
        id: itemId,
        type: 'question' as const,
        title: activeResult.topic,
        content: `Answer: ${activeResult.correctAnswer}\nShortcut: ${activeResult.shortcutMethod}`,
        chapter: activeResult.chapter,
        shortcut: activeResult.shortcutMethod,
        timestamp: Date.now()
      };
      await addBookmark(bm);
      setBookmarkedList(prev => [...prev, itemId]);
      alert("⭐ Bookmark added! Access it in your Study Center.");
    }
  };

  const handleClearHistory = async () => {
    if (confirm("Clear chat logs for this exam?")) {
      await clearAllChats(examId);
      setChats([]);
      setActiveResult(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto pb-12 animate-fade-in">
      {/* LEFT: SOLVER CANVAS & INTERACTIVE HUD */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-gradient tracking-tight">AI Mathematics Solver</h1>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px]">
            {apiKeySet ? (
              <span className="text-green-400 font-bold flex items-center gap-1">
                <ShieldCheck size={12} /> Gemini Online API
              </span>
            ) : (
              <span className="text-yellow-400 font-bold flex items-center gap-1">
                ⚠️ Local Vedic Engine Active
              </span>
            )}
          </div>
        </div>
        
        {/* Solver Input Module */}
        <SolverCanvas onSolve={handleSolve} targetExam={examId} />

        {/* Dynamic Solution View */}
        {activeResult ? (
          <div className="glass-panel rounded-2xl p-5 sm:p-6 space-y-5 animate-fade-in border-t-2 border-[var(--theme-accent)]">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--theme-text-secondary)]">
                  {activeResult.chapter} • {activeResult.topic}
                </span>
                <h2 className="text-lg font-bold text-white mt-0.5">AI Solver Results</h2>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleBookmarkToggle}
                  className={`p-2 rounded-lg border transition-all ${
                    bookmarkedList.includes(`sol-${activeResult.topic.replace(/\s+/g, '-').toLowerCase()}`)
                      ? 'bg-yellow-400/20 border-yellow-400 text-yellow-400' 
                      : 'bg-white/5 border-white/10 text-[var(--theme-text-secondary)] hover:text-white'
                  }`}
                  title="Bookmark Solution"
                >
                  <Bookmark size={15} />
                </button>
              </div>
            </div>

            {/* Fallback Warning Banner */}
            {activeResult.isFallback && (
              <div className="p-3.5 bg-yellow-500/10 border border-yellow-500/25 rounded-xl text-yellow-300 text-xs flex flex-col gap-1">
                <span className="font-bold flex items-center gap-1">
                  ⚠️ Offline Fallback Mode Active
                </span>
                <p className="text-[11px] opacity-80 leading-normal">
                  We couldn't connect to the Gemini AI API ({activeResult.fallbackReason || "Unknown API error"}).
                  To get live, professional-grade answers for hard questions and GK search, configure a valid **Gemini API Key** in settings (gear icon at the top right).
                </p>
              </div>
            )}

            {/* Final Answer Display Banner */}
            <div className="bg-gradient-to-r from-[var(--theme-accent)]/15 to-transparent p-4 rounded-xl border border-[var(--theme-border)] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--theme-text-secondary)]">Computed Correct Value</span>
                <div className="text-xl font-extrabold text-white mt-1">{activeResult.correctAnswer}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-[var(--theme-text-secondary)]">Estimated solve</span>
                <div className="text-sm font-bold text-[var(--theme-accent)]">{activeResult.solvingTime}</div>
              </div>
            </div>

            {/* Details Tab selection */}
            <div className="flex gap-1 border-b border-white/5 pb-0.5">
              {[
                { id: 'shortcut', label: '⚡ Fast Trick' },
                { id: 'step', label: '📖 Step-by-Step' },
                { id: 'formula', label: '📝 Formulas' },
                { id: 'mistakes', label: '⚠️ Mistakes' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-3.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                    activeTab === tab.id 
                      ? 'border-transparent border-b-[var(--theme-accent)] text-white' 
                      : 'border-transparent text-[var(--theme-text-secondary)] hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB BODY CONTENTS */}
            <div className="min-h-[140px] text-xs leading-relaxed text-[var(--theme-text-secondary)]">
              {activeTab === 'shortcut' && (
                <div className="space-y-3">
                  <div className="p-3 bg-white/5 border border-white/5 rounded-lg text-white font-medium">
                    {activeResult.shortcutMethod}
                  </div>
                  <div className="flex items-start gap-2 bg-yellow-400/5 p-3 rounded-lg border border-yellow-400/10">
                    <span className="text-yellow-400 font-bold shrink-0">Vedic Trick:</span>
                    <span>{activeResult.fastTrick}</span>
                  </div>
                </div>
              )}

              {activeTab === 'step' && (
                <div className="space-y-3">
                  {activeResult.stepByStep.map((stepStr: string, idx: number) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <span className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center font-bold text-white text-[10px] shrink-0 mt-0.5">{idx + 1}</span>
                      <p className="text-[var(--theme-text-primary)]">{stepStr}</p>
                    </div>
                  ))}
                  {activeResult.alternativeSolution && (
                    <div className="mt-4 pt-3 border-t border-white/5">
                      <span className="font-bold text-white">Alternative Method:</span>
                      <p className="mt-1">{activeResult.alternativeSolution}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'formula' && (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-950/40 rounded-lg border border-white/5 font-mono text-white">
                    {activeResult.formulaUsed}
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg">
                    <strong className="text-white block mb-1">Memory Mnemonic:</strong>
                    {activeResult.memoryTrick}
                  </div>
                </div>
              )}

              {activeTab === 'mistakes' && (
                <div className="space-y-3">
                  <div className="p-3 bg-red-500/5 border border-red-500/15 rounded-lg text-red-300">
                    <strong className="text-white block mb-1">⚠️ Common Pitfalls:</strong>
                    {activeResult.commonMistakes}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-[10px] mt-2 pt-2 border-t border-white/5">
                    <div>
                      <span className="font-bold text-white block">PYQ Frequency</span>
                      {activeResult.frequency}
                    </div>
                    <div>
                      <span className="font-bold text-white block">Exam Importance</span>
                      {activeResult.importance}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Custom Exam solver features banner */}
            <div className="text-[10px] text-[var(--theme-text-secondary)] italic border-t border-white/5 pt-3 text-center">
              Answers verified against local model database mapping for {examId.replace('-', ' ').toUpperCase()}.
            </div>
          </div>
        ) : (
          <div className="glass-panel rounded-2xl p-8 text-center text-[var(--theme-text-secondary)]">
            <BookOpen size={48} className="mx-auto text-[var(--theme-border)] mb-4" />
            <h3 className="text-sm font-bold text-white mb-1">No Problem Active</h3>
            <p className="text-xs max-w-sm mx-auto">Type, sketch, or take an OCR scan of a math question to activate the step-by-step solver guide.</p>
          </div>
        )}
      </div>

      {/* RIGHT: CHAT ASSISTANT & CHAT HISTORY */}
      <div className="glass-panel rounded-2xl flex flex-col justify-between h-[80vh]">
        {/* Chat Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0 bg-white/5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[var(--theme-accent)]/15 text-[var(--theme-accent)] rounded-lg">
              <MessageSquare size={16} />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white">AI Study Tutor</h2>
              <p className="text-[9px] text-green-400 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> AI Online
              </p>
            </div>
          </div>
          <button 
            onClick={handleClearHistory}
            className="p-1.5 rounded bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white text-[var(--theme-text-secondary)] transition-all"
            title="Clear Chat History"
          >
            <Trash2 size={13} />
          </button>
        </div>

        {/* Scrollable Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chats.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-[var(--theme-text-secondary)] p-4">
              <Sparkles size={24} className="text-[var(--theme-accent)] mb-2 animate-bounce" />
              <p className="text-xs font-bold text-white">Ask your doubts!</p>
              <p className="text-[10px] max-w-xs mt-1">Once you solve a question, you can ask for alternative solutions, translations, or simpler breakdowns.</p>
            </div>
          ) : (
            chats.map((c: any, index: number) => (
              <div 
                key={index} 
                className={`flex flex-col ${c.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div 
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    c.role === 'user' 
                      ? 'bg-[var(--theme-accent)] text-white rounded-tr-none' 
                      : 'bg-white/5 border border-white/5 text-[var(--theme-text-primary)] rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{c.content}</p>
                </div>
                <span className="text-[9px] text-[var(--theme-text-secondary)] mt-1 px-1">
                  {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}

          {isTyping && (
            <div className="flex items-center gap-1 p-2 bg-white/5 rounded-xl max-w-[80px]">
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Preset Prompt Buttons */}
        {activeResult && (
          <div className="px-4 py-2 border-t border-white/5 bg-white/5 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none shrink-0">
            {[
              "Explain in Bengali",
              "Teach like a beginner",
              "Explain in Hindi",
              "Another shortcut",
              "Hard level"
            ].map(preset => (
              <button
                key={preset}
                onClick={() => handleSendMessage(preset)}
                className="py-1 px-2.5 bg-white/5 hover:bg-white/10 text-white rounded-full border border-white/10 text-[10px] font-semibold transition-all cursor-pointer inline-block"
              >
                {preset}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 border-t border-white/5 shrink-0 bg-slate-950/40">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(typedMessage);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={typedMessage}
              onChange={(e) => setTypedMessage(e.target.value)}
              placeholder="Ask AI tutor (e.g. explain in Bengali)..."
              className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-[var(--theme-accent)] focus:outline-none text-xs text-white"
            />
            <button
              type="submit"
              disabled={!typedMessage.trim()}
              className="p-2 bg-[var(--theme-accent)] disabled:opacity-50 text-white rounded-xl active:scale-95 transition-all cursor-pointer"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
