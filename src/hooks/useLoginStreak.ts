import { useState, useEffect, useCallback } from "react";
import { useQuranXp } from "./useQuranXp";

const LOGIN_STREAK_KEY = "taaloum_login_streak";
const LOGIN_LAST_KEY = "taaloum_login_last";
const LOGIN_BONUS_SHOWN_KEY = "taaloum_login_bonus_shown";

interface LoginStreakData {
  streak: number;
  lastLoginDate: string;
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

function loadLoginStreak(): LoginStreakData {
  try {
    const streak = Number(localStorage.getItem(LOGIN_STREAK_KEY)) || 0;
    const lastLoginDate = localStorage.getItem(LOGIN_LAST_KEY) || "";
    return { streak, lastLoginDate };
  } catch {
    return { streak: 0, lastLoginDate: "" };
  }
}

function saveLoginStreak(data: LoginStreakData) {
  localStorage.setItem(LOGIN_STREAK_KEY, String(data.streak));
  localStorage.setItem(LOGIN_LAST_KEY, data.lastLoginDate);
}

/** XP bonus by consecutive login days */
function getLoginXpBonus(streak: number): number {
  if (streak >= 30) return 50;
  if (streak >= 14) return 30;
  if (streak >= 7) return 20;
  if (streak >= 3) return 10;
  return 5;
}

/** Emoji by streak tier */
function getStreakEmoji(streak: number): string {
  if (streak >= 30) return "👑";
  if (streak >= 14) return "💎";
  if (streak >= 7) return "🔥";
  if (streak >= 3) return "⭐";
  return "🌙";
}

export interface LoginBonusResult {
  streak: number;
  xpAwarded: number;
  emoji: string;
  isNewDay: boolean;
}

export function useLoginStreak() {
  const { addXp } = useQuranXp();
  const [bonusResult, setBonusResult] = useState<LoginBonusResult | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const today = getToday();
    const bonusShownToday = localStorage.getItem(LOGIN_BONUS_SHOWN_KEY) === today;
    if (bonusShownToday) return;

    const data = loadLoginStreak();
    const yesterday = getYesterday();

    let newStreak: number;
    if (data.lastLoginDate === today) {
      // Already logged in today
      return;
    } else if (data.lastLoginDate === yesterday) {
      newStreak = data.streak + 1;
    } else {
      newStreak = 1;
    }

    const xp = getLoginXpBonus(newStreak);
    const emoji = getStreakEmoji(newStreak);

    saveLoginStreak({ streak: newStreak, lastLoginDate: today });
    localStorage.setItem(LOGIN_BONUS_SHOWN_KEY, today);

    // Award XP
    addXp(xp, "daily_login_bonus");

    setBonusResult({ streak: newStreak, xpAwarded: xp, emoji, isNewDay: true });
  }, [addXp]);

  const dismiss = useCallback(() => {
    setDismissed(true);
    setBonusResult(null);
  }, []);

  return {
    bonusResult: dismissed ? null : bonusResult,
    dismiss,
    currentStreak: loadLoginStreak().streak,
  };
}
