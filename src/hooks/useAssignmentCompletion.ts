import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ClassAssignment } from "@/hooks/useTeacherDashboard";

const EVENT_MAP: Record<string, string> = {
  noorani: "noorani_lesson_completed",
  hifz: "hifz_task_completed",
  quiz: "kids_prayer_quiz_completed",
  prayer: "kids_prayer_quiz_completed",
};

export interface AssignmentWithStats extends ClassAssignment {
  completed: number;
  totalStudents: number;
  completionRate: number;
}

export function useAssignmentCompletion(
  assignments: ClassAssignment[],
  classId: string | null
) {
  const [assignmentsWithStats, setAssignmentsWithStats] = useState<AssignmentWithStats[]>([]);
  const [loading, setLoading] = useState(false);

  const compute = useCallback(async () => {
    if (!classId || assignments.length === 0) {
      setAssignmentsWithStats(assignments.map((a) => ({ ...a, completed: 0, totalStudents: 0, completionRate: 0 })));
      return;
    }

    setLoading(true);
    try {
      // Get member IDs
      const { data: members } = await supabase
        .from("classroom_members")
        .select("user_id")
        .eq("classroom_id", classId);
      const memberIds = (members || []).map((m) => m.user_id);
      if (memberIds.length === 0) {
        setAssignmentsWithStats(assignments.map((a) => ({ ...a, completed: 0, totalStudents: 0, completionRate: 0 })));
        setLoading(false);
        return;
      }

      const results: AssignmentWithStats[] = [];

      for (const a of assignments) {
        const eventType = EVENT_MAP[a.type];
        if (!eventType) {
          results.push({ ...a, completed: 0, totalStudents: memberIds.length, completionRate: 0 });
          continue;
        }

        const { data: events } = await supabase
          .from("app_events")
          .select("user_id, payload")
          .eq("event_type", eventType)
          .in("user_id", memberIds)
          .lte("created_at", a.due_date + "T23:59:59Z");

        const completedSet = new Set<string>();
        for (const ev of events || []) {
          // If assignment has a target value, check payload match
          const target = a.target as any;
          if (target?.value) {
            const payload = ev.payload as any;
            if (payload?.lessonId === target.value || payload?.surah === target.value || payload?.value === target.value) {
              completedSet.add(ev.user_id!);
            }
          } else {
            // No specific target — any matching event counts
            completedSet.add(ev.user_id!);
          }
        }

        const completed = completedSet.size;
        results.push({
          ...a,
          completed,
          totalStudents: memberIds.length,
          completionRate: memberIds.length > 0 ? Math.round((completed / memberIds.length) * 100) : 0,
        });
      }

      setAssignmentsWithStats(results);
    } catch (err) {
      console.error("Assignment completion error:", err);
      setAssignmentsWithStats(assignments.map((a) => ({ ...a, completed: 0, totalStudents: 0, completionRate: 0 })));
    } finally {
      setLoading(false);
    }
  }, [assignments, classId]);

  useEffect(() => { compute(); }, [compute]);

  return { assignmentsWithStats, loading };
}
