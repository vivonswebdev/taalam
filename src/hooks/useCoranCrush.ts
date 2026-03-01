import { useState, useCallback, useRef, useEffect } from "react";

// ─── Tile types (Juz 30 surahs) ───────────────────────────
export interface TileType {
  id: string;
  emoji: string;
  name: string;
}

export const TILE_TYPES: TileType[] = [
  { id: "ikhlas", emoji: "🕌", name: "Al-Ikhlas" },
  { id: "falaq", emoji: "🌅", name: "Al-Falaq" },
  { id: "nas", emoji: "👥", name: "An-Nas" },
  { id: "fatiha", emoji: "📖", name: "Al-Fatiha" },
  { id: "kawthar", emoji: "⛲", name: "Al-Kawthar" },
  { id: "asr", emoji: "⏳", name: "Al-Asr" },
  { id: "qadr", emoji: "🌙", name: "Al-Qadr" },
  { id: "fil", emoji: "🐘", name: "Al-Fil" },
];

export interface Cell {
  type: TileType;
  id: number; // unique id for animations
  special?: "bomb_row" | "bomb_col" | "bomb_area" | "rainbow";
  ice?: number; // 0=none, 1=one layer, 2=two layers
}

export type Grid = (Cell | null)[][];

const GRID_SIZE = 8;
const BASE_MOVES = 25;

let _cellId = 0;
function nextId() { return ++_cellId; }

function randomTile(): TileType {
  return TILE_TYPES[Math.floor(Math.random() * TILE_TYPES.length)];
}

function createCell(type?: TileType, ice?: number): Cell {
  return { type: type || randomTile(), id: nextId(), ice };
}

// Check if placing tile creates a match (used for initial generation)
function wouldMatch(grid: Grid, row: number, col: number, type: TileType): boolean {
  // Horizontal
  if (col >= 2 && grid[row][col - 1]?.type.id === type.id && grid[row][col - 2]?.type.id === type.id) return true;
  // Vertical
  if (row >= 2 && grid[row - 1]?.[col]?.type.id === type.id && grid[row - 2]?.[col]?.type.id === type.id) return true;
  return false;
}

function generateGrid(level: number): Grid {
  const grid: Grid = [];
  const iceChance = level > 10 ? Math.min(0.3, (level - 10) * 0.01) : 0;

  for (let r = 0; r < GRID_SIZE; r++) {
    grid[r] = [];
    for (let c = 0; c < GRID_SIZE; c++) {
      let tile = randomTile();
      let attempts = 0;
      while (wouldMatch(grid, r, c, tile) && attempts < 20) {
        tile = randomTile();
        attempts++;
      }
      const ice = Math.random() < iceChance ? (Math.random() < 0.3 ? 2 : 1) : 0;
      grid[r][c] = createCell(tile, ice);
    }
  }
  return grid;
}

// ─── Match finding ────────────────────────────────────────
interface Match {
  cells: [number, number][];
  type: TileType;
  length: number;
  direction: "h" | "v";
}

function findMatches(grid: Grid): Match[] {
  const matches: Match[] = [];

  // Horizontal
  for (let r = 0; r < GRID_SIZE; r++) {
    let c = 0;
    while (c < GRID_SIZE) {
      const cell = grid[r][c];
      if (!cell) { c++; continue; }
      let end = c + 1;
      while (end < GRID_SIZE && grid[r][end]?.type.id === cell.type.id) end++;
      const len = end - c;
      if (len >= 3) {
        const cells: [number, number][] = [];
        for (let i = c; i < end; i++) cells.push([r, i]);
        matches.push({ cells, type: cell.type, length: len, direction: "h" });
      }
      c = end;
    }
  }

  // Vertical
  for (let c = 0; c < GRID_SIZE; c++) {
    let r = 0;
    while (r < GRID_SIZE) {
      const cell = grid[r][c];
      if (!cell) { r++; continue; }
      let end = r + 1;
      while (end < GRID_SIZE && grid[end]?.[c]?.type.id === cell.type.id) end++;
      const len = end - r;
      if (len >= 3) {
        const cells: [number, number][] = [];
        for (let i = r; i < end; i++) cells.push([i, c]);
        matches.push({ cells, type: cell.type, length: len, direction: "v" });
      }
      r = end;
    }
  }

  return matches;
}

