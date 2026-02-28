import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { PRAYER_STEPS, KIDS_PRAYER_QUIZ } from "@/data/kidsPrayer";
import Confetti from "@/components/Confetti";

type Section = "menu" | "steps" | "quiz";

export default function KidsPrayerPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [section, setSection] = useState<Section>("menu");

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <div className="px-5 pt-6">
        <button onClick={() => section === "menu" ? navigate(-1) : setSection("menu")} className="flex items-center gap-2 text-muted-foreground mb-4">
          <ArrowLeft size={20} />
          <span className="text-sm">{t("join.back" as any)}</span>
        </button>
        <div className="text-center mb-6">
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-5xl inline-block mb-2">🕌</motion.span>
          <h1 className="text-2xl font-bold text-foreground">{t("kidsPrayer.title" as any)}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("kidsPrayer.subtitle" as any)}</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {section === "menu" && <MenuSection key="menu" onSelect={setSection} t={t} />}
        {section === "steps" && <PrayerStepViewer key="steps" t={t} />}
        {section === "quiz" && <PrayerQuiz key="quiz" t={t} onBack={() => setSection("menu")} />}
      </AnimatePresence>
    </div>
  );
}

/* ═══ Menu ═══ */
function MenuSection({ onSelect, t }: { onSelect: (s: Section) => void; t: any }) {
  const cards = [
    { id: "steps" as Section, emoji: "🧎", titleKey: "kidsPrayer.menuSteps", descKey: "kidsPrayer.menuStepsDesc", gradient: "from-emerald-600 to-teal-700" },
    { id: "wudu" as Section, emoji: "💧", titleKey: "kidsPrayer.menuWudu", descKey: "kidsPrayer.menuWuduDesc", gradient: "from-sky-600 to-blue-700", disabled: true },
    { id: "quiz" as Section, emoji: "🧠", titleKey: "kidsPrayer.menuQuiz", descKey: "kidsPrayer.menuQuizDesc", gradient: "from-amber-500 to-orange-600" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-5 space-y-3">
      {cards.map((c, i) => (
        <motion.button
          key={c.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          whileTap={c.disabled ? undefined : { scale: 0.97 }}
          onClick={() => !c.disabled && onSelect(c.id)}
          disabled={!!c.disabled}
          className={`w-full flex items-center gap-4 rounded-2xl p-5 text-left bg-gradient-to-r ${c.gradient} ${c.disabled ? "opacity-50" : "shadow-lg"}`}
        >
          <span className="text-3xl">{c.emoji}</span>
          <div className="flex-1">
            <p className="text-base font-bold text-white">{t(c.titleKey as any)}</p>
            <p className="text-xs text-white/70 mt-0.5">{t(c.descKey as any)}</p>
            {c.disabled && <span className="text-[10px] text-white/50 mt-1 block">{t("kidsPrayer.comingSoon" as any)}</span>}
          </div>
          {!c.disabled && <ChevronRight size={20} className="text-white/60" />}
        </motion.button>
      ))}
    </motion.div>
  );
}

/* ═══ Step Viewer ═══ */
function PrayerStepViewer({ t }: { t: any }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const current = PRAYER_STEPS[currentIndex];
  const total = PRAYER_STEPS.length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-5">
      {/* Timeline */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {PRAYER_STEPS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
              i === currentIndex
                ? "bg-primary text-primary-foreground animate-breathe"
                : i < currentIndex
                ? "bg-primary/30 text-primary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <p className="text-center text-xs text-muted-foreground mb-4">
        {t("kidsPrayer.stepOf" as any).replace("{n}", String(currentIndex + 1)).replace("{total}", String(total))}
      </p>

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}
          className="rounded-3xl overflow-hidden bg-card border border-border shadow-lg"
        >
          <motion.div
            className="relative h-56 bg-gradient-to-b from-primary/10 to-transparent flex items-center justify-center overflow-hidden"
          >
            <motion.img
              src={current.image}
              alt={current.id}
              className="h-48 w-48 object-contain animate-breathe"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
            <span className="absolute top-3 left-3 text-2xl">{current.emoji}</span>
          </motion.div>

          <div className="p-5 text-center">
            <motion.h2
              key={`title-${current.id}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-bold text-foreground mb-2"
            >
              {t(current.titleKey as any)}
            </motion.h2>
            <motion.p
              key={`desc-${current.id}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-sm text-muted-foreground leading-relaxed"
            >
              {t(current.descKey as any)}
            </motion.p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3 mt-5">
        <button
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          className="flex-1 py-3.5 rounded-2xl bg-muted text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-1"
        >
          <ChevronLeft size={16} /> {t("kidsPrayer.prev" as any)}
        </button>
        <button
          disabled={currentIndex === total - 1}
          onClick={() => setCurrentIndex((i) => Math.min(total - 1, i + 1))}
          className="flex-1 py-3.5 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-1"
        >
          {t("kidsPrayer.next" as any)} <ChevronRight size={16} />
        </button>
      </div>
    </motion.div>
  );
}

/* ═══ Quiz ═══ */
function PrayerQuiz({ t, onBack }: { t: any; onBack: () => void }) {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const questions = KIDS_PRAYER_QUIZ;
  const current = questions[step];
  const isDone = step >= questions.length;

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const correct = current.options[idx].correct;
    if (correct) setScore((s) => s + 1);
    setTimeout(() => {
      setSelected(null);
      setStep((s) => s + 1);
      if (step + 1 >= questions.length && correct) setShowConfetti(true);
      else if (step + 1 >= questions.length) setShowConfetti(true);
    }, 800);
  };

  if (isDone) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="px-5 text-center py-8">
        {showConfetti && <Confetti />}
        <span className="text-6xl inline-block mb-4">{score >= 3 ? "🏆" : "💪"}</span>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {score >= 3 ? t("kidsPrayer.quizBravo" as any) : t("kidsPrayer.quizTryAgain" as any)}
        </h2>
        <p className="text-lg text-muted-foreground mb-6">
          {score}/{questions.length} {t("noorani.quizCorrect" as any)}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => { setStep(0); setScore(0); setShowConfetti(false); }}
            className="flex-1 py-3 rounded-2xl bg-muted text-sm font-semibold flex items-center justify-center gap-1"
          >
            <RotateCcw size={14} /> {t("kidsPrayer.restart" as any)}
          </button>
          <button
            onClick={onBack}
            className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold"
          >
            {t("join.back" as any)}
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-5">
      <p className="text-xs text-muted-foreground text-center mb-2">
        {t("kidsPrayer.stepOf" as any).replace("{n}", String(step + 1)).replace("{total}", String(questions.length))}
      </p>
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          className="bg-card border border-border rounded-2xl p-5 mb-4"
        >
          <p className="text-base font-bold text-foreground text-center mb-5">
            {t(current.questionKey as any)}
          </p>
          <div className="space-y-3">
            {current.options.map((opt, idx) => {
              const isSelected = selected === idx;
              const isCorrect = opt.correct;
              let bg = "bg-muted/50 border-border";
              if (selected !== null && isSelected) {
                bg = isCorrect ? "bg-green-500/20 border-green-500" : "bg-red-500/20 border-red-500";
              } else if (selected !== null && isCorrect) {
                bg = "bg-green-500/10 border-green-500/40";
              }
              return (
                <motion.button
                  key={idx}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSelect(idx)}
                  className={`w-full py-4 px-4 rounded-2xl border text-left font-semibold text-sm transition-colors ${bg}`}
                >
                  {t(opt.labelKey as any)}
                  {selected !== null && isSelected && (
                    <span className="ml-2">{isCorrect ? "✅" : "❌"}</span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
