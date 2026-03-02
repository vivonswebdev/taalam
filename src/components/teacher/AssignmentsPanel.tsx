import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, ToggleLeft, ToggleRight, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { NOORANI_LESSONS } from "@/data/nooraniLessons";
import { toast } from "@/hooks/use-toast";
import type { AssignmentWithStats } from "@/hooks/useAssignmentCompletion";

interface Props {
  assignments: AssignmentWithStats[];
  createAssignment: (a: { title: string; type: string; target: any; due_date: string }) => Promise<void>;
  toggleAssignment: (id: string, isActive: boolean) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
}

export default function AssignmentsPanel({ assignments, createAssignment, toggleAssignment, deleteAssignment }: Props) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formType, setFormType] = useState("noorani");
  const [formTarget, setFormTarget] = useState("");
  const [formDueDate, setFormDueDate] = useState("");

  const activeAssignments = assignments.filter((a) => a.is_active && a.due_date >= new Date().toISOString().split("T")[0]);

  const handleCreate = async () => {
    if (!formTitle.trim() || !formDueDate) return;
    try {
      await createAssignment({
        title: formTitle.trim(),
        type: formType,
        target: formTarget ? JSON.parse(`{"value":"${formTarget}"}`) : {},
        due_date: formDueDate,
      });
      toast({ title: "✅ " + t("teacher.assignmentCreated" as any) });
      setFormTitle(""); setFormTarget(""); setFormDueDate(""); setShowForm(false);
    } catch (err: any) {
      toast({ title: t("common.error" as any), description: err.message, variant: "destructive" });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
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
          <input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder={t("teacher.assignmentTitle" as any)} className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none" />
          <select value={formType} onChange={(e) => setFormType(e.target.value)} className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none">
            <option value="noorani">Noorani</option>
            <option value="hifz">Hifz</option>
            <option value="prayer">Prière</option>
            <option value="quiz">Quiz</option>
            <option value="other">{t("teacher.other" as any)}</option>
          </select>
          {formType === "noorani" && (
            <select value={formTarget} onChange={(e) => setFormTarget(e.target.value)} className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none">
              <option value="">-- {t("teacher.selectLesson" as any)} --</option>
              {NOORANI_LESSONS.map((l) => <option key={l.id} value={l.id}>{l.emoji} {l.id}</option>)}
            </select>
          )}
          <input type="date" value={formDueDate} onChange={(e) => setFormDueDate(e.target.value)} className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none" />
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 py-2 text-sm rounded-lg bg-muted text-muted-foreground font-medium">{t("classrooms.cancel" as any)}</button>
            <button onClick={handleCreate} disabled={!formTitle.trim() || !formDueDate} className="flex-1 py-2 text-sm rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-50">{t("teacher.createBtn" as any)}</button>
          </div>
        </motion.div>
      )}

      {activeAssignments.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">{t("teacher.noAssignments" as any)}</p>
      ) : (
        <div className="space-y-2">
          {activeAssignments.map((a) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-xl p-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{a.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <Badge variant="secondary" className="text-[10px]">{a.type}</Badge>
                    <span className="text-[10px] text-muted-foreground">📅 {a.due_date}</span>
                  </div>
                  {typeof a.completed === "number" && typeof a.totalStudents === "number" && a.totalStudents > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <Progress value={a.completionRate} className="h-1.5 flex-1" />
                      <span className="text-[10px] font-semibold text-primary shrink-0">
                        ✅ {a.completed}/{a.totalStudents}
                      </span>
                    </div>
                  )}
                </div>
                <button onClick={() => toggleAssignment(a.id, a.is_active)} className="text-muted-foreground">
                  {a.is_active ? <ToggleRight size={20} className="text-primary" /> : <ToggleLeft size={20} />}
                </button>
                <button onClick={() => deleteAssignment(a.id)} className="text-destructive"><Trash2 size={16} /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
