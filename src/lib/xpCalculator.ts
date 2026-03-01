/**
 * Centralized XP calculator for all Qur'an activities.
 * Ensures consistent XP awarding across Quiz, Tarteel, Reading, and streaks.
 */

// ─── Quiz XP ────────────────────────────────────────────
export function calcQuizXP(isCorrect: boolean, consecutiveCorrect: number): number {
  if (!isCorrect) return 0;
  let xp = 10; // base
  if (consecutiveCorrect >= 3) xp += 5; // streak bonus
  if (consecutiveCorrect >= 5) xp += 5; // extra streak bonus
  return xp;
}

// ─── Tarteel / Hifz XP ─────────────────────────────────
export function calcTarteelAyahXP(isCorrect: boolean): number {
  return isCorrect ? 2 : 0;
}

export function calcTarteelCompletionXP(totalScore: number, ayahCount: number): number {
  if (totalScore < 50) return 0;
  // Base completion bonus
  let xp = 20;
  // Quality bonus
  if (totalScore >= 90) xp += 15;
  else if (totalScore >= 75) xp += 10;
  else if (totalScore >= 60) xp += 5;
  // Scale with length
  if (ayahCount >= 20) xp += 10;
  return xp;
}

// ─── Reading XP ─────────────────────────────────────────
const MAX_READING_XP_PER_DAY = 50;
const READING_XP_KEY = "quranReadingXPToday";

function getReadingXPToday(): { date: string; xp: number } {
  try {
    const raw = localStorage.getItem(READING_XP_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { date: new Date().toISOString().slice(0, 10), xp: 0 };
}

function saveReadingXPToday(data: { date: string; xp: number }) {
  localStorage.setItem(READING_XP_KEY, JSON.stringify(data));
}

/**
 * Calculate XP for reading ayahs. Returns the actual XP earned (capped daily).
 * @param ayahCount Number of ayahs consumed (read or listened)
 */
export function calcReadingXP(ayahCount: number): number {
  const today = new Date().toISOString().slice(0, 10);
  let stored = getReadingXPToday();
  if (stored.date !== today) {
    stored = { date: today, xp: 0 };
  }
  const remaining = MAX_READING_XP_PER_DAY - stored.xp;
  if (remaining <= 0) return 0;
  const xp = Math.min(ayahCount, remaining); // 1 XP per ayah
  stored.xp += xp;
  saveReadingXPToday(stored);
  return xp;
}

// ─── Streak Bonus XP ────────────────────────────────────
/**
 * Calculate streak bonus XP for daily connection.
 * - Days 1: 0 bonus
 * - Days 2+: +5 XP per day
 * - Every 10 days: +50 XP milestone bonus
 */
export function calcStreakBonusXP(streakDays: number): { dailyBonus: number; milestoneBonus: number; total: number } {
  if (streakDays <= 1) return { dailyBonus: 0, milestoneBonus: 0, total: 0 };
  
  const dailyBonus = 5;
  const milestoneBonus = streakDays % 10 === 0 ? 50 : 0;
  return { dailyBonus, milestoneBonus, total: dailyBonus + milestoneBonus };
}

/**
 * Get the next milestone info for display.
 */
export function getNextMilestone(streakDays: number): { daysRemaining: number; bonus: number } {
  const next = Math.ceil((streakDays + 1) / 10) * 10;
  return { daysRemaining: next - streakDays, bonus: 50 };
}

// ─── Level System ───────────────────────────────────────
export const XP_PER_LEVEL = 200;

export function getLevel(xpTotal: number) {
  const level = Math.floor(xpTotal / XP_PER_LEVEL) + 1;
  const xpInLevel = xpTotal % XP_PER_LEVEL;
  return { level, xpInLevel, xpForNext: XP_PER_LEVEL };
}

export function getLevelBadge(level: number): { emoji: string; title: string } {
  if (level >= 50) return { emoji: "👑", title: "Hafiz d'Or" };
  if (level >= 40) return { emoji: "💎", title: "Diamant Qur'an" };
  if (level >= 30) return { emoji: "🏆", title: "Maître Qur'an" };
  if (level >= 20) return { emoji: "⭐", title: "Expert Qur'an" };
  if (level >= 15) return { emoji: "🌟", title: "Avancé Qur'an" };
  if (level >= 10) return { emoji: "📖", title: "Lecteur assidu" };
  if (level >= 5) return { emoji: "🌱", title: "Apprenti Qur'an" };
  return { emoji: "🌙", title: "Débutant Qur'an" };
}
