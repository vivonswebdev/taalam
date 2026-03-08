import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Heart, Crosshair } from "lucide-react";
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

const MAX_LIVES = 3;
const QUESTIONS_PER_LEVEL = 10;
const ENEMY_SPEED_BASE = 0.025; // % per frame at level 1

interface Enemy {
  id: number;
  value: number;
  x: number;
  y: number;
  isCorrect: boolean;
  hit: boolean;
  missed: boolean;
}

let enemyCounter = 0;

export default function MathShooterPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const activeChildId = localStorage.getItem("taaloum_active_child_id");

  const [gameState, setGameState] = useState<"menu" | "playing" | "levelComplete" | "gameOver">("menu");
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [comboMessage, setComboMessage] = useState("");

  const [question, setQuestion] = useState<MathQuestion | null>(null);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [explosions, setExplosions] = useState<{ id: number; x: number; y: number }[]>([]);

  const animRef = useRef<number | null>(null);
  const spawnedRef = useRef(false);

  const diff = getDifficultyForLevel(level);
  const enemySpeed = ENEMY_SPEED_BASE * (1 + (level - 1) * 0.06);

  const spawnWave = useCallback(() => {
    const q = generateQuestion(level);
    setQuestion(q);

    const correctIdx = Math.floor(Math.random() * 4);
    const newEnemies: Enemy[] = [];
    const usedValues = new Set<number>();
    usedValues.add(q.answer);

    for (let i = 0; i < 4; i++) {
      const isCorrect = i === correctIdx;
      let value: number;
      if (isCorrect) {
        value = q.answer;
      } else {
        do {
          const offset = Math.floor(Math.random() * Math.max(5, Math.abs(q.answer))) - 2;
          value = q.answer + (offset === 0 ? (i + 1) : offset);
        } while (usedValues.has(value) || value < 0);
        usedValues.add(value);
      }

      newEnemies.push({
        id: ++enemyCounter,
        value,
        x: 10 + (i * 22) + Math.random() * 5,
        y: -5 - Math.random() * 15,
        isCorrect,
        hit: false,
        missed: false,
      });
    }

    setEnemies(newEnemies);
    spawnedRef.current = true;
  }, [level]);

  const startGame = () => {
    enemyCounter = 0;
    setGameState("playing");
    setLevel(1);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setLives(MAX_LIVES);
    setQuestionIndex(0);
    setTotalXp(0);
    setEnemies([]);
    setQuestion(null);
    setComboMessage("");
    spawnedRef.current = false;
  };

  // Spawn wave when playing
  useEffect(() => {
    if (gameState !== "playing") return;
    if (questionIndex >= QUESTIONS_PER_LEVEL) return;
    if (!spawnedRef.current) {
      const timer = setTimeout(() => spawnWave(), 600);
      return () => clearTimeout(timer);
    }
  }, [gameState, questionIndex, spawnWave]);

  // Animation loop - move enemies down
  useEffect(() => {
    if (gameState !== "playing") return;

    const tick = () => {
      setEnemies(prev => {
        let lostLife = false;
        const updated = prev.map(e => {
          if (e.hit || e.missed) return e;
          const newY = e.y + enemySpeed;
          if (newY > 95) {
            if (e.isCorrect) {
              lostLife = true;
              return { ...e, y: newY, missed: true };
            }
            return { ...e, y: newY, missed: true };
          }
          return { ...e, y: newY };
        });

        if (lostLife) {
          setCombo(0);
          setComboMessage("");
          setLives(l => {
            const nl = l - 1;
            if (nl <= 0) {
              setTimeout(() => {
                setGameState("gameOver");
                saveScore();
              }, 300);
            }
            return nl;
          });
          // Move to next wave
          setTimeout(() => advanceWave(), 800);
        }

        // All enemies off screen or hit -> check if wave done
        const allDone = updated.every(e => e.hit || e.missed || e.y > 100);
        if (allDone && updated.length > 0 && !lostLife) {
          // wave already resolved via shoot
        }

        return updated.filter(e => !(e.missed && e.y > 110));
      });

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [gameState, enemySpeed]);

  const advanceWave = () => {
    spawnedRef.current = false;
    setQuestionIndex(idx => {
      const next = idx + 1;
      if (next >= QUESTIONS_PER_LEVEL) {
        const xp = diff.xpPerWin;
        setTotalXp(x => x + xp);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
        setGameState("levelComplete");
      }
      return next;
    });
  };

  const shootEnemy = (enemy: Enemy) => {
    if (enemy.hit || enemy.missed) return;

    if (enemy.isCorrect) {
      // Hit correct!
      setEnemies(prev => prev.map(e => e.id === enemy.id ? { ...e, hit: true } : { ...e, missed: true }));
      setExplosions(prev => [...prev, { id: enemy.id, x: enemy.x, y: enemy.y }]);
      setTimeout(() => setExplosions(prev => prev.filter(ex => ex.id !== enemy.id)), 600);

      const points = 100 + Math.max(0, Math.round((85 - enemy.y) * 2));
      setScore(s => s + points);
      const nc = combo + 1;
      setCombo(nc);
      if (nc > maxCombo) setMaxCombo(nc);

      if (nc === 3) setComboMessage("Allahu Akbar ! 💪");
      else if (nc === 5) setComboMessage("Mash'Allah ! 🔥");
      else if (nc === 10) setComboMessage("SubhanAllah ! ⚡");
      else setComboMessage("");

      setTimeout(() => advanceWave(), 500);
    } else {
      // Hit wrong enemy
      setEnemies(prev => prev.map(e => e.id === enemy.id ? { ...e, hit: true } : e));
      setExplosions(prev => [...prev, { id: enemy.id, x: enemy.x, y: enemy.y }]);
      setTimeout(() => setExplosions(prev => prev.filter(ex => ex.id !== enemy.id)), 600);

      setCombo(0);
      setComboMessage("");
      setLives(l => {
        const nl = l - 1;
        if (nl <= 0) {
          setTimeout(() => { setGameState("gameOver"); saveScore(); }, 300);
        }
        return nl;
      });
      setTimeout(() => advanceWave(), 800);
    }
  };

  const goNextLevel = () => {
    setLevel(l => l + 1);
    setQuestionIndex(0);
    setLives(MAX_LIVES);
    setEnemies([]);
    setQuestion(null);
    setGameState("playing");
    setComboMessage("");
    spawnedRef.current = false;
  };

  const saveScore = async () => {
    if (!user || !activeChildId) return;
    try {
      await supabase.from("math_scores" as any).insert({
        child_id: activeChildId,
        game_type: "math_shooter",
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
          activity_type: "math_shooter",
        });
      }
    } catch (e) {
      console.error("Failed to save math shooter score:", e);
    }
  };

  // --- MENU ---
  if (gameState === "menu") {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="flex items-center gap-3 p-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border shadow-sm">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <Crosshair size={22} className="text-pink-500" />
          <h1 className="text-lg font-bold text-foreground">🚀 Math Shooter</h1>
        </div>

        <div className="px-6 flex flex-col items-center gap-6 pt-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-500/30 to-red-500/20 flex items-center justify-center text-6xl border-4 border-pink-500/30"
          >
            🚀
          </motion.div>

          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-foreground">{t("mathGames.mathShooter" as any) || "Math Shooter"}</h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              {t("mathGames.mathShooterDesc" as any) || "Tire sur la bonne réponse ! Les ennemis descendent... vise juste !"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full max-w-xs text-center">
            <div className="bg-card border border-border rounded-xl p-3">
              <p className="text-lg font-bold text-primary">4</p>
              <p className="text-[10px] text-muted-foreground">{t("mathGames.targets" as any) || "Cibles"}</p>
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
    <div className="min-h-screen bg-background flex flex-col overflow-hidden select-none">
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

      {/* Level + Progress */}
      <div className="px-4 mb-1 z-10">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>{t("mathGames.level" as any) || "Niveau"} {level} {diff.label}</span>
          <span>{Math.min(questionIndex + 1, QUESTIONS_PER_LEVEL)}/{QUESTIONS_PER_LEVEL}</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(questionIndex / QUESTIONS_PER_LEVEL) * 100}%` }} />
        </div>
      </div>

      {/* Question display */}
      <div className="text-center py-3 z-10">
        {question && (
          <motion.p
            key={`q-${questionIndex}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-foreground"
          >
            {question.display} = ?
          </motion.p>
        )}
        {combo > 0 && (
          <p className="text-xs text-muted-foreground mt-1">🔥 Combo: {combo}</p>
        )}
        <AnimatePresence>
          {comboMessage && (
            <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-sm font-bold text-amber-500 mt-1">
              {comboMessage}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Game field */}
      <div className="flex-1 relative mx-3 mb-3 rounded-2xl bg-gradient-to-b from-muted/30 to-muted/60 border border-border overflow-hidden">
        {/* Stars background */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-muted-foreground/20"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
          />
        ))}

        {/* Enemies */}
        <AnimatePresence>
          {enemies.filter(e => !e.missed).map(enemy => (
            <motion.button
              key={enemy.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: enemy.hit ? 0 : 1,
                scale: enemy.hit ? 1.5 : 1,
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => shootEnemy(enemy)}
              className={`absolute w-16 h-16 rounded-2xl flex flex-col items-center justify-center text-lg font-bold shadow-lg border-2 transition-colors active:scale-90
                ${enemy.hit
                  ? enemy.isCorrect ? "bg-green-500/80 border-green-400 text-white" : "bg-red-500/80 border-red-400 text-white"
                  : "bg-card border-border text-foreground hover:border-primary/50"
                }`}
              style={{
                left: `${enemy.x}%`,
                top: `${Math.max(0, Math.min(85, enemy.y))}%`,
                transform: "translate(-50%, -50%)",
              }}
              disabled={enemy.hit}
            >
              <span className="text-xs opacity-60">👾</span>
              <span>{enemy.value}</span>
            </motion.button>
          ))}
        </AnimatePresence>

        {/* Explosions */}
        <AnimatePresence>
          {explosions.map(ex => (
            <motion.div
              key={`ex-${ex.id}`}
              initial={{ opacity: 1, scale: 0.5 }}
              animate={{ opacity: 0, scale: 2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute text-3xl pointer-events-none"
              style={{ left: `${ex.x}%`, top: `${ex.y}%`, transform: "translate(-50%, -50%)" }}
            >
              💥
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Player ship at bottom */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-4xl"
          >
            🚀
          </motion.div>
        </div>

        {/* Danger zone indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-[15%] bg-gradient-to-t from-red-500/10 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
