import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Gamepad2, BookOpen, Mic, Star, Heart, Book, GraduationCap, Trophy, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useNooraniProgress } from "@/hooks/useNooraniProgress";
import { useKidsChecklist } from "@/hooks/useKidsChecklist";
import HomeHeroCard, { type HeroCardData } from "@/components/HomeHeroCard";

export default function KidsHomePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const noorani = useNooraniProgress();
  const checklist = useKidsChecklist();

  const KIDS_CARDS: HeroCardData[] = [
    {
      icon: Gamepad2,
      titleKey: "kidsCards.games",
      descKey: "kidsCards.gamesDesc",
      href: "/jeux",
      gradient: "from-purple-400/30 to-pink-400/30",
      emoji: "🎮",
      progress: (() => {
        try {
          const today = new Date().toISOString().split("T")[0];
          const stored = localStorage.getItem(`games_${today}`);
          return stored ? Math.min(parseInt(stored) / 3, 1) : undefined;
        } catch { return undefined; }
      })(),
    },
    {
      icon: BookOpen,
      titleKey: "kidsCards.quran",
      descKey: "kidsCards.quranDesc",
      href: "/quran-hub",
      gradient: "from-blue-400/30 to-cyan-400/30",
      emoji: "📖",
    },
    {
      icon: Mic,
      titleKey: "kidsCards.tarteel",
      descKey: "kidsCards.tarteelDesc",
      href: "/recitation",
      gradient: "from-orange-400/30 to-red-400/30",
      emoji: "🎤",
    },
    {
      icon: Star,
      titleKey: "kidsCards.goodDeeds",
      descKey: "kidsCards.goodDeedsDesc",
      href: "/kids-checklist",
      gradient: "from-yellow-400/30 to-amber-400/30",
      emoji: "⭐",
      progress: checklist.totalCount > 0 ? checklist.completedCount / checklist.totalCount : undefined,
    },
    {
      icon: Heart,
      titleKey: "kidsCards.moods",
      descKey: "kidsCards.moodsDesc",
      href: "/moods",
      gradient: "from-rose-400/30 to-pink-400/30",
      emoji: "❤️",
    },
    {
      icon: Book,
      titleKey: "kidsCards.stories",
      descKey: "kidsCards.storiesDesc",
      href: "/kids-stories",
      gradient: "from-green-400/30 to-teal-400/30",
      emoji: "📖",
    },
    {
      icon: GraduationCap,
      titleKey: "kidsCards.noorani",
      descKey: "kidsCards.nooraniDesc",
      href: "/noorani",
      gradient: "from-indigo-400/30 to-purple-400/30",
      emoji: "🎓",
      progress: noorani.totalLessons > 0 ? noorani.completedLessonsCount / noorani.totalLessons : undefined,
    },
    {
      icon: Trophy,
      titleKey: "kidsCards.leaderboard",
      descKey: "kidsCards.leaderboardDesc",
      href: "/leaderboard?mode=kids",
      gradient: "from-amber-400/30 to-orange-400/30",
      emoji: "🏆",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-black/30 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-background/70 border-b border-border/50 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-muted">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-semibold">🧸 {t("kidsHome.title" as any)}</h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">{t("kidsHome.subtitle" as any)}</p>
        </div>
      </div>

      {/* ═══ 2x4 KIDS HERO GRID ═══ */}
      <div className="px-4 pt-4 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {KIDS_CARDS.map((card, i) => (
          <HomeHeroCard key={card.href} card={card} index={i} t={t} kids />
        ))}
      </div>
    </div>
  );
}
