import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, RotateCcw, Trophy } from "lucide-react";
import { prophetFlashcards, type ProphetFlashcard } from "@/data/quizQuestions";
import { useLanguage } from "@/hooks/useLanguage";

interface ProphetFlashcardsProps {
  onBack: () => void;
}

export default function ProphetFlashcards({ onBack }: ProphetFlashcardsProps) {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mastered, setMastered] = useState<Set<number>>(new Set());

  const card = prophetFlashcards[currentIndex];

  const handleFlip = useCallback(() => setFlipped((f) => !f), []);

  const handleNext = useCallback(() => {
    setFlipped(false);
    setCurrentIndex((i) => Math.min(i + 1, prophetFlashcards.length - 1));
  }, []);

  const handlePrev = useCallback(() => {
    setFlipped(false);
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  const handleMastered = useCallback(() => {
    setMastered((prev) => {
      const next = new Set(prev);
      if (next.has(currentIndex)) next.delete(currentIndex);
      else next.add(currentIndex);
      return next;
    });
  }, [currentIndex]);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setFlipped(false);
    setMastered(new Set());
  }, []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground text-sm">
          <ArrowLeft size={18} />
          {t("quiz.back")}
        </button>
        <div className="flex items-center gap-2 bg-secondary/15 text-secondary px-3 py-1.5 rounded-full">
          <Trophy size={14} />
          <span className="text-xs font-bold">{mastered.size}/{prophetFlashcards.length}</span>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-1">
        {prophetFlashcards.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              mastered.has(i) ? "bg-success" : i === currentIndex ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Card */}
      <div className="flex justify-center">
        <motion.div
          onClick={handleFlip}
          className="w-full max-w-xs aspect-[3/4] cursor-pointer perspective-1000"
          whileTap={{ scale: 0.97 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentIndex}-${flipped}`}
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`w-full h-full rounded-3xl border-2 p-6 flex flex-col items-center justify-center text-center ${
                mastered.has(currentIndex)
                  ? "border-success/50 bg-success/5"
                  : "border-primary/30 bg-card"
              }`}
            >
              {!flipped ? (
                /* Front: Prophet name */
                <>
                  <span className="text-6xl mb-4">{card.emoji}</span>
                  <h2 className="text-2xl font-bold text-foreground mb-2">{card.prophet}</h2>
                  <p className="font-arabic text-xl text-primary mb-4">{card.prophetAr}</p>
                  <p className="text-xs text-muted-foreground">{t("flashcards.tapToReveal")}</p>
                </>
              ) : (
                /* Back: Event + Surah */
                <>
                  <span className="text-4xl mb-3">{card.emoji}</span>
                  <p className="text-sm text-foreground font-medium leading-relaxed mb-4">{card.event}</p>
                  {card.surah && (
                    <p className="text-xs text-primary font-semibold">📖 Sourate {card.surah}</p>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleMastered(); }}
                    className={`mt-4 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                      mastered.has(currentIndex)
                        ? "bg-success/15 text-success"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {mastered.has(currentIndex) ? "✓ Maîtrisé !" : "Marquer comme maîtrisé"}
                  </button>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-4">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="w-12 h-12 rounded-full bg-muted flex items-center justify-center disabled:opacity-30"
        >
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <span className="text-sm text-muted-foreground font-medium">
          {currentIndex + 1} / {prophetFlashcards.length}
        </span>
        <button
          onClick={handleNext}
          disabled={currentIndex === prophetFlashcards.length - 1}
          className="w-12 h-12 rounded-full bg-primary flex items-center justify-center disabled:opacity-30"
        >
          <ArrowRight size={20} className="text-primary-foreground" />
        </button>
      </div>

      {/* Restart */}
      {mastered.size === prophetFlashcards.length && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3">
          <p className="text-lg font-bold text-success">🌟 Toutes les cartes maîtrisées !</p>
          <button onClick={handleRestart} className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm">
            <RotateCcw size={16} />
            Recommencer
          </button>
        </motion.div>
      )}
    </div>
  );
}
