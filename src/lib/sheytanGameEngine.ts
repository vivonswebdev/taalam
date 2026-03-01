/**
 * Chasse aux Sheytans – Canvas Game Engine
 * A Pac-Man inspired educational Islamic game for kids
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
  phase: "menu" | "playing" | "paused" | "powerUp" | "levelComplete" | "gameOver" | "quiz";
  powerUpTimer: number;
  powerUpType: string | null;
  collectedVerses: string[];
  totalDots: number;
  dotsCollected: number;
}

export interface Player {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  direction: Direction;
  nextDirection: Direction;
  speed: number;
  mouthOpen: number;
  mouthDir: number;
}

export interface Enemy {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  color: string;
  speed: number;
  mode: "chase" | "scatter" | "frightened";
  scatterTarget: { x: number; y: number };
  homeX: number;
  homeY: number;
}

export interface Collectible {
  x: number;
  y: number;
  collected: boolean;
  type: "dot" | "verse";
  verseKey?: string;
}

export interface PowerUp {
  x: number;
  y: number;
  collected: boolean;
  type: "ayatul_kursi" | "la_ilaha";
}

export type Direction = "up" | "down" | "left" | "right" | "none";

// ─── Maze Definitions (1=wall, 0=path, 2=enemy home) ─────
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

const LEVEL_CONFIGS = [
  { speed: 1.8, enemySpeed: 1.2, maze: MAZE_L1 },
  { speed: 2.0, enemySpeed: 1.6, maze: MAZE_L1 },
  { speed: 2.2, enemySpeed: 2.0, maze: MAZE_L1 },
  { speed: 2.5, enemySpeed: 2.3, maze: MAZE_L1 },
];

// ─── Quranic Verses for collectibles ─────
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

// ─── Colors ──────────────────────────────────────────
const WALL_COLOR = "#1e5631";
const PATH_COLOR = "#0a1a0f";
const PLAYER_COLOR = "#fbbf24";
const DOT_COLOR = "#e5e7eb";
const VERSE_COLOR = "#22d3ee";
const POWERUP_COLORS = { ayatul_kursi: "#60a5fa", la_ilaha: "#34d399" };
const ENEMY_COLORS = ["#ef4444", "#8b5cf6", "#f97316", "#ec4899"];
const FRIGHTENED_COLOR = "#3b82f6";

// ─── Helpers ──────────────────────────────────────────
function isWall(maze: number[][], gx: number, gy: number): boolean {
  if (gy < 0 || gy >= maze.length || gx < 0 || gx >= maze[0].length) return true;
  return maze[gy][gx] === 1;
}

function gridToPixel(g: number, cellSize: number): number {
  return g * cellSize + cellSize / 2;
}

function pixelToGrid(p: number, cellSize: number): number {
  return Math.floor(p / cellSize);
}

function canMove(maze: number[][], px: number, py: number, dir: Direction, cellSize: number): boolean {
  const gx = pixelToGrid(px, cellSize);
  const gy = pixelToGrid(py, cellSize);
  switch (dir) {
    case "up": return !isWall(maze, gx, gy - 1);
    case "down": return !isWall(maze, gx, gy + 1);
    case "left": return !isWall(maze, gx - 1, gy);
    case "right": return !isWall(maze, gx + 1, gy);
    default: return false;
  }
}

function isAtCenter(pos: number, cellSize: number): boolean {
  const center = pixelToGrid(pos, cellSize) * cellSize + cellSize / 2;
  return Math.abs(pos - center) < 2;
}

function moveInDirection(x: number, y: number, dir: Direction, speed: number): { x: number; y: number } {
  switch (dir) {
    case "up": return { x, y: y - speed };
    case "down": return { x, y: y + speed };
    case "left": return { x: x - speed, y };
    case "right": return { x: x + speed, y };
    default: return { x, y };
  }
}

function snapToGrid(pos: number, cellSize: number): number {
  return pixelToGrid(pos, cellSize) * cellSize + cellSize / 2;
}

function dist(ax: number, ay: number, bx: number, by: number): number {
  return Math.abs(ax - bx) + Math.abs(ay - by);
}

// ─── Init ──────────────────────────────────────────
export function createInitialState(level: number): GameState {
  const cfg = LEVEL_CONFIGS[Math.min(level, LEVEL_CONFIGS.length - 1)];
  const maze = cfg.maze.map(r => [...r]);
  const cols = maze[0].length;
  const rows = maze.length;

  // Place collectibles on all path cells
  const collectibles: Collectible[] = [];
  const powerUps: PowerUp[] = [];
  let verseIdx = 0;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (maze[y][x] === 0) {
        // Skip player start position
        if (y === 15 && x === 9) continue;
        // Some cells are verses
        if ((x + y) % 7 === 0 && verseIdx < QURAN_VERSES.length) {
          collectibles.push({ x, y, collected: false, type: "verse", verseKey: QURAN_VERSES[verseIdx].key });
          verseIdx++;
        } else {
          collectibles.push({ x, y, collected: false, type: "dot" });
        }
      }
    }
  }

  // Place 2 power-ups
  const puPositions = [{ x: 1, y: 1 }, { x: cols - 2, y: rows - 2 }];
  puPositions.forEach((p, i) => {
    if (maze[p.y][p.x] === 0) {
      powerUps.push({ x: p.x, y: p.y, collected: false, type: i === 0 ? "ayatul_kursi" : "la_ilaha" });
    }
  });

  // Enemies start in ghost house
  const enemies: Enemy[] = ENEMY_COLORS.slice(0, Math.min(2 + level, 4)).map((color, i) => ({
    x: 8 + i,
    y: 9,
    targetX: 8 + i,
    targetY: 9,
    color,
    speed: cfg.enemySpeed,
    mode: "scatter" as const,
    scatterTarget: { x: i < 2 ? 1 : cols - 2, y: i % 2 === 0 ? 1 : rows - 2 },
    homeX: 8 + i,
    homeY: 9,
  }));

  return {
    player: {
      x: 9, y: 15,
      targetX: 9, targetY: 15,
      direction: "none",
      nextDirection: "none",
      speed: cfg.speed,
      mouthOpen: 0.3,
      mouthDir: 1,
    },
    enemies,
    collectibles,
    powerUps,
    maze,
    score: 0,
    lives: 3,
    level,
    phase: "playing",
    powerUpTimer: 0,
    powerUpType: null,
    collectedVerses: [],
    totalDots: collectibles.length,
    dotsCollected: 0,
  };
}

// ─── Enemy AI ─────────────────────────────────────
function chooseEnemyDirection(enemy: Enemy, maze: number[][], targetX: number, targetY: number, cellSize: number): Direction {
  const gx = pixelToGrid(gridToPixel(enemy.x, cellSize), cellSize);
  const gy = pixelToGrid(gridToPixel(enemy.y, cellSize), cellSize);
  
  const dirs: Direction[] = ["up", "down", "left", "right"];
  let bestDir: Direction = "up";
  let bestDist = Infinity;

  for (const d of dirs) {
    let nx = gx, ny = gy;
    if (d === "up") ny--;
    else if (d === "down") ny++;
    else if (d === "left") nx--;
    else if (d === "right") nx++;

    if (isWall(maze, nx, ny) || maze[ny]?.[nx] === 2) continue;

    const dd = dist(nx, ny, targetX, targetY);
    if (enemy.mode === "frightened") {
      // Run away
      if (dd > bestDist) { bestDist = dd; bestDir = d; }
    } else {
      if (dd < bestDist) { bestDist = dd; bestDir = d; }
    }
  }
  return bestDir;
}

// ─── Update ──────────────────────────────────────────
export function updateGame(state: GameState, cellSize: number, dt: number): GameState {
  if (state.phase !== "playing" && state.phase !== "powerUp") return state;

  const s = { ...state, player: { ...state.player }, enemies: state.enemies.map(e => ({ ...e })) };

  // Power-up timer
  if (s.powerUpTimer > 0) {
    s.powerUpTimer -= dt;
    if (s.powerUpTimer <= 0) {
      s.powerUpTimer = 0;
      s.powerUpType = null;
      s.phase = "playing";
      s.enemies.forEach(e => { e.mode = "chase"; });
    }
  }

  // Player movement
  const p = s.player;
  const px = gridToPixel(p.x, cellSize);
  const py = gridToPixel(p.y, cellSize);

  // Try next direction first
  if (p.nextDirection !== "none" && canMove(s.maze, px, py, p.nextDirection, cellSize)) {
    p.direction = p.nextDirection;
    p.nextDirection = "none";
  }

  if (p.direction !== "none" && canMove(s.maze, px, py, p.direction, cellSize)) {
    const moved = moveInDirection(p.x, p.y, p.direction, p.speed * dt * 8);
    const newGx = pixelToGrid(gridToPixel(moved.x, cellSize), cellSize);
    const newGy = pixelToGrid(gridToPixel(moved.y, cellSize), cellSize);
    if (!isWall(s.maze, newGx, newGy)) {
      p.x = moved.x;
      p.y = moved.y;
    }
  }

  // Wrap around tunnel
  const cols = s.maze[0].length;
  if (p.x < -0.5) p.x = cols - 0.5;
  if (p.x > cols - 0.5) p.x = -0.5;

  // Mouth animation
  p.mouthOpen += p.mouthDir * dt * 8;
  if (p.mouthOpen > 0.4) p.mouthDir = -1;
  if (p.mouthOpen < 0.05) p.mouthDir = 1;

  // Collect dots/verses
  const pgx = Math.round(p.x);
  const pgy = Math.round(p.y);

  s.collectibles = s.collectibles.map(c => {
    if (!c.collected && c.x === pgx && c.y === pgy) {
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
    if (!pu.collected && pu.x === pgx && pu.y === pgy) {
      s.score += 100;
      s.powerUpTimer = pu.type === "ayatul_kursi" ? 10 : 7;
      s.powerUpType = pu.type;
      s.phase = "powerUp";
      s.enemies.forEach(e => { e.mode = "frightened"; });
      return { ...pu, collected: true };
    }
    return pu;
  });

  // Move enemies
  const modeTimer = Date.now() % 20000;
  s.enemies.forEach(e => {
    if (e.mode !== "frightened") {
      e.mode = modeTimer < 7000 ? "scatter" : "chase";
    }

    const tx = e.mode === "chase" ? pgx : e.mode === "frightened" ? e.scatterTarget.x : e.scatterTarget.x;
    const ty = e.mode === "chase" ? pgy : e.mode === "frightened" ? e.scatterTarget.y : e.scatterTarget.y;

    const dir = chooseEnemyDirection(e, s.maze, tx, ty, cellSize);
    const espeed = e.mode === "frightened" ? e.speed * 0.5 : e.speed;
    const moved = moveInDirection(e.x, e.y, dir, espeed * dt * 8);
    const newGx = pixelToGrid(gridToPixel(moved.x, cellSize), cellSize);
    const newGy = pixelToGrid(gridToPixel(moved.y, cellSize), cellSize);
    if (!isWall(s.maze, newGx, newGy)) {
      e.x = moved.x;
      e.y = moved.y;
    }

    // Wrap tunnel
    if (e.x < -0.5) e.x = cols - 0.5;
    if (e.x > cols - 0.5) e.x = -0.5;
  });

  // Collision detection
  s.enemies.forEach(e => {
    const d = Math.hypot(e.x - p.x, e.y - p.y);
    if (d < 0.7) {
      if (e.mode === "frightened") {
        // Eat enemy
        s.score += 200;
        e.x = e.homeX;
        e.y = e.homeY;
        e.mode = "scatter";
      } else {
        // Lose a life
        s.lives--;
        if (s.lives <= 0) {
          s.phase = "gameOver";
        } else {
          // Reset positions
          p.x = 9; p.y = 15;
          p.direction = "none";
        }
      }
    }
  });

  // Check level complete
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

  // Clear
  ctx.fillStyle = PATH_COLOR;
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Draw maze
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (maze[y][x] === 1) {
        ctx.fillStyle = WALL_COLOR;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        // Border effect
        ctx.strokeStyle = "#2d8a4e";
        ctx.lineWidth = 1;
        ctx.strokeRect(x * cellSize + 0.5, y * cellSize + 0.5, cellSize - 1, cellSize - 1);
      }
    }
  }

  // Draw collectibles
  state.collectibles.forEach(c => {
    if (c.collected) return;
    const cx = gridToPixel(c.x, cellSize);
    const cy = gridToPixel(c.y, cellSize);
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
      ctx.arc(cx, cy, cellSize * 0.12, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Draw power-ups
  state.powerUps.forEach(pu => {
    if (pu.collected) return;
    const cx = gridToPixel(pu.x, cellSize);
    const cy = gridToPixel(pu.y, cellSize);
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

  // Draw enemies
  state.enemies.forEach(e => {
    const ex = gridToPixel(e.x, cellSize);
    const ey = gridToPixel(e.y, cellSize);
    const r = cellSize * 0.4;

    ctx.fillStyle = e.mode === "frightened" ? FRIGHTENED_COLOR : e.color;
    // Ghost shape
    ctx.beginPath();
    ctx.arc(ex, ey - r * 0.2, r, Math.PI, 0);
    ctx.lineTo(ex + r, ey + r * 0.6);
    // Wavy bottom
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

  // Draw player (Pac-Man style)
  const p = state.player;
  const ppx = gridToPixel(p.x, cellSize);
  const ppy = gridToPixel(p.y, cellSize);
  const pr = cellSize * 0.42;
  const mouth = p.mouthOpen;

  let startAngle = mouth;
  if (p.direction === "right") startAngle = mouth;
  else if (p.direction === "left") startAngle = Math.PI + mouth;
  else if (p.direction === "up") startAngle = -Math.PI / 2 + mouth;
  else if (p.direction === "down") startAngle = Math.PI / 2 + mouth;

  // Glow during power-up
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

  // Small kufi cap on player
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(ppx, ppy - pr * 0.6, pr * 0.5, pr * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
}

// ─── Score persistence ──────────────────────────────
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
