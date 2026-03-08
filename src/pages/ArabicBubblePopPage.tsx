import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import Confetti from "@/components/Confetti";
import DifficultySelector from "@/components/DifficultySelector";

const BUBBLE_DIFF: Record<string, { lives: number; speedMult: number; spawnMult: number }> = {
  easy: { lives: 5, speedMult: 0.7, spawnMult: 1.3 },
  medium: { lives: 3, speedMult: 1, spawnMult: 1 },
  hard: { lives: 2, speedMult: 1.4, spawnMult: 0.7 },
};

const ARABIC_ALPHABET = [
  { char: "أ", name: "Alif" }, { char: "ب", name: "Ba" }, { char: "ت", name: "Ta" },
  { char: "ث", name: "Tha" }, { char: "ج", name: "Jim" }, { char: "ح", name: "Ha" },
  { char: "خ", name: "Kha" }, { char: "د", name: "Dal" }, { char: "ذ", name: "Dhal" },
  { char: "ر", name: "Ra" }, { char: "ز", name: "Zay" }, { char: "س", name: "Sin" },
  { char: "ش", name: "Shin" }, { char: "ص", name: "Sad" }, { char: "ض", name: "Dad" },
  { char: "ط", name: "Ta" }, { char: "ظ", name: "Dha" }, { char: "ع", name: "Ayn" },
  { char: "غ", name: "Ghayn" }, { char: "ف", name: "Fa" }, { char: "ق", name: "Qaf" },
  { char: "ك", name: "Kaf" }, { char: "ل", name: "Lam" }, { char: "م", name: "Mim" },
  { char: "ن", name: "Nun" }, { char: "ه", name: "Ha" }, { char: "و", name: "Waw" },
  { char: "ي", name: "Ya" },
];

interface Bubble {
  id: number;
  letter: typeof ARABIC_ALPHABET[0];
  x: number;
  y: number;
  speed: number;
  size: number;
}

function getRandomLetter(exclude?: string) {
  let letter;
  do {
    letter = ARABIC_ALPHABET[Math.floor(Math.random() * ARABIC_ALPHABET.length)];
  } while (exclude && letter.char === exclude);
  return letter;
}

