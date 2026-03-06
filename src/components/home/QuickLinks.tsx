import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

const LINKS = [
  { titleKey: "dashboard.theme", emoji: "🎨", action: "theme" as const },
  { titleKey: "dashboard.notifs", emoji: "🔔", path: "/notification-settings" },
  { titleKey: "dashboard.classrooms", emoji: "🏫", path: "/classrooms" },
  { titleKey: "dashboard.leaderboard", emoji: "🏆", path: "/leaderboard" },
  { titleKey: "dashboard.languages", emoji: "🌍", path: "/settings" },
  { titleKey: "dashboard.offline", emoji: "📱", path: "/offline-settings" },
  { titleKey: "dashboard.kids", emoji: "👨‍👩‍👧", path: "/kids" },
  { titleKey: "dashboard.teacher", emoji: "👨‍🏫", path: "/teacher-dashboard" },
  { titleKey: "dashboard.community", emoji: "🌍", path: "/community" },
  { titleKey: "dashboard.quiz", emoji: "🧠", path: "/quiz" },
  { titleKey: "dashboard.habits", emoji: "✅", path: "/habits" },
  { titleKey: "dashboard.bookmarks", emoji: "🔖", path: "/bookmarks" },
  { titleKey: "dashboard.zakat", emoji: "💰", path: "/zakat" },
  { titleKey: "dashboard.calendar", emoji: "🌙", path: "/islamic-calendar" },
  { titleKey: "dashboard.stories", emoji: "📜", path: "/kids-stories" },
  { titleKey: "dashboard.liveHaramain", emoji: "🕋", path: "/live-haramain" },
  { titleKey: "dashboard.athan", emoji: "📢", path: "/prayers" },
  { titleKey: "dashboard.listening", emoji: "🎧", path: "/listening" },
  { titleKey: "home.cat.liveQuran", emoji: "🔴", path: "/live-quran" },
  { titleKey: "dashboard.reading", emoji: "📚", path: "/reading" },
  { titleKey: "dashboard.games", emoji: "🎮", path: "/jeux" },
  { titleKey: "dashboard.profile", emoji: "👤", path: "/settings" },
  { titleKey: "dashboard.faq", emoji: "❓", path: "/faq" },
  { titleKey: "dashboard.donate", emoji: "❤️", action: "donate" as const },
] as const;

interface Props {
  onAction: (action: string) => void;
}

export default function QuickLinks({ onAction }: Props) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="px-4 mt-5">
      <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
        ⚡ {t("home.quickLinks" as any)}
      </h2>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-6 gap-2"
      >
        {LINKS.map((link) => {
          const inner = (
            <div className="flex flex-col items-center gap-1 py-2">
              <span className="text-lg">{link.emoji}</span>
              <span className="text-[9px] text-muted-foreground font-medium text-center leading-tight line-clamp-1">
                {t(link.titleKey as any)}
              </span>
            </div>
          );

          if ("action" in link && link.action) {
            return (
              <button
                key={link.titleKey}
                onClick={() => onAction(link.action!)}
                className="hover:bg-card/40 rounded-lg transition-colors"
              >
                {inner}
              </button>
            );
          }

          return (
            <Link
              key={link.titleKey}
              to={link.path!}
              className="hover:bg-card/40 rounded-lg transition-colors"
            >
              {inner}
            </Link>
          );
        })}
      </motion.div>
    </div>
  );
}
