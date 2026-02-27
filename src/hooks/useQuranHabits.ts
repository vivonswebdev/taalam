import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const LOCAL_KEY = "iqraa_habits";
const GOAL_KEY = "iqraa_habit_goal";

export type GoalType = "minutes" | "ayat";

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  minutes_quran: number;
  ayat_recited: number;
  sessions_count: number;
}

export interface HabitGoal {
  type: GoalType;
  target: number;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadLocal(): Record<string, DailyActivity> {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocal(data: Record<string, DailyActivity>) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
}

function loadGoal(): HabitGoal {
  try {
    const raw = localStorage.getItem(GOAL_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { type: "minutes", target: 15 };
}

function getStreakDays(activities: Record<string, DailyActivity>): number {
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const act = activities[key];
    if (act && (act.minutes_quran > 0 || act.ayat_recited > 0)) {
      streak++;
    } else if (i > 0) {
      break;
    } else {
      // today with no activity yet — don't break, just skip
    }
  }
  return streak;
}

function getLast30Days(activities: Record<string, DailyActivity>): DailyActivity[] {
  const result: DailyActivity[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push(activities[key] || { date: key, minutes_quran: 0, ayat_recited: 0, sessions_count: 0 });
  }
  return result;
}

export function useQuranHabits() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Record<string, DailyActivity>>(loadLocal);
  const [goal, setGoalState] = useState<HabitGoal>(loadGoal);
  const [syncing, setSyncing] = useState(false);

  // Load from Cloud if authenticated
  useEffect(() => {
    if (!user) return;
    setSyncing(true);
    supabase
      .from("quran_daily_activity")
      .select("activity_date, minutes_quran, ayat_recited, sessions_count")
      .eq("user_id", user.id)
      .order("activity_date", { ascending: false })
      .limit(90)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const merged = { ...loadLocal() };
          data.forEach((row) => {
            const key = row.activity_date;
            const existing = merged[key];
            if (!existing || row.minutes_quran > existing.minutes_quran || row.ayat_recited > existing.ayat_recited) {
              merged[key] = {
                date: key,
                minutes_quran: Math.max(row.minutes_quran, existing?.minutes_quran || 0),
                ayat_recited: Math.max(row.ayat_recited, existing?.ayat_recited || 0),
                sessions_count: Math.max(row.sessions_count, existing?.sessions_count || 0),
              };
            }
          });
          setActivities(merged);
          saveLocal(merged);
        }
        setSyncing(false);
      });
  }, [user]);

  const syncToCloud = useCallback(async (date: string, activity: DailyActivity) => {
    if (!user) return;
    const { error } = await supabase
      .from("quran_daily_activity")
      .upsert({
        user_id: user.id,
        activity_date: date,
        minutes_quran: activity.minutes_quran,
        ayat_recited: activity.ayat_recited,
        sessions_count: activity.sessions_count,
      }, { onConflict: "user_id,activity_date" });
    if (error) console.error("Habits sync error:", error);
  }, [user]);

  const addMinutes = useCallback((minutes: number) => {
    const key = todayStr();
    setActivities((prev) => {
      const current = prev[key] || { date: key, minutes_quran: 0, ayat_recited: 0, sessions_count: 0 };
      const updated = { ...current, minutes_quran: current.minutes_quran + minutes, sessions_count: current.sessions_count + 1 };
      const next = { ...prev, [key]: updated };
      saveLocal(next);
      syncToCloud(key, updated);
      return next;
    });
  }, [syncToCloud]);

  const addAyat = useCallback((count: number) => {
    const key = todayStr();
    setActivities((prev) => {
      const current = prev[key] || { date: key, minutes_quran: 0, ayat_recited: 0, sessions_count: 0 };
      const updated = { ...current, ayat_recited: current.ayat_recited + count };
      const next = { ...prev, [key]: updated };
      saveLocal(next);
      syncToCloud(key, updated);
      return next;
    });
  }, [syncToCloud]);

  const setGoal = useCallback((newGoal: HabitGoal) => {
    setGoalState(newGoal);
    localStorage.setItem(GOAL_KEY, JSON.stringify(newGoal));
  }, []);

  const today = useMemo(() => {
    const key = todayStr();
    return activities[key] || { date: key, minutes_quran: 0, ayat_recited: 0, sessions_count: 0 };
  }, [activities]);

  const streak = useMemo(() => getStreakDays(activities), [activities]);
  const last30Days = useMemo(() => getLast30Days(activities), [activities]);

  const goalProgress = useMemo(() => {
    const current = goal.type === "minutes" ? today.minutes_quran : today.ayat_recited;
    return { current, target: goal.target, percent: Math.min(100, Math.round((current / goal.target) * 100)) };
  }, [today, goal]);

  return {
    today,
    streak,
    last30Days,
    goal,
    setGoal,
    goalProgress,
    addMinutes,
    addAyat,
    syncing,
    isAuthenticated: !!user,
  };
}
