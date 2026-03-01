import { useState, useCallback, useRef, useEffect } from "react";

// ─── Tile types (Juz 30 surahs) ───────────────────────────
export interface TileType {
  id: string;
  emoji: string;
  name: string;
  color: string; // border accent
}

export const TILE_TYPES: TileType[] = [
  { id: "fatiha", emoji: "🕌", name: "Al-Fatiha", color: "hsl(142 70% 45%)" },
  { id: "nas", emoji: "🌙", name: "An-Nas", color: "hsl(220 70% 55%)" },
  { id: "ikhlas", emoji: "☀️", name: "Al-Ikhlas", color: "hsl(45 90% 50%)" },
  { id: "falaq", emoji: "🔥", name: "Al-Falaq", color: "hsl(15 80% 50%)" },
  { id: "masad", emoji: "💎", name: "Al-Masad", color: "hsl(280 60% 55%)" },
];

export interface Cell {
  type: TileType;
  id: number;
  special?: "bomb_row" | "bomb_col" | "bomb_area" | "rainbow";
  ice?: number;
}

export type Grid = (Cell | null)[][];

const GRID_SIZE = 7;
const BASE_MOVES = 22;

let _cellId = 0;
function nextId() { return ++_cellId; }

function randomTile(count: number): TileType {
  return TILE_TYPES[Math.floor(Math.random() * Math.min(count, TILE_TYPES.length))];
}

function createCell(type?: TileType, ice?: number, tileCount?: number): Cell {
  return { type: type || randomTile(tileCount || TILE_TYPES.length), id: nextId(), ice };
}

function wouldMatch(grid: Grid, row: number, col: number, type: TileType): boolean {
  if (col >= 2 && grid[row][col - 1]?.type.id === type.id && grid[row][col - 2]?.type.id === type.id) return true;
  if (row >= 2 && grid[row - 1]?.[col]?.type.id === type.id && grid[row - 2]?.[col]?.type.id === type.id) return true;
  return false;
}

