import { useState } from "react";
import { motion } from "framer-motion";
import { Flame, BookOpen, Clock, Target, ChevronLeft, TrendingUp, Award } from "lucide-react";
import { useQuranHabits, type GoalType } from "@/hooks/useQuranHabits";
import { useLanguage } from "@/hooks/useLanguage";
import { useNavigate } from "react-router-dom";

const GOAL_PRESETS: { type: GoalType; target: number; label: string; icon: string }[] = [
  { type: "minutes", target: 10, label: "10 min", icon: "⏱️" },
  { type: "minutes", target: 15, label: "15 min", icon: "⏱️" },
  { type: "minutes", target: 30, label: "30 min", icon: "⏱️" },
  { type: "ayat", target: 10, label: "10 ayat", icon: "📖" },
  { type: "ayat", target: 20, label: "20 ayat", icon: "📖" },
  { type: "ayat", target: 50, label: "50 ayat", icon: "📖" },
];

function HeatmapGrid({ days }: { days: { date: string; minutes_quran: number; ayat_recited: number }[] }) {
  const getIntensity = (d: typeof days[0]) => {
    const score = d.minutes_quran + d.ayat_recited;
    if (score === 0) return "bg-muted";
    if (score < 5) return "bg-primary/20";
    if (score < 15) return "bg-primary/40";
    if (score < 30) return "bg-primary/60";
    return "bg-primary";
  };

  const dayLabels = ["L", "M", "M", "J", "V", "S", "D"];

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-7 gap-1">
        {dayLabels.map((l, i) => (
          <span key={i} className="text-[9px] text-muted-foreground text-center font-medium">{l}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => (
          <motion.div
            key={d.date}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.015 }}
            className={`aspect-square rounded-md ${getIntensity(d)} transition-colors`}
            title={`${d.date}: ${d.minutes_quran}min, ${d.ayat_recited} ayat`}
          />
        ))}
      </div>
      <div className="flex items-center justify-end gap-1 text-[9px] text-muted-foreground">
        <span>Moins</span>
        <div className="w-3 h-3 rounded-sm bg-muted" />
        <div className="w-3 h-3 rounded-sm bg-primary/20" />
        <div className="w-3 h-3 rounded-sm bg-primary/40" />
        <div className="w-3 h-3 rounded-sm bg-primary/60" />
        <div className="w-3 h-3 rounded-sm bg-primary" />
        <span>Plus</span>
      </div>
    </div>
  );
}

export default function Habits() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { today, streak, last30Days, goal, setGoal, goalProgress, isAuthenticated } = useQuranHabits();
  const [showGoalPicker, setShowGoalPicker] = useState(false);

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="px-6 pt-14 pb-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
          <ChevronLeft size={16} /> {t("detail.back")}
        </button>
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold text-foreground">
          📊 Habitudes Qur'an
        </motion.h1>
        <p className="text-sm text-muted-foreground mt-1">Suis ta progression quotidienne</p>
      </div>

      <div className="px-6 space-y-4">
        {/* Today Stats */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-3 gap-3">
          <div className="bg-card border border-border rounded-2xl p-4 text-center">
            <Clock size={20} className="mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold text-foreground">{today.minutes_quran}</p>
            <p className="text-[10px] text-muted-foreground">minutes</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 text-center">
            <BookOpen size={20} className="mx-auto text-secondary mb-1" />
            <p className="text-2xl font-bold text-foreground">{today.ayat_recited}</p>
            <p className="text-[10px] text-muted-foreground">ayat</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 text-center">
            <Flame size={20} className="mx-auto text-destructive mb-1" />
            <p className="text-2xl font-bold text-foreground">{streak}</p>
            <p className="text-[10px] text-muted-foreground">jours</p>
          </div>
        </motion.div>

        {/* Goal Progress */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target size={18} className="text-primary" />
              <span className="text-sm font-semibold text-foreground">Objectif quotidien</span>
            </div>
            <button onClick={() => setShowGoalPicker(!showGoalPicker)} className="text-xs text-primary font-medium">
              {showGoalPicker ? "Fermer" : "Modifier"}
            </button>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${goalProgress.percent >= 100 ? "bg-success" : "bg-primary"}`}
                initial={{ width: 0 }}
                animate={{ width: `${goalProgress.percent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <span className="text-sm font-bold text-foreground min-w-[60px] text-right">
              {goalProgress.current}/{goalProgress.target}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {goal.type === "minutes" ? "minutes de Qur'an" : "ayat récitées"} ·{" "}
            {goalProgress.percent >= 100 ? (
              <span className="text-success font-semibold">✅ Objectif atteint !</span>
            ) : (
              `${goalProgress.percent}%`
            )}
          </p>

          {/* Goal picker */}
          {showGoalPicker && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-4 pt-3 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground mb-2">Choisis ton objectif :</p>
              <div className="grid grid-cols-3 gap-2">
                {GOAL_PRESETS.map((preset) => (
                  <button
                    key={`${preset.type}-${preset.target}`}
                    onClick={() => { setGoal({ type: preset.type, target: preset.target }); setShowGoalPicker(false); }}
                    className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border-2 transition-colors text-xs font-medium ${
                      goal.type === preset.type && goal.target === preset.target
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-accent/50 text-foreground"
                    }`}
                  >
                    <span>{preset.icon}</span>
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Heatmap */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={18} className="text-primary" />
            <span className="text-sm font-semibold text-foreground">30 derniers jours</span>
          </div>
          <HeatmapGrid days={last30Days} />
        </motion.div>

        {/* Weekly summary */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Award size={18} className="text-secondary" />
            <span className="text-sm font-semibold text-foreground">Résumé de la semaine</span>
          </div>
          {(() => {
            const last7 = last30Days.slice(-7);
            const totalMin = last7.reduce((s, d) => s + d.minutes_quran, 0);
            const totalAyat = last7.reduce((s, d) => s + d.ayat_recited, 0);
            const activeDays = last7.filter((d) => d.minutes_quran > 0 || d.ayat_recited > 0).length;
            return (
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-lg font-bold text-foreground">{totalMin}</p>
                  <p className="text-[10px] text-muted-foreground">minutes</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{totalAyat}</p>
                  <p className="text-[10px] text-muted-foreground">ayat</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{activeDays}/7</p>
                  <p className="text-[10px] text-muted-foreground">jours actifs</p>
                </div>
              </div>
            );
          })()}
        </motion.div>

        {/* Cloud sync hint */}
        {!isAuthenticated && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="bg-primary/5 border border-primary/10 rounded-2xl p-4 text-center">
            <p className="text-xs text-muted-foreground">
              📱 Connecte-toi pour synchroniser tes habitudes entre appareils
            </p>
            <button onClick={() => navigate("/auth")} className="mt-2 text-xs font-semibold text-primary">
              Se connecter →
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
