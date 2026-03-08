export interface DifficultyLevel {
  levelRange: [number, number];
  ops: string[];
  maxVal: number;
  xpPerWin: number;
  timePerCalc: number; // seconds
  label: string;
}

export const DIFFICULTY_CONFIG: DifficultyLevel[] = [
  { levelRange: [1, 5], ops: ["+"], maxVal: 10, xpPerWin: 5, timePerCalc: 6, label: "🟢" },
  { levelRange: [6, 10], ops: ["+"], maxVal: 20, xpPerWin: 10, timePerCalc: 5, label: "🟢" },
  { levelRange: [11, 15], ops: ["+", "-"], maxVal: 30, xpPerWin: 12, timePerCalc: 5, label: "🟡" },
  { levelRange: [16, 20], ops: ["+", "-"], maxVal: 50, xpPerWin: 15, timePerCalc: 4.5, label: "🟡" },
  { levelRange: [21, 30], ops: ["+", "-", "×"], maxVal: 50, xpPerWin: 20, timePerCalc: 4, label: "🟠" },
  { levelRange: [31, 40], ops: ["+", "-", "×"], maxVal: 100, xpPerWin: 25, timePerCalc: 3.5, label: "🟠" },
  { levelRange: [41, 50], ops: ["+", "-", "×", "÷"], maxVal: 100, xpPerWin: 30, timePerCalc: 3, label: "🔴" },
  { levelRange: [51, 60], ops: ["+", "-", "×", "÷"], maxVal: 150, xpPerWin: 40, timePerCalc: 2.5, label: "🔴" },
  { levelRange: [61, 75], ops: ["+", "-", "×", "÷"], maxVal: 200, xpPerWin: 50, timePerCalc: 2, label: "💜" },
  { levelRange: [76, 100], ops: ["+", "-", "×", "÷", "²"], maxVal: 250, xpPerWin: 75, timePerCalc: 1.5, label: "👑" },
];

export function getDifficultyForLevel(level: number): DifficultyLevel {
  return DIFFICULTY_CONFIG.find(d => level >= d.levelRange[0] && level <= d.levelRange[1]) || DIFFICULTY_CONFIG[DIFFICULTY_CONFIG.length - 1];
}

export interface MathQuestion {
  a: number;
  b: number;
  op: string;
  answer: number;
  display: string;
}

export function generateQuestion(level: number): MathQuestion {
  const diff = getDifficultyForLevel(level);
  const op = diff.ops[Math.floor(Math.random() * diff.ops.length)];

  let a: number, b: number, answer: number;

  switch (op) {
    case "-":
      a = Math.floor(Math.random() * diff.maxVal) + 1;
      b = Math.floor(Math.random() * a) + 1;
      answer = a - b;
      break;
    case "×":
      a = Math.floor(Math.random() * 12) + 1;
      b = Math.floor(Math.random() * 12) + 1;
      answer = a * b;
      break;
    case "÷":
      b = Math.floor(Math.random() * 11) + 2;
      answer = Math.floor(Math.random() * 12) + 1;
      a = b * answer;
      break;
    case "²":
      a = Math.floor(Math.random() * 15) + 2;
      b = 2;
      answer = a * a;
      break;
    default: // "+"
      a = Math.floor(Math.random() * diff.maxVal) + 1;
      b = Math.floor(Math.random() * diff.maxVal) + 1;
      answer = a + b;
      break;
  }

  const display = op === "²" ? `${a}²` : `${a} ${op} ${b}`;
  return { a, b, op, answer, display };
}

export function generateChoices(answer: number): number[] {
  const choices = new Set<number>([answer]);
  const range = Math.max(5, Math.abs(answer));
  while (choices.size < 4) {
    const offset = Math.floor(Math.random() * range) - Math.floor(range / 2);
    const wrong = answer + (offset === 0 ? 1 : offset);
    if (wrong >= 0) choices.add(wrong);
  }
  return Array.from(choices).sort(() => Math.random() - 0.5);
}

export const MATH_GAMES = [
  { id: "quick_calc", name: "Quick Calc", icon: "⚡", i18nKey: "quickCalc" },
  { id: "calc_merge", name: "Calc Merge", icon: "🧩", i18nKey: "calcMerge" },
  { id: "number_runner", name: "Number Runner", icon: "🏃", i18nKey: "numberRunner" },
  { id: "math_shooter", name: "Math Shooter", icon: "🚀", i18nKey: "mathShooter" },
  { id: "math_memory", name: "Math Memory", icon: "🧠", i18nKey: "mathMemory" },
] as const;
