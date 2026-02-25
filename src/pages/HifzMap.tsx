import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ChevronRight, BookOpen, Clock, AlertTriangle,
  CheckCircle2, XCircle, MinusCircle, PlusCircle, Layers,
} from "lucide-react";
import { useProgress, type SurahProgress } from "@/hooks/useProgress";
import { useLanguage } from "@/hooks/useLanguage";
import { surahs } from "@/data/surahs";
import { juzData, getSurahsInJuz, type JuzInfo } from "@/data/juzData";
import { useNavigate } from "react-router-dom";

// ─── Stats types ────────────────────────────────────────────
interface SurahStats {
  surahNumber: number;
  nameArabic: string;
  nameEnglish: string;
  sessionsCount: number;
  bestScore: number;
  lastReviewedAt: string | null;
  color: "green" | "orange" | "red";
  mastery: number; // 0-100
}

interface JuzStats {
  juz: number;
  name: string;
  surahs: SurahStats[];
  mastery: number;
  color: "green" | "orange" | "red";
  surahCount: number;
  reviewedCount: number;
}

type View = "global" | "juz" | "surah";

// ─── Color logic ────────────────────────────────────────────
function getColor(mastery: number): "green" | "orange" | "red" {
  if (mastery >= 70) return "green";
  if (mastery >= 40) return "orange";
  return "red";
}

function colorClasses(c: "green" | "orange" | "red") {
  return {
    bg: c === "green" ? "bg-green-500/15" : c === "orange" ? "bg-amber-500/15" : "bg-red-500/15",
    text: c === "green" ? "text-green-600" : c === "orange" ? "text-amber-600" : "text-red-600",
    border: c === "green" ? "border-green-500/30" : c === "orange" ? "border-amber-500/30" : "border-red-500/30",
    dot: c === "green" ? "bg-green-500" : c === "orange" ? "bg-amber-500" : "bg-red-500",
  };
}

// ─── Compute stats from progress ────────────────────────────
function computeSurahStats(sp: SurahProgress | undefined, surahNumber: number): SurahStats {
  const surah = surahs.find(s => s.number === surahNumber);
  const mastery = sp ? sp.bestScore : 0;
  return {
    surahNumber,
    nameArabic: surah?.nameArabic || `سورة ${surahNumber}`,
    nameEnglish: surah?.frenchName || surah?.name || `Surah ${surahNumber}`,
    sessionsCount: sp?.attempts || 0,
    bestScore: sp?.bestScore || 0,
    lastReviewedAt: sp?.lastAttempt || null,
    color: sp ? getColor(mastery) : "red",
    mastery,
  };
}

function computeJuzStats(juz: JuzInfo, progressData: SurahProgress[]): JuzStats {
  const surahsInJuz = getSurahsInJuz(juz.juz);
  const surahStats = surahsInJuz.map(s =>
    computeSurahStats(progressData.find(p => p.surahNumber === s.surahNumber), s.surahNumber)
  );
  const reviewed = surahStats.filter(s => s.sessionsCount > 0);
  const mastery = reviewed.length > 0
    ? Math.round(reviewed.reduce((a, s) => a + s.mastery, 0) / surahStats.length)
    : 0;

  return {
    juz: juz.juz,
    name: juz.name,
    surahs: surahStats,
    mastery,
    color: reviewed.length === 0 ? "red" : getColor(mastery),
    surahCount: surahStats.length,
    reviewedCount: reviewed.length,
  };
}

// ─── Relative time ──────────────────────────────────────────
function relativeTime(dateStr: string, t: (k: any) => string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return t("hifzMap.today");
  if (days === 1) return t("hifzMap.yesterday");
  if (days < 7) return `${days}${t("hifzMap.daysAgo")}`;
  if (days < 30) return `${Math.floor(days / 7)}${t("hifzMap.weeksAgo")}`;
  return `${Math.floor(days / 30)}${t("hifzMap.monthsAgo")}`;
}

