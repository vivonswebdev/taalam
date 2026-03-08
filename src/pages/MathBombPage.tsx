import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bomb, RotateCcw, Star, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getDifficultyForLevel, generateQuestion, generateChoices, type MathQuestion } from "@/data/mathDifficultyConfig";
import Confetti from "@/components/Confetti";
import DifficultySelector from "@/components/DifficultySelector";

const MATH_DIFF: Record<string, { startLevel: number }> = {
  easy: { startLevel: 1 },
  medium: { startLevel: 10 },
  hard: { startLevel: 25 },
};

const FUSE_TOTAL = 100;

function getFuseTime(level: number): number {
  // Seconds before explosion — gets shorter as level increases
  if (level <= 5) return 8;
  if (level <= 15) return 6;
  if (level <= 30) return 5;
  if (level <= 50) return 4;
  if (level <= 75) return 3;
  return 2.5;
}

function getQuestionsPerBomb(level: number): number {
  if (level <= 10) return 3;
  if (level <= 30) return 4;
  if (level <= 60) return 5;
  return 6;
}

export default function MathBombPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const activeChildId = localStorage.getItem("taaloum_active_child_id");

  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [gameState, setGameState] = useState<"menu" | "playing" | "levelComplete" | "exploded">("menu");
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [fusePercent, setFusePercent] = useState(FUSE_TOTAL);
  const [question, setQuestion] = useState<MathQuestion | null>(null);
  const [choices, setChoices] = useState<number[]>([]);
  const [questionsLeft, setQuestionsLeft] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [shake, setShake] = useState(false);
  const fuseRef = useRef<NodeJS.Timeout | null>(null);

  const nextQuestion = useCallback(() => {
    const q = generateQuestion(level);
    setQuestion(q);
    setChoices(generateChoices(q.answer));
    setFeedback(null);
  }, [level]);

  const startLevel = useCallback((lvl: number) => {
    const total = getQuestionsPerBomb(lvl);
    setQuestionsLeft(total);
    setTotalQuestions(total);
    setFusePercent(FUSE_TOTAL);
    setCombo(0);
    setGameState("playing");
    const q = generateQuestion(lvl);
    setQuestion(q);
    setChoices(generateChoices(q.answer));
    setFeedback(null);
  }, []);

  // Fuse countdown
  useEffect(() => {
    if (gameState !== "playing") return;
    const fuseTime = getFuseTime(level);
    const interval = 50; // ms
    const decrement = (FUSE_TOTAL / (fuseTime * 1000)) * interval;

    fuseRef.current = setInterval(() => {
      setFusePercent((prev) => {
        if (prev <= 0) {
          clearInterval(fuseRef.current!);
          setShake(true);
          setTimeout(() => { setShake(false); setGameState("exploded"); }, 600);
          return 0;
        }
        return prev - decrement;
      });
    }, interval);
    return () => { if (fuseRef.current) clearInterval(fuseRef.current); };
  }, [gameState, question, level]);

  // Reset fuse on new question
  useEffect(() => {
    if (gameState === "playing" && question) {
      setFusePercent(FUSE_TOTAL);
    }
  }, [question?.display]);

  const handleAnswer = (answer: number) => {
    if (!question || feedback) return;
    if (fuseRef.current) clearInterval(fuseRef.current);

    if (answer === question.answer) {
      setFeedback("correct");
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);
      const comboBonus = Math.min(newCombo * 2, 20);
      const speedBonus = Math.round(fusePercent / 5);
      setScore((s) => s + 10 + comboBonus + speedBonus);

      const remaining = questionsLeft - 1;
      setQuestionsLeft(remaining);

      setTimeout(() => {
        if (remaining <= 0) {
          // Level complete!
          setShowConfetti(true);
          const diff = getDifficultyForLevel(level);
          setScore((s) => s + diff.xpPerWin);
          saveScore(level, score + diff.xpPerWin);
          setTimeout(() => { setShowConfetti(false); setGameState("levelComplete"); }, 1500);
        } else {
          nextQuestion();
        }
      }, 400);
    } else {
      setFeedback("wrong");
      setCombo(0);
      setShake(true);
      // Penalty: lose 30% fuse
      setFusePercent((p) => Math.max(0, p - 30));
      setTimeout(() => {
        setShake(false);
        setFeedback(null);
        // Restart fuse for same question
      }, 500);
    }
  };

  const saveScore = async (lvl: number, totalScore: number) => {
    if (!activeChildId) return;
    try {
      await supabase.from("math_scores").insert({
        child_id: activeChildId,
        game_type: "math_bomb",
        score: totalScore,
        level: lvl,
        max_combo: maxCombo,
        operations: getDifficultyForLevel(lvl).ops.join(","),
        xp_earned: getDifficultyForLevel(lvl).xpPerWin,
      });
    } catch {}
  };

  const diff = getDifficultyForLevel(level);
  const fuseColor = fusePercent > 60 ? "bg-emerald-500" : fusePercent > 30 ? "bg-amber-500" : "bg-destructive";

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      <Confetti active={showConfetti} />

      {/* Header */}
      <div className="flex items-center gap-3 p-4 shrink-0">
        <button onClick={() => navigate("/kids-math")} className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <Bomb size={20} className="text-destructive" />
        <h1 className="text-lg font-bold text-foreground flex-1">
          {t("mathGames.mathBomb" as any) || "Math Bomb"}
        </h1>
        {gameState === "playing" && (
          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold text-foreground">{diff.label} {level}</span>
            {combo >= 2 && (
              <motion.span
                key={combo}
                initial={{ scale: 1.5 }}
                animate={{ scale: 1 }}
                className="text-xs font-black text-primary"
              >
                🔥x{combo}
              </motion.span>
            )}
          </div>
        )}
      </div>

      {/* Menu */}
      {gameState === "menu" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
            <motion.span
              className="text-7xl block mb-3"
              animate={{ rotate: [0, -5, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              💣
            </motion.span>
            <h2 className="text-xl font-black text-foreground mb-1">
              {t("mathGames.mathBomb" as any) || "Math Bomb"}
            </h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              {t("mathGames.mathBombDesc" as any) || "Désamorce la bombe en résolvant les calculs avant l'explosion !"}
            </p>
          </motion.div>

          <div className="text-center space-y-1">
            <p className="text-xs text-muted-foreground">{diff.label} {t("mathGames.level" as any)} {level}</p>
            <p className="text-xs text-muted-foreground">{getQuestionsPerBomb(level)} {t("mathGames.calculations" as any) || "calculs"} · {diff.ops.join(" ")}</p>
          </div>

          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            onClick={() => startLevel(level)}
            className="px-8 py-4 bg-destructive text-destructive-foreground rounded-2xl text-lg font-bold shadow-lg active:scale-95 transition-transform"
          >
            {t("mathGames.play" as any) || "🎮 Jouer !"}
          </motion.button>
        </div>
      )}

      {/* Playing */}
      {gameState === "playing" && question && (
        <motion.div
          className="flex-1 flex flex-col px-4 pb-6"
          animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          {/* Progress */}
          <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground">
            <span>💣 {totalQuestions - questionsLeft}/{totalQuestions}</span>
            <span><Star size={12} className="inline text-secondary" /> {score} XP</span>
          </div>

          {/* Fuse bar */}
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden mb-6 relative">
            <motion.div
              className={`h-full rounded-full ${fuseColor} transition-colors`}
              style={{ width: `${Math.max(0, fusePercent)}%` }}
            />
            {fusePercent <= 30 && (
              <motion.div
                className="absolute inset-0 bg-destructive/20 rounded-full"
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
              />
            )}
          </div>

          {/* Bomb display */}
          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <motion.div
              className="relative"
              animate={fusePercent <= 30 ? { scale: [1, 1.05, 1] } : {}}
              transition={{ repeat: Infinity, duration: 0.3 }}
            >
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-muted to-card border-4 border-border flex items-center justify-center shadow-xl">
                <span className="text-3xl font-black text-foreground">{question.display}</span>
              </div>
              {/* Spark effect when low fuse */}
              {fusePercent <= 20 && (
                <motion.span
                  className="absolute -top-2 -right-2 text-xl"
                  animate={{ opacity: [1, 0, 1], rotate: [0, 20, -20, 0] }}
                  transition={{ repeat: Infinity, duration: 0.3 }}
                >
                  💥
                </motion.span>
              )}
            </motion.div>

            {/* Answer choices */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
              <AnimatePresence mode="popLayout">
                {choices.map((choice, idx) => (
                  <motion.button
                    key={`${question.display}-${choice}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ delay: idx * 0.05, type: "spring", damping: 15 }}
                    onClick={() => handleAnswer(choice)}
                    disabled={!!feedback}
                    className={`py-4 rounded-2xl text-xl font-black border-2 transition-all active:scale-95
                      ${feedback && choice === question.answer
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                        : feedback === "wrong" && choice !== question.answer
                        ? "bg-muted border-border text-muted-foreground"
                        : "bg-card border-border text-foreground hover:border-primary hover:bg-primary/5"
                      }
                    `}
                  >
                    {choice}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {feedback === "correct" && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold"
                >
                  <Zap size={18} /> {combo >= 3 ? `🔥 Combo x${combo}!` : "✓"}
                </motion.div>
              )}
              {feedback === "wrong" && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-destructive font-bold text-sm"
                >
                  ✗ -30% ⏱
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Level Complete */}
      {gameState === "levelComplete" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
            <span className="text-6xl">🎉</span>
          </motion.div>
          <h2 className="text-xl font-black text-foreground">
            {t("mathGames.bombDefused" as any) || "Bombe désamorcée !"} 💣✅
          </h2>
          <p className="text-sm text-muted-foreground">
            {diff.label} {t("mathGames.level" as any)} {level} · 🔥 max x{maxCombo} · <Star size={14} className="inline text-secondary" /> {score} XP
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

      {/* Exploded */}
      {gameState === "exploded" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <motion.div
            initial={{ scale: 3, opacity: 1 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 10 }}
          >
            <span className="text-7xl">💥</span>
          </motion.div>
          <h2 className="text-xl font-black text-destructive">
            {t("mathGames.exploded" as any) || "BOOM ! La bombe a explosé !"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {diff.label} {t("mathGames.level" as any)} {level} · {totalQuestions - questionsLeft}/{totalQuestions} · {score} XP
          </p>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => startLevel(level)}
              className="px-6 py-3 bg-destructive text-destructive-foreground rounded-xl font-bold active:scale-95 transition-transform flex items-center gap-2"
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
