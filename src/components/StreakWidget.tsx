import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useLoginStreak } from "@/hooks/useLoginStreak";

const MILESTONES = [3, 7, 14, 30, 60, 90];
const MILESTONE_REWARDS: Record<number, number> = {
  3: 10, 7: 20, 14: 30, 30: 50, 60: 100, 90: 200,
};

function getNextMilestone(streak: number) {
  const next = MILESTONES.find((m) => m > streak) || 100;
  return { days: next, reward: MILESTONE_REWARDS[next] || 500 };
}

export default function StreakWidget() {
  const { t } = useLanguage();
  const { currentStreak } = useLoginStreak();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setCollapsed(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (currentStreak <= 0) return null;

  const nextMilestone = getNextMilestone(currentStreak);
  const progress = Math.min(100, (currentStreak / nextMilestone.days) * 100);

  return (
    <button
      onClick={() => setCollapsed((c) => !c)}
      className="fixed bottom-20 right-3 z-40 cursor-pointer"
    >
      {collapsed ? (
        <div className="bg-card/90 backdrop-blur-md border border-border rounded-full shadow-lg p-2 flex items-center gap-1.5 transition-all duration-300">
          <Flame size={16} className="text-secondary" />
          <span className="text-xs font-black text-foreground">{currentStreak}</span>
        </div>
      ) : (
        <div className="bg-card/90 backdrop-blur-md border border-border rounded-2xl shadow-lg p-3 w-[140px] transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
              <Flame size={16} className="text-secondary" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-black text-foreground">{currentStreak}</p>
              <p className="text-[9px] text-muted-foreground">{t("streak.days" as any)}</p>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[9px] text-muted-foreground">
              <span>{t("streak.next" as any)}</span>
              <span>{nextMilestone.days}{t("streak.daysShort" as any)}</span>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
              />
            </div>
            <p className="text-[8px] text-muted-foreground text-center">
              +{nextMilestone.reward} XP
            </p>
          </div>
        </div>
      )}
    </button>
  );
}
