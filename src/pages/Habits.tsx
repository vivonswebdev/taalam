import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PageBackground from "@/components/PageBackground";
import { Flame, BookOpen, Clock, Target, TrendingUp, Award, Trophy, Star, Sparkles, Baby, Layers, Map, Headphones, FileDown, Zap, Gift } from "lucide-react";
import { useQuranHabits, type GoalType } from "@/hooks/useQuranHabits";
import { useLanguage } from "@/hooks/useLanguage";
import { useNavigate } from "react-router-dom";
import { useProgress } from "@/hooks/useProgress";
import { useChildMode } from "@/hooks/useChildMode";
import { useQuranXp } from "@/hooks/useQuranXp";
import { useListeningStats } from "@/hooks/useListeningStats";
import { useHifzPlan } from "@/hooks/useHifzPlan";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserMode } from "@/hooks/useUserMode";
import PersonalStatsDashboard from "@/components/PersonalStatsDashboard";
import ParentStatsPlaceholder from "@/components/ParentStatsPlaceholder";
import { surahs } from "@/data/surahs";
import { loadQuizStats } from "@/pages/Quiz";
import ProgressBarDuolingo from "@/components/ProgressBarDuolingo";
import { StickerCollection } from "@/components/StickerReward";
import HifzHabitCard from "@/components/HifzHabitCard";
import { generateProgressReport } from "@/lib/generateReport";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";

const GOAL_PRESETS: { type: GoalType; target: number; label: string; icon: string }[] = [
  { type: "minutes", target: 10, label: "10 min", icon: "⏱️" },
  { type: "minutes", target: 15, label: "15 min", icon: "⏱️" },
  { type: "minutes", target: 30, label: "30 min", icon: "⏱️" },
  { type: "ayat", target: 10, label: "10 ayat", icon: "📖" },
  { type: "ayat", target: 20, label: "20 ayat", icon: "📖" },
  { type: "ayat", target: 50, label: "50 ayat", icon: "📖" },
];

function HeatmapGrid({ days, listeningByDay, t }: { days: { date: string; minutes_quran: number; ayat_recited: number }[]; listeningByDay: Record<string, { minutes: number }>; t: (key: any) => string }) {
  const getIntensity = (d: typeof days[0]) => {
    const listenMin = listeningByDay[d.date]?.minutes || 0;
    const score = d.minutes_quran + d.ayat_recited + listenMin;
    if (score === 0) return "bg-muted";
    if (score < 5) return "bg-primary/20";
    if (score < 15) return "bg-primary/40";
    if (score < 30) return "bg-primary/60";
    return "bg-primary";
  };
  const dayLabels = [
    t("habits.heatL" as any), t("habits.heatM1" as any), t("habits.heatM2" as any),
    t("habits.heatJ" as any), t("habits.heatV" as any), t("habits.heatS" as any), t("habits.heatD" as any)
  ];
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-7 gap-1">
        {dayLabels.map((l, i) => (
          <span key={i} className="text-[9px] text-muted-foreground text-center font-medium">{l}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          return (
            <motion.div key={d.date} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.015 }}
              className={`aspect-square rounded-md ${getIntensity(d)} transition-colors`} />
          );
        })}
      </div>
      <div className="flex items-center justify-end gap-1 text-[9px] text-muted-foreground">
        <span>{t("habits.less" as any)}</span>
        <div className="w-3 h-3 rounded-sm bg-muted" />
        <div className="w-3 h-3 rounded-sm bg-primary/20" />
        <div className="w-3 h-3 rounded-sm bg-primary/40" />
        <div className="w-3 h-3 rounded-sm bg-primary/60" />
        <div className="w-3 h-3 rounded-sm bg-primary" />
        <span>{t("habits.more" as any)}</span>
      </div>
    </div>
  );
}

