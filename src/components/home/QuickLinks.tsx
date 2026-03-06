import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

const LINKS = [
  { titleKey: "dashboard.habits", emoji: "✅", path: "/habits" },
  { titleKey: "dashboard.bookmarks", emoji: "🔖", path: "/bookmarks" },
  { titleKey: "dashboard.kids", emoji: "👨‍👩‍👧", path: "/kids" },
  { titleKey: "dashboard.classrooms", emoji: "🏫", path: "/classrooms" },
  { titleKey: "dashboard.leaderboard", emoji: "🏆", path: "/leaderboard" },
  { titleKey: "dashboard.community", emoji: "🌍", path: "/community" },
  { titleKey: "dashboard.calendar", emoji: "🌙", path: "/islamic-calendar" },
  { titleKey: "dashboard.listening", emoji: "🎧", path: "/listening" },
  { titleKey: "dashboard.reading", emoji: "📖", path: "/reading" },
  { titleKey: "dashboard.zakat", emoji: "💰", path: "/zakat" },
  { titleKey: "dashboard.liveHaramain", emoji: "🕋", path: "/live-haramain" },
  { titleKey: "dashboard.stories", emoji: "📜", path: "/kids-stories" },
  { titleKey: "dashboard.athan", emoji: "📢", path: "/prayers" },
  { titleKey: "dashboard.mosques", emoji: "🕌", path: "/kids-mosque-map" },
  { titleKey: "home.cat.liveQuran", emoji: "🔴", path: "/live-quran" },
  { titleKey: "dashboard.games", emoji: "🎮", path: "/jeux" },
  { titleKey: "dashboard.profile", emoji: "👤", path: "/settings" },
  { titleKey: "dashboard.offline", emoji: "📱", path: "/offline-settings" },
  { titleKey: "dashboard.notifs", emoji: "🔔", path: "/notification-settings" },
  { titleKey: "dashboard.faq", emoji: "❓", path: "/faq" },
] as const;

export default function QuickLinks() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="px-4">
      <h2 className="text-white/60 text-[11px] font-semibold uppercase tracking-wider mb-2.5">
        {t("home.cat.parametres" as any)}
      </h2>
      <div className="grid grid-cols-5 gap-2">
        {LINKS.map((link, i) => (
          <motion.button
            key={link.path + i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 + i * 0.02 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => navigate(link.path)}
            className="flex flex-col items-center gap-1 rounded-lg py-2 hover:bg-white/5 transition-colors"
          >
            <span className="text-lg">{link.emoji}</span>
            <span className="text-white/50 text-[8px] font-medium text-center leading-tight line-clamp-1">
              {t(link.titleKey as any)}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Footer */}
      <p className="mt-6 mb-4 text-[9px] text-white/30 text-center leading-relaxed max-w-[280px] mx-auto">
        {t("home.freeMessage" as any)}{" "}
        <a href="https://taalam.eu" target="_blank" rel="noopener noreferrer" className="text-[hsl(152_65%_50%)]/60 underline underline-offset-2">
          taalam.eu
        </a>
      </p>
    </div>
  );
}