// ─── Remove matched cells & handle specials ───────────────
function removeMatches(grid: Grid, matches: Match[]): { cleared: number; grid: Grid } {
  const newGrid = grid.map(row => [...row]);
  let cleared = 0;
  const toRemove = new Set<string>();

  for (const match of matches) {
    // Create special tiles for match-4 and match-5
    if (match.length === 4) {
      // Mark first cell as bomb
      const [r, c] = match.cells[0];
      if (newGrid[r][c]) {
        newGrid[r][c] = {
          ...newGrid[r][c]!,
          special: match.direction === "h" ? "bomb_row" : "bomb_col",
        };
      }
      // Remove rest
      for (let i = 1; i < match.cells.length; i++) {
        toRemove.add(`${match.cells[i][0]},${match.cells[i][1]}`);
      }
    } else if (match.length >= 5) {
      const [r, c] = match.cells[0];
      if (newGrid[r][c]) {
        newGrid[r][c] = { ...newGrid[r][c]!, special: "bomb_area" };
      }
      for (let i = 1; i < match.cells.length; i++) {
        toRemove.add(`${match.cells[i][0]},${match.cells[i][1]}`);
      }
    } else {
      for (const [r, c] of match.cells) {
        toRemove.add(`${r},${c}`);
      }
    }
  }

  // Actually remove cells
  for (const key of toRemove) {
    const [r, c] = key.split(",").map(Number);
    const cell = newGrid[r][c];
    if (cell) {
      // Handle ice layers
      if (cell.ice && cell.ice > 0) {
        newGrid[r][c] = { ...cell, ice: cell.ice - 1 };
      } else {
        // Handle special explosions
        if (cell.special === "bomb_row") {
          for (let cc = 0; cc < GRID_SIZE; cc++) { newGrid[r][cc] = null; cleared++; }
        } else if (cell.special === "bomb_col") {
          for (let rr = 0; rr < GRID_SIZE; rr++) { newGrid[rr][c] = null; cleared++; }
        } else if (cell.special === "bomb_area") {
          for (let dr = -2; dr <= 2; dr++) {
            for (let dc = -2; dc <= 2; dc++) {
              const nr = r + dr, nc = c + dc;
              if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
                newGrid[nr][nc] = null;
                cleared++;
              }
            }
          }
        } else {
          newGrid[r][c] = null;
          cleared++;
        }
      }
    }
  }

  return { cleared, grid: newGrid };
}

// ─── Gravity (drop tiles down) ────────────────────────────
function applyGravity(grid: Grid): Grid {
  const newGrid = grid.map(row => [...row]);

  for (let c = 0; c < GRID_SIZE; c++) {
    // Collect non-null cells from bottom
    const column: (Cell | null)[] = [];
    for (let r = GRID_SIZE - 1; r >= 0; r--) {
      if (newGrid[r][c]) column.push(newGrid[r][c]);
    }
    // Fill column from bottom, add new tiles on top
    for (let r = GRID_SIZE - 1; r >= 0; r--) {
      const idx = GRID_SIZE - 1 - r;
      if (idx < column.length) {
        newGrid[r][c] = column[idx];
      } else {
        newGrid[r][c] = createCell();
      }
    }
  }

  return newGrid;
}

// ─── Check if swap is adjacent ────────────────────────────
function isAdjacent(r1: number, c1: number, r2: number, c2: number): boolean {
  return (Math.abs(r1 - r2) + Math.abs(c1 - c2)) === 1;
}