export default function ArabicBubblePopPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [gameState, setGameState] = useState<"menu" | "playing" | "gameover">("menu");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [targetLetter, setTargetLetter] = useState(ARABIC_ALPHABET[0]);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<{ id: number; x: number; y: number; text: string; color: string }[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [level, setLevel] = useState(1);
  const bubbleId = useRef(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  // Level-based config
  const spawnInterval = Math.max(1200, 2500 - level * 150);
  const baseSpeed = 0.3 + level * 0.05;

  const startGame = useCallback(() => {
    setScore(0);
    setLives(3);
    setCombo(0);
    setMaxCombo(0);
    setLevel(1);
    setBubbles([]);
    setFloatingTexts([]);
    setTargetLetter(getRandomLetter());
    setGameState("playing");
  }, []);

  // Spawn bubbles
  useEffect(() => {
    if (gameState !== "playing") return;
    const interval = setInterval(() => {
      const newBubble: Bubble = {
        id: bubbleId.current++,
        letter: ARABIC_ALPHABET[Math.floor(Math.random() * ARABIC_ALPHABET.length)],
        x: Math.random() * 70 + 15,
        y: 105,
        speed: baseSpeed + Math.random() * 0.2,
        size: Math.random() * 12 + 60,
      };
      setBubbles((prev) => [...prev.slice(-14), newBubble]);
    }, spawnInterval);
    return () => clearInterval(interval);
  }, [gameState, spawnInterval, baseSpeed]);

  // Move bubbles
  useEffect(() => {
    if (gameState !== "playing") return;
    const moveInterval = setInterval(() => {
      setBubbles((prev) => {
        const updated = prev.map((b) => ({ ...b, y: b.y - b.speed }));
        // Check for escaped correct bubbles
        const escaped = updated.filter((b) => b.y < -5 && b.letter.char === targetLetter.char);
        if (escaped.length > 0) {
          setLives((l) => {
            const newLives = l - escaped.length;
            if (newLives <= 0) {
              setGameState("gameover");
            }
            return Math.max(0, newLives);
          });
          setCombo(0);
        }
        return updated.filter((b) => b.y > -10);
      });
    }, 16);
    return () => clearInterval(moveInterval);
  }, [gameState, targetLetter]);

  // Level up every 50 points
  useEffect(() => {
    const newLevel = Math.floor(score / 50) + 1;
    if (newLevel > level && newLevel <= 20) {
      setLevel(newLevel);
      if (newLevel % 3 === 0) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 1500);
      }
    }
  }, [score, level]);

  const handlePop = (bubble: Bubble, e: React.MouseEvent | React.TouchEvent) => {
    const rect = gameAreaRef.current?.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0]?.clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0]?.clientY : (e as React.MouseEvent).clientY;
    const fx = rect ? ((clientX - rect.left) / rect.width) * 100 : bubble.x;
    const fy = rect ? ((clientY - rect.top) / rect.height) * 100 : bubble.y;

    if (bubble.letter.char === targetLetter.char) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);
      const comboBonus = Math.min(newCombo, 5);
      const points = 10 + comboBonus;
      setScore((s) => s + points);
      setTargetLetter(getRandomLetter(targetLetter.char));

      setFloatingTexts((prev) => [
        ...prev.slice(-5),
        { id: Date.now(), x: fx, y: fy, text: `+${points}`, color: "text-emerald-400" },
      ]);
    } else {
      setCombo(0);
      setScore((s) => Math.max(0, s - 5));
      setFloatingTexts((prev) => [
        ...prev.slice(-5),
        { id: Date.now(), x: fx, y: fy, text: "-5", color: "text-destructive" },
      ]);
    }
    setBubbles((prev) => prev.filter((b) => b.id !== bubble.id));
  };

  // Clean floating texts
  useEffect(() => {
    if (floatingTexts.length === 0) return;
    const timeout = setTimeout(() => {
      setFloatingTexts((prev) => prev.slice(1));
    }, 800);
    return () => clearTimeout(timeout);
  }, [floatingTexts]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 flex flex-col overflow-hidden relative">
      <Confetti active={showConfetti} />

      {/* Stars background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/40"
            style={{ left: `${(i * 37) % 100}%`, top: `${(i * 23) % 80}%` }}
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{ repeat: Infinity, duration: 2 + (i % 3), delay: i * 0.2 }}
          />
        ))}
        {/* Moon */}
        <div className="absolute top-8 right-8 w-16 h-16 rounded-full bg-gradient-to-br from-yellow-200 to-amber-300 opacity-30 blur-sm" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 p-4 shrink-0">
        <button
          onClick={() => navigate("/jeux")}
          className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-lg font-bold text-white flex-1">
          {t("kidsGames.arabicBubbles" as any) || "Arabic Bubbles"}
        </h1>
        {gameState === "playing" && (
          <div className="flex items-center gap-3 text-sm text-white/80">
            <span className="font-bold">
              {t("kidsGames.lvl" as any) || "Niv."} {level}
            </span>
            <span className="flex items-center gap-1">
              <Star size={14} className="text-amber-400" /> {score}
            </span>
          </div>
        )}
      </div>

      {/* Menu */}
      {gameState === "menu" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 relative z-10">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
            <motion.span
              className="text-7xl block mb-3"
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              🫧
            </motion.span>
            <h2 className="text-2xl font-black text-white mb-1">
              {t("kidsGames.arabicBubbles" as any) || "Arabic Bubbles"}
            </h2>
            <p className="text-sm text-white/60 max-w-xs">
              {t("kidsGames.arabicBubblesDesc" as any) || "Éclate les bulles avec la bonne lettre arabe !"}
            </p>
          </motion.div>

          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            onClick={startGame}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-2xl text-lg font-bold shadow-lg shadow-purple-500/30 active:scale-95 transition-transform"
          >
            {t("mathGames.play" as any) || "🎮 Jouer !"}
          </motion.button>
        </div>
      )}

      {/* Playing */}
      {gameState === "playing" && (
        <div className="flex-1 flex flex-col relative z-10" ref={gameAreaRef}>
          {/* Target & Lives bar */}
          <div className="flex items-center justify-between px-4 mb-2">
            <div className="flex items-center gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <span key={i} className={`text-lg ${i < lives ? "" : "opacity-20"}`}>
                  ❤️
                </span>
              ))}
            </div>

            <motion.div
              key={targetLetter.char}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm"
            >
              <span className="text-xs text-white/60">
                {t("kidsGames.findLetter" as any) || "Trouve"}
              </span>
              <span className="text-3xl font-bold text-white">{targetLetter.char}</span>
              <span className="text-xs text-white/40">{targetLetter.name}</span>
            </motion.div>

            {combo >= 2 && (
              <motion.span
                key={combo}
                initial={{ scale: 1.5 }}
                animate={{ scale: 1 }}
                className="text-sm font-black text-amber-400"
              >
                🔥x{combo}
              </motion.span>
            )}
            {combo < 2 && <div className="w-12" />}
          </div>

          {/* Game area */}
          <div className="flex-1 relative overflow-hidden">
            {/* Bubbles */}
            {bubbles.map((bubble) => {
              const isTarget = bubble.letter.char === targetLetter.char;
              return (
                <motion.button
                  key={bubble.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onTouchStart={(e) => handlePop(bubble, e)}
                  onClick={(e) => handlePop(bubble, e)}
                  style={{
                    left: `${bubble.x}%`,
                    top: `${bubble.y}%`,
                    width: bubble.size,
                    height: bubble.size,
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center
                    transition-transform active:scale-75
                    ${isTarget
                      ? "bg-gradient-to-br from-emerald-400/30 to-teal-400/30 border-2 border-emerald-400/50 shadow-lg shadow-emerald-500/20"
                      : "bg-white/10 border border-white/20"
                    }
                  `}
                >
                  <span className="text-white text-xl font-bold select-none" style={{ fontSize: bubble.size * 0.4 }}>
                    {bubble.letter.char}
                  </span>
                </motion.button>
              );
            })}

            {/* Floating score texts */}
            <AnimatePresence>
              {floatingTexts.map((ft) => (
                <motion.span
                  key={ft.id}
                  initial={{ opacity: 1, y: 0 }}
                  animate={{ opacity: 0, y: -40 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className={`absolute text-lg font-black ${ft.color} pointer-events-none`}
                  style={{ left: `${ft.x}%`, top: `${ft.y}%` }}
                >
                  {ft.text}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>

          {/* Bottom mosque silhouette */}
          <div className="h-16 relative">
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-950 to-transparent" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-4 items-end">
              <div className="w-3 h-10 bg-white/5 rounded-t-full" />
              <div className="w-6 h-14 bg-white/5 rounded-t-lg" />
              <div className="w-4 h-8 bg-white/5 rounded-t-full" />
            </div>
          </div>
        </div>
      )}

      {/* Game Over */}
      {gameState === "gameover" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center relative z-10">
          <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
            <span className="text-6xl">🫧</span>
          </motion.div>
          <h2 className="text-xl font-black text-white">
            {t("mathGames.gameOver" as any) || "Partie terminée !"}
          </h2>
          <div className="space-y-1 text-sm text-white/60">
            <p>
              <Star size={14} className="inline text-amber-400" /> {score} {t("kidsGames.points" as any) || "points"}
            </p>
            <p>
              🔥 {t("kidsGames.maxCombo" as any) || "Max combo"}: x{maxCombo}
            </p>
            <p>
              {t("kidsGames.lvl" as any) || "Niv."} {level}
            </p>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={startGame}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-bold active:scale-95 transition-transform flex items-center gap-2"
            >
              <RotateCcw size={16} /> {t("mathGames.retry" as any) || "🔄 Rejouer"}
            </button>
            <button
              onClick={() => navigate("/jeux")}
              className="px-6 py-3 bg-white/10 text-white/80 rounded-xl font-bold"
            >
              {t("mathGames.quit" as any) || "Quitter"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
