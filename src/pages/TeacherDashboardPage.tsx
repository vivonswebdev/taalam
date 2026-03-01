import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useTeacherDashboard } from "@/hooks/useTeacherDashboard";
import { useAssignmentCompletion } from "@/hooks/useAssignmentCompletion";
import { useTaskSubmissions } from "@/hooks/useTaskSubmissions";
import { supabase } from "@/integrations/supabase/client";
import TeacherHeader from "@/components/teacher/TeacherHeader";
import TeacherSummaryCards from "@/components/teacher/TeacherSummaryCards";
import StudentsList from "@/components/teacher/StudentsList";
import AssignmentsPanel from "@/components/teacher/AssignmentsPanel";
import TaskKanban from "@/components/teacher/TaskKanban";
import TeacherStatsSection from "@/components/TeacherStatsSection";

interface TeacherClass {
  id: string;
  name: string;
  join_code: string;
}

export default function TeacherDashboardPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();

  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const { students, assignments, loading, summary, createAssignment, toggleAssignment, deleteAssignment } = useTeacherDashboard(selectedClassId);
  const { assignmentsWithStats } = useAssignmentCompletion(assignments, selectedClassId);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("classrooms")
        .select("id, name, join_code")
        .eq("teacher_id", user.id);
      const list = (data || []) as TeacherClass[];
      setClasses(list);
      if (list.length > 0 && !selectedClassId) setSelectedClassId(list[0].id);
    })();
  }, [user]);

  if (authLoading) return <div className="flex items-center justify-center min-h-screen"><span className="animate-spin text-2xl">⏳</span></div>;

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <GraduationCap size={48} className="text-muted-foreground" />
        <p className="text-lg font-semibold">{t("teacher.loginRequired" as any)}</p>
        <button onClick={() => navigate("/auth")} className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-semibold">
          {t("more.loginProfile" as any)}
        </button>
      </div>
    );
  }

  if (classes.length === 0 && !authLoading) {
    return (
      <div className="min-h-screen pb-24">
        <TeacherHeader />
        <div className="flex flex-col items-center justify-center gap-4 px-6 pt-20 text-center">
          <GraduationCap size={48} className="text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{t("teacher.noClasses" as any)}</p>
          <button onClick={() => navigate("/classrooms")} className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-semibold text-sm">
            {t("teacher.createClass" as any)}
          </button>
        </div>
      </div>
    );
  }

  const selectedClass = classes.find(c => c.id === selectedClassId);

  return (
    <div className="min-h-screen pb-24">
      <TeacherHeader />

      {/* Class selector */}
      <div className="px-4 py-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {classes.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedClassId(c.id)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                selectedClassId === c.id
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
        {selectedClass && (
          <p className="text-[10px] text-muted-foreground mt-1.5 px-1">
            Code: <span className="font-mono font-semibold text-foreground">{selectedClass.join_code}</span>
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><span className="animate-spin text-2xl">⏳</span></div>
      ) : (
        <div className="px-4 space-y-5">
          <TeacherSummaryCards
            totalStudents={summary.totalStudents}
            avgQuranMinutes={summary.avgQuranMinutes}
            avgHifzAyat={summary.avgHifzAyat}
            totalQuizzes={summary.totalQuizzes}
          />

          <StudentsList students={students} />

          <AssignmentsPanel
            assignments={assignmentsWithStats}
            createAssignment={createAssignment}
            toggleAssignment={toggleAssignment}
            deleteAssignment={deleteAssignment}
          />

          <TeacherStatsSection students={students} assignments={assignmentsWithStats} />
        </div>
      )}
    </div>
  );
}