export default function Habits() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { today, streak, last30Days, goal, setGoal, goalProgress, isAuthenticated } = useQuranHabits();
  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const listeningStats = useListeningStats();
  const { plan: hifzPlan, tasks: hifzTasks, overallProgress: hifzProgress } = useHifzPlan();
  // Progress data
  const { progress, getMasteredCount } = useProgress();
  const { isChildMode, stickers } = useChildMode();
  const qxp = useQuranXp();
  const { profile } = useUserProfile();
  const { mode } = useUserMode();
  const mastered = getMasteredCount();
  const totalAttempts = progress.surahProgress.reduce((a, s) => a + s.attempts, 0);

  const quizStats = loadQuizStats();
  const quizCategories = [
    { key: "general" as const, icon: Star, label: t("quiz.category.general"), color: "text-primary" },
    { key: "memorization" as const, icon: BookOpen, label: t("quiz.category.memorization"), color: "text-secondary" },
    { key: "perfect" as const, icon: Trophy, label: t("quiz.category.perfect"), color: "text-secondary" },
    { key: "tajweed" as const, icon: Sparkles, label: t("quiz.category.tajweed"), color: "text-success" },
    { key: "kids" as const, icon: Baby, label: t("quiz.category.kids"), color: "text-accent-foreground" },
  ];
  const totalQuizCompleted = Object.values(quizStats).reduce((a, s) => a + s.completed, 0);

  const chartData = progress.surahProgress.map((sp) => {
    const surah = surahs.find((s) => s.number === sp.surahNumber);
    return { name: surah?.nameArabic || `${sp.surahNumber}`, score: sp.bestScore };
  });

  const handleDownloadReport = () => {
    const totalMinutes = last30Days.reduce((s, d) => s + d.minutes_quran, 0);
    const totalAyat = last30Days.reduce((s, d) => s + d.ayat_recited, 0);
    const topSurahs = [...progress.surahProgress]
      .sort((a, b) => b.bestScore - a.bestScore)
      .slice(0, 3)
      .map((sp) => {
        const surah = surahs.find((s) => s.number === sp.surahNumber);
        return { name: surah?.name || `#${sp.surahNumber}`, score: sp.bestScore };
      });
    const quizEntries = Object.values(quizStats);
    const quizAvg = quizEntries.length > 0
      ? Math.round(quizEntries.reduce((s, q) => s + (q.totalQuestions > 0 ? (q.totalCorrect / q.totalQuestions) * 100 : 0), 0) / quizEntries.length)
      : 0;

    generateProgressReport({
      displayName: profile?.display_name || "Ta'alam User",
      streak: streak,
      level: qxp.level,
      xpTotal: qxp.xp,
      xpToday: 0,
      hifzPlan,
      hifzTasks,
      hifzProgress,
      last30Days,
      habitStreak: streak,
      totalMinutes,
      totalAyat,
      topSurahs,
      quizAvg,
      labels: {
        reportTitle: t("report.title" as any),
        streak: t("report.streak" as any),
        days: t("home.days" as any),
        level: t("home.level.label" as any),
        todayXP: t("home.today" as any),
        hifzSection: t("hifz.habitTitle" as any),
        habitsSection: t("habits.title" as any),
        statsSection: t("report.statsSection" as any),
        surah: t("home.surah" as any),
        ayahs: t("report.ayahs" as any),
        type: t("report.type" as any),
        date: t("report.date" as any),
        review: t("hifz.review" as any),
        newTask: t("hifz.new" as any),
        noPlan: t("hifz.noPlanYet" as any),
        totalMinutes: t("report.totalMinutes" as any),
        totalAyat: t("report.totalAyat" as any),
        quizAvg: t("report.quizAvg" as any),
        topSurahs: t("report.topSurahs" as any),
        score: t("quiz.score" as any),
      },
    });
  };

  return (
    <PageBackground intensity="medium">
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="px-6 pt-14 pb-4">
        <div className="flex items-center justify-between">
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold text-foreground">
            📈 {t("habits.title" as any)}
          </motion.h1>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleDownloadReport}
            className="flex items-center gap-1.5 px-3 py-2 bg-primary/10 text-primary rounded-xl text-xs font-semibold hover:bg-primary/20 transition-colors"
          >
            <FileDown size={14} />
            {t("report.download" as any)}
          </motion.button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{t("habits.subtitle" as any)}</p>
      </div>

      <div className="px-6 space-y-4">
        {/* ───── SECTION: XP Qur'an & Niveau ───── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("habits.xpQuran" as any)}</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <ProgressBarDuolingo
            level={qxp.level}
            xpInLevel={qxp.levelProgress.currentInLevel}
            xpForNext={qxp.LEVEL_XP_STEP}
            xpTotal={qxp.xp}
            xpToday={0}
            streakDays={streak}
            lastGain={qxp.lastGain}
          />

          {/* Level badge */}
          <div className="bg-card border border-border rounded-2xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xl">
              {qxp.badge.emoji}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{qxp.badge.title}</p>
              <p className="text-[11px] text-muted-foreground">{t("habits.level" as any)} {qxp.level} · {qxp.xp} {t("habits.xpTotal" as any)}</p>
            </div>
          </div>

          {/* Streak bonus info */}
          <div className="bg-gradient-to-r from-secondary/10 to-secondary/5 border border-secondary/20 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
              <Gift size={18} className="text-secondary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                {t("habits.streak" as any)} : {streak} {streak > 1 ? t("habits.streakDaysPlural" as any) : t("habits.streakDays" as any)} 🔥
              </p>
              <p className="text-[11px] text-muted-foreground">
                {streak >= 2 ? `${t("habits.streakBonus" as any)} · ` : ""}
                {t("habits.nextBonus" as any)} {10 - (streak % 10)} {(10 - (streak % 10)) > 1 ? t("habits.streakDaysPlural" as any) : t("habits.streakDays" as any)} (+50 XP)
              </p>
            </div>
          </div>

          {/* XP sources */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-card border border-border rounded-xl p-2 text-center">
              <span className="text-lg">📖</span>
              <p className="text-[9px] text-muted-foreground mt-0.5">{t("habits.xpRead" as any)}</p>
              <p className="text-[9px] text-primary font-bold">+1/ayah</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-2 text-center">
              <span className="text-lg">🎧</span>
              <p className="text-[9px] text-muted-foreground mt-0.5">{t("habits.xpListen" as any)}</p>
              <p className="text-[9px] text-primary font-bold">+1/ayah</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-2 text-center">
              <span className="text-lg">🎤</span>
              <p className="text-[9px] text-muted-foreground mt-0.5">{t("habits.xpRecite" as any)}</p>
              <p className="text-[9px] text-primary font-bold">+2/ayah</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-2 text-center">
              <span className="text-lg">❓</span>
              <p className="text-[9px] text-muted-foreground mt-0.5">{t("habits.xpQuiz" as any)}</p>
              <p className="text-[9px] text-primary font-bold">+10</p>
            </div>
          </div>
        </motion.div>

        {/* ───── SECTION: Stats avancées (mode-aware) ───── */}
        {mode === "parent" ? (
          <ParentStatsPlaceholder />
        ) : (
          <>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("stats.sectionTitle" as any)}</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <PersonalStatsDashboard />
          </>
        )}

        {/* ───── SECTION: Plan Hifz ───── */}
        <HifzHabitCard />
        {/* ───── SECTION: Aujourd'hui ───── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-4 gap-2">
          <div className="bg-card border border-border rounded-2xl p-3 text-center">
            <Clock size={18} className="mx-auto text-primary mb-1" />
            <p className="text-xl font-bold text-foreground">{today.minutes_quran}</p>
            <p className="text-[9px] text-muted-foreground">{t("habits.minReading" as any)}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-3 text-center">
            <Headphones size={18} className="mx-auto text-secondary mb-1" />
            <p className="text-xl font-bold text-foreground">{listeningStats.todayListeningMinutes}</p>
            <p className="text-[9px] text-muted-foreground">{t("habits.minListening" as any)}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-3 text-center">
            <BookOpen size={18} className="mx-auto text-primary mb-1" />
            <p className="text-xl font-bold text-foreground">{today.ayat_recited}</p>
            <p className="text-[9px] text-muted-foreground">{t("habits.ayat" as any)}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-3 text-center">
            <Flame size={18} className="mx-auto text-destructive mb-1" />
            <p className="text-xl font-bold text-foreground">{streak}</p>
            <p className="text-[9px] text-muted-foreground">{t("habits.days" as any)}</p>
          </div>
        </motion.div>

        {/* ───── SECTION: Objectif quotidien ───── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target size={18} className="text-primary" />
              <span className="text-sm font-semibold text-foreground">{t("habits.dailyGoal" as any)}</span>
            </div>
            <button onClick={() => setShowGoalPicker(!showGoalPicker)} className="text-xs text-primary font-medium">
              {showGoalPicker ? t("habits.close" as any) : t("habits.edit" as any)}
            </button>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${goalProgress.percent >= 100 ? "bg-success" : "bg-primary"}`}
                initial={{ width: 0 }} animate={{ width: `${goalProgress.percent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }} />
            </div>
            <span className="text-sm font-bold text-foreground min-w-[60px] text-right">
              {goalProgress.current}/{goalProgress.target}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {goal.type === "minutes" ? t("habits.minutesQuran" as any) : t("habits.ayatRecited" as any)} ·{" "}
            {goalProgress.percent >= 100 ? (
              <span className="text-success font-semibold">{t("habits.goalReached" as any)}</span>
            ) : `${goalProgress.percent}%`}
          </p>
          {showGoalPicker && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-4 pt-3 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground mb-2">{t("habits.chooseGoal" as any)}</p>
              <div className="grid grid-cols-3 gap-2">
                {GOAL_PRESETS.map((preset) => (
                  <button key={`${preset.type}-${preset.target}`}
                    onClick={() => { setGoal({ type: preset.type, target: preset.target }); setShowGoalPicker(false); }}
                    className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border-2 transition-colors text-xs font-medium ${
                      goal.type === preset.type && goal.target === preset.target
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-accent/50 text-foreground"
                    }`}>
                    <span>{preset.icon}</span>
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* ───── SECTION: Heatmap 30 jours ───── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={18} className="text-primary" />
            <span className="text-sm font-semibold text-foreground">{t("habits.last30Days" as any)}</span>
          </div>
          <HeatmapGrid days={last30Days} listeningByDay={listeningStats.dailyListening} t={t} />
        </motion.div>

        {/* ───── SECTION: Résumé semaine ───── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Award size={18} className="text-secondary" />
            <span className="text-sm font-semibold text-foreground">{t("habits.weeklySummary" as any)}</span>
          </div>
          {(() => {
            const last7 = last30Days.slice(-7);
            const totalMin = last7.reduce((s, d) => s + d.minutes_quran, 0);
            const totalAyat = last7.reduce((s, d) => s + d.ayat_recited, 0);
            const totalListenMin = last7.reduce((s, d) => s + (listeningStats.dailyListening[d.date]?.minutes || 0), 0);
            const activeDays = last7.filter((d) => d.minutes_quran > 0 || d.ayat_recited > 0 || (listeningStats.dailyListening[d.date]?.minutes || 0) > 0).length;
            return (
              <div className="grid grid-cols-4 gap-2 text-center">
                <div><p className="text-lg font-bold text-foreground">{totalMin}</p><p className="text-[10px] text-muted-foreground">{t("habits.minReading" as any)}</p></div>
                <div><p className="text-lg font-bold text-foreground">{totalListenMin}</p><p className="text-[10px] text-muted-foreground">{t("habits.minListening" as any)}</p></div>
                <div><p className="text-lg font-bold text-foreground">{totalAyat}</p><p className="text-[10px] text-muted-foreground">{t("habits.ayat" as any)}</p></div>
                <div><p className="text-lg font-bold text-foreground">{activeDays}/7</p><p className="text-[10px] text-muted-foreground">{t("habits.activeDays" as any)}</p></div>
              </div>
            );
          })()}
        </motion.div>

        {/* ───── SECTION: Écoute avancée ───── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }} className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Headphones size={18} className="text-primary" />
              <span className="text-sm font-semibold text-foreground">{t("habits.advancedListening" as any)}</span>
            </div>
            <button onClick={() => navigate("/listening")} className="text-xs text-primary font-medium">
              {t("habits.open" as any)}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-lg font-bold text-foreground">{listeningStats.todayListeningMinutes}</p>
              <p className="text-[10px] text-muted-foreground">{t("habits.todayMin" as any)}</p>
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{listeningStats.sessionsCount}</p>
              <p className="text-[10px] text-muted-foreground">{t("habits.sessions" as any)}</p>
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{listeningStats.averageQuizScore != null ? `${listeningStats.averageQuizScore}%` : "–"}</p>
              <p className="text-[10px] text-muted-foreground">{t("habits.avgQuizScore" as any)}</p>
            </div>
          </div>
          {listeningStats.totalListeningMinutes > 0 && (
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <span>{t("habits.totalListening" as any).replace("{min}", String(listeningStats.totalListeningMinutes))}</span>
              {listeningStats.lastSession && (
                <span>{t("habits.surah" as any)} {listeningStats.lastSession.surah_number}</span>
              )}
            </div>
          )}
        </motion.div>

        {/* ───── SECTION: Graphique semaine (lecture + écoute) ───── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }} className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={18} className="text-secondary" />
            <span className="text-sm font-semibold text-foreground">{t("habits.weekActivity" as any)}</span>
          </div>
          {(() => {
            const last7 = last30Days.slice(-7);
            const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
            const weekData = last7.map((d) => {
              const dt = new Date(d.date + "T12:00:00");
              const listenMin = listeningStats.dailyListening[d.date]?.minutes || 0;
              return { day: dayNames[dt.getDay()], lecture: d.minutes_quran, écoute: listenMin };
            });
            return (
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={weekData} barGap={1}>
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Bar dataKey="lecture" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="écoute" stackId="a" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            );
          })()}
          <div className="flex items-center justify-center gap-4 mt-2">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-primary" /><span className="text-[10px] text-muted-foreground">Lecture</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-secondary" /><span className="text-[10px] text-muted-foreground">Écoute</span></div>
          </div>
        </motion.div>

        {/* Cloud sync hint */}
        {!isAuthenticated && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="bg-primary/5 border border-primary/10 rounded-2xl p-4 text-center">
            <p className="text-xs text-muted-foreground">📱 Connecte-toi pour synchroniser tes habitudes entre appareils</p>
            <button onClick={() => navigate("/auth")} className="mt-2 text-xs font-semibold text-primary">Se connecter →</button>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════
            SECTION: Progression Qur'an
            ═══════════════════════════════════════════ */}
        <div className="pt-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Progression Qur'an</span>
            <div className="h-px flex-1 bg-border" />
          </div>
        </div>

        {/* XP Progress Bar */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <ProgressBarDuolingo
            level={qxp.level} xpInLevel={qxp.levelProgress.currentInLevel} xpForNext={qxp.LEVEL_XP_STEP}
            xpTotal={qxp.xp} xpToday={0} streakDays={streak} lastGain={qxp.lastGain}
          />
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Trophy, value: mastered, label: t("progress.mastered"), color: "text-secondary" },
            { icon: BookOpen, value: totalAttempts, label: t("progress.attempts"), color: "text-primary" },
            { icon: TrendingUp, value: totalQuizCompleted, label: t("progress.quizCompleted"), color: "text-success" },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 + i * 0.05 }}
              className="bg-card border border-border rounded-2xl p-4 text-center">
              <stat.icon size={20} className={`${stat.color} mx-auto mb-2`} />
              <p className="text-2xl font-bold text-card-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Quiz stats */}
        {totalQuizCompleted > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="bg-card border border-border rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-card-foreground mb-4">{t("progress.quizStats")}</h3>
            <div className="space-y-3">
              {quizCategories.map((cat) => {
                const stats = quizStats[cat.key];
                if (stats.completed === 0) return null;
                const successRate = stats.totalQuestions > 0 ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) : 0;
                return (
                  <div key={cat.key} className="flex items-center gap-3">
                    <cat.icon size={16} className={cat.color} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-foreground">{cat.label}</span>
                        <span className="text-xs font-bold text-muted-foreground">{successRate}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all bg-primary" style={{ width: `${successRate}%` }} />
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground w-8 text-right">{stats.completed}x</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Surah score chart */}
        {chartData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-card border border-border rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-card-foreground mb-4">{t("progress.scores")}</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fontSize: 14, fontFamily: "Amiri" }} tickLine={false} axisLine={false} />
                <YAxis hide domain={[0, 100]} />
                <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.score >= 80 ? "hsl(var(--success))" : "hsl(var(--primary))"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Juz & Hifz Map shortcuts */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
          <button onClick={() => navigate("/juz")}
            className="w-full flex items-center justify-between bg-card border border-border rounded-2xl p-4 active:scale-[0.98] transition-transform">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Layers size={20} className="text-primary" /></div>
              <div className="text-left">
                <p className="text-sm font-semibold text-card-foreground">{t("juz.progress")}</p>
                <p className="text-[10px] text-muted-foreground">{t("juz.viewAll")}</p>
              </div>
            </div>
            <span className="text-muted-foreground text-lg">→</span>
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <button onClick={() => navigate("/hifz-map")}
            className="w-full flex items-center justify-between bg-card border border-border rounded-2xl p-4 active:scale-[0.98] transition-transform">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center"><Map size={20} className="text-secondary" /></div>
              <div className="text-left">
                <p className="text-sm font-semibold text-card-foreground">{t("hifzMap.title")}</p>
                <p className="text-[10px] text-muted-foreground">{t("hifzMap.subtitle")}</p>
              </div>
            </div>
            <span className="text-muted-foreground text-lg">→</span>
          </button>
        </motion.div>

        {/* Surah details */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">{t("progress.details")}</h3>
          {progress.surahProgress.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">{t("progress.noSurahs")}</p>
          ) : (
            <div className="space-y-2">
              {progress.surahProgress.map((sp, i) => {
                const surah = surahs.find((s) => s.number === sp.surahNumber);
                if (!surah) return null;
                return (
                  <motion.div key={sp.surahNumber} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.75 + i * 0.03 }}
                    className="flex items-center gap-3 bg-card border border-border rounded-xl p-3">
                    <span className="font-arabic text-lg text-primary w-16 text-right">{surah.nameArabic}</span>
                    <div className="flex-1">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all bg-primary" style={{ width: `${sp.bestScore}%` }} />
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground w-10 text-right">{sp.bestScore}%</span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Stickers */}
        {isChildMode && stickers.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-card-foreground mb-4">{t("progress.stickers")}</h3>
            <StickerCollection stickers={stickers} />
          </motion.div>
        )}
      </div>
    </div>
    </PageBackground>
  );
}
