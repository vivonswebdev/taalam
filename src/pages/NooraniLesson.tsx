import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ThumbsUp, Eye, Volume2, CheckCircle2, XCircle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { NOORANI_LESSONS, type NooraniItem, type NooraniLesson as NooraniLessonType } from "@/data/nooraniLessons";
import { useChildMode } from "@/hooks/useChildMode";
import { useNooraniAudio } from "@/hooks/useNooraniAudio";
import { useNooraniProgress } from "@/hooks/useNooraniProgress";
import { getChildSuccessMessage } from "@/lib/childMessages";
import Confetti from "@/components/Confetti";
import StickerReward from "@/components/StickerReward";
import type { EarnedSticker } from "@/hooks/useChildMode";

type Phase = "items" | "exercise" | "quiz" | "done";

type NooraniQuestion = {
  target: NooraniItem;
  options: NooraniItem[];
  correctIndex: number;
};

function generateQuiz(items: NooraniItem[]): NooraniQuestion[] {
  const count = Math.min(3, items.length);
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  const targets = shuffled.slice(0, count);

  return targets.map((target) => {
    const others = items.filter((it) => it.arabic !== target.arabic).sort(() => Math.random() - 0.5).slice(0, 2);
    const options = [target, ...others].sort(() => Math.random() - 0.5);
    return {
      target,
      options,
      correctIndex: options.findIndex((o) => o.arabic === target.arabic),
    };
  });
}

