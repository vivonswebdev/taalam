import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

const TOOLS = [
  { titleKey: "home.cat.athkar", emoji: "🤲", path: "/athkar/morning" },
  { titleKey: "dashboard.qibla", emoji: "🧭", path: "/qibla" },
  { titleKey: "dashboard.moods", emoji: "💎", path: "/moods" },
  { titleKey: "dashboard.tasbih", emoji: "📿", path: "/tasbih" },
] as const;

export default function DailyPractice() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="px-4">
      <h2 className="text-white/60 text-[11px] font-semibold uppercase tracking-wider mb-2.5">
        {t("home.cat.pratique" as any)}
      </h2>
      <div className="grid grid-cols-4 gap-2.5">
        {TOOLS.map((tool, i) => (
          <motion.button
            key={tool.path}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.06 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(tool.path)}
            className="flex flex-col items-center gap-1.5 rounded-xl py-3 bg-white/5 border border-white/8 hover:bg-white/10 transition-colors"
          >
            <span className="text-2xl">{tool.emoji}</span>
            <span className="text-white/70 text-[9px] font-medium">{t(tool.titleKey as any)}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
