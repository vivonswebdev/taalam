import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, Star, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getDifficultyForLevel } from "@/data/mathDifficultyConfig";
import Confetti from "@/components/Confetti";

// --- Types ---
type CellValue = number | null;

interface Tile {
  id: number;
  value: number;
  row: number;
  col: number;
  merged?: boolean;
  isNew?: boolean;
}

const GRID = 4;
const WIN_TARGET_BASE = 64;
const LEVELS_PER_TARGET_BUMP = 5;

let tileIdCounter = 0;
const nextId = () => ++tileIdCounter;

// --- Helpers ---
function emptyGrid(): CellValue[][] {
  return Array.from({ length: GRID }, () => Array(GRID).fill(null));
}

function gridFromTiles(tiles: Tile[]): CellValue[][] {
  const g = emptyGrid();
  tiles.forEach((t) => { g[t.row][t.col] = t.value; });
  return g;
}

function getEmptyCells(tiles: Tile[]): [number, number][] {
  const occupied = new Set(tiles.map((t) => `${t.row},${t.col}`));
  const empty: [number, number][] = [];
  for (let r = 0; r < GRID; r++)
    for (let c = 0; c < GRID; c++)
      if (!occupied.has(`${r},${c}`)) empty.push([r, c]);
  return empty;
}

function spawnTile(tiles: Tile[], count = 1): Tile[] {
  const empties = getEmptyCells(tiles);
  const spawned: Tile[] = [];
  for (let i = 0; i < count && empties.length > 0; i++) {
    const idx = Math.floor(Math.random() * empties.length);
    const [r, c] = empties.splice(idx, 1)[0];
    spawned.push({ id: nextId(), value: Math.random() < 0.9 ? 2 : 4, row: r, col: c, isNew: true });
  }
  return spawned;
}

function slideLine(line: (Tile | null)[]): { result: (Tile | null)[]; scoreGained: number; merged: boolean } {
  const nonNull = line.filter(Boolean) as Tile[];
  const result: (Tile | null)[] = [];
  let scoreGained = 0;
  let merged = false;
  let i = 0;
  while (i < nonNull.length) {
    if (i + 1 < nonNull.length && nonNull[i].value === nonNull[i + 1].value) {
      const mergedVal = nonNull[i].value * 2;
      result.push({ ...nonNull[i], value: mergedVal, merged: true });
      scoreGained += mergedVal;
      merged = true;
      i += 2;
    } else {
      result.push({ ...nonNull[i], merged: false });
      i++;
    }
  }
  while (result.length < GRID) result.push(null);
  return { result, scoreGained, merged };
}

type Direction = "up" | "down" | "left" | "right";

function moveTiles(tiles: Tile[], dir: Direction): { newTiles: Tile[]; scoreGained: number; moved: boolean } {
  let totalScore = 0;
  let anyMoved = false;
  const newTiles: Tile[] = [];

  for (let i = 0; i < GRID; i++) {
    let line: (Tile | null)[] = [];
    for (let j = 0; j < GRID; j++) {
      const [r, c] = dir === "left" ? [i, j] : dir === "right" ? [i, GRID - 1 - j] : dir === "up" ? [j, i] : [GRID - 1 - j, i];
      const tile = tiles.find((t) => t.row === r && t.col === c) || null;
      line.push(tile);
    }

    const { result, scoreGained, merged } = slideLine(line);
    totalScore += scoreGained;

    result.forEach((tile, j) => {
      if (!tile) return;
      const [nr, nc] = dir === "left" ? [i, j] : dir === "right" ? [i, GRID - 1 - j] : dir === "up" ? [j, i] : [GRID - 1 - j, i];
      if (tile.row !== nr || tile.col !== nc || tile.merged) anyMoved = true;
      newTiles.push({ ...tile, row: nr, col: nc, isNew: false });
    });
  }

  return { newTiles, scoreGained: totalScore, moved: anyMoved };
}

function canMove(tiles: Tile[]): boolean {
  if (tiles.length < GRID * GRID) return true;
  const grid = gridFromTiles(tiles);
  for (let r = 0; r < GRID; r++)
    for (let c = 0; c < GRID; c++) {
      if (c + 1 < GRID && grid[r][c] === grid[r][c + 1]) return true;
      if (r + 1 < GRID && grid[r][c] === grid[r + 1][c]) return true;
    }
  return false;
}

