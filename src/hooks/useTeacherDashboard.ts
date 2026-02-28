import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface StudentStats {
  userId: string;
  displayName: string;
  avatarEmoji: string;
  quranMinutes: number;
  hifzAyat: number;
  nooraniLessons: number;
  quizCompleted: number;
  xpTotal: number;
  streakDays: number;
}

export interface ClassAssignment {
  id: string;
  class_id: string;
  title: string;
  type: string;
  target: any;
  due_date: string;
  is_active: boolean;
  created_at: string;
}

export function useTeacherDashboard(classId: string | null) {
  const { user } = useAuth();
  const [students, setStudents] = useState<StudentStats[]>([]);
  const [assignments, setAssignments] = useState<ClassAssignment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStudents = useCallback(async () => {
    if (!classId || !user) return;
    setLoading(true);
    try {
      // Get members
      const { data: members } = await supabase
        .from("classroom_members")
        .select("user_id")
        .eq("classroom_id", classId);

      const memberIds = (members || []).map((m) => m.user_id);
      if (memberIds.length === 0) { setStudents([]); setLoading(false); return; }

      // Get profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_emoji, xp_total")
        .in("user_id", memberIds);

      // Get 7-day activity
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const dateStr = sevenDaysAgo.toISOString().split("T")[0];

      const { data: activity } = await supabase
        .from("quran_daily_activity")
        .select("user_id, minutes_quran, ayat_recited, sessions_count")
        .in("user_id", memberIds)
        .gte("activity_date", dateStr);

      // Get hifz tasks completed in last 7 days
      const { data: hifzTasks } = await supabase
        .from("hifz_plan_tasks")
        .select("user_id, ayah_from, ayah_to")
        .in("user_id", memberIds)
        .eq("is_completed", true)
        .gte("completed_at", sevenDaysAgo.toISOString());

      // Get user_progress for streaks
      const { data: progress } = await supabase
        .from("user_progress")
        .select("user_id, streak_days")
        .in("user_id", memberIds);

      // Get question_stats for quiz count
      const { data: qStats } = await supabase
        .from("question_stats")
        .select("user_id, seen")
        .in("user_id", memberIds);

      // Aggregate
      const statsMap = new Map<string, StudentStats>();
      for (const p of profiles || []) {
        statsMap.set(p.user_id, {
          userId: p.user_id,
          displayName: p.display_name,
          avatarEmoji: p.avatar_emoji,
          quranMinutes: 0,
          hifzAyat: 0,
          nooraniLessons: 0,
          quizCompleted: 0,
          xpTotal: p.xp_total,
          streakDays: 0,
        });
      }

      for (const a of activity || []) {
        const s = statsMap.get(a.user_id);
        if (s) s.quranMinutes += a.minutes_quran;
      }

      for (const h of hifzTasks || []) {
        const s = statsMap.get(h.user_id);
        if (s) s.hifzAyat += (h.ayah_to - h.ayah_from + 1);
      }

      for (const p of progress || []) {
        const s = statsMap.get(p.user_id);
        if (s) s.streakDays = p.streak_days;
      }

      for (const q of qStats || []) {
        const s = statsMap.get(q.user_id);
        if (s) s.quizCompleted += q.seen;
      }

      setStudents(Array.from(statsMap.values()));
    } catch (err) {
      console.error("Teacher dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [classId, user]);

  const fetchAssignments = useCallback(async () => {
    if (!classId) return;
    const { data } = await supabase
      .from("class_assignments")
      .select("*")
      .eq("class_id", classId)
      .order("due_date", { ascending: true });
    setAssignments((data as ClassAssignment[]) || []);
  }, [classId]);

  useEffect(() => {
    fetchStudents();
    fetchAssignments();
  }, [fetchStudents, fetchAssignments]);

  const createAssignment = useCallback(async (assignment: {
    title: string;
    type: string;
    target: any;
    due_date: string;
  }) => {
    if (!classId || !user) return;
    const { error } = await supabase.from("class_assignments").insert({
      class_id: classId,
      title: assignment.title,
      type: assignment.type,
      target: assignment.target,
      due_date: assignment.due_date,
      created_by: user.id,
    });
    if (error) throw error;
    await fetchAssignments();
  }, [classId, user, fetchAssignments]);

  const toggleAssignment = useCallback(async (id: string, isActive: boolean) => {
    await supabase.from("class_assignments").update({ is_active: !isActive }).eq("id", id);
    await fetchAssignments();
  }, [fetchAssignments]);

  const deleteAssignment = useCallback(async (id: string) => {
    await supabase.from("class_assignments").delete().eq("id", id);
    await fetchAssignments();
  }, [fetchAssignments]);

  // Aggregated summary
  const summary = {
    totalStudents: students.length,
    avgQuranMinutes: students.length ? Math.round(students.reduce((s, st) => s + st.quranMinutes, 0) / students.length) : 0,
    avgHifzAyat: students.length ? Math.round(students.reduce((s, st) => s + st.hifzAyat, 0) / students.length) : 0,
    totalQuizzes: students.reduce((s, st) => s + st.quizCompleted, 0),
  };

  return { students, assignments, loading, summary, createAssignment, toggleAssignment, deleteAssignment, refresh: fetchStudents };
}
