import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Brain, Star, Trophy, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getDifficultyForLevel } from "@/data/mathDifficultyConfig";
import Confetti from "@/components/Confetti";
import DifficultySelector from "@/components/DifficultySelector";

const MATH_DIFF: Record<string, { startLevel: number }> = {
  easy: { startLevel: 1 },
  medium: { startLevel: 10 },
  hard: { startLevel: 25 },
};

interface MemoryCard {
  id: number;
  content: string;
  value: number;
  type: "question" | "answer";
  matched: boolean;
  flipped: boolean;
}

function generatePairs(level: number, pairCount: number): MemoryCard[] {
  const diff = getDifficultyForLevel(level);
  const cards: MemoryCard[] = [];
  const usedAnswers = new Set<number>();
  let id = 0;

  for (let i = 0; i < pairCount; i++) {
    const op = diff.ops[Math.floor(Math.random() * diff.ops.length)];
    let a: number, b: number, answer: number, display: string;

    let attempts = 0;
    do {
      switch (op) {
        case "-":
          a = Math.floor(Math.random() * Math.min(diff.maxVal, 30)) + 2;
          b = Math.floor(Math.random() * a) + 1;
          answer = a - b;
          break;
        case "×":
          a = Math.floor(Math.random() * 10) + 2;
          b = Math.floor(Math.random() * 10) + 2;
          answer = a * b;
          break;
        case "÷":
          b = Math.floor(Math.random() * 9) + 2;
          answer = Math.floor(Math.random() * 10) + 1;
          a = b * answer;
          break;
        case "²":
          a = Math.floor(Math.random() * 10) + 2;
          b = 2;
          answer = a * a;
          break;
        default:
          a = Math.floor(Math.random() * Math.min(diff.maxVal, 30)) + 1;
          b = Math.floor(Math.random() * Math.min(diff.maxVal, 30)) + 1;
          answer = a + b;
          break;
      }
      attempts++;
    } while (usedAnswers.has(answer) && attempts < 50);

    usedAnswers.add(answer);
    display = op === "²" ? `${a}²` : `${a} ${op} ${b}`;

    cards.push({
      id: id++,
      content: display,
      value: answer,
      type: "question",
      matched: false,
      flipped: false,
    });
    cards.push({
      id: id++,
      content: String(answer),
      value: answer,
      type: "answer",
      matched: false,
      flipped: false,
    });
  }

  // Shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

function getPairCount(level: number): number {
  if (level <= 5) return 4;
  if (level <= 15) return 6;
  if (level <= 30) return 8;
  return 10;
}

function getGridCols(pairCount: number): string {
  if (pairCount <= 4) return "grid-cols-4";
  if (pairCount <= 6) return "grid-cols-4";
  return "grid-cols-4";
}

export default function MathMemoryPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const activeChildId = localStorage.getItem("taaloum_active_child_id");

  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [gameState, setGameState] = useState<"menu" | "playing" | "levelComplete" | "gameOver">("menu");
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [canFlip, setCanFlip] = useState(true);
  const [timeLeft, setTimeLeft] = useState(60);
  const [showConfetti, setShowConfetti] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startLevel = useCallback((lvl: number) => {
    const pairCount = getPairCount(lvl);
    const newCards = generatePairs(lvl, pairCount);
    setCards(newCards);
    setFlipped([]);
    setMoves(0);
    setCanFlip(true);
    const time = Math.max(30, 90 - lvl);
    setTimeLeft(time);
    setGameState("playing");
  }, []);

  // Timer
  useEffect(() => {
    if (gameState !== "playing") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setGameState("gameOver");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameState]);

  // Check win
  useEffect(() => {
    if (gameState === "playing" && cards.length > 0 && cards.every((c) => c.matched)) {
      if (timerRef.current) clearInterval(timerRef.current);
      const diff = getDifficultyForLevel(level);
      const bonus = Math.max(0, timeLeft * 2);
      setScore((s) => s + diff.xpPerWin + bonus);
      setShowConfetti(true);
      setTimeout(() => { setShowConfetti(false); setGameState("levelComplete"); }, 1500);
      saveScore(level, score + diff.xpPerWin + bonus);
    }
  }, [cards, gameState]);

  const handleFlip = (idx: number) => {
    if (!canFlip || cards[idx].matched || cards[idx].flipped || flipped.length >= 2) return;

    const newCards = [...cards];
    newCards[idx].flipped = true;
    setCards(newCards);
    const newFlipped = [...flipped, idx];
    setFlipped(newFlipped);
    setMoves((m) => m + 1);

    if (newFlipped.length === 2) {
      setCanFlip(false);
      const [first, second] = newFlipped;
      if (cards[first].value === cards[second].value && cards[first].type !== cards[second].type) {
        // Match!
        setTimeout(() => {
          const matched = [...cards];
          matched[first].matched = true;
          matched[second].matched = true;
          setCards(matched);
          setFlipped([]);
          setCanFlip(true);
        }, 400);
      } else {
        // No match
        setTimeout(() => {
          const reset = [...cards];
          reset[first].flipped = false;
          reset[second].flipped = false;
          setCards(reset);
          setFlipped([]);
          setCanFlip(true);
        }, 800);
      }
    }
  };

  const saveScore = async (lvl: number, totalScore: number) => {
    if (!activeChildId) return;
    try {
      await supabase.from("math_scores").insert({
        child_id: activeChildId,
        game_type: "math_memory",
        score: totalScore,
        level: lvl,
        max_combo: 0,
        operations: getDifficultyForLevel(lvl).ops.join(","),
        xp_earned: getDifficultyForLevel(lvl).xpPerWin,
      });
    } catch {}
  };

  const diff = getDifficultyForLevel(level);
  const pairCount = getPairCount(level);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Confetti active={showConfetti} />

      {/* Header */}
      <div className="flex items-center gap-3 p-4 shrink-0">
        <button onClick={() => navigate("/kids-math")} className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <Brain size={20} className="text-primary" />
        <h1 className="text-lg font-bold text-foreground flex-1">
          {t("mathGames.mathMemory" as any) || "Math Memory"}
        </h1>
        {gameState === "playing" && (
          <div className="flex items-center gap-3 text-sm">
            <span className="font-bold text-foreground">{diff.label} {t("mathGames.level" as any) || "Niveau"} {level}</span>
            <span className={`font-mono font-bold ${timeLeft <= 10 ? "text-destructive animate-pulse" : "text-muted-foreground"}`}>
              {timeLeft}s
            </span>
          </div>
        )}
      </div>

      {/* Difficulty / Menu */}
      {gameState === "menu" && (
        <div className="flex-1">
          <DifficultySelector title={t("mathGames.mathMemory" as any) || "Math Memory"} icon="🧠" onSelect={(d) => {
            setDifficulty(d);
            const sl = MATH_DIFF[d].startLevel;
            setLevel(sl);
            startLevel(sl);
          }} onBack={() => navigate("/kids-math")} t={(k) => t(k as any)} difficulties={[
            { key: "easy", emoji: "🌱", xpBase: 10, description: "4 " + (t("mathGames.pairs" as any) || "paires") + " (+, -)" },
            { key: "medium", emoji: "🌿", xpBase: 20, description: "6 " + (t("mathGames.pairs" as any) || "paires") + " (+, -, ×)" },
            { key: "hard", emoji: "🔥", xpBase: 35, description: "8 " + (t("mathGames.pairs" as any) || "paires") + " (+, -, ×, ÷)" },
          ]} />
        </div>
      )}

      {/* Playing */}
      {gameState === "playing" && (
        <div className="flex-1 flex flex-col px-4 pb-4">
          {/* Stats bar */}
          <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
            <span>🎯 {cards.filter((c) => c.matched).length / 2}/{pairCount}</span>
            <span>🔄 {moves} {t("mathGames.moves" as any) || "coups"}</span>
            <span><Star size={12} className="inline text-secondary" /> {score} XP</span>
          </div>

          {/* Card grid */}
          <div className={`grid ${getGridCols(pairCount)} gap-2 flex-1 auto-rows-fr`}>
            <AnimatePresence>
              {cards.map((card, idx) => (
                <motion.button
                  key={card.id}
                  initial={{ scale: 0, rotateY: 180 }}
                  animate={{ scale: 1, rotateY: card.flipped || card.matched ? 0 : 180 }}
                  transition={{ type: "spring", damping: 15, stiffness: 200 }}
                  onClick={() => handleFlip(idx)}
                  disabled={card.matched}
                  className={`relative flex items-center justify-center rounded-xl border-2 text-sm font-bold transition-all min-h-[3rem]
                    ${card.matched
                      ? "bg-primary/20 border-primary/40 text-primary"
                      : card.flipped
                      ? "bg-card border-secondary shadow-md text-foreground"
                      : "bg-muted border-border text-transparent hover:border-primary/30"
                    }
                  `}
                >
                  {(card.flipped || card.matched) ? (
                    <span className={card.type === "question" ? "text-xs" : "text-base font-black"}>
                      {card.content}
                    </span>
                  ) : (
                    <span className="text-lg">❓</span>
                  )}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Level Complete */}
      {gameState === "levelComplete" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
            <span className="text-6xl">🎉</span>
          </motion.div>
          <h2 className="text-xl font-black text-foreground">
            {t("mathGames.levelComplete" as any) || "Niveau"} {level} {t("mathGames.completed" as any) || "réussi !"}
          </h2>
          <p className="text-sm text-muted-foreground">
            🔄 {moves} {t("mathGames.moves" as any) || "coups"} · ⏱ {timeLeft}s · <Star size={14} className="inline text-secondary" /> {score} XP
          </p>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => { setLevel((l) => l + 1); startLevel(level + 1); }}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold active:scale-95 transition-transform"
            >
              {t("mathGames.nextLevel" as any) || "➡️ Niveau suivant"}
            </button>
            <button
              onClick={() => navigate("/kids-math")}
              className="px-6 py-3 bg-muted text-muted-foreground rounded-xl font-bold"
            >
              {t("mathGames.quit" as any) || "Quitter"}
            </button>
          </div>
        </div>
      )}

      {/* Game Over */}
      {gameState === "gameOver" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
            <span className="text-6xl">⏰</span>
          </motion.div>
          <h2 className="text-xl font-black text-foreground">
            {t("mathGames.gameOver" as any) || "Temps écoulé !"}
          </h2>
          <p className="text-sm text-muted-foreground">
            🧠 {t("mathGames.level" as any)} {level} · {cards.filter((c) => c.matched).length / 2}/{pairCount} {t("mathGames.pairs" as any) || "paires"} · {score} XP
          </p>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => startLevel(level)}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold active:scale-95 transition-transform flex items-center gap-2"
            >
              <RotateCcw size={16} /> {t("mathGames.retry" as any) || "🔄 Rejouer"}
            </button>
            <button
              onClick={() => navigate("/kids-math")}
              className="px-6 py-3 bg-muted text-muted-foreground rounded-xl font-bold"
            >
              {t("mathGames.quit" as any) || "Quitter"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
