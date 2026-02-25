import { useState, useCallback, useEffect } from "react";

const STREAK_KEY = "quranEasyStreak";

interface StreakData {
  currentStreak: number;
  lastPracticeDate: string | null;
  longestStreak: number;
  totalSessions: number;
}

const defaultStreak: StreakData = {
  currentStreak: 0,
  lastPracticeDate: null,
  longestStreak: 0,
  totalSessions: 0,
};

function loadStreak(): StreakData {
  try {
    const stored = localStorage.getItem(STREAK_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { ...defaultStreak };
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

export function useStreak() {
  const [streak, setStreak] = useState<StreakData>(loadStreak);

  useEffect(() => {
    localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
  }, [streak]);

  const recordSession = useCallback(() => {
    setStreak((prev) => {
      const today = getToday();
      if (prev.lastPracticeDate === today) {
        return { ...prev, totalSessions: prev.totalSessions + 1 };
      }

      const yesterday = getYesterday();
      const newCurrent = prev.lastPracticeDate === yesterday ? prev.currentStreak + 1 : 1;
      const newLongest = Math.max(prev.longestStreak, newCurrent);

      return {
        currentStreak: newCurrent,
        lastPracticeDate: today,
        longestStreak: newLongest,
        totalSessions: prev.totalSessions + 1,
      };
    });
  }, []);

  const hasPracticedToday = streak.lastPracticeDate === getToday();

  return { streak, recordSession, hasPracticedToday };
}
