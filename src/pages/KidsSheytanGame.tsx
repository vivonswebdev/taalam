import { useRef, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Star, RotateCcw, Play, Trophy } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { motion, AnimatePresence } from "framer-motion";
import {
  createInitialState,
  updateGame,
  renderGame,
  saveHighScore,
  getHighScore,
  saveGameStats,
  QURAN_VERSES,
  QUIZ_QUESTIONS,
  type GameState,
  type Direction,
} from "@/lib/sheytanGameEngine";

export default function KidsSheytanGame() {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [screen, setScreen] = useState<"menu" | "game" | "quiz" | "gameover">("menu");
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [highScore] = useState(getHighScore);
  const gameRef = useRef<GameState | null>(null);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef(0);
  const dirRef = useRef<Direction>("none");

  const CELL_SIZE = 20;
  const MAZE_COLS = 19;
  const MAZE_ROWS = 21;
  const CANVAS_W = MAZE_COLS * CELL_SIZE;
  const CANVAS_H = MAZE_ROWS * CELL_SIZE;

  // ─── Start game ─────
  const startGame = useCallback((level = 0) => {
    const state = createInitialState(level);
    gameRef.current = state;
    setGameState(state);
    setScreen("game");
    lastTimeRef.current = 0;
    dirRef.current = "none";
  }, []);

  // ─── Game loop ─────
  useEffect(() => {
    if (screen !== "game") return;

    const loop = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = time;

      if (gameRef.current) {
        // Apply queued direction
        if (dirRef.current !== "none") {
          gameRef.current.player.nextDirection = dirRef.current;
          if (gameRef.current.player.direction === "none") {
            gameRef.current.player.direction = dirRef.current;
          }
        }

        const updated = updateGame(gameRef.current, CELL_SIZE, dt);
        gameRef.current = updated;

        // Render
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) renderGame(ctx, updated, CELL_SIZE, CANVAS_W, CANVAS_H);
        }

        // Check state transitions
        if (updated.phase === "gameOver") {
          saveHighScore(updated.score);
          saveGameStats(updated.collectedVerses);
          setGameState(updated);
          setScreen("gameover");
          return;
        }
        if (updated.phase === "levelComplete") {
          saveHighScore(updated.score);
          saveGameStats(updated.collectedVerses);
          setGameState(updated);
          setQuizIdx(0);
          setQuizScore(0);
          setScreen("quiz");
          return;
        }

        setGameState({ ...updated });
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [screen]);

  // ─── Keyboard controls ─────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp": case "w": dirRef.current = "up"; break;
        case "ArrowDown": case "s": dirRef.current = "down"; break;
        case "ArrowLeft": case "a": dirRef.current = "left"; break;
        case "ArrowRight": case "d": dirRef.current = "right"; break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // ─── Touch controls ─────
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStart.current.x;
    const dy = touch.clientY - touchStart.current.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    if (Math.max(absDx, absDy) < 15) return;
    if (absDx > absDy) {
      dirRef.current = dx > 0 ? "right" : "left";
    } else {
      dirRef.current = dy > 0 ? "down" : "up";
    }
    touchStart.current = null;
  };

  // ─── D-Pad controls ─────
  const setDir = (d: Direction) => { dirRef.current = d; };

  // ─── Quiz answer ─────
  const answerQuiz = (correct: boolean) => {
    if (correct) setQuizScore(prev => prev + 1);
    if (quizIdx + 1 >= QUIZ_QUESTIONS.length) {
      // Quiz done → next level or game over
      setTimeout(() => {
        if (gameState) {
          const nextLevel = gameState.level + 1;
          if (nextLevel < 4) {
            startGame(nextLevel);
          } else {
            setScreen("gameover");
          }
        }
      }, 1000);
    } else {
      setQuizIdx(prev => prev + 1);
    }
  };

  const langKey = (obj: Record<string, string>) => obj[lang] || obj.fr || obj.en;

  // ─── Screens ─────
  if (screen === "menu") {
    return (
      <div className="min-h-screen pb-24 flex flex-col items-center justify-center bg-gradient-to-b from-emerald-950 to-background">
        <div className="px-5 pt-12 w-full max-w-lg">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center mb-4">
            <ArrowLeft size={18} className="text-foreground" />
          </button>
        </div>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center px-6"
        >
          <span className="text-6xl mb-4 block">🛡️</span>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {t("sheytanGame.title" as any)}
          </h1>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
            {t("sheytanGame.subtitle" as any)}
          </p>

          {highScore > 0 && (
            <div className="flex items-center justify-center gap-2 mb-4">
              <Trophy size={16} className="text-yellow-400" />
              <span className="text-sm font-semibold text-yellow-400">
                {t("sheytanGame.highScore" as any)}: {highScore}
              </span>
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => startGame(0)}
            className="px-8 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-lg flex items-center gap-2 mx-auto active:scale-95 transition-transform"
          >
            <Play size={20} /> {t("sheytanGame.play" as any)}
          </motion.button>

          <div className="mt-6 text-xs text-muted-foreground space-y-1">
            <p>🕹️ {t("sheytanGame.controlsHint" as any)}</p>
            <p>🛡️ {t("sheytanGame.powerUpHint" as any)}</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (screen === "quiz") {
    const q = QUIZ_QUESTIONS[quizIdx];
    return (
      <div className="min-h-screen pb-24 flex flex-col items-center justify-center bg-gradient-to-b from-emerald-950 to-background px-6">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-sm text-center">
          <span className="text-4xl mb-3 block">📖</span>
          <h2 className="text-lg font-bold text-foreground mb-1">{t("sheytanGame.quizTitle" as any)}</h2>
          <p className="text-xs text-muted-foreground mb-4">
            {t("sheytanGame.question" as any)} {quizIdx + 1}/{QUIZ_QUESTIONS.length}
          </p>
          <p className="text-sm font-semibold text-foreground mb-4">{langKey(q.question)}</p>
          <div className="space-y-2">
            {q.options.map((opt, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.97 }}
                onClick={() => answerQuiz(opt.correct)}
                className="w-full py-3 px-4 rounded-xl bg-card border border-border text-sm font-medium text-foreground active:bg-primary/20 transition-colors"
              >
                {langKey(opt.text)}
              </motion.button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            ✅ {quizScore}/{quizIdx + (quizIdx < QUIZ_QUESTIONS.length ? 0 : 1)}
          </p>
        </motion.div>
      </div>
    );
  }

  if (screen === "gameover") {
    return (
      <div className="min-h-screen pb-24 flex flex-col items-center justify-center bg-gradient-to-b from-emerald-950 to-background px-6">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <span className="text-5xl mb-3 block">{(gameState?.level ?? 0) >= 3 ? "🏆" : "🌙"}</span>
          <h2 className="text-xl font-bold text-foreground mb-2">
            {(gameState?.level ?? 0) >= 3 ? t("sheytanGame.victory" as any) : t("sheytanGame.gameOver" as any)}
          </h2>
          <p className="text-3xl font-bold text-primary mb-1">{gameState?.score ?? 0}</p>
          <p className="text-xs text-muted-foreground mb-1">{t("sheytanGame.points" as any)}</p>

          {(gameState?.collectedVerses?.length ?? 0) > 0 && (
            <div className="mt-3 mb-4 p-3 rounded-xl bg-card/50 border border-border text-left max-w-xs mx-auto">
              <p className="text-[10px] font-semibold text-muted-foreground mb-1 uppercase">{t("sheytanGame.versesCollected" as any)}</p>
              {gameState?.collectedVerses.map(vk => {
                const verse = QURAN_VERSES.find(v => v.key === vk);
                return verse ? (
                  <p key={vk} className="text-xs text-foreground mb-1" dir="rtl">{verse.ar}</p>
                ) : null;
              })}
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => startGame(0)}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center gap-2"
            >
              <RotateCcw size={16} /> {t("sheytanGame.retry" as any)}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setScreen("menu")}
              className="px-6 py-2.5 rounded-xl bg-muted text-foreground font-bold text-sm"
            >
              {t("sheytanGame.menu" as any)}
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Game screen
  return (
    <div
      className="min-h-screen flex flex-col items-center bg-[#0a1a0f] select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* HUD */}
      <div className="w-full max-w-sm flex items-center justify-between px-4 py-2 mt-2">
        <button onClick={() => { cancelAnimationFrame(rafRef.current); setScreen("menu"); }} className="text-muted-foreground">
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-1">
          {Array.from({ length: gameState?.lives ?? 3 }).map((_, i) => (
            <Heart key={i} size={14} className="text-red-400 fill-red-400" />
          ))}
        </div>
        <div className="flex items-center gap-1 text-sm font-bold text-yellow-400">
          <Star size={14} className="fill-yellow-400" /> {gameState?.score ?? 0}
        </div>
        <span className="text-xs text-muted-foreground">Lv.{(gameState?.level ?? 0) + 1}</span>
      </div>

      {/* Power-up indicator */}
      <AnimatePresence>
        {gameState?.powerUpType && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className={`text-xs font-bold px-3 py-1 rounded-full mb-1 ${
              gameState.powerUpType === "ayatul_kursi" ? "bg-blue-500/30 text-blue-300" : "bg-emerald-500/30 text-emerald-300"
            }`}
          >
            🛡️ {gameState.powerUpType === "ayatul_kursi" ? t("sheytanGame.kursiActive" as any) : t("sheytanGame.lailahaActive" as any)}
            {" "}({Math.ceil(gameState.powerUpTimer)}s)
          </motion.div>
        )}
      </AnimatePresence>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="rounded-lg border border-emerald-900/50"
        style={{ imageRendering: "pixelated", maxWidth: "95vw", aspectRatio: `${CANVAS_W}/${CANVAS_H}` }}
      />

      {/* D-Pad */}
      <div className="mt-4 grid grid-cols-3 gap-1 w-36">
        <div />
        <button onTouchStart={() => setDir("up")} onClick={() => setDir("up")} className="w-12 h-12 rounded-xl bg-muted/40 flex items-center justify-center text-foreground text-lg active:bg-primary/30">▲</button>
        <div />
        <button onTouchStart={() => setDir("left")} onClick={() => setDir("left")} className="w-12 h-12 rounded-xl bg-muted/40 flex items-center justify-center text-foreground text-lg active:bg-primary/30">◀</button>
        <div className="w-12 h-12" />
        <button onTouchStart={() => setDir("right")} onClick={() => setDir("right")} className="w-12 h-12 rounded-xl bg-muted/40 flex items-center justify-center text-foreground text-lg active:bg-primary/30">▶</button>
        <div />
        <button onTouchStart={() => setDir("down")} onClick={() => setDir("down")} className="w-12 h-12 rounded-xl bg-muted/40 flex items-center justify-center text-foreground text-lg active:bg-primary/30">▼</button>
        <div />
      </div>
    </div>
  );
}
