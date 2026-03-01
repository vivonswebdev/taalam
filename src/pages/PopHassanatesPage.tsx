import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Heart, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';

const GOOD_ITEMS = ['🕋', '📖', '🕌', '🌙', '📿', '🤲', '⭐'];
const BAD_ITEMS = ['👾', '😡', '🔥'];

interface DifficultyConfig {
  badChance: number;
  spawnInterval: number;
  minDuration: number;
  maxDuration: number;
  xpMultiplier: number;
}

const DIFFICULTIES: Record<string, DifficultyConfig> = {
  easy:   { badChance: 0.15, spawnInterval: 1600, minDuration: 4.5, maxDuration: 6.5, xpMultiplier: 1 },
  medium: { badChance: 0.25, spawnInterval: 1200, minDuration: 3.5, maxDuration: 6.0, xpMultiplier: 1.5 },
  hard:   { badChance: 0.40, spawnInterval: 800,  minDuration: 2.5, maxDuration: 4.5, xpMultiplier: 2 },
};

export default function PopHassanatesPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [bubbles, setBubbles] = useState<Array<{ id: number; emoji: string; isGood: boolean; x: number; duration: number }>>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const config = difficulty ? DIFFICULTIES[difficulty] : null;

  const startGame = (diff?: string) => {
    const d = diff || difficulty;
    if (!d) return;
    setDifficulty(d);
    setScore(0);
    setLives(3);
    setGameOver(false);
    setBubbles([]);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (!isPlaying || gameOver || !config) return;
    const interval = setInterval(() => {
      const isGood = Math.random() > config.badChance;
      const emoji = isGood
        ? GOOD_ITEMS[Math.floor(Math.random() * GOOD_ITEMS.length)]
        : BAD_ITEMS[Math.floor(Math.random() * BAD_ITEMS.length)];
      const newBubble = {
        id: Date.now() + Math.random(),
        emoji,
        isGood,
        x: Math.random() * 70 + 15,
        duration: Math.random() * (config.maxDuration - config.minDuration) + config.minDuration,
      };
      setBubbles(prev => [...prev, newBubble]);
    }, config.spawnInterval);
    return () => clearInterval(interval);
  }, [isPlaying, gameOver, config]);

  useEffect(() => {
    if (lives <= 0) {
      setGameOver(true);
      setIsPlaying(false);
    }
  }, [lives]);

  const handleBubbleClick = (bubble: typeof bubbles[0]) => {
    if (gameOver) return;
    setBubbles(prev => prev.filter(b => b.id !== bubble.id));
    if (bubble.isGood) {
      setScore(s => s + 10);
    } else {
      setLives(l => Math.max(0, l - 1));
    }
  };

  const handleBubbleMiss = (bubble: typeof bubbles[0]) => {
    setBubbles(prev => prev.filter(b => b.id !== bubble.id));
    if (bubble.isGood && !gameOver && isPlaying) {
      setLives(l => Math.max(0, l - 1));
    }
  };

  // Difficulty selection screen
  if (!difficulty) {
    return (
      <div className="flex flex-col items-center w-full max-w-md mx-auto h-[100dvh] p-4 bg-gradient-to-b from-indigo-900 via-purple-900 to-background font-sans overflow-hidden relative">
        <div className="flex items-center w-full mt-8 z-10 relative">
          <button onClick={() => navigate(-1)} className="p-2 bg-white/20 backdrop-blur-md rounded-full shadow-sm text-white hover:bg-white/30 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-base font-bold text-white ml-3 flex items-center gap-1.5">
            <span>🫧</span> {t("popHassanates.title" as any)}
          </h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 pb-20">
          <span className="text-6xl">🫧</span>
          <h2 className="text-lg font-bold text-white">{t("popHassanates.chooseDifficulty" as any)}</h2>
          <div className="w-full max-w-xs space-y-3">
            {(["easy", "medium", "hard"] as const).map((d) => {
              const emoji = d === "easy" ? "🌱" : d === "medium" ? "🌿" : "🔥";
              const desc = d === "easy" ? t("popHassanates.easyDesc" as any) : d === "medium" ? t("popHassanates.mediumDesc" as any) : t("popHassanates.hardDesc" as any);
              return (
                <motion.button key={d} whileTap={{ scale: 0.96 }}
                  onClick={() => startGame(d)}
                  className="w-full flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-4 active:bg-white/20 transition-colors">
                  <span className="text-2xl">{emoji}</span>
                  <div className="text-left flex-1">
                    <p className="text-sm font-bold text-white">{t(`popHassanates.${d}` as any)}</p>
                    <p className="text-[10px] text-white/60">{desc}</p>
                  </div>
                  <span className="text-xs text-emerald-400 font-bold">×{DIFFICULTIES[d].xpMultiplier}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto h-[100dvh] p-4 bg-gradient-to-b from-indigo-900 via-purple-900 to-background font-sans overflow-hidden relative">
      {/* Header (HUD) */}
      <div className="flex justify-between items-center w-full mt-8 z-10 relative">
        <button
          onClick={() => { setDifficulty(null); setIsPlaying(false); setGameOver(false); }}
          className="p-2 bg-white/20 backdrop-blur-md rounded-full shadow-sm text-white hover:bg-white/30 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex gap-1 ml-auto mr-4">
          {[...Array(3)].map((_, i) => (
            <Heart key={i} className={`w-6 h-6 ${i < lives ? 'text-rose-500 fill-rose-500' : 'text-white/20'}`} />
          ))}
        </div>
        <div className="bg-emerald-400 text-emerald-950 px-4 py-1.5 rounded-full font-bold shadow-sm flex items-center gap-1">
          <Star className="w-4 h-4 fill-emerald-950" /> {score}
        </div>
      </div>

      {/* Zone de jeu */}
      <div className="flex-1 w-full relative">

        {/* Rendu des bulles */}
        <AnimatePresence>
          {bubbles.map(bubble => (
            <motion.div
              key={bubble.id}
              initial={{ y: '100dvh', x: `${bubble.x}%`, opacity: 0, scale: 0.5 }}
              animate={{ y: '-20dvh', opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: bubble.duration, ease: 'linear' }}
              onAnimationComplete={() => handleBubbleMiss(bubble)}
              onClick={() => handleBubbleClick(bubble)}
              className="absolute cursor-pointer w-16 h-16 bg-white/20 backdrop-blur-md border border-white/40 rounded-full flex items-center justify-center shadow-lg hover:bg-white/30"
              style={{ left: 0, bottom: 0 }}
            >
              <span className="text-3xl filter drop-shadow-md">{bubble.emoji}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Écran de Fin de Jeu */}
      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-6"
          >
            <div className="bg-white p-8 rounded-3xl text-center shadow-2xl max-w-xs w-full">
              <span className="text-6xl block mb-4">💔</span>
              <h2 className="text-2xl font-black mb-2 text-slate-800">{t("popHassanates.gameOver" as any)}</h2>
              <p className="text-slate-500 mb-2 text-sm">
                {t("popHassanates.gameOverDesc" as any)}
              </p>
              <p className="font-bold text-emerald-600 text-xl mb-6">
                {t("popHassanates.score" as any)} : {score}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => startGame()}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-emerald-500/30"
                >
                  <RotateCcw className="w-5 h-5" /> {t("popHassanates.replay" as any)}
                </button>
                <button
                  onClick={() => { setDifficulty(null); setIsPlaying(false); setGameOver(false); }}
                  className="flex-1 bg-white border border-slate-200 text-slate-700 font-bold py-3.5 rounded-2xl text-sm active:scale-95 transition-all"
                >
                  {t("popHassanates.changeDifficulty" as any)}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
