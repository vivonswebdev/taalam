import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
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
      </div>

      <div className="px-5 grid grid-cols-2 gap-3">
        {NOORANI_LESSONS.map((lesson, i) => {
          const isDone = completed.includes(lesson.id);
          return (
            <motion.button
              key={lesson.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/noorani/${lesson.id}`)}
              className={`relative rounded-2xl p-4 text-left border flex flex-col gap-2 min-h-[130px] ${
                isDone
                  ? "bg-primary/10 border-primary/30"
                  : "bg-card border-border"
              }`}
            >
              {isDone && (
                <CheckCircle2 size={18} className="absolute top-3 right-3 text-primary" />
              )}
              <span className="text-2xl">{lesson.emoji}</span>
              <p className="text-sm font-bold text-foreground leading-tight">{t(lesson.titleKey as any)}</p>
              <p className="text-[11px] text-muted-foreground line-clamp-2">{t(lesson.descKey as any)}</p>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full self-start mt-auto ${
                lesson.level === "beginner"
                  ? "bg-primary/15 text-primary"
                  : "bg-secondary/15 text-secondary-foreground"
              }`}>
                {t(lesson.level === "beginner" ? "noorani.beginner" : "noorani.intermediate" as any)}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
