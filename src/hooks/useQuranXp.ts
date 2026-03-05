import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ─── Constants ──────────────────────────────────────────
const LEVEL_XP_STEP = 500;
const LOCAL_KEY = "quran_xp_total";

// ─── Pure helpers ───────────────────────────────────────
export function getLevelFromXp(xp: number): number {
  return Math.floor(xp / LEVEL_XP_STEP) + 1;
}

export function getLevelProgress(xp: number) {
  const level = getLevelFromXp(xp);
  const xpStart = (level - 1) * LEVEL_XP_STEP;
  const xpEnd = level * LEVEL_XP_STEP;
  const currentInLevel = xp - xpStart;
  const percent = Math.min(100, Math.round((currentInLevel / LEVEL_XP_STEP) * 100));
  return { level, currentInLevel, xpStart, xpEnd, percent };
}

export function getLevelBadge(level: number): { emoji: string; title: string } {
  if (level >= 20) return { emoji: "👑", title: "Hafiz d'Or" };
  if (level >= 15) return { emoji: "💎", title: "Diamant Qur'an" };
  if (level >= 12) return { emoji: "🏆", title: "Maître Qur'an" };
  if (level >= 10) return { emoji: "⭐", title: "Expert Qur'an" };
  if (level >= 7) return { emoji: "🌟", title: "Avancé Qur'an" };
  if (level >= 5) return { emoji: "📖", title: "Lecteur assidu" };
  if (level >= 3) return { emoji: "🌱", title: "Apprenti Qur'an" };
  return { emoji: "🌙", title: "Débutant Qur'an" };
}

export function computeStreakBonus(streak: number): number {
  let bonus = 0;
  if (streak >= 2) bonus += 5;
  if (streak > 0 && streak % 10 === 0) bonus += 50;
  return bonus;
}

// ─── Local persistence ─────────────────────────────────
function loadLocalXp(): number {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? Number(raw) || 0 : 0;
  } catch {
    return 0;
  }
}

function saveLocalXp(xp: number) {
  localStorage.setItem(LOCAL_KEY, String(xp));
}

// ─── Streak bonus tracking (once per day) ──────────────
const STREAK_BONUS_DATE_KEY = "quranXpStreakBonusDate";

function wasStreakBonusAwardedToday(): boolean {
  const today = new Date().toISOString().slice(0, 10);
  return localStorage.getItem(STREAK_BONUS_DATE_KEY) === today;
}

function markStreakBonusAwarded() {
  localStorage.setItem(STREAK_BONUS_DATE_KEY, new Date().toISOString().slice(0, 10));
}

// ─── Hook ───────────────────────────────────────────────
export function useQuranXp() {
  const [xp, setXp] = useState<number>(loadLocalXp);
  const [lastGain, setLastGain] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const syncedRef = useRef(false);

  // Detect child mode for half-XP
  const isChildMode = (() => {
    try {
      return localStorage.getItem("taaloum_user_mode") === "child";
    } catch {
      return false;
    }
  })();

  // Auth listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Sync from cloud on mount
  useEffect(() => {
    if (!userId || syncedRef.current) return;
    syncedRef.current = true;

    supabase
      .from("quran_xp")
      .select("xp_total")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => {
        const remote = data?.xp_total ?? 0;
        const local = loadLocalXp();
        const best = Math.max(remote, local);
        setXp(best);
        saveLocalXp(best);
        // Sync back if local was higher
        if (local > remote) {
          supabase.from("quran_xp").upsert({
            user_id: userId,
            xp_total: local,
            last_reason: "local_sync",
          }, { onConflict: "user_id" }).then(() => {});
        }
      });
  }, [userId]);

  const addXp = useCallback((amount: number, reason?: string) => {
    if (amount <= 0) return;

    // Child mode: half XP
    const finalAmount = isChildMode ? Math.max(1, Math.floor(amount / 2)) : amount;

    setXp((prev) => {
      const oldLevel = getLevelFromXp(prev);
      const next = prev + finalAmount;
      const newLevel = getLevelFromXp(next);
      saveLocalXp(next);

      if (newLevel > oldLevel) {
        const badge = getLevelBadge(newLevel);
        toast.success(`${badge.emoji} Niveau ${newLevel} atteint !`, {
          description: badge.title,
          duration: 4000,
        });
      }

      return next;
    });

    // Cloud sync — use the updated value directly
    if (userId) {
      setXp((current) => {
        supabase.from("quran_xp").upsert({
          user_id: userId,
          xp_total: current,
          last_reason: reason || (isChildMode ? "child-mode" : null),
        }, { onConflict: "user_id" }).then(() => {});
        return current;
      });
    }

    setLastGain(finalAmount);
    setTimeout(() => setLastGain(null), 2000);
  }, [userId, isChildMode]);

  // Award streak bonus (call from outside with current streak)
  const awardStreakBonus = useCallback((streak: number) => {
    if (wasStreakBonusAwardedToday()) return 0;
    const bonus = computeStreakBonus(streak);
    if (bonus > 0) {
      markStreakBonusAwarded();
      addXp(bonus, "streak_bonus");
    }
    return bonus;
  }, [addXp]);

  const progress = getLevelProgress(xp);
  const badge = getLevelBadge(progress.level);

  return {
    xp,
    level: progress.level,
    levelProgress: progress,
    badge,
    lastGain,
    addXp,
    awardStreakBonus,
    LEVEL_XP_STEP,
  };
}
