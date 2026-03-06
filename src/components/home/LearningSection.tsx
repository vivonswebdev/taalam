import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Target, Map, BookText, Search } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const CARDS = [
  {
    titleKey: "dashboard.hifzPlan",
    descKey: "home.learn.planDesc",
    icon: Target,
    path: "/hifz-plan",
    gradient: "from-[hsl(43,70%,53%)] to-[hsl(40,90%,55%)]",
  },
  {
    titleKey: "dashboard.hifzMap",
    descKey: "home.learn.mapDesc",
    icon: Map,
    path: "/hifz-map",
    gradient: "from-[hsl(142,72%,40%)] to-[hsl(150,60%,45%)]",
  },
  {
    titleKey: "dashboard.noorani",
    descKey: "home.learn.nooraniDesc",
    icon: BookText,
    path: "/noorani",
    gradient: "from-[hsl(150,50%,15%)] to-[hsl(142,50%,30%)]",
  },
  {
    titleKey: "dashboard.findAyah",
    descKey: "home.learn.searchDesc",
    icon: Search,
    path: "/find-ayah",
    gradient: "from-[hsl(142,50%,50%)] to-[hsl(152,60%,45%)]",
  },
] as const;

export default function LearningSection() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="mt-5">
      <h2 className="text-sm font-bold text-foreground mb-3 px-4 flex items-center gap-2">
        🎓 {t("home.cat.apprentissage" as any)}
      </h2>
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 px-4 pb-2">
          {CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.button
                key={card.path}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.07 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate(card.path)}
                className={`shrink-0 w-36 rounded-xl p-4 bg-gradient-to-br ${card.gradient} shadow-md hover:scale-[1.03] transition-transform text-left`}
              >
                <Icon size={20} className="text-white mb-2" />
                <p className="text-xs font-bold text-white leading-tight">
                  {t(card.titleKey as any)}
                </p>
                <p className="text-[9px] text-white/70 mt-1 line-clamp-2">
                  {t(card.descKey as any)}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
