'use client';

import React, { useState, useEffect } from 'react';
import { getBookmarks, removeBookmark, BookmarkItem } from '../lib/localDb';
import { 
  BookOpen, Bookmark, Download, Printer, Compass, 
  HelpCircle, Trash2, Tag, ChevronRight, Award, Key, Table
} from 'lucide-react';
import { SYLLABUS_CHAPTERS, EXAM_SYLLABUS_PDFS } from '../lib/syllabus';

const VEDIC_TRICKS = [
  { title: "🔢 Square of number ending in 5", formula: "(10x + 5)² = 100x(x + 1) + 25", example: "75² = 7 × 8 | 25 = 5625" },
  { title: "⚡ Multiplication by 11", formula: "Write unit digit, add consecutive digits, write first digit.", example: "243 × 11 = 2 | (2+4) | (4+3) | 3 = 2673" },
  { title: "⏰ Cross Multiplication (2-Digit)", formula: "Multiply vertically, cross-multiply & add, multiply vertically.", example: "23 × 12 = (2×1) | (2×2 + 3×1) | (3×2) = 2 | 7 | 6 = 276" }
];

interface StudyCenterProps {
  initialTab?: 'formulas' | 'vedic' | 'tables' | 'bookmarks' | 'syllabus' | 'creator';
}

