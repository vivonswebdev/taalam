import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, Trophy } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useClassrooms } from "@/hooks/useClassrooms";
import { useAuth } from "@/hooks/useAuth";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useXP } from "@/hooks/useXP";
import { useDailyTarteelChallenge } from "@/hooks/useDailyTarteelChallenge";
import { useMyClassChallenges } from "@/hooks/useWeeklyChallenge";
import { useChildMode } from "@/hooks/useChildMode";
import { surahs } from "@/data/surahs";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import DailyTarteelChallenge from "@/components/DailyTarteelChallenge";
import islamicPattern from "@/assets/islamic-pattern.jpg";
import taaloumLogo from "@/assets/taaloum-logo.png";
import { supabase } from "@/integrations/supabase/client";
import WeakSurahsSection from "@/components/WeakSurahsSection";
import { useImmersiveBg } from "@/hooks/useImmersiveBg";
import { getEpicBg } from "@/lib/epicBg";
import { useHifzPlan } from "@/hooks/useHifzPlan";
import { trackEvent } from "@/lib/trackEvent";

// Reusable home card
function HomeCard({
  emoji,
  title,
  desc,
  cta,
  onClick,
  gradient,
  delay = 0,
  badge,
  children,
}: {
  emoji: string;
  title: string;
  desc: string;
  cta: string;
  onClick: () => void;
  gradient: string;
  delay?: number;
  badge?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`card-shimmer relative overflow-hidden flex flex-col justify-between min-h-[130px] rounded-2xl p-4 text-left border border-white/10 shadow-lg ${gradient}`}
    >
      {badge && (
        <span className="absolute top-2 right-2 text-[9px] font-bold bg-emerald-400 text-emerald-950 px-1.5 py-0.5 rounded-full">
          {badge}
        </span>
      )}
      <div className="flex items-start gap-3">
        <motion.span
          className="text-2xl shrink-0"
          whileHover={{ scale: 1.3, rotate: 10 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          {emoji}
        </motion.span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white leading-tight">{title}</p>
          <p className="text-[11px] text-white/60 mt-1 line-clamp-2">{desc}</p>
        </div>
      </div>
      {children}
      <span className="mt-auto pt-2 text-[11px] font-semibold text-white/50">{cta} →</span>
    </motion.button>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const xp = useXP();
  const { immersiveEnabled, choices } = useImmersiveBg();
  const epicBg = immersiveEnabled ? getEpicBg(choices.home) : null;
  const { classrooms } = useClassrooms();
  const { user, signOut } = useAuth();
  const { isChildMode } = useChildMode();
  const classCodes = classrooms.map((c) => c.joinCode);
  const { unreadCount } = useAnnouncements(classCodes);
  const dailyChallenge = useDailyTarteelChallenge();
  const { challenges: weeklyChallenges, myResults } = useMyClassChallenges();
  const { plan, todayTasks, overallProgress } = useHifzPlan();

  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [unreadMessages, setUnreadMessages] = useState<Record<string, number>>({});

  useEffect(() => {
    if (classrooms.length === 0) return;
    const ids = classrooms.map((c) => c.id);
    supabase
      .from("classroom_members")
      .select("classroom_id")
      .in("classroom_id", ids)
      .then(({ data }) => {
        const counts: Record<string, number> = {};
        (data || []).forEach((m: any) => {
          counts[m.classroom_id] = (counts[m.classroom_id] || 0) + 1;
        });
        setMemberCounts(counts);
      });
    const unread: Record<string, number> = {};
    Promise.all(
      ids.map(async (id) => {
        const lastRead = localStorage.getItem(`chat_last_read_${id}`) || "1970-01-01T00:00:00Z";
        const { count } = await supabase
          .from("class_messages")
          .select("id", { count: "exact", head: true })
          .eq("classroom_id", id)
          .gt("created_at", lastRead);
        unread[id] = count || 0;
      })
    ).then(() => setUnreadMessages(unread));
  }, [classrooms]);

  return (
    <div className={`min-h-screen pb-24 ${epicBg ? epicBg.className : ""}`} style={epicBg?.image ? { backgroundImage: `url(${epicBg.image})` } : undefined}>
      {/* Daily Tarteel Challenge */}
      {!dailyChallenge.isCompleted && dailyChallenge.surah && (
        <DailyTarteelChallenge
          surah={dailyChallenge.surah}
          onComplete={(score) => dailyChallenge.complete(score)}
          onDismiss={() => dailyChallenge.dismiss()}
        />
      )}
      {/* Weekly Class Challenge Banner */}
      {weeklyChallenges.filter((ch) => !myResults.some((r) => r.challenge_id === ch.id)).map((ch) => {
        const surah = surahs.find((s) => s.number === ch.surah_number);
        return (
          <motion.div
            key={ch.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 mt-2 bg-gradient-to-r from-primary/15 to-primary/5 border border-primary/20 rounded-xl p-3 flex items-center gap-3"
          >
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
              className="shrink-0 px-3 py-1.5 text-xs font-bold bg-primary text-primary-foreground rounded-lg"
            >
              Go !
            </button>
          </motion.div>
        );
      })}

      {/* Child Mode Banner */}
      {isChildMode && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-5 mt-2 flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-xl px-3 py-2"
        >
          <span className="text-lg">🧒</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-foreground">{t("child.modeBanner" as any)}</p>
            <p className="text-[10px] text-muted-foreground">{t("child.modeBannerDesc" as any)}</p>
          </div>
        </motion.div>
      )}

      {/* ═══ HEADER ═══ */}
      <div className="relative overflow-visible">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-primary/5 to-background" />
        <img src={islamicPattern} alt="" className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 opacity-10 pointer-events-none" />
        <div className="relative px-6 pt-12 pb-4 text-center">
          {/* Top bar */}
          <div className="absolute top-3 right-4 z-10 flex items-center gap-2">
            {user && (
              <button onClick={signOut} className="text-muted-foreground hover:text-foreground" title={t("auth.logout")}>
                <LogOut size={18} />
              </button>
            )}
            <LanguageSwitcher />
          </div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-arabic text-lg text-primary mb-0.5">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </motion.p>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-2 flex items-center justify-center gap-3"
          >
            <div className="flex items-center gap-1 bg-card/80 backdrop-blur-sm border border-border rounded-full px-2.5 py-1">
              <span className="text-sm">🔥</span>
              <span className="text-xs font-semibold text-foreground">{xp.streakDays} {t("home.days")}</span>
            </div>
            <div className="flex items-center gap-1 bg-card/80 backdrop-blur-sm border border-border rounded-full px-2.5 py-1">
              <span className="text-sm">⭐</span>
              <span className="text-xs font-semibold text-foreground">{xp.xpToday} XP {t("home.today")}</span>
            </div>
            <div className="flex items-center gap-1 bg-card/80 backdrop-blur-sm border border-border rounded-full px-2.5 py-1">
              <span className="text-sm">🏅</span>
              <span className="text-xs font-semibold text-foreground">{t("home.level.label")} {xp.level}</span>
            </div>
          </motion.div>

          {/* Logo */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-2 flex items-center justify-center gap-1.5">
            <img src={taaloumLogo} alt="Taaloum" className="w-6 h-6 rounded-full" />
            <span className="text-[11px] font-semibold" style={{ background: "linear-gradient(135deg, #10B981, #FCD34D)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Taaloum
            </span>
          </motion.div>
        </div>
      </div>

      {/* ═══ BLOC 1 – Tarteel & États du cœur ═══ */}
      <div className="px-5 mt-5 grid grid-cols-2 gap-3">
        <HomeCard
          emoji="🎤"
          title={t("home.tarteelButton")}
          desc={t("home.tarteelButtonDesc")}
          cta={t("home.open")}
          onClick={() => { trackEvent("module_open", "tarteel"); navigate("/quran?mode=dictation"); }}
          gradient="bg-gradient-to-br from-emerald-800/60 to-teal-700/30"
          delay={0.25}
        />
        <HomeCard
          emoji="❤️"
          title={t("home.moodsTitle")}
          desc={t("home.moodsSubtitle")}
          cta={t("home.moodsButton")}
          onClick={() => { trackEvent("module_open", "moods"); navigate("/moods"); }}
          gradient="bg-gradient-to-br from-teal-800/60 to-emerald-700/30"
          delay={0.3}
          badge="🆕"
        />
      </div>

      {/* ═══ BLOC 2 – Recherche & Kids ═══ */}
      <div className="px-5 mt-3 grid grid-cols-2 gap-3">
        <HomeCard
          emoji="🔍"
          title={t("home.findAyahButton")}
          desc={t("home.findAyahButtonDesc")}
          cta={t("home.open")}
          onClick={() => navigate("/find-ayah")}
          gradient="bg-gradient-to-br from-violet-800/60 to-blue-700/30"
          delay={0.35}
        />
        <HomeCard
          emoji="🧸"
          title={t("home.kidsSpace" as any)}
          desc={t("home.kidsSpaceDesc" as any)}
          cta={t("home.open")}
          onClick={() => navigate("/kids")}
          gradient="bg-gradient-to-br from-blue-800/60 to-violet-700/30"
          delay={0.4}
        />
      </div>

      {/* ═══ BLOC 3 – Hifz & Quiz ═══ */}
      <div className="px-5 mt-3 grid grid-cols-2 gap-3">
        <HomeCard
          emoji="📖"
          title={t("home.hifzPlan")}
          desc={plan ? `${todayTasks.length} ${t("home.hifzTasksToday")}` : t("home.hifzCreate")}
          cta={plan ? t("home.open") : t("home.hifzCreate")}
          onClick={() => navigate("/hifz-plan")}
          gradient="bg-gradient-to-br from-indigo-800/60 to-cyan-700/30"
          delay={0.45}
        >
          {plan && (
            <div className="w-full mt-2">
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${overallProgress >= 100 ? "bg-green-400" : "bg-white/70"}`}
                  style={{ width: `${Math.min(overallProgress, 100)}%` }}
                />
              </div>
            </div>
          )}
        </HomeCard>
        <HomeCard
          emoji="🧠"
          title={t("home.quizButton")}
          desc={t("home.quizButtonDesc")}
          cta={t("home.open")}
          onClick={() => navigate("/quiz")}
          gradient="bg-gradient-to-br from-cyan-800/60 to-indigo-700/30"
          delay={0.5}
        />
      </div>

      {/* ═══ BLOC 4 – Suivi ═══ */}
      <div className="px-5 mt-6 space-y-3">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">{t("home.sectionSuivi")}</p>
        <div className="grid grid-cols-2 gap-3">
          <HomeCard
            emoji="📊"
            title={t("home.progressButton")}
            desc={t("home.progressButtonDesc")}
            cta={t("home.open")}
            onClick={() => navigate("/habits")}
            gradient="bg-gradient-to-br from-slate-800/60 to-gray-700/30"
            delay={0.55}
          />
          <HomeCard
            emoji="🏆"
            title={t("home.leaderboardButton")}
            desc={t("home.leaderboardButtonDesc")}
            cta={t("home.open")}
            onClick={() => navigate("/leaderboard")}
            gradient="bg-gradient-to-br from-amber-800/60 to-yellow-700/30"
            delay={0.6}
          />
        </div>
      </div>

      {/* Weak Surahs */}
      <WeakSurahsSection />

      {/* Join community CTA */}
      {!user && (
        <div className="px-5 mt-4">
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            onClick={() => navigate("/auth")}
            className="w-full flex items-center gap-4 bg-primary/10 border border-primary/20 rounded-2xl p-4 text-left active:scale-[0.98] transition-transform"
          >
            <span className="text-2xl">👤</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">{t("home.joinCommunity")}</p>
              <p className="text-xs text-muted-foreground">{t("home.joinCommunityDesc")}</p>
            </div>
          </motion.button>
        </div>
      )}
    </div>
  );
}
