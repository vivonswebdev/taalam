import { useLocation, useNavigate } from "react-router-dom";
import { Home, BookOpen, Mic, Heart, BarChart3, Menu, Gamepad2 } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { useUserMode } from "@/hooks/useUserMode";

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { mode } = useUserMode();
  const currentPath = location.pathname;
  const isKidMode = mode === "child";

  const baseTabs = [
    { path: "/", icon: Home, label: t("nav.home" as any) || "Accueil" },
    { path: "/quran-hub", icon: BookOpen, label: t("nav.quran" as any) || "Coran" },
    { path: "/tarteel", icon: Mic, label: t("nav.tarteel" as any) || "Tarteel" },
    { path: "/moods", icon: Heart, label: t("nav.heart" as any) || "Cœur" },
  ];

  const gameTab = { path: "/jeux", icon: Gamepad2, label: t("nav.games" as any) || "Jeux" };

  const endTabs = [
    { path: "/habits", icon: BarChart3, label: t("nav.stats" as any) || "Stats" },
    { path: "/more", icon: Menu, label: t("nav.more" as any) || "Plus" },
  ];

  const tabs = isKidMode ? [...baseTabs, gameTab, ...endTabs] : [...baseTabs, ...endTabs];

  if (currentPath.startsWith("/quiz") || /^\/learn\/\d+/.test(currentPath) || currentPath.startsWith("/recitation/") || (currentPath.startsWith("/moods/") && currentPath !== "/moods") || currentPath.startsWith("/maladies/") || currentPath.startsWith("/athkar/")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-nav border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto h-16 px-2">
        {tabs.map((tab) => {
          const isActive = currentPath === tab.path;
          const Icon = tab.icon;
          return (
            <button key={tab.path} onClick={() => navigate(tab.path)} className="relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors">
              {isActive && (
                <motion.div layoutId="activeTab" className="absolute inset-x-2 -top-px h-0.5 bg-primary rounded-full" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
              )}
              <Icon size={22} className={isActive ? "text-primary" : "text-muted-foreground"} />
              <span className={`text-[10px] font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
