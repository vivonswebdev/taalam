import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, Trophy } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useClassrooms } from "@/hooks/useClassrooms";
import { useAuth } from "@/hooks/useAuth";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useQuranXp } from "@/hooks/useQuranXp";
import { useDailyTarteelChallenge } from "@/hooks/useDailyTarteelChallenge";
import { useMyClassChallenges } from "@/hooks/useWeeklyChallenge";
import { useChildMode } from "@/hooks/useChildMode";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { useUserMode } from "@/hooks/useUserMode";
import { surahs } from "@/data/surahs";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import DailyTarteelChallenge from "@/components/DailyTarteelChallenge";
import islamicPattern from "@/assets/islamic-pattern.jpg";
import taaloumLogo from "@/assets/taaloum-logo.png";
import { supabase } from "@/integrations/supabase/client";
import WeakSurahsSection from "@/components/WeakSurahsSection";
import { useHifzPlan } from "@/hooks/useHifzPlan";
import { useHifzSRS } from "@/hooks/useHifzSRS";
import { trackEvent } from "@/lib/trackEvent";

function HomeCard({
  emoji,
  title,
  desc,
  cta,
  onClick,
  gradient,
  delay = 0,
  children,
}: {
  emoji: string;
  title: string;
  desc: string;
  cta: string;
  onClick: () => void;
  gradient: string;
  delay?: number;
  children?: React.ReactNode;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`flex flex-col justify-between min-h-[130px] rounded-2xl p-4 text-left shadow-lg ${gradient}`}
    >
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
      <span className="mt-auto pt-2 text-[11px] font-semibold text-primary flex items-center gap-1">
        {cta} →
      </span>
    </motion.button>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const xp = useQuranXp();
  const { classrooms } = useClassrooms();
  const { user, signOut } = useAuth();
  const { isChildMode } = useChildMode();
  const { mode: userMode, ageGroup } = useUserMode();
  const classCodes = classrooms.map((c) => c.joinCode);
  const { unreadCount } = useAnnouncements(classCodes);
  const dailyChallenge = useDailyTarteelChallenge();
  const { challenges: weeklyChallenges, myResults } = useMyClassChallenges();
  const { plan, todayTasks, overallProgress } = useHifzPlan();
  const { settings: adminSettings, loading: adminSettingsLoading } = useAdminSettings();

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
    <div className="home-bg min-h-screen pb-24">

      {/* Daily Tarteel Challenge – hidden if admin toggled off */}
      {!adminSettings.hide_daily_challenge && !dailyChallenge.isCompleted && dailyChallenge.surah && (
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
              {t("home.go" as any)}
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

      {/* Senior welcome banner */}
      {ageGroup === "senior" && userMode === "solo" && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-5 mt-2 flex items-center gap-2 bg-amber-500/10 border border-amber-400/20 rounded-xl px-3 py-2.5"
        >
          <span className="text-lg">📖</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-foreground">Pour simplement lire le Coran</p>
            <p className="text-[10px] text-muted-foreground">Appuyez sur l'onglet 📖 Coran en bas pour commencer la lecture.</p>
          </div>
          <button onClick={() => navigate("/quran-hub")} className="shrink-0 px-3 py-1.5 text-xs font-bold bg-primary text-primary-foreground rounded-lg">
            Lire
          </button>
        </motion.div>
      )}

      {/* ═══ HEADER ═══ */}
      <div className="relative overflow-visible">
        {/* Animated glow orbs */}
        <motion.div
          className="absolute -top-10 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, hsla(152,60%,40%,0.25) 0%, transparent 70%)" }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: [0, 1, 0.7, 1], scale: [0.5, 1.1, 1] }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
        <motion.div
          className="absolute -top-6 left-[20%] w-40 h-40 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, hsla(210,60%,50%,0.15) 0%, transparent 70%)" }}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.8, delay: 0.3, ease: "easeOut" }}
        />
        <motion.div
          className="absolute -top-4 right-[15%] w-36 h-36 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, hsla(43,70%,50%,0.12) 0%, transparent 70%)" }}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.8, delay: 0.5, ease: "easeOut" }}
        />

        {/* Islamic pattern with parallax fade */}
        <motion.img
          src={islamicPattern}
          alt=""
          className="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-56 pointer-events-none"
          initial={{ opacity: 0, scale: 1.2, rotate: -8 }}
          animate={{ opacity: 0.08, scale: 1, rotate: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />

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

          {/* Basmala with glow entrance */}
          <motion.p
            initial={{ opacity: 0, scale: 0.8, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-arabic text-xl text-primary mb-1 drop-shadow-[0_0_12px_hsla(152,50%,42%,0.4)]"
          >
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </motion.p>

          {/* Stats row – staggered pop-in */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-3 flex items-center justify-center gap-3"
          >
            {[
              { icon: "🔥", label: `0 ${t("home.days")}`, delay: 0.5 },
              { icon: "⭐", label: `${xp.xp} XP`, delay: 0.65 },
              { icon: "🏅", label: `${t("home.level.label")} ${xp.level}`, delay: 0.8 },
            ].map((stat) => (
              <motion.div
                key={stat.icon}
                initial={{ opacity: 0, scale: 0.5, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: stat.delay, type: "spring", stiffness: 300, damping: 20 }}
                className="flex items-center gap-1 bg-card/60 backdrop-blur-sm border border-border/40 rounded-full px-2.5 py-1"
              >
                <span className="text-sm">{stat.icon}</span>
                <span className="text-xs font-semibold text-foreground">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Logo with glow pulse */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6, ease: "easeOut" }}
            className="mt-3 flex items-center justify-center gap-2"
          >
            <motion.img
              src={taaloumLogo}
              alt="Ta'alam"
              className="w-8 h-8 rounded-full"
              style={{ boxShadow: "0 0 20px hsla(152,50%,42%,0.4)" }}
              animate={{ boxShadow: ["0 0 12px hsla(152,50%,42%,0.3)", "0 0 24px hsla(152,50%,42%,0.5)", "0 0 12px hsla(152,50%,42%,0.3)"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="text-sm font-bold tracking-wide" style={{ background: "linear-gradient(135deg, hsl(152,50%,42%), hsl(43,70%,55%))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Ta'alam
            </span>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="mt-2 text-[10px] text-muted-foreground/70 text-center leading-relaxed max-w-[260px] mx-auto"
          >
            {t("home.freeMessage" as any)}{" "}
            <a href="https://taalam.eu" target="_blank" rel="noopener noreferrer" className="text-primary/60 font-medium underline underline-offset-2">taalam.eu</a>
          </motion.p>
        </div>
      </div>

      {/* ═══ Raccourci Mushaf ═══ */}
      <div className="px-5 mt-5">
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => { trackEvent("module_open", "mushaf_shortcut"); navigate("/mushaf"); }}
          className="w-full flex items-center gap-3 rounded-2xl p-4 bg-gradient-to-r from-amber-800/40 to-yellow-900/20 border border-amber-400/30 shadow-lg"
        >
          <span className="text-2xl">📖</span>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-bold text-white">Lire le Coran (Mushaf)</p>
            <p className="text-[11px] text-white/60">Ouvrir le mushaf directement</p>
          </div>
          <span className="text-xs font-bold text-primary shrink-0">Ouvrir →</span>
        </motion.button>
      </div>

      {/* ═══ BLOC 1 – Tarteel & États du cœur ═══ */}
      <div className="px-5 mt-3 grid grid-cols-2 gap-3">
        <HomeCard
          emoji="🎤"
          title={t("home.tarteelButton" as any)}
          desc={t("home.tarteelDesc" as any)}
          cta={t("home.open" as any)}
          onClick={() => { trackEvent("module_open", "tarteel"); navigate("/quran?mode=dictation"); }}
          gradient="bg-gradient-to-br from-emerald-700/60 to-teal-700/30 border border-emerald-400/40"
          delay={0.25}
        />
        <HomeCard
          emoji="❤️"
          title={t("home.moodsTitle" as any)}
          desc={t("home.moodsSubtitle" as any)}
          cta={t("home.moodsButton" as any)}
          onClick={() => { trackEvent("module_open", "moods"); navigate("/moods"); }}
          gradient="bg-gradient-to-br from-emerald-700/60 to-teal-700/30 border border-emerald-400/40"
          delay={0.3}
        />
      </div>

      {/* ═══ BLOC 2 – Recherche & Kids ═══ */}
      <div className="px-5 mt-3 grid grid-cols-2 gap-3">
        <HomeCard
          emoji="🔍"
          title={t("home.findAyahTitle" as any)}
          desc={t("home.findAyahDesc" as any)}
          cta={t("home.open" as any)}
          onClick={() => { trackEvent("module_open", "find_ayah"); navigate("/find-ayah"); }}
          gradient="bg-gradient-to-br from-indigo-700/60 to-violet-700/30 border border-indigo-400/40"
          delay={0.35}
        />
        <HomeCard
          emoji="🧩"
          title={t("home.kidsTitle" as any)}
          desc={t("home.kidsDesc" as any)}
          cta={t("home.open" as any)}
          onClick={() => { trackEvent("module_open", "kids_space"); navigate("/kids"); }}
          gradient="bg-gradient-to-br from-indigo-700/60 to-violet-700/30 border border-indigo-400/40"
          delay={0.4}
        />
      </div>

      {/* ═══ BLOC 3 – Hifz & Quiz ═══ */}
      <div className="px-5 mt-3 grid grid-cols-2 gap-3">
        <HomeCard
          emoji="📖"
          title={t("home.hifzPlanTitle" as any)}
          desc={t("home.hifzPlanDesc" as any)}
          cta={plan ? t("home.open" as any) : t("home.hifzCreatePlan" as any)}
          onClick={() => { trackEvent("module_open", "hifz"); navigate("/hifz-plan"); }}
          gradient="bg-gradient-to-br from-sky-700/60 to-cyan-700/30 border border-sky-400/40"
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
          title={t("home.startQuiz" as any)}
          desc={t("home.quizDesc" as any)}
          cta={t("home.open" as any)}
          onClick={() => { trackEvent("module_open", "quiz"); navigate("/quiz"); }}
          gradient="bg-gradient-to-br from-sky-700/60 to-cyan-700/30 border border-sky-400/40"
          delay={0.5}
        />
      </div>

      {/* ═══ BLOC 4 – Communauté & Enseignant ═══ */}
      <div className="px-5 mt-3 grid grid-cols-2 gap-3">
        <HomeCard
          emoji="🌍"
          title={t("community.title" as any)}
          desc={t("community.menuDesc" as any)}
          cta={t("home.open" as any)}
          onClick={() => { trackEvent("module_open", "community"); navigate("/community"); }}
          gradient="bg-gradient-to-br from-pink-700/60 to-rose-700/30 border border-pink-400/40"
          delay={0.55}
        />
        <HomeCard
          emoji="🎓"
          title={t("teacher.dashboard" as any)}
          desc={t("teacher.dashboardDesc" as any)}
          cta={t("home.open" as any)}
          onClick={() => { trackEvent("module_open", "teacher"); navigate("/teacher-dashboard"); }}
          gradient="bg-gradient-to-br from-pink-700/60 to-rose-700/30 border border-pink-400/40"
          delay={0.6}
        />
      </div>

      {/* ═══ BLOC 5 – Suivi ═══ */}
      <div className="px-5 mt-6 space-y-3">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">{t("home.trackingSection" as any)}</p>
        <div className="grid grid-cols-2 gap-3">
          <HomeCard
            emoji="📊"
            title={t("home.progressTitle" as any)}
            desc={t("home.progressDesc" as any)}
            cta={t("home.open" as any)}
            onClick={() => { trackEvent("module_open", "habits"); navigate("/habits"); }}
            gradient="bg-gradient-to-br from-slate-800/70 to-slate-900/40 border border-slate-600/50"
            delay={0.65}
          />
          <HomeCard
            emoji="🏆"
            title={t("home.leaderboardTitle" as any)}
            desc={t("home.leaderboardDesc" as any)}
            cta={t("home.open" as any)}
            onClick={() => { trackEvent("module_open", "leaderboard"); navigate("/leaderboard"); }}
            gradient="bg-gradient-to-br from-slate-800/70 to-slate-900/40 border border-slate-600/50"
            delay={0.7}
          />
        </div>
      </div>

      {/* ═══ BLOC 6 – Outils rapides ═══ */}
      <div className="px-5 mt-6 space-y-3">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">{t("more.sectionQuran" as any)}</p>
        <div className="grid grid-cols-2 gap-3">
          <HomeCard
            emoji="📖"
            title={t("more.mushaf" as any)}
            desc={t("more.mushafDesc" as any)}
            cta={t("home.open" as any)}
            onClick={() => navigate("/mushaf")}
            gradient="bg-gradient-to-br from-amber-700/60 to-yellow-700/30 border border-amber-400/40"
            delay={0.75}
          />
          <HomeCard
            emoji="📿"
            title={t("more.athkar" as any)}
            desc={t("more.athkarDesc" as any)}
            cta={t("home.open" as any)}
            onClick={() => navigate("/moods")}
            gradient="bg-gradient-to-br from-amber-700/60 to-yellow-700/30 border border-amber-400/40"
            delay={0.8}
          />
          <HomeCard
            emoji="📻"
            title={t("more.liveQuran" as any)}
            desc={t("more.liveQuranDesc" as any)}
            cta={t("home.open" as any)}
            onClick={() => navigate("/live-quran")}
            gradient="bg-gradient-to-br from-amber-700/60 to-yellow-700/30 border border-amber-400/40"
            delay={0.85}
          />
          <HomeCard
            emoji="🎧"
            title={t("more.advancedListening" as any)}
            desc={t("more.advancedListeningDesc" as any)}
            cta={t("home.open" as any)}
            onClick={() => navigate("/listening")}
            gradient="bg-gradient-to-br from-amber-700/60 to-yellow-700/30 border border-amber-400/40"
            delay={0.9}
          />
        </div>
      </div>

      {/* ═══ BLOC 7 – Modules ═══ */}
      <div className="px-5 mt-6 space-y-3">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">{t("more.sectionModules" as any)}</p>
        <div className="grid grid-cols-2 gap-3">
          <HomeCard
            emoji="🧠"
            title={t("more.hifzPlan" as any)}
            desc={t("more.hifzPlanDesc" as any)}
            cta={t("home.open" as any)}
            onClick={() => navigate("/hifz-plan")}
            gradient="bg-gradient-to-br from-purple-700/60 to-fuchsia-700/30 border border-purple-400/40"
            delay={0.95}
          />
          <HomeCard
            emoji="📝"
            title={t("more.studyMode" as any)}
            desc={t("more.studyModeDesc" as any)}
            cta={t("home.open" as any)}
            onClick={() => navigate("/study?surah=1")}
            gradient="bg-gradient-to-br from-purple-700/60 to-fuchsia-700/30 border border-purple-400/40"
            delay={1}
          />
          <HomeCard
            emoji="⭐"
            title={t("more.bookmarks" as any)}
            desc={t("more.bookmarksDesc" as any)}
            cta={t("home.open" as any)}
            onClick={() => navigate("/bookmarks")}
            gradient="bg-gradient-to-br from-purple-700/60 to-fuchsia-700/30 border border-purple-400/40"
            delay={1.05}
          />
          <HomeCard
            emoji="👨‍👩‍👧"
            title={t("more.familyClass" as any)}
            desc={t("more.familyClassDesc" as any)}
            cta={t("home.open" as any)}
            onClick={() => navigate("/family")}
            gradient="bg-gradient-to-br from-purple-700/60 to-fuchsia-700/30 border border-purple-400/40"
            delay={1.1}
          />
          <HomeCard
            emoji="🕐"
            title={t("more.prayerTimes" as any)}
            desc={t("more.prayerTimesDesc" as any)}
            cta={t("home.open" as any)}
            onClick={() => navigate("/prayers")}
            gradient="bg-gradient-to-br from-purple-700/60 to-fuchsia-700/30 border border-purple-400/40"
            delay={1.15}
          />
          <HomeCard
            emoji="📚"
            title={t("more.juzHizb" as any)}
            desc={t("more.juzHizbDesc" as any)}
            cta={t("home.open" as any)}
            onClick={() => navigate("/juz")}
            gradient="bg-gradient-to-br from-purple-700/60 to-fuchsia-700/30 border border-purple-400/40"
            delay={1.2}
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