// ═══════════════════════════════════════════
// Recognition Exercise (lettres isolées)
// ═══════════════════════════════════════════
function RecognitionExercise({
  lesson,
  onDone,
  playAudio,
}: {
  lesson: NooraniLessonType;
  onDone: () => void;
  playAudio: (item: NooraniItem) => void;
}) {
  const [step, setStep] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState(0);

  const questions = useMemo(() => {
    const base = lesson.items.slice(0, 6);
    return base.slice(0, 3).map((target) => {
      const others = base.filter((x) => x.arabic !== target.arabic).sort(() => 0.5 - Math.random()).slice(0, 2);
      const options = [target, ...others].sort(() => 0.5 - Math.random());
      return { target, options };
    });
  }, [lesson.items]);

  const current = questions[step];

  if (!current) {
    onDone();
    return null;
  }

  const handlePick = (opt: NooraniItem) => {
    if (feedback) return;
    playAudio(opt);
    const isCorrect = opt.arabic === current.target.arabic;
    if (isCorrect) setScore((s) => s + 1);
    setFeedback(isCorrect ? "correct" : "wrong");
    setTimeout(() => {
      setFeedback(null);
      if (step + 1 >= questions.length) {
        onDone();
      } else {
        setStep((s) => s + 1);
      }
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
      <motion.div key={step} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-3">
        <p className="text-sm font-bold text-muted-foreground">
          ✏️ Exercice {step + 1}/{questions.length}
        </p>
        <p className="text-lg font-semibold text-foreground">
          Où est la lettre :
        </p>
        <p className="font-arabic text-6xl text-primary">{current.target.arabic}</p>
      </motion.div>

      <div className="flex gap-3 w-full max-w-sm">
        {current.options.map((opt, i) => {
          let bgClass = "bg-card border-border";
          if (feedback) {
            if (opt.arabic === current.target.arabic) bgClass = "bg-green-500/15 border-green-500";
            else bgClass = "bg-card border-border opacity-50";
          }
          return (
            <motion.button
              key={i}
              whileTap={!feedback ? { scale: 0.95 } : undefined}
              onClick={() => handlePick(opt)}
              disabled={!!feedback}
              className={`flex-1 h-20 rounded-2xl border-2 text-3xl font-arabic flex items-center justify-center transition-colors ${bgClass}`}
            >
              {opt.arabic}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
              feedback === "correct" ? "bg-green-500/15 text-green-600" : "bg-red-500/15 text-red-500"
            }`}
          >
            {feedback === "correct" ? (
              <><CheckCircle2 size={18} /> Bravo ! 🎉</>
            ) : (
              <><XCircle size={18} /> Essaie encore 😊</>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════
// Audio Choice Exercise (voyelles)
// ═══════════════════════════════════════════
function AudioChoiceExercise({
  lesson,
  onDone,
  playAudio,
}: {
  lesson: NooraniLessonType;
  onDone: () => void;
  playAudio: (item: NooraniItem) => void;
}) {
  const [step, setStep] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const questions = useMemo(() => {
    const base = lesson.items.slice(0, 6);
    return base.slice(0, 3).map((target) => {
      const others = base.filter((x) => x.arabic !== target.arabic).sort(() => 0.5 - Math.random()).slice(0, 2);
      const options = [target, ...others].sort(() => 0.5 - Math.random());
      return { target, options };
    });
  }, [lesson.items]);

  const current = questions[step];

  if (!current) {
    onDone();
    return null;
  }

  const handlePick = (opt: NooraniItem) => {
    if (feedback) return;
    const isCorrect = opt.arabic === current.target.arabic;
    setFeedback(isCorrect ? "correct" : "wrong");
    setTimeout(() => {
      setFeedback(null);
      if (step + 1 >= questions.length) {
        onDone();
      } else {
        setStep((s) => s + 1);
      }
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
      <motion.div key={step} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-3">
        <p className="text-sm font-bold text-muted-foreground">
          🔊 Exercice {step + 1}/{questions.length}
        </p>
        <p className="text-lg font-semibold text-foreground">
          Écoute et choisis la bonne écriture
        </p>
        <button
          onClick={() => playAudio(current.target)}
          className="mx-auto flex items-center gap-2 px-5 py-3 rounded-full bg-primary/10 text-primary text-base font-semibold active:scale-[0.96] transition-transform"
        >
          <Volume2 size={22} /> Écouter
        </button>
      </motion.div>

      <div className="flex gap-3 w-full max-w-sm">
        {current.options.map((opt, i) => {
          let bgClass = "bg-card border-border";
          if (feedback) {
            if (opt.arabic === current.target.arabic) bgClass = "bg-green-500/15 border-green-500";
            else bgClass = "bg-card border-border opacity-50";
          }
          return (
            <motion.button
              key={i}
              whileTap={!feedback ? { scale: 0.95 } : undefined}
              onClick={() => handlePick(opt)}
              disabled={!!feedback}
              className={`flex-1 h-20 rounded-2xl border-2 text-3xl font-arabic flex items-center justify-center transition-colors ${bgClass}`}
            >
              {opt.arabic}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
              feedback === "correct" ? "bg-green-500/15 text-green-600" : "bg-red-500/15 text-red-500"
            }`}
          >
            {feedback === "correct" ? (
              <><CheckCircle2 size={18} /> Bravo ! 🎉</>
            ) : (
              <><XCircle size={18} /> Essaie encore 😊</>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════
// Main NooraniLesson page
// ═══════════════════════════════════════════
export default function NooraniLesson() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isChildMode, earnSticker } = useChildMode();
  const { speak } = useNooraniAudio();
  const { saveProgress } = useNooraniProgress();

  const lesson = NOORANI_LESSONS.find((l) => l.id === lessonId);
  const [phase, setPhase] = useState<Phase>("items");
  const [current, setCurrent] = useState(0);
  const [known, setKnown] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [earnedSticker, setEarnedSticker] = useState<EarnedSticker | null>(null);

  // Quiz state
  const [questions, setQuestions] = useState<NooraniQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState<"correct" | "wrong" | null>(null);

  const items = lesson?.items || [];
  const total = items.length;
  const progress = phase === "items"
    ? (total > 0 ? Math.round((current / total) * 100) : 0)
    : 100;

  const handleChoice = (isKnown: boolean) => {
    if (isKnown) setKnown((k) => k + 1);
    if (current + 1 >= total) {
      // If lesson has an exercise type, go to exercise first
      if (lesson?.exerciseType) {
        setPhase("exercise");
      } else {
        startQuiz();
      }
    } else {
      setCurrent((c) => c + 1);
    }
  };

  const startQuiz = () => {
    const q = generateQuiz(items);
    setQuestions(q);
    setQuizIndex(0);
    setQuizScore(0);
    setQuizFeedback(null);
    setPhase("quiz");
  };

  const handleQuizAnswer = (optionIndex: number) => {
    if (quizFeedback) return;
    const q = questions[quizIndex];
    const isCorrect = optionIndex === q.correctIndex;
    if (isCorrect) setQuizScore((s) => s + 1);
    setQuizFeedback(isCorrect ? "correct" : "wrong");

    setTimeout(() => {
      setQuizFeedback(null);
      if (quizIndex + 1 >= questions.length) {
        const finalScore = isCorrect ? quizScore + 1 : quizScore;
        setQuizScore(finalScore);
        if (finalScore >= 2 && lessonId) {
          saveProgress(lessonId);
          setShowConfetti(true);
          if (isChildMode) {
            const s = earnSticker(0);
            setEarnedSticker(s);
          }
        }
        setPhase("done");
      } else {
        setQuizIndex((i) => i + 1);
      }
    }, 1200);
  };

  const resetLesson = () => {
    setPhase("items");
    setCurrent(0);
    setKnown(0);
    setQuizIndex(0);
    setQuizScore(0);
    setQuizFeedback(null);
    setShowConfetti(false);
    setEarnedSticker(null);
  };

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{t("noorani.lessonNotFound" as any)}</p>
      </div>
    );
  }

  // ═══ DONE PHASE ═══
  if (phase === "done") {
    const passed = quizScore >= 2;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <Confetti active={showConfetti} emoji />
        <StickerReward sticker={earnedSticker} onDismiss={() => setEarnedSticker(null)} />
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-4">
          <span className="text-6xl block">{passed ? "🎉" : "📖"}</span>
          <h2 className="text-2xl font-bold text-foreground">
            {passed ? (t("noorani.lessonDone" as any)) : (t("noorani.tryAgainLater" as any) || "On refait plus tard, inshaAllah")}
          </h2>
          <p className="text-muted-foreground">
            {quizScore} / {questions.length} {t("noorani.quizCorrect" as any) || "bonnes réponses"}
          </p>
          {isChildMode && passed && (
            <p className="text-lg font-bold text-primary">{getChildSuccessMessage()}</p>
          )}
          {!passed && (
            <p className="text-sm text-muted-foreground">
              {t("noorani.reviewLetters" as any) || "Tu peux revoir les lettres."}
            </p>
          )}
          <div className="flex gap-3 pt-4">
            <button onClick={() => navigate("/noorani")} className="px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-bold">
              {t("noorani.backToLessons" as any)}
            </button>
            <button onClick={resetLesson} className="px-5 py-3 rounded-2xl border border-border text-foreground font-bold">
              {t("noorani.retry" as any)}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ═══ EXERCISE PHASE ═══
  if (phase === "exercise") {
    return (
      <div className="min-h-screen flex flex-col pb-20">
        <div className="px-5 pt-10 pb-2">
          <button onClick={() => navigate("/noorani")} className="flex items-center gap-1 text-muted-foreground mb-2">
            <ArrowLeft size={18} />
            <span className="text-sm">{t("noorani.backToLessons" as any)}</span>
          </button>
          <p className="text-sm font-bold text-foreground">{t(lesson.titleKey as any)} – Exercice</p>
          <div className="mt-1.5 h-2 rounded-full bg-muted/40 overflow-hidden">
            <div className="h-full rounded-full bg-primary w-full" />
          </div>
        </div>

        {lesson.exerciseType === "recognition" && (
          <RecognitionExercise
            lesson={lesson}
            playAudio={(item) => speak(item.arabic)}
            onDone={startQuiz}
          />
        )}

        {lesson.exerciseType === "audio-choice" && (
          <AudioChoiceExercise
            lesson={lesson}
            playAudio={(item) => speak(item.arabic)}
            onDone={startQuiz}
          />
        )}
      </div>
    );
  }

  // ═══ QUIZ PHASE ═══
  if (phase === "quiz") {
    const q = questions[quizIndex];
    return (
      <div className="min-h-screen flex flex-col pb-20">
        <div className="px-5 pt-10 pb-2">
          <button onClick={() => navigate("/noorani")} className="flex items-center gap-1 text-muted-foreground mb-2">
            <ArrowLeft size={18} />
            <span className="text-sm">{t("noorani.backToLessons" as any)}</span>
          </button>
          <p className="text-sm font-bold text-foreground">
            🧠 {t("noorani.quizTitle" as any) || "Quiz"} – {quizIndex + 1}/{questions.length}
          </p>
          <div className="mt-1.5 h-2 rounded-full bg-muted/40 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              animate={{ width: `${((quizIndex + 1) / questions.length) * 100}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          <motion.div key={quizIndex} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-3">
            <p className="text-lg font-semibold text-foreground">
              {t("noorani.quizQuestion" as any) || "Où est la lettre"} :
            </p>
            <p className="font-arabic text-6xl text-primary">{q.target.arabic}</p>
            {q.target.label && <p className="text-sm text-muted-foreground">({q.target.label})</p>}
          </motion.div>

          <div className="flex gap-3 w-full max-w-sm">
            {q.options.map((opt, i) => {
              let bgClass = "bg-card border-border";
              if (quizFeedback) {
                if (i === q.correctIndex) bgClass = "bg-green-500/15 border-green-500";
                else if (quizFeedback === "wrong") bgClass = "bg-card border-border opacity-50";
              }
              return (
                <motion.button
                  key={i}
                  whileTap={!quizFeedback ? { scale: 0.95 } : undefined}
                  onClick={() => handleQuizAnswer(i)}
                  disabled={!!quizFeedback}
                  className={`flex-1 h-20 rounded-2xl border-2 text-3xl font-arabic flex items-center justify-center transition-colors ${bgClass}`}
                >
                  {opt.arabic}
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {quizFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
                  quizFeedback === "correct" ? "bg-green-500/15 text-green-600" : "bg-red-500/15 text-red-500"
                }`}
              >
                {quizFeedback === "correct" ? (
                  <><CheckCircle2 size={18} /> {t("noorani.quizCorrectFeedback" as any) || "Bravo ! 🎉"}</>
                ) : (
                  <><XCircle size={18} /> {t("noorani.quizWrongFeedback" as any) || "Essaie encore 😊"}</>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ═══ ITEMS PHASE ═══
  const item = items[current];

  return (
    <div className="min-h-screen flex flex-col pb-20">
      <div className="px-5 pt-10 pb-2">
        <button onClick={() => navigate("/noorani")} className="flex items-center gap-1 text-muted-foreground mb-2">
          <ArrowLeft size={18} />
          <span className="text-sm">{t("noorani.backToLessons" as any)}</span>
        </button>
        <p className="text-sm font-bold text-foreground">{t(lesson.titleKey as any)}</p>
        <div className="mt-1.5 flex items-center gap-2">
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

      <div className="flex items-start justify-center px-6 pt-4 pb-4">
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
            {item.label && <p className="text-sm text-muted-foreground font-medium mb-3">{item.label}</p>}
            <button
              onClick={() => speak(item.arabic)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors min-h-[44px] bg-primary/10 text-primary active:scale-[0.96]"
            >
              <Volume2 size={18} />
              {t("noorani.listen" as any)}
            </button>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="px-6 pt-2 flex gap-3">
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
