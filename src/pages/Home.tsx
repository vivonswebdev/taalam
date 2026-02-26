import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Clock, Settings, LogOut, Megaphone, Trophy, Zap } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useClassrooms } from "@/hooks/useClassrooms";
import { useAuth } from "@/hooks/useAuth";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useXP } from "@/hooks/useXP";
import { useDailyTarteelChallenge } from "@/hooks/useDailyTarteelChallenge";
import { useMyClassChallenges } from "@/hooks/useWeeklyChallenge";
import { surahs } from "@/data/surahs";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import RoundActionButton from "@/components/RoundActionButton";
import DailyTarteelChallenge from "@/components/DailyTarteelChallenge";
import islamicPattern from "@/assets/islamic-pattern.jpg";
import { supabase } from "@/integrations/supabase/client";
import WeakSurahsSection from "@/components/WeakSurahsSection";

export default function Home() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const xp = useXP();
  const { classrooms } = useClassrooms();
  const { user, signOut } = useAuth();
  const classCodes = classrooms.map((c) => c.joinCode);
  const { unreadCount } = useAnnouncements(classCodes);
  const dailyChallenge = useDailyTarteelChallenge();
  const { challenges: weeklyChallenges, myResults } = useMyClassChallenges();

  // Fetch member counts + unread messages per classroom
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [unreadMessages, setUnreadMessages] = useState<Record<string, number>>({});

  useEffect(() => {
    if (classrooms.length === 0) return;
    const ids = classrooms.map((c) => c.id);

    // Member counts
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

    // Unread message counts (based on last visit stored in localStorage)
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
    <div className="min-h-screen pb-24">
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
      {/* Header */}
      <div className="relative overflow-visible">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-primary/5 to-background" />
        <img src={islamicPattern} alt="" className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 opacity-10 pointer-events-none" />
        <div className="relative px-6 pt-14 pb-6 text-center">
          {/* Top bar */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            {user && (
              <button onClick={signOut} className="text-muted-foreground hover:text-foreground" title={t("auth.logout")}>
                <LogOut size={18} />
              </button>
            )}
            <LanguageSwitcher />
          </div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-arabic text-xl text-primary mb-1">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-2xl font-bold text-foreground tracking-tight">
            Iqraa – <span className="text-primary">{t("home.hifzTitle")}</span>
          </motion.h1>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-3 flex items-center justify-center gap-4"
          >
            <div className="flex items-center gap-1.5 bg-card/80 backdrop-blur-sm border border-border rounded-full px-3 py-1.5">
              <span className="text-base">🔥</span>
              <span className="text-sm font-semibold text-foreground">{xp.streakDays} {t("home.days")}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-card/80 backdrop-blur-sm border border-border rounded-full px-3 py-1.5">
              <span className="text-base">⭐</span>
              <span className="text-sm font-semibold text-foreground">{xp.xpToday} XP {t("home.today")}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-card/80 backdrop-blur-sm border border-border rounded-full px-3 py-1.5">
              <span className="text-base">🏅</span>
              <span className="text-sm font-semibold text-foreground">{t("home.level.label")} {xp.level}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Action Buttons – Tarteel first */}
      <div className="px-6 mt-4 space-y-3">
        <RoundActionButton
          icon="🎤"
          title={t("home.tarteelButton")}
          subtitle={t("home.tarteelButtonDesc")}
          onClick={() => navigate("/recitation")}
          delay={0.3}
        />
        <RoundActionButton
          icon="🧠"
          title={t("home.quizButton")}
          subtitle={t("home.quizButtonDesc")}
          onClick={() => navigate("/quiz")}
          delay={0.38}
        />
        <div className="grid grid-cols-2 gap-3 mt-3">
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/leaderboard")}
            className="flex flex-col items-center gap-2 rounded-2xl p-4 bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 text-left"
          >
            <span className="text-3xl">🏆</span>
            <p className="text-xs font-bold text-foreground text-center">{t("home.leaderboardButton")}</p>
            <p className="text-[10px] text-muted-foreground text-center">{t("home.leaderboardButtonDesc")}</p>
          </motion.button>
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/progress")}
            className="flex flex-col items-center gap-2 rounded-2xl p-4 bg-gradient-to-br from-accent/15 to-accent/5 border border-accent/20 text-left"
          >
            <span className="text-3xl">📊</span>
            <p className="text-xs font-bold text-foreground text-center">{t("home.progressButton")}</p>
            <p className="text-[10px] text-muted-foreground text-center">{t("home.progressButtonDesc")}</p>
          </motion.button>
        </div>
      </div>

      {/* Classe Pro + Famille – side by side */}
      <div className="px-6 mt-4 grid grid-cols-2 gap-3">
        {/* Classe Professeur */}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/classrooms")}
          className="flex flex-col items-center gap-2 rounded-2xl p-4 bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20"
        >
          <GraduationCap size={28} className="text-primary" />
          <p className="text-xs font-bold text-foreground text-center">{t("home.classMode")}</p>
          <p className="text-[10px] text-muted-foreground text-center">
            {classrooms.length > 0
              ? `${classrooms.length} ${classrooms.length > 1 ? t("home.classesActive") : t("home.classActive")}`
              : t("home.createOrJoin")}
          </p>
        </motion.button>

        {/* Classe Famille */}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/family")}
          className="flex flex-col items-center gap-2 rounded-2xl p-4 bg-gradient-to-br from-secondary/15 to-secondary/5 border border-secondary/20"
        >
          <span className="text-2xl">👨‍👩‍👧‍👦</span>
          <p className="text-xs font-bold text-foreground text-center">Classe Famille</p>
          <p className="text-[10px] text-muted-foreground text-center">Suivez vos enfants</p>
        </motion.button>
      </div>

      {/* Weak Surahs Section */}
      <WeakSurahsSection />

      {/* Quick actions: Annonces + Réglages */}
      <div className="px-6 mt-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 gap-3"
        >
          <button
            onClick={() => navigate("/announcements")}
            className="relative flex flex-col items-center gap-1.5 p-4 bg-card border border-border rounded-2xl active:scale-[0.97] transition-transform"
          >
            <Megaphone size={22} className="text-secondary" />
            <span className="text-xs font-semibold text-foreground">{t("home.announcements")}</span>
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => navigate("/settings")}
            className="flex flex-col items-center gap-1.5 p-4 bg-card border border-border rounded-2xl active:scale-[0.97] transition-transform"
          >
            <Settings size={22} className="text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">{t("nav.settings")}</span>
          </button>
        </motion.div>

        {/* Join community CTA */}
        {!user && (
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            onClick={() => navigate("/auth")}
            className="mt-4 w-full flex items-center gap-4 bg-primary/10 border border-primary/20 rounded-2xl p-4 text-left active:scale-[0.98] transition-transform"
          >
            <span className="text-2xl">👤</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">{t("home.joinCommunity")}</p>
              <p className="text-xs text-muted-foreground">{t("home.joinCommunityDesc")}</p>
            </div>
          </motion.button>
        )}
      </div>
    </div>
  );
}
