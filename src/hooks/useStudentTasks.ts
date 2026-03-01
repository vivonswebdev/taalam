import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface StudentTask {
  id: string;
  class_id: string;
  student_id: string;
  assigned_by: string;
  title: string;
  task_type: string;
  surah_number: number | null;
  ayah_from: number | null;
  ayah_to: number | null;
  description: string | null;
  status: string;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  // enriched
  student_name?: string;
  student_emoji?: string;
}

// Teacher hook: manage tasks for a class
export function useStudentTasks(classId: string | null) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<StudentTask[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = useCallback(async () => {
    if (!classId || !user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("student_tasks")
        .select("*")
        .eq("class_id", classId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const studentIds = [...new Set((data || []).map((t: any) => t.student_id))];
      const { data: profiles } = studentIds.length > 0
        ? await supabase.from("profiles").select("user_id, display_name, avatar_emoji").in("user_id", studentIds)
        : { data: [] };

      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

      setTasks((data || []).map((t: any) => ({
        ...t,
        student_name: profileMap.get(t.student_id)?.display_name || "?",
        student_emoji: profileMap.get(t.student_id)?.avatar_emoji || "🌙",
      })));
    } catch (err) {
      console.error("Fetch student tasks error:", err);
    } finally {
      setLoading(false);
    }
  }, [classId, user]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const createTask = useCallback(async (task: {
    student_id: string;
    title: string;
    task_type: string;
    surah_number?: number;
    ayah_from?: number;
    ayah_to?: number;
    description?: string;
    due_date?: string;
  }) => {
    if (!classId || !user) return;
    const { error } = await supabase.from("student_tasks").insert({
      class_id: classId,
      student_id: task.student_id,
      assigned_by: user.id,
      title: task.title,
      task_type: task.task_type,
      surah_number: task.surah_number || null,
      ayah_from: task.ayah_from || null,
      ayah_to: task.ayah_to || null,
      description: task.description || null,
      due_date: task.due_date || null,
    } as any);
    if (error) throw error;
    await fetchTasks();
  }, [classId, user, fetchTasks]);

  const deleteTask = useCallback(async (taskId: string) => {
    await supabase.from("student_tasks").delete().eq("id", taskId);
    await fetchTasks();
  }, [fetchTasks]);

  return { tasks, loading, createTask, deleteTask, refresh: fetchTasks };
}

// Student hook: view own tasks across classes
export function useMyTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<StudentTask[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("student_tasks")
        .select("*")
        .eq("student_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTasks((data || []) as StudentTask[]);
    } catch (err) {
      console.error("Fetch my tasks error:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const completeTask = useCallback(async (taskId: string) => {
    if (!user) return;
    await supabase.from("student_tasks").update({
      status: "completed",
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as any).eq("id", taskId);
    await fetchTasks();
  }, [user, fetchTasks]);

  const pendingTasks = tasks.filter(t => t.status === "pending");
  const completedTasks = tasks.filter(t => t.status === "completed");

  return { tasks, pendingTasks, completedTasks, loading, completeTask, refresh: fetchTasks };
}
