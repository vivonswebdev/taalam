import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Heart, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getDifficultyForLevel, generateQuestion, MathQuestion } from "@/data/mathDifficultyConfig";
import Confetti from "@/components/Confetti";
import DifficultySelector from "@/components/DifficultySelector";

const MATH_DIFF: Record<string, { startLevel: number }> = {
  easy: { startLevel: 1 },
  medium: { startLevel: 10 },
  hard: { startLevel: 25 },
};

const LANES = 3;
const MAX_LIVES = 3;
const QUESTIONS_PER_LEVEL = 8;
const OBSTACLE_TRAVEL_TIME_BASE = 3000; // ms for obstacle to travel screen

interface Obstacle {
  id: number;
  question: MathQuestion;
  choices: number[]; // 3 choices, one per lane
  correctLane: number;
  y: number; // 0..100 percent from top
  passed: boolean;
}

let obstacleId = 0;

export default function NumberRunnerPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const activeChildId = localStorage.getItem("taaloum_active_child_id");

  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [gameState, setGameState] = useState<"menu" | "playing" | "levelComplete" | "gameOver">("menu");
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [playerLane, setPlayerLane] = useState(1); // 0, 1, 2
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: boolean; lane: number } | null>(null);
  const [invincible, setInvincible] = useState(false);
  const [comboMessage, setComboMessage] = useState("");

  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const spawnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);

  const diff = getDifficultyForLevel(level);
  const speed = OBSTACLE_TRAVEL_TIME_BASE / (1 + (level - 1) * 0.08); // gets faster

  const startGame = (startLevel?: number) => {
    const sl = startLevel ?? (difficulty ? MATH_DIFF[difficulty].startLevel : 1);
    obstacleId = 0;
    setGameState("playing");
    setLevel(sl);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setLives(MAX_LIVES);
    setQuestionIndex(0);
    setTotalXp(0);
    setPlayerLane(1);
    setObstacles([]);
    setInvincible(false);
    setComboMessage("");
  };

  const selectDifficulty = (d: string) => {
    setDifficulty(d);
    startGame(MATH_DIFF[d].startLevel);
  };

  // Spawn obstacles
  const spawnObstacle = useCallback(() => {
    if (questionIndex >= QUESTIONS_PER_LEVEL) return;

    const q = generateQuestion(level);
    const correctLane = Math.floor(Math.random() * LANES);

    // Generate 3 choices: one correct at correctLane, others wrong
    const choices: number[] = [];
    for (let i = 0; i < LANES; i++) {
      if (i === correctLane) {
        choices.push(q.answer);
      } else {
        let wrong: number;
        do {
          const offset = Math.floor(Math.random() * Math.max(5, Math.abs(q.answer))) - 2;
          wrong = q.answer + (offset === 0 ? (i + 1) : offset);
        } while (wrong === q.answer || wrong < 0 || choices.includes(wrong));
        choices.push(wrong);
      }
    }

    const obs: Obstacle = {
      id: ++obstacleId,
      question: q,
      choices,
      correctLane,
      y: -15,
      passed: false,
    };

    setObstacles((prev) => [...prev, obs]);
    setQuestionIndex((idx) => idx + 1);
  }, [level, questionIndex]);

  // Game loop - move obstacles down
  useEffect(() => {
    if (gameState !== "playing") return;

    const stepMs = 16;
    const speedPerStep = (100 / (speed / stepMs)); // percent per frame

    gameLoopRef.current = setInterval(() => {
      setObstacles((prev) => {
        const updated = prev.map((o) => ({ ...o, y: o.y + speedPerStep }));

        // Check collisions at ~80% mark
        updated.forEach((o) => {
          if (o.passed) return;
          if (o.y >= 75 && o.y <= 90) {
            o.passed = true;
            if (playerLane === o.correctLane) {
              // Correct!
              const timeBonus = Math.max(0, Math.round((90 - o.y) * 2));
              const points = 100 + timeBonus;
              setScore((s) => s + points);
              setCombo((c) => {
                const nc = c + 1;
                if (nc > maxCombo) setMaxCombo(nc);
                if (nc === 5) {
                  setComboMessage("Mash'Allah ! 🔥");
                  setInvincible(true);
                  setTimeout(() => setInvincible(false), 3000);
                } else if (nc === 10) {
                  setComboMessage("SubhanAllah ! ⚡ 10 combo !");
                } else if (nc === 3) {
                  setComboMessage("Allahu Akbar ! 💪");
                } else {
                  setComboMessage("");
                }
                return nc;
              });
              setFeedback({ correct: true, lane: playerLane });
              setTimeout(() => setFeedback(null), 400);
            } else {
              // Wrong
              if (!invincible) {
                setLives((l) => {
                  if (l <= 1) {
                    setTimeout(() => {
                      setGameState("gameOver");
                      saveScore();
                    }, 200);
                  }
                  return l - 1;
                });
              }
              setCombo(0);
              setComboMessage("");
              setFeedback({ correct: false, lane: playerLane });
              setTimeout(() => setFeedback(null), 400);
            }
          }
        });

        return updated.filter((o) => o.y < 120);
      });
    }, stepMs);

    return () => { if (gameLoopRef.current) clearInterval(gameLoopRef.current); };
  }, [gameState, speed, playerLane, invincible, maxCombo]);

  // Spawn timer
  useEffect(() => {
    if (gameState !== "playing") return;
    if (questionIndex >= QUESTIONS_PER_LEVEL) {
      // Check if all obstacles cleared
      const checkDone = setInterval(() => {
        setObstacles((prev) => {
          if (prev.length === 0 || prev.every((o) => o.passed)) {
            clearInterval(checkDone);
            const xp = diff.xpPerWin;
            setTotalXp((x) => x + xp);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 2000);
            setGameState("levelComplete");
          }
          return prev;
        });
      }, 200);
      return () => clearInterval(checkDone);
    }

    const delay = Math.max(1500, speed * 0.8);
    spawnTimerRef.current = setTimeout(() => {
      spawnObstacle();
    }, questionIndex === 0 ? 500 : delay);

    return () => { if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current); };
  }, [gameState, questionIndex, spawnObstacle, speed, diff.xpPerWin]);

  const goNextLevel = () => {
    setLevel((l) => l + 1);
    setQuestionIndex(0);
    setLives(MAX_LIVES);
    setObstacles([]);
    setGameState("playing");
    setInvincible(false);
    setComboMessage("");
  };

  const saveScore = async () => {
    if (!user || !activeChildId) return;
    try {
      await supabase.from("math_scores" as any).insert({
        child_id: activeChildId,
        game_type: "number_runner",
        score,
        level,
        max_combo: maxCombo,
        operations: diff.ops.join(","),
        xp_earned: totalXp,
      } as any);
      if (totalXp > 0) {
        await supabase.from("children_points").insert({
          child_id: activeChildId,
          parent_id: user.id,
          points: totalXp,
          activity_type: "math_number_runner",
        });
      }
    } catch (e) {
      console.error("Failed to save number runner score:", e);
    }
  };

  // Touch/click lane selection
  const selectLane = (lane: number) => {
    if (gameState === "playing") setPlayerLane(lane);
  };

  // Keyboard
  useEffect(() => {
    if (gameState !== "playing") return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setPlayerLane((l) => Math.max(0, l - 1));
      else if (e.key === "ArrowRight") setPlayerLane((l) => Math.min(2, l + 1));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [gameState]);

  // Current active obstacle (closest one not passed)
  const activeObstacle = obstacles.find((o) => !o.passed && o.y > -10 && o.y < 75);

  // --- MENU ---
  if (gameState === "menu") {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="flex items-center gap-3 p-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border shadow-sm">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-2xl">🏃</span>
          <h1 className="text-lg font-bold text-foreground">Number Runner</h1>
        </div>

        <div className="px-6 flex flex-col items-center gap-6 pt-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-32 h-32 rounded-full bg-gradient-to-br from-green-500/30 to-emerald-500/20 flex items-center justify-center text-6xl border-4 border-green-500/30"
          >
            🏃
          </motion.div>

          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-foreground">{t("mathGames.numberRunner" as any) || "Number Runner"}</h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              {t("mathGames.numberRunnerDesc" as any) || "Choisis le bon chemin ! Résous le calcul et place-toi sur la bonne réponse."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full max-w-xs text-center">
            <div className="bg-card border border-border rounded-xl p-3">
              <p className="text-lg font-bold text-primary">3</p>
              <p className="text-[10px] text-muted-foreground">{t("mathGames.lanes" as any) || "Chemins"}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-3">
              <p className="text-lg font-bold text-amber-500">∞</p>
              <p className="text-[10px] text-muted-foreground">{t("mathGames.levels" as any) || "Niveaux"}</p>
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

  // --- GAME OVER ---
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

  // --- LEVEL COMPLETE ---
  if (gameState === "levelComplete") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-6">
        {showConfetti && <Confetti active={showConfetti} />}
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

  // --- PLAYING ---
  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 z-10">
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

      {/* Question display */}
      <div className="text-center py-2 z-10">
        {activeObstacle ? (
          <motion.p
            key={activeObstacle.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-foreground"
          >
            {activeObstacle.question.display} = ?
          </motion.p>
        ) : (
          <p className="text-lg text-muted-foreground">{t("mathGames.level" as any) || "Niveau"} {level} {diff.label}</p>
        )}
        {combo > 0 && (
          <p className="text-xs text-muted-foreground mt-1">🔥 Combo: {combo} {invincible && "⚡ INVINCIBLE!"}</p>
        )}
        <AnimatePresence>
          {comboMessage && (
            <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-sm font-bold text-amber-500 mt-1">
              {comboMessage}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Game area */}
      <div className="flex-1 relative mx-4 mb-2">
        {/* Lane backgrounds */}
        <div className="absolute inset-0 grid grid-cols-3 gap-1.5 rounded-2xl overflow-hidden">
          {[0, 1, 2].map((lane) => (
            <button
              key={lane}
              onClick={() => selectLane(lane)}
              className={`relative transition-colors duration-150 rounded-xl ${
                playerLane === lane
                  ? invincible ? "bg-amber-500/20 border-2 border-amber-500/50" : "bg-primary/10 border-2 border-primary/30"
                  : "bg-muted/50 border-2 border-transparent"
              }`}
            />
          ))}
        </div>

        {/* Obstacles */}
        {obstacles.filter((o) => !o.passed && o.y > -15 && o.y < 100).map((obs) => (
          <div key={obs.id} className="absolute left-0 right-0 grid grid-cols-3 gap-1.5 px-0" style={{ top: `${obs.y}%` }}>
            {obs.choices.map((choice, laneIdx) => (
              <div key={laneIdx} className="flex items-center justify-center">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold shadow-md border-2 ${
                  laneIdx === obs.correctLane
                    ? "bg-green-500/80 border-green-400 text-white"
                    : "bg-red-500/60 border-red-400 text-white"
                }`}>
                  {choice}
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* Player character */}
        <div
          className="absolute bottom-4 grid grid-cols-3 gap-1.5 left-0 right-0 pointer-events-none"
        >
          {[0, 1, 2].map((lane) => (
            <div key={lane} className="flex items-center justify-center">
              {playerLane === lane && (
                <motion.div
                  layoutId="runner"
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg border-3 ${
                    invincible ? "bg-amber-500 border-amber-300" : "bg-primary border-primary/50"
                  }`}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  🏃
                </motion.div>
              )}
            </div>
          ))}
        </div>

        {/* Feedback flash */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className={`absolute inset-0 rounded-2xl ${feedback.correct ? "bg-green-500/20" : "bg-red-500/20"}`}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Lane selector buttons (mobile) */}
      <div className="grid grid-cols-3 gap-2 px-4 pb-4">
        {["⬅️", "⬆️", "➡️"].map((emoji, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.9 }}
            onClick={() => selectLane(i)}
            className={`py-3 rounded-xl font-bold text-lg transition-all ${
              playerLane === i
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-card border border-border text-foreground"
            }`}
          >
            {emoji}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
