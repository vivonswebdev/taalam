import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { surahs } from "@/data/surahs";

const LS_PLAN_KEY = "hifzPlan";
const LS_TASKS_KEY = "hifzPlanTasks";

export interface HifzPlan {
  id: string;
  name: string;
  target_type: "surahs" | "juz";
  target_items: number[];
  duration_days: number;
  daily_ayat: number;
  started_at: string;
  is_active: boolean;
}

export interface HifzTask {
  id: string;
  plan_id: string;
  task_date: string;
  surah_number: number;
  ayah_from: number;
  ayah_to: number;
  task_type: "new" | "review";
  is_completed: boolean;
  completed_at?: string;
}

function generateId() {
  return crypto.randomUUID?.() || Math.random().toString(36).slice(2);
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

/** Generate daily tasks for a plan */
function generateTasks(plan: HifzPlan): HifzTask[] {
  const tasks: HifzTask[] = [];
  const surahList = plan.target_type === "surahs"
    ? plan.target_items
    : getJuzSurahs(plan.target_items);

  // Collect all ayahs from target surahs
  const allChunks: { surah: number; from: number; to: number }[] = [];
  for (const sn of surahList) {
    const s = surahs.find((x) => x.number === sn);
    if (!s) continue;
    for (let a = 1; a <= s.versesCount; a += plan.daily_ayat) {
      allChunks.push({
        surah: sn,
        from: a,
        to: Math.min(a + plan.daily_ayat - 1, s.versesCount),
      });
    }
  }

  const startDate = new Date(plan.started_at);
  for (let i = 0; i < allChunks.length; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const chunk = allChunks[i];
    tasks.push({
      id: generateId(),
      plan_id: plan.id,
      task_date: d.toISOString().split("T")[0],
      surah_number: chunk.surah,
      ayah_from: chunk.from,
      ayah_to: chunk.to,
      task_type: "new",
      is_completed: false,
    });

    // Add review task 3 days later
    const reviewDate = new Date(d);
    reviewDate.setDate(reviewDate.getDate() + 3);
    tasks.push({
      id: generateId(),
      plan_id: plan.id,
      task_date: reviewDate.toISOString().split("T")[0],
      surah_number: chunk.surah,
      ayah_from: chunk.from,
      ayah_to: chunk.to,
      task_type: "review",
      is_completed: false,
    });
  }

  return tasks;
}

function getJuzSurahs(juzNumbers: number[]): number[] {
  // Simplified: Juz 30 = surahs 78-114, etc.
  // For now just handle Juz 30 as most common
  const map: Record<number, number[]> = {
    30: Array.from({ length: 37 }, (_, i) => 78 + i),
    29: Array.from({ length: 11 }, (_, i) => 67 + i),
    28: Array.from({ length: 8 }, (_, i) => 58 + i), // approx
  };
  const result: number[] = [];
  for (const j of juzNumbers) {
    if (map[j]) result.push(...map[j]);
  }
  return [...new Set(result)].sort((a, b) => a - b);
}

function loadLocalPlan(): HifzPlan | null {
  try {
    const raw = localStorage.getItem(LS_PLAN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function loadLocalTasks(): HifzTask[] {
  try {
    const raw = localStorage.getItem(LS_TASKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function useHifzPlan() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<HifzPlan | null>(loadLocalPlan);
  const [tasks, setTasks] = useState<HifzTask[]>(loadLocalTasks);
  const [loading, setLoading] = useState(false);

  // Load from cloud if authenticated
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    (async () => {
      const { data: plans } = await supabase
        .from("hifz_plans")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .limit(1);

      if (plans && plans.length > 0) {
        const p = plans[0];
        const cloudPlan: HifzPlan = {
          id: p.id,
          name: p.name,
          target_type: p.target_type as "surahs" | "juz",
          target_items: (p.target_items as any) || [],
          duration_days: p.duration_days,
          daily_ayat: p.daily_ayat,
          started_at: p.started_at,
          is_active: p.is_active,
        };
        setPlan(cloudPlan);
        localStorage.setItem(LS_PLAN_KEY, JSON.stringify(cloudPlan));

        const { data: cloudTasks } = await supabase
          .from("hifz_plan_tasks")
          .select("*")
          .eq("plan_id", p.id)
          .order("task_date", { ascending: true });

        if (cloudTasks) {
          const mapped: HifzTask[] = cloudTasks.map((t: any) => ({
            id: t.id,
            plan_id: t.plan_id,
            task_date: t.task_date,
            surah_number: t.surah_number,
            ayah_from: t.ayah_from,
            ayah_to: t.ayah_to,
            task_type: t.task_type as "new" | "review",
            is_completed: t.is_completed,
            completed_at: t.completed_at,
          }));
          setTasks(mapped);
          localStorage.setItem(LS_TASKS_KEY, JSON.stringify(mapped));
        }
      }
      setLoading(false);
    })();
  }, [user]);

  const createPlan = useCallback(async (params: {
    name: string;
    target_type: "surahs" | "juz";
    target_items: number[];
    duration_days: number;
    daily_ayat: number;
  }) => {
    const newPlan: HifzPlan = {
      id: generateId(),
      ...params,
      started_at: todayStr(),
      is_active: true,
    };

    const newTasks = generateTasks(newPlan);
    setPlan(newPlan);
    setTasks(newTasks);
    localStorage.setItem(LS_PLAN_KEY, JSON.stringify(newPlan));
    localStorage.setItem(LS_TASKS_KEY, JSON.stringify(newTasks));

    if (user) {
      const { data: inserted } = await supabase
        .from("hifz_plans")
        .insert({
          user_id: user.id,
          name: newPlan.name,
          target_type: newPlan.target_type,
          target_items: newPlan.target_items as any,
          duration_days: newPlan.duration_days,
          daily_ayat: newPlan.daily_ayat,
          started_at: newPlan.started_at,
          is_active: true,
        })
        .select()
        .single();

      if (inserted) {
        newPlan.id = inserted.id;
        setPlan({ ...newPlan });
        localStorage.setItem(LS_PLAN_KEY, JSON.stringify(newPlan));

        // Insert tasks in batches
        const taskRows = newTasks.map((t) => ({
          plan_id: inserted.id,
          user_id: user.id,
          task_date: t.task_date,
          surah_number: t.surah_number,
          ayah_from: t.ayah_from,
          ayah_to: t.ayah_to,
          task_type: t.task_type,
          is_completed: false,
        }));

        // Insert in chunks of 100
        for (let i = 0; i < taskRows.length; i += 100) {
          await supabase.from("hifz_plan_tasks").insert(taskRows.slice(i, i + 100));
        }
      }
    }
  }, [user]);

  const completeTask = useCallback(async (taskId: string) => {
    const now = new Date().toISOString();
    setTasks((prev) => {
      const updated = prev.map((t) =>
        t.id === taskId ? { ...t, is_completed: true, completed_at: now } : t
      );
      localStorage.setItem(LS_TASKS_KEY, JSON.stringify(updated));
      return updated;
    });

    if (user) {
      await supabase
        .from("hifz_plan_tasks")
        .update({ is_completed: true, completed_at: now })
        .eq("id", taskId);
    }
  }, [user]);

  const deletePlan = useCallback(async () => {
    setPlan(null);
    setTasks([]);
    localStorage.removeItem(LS_PLAN_KEY);
    localStorage.removeItem(LS_TASKS_KEY);

    if (user && plan) {
      await supabase.from("hifz_plans").delete().eq("id", plan.id);
    }
  }, [user, plan]);

  const today = todayStr();
  const todayTasks = useMemo(() => tasks.filter((t) => t.task_date === today), [tasks, today]);
  const upcomingTasks = useMemo(() => tasks.filter((t) => t.task_date > today && !t.is_completed).slice(0, 10), [tasks, today]);
  const completedCount = useMemo(() => tasks.filter((t) => t.is_completed).length, [tasks]);
  const totalCount = tasks.length;
  const overallProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return {
    plan,
    tasks,
    todayTasks,
    upcomingTasks,
    completedCount,
    totalCount,
    overallProgress,
    createPlan,
    completeTask,
    deletePlan,
    loading,
    isAuthenticated: !!user,
  };
}
