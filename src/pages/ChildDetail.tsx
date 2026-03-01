import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, BookOpen, Clock, FileText, Calendar, Activity, Flame, Star,
} from "lucide-react";
import { useChildProfiles } from "@/hooks/useChildProfiles";
import { useChildDashboard } from "@/hooks/useChildDashboard";
import { useLanguage } from "@/hooks/useLanguage";
import { surahs } from "@/data/surahs";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

// ─── Color helpers ──────────────────────────────────────────
function getColor(m: number): "green" | "orange" | "red" {
  if (m >= 70) return "green";
  if (m >= 40) return "orange";
  return "red";
}
function cc(c: "green" | "orange" | "red") {
  return {
    bg: c === "green" ? "bg-green-500/15" : c === "orange" ? "bg-amber-500/15" : "bg-red-500/15",
    text: c === "green" ? "text-green-600" : c === "orange" ? "text-amber-600" : "text-red-600",
    dot: c === "green" ? "bg-green-500" : c === "orange" ? "bg-amber-500" : "bg-red-500",
  };
}

const MODE_LABELS: Record<string, string> = {
  control_hifz: "Contrôle Hifz",
  tahaddi: "Tahaddi",
  reading: "Lecture",
};

const DAY_NAMES = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

function relativeDate(d: string): string {
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  if (days === 0) return "Auj.";
  if (days === 1) return "Hier";
  if (days < 7) return `${days}j`;
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function ChildDetail() {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { profiles, getSessionsForChild, getChildMastery, getChildSurahBestScores } = useChildProfiles();
  const dashboard = useChildDashboard(childId);

  const [tab, setTab] = useState<"overview" | "hifz" | "history">("overview");

  const child = profiles.find(p => p.id === childId);
  if (!child) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{t("parent.childNotFound")}</p>
      </div>
    );
  }

  const mastery = getChildMastery(child.id);
  const sessions = getSessionsForChild(child.id);
  const bestScores = getChildSurahBestScores(child.id);
  const color = getColor(mastery);

  const reviewedSurahs = Array.from(bestScores.entries())
    .map(([surahNum, score]) => {
      const surah = surahs.find(s => s.number === surahNum);
      return { surahNumber: surahNum, nameArabic: surah?.nameArabic || "", name: surah?.frenchName || surah?.name || "", score };
    })
    .sort((a, b) => b.score - a.score);

  // Chart data from dashboard
  const chartData = dashboard?.dayTimeline.map(day => ({
    name: DAY_NAMES[new Date(day.date).getDay()],
    minutes: day.totalMinutes,
    sessions: day.sessionsCount,
    active: day.active,
  })) || [];

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="px-6 pt-14 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/parent")} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
            <ArrowLeft size={18} className="text-foreground" />
          </button>
          <div className="flex items-center gap-3 flex-1">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center">
                <span className="text-2xl">{child.avatarEmoji}</span>
              </div>
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${cc(color).dot} flex items-center justify-center`}>
                <span className="text-[7px] font-bold text-white">{mastery}%</span>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{child.name}</h1>
              <p className="text-xs text-muted-foreground">
                {child.age ? `${child.age} ${t("parent.years")} · ` : ""}{bestScores.size} sourates · {sessions.length} sessions
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/parent/child/${child.id}/report`)}
            className="w-10 h-10 rounded-full bg-secondary/15 flex items-center justify-center"
          >
            <FileText size={18} className="text-secondary" />
          </button>
        </div>
      </div>

      {/* Mastery + Quick Stats */}
      <div className="px-6 mb-5">
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card/70 backdrop-blur-xl border border-border/50 rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center gap-5 mb-4">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${cc(color).bg}`}>
              <span className={`text-2xl font-bold ${cc(color).text}`}>{mastery}%</span>
            </div>
            <div className="flex-1">
              <p className={`text-sm font-semibold ${cc(color).text}`}>
                {color === "green" ? t("hifzMap.strong") : color === "orange" ? t("hifzMap.needsWork") : t("hifzMap.weak")}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("parent.mastery")} {t("hifzMap.global" as any) || "global"}
              </p>
            </div>
          </div>
          {/* Mini stat row */}
          {dashboard && (
            <div className="grid grid-cols-4 gap-2">
              {[
                { icon: <Clock size={12} className="text-primary" />, value: `${dashboard.minutesQuran7d}`, label: "min/7j" },
                { icon: <BookOpen size={12} className="text-secondary" />, value: `${dashboard.sessionsCount7d}`, label: "sessions" },
                { icon: <Flame size={12} className="text-orange-400" />, value: `${dashboard.nooraniCompleted}/${dashboard.nooraniTotal}`, label: "Noorani" },
                { icon: <Star size={12} className="text-yellow-400" />, value: `${dashboard.checklistToday}/${dashboard.checklistTotal}`, label: "actions" },
              ].map((s, i) => (
                <div key={i} className="bg-muted/50 rounded-xl p-2 text-center">
                  <div className="flex items-center justify-center mb-0.5">{s.icon}</div>
                  <p className="text-sm font-bold text-foreground">{s.value}</p>
                  <p className="text-[8px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="px-6 mb-4">
        <div className="flex bg-muted rounded-xl p-1">
          {(["overview", "hifz", "history"] as const).map(t2 => (
            <button
              key={t2}
              onClick={() => setTab(t2)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
                tab === t2 ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              {t2 === "overview" ? "📊 Vue 7j" : t2 === "hifz" ? t("parent.tabHifz") : t("parent.tabHistory")}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6">
        {/* ═══ OVERVIEW TAB ═══ */}
        {tab === "overview" && dashboard && (
          <div className="space-y-4">
            {/* Recharts weekly activity */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-card/70 backdrop-blur-xl border border-border/50 rounded-2xl p-4 shadow-sm">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                <Calendar size={12} className="inline mr-1" />
                Activité hebdomadaire
              </p>
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barCategoryGap="20%">
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 12,
                        fontSize: 11,
                      }}
                      formatter={(value: number) => [`${value} min`, 'Temps']}
                    />
                    <Bar dataKey="minutes" radius={[6, 6, 0, 0]} maxBarSize={28}>
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={entry.active ? 'hsl(var(--primary))' : 'hsl(var(--muted))'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Kids modules status */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="bg-card/70 backdrop-blur-xl border border-border/50 rounded-2xl p-4 shadow-sm">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Modules enfants</p>
              <div className="space-y-2.5">
                {[
                  { emoji: "🕋", label: "Umra & Hajj", done: dashboard.kidsHajjDone },
                  { emoji: "🤲", label: "Apprendre à prier", done: dashboard.kidsPrayerDone },
                ].map((mod, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-lg">{mod.emoji}</span>
                    <span className="flex-1 text-sm text-foreground">{mod.label}</span>
                    {mod.done ? (
                      <span className="px-2.5 py-1 rounded-full bg-green-500/15 text-green-600 text-[10px] font-semibold">✓ Complété</span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-[10px]">Non commencé</span>
                    )}
                  </div>
                ))}
                <div className="flex items-center gap-3">
                  <span className="text-lg">🌙</span>
                  <span className="flex-1 text-sm text-foreground">Bonnes actions</span>
                  <span className="px-2.5 py-1 rounded-full bg-primary/15 text-primary text-[10px] font-semibold">
                    {dashboard.checklistToday}/{dashboard.checklistTotal}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Recent activities */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-card/70 backdrop-blur-xl border border-border/50 rounded-2xl p-4 shadow-sm">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Dernières activités
              </p>
              {dashboard.recentActivities.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Aucune activité encore</p>
              ) : (
                <div className="space-y-2">
                  {dashboard.recentActivities.map((act, i) => (
                    <motion.div
                      key={act.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-3 py-1"
                    >
                      <span className="text-lg shrink-0">{act.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{act.label}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {relativeDate(act.date)}{act.detail ? ` · ${act.detail}` : ""}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* ═══ HIFZ TAB ═══ */}
        {tab === "hifz" && (
          <div className="space-y-2">
            {reviewedSurahs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-sm">{t("parent.noSessions")}</p>
              </div>
            )}
            {reviewedSurahs.map((s, i) => {
              const c = getColor(s.score);
              return (
                <motion.div key={s.surahNumber}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 bg-card/70 backdrop-blur-xl border border-border/50 rounded-xl px-3 py-2.5"
                >
                  <span className={`w-8 h-8 rounded-lg ${cc(c).bg} ${cc(c).text} text-xs font-bold flex items-center justify-center shrink-0`}>
                    {s.surahNumber}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-arabic text-base text-foreground">{s.nameArabic}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{s.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${cc(c).dot}`} style={{ width: `${s.score}%` }} />
                    </div>
                    <span className={`text-xs font-bold ${cc(c).text}`}>{s.score}%</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ═══ HISTORY TAB ═══ */}
        {tab === "history" && (
          <div className="space-y-2">
            {sessions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-sm">{t("parent.noSessions")}</p>
              </div>
            )}
            {sessions.map((s, i) => {
              const surah = surahs.find(su => su.number === s.surahNumber);
              const c = getColor(s.score);
              return (
                <motion.div key={s.id}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 bg-card/70 backdrop-blur-xl border border-border/50 rounded-xl px-3 py-2.5"
                >
                  <span className={`w-8 h-8 rounded-lg ${cc(c).bg} ${cc(c).text} text-[10px] font-bold flex items-center justify-center shrink-0`}>
                    {s.score}%
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {surah?.nameArabic || `Sourate ${s.surahNumber}`}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {MODE_LABELS[s.mode] || s.mode} · {relativeDate(s.date)}
                      {s.durationSeconds ? ` · ${Math.round(s.durationSeconds / 60)}min` : ""}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
