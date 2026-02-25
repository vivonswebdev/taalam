import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { addXP as addXPToDb, fetchUserProgress } from "@/lib/progress";

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

export function getLevel(xpTotal: number) {
  const level = Math.floor(xpTotal / XP_PER_LEVEL) + 1;
  const xpInLevel = xpTotal % XP_PER_LEVEL;
  return { level, xpInLevel, xpForNext: XP_PER_LEVEL };
}

export function useXP() {
  const [data, setData] = useState<XPData>(loadLocalXP);
  const [lastGain, setLastGain] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const syncedRef = useRef(false);

  // Listen for auth state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    // Check current session
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
        // Merge: take the higher XP between local and remote
        const local = loadLocalXP();
        if (local.xpTotal > synced.xpTotal) {
          // Local has more XP — push local to Supabase
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

    // Update local state immediately
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

    // Persist to Supabase in background (fire & forget)
    if (userId) {
      addXPToDb(userId, amount).catch(console.error);
    }

    setLastGain(amount);
    setTimeout(() => setLastGain(null), 2000);
  }, [userId]);

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
