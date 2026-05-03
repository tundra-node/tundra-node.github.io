import React, { useState, useEffect } from 'react';
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
  Info,
  ThumbsUp,
  ThumbsDown,
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

  const HomeView = () => {
    const [timeLeft, setTimeLeft] = useState(() => {
      const target = new Date('2026-06-30T10:00:00-05:00');
      return Math.max(0, Math.floor((target.getTime() - Date.now()) / 1000));
    });
    useEffect(() => {
      const t = setInterval(() => {
        const target = new Date('2026-06-30T10:00:00-05:00');
        setTimeLeft(Math.max(0, Math.floor((target.getTime() - Date.now()) / 1000)));
      }, 1000);
      return () => clearInterval(t);
    }, []);
    const days = Math.floor(timeLeft / 86400);
    const hrs = Math.floor((timeLeft % 86400) / 3600);
    const mins = Math.floor((timeLeft % 3600) / 60);
    const secs = timeLeft % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');

    return (
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
          FBLA Cybersecurity <span className="text-blue-500">NLC 2026</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Nationals · San Antonio · 100 questions · 50 minutes
        </p>
      </header>

      {/* Nationals countdown */}
      <div className="max-w-xl mx-auto">
        <Card className="p-5 border-blue-500/20 bg-blue-950/20">
          <div className="text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-400">Nationals · June 30, 2026 · 10:00 AM CT</p>
            <div className="grid grid-cols-4 gap-3">
              {[['Days', days], ['Hrs', hrs], ['Min', mins], ['Sec', secs]].map(([label, val]) => (
                <div key={label as string} className="flex flex-col items-center bg-slate-900 rounded-lg py-3">
                  <span className="text-3xl font-bold font-mono text-slate-100">{pad(val as number)}</span>
                  <span className="text-[10px] uppercase tracking-widest text-slate-500 mt-1">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>


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
  };

  const FlashcardView = () => {
    const [category, setCategory] = useState<string>('All');
    const [isFlipped, setIsFlipped] = useState(false);

    // --- Persistent state ---
    const [known, setKnown] = useState<Set<string>>(() => {
      try { return new Set(JSON.parse(localStorage.getItem('fbla_fc_known') ?? '[]')); }
      catch { return new Set(); }
    });

    // The active queue: an ordered array of card IDs. Unsure cards get reinserted;
    // known cards are removed. Persisted so refreshing mid-session keeps your place.
    const buildQueue = (cat: string) =>
      STUDY_DATA.flashcards
        .filter(c => cat === 'All' || c.category === cat)
        .sort(() => Math.random() - 0.5)
        .map(c => c.id);

    const [queue, setQueue] = useState<string[]>(() => {
      try {
        const saved = JSON.parse(localStorage.getItem('fbla_fc_queue') ?? 'null');
        if (Array.isArray(saved) && saved.length > 0) return saved;
      } catch { /* fall through */ }
      return buildQueue('All');
    });

    const [queuePos, setQueuePos] = useState(0); // index into queue we're currently showing

    // Persist
    useEffect(() => {
      localStorage.setItem('fbla_fc_known', JSON.stringify([...known]));
    }, [known]);

    useEffect(() => {
      localStorage.setItem('fbla_fc_queue', JSON.stringify(queue));
    }, [queue]);

    const totalCards = STUDY_DATA.flashcards.filter(c => category === 'All' || c.category === category).length;
    const knownCount = [...known].filter(id => {
      const c = STUDY_DATA.flashcards.find(f => f.id === id);
      return c && (category === 'All' || c.category === category);
    }).length;

    // Current card is whatever ID is at queuePos
    const currentId = queue[queuePos];
    const card = STUDY_DATA.flashcards.find(f => f.id === currentId) ?? STUDY_DATA.flashcards[0];
    const isDone = queue.length === 0;

    const resetDeck = () => {
      const newQ = buildQueue(category);
      setQueue(newQ);
      setQueuePos(0);
      setIsFlipped(false);
      setKnown(new Set());
      localStorage.removeItem('fbla_fc_known');
      localStorage.setItem('fbla_fc_queue', JSON.stringify(newQ));
    };

    const handleCategoryChange = (cat: string) => {
      setCategory(cat);
      const newQ = buildQueue(cat);
      setQueue(newQ);
      setQueuePos(0);
      setIsFlipped(false);
      // don't wipe known — preserve across category switches
    };

    const advance = (nextQueue: string[], nextPos: number) => {
      setIsFlipped(false);
      setTimeout(() => {
        setQueue(nextQueue);
        setQueuePos(nextPos);
      }, 150);
    };

    const markKnown = () => {
      const newKnown = new Set([...known, card.id]);
      setKnown(newKnown);
      // Remove this card from the queue entirely
      const newQueue = [...queue.slice(0, queuePos), ...queue.slice(queuePos + 1)];
      const nextPos = Math.min(queuePos, newQueue.length - 1);
      advance(newQueue, Math.max(nextPos, 0));
    };

    const markUnknown = () => {
      // Remove from current position, reinsert 3 spots ahead (wraps to end if near end)
      const without = [...queue.slice(0, queuePos), ...queue.slice(queuePos + 1)];
      const insertAt = Math.min(queuePos + 3, without.length); // never beyond end
      const newQueue = [...without.slice(0, insertAt), card.id, ...without.slice(insertAt)];
      const nextPos = queuePos < newQueue.length ? queuePos : 0;
      advance(newQueue, nextPos);
    };

    // Remaining = unique IDs still in queue (unsure cards may appear multiple times)
    const remaining = new Set(queue).size;

    if (isDone) {
      return (
        <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-6">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
          <h2 className="text-3xl font-bold text-slate-100">Deck Complete!</h2>
          <p className="text-slate-400">You marked all <span className="text-emerald-400 font-bold">{knownCount}</span> cards as known.</p>
          <Button onClick={resetDeck} className="mx-auto">
            <RotateCcw className="w-4 h-4" /> Start Over
          </Button>
        </div>
      );
    }

    return (
      <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-2xl font-bold text-slate-100">Flashcards</h2>
          <div className="flex items-center gap-2">
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-100 text-sm rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Categories</option>
              {Object.values(CATEGORIES).map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <Button variant="outline" size="sm" onClick={resetDeck} title="Reset deck &amp; progress"
              className="text-slate-500 hover:text-red-400 hover:border-red-500/40">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-emerald-500">{knownCount} known</span>
          <span className="text-slate-500">{remaining} left in deck</span>
          <span className="text-red-400">{queue.length - remaining > 0 ? `+${queue.length - remaining} repeats` : ''}</span>
        </div>
        {/* Progress: known out of total */}
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${(knownCount / totalCards) * 100}%` }} />
        </div>
        <p className="text-xs text-slate-600 text-right font-mono">{knownCount}/{totalCards} mastered</p>

        {/* Card */}
        <div className="relative h-72" style={{ perspective: '1200px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentId}-${queuePos}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.18 }}
              className="w-full h-full"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.5, type: 'spring', stiffness: 300, damping: 30 }}
                className="w-full h-full relative cursor-pointer"
                style={{ transformStyle: 'preserve-3d' }}
                onClick={() => setIsFlipped(f => !f)}
              >
                {/* Front */}
                <div
                  className="absolute inset-0 rounded-lg border border-slate-800 p-8 flex flex-col items-center justify-center text-center bg-slate-900 shadow-xl"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <Badge className="mb-4">{card?.category}</Badge>
                  <h3 className="text-2xl font-bold text-slate-100 leading-snug">{card?.front}</h3>
                  <p className="text-slate-600 text-xs mt-6 uppercase tracking-widest">click to reveal answer</p>
                </div>
                {/* Back */}
                <div
                  className="absolute inset-0 rounded-lg border border-blue-500/30 p-8 flex flex-col items-center justify-center text-center bg-slate-900 shadow-xl overflow-y-auto"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <Badge className="mb-4 bg-blue-900/40 text-blue-300 border-blue-500/30">Answer</Badge>
                  <p className="text-slate-200 text-base leading-relaxed whitespace-pre-line">{card?.back}</p>
                  <p className="text-slate-600 text-xs mt-6 uppercase tracking-widest">click to flip back</p>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Got It / Still Learning */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={markUnknown}
            className="flex items-center justify-center gap-2 py-3 rounded-lg border border-slate-700 text-slate-400 font-medium transition-all hover:border-red-500/40 hover:text-red-400 hover:bg-red-500/10"
          >
            <ThumbsDown className="w-4 h-4" /> Still Learning
          </button>
          <button
            onClick={markKnown}
            className="flex items-center justify-center gap-2 py-3 rounded-lg border border-slate-700 text-slate-400 font-medium transition-all hover:border-emerald-500/40 hover:text-emerald-400 hover:bg-emerald-500/10"
          >
            <ThumbsUp className="w-4 h-4" /> Got It
          </button>
        </div>

        <p className="text-center text-xs text-slate-600">
          "Still Learning" cards come back in 3 cards · "Got It" removes the card
        </p>
      </div>
    );
  };

  const QuizView = () => {
    const [quizType, setQuizType] = useState<QuizType | null>(null);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [quizState, setQuizState] = useState<QuizState | null>(null);
    const [drillLabel, setDrillLabel] = useState<string>('');

    // Weak areas: bottom 2 categories by accuracy (min 1 attempt), else fallback
    const getWeakCategories = (): string[] => {
      const entries = Object.entries(progress)
        .filter(([, d]) => d.total > 0)
        .sort((a, b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total));
      if (entries.length >= 2) return entries.slice(0, 2).map(([cat]) => cat);
      if (entries.length === 1) return [entries[0][0], CATEGORIES.NETWORK];
      return [CATEGORIES.NETWORK, CATEGORIES.OPERATIONS];
    };

    const startWeakDrill = () => {
      const cats = getWeakCategories();
      setSelectedCategories(cats);
      setDrillLabel(`Weak Areas: ${cats.map(c => c.split(' ').slice(-1)[0]).join(' + ')}`);
      const pool = STUDY_DATA.questions
        .filter(q => cats.includes(q.category))
        .sort(() => Math.random() - 0.5)
        .slice(0, 20);
      setQuizState({
        questions: pool,
        currentIndex: 0,
        answers: new Array(pool.length).fill(null),
        isFinished: false,
        startTime: Date.now(),
        timeRemaining: 15 * 60,
      });
      setQuizType('drill');
    };

    const toggleCategory = (cat: string) => {
      setSelectedCategories(prev =>
        prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
      );
    };

    const startQuiz = (type: QuizType) => {
      const activeCats = selectedCategories.length > 0 ? selectedCategories : null;
      const pool = type === 'full'
        ? [...STUDY_DATA.questions].sort(() => Math.random() - 0.5)
        : STUDY_DATA.questions
            .filter(q => !activeCats || activeCats.includes(q.category))
            .sort(() => Math.random() - 0.5)
            .slice(0, 20);
      setDrillLabel('');

      setQuizState({
        questions: pool,
        currentIndex: 0,
        answers: new Array(pool.length).fill(null),
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
          if (prev.timeRemaining <= 0) return { ...prev, isFinished: true };
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
      const newProgress = { ...progress };
      const bankRaw = localStorage.getItem('fbla_wrong_bank');
      const bank: string[] = bankRaw ? JSON.parse(bankRaw) : [];
      quizState.questions.forEach((q, idx) => {
        const answer = quizState.answers[idx];
        if (answer === null) return;
        newProgress[q.category].total += 1;
        if (answer === q.correctAnswer) {
          newProgress[q.category].correct += 1;
          const pos = bank.indexOf(q.id);
          if (pos !== -1) bank.splice(pos, 1); // graduated out of bank
        } else {
          if (!bank.includes(q.id)) bank.push(q.id); // add to bank
        }
      });
      localStorage.setItem('fbla_wrong_bank', JSON.stringify(bank));
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
                  <p className="text-sm text-slate-400">All questions · 50 minutes · All categories</p>
                </div>
                <Badge className="bg-blue-900/30 text-blue-400 border-blue-500/30">Official Format</Badge>
              </div>
              <Button className="w-full" onClick={() => startQuiz('full')}>Start Mock Exam</Button>
            </Card>

            {/* Weak Areas Drill */}
            {(() => {
              const cats = getWeakCategories();
              const bankRaw = localStorage.getItem('fbla_wrong_bank');
              const bankCount = bankRaw ? JSON.parse(bankRaw).length : 0;
              return (
                <div className="grid sm:grid-cols-2 gap-4">
                  <Card className="p-5 border-red-500/20 hover:border-red-500/40 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-red-500/10 rounded-lg"><AlertCircle className="w-5 h-5 text-red-400" /></div>
                      <div>
                        <h3 className="font-bold text-slate-100">Weak Areas Drill</h3>
                        <p className="text-xs text-slate-500">{cats.map(c => c.split(' ').pop()).join(' + ')}</p>
                      </div>
                    </div>
                    <Button variant="danger" size="sm" className="w-full" onClick={startWeakDrill}>Drill Weakest</Button>
                  </Card>
                  <Card className={`p-5 transition-all ${bankCount > 0 ? 'border-yellow-500/20 hover:border-yellow-500/40' : 'border-slate-800 opacity-60'}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-yellow-500/10 rounded-lg"><XCircle className="w-5 h-5 text-yellow-400" /></div>
                      <div>
                        <h3 className="font-bold text-slate-100">Wrong Answer Bank</h3>
                        <p className="text-xs text-slate-500">{bankCount} question{bankCount !== 1 ? 's' : ''} saved</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      disabled={bankCount === 0}
                      onClick={() => {
                        const ids: string[] = JSON.parse(localStorage.getItem('fbla_wrong_bank') ?? '[]');
                        const pool = STUDY_DATA.questions
                          .filter(q => ids.includes(q.id))
                          .sort(() => Math.random() - 0.5)
                          .slice(0, 20);
                        setDrillLabel(`Wrong Bank (${Math.min(pool.length, 20)} q)`);
                        setQuizState({ questions: pool, currentIndex: 0, answers: new Array(pool.length).fill(null), isFinished: false, startTime: Date.now(), timeRemaining: 15 * 60 });
                        setQuizType('drill');
                      }}
                    >
                      {bankCount === 0 ? 'No questions yet' : 'Drill Bank'}
                    </Button>
                  </Card>
                </div>
              );
            })()}
            <Card className="p-6 border-slate-800 hover:border-slate-700 transition-all">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-100">Targeted Drill</h3>
                  <p className="text-sm text-slate-400">20 questions · 15 minutes · Select categories</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filter by Category <span className="text-slate-600 normal-case font-normal">(none = all)</span></label>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(CATEGORIES).map(cat => {
                      const isSelected = selectedCategories.includes(cat);
                      return (
                        <button
                          key={cat}
                          onClick={() => toggleCategory(cat)}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                            isSelected
                              ? "bg-blue-600 border-blue-500 text-white"
                              : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
                          )}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                  {selectedCategories.length > 0 && (
                    <button onClick={() => setSelectedCategories([])} className="text-xs text-slate-500 hover:text-red-400 transition-colors">
                      ✕ Clear filters
                    </button>
                  )}
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
      const skipped = quizState.answers.filter(a => a === null).length;
      const answered = quizState.questions.length - skipped;
      const percentage = answered > 0 ? Math.round((score / quizState.questions.length) * 100) : 0;
      const maxDuration = quizType === 'full' ? 50 * 60 : 15 * 60;
      const elapsed = Math.min(Math.floor((Date.now() - quizState.startTime) / 1000), maxDuration);
      const formatTime = (s: number) => `${Math.floor(s / 60)}m ${(s % 60).toString().padStart(2,'0')}s`;
      const missedIds = quizState.questions
        .filter((_, i) => quizState.answers[i] !== quizState.questions[i].correctAnswer)
        .map(q => q.id);

      // Per-category breakdown for this session
      const catBreakdown: Record<string, { correct: number; total: number }> = {};
      quizState.questions.forEach((q, i) => {
        if (!catBreakdown[q.category]) catBreakdown[q.category] = { correct: 0, total: 0 };
        catBreakdown[q.category].total++;
        if (quizState.answers[i] === q.correctAnswer) catBreakdown[q.category].correct++;
      });
      const catEntries = Object.entries(catBreakdown).sort((a, b) =>
        (a[1].correct / a[1].total) - (b[1].correct / b[1].total)
      );

      // All-time accuracy per category (current progress state already includes this session)
      const allTime = progress;

      const drillMissed = () => {
        if (missedIds.length === 0) return;
        const pool = STUDY_DATA.questions
          .filter(q => missedIds.includes(q.id))
          .sort(() => Math.random() - 0.5);
        setDrillLabel(`Missed Review (${pool.length} q)`);
        setQuizState({
          questions: pool,
          currentIndex: 0,
          answers: new Array(pool.length).fill(null),
          isFinished: false,
          startTime: Date.now(),
          timeRemaining: 15 * 60,
        });
        setQuizType('drill');
      };

      return (
        <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">

          {/* Score + meta stats */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-slate-100 text-center mb-6">Results</h2>
            <div className="flex flex-col sm:flex-row items-center gap-8">
              {/* Circle */}
              <div className="relative w-36 h-36 shrink-0">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="72" cy="72" r="60" fill="transparent" stroke="currentColor" strokeWidth="10" className="text-slate-800" />
                  <circle cx="72" cy="72" r="60" fill="transparent" stroke="currentColor" strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 60}
                    strokeDashoffset={2 * Math.PI * 60 * (1 - percentage / 100)}
                    className={cn("transition-all duration-1000",
                      percentage >= 80 ? "text-emerald-500" : percentage >= 60 ? "text-yellow-500" : "text-red-500"
                    )}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-slate-100">{percentage}%</span>
                  <span className="text-xs text-slate-500 font-mono">{score}/{quizState.questions.length}</span>
                </div>
              </div>
              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3 w-full text-center">
                <div className="bg-slate-800/60 rounded-lg p-3">
                  <div className="text-2xl font-bold text-emerald-400">{score}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">Correct</div>
                </div>
                <div className="bg-slate-800/60 rounded-lg p-3">
                  <div className="text-2xl font-bold text-red-400">{missedIds.length}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">Missed</div>
                </div>
                <div className="bg-slate-800/60 rounded-lg p-3">
                  <div className="text-2xl font-bold text-slate-300">{skipped}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">Skipped</div>
                </div>
                <div className="bg-slate-800/60 rounded-lg p-3">
                  <div className="text-lg font-bold text-blue-400 font-mono">{formatTime(elapsed)}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">Time Taken</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-6">
              <Button variant="secondary" onClick={() => setQuizType(null)}>Menu</Button>
              <Button variant="outline" onClick={() => startQuiz(quizType!)}>Retake</Button>
              <Button
                variant="danger"
                disabled={missedIds.length === 0}
                onClick={drillMissed}
              >
                Drill Missed
              </Button>
            </div>
          </Card>

          {/* Category breakdown with all-time delta */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-100 mb-1">Performance by Category</h3>
            <p className="text-xs text-slate-500 mb-4">Session score vs your all-time average</p>
            <div className="space-y-4">
              {catEntries.map(([cat, data]) => {
                const sessionPct = Math.round((data.correct / data.total) * 100);
                const allTimeData = allTime[cat];
                const allTimePct = allTimeData && allTimeData.total > 0
                  ? Math.round((allTimeData.correct / allTimeData.total) * 100)
                  : null;
                const delta = allTimePct !== null ? sessionPct - allTimePct : null;
                return (
                  <div key={cat}>
                    <div className="flex justify-between items-center mb-1 gap-2">
                      <span className="text-sm text-slate-300 truncate">{cat}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        {delta !== null && (
                          <span className={cn("text-[10px] font-mono font-bold px-1.5 py-0.5 rounded",
                            delta > 0 ? "text-emerald-400 bg-emerald-500/10" :
                            delta < 0 ? "text-red-400 bg-red-500/10" :
                            "text-slate-500 bg-slate-800"
                          )}>
                            {delta > 0 ? `+${delta}` : delta}% vs avg
                          </span>
                        )}
                        <span className={cn("text-xs font-mono font-bold",
                          sessionPct >= 80 ? "text-emerald-400" : sessionPct >= 60 ? "text-yellow-400" : "text-red-400"
                        )}>{sessionPct}% · {data.correct}/{data.total}</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-700",
                          sessionPct >= 80 ? "bg-emerald-500" : sessionPct >= 60 ? "bg-yellow-500" : "bg-red-500"
                        )}
                        style={{ width: `${sessionPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-3 gap-3 text-center text-xs text-slate-500">
              <div><span className="block text-emerald-400 font-bold text-sm">{catEntries.filter(([,d]) => d.correct/d.total >= 0.8).length}</span>Strong</div>
              <div><span className="block text-yellow-400 font-bold text-sm">{catEntries.filter(([,d]) => { const p = d.correct/d.total; return p >= 0.6 && p < 0.8; }).length}</span>Review</div>
              <div><span className="block text-red-400 font-bold text-sm">{catEntries.filter(([,d]) => d.correct/d.total < 0.6).length}</span>Weak</div>
            </div>
          </Card>

          {/* Missed questions */}
          {missedIds.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-100">
                  Missed Questions <span className="text-red-400 font-mono text-sm ml-2">{missedIds.length}</span>
                </h3>
                <Button size="sm" variant="danger" onClick={drillMissed}>
                  <RotateCcw className="w-3 h-3" /> Drill These
                </Button>
              </div>
              {quizState.questions.map((q, idx) => {
                if (quizState.answers[idx] === q.correctAnswer) return null;
                const wasSkipped = quizState.answers[idx] === null;
                return (
                  <Card key={q.id} className={cn("p-5 border-l-4", wasSkipped ? "border-l-slate-600" : "border-l-red-500")}>
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="text-[9px]">{q.category}</Badge>
                          {wasSkipped && <Badge className="text-[9px] text-slate-400 border-slate-600">Skipped</Badge>}
                        </div>
                        <p className="text-slate-200 font-medium text-sm">{idx + 1}. {q.question}</p>
                      </div>
                      {wasSkipped ? <AlertCircle className="w-5 h-5 text-slate-500 shrink-0" /> : <XCircle className="w-5 h-5 text-red-500 shrink-0" />}
                    </div>
                    <div className="space-y-1.5 mb-3">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className={cn(
                          "px-3 py-2 rounded text-sm",
                          optIdx === q.correctAnswer
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : optIdx === quizState.answers[idx]
                              ? "bg-red-500/10 text-red-400 border border-red-500/20"
                              : "bg-slate-800/40 text-slate-500"
                        )}>
                          {optIdx === q.correctAnswer && <span className="font-bold mr-1">✓</span>}
                          {optIdx === quizState.answers[idx] && optIdx !== q.correctAnswer && <span className="font-bold mr-1">✗</span>}
                          {opt}
                        </div>
                      ))}
                    </div>
                    <div className="p-3 bg-slate-800/50 rounded text-xs text-slate-400">
                      <span className="font-bold text-slate-300 block mb-0.5">Explanation</span>
                      {q.explanation}
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-6 text-center border-emerald-500/20">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-emerald-400 font-bold">Perfect score — no missed questions!</p>
            </Card>
          )}
        </div>
      );
    }

    const currentQuestion = quizState!.questions[quizState!.currentIndex];
    const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

    return (
      <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
        <div className="flex items-center justify-between bg-slate-900 p-4 rounded-lg border border-slate-800 sticky top-4 z-10 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="text-slate-400 text-sm font-mono">Q {quizState!.currentIndex + 1}/{quizState!.questions.length}</div>
            {drillLabel && <Badge className="text-yellow-400 border-yellow-500/30 bg-yellow-500/10 hidden sm:inline">{drillLabel}</Badge>}
            <Progress value={quizState!.currentIndex + 1} max={quizState!.questions.length} className="w-32 hidden sm:block" />
          </div>
          <div className={cn("flex items-center gap-2 font-mono font-bold px-3 py-1 rounded",
            quizState!.timeRemaining < 60 ? "text-red-500 animate-pulse" : "text-blue-400"
          )}>
            <Clock className="w-4 h-4" />
            {formatTime(quizState!.timeRemaining)}
          </div>
          <Button variant="ghost" size="sm" onClick={() => setQuizType(null)}>Exit</Button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={quizState!.currentIndex} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
            <Card className="p-8 space-y-8">
              <div className="space-y-3">
                <Badge>{currentQuestion.category}</Badge>
                <h3 className="text-xl font-bold text-slate-100 leading-snug">{currentQuestion.question}</h3>
              </div>
              <div className="grid gap-3">
                {currentQuestion.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className={cn(
                      "w-full text-left p-4 rounded-lg border transition-all duration-200 flex items-center gap-4 group",
                      quizState!.answers[quizState!.currentIndex] === idx
                        ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20"
                        : "bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-800"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0",
                      quizState!.answers[quizState!.currentIndex] === idx ? "bg-white/20 text-white" : "bg-slate-700 text-slate-400 group-hover:bg-slate-600"
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
          <Button variant="secondary" disabled={quizState!.currentIndex === 0}
            onClick={() => setQuizState({ ...quizState!, currentIndex: quizState!.currentIndex - 1 })}>
            <ChevronLeft /> Previous
          </Button>
          {quizState!.currentIndex === quizState!.questions.length - 1 ? (
            <Button variant="primary" onClick={finishQuiz} className="bg-emerald-600 hover:bg-emerald-500">Finish</Button>
          ) : (
            <Button variant="primary" onClick={() => setQuizState({ ...quizState!, currentIndex: quizState!.currentIndex + 1 })}>
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

  const CHEAT_SECTIONS = [
    { id: 'sec1', label: 'Security Fundamentals', color: 'text-blue-400', items: 15 },
    { id: 'sec2', label: 'Cyber Threats & Vulnerabilities', color: 'text-red-400', items: 20 },
    { id: 'sec3', label: 'Security & Design', color: 'text-purple-400', items: 20 },
    { id: 'sec4', label: 'Network & Data Security', color: 'text-emerald-400', items: 15 },
    { id: 'sec5', label: 'Security Operations & Management', color: 'text-yellow-400', items: 10 },
    { id: 'sec6', label: 'Security Protocols & Threat Mitigation', color: 'text-cyan-400', items: 20 },
  ];

  const CheatSheetView = () => (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-12">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-100">Reference Sheet</h2>
        <p className="text-slate-400">All 6 knowledge areas — 2025-2026 FBLA guidelines.</p>
      </div>

      {/* Table of Contents */}
      <Card className="p-6 bg-slate-800/30">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Table of Contents</h3>
        <ol className="space-y-2">
          {CHEAT_SECTIONS.map((s, i) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className={cn("flex items-center justify-between group hover:text-slate-100 transition-colors", s.color)}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                <span className="font-medium">{i + 1}. {s.label}</span>
                <span className="text-xs text-slate-600 group-hover:text-slate-400 font-mono">{s.items} items</span>
              </a>
            </li>
          ))}
        </ol>
      </Card>

      <div className="grid gap-10">

        {/* ── 1. Security Fundamentals ── */}
        <section id="sec1" className="space-y-4 scroll-mt-20">
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
                  <li><span className="text-slate-200">Identity Proofing:</span> Verifying real-world identity before issuing credentials.</li>
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
        <section id="sec2" className="space-y-4 scroll-mt-20">
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
        <section id="sec3" className="space-y-4 scroll-mt-20">
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
        <section id="sec4" className="space-y-4 scroll-mt-20">
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
                <li><span className="text-emerald-400 font-bold">Shift Cipher:</span> General term for letter-shifting encryption.</li>
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
                <li><span className="text-emerald-400 font-bold">MAC</span> — Mandatory. OS enforces labels (Top Secret etc.).</li>
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
                  <li><span className="text-slate-200">Blockchain:</span> Distributed immutable ledger. Each block contains previous block's hash → tamper-evident.</li>
                  <li><span className="text-slate-200">Hashing for integrity:</span> Store hash of file; recompute later to detect changes.</li>
                </ul>
              </div>
            </Card>
          </div>
        </section>

        {/* ── 5. Security Operations and Management ── */}
        <section id="sec5" className="space-y-4 scroll-mt-20">
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
                <li><span className="text-yellow-400 font-bold">Stateful:</span> Tracks connection state.</li>
                <li><span className="text-yellow-400 font-bold">NGFW:</span> Deep Packet Inspection + app awareness + IDS/IPS.</li>
                <li><span className="text-yellow-400 font-bold">WAF:</span> Protects web apps. Defends against SQLi &amp; XSS.</li>
              </ul>
            </Card>
            <Card className="p-4 bg-slate-800/30">
              <h4 className="font-bold text-slate-200 mb-2">Firewall Rules &amp; ACLs</h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• Rules are processed top-down; first match wins.</li>
                <li>• ACL entries specify: source IP, dest IP, port, protocol, action.</li>
                <li>• <span className="text-slate-200">Implicit deny all</span> — everything not explicitly allowed is dropped.</li>
              </ul>
            </Card>
            <Card className="p-4 bg-slate-800/30">
              <h4 className="font-bold text-slate-200 mb-2">Change Management &amp; Email Security</h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li><span className="text-yellow-400 font-bold">Change Mgmt:</span> Request → Review → Approve → Test → Deploy → Document.</li>
                <li>Prevents unauthorized changes from introducing vulnerabilities.</li>
                <li><span className="text-yellow-400 font-bold">SPF/DKIM/DMARC:</span> Authenticate email senders; stop spoofing.</li>
              </ul>
            </Card>
          </div>
        </section>

        {/* ── 6. Security Protocols and Threat Mitigation ── */}
        <section id="sec6" className="space-y-4 scroll-mt-20">
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
                <li><span className="text-cyan-400 font-bold">IDS</span> — Monitors and <span className="text-slate-200">alerts</span>. Passive — does NOT block.</li>
                <li><span className="text-cyan-400 font-bold">IPS</span> — Sits inline; can <span className="text-slate-200">actively block</span> malicious traffic.</li>
              </ul>
            </Card>
            <Card className="p-4 bg-slate-800/30">
              <h4 className="font-bold text-slate-200 mb-2">Obfuscation Methods</h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li><span className="text-cyan-400 font-bold">Tokenization:</span> Sensitive data → non-sensitive token.</li>
                <li><span className="text-cyan-400 font-bold">Data Masking:</span> Real data → fake-but-realistic data.</li>
                <li><span className="text-cyan-400 font-bold">Steganography:</span> Hide a message inside a file (image, audio).</li>
                <li><span className="text-cyan-400 font-bold">Obfuscation:</span> Make code hard to read.</li>
              </ul>
            </Card>
            <Card className="p-4 bg-slate-800/30">
              <h4 className="font-bold text-slate-200 mb-2">Digital Certificates &amp; CA</h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li><span className="text-cyan-400 font-bold">CA</span> — Certificate Authority; trusted third party that signs certs.</li>
                <li><span className="text-cyan-400 font-bold">Digital Cert:</span> Binds public key to identity; signed by CA.</li>
                <li><span className="text-cyan-400 font-bold">PKI:</span> The overall system of CAs, certs, and policies.</li>
              </ul>
            </Card>
            <Card className="p-4 bg-slate-800/30 md:col-span-2">
              <h4 className="font-bold text-slate-200 mb-2">Pen Testing, Patches &amp; Passwords</h4>
              <div className="grid md:grid-cols-3 gap-4 text-xs text-slate-400">
                <ul className="space-y-1">
                  <li className="text-slate-200 font-bold mb-1">Pen Testing</li>
                  <li>• Black Box — no prior knowledge.</li>
                  <li>• White Box — full knowledge.</li>
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

      </div>
    </div>
  );

  // --- Layout ---

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
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
    </div>
  );
}
