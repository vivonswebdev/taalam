import { motion } from "framer-motion";
import { BookOpen, CheckCircle, Circle, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useHifzPlan, type HifzTask } from "@/hooks/useHifzPlan";
import { useLanguage } from "@/hooks/useLanguage";
import { surahs } from "@/data/surahs";
import { useMemo } from "react";

function computeHifzStreak(tasks: HifzTask[]): number {
  const completedByDate: Record<string, boolean> = {};
  for (const t of tasks) {
    if (t.is_completed) {
      completedByDate[t.task_date] = true;
    }
  }

  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    if (completedByDate[key]) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

function getLast7DaysHifz(tasks: HifzTask[]): { date: string; done: boolean; expected: boolean }[] {
  const tasksByDate: Record<string, { total: number; completed: number }> = {};
  for (const t of tasks) {
    if (!tasksByDate[t.task_date]) tasksByDate[t.task_date] = { total: 0, completed: 0 };
    tasksByDate[t.task_date].total++;
    if (t.is_completed) tasksByDate[t.task_date].completed++;
  }

  const result: { date: string; done: boolean; expected: boolean }[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const entry = tasksByDate[key];
    result.push({
      date: key,
      done: entry ? entry.completed > 0 : false,
      expected: entry ? entry.total > 0 : false,
    });
  }
  return result;
}

export default function HifzHabitCard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { plan, tasks, todayTasks, overallProgress } = useHifzPlan();

  const hifzStreak = useMemo(() => computeHifzStreak(tasks), [tasks]);
  const last7 = useMemo(() => getLast7DaysHifz(tasks), [tasks]);
  const todayDone = todayTasks.some((t) => t.is_completed);
  const todayCount = todayTasks.length;
  const todayCompleted = todayTasks.filter((t) => t.is_completed).length;

  const dayLabels = ["L", "M", "M", "J", "V", "S", "D"];

  if (!plan) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-primary" />
            <span className="text-sm font-semibold text-foreground">{t("hifz.habitTitle" as any)}</span>
          </div>
          <button
            onClick={() => navigate("/hifz-plan")}
            className="text-xs text-primary font-medium flex items-center gap-1"
          >
            {t("hifz.createPlan" as any)} <ChevronRight size={14} />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">{t("hifz.noPlanYet" as any)}</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-4 space-y-3"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen size={18} className="text-primary" />
          <span className="text-sm font-semibold text-foreground">{t("hifz.habitTitle" as any)}</span>
        </div>
        <button
          onClick={() => navigate("/hifz-plan")}
          className="text-xs text-primary font-medium flex items-center gap-1"
        >
          {t("hifz.managePlan" as any)} <ChevronRight size={14} />
        </button>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">{plan.name}</span>
          <span className="text-xs font-bold text-foreground">{overallProgress}%</span>
        </div>
        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${overallProgress >= 100 ? "bg-success" : "bg-primary"}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(overallProgress, 100)}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Today tasks + streak */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {todayDone ? (
            <CheckCircle size={16} className="text-success" />
          ) : (
            <Circle size={16} className="text-muted-foreground" />
          )}
          <span className="text-xs text-foreground">
            {todayCompleted}/{todayCount} {t("hifz.habitToday" as any)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm">🔥</span>
          <span className="text-xs font-bold text-foreground">{hifzStreak}</span>
          <span className="text-[10px] text-muted-foreground">{t("hifz.streakDays" as any)}</span>
        </div>
      </div>

      {/* 7-day mini history */}
      <div className="flex items-center gap-1.5 justify-between">
        {last7.map((day, i) => (
          <div key={day.date} className="flex flex-col items-center gap-1">
            <span className="text-[9px] text-muted-foreground">
              {dayLabels[new Date(day.date + "T12:00:00").getDay() === 0 ? 6 : new Date(day.date + "T12:00:00").getDay() - 1]}
            </span>
            <div
              className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] ${
                day.done
                  ? "bg-primary text-primary-foreground"
                  : day.expected
                    ? "bg-destructive/20 text-destructive"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {day.done ? "✓" : day.expected ? "✗" : "–"}
            </div>
          </div>
        ))}
      </div>

      {/* Today's task list (compact) */}
      {todayTasks.length > 0 && (
        <div className="space-y-1 pt-1 border-t border-border">
          {todayTasks.slice(0, 3).map((task) => {
            const surah = surahs.find((s) => s.number === task.surah_number);
            return (
              <div
                key={task.id}
                className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg ${
                  task.is_completed ? "bg-success/10 text-success" : "bg-muted/50 text-foreground"
                }`}
              >
                {task.is_completed ? <CheckCircle size={12} /> : <Circle size={12} className="text-muted-foreground" />}
                <span className="font-arabic text-sm">{surah?.nameArabic}</span>
                <span className="text-muted-foreground">
                  {task.ayah_from}–{task.ayah_to}
                </span>
                <span
                  className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full ${
                    task.task_type === "review" ? "bg-secondary/20 text-secondary" : "bg-primary/20 text-primary"
                  }`}
                >
                  {task.task_type === "review" ? t("hifz.review" as any) : t("hifz.new" as any)}
                </span>
              </div>
            );
          })}
          {todayTasks.length > 3 && (
            <p className="text-[10px] text-muted-foreground text-center">
              +{todayTasks.length - 3} {t("hifz.moreTasks" as any)}
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
}
