import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Check, X, Download, Pause, Play, CloudOff, Loader2, HardDrive } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useOfflineManager, type OfflineSection } from "@/hooks/useOfflineManager";
import { useXP } from "@/hooks/useXP";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const OFFLINE_XP_KEY = "offline_xp_awarded";
function getOfflineXpAwarded(): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(OFFLINE_XP_KEY) || "{}"); } catch { return {}; }
}
function markOfflineXpAwarded(section: string) {
  const data = getOfflineXpAwarded();
  data[section] = true;
  localStorage.setItem(OFFLINE_XP_KEY, JSON.stringify(data));
}

const SECTIONS: { id: OfflineSection; emoji: string; tKey: string; descKey: string; sizeHint: string }[] = [
  { id: "mushaf", emoji: "📖", tKey: "offlinev2.mushaf", descKey: "offlinev2.mushafDesc", sizeHint: "~114 Mo" },
  { id: "moods", emoji: "💓", tKey: "offlinev2.moods", descKey: "offlinev2.moodsDesc", sizeHint: "~40 Mo" },
  { id: "tarteel", emoji: "🎙️", tKey: "offlinev2.tarteel", descKey: "offlinev2.tarteelDesc", sizeHint: "~50 Mo" },
  { id: "quiz", emoji: "🧠", tKey: "offlinev2.quiz", descKey: "offlinev2.quizDesc", sizeHint: "—" },
];

const XP_REWARDS: Record<string, number> = { mushaf: 10, moods: 15, tarteel: 10 };

export default function OfflineSettings() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { addXP } = useXP();
  const prevStatusRef = useRef<Record<string, boolean>>({});
  const {
    offlineMode, setOfflineMode,
    status, readySections, progress,
    downloadMushaf, downloadMoods, downloadTarteel, downloadAll,
    pauseDownload, resumeDownload, cancelDownload,
  } = useOfflineManager();

  // Award XP when a section finishes downloading (once per section ever)
  useEffect(() => {
    const awarded = getOfflineXpAwarded();
    (["mushaf", "moods", "tarteel"] as OfflineSection[]).forEach(sec => {
      if (status[sec] && !prevStatusRef.current[sec] && !awarded[sec] && XP_REWARDS[sec]) {
        addXP(XP_REWARDS[sec]);
        markOfflineXpAwarded(sec);
        toast.success(`+${XP_REWARDS[sec]} XP — ${t(`offlinev2.${sec}` as any)} offline !`);
      }
    });
    prevStatusRef.current = { ...status };
  }, [status, addXP, t]);

  const downloadFns: Record<OfflineSection, () => Promise<void>> = {
    mushaf: downloadMushaf,
    moods: downloadMoods,
    tarteel: downloadTarteel,
    quiz: async () => {},
  };

  const pct = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;
  const isDownloading = progress.section !== null;

  return (
    <div className="min-h-screen pb-24">
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-background/70 border-b border-border/50 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-muted">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <CloudOff size={20} className="text-primary" />
            {t("offlinev2.pageTitle" as any)}
          </h1>
          <p className="text-[11px] text-muted-foreground">{t("offlinev2.pageSubtitle" as any)}</p>
        </div>
      </div>

      <div className="px-5 pt-4 space-y-4">
        {/* Global toggle */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-4">
            <HardDrive size={22} className="text-primary" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-card-foreground">{t("offlinev2.globalToggle" as any)}</p>
              <p className="text-[10px] text-muted-foreground">{t("offlinev2.globalToggleDesc" as any)}</p>
            </div>
            <div
              onClick={() => setOfflineMode(!offlineMode)}
              className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${offlineMode ? "bg-primary" : "bg-muted"}`}
            >
              <motion.div animate={{ x: offlineMode ? 20 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="absolute top-1 w-5 h-5 rounded-full bg-card shadow-md" />
            </div>
          </div>
        </motion.div>

        {/* Progress overview */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
            {t("offlinev2.progressTitle" as any)}
          </p>
          <Progress value={(readySections / 4) * 100} className="h-2 mb-1" />
          <p className="text-[11px] text-muted-foreground">{readySections}/4 {t("offlinev2.sectionsReady" as any)}</p>
        </motion.div>

        {/* Download progress bar (when active) */}
        {isDownloading && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-primary/10 border border-primary/30 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-primary flex items-center gap-1.5">
                <Loader2 size={14} className="animate-spin" />
                {t(`offlinev2.${progress.section}` as any)} — {pct}%
              </p>
              <div className="flex gap-1">
                {progress.paused ? (
                  <button onClick={resumeDownload} className="p-1.5 rounded-full bg-primary/20 hover:bg-primary/30">
                    <Play size={14} className="text-primary" />
                  </button>
                ) : (
                  <button onClick={pauseDownload} className="p-1.5 rounded-full bg-primary/20 hover:bg-primary/30">
                    <Pause size={14} className="text-primary" />
                  </button>
                )}
                <button onClick={cancelDownload} className="p-1.5 rounded-full bg-destructive/20 hover:bg-destructive/30">
                  <X size={14} className="text-destructive" />
                </button>
              </div>
            </div>
            <Progress value={pct} className="h-2" />
            <p className="text-[10px] text-muted-foreground">{progress.current}/{progress.total}</p>
          </motion.div>
        )}

        {/* Section list */}
        <div className="space-y-2">
          {SECTIONS.map((sec, i) => {
            const ready = status[sec.id];
            const isCurrentDownload = progress.section === sec.id;
            return (
              <motion.div
                key={sec.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.04 }}
                className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3"
              >
                <span className="text-2xl">{sec.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-card-foreground">{t(sec.tKey as any)}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{t(sec.descKey as any)}</p>
                  {!ready && sec.id !== "quiz" && (
                    <p className="text-[9px] text-muted-foreground/70 mt-0.5">{sec.sizeHint}</p>
                  )}
                </div>
                {ready ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-500">
                    <Check size={16} /> OK
                  </span>
                ) : sec.id === "quiz" ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-500">
                    <Check size={16} /> 100%
                  </span>
                ) : (
                  <button
                    onClick={() => !isDownloading && downloadFns[sec.id]()}
                    disabled={isDownloading}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-semibold disabled:opacity-40 hover:bg-primary/20 transition-colors"
                  >
                    <Download size={14} />
                    {t("offlinev2.preload" as any)}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Download all */}
        {readySections < 4 && !isDownloading && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={downloadAll}
            className="w-full py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2"
          >
            <Download size={16} />
            {t("offlinev2.downloadAll" as any)}
          </motion.button>
        )}
      </div>
    </div>
  );
}
