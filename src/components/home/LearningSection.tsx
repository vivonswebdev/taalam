import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

const ITEMS = [
  { titleKey: "dashboard.hifzMap", emoji: "🗺️", path: "/hifz-map", gradient: "linear-gradient(135deg, #0F3823, #16A34A)" },
  { titleKey: "dashboard.noorani", emoji: "📚", path: "/noorani", gradient: "linear-gradient(135deg, #1E3A5F, #3B82F6)" },
  { titleKey: "dashboard.quiz", emoji: "🧠", path: "/quiz", gradient: "linear-gradient(135deg, #4C1D95, #7C3AED)" },
  { titleKey: "dashboard.findAyah", emoji: "🔍", path: "/find-ayah", gradient: "linear-gradient(135deg, #065F46, #10B981)" },
  { titleKey: "home.cat.study", emoji: "✍️", path: "/study", gradient: "linear-gradient(135deg, #0C4A6E, #0EA5E9)" },
] as const;

export default function LearningSection() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div>
      <h2 className="text-white/60 text-[11px] font-semibold uppercase tracking-wider mb-2.5 px-4">
        {t("home.cat.apprentissage" as any)}
      </h2>
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-2.5 px-4 pb-1">
          {ITEMS.map((item, i) => (
            <motion.button
              key={item.path}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.06 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate(item.path)}
              className="shrink-0 w-28 rounded-xl p-3 border border-white/10 hover:border-white/20 transition-colors"
              style={{ background: item.gradient }}
            >
              <span className="text-2xl block mb-2">{item.emoji}</span>
              <span className="text-white text-[10px] font-bold block leading-tight">
                {t(item.titleKey as any)}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