// ─── Component ──────────────────────────────────────────────
export default function HifzMap() {
  const { progress } = useProgress();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [view, setView] = useState<View>("global");
  const [selectedJuz, setSelectedJuz] = useState<JuzStats | null>(null);
  const [selectedSurah, setSelectedSurah] = useState<SurahStats | null>(null);

  const allJuzStats = juzData.map(j => computeJuzStats(j, progress.surahProgress));
  const totalMastery = allJuzStats.length > 0
    ? Math.round(allJuzStats.reduce((a, j) => a + j.mastery, 0) / allJuzStats.length)
    : 0;
  const totalReviewed = progress.surahProgress.length;

  const openJuz = (juz: JuzStats) => {
    setSelectedJuz(juz);
    setSelectedSurah(null);
    setView("juz");
  };

  const openSurah = (surah: SurahStats) => {
    setSelectedSurah(surah);
    setView("surah");
  };

  const goBack = () => {
    if (view === "surah" && selectedJuz) setView("juz");
    else if (view === "surah" || view === "juz") { setView("global"); setSelectedJuz(null); setSelectedSurah(null); }
    else navigate(-1);
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="px-6 pt-14 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
            <ArrowLeft size={18} className="text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">{t("hifzMap.title")}</h1>
            <p className="text-xs text-muted-foreground">{t("hifzMap.subtitle")}</p>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-5">
        <AnimatePresence mode="wait">
          {/* ═══ GLOBAL VIEW ═══ */}
          {view === "global" && (
            <motion.div key="global" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-5">

              {/* Summary card */}
              <div className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">{t("hifzMap.globalMastery")}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{totalMastery}%</p>
                  </div>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${colorClasses(getColor(totalMastery)).bg}`}>
                    <span className={`text-2xl font-bold ${colorClasses(getColor(totalMastery)).text}`}>{totalMastery}</span>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex gap-4 text-[10px] text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    {t("hifzMap.strong")} (≥70%)
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    {t("hifzMap.medium")} (40-69%)
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    {t("hifzMap.weak")} (&lt;40%)
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mt-3">
                  {totalReviewed} {t("hifzMap.surahsReviewed")}
                </p>
              </div>

              {/* Juz Grid */}
              <div>
                <p className="text-sm font-semibold text-foreground mb-3">{t("hifzMap.byJuz")}</p>
                <div className="grid grid-cols-5 gap-2">
                  {allJuzStats.map((juz, i) => {
                    const cc = colorClasses(juz.color);
                    return (
                      <motion.button
                        key={juz.juz}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.02 }}
                        onClick={() => openJuz(juz)}
                        className={`relative aspect-square rounded-xl border-2 ${cc.border} ${cc.bg} flex flex-col items-center justify-center gap-0.5 hover:scale-105 transition-transform active:scale-95`}
                      >
                        <span className={`text-lg font-bold ${cc.text}`}>{juz.juz}</span>
                        <span className="text-[8px] text-muted-foreground">{juz.mastery}%</span>
                        {/* Dot indicator */}
                        <span className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${cc.dot}`} />
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Surah list (reviewed only) */}
              {progress.surahProgress.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-foreground mb-3">{t("hifzMap.reviewedSurahs")}</p>
                  <div className="space-y-1.5">
                    {progress.surahProgress
                      .sort((a, b) => a.surahNumber - b.surahNumber)
                      .map((sp, i) => {
                        const stats = computeSurahStats(sp, sp.surahNumber);
                        const cc = colorClasses(stats.color);
                        return (
                          <motion.button
                            key={sp.surahNumber}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            onClick={() => openSurah(stats)}
                            className="w-full flex items-center gap-3 bg-card border border-border rounded-xl px-3 py-2.5 text-left hover:bg-accent/30 transition-colors"
                          >
                            <span className={`w-8 h-8 rounded-lg ${cc.bg} ${cc.text} text-xs font-bold flex items-center justify-center shrink-0`}>
                              {sp.surahNumber}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-arabic text-base text-foreground">{stats.nameArabic}</p>
                              <p className="text-[10px] text-muted-foreground truncate">{stats.nameEnglish} · {stats.sessionsCount} {t("hifzMap.sessions")}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`text-xs font-bold ${cc.text}`}>{stats.mastery}%</span>
                              <ChevronRight size={14} className="text-muted-foreground" />
                            </div>
                          </motion.button>
                        );
                      })}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ═══ JUZ DETAIL VIEW ═══ */}
          {view === "juz" && selectedJuz && (
            <motion.div key="juz" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-5">

              {/* Juz header */}
              <div className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-arabic text-xl text-foreground">Juz {selectedJuz.juz}</p>
                    <p className="font-arabic text-sm text-muted-foreground">{selectedJuz.name}</p>
                  </div>
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center ${colorClasses(selectedJuz.color).bg}`}>
                    <span className={`text-xl font-bold ${colorClasses(selectedJuz.color).text}`}>{selectedJuz.mastery}%</span>
                  </div>
                </div>
                <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                  <span>{selectedJuz.surahCount} {t("hifzMap.surahsTotal")}</span>
                  <span>{selectedJuz.reviewedCount} {t("hifzMap.reviewed")}</span>
                </div>
              </div>

              {/* Surahs in this Juz */}
              <div className="space-y-1.5">
                {selectedJuz.surahs.map((s, i) => {
                  const cc = colorClasses(s.color);
                  return (
                    <motion.button
                      key={s.surahNumber}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => openSurah(s)}
                      className="w-full flex items-center gap-3 bg-card border border-border rounded-xl px-3 py-2.5 text-left hover:bg-accent/30 transition-colors"
                    >
                      <span className={`w-8 h-8 rounded-lg ${cc.bg} ${cc.text} text-xs font-bold flex items-center justify-center shrink-0`}>
                        {s.surahNumber}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-arabic text-base text-foreground">{s.nameArabic}</p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {s.nameEnglish}
                          {s.lastReviewedAt && ` · ${relativeTime(s.lastReviewedAt, t)}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {s.sessionsCount > 0 ? (
                          <span className={`text-xs font-bold ${cc.text}`}>{s.mastery}%</span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">—</span>
                        )}
                        <ChevronRight size={14} className="text-muted-foreground" />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ═══ SURAH DETAIL VIEW ═══ */}
          {view === "surah" && selectedSurah && (
            <motion.div key="surah" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-5">

              {/* Surah header */}
              <div className="bg-card border border-border rounded-2xl p-5 text-center">
                <p className="font-arabic text-3xl text-foreground mb-1">{selectedSurah.nameArabic}</p>
                <p className="text-sm text-muted-foreground">{selectedSurah.nameEnglish}</p>
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mt-4 ${colorClasses(selectedSurah.color).bg}`}>
                  <span className={`text-2xl font-bold ${colorClasses(selectedSurah.color).text}`}>{selectedSurah.mastery}%</span>
                </div>
                <p className={`text-sm font-semibold mt-2 ${colorClasses(selectedSurah.color).text}`}>
                  {selectedSurah.color === "green" ? t("hifzMap.strong")
                    : selectedSurah.color === "orange" ? t("hifzMap.needsWork")
                    : t("hifzMap.weak")}
                </p>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-card border border-border rounded-xl p-4 text-center">
                  <BookOpen size={18} className="text-primary mx-auto mb-1.5" />
                  <p className="text-2xl font-bold text-foreground">{selectedSurah.sessionsCount}</p>
                  <p className="text-[10px] text-muted-foreground">{t("hifzMap.sessions")}</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 text-center">
                  <Clock size={18} className="text-primary mx-auto mb-1.5" />
                  <p className="text-sm font-bold text-foreground">
                    {selectedSurah.lastReviewedAt
                      ? relativeTime(selectedSurah.lastReviewedAt, t)
                      : "—"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{t("hifzMap.lastReview")}</p>
                </div>
              </div>

              {/* Score bar */}
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-foreground">{t("hifzMap.bestScore")}</p>
                  <p className={`text-sm font-bold ${colorClasses(selectedSurah.color).text}`}>{selectedSurah.bestScore}%</p>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${selectedSurah.bestScore}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      selectedSurah.color === "green" ? "bg-green-500"
                        : selectedSurah.color === "orange" ? "bg-amber-500"
                        : "bg-red-500"
                    }`}
                  />
                </div>
              </div>

              {/* Status indicator */}
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs font-semibold text-foreground mb-3">{t("hifzMap.status")}</p>
                <div className="space-y-2.5">
                  {selectedSurah.sessionsCount === 0 ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertTriangle size={16} className="text-amber-500" />
                      {t("hifzMap.neverReviewed")}
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 text-sm">
                        {selectedSurah.bestScore >= 80 ? (
                          <CheckCircle2 size={16} className="text-green-500" />
                        ) : (
                          <XCircle size={16} className="text-red-500" />
                        )}
                        <span className="text-foreground">
                          {selectedSurah.bestScore >= 80
                            ? t("hifzMap.wellMemorized")
                            : t("hifzMap.needsMorePractice")}
                        </span>
                      </div>
                      {selectedSurah.lastReviewedAt && (() => {
                        const daysSince = Math.floor((Date.now() - new Date(selectedSurah.lastReviewedAt).getTime()) / 86400000);
                        if (daysSince > 14) {
                          return (
                            <div className="flex items-center gap-2 text-sm">
                              <AlertTriangle size={16} className="text-amber-500" />
                              <span className="text-foreground">{t("hifzMap.notReviewedRecently")}</span>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </>
                  )}
                </div>
              </div>

              {/* Action button */}
              <button
                onClick={() => navigate(`/quran`)}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm active:scale-[0.98] transition-transform"
              >
                <BookOpen size={16} />
                {t("hifzMap.practiceNow")}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
