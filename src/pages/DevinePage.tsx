import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { IslamicPersonality } from '@/data/islamic-personalities';
import { IslamicGuesser, type Question, type Answer } from '@/utils/islamic-guesser';

type GameState = 'intro' | 'playing' | 'guessing' | 'result' | 'failed';

const ANSWER_BUTTONS: { value: Answer; label: string; emoji: string; cls: string }[] = [
  { value: 'yes', label: 'Oui', emoji: '✅', cls: 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700' },
  { value: 'no', label: 'Non', emoji: '❌', cls: 'bg-red-600 hover:bg-red-500 active:bg-red-700' },
  { value: 'maybe', label: 'Peut-être', emoji: '🤔', cls: 'bg-amber-600 hover:bg-amber-500 active:bg-amber-700' },
  { value: 'dontknow', label: 'Je ne sais pas', emoji: '❓', cls: 'bg-slate-600 hover:bg-slate-500 active:bg-slate-700' },
];

const CATEGORIES = [
  { emoji: '🌙', label: 'Prophètes' },
  { emoji: '⚔️', label: 'Compagnons' },
  { emoji: '📚', label: 'Savants' },
  { emoji: '💐', label: 'Femmes' },
  { emoji: '👑', label: 'Califes' },
  { emoji: '🌍', label: 'Explorateurs' },
];

const MAX_QUESTIONS = 20;

export default function DevinePage() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>('intro');
  const [guesser, setGuesser] = useState<IslamicGuesser | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentGuess, setCurrentGuess] = useState<IslamicPersonality | null>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const startGame = useCallback(() => {
    const g = new IslamicGuesser();
    const first = g.getNextQuestion();
    setGuesser(g);
    setCurrentQuestion(first);
    setQuestionCount(1);
    setCurrentGuess(null);
    setIsCorrect(null);
    setGameState('playing');
  }, []);

  const handleAnswer = useCallback((answer: Answer) => {
    if (!guesser || !currentQuestion) return;
    guesser.applyAnswer(currentQuestion, answer);

    if (guesser.getRemainingCount() === 0) {
      setCurrentGuess(guesser.getBestGuess());
      setGameState('failed');
      return;
    }
    if (guesser.canGuess() || questionCount >= MAX_QUESTIONS) {
      setCurrentGuess(guesser.getBestGuess());
      setGameState('guessing');
      return;
    }
    const next = guesser.getNextQuestion();
    if (next) {
      setCurrentQuestion(next);
      setQuestionCount(prev => prev + 1);
    } else {
      setCurrentGuess(guesser.getBestGuess());
      setGameState('guessing');
    }
  }, [guesser, currentQuestion, questionCount]);

  const confirmGuess = useCallback((correct: boolean) => {
    setIsCorrect(correct);
    setGameState('result');
  }, []);

  const confidence = guesser?.getConfidence() ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 text-white">
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold">🕌 Kashif كاشف</h1>
      </div>

      <div className="px-4 pb-28">
        <AnimatePresence mode="wait">
          {/* ═══ INTRO ═══ */}
          {gameState === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center gap-6 pt-8">
              <div className="text-7xl animate-bounce">🕌</div>
              <h2 className="text-2xl font-extrabold text-center bg-gradient-to-r from-amber-300 to-yellow-500 bg-clip-text text-transparent">
                Kashif كاشف
              </h2>
              <p className="text-white/60 text-center text-sm">
                Devine la personnalité islamique
              </p>
              <p className="text-white/80 text-center text-sm max-w-xs">
                Pense à une personnalité islamique (prophète, compagnon, savant...) et je vais essayer de la deviner !
              </p>
              <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
                {CATEGORIES.map(c => (
                  <div key={c.label} className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-2xl">{c.emoji}</span>
                    <span className="text-[11px] text-white/70">{c.label}</span>
                  </div>
                ))}
              </div>
              <button onClick={startGame} className="w-full max-w-xs py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-600 font-bold text-lg shadow-lg shadow-amber-500/30 hover:scale-[1.02] active:scale-95 transition-transform">
                🎮 Commencer
              </button>
            </motion.div>
          )}

          {/* ═══ PLAYING ═══ */}
          {gameState === 'playing' && currentQuestion && guesser && (
            <motion.div key={currentQuestion.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }} className="flex flex-col gap-5 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="px-3 py-1 rounded-full bg-white/10 font-semibold">
                  Question {questionCount} / {MAX_QUESTIONS}
                </span>
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-semibold">
                  🎯 {guesser.getRemainingCount()} candidats
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${guesser.getProgress()}%` }}
                />
              </div>
              {/* Confidence indicator */}
              {confidence > 30 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-xs text-amber-300/80">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Confiance : {Math.round(confidence)}%</span>
                </motion.div>
              )}
              {/* Question card */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center gap-4">
                <span className="text-5xl">🤔</span>
                <p className="text-lg font-bold text-center leading-relaxed">
                  {currentQuestion.text}
                </p>
              </div>
              {/* Answer buttons */}
              <div className="grid grid-cols-2 gap-3">
                {ANSWER_BUTTONS.map(btn => (
                  <button
                    key={btn.value}
                    onClick={() => handleAnswer(btn.value)}
                    className={`${btn.cls} rounded-2xl p-4 text-white font-bold text-base transition-all shadow-lg active:scale-95`}
                  >
                    {btn.emoji} {btn.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ═══ GUESSING ═══ */}
          {gameState === 'guessing' && currentGuess && (
            <motion.div key="guess" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-5 pt-8">
              <motion.div className="text-8xl" animate={{ rotate: [0, -10, 10, -10, 0] }} transition={{ duration: 0.6 }}>
                {currentGuess.emoji}
              </motion.div>
              <p className="text-white/60 text-sm text-center">
                Après {questionCount} questions, je pense que tu penses à...
              </p>
              <h2 className="text-2xl font-extrabold text-center bg-gradient-to-r from-amber-300 to-yellow-500 bg-clip-text text-transparent">
                {currentGuess.name}
              </h2>
              <p className="text-xl font-bold text-white/80 font-arabic">{currentGuess.nameAr}</p>
              {/* Confidence badge */}
              <div className="px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-sm font-semibold">
                🎯 Confiance : {Math.round(confidence)}%
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 max-w-xs">
                <p className="text-sm text-amber-300 text-center">💡 {currentGuess.hint}</p>
              </div>
              <p className="text-white/70 font-semibold">Est-ce correct ?</p>
              <div className="flex gap-4">
                <button onClick={() => confirmGuess(true)} className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl text-white font-bold text-lg active:scale-95 transition-transform">
                  ✅ Oui !
                </button>
                <button onClick={() => confirmGuess(false)} className="px-8 py-4 bg-red-600 hover:bg-red-500 rounded-2xl text-white font-bold text-lg active:scale-95 transition-transform">
                  ❌ Non
                </button>
              </div>
            </motion.div>
          )}

          {/* ═══ RESULT ═══ */}
          {gameState === 'result' && currentGuess && (
            <motion.div key="result" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-5 pt-8">
              {isCorrect ? (
                <>
                  <motion.div className="text-7xl" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.5 }}>🏆</motion.div>
                  <h2 className="text-2xl font-extrabold text-center bg-gradient-to-r from-amber-300 to-yellow-500 bg-clip-text text-transparent">
                    Kashif a trouvé ! 🎉
                  </h2>
                  <p className="text-white/60">en seulement {questionCount} questions</p>
                </>
              ) : (
                <>
                  <div className="text-7xl">😅</div>
                  <h2 className="text-2xl font-extrabold text-center text-red-400">Kashif s'est trompé !</h2>
                  <p className="text-white/60 text-center text-sm">
                    Cette personnalité n'est pas encore dans ma base de données
                  </p>
                </>
              )}
              {/* Personality card */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-5 w-full max-w-xs flex flex-col items-center gap-3">
                <span className="text-5xl">{currentGuess.emoji}</span>
                <p className="font-bold text-center">{currentGuess.name}</p>
                <p className="text-white/70 font-arabic">{currentGuess.nameAr}</p>
                <p className="text-xs text-amber-300 text-center">✨ {currentGuess.funFact}</p>
              </div>
              <button onClick={startGame} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-600 font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-transform">
                <RotateCcw className="w-5 h-5" /> Rejouer
              </button>
            </motion.div>
          )}

          {/* ═══ FAILED ═══ */}
          {gameState === 'failed' && (
            <motion.div key="failed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-5 pt-12">
              <div className="text-7xl">🤷</div>
              <h2 className="text-2xl font-extrabold text-red-400">Kashif ne sait pas !</h2>
              <p className="text-white/60 text-center text-sm max-w-xs">
                Cette personnalité est trop rare ou pas encore dans ma base de données. Je vais apprendre !
              </p>
              <button onClick={startGame} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-600 font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-transform">
                <RotateCcw className="w-5 h-5" /> Réessayer
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
