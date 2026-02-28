import { motion } from "framer-motion";
import { Clock, BookOpen, Flame, TrendingUp, Calendar } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { usePersonalStats } from "@/hooks/usePersonalStats";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, AreaChart, Area, Tooltip } from "recharts";

function StatKpiCard({ icon, label, value, subLabel }: { icon: React.ReactNode; label: string; value: string | number; subLabel?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card border border-border rounded-2xl p-3 text-center"
    >
      <div className="flex justify-center mb-1">{icon}</div>
      <p className="text-xl font-bold text-foreground">{value}</p>
      <p className="text-[9px] text-muted-foreground leading-tight">{label}</p>
      {subLabel && <p className="text-[8px] text-muted-foreground/70 mt-0.5">{subLabel}</p>}
    </motion.div>
  );
}

export default function PersonalStatsDashboard() {
  const { t } = useLanguage();
  const stats = usePersonalStats();

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-2">
        <StatKpiCard
          icon={<Clock size={18} className="text-primary" />}
          label={t("stats.quranWeek" as any)}
          value={stats.quranMinutesWeek}
          subLabel="min"
        />
        <StatKpiCard
          icon={<BookOpen size={18} className="text-secondary" />}
          label={t("stats.hifzMonth" as any)}
          value={stats.hifzAyatMonth}
          subLabel="āyāt"
        />
        <StatKpiCard
          icon={<Flame size={18} className="text-destructive" />}
          label={t("stats.streakDays" as any)}
          value={stats.streakDays}
        />
      </div>

      {/* Quran Time Chart - 30 days */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-2xl p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={18} className="text-primary" />
          <span className="text-sm font-semibold text-foreground">{t("stats.quranTime30" as any)}</span>
        </div>
        <ResponsiveContainer width="100%" height={120}>
          <AreaChart data={stats.quranTimeData}>
            <defs>
              <linearGradient id="quranGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" tick={{ fontSize: 8 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis hide />
            <Tooltip
              contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }}
              labelStyle={{ color: "hsl(var(--muted-foreground))" }}
              formatter={(value: number) => [`${value} min`, ""]}
            />
            <Area type="monotone" dataKey="minutes" stroke="hsl(var(--primary))" fill="url(#quranGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
        <p className="text-[11px] text-muted-foreground mt-2 text-center">
          {(t("stats.quranAverage" as any) as string).replace("{minutes}", String(stats.avgMinutesPerDay))}
        </p>
      </motion.div>

      {/* Hifz Progress Chart */}
      {stats.hasPlan && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={18} className="text-secondary" />
            <span className="text-sm font-semibold text-foreground">{t("hifz.habitTitle" as any)}</span>
          </div>
          {/* Overall progress bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">{t("stats.hifzOverall" as any)}</span>
              <span className="font-bold text-foreground">{stats.overallProgress}%</span>
            </div>
            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-secondary"
                initial={{ width: 0 }}
                animate={{ width: `${stats.overallProgress}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>
          {/* Weekly bars */}
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={stats.hifzWeeklyData}>
              <XAxis dataKey="week" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis hide domain={[0, 100]} />
              <Bar dataKey="percent" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          {stats.projectionDays !== null && (
            <p className="text-[11px] text-muted-foreground mt-2 text-center">
              {(t("stats.hifzProjection" as any) as string).replace("{days}", String(stats.projectionDays))}
            </p>
          )}
        </motion.div>
      )}

      {/* Enhanced Heatmap */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-card border border-border rounded-2xl p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={18} className="text-primary" />
          <span className="text-sm font-semibold text-foreground">{t("stats.heatmapTitle" as any)}</span>
        </div>
        <div className="space-y-2">
          <div className="grid grid-cols-7 gap-1">
            {["L", "M", "M", "J", "V", "S", "D"].map((l, i) => (
              <span key={i} className="text-[9px] text-muted-foreground text-center font-medium">{l}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {stats.heatmapData.map((d, i) => {
              const intensity = d.score === 0 ? "bg-muted"
                : d.score < 5 ? "bg-primary/20"
                : d.score < 15 ? "bg-primary/40"
                : d.score < 30 ? "bg-primary/60"
                : "bg-primary";
              return (
                <motion.div
                  key={d.date}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.01 }}
                  className={`aspect-square rounded-md ${intensity} transition-colors`}
                  title={`${d.date}: ${d.minutes}min, ${d.ayat} ayat, ${d.hifzDone}/${d.hifzTotal} hifz`}
                />
              );
            })}
          </div>
          <div className="flex items-center justify-end gap-1 text-[9px] text-muted-foreground">
            <span>-</span>
            <div className="w-3 h-3 rounded-sm bg-muted" />
            <div className="w-3 h-3 rounded-sm bg-primary/20" />
            <div className="w-3 h-3 rounded-sm bg-primary/40" />
            <div className="w-3 h-3 rounded-sm bg-primary/60" />
            <div className="w-3 h-3 rounded-sm bg-primary" />
            <span>+</span>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 text-center leading-relaxed">
          {t("stats.heatmapLegend" as any)}
        </p>
      </motion.div>
    </div>
  );
}
