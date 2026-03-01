import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { addXP as addXPToDb, fetchUserProgress } from "@/lib/progress";
import { calcStreakBonusXP, getNextMilestone, getLevel, getLevelBadge, XP_PER_LEVEL } from "@/lib/xpCalculator";

const XP_KEY = "quranEasyXP";
const STREAK_BONUS_KEY = "quranStreakBonusDate";

export interface XPData {
  xpTotal: number;
  xpToday: number;
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadLocalXP(): XPData {
  try {
    const stored = localStorage.getItem(XP_KEY);
    if (stored) {
      const data: XPData = JSON.parse(stored);
      const t = today();
      if (data.lastActiveDate !== t) {
        const last = new Date(data.lastActiveDate);
        const now = new Date(t);
        const diffDays = Math.round((now.getTime() - last.getTime()) / 86400000);
        if (diffDays === 1) {
          return { ...data, xpToday: 0, lastActiveDate: t };
        } else if (diffDays > 1) {
          return { ...data, xpToday: 0, streakDays: 0, lastActiveDate: t };
        }
      }
      return data;
    }
  } catch {}
  return { xpTotal: 0, xpToday: 0, streakDays: 0, lastActiveDate: today() };
}

function saveLocalXP(data: XPData) {
  localStorage.setItem(XP_KEY, JSON.stringify(data));
}

export { getLevel, getLevelBadge, XP_PER_LEVEL };

export function useXP() {
  const [data, setData] = useState<XPData>(loadLocalXP);
  const [lastGain, setLastGain] = useState<number | null>(null);
  const [streakBonusAwarded, setStreakBonusAwarded] = useState<number>(0);
  const [userId, setUserId] = useState<string | null>(null);
  const syncedRef = useRef(false);

  // Listen for auth state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Sync from Supabase on mount when authenticated
  useEffect(() => {
    if (!userId || syncedRef.current) return;
    syncedRef.current = true;

    fetchUserProgress(userId).then((remote) => {
      if (remote) {
        const t = today();
        const synced: XPData = {
          xpTotal: remote.xp_total,
          xpToday: remote.last_xp_date === t ? remote.xp_today : 0,
          streakDays: remote.streak_days,
          lastActiveDate: remote.last_xp_date ?? t,
        };
        const local = loadLocalXP();
        if (local.xpTotal > synced.xpTotal) {
          addXPToDb(userId, local.xpTotal - synced.xpTotal);
          setData(local);
        } else {
          setData(synced);
          saveLocalXP(synced);
        }
      }
    });
  }, [userId]);

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
      if (newData.streakDays === 0) newData.streakDays = 1;
      saveLocalXP(newData);
      return newData;
    });

    if (userId) {
      addXPToDb(userId, amount).catch(console.error);
    }

    setLastGain(amount);
    setTimeout(() => setLastGain(null), 2000);
  }, [userId]);

  // Award streak bonus once per day on first activity
  const awardStreakBonus = useCallback(() => {
    const t = today();
    const lastBonusDate = localStorage.getItem(STREAK_BONUS_KEY);
    if (lastBonusDate === t) return 0;

    const streakBonus = calcStreakBonusXP(data.streakDays);
    if (streakBonus.total > 0) {
      localStorage.setItem(STREAK_BONUS_KEY, t);
      addXP(streakBonus.total);
      setStreakBonusAwarded(streakBonus.total);
      return streakBonus.total;
    }
    return 0;
  }, [data.streakDays, addXP]);

  const { level, xpInLevel, xpForNext } = getLevel(data.xpTotal);
  const levelBadge = getLevelBadge(level);
  const nextMilestone = getNextMilestone(data.streakDays);

  return {
    xpTotal: data.xpTotal,
    xpToday: data.xpToday,
    streakDays: data.streakDays,
    level,
    xpInLevel,
    xpForNext,
    lastGain,
    addXP,
    awardStreakBonus,
    streakBonusAwarded,
    levelBadge,
    nextMilestone,
  };
}
