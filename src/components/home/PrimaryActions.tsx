import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Mic, Brain } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const ACTIONS = [
  {
    titleKey: "dashboard.mushaf",
    descKey: "home.primary.mushafDesc",
    path: "/mushaf",
    icon: BookOpen,
    gradient: "linear-gradient(135deg, #16A34A, #22C55E)",
  },
  {
    titleKey: "dashboard.tarteel",
    descKey: "home.primary.tarteelDesc",
    path: "/tarteel",
    icon: Mic,
    gradient: "linear-gradient(135deg, #0F3823, #166534)",
  },
  {
    titleKey: "dashboard.hifzPlan",
    descKey: "home.primary.hifzDesc",
    path: "/hifz-plan",
    icon: Brain,
    gradient: "linear-gradient(135deg, #D4AF37, #F59E0B)",
  },
] as const;

export default function PrimaryActions() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="px-4 space-y-2.5">
      {ACTIONS.map((action, i) => {
        const Icon = action.icon;
        return (
          <motion.button
            key={action.path}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.08, duration: 0.35 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(action.path)}
            className="w-full flex items-center gap-4 rounded-2xl p-4 border border-white/15 hover:border-white/25 transition-all duration-300"
            style={{ background: action.gradient }}
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Icon size={24} className="text-white" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-white text-sm font-bold">{t(action.titleKey as any)}</p>
              <p className="text-white/70 text-[10px] mt-0.5">{t(action.descKey as any)}</p>
            </div>
            <span className="text-white/40 text-lg">›</span>
          </motion.button>
        );
      })}
    </div>
  );
}
