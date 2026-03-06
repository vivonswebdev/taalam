import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Flame, Compass, Heart, Moon } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const ITEMS = [
  { titleKey: "home.cat.athkar", icon: Flame, path: "/athkar/morning", emoji: "🤲" },
  { titleKey: "dashboard.qibla", icon: Compass, path: "/qibla", emoji: "🧭" },
  { titleKey: "home.daily.dua", icon: Heart, path: "/moods", emoji: "💎" },
  { titleKey: "dashboard.tasbih", icon: Moon, path: "/tasbih", emoji: "📿" },
] as const;

export default function DailyPractice() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="px-4 mt-5">
      <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
        🕌 {t("home.daily.title" as any)}
      </h2>
      <div className="grid grid-cols-4 gap-2">
        {ITEMS.map((item, i) => (
          <motion.button
            key={item.path}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.06 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-card/40 backdrop-blur-xl border border-border/20 hover:bg-card/60 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center text-xl">
              {item.emoji}
            </div>
            <span className="text-[10px] font-medium text-foreground text-center leading-tight">
              {t(item.titleKey as any)}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
