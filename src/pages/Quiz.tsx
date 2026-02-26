import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, XCircle, Trophy, BookOpen, Star, Sparkles, Baby } from "lucide-react";
import { getQuizByCategory, buildQuizSession, type QuizCategory, type QuizQuestion } from "@/data/quizQuestions";
import { useProgress } from "@/hooks/useProgress";
import { useLanguage } from "@/hooks/useLanguage";
import ProphetFlashcards from "@/components/ProphetFlashcards";
import { useXP } from "@/hooks/useXP";
import ProgressBarDuolingo from "@/components/ProgressBarDuolingo";

// Persist quiz stats in localStorage
const QUIZ_STATS_KEY = "quranEasyQuizStats";

interface QuizStats {
  general: { completed: number; totalCorrect: number; totalQuestions: number };
  memorization: { completed: number; totalCorrect: number; totalQuestions: number };
  tajweed: { completed: number; totalCorrect: number; totalQuestions: number };
  kids: { completed: number; totalCorrect: number; totalQuestions: number };
  perfect: { completed: number; totalCorrect: number; totalQuestions: number };
}

function loadQuizStats(): QuizStats {
  try {
    const stored = localStorage.getItem(QUIZ_STATS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (!parsed.perfect) parsed.perfect = { completed: 0, totalCorrect: 0, totalQuestions: 0 };
      return parsed;
    }
  } catch {}
  return {
    general: { completed: 0, totalCorrect: 0, totalQuestions: 0 },
    memorization: { completed: 0, totalCorrect: 0, totalQuestions: 0 },
    tajweed: { completed: 0, totalCorrect: 0, totalQuestions: 0 },
    kids: { completed: 0, totalCorrect: 0, totalQuestions: 0 },
    perfect: { completed: 0, totalCorrect: 0, totalQuestions: 0 },
  };
}

function saveQuizStats(stats: QuizStats) {
  localStorage.setItem(QUIZ_STATS_KEY, JSON.stringify(stats));
}

export { loadQuizStats, type QuizStats };

