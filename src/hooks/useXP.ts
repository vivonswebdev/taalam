import { useState, useCallback, useEffect } from "react";

const XP_KEY = "quranEasyXP";

export interface XPData {
  xpTotal: number;
  xpToday: number;
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
}

const XP_PER_LEVEL = 200;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadXP(): XPData {
  try {
    const stored = localStorage.getItem(XP_KEY);
    if (stored) {
      const data: XPData = JSON.parse(stored);
      const t = today();
      if (data.lastActiveDate !== t) {
        // Check if yesterday — maintain streak
        const last = new Date(data.lastActiveDate);
        const now = new Date(t);
        const diffMs = now.getTime() - last.getTime();
        const diffDays = Math.round(diffMs / 86400000);
        if (diffDays === 1) {
          // Yesterday — streak continues, reset xpToday
          return { ...data, xpToday: 0, lastActiveDate: t };
        } else if (diffDays > 1) {
          // Missed a day — streak resets
          return { ...data, xpToday: 0, streakDays: 0, lastActiveDate: t };
        }
      }
      return data;
    }
  } catch {}
  return { xpTotal: 0, xpToday: 0, streakDays: 0, lastActiveDate: today() };
}

function saveXP(data: XPData) {
  localStorage.setItem(XP_KEY, JSON.stringify(data));
}

export function getLevel(xpTotal: number) {
  const level = Math.floor(xpTotal / XP_PER_LEVEL) + 1;
  const xpInLevel = xpTotal % XP_PER_LEVEL;
  return { level, xpInLevel, xpForNext: XP_PER_LEVEL };
}

export function useXP() {
  const [data, setData] = useState<XPData>(loadXP);
  const [lastGain, setLastGain] = useState<number | null>(null);

  // Sync on mount
  useEffect(() => {
    setData(loadXP());
  }, []);

  const addXP = useCallback((amount: number) => {
    if (amount <= 0) return;
    setData((prev) => {
      const t = today();
      const isNewDay = prev.lastActiveDate !== t;
      const newData: XPData = {
        xpTotal: prev.xpTotal + amount,
        xpToday: (isNewDay ? 0 : prev.xpToday) + amount,
        streakDays: isNewDay
          ? (() => {
              const last = new Date(prev.lastActiveDate);
              const now = new Date(t);
              const diffDays = Math.round((now.getTime() - last.getTime()) / 86400000);
              return diffDays === 1 ? prev.streakDays + 1 : 1;
            })()
          : prev.xpToday === 0 ? prev.streakDays + 1 : prev.streakDays,
        lastActiveDate: t,
      };
      // Ensure streak is at least 1 when active
      if (newData.streakDays === 0) newData.streakDays = 1;
      saveXP(newData);
      return newData;
    });
    setLastGain(amount);
    setTimeout(() => setLastGain(null), 2000);
  }, []);

  const { level, xpInLevel, xpForNext } = getLevel(data.xpTotal);

  return {
    xpTotal: data.xpTotal,
    xpToday: data.xpToday,
    streakDays: data.streakDays,
    level,
    xpInLevel,
    xpForNext,
    lastGain,
    addXP,
  };
}
