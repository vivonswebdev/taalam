import { useMemo } from "react";
import { useQuranHabits } from "@/hooks/useQuranHabits";
import { useHifzPlan } from "@/hooks/useHifzPlan";
import { useListeningStats } from "@/hooks/useListeningStats";
import { useQuranXp } from "@/hooks/useQuranXp";

export function usePersonalStats() {
  const { last30Days, streak } = useQuranHabits();
  const { plan, tasks, overallProgress } = useHifzPlan();
  const listeningStats = useListeningStats();
  const xp = useQuranXp();

  return useMemo(() => {
    const now = new Date();
    const last7 = last30Days.slice(-7);

    // KPI: Minutes Qur'an this week
    const quranMinutesWeek = last7.reduce((s, d) => s + d.minutes_quran, 0)
      + last7.reduce((s, d) => s + (listeningStats.dailyListening[d.date]?.minutes || 0), 0);

    // KPI: Hifz ayat completed this month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    const hifzAyatMonth = (tasks || [])
      .filter(t => t.is_completed && t.completed_at && t.completed_at >= monthStart)
      .reduce((s, t) => s + (t.ayah_to - t.ayah_from + 1), 0);

    // KPI: Streak
    const streakDays = xp.streakDays || streak;

    // Chart: Quran time 30 days
    const quranTimeData = last30Days.map(d => ({
      date: d.date,
      label: new Date(d.date + "T12:00:00").toLocaleDateString(undefined, { day: "numeric", month: "short" }),
      minutes: d.minutes_quran + (listeningStats.dailyListening[d.date]?.minutes || 0),
    }));
    const avgMinutesPerDay = quranTimeData.length > 0
      ? Math.round(quranTimeData.reduce((s, d) => s + d.minutes, 0) / quranTimeData.length)
      : 0;

    // Chart: Hifz weekly progress (last 4 weeks)
    const hifzWeeklyData: { week: string; completed: number; total: number; percent: number }[] = [];
    for (let w = 3; w >= 0; w--) {
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() - w * 7);
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 6);
      const wsStr = weekStart.toISOString().split("T")[0];
      const weStr = weekEnd.toISOString().split("T")[0];

      const weekTasks = (tasks || []).filter(t => t.task_date >= wsStr && t.task_date <= weStr);
      const completed = weekTasks.filter(t => t.is_completed).length;
      const total = weekTasks.length;
      hifzWeeklyData.push({
        week: `S${4 - w}`,
        completed,
        total,
        percent: total > 0 ? Math.round((completed / total) * 100) : 0,
      });
    }

    // Hifz projection
    const completedTasks = (tasks || []).filter(t => t.is_completed);
    const totalAyatDone = completedTasks.reduce((s, t) => s + (t.ayah_to - t.ayah_from + 1), 0);
    const allAyat = (tasks || []).reduce((s, t) => s + (t.ayah_to - t.ayah_from + 1), 0);
    const remaining = allAyat - totalAyatDone;

    // Average ayat per day (last 30 days)
    const daysWithHifz = new Set(completedTasks.map(t => t.completed_at?.split("T")[0])).size;
    const avgAyatPerDay = daysWithHifz > 0 ? totalAyatDone / daysWithHifz : 0;
    const projectionDays = avgAyatPerDay > 0 ? Math.ceil(remaining / avgAyatPerDay) : null;

    // Heatmap data with score
    const heatmapData = last30Days.map(d => {
      const listenMin = listeningStats.dailyListening[d.date]?.minutes || 0;
      const dayTasks = (tasks || []).filter(t => t.task_date === d.date);
      const hifzDone = dayTasks.filter(t => t.is_completed).length;
      const hifzTotal = dayTasks.length;
      const score = d.minutes_quran + listenMin + d.ayat_recited + hifzDone * 5;
      return { date: d.date, score, minutes: d.minutes_quran + listenMin, ayat: d.ayat_recited, hifzDone, hifzTotal };
    });

    return {
      quranMinutesWeek,
      hifzAyatMonth,
      streakDays,
      quranTimeData,
      avgMinutesPerDay,
      hifzWeeklyData,
      projectionDays,
      overallProgress,
      heatmapData,
      hasPlan: !!plan,
    };
  }, [last30Days, streak, tasks, plan, overallProgress, listeningStats, xp]);
}
