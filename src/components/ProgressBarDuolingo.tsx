import { motion, AnimatePresence } from "framer-motion";
import { Flame, Star } from "lucide-react";

interface ProgressBarDuolingoProps {
  level: number;
  xpInLevel: number;
  xpForNext: number;
  xpTotal: number;
  xpToday: number;
  streakDays: number;
  lastGain: number | null;
  compact?: boolean;
}

export default function ProgressBarDuolingo({
  level,
  xpInLevel,
  xpForNext,
  xpTotal,
  xpToday,
  streakDays,
  lastGain,
  compact = false,
}: ProgressBarDuolingoProps) {
  const progress = xpForNext > 0 ? (xpInLevel / xpForNext) * 100 : 0;

  return (
    <div className={`relative bg-card border border-border rounded-2xl ${compact ? "p-3" : "p-4"}`}>
      {/* +XP popup */}
      <AnimatePresence>
        {lastGain && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: -20, scale: 1 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.6 }}
            className="absolute -top-2 right-4 text-success font-bold text-lg z-10 pointer-events-none"
          >
            +{lastGain} XP ✨
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top row: level + streak */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
            <Star size={16} className="text-primary-foreground" />
          </div>
          <div>
            <p className={`font-bold text-foreground ${compact ? "text-sm" : "text-base"}`}>
              Niveau {level}
            </p>
            {!compact && (
              <p className="text-xs text-muted-foreground">
                {xpTotal} XP total · {xpToday} XP aujourd'hui
              </p>
            )}
          </div>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-1.5 bg-secondary/10 rounded-xl px-3 py-1.5">
          <Flame size={16} className={streakDays > 0 ? "text-secondary" : "text-muted-foreground"} />
          <span className={`font-bold ${compact ? "text-xs" : "text-sm"} ${streakDays > 0 ? "text-secondary" : "text-muted-foreground"}`}>
            {streakDays}
          </span>
          {!compact && (
            <span className="text-xs text-muted-foreground">
              {streakDays === 1 ? "jour" : "jours"}
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative">
        <div className={`w-full bg-muted rounded-full overflow-hidden ${compact ? "h-3" : "h-4"}`}>
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary via-success to-primary"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-muted-foreground font-medium">
            {xpInLevel} / {xpForNext} XP
          </span>
          <span className="text-[10px] text-muted-foreground font-medium">
            Niveau {level + 1} →
          </span>
        </div>
      </div>
    </div>
  );
}