// --- Colors ---
const TILE_COLORS: Record<number, string> = {
  2: "bg-amber-100 text-amber-900",
  4: "bg-amber-200 text-amber-900",
  8: "bg-orange-300 text-white",
  16: "bg-orange-400 text-white",
  32: "bg-orange-500 text-white",
  64: "bg-red-400 text-white",
  128: "bg-yellow-400 text-yellow-900",
  256: "bg-yellow-500 text-white",
  512: "bg-yellow-600 text-white",
  1024: "bg-green-500 text-white",
  2048: "bg-primary text-primary-foreground",
};

function getTileClass(val: number) {
  return TILE_COLORS[val] || "bg-primary text-primary-foreground";
}

function getTileSize(val: number) {
  if (val >= 1024) return "text-lg";
  if (val >= 128) return "text-xl";
  return "text-2xl";
}

// --- Component ---
export default function CalcMergePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const activeChildId = localStorage.getItem("taaloum_active_child_id");

  const [gameState, setGameState] = useState<"menu" | "playing" | "won" | "lost">("menu");
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    try { return parseInt(localStorage.getItem("calcmerge_best") || "0"); } catch { return 0; }
  });
  const [level, setLevel] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [totalXp, setTotalXp] = useState(0);

  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const animating = useRef(false);

  const winTarget = WIN_TARGET_BASE * Math.pow(2, Math.floor((level - 1) / LEVELS_PER_TARGET_BUMP));

  const startGame = useCallback(() => {
    tileIdCounter = 0;
    const initial = spawnTile([], 2);
    setTiles(initial);
    setScore(0);
    setLevel(1);
    setTotalXp(0);
    setGameState("playing");
  }, []);

  const handleMove = useCallback((dir: Direction) => {
    if (animating.current) return;
    animating.current = true;

    setTiles((prev) => {
      const { newTiles, scoreGained, moved } = moveTiles(prev, dir);
      if (!moved) {
        animating.current = false;
        return prev;
      }

      const withSpawn = [...newTiles, ...spawnTile(newTiles, 1)];

      setScore((s) => {
        const ns = s + scoreGained;
        setBestScore((b) => {
          const nb = Math.max(b, ns);
          try { localStorage.setItem("calcmerge_best", String(nb)); } catch {}
          return nb;
        });
        return ns;
      });

      // Check win
      const maxVal = Math.max(...withSpawn.map((t) => t.value));
      if (maxVal >= winTarget) {
        setTimeout(() => {
          const diff = getDifficultyForLevel(level);
          setTotalXp((x) => x + diff.xpPerWin);
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 2000);
          setGameState("won");
        }, 200);
      } else if (!canMove(withSpawn)) {
        setTimeout(() => {
          setGameState("lost");
          saveScore();
        }, 300);
      }

      setTimeout(() => { animating.current = false; }, 100);
      return withSpawn;
    });
  }, [winTarget, level]);

  const goNextLevel = () => {
    tileIdCounter = 0;
    const initial = spawnTile([], 2);
    setTiles(initial);
    setLevel((l) => l + 1);
    setScore(0);
    setGameState("playing");
  };

  const saveScore = async () => {
    if (!user || !activeChildId) return;
    try {
      await supabase.from("math_scores" as any).insert({
        child_id: activeChildId,
        game_type: "calc_merge",
        score,
        level,
        max_combo: 0,
        operations: "+",
        xp_earned: totalXp,
      } as any);

      if (totalXp > 0) {
        await supabase.from("children_points").insert({
          child_id: activeChildId,
          parent_id: user.id,
          points: totalXp,
          activity_type: "math_calc_merge",
        });
      }
    } catch (e) {
      console.error("Failed to save calc merge score:", e);
    }
  };

  // Keyboard
  useEffect(() => {
    if (gameState !== "playing") return;
    const handler = (e: KeyboardEvent) => {
      const map: Record<string, Direction> = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" };
      if (map[e.key]) { e.preventDefault(); handleMove(map[e.key]); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [gameState, handleMove]);

  // Touch swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current || gameState !== "playing") return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    const absDx = Math.abs(dx), absDy = Math.abs(dy);
    if (Math.max(absDx, absDy) < 30) return;
    if (absDx > absDy) handleMove(dx > 0 ? "right" : "left");
    else handleMove(dy > 0 ? "down" : "up");
    touchStart.current = null;
  };

  // --- MENU ---
  if (gameState === "menu") {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="flex items-center gap-3 p-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border shadow-sm">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-2xl">🧩</span>
          <h1 className="text-lg font-bold text-foreground">Calc Merge</h1>
        </div>

        <div className="px-6 flex flex-col items-center gap-6 pt-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500/30 to-indigo-500/20 flex items-center justify-center text-6xl border-4 border-blue-500/30"
          >
            🧩
          </motion.div>

          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-foreground">{t("mathGames.calcMerge" as any) || "Calc Merge"}</h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              {t("mathGames.calcMergeDesc" as any) || "Fusionne les tuiles identiques pour atteindre l'objectif ! Glisse dans toutes les directions."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full max-w-xs text-center">
            <div className="bg-card border border-border rounded-xl p-3">
              <p className="text-lg font-bold text-primary">4×4</p>
              <p className="text-[10px] text-muted-foreground">{t("mathGames.grid" as any) || "Grille"}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-3">
              <p className="text-lg font-bold text-amber-500">{bestScore}</p>
              <p className="text-[10px] text-muted-foreground">{t("mathGames.bestScore" as any) || "Meilleur"}</p>
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
  if (gameState === "lost") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
          <span className="text-7xl">💥</span>
        </motion.div>
        <h2 className="text-2xl font-bold text-foreground">{t("mathGames.gameOver" as any) || "Partie terminée !"}</h2>
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-primary">{score}</p>
            <p className="text-[10px] text-muted-foreground">Score</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-amber-500">{level}</p>
            <p className="text-[10px] text-muted-foreground">{t("mathGames.level" as any) || "Niveau"}</p>
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

  // --- WON ---
  if (gameState === "won") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-6">
        {showConfetti && <Confetti active={showConfetti} />}
        <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring" }}>
          <span className="text-7xl">⭐</span>
        </motion.div>
        <h2 className="text-2xl font-bold text-foreground">
          {t("mathGames.levelComplete" as any) || "Niveau"} {level} {t("mathGames.completed" as any) || "réussi"} !
        </h2>
        <p className="text-sm text-muted-foreground">Score: {score} | 🎯 {winTarget}</p>
        <p className="text-lg font-bold text-green-500">+{getDifficultyForLevel(level).xpPerWin} XP</p>

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
    <div
      className="min-h-screen bg-background flex flex-col"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <button onClick={() => { saveScore(); navigate(-1); }} className="w-9 h-9 rounded-xl bg-card flex items-center justify-center border border-border">
          <ArrowLeft size={16} className="text-foreground" />
        </button>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
            <Star size={14} fill="currentColor" /> {score}
          </div>
          <div className="flex items-center gap-1 text-muted-foreground text-xs">
            <Trophy size={12} /> {bestScore}
          </div>
        </div>
        <button onClick={startGame} className="w-9 h-9 rounded-xl bg-card flex items-center justify-center border border-border">
          <RotateCcw size={14} className="text-foreground" />
        </button>
      </div>

      {/* Level + Target */}
      <div className="px-4 mb-3">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{t("mathGames.level" as any) || "Niveau"} {level}</span>
          <span>🎯 {t("mathGames.target" as any) || "Objectif"}: {winTarget}</span>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="relative w-full max-w-[340px] aspect-square bg-muted rounded-2xl p-2">
          {/* Background cells */}
          <div className="grid grid-cols-4 gap-2 w-full h-full">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-muted-foreground/10" />
            ))}
          </div>

          {/* Tiles */}
          <AnimatePresence>
            {tiles.map((tile) => {
              const cellSize = `calc((100% - 40px) / 4)`;
              const gap = 8;
              return (
                <motion.div
                  key={tile.id}
                  layout
                  initial={tile.isNew ? { scale: 0, opacity: 0 } : false}
                  animate={{
                    scale: tile.merged ? [1, 1.15, 1] : 1,
                    opacity: 1,
                    left: `calc(${tile.col} * (25% - 2px) + ${tile.col * gap + 8}px)`,
                    top: `calc(${tile.row} * (25% - 2px) + ${tile.row * gap + 8}px)`,
                  }}
                  transition={{ duration: 0.12, ease: "easeOut" }}
                  className={`absolute rounded-xl flex items-center justify-center font-bold shadow-sm ${getTileClass(tile.value)} ${getTileSize(tile.value)}`}
                  style={{
                    width: cellSize,
                    height: cellSize,
                  }}
                >
                  {tile.value}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Swipe hint */}
      <p className="text-center text-xs text-muted-foreground py-4">
        {t("mathGames.swipeHint" as any) || "⬆️⬇️⬅️➡️ Glisse pour fusionner !"}
      </p>
    </div>
  );
}
