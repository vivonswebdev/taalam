import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Lock } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { NOORANI_LESSONS } from "@/data/nooraniLessons";
import PageBackground from "@/components/PageBackground";

const PROGRESS_KEY = "noorani_progress";

function getProgress(): string[] {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "[]");
  } catch {
    return [];
  }
}

const LEVEL_CONFIG = {
  beginner: { emoji: "🌱", colorClass: "bg-primary/15 text-primary" },
  intermediate: { emoji: "🌿", colorClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  advanced: { emoji: "🔥", colorClass: "bg-rose-500/15 text-rose-600 dark:text-rose-400" },
  expert: { emoji: "💎", colorClass: "bg-violet-500/15 text-violet-600 dark:text-violet-400" },
  master: { emoji: "👑", colorClass: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400" },
} as const;

export default function Noorani() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [completed, setCompleted] = useState<string[]>(getProgress);

  useEffect(() => {
    const handler = () => setCompleted(getProgress());
    window.addEventListener("storage", handler);
    window.addEventListener("noorani-progress", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("noorani-progress", handler);
    };
  }, []);

  const levels = useMemo(() => {
    const groups = [
      { key: "beginner" as const, lessons: NOORANI_LESSONS.filter(l => l.level === "beginner") },
      { key: "intermediate" as const, lessons: NOORANI_LESSONS.filter(l => l.level === "intermediate") },
      { key: "advanced" as const, lessons: NOORANI_LESSONS.filter(l => l.level === "advanced") },
    ];
    return groups.filter(g => g.lessons.length > 0);
  }, []);

  // Calculate if a level is unlocked: need at least 60% of previous level done
  const isLevelUnlocked = (levelIndex: number) => {
    if (levelIndex === 0) return true;
    const prevLessons = levels[levelIndex - 1].lessons;
    const prevDone = prevLessons.filter(l => completed.includes(l.id)).length;
    return prevDone >= Math.ceil(prevLessons.length * 0.6);
  };

  const totalDone = completed.length;
  const totalLessons = NOORANI_LESSONS.length;

  return (
    <PageBackground intensity="subtle">
      <div className="min-h-screen pb-24">
        <div className="px-5 pt-12 pb-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-muted-foreground mb-4">
            <ArrowLeft size={18} />
            <span className="text-sm">{t("listening.backHome")}</span>
          </button>
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold text-foreground">
            {t("noorani.title")}
          </motion.h1>
          <p className="text-sm text-muted-foreground mt-1">{t("noorani.subtitle")}</p>

          {/* Global progress bar */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-2.5 rounded-full bg-muted/40 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${(totalDone / totalLessons) * 100}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
            <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">
              {totalDone}/{totalLessons}
            </span>
          </div>
        </div>

        <div className="px-5 space-y-6">
          {levels.map((group, gi) => {
            const cfg = LEVEL_CONFIG[group.key];
            const unlocked = isLevelUnlocked(gi);
            const doneInLevel = group.lessons.filter(l => completed.includes(l.id)).length;

            return (
              <div key={group.key}>
                {/* Level header */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{cfg.emoji}</span>
                  <h2 className="text-sm font-bold text-foreground">
                    {t(`noorani.${group.key}` as any)}
                  </h2>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.colorClass}`}>
                    {doneInLevel}/{group.lessons.length} {t("noorani.levelProgress" as any)}
                  </span>
                  {!unlocked && <Lock size={14} className="text-muted-foreground ml-auto" />}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {group.lessons.map((lesson, i) => {
                    const isDone = completed.includes(lesson.id);
                    const globalIndex = NOORANI_LESSONS.indexOf(lesson);
                    return (
                      <motion.button
                        key={lesson.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        whileTap={unlocked ? { scale: 0.97 } : undefined}
                        onClick={() => unlocked && navigate(`/noorani/${lesson.id}`)}
                        disabled={!unlocked}
                        className={`relative rounded-2xl p-4 text-left border flex flex-col gap-2 min-h-[130px] transition-colors ${
                          !unlocked
                            ? "bg-muted/30 border-border/50 opacity-60"
                            : isDone
                              ? "bg-primary/10 border-primary/30"
                              : "bg-card border-border"
                        }`}
                      >
                        {isDone && (
                          <CheckCircle2 size={18} className="absolute top-3 right-3 text-primary" />
                        )}
                        {!unlocked && (
                          <Lock size={16} className="absolute top-3 right-3 text-muted-foreground/50" />
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{lesson.emoji}</span>
                          <span className="text-[10px] font-bold text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                            {globalIndex + 1}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-foreground leading-tight">{t(lesson.titleKey as any)}</p>
                        <p className="text-[11px] text-muted-foreground line-clamp-2">{t(lesson.descKey as any)}</p>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full self-start mt-auto ${cfg.colorClass}`}>
                          {t(`noorani.${group.key}` as any)}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PageBackground>
  );
}
