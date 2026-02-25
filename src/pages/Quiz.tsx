import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, XCircle, Trophy } from "lucide-react";
import { quizQuestions } from "@/data/quizQuestions";
import { useProgress } from "@/hooks/useProgress";
import { useLanguage } from "@/hooks/useLanguage";

export default function Quiz() {
  const navigate = useNavigate();
  const { setLevel } = useProgress();
  const { t } = useLanguage();
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  const question = quizQuestions[current];

  const handleSelect = useCallback(
    (idx: number) => {
      if (selected !== null) return;
      setSelected(idx);
      const correct = idx === question.correctIndex;
      if (correct) setScore((s) => s + 1);

      setTimeout(() => {
        if (current < quizQuestions.length - 1) {
          setCurrent((c) => c + 1);
          setSelected(null);
        } else {
          const finalScore = correct ? score + 1 : score;
          const level = finalScore <= 2 ? "easy" : finalScore <= 4 ? "medium" : "hard";
          setLevel(level as "easy" | "medium" | "hard", finalScore);
          setFinished(true);
        }
      }, 1000);
    },
    [selected, current, question, score, setLevel]
  );

  if (finished) {
    const finalScore = score;
    const levelLabel = finalScore <= 2 ? t("home.level.easy") : finalScore <= 4 ? t("home.level.medium") : t("home.level.hard");
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }} className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center mb-6">
          <Trophy size={36} className="text-secondary" />
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-2xl font-bold text-foreground">
          {t("quiz.bravo")}
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="text-muted-foreground mt-2">
          {t("quiz.score")} : {finalScore}/{quizQuestions.length}
        </motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-lg font-semibold text-primary mt-1">
          {t("quiz.levelLabel")} : {levelLabel}
        </motion.p>
        <motion.button initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} onClick={() => navigate("/learn")} className="mt-8 bg-primary text-primary-foreground rounded-2xl px-8 py-4 font-semibold active:scale-[0.98] transition-transform">
          {t("quiz.startLearning")}
        </motion.button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      <div className="px-6 pt-14 pb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground mb-6">
          <ArrowLeft size={20} />
          <span className="text-sm">{t("quiz.back")}</span>
        </button>

        <div className="flex gap-1.5 mb-8">
          {quizQuestions.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i < current ? "bg-primary" : i === current ? "bg-primary/50" : "bg-muted"}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={current} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
            <p className="text-xs text-muted-foreground font-medium mb-2">
              {t("quiz.question")} {current + 1}/{quizQuestions.length}
            </p>
            <h2 className="text-xl font-bold text-foreground mb-8">{question.question}</h2>

            <div className="space-y-3">
              {question.options.map((option, idx) => {
                const isSelected = selected === idx;
                const isCorrect = idx === question.correctIndex;
                let style = "bg-card border-border text-card-foreground";
                if (selected !== null) {
                  if (isCorrect) style = "bg-success/10 border-success text-success";
                  else if (isSelected) style = "bg-destructive/10 border-destructive text-destructive";
                }
                return (
                  <motion.button key={idx} whileTap={{ scale: 0.97 }} onClick={() => handleSelect(idx)} className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left font-medium ${style}`}>
                    <span className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center text-sm shrink-0">
                      {selected !== null && isCorrect ? <CheckCircle2 size={18} /> : selected !== null && isSelected ? <XCircle size={18} /> : String.fromCharCode(65 + idx)}
                    </span>
                    {option}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
