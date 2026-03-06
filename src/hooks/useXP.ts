/**
 * UNIFIED XP HOOK
 * This is now a thin wrapper around useQuranXp for backward compatibility.
 * All XP logic lives in useQuranXp.ts — this file just provides the old API shape.
 */
import { useEffect, useRef } from "react";
import { useQuranXp, getLevelFromXp, getLevelBadge as getQuranLevelBadge, getLevelProgress } from "@/hooks/useQuranXp";

const OLD_XP_KEY = "quranEasyXP";
const MIGRATED_KEY = "xp_migration_done";

// Re-export helpers with old names for any external consumers
export const XP_PER_LEVEL = 500;

export function getLevel(xpTotal: number) {
  const level = getLevelFromXp(xpTotal);
  const progress = getLevelProgress(xpTotal);
  return { level, xpInLevel: progress.currentInLevel, xpForNext: XP_PER_LEVEL };
}

export { getQuranLevelBadge as getLevelBadge };

export function useXP() {
  const qxp = useQuranXp();
  const migratedRef = useRef(false);

  // Migrate old localStorage XP on first mount
  useEffect(() => {
    if (migratedRef.current) return;
    migratedRef.current = true;

    try {
      if (localStorage.getItem(MIGRATED_KEY)) return;
      const oldRaw = localStorage.getItem(OLD_XP_KEY);
      if (!oldRaw) {
        localStorage.setItem(MIGRATED_KEY, "1");
        return;
      }
      const parsed = JSON.parse(oldRaw);
      const oldTotal = parsed.xpTotal || 0;
      if (oldTotal > qxp.xp) {
        qxp.addXp(oldTotal - qxp.xp, "migration_from_old_system");
      }
      localStorage.removeItem(OLD_XP_KEY);
      localStorage.setItem(MIGRATED_KEY, "1");
    } catch {
      // ignore
    }
  }, [qxp.xp, qxp.addXp]);

  const levelInfo = getLevel(qxp.xp);

  return {
    xpTotal: qxp.xp,
    xpToday: 0, // not tracked separately anymore
    streakDays: 0, // use useStreak hook instead
    level: levelInfo.level,
    xpInLevel: levelInfo.xpInLevel,
    xpForNext: levelInfo.xpForNext,
    lastGain: qxp.lastGain,
    addXP: qxp.addXp, // uppercase alias for backward compat
    addXp: qxp.addXp,
    awardStreakBonus: () => 0,
    streakBonusAwarded: 0,
    levelBadge: qxp.badge,
    nextMilestone: null,
  };
}