export default function Quiz() {
  const navigate = useNavigate();
  const { setLevel } = useProgress();
  const { t } = useLanguage();
  const [category, setCategory] = useState<QuizCategory | null>(null);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const xp = useXP();
  const xpAwardedRef = useRef(false);

  // Pre-shuffled session: built once when category is selected
  const [session, setSession] = useState<QuizQuestion[]>([]);

  const questions = session;
  const question = questions[current];

  const handleSelectCategory = (cat: QuizCategory) => {
    setCategory(cat);
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setFinished(false);
    // Build a shuffled session of 10 from the full pool
    const pool = getQuizByCategory(cat);
    setSession(buildQuizSession(pool, 10));
  };

  const handleSelect = useCallback(
    (idx: number) => {
      if (selected !== null || !question) return;
      setSelected(idx);
      const correct = idx === question.correctIndex;
      if (correct) setScore((s) => s + 1);

      setTimeout(() => {
        if (current < questions.length - 1) {
          setCurrent((c) => c + 1);
          setSelected(null);
        } else {
          const finalScore = correct ? score + 1 : score;
          const stats = loadQuizStats();
          if (category) {
            stats[category].completed += 1;
            stats[category].totalCorrect += finalScore;
            stats[category].totalQuestions += questions.length;
            saveQuizStats(stats);
          }
          if (category === "general") {
            const level = finalScore <= 2 ? "easy" : finalScore <= 4 ? "medium" : "hard";
            setLevel(level as "easy" | "medium" | "hard", finalScore);
          }
          setFinished(true);
          xpAwardedRef.current = false;
        }
      }, 1000);
    },
    [selected, current, question, score, setLevel, category, questions]
  );

  const handleBackToCategories = () => {
    setCategory(null);
    setShowFlashcards(false);
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setFinished(false);
    setSession([]);
  };

  // Flashcards mode
  if (showFlashcards) {
    return (
      <div className="min-h-screen pb-24 px-6 pt-14">
        <ProphetFlashcards onBack={() => setShowFlashcards(false)} />
      </div>
    );
  }

  // ═══ CATEGORY SELECTION ═══
  if (!category) {
    const categories: { id: QuizCategory; icon: typeof BookOpen; emoji: string; color: string }[] = [
      { id: "general", icon: Star, emoji: "📚", color: "bg-primary/10 text-primary" },
      { id: "memorization", icon: BookOpen, emoji: "🧠", color: "bg-secondary/10 text-secondary" },
      { id: "perfect", icon: Trophy, emoji: "🌟", color: "bg-secondary/10 text-secondary" },
      { id: "tajweed", icon: Sparkles, emoji: "📖", color: "bg-success/10 text-success" },
      { id: "kids", icon: Baby, emoji: "🧒", color: "bg-accent text-accent-foreground" },
    ];

    return (
      <div className="min-h-screen pb-24">
        <div className="px-6 pt-14 pb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground mb-6">
            <ArrowLeft size={20} />
            <span className="text-sm">{t("quiz.back")}</span>
          </button>
          <h1 className="text-2xl font-bold text-foreground mb-2">{t("quiz.chooseCategory")}</h1>
        </div>

        <div className="px-6 space-y-3">
          {categories.map((cat, i) => {
            const stats = loadQuizStats()[cat.id];
            const pool = getQuizByCategory(cat.id);
            const successRate = stats.totalQuestions > 0
              ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
              : null;

            return (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => handleSelectCategory(cat.id)}
                className="w-full flex items-center gap-4 bg-card border border-border rounded-2xl p-4 text-left active:scale-[0.98] transition-transform"
              >
                <div className={`w-12 h-12 rounded-xl ${cat.color} flex items-center justify-center text-2xl`}>
                  {cat.emoji}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">{t(`quiz.category.${cat.id}` as any)}</p>
                    {cat.id === "perfect" && (
                      <span className="text-[9px] font-bold uppercase bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-full">
                        {t("quiz.new")}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {pool.length} questions
                    {successRate !== null && ` · ${successRate}%`}
                    {stats.completed > 0 && ` · ${stats.completed}x`}
                  </p>
                </div>
                <cat.icon size={18} className="text-muted-foreground" />
              </motion.button>
            );
          })}

          {/* Flashcards button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            onClick={() => setShowFlashcards(true)}
            className="w-full flex items-center gap-4 bg-card border-2 border-dashed border-primary/30 rounded-2xl p-4 text-left active:scale-[0.98] transition-transform"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
              🃏
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">{t("quiz.flashcards")}</p>
              <p className="text-xs text-muted-foreground">{t("quiz.flashcardsDesc")}</p>
            </div>
          </motion.button>
        </div>
      </div>
    );
  }

  // ═══ QUIZ FINISHED ═══
  if (finished) {
    const finalScore = score;
    const percentage = Math.round((finalScore / questions.length) * 100);

    if (!xpAwardedRef.current) {
      xpAwardedRef.current = true;
      const xpGain = category === "kids" ? finalScore * 5
        : category === "tajweed" ? finalScore * 3
        : finalScore * 3;
      if (xpGain > 0) xp.addXP(xpGain);
    }

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }} className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center mb-6">
          <Trophy size={36} className="text-secondary" />
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-2xl font-bold text-foreground">
          {t("quiz.bravo")}
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="text-muted-foreground mt-2">
          {t("quiz.score")} : {finalScore}/{questions.length} ({percentage}%)
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="w-full mt-6">
          <ProgressBarDuolingo
            level={xp.level}
            xpInLevel={xp.xpInLevel}
            xpForNext={xp.xpForNext}
            xpTotal={xp.xpTotal}
            xpToday={xp.xpToday}
            streakDays={xp.streakDays}
            lastGain={xp.lastGain}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex gap-3 mt-6">
          <button onClick={handleBackToCategories} className="bg-muted text-foreground rounded-2xl px-6 py-3 font-semibold text-sm">
            {t("quiz.otherQuiz")}
          </button>
          <button onClick={() => handleSelectCategory(category)} className="bg-primary text-primary-foreground rounded-2xl px-6 py-3 font-semibold text-sm">
            {t("quiz.retry")}
          </button>
        </motion.div>
      </div>
    );
  }

  // ═══ QUIZ QUESTIONS ═══
  return (
    <div className="min-h-screen pb-8">
      <div className="px-6 pt-14 pb-6">
        <button onClick={handleBackToCategories} className="flex items-center gap-2 text-muted-foreground mb-6">
          <ArrowLeft size={20} />
          <span className="text-sm">{t("quiz.back")}</span>
        </button>

        <div className="flex gap-1.5 mb-8">
          {questions.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i < current ? "bg-primary" : i === current ? "bg-primary/50" : "bg-muted"}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={current} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
            <p className="text-xs text-muted-foreground font-medium mb-2">
              {t("quiz.question")} {current + 1}/{questions.length}
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
