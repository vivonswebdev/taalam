import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Pause, Play, RotateCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useSound } from "@/hooks/useSound";
import Confetti from "@/components/Confetti";

// ─── Constants ─────────────────────────────────────────
const COLS = 10;
const ROWS = 20;
const CELL_SIZE = "minmax(0,1fr)";

type Cell = number; // 0 = empty, 1-7 = piece colors
type Grid = Cell[][];

// ─── Tetrominoes with Islamic emojis ───────────────────
const PIECES = [
  { shape: [[1,1,1,1]], emoji: "☪️", color: "bg-cyan-500" },           // I
  { shape: [[1,1],[1,1]], emoji: "🕌", color: "bg-amber-500" },        // O
  { shape: [[0,1],[0,1],[1,1]], emoji: "🌙", color: "bg-blue-500" },   // L
  { shape: [[1,0],[1,0],[1,1]], emoji: "📜", color: "bg-orange-500" }, // J
  { shape: [[0,1,0],[1,1,1]], emoji: "⭐", color: "bg-purple-500" },   // T
  { shape: [[0,1,1],[1,1,0]], emoji: "🌀", color: "bg-green-500" },    // S
  { shape: [[1,1,0],[0,1,1]], emoji: "⚡", color: "bg-red-500" },      // Z
];

const PIECE_COLORS = [
  "", // 0 = empty
  "bg-cyan-500/80 border-cyan-400",
  "bg-amber-500/80 border-amber-400",
  "bg-blue-500/80 border-blue-400",
  "bg-orange-500/80 border-orange-400",
  "bg-purple-500/80 border-purple-400",
  "bg-green-500/80 border-green-400",
  "bg-red-500/80 border-red-400",
];

// ─── Level config ──────────────────────────────────────
interface LevelConfig {
  dropMs: number;
  formsCount: number;
  linesTarget: number;
  badge: string;
}

function getLevelConfig(level: number): LevelConfig {
  if (level <= 10) return { dropMs: 500, formsCount: 4, linesTarget: 10, badge: "📖" };
  if (level <= 20) return { dropMs: 400, formsCount: 5, linesTarget: 20, badge: "🕋" };
  if (level <= 30) return { dropMs: 300, formsCount: 7, linesTarget: 30, badge: "🌟" };
  if (level <= 40) return { dropMs: 250, formsCount: 7, linesTarget: 50, badge: "🏆" };
  if (level <= 50) return { dropMs: 200, formsCount: 7, linesTarget: 100, badge: "📗" };
  return { dropMs: Math.max(100, 200 - (level - 50) * 5), formsCount: 7, linesTarget: Infinity, badge: "♾️" };
}

function xpForLevel(level: number): number {
  if (level <= 10) return 15;
  if (level <= 20) return 25;
  if (level <= 30) return 40;
  if (level <= 40) return 60;
  return 100;
}

