import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, Star, Trophy, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { generateQuestion, generateChoices, getDifficultyForLevel, MathQuestion } from "@/data/mathDifficultyConfig";
import Confetti from "@/components/Confetti";

const QUESTIONS_PER_LEVEL = 10;
const MAX_LIVES = 3;

export default function QuickCalcPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const activeChildId = localStorage.getItem("taaloum_active_child_id");

  const [gameState, setGameState] = useState<"menu" | "playing" | "levelComplete" | "gameOver">("menu");
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [question, setQuestion] = useState<MathQuestion | null>(null);
  const [choices, setChoices] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(5);
  const [answered, setAnswered] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [totalXp, setTotalXp] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [comboMessage, setComboMessage] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const diff = getDifficultyForLevel(level);

  const nextQuestion = useCallback(() => {
    const q = generateQuestion(level);
    setQuestion(q);
    setChoices(generateChoices(q.answer));
    setTimeLeft(diff.timePerCalc);
    setAnswered(null);
    setIsCorrect(null);
  }, [level, diff.timePerCalc]);

  const startGame = () => {
    setGameState("playing");
    setLevel(1);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setLives(MAX_LIVES);
    setQuestionIndex(0);
    setTotalXp(0);
  };

  useEffect(() => {
    if (gameState === "playing" && questionIndex < QUESTIONS_PER_LEVEL) {
      nextQuestion();
    }
  }, [gameState, questionIndex, nextQuestion]);

  // Timer
  useEffect(() => {
    if (gameState !== "playing" || answered !== null || !question) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          handleAnswer(-1); // timeout
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameState, answered, question]);

  const handleAnswer = (choice: number) => {
    if (answered !== null || !question) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setAnswered(choice);

    const correct = choice === question.answer;
    setIsCorrect(correct);

    if (correct) {
      const timeBonus = Math.round(timeLeft * 10);
      const comboBonus = combo >= 5 ? 50 : combo >= 3 ? 20 : 0;
      const points = 100 + timeBonus + comboBonus;
      setScore(s => s + points);
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);

      if (newCombo === 5) setComboMessage("Mash'Allah ! 🔥 5 d'affilée !");
      else if (newCombo === 10) setComboMessage("SubhanAllah ! ⚡ 10 combo !");
      else if (newCombo === 3) setComboMessage("Allahu Akbar ! 💪");
      else setComboMessage("");
    } else {
      setCombo(0);
      setLives(l => l - 1);
      setComboMessage("");
    }

    setTimeout(() => {
      if (!correct && lives <= 1) {
        setGameState("gameOver");
        saveScore();
        return;
      }

      const nextIdx = questionIndex + 1;
      if (nextIdx >= QUESTIONS_PER_LEVEL) {
        const xp = diff.xpPerWin;
        setTotalXp(x => x + xp);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
        setGameState("levelComplete");
      } else {
        setQuestionIndex(nextIdx);
      }
    }, 800);
  };

  const goNextLevel = () => {
    setLevel(l => l + 1);
    setQuestionIndex(0);
    setLives(MAX_LIVES);
    setGameState("playing");
  };

  const saveScore = async () => {
    if (!user || !activeChildId) return;
    try {
      await supabase.from("math_scores" as any).insert({
        child_id: activeChildId,
        game_type: "quick_calc",
        score,
        level,
        max_combo: maxCombo,
        operations: diff.ops.join(","),
        xp_earned: totalXp,
      } as any);

      // Add XP to child profile
      if (totalXp > 0) {
        await supabase.from("children_points").insert({
          child_id: activeChildId,
          parent_id: user.id,
          points: totalXp,
          activity_type: "math_quick_calc",
        });
      }
    } catch (e) {
      console.error("Failed to save math score:", e);
    }
  };

  const timerPercent = question ? (timeLeft / diff.timePerCalc) * 100 : 100;
  const timerColor = timerPercent > 50 ? "bg-green-500" : timerPercent > 25 ? "bg-amber-500" : "bg-red-500";

  // MENU
  if (gameState === "menu") {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="flex items-center gap-3 p-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border shadow-sm">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <Zap size={22} className="text-amber-500" />
          <h1 className="text-lg font-bold text-foreground">⚡ Quick Calc</h1>
        </div>

        <div className="px-6 flex flex-col items-center gap-6 pt-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center text-6xl border-4 border-primary/30"
          >
            ⚡
          </motion.div>

          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-foreground">{t("mathGames.quickCalcTitle" as any) || "Quick Calc"}</h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              {t("mathGames.quickCalcDesc" as any) || "Résous les calculs le plus vite possible ! Chaque bonne réponse rapide donne plus de points."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full max-w-xs text-center">
            <div className="bg-card border border-border rounded-xl p-3">
              <p className="text-lg font-bold text-primary">50</p>
              <p className="text-[10px] text-muted-foreground">{t("mathGames.levels" as any) || "Niveaux"}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-3">
              <p className="text-lg font-bold text-amber-500">4</p>
              <p className="text-[10px] text-muted-foreground">{t("mathGames.operations" as any) || "Opérations"}</p>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={startGame}
            className="w-full max-w-xs py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg shadow-lg"
          >
            {t("mathGames.play" as any) || "🎮 Jouer !"}
          </motion.button>
        </div>
      </div>
    );
  }

  // GAME OVER
  if (gameState === "gameOver") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
          <span className="text-7xl">💥</span>
        </motion.div>
        <h2 className="text-2xl font-bold text-foreground">{t("mathGames.gameOver" as any) || "Partie terminée !"}</h2>
        <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-primary">{score}</p>
            <p className="text-[10px] text-muted-foreground">Score</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-amber-500">{level}</p>
            <p className="text-[10px] text-muted-foreground">{t("mathGames.level" as any) || "Niveau"}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-red-500">🔥{maxCombo}</p>
            <p className="text-[10px] text-muted-foreground">Combo max</p>
          </div>
        </div>
        {totalXp > 0 && (
          <p className="text-sm font-semibold text-green-500">+{totalXp} XP {t("mathGames.earned" as any) || "gagnés"} !</p>
        )}
        <div className="flex gap-3 w-full max-w-sm">
          <button onClick={startGame} className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm">
            {t("mathGames.retry" as any) || "🔄 Rejouer"}
          </button>
          <button onClick={() => navigate(-1)} className="flex-1 py-3 bg-card border border-border text-foreground rounded-xl font-bold text-sm">
            {t("common.back" as any) || "Retour"}
          </button>
        </div>
      </div>
    );
  }

  // LEVEL COMPLETE
  if (gameState === "levelComplete") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-6">
        {showConfetti && <Confetti />}
        <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring" }}>
          <span className="text-7xl">⭐</span>
        </motion.div>
        <h2 className="text-2xl font-bold text-foreground">
          {t("mathGames.levelComplete" as any) || "Niveau"} {level} {t("mathGames.completed" as any) || "réussi"} !
        </h2>
        <p className="text-sm text-muted-foreground">Score: {score} | 🔥 Combo max: {maxCombo}</p>
        <p className="text-lg font-bold text-green-500">+{diff.xpPerWin} XP</p>

        <div className="flex gap-3 w-full max-w-sm">
          <button onClick={goNextLevel} className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm">
            {t("mathGames.nextLevel" as any) || "➡️ Niveau suivant"}
          </button>
          <button onClick={() => { saveScore(); navigate(-1); }} className="flex-1 py-3 bg-card border border-border text-foreground rounded-xl font-bold text-sm">
            {t("mathGames.quit" as any) || "Quitter"}
          </button>
        </div>
      </div>
    );
  }

  // PLAYING
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <button onClick={() => { saveScore(); navigate(-1); }} className="w-9 h-9 rounded-xl bg-card flex items-center justify-center border border-border">
          <ArrowLeft size={16} className="text-foreground" />
        </button>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
            <Star size={14} fill="currentColor" /> {score}
          </div>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: MAX_LIVES }).map((_, i) => (
              <Heart key={i} size={16} className={i < lives ? "text-red-500 fill-red-500" : "text-muted-foreground/30"} />
            ))}
          </div>
        </div>
      </div>

      {/* Level + Progress */}
      <div className="px-4 mb-2">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>{t("mathGames.level" as any) || "Niveau"} {level} {diff.label}</span>
          <span>{questionIndex + 1}/{QUESTIONS_PER_LEVEL}</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${((questionIndex) / QUESTIONS_PER_LEVEL) * 100}%` }} />
        </div>
      </div>

      {/* Timer bar */}
      <div className="px-4 mb-6">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${timerColor}`}
            style={{ width: `${timerPercent}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6">
        <AnimatePresence mode="wait">
          {question && (
            <motion.div
              key={`${level}-${questionIndex}`}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              className="text-center"
            >
              <p className="text-5xl font-bold text-foreground tracking-wider mb-2">
                {question.display}
              </p>
              <p className="text-3xl font-bold text-primary">= ?</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Combo message */}
        <AnimatePresence>
          {comboMessage && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm font-bold text-amber-500"
            >
              {comboMessage}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Combo counter */}
        {combo > 0 && (
          <p className="text-xs text-muted-foreground">🔥 Combo: {combo}</p>
        )}

        {/* Choices */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
          {choices.map((c, i) => {
            let btnClass = "bg-card border-border text-foreground";
            if (answered !== null) {
              if (c === question?.answer) btnClass = "bg-green-500 border-green-500 text-white";
              else if (c === answered) btnClass = "bg-red-500 border-red-500 text-white";
            }

            return (
              <motion.button
                key={`${c}-${i}`}
                whileTap={answered === null ? { scale: 0.93 } : {}}
                onClick={() => handleAnswer(c)}
                disabled={answered !== null}
                className={`py-5 rounded-2xl border-2 text-2xl font-bold shadow-sm transition-all ${btnClass}`}
              >
                {c}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