function generateGrid(level: number, tileCount: number): Grid {
  const grid: Grid = [];
  const iceChance = level > 10 ? Math.min(0.3, (level - 10) * 0.01) : 0;

  for (let r = 0; r < GRID_SIZE; r++) {
    grid[r] = [];
    for (let c = 0; c < GRID_SIZE; c++) {
      let tile = randomTile(tileCount);
      let attempts = 0;
      while (wouldMatch(grid, r, c, tile) && attempts < 20) {
        tile = randomTile(tileCount);
        attempts++;
      }
      const ice = Math.random() < iceChance ? (Math.random() < 0.3 ? 2 : 1) : 0;
      grid[r][c] = createCell(tile, ice, tileCount);
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

  for (let r = 0; r < GRID_SIZE; r++) {
    let c = 0;
    while (c < GRID_SIZE) {
      const cell = grid[r][c];
      if (!cell) { c++; continue; }
      let end = c + 1;
      while (end < GRID_SIZE && grid[r][end]?.type.id === cell.type.id) end++;
      if (end - c >= 3) {
        const cells: [number, number][] = [];
        for (let i = c; i < end; i++) cells.push([r, i]);
        matches.push({ cells, type: cell.type, length: end - c, direction: "h" });
      }
      c = end;
    }
  }

  for (let c = 0; c < GRID_SIZE; c++) {
    let r = 0;
    while (r < GRID_SIZE) {
      const cell = grid[r][c];
      if (!cell) { r++; continue; }
      let end = r + 1;
      while (end < GRID_SIZE && grid[end]?.[c]?.type.id === cell.type.id) end++;
      if (end - r >= 3) {
        const cells: [number, number][] = [];
        for (let i = r; i < end; i++) cells.push([i, c]);
        matches.push({ cells, type: cell.type, length: end - r, direction: "v" });
      }
      r = end;
    }
  }

  return matches;
}

function removeMatches(grid: Grid, matches: Match[]): { cleared: number; grid: Grid } {
  const newGrid = grid.map(row => [...row]);
  let cleared = 0;
  const toRemove = new Set<string>();

  for (const match of matches) {
    if (match.length === 4) {
      const [r, c] = match.cells[0];
      if (newGrid[r][c]) {
        newGrid[r][c] = { ...newGrid[r][c]!, special: match.direction === "h" ? "bomb_row" : "bomb_col" };
      }
      for (let i = 1; i < match.cells.length; i++) toRemove.add(`${match.cells[i][0]},${match.cells[i][1]}`);
    } else if (match.length >= 5) {
      const [r, c] = match.cells[0];
      if (newGrid[r][c]) newGrid[r][c] = { ...newGrid[r][c]!, special: "bomb_area" };
      for (let i = 1; i < match.cells.length; i++) toRemove.add(`${match.cells[i][0]},${match.cells[i][1]}`);
    } else {
      for (const [r, c] of match.cells) toRemove.add(`${r},${c}`);
    }
  }

  for (const key of toRemove) {
    const [r, c] = key.split(",").map(Number);
    const cell = newGrid[r][c];
    if (cell) {
      if (cell.ice && cell.ice > 0) {
        newGrid[r][c] = { ...cell, ice: cell.ice - 1 };
      } else {
        if (cell.special === "bomb_row") {
          for (let cc = 0; cc < GRID_SIZE; cc++) { newGrid[r][cc] = null; cleared++; }
        } else if (cell.special === "bomb_col") {
          for (let rr = 0; rr < GRID_SIZE; rr++) { newGrid[rr][c] = null; cleared++; }
        } else if (cell.special === "bomb_area") {
          for (let dr = -2; dr <= 2; dr++) {
            for (let dc = -2; dc <= 2; dc++) {
              const nr = r + dr, nc = c + dc;
              if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) { newGrid[nr][nc] = null; cleared++; }
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

function applyGravity(grid: Grid): Grid {
  const newGrid = grid.map(row => [...row]);

  for (let c = 0; c < GRID_SIZE; c++) {
    const column: (Cell | null)[] = [];
    for (let r = GRID_SIZE - 1; r >= 0; r--) {
      if (newGrid[r][c]) column.push(newGrid[r][c]);
    }
    for (let r = GRID_SIZE - 1; r >= 0; r--) {
      const idx = GRID_SIZE - 1 - r;
      newGrid[r][c] = idx < column.length ? column[idx] : createCell();
    }
  }

  return newGrid;
}

function isAdjacent(r1: number, c1: number, r2: number, c2: number): boolean {
  return (Math.abs(r1 - r2) + Math.abs(c1 - c2)) === 1;
}

function hasValidMoves(grid: Grid): boolean {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (c + 1 < GRID_SIZE) {
        const g = grid.map(row => [...row]);
        const temp = g[r][c]; g[r][c] = g[r][c + 1]; g[r][c + 1] = temp;
        if (findMatches(g).length > 0) return true;
      }
      if (r + 1 < GRID_SIZE) {
        const g = grid.map(row => [...row]);
        const temp = g[r][c]; g[r][c] = g[r + 1][c]; g[r + 1][c] = temp;
        if (findMatches(g).length > 0) return true;
      }
    }
  }
  return false;
}

export interface LevelConfig {
  level: number;
  targetScore: number;
  moves: number;
  tileCount: number;
}

function getLevelConfig(level: number): LevelConfig {
  const moves = Math.max(15, BASE_MOVES - Math.floor(level / 10));
  const targetScore = 400 + level * 150;
  const tileCount = Math.min(TILE_TYPES.length, 4 + Math.floor(level / 8));
  return { level, targetScore, moves, tileCount };
}

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
  lastSwapFailed: [number, number] | null;
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
      grid: generateGrid(savedLevel, config.tileCount),
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
      lastSwapFailed: null,
    };
  });

  const cascadeTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const processMatches = useCallback((grid: Grid, combo: number, score: number, totalCleared: number) => {
    const matches = findMatches(grid);
    if (matches.length === 0) {
      let finalGrid = grid;
      if (!hasValidMoves(finalGrid)) {
        const config = getLevelConfig(state.level);
        finalGrid = generateGrid(state.level, config.tileCount);
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

    const matchedSet = new Set<string>();
    matches.forEach(m => m.cells.forEach(([r, c]) => matchedSet.add(`${r},${c}`)));
    setState(prev => ({ ...prev, matchedCells: matchedSet, cascading: true }));

    cascadeTimeoutRef.current = setTimeout(() => {
      const newCombo = combo + 1;
      const comboMultiplier = Math.min(newCombo, 8);
      const { cleared, grid: clearedGrid } = removeMatches(grid, matches);
      const points = cleared * 10 * comboMultiplier;
      const newGrid = applyGravity(clearedGrid);
      processMatches(newGrid, newCombo, score + points, totalCleared + cleared);
    }, 350);
  }, [state.level]);

  const trySwap = useCallback((r1: number, c1: number, r2: number, c2: number) => {
    if (state.cascading || state.gameOver || state.levelComplete) return;
    if (!isAdjacent(r1, c1, r2, c2)) return;

    setState(prev => {
      const newGrid = prev.grid.map(r => [...r]);
      const temp = newGrid[r1][c1];
      newGrid[r1][c1] = newGrid[r2][c2];
      newGrid[r2][c2] = temp;

      const matches = findMatches(newGrid);
      if (matches.length === 0) {
        return { ...prev, selected: null, lastSwapFailed: [r1, c1] };
      }

      const newMoves = prev.movesLeft - 1;
      setTimeout(() => processMatches(newGrid, 0, prev.score, prev.totalCleared), 50);

      return {
        ...prev,
        grid: newGrid,
        selected: null,
        movesLeft: newMoves,
        cascading: true,
        lastSwapFailed: null,
      };
    });
  }, [state.cascading, state.gameOver, state.levelComplete, processMatches]);

  const selectCell = useCallback((row: number, col: number) => {
    if (state.cascading || state.gameOver || state.levelComplete) return;

    setState(prev => {
      if (!prev.selected) {
        return { ...prev, selected: [row, col], lastSwapFailed: null };
      }
      const [sr, sc] = prev.selected;
      if (sr === row && sc === col) return { ...prev, selected: null };
      if (!isAdjacent(sr, sc, row, col)) return { ...prev, selected: [row, col], lastSwapFailed: null };
      return prev; // will be handled by trySwap
    });

    // If there's a selection, try swap
    if (state.selected) {
      const [sr, sc] = state.selected;
      if (sr !== row || sc !== col) {
        trySwap(sr, sc, row, col);
      }
    }
  }, [state.cascading, state.gameOver, state.levelComplete, state.selected, trySwap]);

  // Check level complete / game over
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

  // Clear failed swap indicator
  useEffect(() => {
    if (state.lastSwapFailed) {
      const t = setTimeout(() => setState(prev => ({ ...prev, lastSwapFailed: null })), 400);
      return () => clearTimeout(t);
    }
  }, [state.lastSwapFailed]);

  const nextLevel = useCallback(() => {
    const lvl = state.level + 1;
    const config = getLevelConfig(lvl);
    setState({
      grid: generateGrid(lvl, config.tileCount),
      score: 0, movesLeft: config.moves, level: lvl, combo: 0, maxCombo: 0,
      selected: null, gameOver: false, levelComplete: false, targetScore: config.targetScore,
      cascading: false, matchedCells: new Set(), totalCleared: 0, lastSwapFailed: null,
    });
  }, [state.level]);

  const restart = useCallback(() => {
    const config = getLevelConfig(state.level);
    setState({
      grid: generateGrid(state.level, config.tileCount),
      score: 0, movesLeft: config.moves, level: state.level, combo: 0, maxCombo: 0,
      selected: null, gameOver: false, levelComplete: false, targetScore: config.targetScore,
      cascading: false, matchedCells: new Set(), totalCleared: 0, lastSwapFailed: null,
    });
  }, [state.level]);

  useEffect(() => {
    return () => { if (cascadeTimeoutRef.current) clearTimeout(cascadeTimeoutRef.current); };
  }, []);

  return {
    ...state,
    selectCell,
    trySwap,
    nextLevel,
    restart,
    gridSize: GRID_SIZE,
    highScore: parseInt(localStorage.getItem(CRUSH_HIGHSCORE_KEY) || "0", 10),
  };
}
