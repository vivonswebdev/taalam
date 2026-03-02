import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useNooraniProgress } from "@/hooks/useNooraniProgress";
import { useKidsChecklist } from "@/hooks/useKidsChecklist";
import PageBackground from "@/components/PageBackground";
import KidsPrayerTracker from "@/components/kids/KidsPrayerTracker";
import KidsRamadanTracker from "@/components/kids/KidsRamadanTracker";

const KIDS_CARDS = [
  {
    titleKey: "kidsCards.games",
    descKey: "kidsCards.gamesDesc",
    href: "/jeux",
    emoji: "🎮",
    color: "from-purple-500 to-pink-500",
  },
  {
    titleKey: "kidsCards.quran",
    descKey: "kidsCards.quranDesc",
    href: "/quran-hub",
    emoji: "📖",
    color: "from-blue-500 to-cyan-500",
  },
  {
    titleKey: "kidsCards.tarteel",
    descKey: "kidsCards.tarteelDesc",
    href: "/recitation",
    emoji: "🎤",
    color: "from-orange-500 to-red-500",
  },
  {
    titleKey: "kidsCards.goodDeeds",
    descKey: "kidsCards.goodDeedsDesc",
    href: "/kids-checklist",
    emoji: "⭐",
    color: "from-emerald-400 to-green-600",
    hasProgress: "checklist",
  },
  {
    titleKey: "kidsCards.moods",
    descKey: "kidsCards.moodsDesc",
    href: "/moods",
    emoji: "❤️",
    color: "from-rose-500 to-pink-600",
  },
  {
    titleKey: "kidsCards.stories",
    descKey: "kidsCards.storiesDesc",
    href: "/kids-stories",
    emoji: "📚",
    color: "from-amber-400 to-orange-500",
  },
  {
    titleKey: "kidsCards.noorani",
    descKey: "kidsCards.nooraniDesc",
    href: "/noorani",
    emoji: "🎓",
    color: "from-indigo-500 to-violet-600",
    hasProgress: "noorani",
  },
  {
    titleKey: "kidsCards.leaderboard",
    descKey: "kidsCards.leaderboardDesc",
    href: "/kids-leaderboard",
    emoji: "🏆",
    color: "from-yellow-400 to-amber-500",
  },
] as const;

export default function KidsHomePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const noorani = useNooraniProgress();
  const checklist = useKidsChecklist();

  const getProgress = (key?: string) => {
    if (key === "checklist" && checklist.totalCount > 0)
      return Math.round((checklist.completedCount / checklist.totalCount) * 100);
    if (key === "noorani" && noorani.totalLessons > 0)
      return Math.round((noorani.completedLessonsCount / noorani.totalLessons) * 100);
    return null;
  };

  return (
    <PageBackground intensity="immersive">
      <div className="min-h-screen pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 pt-6 pb-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-white/10 backdrop-blur">
            <ArrowLeft size={20} />
          </button>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1"
          >
            <h1 className="text-xl font-extrabold text-foreground">
              🧸 {t("kidsHome.title" as any)}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("kidsHome.subtitle" as any)}
            </p>
          </motion.div>
          <button
            onClick={() => navigate("/kids-leaderboard")}
            className="px-3 py-1.5 rounded-xl bg-amber-400/80 dark:bg-amber-500/30 text-sm font-bold text-foreground flex items-center gap-1"
          >
            🏆
          </button>
        </div>

        {/* Prayer Tracker */}
        <KidsPrayerTracker />

        {/* Ramadan Tracker */}
        <KidsRamadanTracker />

        {/* Colorful 2-col grid */}
        <div className="grid grid-cols-2 gap-4 px-4 mt-2">
          {KIDS_CARDS.map((card, i) => {
            const progress = getProgress((card as any).hasProgress);
            return (
              <motion.button
                key={card.href}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.07, type: "spring", stiffness: 300, damping: 20 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => navigate(card.href)}
                className={`relative flex flex-col items-center justify-center gap-2 p-5 rounded-3xl bg-gradient-to-br ${card.color} shadow-lg shadow-black/10 aspect-square overflow-hidden`}
              >
                {/* Sparkle */}
                <motion.span
                  className="absolute top-2 right-3 text-lg"
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                >
                  ✨
                </motion.span>

                {/* Emoji */}
                <motion.span
                  className="text-5xl"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
                >
                  {card.emoji}
                </motion.span>

                {/* Title */}
                <span className="text-sm font-bold text-white drop-shadow">
                  {t(card.titleKey as any)}
                </span>

                {/* Description */}
                <span className="text-[10px] text-white/80 font-medium leading-tight text-center">
                  {t(card.descKey as any)}
                </span>

                {/* Progress bar */}
                {progress !== null && (
                  <div className="w-full mt-1 px-1">
                    <div className="h-1.5 rounded-full bg-white/30 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-white/90 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-[9px] text-white/70 text-right mt-0.5 font-bold">
                      {progress}%
                    </p>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </PageBackground>
  );
}
