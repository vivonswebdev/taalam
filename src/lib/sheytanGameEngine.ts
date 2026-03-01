/**
 * Chasse aux Sheytans – Canvas Game Engine v2
 * Grid-based Pac-Man movement, multiple maps, leaderboard support
 */

// ─── Types ──────────────────────────────────────────
export interface GameState {
  player: Player;
  enemies: Enemy[];
  collectibles: Collectible[];
  powerUps: PowerUp[];
  maze: number[][];
  score: number;
  lives: number;
  level: number;
  phase: "playing" | "powerUp" | "levelComplete" | "gameOver";
  powerUpTimer: number;
  powerUpType: string | null;
  collectedVerses: string[];
  totalDots: number;
  dotsCollected: number;
  modeTimer: number;
  modePhase: "scatter" | "chase";
}

export interface Player {
  gx: number; gy: number;       // current grid cell
  px: number; py: number;       // pixel position (center)
  direction: Direction;
  nextDirection: Direction;
  speed: number;
  mouthOpen: number;
  mouthDir: number;
  moving: boolean;
}

export interface Enemy {
  gx: number; gy: number;
  px: number; py: number;
  prevDir: Direction;
  color: string;
  speed: number;
  mode: "chase" | "scatter" | "frightened" | "eaten";
  scatterTarget: { x: number; y: number };
  homeX: number; homeY: number;
  moveTimer: number;
}

export interface Collectible {
  x: number; y: number;
  collected: boolean;
  type: "dot" | "verse";
  verseKey?: string;
}

export interface PowerUp {
  x: number; y: number;
  collected: boolean;
  type: "ayatul_kursi" | "la_ilaha";
}

export type Direction = "up" | "down" | "left" | "right" | "none";

// ─── Multiple Maze Definitions (1=wall, 0=path, 2=ghost house) ─────

