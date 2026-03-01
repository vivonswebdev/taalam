import { useState, useCallback, useEffect, useMemo } from "react";
import { useXP } from "@/hooks/useXP";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";

const BADGE_KEY = "kids_gooddeeds_badges";
const BOOST_KEY = "kids_hifz_boost";

export interface GoodDeedsBadge {
  id: string;
  labelKey: string;
  emoji: string;
  /** Number of perfect days (6/6) required */
  requiredPerfectDays: number;
}

export const BADGES: GoodDeedsBadge[] = [
  { id: "super_day", labelKey: "goodDeeds.badgeSuperDay", emoji: "🌟", requiredPerfectDays: 1 },
  { id: "warrior_3", labelKey: "goodDeeds.badgeWarrior3", emoji: "🛡️", requiredPerfectDays: 3 },
  { id: "champion_7", labelKey: "goodDeeds.badgeChampion7", emoji: "🏆", requiredPerfectDays: 7 },
  { id: "legend_14", labelKey: "goodDeeds.badgeLegend14", emoji: "👑", requiredPerfectDays: 14 },
  { id: "master_30", labelKey: "goodDeeds.badgeMaster30", emoji: "💎", requiredPerfectDays: 30 },
];

function loadBadges(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(BADGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveBadges(data: Record<string, number>) {
  localStorage.setItem(BADGE_KEY, JSON.stringify(data));
}

export function isHifzBoostActive(): boolean {
  try {
    const stored = localStorage.getItem(BOOST_KEY);
    if (!stored) return false;
    const expiry = new Date(stored);
    return expiry.getTime() > Date.now();
  } catch {
    return false;
  }
}

function activateHifzBoost() {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24);
  localStorage.setItem(BOOST_KEY, expiry.toISOString());
}

export function useGoodDeedsRewards() {
  const { addXP } = useXP();
  const { t } = useLanguage();
  const [badges, setBadges] = useState<Record<string, number>>(loadBadges);
  const [boostActive, setBoostActive] = useState(isHifzBoostActive);
  const [lastRewardedDate, setLastRewardedDate] = useState<string | null>(null);

  // Refresh boost status every minute
  useEffect(() => {
    const iv = setInterval(() => setBoostActive(isHifzBoostActive()), 60000);
    return () => clearInterval(iv);
  }, []);

  const earnedBadges = useMemo(() => {
    return BADGES.filter(b => (badges[b.id] || 0) > 0);
  }, [badges]);

  /**
   * Call this when completedCount changes.
   * Returns the milestone level reached (0 = none, 3, 5, 6).
   */
  const checkMilestone = useCallback((completedCount: number, totalCount: number, dateKey: string) => {
    // Prevent double-rewarding same date
    const rewardKey = `gooddeeds_rewarded_${dateKey}`;
    const alreadyRewarded = localStorage.getItem(rewardKey);
    const prevMax = alreadyRewarded ? parseInt(alreadyRewarded, 10) : 0;

    if (completedCount >= 6 && prevMax < 6) {
      // 6/6 perfect
      addXP(5);
      activateHifzBoost();
      setBoostActive(true);

      // Award badge
      const updated = { ...loadBadges() };
      updated["super_day"] = (updated["super_day"] || 0) + 1;
      saveBadges(updated);
      setBadges(updated);

      localStorage.setItem(rewardKey, "6");

      toast({
        title: `🔥 ${t("goodDeeds.perfect" as any)}`,
        description: t("goodDeeds.boostActivated" as any),
      });
      return 6;
    }

    if (completedCount >= 5 && prevMax < 5) {
      addXP(3);
      localStorage.setItem(rewardKey, "5");
      toast({
        title: `🎁 ${t("goodDeeds.superDay" as any)}`,
        description: t("goodDeeds.reward5" as any),
      });
      return 5;
    }

    if (completedCount >= 3 && prevMax < 3) {
      addXP(2);
      localStorage.setItem(rewardKey, "3");
      toast({
        title: `✨ ${t("goodDeeds.mashallah" as any)}`,
        description: t("goodDeeds.reward3" as any),
      });
      return 3;
    }

    return 0;
  }, [addXP, t]);

  /**
   * Check streak-based badges (called with perfect day count from allData)
   */
  const checkStreakBadges = useCallback((perfectDayStreak: number) => {
    const current = loadBadges();
    let newBadge: GoodDeedsBadge | null = null;

    for (const badge of BADGES) {
      if (badge.id === "super_day") continue; // counted per day
      if (perfectDayStreak >= badge.requiredPerfectDays && !current[badge.id]) {
        current[badge.id] = 1;
        newBadge = badge;
      }
    }

    if (newBadge) {
      saveBadges(current);
      setBadges(current);
      toast({
        title: `${newBadge.emoji} ${t("goodDeeds.newBadge" as any)}`,
        description: t(newBadge.labelKey as any),
      });
    }
  }, [t]);

  /**
   * Compute perfect day streak from allData
   */
  const getPerfectDayStreak = useCallback((allData: Record<string, string[]>, totalCount: number, fromDate?: Date) => {
    let count = 0;
    const d = new Date(fromDate || new Date());
    for (let i = 0; i < 90; i++) {
      const key = d.toISOString().slice(0, 10);
      if ((allData[key] || []).length === totalCount) {
        count++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    return count;
  }, []);

  return {
    checkMilestone,
    checkStreakBadges,
    getPerfectDayStreak,
    earnedBadges,
    allBadges: BADGES,
    badges,
    boostActive,
  };
}
