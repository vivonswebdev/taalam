import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, BookOpen, Clock, FileText, CheckCircle2, AlertTriangle,
  XCircle, Calendar, Activity, Flame, Star,
} from "lucide-react";
import { useChildProfiles, type ChildSession } from "@/hooks/useChildProfiles";
import { useChildDashboard } from "@/hooks/useChildDashboard";
import { useLanguage } from "@/hooks/useLanguage";
import { surahs } from "@/data/surahs";

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

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="px-6 pt-14 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/parent")} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
            <ArrowLeft size={18} className="text-foreground" />
          </button>
          <div className="flex items-center gap-3 flex-1">
            <span className="text-3xl">{child.avatarEmoji}</span>
            <div>
              <h1 className="text-xl font-bold text-foreground">{child.name}</h1>
              <p className="text-xs text-muted-foreground">
                {child.age ? `${child.age} ${t("parent.years")} · ` : ""}{t("parent.mastery")}: {mastery}%
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

      {/* Mastery Circle */}
      <div className="px-6 mb-5">
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-5">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${cc(color).bg}`}>
            <span className={`text-2xl font-bold ${cc(color).text}`}>{mastery}%</span>
          </div>
          <div>
            <p className={`text-sm font-semibold ${cc(color).text}`}>
              {color === "green" ? t("hifzMap.strong") : color === "orange" ? t("hifzMap.needsWork") : t("hifzMap.weak")}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {bestScores.size} {t("hifzMap.surahsReviewed")} · {sessions.length} {t("hifzMap.sessions")}
            </p>
          </div>
        </div>
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
            {/* 7-day stats grid */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 gap-2.5">
              <div className="bg-card border border-border rounded-2xl p-3.5 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Clock size={14} className="text-primary" />
                </div>
                <p className="text-xl font-bold text-foreground">{dashboard.minutesQuran7d}</p>
                <p className="text-[10px] text-muted-foreground">min Qur'an (7j)</p>
              </div>
              <div className="bg-card border border-border rounded-2xl p-3.5 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <BookOpen size={14} className="text-secondary" />
                </div>
                <p className="text-xl font-bold text-foreground">{dashboard.versetsWorked7d}</p>
                <p className="text-[10px] text-muted-foreground">passages travaillés</p>
              </div>
              <div className="bg-card border border-border rounded-2xl p-3.5 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className="text-sm">🔤</span>
                </div>
                <p className="text-xl font-bold text-foreground">{dashboard.nooraniCompleted}/{dashboard.nooraniTotal}</p>
                <p className="text-[10px] text-muted-foreground">leçons Noorani</p>
              </div>
              <div className="bg-card border border-border rounded-2xl p-3.5 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Activity size={14} className="text-orange-400" />
                </div>
                <p className="text-xl font-bold text-foreground">{dashboard.sessionsCount7d}</p>
                <p className="text-[10px] text-muted-foreground">sessions (7j)</p>
              </div>
            </motion.div>

            {/* Kids modules status */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="bg-card border border-border rounded-2xl p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Modules enfants</p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-lg">🕋</span>
                  <span className="flex-1 text-sm text-foreground">Umra & Hajj</span>
                  {dashboard.kidsHajjDone ? (
                    <span className="px-2 py-0.5 rounded-full bg-green-500/15 text-green-600 text-[10px] font-semibold">Complété</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px]">Non commencé</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg">🤲</span>
                  <span className="flex-1 text-sm text-foreground">Apprendre à prier</span>
                  {dashboard.kidsPrayerDone ? (
                    <span className="px-2 py-0.5 rounded-full bg-green-500/15 text-green-600 text-[10px] font-semibold">Complété</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px]">Non commencé</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg">🌙</span>
                  <span className="flex-1 text-sm text-foreground">Bonnes actions (aujourd'hui)</span>
                  <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-semibold">
                    {dashboard.checklistToday}/{dashboard.checklistTotal}
                  </span>
                </div>
              </div>

            {/* Day timeline (7 days) */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-2xl p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                <Calendar size={12} className="inline mr-1" />
                Activité journalière
              </p>
              <div className="flex justify-between items-end gap-1">
                {dashboard.dayTimeline.map((day, i) => {
                  const dayOfWeek = new Date(day.date).getDay();
                  const maxMinutes = Math.max(1, ...dashboard.dayTimeline.map(d => d.totalMinutes));
                  const height = day.active ? Math.max(12, (day.totalMinutes / maxMinutes) * 48) : 4;
                  return (
                    <div key={day.date} className="flex flex-col items-center gap-1 flex-1">
                      <div className="relative w-full flex justify-center">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height }}
                          transition={{ delay: i * 0.05, type: "spring", damping: 15 }}
                          className={`w-5 rounded-full ${
                            day.active ? "bg-primary" : "bg-muted"
                          }`}
                        />
                      </div>
                      <span className="text-[9px] text-muted-foreground">{DAY_NAMES[dayOfWeek]}</span>
                      {day.active && (
                        <span className="text-[8px] text-primary font-semibold">{day.sessionsCount}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Recent activities */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="bg-card border border-border rounded-2xl p-4">
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
                      className="flex items-center gap-3"
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
                  className="flex items-center gap-3 bg-card border border-border rounded-xl px-3 py-2.5"
                >
                  <span className={`w-8 h-8 rounded-lg ${cc(c).bg} ${cc(c).text} text-xs font-bold flex items-center justify-center shrink-0`}>
                    {s.surahNumber}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-arabic text-base text-foreground">{s.nameArabic}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{s.name}</p>
                  </div>
                  <span className={`text-xs font-bold ${cc(c).text}`}>{s.score}%</span>
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
                  className="flex items-center gap-3 bg-card border border-border rounded-xl px-3 py-2.5"
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
