import { useState, useEffect, Component, type ReactNode } from "react";
import PageBackground from "@/components/PageBackground";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Mic, Search, Heart, Users, BarChart3, Calendar, Clock, Trophy } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useClassrooms } from "@/hooks/useClassrooms";
import { useAuth } from "@/hooks/useAuth";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useQuranXp } from "@/hooks/useQuranXp";
import { useDailyTarteelChallenge } from "@/hooks/useDailyTarteelChallenge";
import { useMyClassChallenges } from "@/hooks/useWeeklyChallenge";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { useUserMode } from "@/hooks/useUserMode";
import { surahs } from "@/data/surahs";
import ProfileBubble from "@/components/ProfileBubble";
import DailyTarteelChallenge from "@/components/DailyTarteelChallenge";
import GoodDeedsWidget from "@/components/GoodDeedsWidget";
import ShareProgressCard from "@/components/ShareProgressCard";
import HomeHeroCard, { type HeroCardData } from "@/components/HomeHeroCard";
import islamicPattern from "@/assets/islamic-pattern.jpg";
import taaloumLogo from "@/assets/taaloum-logo.png";
import { supabase } from "@/integrations/supabase/client";
import WeakSurahsSection from "@/components/WeakSurahsSection";
import { useHifzPlan } from "@/hooks/useHifzPlan";
import { useHifzSRS } from "@/hooks/useHifzSRS";
import { trackEvent } from "@/lib/trackEvent";
import KidsHomePage from "@/pages/KidsHomePage";

// Simple error boundary for Home
class HomeErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error) { console.error("Home error:", error); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
          <p className="text-lg font-bold">⚠️ Erreur de chargement</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold">
            🔄 Recharger
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Home() {
  const { mode: userMode } = useUserMode();

  if (userMode === "child") {
    return <KidsHomePage />;
  }

  return (
    <HomeErrorBoundary>
      <AdultHome />
    </HomeErrorBoundary>
  );
}

function AdultHome() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const xp = useQuranXp();
  const { classrooms } = useClassrooms();
  const { user } = useAuth();
  const { mode: userMode, ageGroup } = useUserMode();
  const classCodes = classrooms.map((c) => c.joinCode);
  const { unreadCount } = useAnnouncements(classCodes);
  const dailyChallenge = useDailyTarteelChallenge();
  const { challenges: weeklyChallenges, myResults } = useMyClassChallenges();
  const { plan, todayTasks, overallProgress } = useHifzPlan();
  const { settings: adminSettings } = useAdminSettings();
  const { items: srsItems, todayItems: srsTodayItems, learningCount, reviewingCount, masteredCount } = useHifzSRS();

  const [communityBadge, setCommunityBadge] = useState(0);

  useEffect(() => {
    if (!user) return;
    supabase.
    from("community_members").
    select("community_id").
    eq("user_id", user.id).
    then(({ data }) => {
      if (data && data.length > 0) setCommunityBadge(data.length);
    });
  }, [user]);

