import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export interface HeroCardData {
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
  href: string;
  gradient: string;
  emoji: string;
  badge?: number;
  progress?: number; // 0-1
}

interface Props {
  card: HeroCardData;
  index: number;
  t: (key: any) => string;
  /** kids mode: bigger emoji, bouncier spring */
  kids?: boolean;
}

export default function HomeHeroCard({ card, index, t, kids }: Props) {
  const navigate = useNavigate();
  const Icon = card.icon;

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.06, type: "spring", stiffness: 260, damping: kids ? 20 : 25 }}
      whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.96 }}
      onClick={() => navigate(card.href)}
      className={`
        relative flex flex-col justify-between min-h-[120px] rounded-3xl p-4 text-left overflow-hidden
        bg-card/80 backdrop-blur-xl border border-border/40
        shadow-lg hover:shadow-2xl transition-shadow
      `}
    >
      {/* Notification badge */}
      {card.badge != null && card.badge > 0 && (
        <span className="absolute top-2 right-2 z-20 min-w-[20px] h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1.5">
          {card.badge}
        </span>
      )}

      {/* Shimmer on hover */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-700 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* Emoji + Icon */}
      <div className="flex items-center gap-2 relative z-10">
        <motion.span
          className={kids ? "text-4xl" : "text-2xl"}
          whileHover={{ scale: 1.25, rotate: 8 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          {card.emoji}
        </motion.span>
        <Icon className="w-4 h-4 text-muted-foreground/60" />
      </div>

      {/* Title */}
      <p className="text-sm font-bold text-foreground leading-tight mt-2 relative z-10">
        {t(card.titleKey as any)}
      </p>

      {/* Description */}
      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2 relative z-10">
        {t(card.descKey as any)}
      </p>

      {/* Progress bar */}
      {card.progress != null && (
        <div className="w-full mt-3 space-y-1 relative z-10">
          <div className="relative h-2 rounded-full bg-muted overflow-hidden shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
              style={{ width: `${Math.min(card.progress * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[9px] font-semibold">
            <span className="text-muted-foreground">{t("homeCards.progress" as any)}</span>
            <span className={Math.round(card.progress * 100) >= 100 ? "text-success" : "text-foreground/70"}>
              {Math.round(card.progress * 100)}%
            </span>
          </div>
        </div>
      )}
    </motion.button>
  );
}