// ─── Check if any moves possible ──────────────────────────
function hasValidMoves(grid: Grid): boolean {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      // Try swap right
      if (c + 1 < GRID_SIZE) {
        const temp = grid[r][c];
        const g = grid.map(row => [...row]);
        g[r][c] = g[r][c + 1];
        g[r][c + 1] = temp;
        if (findMatches(g).length > 0) return true;
      }
      // Try swap down
      if (r + 1 < GRID_SIZE) {
        const temp = grid[r][c];
        const g = grid.map(row => [...row]);
        g[r][c] = g[r + 1][c];
        g[r + 1][c] = temp;
        if (findMatches(g).length > 0) return true;
      }
    }
  }
  return false;
}

// ─── Level system ─────────────────────────────────────────
export interface LevelConfig {
  level: number;
  targetScore: number;
  moves: number;
  tileCount: number; // how many tile types to use
}

function getLevelConfig(level: number): LevelConfig {
  const baseMoves = Math.max(15, BASE_MOVES - Math.floor(level / 10));
  const targetScore = 500 + level * 200;
  const tileCount = Math.min(TILE_TYPES.length, 4 + Math.floor(level / 5));
  return { level, targetScore, moves: baseMoves, tileCount };
}

// ─── Main Hook ────────────────────────────────────────────
export interface CrushState {
  grid: Grid;
  score: number;
  movesLeft: number;
  level: number;
  combo: number;
  maxCombo: number;
  selected: [number, number] | null;
  gameOver: boolean;
  levelComplete: boolean;
  targetScore: number;
  cascading: boolean;
  matchedCells: Set<string>;
  totalCleared: number;
}

const CRUSH_LEVEL_KEY = "coran_crush_level";
const CRUSH_HIGHSCORE_KEY = "coran_crush_highscore";

function loadLevel(): number {
  try { return parseInt(localStorage.getItem(CRUSH_LEVEL_KEY) || "1", 10); } catch { return 1; }
}

