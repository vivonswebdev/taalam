import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ThumbsUp, Eye, Volume2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { NOORANI_LESSONS } from "@/data/nooraniLessons";
import { useChildMode } from "@/hooks/useChildMode";
import { useNooraniAudio } from "@/hooks/useNooraniAudio";
import { getChildSuccessMessage } from "@/lib/childMessages";
import Confetti from "@/components/Confetti";
import StickerReward from "@/components/StickerReward";
import type { EarnedSticker } from "@/hooks/useChildMode";

const PROGRESS_KEY = "noorani_progress";

function saveProgress(lessonId: string) {
  try {
    const arr: string[] = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "[]");
    if (!arr.includes(lessonId)) {
      arr.push(lessonId);
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(arr));
      window.dispatchEvent(new Event("noorani-progress"));
    }
  } catch {}
}

export default function NooraniLesson() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isChildMode, earnSticker } = useChildMode();

  const lesson = NOORANI_LESSONS.find((l) => l.id === lessonId);
  const [current, setCurrent] = useState(0);
  const [known, setKnown] = useState(0);
  const [finished, setFinished] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [earnedSticker, setEarnedSticker] = useState<EarnedSticker | null>(null);

  const items = lesson?.items || [];
  const total = items.length;
  const progress = total > 0 ? Math.round(((current) / total) * 100) : 0;

  const handleChoice = (isKnown: boolean) => {
    if (isKnown) setKnown((k) => k + 1);
    if (current + 1 >= total) {
      setFinished(true);
      setShowConfetti(true);
      if (lessonId) saveProgress(lessonId);
      if (isChildMode) {
        const s = earnSticker(0);
        setEarnedSticker(s);
      }
    } else {
      setCurrent((c) => c + 1);
    }
  };

  const score = total > 0 ? Math.round((known / total) * 100) : 0;

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{t("noorani.lessonNotFound" as any)}</p>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <Confetti active={showConfetti} emoji />
        <StickerReward sticker={earnedSticker} onDismiss={() => setEarnedSticker(null)} />
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-4">
          <span className="text-6xl block">🎉</span>
          <h2 className="text-2xl font-bold text-foreground">{t("noorani.lessonDone" as any)}</h2>
          <p className="text-muted-foreground">
            {known} / {total} {t("noorani.knownItems" as any)}
          </p>
          {isChildMode && score >= 70 && (
            <p className="text-lg font-bold text-primary">{getChildSuccessMessage()}</p>
          )}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => navigate("/noorani")}
              className="px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-bold"
            >
              {t("noorani.backToLessons" as any)}
            </button>
            <button
              onClick={() => { setCurrent(0); setKnown(0); setFinished(false); setShowConfetti(false); }}
              className="px-5 py-3 rounded-2xl border border-border text-foreground font-bold"
            >
              {t("noorani.retry" as any)}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const item = items[current];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-5 pt-12 pb-3">
        <button onClick={() => navigate("/noorani")} className="flex items-center gap-1 text-muted-foreground mb-3">
          <ArrowLeft size={18} />
          <span className="text-sm">{t("noorani.backToLessons" as any)}</span>
        </button>
        <p className="text-sm font-bold text-foreground">{t(lesson.titleKey as any)}</p>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-2 rounded-full bg-muted/40 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </div>
          <span className="text-[11px] text-muted-foreground font-medium">{current + 1}/{total}</span>
        </div>
      </div>

      {/* Main card */}
      <div className="flex-1 flex items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
            className="bg-card border border-border rounded-3xl p-8 w-full max-w-sm text-center shadow-lg"
          >
            <p className="font-arabic text-7xl leading-tight text-foreground mb-4">{item.arabic}</p>
            {item.label && (
              <p className="text-sm text-muted-foreground font-medium">{item.label}</p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      <div className="px-6 pb-8 flex gap-3">
        <button
          onClick={() => handleChoice(false)}
          className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-border text-foreground font-bold text-sm active:scale-[0.97] transition-transform min-h-[56px]"
        >
          <Eye size={20} />
          {t("noorani.needReview" as any)}
        </button>
        <button
          onClick={() => handleChoice(true)}
          className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-sm active:scale-[0.97] transition-transform min-h-[56px]"
        >
          <ThumbsUp size={20} />
          {t("noorani.iKnow" as any)}
        </button>
      </div>
    </div>
  );
}
