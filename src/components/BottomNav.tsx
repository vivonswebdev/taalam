import { useLocation, useNavigate } from "react-router-dom";
import { Home, BookOpen, Mic, Clock, Settings, BookOpenText, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { useClassrooms } from "@/hooks/useClassrooms";

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { totalNewMembers } = useClassrooms();
  const currentPath = location.pathname;

  const tabs = [
    { path: "/", icon: Home, label: t("nav.home"), badge: totalNewMembers },
    { path: "/reading", icon: BookOpenText, label: t("nav.reading") },
    { path: "/quran", icon: Mic, label: t("nav.quran") },
    { path: "/moods", icon: Heart, label: "Cœur" },
    { path: "/prayers", icon: Clock, label: t("nav.prayers") },
    { path: "/settings", icon: Settings, label: t("nav.settings") },
  ];

  if (currentPath.startsWith("/quiz") || /^\/learn\/\d+/.test(currentPath) || currentPath.startsWith("/recitation/")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-nav border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto h-16 px-2">
        {tabs.map((tab) => {
          const isActive = currentPath === tab.path;
          const Icon = tab.icon;
          const badge = (tab as any).badge;
          return (
            <button key={tab.path} onClick={() => navigate(tab.path)} className="relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors">
              {isActive && (
                <motion.div layoutId="activeTab" className="absolute inset-x-2 -top-px h-0.5 bg-primary rounded-full" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
              )}
              <div className="relative">
                <Icon size={22} className={isActive ? "text-primary" : "text-muted-foreground"} />
                {badge > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold px-1"
                  >
                    {badge}
                  </motion.span>
                )}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
