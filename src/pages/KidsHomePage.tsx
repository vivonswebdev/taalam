import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/hooks/useLanguage";
import { useNooraniProgress } from "@/hooks/useNooraniProgress";
import { useKidsChecklist } from "@/hooks/useKidsChecklist";
import KidsPrayerTracker from "@/components/kids/KidsPrayerTracker";

import IslamicStoriesPlayer from "@/components/kids/IslamicStoriesPlayer";
import IslamicStoryVideoPlayer from "@/components/kids/IslamicStoryVideoPlayer";
import { GlassCard } from "@/components/kids/futuristic/GlassCard";
import { FloatingParticles } from "@/components/kids/futuristic/FloatingParticles";

const GRADIENTS = ["primary", "cosmic", "sunset", "forest"] as const;

const KIDS_CARDS = [
  {
    titleKey: "kidsCards.games",
    descKey: "kidsCards.gamesDesc",
    href: "/jeux",
    emoji: "🎮",
    gradient: "primary",
  },
  {
    titleKey: "kidsCards.quran",
    descKey: "kidsCards.quranDesc",
    href: "/quran-hub",
    emoji: "📖",
    gradient: "cosmic",
  },
  {
    titleKey: "kidsCards.tarteel",
    descKey: "kidsCards.tarteelDesc",
    href: "/recitation",
    emoji: "🎤",
    gradient: "sunset",
  },
  {
    titleKey: "kidsCards.goodDeeds",
    descKey: "kidsCards.goodDeedsDesc",
    href: "/kids-checklist",
    emoji: "⭐",
    gradient: "forest",
    hasProgress: "checklist",
  },
  {
    titleKey: "kidsCards.moods",
    descKey: "kidsCards.moodsDesc",
    href: "/moods",
    emoji: "❤️",
    gradient: "sunset",
  },
  {
    titleKey: "kidsCards.stories",
    descKey: "kidsCards.storiesDesc",
    href: "/kids-stories",
    emoji: "📚",
    gradient: "primary",
  },
  {
    titleKey: "kidsCards.noorani",
    descKey: "kidsCards.nooraniDesc",
    href: "/noorani",
    emoji: "🎓",
    gradient: "cosmic",
    hasProgress: "noorani",
  },
  {
    titleKey: "kidsCards.leaderboard",
    descKey: "kidsCards.leaderboardDesc",
    href: "/kids-leaderboard",
    emoji: "🏆",
    gradient: "sunset",
  },
  {
    titleKey: "badges.galleryTitle",
    descKey: "badges.share",
    href: "/child-gallery",
    emoji: "🎖️",
    gradient: "forest",
  },
  {
    titleKey: "mathGames.title",
    descKey: "mathGames.subtitle",
    href: "/kids-math",
    emoji: "🧮",
    gradient: "primary",
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
    <>
      <SEOHead
        title="Espace Enfants - Apprendre l'Islam en jouant"
        description="Jeux islamiques, quiz prophètes, prière et Coran pour les enfants."
        path="/kids"
      />

      {/* Cosmic background */}
      <div className="min-h-screen pb-24 relative overflow-hidden bg-gradient-to-b from-[hsl(260,50%,12%)] via-[hsl(240,40%,18%)] to-[hsl(220,35%,10%)]">
        {/* Floating particles */}
        <FloatingParticles count={14} />

        {/* Subtle grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(0 0% 100% / 0.1) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100% / 0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Header */}
        <div className="relative z-10 flex items-center gap-3 px-4 pt-6 pb-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15"
          >
            <ArrowLeft size={20} className="text-white" />
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1"
          >
            <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              >
                🚀
              </motion.span>
              {t("kidsHome.title" as any)}
            </h1>
            <p className="text-xs text-white/60 mt-0.5">
              {t("kidsHome.subtitle" as any)}
            </p>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("/kids-leaderboard")}
            className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-400/30 to-orange-500/30 backdrop-blur-md border border-amber-400/30"
          >
            <Trophy size={20} className="text-amber-300" />
          </motion.button>
        </div>

        {/* Prayer & Ramadan Trackers */}
        <div className="relative z-10">
          <KidsPrayerTracker />
        </div>

        {/* Cards Grid */}
        <div className="relative z-10 grid grid-cols-2 gap-4 px-4 mt-3">
          {KIDS_CARDS.map((card, i) => {
            const progress = getProgress((card as any).hasProgress);
            return (
              <GlassCard
                key={card.href}
                gradient={card.gradient as any}
                delay={i * 0.06}
                onClick={() => navigate(card.href)}
                className="aspect-square flex flex-col items-center justify-center p-4"
              >
                <div className="flex flex-col items-center justify-center gap-2 text-center h-full">
                  {/* Sparkle */}
                  <motion.span
                    className="absolute top-2 right-3 text-sm"
                    animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1.15, 0.8] }}
                    transition={{ repeat: Infinity, duration: 2, delay: i * 0.2 }}
                  >
                    ✨
                  </motion.span>

                  {/* Emoji */}
                  <motion.span
                    className="text-5xl drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.25, ease: "easeInOut" }}
                  >
                    {card.emoji}
                  </motion.span>

                  {/* Title */}
                  <span className="text-sm font-bold text-white drop-shadow-sm">
                    {t(card.titleKey as any)}
                  </span>

                  {/* Description */}
                  <span className="text-[10px] text-white/65 font-medium leading-tight">
                    {t(card.descKey as any)}
                  </span>

                  {/* Progress bar */}
                  {progress !== null && (
                    <div className="w-full mt-1 px-1">
                      <div className="h-1.5 rounded-full bg-white/15 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-400"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                      <p className="text-[9px] text-white/50 text-right mt-0.5 font-bold">
                        {progress}%
                      </p>
                    </div>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>

        {/* Islamic Stories Section */}
        <div className="mt-6">
          <IslamicStoriesPlayer />
        </div>

        {/* Video Stories Section */}
        <div className="mt-6 pb-4">
          <IslamicStoryVideoPlayer />
        </div>
      </div>
    </>
  );
}
