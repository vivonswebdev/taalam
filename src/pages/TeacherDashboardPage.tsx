import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, GraduationCap, Users, BookOpen, Brain, Clock, Trophy, Plus, Trash2, ToggleLeft, ToggleRight, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useTeacherDashboard } from "@/hooks/useTeacherDashboard";
import { useAssignmentCompletion } from "@/hooks/useAssignmentCompletion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { NOORANI_LESSONS } from "@/data/nooraniLessons";
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

  // Assignment form
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formType, setFormType] = useState("noorani");
  const [formTarget, setFormTarget] = useState("");
  const [formDueDate, setFormDueDate] = useState("");

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
        <Header navigate={navigate} t={t} />
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

  const activeAssignments = assignmentsWithStats.filter((a) => a.is_active && a.due_date >= new Date().toISOString().split("T")[0]);

  const handleCreateAssignment = async () => {
    if (!formTitle.trim() || !formDueDate) return;
    try {
      await createAssignment({
        title: formTitle.trim(),
        type: formType,
        target: formTarget ? JSON.parse(`{"value":"${formTarget}"}`) : {},
        due_date: formDueDate,
      });
      toast({ title: "✅ " + t("teacher.assignmentCreated" as any) });
      setFormTitle("");
      setFormTarget("");
      setFormDueDate("");
      setShowForm(false);
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <Header navigate={navigate} t={t} />

      {/* Class selector */}
      <div className="px-4 py-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {classes.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedClassId(c.id)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                selectedClassId === c.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><span className="animate-spin text-2xl">⏳</span></div>
      ) : (
        <div className="px-4 space-y-5">
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3">
            <SummaryCard icon={<Users size={18} className="text-primary" />} label={t("teacher.students" as any)} value={String(summary.totalStudents)} />
            <SummaryCard icon={<Clock size={18} className="text-green-500" />} label={t("teacher.avgQuran7d" as any)} value={`${summary.avgQuranMinutes} min`} />
            <SummaryCard icon={<Brain size={18} className="text-purple-500" />} label={t("teacher.avgHifz7d" as any)} value={`${summary.avgHifzAyat} āyāt`} />
            <SummaryCard icon={<Trophy size={18} className="text-amber-500" />} label={t("teacher.totalQuizzes" as any)} value={String(summary.totalQuizzes)} />
          </div>

          {/* Student table */}
          <div>
            <p className="text-sm font-bold mb-2">{t("teacher.studentProgress" as any)}</p>
            {students.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">{t("teacher.noStudents" as any)}</p>
            ) : (
              <div className="space-y-2">
                {students.map((s) => (
                  <motion.div
                    key={s.userId}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border rounded-xl p-3"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{s.avatarEmoji}</span>
                      <span className="text-sm font-semibold flex-1 truncate">{s.displayName}</span>
                      <Badge variant="outline" className="text-[10px]">🔥 {s.streakDays}j</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <MiniStat label="Qur'an" value={`${s.quranMinutes}m`} />
                      <MiniStat label="Hifz" value={`${s.hifzAyat} āyāt`} />
                      <MiniStat label="Quiz" value={String(s.quizCompleted)} />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Assignments */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold">{t("teacher.assignments" as any)}</p>
              <div className="flex items-center gap-2">
                <button onClick={() => navigate("/assignments-tutorial")} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center" title={t("tuto.pageTitle" as any)}>
                  <HelpCircle size={14} className="text-muted-foreground" />
                </button>
                <button onClick={() => setShowForm(!showForm)} className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {showForm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-card border border-border rounded-xl p-4 space-y-3 mb-3">
                <input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder={t("teacher.assignmentTitle" as any)}
                  className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none"
                />
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none"
                >
                  <option value="noorani">Noorani</option>
                  <option value="hifz">Hifz</option>
                  <option value="prayer">Prière</option>
                  <option value="quiz">Quiz</option>
                  <option value="other">{t("teacher.other" as any)}</option>
                </select>

                {formType === "noorani" && (
                  <select value={formTarget} onChange={(e) => setFormTarget(e.target.value)} className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none">
                    <option value="">-- {t("teacher.selectLesson" as any)} --</option>
                    {NOORANI_LESSONS.map((l) => (
                      <option key={l.id} value={l.id}>{l.emoji} {l.id}</option>
                    ))}
                  </select>
                )}

                <input
                  type="date"
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                  className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none"
                />
                <div className="flex gap-2">
                  <button onClick={() => setShowForm(false)} className="flex-1 py-2 text-sm rounded-lg bg-muted text-muted-foreground font-medium">
                    {t("classrooms.cancel" as any)}
                  </button>
                  <button onClick={handleCreateAssignment} disabled={!formTitle.trim() || !formDueDate} className="flex-1 py-2 text-sm rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-50">
                    {t("teacher.createBtn" as any)}
                  </button>
                </div>
              </motion.div>
            )}

            {activeAssignments.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">{t("teacher.noAssignments" as any)}</p>
            ) : (
              <div className="space-y-2">
                {activeAssignments.map((a) => (
                  <div key={a.id} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{a.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <Badge variant="secondary" className="text-[10px]">{a.type}</Badge>
                        <span className="text-[10px] text-muted-foreground">📅 {a.due_date}</span>
                        {typeof a.completed === "number" && typeof a.totalStudents === "number" && (
                          <span className="text-[10px] font-semibold text-primary">
                            ✅ {a.completed}/{a.totalStudents}
                          </span>
                        )}
                      </div>
                    </div>
                    <button onClick={() => toggleAssignment(a.id, a.is_active)} className="text-muted-foreground">
                      {a.is_active ? <ToggleRight size={20} className="text-primary" /> : <ToggleLeft size={20} />}
                    </button>
                    <button onClick={() => deleteAssignment(a.id)} className="text-destructive">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Class Stats Section */}
          <TeacherStatsSection students={students} assignments={assignmentsWithStats} />
        </div>
      )}
    </div>
  );
}

function Header({ navigate, t }: { navigate: any; t: any }) {
  return (
    <div className="flex items-center gap-3 px-4 py-4 border-b border-border bg-card">
      <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
        <ArrowLeft size={18} />
      </button>
      <div className="flex-1">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <GraduationCap size={20} className="text-primary" />
          {t("teacher.title" as any)}
        </h1>
        <p className="text-xs text-muted-foreground">{t("teacher.subtitle" as any)}</p>
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-3 text-center">
      <div className="flex justify-center mb-1">{icon}</div>
      <p className="text-lg font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted rounded-lg py-1.5">
      <p className="text-xs font-bold text-foreground">{value}</p>
      <p className="text-[9px] text-muted-foreground">{label}</p>
    </div>
  );
}
