import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Heart, Star, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';

const GOOD_ITEMS = ['🕋', '📖', '🕌', '🌙', '📿', '🤲', '⭐'];
const BAD_ITEMS = ['👾', '😡', '🔥'];
const MAX_BUBBLES = 12;

interface Bubble {
  id: number;
  emoji: string;
  isGood: boolean;
  x: number;
  duration: number;
  spawnedAt: number;
}

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

function DifficultySelect({ onSelect, onBack, t }: { onSelect: (d: string) => void; onBack: () => void; t: any }) {
  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto h-[100dvh] p-4 bg-gradient-to-b from-indigo-900 via-purple-900 to-background font-sans overflow-hidden relative">
      <div className="flex items-center w-full mt-8 z-10 relative">
        <button onClick={onBack} className="p-2 bg-white/20 backdrop-blur-md rounded-full shadow-sm text-white hover:bg-white/30 transition-colors">
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
                onClick={() => onSelect(d)}
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

function GameOverScreen({ score, onReplay, onChangeDiff, t }: { score: number; onReplay: () => void; onChangeDiff: () => void; t: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-6"
    >
      <div className="bg-white dark:bg-card p-8 rounded-3xl text-center shadow-2xl max-w-xs w-full">
        <span className="text-6xl block mb-4">💔</span>
        <h2 className="text-2xl font-black mb-2 text-foreground">{t("popHassanates.gameOver" as any)}</h2>
        <p className="text-muted-foreground mb-2 text-sm">
          {t("popHassanates.gameOverDesc" as any)}
        </p>
        <p className="font-bold text-emerald-600 text-xl mb-6">
          {t("popHassanates.score" as any)} : {score}
        </p>
        <div className="flex gap-2">
          <button
            onClick={onReplay}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-emerald-500/30"
          >
            <RotateCcw className="w-5 h-5" /> {t("popHassanates.replay" as any)}
          </button>
          <button
            onClick={onChangeDiff}
            className="flex-1 bg-card border border-border text-foreground font-bold py-3.5 rounded-2xl text-sm active:scale-95 transition-all"
          >
            {t("popHassanates.changeDifficulty" as any)}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function PopHassanatesPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [popEffects, setPopEffects] = useState<Array<{ id: number; x: number; y: number; text: string }>>([]);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const idCounter = useRef(0);
  const gameOverRef = useRef(false);

  const config = difficulty ? DIFFICULTIES[difficulty] : null;

  // Keep gameOverRef in sync
  useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);

  const startGame = useCallback((diff?: string) => {
    const d = diff || difficulty;
    if (!d) return;
    setDifficulty(d);
    setScore(0);
    setCombo(0);
    setLives(3);
    setGameOver(false);
    gameOverRef.current = false;
    setBubbles([]);
    setPopEffects([]);
    setIsPlaying(true);
  }, [difficulty]);

  // Spawn bubbles
  useEffect(() => {
    if (!isPlaying || gameOver || !config) return;
    const interval = setInterval(() => {
      setBubbles(prev => {
        if (prev.length >= MAX_BUBBLES) return prev; // cap bubbles
        const isGood = Math.random() > config.badChance;
        const emoji = isGood
          ? GOOD_ITEMS[Math.floor(Math.random() * GOOD_ITEMS.length)]
          : BAD_ITEMS[Math.floor(Math.random() * BAD_ITEMS.length)];
        idCounter.current += 1;
        return [...prev, {
          id: idCounter.current,
          emoji,
          isGood,
          x: Math.random() * 70 + 15,
          duration: Math.random() * (config.maxDuration - config.minDuration) + config.minDuration,
          spawnedAt: Date.now(),
        }];
      });
    }, config.spawnInterval);
    return () => clearInterval(interval);
  }, [isPlaying, gameOver, config]);

  // Cleanup expired bubbles via timer (instead of relying on onAnimationComplete)
  useEffect(() => {
    if (!isPlaying || gameOver) return;
    const cleanup = setInterval(() => {
      const now = Date.now();
      setBubbles(prev => {
        const expired = prev.filter(b => now - b.spawnedAt > b.duration * 1000);
        if (expired.length === 0) return prev;
        // Lose a life for each missed good bubble
        const missedGood = expired.filter(b => b.isGood).length;
        if (missedGood > 0 && !gameOverRef.current) {
          setLives(l => Math.max(0, l - missedGood));
          setCombo(0);
        }
        return prev.filter(b => now - b.spawnedAt <= b.duration * 1000);
      });
    }, 300);
    return () => clearInterval(cleanup);
  }, [isPlaying, gameOver]);

  // Check game over
  useEffect(() => {
    if (lives <= 0 && !gameOver) {
      setGameOver(true);
      setIsPlaying(false);
    }
  }, [lives, gameOver]);

  const handleBubbleClick = useCallback((bubble: Bubble, e: React.MouseEvent | React.TouchEvent) => {
    if (gameOverRef.current) return;
    
    // Get position for pop effect
    const rect = gameAreaRef.current?.getBoundingClientRect();
    let clientX = 0, clientY = 0;
    if ('touches' in e) {
      clientX = e.touches[0]?.clientX ?? 0;
      clientY = e.touches[0]?.clientY ?? 0;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    const popX = rect ? clientX - rect.left : clientX;
    const popY = rect ? clientY - rect.top : clientY;

    setBubbles(prev => prev.filter(b => b.id !== bubble.id));
    
    if (bubble.isGood) {
      const comboBonus = Math.floor(combo / 3) * 5;
      const points = 10 + comboBonus;
      setScore(s => s + points);
      setCombo(c => c + 1);
      
      const effectId = Date.now() + Math.random();
      setPopEffects(prev => [...prev, { id: effectId, x: popX, y: popY, text: `+${points}` }]);
      setTimeout(() => setPopEffects(prev => prev.filter(p => p.id !== effectId)), 800);
    } else {
      setLives(l => Math.max(0, l - 1));
      setCombo(0);
    }
  }, [combo]);

  const goBack = useCallback(() => {
    setDifficulty(null);
    setIsPlaying(false);
    setGameOver(false);
  }, []);

  if (!difficulty) {
    return <DifficultySelect onSelect={(d) => startGame(d)} onBack={() => navigate(-1)} t={t} />;
  }

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto h-[100dvh] p-4 bg-gradient-to-b from-indigo-900 via-purple-900 to-background font-sans overflow-hidden relative">
      {/* HUD */}
      <div className="flex justify-between items-center w-full mt-8 z-10 relative">
        <button
          onClick={goBack}
          className="p-2 bg-white/20 backdrop-blur-md rounded-full shadow-sm text-white hover:bg-white/30 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        {/* Combo indicator */}
        {combo >= 3 && (
          <motion.div
            key={combo}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-1 bg-amber-400/90 text-amber-950 px-3 py-1 rounded-full font-bold text-xs"
          >
            <Zap className="w-3 h-3 fill-amber-950" /> ×{combo}
          </motion.div>
        )}

        <div className="flex gap-1 ml-auto mr-4">
          {[...Array(3)].map((_, i) => (
            <Heart key={i} className={`w-6 h-6 transition-all ${i < lives ? 'text-rose-500 fill-rose-500' : 'text-white/20'}`} />
          ))}
        </div>
        <div className="bg-emerald-400 text-emerald-950 px-4 py-1.5 rounded-full font-bold shadow-sm flex items-center gap-1">
          <Star className="w-4 h-4 fill-emerald-950" /> {score}
        </div>
      </div>

      {/* Game area */}
      <div ref={gameAreaRef} className="flex-1 w-full relative overflow-hidden">
        {bubbles.map(bubble => {
          const elapsed = (Date.now() - bubble.spawnedAt) / 1000;
          const remaining = Math.max(0, bubble.duration - elapsed);
          return (
            <motion.div
              key={bubble.id}
              initial={{ bottom: -80, opacity: 0, scale: 0.3 }}
              animate={{ bottom: '110%', opacity: 1, scale: 1 }}
              transition={{ duration: remaining, ease: 'linear' }}
              onClick={(e) => handleBubbleClick(bubble, e)}
              onTouchStart={(e) => { e.preventDefault(); handleBubbleClick(bubble, e); }}
              className={`absolute cursor-pointer w-16 h-16 rounded-full flex items-center justify-center shadow-lg select-none
                ${bubble.isGood
                  ? 'bg-white/20 backdrop-blur-md border border-white/40 hover:bg-white/30 active:scale-90'
                  : 'bg-red-500/30 backdrop-blur-md border border-red-400/50 hover:bg-red-500/40 active:scale-90'
                } transition-transform`}
              style={{ left: `calc(${bubble.x}% - 32px)` }}
            >
              <span className="text-3xl filter drop-shadow-md pointer-events-none">{bubble.emoji}</span>
            </motion.div>
          );
        })}

        {/* Pop score effects */}
        <AnimatePresence>
          {popEffects.map(effect => (
            <motion.div
              key={effect.id}
              initial={{ opacity: 1, y: 0, scale: 1 }}
              animate={{ opacity: 0, y: -60, scale: 1.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="absolute pointer-events-none text-emerald-300 font-black text-lg z-20"
              style={{ left: effect.x, top: effect.y }}
            >
              {effect.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Game Over */}
      <AnimatePresence>
        {gameOver && (
          <GameOverScreen
            score={score}
            onReplay={() => startGame()}
            onChangeDiff={goBack}
            t={t}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
