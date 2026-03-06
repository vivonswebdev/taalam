import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart3, Calendar, Award } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const ITEMS = [
  { titleKey: "dashboard.progress", icon: BarChart3, path: "/progress", emoji: "📊" },
  { titleKey: "home.cat.hifzToday", icon: Calendar, path: "/hifz-today", emoji: "📅" },
  { titleKey: "home.cat.perfectLb", icon: Award, path: "/perfect-leaderboard", emoji: "⭐" },
] as const;

export default function ProgressDashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="px-4 mt-5">
      <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
        📊 {t("home.cat.progression" as any)}
      </h2>
      <div className="grid grid-cols-3 gap-2">
        {ITEMS.map((item, i) => (
          <motion.button
            key={item.path}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.06 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-card/40 backdrop-blur-xl border border-border/20 hover:bg-card/60 transition-colors"
          >
            <span className="text-xl">{item.emoji}</span>
            <span className="text-[10px] font-medium text-foreground text-center leading-tight">
              {t(item.titleKey as any)}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
