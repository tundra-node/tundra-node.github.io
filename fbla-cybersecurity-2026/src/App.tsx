import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, 
  BookOpen, 
  Clock,
  ChevronRight, 
  ChevronLeft, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Menu,
  X,
  LayoutDashboard,
  FileText,
  Zap,
  BarChart3,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { STUDY_DATA, CATEGORIES, Question } from './data';
import { cn } from './lib/utils';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

// --- Types ---

type AppMode = 'home' | 'flashcards' | 'quiz' | 'progress' | 'cheat-sheet';
type QuizType = 'full' | 'drill';

interface QuizState {
  questions: Question[];
  currentIndex: number;
  answers: (number | null)[];
  isFinished: boolean;
  startTime: number;
  timeRemaining: number;
}

interface ProgressData {
  [category: string]: {
    total: number;
    correct: number;
  };
}

// --- Components ---

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date('2026-04-12T08:00:00');
    const interval = setInterval(() => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      
      if (diff <= 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: 'Days', value: timeLeft.days },
        { label: 'Hours', value: timeLeft.hours },
        { label: 'Minutes', value: timeLeft.minutes },
        { label: 'Seconds', value: timeLeft.seconds },
      ].map((item) => (
        <Card key={item.label} className="p-4 text-center border-blue-500/10 bg-slate-900/50 backdrop-blur-sm">
          <div className="text-3xl font-mono font-bold text-blue-400">{item.value.toString().padStart(2, '0')}</div>
          <div className="text-[10px] uppercase tracking-widest text-slate-500 mt-1">{item.label}</div>
        </Card>
      ))}
    </div>
  );
};

