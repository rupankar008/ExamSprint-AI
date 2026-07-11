'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from './AppContext';
import { getExamConfig } from '../lib/syllabus';
import { MockTestLog, addTestLog } from '../lib/localDb';
import { getAvailableYears, getQuestionsByExamAndYear, getRepeatedQuestions, PYQQuestion } from '../lib/pyqDatabase';
import { 
  Clock, Award, BarChart, BookOpen, Check, AlertTriangle, 
  RefreshCw, Play, ShieldAlert, ArrowRight, Activity, Brush, Trash2, Calendar
} from 'lucide-react';

export default function MockTests() {
  const { profile, awardXP, incrementStreak } = useApp();
  
  // Test State Machine
  const [testState, setTestState] = useState<'idle' | 'running' | 'completed'>('idle');
  const [questions, setQuestions] = useState<PYQQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  
  // Selection states
  const [testMode, setTestMode] = useState<'diagnostic' | 'pyp'>('pyp');
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  
  // Timer & Speed States
  const [timeLeft, setTimeLeft] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Scribble Draft pad states
  const scribbleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingToolActive, setDrawingToolActive] = useState(false);

  // Score stats
  const [testSummary, setTestSummary] = useState<MockTestLog | null>(null);

  const examId = profile?.targetExam || 'ssc-cgl';
  const examConfig = profile ? getExamConfig(examId) : { name: "Exam Prep", markingRule: { correct: 1, incorrect: -0.25 } };

  // Load available years for selected exam on render
  useEffect(() => {
    const years = getAvailableYears(examId);
    setAvailableYears(years);
    if (years.length > 0) {
      setSelectedYear(years[0]);
    }
  }, [examId]);

  // Setup Draft Scribble Canvas
  useEffect(() => {
    if (!drawingToolActive || testState !== 'running') return;
    const canvas = scribbleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.strokeStyle = '#eab308'; // Amber pencil
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
  }, [drawingToolActive, testState]);

  const startScribbleDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    scribbleDraw(e);
  };

  const stopScribbleDraw = () => {
    setIsDrawing(false);
    scribbleCanvasRef.current?.getContext('2d')?.beginPath();
  };

  const scribbleDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = scribbleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearScribble = () => {
    const canvas = scribbleCanvasRef.current;
    if (!canvas) return;
    canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Start Test trigger
  const handleStartTest = () => {
    let testQuestions: PYQQuestion[] = [];
    
    if (testMode === 'pyp') {
      testQuestions = getQuestionsByExamAndYear(examId, selectedYear);
    } else {
      // Diagnostic Mode loads repeated questions pool
      testQuestions = getRepeatedQuestions(examId);
    }

    // Fallback in case of empty questions
    if (testQuestions.length === 0) {
      testQuestions = [
        {
          id: 999,
          year: 2024,
          text: "A can do a piece of work in 12 days and B can do it in 24 days. How many days will they take together?",
          options: ["6 days", "8 days", "10 days", "12 days"],
          correctAnswer: "8 days",
          chapter: "Time & Work",
          explanation: "Combined days = (12 * 24) / (12 + 24) = 288 / 36 = 8 days.",
          isRepeated: true
        }
      ];
    }

    setQuestions(testQuestions);
    setAnswers({});
    setCurrentIdx(0);
    setTimeSpent(0);
    
    // Set 60 seconds per question
    const allocatedTime = testQuestions.length * 60;
    setTimeLeft(allocatedTime);
    setTestState('running');

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleFinishTest();
          return 0;
        }
        setTimeSpent(s => s + 1);
        return prev - 1;
      });
    }, 1000);
  };

  // Finish test evaluation
  const handleFinishTest = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTestState('completed');

    let correctCount = 0;
    let incorrectCount = 0;
    let attempted = 0;

    questions.forEach((q) => {
      const ans = answers[q.id];
      if (ans) {
        attempted++;
        if (ans === q.correctAnswer) {
          correctCount++;
        } else {
          incorrectCount++;
        }
      }
    });

    const rule = examConfig.markingRule;
    const rawScore = (correctCount * rule.correct) + (incorrectCount * rule.incorrect);
    const score = Math.max(0, parseFloat(rawScore.toFixed(2)));
    const accuracy = attempted > 0 ? Math.round((correctCount / attempted) * 100) : 0;
    const avgSpeed = timeSpent > 0 ? Math.round(timeSpent / questions.length) : 0;

    // AI Prediction of selection percentage based on accuracy and speed
    let selectProbability = 50;
    if (accuracy >= 80) selectProbability += 20;
    if (accuracy >= 90) selectProbability += 15;
    if (avgSpeed <= 30 && accuracy > 70) selectProbability += 15;
    selectProbability = Math.min(98, selectProbability);

    const log: MockTestLog = {
      id: Math.random().toString(36).substring(7),
      examId,
      examName: testMode === 'pyp' ? `${examConfig.name} (${selectedYear})` : `${examConfig.name} Diagnostic`,
      dateString: new Date().toLocaleDateString(),
      totalQuestions: questions.length,
      attempted,
      correct: correctCount,
      incorrect: incorrectCount,
      timeSpentSeconds: timeSpent,
      score,
      accuracy,
      speedSecPerQuest: avgSpeed,
      selectionProbability: selectProbability
    };

    await addTestLog(log);
    setTestSummary(log);
    
    // Award XP based on score
    const xpBonus = 50 + Math.round(score * 10);
    awardXP(xpBonus, 15);
    incrementStreak(); // secures daily streak
  };

  const handleSelectAnswer = (opt: string) => {
    const qId = questions[currentIdx].id;
    setAnswers({ ...answers, [qId]: opt });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-fade-in">
      
      {/* SCREEN 1: IDLE BOARD */}
      {testState === 'idle' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
              <Award size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gradient tracking-tight">Mock Test Workspace</h1>
              <p className="text-sm text-[var(--theme-text-secondary)]">Simulate exam stress, check solving speed pace, and inspect negative marks diagnostics.</p>
            </div>
          </div>

          {/* Test Selector tab */}
          <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-xl max-w-md">
            <button
              onClick={() => setTestMode('pyp')}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                testMode === 'pyp' ? 'bg-[var(--theme-accent)] text-white' : 'text-[var(--theme-text-secondary)] hover:text-white'
              }`}
            >
              📜 Previous Year Papers (PYP)
            </button>
            <button
              onClick={() => setTestMode('diagnostic')}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                testMode === 'diagnostic' ? 'bg-[var(--theme-accent)] text-white' : 'text-[var(--theme-text-secondary)] hover:text-white'
              }`}
            >
              🔥 Repeated Chapter Diagnostic
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Quick Launcher */}
            <div className="md:col-span-2 glass-panel p-6 rounded-2xl flex flex-col justify-between border-l-2 border-amber-500">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 w-max flex items-center gap-1">
                  <Calendar size={10} /> {testMode === 'pyp' ? 'Real Question Paper' : 'Master assessment'}
                </span>
                
                <h2 className="text-xl font-bold text-white mt-3">
                  {testMode === 'pyp' 
                    ? `${examConfig.name} PYQ Paper` 
                    : `${examConfig.name} High Frequency Repeated Qs`}
                </h2>

                <p className="text-xs text-[var(--theme-text-secondary)] mt-1.5 leading-relaxed">
                  {testMode === 'pyp' 
                    ? `Take the official previous year question sets configured for your exam targets. Questions are sourced from standard national databases.`
                    : `Focuses on highly repeated patterns, Vedic shortcut checks, and time-bound approximations.`}
                </p>

                {/* Year Select dropdown if PYP mode */}
                {testMode === 'pyp' && (
                  <div className="mt-4 space-y-2">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--theme-text-secondary)]">Select Exam Paper Year</label>
                    {availableYears.length > 0 ? (
                      <div className="flex gap-2">
                        {availableYears.map(yr => (
                          <button
                            key={yr}
                            onClick={() => setSelectedYear(yr)}
                            className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all ${
                              selectedYear === yr 
                                ? 'bg-white/10 border-[var(--theme-accent)] text-[var(--theme-accent)]' 
                                : 'bg-white/5 border-white/10 text-white hover:border-white/20'
                            }`}
                          >
                            Year {yr}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs italic text-[var(--theme-text-secondary)]">No historical papers loaded for this category yet. Launching mock standards.</span>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mt-6 text-xs border-t border-white/5 pt-4">
                  <div>
                    <span className="text-[var(--theme-text-secondary)] block">Timer Limit</span>
                    <strong className="text-white">60 Seconds / Question</strong>
                  </div>
                  <div>
                    <span className="text-[var(--theme-text-secondary)] block">Active marking rules</span>
                    <strong className="text-red-400">+{examConfig.markingRule.correct} / {examConfig.markingRule.incorrect} Neg</strong>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleStartTest}
                className="mt-8 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-xl text-slate-950 font-extrabold hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-lg w-full"
              >
                Launch Exam Environment <Play size={16} />
              </button>
            </div>

            {/* Simulated target checklist */}
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--theme-text-secondary)] flex items-center gap-1.5">
                <Activity size={14} className="text-green-400" /> Exam Rules Engine
              </h3>
              <div className="space-y-3 text-xs leading-relaxed text-[var(--theme-text-secondary)]">
                <div className="flex gap-2">
                  <Check size={16} className="text-green-400 shrink-0" />
                  <span><strong>Negative Marking:</strong> Deducts fractional marks according to standard guidelines.</span>
                </div>
                <div className="flex gap-2">
                  <Check size={16} className="text-green-400 shrink-0" />
                  <span><strong>Draft Pad:</strong> Use pencil tools to draft and write calculations without paper sheets.</span>
                </div>
                <div className="flex gap-2">
                  <Check size={16} className="text-green-400 shrink-0" />
                  <span><strong>Securing Streak:</strong> Secures your calendar XP target upon submittal.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 2: RUNNING TEST WORKSPACE */}
      {testState === 'running' && questions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Question Workspace Panel */}
          <div className="lg:col-span-2 glass-panel p-5 sm:p-6 rounded-2xl space-y-5">
            
            {/* Top HUD */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="text-xs text-[var(--theme-text-secondary)] font-semibold">
                Question {currentIdx + 1} of {questions.length}
              </div>
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg text-red-400 text-xs font-bold">
                <Clock size={14} className="animate-spin" />
                <span>
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Question Text */}
            <div className="text-sm font-semibold text-white leading-relaxed p-4 bg-white/5 border border-white/5 rounded-xl">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block mb-1">
                {questions[currentIdx].chapter} Section
              </span>
              {questions[currentIdx].text}
            </div>

            {/* Options selecting list */}
            <div className="space-y-2">
              {questions[currentIdx].options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleSelectAnswer(opt)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer ${
                    answers[questions[currentIdx].id] === opt 
                      ? 'bg-[var(--theme-accent)]/20 border-[var(--theme-accent)] text-white font-bold' 
                      : 'bg-white/5 border-white/5 text-[var(--theme-text-secondary)] hover:border-white/20 hover:text-white'
                  }`}
                >
                  <span>{opt}</span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    answers[questions[currentIdx].id] === opt ? 'border-[var(--theme-accent)] bg-[var(--theme-accent)]' : 'border-white/10'
                  }`}>
                    {answers[questions[currentIdx].id] === opt && <Check size={10} className="text-white" />}
                  </div>
                </button>
              ))}
            </div>

            {/* Nav button row */}
            <div className="flex justify-between items-center pt-4 border-t border-white/5">
              <button
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx(c => c - 1)}
                className="py-2 px-4 border border-white/10 rounded-xl text-xs font-semibold hover:bg-white/5 disabled:opacity-30 transition-all cursor-pointer"
              >
                Previous
              </button>

              {currentIdx < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIdx(c => c + 1)}
                  className="flex items-center gap-1.5 py-2 px-5 bg-[var(--theme-accent)] text-white rounded-xl text-xs font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                >
                  Next Question <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  onClick={handleFinishTest}
                  className="py-2.5 px-6 bg-red-600 text-white font-extrabold rounded-xl text-xs hover:bg-red-700 active:scale-95 transition-all cursor-pointer shadow-lg shadow-red-900/20"
                >
                  Submit Assessment
                </button>
              )}
            </div>
          </div>

          {/* RIGHT SIDEBAR: SCRATCH SCRIBBLE PAD */}
          <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--theme-text-secondary)] flex items-center gap-2">
                  <Brush size={14} className="text-yellow-400" /> Draft Scratchpad
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDrawingToolActive(!drawingToolActive)}
                    className={`p-1.5 border rounded-lg text-xs font-semibold transition-all ${
                      drawingToolActive 
                        ? 'bg-yellow-400/20 border-yellow-400 text-yellow-400' 
                        : 'bg-white/5 border-white/10 text-[var(--theme-text-secondary)] hover:text-white'
                    }`}
                  >
                    {drawingToolActive ? 'Pencil ON' : 'Pencil OFF'}
                  </button>
                  <button
                    onClick={clearScribble}
                    className="p-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-[var(--theme-text-secondary)] hover:text-white rounded-lg transition-all"
                    title="Clear Scratchpad"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Scribble canvas element */}
              <div className="relative border border-white/10 bg-slate-950/80 rounded-xl h-[260px] overflow-hidden">
                <canvas
                  ref={scribbleCanvasRef}
                  width={300}
                  height={260}
                  onMouseDown={startScribbleDraw}
                  onMouseUp={stopScribbleDraw}
                  onMouseLeave={stopScribbleDraw}
                  onMouseMove={scribbleDraw}
                  onTouchStart={startScribbleDraw}
                  onTouchEnd={stopScribbleDraw}
                  onTouchMove={scribbleDraw}
                  className={`w-full h-full ${drawingToolActive ? 'cursor-crosshair' : 'cursor-default pointer-events-none'}`}
                />
                {!drawingToolActive && (
                  <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center text-center p-4 pointer-events-none">
                    <p className="text-[10px] text-yellow-400 font-semibold">Click &quot;Pencil ON&quot; to scratch equations</p>
                  </div>
                )}
              </div>
            </div>

            <div className="text-[9px] text-[var(--theme-text-secondary)] leading-tight mt-4 italic text-center">
              Pencil tools are fully browser native and perform calculations client side.
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 3: COMPLETED RESULTS VIEW */}
      {testState === 'completed' && testSummary && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border-t-4 border-green-500 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full flex items-center justify-center text-3xl font-bold">
              🎉
            </div>
            <div>
              <h2 className="text-xl font-bold text-gradient">Assessment Completed Successfully!</h2>
              <p className="text-xs text-[var(--theme-text-secondary)] mt-1">Diagnostic results processed by ExamSprint AI analyzer model.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-2xl mt-6">
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <span className="text-[9px] uppercase tracking-wider text-[var(--theme-text-secondary)]">Accuracy</span>
                <div className="text-2xl font-black text-white mt-1">{testSummary.accuracy}%</div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <span className="text-[9px] uppercase tracking-wider text-[var(--theme-text-secondary)]">Score (Negative Applied)</span>
                <div className="text-2xl font-black text-[var(--theme-accent)] mt-1">{testSummary.score}</div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <span className="text-[9px] uppercase tracking-wider text-[var(--theme-text-secondary)]">Avg. Speed</span>
                <div className="text-2xl font-black text-white mt-1">{testSummary.speedSecPerQuest}s / Q</div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                <span className="text-[9px] uppercase tracking-wider text-[var(--theme-text-secondary)] font-semibold flex items-center gap-1 justify-center">
                  <Activity size={10} className="text-green-400" /> Cut-off Clearance
                </span>
                <div className="text-xl font-black text-green-400 mt-1">{testSummary.selectionProbability}% Chance</div>
              </div>
            </div>
          </div>

          {/* Section: Diagnostic Answer Key with Shortcuts */}
          <div className="glass-panel p-5 sm:p-6 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--theme-text-secondary)]">Diagnostic Answer Key & Vedic Tricks</h3>
            
            <div className="space-y-4">
              {questions.map((q, idx) => {
                const isCorrect = answers[q.id] === q.correctAnswer;
                return (
                  <div key={q.id} className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-2">
                    <div className="flex items-start justify-between gap-4 text-xs font-semibold text-white">
                      <span>{idx + 1}. {q.text}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-[11px] text-[var(--theme-text-secondary)] mt-2 pt-2 border-t border-white/5">
                      <div>
                        Your Answer: <strong className="text-white">{answers[q.id] || "Skipped"}</strong>
                      </div>
                      <div>
                        Correct Answer: <strong className="text-green-400">{q.correctAnswer}</strong>
                      </div>
                    </div>

                    <div className="p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-lg text-[11px] text-yellow-300">
                      <strong>Vedic Speed Trick:</strong> {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setTestState('idle')}
              className="w-full mt-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Exit Workspace
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
