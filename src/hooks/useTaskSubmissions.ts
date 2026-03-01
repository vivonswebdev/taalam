import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTeacherParentMessages } from "@/hooks/useTeacherParentMessages";

export interface TaskSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  class_id: string;
  status: "pending" | "approved" | "rejected";
  audio_url: string | null;
  score_tajwid: number | null;
  teacher_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  // Joined
  student_name?: string;
  student_emoji?: string;
  assignment_title?: string;
}

export function useTaskSubmissions(classId: string | null) {
  const { user } = useAuth();
  const { sendAutoNotification } = useTeacherParentMessages(classId);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSubmissions = useCallback(async () => {
    if (!classId || !user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("task_submissions")
        .select("*")
        .eq("class_id", classId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const subs = (data || []) as any[];
      
      // Get student profiles and assignment titles
      const studentIds = [...new Set(subs.map(s => s.student_id))];
      const assignmentIds = [...new Set(subs.map(s => s.assignment_id))];

      const [profilesRes, assignmentsRes] = await Promise.all([
        studentIds.length > 0
          ? supabase.from("profiles").select("user_id, display_name, avatar_emoji").in("user_id", studentIds)
          : Promise.resolve({ data: [] }),
        assignmentIds.length > 0
          ? supabase.from("class_assignments").select("id, title").in("id", assignmentIds)
          : Promise.resolve({ data: [] }),
      ]);

      const profileMap = new Map((profilesRes.data || []).map(p => [p.user_id, p]));
      const assignMap = new Map((assignmentsRes.data || []).map(a => [a.id, a]));

      const enriched: TaskSubmission[] = subs.map(s => ({
        ...s,
        student_name: profileMap.get(s.student_id)?.display_name || "?",
        student_emoji: profileMap.get(s.student_id)?.avatar_emoji || "🌙",
        assignment_title: assignMap.get(s.assignment_id)?.title || "?",
      }));

      setSubmissions(enriched);
    } catch (err) {
      console.error("Fetch submissions error:", err);
    } finally {
      setLoading(false);
    }
  }, [classId, user]);

  useEffect(() => { fetchSubmissions(); }, [fetchSubmissions]);

  const reviewSubmission = useCallback(async (
    submissionId: string,
    status: "approved" | "rejected",
    note?: string
  ) => {
    if (!user) return;
    const { error } = await supabase
      .from("task_submissions")
      .update({
        status,
        teacher_note: note || null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", submissionId);
    if (error) throw error;
    await fetchSubmissions();
  }, [user, fetchSubmissions]);

  const getAudioUrl = useCallback(async (path: string) => {
    const { data } = await supabase.storage
      .from("student-audio")
      .createSignedUrl(path, 3600);
    return data?.signedUrl || null;
  }, []);

  return { submissions, loading, reviewSubmission, getAudioUrl, refresh: fetchSubmissions };
}