const Card = ({ children, className, id, onClick }: React.PropsWithChildren<{ className?: string; id?: string; onClick?: () => void }>) => (
  <div id={id} onClick={onClick} className={cn("bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-xl", className)}>
    {children}
  </div>
);

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className,
  disabled,
  id,
  size = 'md'
}: React.PropsWithChildren<{ 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  className?: string;
  disabled?: boolean;
  id?: string;
  size?: 'sm' | 'md' | 'lg';
}>) => {
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-100",
    outline: "border border-slate-700 hover:bg-slate-800 text-slate-300",
    ghost: "hover:bg-slate-800 text-slate-400 hover:text-slate-100",
    danger: "bg-red-600 hover:bg-red-500 text-white",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button 
      id={id}
      onClick={onClick} 
      disabled={disabled}
      className={cn(
        "rounded-md font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </button>
  );
};

const Progress = ({ value, max = 100, className, id }: { value: number; max?: number; className?: string; id?: string }) => (
  <div id={id} className={cn("w-full bg-slate-800 rounded-full h-2 overflow-hidden", className)}>
    <div 
      className="bg-blue-500 h-full transition-all duration-500 ease-out" 
      style={{ width: `${(value / max) * 100}%` }}
    />
  </div>
);

const Badge = ({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) => (
  <span id={id} className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700", className)}>
    {children}
  </span>
);

// --- Main App ---

export default function App() {
  const [mode, setMode] = useState<AppMode>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [progress, setProgress] = useState<ProgressData>(() => {
    const saved = localStorage.getItem('fbla_cyber_progress');
    if (saved) return JSON.parse(saved);
    const initial: ProgressData = {};
    Object.values(CATEGORIES).forEach(cat => {
      initial[cat] = { total: 0, correct: 0 };
    });
    return initial;
  });

  useEffect(() => {
    localStorage.setItem('fbla_cyber_progress', JSON.stringify(progress));
  }, [progress]);

  // --- Sub-Views ---

  const HomeView = () => (
    <div className="space-y-8 max-w-4xl mx-auto py-8 px-4">
      <header className="text-center space-y-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center justify-center p-3 bg-blue-600/10 rounded-2xl border border-blue-500/20 mb-4"
        >
          <Shield className="w-12 h-12 text-blue-500" />
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-100">
          FBLA Cybersecurity <span className="text-blue-500">SLC 2026</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Master the objectives for the Pennsylvania State Leadership Conference. 100 questions. 50 minutes. Zero room for error.
        </p>
      </header>

      <CountdownTimer />

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4 hover:border-blue-500/30 transition-colors cursor-pointer group" onClick={() => setMode('quiz')}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600/20 rounded-lg group-hover:bg-blue-600/30 transition-colors">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-100">Quiz Mode</h3>
              <p className="text-sm text-slate-400">Full mock exams or targeted drills.</p>
            </div>
          </div>
          <Button className="w-full">Start Practice</Button>
        </Card>

        <Card className="p-6 space-y-4 hover:border-slate-700 transition-colors cursor-pointer group" onClick={() => setMode('flashcards')}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-800 rounded-lg group-hover:bg-slate-700 transition-colors">
              <BookOpen className="w-6 h-6 text-slate-300" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-100">Flashcards</h3>
              <p className="text-sm text-slate-400">Quick recall of key terms and concepts.</p>
            </div>
          </div>
          <Button variant="secondary" className="w-full">Open Deck</Button>
        </Card>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <Button variant="outline" onClick={() => setMode('cheat-sheet')}>
          <FileText className="w-4 h-4" /> Reference Sheet
        </Button>
        <Button variant="outline" onClick={() => setMode('progress')}>
          <BarChart3 className="w-4 h-4" /> Progress Tracker
        </Button>
      </div>
    </div>
  );

  const FlashcardView = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [category, setCategory] = useState<string>('All');

    const filteredCards = useMemo(() => {
      if (category === 'All') return STUDY_DATA.flashcards;
      return STUDY_DATA.flashcards.filter(c => c.category === category);
    }, [category]);

    const card = filteredCards[currentIndex];

    const nextCard = () => {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
      }, 150);
    };

    const prevCard = () => {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
      }, 150);
    };

    return (
      <div className="max-w-2xl mx-auto py-8 px-4 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-100">Flashcards</h2>
          <select 
            value={category} 
            onChange={(e) => { setCategory(e.target.value); setCurrentIndex(0); setIsFlipped(false); }}
            className="bg-slate-800 border border-slate-700 text-slate-100 text-sm rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Categories</option>
            {Object.values(CATEGORIES).map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        <div className="relative h-80 perspective-1000">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full h-full cursor-pointer"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
                className="w-full h-full relative preserve-3d"
              >
                {/* Front */}
                <Card className={cn(
                  "absolute inset-0 p-8 flex flex-col items-center justify-center text-center backface-hidden",
                  isFlipped ? "pointer-events-none" : ""
                )}>
                  <Badge className="mb-4">{card.category}</Badge>
                  <h3 className="text-3xl font-bold text-slate-100">{card.front}</h3>
                  <p className="text-slate-500 text-sm mt-8">Click to flip</p>
                </Card>

                {/* Back */}
                <Card className={cn(
                  "absolute inset-0 p-8 flex flex-col items-center justify-center text-center backface-hidden rotate-y-180 bg-blue-900/20 border-blue-500/30",
                  !isFlipped ? "pointer-events-none" : ""
                )}>
                  <Badge className="mb-4">Definition</Badge>
                  <p className="text-xl text-slate-200 leading-relaxed">{card.back}</p>
                  <p className="text-slate-500 text-sm mt-8">Click to flip back</p>
                </Card>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between">
          <Button variant="secondary" onClick={prevCard}><ChevronLeft /> Previous</Button>
          <div className="text-slate-400 font-mono text-sm">
            {currentIndex + 1} of {filteredCards.length}
          </div>
          <Button variant="secondary" onClick={nextCard}>Next <ChevronRight /></Button>
        </div>
      </div>
    );
  };

  const QuizView = () => {
    const [quizType, setQuizType] = useState<QuizType | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [quizState, setQuizState] = useState<QuizState | null>(null);

    const startQuiz = (type: QuizType) => {
      let questions: Question[] = [];
      if (type === 'full') {
        // In a real app, we'd shuffle and pick 100. Here we take what we have.
        questions = [...STUDY_DATA.questions].sort(() => Math.random() - 0.5);
      } else {
        questions = STUDY_DATA.questions
          .filter(q => selectedCategory === 'All' || q.category === selectedCategory)
          .sort(() => Math.random() - 0.5)
          .slice(0, 20);
      }

      setQuizState({
        questions,
        currentIndex: 0,
        answers: new Array(questions.length).fill(null),
        isFinished: false,
        startTime: Date.now(),
        timeRemaining: type === 'full' ? 50 * 60 : 15 * 60,
      });
      setQuizType(type);
    };

    useEffect(() => {
      if (!quizState || quizState.isFinished) return;

      const timer = setInterval(() => {
        setQuizState(prev => {
          if (!prev) return null;
          if (prev.timeRemaining <= 0) {
            return { ...prev, isFinished: true };
          }
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);

      return () => clearInterval(timer);
    }, [quizState?.isFinished]);

    const handleAnswer = (optionIndex: number) => {
      if (!quizState) return;
      const newAnswers = [...quizState.answers];
      newAnswers[quizState.currentIndex] = optionIndex;
      setQuizState({ ...quizState, answers: newAnswers });
    };

    const finishQuiz = () => {
      if (!quizState) return;
      
      // Update global progress
      const newProgress = { ...progress };
      quizState.questions.forEach((q, idx) => {
        const answer = quizState.answers[idx];
        if (answer !== null) {
          newProgress[q.category].total += 1;
          if (answer === q.correctAnswer) {
            newProgress[q.category].correct += 1;
          }
        }
      });
      setProgress(newProgress);
      setQuizState({ ...quizState, isFinished: true });
    };

    if (!quizType) {
      return (
        <div className="max-w-2xl mx-auto py-12 px-4 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-slate-100">Practice Exams</h2>
            <p className="text-slate-400">Choose your study format.</p>
          </div>

          <div className="grid gap-6">
            <Card className="p-6 border-blue-500/20 hover:border-blue-500/40 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-100">Full Mock Exam</h3>
                  <p className="text-sm text-slate-400">100 questions • 50 minutes • All categories</p>
                </div>
                <Badge className="bg-blue-900/30 text-blue-400 border-blue-500/30">Official Format</Badge>
              </div>
              <Button className="w-full" onClick={() => startQuiz('full')}>Start Mock Exam</Button>
            </Card>

            <Card className="p-6 border-slate-800 hover:border-slate-700 transition-all">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-100">Targeted Drill</h3>
                  <p className="text-sm text-slate-400">20 questions • 15 minutes • Specific category</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Category</label>
                  <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="All">All Categories</option>
                    {Object.values(CATEGORIES).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <Button variant="secondary" className="w-full" onClick={() => startQuiz('drill')}>Start Drill</Button>
              </div>
            </Card>
          </div>
        </div>
      );
    }

    if (quizState?.isFinished) {
      const score = quizState.answers.filter((a, i) => a === quizState.questions[i].correctAnswer).length;
      const percentage = Math.round((score / quizState.questions.length) * 100);

      return (
        <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
          <Card className="p-8 text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-slate-100">Exam Results</h2>
              <p className="text-slate-400">Performance summary for this session.</p>
            </div>

            <div className="flex justify-center">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="96" cy="96" r="88" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-slate-800" />
                  <circle 
                    cx="96" cy="96" r="88" fill="transparent" stroke="currentColor" strokeWidth="12" 
                    strokeDasharray={2 * Math.PI * 88}
                    strokeDashoffset={2 * Math.PI * 88 * (1 - percentage / 100)}
                    className={cn("transition-all duration-1000 ease-out", percentage >= 70 ? "text-emerald-500" : "text-blue-500")}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold text-slate-100">{percentage}%</span>
                  <span className="text-xs text-slate-500 uppercase tracking-widest">{score} / {quizState.questions.length}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="secondary" onClick={() => setQuizType(null)}>Back to Menu</Button>
              <Button onClick={() => startQuiz(quizType)}>Retake Quiz</Button>
            </div>
          </Card>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-100">Question Review</h3>
            {quizState.questions.map((q, idx) => {
              const isCorrect = quizState.answers[idx] === q.correctAnswer;
              return (
                <Card key={q.id} className={cn("p-6 border-l-4", isCorrect ? "border-l-emerald-500" : "border-l-red-500")}>
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <p className="text-slate-200 font-medium">{idx + 1}. {q.question}</p>
                    {isCorrect ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> : <XCircle className="w-5 h-5 text-red-500 shrink-0" />}
                  </div>
                  <div className="space-y-2 mb-4">
                    {q.options.map((opt, optIdx) => (
                      <div 
                        key={optIdx} 
                        className={cn(
                          "p-3 rounded text-sm",
                          optIdx === q.correctAnswer ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                          optIdx === quizState.answers[idx] ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                          "bg-slate-800/50 text-slate-400"
                        )}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-lg text-sm text-slate-400">
                    <span className="font-bold text-slate-200 block mb-1">Explanation:</span>
                    {q.explanation}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      );
    }

    const currentQuestion = quizState.questions[quizState.currentIndex];
    const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
      <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
        <div className="flex items-center justify-between bg-slate-900 p-4 rounded-lg border border-slate-800 sticky top-4 z-10 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="text-slate-400 text-sm font-mono">
              Q: {quizState.currentIndex + 1} / {quizState.questions.length}
            </div>
            <Progress value={quizState.currentIndex + 1} max={quizState.questions.length} className="w-32 hidden sm:block" />
          </div>
          <div className={cn(
            "flex items-center gap-2 font-mono font-bold px-3 py-1 rounded",
            quizState.timeRemaining < 60 ? "text-red-500 animate-pulse" : "text-blue-400"
          )}>
            <Clock className="w-4 h-4" />
            {formatTime(quizState.timeRemaining)}
          </div>
          <Button variant="ghost" size="sm" onClick={() => setQuizType(null)} className="text-xs">Exit</Button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={quizState.currentIndex}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
          >
            <Card className="p-8 space-y-8">
              <div className="space-y-4">
                <Badge>{currentQuestion.category}</Badge>
                <h3 className="text-2xl font-bold text-slate-100 leading-tight">
                  {currentQuestion.question}
                </h3>
              </div>

              <div className="grid gap-3">
                {currentQuestion.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className={cn(
                      "w-full text-left p-4 rounded-lg border transition-all duration-200 flex items-center gap-4 group",
                      quizState.answers[quizState.currentIndex] === idx
                        ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20"
                        : "bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-800"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0",
                      quizState.answers[quizState.currentIndex] === idx
                        ? "bg-white/20 text-white"
                        : "bg-slate-700 text-slate-400 group-hover:bg-slate-600"
                    )}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    {option}
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between">
          <Button 
            variant="secondary" 
            disabled={quizState.currentIndex === 0}
            onClick={() => setQuizState({ ...quizState, currentIndex: quizState.currentIndex - 1 })}
          >
            <ChevronLeft /> Previous
          </Button>
          
          {quizState.currentIndex === quizState.questions.length - 1 ? (
            <Button variant="primary" onClick={finishQuiz} className="bg-emerald-600 hover:bg-emerald-500">
              Finish Exam
            </Button>
          ) : (
            <Button 
              variant="primary" 
              onClick={() => setQuizState({ ...quizState, currentIndex: quizState.currentIndex + 1 })}
            >
              Next <ChevronRight />
            </Button>
          )}
        </div>
      </div>
    );
  };

  const ProgressView = () => {
    const chartData = (Object.entries(progress) as [string, { total: number; correct: number }][]).map(([name, data]) => ({
      name: name.split(' ').map(w => w[0]).join(''), // Initials for mobile
      fullName: name,
      accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      total: data.total
    }));

    const totalStats = (Object.values(progress) as { total: number; correct: number }[]).reduce((acc: { total: number; correct: number }, curr: { total: number; correct: number }) => ({
      total: acc.total + curr.total,
      correct: acc.correct + curr.correct
    }), { total: 0, correct: 0 });

    const overallAccuracy = totalStats.total > 0 ? Math.round((totalStats.correct / totalStats.total) * 100) : 0;

    return (
      <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-100">Progress Tracker</h2>
          <Button variant="outline" size="sm" onClick={() => {
            if (confirm('Reset all progress?')) {
              const initial: ProgressData = {};
              Object.values(CATEGORIES).forEach(cat => initial[cat] = { total: 0, correct: 0 });
              setProgress(initial);
            }
          }}><RotateCcw className="w-4 h-4" /> Reset</Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 flex flex-col items-center justify-center text-center space-y-2">
            <div className="text-4xl font-bold text-blue-500">{overallAccuracy}%</div>
            <div className="text-xs text-slate-500 uppercase tracking-widest">Overall Accuracy</div>
          </Card>
          <Card className="p-6 flex flex-col items-center justify-center text-center space-y-2">
            <div className="text-4xl font-bold text-slate-100">{totalStats.total}</div>
            <div className="text-xs text-slate-500 uppercase tracking-widest">Questions Attempted</div>
          </Card>
          <Card className="p-6 flex flex-col items-center justify-center text-center space-y-2">
            <div className="text-4xl font-bold text-emerald-500">{totalStats.correct}</div>
            <div className="text-xs text-slate-500 uppercase tracking-widest">Correct Answers</div>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-100 mb-6">Accuracy by Knowledge Area</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#3b82f6' }}
                  cursor={{ fill: '#1e293b' }}
                />
                <Bar dataKey="accuracy" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {chartData.map(item => (
              <div key={item.fullName} className="text-[10px] text-slate-500">
                <span className="font-bold text-slate-400">{item.name}:</span> {item.fullName}
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-100">Detailed Breakdown</h3>
          {(Object.entries(progress) as [string, { total: number; correct: number }][]).map(([cat, data]) => (
            <Card key={cat} className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-300">{cat}</span>
                <span className="text-xs font-mono text-slate-500">{data.correct} / {data.total}</span>
              </div>
              <Progress value={data.correct} max={data.total || 1} />
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const CheatSheetView = () => (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-12">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-100">Reference Cheat Sheet</h2>
        <p className="text-slate-400">All 6 knowledge areas + laws &amp; regulations — 2025-2026 FBLA guidelines.</p>
      </div>

      <div className="grid gap-10">

        {/* ── 1. Security Fundamentals ── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-blue-400 border-b border-slate-800 pb-2">
            <Shield className="w-5 h-5" />
            <h3 className="text-xl font-bold uppercase tracking-wider">1 · Security Fundamentals</h3>
            <span className="ml-auto text-xs text-slate-500 font-mono">15 test items</span>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-4 bg-slate-800/30">
              <h4 className="font-bold text-slate-200 mb-2">CIA Triad</h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li><span className="text-blue-400 font-bold">C</span>onfidentiality — No unauthorized access (encryption, ACLs).</li>
                <li><span className="text-blue-400 font-bold">I</span>ntegrity — No unauthorized modification (hashing, digital signatures).</li>
                <li><span className="text-blue-400 font-bold">A</span>vailability — Accessible when needed (UPS, redundancy, backups).</li>
              </ul>
            </Card>
            <Card className="p-4 bg-slate-800/30">
              <h4 className="font-bold text-slate-200 mb-2">AAA Framework</h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li><span className="text-blue-400 font-bold">A</span>uthentication — Who are you? (password, biometric, token)</li>
                <li><span className="text-blue-400 font-bold">A</span>uthorization — What can you do? (roles, permissions)</li>
                <li><span className="text-blue-400 font-bold">A</span>ccounting — What did you do? (logs, audit trails)</li>
              </ul>
            </Card>
            <Card className="p-4 bg-slate-800/30">
              <h4 className="font-bold text-slate-200 mb-2">Zero Trust Principles</h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• <span className="text-slate-200">Never trust, always verify</span> — even inside the network.</li>
                <li>• Assume breach — limit blast radius.</li>
                <li>• Use least privilege for every access request.</li>
                <li>• Verify explicitly — check identity, device health, location.</li>
              </ul>
            </Card>
            <Card className="p-4 bg-slate-800/30">
              <h4 className="font-bold text-slate-200 mb-2">Deception Tech</h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li><span className="text-blue-400 font-bold">Honeypot</span> — single decoy system to lure attackers.</li>
                <li><span className="text-blue-400 font-bold">Honeynet</span> — network of honeypots mimicking production.</li>
                <li><span className="text-blue-400 font-bold">Honeyfile</span> — fake file that triggers alert when accessed.</li>
              </ul>
            </Card>
            <Card className="p-4 bg-slate-800/30 md:col-span-2">
              <h4 className="font-bold text-slate-200 mb-2">Digital Trust &amp; Number Systems</h4>
              <div className="grid md:grid-cols-2 gap-4 text-xs text-slate-400">
                <ul className="space-y-1">
                  <li><span className="text-slate-200">Non-repudiation:</span> Cannot deny performing an action (digital sigs).</li>
                  <li><span className="text-slate-200">Identity Proofing:</span> Verifying a real-world identity before issuing credentials.</li>
                  <li><span className="text-slate-200">Attestation:</span> Cryptographic proof a system is in a trusted state (boot integrity).</li>
                </ul>
                <ul className="space-y-1">
                  <li><span className="text-slate-200">Binary (Base 2):</span> 1010₂ = 10₁₀</li>
                  <li><span className="text-slate-200">Hex (Base 16):</span> 0xFF = 255₁₀ · Uses 0–9, A–F</li>
                  <li><span className="text-slate-200">Decimal (Base 10):</span> Standard human counting system.</li>
                </ul>
              </div>
            </Card>
          </div>
        </section>

        {/* ── 2. Cyber Threats and Vulnerabilities ── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-red-400 border-b border-slate-800 pb-2">
            <AlertCircle className="w-5 h-5" />
            <h3 className="text-xl font-bold uppercase tracking-wider">2 · Cyber Threats &amp; Vulnerabilities</h3>
            <span className="ml-auto text-xs text-slate-500 font-mono">20 test items</span>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-4 bg-slate-800/30">
              <h4 className="font-bold text-slate-200 mb-2">Malware Types</h4>
              <ul className="text-xs text-slate-400 space-y-2">
                <li><span className="text-slate-200">Virus:</span> Attaches to files; needs user to spread.</li>
                <li><span className="text-slate-200">Worm:</span> Self-replicates across networks automatically.</li>
                <li><span className="text-slate-200">Trojan:</span> Disguised as legitimate software.</li>
                <li><span className="text-slate-200">Ransomware:</span> Encrypts files; demands payment.</li>
                <li><span className="text-slate-200">Rootkit:</span> Hides itself; gives attacker admin access.</li>
                <li><span className="text-slate-200">Keylogger:</span> Records keystrokes to steal credentials.</li>
                <li><span className="text-slate-200">Logic Bomb:</span> Triggers on a condition (date, event).</li>
              </ul>
            </Card>
            <Card className="p-4 bg-slate-800/30">
              <h4 className="font-bold text-slate-200 mb-2">Social Engineering</h4>
              <ul className="text-xs text-slate-400 space-y-2">
                <li><span className="text-slate-200">Phishing:</span> Mass fraudulent emails.</li>
                <li><span className="text-slate-200">Spear Phishing:</span> Targeted, personalized phishing.</li>
                <li><span className="text-slate-200">Whaling:</span> Targets C-suite executives.</li>
                <li><span className="text-slate-200">Vishing:</span> Voice/phone scams.</li>
                <li><span className="text-slate-200">Smishing:</span> SMS text scams.</li>
                <li><span className="text-slate-200">Tailgating:</span> Physical unauthorized entry.</li>
                <li><span className="text-slate-200">Shoulder Surfing:</span> Watching someone type credentials.</li>
              </ul>
            </Card>
            <Card className="p-4 bg-slate-800/30">
              <h4 className="font-bold text-slate-200 mb-2">Attacks &amp; Exploits</h4>
              <ul className="text-xs text-slate-400 space-y-2">
                <li><span className="text-slate-200">DDoS:</span> Flood target with traffic (botnet).</li>
                <li><span className="text-slate-200">Zero-Day:</span> Unknown, unpatched vulnerability.</li>
                <li><span className="text-slate-200">SQL Injection:</span> Malicious SQL in input fields.</li>
                <li><span className="text-slate-200">Buffer Overflow:</span> Overwrite adjacent memory.</li>
                <li><span className="text-slate-200">Evil Twin:</span> Fake Wi-Fi access point.</li>
                <li><span className="text-slate-200">Birthday Attack:</span> Find hash collisions.</li>
                <li><span className="text-slate-200">Downgrade Attack:</span> Force use of weaker protocol.</li>
              </ul>
            </Card>
            <Card className="p-4 bg-slate-800/30 md:col-span-3">
              <h4 className="font-bold text-slate-200 mb-2">Vulnerability Types Quick Reference</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-400">
                <div><span className="text-slate-200 block">Backdoor</span>Secret entry point bypassing normal auth.</div>
                <div><span className="text-slate-200 block">Race Condition</span>Outcome depends on uncontrolled event timing.</div>
                <div><span className="text-slate-200 block">Jailbreaking</span>Remove software restrictions on a device.</div>
                <div><span className="text-slate-200 block">Unpatched Software</span>Known vulnerability with no applied fix.</div>
              </div>
            </Card>
          </div>
        </section>

        {/* ── 3. Security and Design ── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-purple-400 border-b border-slate-800 pb-2">
            <Zap className="w-5 h-5" />
            <h3 className="text-xl font-bold uppercase tracking-wider">3 · Security &amp; Design</h3>
            <span className="ml-auto text-xs text-slate-500 font-mono">20 test items</span>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-4 bg-slate-800/30">
              <h4 className="font-bold text-slate-200 mb-2">Cloud Service Models</h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li><span className="text-purple-400 font-bold">IaaS</span> — Infrastructure as a Service. Most control (you manage OS up). e.g., AWS EC2.</li>
                <li><span className="text-purple-400 font-bold">PaaS</span> — Platform as a Service. Provider manages OS; you manage apps. e.g., Heroku.</li>
                <li><span className="text-purple-400 font-bold">SaaS</span> — Software as a Service. Provider manages everything. e.g., Gmail, Office 365.</li>
              </ul>
            </Card>
            <Card className="p-4 bg-slate-800/30">
              <h4 className="font-bold text-slate-200 mb-2">RAID Levels</h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li><span className="text-purple-400 font-bold">RAID 0</span> — Striping. Best speed. No fault tolerance.</li>
                <li><span className="text-purple-400 font-bold">RAID 1</span> — Mirroring. Full copy on each drive. Survives 1 failure.</li>
                <li><span className="text-purple-400 font-bold">RAID 5</span> — Striping + distributed parity. ≥3 drives. Survives 1 failure.</li>
              </ul>
            </Card>
            <Card className="p-4 bg-slate-800/30">
              <h4 className="font-bold text-slate-200 mb-2">Segmentation</h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li><span className="text-purple-400 font-bold">Physical:</span> Separate hardware, cables, routers. Strongest isolation.</li>
                <li><span className="text-purple-400 font-bold">Logical (VLAN):</span> Software-defined separation on shared hardware. More flexible.</li>
              </ul>
            </Card>
            <Card className="p-4 bg-slate-800/30">
              <h4 className="font-bold text-slate-200 mb-2">Virtualization &amp; Containers</h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li><span className="text-purple-400 font-bold">VM:</span> Full OS emulation; strong isolation; higher overhead.</li>
                <li><span className="text-purple-400 font-bold">Container:</span> Shares host OS kernel; lightweight; isolated process space.</li>
                <li>Both limit blast radius — compromise in one doesn't spread easily.</li>
              </ul>
            </Card>
            <Card className="p-4 bg-slate-800/30 md:col-span-2">
              <h4 className="font-bold text-slate-200 mb-2">IoT Security + Backup + CIA in Design</h4>
              <div className="grid md:grid-cols-3 gap-4 text-xs text-slate-400">
                <ul className="space-y-1">
                  <li className="text-slate-200 font-bold mb-1">IoT Challenges</li>
                  <li>• Limited hardware → weak encryption</li>
                  <li>• Hard to patch / no auto-update</li>
                  <li>• Default credentials rarely changed</li>
                  <li>• Massive attack surface at scale</li>
                </ul>
                <ul className="space-y-1">
                  <li className="text-slate-200 font-bold mb-1">3-2-1 Backup Rule</li>
                  <li>• <span className="text-slate-200">3</span> copies of data</li>
                  <li>• <span className="text-slate-200">2</span> different media types</li>
                  <li>• <span className="text-slate-200">1</span> offsite copy</li>
                  <li>UPS supports Availability.</li>
                </ul>
                <ul className="space-y-1">
                  <li className="text-slate-200 font-bold mb-1">CIA in Design</li>
                  <li>• <span className="text-slate-200">C:</span> Encryption at rest/transit</li>
                  <li>• <span className="text-slate-200">I:</span> Hashing, digital signatures</li>
                  <li>• <span className="text-slate-200">A:</span> UPS, RAID, load balancing</li>
                </ul>
              </div>
            </Card>
          </div>
        </section>

        {/* ── 4. Network and Data Security ── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 border-b border-slate-800 pb-2">
            <RotateCcw className="w-5 h-5" />
            <h3 className="text-xl font-bold uppercase tracking-wider">4 · Network &amp; Data Security</h3>
            <span className="ml-auto text-xs text-slate-500 font-mono">15 test items</span>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-4 bg-slate-800/30">
              <h4 className="font-bold text-slate-200 mb-2">Cryptography</h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li><span className="text-emerald-400 font-bold">Symmetric:</span> Same key for encrypt + decrypt. Fast. (AES)</li>
                <li><span className="text-emerald-400 font-bold">Asymmetric:</span> Public key encrypts; private key decrypts. (RSA)</li>
                <li><span className="text-emerald-400 font-bold">Hashing:</span> One-way fingerprint; verifies integrity. (SHA-256)</li>
                <li><span className="text-emerald-400 font-bold">Digital Signature:</span> Encrypt with private key → proves authenticity + non-repudiation.</li>
              </ul>
            </Card>
            <Card className="p-4 bg-slate-800/30">
              <h4 className="font-bold text-slate-200 mb-2">Ciphers</h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li><span className="text-emerald-400 font-bold">Caesar Cipher:</span> Shift each letter by a fixed amount (shift 3: A→D).</li>
                <li><span className="text-emerald-400 font-bold">Substitution:</span> Replace each letter with another based on a key.</li>
                <li><span className="text-emerald-400 font-bold">Shift Cipher:</span> General term for letter-shifting encryption (Caesar is an example).</li>
              </ul>
            </Card>
            <Card className="p-4 bg-slate-800/30">
              <h4 className="font-bold text-slate-200 mb-2">States of Data</h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li><span className="text-emerald-400 font-bold">At Rest:</span> Stored (disk, DB). Encrypt with AES/BitLocker.</li>
                <li><span className="text-emerald-400 font-bold">In Transit:</span> Moving over network. Encrypt with TLS/HTTPS.</li>
                <li><span className="text-emerald-400 font-bold">In Use:</span> Active in RAM/CPU. Hardest to protect.</li>
              </ul>
            </Card>
            <Card className="p-4 bg-slate-800/30">
              <h4 className="font-bold text-slate-200 mb-2">Access Control Models</h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li><span className="text-emerald-400 font-bold">MAC</span> — Mandatory. OS enforces labels (Top Secret etc.). User can't change permissions.</li>
                <li><span className="text-emerald-400 font-bold">DAC</span> — Discretionary. Resource owner decides access.</li>
                <li><span className="text-emerald-400 font-bold">RBAC</span> — Role-Based. Access by job role.</li>
              </ul>
            </Card>
            <Card className="p-4 bg-slate-800/30 md:col-span-2">
              <h4 className="font-bold text-slate-200 mb-2">Authentication Methods &amp; Blockchain</h4>
              <div className="grid md:grid-cols-2 gap-4 text-xs text-slate-400">
                <ul className="space-y-1">
                  <li><span className="text-slate-200">MFA:</span> Something you know + have + are.</li>
                  <li><span className="text-slate-200">Certificate:</span> Digital file binding public key to identity, signed by a CA.</li>
                  <li><span className="text-slate-200">Token:</span> Physical/software device generating one-time codes.</li>
                </ul>
                <ul className="space-y-1">
                  <li><span className="text-slate-200">Blockchain:</span> Distributed immutable ledger. Each block contains previous block's hash → tamper-evident chain.</li>
                  <li><span className="text-slate-200">Hashing for integrity:</span> Store hash of file; recompute later to detect changes.</li>
                </ul>
              </div>
            </Card>
          </div>
        </section>

        {/* ── 5. Security Operations and Management ── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-yellow-400 border-b border-slate-800 pb-2">
            <BarChart3 className="w-5 h-5" />
            <h3 className="text-xl font-bold uppercase tracking-wider">5 · Security Operations &amp; Management</h3>
            <span className="ml-auto text-xs text-slate-500 font-mono">10 test items</span>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-4 bg-slate-800/30">
              <h4 className="font-bold text-slate-200 mb-2">Common Security Policies</h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li><span className="text-yellow-400 font-bold">AUP</span> — Acceptable Use: rules for company tech use.</li>
                <li><span className="text-yellow-400 font-bold">BCP</span> — Business Continuity: keep business running during disaster.</li>
                <li><span className="text-yellow-400 font-bold">DRP</span> — Disaster Recovery: restore IT systems after disaster.</li>
                <li><span className="text-yellow-400 font-bold">IRP</span> — Incident Response: steps to handle a security breach.</li>
                <li><span className="text-yellow-400 font-bold">Info Sec Policy</span> — Rules for protecting information assets.</li>
              </ul>
            </Card>
            <Card className="p-4 bg-slate-800/30">
              <h4 className="font-bold text-slate-200 mb-2">Firewall Types</h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li><span className="text-yellow-400 font-bold">Packet-Filtering:</span> Inspects headers (IP/port). Fastest, least smart.</li>
                <li><span className="text-yellow-400 font-bold">Stateful:</span> Tracks connection state. Smarter than packet-filtering.</li>
                <li><span className="text-yellow-400 font-bold">NGFW:</span> Deep Packet Inspection + app awareness + IDS/IPS built in.</li>
                <li><span className="text-yellow-400 font-bold">WAF:</span> Specifically protects web apps. Defends against SQLi &amp; XSS.</li>
              </ul>
            </Card>
            <Card className="p-4 bg-slate-800/30">
              <h4 className="font-bold text-slate-200 mb-2">Firewall Rules &amp; ACLs</h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• Rules are processed top-down; first match wins.</li>
                <li>• ACL entries specify: source IP, destination IP, port, protocol, action (permit/deny).</li>
                <li>• <span className="text-slate-200">Implicit deny all</span> — default rule at the bottom denies everything not explicitly allowed.</li>
              </ul>
            </Card>
            <Card className="p-4 bg-slate-800/30">
              <h4 className="font-bold text-slate-200 mb-2">Change Management &amp; Email Security</h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li><span className="text-yellow-400 font-bold">Change Mgmt:</span> Request → Review → Approve → Test → Deploy → Document.</li>
                <li>Prevents unauthorized/untested changes from introducing vulnerabilities.</li>
                <li><span className="text-yellow-400 font-bold">SPF/DKIM/DMARC:</span> Authenticate email senders; stop spoofing.</li>
              </ul>
            </Card>
          </div>
        </section>

        {/* ── 6. Security Protocols and Threat Mitigation ── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-cyan-400 border-b border-slate-800 pb-2">
            <Info className="w-5 h-5" />
            <h3 className="text-xl font-bold uppercase tracking-wider">6 · Security Protocols &amp; Threat Mitigation</h3>
            <span className="ml-auto text-xs text-slate-500 font-mono">20 test items</span>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-4 bg-slate-800/30">
              <h4 className="font-bold text-slate-200 mb-2">Secure Protocols</h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li><span className="text-cyan-400 font-bold">SSH</span> — Secure remote terminal. Port 22. Replaces Telnet.</li>
                <li><span className="text-cyan-400 font-bold">HTTPS</span> — HTTP over TLS. Port 443. Encrypts web traffic.</li>
                <li><span className="text-cyan-400 font-bold">TLS</span> — Encrypts data in transit (successor to SSL).</li>
                <li><span className="text-cyan-400 font-bold">WPA2/WPA3</span> — Secure Wi-Fi. AES encryption. WEP is obsolete.</li>
                <li><span className="text-cyan-400 font-bold">SFTP/FTPS</span> — Secure file transfer protocols.</li>
              </ul>
            </Card>
            <Card className="p-4 bg-slate-800/30">
              <h4 className="font-bold text-slate-200 mb-2">IDS vs. IPS</h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li><span className="text-cyan-400 font-bold">IDS</span> (Detection System) — Monitors traffic and <span className="text-slate-200">alerts</span> on suspicious activity. Passive — does NOT block.</li>
                <li><span className="text-cyan-400 font-bold">IPS</span> (Prevention System) — Sits inline; can <span className="text-slate-200">actively block</span> malicious traffic. Active.</li>
              </ul>
            </Card>
            <Card className="p-4 bg-slate-800/30">
              <h4 className="font-bold text-slate-200 mb-2">Obfuscation Methods</h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li><span className="text-cyan-400 font-bold">Tokenization:</span> Sensitive data → non-sensitive token (credit cards).</li>
                <li><span className="text-cyan-400 font-bold">Data Masking:</span> Real data → fake-but-realistic data (for dev/test).</li>
                <li><span className="text-cyan-400 font-bold">Steganography:</span> Hide a message inside a file (image, audio).</li>
                <li><span className="text-cyan-400 font-bold">Obfuscation:</span> Make code hard to read (protect IP, slow reverse engineering).</li>
              </ul>
            </Card>
            <Card className="p-4 bg-slate-800/30">
              <h4 className="font-bold text-slate-200 mb-2">Digital Certificates &amp; CA</h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li><span className="text-cyan-400 font-bold">CA</span> — Certificate Authority; trusted third party that signs certs.</li>
                <li><span className="text-cyan-400 font-bold">Digital Cert:</span> Binds public key to identity; contains owner info, public key, expiration, CA signature.</li>
                <li><span className="text-cyan-400 font-bold">PKI:</span> The overall system of CAs, certs, and policies.</li>
              </ul>
            </Card>
            <Card className="p-4 bg-slate-800/30 md:col-span-2">
              <h4 className="font-bold text-slate-200 mb-2">Pen Testing, Patches &amp; Passwords</h4>
              <div className="grid md:grid-cols-3 gap-4 text-xs text-slate-400">
                <ul className="space-y-1">
                  <li className="text-slate-200 font-bold mb-1">Pen Testing</li>
                  <li>• Black Box — no prior knowledge (external attacker sim).</li>
                  <li>• White Box — full knowledge (internal audit).</li>
                  <li>• Gray Box — partial knowledge.</li>
                  <li>Goal: find &amp; fix vulnerabilities before attackers do.</li>
                </ul>
                <ul className="space-y-1">
                  <li className="text-slate-200 font-bold mb-1">Patch Management</li>
                  <li>• Critical patches → apply within 30 days.</li>
                  <li>• Unpatched software = #1 attack vector.</li>
                  <li>• Version control: audit changes, rollback if needed.</li>
                </ul>
                <ul className="space-y-1">
                  <li className="text-slate-200 font-bold mb-1">Strong Passwords</li>
                  <li>• ≥12 characters.</li>
                  <li>• Mix: upper, lower, numbers, symbols.</li>
                  <li>• No dictionary words or personal info.</li>
                  <li>• Unique per account. Use a password manager.</li>
                </ul>
              </div>
            </Card>
          </div>
        </section>

        {/* ── 7. Laws, Acts & Regulatory Frameworks ── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-orange-400 border-b border-slate-800 pb-2">
            <FileText className="w-5 h-5" />
            <h3 className="text-xl font-bold uppercase tracking-wider">7 · Laws, Acts &amp; Regulations</h3>
            <span className="ml-auto text-xs text-slate-500 font-mono">Know these cold</span>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-4 bg-slate-800/30">
              <h4 className="font-bold text-slate-200 mb-2">Privacy Laws — U.S.</h4>
              <ul className="text-xs text-slate-400 space-y-2">
                <li><span className="text-orange-400 font-bold">HIPAA (1996)</span> — Protects patient health information (PHI). Applies to healthcare providers, insurers, and business associates.</li>
                <li><span className="text-orange-400 font-bold">FERPA (1974)</span> — Protects student education records. Schools need consent before releasing records. Applies to federally funded schools.</li>
                <li><span className="text-orange-400 font-bold">COPPA (1998)</span> — Requires verifiable parental consent before collecting data from children under 13. Enforced by the FTC.</li>
                <li><span className="text-orange-400 font-bold">GLBA (1999)</span> — Requires financial institutions to protect customers' non-public personal info and allow opt-out of data sharing.</li>
              </ul>
            </Card>
            <Card className="p-4 bg-slate-800/30">
              <h4 className="font-bold text-slate-200 mb-2">Privacy Laws — International &amp; Broad</h4>
              <ul className="text-xs text-slate-400 space-y-2">
                <li><span className="text-orange-400 font-bold">GDPR (EU, 2018)</span> — Comprehensive EU data privacy law. Applies globally to any org handling EU residents' data. Key rights: access, erasure, portability. Breach notification within 72 hours. Fines up to 4% of global revenue.</li>
                <li><span className="text-orange-400 font-bold">CAN-SPAM (2003)</span> — Governs commercial email in the U.S. Requires honest subject lines, physical address, working opt-out honored within 10 business days.</li>
              </ul>
            </Card>
            <Card className="p-4 bg-slate-800/30">
              <h4 className="font-bold text-slate-200 mb-2">Cybercrime &amp; Federal Security Laws</h4>
              <ul className="text-xs text-slate-400 space-y-2">
                <li><span className="text-orange-400 font-bold">CFAA (1986)</span> — Computer Fraud and Abuse Act. Primary U.S. law criminalizing unauthorized computer access. Intent doesn't excuse it — authorization is the key distinction.</li>
                <li><span className="text-orange-400 font-bold">FISMA (2002)</span> — Requires all federal agencies to implement an information security program using NIST standards and report breaches to oversight bodies.</li>
                <li><span className="text-orange-400 font-bold">CIRCIA (2022)</span> — Critical infrastructure entities must report significant cyber incidents to CISA within 72 hours; ransomware payments within 24 hours.</li>
              </ul>
            </Card>
            <Card className="p-4 bg-slate-800/30">
              <h4 className="font-bold text-slate-200 mb-2">Financial, Copyright &amp; Industry Standards</h4>
              <ul className="text-xs text-slate-400 space-y-2">
                <li><span className="text-orange-400 font-bold">SOX (2002)</span> — Sarbanes-Oxley. Enacted after Enron. Executives personally certify financial statements. Mandates IT controls over financial data. Criminal penalties for non-compliance.</li>
                <li><span className="text-orange-400 font-bold">DMCA (1998)</span> — Prohibits circumventing DRM/copy protection even for personal use. Provides safe harbor for platforms that act on takedown notices.</li>
                <li><span className="text-orange-400 font-bold">PCI DSS</span> — Industry standard (not a law) for orgs storing/processing card data. Requires encryption, access controls, and regular audits.</li>
              </ul>
            </Card>
            <Card className="p-4 bg-slate-800/30 md:col-span-2">
              <h4 className="font-bold text-slate-200 mb-2">Quick Reference — Who Does Each Law Protect?</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-400">
                <div><span className="text-orange-400 block font-bold mb-1">HIPAA</span>Patients — medical/health data</div>
                <div><span className="text-orange-400 block font-bold mb-1">FERPA</span>Students — academic records</div>
                <div><span className="text-orange-400 block font-bold mb-1">COPPA</span>Children under 13 — online data</div>
                <div><span className="text-orange-400 block font-bold mb-1">GLBA</span>Finance customers — personal financial info</div>
                <div><span className="text-orange-400 block font-bold mb-1">GDPR</span>EU residents — all personal data</div>
                <div><span className="text-orange-400 block font-bold mb-1">CAN-SPAM</span>Email recipients — commercial messages</div>
                <div><span className="text-orange-400 block font-bold mb-1">CFAA</span>Computer systems — from unauthorized access</div>
                <div><span className="text-orange-400 block font-bold mb-1">SOX</span>Investors — accurate financial reporting</div>
              </div>
            </Card>
          </div>
        </section>

      </div>
    </div>
  );

  // --- Layout ---

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setMode('home')}>
            <Shield className="w-6 h-6 text-blue-500" />
            <span className="font-bold text-lg tracking-tight hidden sm:block">FBLA <span className="text-blue-500">CyberStudy</span></span>
          </div>

          <div className="hidden md:flex items-center gap-1">
            <Button variant="ghost" onClick={() => setMode('home')} className={cn(mode === 'home' && "bg-slate-800 text-blue-400")}>Home</Button>
            <Button variant="ghost" onClick={() => setMode('flashcards')} className={cn(mode === 'flashcards' && "bg-slate-800 text-blue-400")}>Flashcards</Button>
            <Button variant="ghost" onClick={() => setMode('quiz')} className={cn(mode === 'quiz' && "bg-slate-800 text-blue-400")}>Quiz</Button>
            <Button variant="ghost" onClick={() => setMode('progress')} className={cn(mode === 'progress' && "bg-slate-800 text-blue-400")}>Progress</Button>
            <Button variant="ghost" onClick={() => setMode('cheat-sheet')} className={cn(mode === 'cheat-sheet' && "bg-slate-800 text-blue-400")}>Reference</Button>
          </div>

          <button className="md:hidden p-2 text-slate-400" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden fixed inset-0 z-40 bg-slate-950 pt-16"
          >
            <div className="p-4 space-y-2">
              {[
                { id: 'home', label: 'Home', icon: LayoutDashboard },
                { id: 'flashcards', label: 'Flashcards', icon: BookOpen },
                { id: 'quiz', label: 'Quiz Mode', icon: Zap },
                { id: 'progress', label: 'Progress', icon: BarChart3 },
                { id: 'cheat-sheet', label: 'Reference', icon: FileText },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setMode(item.id as AppMode); setIsMenuOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-lg text-left transition-colors",
                    mode === item.id ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-900"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <main className="pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {mode === 'home' && <HomeView />}
            {mode === 'flashcards' && <FlashcardView />}
            {mode === 'quiz' && <QuizView />}
            {mode === 'progress' && <ProgressView />}
            {mode === 'cheat-sheet' && <CheatSheetView />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Info */}
      <footer className="border-t border-slate-900 py-8 text-center text-slate-600 text-xs">
        <p>© 2026 FBLA Cybersecurity SLC Prep • Pennsylvania FBLA</p>
      </footer>
    </div>
  );
}
