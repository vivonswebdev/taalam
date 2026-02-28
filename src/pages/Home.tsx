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
import { useHifzPlan } from "@/hooks/useHifzPlan";
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
  const xp = useXP();
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
    <div className="home-bg min-h-screen pb-24">
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
              { icon: "🔥", label: `${xp.streakDays} ${t("home.days")}`, delay: 0.5 },
              { icon: "⭐", label: `${xp.xpToday} XP ${t("home.today")}`, delay: 0.65 },
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
        </div>
      </div>

      {/* ═══ BLOC 1 – Tarteel & États du cœur ═══ */}
      <div className="px-5 mt-5 grid grid-cols-2 gap-3">
        <HomeCard
          emoji="🎤"
          title="Commencer votre Tarteel"
          desc="Récitation + Correction IA"
          cta="Ouvrir"
          onClick={() => { trackEvent("module_open", "tarteel"); navigate("/quran?mode=dictation"); }}
          gradient="bg-gradient-to-br from-emerald-700/60 to-teal-700/30 border border-emerald-400/40"
          delay={0.25}
        />
        <HomeCard
          emoji="❤️"
          title="États du cœur"
          desc="Prends soin de toi avec le Coran"
          cta="Découvrir"
          onClick={() => { trackEvent("module_open", "moods"); navigate("/moods"); }}
          gradient="bg-gradient-to-br from-emerald-700/60 to-teal-700/30 border border-emerald-400/40"
          delay={0.3}
        />
      </div>

      {/* ═══ BLOC 2 – Recherche & Kids ═══ */}
      <div className="px-5 mt-3 grid grid-cols-2 gap-3">
        <HomeCard
          emoji="🔍"
          title="Trouver mon ayah"
          desc="Comme un Shazam du Coran : retrouve la sourate à partir de ta récitation"
          cta="Ouvrir"
          onClick={() => { trackEvent("module_open", "find_ayah"); navigate("/find-ayah"); }}
          gradient="bg-gradient-to-br from-indigo-700/60 to-violet-700/30 border border-indigo-400/40"
          delay={0.35}
        />
        <HomeCard
          emoji="🧸"
          title="Espace enfants"
          desc="Noorani, prière, 'Umra & Hajj, mosquées, quiz…"
          cta="Ouvrir"
          onClick={() => { trackEvent("module_open", "kids_space"); navigate("/kids"); }}
          gradient="bg-gradient-to-br from-indigo-700/60 to-violet-700/30 border border-indigo-400/40"
          delay={0.4}
        />
      </div>

      {/* ═══ BLOC 3 – Hifz & Quiz ═══ */}
      <div className="px-5 mt-3 grid grid-cols-2 gap-3">
        <HomeCard
          emoji="📖"
          title="Plan Hifz"
          desc="Crée ton planning de mémorisation"
          cta={plan ? "Ouvrir" : "Créer mon plan"}
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
          title="Commencer le Quiz Niveau"
          desc="Testez votre niveau Hifz"
          cta="Ouvrir"
          onClick={() => { trackEvent("module_open", "quiz"); navigate("/quiz"); }}
          gradient="bg-gradient-to-br from-sky-700/60 to-cyan-700/30 border border-sky-400/40"
          delay={0.5}
        />
      </div>

      {/* ═══ BLOC 4 – Suivi ═══ */}
      <div className="px-5 mt-6 space-y-3">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">Suivi</p>
        <div className="grid grid-cols-2 gap-3">
          <HomeCard
            emoji="📊"
            title="Voir ma progression"
            desc="Maîtrise & Hifz Map"
            cta="Ouvrir"
            onClick={() => { trackEvent("module_open", "habits"); navigate("/habits"); }}
            gradient="bg-gradient-to-br from-slate-800/70 to-slate-900/40 border border-slate-600/50"
            delay={0.55}
          />
          <HomeCard
            emoji="🏆"
            title="Voir votre classement"
            desc="Top mondial / pays"
            cta="Ouvrir"
            onClick={() => { trackEvent("module_open", "leaderboard"); navigate("/leaderboard"); }}
            gradient="bg-gradient-to-br from-slate-800/70 to-slate-900/40 border border-slate-600/50"
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
