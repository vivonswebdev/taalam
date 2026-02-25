import { motion } from "framer-motion";

export type Ligue = "bronze" | "silver" | "gold" | "platinum" | "diamond";

interface LigueConfig {
  name: string;
  emoji: string;
  minXP: number;
  gradient: string;
}

export const LIGUES: Record<Ligue, LigueConfig> = {
  bronze: { name: "Bronze", emoji: "🥉", minXP: 0, gradient: "from-amber-700 to-amber-500" },
  silver: { name: "Argent", emoji: "🥈", minXP: 500, gradient: "from-slate-400 to-slate-300" },
  gold: { name: "Or", emoji: "🥇", minXP: 1500, gradient: "from-yellow-500 to-amber-400" },
  platinum: { name: "Platine", emoji: "💎", minXP: 3000, gradient: "from-cyan-500 to-blue-400" },
  diamond: { name: "Diamant", emoji: "👑", minXP: 5000, gradient: "from-purple-500 to-pink-400" },
};

export function getLigue(xp: number): Ligue {
  if (xp >= 5000) return "diamond";
  if (xp >= 3000) return "platinum";
  if (xp >= 1500) return "gold";
  if (xp >= 500) return "silver";
  return "bronze";
}

export function getNextLigue(current: Ligue): Ligue | null {
  const order: Ligue[] = ["bronze", "silver", "gold", "platinum", "diamond"];
  const idx = order.indexOf(current);
  return idx < order.length - 1 ? order[idx + 1] : null;
}

export function getHifzLevel(masteryScore: number): "beginner" | "intermediate" | "advanced" {
  if (masteryScore >= 60) return "advanced";
  if (masteryScore >= 25) return "intermediate";
  return "beginner";
}

interface LigueBadgeProps {
  ligue: Ligue;
  size?: "sm" | "md" | "lg";
}

export default function LigueBadge({ ligue, size = "md" }: LigueBadgeProps) {
  const config = LIGUES[ligue];
  const sizeClasses = {
    sm: "w-8 h-8 text-lg",
    md: "w-12 h-12 text-2xl",
    lg: "w-16 h-16 text-3xl",
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg`}
    >
      {config.emoji}
    </motion.div>
  );
}
