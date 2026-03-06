import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Mic, Brain, ChevronRight } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const ACTIONS = [
  {
    titleKey: "dashboard.mushaf",
    descKey: "home.primary.mushafDesc",
    icon: BookOpen,
    path: "/mushaf",
    gradient: "from-[hsl(142,72%,40%)] to-[hsl(142,72%,50%)]",
  },
  {
    titleKey: "dashboard.tarteel",
    descKey: "home.primary.tarteelDesc",
    icon: Mic,
    path: "/tarteel",
    gradient: "from-[hsl(150,50%,15%)] to-[hsl(142,72%,40%)]",
  },
  {
    titleKey: "home.primary.hifz",
    descKey: "home.primary.hifzDesc",
    icon: Brain,
    path: "/hifz-plan",
    gradient: "from-[hsl(43,70%,53%)] to-[hsl(40,90%,55%)]",
  },
] as const;

export default function PrimaryActions() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="px-4 space-y-3 mt-4">
      {ACTIONS.map((action, i) => {
        const Icon = action.icon;
        return (
          <motion.button
            key={action.path}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.1, type: "spring", stiffness: 260, damping: 25 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(action.path)}
            className={`w-full flex items-center gap-4 rounded-2xl p-4 bg-gradient-to-r ${action.gradient} shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200`}
          >
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
              <Icon size={28} className="text-white" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-base font-bold text-white leading-tight">
                {t(action.titleKey as any)}
              </p>
              <p className="text-xs text-white/70 mt-0.5">
                {t(action.descKey as any)}
              </p>
            </div>
            <ChevronRight size={20} className="text-white/60 shrink-0" />
          </motion.button>
        );
      })}
    </div>
  );
}
