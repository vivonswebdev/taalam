import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, BookOpen, RefreshCw, Mic, MoreHorizontal, ChevronDown } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useStudentTasks } from "@/hooks/useStudentTasks";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { surahs as SURAHS } from "@/data/surahs";

const TASK_TYPE_ICONS: Record<string, any> = {
  hifz: BookOpen,
  revision: RefreshCw,
  recitation: Mic,
  other: MoreHorizontal,
};

const TASK_TYPE_COLORS: Record<string, string> = {
  hifz: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  revision: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  recitation: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  other: "bg-muted text-muted-foreground border-border",
};

interface Props {
  classId: string | null;
  students: { userId: string; displayName: string; avatarEmoji: string }[];
}

export default function StudentTaskBoard({ classId, students }: Props) {
  const { t } = useLanguage();
  const { tasks, loading, createTask, deleteTask } = useStudentTasks(classId);
  const [showForm, setShowForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [taskType, setTaskType] = useState("hifz");
  const [surahNum, setSurahNum] = useState("");
  const [ayahFrom, setAyahFrom] = useState("");
  const [ayahTo, setAyahTo] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [viewMode, setViewMode] = useState<"pending" | "completed">("pending");

  const pendingTasks = tasks.filter(t => t.status === "pending");
  const completedTasks = tasks.filter(t => t.status === "completed");
  const displayTasks = viewMode === "pending" ? pendingTasks : completedTasks;

  const handleCreate = async () => {
    if (!selectedStudent || !title.trim()) return;
    try {
      const surah = SURAHS.find(s => s.number === Number(surahNum));
      const finalTitle = (taskType === "hifz" || taskType === "revision") && surah
        ? `${taskType === "hifz" ? "📗" : "🔄"} ${surah.nameArabic} ${ayahFrom ? `(${ayahFrom}-${ayahTo || ayahFrom})` : ""}`
        : title.trim();

      await createTask({
        student_id: selectedStudent,
        title: finalTitle,
        task_type: taskType,
        surah_number: surahNum ? Number(surahNum) : undefined,
        ayah_from: ayahFrom ? Number(ayahFrom) : undefined,
        ayah_to: ayahTo ? Number(ayahTo) : undefined,
        description: description || undefined,
        due_date: dueDate || undefined,
      });
      toast({ title: `✅ ${t("tasks.created" as any)}` });
      setTitle(""); setDescription(""); setSurahNum(""); setAyahFrom(""); setAyahTo(""); setDueDate(""); setShowForm(false);
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  };

  const autoTitle = () => {
    if ((taskType === "hifz" || taskType === "revision") && surahNum) {
      const surah = SURAHS.find(s => s.number === Number(surahNum));
      if (surah) {
        setTitle(`${taskType === "hifz" ? "📗" : "🔄"} ${surah.nameArabic} ${ayahFrom ? `(${ayahFrom}-${ayahTo || ayahFrom})` : ""}`);
      }
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold">{t("tasks.title" as any)}</p>
        <button onClick={() => setShowForm(!showForm)} className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
          <Plus size={16} />
        </button>
      </div>

      {/* Kanban tabs */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setViewMode("pending")}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
            viewMode === "pending"
              ? "bg-amber-500/15 text-amber-600 border border-amber-500/30"
              : "bg-muted text-muted-foreground"
          }`}
        >
          ⏳ {t("tasks.pending" as any)} ({pendingTasks.length})
        </button>
        <button
          onClick={() => setViewMode("completed")}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
            viewMode === "completed"
              ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
              : "bg-muted text-muted-foreground"
          }`}
        >
          ✅ {t("tasks.completed" as any)} ({completedTasks.length})
        </button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-3"
          >
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              {/* Student picker */}
              <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none">
                <option value="">-- {t("tasks.selectStudent" as any)} --</option>
                {students.map(s => (
                  <option key={s.userId} value={s.userId}>{s.avatarEmoji} {s.displayName}</option>
                ))}
              </select>

              {/* Task type */}
              <div className="flex gap-2">
                {["hifz", "revision", "recitation", "other"].map(type => {
                  const Icon = TASK_TYPE_ICONS[type];
                  return (
                    <button
                      key={type}
                      onClick={() => { setTaskType(type); }}
                      className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-semibold border transition-all ${
                        taskType === type ? TASK_TYPE_COLORS[type] : "bg-muted text-muted-foreground border-transparent"
                      }`}
                    >
                      <Icon size={12} />
                      {t(`tasks.type_${type}` as any)}
                    </button>
                  );
                })}
              </div>

              {/* Surah picker for hifz/revision */}
              {(taskType === "hifz" || taskType === "revision") && (
                <>
                  <select
                    value={surahNum}
                    onChange={(e) => { setSurahNum(e.target.value); }}
                    className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none"
                  >
                    <option value="">-- {t("tasks.selectSurah" as any)} --</option>
                    {SURAHS.map(s => (
                      <option key={s.number} value={s.number}>{s.number}. {s.nameArabic} - {s.name}</option>
                    ))}
                  </select>
                  {surahNum && (
                    <div className="flex gap-2">
                      <input
                        type="number" min="1" placeholder={t("tasks.ayahFrom" as any)}
                        value={ayahFrom} onChange={(e) => setAyahFrom(e.target.value)}
                        onBlur={autoTitle}
                        className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm outline-none"
                      />
                      <input
                        type="number" min="1" placeholder={t("tasks.ayahTo" as any)}
                        value={ayahTo} onChange={(e) => setAyahTo(e.target.value)}
                        onBlur={autoTitle}
                        className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm outline-none"
                      />
                    </div>
                  )}
                </>
              )}

              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("tasks.taskTitle" as any)} className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none" />
              <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("tasks.descriptionOpt" as any)} className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none" />
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none" />

              <div className="flex gap-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2 text-sm rounded-lg bg-muted text-muted-foreground font-medium">
                  {t("classrooms.cancel" as any)}
                </button>
                <button onClick={handleCreate} disabled={!selectedStudent || !title.trim()} className="flex-1 py-2 text-sm rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-50">
                  {t("tasks.assign" as any)}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task list */}
      {displayTasks.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-6">
          {viewMode === "pending" ? t("tasks.noPending" as any) : t("tasks.noCompleted" as any)}
        </p>
      ) : (
        <div className="space-y-2">
          {displayTasks.map((task, i) => {
            const Icon = TASK_TYPE_ICONS[task.task_type] || MoreHorizontal;
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-card border border-border rounded-xl p-3"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">{task.student_emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold truncate">{task.title}</span>
                      <Badge variant="outline" className={`text-[9px] ${TASK_TYPE_COLORS[task.task_type]}`}>
                        <Icon size={9} className="mr-0.5" />
                        {t(`tasks.type_${task.task_type}` as any)}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{task.student_name}</p>
                    {task.description && <p className="text-[10px] text-muted-foreground mt-0.5">{task.description}</p>}
                    {task.due_date && (
                      <span className="text-[9px] text-muted-foreground">📅 {task.due_date}</span>
                    )}
                    {task.completed_at && (
                      <span className="text-[9px] text-emerald-600 ml-2">✅ {new Date(task.completed_at).toLocaleDateString()}</span>
                    )}
                  </div>
                  {viewMode === "pending" && (
                    <button onClick={() => deleteTask(task.id)} className="text-destructive shrink-0 mt-1">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