export function useCoranCrush() {
  const savedLevel = loadLevel();
  const [state, setState] = useState<CrushState>(() => {
    const config = getLevelConfig(savedLevel);
    return {
      grid: generateGrid(savedLevel),
      score: 0,
      movesLeft: config.moves,
      level: savedLevel,
      combo: 0,
      maxCombo: 0,
      selected: null,
      gameOver: false,
      levelComplete: false,
      targetScore: config.targetScore,
      cascading: false,
      matchedCells: new Set(),
      totalCleared: 0,
    };
  });

  const cascadeTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const processMatches = useCallback((grid: Grid, combo: number, score: number, totalCleared: number) => {
    const matches = findMatches(grid);
    if (matches.length === 0) {
      // No more matches - check if grid needs shuffle
      let finalGrid = grid;
      if (!hasValidMoves(finalGrid)) {
        finalGrid = generateGrid(state.level);
      }
      setState(prev => ({
        ...prev,
        grid: finalGrid,
        combo: 0,
        maxCombo: Math.max(prev.maxCombo, combo),
        cascading: false,
        matchedCells: new Set(),
        score,
        totalCleared,
      }));
      return;
    }

    // Mark matched cells for animation
    const matchedSet = new Set<string>();
    matches.forEach(m => m.cells.forEach(([r, c]) => matchedSet.add(`${r},${c}`)));

    setState(prev => ({ ...prev, matchedCells: matchedSet, cascading: true }));

    // After animation delay, remove and apply gravity
    cascadeTimeoutRef.current = setTimeout(() => {
      const newCombo = combo + 1;
      const comboMultiplier = Math.min(newCombo, 8);
      const { cleared, grid: clearedGrid } = removeMatches(grid, matches);
      const points = cleared * 10 * comboMultiplier;
      const newScore = score + points;
      const newTotalCleared = totalCleared + cleared;
      const newGrid = applyGravity(clearedGrid);

      // Recursively check for cascades
      processMatches(newGrid, newCombo, newScore, newTotalCleared);
    }, 300);
  }, [state.level]);

  const selectCell = useCallback((row: number, col: number) => {
    if (state.cascading || state.gameOver || state.levelComplete) return;

    setState(prev => {
      if (!prev.selected) {
        return { ...prev, selected: [row, col] };
      }

      const [sr, sc] = prev.selected;

      // Deselect if same cell
      if (sr === row && sc === col) {
        return { ...prev, selected: null };
      }

      // If not adjacent, select new cell
      if (!isAdjacent(sr, sc, row, col)) {
        return { ...prev, selected: [row, col] };
      }

      // Swap tiles
      const newGrid = prev.grid.map(r => [...r]);
      const temp = newGrid[sr][sc];
      newGrid[sr][sc] = newGrid[row][col];
      newGrid[row][col] = temp;

      // Check if swap creates a match
      const matches = findMatches(newGrid);
      if (matches.length === 0) {
        // Invalid swap - revert
        return { ...prev, selected: null };
      }

      // Valid swap!
      const newMoves = prev.movesLeft - 1;
      const isGameOver = newMoves <= 0 && prev.score < prev.targetScore;

      // Start cascade processing
      setTimeout(() => processMatches(newGrid, 0, prev.score, prev.totalCleared), 50);

      return {
        ...prev,
        grid: newGrid,
        selected: null,
        movesLeft: newMoves,
        gameOver: isGameOver && matches.length === 0,
        cascading: true,
      };
    });
  }, [state.cascading, state.gameOver, state.levelComplete, processMatches]);

  // Check level complete / game over after score updates
  useEffect(() => {
    if (state.cascading) return;

    if (state.score >= state.targetScore && !state.levelComplete) {
      setState(prev => ({ ...prev, levelComplete: true }));
      const nextLvl = state.level + 1;
      localStorage.setItem(CRUSH_LEVEL_KEY, String(nextLvl));
      const prev = parseInt(localStorage.getItem(CRUSH_HIGHSCORE_KEY) || "0", 10);
      if (state.score > prev) localStorage.setItem(CRUSH_HIGHSCORE_KEY, String(state.score));
    }

    if (state.movesLeft <= 0 && state.score < state.targetScore && !state.gameOver && !state.cascading) {
      setState(prev => ({ ...prev, gameOver: true }));
    }
  }, [state.score, state.movesLeft, state.targetScore, state.cascading, state.levelComplete, state.gameOver, state.level]);

  const nextLevel = useCallback(() => {
    const lvl = state.level + 1;
    const config = getLevelConfig(lvl);
    setState({
      grid: generateGrid(lvl),
      score: 0,
      movesLeft: config.moves,
      level: lvl,
      combo: 0,
      maxCombo: 0,
      selected: null,
      gameOver: false,
      levelComplete: false,
      targetScore: config.targetScore,
      cascading: false,
      matchedCells: new Set(),
      totalCleared: 0,
    });
  }, [state.level]);

  const restart = useCallback(() => {
    const config = getLevelConfig(state.level);
    setState({
      grid: generateGrid(state.level),
      score: 0,
      movesLeft: config.moves,
      level: state.level,
      combo: 0,
      maxCombo: 0,
      selected: null,
      gameOver: false,
      levelComplete: false,
      targetScore: config.targetScore,
      cascading: false,
      matchedCells: new Set(),
      totalCleared: 0,
    });
  }, [state.level]);

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (cascadeTimeoutRef.current) clearTimeout(cascadeTimeoutRef.current);
    };
  }, []);

  return {
    ...state,
    selectCell,
    nextLevel,
    restart,
    gridSize: GRID_SIZE,
    highScore: parseInt(localStorage.getItem(CRUSH_HIGHSCORE_KEY) || "0", 10),
  };
}
