import { useRef, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Star, RotateCcw, Play, Trophy, Medal } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useSound } from "@/hooks/useSound";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import {
  createInitialState,
  updateGame,
  renderGame,
  saveHighScore,
  getHighScore,
  saveGameStats,
  QURAN_VERSES,
  QUIZ_QUESTIONS,
  MAZE_COLS,
  MAZE_ROWS,
  MAX_LEVEL,
  type GameState,
  type Direction,
} from "@/lib/sheytanGameEngine";

interface LeaderboardEntry {
  id: string;
  player_name: string;
  score: number;
  level: number;
  created_at: string;
}

export default function KidsSheytanGame() {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { play: playSound } = useSound();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [screen, setScreen] = useState<"menu" | "game" | "quiz" | "gameover" | "leaderboard" | "savescore">("menu");
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [highScore] = useState(getHighScore);
  const gameRef = useRef<GameState | null>(null);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef(0);
  const dirRef = useRef<Direction>("none");
  const prevDotsRef = useRef(0);
  const prevPhaseRef = useRef<string>("playing");

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLb, setLoadingLb] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const CELL_SIZE = 20;
  const CANVAS_W = MAZE_COLS * CELL_SIZE;
  const CANVAS_H = MAZE_ROWS * CELL_SIZE;

  // ─── Leaderboard fetch ─────
  const fetchLeaderboard = useCallback(async () => {
    setLoadingLb(true);
    try {
      const { data } = await supabase
        .from("sheytan_game_scores" as any)
        .select("id, player_name, score, level, created_at")
        .order("score", { ascending: false })
        .limit(10);
      setLeaderboard((data as any as LeaderboardEntry[]) || []);
    } catch { /* ignore */ }
    setLoadingLb(false);
  }, []);

  // ─── Save score ─────
  const saveScore = useCallback(async () => {
    if (!playerName.trim() || !gameState) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("sheytan_game_scores" as any).insert({
        player_name: playerName.trim().slice(0, 16),
        score: gameState.score,
        level: gameState.level + 1,
        verses_collected: gameState.collectedVerses,
        user_id: user?.id || null,
      } as any);
      setSaved(true);
    } catch { /* ignore */ }
    setSaving(false);
  }, [playerName, gameState]);

  // ─── Start game ─────
  const startGame = useCallback((level = 0, score = 0, verses: string[] = [], lives = 3) => {
    const state = createInitialState(level, score, verses, lives);
    gameRef.current = state;
    setGameState(state);
    setScreen("game");
    lastTimeRef.current = 0;
    dirRef.current = "none";
    prevDotsRef.current = 0;
    prevPhaseRef.current = "playing";
    setSaved(false);
  }, []);

  // ─── Game loop ─────
  useEffect(() => {
    if (screen !== "game") return;

    const loop = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = time;

      if (gameRef.current) {
        if (dirRef.current !== "none") {
          gameRef.current.player.nextDirection = dirRef.current;
          if (gameRef.current.player.direction === "none") {
            gameRef.current.player.direction = dirRef.current;
          }
        }

        const updated = updateGame(gameRef.current, CELL_SIZE, dt);
        gameRef.current = updated;

        // ─── Sound effects ─────
        if (updated.dotsCollected > prevDotsRef.current) {
          playSound("collectDing");
        }
        prevDotsRef.current = updated.dotsCollected;

        if (updated.phase === "powerUp" && prevPhaseRef.current !== "powerUp") {
          playSound("powerUpSubhanAllah");
        }
        prevPhaseRef.current = updated.phase;

        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) renderGame(ctx, updated, CELL_SIZE, CANVAS_W, CANVAS_H);
        }

        if (updated.phase === "gameOver") {
          playSound("gameOverAstaghfirullah");
          saveHighScore(updated.score);
          saveGameStats(updated.collectedVerses);
          setGameState(updated);
          setScreen("savescore");
          return;
        }
        if (updated.phase === "levelComplete") {
          playSound("levelUp");
          saveHighScore(updated.score);
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

  // ─── Keyboard ─────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp": case "w": dirRef.current = "up"; e.preventDefault(); break;
        case "ArrowDown": case "s": dirRef.current = "down"; e.preventDefault(); break;
        case "ArrowLeft": case "a": dirRef.current = "left"; e.preventDefault(); break;
        case "ArrowRight": case "d": dirRef.current = "right"; e.preventDefault(); break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // ─── Touch ─────
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 15) return;
    dirRef.current = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");
    touchStart.current = null;
  };
  const setDir = (d: Direction) => { dirRef.current = d; };

  // ─── Quiz ─────
  const answerQuiz = (correct: boolean) => {
    if (correct) setQuizScore(prev => prev + 1);
    if (quizIdx + 1 >= QUIZ_QUESTIONS.length) {
      setTimeout(() => {
        if (gameState) {
          const nextLevel = gameState.level + 1;
          if (nextLevel < MAX_LEVEL) {
            startGame(nextLevel, gameState.score, gameState.collectedVerses, gameState.lives);
          } else {
            saveGameStats(gameState.collectedVerses);
            setScreen("savescore");
          }
        }
      }, 800);
    } else {
      setQuizIdx(prev => prev + 1);
    }
  };

  const langKey = (obj: Record<string, string>) => obj[lang] || obj.fr || obj.en;

  // ─── MENU ─────
  if (screen === "menu") {
    return (
      <div className="min-h-screen pb-24 flex flex-col items-center justify-center bg-gradient-to-b from-emerald-950 to-background">
        <div className="px-5 pt-12 w-full max-w-lg">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center mb-4">
            <ArrowLeft size={18} className="text-foreground" />
          </button>
        </div>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center px-6">
          <span className="text-6xl mb-4 block">🛡️</span>
          <h1 className="text-2xl font-bold text-foreground mb-2">{t("sheytanGame.title" as any)}</h1>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">{t("sheytanGame.subtitle" as any)}</p>

          {highScore > 0 && (
            <div className="flex items-center justify-center gap-2 mb-4">
              <Trophy size={16} className="text-yellow-400" />
              <span className="text-sm font-semibold text-yellow-400">{t("sheytanGame.highScore" as any)}: {highScore}</span>
            </div>
          )}

          <div className="flex flex-col gap-3 items-center">
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => startGame(0)}
              className="px-8 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-lg flex items-center gap-2 active:scale-95 transition-transform">
              <Play size={20} /> {t("sheytanGame.play" as any)}
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }}
              onClick={() => { fetchLeaderboard(); setScreen("leaderboard"); }}
              className="px-6 py-2.5 rounded-xl bg-yellow-500/20 text-yellow-300 font-bold text-sm flex items-center gap-2 border border-yellow-500/30">
              <Medal size={16} /> {t("sheytanGame.leaderboard" as any)}
            </motion.button>
          </div>

          <div className="mt-6 text-xs text-muted-foreground space-y-1">
            <p>🕹️ {t("sheytanGame.controlsHint" as any)}</p>
            <p>🛡️ {t("sheytanGame.powerUpHint" as any)}</p>
            <p>🗺️ {t("sheytanGame.levelsHint" as any)}</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── LEADERBOARD ─────
  if (screen === "leaderboard") {
    return (
      <div className="min-h-screen pb-24 flex flex-col items-center bg-gradient-to-b from-emerald-950 to-background px-6 pt-12">
        <div className="w-full max-w-sm">
          <button onClick={() => setScreen("menu")} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center mb-4">
            <ArrowLeft size={18} className="text-foreground" />
          </button>
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Medal className="text-yellow-400" size={22} /> {t("sheytanGame.leaderboard" as any)}
          </h2>
          {loadingLb ? (
            <p className="text-muted-foreground text-sm text-center py-8">{t("sheytanGame.loading" as any)}</p>
          ) : leaderboard.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">{t("sheytanGame.noScores" as any)}</p>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry, i) => (
                <motion.div key={entry.id} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${i === 0 ? "bg-yellow-500/10 border-yellow-500/30" : i === 1 ? "bg-gray-300/10 border-gray-400/20" : i === 2 ? "bg-orange-500/10 border-orange-500/20" : "bg-card border-border"}`}>
                  <span className={`text-lg font-bold w-8 text-center ${i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-orange-400" : "text-muted-foreground"}`}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{entry.player_name}</p>
                    <p className="text-[10px] text-muted-foreground">Lv.{entry.level}</p>
                  </div>
                  <span className="text-sm font-bold text-primary">{entry.score}</span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── SAVE SCORE ─────
  if (screen === "savescore") {
    return (
      <div className="min-h-screen pb-24 flex flex-col items-center justify-center bg-gradient-to-b from-emerald-950 to-background px-6">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center w-full max-w-sm">
          <span className="text-5xl mb-3 block">{(gameState?.level ?? 0) >= MAX_LEVEL - 1 ? "🏆" : "🌙"}</span>
          <h2 className="text-xl font-bold text-foreground mb-2">
            {(gameState?.level ?? 0) >= MAX_LEVEL - 1 ? t("sheytanGame.victory" as any) : t("sheytanGame.gameOver" as any)}
          </h2>
          <p className="text-3xl font-bold text-primary mb-1">{gameState?.score ?? 0}</p>
          <p className="text-xs text-muted-foreground mb-4">{t("sheytanGame.points" as any)}</p>

          {!saved ? (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">{t("sheytanGame.enterName" as any)}</p>
              <input
                type="text"
                maxLength={16}
                value={playerName}
                onChange={e => setPlayerName(e.target.value.replace(/[^\p{L}\p{N}\s]/gu, "").slice(0, 16))}
                placeholder={t("sheytanGame.namePlaceholder" as any)}
                className="w-full px-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <motion.button whileTap={{ scale: 0.95 }} onClick={saveScore} disabled={saving || !playerName.trim()}
                className="w-full px-6 py-2.5 rounded-xl bg-yellow-500 text-black font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                <Trophy size={16} /> {saving ? "..." : t("sheytanGame.saveScore" as any)}
              </motion.button>
            </div>
          ) : (
            <p className="text-sm text-green-400 mb-4">✅ {t("sheytanGame.scoreSaved" as any)}</p>
          )}

          {(gameState?.collectedVerses?.length ?? 0) > 0 && (
            <div className="mb-4 p-3 rounded-xl bg-card/50 border border-border text-left max-w-xs mx-auto">
              <p className="text-[10px] font-semibold text-muted-foreground mb-1 uppercase">{t("sheytanGame.versesCollected" as any)}</p>
              {gameState?.collectedVerses.map(vk => {
                const verse = QURAN_VERSES.find(v => v.key === vk);
                return verse ? <p key={vk} className="text-xs text-foreground mb-1" dir="rtl">{verse.ar}</p> : null;
              })}
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => startGame(0)}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center gap-2">
              <RotateCcw size={16} /> {t("sheytanGame.retry" as any)}
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }}
              onClick={() => { fetchLeaderboard(); setScreen("leaderboard"); }}
              className="px-6 py-2.5 rounded-xl bg-yellow-500/20 text-yellow-300 font-bold text-sm flex items-center gap-2 border border-yellow-500/30">
              <Medal size={16} /> {t("sheytanGame.leaderboard" as any)}
            </motion.button>
          </div>
          <button onClick={() => setScreen("menu")} className="mt-3 text-xs text-muted-foreground underline">
            {t("sheytanGame.menu" as any)}
          </button>
        </motion.div>
      </div>
    );
  }

  // ─── QUIZ ─────
  if (screen === "quiz") {
    const q = QUIZ_QUESTIONS[quizIdx];
    return (
      <div className="min-h-screen pb-24 flex flex-col items-center justify-center bg-gradient-to-b from-emerald-950 to-background px-6">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-sm text-center">
          <span className="text-4xl mb-3 block">📖</span>
          <h2 className="text-lg font-bold text-foreground mb-1">{t("sheytanGame.quizTitle" as any)}</h2>
          <p className="text-xs text-muted-foreground mb-2">
            Lv.{(gameState?.level ?? 0) + 1} → Lv.{(gameState?.level ?? 0) + 2}
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            {t("sheytanGame.question" as any)} {quizIdx + 1}/{QUIZ_QUESTIONS.length}
          </p>
          <p className="text-sm font-semibold text-foreground mb-4">{langKey(q.question)}</p>
          <div className="space-y-2">
            {q.options.map((opt, i) => (
              <motion.button key={i} whileTap={{ scale: 0.97 }} onClick={() => answerQuiz(opt.correct)}
                className="w-full py-3 px-4 rounded-xl bg-card border border-border text-sm font-medium text-foreground active:bg-primary/20 transition-colors">
                {langKey(opt.text)}
              </motion.button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">✅ {quizScore}/{quizIdx + (quizIdx < QUIZ_QUESTIONS.length ? 0 : 1)}</p>
        </motion.div>
      </div>
    );
  }

  // ─── GAME ─────
  return (
    <div className="min-h-screen flex flex-col items-center bg-[#0a1a0f] select-none"
      onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
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
        <span className="text-xs text-muted-foreground">Lv.{(gameState?.level ?? 0) + 1}/{MAX_LEVEL}</span>
      </div>

      {/* Power-up indicator */}
      <AnimatePresence>
        {gameState?.powerUpType && (
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
            className={`text-xs font-bold px-3 py-1 rounded-full mb-1 ${
              gameState.powerUpType === "ayatul_kursi" ? "bg-blue-500/30 text-blue-300" : "bg-emerald-500/30 text-emerald-300"
            }`}>
            🛡️ {gameState.powerUpType === "ayatul_kursi" ? t("sheytanGame.kursiActive" as any) : t("sheytanGame.lailahaActive" as any)}
            {" "}({Math.ceil(gameState.powerUpTimer)}s)
          </motion.div>
        )}
      </AnimatePresence>

      {/* Canvas */}
      <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H}
        className="rounded-lg border border-emerald-900/50"
        style={{ imageRendering: "pixelated", maxWidth: "95vw", aspectRatio: `${CANVAS_W}/${CANVAS_H}` }} />

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
