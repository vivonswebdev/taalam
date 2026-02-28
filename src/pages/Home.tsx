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
import RoundActionButton from "@/components/RoundActionButton";
import DailyTarteelChallenge from "@/components/DailyTarteelChallenge";
import islamicPattern from "@/assets/islamic-pattern.jpg";
import taaloumLogo from "@/assets/taaloum-logo.png";
import { supabase } from "@/integrations/supabase/client";
import WeakSurahsSection from "@/components/WeakSurahsSection";
import { useImmersiveBg } from "@/hooks/useImmersiveBg";
import { getEpicBg } from "@/lib/epicBg";
import { useHifzPlan } from "@/hooks/useHifzPlan";

export default function Home() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const xp = useXP();
  const { immersiveEnabled, choices } = useImmersiveBg();
  const epicBg = immersiveEnabled ? getEpicBg(choices.home) : null;
  const { classrooms } = useClassrooms();
  const { user, signOut } = useAuth();
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

      {/* ═══ SECTION A – Header compact ═══ */}
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

      {/* ═══ SECTION B+C – 4 features en grille 2×2 ═══ */}
      <div className="px-5 mt-5 grid grid-cols-2 gap-3">
        {/* ❤️ États du cœur */}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/moods")}
          className="card-shimmer relative overflow-hidden rounded-2xl p-4 text-left border border-white/10 flex flex-col"
          style={{ background: "linear-gradient(135deg, #0f172a, #1e293b, #10b981)" }}
        >
          <span className="absolute top-2 right-2 text-[9px] font-bold bg-emerald-400 text-emerald-950 px-1.5 py-0.5 rounded-full">
            🆕
          </span>
          <motion.span className="text-2xl mb-2 inline-block" whileHover={{ scale: 1.3, rotate: 10 }} transition={{ type: "spring", stiffness: 400 }}>❤️</motion.span>
          <p className="text-sm font-bold text-white leading-tight">{t("home.moodsTitle")}</p>
          <p className="text-[11px] text-white/60 mt-1 line-clamp-2">{t("home.moodsSubtitle")}</p>
          <span className="mt-auto pt-3 text-[11px] font-semibold text-white/50">{t("home.moodsButton")} →</span>
        </motion.button>

        {/* 🎤 Tarteel */}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/quran?mode=dictation")}
          className="card-shimmer rounded-2xl p-4 text-left flex flex-col bg-gradient-to-br from-primary to-accent-foreground shadow-lg shadow-primary/20"
        >
          <motion.span className="text-2xl mb-2 inline-block" whileHover={{ scale: 1.3, rotate: -10 }} transition={{ type: "spring", stiffness: 400 }}>🎤</motion.span>
          <p className="text-sm font-bold text-primary-foreground leading-tight">{t("home.tarteelButton")}</p>
          <p className="text-[11px] text-primary-foreground/60 mt-1 line-clamp-2">{t("home.tarteelButtonDesc")}</p>
          <span className="mt-auto pt-3 text-[11px] font-semibold text-primary-foreground/50">{t("home.open")} </span>
        </motion.button>

        {/* 🧠 Quiz */}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/quiz")}
          className="card-shimmer rounded-2xl p-4 text-left flex flex-col bg-gradient-to-br from-primary to-accent-foreground shadow-lg shadow-primary/20"
        >
          <motion.span className="text-2xl mb-2 inline-block" whileHover={{ scale: 1.3, y: -4 }} transition={{ type: "spring", stiffness: 400 }}>🧠</motion.span>
          <p className="text-sm font-bold text-primary-foreground leading-tight">{t("home.quizButton")}</p>
          <p className="text-[11px] text-primary-foreground/60 mt-1 line-clamp-2">{t("home.quizButtonDesc")}</p>
          <span className="mt-auto pt-3 text-[11px] font-semibold text-primary-foreground/50">{t("home.open")} </span>
        </motion.button>

        {/* 🔍 Trouver mon ayah */}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/find-ayah")}
          className="card-shimmer rounded-2xl p-4 text-left flex flex-col bg-gradient-to-br from-primary to-accent-foreground shadow-lg shadow-primary/20"
        >
          <motion.span className="text-2xl mb-2 inline-block" whileHover={{ scale: 1.3, rotate: 15 }} transition={{ type: "spring", stiffness: 400 }}>🔍</motion.span>
          <p className="text-sm font-bold text-primary-foreground leading-tight">{t("home.findAyahButton")}</p>
          <p className="text-[11px] text-primary-foreground/60 mt-1 line-clamp-2">{t("home.findAyahButtonDesc")}</p>
          <span className="mt-auto pt-3 text-[11px] font-semibold text-primary-foreground/50">{t("home.open")} </span>
        </motion.button>
      </div>

      {/* ═══ SECTION D – Suivi & Classes ═══ */}
      <div className="px-5 mt-6 space-y-3">
        {/* Suivi */}
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">{t("home.sectionSuivi")}</p>
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/habits")}
            className="flex flex-col items-center gap-2 rounded-2xl p-4 bg-muted/50 border border-border text-center"
          >
            <span className="text-2xl">📊</span>
            <p className="text-xs font-bold text-foreground">{t("home.progressButton")}</p>
            <p className="text-[10px] text-muted-foreground">{t("home.progressButtonDesc")}</p>
          </motion.button>
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/leaderboard")}
            className="flex flex-col items-center gap-2 rounded-2xl p-4 bg-muted/50 border border-border text-center"
          >
            <span className="text-2xl">🏆</span>
            <p className="text-xs font-bold text-foreground">{t("home.leaderboardButton")}</p>
            <p className="text-[10px] text-muted-foreground">{t("home.leaderboardButtonDesc")}</p>
          </motion.button>
        </div>

        {/* Plan Hifz widget */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/hifz-plan")}
          className="w-full flex flex-col gap-2 rounded-2xl p-4 bg-muted/50 border border-border text-left"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl shrink-0">📖</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground">{t("home.hifzPlan")}</p>
              {plan ? (
                <p className="text-[10px] text-muted-foreground line-clamp-2">
                  {plan.name} · {todayTasks.length} {t("home.hifzTasksToday")}
                </p>
              ) : (
                <p className="text-[10px] text-muted-foreground">{t("home.hifzCreate")}</p>
              )}
            </div>
            <span className="text-[10px] font-semibold text-primary shrink-0">
              {plan ? t("home.hifzOpenLink") : t("home.hifzCreateLink")}
            </span>
          </div>
          {plan && (
            <div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{t("home.hifzProgress")}</span>
                <span>{overallProgress >= 100 ? "🎉 " : ""}{overallProgress}%</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-muted/40 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${overallProgress >= 100 ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-primary"}`}
                  style={{ width: `${Math.min(overallProgress, 100)}%` }}
                />
              </div>
              {overallProgress === 0 && (
                <p className="text-[10px] text-muted-foreground mt-1">{t("home.planStarted")}</p>
              )}
            </div>
          )}
        </motion.button>
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
