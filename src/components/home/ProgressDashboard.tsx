import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { useHifzSRS } from "@/hooks/useHifzSRS";

const STATS_CARDS = [
  { titleKey: "dashboard.progress", emoji: "📊", path: "/progress" },
  { titleKey: "home.cat.hifzToday", emoji: "📅", path: "/hifz-today" },
  { titleKey: "home.cat.perfectLb", emoji: "⭐", path: "/perfect-leaderboard" },
] as const;

export default function ProgressDashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { todayItems } = useHifzSRS();

  return (
    <div className="px-4">
      <h2 className="text-white/60 text-[11px] font-semibold uppercase tracking-wider mb-2.5">
        {t("home.cat.progression" as any)}
      </h2>
      <div className="flex gap-2.5">
        {STATS_CARDS.map((card, i) => (
          <motion.button
            key={card.path}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.06 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate(card.path)}
            className="flex-1 flex flex-col items-center gap-1.5 rounded-xl py-3 bg-white/5 border border-white/8 hover:bg-white/10 transition-colors"
          >
            <span className="text-xl">{card.emoji}</span>
            <span className="text-white/70 text-[9px] font-medium text-center leading-tight">
              {t(card.titleKey as any)}
            </span>
            {card.path === "/hifz-today" && todayItems.length > 0 && (
              <span className="text-[8px] font-bold text-[hsl(152_65%_50%)]">
                {todayItems.length} {t("hifzSrs.review" as any)}
              </span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
