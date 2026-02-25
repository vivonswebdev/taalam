import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, TrendingDown, Clock, BookOpen, CheckCircle2, AlertTriangle } from "lucide-react";
import { useChildProfiles } from "@/hooks/useChildProfiles";
import { useLanguage } from "@/hooks/useLanguage";
import { surahs } from "@/data/surahs";

export default function ChildReport() {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { profiles, generateWeeklyReport } = useChildProfiles();

  const child = profiles.find(p => p.id === childId);
  if (!child) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{t("parent.childNotFound")}</p>
      </div>
    );
  }

  const report = generateWeeklyReport(child.id);

  const formatTime = (s: number) => {
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}min`;
    return `${Math.floor(m / 60)}h${m % 60}min`;
  };

  const surahName = (n: number) => {
    const s = surahs.find(su => su.number === n);
    return s?.nameArabic || `Sourate ${n}`;
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="px-6 pt-14 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
            <ArrowLeft size={18} className="text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">{t("parent.weeklyReport")}</h1>
            <p className="text-xs text-muted-foreground">{child.avatarEmoji} {child.name}</p>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-4">
        {/* Overview */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-5">
          <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-4">
            {t("parent.thisWeek")}
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-foreground">{report.sessionsCount}</p>
              <p className="text-[10px] text-muted-foreground">{t("hifzMap.sessions")}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{report.avgScore}%</p>
              <p className="text-[10px] text-muted-foreground">{t("parent.avgScore")}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{formatTime(report.totalTimeSeconds)}</p>
              <p className="text-[10px] text-muted-foreground">{t("parent.totalTime")}</p>
            </div>
          </div>
        </motion.div>

        {/* Progress delta */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            report.progressDelta >= 0 ? "bg-green-500/15" : "bg-red-500/15"
          }`}>
            {report.progressDelta >= 0 ? (
              <TrendingUp size={20} className="text-green-600" />
            ) : (
              <TrendingDown size={20} className="text-red-600" />
            )}
          </div>
          <div>
            <p className={`text-lg font-bold ${report.progressDelta >= 0 ? "text-green-600" : "text-red-600"}`}>
              {report.progressDelta >= 0 ? "+" : ""}{report.progressDelta}%
            </p>
            <p className="text-xs text-muted-foreground">{t("parent.progressVsAvg")}</p>
          </div>
        </motion.div>

        {/* Strong surahs */}
        {report.strongSurahs.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={16} className="text-green-600" />
              <p className="text-xs font-semibold text-foreground">{t("parent.strongSurahs")}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {report.strongSurahs.map(n => (
                <span key={n} className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-700 text-xs font-medium font-arabic">
                  {surahName(n)}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Weak surahs */}
        {report.weakSurahs.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={16} className="text-amber-500" />
              <p className="text-xs font-semibold text-foreground">{t("parent.weakSurahs")}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {report.weakSurahs.map(n => (
                <span key={n} className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-700 text-xs font-medium font-arabic">
                  {surahName(n)}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Passages worked */}
        {report.passagesWorked.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen size={16} className="text-primary" />
              <p className="text-xs font-semibold text-foreground">{t("parent.passagesWorked")}</p>
            </div>
            <div className="space-y-1.5">
              {/* Deduplicate */}
              {Array.from(new Set(report.passagesWorked.map(p => p.surahNumber))).map(n => (
                <div key={n} className="flex items-center gap-2 text-sm">
                  <span className="w-6 h-6 rounded bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">{n}</span>
                  <span className="font-arabic text-foreground">{surahName(n)}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {report.sessionsCount === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-12">
            <p className="text-muted-foreground text-sm">{t("parent.noSessionsThisWeek")}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
