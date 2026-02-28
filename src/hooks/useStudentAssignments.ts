import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface StudentAssignment {
  id: string;
  title: string;
  type: string;
  target: any;
  due_date: string;
  is_active: boolean;
  created_at: string;
  isNew: boolean;
}

export function useStudentAssignments(classId: string | null) {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!classId) return;
    setLoading(true);
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("class_assignments")
      .select("*")
      .eq("class_id", classId)
      .eq("is_active", true)
      .gte("due_date", today)
      .order("due_date", { ascending: true });

    setAssignments(
      (data || []).map((a: any) => ({
        ...a,
        isNew: !localStorage.getItem(`assignment_seen_${a.id}`),
      }))
    );
    setLoading(false);
  }, [classId]);

  useEffect(() => { fetch(); }, [fetch]);

  const markSeen = (id: string) => {
    localStorage.setItem(`assignment_seen_${id}`, new Date().toISOString());
    setAssignments((prev) => prev.map((a) => a.id === id ? { ...a, isNew: false } : a));
  };

  return { assignments, loading, markSeen };
}
