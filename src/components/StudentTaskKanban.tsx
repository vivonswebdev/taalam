import { motion } from "framer-motion";
import { BookOpen, RefreshCw, Mic, MoreHorizontal, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useMyTasks } from "@/hooks/useStudentTasks";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

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

export default function StudentTaskKanban() {
  const { t } = useLanguage();
  const { pendingTasks, completedTasks, loading, completeTask } = useMyTasks();
  const [viewMode, setViewMode] = useState<"pending" | "completed">("pending");
  const [completing, setCompleting] = useState<string | null>(null);

  const displayTasks = viewMode === "pending" ? pendingTasks : completedTasks;

  const handleComplete = async (taskId: string) => {
    setCompleting(taskId);
    await completeTask(taskId);
    setCompleting(null);
  };

  if (loading) {
    return <div className="flex justify-center py-8"><span className="animate-spin text-2xl">⏳</span></div>;
  }

  if (pendingTasks.length === 0 && completedTasks.length === 0) {
    return null; // Don't show section if no tasks
  }

  return (
    <div className="px-4 mb-5">
      <p className="text-sm font-bold mb-3">{t("tasks.myTasks" as any)}</p>

      {/* Tabs */}
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

      {displayTasks.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">
          {viewMode === "pending" ? t("tasks.noPending" as any) : t("tasks.noCompleted" as any)}
        </p>
      ) : (
        <div className="space-y-2">
          {displayTasks.map((task, i) => {
            const Icon = TASK_TYPE_ICONS[task.task_type] || MoreHorizontal;
            const isCompleting = completing === task.id;
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-card border border-border rounded-xl p-3"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold">{task.title}</span>
                      <Badge variant="outline" className={`text-[9px] ${TASK_TYPE_COLORS[task.task_type]}`}>
                        <Icon size={9} className="mr-0.5" />
                        {t(`tasks.type_${task.task_type}` as any)}
                      </Badge>
                    </div>
                    {task.description && <p className="text-[10px] text-muted-foreground mt-1">{task.description}</p>}
                    <div className="flex items-center gap-3 mt-1">
                      {task.due_date && <span className="text-[9px] text-muted-foreground">📅 {task.due_date}</span>}
                      {task.completed_at && <span className="text-[9px] text-emerald-600">✅ {new Date(task.completed_at).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  {viewMode === "pending" && (
                    <button
                      onClick={() => handleComplete(task.id)}
                      disabled={isCompleting}
                      className="shrink-0 p-2 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                    >
                      {isCompleting ? (
                        <span className="animate-spin text-sm">⏳</span>
                      ) : (
                        <CheckCircle2 size={18} />
                      )}
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