// ─── Helpers ───────────────────────────────────────────
function createEmptyGrid(): Grid {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function rotatePiece(shape: number[][]): number[][] {
  const rows = shape.length, cols = shape[0].length;
  const rotated: number[][] = Array.from({ length: cols }, () => Array(rows).fill(0));
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      rotated[c][rows - 1 - r] = shape[r][c];
  return rotated;
}

function canPlace(grid: Grid, shape: number[][], row: number, col: number): boolean {
  for (let r = 0; r < shape.length; r++)
    for (let c = 0; c < shape[0].length; c++)
      if (shape[r][c]) {
        const nr = row + r, nc = col + c;
        if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return false;
        if (grid[nr][nc]) return false;
      }
  return true;
}

function placePiece(grid: Grid, shape: number[][], row: number, col: number, colorIdx: number): Grid {
  const ng = grid.map(r => [...r]);
  for (let r = 0; r < shape.length; r++)
    for (let c = 0; c < shape[0].length; c++)
      if (shape[r][c]) ng[row + r][col + c] = colorIdx;
  return ng;
}

function clearLines(grid: Grid): { newGrid: Grid; cleared: number } {
  const remaining = grid.filter(row => row.some(c => c === 0));
  const cleared = ROWS - remaining.length;
  const newRows = Array.from({ length: cleared }, () => Array(COLS).fill(0));
  return { newGrid: [...newRows, ...remaining], cleared };
}

function getGhostRow(grid: Grid, shape: number[][], row: number, col: number): number {
  let gr = row;
  while (canPlace(grid, shape, gr + 1, col)) gr++;
  return gr;
}

// ─── Random bag ────────────────────────────────────────
function randomPieceIdx(formsCount: number): number {
  return Math.floor(Math.random() * Math.min(formsCount, PIECES.length));
}

// ════════════════════════════════════════════════════════
export default function TetrisIslamPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { play } = useSound();
  const activeChildId = localStorage.getItem("taaloum_active_child_id");

  const [gameState, setGameState] = useState<"menu" | "playing" | "paused" | "levelComplete" | "gameOver">("menu");
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [linesCleared, setLinesCleared] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [combo, setCombo] = useState(0);

  const [grid, setGrid] = useState<Grid>(createEmptyGrid);
  const [currentPiece, setCurrentPiece] = useState(0);
  const [currentShape, setCurrentShape] = useState(PIECES[0].shape);
  const [pieceRow, setPieceRow] = useState(0);
  const [pieceCol, setPieceCol] = useState(3);
  const [nextPiece, setNextPiece] = useState(1);
  const [holdPiece, setHoldPiece] = useState<number | null>(null);
  const [canHold, setCanHold] = useState(true);

  const dropRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const config = getLevelConfig(level);

  // ─── Spawn piece ─────────────────────────────────────
  const spawnPiece = useCallback((pieceIdx: number) => {
    const shape = PIECES[pieceIdx].shape;
    const startCol = Math.floor((COLS - shape[0].length) / 2);
    if (!canPlace(grid, shape, 0, startCol)) {
      setGameState("gameOver");
      saveScore();
      return;
    }
    setCurrentPiece(pieceIdx);
    setCurrentShape(shape);
    setPieceRow(0);
    setPieceCol(startCol);
    setNextPiece(randomPieceIdx(config.formsCount));
    setCanHold(true);
  }, [grid, config.formsCount]);

  // ─── Start game ──────────────────────────────────────
  const startGame = () => {
    const g = createEmptyGrid();
    setGrid(g);
    setLevel(1);
    setScore(0);
    setLinesCleared(0);
    setTotalXp(0);
    setCombo(0);
    setHoldPiece(null);

    const first = randomPieceIdx(getLevelConfig(1).formsCount);
    const next = randomPieceIdx(getLevelConfig(1).formsCount);
    const shape = PIECES[first].shape;
    setCurrentPiece(first);
    setCurrentShape(shape);
    setPieceRow(0);
    setPieceCol(Math.floor((COLS - shape[0].length) / 2));
    setNextPiece(next);
    setCanHold(true);
    setGameState("playing");
  };

  // ─── Lock piece and check lines ─────────────────────
  const lockPiece = useCallback(() => {
    const newGrid = placePiece(grid, currentShape, pieceRow, pieceCol, currentPiece + 1);
    const { newGrid: clearedGrid, cleared } = clearLines(newGrid);
    setGrid(clearedGrid);

    if (cleared > 0) {
      play("collectDing");
      const lineScore = cleared === 1 ? 100 : cleared === 2 ? 300 : cleared === 3 ? 500 : 800;
      const comboBonus = combo * 50;
      setScore(s => s + lineScore + comboBonus);
      setCombo(c => c + 1);
      setLinesCleared(l => {
        const newTotal = l + cleared;
        // Check level complete
        if (newTotal >= config.linesTarget && config.linesTarget !== Infinity) {
          const xp = xpForLevel(level);
          setTotalXp(x => x + xp);
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 2500);
          play("levelUp");
          setTimeout(() => setGameState("levelComplete"), 300);
        }
        return newTotal;
      });
    } else {
      setCombo(0);
    }

    // Spawn next
    setTimeout(() => {
      if (gameState === "playing" || gameState === "paused") {
        spawnPiece(nextPiece);
      }
    }, 50);
  }, [grid, currentShape, pieceRow, pieceCol, currentPiece, nextPiece, combo, config.linesTarget, level, gameState, spawnPiece, play]);

  // ─── Drop tick ───────────────────────────────────────
  useEffect(() => {
    if (gameState !== "playing") {
      if (dropRef.current) clearInterval(dropRef.current);
      return;
    }

    dropRef.current = setInterval(() => {
      setPieceRow(r => {
        if (canPlace(grid, currentShape, r + 1, pieceCol)) {
          return r + 1;
        } else {
          // Lock next frame
          setTimeout(() => lockPiece(), 0);
          return r;
        }
      });
    }, config.dropMs);

    return () => { if (dropRef.current) clearInterval(dropRef.current); };
  }, [gameState, config.dropMs, grid, currentShape, pieceCol, lockPiece]);

  // ─── Controls ────────────────────────────────────────
  const moveLeft = () => {
    if (gameState !== "playing") return;
    if (canPlace(grid, currentShape, pieceRow, pieceCol - 1)) setPieceCol(c => c - 1);
  };
  const moveRight = () => {
    if (gameState !== "playing") return;
    if (canPlace(grid, currentShape, pieceRow, pieceCol + 1)) setPieceCol(c => c + 1);
  };
  const moveDown = () => {
    if (gameState !== "playing") return;
    if (canPlace(grid, currentShape, pieceRow + 1, pieceCol)) {
      setPieceRow(r => r + 1);
      setScore(s => s + 1);
    }
  };
  const hardDrop = () => {
    if (gameState !== "playing") return;
    const ghostR = getGhostRow(grid, currentShape, pieceRow, pieceCol);
    const bonus = (ghostR - pieceRow) * 2;
    setScore(s => s + bonus);
    setPieceRow(ghostR);
    setTimeout(() => lockPiece(), 30);
  };
  const rotate = () => {
    if (gameState !== "playing") return;
    const rotated = rotatePiece(currentShape);
    // Try normal, then wall kicks
    for (const dx of [0, -1, 1, -2, 2]) {
      if (canPlace(grid, rotated, pieceRow, pieceCol + dx)) {
        setCurrentShape(rotated);
        setPieceCol(c => c + dx);
        return;
      }
    }
  };
  const doHold = () => {
    if (gameState !== "playing" || !canHold) return;
    setCanHold(false);
    if (holdPiece === null) {
      setHoldPiece(currentPiece);
      spawnPiece(nextPiece);
    } else {
      const prev = holdPiece;
      setHoldPiece(currentPiece);
      const shape = PIECES[prev].shape;
      const startCol = Math.floor((COLS - shape[0].length) / 2);
      setCurrentPiece(prev);
      setCurrentShape(shape);
      setPieceRow(0);
      setPieceCol(startCol);
    }
  };

  // Keyboard
  useEffect(() => {
    if (gameState !== "playing") return;
    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft": e.preventDefault(); moveLeft(); break;
        case "ArrowRight": e.preventDefault(); moveRight(); break;
        case "ArrowDown": e.preventDefault(); moveDown(); break;
        case "ArrowUp": e.preventDefault(); rotate(); break;
        case " ": e.preventDefault(); hardDrop(); break;
        case "c": case "C": doHold(); break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [gameState, grid, currentShape, pieceRow, pieceCol]);

  // Touch controls
  const touchStartRef = useRef<{ x: number; y: number; t: number } | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, t: Date.now() };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const dt = Date.now() - touchStartRef.current.t;
    touchStartRef.current = null;

    const absDx = Math.abs(dx), absDy = Math.abs(dy);

    if (absDx < 15 && absDy < 15 && dt < 200) {
      rotate();
    } else if (absDy > absDx && dy > 40) {
      hardDrop();
    } else if (absDx > absDy) {
      if (dx > 25) moveRight();
      else if (dx < -25) moveLeft();
    }
  };

  // ─── Go next level ──────────────────────────────────
  const goNextLevel = () => {
    setLevel(l => l + 1);
    setLinesCleared(0);
    setGrid(createEmptyGrid());
    setCombo(0);
    setHoldPiece(null);

    const nextConfig = getLevelConfig(level + 1);
    const first = randomPieceIdx(nextConfig.formsCount);
    const shape = PIECES[first].shape;
    setCurrentPiece(first);
    setCurrentShape(shape);
    setPieceRow(0);
    setPieceCol(Math.floor((COLS - shape[0].length) / 2));
    setNextPiece(randomPieceIdx(nextConfig.formsCount));
    setCanHold(true);
    setGameState("playing");
  };

  // ─── Save score ──────────────────────────────────────
  const saveScore = async () => {
    if (!user || !activeChildId) return;
    try {
      await supabase.from("math_scores" as any).insert({
        child_id: activeChildId,
        game_type: "tetris_islam",
        score,
        level,
        max_combo: combo,
        operations: "tetris",
        xp_earned: totalXp,
      } as any);
      if (totalXp > 0) {
        await supabase.from("children_points").insert({
          child_id: activeChildId,
          parent_id: user.id,
          points: totalXp,
          activity_type: "tetris_islam",
        });
      }
    } catch (e) {
      console.error("Failed to save tetris score:", e);
    }
  };

  // ─── Build display grid ──────────────────────────────
  const displayGrid = grid.map(r => [...r]);
  // Ghost piece
  const ghostRow = getGhostRow(grid, currentShape, pieceRow, pieceCol);
  if (gameState === "playing") {
    // Draw ghost
    for (let r = 0; r < currentShape.length; r++)
      for (let c = 0; c < currentShape[0].length; c++)
        if (currentShape[r][c] && ghostRow + r >= 0 && ghostRow + r < ROWS)
          if (!displayGrid[ghostRow + r][pieceCol + c])
            displayGrid[ghostRow + r][pieceCol + c] = -1; // ghost marker

    // Draw current piece
    for (let r = 0; r < currentShape.length; r++)
      for (let c = 0; c < currentShape[0].length; c++)
        if (currentShape[r][c] && pieceRow + r >= 0 && pieceRow + r < ROWS)
          displayGrid[pieceRow + r][pieceCol + c] = currentPiece + 1;
  }

  // ─── Mini piece preview ──────────────────────────────
  const renderMiniPiece = (pieceIdx: number | null) => {
    if (pieceIdx === null) return <div className="w-12 h-12" />;
    const shape = PIECES[pieceIdx].shape;
    return (
      <div className="flex flex-col items-center gap-0.5">
        {shape.map((row, ri) => (
          <div key={ri} className="flex gap-0.5">
            {row.map((cell, ci) => (
              <div
                key={ci}
                className={`w-3 h-3 rounded-sm ${cell ? PIECE_COLORS[pieceIdx + 1].split(" ")[0] : "bg-transparent"}`}
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  // ═══ MENU ════════════════════════════════════════════
  if (gameState === "menu") {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="flex items-center gap-3 p-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border shadow-sm">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-2xl">🕌</span>
          <h1 className="text-lg font-bold text-foreground">
            {t("tetrisIslam.title" as any) || "Tetris Islam"}
          </h1>
        </div>

        <div className="px-6 flex flex-col items-center gap-6 pt-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-36 h-36 rounded-3xl bg-gradient-to-br from-emerald-500/30 to-teal-500/20 flex items-center justify-center border-4 border-emerald-500/30"
          >
            <div className="text-center">
              <span className="text-5xl block">🕌</span>
              <span className="text-xs text-muted-foreground mt-1 block">Mushaf Builder</span>
            </div>
          </motion.div>

          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-foreground">
              {t("tetrisIslam.title" as any) || "Tetris Islam"}
            </h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              {t("tetrisIslam.desc" as any) || "Remplis le Mushaf avec des tetrominoes ! Complète des lignes pour mémoriser le Coran."}
            </p>
          </div>

          {/* Pieces preview */}
          <div className="flex gap-3 flex-wrap justify-center">
            {PIECES.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex flex-col items-center gap-1 bg-card border border-border rounded-xl p-2"
              >
                <span className="text-lg">{p.emoji}</span>
                {renderMiniPiece(i)}
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 w-full max-w-xs text-center">
            <div className="bg-card border border-border rounded-xl p-3">
              <p className="text-lg font-bold text-primary">50+</p>
              <p className="text-[10px] text-muted-foreground">{t("mathGames.levels" as any) || "Niveaux"}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-3">
              <p className="text-lg font-bold text-emerald-500">7</p>
              <p className="text-[10px] text-muted-foreground">{t("tetrisIslam.pieces" as any) || "Pièces"}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-3">
              <p className="text-lg font-bold text-amber-500">∞</p>
              <p className="text-[10px] text-muted-foreground">XP</p>
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

  // ═══ GAME OVER ═══════════════════════════════════════
  if (gameState === "gameOver") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
          <span className="text-7xl">🕌</span>
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
            <p className="text-xl font-bold text-emerald-500">{linesCleared}</p>
            <p className="text-[10px] text-muted-foreground">{t("tetrisIslam.lines" as any) || "Lignes"}</p>
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

  // ═══ LEVEL COMPLETE ══════════════════════════════════
  if (gameState === "levelComplete") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-6">
        {showConfetti && <Confetti active={showConfetti} emoji />}
        <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring" }}>
          <span className="text-7xl">{config.badge}</span>
        </motion.div>
        <h2 className="text-2xl font-bold text-foreground">
          {t("mathGames.levelComplete" as any) || "Niveau"} {level} {t("mathGames.completed" as any) || "réussi"} !
        </h2>
        <p className="text-sm text-muted-foreground">Score: {score} | {t("tetrisIslam.lines" as any) || "Lignes"}: {linesCleared}</p>
        <p className="text-lg font-bold text-green-500">+{xpForLevel(level)} XP</p>

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

  // ═══ PLAYING / PAUSED ════════════════════════════════
  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 z-10">
        <button onClick={() => { saveScore(); navigate(-1); }} className="w-8 h-8 rounded-lg bg-card flex items-center justify-center border border-border">
          <ArrowLeft size={14} className="text-foreground" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground">
            {t("mathGames.level" as any) || "Niv."} {level} {config.badge}
          </span>
          <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
            <Star size={12} fill="currentColor" /> {score}
          </div>
        </div>
        <button
          onClick={() => setGameState(gameState === "paused" ? "playing" : "paused")}
          className="w-8 h-8 rounded-lg bg-card flex items-center justify-center border border-border"
        >
          {gameState === "paused" ? <Play size={14} /> : <Pause size={14} />}
        </button>
      </div>

      {/* Progress bar */}
      {config.linesTarget !== Infinity && (
        <div className="px-3 mb-1">
          <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
            <span>{t("tetrisIslam.lines" as any) || "Lignes"}</span>
            <span>{linesCleared}/{config.linesTarget}</span>
          </div>
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(100, (linesCleared / config.linesTarget) * 100)}%` }} />
          </div>
        </div>
      )}

      {/* Main game area */}
      <div className="flex-1 flex gap-2 px-2 pb-2">
        {/* Side panel left: hold */}
        <div className="flex flex-col gap-2 w-14">
          <div className="bg-card border border-border rounded-xl p-1.5 flex flex-col items-center">
            <span className="text-[9px] text-muted-foreground font-semibold mb-1">HOLD</span>
            {renderMiniPiece(holdPiece)}
          </div>
          <button onClick={doHold} className="text-[9px] bg-muted rounded-lg py-1 text-muted-foreground font-semibold">
            C
          </button>
        </div>

        {/* Grid */}
        <div
          className="flex-1 border-2 border-border rounded-xl overflow-hidden bg-card/50 relative"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          style={{ aspectRatio: `${COLS}/${ROWS}` }}
        >
          <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${COLS}, ${CELL_SIZE})`, gridTemplateRows: `repeat(${ROWS}, ${CELL_SIZE})` }}>
            {displayGrid.flat().map((cell, idx) => (
              <div
                key={idx}
                className={`border border-border/20 ${
                  cell === -1
                    ? "bg-muted-foreground/10 border-dashed border-muted-foreground/20"
                    : cell > 0
                      ? `${PIECE_COLORS[cell]} border`
                      : ""
                }`}
              />
            ))}
          </div>

          {/* Pause overlay */}
          {gameState === "paused" && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-20">
              <div className="text-center space-y-3">
                <span className="text-4xl">⏸️</span>
                <p className="text-sm font-bold text-foreground">{t("tetrisIslam.paused" as any) || "Pause"}</p>
                <button onClick={() => setGameState("playing")} className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-bold text-sm">
                  ▶️ {t("tetrisIslam.resume" as any) || "Reprendre"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Side panel right: next */}
        <div className="flex flex-col gap-2 w-14">
          <div className="bg-card border border-border rounded-xl p-1.5 flex flex-col items-center">
            <span className="text-[9px] text-muted-foreground font-semibold mb-1">NEXT</span>
            {renderMiniPiece(nextPiece)}
          </div>
          <div className="bg-card border border-border rounded-xl p-1.5 text-center">
            <span className="text-[9px] text-muted-foreground">🔥</span>
            <p className="text-xs font-bold text-foreground">{combo}</p>
          </div>
        </div>
      </div>

      {/* Touch controls */}
      <div className="grid grid-cols-5 gap-1.5 px-3 pb-3">
        <button onTouchStart={moveLeft} onClick={moveLeft} className="col-span-1 py-4 bg-card border border-border rounded-xl text-lg font-bold text-foreground active:bg-muted">
          ◀
        </button>
        <button onTouchStart={moveDown} onClick={moveDown} className="col-span-1 py-4 bg-card border border-border rounded-xl text-lg font-bold text-foreground active:bg-muted">
          ▼
        </button>
        <button onTouchStart={hardDrop} onClick={hardDrop} className="col-span-1 py-4 bg-primary/20 border border-primary/30 rounded-xl text-lg font-bold text-primary active:bg-primary/30">
          ⏬
        </button>
        <button onTouchStart={rotate} onClick={rotate} className="col-span-1 py-4 bg-card border border-border rounded-xl text-lg font-bold text-foreground active:bg-muted">
          <RotateCw size={18} className="mx-auto" />
        </button>
        <button onTouchStart={moveRight} onClick={moveRight} className="col-span-1 py-4 bg-card border border-border rounded-xl text-lg font-bold text-foreground active:bg-muted">
          ▶
        </button>
      </div>
    </div>
  );
}