  // ─── 8 ADULT HERO CARDS ───
  const ADULT_CARDS: HeroCardData[] = [
  {
    icon: BookOpen,
    titleKey: "homeCards.mushaf",
    descKey: "homeCards.mushafDesc",
    href: "/mushaf",
    gradient: "from-purple-500/20 to-pink-500/20",
    emoji: "📖"
  },
  {
    icon: Mic,
    titleKey: "homeCards.tarteel",
    descKey: "homeCards.tarteelDesc",
    href: "/tarteel",
    gradient: "from-blue-500/20 to-cyan-500/20",
    emoji: "🎤"
  },
  {
    icon: Search,
    titleKey: "homeCards.findAyah",
    descKey: "homeCards.findAyahDesc",
    href: "/find-ayah",
    gradient: "from-orange-500/20 to-red-500/20",
    emoji: "🔍"
  },
  {
    icon: Heart,
    titleKey: "homeCards.moods",
    descKey: "homeCards.moodsDesc",
    href: "/moods",
    gradient: "from-rose-500/20 to-pink-500/20",
    emoji: "❤️"
  },
  {
    icon: Users,
    titleKey: "homeCards.groups",
    descKey: "homeCards.groupsDesc",
    href: "/groups",
    gradient: "from-green-500/20 to-teal-500/20",
    emoji: "🌍",
    badge: communityBadge > 0 ? communityBadge : undefined
  },
  {
    icon: BarChart3,
    titleKey: "homeCards.stats",
    descKey: "homeCards.statsDesc",
    href: "/habits",
    gradient: "from-indigo-500/20 to-purple-500/20",
    emoji: "📊",
    progress: xp.level > 0 ? xp.xp % 100 / 100 : undefined
  },
  {
    icon: Calendar,
    titleKey: "homeCards.hifzPlan",
    descKey: "homeCards.hifzPlanDesc",
    href: "/hifz-plan",
    gradient: "from-amber-500/20 to-orange-500/20",
    emoji: "📅",
    progress: plan ? overallProgress / 100 : undefined
  },
  {
    icon: Clock,
    titleKey: "homeCards.prayers",
    descKey: "homeCards.prayersDesc",
    href: "/prayers",
    gradient: "from-sky-500/20 to-blue-500/20",
    emoji: "🕐",
    progress: (() => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const stored = localStorage.getItem(`prayers_${today}`);
        return stored ? JSON.parse(stored).length / 5 : undefined;
      } catch {return undefined;}
    })()
  }];


  return (
    <PageBackground intensity="medium">
    <div className="home-bg min-h-screen pb-24">
      {/* Daily Tarteel Challenge */}
      {!adminSettings.hide_daily_challenge && !dailyChallenge.isCompleted && dailyChallenge.surah && dailyChallenge.surah.number && typeof dailyChallenge.complete === 'function' &&
        <DailyTarteelChallenge
          surah={dailyChallenge.surah}
          onComplete={(score) => dailyChallenge.complete(score)}
          onDismiss={() => dailyChallenge.dismiss()} />

        }

      {/* Weekly Class Challenge Banner */}
      {weeklyChallenges.filter((ch) => !myResults.some((r) => r.challenge_id === ch.id)).map((ch) => {
          const surah = surahs.find((s) => s.number === ch.surah_number);
          return (
            <motion.div
              key={ch.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-4 mt-2 bg-gradient-to-r from-primary/15 to-primary/5 border border-primary/20 rounded-xl p-3 flex items-center gap-3">

            <Trophy size={24} className="text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">
                {t("home.hifzChallenge")} – {ch.className}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {surah ? `${surah.name} (${surah.nameArabic})` : `${t("home.surah")} ${ch.surah_number}`} · Ayahs {ch.ayah_from}–{ch.ayah_to}
                {ch.double_xp && <span className="ml-1 text-yellow-600 font-bold">⚡ x2 XP</span>}
              </p>
            </div>
            <button
                onClick={() => navigate(`/recitation?surah=${ch.surah_number}&from=${ch.ayah_from}&to=${ch.ayah_to}&challengeId=${ch.id}&classId=${ch.class_id}`)}
                className="shrink-0 px-3 py-1.5 text-xs font-bold bg-primary text-primary-foreground rounded-lg">

              {t("home.go" as any)}
            </button>
          </motion.div>);

        })}

      {/* Senior welcome banner */}
      {ageGroup === "senior" && userMode === "solo" &&
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-5 mt-2 flex items-center gap-2 bg-amber-500/10 border border-amber-400/20 rounded-xl px-3 py-2.5">

          <span className="text-lg">📖</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-foreground">{t("home.seniorTitle" as any)}</p>
            <p className="text-[10px] text-muted-foreground">{t("home.seniorDesc" as any)}</p>
          </div>
          <button onClick={() => navigate("/quran-hub")} className="shrink-0 px-3 py-1.5 text-xs font-bold bg-primary text-primary-foreground rounded-lg">
            {t("home.seniorCta" as any)}
          </button>
        </motion.div>
        }

      {/* ═══ HEADER ═══ */}
      <div className="relative overflow-visible">
        <motion.div
            className="absolute -top-10 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, hsla(152,60%,40%,0.25) 0%, transparent 70%)" }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 1, 0.7, 1], scale: [0.5, 1.1, 1] }}
            transition={{ duration: 2, ease: "easeOut" }} />

        <motion.img
            src={islamicPattern}
            alt=""
            className="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-56 pointer-events-none"
            initial={{ opacity: 0, scale: 1.2, rotate: -8 }}
            animate={{ opacity: 0.08, scale: 1, rotate: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }} />


        <div className="relative px-6 pt-12 pb-4 text-center">
          <div className="absolute top-3 right-4 z-10 flex items-center gap-2">
            <ProfileBubble />
          </div>

          {/* Basmala */}
          <motion.p
              initial={{ opacity: 0, scale: 0.8, filter: "blur(8px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="font-arabic text-xl text-primary mb-1 drop-shadow-[0_0_12px_hsla(152,50%,42%,0.4)] text-center">

            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </motion.p>

          {/* Stats row */}
          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-3 flex items-center justify-center gap-3">

            {[
              { icon: "🔥", label: `0 ${t("home.days")}`, delay: 0.5 },
              { icon: "⭐", label: `${xp.xp} XP`, delay: 0.65 },
              { icon: "🏅", label: `${t("home.level.label")} ${xp.level}`, delay: 0.8 }].
              map((stat) =>
              <motion.div
                key={stat.icon}
                initial={{ opacity: 0, scale: 0.5, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: stat.delay, type: "spring", stiffness: 300, damping: 20 }}
                className="flex items-center gap-1 bg-card/60 backdrop-blur-sm border border-border/40 rounded-full px-2.5 py-1">

                <span className="text-sm">{stat.icon}</span>
                <span className="text-xs font-semibold text-foreground">{stat.label}</span>
              </motion.div>
              )}
          </motion.div>

          {/* Logo */}
          <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6, ease: "easeOut" }}
              className="mt-3 flex items-center justify-center gap-2">

            <motion.img
                src={taaloumLogo}
                alt="Ta'alam"
                className="w-8 h-8 rounded-full"
                style={{ boxShadow: "0 0 20px hsla(152,50%,42%,0.4)" }}
                animate={{ boxShadow: ["0 0 12px hsla(152,50%,42%,0.3)", "0 0 24px hsla(152,50%,42%,0.5)", "0 0 12px hsla(152,50%,42%,0.3)"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />

            <span className="text-sm font-bold tracking-wide" style={{ background: "linear-gradient(135deg, hsl(152,50%,42%), hsl(43,70%,55%))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Ta'alam
            </span>
          </motion.div>
        </div>
      </div>

      {/* ═══ 2x4 HERO GRID ═══ */}
      <div className="px-4 mt-4 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ADULT_CARDS.map((card, i) =>
          <HomeHeroCard key={card.href} card={card} index={i} t={t} />
          )}
      </div>

      {/* ═══ Hifz SRS Widget ═══ */}
      {srsItems.length > 0 &&
        <div className="px-5 mt-4">
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {trackEvent("module_open", "hifz_srs");navigate("/hifz-today");}}
            className="w-full flex items-center gap-3 rounded-2xl p-4 bg-gradient-to-r from-violet-700/40 to-purple-900/20 border border-violet-400/30 shadow-lg">

            <span className="text-2xl">🧠</span>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-bold text-white">
                {srsTodayItems.length > 0 ?
                `${srsTodayItems.length} ${t("hifzSrs.passagesToReview")}` :
                t("hifzSrs.noneToday")}
              </p>
              <p className="text-[11px] text-white/60">
                {learningCount} {t("hifzSrs.learning")} · {reviewingCount} {t("hifzSrs.reviewing")} · {masteredCount} {t("hifzSrs.mastered")}
              </p>
            </div>
            <span className="text-xs font-bold text-primary shrink-0">{t("hifzSrs.review")} →</span>
          </motion.button>
        </div>
        }

      {/* ═══ Share ═══ */}
      <div className="px-5 mt-3">
        <ShareProgressCard />
      </div>

      {/* Weak Surahs */}
      <WeakSurahsSection />

      {/* Join CTA */}
      {!user &&
        <div className="px-5 mt-4">
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            onClick={() => navigate("/auth")}
            className="w-full flex items-center gap-4 bg-primary/10 border border-primary/20 rounded-2xl p-4 text-left active:scale-[0.98] transition-transform">

            <span className="text-2xl">👤</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">{t("home.joinCommunity")}</p>
              <p className="text-xs text-muted-foreground">{t("home.joinCommunityDesc")}</p>
            </div>
          </motion.button>
        </div>
        }
      {/* ═══ Free Message Footer ═══ */}
      <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-6 mb-4 text-[10px] text-muted-foreground/70 text-center leading-relaxed max-w-[260px] mx-auto">

        {t("home.freeMessage" as any)}{" "}
        <a href="https://taalam.eu" target="_blank" rel="noopener noreferrer" className="text-primary/60 font-medium underline underline-offset-2">taalam.eu</a>
      </motion.p>
    </div>
    </PageBackground>);

}