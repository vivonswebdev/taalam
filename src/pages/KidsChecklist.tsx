import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useKidsChecklist } from "@/hooks/useKidsChecklist";
import Confetti from "@/components/Confetti";

const DAY_NAMES_SHORT: Record<string, string[]> = {
  fr: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  nl: ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"],
  ar: ["أح", "إث", "ثل", "أر", "خم", "جم", "سب"],
  tr: ["Pzr", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"],
  ur: ["اتو", "پیر", "منگ", "بدھ", "جمع", "جمع", "ہفت"],
};

export default function KidsChecklist() {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const [dateOffset, setDateOffset] = useState(0);

  const selectedDate = new Date();
  selectedDate.setDate(selectedDate.getDate() + dateOffset);

  const {
    tasks, checkedIds, toggle, completedCount, totalCount, percent, streak, weekSummary,
  } = useKidsChecklist(selectedDate);

  const [showConfetti, setShowConfetti] = useState(false);
  const allDone = completedCount === totalCount;

  const handleToggle = (taskId: string) => {
    toggle(taskId);
    // Check if this completes all tasks
    const newCount = checkedIds.includes(taskId) ? completedCount - 1 : completedCount + 1;
    if (newCount === totalCount) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const isToday = dateOffset === 0;
  const dayNames = DAY_NAMES_SHORT[lang] || DAY_NAMES_SHORT.fr;

  const dateLabel = (() => {
    if (isToday) return t("kidsChecklist.today" as any);
    const d = selectedDate;
    return d.toLocaleDateString(lang === "ar" ? "ar-SA" : lang, { weekday: "short", day: "numeric", month: "short" });
  })();

  return (
    <div className="min-h-screen pb-24">
      {<Confetti active={showConfetti} />}

      {/* Header */}
      <div className="px-6 pt-14 pb-2">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
            <ArrowLeft size={18} className="text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span>🌙</span> {t("kidsChecklist.title" as any)}
            </h1>
            <p className="text-xs text-muted-foreground">{t("kidsChecklist.subtitle" as any)}</p>
          </div>
        </div>
      </div>

      {/* Date navigator */}
      <div className="px-5 mb-4">
        <div className="flex items-center justify-between bg-card border border-border rounded-2xl px-4 py-2.5">
          <button onClick={() => setDateOffset(o => o - 1)} className="p-1 rounded-lg hover:bg-muted">
            <ChevronLeft size={18} className="text-muted-foreground" />
          </button>
          <p className="text-sm font-semibold text-foreground">{dateLabel}</p>
          <button
            onClick={() => setDateOffset(o => Math.min(o + 1, 0))}
            disabled={isToday}
            className="p-1 rounded-lg hover:bg-muted disabled:opacity-30"
          >
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Streak & progress */}
      <div className="px-5 mb-4">
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔥</span>
              <span className="text-sm font-bold text-foreground">{streak} {t("kidsChecklist.dayStreak" as any)}</span>
            </div>
            <span className="text-sm font-bold text-primary">{percent}%</span>
          </div>
          {/* Progress bar with moon */}
          <div className="relative h-3 rounded-full bg-muted/50 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ type: "spring", damping: 20 }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
            {completedCount}/{totalCount} {t("kidsChecklist.completed" as any)}
          </p>
        </div>
      </div>

      {/* Week mini-calendar */}
      <div className="px-5 mb-4">
        <div className="flex justify-between gap-1">
          {weekSummary.map((day, i) => {
            const isSel = day.date === selectedDate.toISOString().slice(0, 10);
            const full = day.done === day.total && day.done > 0;
            const partial = day.done > 0 && !full;
            return (
              <button
                key={day.date}
                onClick={() => {
                  const diff = Math.round((new Date(day.date).getTime() - new Date().setHours(0,0,0,0)) / 86400000);
                  setDateOffset(diff);
                }}
                className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-colors ${
                  isSel ? "bg-primary/15 border border-primary/30" : "bg-card border border-border"
                }`}
              >
                <span className="text-[9px] text-muted-foreground">{dayNames[day.dayOfWeek]}</span>
                <span className="text-lg">
                  {full ? "⭐" : partial ? "🌙" : "·"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Task list */}
      <div className="px-5 space-y-2">
        {tasks.map((task, i) => {
          const checked = checkedIds.includes(task.id);
          return (
            <motion.button
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handleToggle(task.id)}
              className={`w-full flex items-center gap-3.5 rounded-2xl p-4 text-left transition-all active:scale-[0.98] border ${
                checked
                  ? "bg-primary/10 border-primary/25"
                  : "bg-card border-border"
              }`}
            >
              <span className="text-2xl shrink-0">{task.emoji}</span>
              <p className={`flex-1 text-sm font-medium ${checked ? "text-primary line-through" : "text-foreground"}`}>
                {t(task.labelKey as any)}
              </p>
              <AnimatePresence mode="wait">
                {checked ? (
                  <motion.span
                    key="check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="text-xl"
                  >
                    ✅
                  </motion.span>
                ) : (
                  <motion.div
                    key="circle"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 rounded-full border-2 border-muted-foreground/30"
                  />
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* All done message */}
      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="px-5 mt-4"
          >
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 text-center">
              <p className="text-2xl mb-1">🎉</p>
              <p className="text-sm font-bold text-foreground">{t("kidsChecklist.allDone" as any)}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{t("kidsChecklist.allDoneDesc" as any)}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