const MAZE_L1: number[][] = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
  [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
  [1,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,1],
  [1,1,1,1,0,1,0,0,0,0,0,0,0,1,0,1,1,1,1],
  [1,1,1,1,0,1,0,1,1,2,1,1,0,1,0,1,1,1,1],
  [0,0,0,0,0,0,0,1,2,2,2,1,0,0,0,0,0,0,0],
  [1,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,1],
  [1,1,1,1,0,1,0,0,0,0,0,0,0,1,0,1,1,1,1],
  [1,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
  [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
  [1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1],
  [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
  [1,0,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

const MAZE_L2: number[][] = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,0,1,0,1,1,0,1,0,1,1,0,1,0,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,0,1,1,0,1,1,1,1,1,0,1,1,0,1,0,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
  [1,0,1,1,0,1,0,0,0,0,0,0,0,1,0,1,1,0,1],
  [1,0,0,0,0,1,0,1,1,2,1,1,0,1,0,0,0,0,1],
  [0,0,1,1,0,0,0,1,2,2,2,1,0,0,0,1,1,0,0],
  [1,0,0,0,0,1,0,1,1,1,1,1,0,1,0,0,0,0,1],
  [1,0,1,1,0,1,0,0,0,0,0,0,0,1,0,1,1,0,1],
  [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,0,1,1,0,1,0,1,0,1,0,1,1,0,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
  [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
  [1,0,1,0,1,1,1,1,0,0,0,1,1,1,1,0,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

const MAZE_L3: number[][] = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,0,1,0,0,1,0,0,1,0,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,1,0,1,0,0,1,1,1,0,0,1,0,1,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,0,0,1,1,1,0,1,0,1,1,1,0,0,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,1,0,1,0,1,1,2,1,1,0,1,0,1,0,0,1],
  [0,0,0,0,0,0,0,1,2,2,2,1,0,0,0,0,0,0,0],
  [1,0,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,0,0,1,1,1,0,1,0,1,1,1,0,0,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,1,0,1,0,0,1,1,1,0,0,1,0,1,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,0,1,0,0,0,0,0,1,0,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,1,1,0,1,0,0,0,1,0,1,1,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

const MAZE_L4: number[][] = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
  [1,0,1,0,1,0,1,1,0,1,0,1,1,0,1,0,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,0,1,0,1,1,0,1,1,1,0,1,1,0,1,0,1,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,0,1,1,0,0,0,1,1,0,1,1,1,0,1],
  [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1],
  [0,0,1,0,1,0,0,1,1,2,1,1,0,0,1,0,1,0,0],
  [1,0,0,0,0,0,0,1,2,2,2,1,0,0,0,0,0,0,1],
  [0,0,1,0,1,0,0,1,1,1,1,1,0,0,1,0,1,0,0],
  [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1],
  [1,0,1,1,1,0,1,1,0,0,0,1,1,0,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,1,0,1,0,1,1,0,1,1,1,0,1,1,0,1,0,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,0,1,0,1,1,0,1,0,1,1,0,1,0,1,0,1],
  [1,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
  [1,0,1,0,0,0,1,0,1,1,1,0,1,0,0,0,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

const ALL_MAZES = [MAZE_L1, MAZE_L2, MAZE_L3, MAZE_L4];

const LEVEL_CONFIGS = [
  { speed: 5, enemySpeed: 3.5, enemyCount: 2 },
  { speed: 5.5, enemySpeed: 4, enemyCount: 3 },
  { speed: 6, enemySpeed: 5, enemyCount: 4 },
  { speed: 6.5, enemySpeed: 5.5, enemyCount: 4 },
];

// ─── Quranic Data ─────
export const QURAN_VERSES = [
  { key: "falaq", ar: "قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ", fr: "Dis: Je cherche protection auprès du Seigneur de l'aube naissante" },
  { key: "nas", ar: "قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ", fr: "Dis: Je cherche protection auprès du Seigneur des hommes" },
  { key: "ikhlas", ar: "قُلْ هُوَ ٱللَّهُ أَحَدٌ", fr: "Dis: Il est Allah, Unique" },
  { key: "kursi1", ar: "ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَيُّ ٱلْقَيُّومُ", fr: "Allah! Point de divinité à part Lui, le Vivant" },
  { key: "baqara286", ar: "لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا", fr: "Allah n'impose à aucune âme une charge supérieure à sa capacité" },
];

export const QUIZ_QUESTIONS = [
  {
    question: { fr: "Quelle sourate protège du mal ?", en: "Which surah protects from evil?", ar: "أي سورة تحمي من الشر؟" },
    options: [
      { text: { fr: "Al-Falaq", en: "Al-Falaq", ar: "الفلق" }, correct: true },
      { text: { fr: "Al-Fatiha", en: "Al-Fatiha", ar: "الفاتحة" }, correct: false },
      { text: { fr: "Al-Baqara", en: "Al-Baqara", ar: "البقرة" }, correct: false },
    ],
  },
  {
    question: { fr: "Quel verset est le plus grand du Coran ?", en: "What is the greatest verse of the Quran?", ar: "ما هي أعظم آية في القرآن؟" },
    options: [
      { text: { fr: "Ayatul Kursi", en: "Ayatul Kursi", ar: "آية الكرسي" }, correct: true },
      { text: { fr: "Al-Kawthar", en: "Al-Kawthar", ar: "الكوثر" }, correct: false },
      { text: { fr: "An-Nas", en: "An-Nas", ar: "الناس" }, correct: false },
    ],
  },
  {
    question: { fr: "Sourate An-Nas cherche protection auprès de qui ?", en: "Surah An-Nas seeks protection from whom?", ar: "سورة الناس تستعيذ بمن؟" },
    options: [
      { text: { fr: "Le Seigneur des hommes", en: "The Lord of mankind", ar: "رب الناس" }, correct: true },
      { text: { fr: "Les anges", en: "The angels", ar: "الملائكة" }, correct: false },
      { text: { fr: "Les prophètes", en: "The prophets", ar: "الأنبياء" }, correct: false },
    ],
  },
];

// ─── Constants ──────────────────────────────────────────
export const MAZE_COLS = 19;
export const MAZE_ROWS = 21;

const WALL_COLOR = "#1e5631";
const PATH_COLOR = "#0a1a0f";
const PLAYER_COLOR = "#fbbf24";
const DOT_COLOR = "#e5e7eb";
const VERSE_COLOR = "#22d3ee";
const POWERUP_COLORS: Record<string, string> = { ayatul_kursi: "#60a5fa", la_ilaha: "#34d399" };
const ENEMY_COLORS = ["#ef4444", "#8b5cf6", "#f97316", "#ec4899"];
const FRIGHTENED_COLOR = "#3b82f6";

// ─── Helpers ──────────────────────────────────────────
function isWall(maze: number[][], gx: number, gy: number): boolean {
  if (gy < 0 || gy >= maze.length || gx < 0 || gx >= maze[0].length) {
    // Allow tunnel (row 9 has open sides)
    if (gy === 9 && (gx === -1 || gx === maze[0].length)) return false;
    return true;
  }
  return maze[gy][gx] === 1;
}

function isWalkable(maze: number[][], gx: number, gy: number): boolean {
  return !isWall(maze, gx, gy);
}

function canMoveDir(maze: number[][], gx: number, gy: number, dir: Direction): boolean {
  const [nx, ny] = nextCell(gx, gy, dir);
  return isWalkable(maze, nx, ny);
}

function nextCell(gx: number, gy: number, dir: Direction): [number, number] {
  switch (dir) {
    case "up": return [gx, gy - 1];
    case "down": return [gx, gy + 1];
    case "left": return [gx - 1, gy];
    case "right": return [gx + 1, gy];
    default: return [gx, gy];
  }
}

function oppositeDir(dir: Direction): Direction {
  switch (dir) {
    case "up": return "down";
    case "down": return "up";
    case "left": return "right";
    case "right": return "left";
    default: return "none";
  }
}

function dist(ax: number, ay: number, bx: number, by: number): number {
  return (ax - bx) ** 2 + (ay - by) ** 2;
}

function g2p(g: number, cellSize: number): number {
  return g * cellSize + cellSize / 2;
}

// ─── Init ──────────────────────────────────────────
export function createInitialState(level: number, carryScore = 0, carryVerses: string[] = [], carryLives = 3): GameState {
  const cfg = LEVEL_CONFIGS[Math.min(level, LEVEL_CONFIGS.length - 1)];
  const maze = ALL_MAZES[Math.min(level, ALL_MAZES.length - 1)].map(r => [...r]);
  const cols = maze[0].length;
  const rows = maze.length;

  const collectibles: Collectible[] = [];
  const powerUps: PowerUp[] = [];
  let verseIdx = 0;
  // Find player start (first open cell near bottom-center)
  let startX = 9, startY = 15;
  if (isWall(maze, startX, startY)) {
    // fallback: find any open cell near center
    for (let y = rows - 3; y > 0; y--) {
      for (let x = Math.floor(cols / 2) - 2; x < Math.floor(cols / 2) + 3; x++) {
        if (!isWall(maze, x, y) && maze[y][x] !== 2) { startX = x; startY = y; break; }
      }
      if (!isWall(maze, startX, startY)) break;
    }
  }

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (maze[y][x] === 0) {
        if (y === startY && x === startX) continue;
        if ((x * 7 + y * 13) % 11 === 0 && verseIdx < QURAN_VERSES.length) {
          collectibles.push({ x, y, collected: false, type: "verse", verseKey: QURAN_VERSES[verseIdx].key });
          verseIdx++;
        } else {
          collectibles.push({ x, y, collected: false, type: "dot" });
        }
      }
    }
  }

  // Power-ups at corners
  const corners = [
    { x: 1, y: 1 }, { x: cols - 2, y: 1 },
    { x: 1, y: rows - 2 }, { x: cols - 2, y: rows - 2 }
  ];
  let puCount = 0;
  for (const c of corners) {
    if (!isWall(maze, c.x, c.y) && puCount < 2) {
      powerUps.push({ x: c.x, y: c.y, collected: false, type: puCount === 0 ? "ayatul_kursi" : "la_ilaha" });
      puCount++;
    }
  }

  const enemies: Enemy[] = ENEMY_COLORS.slice(0, cfg.enemyCount).map((color, i) => ({
    gx: 8 + i, gy: 9,
    px: g2p(8 + i, 1), py: g2p(9, 1), // normalized; will be scaled
    prevDir: "up" as Direction,
    color, speed: cfg.enemySpeed,
    mode: "scatter" as const,
    scatterTarget: { x: i < 2 ? 1 : cols - 2, y: i % 2 === 0 ? 1 : rows - 2 },
    homeX: 8 + i, homeY: 9,
    moveTimer: 0,
  }));

  return {
    player: {
      gx: startX, gy: startY,
      px: 0, py: 0, // will be set from gx/gy
      direction: "none", nextDirection: "none",
      speed: cfg.speed,
      mouthOpen: 0.3, mouthDir: 1,
      moving: false,
    },
    enemies, collectibles, powerUps, maze,
    score: carryScore, lives: carryLives, level,
    phase: "playing",
    powerUpTimer: 0, powerUpType: null,
    collectedVerses: [...carryVerses],
    totalDots: collectibles.length,
    dotsCollected: 0,
    modeTimer: 0,
    modePhase: "scatter",
  };
}

// ─── Update (grid-based smooth movement) ──────────────────────
export function updateGame(state: GameState, cellSize: number, dt: number): GameState {
  if (state.phase !== "playing" && state.phase !== "powerUp") return state;

  const s: GameState = {
    ...state,
    player: { ...state.player },
    enemies: state.enemies.map(e => ({ ...e })),
    collectibles: [...state.collectibles],
    powerUps: [...state.powerUps],
    collectedVerses: [...state.collectedVerses],
  };

  const cols = s.maze[0].length;
  const p = s.player;
  const pixelSpeed = p.speed * cellSize * dt;

  // Init pixel pos from grid if needed
  if (p.px === 0 && p.py === 0) {
    p.px = g2p(p.gx, cellSize);
    p.py = g2p(p.gy, cellSize);
  }

  const targetPx = g2p(p.gx, cellSize);
  const targetPy = g2p(p.gy, cellSize);
  const atCenter = Math.abs(p.px - targetPx) < 1.5 && Math.abs(p.py - targetPy) < 1.5;

  if (atCenter) {
    // Snap to center
    p.px = targetPx;
    p.py = targetPy;

    // Try nextDirection first (buffered input)
    if (p.nextDirection !== "none" && canMoveDir(s.maze, p.gx, p.gy, p.nextDirection)) {
      p.direction = p.nextDirection;
      p.nextDirection = "none";
    }

    // Can we continue current direction?
    if (p.direction !== "none" && canMoveDir(s.maze, p.gx, p.gy, p.direction)) {
      const [nx, ny] = nextCell(p.gx, p.gy, p.direction);
      p.gx = nx; p.gy = ny;
      p.moving = true;
    } else {
      p.moving = false;
    }
  }

  // Move pixel position toward current grid target
  if (p.moving || !atCenter) {
    const tpx = g2p(p.gx, cellSize);
    const tpy = g2p(p.gy, cellSize);
    const dx = tpx - p.px;
    const dy = tpy - p.py;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d > 1) {
      const step = Math.min(pixelSpeed, d);
      p.px += (dx / d) * step;
      p.py += (dy / d) * step;
    } else {
      p.px = tpx;
      p.py = tpy;
    }
  }

  // Tunnel wrap
  if (p.gx < 0) { p.gx = cols - 1; p.px = g2p(cols - 1, cellSize); }
  if (p.gx >= cols) { p.gx = 0; p.px = g2p(0, cellSize); }

  // Mouth animation
  p.mouthOpen += p.mouthDir * dt * 8;
  if (p.mouthOpen > 0.4) p.mouthDir = -1;
  if (p.mouthOpen < 0.05) p.mouthDir = 1;

  // Power-up timer
  if (s.powerUpTimer > 0) {
    s.powerUpTimer -= dt;
    if (s.powerUpTimer <= 0) {
      s.powerUpTimer = 0;
      s.powerUpType = null;
      s.phase = "playing";
      s.enemies.forEach(e => { if (e.mode === "frightened") e.mode = "chase"; });
    }
  }

  // Mode switching (scatter/chase cycle)
  s.modeTimer += dt;
  if (s.modePhase === "scatter" && s.modeTimer > 7) {
    s.modePhase = "chase";
    s.modeTimer = 0;
    s.enemies.forEach(e => { if (e.mode === "scatter") e.mode = "chase"; });
  } else if (s.modePhase === "chase" && s.modeTimer > 20) {
    s.modePhase = "scatter";
    s.modeTimer = 0;
    s.enemies.forEach(e => { if (e.mode === "chase") e.mode = "scatter"; });
  }

  // Collect dots/verses
  s.collectibles = s.collectibles.map(c => {
    if (!c.collected && c.x === p.gx && c.y === p.gy) {
      s.score += c.type === "verse" ? 50 : 10;
      s.dotsCollected++;
      if (c.type === "verse" && c.verseKey) {
        s.collectedVerses = [...s.collectedVerses, c.verseKey];
      }
      return { ...c, collected: true };
    }
    return c;
  });

  // Collect power-ups
  s.powerUps = s.powerUps.map(pu => {
    if (!pu.collected && pu.x === p.gx && pu.y === p.gy) {
      s.score += 100;
      s.powerUpTimer = pu.type === "ayatul_kursi" ? 10 : 7;
      s.powerUpType = pu.type;
      s.phase = "powerUp";
      s.enemies.forEach(e => { e.mode = "frightened"; e.prevDir = oppositeDir(e.prevDir); });
      return { ...pu, collected: true };
    }
    return pu;
  });

  // Move enemies (grid-based)
  s.enemies.forEach(e => {
    if (e.px === 0 && e.py === 0) {
      e.px = g2p(e.gx, cellSize);
      e.py = g2p(e.gy, cellSize);
    }

    const etpx = g2p(e.gx, cellSize);
    const etpy = g2p(e.gy, cellSize);
    const eAtCenter = Math.abs(e.px - etpx) < 1.5 && Math.abs(e.py - etpy) < 1.5;

    if (eAtCenter) {
      e.px = etpx;
      e.py = etpy;

      // Choose next direction
      let tx: number, ty: number;
      if (e.mode === "chase") { tx = p.gx; ty = p.gy; }
      else if (e.mode === "frightened") { tx = e.scatterTarget.x; ty = e.scatterTarget.y; }
      else { tx = e.scatterTarget.x; ty = e.scatterTarget.y; }

      const dirs: Direction[] = ["up", "down", "left", "right"];
      const opp = oppositeDir(e.prevDir);
      let bestDir: Direction = e.prevDir;
      let bestDist = e.mode === "frightened" ? -Infinity : Infinity;

      for (const d of dirs) {
        if (d === opp) continue; // no reversing
        const [nx, ny] = nextCell(e.gx, e.gy, d);
        if (!isWalkable(s.maze, nx, ny)) continue;
        // Don't enter ghost house unless eaten
        if (s.maze[ny]?.[nx] === 2 && e.mode !== "eaten") continue;

        const dd = dist(nx, ny, tx, ty);
        if (e.mode === "frightened") {
          if (dd > bestDist) { bestDist = dd; bestDir = d; }
        } else {
          if (dd < bestDist) { bestDist = dd; bestDir = d; }
        }
      }

      // If no valid dir, allow reverse
      if (bestDist === (e.mode === "frightened" ? -Infinity : Infinity)) {
        bestDir = opp;
      }

      const [nx, ny] = nextCell(e.gx, e.gy, bestDir);
      if (isWalkable(s.maze, nx, ny) || s.maze[ny]?.[nx] === 2) {
        e.gx = nx; e.gy = ny;
        e.prevDir = bestDir;
      }
    }

    // Move pixel toward grid target
    const enpx = g2p(e.gx, cellSize);
    const enpy = g2p(e.gy, cellSize);
    const edx = enpx - e.px;
    const edy = enpy - e.py;
    const ed = Math.sqrt(edx * edx + edy * edy);
    const espeed = (e.mode === "frightened" ? e.speed * 0.5 : e.speed) * cellSize * dt;
    if (ed > 1) {
      const step = Math.min(espeed, ed);
      e.px += (edx / ed) * step;
      e.py += (edy / ed) * step;
    } else {
      e.px = enpx;
      e.py = enpy;
    }

    // Tunnel wrap
    if (e.gx < 0) { e.gx = cols - 1; e.px = g2p(cols - 1, cellSize); }
    if (e.gx >= cols) { e.gx = 0; e.px = g2p(0, cellSize); }
  });

  // Collision detection (pixel-based for smoothness)
  s.enemies.forEach(e => {
    const d = Math.hypot(e.px - p.px, e.py - p.py);
    if (d < cellSize * 0.7) {
      if (e.mode === "frightened") {
        s.score += 200;
        e.gx = e.homeX; e.gy = e.homeY;
        e.px = g2p(e.homeX, cellSize); e.py = g2p(e.homeY, cellSize);
        e.mode = "scatter";
      } else if (e.mode !== "eaten") {
        s.lives--;
        if (s.lives <= 0) {
          s.phase = "gameOver";
        } else {
          // Reset player
          const startX = 9, startY = 15;
          p.gx = startX; p.gy = startY;
          p.px = g2p(startX, cellSize); p.py = g2p(startY, cellSize);
          p.direction = "none"; p.nextDirection = "none";
          p.moving = false;
          // Reset enemies
          s.enemies.forEach(en => {
            en.gx = en.homeX; en.gy = en.homeY;
            en.px = g2p(en.homeX, cellSize); en.py = g2p(en.homeY, cellSize);
            en.mode = "scatter";
          });
        }
      }
    }
  });

  // Level complete
  if (s.dotsCollected >= s.totalDots) {
    s.phase = "levelComplete";
  }

  return s;
}

// ─── Render ──────────────────────────────────────────
export function renderGame(ctx: CanvasRenderingContext2D, state: GameState, cellSize: number, canvasW: number, canvasH: number) {
  const maze = state.maze;
  const rows = maze.length;
  const cols = maze[0].length;

  ctx.fillStyle = PATH_COLOR;
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Draw maze with rounded wall style
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (maze[y][x] === 1) {
        ctx.fillStyle = WALL_COLOR;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        ctx.strokeStyle = "#2d8a4e";
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x * cellSize + 0.5, y * cellSize + 0.5, cellSize - 1, cellSize - 1);
      } else if (maze[y][x] === 2) {
        ctx.fillStyle = "#0d2818";
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  }

  // Collectibles
  state.collectibles.forEach(c => {
    if (c.collected) return;
    const cx = g2p(c.x, cellSize);
    const cy = g2p(c.y, cellSize);
    if (c.type === "verse") {
      ctx.fillStyle = VERSE_COLOR;
      ctx.beginPath();
      ctx.arc(cx, cy, cellSize * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#0a1a0f";
      ctx.font = `bold ${cellSize * 0.35}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("☪", cx, cy);
    } else {
      ctx.fillStyle = DOT_COLOR;
      ctx.beginPath();
      ctx.arc(cx, cy, cellSize * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Power-ups
  state.powerUps.forEach(pu => {
    if (pu.collected) return;
    const cx = g2p(pu.x, cellSize);
    const cy = g2p(pu.y, cellSize);
    const pulse = 0.3 + Math.sin(Date.now() / 200) * 0.1;
    ctx.fillStyle = POWERUP_COLORS[pu.type];
    ctx.beginPath();
    ctx.arc(cx, cy, cellSize * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${cellSize * 0.4}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🛡️", cx, cy);
  });

  // Enemies
  state.enemies.forEach(e => {
    const ex = e.px;
    const ey = e.py;
    const r = cellSize * 0.4;

    ctx.fillStyle = e.mode === "frightened" ? FRIGHTENED_COLOR : e.color;
    ctx.beginPath();
    ctx.arc(ex, ey - r * 0.2, r, Math.PI, 0);
    ctx.lineTo(ex + r, ey + r * 0.6);
    for (let i = 0; i < 3; i++) {
      const wx = ex + r - (i + 1) * (2 * r / 3);
      ctx.quadraticCurveTo(wx + r / 3, ey + r * (i % 2 === 0 ? 0.2 : 1), wx, ey + r * 0.6);
    }
    ctx.closePath();
    ctx.fill();

    // Eyes
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(ex - r * 0.3, ey - r * 0.3, r * 0.25, 0, Math.PI * 2);
    ctx.arc(ex + r * 0.3, ey - r * 0.3, r * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = e.mode === "frightened" ? "#fff" : "#111";
    ctx.beginPath();
    ctx.arc(ex - r * 0.25, ey - r * 0.25, r * 0.12, 0, Math.PI * 2);
    ctx.arc(ex + r * 0.35, ey - r * 0.25, r * 0.12, 0, Math.PI * 2);
    ctx.fill();
  });

  // Player
  const p = state.player;
  const ppx = p.px;
  const ppy = p.py;
  const pr = cellSize * 0.42;
  const mouth = p.mouthOpen;

  let startAngle = mouth;
  if (p.direction === "right") startAngle = mouth;
  else if (p.direction === "left") startAngle = Math.PI + mouth;
  else if (p.direction === "up") startAngle = -Math.PI / 2 + mouth;
  else if (p.direction === "down") startAngle = Math.PI / 2 + mouth;

  if (state.phase === "powerUp") {
    ctx.shadowColor = state.powerUpType === "ayatul_kursi" ? "#60a5fa" : "#34d399";
    ctx.shadowBlur = 15;
  }

  ctx.fillStyle = PLAYER_COLOR;
  ctx.beginPath();
  ctx.arc(ppx, ppy, pr, startAngle, startAngle + (Math.PI * 2 - mouth * 2));
  ctx.lineTo(ppx, ppy);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // Kufi cap
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(ppx, ppy - pr * 0.6, pr * 0.5, pr * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
}

// ─── Score persistence (localStorage) ──────────────────────────────
const HIGHSCORE_KEY = "sheytanGame_highscore";
const STATS_KEY = "sheytanGame_stats";

export function getHighScore(): number {
  try { return parseInt(localStorage.getItem(HIGHSCORE_KEY) || "0", 10); } catch { return 0; }
}

export function saveHighScore(score: number) {
  const current = getHighScore();
  if (score > current) localStorage.setItem(HIGHSCORE_KEY, String(score));
}

export function getGameStats() {
  try { return JSON.parse(localStorage.getItem(STATS_KEY) || '{"gamesPlayed":0,"versesLearned":[]}'); } catch { return { gamesPlayed: 0, versesLearned: [] }; }
}

export function saveGameStats(versesCollected: string[]) {
  const stats = getGameStats();
  stats.gamesPlayed++;
  const uniqueVerses = [...new Set([...stats.versesLearned, ...versesCollected])];
  stats.versesLearned = uniqueVerses;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export const MAX_LEVEL = ALL_MAZES.length;
