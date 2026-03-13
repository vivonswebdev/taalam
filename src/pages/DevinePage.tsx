import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IslamicGuesser, Question, Answer } from '@/utils/islamic-guesser';
import { IslamicPersonality, ISLAMIC_PERSONALITIES } from '@/data/islamic-personalities';
import { RotateCcw } from 'lucide-react';

type GameState = 'intro' | 'thinking' | 'playing' | 'guessing' | 'result' | 'failed';

const CATEGORY_LABELS: Record<string, string> = {
  prophet: '🌙 Prophète',
  caliph: '👑 Calife',
  sahabi: '⚔️ Compagnon',
  companion_female: '💐 Compagne',
  imam: '📚 Imam',
  scholar: '🔬 Savant',
};

export default function DevinePage() {
  const [gameState, setGameState] = useState<GameState>('intro');
  const [guesser, setGuesser] = useState<IslamicGuesser | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentGuess, setCurrentGuess] = useState<IslamicPersonality | null>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [pendingAnswer, setPendingAnswer] = useState<{ q: Question; a: Answer } | null>(null);

  const startGame = useCallback(() => {
    const g = new IslamicGuesser();
    const firstQ = g.getNextQuestion();
    setGuesser(g);
    setCurrentQuestion(firstQ);
    setQuestionCount(1);
    setCurrentGuess(null);
    setIsCorrect(null);
    setPendingAnswer(null);
    setGameState('playing');
  }, []);

  // Process answer after "thinking" animation
  useEffect(() => {
    if (gameState !== 'thinking' || !pendingAnswer || !guesser) return;

    const timer = setTimeout(() => {
      guesser.applyAnswer(pendingAnswer.q, pendingAnswer.a);
      setPendingAnswer(null);

      if (guesser.canGuess() || questionCount >= 20) {
        setCurrentGuess(guesser.getBestGuess());
        setGameState('guessing');
      } else if (guesser.getRemainingCount() === 0) {
        setGameState('failed');
      } else {
        const next = guesser.getNextQuestion();
        if (next) {
          setCurrentQuestion(next);
          setQuestionCount(q => q + 1);
          setGameState('playing');
        } else {
          setCurrentGuess(guesser.getBestGuess());
          setGameState('guessing');
        }
      }
    }, 900);

    return () => clearTimeout(timer);
  }, [gameState, pendingAnswer, guesser, questionCount]);

  // Victory confetti
  useEffect(() => {
    if (gameState === 'result' && isCorrect && typeof window !== 'undefined') {
      import('canvas-confetti').then(({ default: confetti }) => {
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.4 },
          colors: ['#10b981','#f59e0b','#8b5cf6','#ffffff'] });
        setTimeout(() => {
          confetti({ particleCount: 80, angle: 60, spread: 55,
            origin: { x: 0 }, colors: ['#10b981','#f59e0b'] });
          confetti({ particleCount: 80, angle: 120, spread: 55,
            origin: { x: 1 }, colors: ['#10b981','#f59e0b'] });
        }, 400);
      });
    }
  }, [gameState, isCorrect]);

  const handleAnswer = useCallback((answer: Answer) => {
    if (!guesser || !currentQuestion) return;
    setPendingAnswer({ q: currentQuestion, a: answer });
    setGameState('thinking');
  }, [guesser, currentQuestion]);

  const confirmGuess = useCallback((correct: boolean) => {
    setIsCorrect(correct);
    setGameState('result');
  }, []);

  const confidence = guesser?.getConfidence() ?? 0;
  const remaining = guesser?.getRemainingCount() ?? 0;
  const eliminated = guesser?.getEliminatedCount() ?? 0;

  const ANSWERS = [
    { value: 'yes' as Answer, label: 'Oui', emoji: '✅', color: 'bg-emerald-500 hover:bg-emerald-400' },
    { value: 'no' as Answer, label: 'Non', emoji: '❌', color: 'bg-red-500 hover:bg-red-400' },
    { value: 'maybe' as Answer, label: 'Peut-être', emoji: '🤔', color: 'bg-amber-500 hover:bg-amber-400' },
    { value: 'dontknow' as Answer, label: 'Je ne sais pas', emoji: '❓', color: 'bg-slate-500 hover:bg-slate-400' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 text-white px-4 pb-28 pt-6">
      <AnimatePresence mode="wait">

        {/* ══════ INTRO ══════ */}
        {gameState === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-6 pt-4">


            <h1 className="text-4xl font-black bg-gradient-to-r from-amber-300 to-yellow-500 bg-clip-text text-transparent font-arabic">
              كاشف
            </h1>
            <p className="text-xl font-bold text-white/80">Kashif</p>
            <p className="text-white/50 text-sm text-center">
              Je devine ta personnalité islamique ☪️
            </p>

            {/* How to play */}
            <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
              <p className="text-sm font-bold text-amber-300">Comment jouer ?</p>
              {[
                { n: '1', icon: '🧠', t: 'Pense à une personnalité islamique' },
                { n: '2', icon: '❓', t: 'Réponds à mes questions par Oui / Non' },
                { n: '3', icon: '🕌', t: 'Je vais deviner en moins de 20 questions !' },
              ].map(item => (
                <div key={item.n} className="flex items-center gap-3 text-sm text-white/80">
                  <span className="w-6 h-6 rounded-full bg-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center">
                    {item.n}
                  </span>
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.t}</span>
                </div>
              ))}
            </div>

            {/* Categories */}
            <div className="grid grid-cols-3 gap-2 w-full max-w-sm">
              {[
                { e: '🌙', l: 'Prophètes', c: '8' },
                { e: '⚔️', l: 'Compagnons', c: '10+' },
                { e: '📚', l: 'Savants', c: '8+' },
                { e: '💐', l: 'Femmes', c: '5+' },
                { e: '👑', l: 'Califes', c: '4' },
                { e: '🔬', l: 'Autres', c: '5+' },
              ].map(cat => (
                <div key={cat.l} className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-xl">{cat.e}</span>
                  <span className="text-[11px] text-white/70">{cat.l}</span>
                  <span className="text-[10px] text-amber-400">{cat.c}</span>
                </div>
              ))}
            </div>

            <motion.button onClick={startGame} whileTap={{ scale: 0.95 }}
              className="w-full max-w-sm py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-600 font-bold text-lg shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2">
              <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                🌙
              </motion.span>
              Commencer
            </motion.button>

            <p className="text-white/30 text-xs">
              {ISLAMIC_PERSONALITIES?.length ?? 30}+ personnalités islamiques
            </p>
          </motion.div>
        )}

        {/* ══════ THINKING ══════ */}
        {gameState === 'thinking' && (
          <motion.div key="thinking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center gap-6 pt-32">
            <motion.span className="text-8xl" animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}>
              🕌
            </motion.span>
            <div className="flex gap-1.5">
              {[0, 1, 2].map(i => (
                <motion.div key={i} className="w-2.5 h-2.5 rounded-full bg-amber-400"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                />
              ))}
            </div>
            <p className="text-white/60 text-sm font-semibold">Kashif réfléchit...</p>
          </motion.div>
        )}

        {/* ══════ QUESTION ══════ */}
        {gameState === 'playing' && currentQuestion && guesser && (
          <motion.div key={currentQuestion.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}
            className="flex flex-col gap-5 pt-2">

            {/* Stats header */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold text-white/90">Question {questionCount} / 20</span>
                <span className="text-[11px] text-white/50">🗑️ {eliminated} éliminés · 🎯 {remaining} restants</span>
              </div>
              <div className="h-2 w-24 rounded-full bg-white/10 overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full"
                  animate={{ width: `${Math.min((questionCount / 20) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Confidence Kashif */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">
                  {confidence >= 80 ? '😈' :
                   confidence >= 60 ? '😏' :
                   confidence >= 40 ? '🤔' :
                   confidence >= 20 ? '🧐' : '🌙'}
                </span>
                <span className="text-xs text-white/70">
                  {confidence >= 80 ? "Je suis presque certain !" :
                   confidence >= 60 ? "Je me rapproche..." :
                   confidence >= 40 ? "Je réfléchis..." :
                   confidence >= 20 ? "Je commence à chercher" : "Dis-moi tout 🙏"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2.5 rounded-full bg-white/10 overflow-hidden">
                  <motion.div className="h-full rounded-full"
                    style={{
                      background: confidence >= 70 ? 'linear-gradient(90deg,#10b981,#34d399)'
                        : confidence >= 40 ? 'linear-gradient(90deg,#f59e0b,#fbbf24)'
                        : 'linear-gradient(90deg,#ef4444,#f87171)',
                    }}
                    animate={{ width: `${confidence}%` }}
                  />
                </div>
                <span className={`text-xs font-bold ${
                  confidence >= 70 ? 'text-emerald-400' :
                  confidence >= 40 ? 'text-amber-400' : 'text-red-400'
                }`}>{confidence}%</span>
              </div>
            </div>

            {/* Question card */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center gap-4">
              <span className="text-5xl">❓</span>
              <p className="text-lg font-bold text-center leading-relaxed">
                {currentQuestion.text}
              </p>
            </div>

            {/* Answer buttons */}
            <div className="grid grid-cols-2 gap-3">
              {ANSWERS.map(btn => (
                <motion.button key={btn.value} whileTap={{ scale: 0.93 }}
                  onClick={() => handleAnswer(btn.value)}
                  className={`${btn.color} rounded-2xl p-4 text-white font-bold text-lg transition-all shadow-lg`}>
                  {btn.emoji} {btn.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ══════ GUESSING ══════ */}
        {gameState === 'guessing' && currentGuess && (
          <motion.div key="guess" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }} className="flex flex-col items-center gap-5 pt-6">
            <motion.span className="text-6xl" animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8 }}>☪️</motion.span>

            <p className="text-white/50 text-sm">
              Après {questionCount} questions...
            </p>

            {/* Reveal card */}
            <motion.div initial={{ rotateY: 90 }} animate={{ rotateY: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white/5 border border-amber-400/30 rounded-3xl p-6 w-full max-w-xs flex flex-col items-center gap-3">
              <span className="text-6xl">{currentGuess.emoji}</span>
              <h2 className="text-xl font-extrabold text-center bg-gradient-to-r from-amber-300 to-yellow-500 bg-clip-text text-transparent">
                {currentGuess.name}
              </h2>
              <p className="text-lg font-bold text-white/70 font-arabic">
                {currentGuess.nameAr}
              </p>
              <div className="bg-white/5 rounded-xl p-3 w-full">
                <p className="text-xs text-amber-300 text-center">💡 {currentGuess.hint}</p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-white/60">
                {CATEGORY_LABELS[currentGuess.category]}
              </span>
            </motion.div>

            {/* Top 3 alternatives */}
            {guesser && guesser.getTopCandidates(3).length > 1 && (
              <div className="w-full max-w-xs">
                <p className="text-xs text-white/40 mb-2">Autres hypothèses</p>
                <div className="space-y-1.5">
                  {guesser.getTopCandidates(3).slice(1).map(({ personality, score }) => (
                    <div key={personality.id}
                      className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
                      <span>{personality.emoji}</span>
                      <span className="flex-1 text-xs text-white/60 truncate">
                        {personality.name.split(' ').slice(0, 2).join(' ')}
                      </span>
                      <span className="text-[10px] text-amber-400 font-bold">
                        {Math.round(score * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-white/70 font-semibold text-sm">C'est bien cette personnalité ?</p>

            <div className="flex gap-4">
              <motion.button whileTap={{ scale: 0.93 }} onClick={() => confirmGuess(true)}
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 rounded-2xl text-white font-bold text-xl shadow-lg">
                ✅ Oui, bravo !
              </motion.button>
              <motion.button whileTap={{ scale: 0.93 }} onClick={() => confirmGuess(false)}
                className="px-8 py-4 bg-red-500 hover:bg-red-400 rounded-2xl text-white font-bold text-xl shadow-lg">
                ❌ Non !
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ══════ RESULT ══════ */}
        {gameState === 'result' && currentGuess && (
          <motion.div key="result" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-5 pt-8">
            {isCorrect ? (
              <>
                <motion.span className="text-7xl" animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.5 }}>🏆</motion.span>
                <h2 className="text-2xl font-extrabold text-center bg-gradient-to-r from-amber-300 to-yellow-500 bg-clip-text text-transparent">
                  J'ai trouvé ! 🎉
                </h2>
                <p className="text-white/60">en {questionCount} questions</p>
              </>
            ) : (
              <>
                <span className="text-7xl">😅</span>
                <h2 className="text-2xl font-extrabold text-center text-red-400">Je me suis trompé !</h2>
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
              <div className="bg-white/5 rounded-xl p-3 w-full">
                <p className="text-xs text-amber-300 text-center">✨ {currentGuess.funFact}</p>
              </div>
            </div>

            <motion.button whileTap={{ scale: 0.93 }} onClick={startGame}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-600 font-bold shadow-lg">
              <RotateCcw className="w-5 h-5" /> Rejouer
            </motion.button>
          </motion.div>
        )}

        {/* ══════ FAILED ══════ */}
        {gameState === 'failed' && (
          <motion.div key="failed" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-5 pt-12">
            <span className="text-7xl">🤷</span>
            <h2 className="text-2xl font-extrabold text-red-400">Personnalité inconnue !</h2>
            <p className="text-white/60 text-center text-sm max-w-xs">
              Cette personnalité est trop rare pour ma base de données actuelle.
              Je vais apprendre pour la prochaine fois !
            </p>
            <motion.button whileTap={{ scale: 0.93 }} onClick={startGame}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-600 font-bold shadow-lg">
              🔄 Réessayer
            </motion.button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
