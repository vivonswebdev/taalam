import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { ArrowLeft, Check, X, Scale, Star, RotateCcw, Heart, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import DifficultySelector from '@/components/DifficultySelector';

const BALANCE_DIFF: Record<string, { lives: number; timerSpeed: number; cardCount: number }> = {
  easy: { lives: 5, timerSpeed: 0.3, cardCount: 10 },
  medium: { lives: 3, timerSpeed: 0.5, cardCount: 15 },
  hard: { lives: 2, timerSpeed: 0.8, cardCount: 20 },
};

const ACTIONS_DB = [
  { id: 1, tKey: "bismillah", defaultText: "Dire Bismillah avant de manger", emoji: "🍽️", isGood: true },
  { id: 2, tKey: "mocking", defaultText: "Se moquer d'un camarade", emoji: "👇", isGood: false },
  { id: 3, tKey: "helping_mom", defaultText: "Aider maman à ranger", emoji: "🧹", isGood: true },
  { id: 4, tKey: "shouting", defaultText: "Crier quand on est en colère", emoji: "😡", isGood: false },
  { id: 5, tKey: "prayer", defaultText: "Faire sa prière à l'heure", emoji: "🕌", isGood: true },
  { id: 6, tKey: "lying", defaultText: "Mentir pour ne pas être puni", emoji: "🤥", isGood: false },
  { id: 7, tKey: "sharing", defaultText: "Partager son goûter", emoji: "🍪", isGood: true },
  { id: 8, tKey: "wasting_water", defaultText: "Gaspiller de l'eau aux ablutions", emoji: "🚰", isGood: false },
  { id: 9, tKey: "smiling", defaultText: "Sourire à son frère", emoji: "😊", isGood: true },
  { id: 10, tKey: "cheating", defaultText: "Tricher à un jeu", emoji: "🫣", isGood: false },
  { id: 11, tKey: "reading_quran", defaultText: "Lire un peu de Coran", emoji: "📖", isGood: true },
  { id: 12, tKey: "hitting_animal", defaultText: "Frapper un animal", emoji: "🐈", isGood: false },
  { id: 13, tKey: "disrespecting_parents", defaultText: "Répondre mal à ses parents", emoji: "🗣️", isGood: false },
  { id: 14, tKey: "alhamdulillah", defaultText: "Dire Alhamdoulillah après manger", emoji: "🤲", isGood: true },
  { id: 15, tKey: "hiding_truth", defaultText: "Cacher la vérité", emoji: "🤐", isGood: false },
  { id: 16, tKey: "charity", defaultText: "Donner un peu en aumône", emoji: "🪙", isGood: true },
  { id: 17, tKey: "littering", defaultText: "Laisser traîner ses déchets", emoji: "🗑️", isGood: false },
  { id: 18, tKey: "salam", defaultText: "Dire Assalamou Alaykoum", emoji: "👋", isGood: true },
  { id: 19, tKey: "sulking", defaultText: "Bouder quand on perd", emoji: "😤", isGood: false },
  { id: 20, tKey: "forgiving", defaultText: "Pardonner à un ami", emoji: "🤝", isGood: true },
];

export default function KidsBalancePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [cards, setCards] = useState([...ACTIONS_DB].sort(() => Math.random() - 0.5));
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(100);
  const [gameOver, setGameOver] = useState(false);
  const controls = useAnimation();

  const currentLevel = 1 + Math.floor(streak / 3);

  useEffect(() => {
    if (gameOver || cards.length === 0) return;
    const speedMultiplier = 1 + (streak * 0.25);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeout();
          return 0;
        }
        return prev - (0.5 * speedMultiplier);
      });
    }, 20);
    return () => clearInterval(timer);
  }, [cards, gameOver, streak]);

  const handleTimeout = async () => {
    setStreak(0);
    setLives(l => {
      const newLives = l - 1;
      if (newLives <= 0) setTimeout(() => setGameOver(true), 300);
      return newLives;
    });
    await controls.start({
      y: 400, opacity: 0, rotate: (Math.random() - 0.5) * 40,
      transition: { duration: 0.4 }
    });
    nextCard();
  };

  const nextCard = () => {
    setCards(prev => prev.slice(1));
    controls.set({ x: 0, y: 0, opacity: 1, rotate: 0 });
    setTimeLeft(100);
    if (cards.length === 1) {
      setTimeout(() => setGameOver(true), 300);
    }
  };

  const restartGame = () => {
    setCards([...ACTIONS_DB].sort(() => Math.random() - 0.5));
    setScore(0);
    setStreak(0);
    setLives(3);
    setTimeLeft(100);
    setGameOver(false);
  };

  const handleAction = async (isRightSwipe: boolean) => {
    if (cards.length === 0 || gameOver) return;
    const currentCard = cards[0];
    const isCorrect = isRightSwipe === currentCard.isGood;
    await controls.start({
      x: isRightSwipe ? 300 : -300, opacity: 0, rotate: isRightSwipe ? 15 : -15,
      transition: { duration: 0.3 }
    });
    if (isCorrect) {
      setScore(s => s + 10 + streak * 2);
      setStreak(s => s + 1);
    } else {
      setStreak(0);
      setLives(l => {
        const newLives = l - 1;
        if (newLives <= 0) setTimeout(() => setGameOver(true), 300);
        return newLives;
      });
    }
    nextCard();
  };

  const handleDragEnd = (_event: any, info: any) => {
    const swipeThreshold = 80;
    if (info.offset.x > swipeThreshold) {
      handleAction(true);
    } else if (info.offset.x < -swipeThreshold) {
      handleAction(false);
    } else {
      controls.start({ x: 0, opacity: 1, rotate: 0 });
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto h-[100dvh] bg-gradient-to-b from-teal-900 via-cyan-900 to-blue-900 font-sans overflow-hidden relative selection:bg-transparent">
      {/* HUD */}
      <div className="flex justify-between items-center w-full mt-8 px-6 z-10">
        <button onClick={() => navigate(-1)} className="p-3 bg-white/10 backdrop-blur-md rounded-2xl shadow-sm text-white hover:bg-white/20 active:scale-95 transition-all">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-3 ml-auto">
          <div className="flex gap-1 mr-1">
            {[...Array(3)].map((_, i) => (
              <Heart key={i} className={`w-5 h-5 transition-all ${i < lives ? 'text-rose-500 fill-rose-500 drop-shadow-md' : 'text-white/20'}`} />
            ))}
          </div>
          <AnimatePresence>
            {streak > 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="bg-orange-500 text-white px-3 py-1.5 rounded-full font-black text-xs flex items-center gap-1 shadow-[0_0_15px_rgba(249,115,22,0.5)]"
              >
                🔥 x{streak}
              </motion.div>
            )}
          </AnimatePresence>
          <div className="bg-emerald-400 text-emerald-950 px-4 py-1.5 rounded-2xl font-black shadow-sm flex items-center gap-1 text-sm">
            <Star className="w-4 h-4 fill-emerald-950" /> {score}
          </div>
        </div>
      </div>

      {/* Title & Instructions */}
      {!gameOver && (
        <div className="text-center mt-4 z-10 px-4 w-full">
          <div className="flex justify-center items-center gap-2 mb-1">
            <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <Scale className="w-7 h-7 text-cyan-300" /> {t("balanceGame.title" as any)}
            </h2>
            <span className="bg-cyan-500/30 text-cyan-100 text-xs font-bold px-2 py-1 rounded-lg border border-cyan-400/30 flex items-center gap-1">
              <Zap className="w-3 h-3 text-yellow-300 fill-yellow-300" /> Lvl {currentLevel}
            </span>
          </div>
          <p className="text-white/70 text-sm mt-1 font-medium mb-4 min-h-[40px]">
            {t("balanceGame.subtitle" as any)}
          </p>
          <div className="w-full max-w-[70%] mx-auto bg-white/10 h-3 rounded-full overflow-hidden backdrop-blur-sm border border-white/10 p-0.5 shadow-inner">
            <motion.div
              className={`h-full rounded-full shadow-md ${timeLeft > 50 ? 'bg-emerald-400' : timeLeft > 25 ? 'bg-amber-400' : 'bg-rose-500'}`}
              style={{ width: `${timeLeft}%` }}
              transition={{ ease: "linear", duration: 0.05 }}
            />
          </div>
        </div>
      )}

      {/* Card stack */}
      <div className="flex-1 w-full relative flex items-center justify-center z-20 mt-2" style={{ perspective: 1000 }}>
        {!gameOver && cards.length > 0 && (
          <div className="relative w-[80%] aspect-[3/4] max-h-[400px]">
            {cards.length > 1 && (
              <div className="absolute inset-0 bg-white/50 rounded-[2.5rem] scale-95 translate-y-4 -z-10 shadow-lg" />
            )}
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
              animate={controls}
              whileDrag={{ scale: 1.05, cursor: "grabbing" }}
              className="absolute inset-0 bg-white rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center p-8 text-center cursor-grab border-4 border-white/50 backdrop-blur-xl"
            >
              <motion.div
                className="absolute inset-0 rounded-[2.2rem] bg-rose-500/20 pointer-events-none"
                animate={{ opacity: timeLeft < 25 ? [0, 1, 0] : 0 }}
                transition={{ repeat: Infinity, duration: 0.5 }}
              />
              <span className="text-8xl mb-8 filter drop-shadow-xl select-none z-10">{cards[0].emoji}</span>
              <h3 className="text-2xl font-black text-slate-800 leading-snug z-10">
                {t(`balanceGame.actions.${cards[0].tKey}` as any)}
              </h3>
              <div className="absolute inset-x-0 bottom-6 flex justify-between px-8 opacity-30 pointer-events-none z-10">
                <X className="w-10 h-10 text-rose-500" />
                <Check className="w-10 h-10 text-emerald-500" />
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Controls */}
      {!gameOver && (
        <div className="w-full px-8 pb-12 flex justify-center gap-8 z-20">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => handleAction(false)}
            className="w-20 h-20 bg-rose-500 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(244,63,94,0.4)] border-4 border-rose-400/50"
          >
            <X className="w-10 h-10 text-white" strokeWidth={3} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => handleAction(true)}
            className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(16,185,129,0.4)] border-4 border-emerald-400/50"
          >
            <Check className="w-10 h-10 text-white" strokeWidth={3} />
          </motion.button>
        </div>
      )}

      {/* Game Over */}
      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-6"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white p-8 rounded-[2.5rem] text-center shadow-2xl max-w-sm w-full border border-slate-100"
            >
              <div className="w-24 h-24 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Scale className="w-12 h-12 text-cyan-500" />
              </div>
              <h2 className="text-3xl font-black mb-2 text-slate-800 tracking-tight">
                {cards.length <= 1 && lives > 0 ? t("balanceGame.victory" as any) : t("balanceGame.defeat" as any)}
              </h2>
              <p className="text-slate-500 mb-6 font-medium px-4">
                {cards.length <= 1 && lives > 0
                  ? t("balanceGame.victoryDesc" as any)
                  : t("balanceGame.defeatDesc" as any)}
              </p>
              <div className="bg-emerald-50 text-emerald-600 font-black text-2xl py-4 rounded-3xl mb-8 border border-emerald-100 flex justify-center items-center gap-2">
                <Star className="w-6 h-6 fill-emerald-500" /> {t("balanceGame.score" as any)} {score}
              </div>
              <button
                onClick={restartGame}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-black text-lg py-5 rounded-[1.5rem] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_10px_30px_rgba(6,182,212,0.3)]"
              >
                <RotateCcw className="w-6 h-6" /> {t("balanceGame.replay" as any)}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