export default function StudyCenter({ initialTab = 'formulas' }: StudyCenterProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [selectedGuideIdx, setSelectedGuideIdx] = useState(0);
  const [selectedTrendYear, setSelectedTrendYear] = useState<number>(2025);

  useEffect(() => {
    async function loadBookmarks() {
      const items = await getBookmarks();
      setBookmarks(items);
    }
    if (activeTab === 'bookmarks') {
      loadBookmarks();
    }
  }, [activeTab]);

  const handleDeleteBookmark = async (id: string) => {
    await removeBookmark(id);
    setBookmarks(prev => prev.filter(b => b.id !== id));
  };

  const handleExportText = (item: any) => {
    const blob = new Blob([`${item.title || item.chapter}\n\n${item.content || item.shortcut}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.title || 'formula'}-revision.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Browser print-to-PDF utility
  const handlePrintPDF = () => {
    window.print();
  };

  // Web sharing API helper
  const handleSharePDF = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'ExamSprint AI - Formula Book',
          text: 'Check out the complete mathematical formulas and Vedic math shortcuts for Indian Competitive Exams!',
          url: window.location.href
        });
      } catch (e) {
        console.warn(e);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("📋 Link copied to clipboard! Share it with your friends.");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-fade-in printable-area">
      
      {/* Top Banner Header */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gradient tracking-tight">Study Center</h1>
            <p className="text-sm text-[var(--theme-text-secondary)]">Printable PDF formula books, Vedic calculation aids, and bookmarks.</p>
          </div>
        </div>

        <div className="flex gap-2">
          {/* Share PDF Trigger */}
          <button
            onClick={handleSharePDF}
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-white rounded-xl transition-all cursor-pointer"
          >
            Share Formulas
          </button>
          
          {/* Print PDF Trigger */}
          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 active:scale-95 text-xs font-bold text-white rounded-xl transition-all cursor-pointer shadow-lg shadow-teal-900/20"
          >
            <Printer size={14} /> Download Print-Ready PDF
          </button>
        </div>
      </div>

      {/* Tab selection header (hidden during printing) */}
      <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-xl print:hidden overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('formulas')}
          className={`flex-1 py-2.5 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'formulas' ? 'bg-[var(--theme-accent)] text-white shadow-md' : 'text-[var(--theme-text-secondary)] hover:text-white'
          }`}
        >
          📝 Formulas Book
        </button>
        <button
          onClick={() => setActiveTab('vedic')}
          className={`flex-1 py-2.5 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'vedic' ? 'bg-[var(--theme-accent)] text-white shadow-md' : 'text-[var(--theme-text-secondary)] hover:text-white'
          }`}
        >
          ⚡ Vedic Tricks
        </button>
        <button
          onClick={() => setActiveTab('tables')}
          className={`flex-1 py-2.5 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'tables' ? 'bg-[var(--theme-accent)] text-white shadow-md' : 'text-[var(--theme-text-secondary)] hover:text-white'
          }`}
        >
          📊 Math Tables (1-100)
        </button>
        <button
          onClick={() => setActiveTab('syllabus')}
          className={`flex-1 py-2.5 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'syllabus' ? 'bg-[var(--theme-accent)] text-white shadow-md' : 'text-[var(--theme-text-secondary)] hover:text-white'
          }`}
        >
          📚 Syllabus & Trends (2010-2025)
        </button>
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`flex-1 py-2.5 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'bookmarks' ? 'bg-[var(--theme-accent)] text-white shadow-md' : 'text-[var(--theme-text-secondary)] hover:text-white'
          }`}
        >
          ⭐ Bookmarks ({bookmarks.length})
        </button>
        <button
          onClick={() => setActiveTab('creator')}
          className={`flex-1 py-2.5 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'creator' ? 'bg-[var(--theme-accent)] text-white shadow-md' : 'text-[var(--theme-text-secondary)] hover:text-white'
          }`}
        >
          💻 Creator Profile
        </button>
      </div>

      {/* PRINT-ONLY HEADER */}
      <div className="hidden print:block text-center border-b border-slate-700 pb-4 mb-6">
        <h1 className="text-3xl font-black text-slate-900 font-sans">ExamSprint AI Formula Book</h1>
        <p className="text-xs text-slate-600 uppercase tracking-wider mt-1">Multiplication Tables (1-30), Squares & Cubes (1-100), and Competitive Exam Mathematics Formulas</p>
      </div>

      {/* TAB 1: CORE FORMULAS */}
      {(activeTab === 'formulas' || typeof window !== 'undefined' && window.matchMedia('print').matches) && (
        <div className="space-y-6">
          <div className="hidden print:block text-slate-900 font-bold text-sm mb-2">Section 1: Core Mathematical Formulas</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SYLLABUS_CHAPTERS.map((chapter) => (
              <div key={chapter.id} className="glass-panel p-5 rounded-2xl flex flex-col justify-between border border-white/5 hover:border-[var(--theme-accent)] transition-all print:bg-white print:border-slate-300 print:text-black">
                <div>
                  <div className="flex justify-between items-center mb-2 print:hidden">
                    <span className="text-[10px] uppercase font-bold text-[var(--theme-accent)] tracking-wider">
                      {chapter.importance} Priority • PYQ: {chapter.pyqFrequencyPercent}%
                    </span>
                    <button
                      onClick={() => handleExportText({ title: chapter.name, content: chapter.shortcutFormula })}
                      className="p-1 text-[var(--theme-text-secondary)] hover:text-white transition-all"
                      title="Export Card"
                    >
                      <Download size={13} />
                    </button>
                  </div>
                  <h3 className="text-base font-bold text-white print:text-slate-900 mb-2">{chapter.name}</h3>
                  
                  {/* Formulas notes box */}
                  <div className="p-3 bg-white/5 border border-white/5 print:bg-slate-100 print:border-slate-300 rounded-lg text-[11px] font-mono text-[var(--theme-text-primary)] print:text-black mb-4">
                    {chapter.shortcutFormula}
                  </div>

                  <div className="flex flex-wrap gap-1.5 print:hidden">
                    {chapter.subtopics.map(sub => (
                      <span key={sub} className="text-[9px] bg-white/5 text-[var(--theme-text-secondary)] px-2 py-0.5 rounded-full border border-white/5">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: VEDIC MATHS TRICKS */}
      {activeTab === 'vedic' && (
        <div className="space-y-4">
          {VEDIC_TRICKS.map((trick) => (
            <div key={trick.title} className="glass-panel p-5 rounded-2xl border-l-2 border-[var(--theme-accent)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Key size={14} className="text-yellow-400" /> {trick.title}
                </h3>
                <p className="text-xs text-[var(--theme-text-secondary)] font-mono bg-white/5 p-2 rounded-lg border border-white/5 inline-block">
                  Formula: {trick.formula}
                </p>
                <div className="text-[10px] text-yellow-300 font-semibold mt-1">Example: {trick.example}</div>
              </div>
              <button
                onClick={() => handleExportText({ title: trick.title, content: `Formula: ${trick.formula}\nExample: ${trick.example}` })}
                className="flex items-center gap-1 px-4 py-2 border border-white/10 hover:bg-white/5 text-xs font-semibold text-white rounded-xl transition-all cursor-pointer shadow-sm w-max self-end sm:self-center"
              >
                Export Trick <Download size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: MATHEMATICS TABLES GENERATOR (1-100 SQUARES / 1-30 TABLES) */}
      {(activeTab === 'tables' || typeof window !== 'undefined' && window.matchMedia('print').matches) && (
        <div className="space-y-8">
          {/* Section 1: Multiplication Tables 1 to 30 */}
          <div className="glass-panel p-5 sm:p-6 rounded-2xl print:bg-white print:border-slate-300 print:text-black">
            <h3 className="text-sm font-bold text-white print:text-slate-900 mb-4 flex items-center gap-2">
              <Table size={15} /> Multiplication Tables (1 to 30)
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 max-h-[300px] overflow-y-auto pr-1 print:max-h-none print:grid-cols-3 print:gap-6">
              {Array.from({ length: 30 }, (_, index) => {
                const n = index + 1;
                return (
                  <div key={n} className="bg-white/5 border border-white/5 print:bg-slate-100 print:border-slate-300 rounded-lg p-2.5 text-center text-xs">
                    <strong className="text-white print:text-slate-900 block border-b border-white/10 pb-1 mb-1">Table of {n}</strong>
                    <div className="space-y-0.5 text-[10px] text-[var(--theme-text-secondary)] print:text-slate-700 font-mono">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(multiplier => (
                        <div key={multiplier}>
                          {n} × {multiplier} = {n * multiplier}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Squares & Cubes (1 to 100) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Squares 1 to 100 */}
            <div className="glass-panel p-5 rounded-2xl print:bg-white print:border-slate-300 print:text-black">
              <h4 className="text-xs font-bold text-white print:text-slate-900 mb-3 border-b border-white/5 pb-2">Squares & Square Roots (1 to 100)</h4>
              <div className="max-h-[300px] overflow-y-auto pr-1 print:max-h-none">
                <table className="w-full text-left text-[10px] font-mono text-[var(--theme-text-secondary)] print:text-slate-800">
                  <thead>
                    <tr className="border-b border-white/10 text-white print:text-slate-900">
                      <th className="py-1">N</th>
                      <th className="py-1">Square (N²)</th>
                      <th className="py-1">Square Root (√N)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 100 }, (_, i) => i + 1).map(n => (
                      <tr key={n} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-1 font-bold text-white print:text-slate-900">{n}</td>
                        <td className="py-1">{n * n}</td>
                        <td className="py-1">{Math.sqrt(n).toFixed(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cubes 1 to 100 */}
            <div className="glass-panel p-5 rounded-2xl print:bg-white print:border-slate-300 print:text-black">
              <h4 className="text-xs font-bold text-white print:text-slate-900 mb-3 border-b border-white/5 pb-2">Cubes & Cube Roots (1 to 100)</h4>
              <div className="max-h-[300px] overflow-y-auto pr-1 print:max-h-none">
                <table className="w-full text-left text-[10px] font-mono text-[var(--theme-text-secondary)] print:text-slate-800">
                  <thead>
                    <tr className="border-b border-white/10 text-white print:text-slate-900">
                      <th className="py-1">N</th>
                      <th className="py-1">Cube (N³)</th>
                      <th className="py-1">Cube Root (³√N)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 100 }, (_, i) => i + 1).map(n => (
                      <tr key={n} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-1 font-bold text-white print:text-slate-900">{n}</td>
                        <td className="py-1">{n * n * n}</td>
                        <td className="py-1">{Math.cbrt(n).toFixed(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 4: BOOKMARKS VAULT */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-4">
          {bookmarks.length === 0 ? (
            <div className="glass-panel p-10 text-center text-[var(--theme-text-secondary)] rounded-2xl text-xs">
              <Bookmark size={48} className="mx-auto text-[var(--theme-border)] mb-3" />
              <h3 className="text-sm font-bold text-white mb-1">No Saved Items</h3>
              <p className="max-w-xs mx-auto">Click the bookmark icon on solver results pages to save formulas and step solutions.</p>
            </div>
          ) : (
            bookmarks.map((bm) => (
              <div key={bm.id} className="glass-panel p-5 rounded-2xl space-y-3 relative hover:border-yellow-400/30 transition-all border-l-2 border-yellow-400">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full border border-yellow-400/20">
                      {bm.chapter || 'Core Module'}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-2">{bm.title}</h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleExportText({ title: bm.title, content: bm.content })}
                      className="p-1.5 bg-white/5 border border-white/10 rounded-lg hover:text-white text-[var(--theme-text-secondary)] transition-all"
                      title="Download Card"
                    >
                      <Download size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteBookmark(bm.id)}
                      className="p-1.5 bg-white/5 border border-white/10 rounded-lg hover:text-red-400 text-[var(--theme-text-secondary)] transition-all"
                      title="Delete Bookmark"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                
                <p className="text-xs text-[var(--theme-text-secondary)] whitespace-pre-line bg-white/5 p-3 rounded-lg border border-white/5 font-mono">
                  {bm.content}
                </p>
                
                <div className="text-[9px] text-[var(--theme-text-secondary)] text-right">
                  Saved on {new Date(bm.timestamp).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 5: SYLLABUS & PYQ NOTES READER */}
      {activeTab === 'syllabus' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Guide Selector Column */}
            <div className="md:col-span-1 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--theme-text-secondary)]">Target Guides</span>
              <div className="flex flex-col gap-1.5">
                {EXAM_SYLLABUS_PDFS.map((guide, idx) => (
                  <button
                    key={guide.examId}
                    onClick={() => {
                      setSelectedGuideIdx(idx);
                      if (guide.trends2010_2025.length > 0) {
                        setSelectedTrendYear(guide.trends2010_2025[0].year);
                      }
                    }}
                    className={`text-left p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      selectedGuideIdx === idx
                        ? 'bg-[var(--theme-accent)] border-[var(--theme-accent)] text-white shadow-md'
                        : 'bg-white/5 border-white/5 text-[var(--theme-text-secondary)] hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {guide.examName.split('(')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Document Content Workspace */}
            <div className="md:col-span-3 glass-panel p-6 rounded-2xl space-y-6">
              
              {/* Document Header Info */}
              <div className="flex justify-between items-start border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white">
                    {EXAM_SYLLABUS_PDFS[selectedGuideIdx].examName}
                  </h3>
                  <p className="text-[11px] text-[var(--theme-text-secondary)]">Official Syllabus & Past Papers Analysis (2010-2025)</p>
                </div>
                <div className="flex gap-2 print:hidden">
                  <button
                    onClick={() => {
                      const guide = EXAM_SYLLABUS_PDFS[selectedGuideIdx];
                      let bodyText = `EXAM SYLLABUS & PAST PAPER NOTES: ${guide.examName}\n\n`;
                      guide.currentYearSyllabus.forEach(s => {
                        bodyText += `${s.sectionName}\nSubtopics: ${s.subtopics.join(', ')}\nNotes: ${s.importantNotes}\n\n`;
                      });
                      bodyText += `2010-2025 TREND ANALYSIS:\n`;
                      guide.trends2010_2025.forEach(t => {
                        bodyText += `Year ${t.year} - Weightage: ${t.mathWeightage}\nNotes:\n- ${t.pointByPointNotes.join('\n- ')}\n\n`;
                      });
                      handleExportText({ title: `${guide.examId}-syllabus-guide`, content: bodyText });
                    }}
                    className="p-1.5 bg-white/5 border border-white/10 rounded-lg hover:text-white text-[var(--theme-text-secondary)] transition-all cursor-pointer"
                    title="Export Revision Document"
                  >
                    <Download size={13} />
                  </button>
                </div>
              </div>

              {/* Sub-Section 1: Current Syllabus */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-yellow-400">📋 Current Year Syllabus Structure</h4>
                <div className="space-y-3">
                  {EXAM_SYLLABUS_PDFS[selectedGuideIdx].currentYearSyllabus.map((s, sidx) => (
                    <div key={sidx} className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-2">
                      <strong className="text-xs text-white block">{s.sectionName}</strong>
                      <div className="flex flex-wrap gap-1.5">
                        {s.subtopics.map(topic => (
                          <span key={topic} className="text-[9px] bg-[var(--theme-accent)]/10 text-[var(--theme-accent)] border border-[var(--theme-accent)]/10 px-2 py-0.5 rounded-full">
                            {topic}
                          </span>
                        ))}
                      </div>
                      <p className="text-[10px] text-[var(--theme-text-secondary)] leading-relaxed italic border-t border-white/5 pt-1.5 mt-1.5">
                        💡 Key Focus: {s.importantNotes}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sub-Section 2: Point-by-point PYQ Trends (2010-2025) */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">📅 Historical Trend Analysis (2010-2025)</h4>
                  
                  {/* Year Selectors */}
                  <div className="flex flex-wrap gap-1">
                    {EXAM_SYLLABUS_PDFS[selectedGuideIdx].trends2010_2025.map((trend) => (
                      <button
                        key={trend.year}
                        onClick={() => setSelectedTrendYear(trend.year)}
                        className={`px-2.5 py-1 border rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          selectedTrendYear === trend.year
                            ? 'bg-white/10 border-white/20 text-white'
                            : 'bg-white/5 border-white/5 text-[var(--theme-text-secondary)] hover:text-white'
                        }`}
                      >
                        {trend.year}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Displaying details for the selected trend year */}
                {(() => {
                  const activeTrend = EXAM_SYLLABUS_PDFS[selectedGuideIdx].trends2010_2025.find(t => t.year === selectedTrendYear);
                  if (!activeTrend) return <p className="text-xs text-[var(--theme-text-secondary)] italic">No historical trend data for this year.</p>;
                  return (
                    <div className="space-y-3 bg-white/5 border border-white/5 rounded-xl p-4.5">
                      <div className="grid grid-cols-2 gap-4 text-xs pb-3 border-b border-white/5">
                        <div>
                          <span className="text-[10px] text-[var(--theme-text-secondary)] block">Quant/Math Weightage</span>
                          <strong className="text-white">{activeTrend.mathWeightage}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-[var(--theme-text-secondary)] block">Tough Patterns Analysis</span>
                          <strong className="text-red-400">{activeTrend.toughPatternsAnalysis}</strong>
                        </div>
                      </div>

                      {/* Point-by-point notes checklist */}
                      <div className="space-y-2 pt-1">
                        <span className="text-[10px] font-semibold text-[var(--theme-text-secondary)] uppercase block">Point-by-point PYQ Lessons:</span>
                        <div className="space-y-2.5">
                          {activeTrend.pointByPointNotes.map((note, nidx) => (
                            <div key={nidx} className="flex gap-2.5 items-start text-[11px] leading-relaxed text-[var(--theme-text-primary)]">
                              <span className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-black shrink-0">
                                {nidx + 1}
                              </span>
                              <span>{note}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

            </div>
          </div>
        </div>
      )}
      {activeTab === 'creator' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl text-left space-y-6 animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-white/5">
            <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg border border-white/10 shrink-0 bg-slate-800">
              <img src="/creator_pic.jpg" alt="Rupankar Bhuiya" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  Creative Technologist
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  Cryptographer
                </span>
              </div>
              <h2 className="text-2xl font-black text-gradient mt-2">Rupankar Bhuiya</h2>
              <p className="text-xs text-[var(--theme-text-secondary)] mt-1">Burdwan, West Bengal • Creator of ExamSprint AI</p>
            </div>
          </div>

          <div className="space-y-4 text-xs leading-relaxed text-[var(--theme-text-primary)]">
            <p>
              Hi there! I am **Rupankar Bhuiya**, a creative developer, technologist, and cryptography enthusiast. I design and build advanced web applications that bridge high-end visuals, interactive design, and artificial intelligence helper agents.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-1">
                <span className="font-bold text-white block">🌐 Official Portfolio</span>
                <a href="http://www.rupankar.space" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-semibold block break-all">
                  www.rupankar.space
                </a>
              </div>

              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-1">
                <span className="font-bold text-white block">🛠️ Tech Stack & Focus</span>
                <span className="text-[10px] text-[var(--theme-text-secondary)] block">
                  Next.js, React Native, OpenAI/Gemini APIs, Three.js (WebGL), GSAP, and Modern Design Systems.
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">Projects Showcase</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { title: "AI Nexus", desc: "A high-performance AI analytics dashboard built with Next.js 14 and OpenAI APIs." },
                  { title: "Quantum Web", desc: "Immersive WebGL-powered 3D storytelling site created using Three.js & shader models." },
                  { title: "Vivid Mobile", desc: "Cross-platform mobile e-commerce platform prioritizing fluid gesture controls." },
                  { title: "Ether Design", desc: "Minimalist, highly extensible UI design token and design system utility." }
                ].map((proj) => (
                  <div key={proj.title} className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <strong className="text-white text-xs block">{proj.title}</strong>
                    <span className="text-[10px] text-[var(--theme-text-secondary)] block mt-0.5 leading-normal">{proj.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
