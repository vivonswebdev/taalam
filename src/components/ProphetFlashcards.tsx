import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, RotateCcw, Trophy } from "lucide-react";
import { prophetFlashcards, type ProphetFlashcard } from "@/data/quizQuestions";
import { useLanguage } from "@/hooks/useLanguage";

interface ProphetFlashcardsProps {
  onBack: () => void;
}

// Simple spaced repetition: shuffle cards but push recently-seen ones to end
function buildFlashcardOrder(cards: ProphetFlashcard[]): number[] {
  const indices = cards.map((_, i) => i);
  // Fisher-Yates shuffle
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}

export default function ProphetFlashcards({ onBack }: ProphetFlashcardsProps) {
  const { t } = useLanguage();
  const [order, setOrder] = useState<number[]>(() => buildFlashcardOrder(prophetFlashcards));
  const [pointer, setPointer] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mastered, setMastered] = useState<Set<number>>(new Set());

  const currentIndex = order[pointer];
  const card = prophetFlashcards[currentIndex];
  const total = order.length;

  const handleFlip = useCallback(() => setFlipped((f) => !f), []);

  const handleNext = useCallback(() => {
    setFlipped(false);
    if (pointer < total - 1) {
      setPointer((p) => p + 1);
    } else {
      // Re-shuffle excluding mastered, or all if all mastered
      const remaining = order.filter((i) => !mastered.has(i));
      if (remaining.length > 0) {
        const reshuffled = [...remaining].sort(() => Math.random() - 0.5);
        setOrder(reshuffled);
      } else {
        setOrder(buildFlashcardOrder(prophetFlashcards));
      }
      setPointer(0);
    }
  }, [pointer, total, order, mastered]);

  const handlePrev = useCallback(() => {
    setFlipped(false);
    setPointer((p) => Math.max(p - 1, 0));
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
    setOrder(buildFlashcardOrder(prophetFlashcards));
    setPointer(0);
    setFlipped(false);
    setMastered(new Set());
  }, []);

  // Unique prophets count for display
  const uniqueProphets = useMemo(() => new Set(prophetFlashcards.map((c) => c.prophet)).size, []);

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
          <span className="text-xs font-bold">{mastered.size}/{total}</span>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        {uniqueProphets} prophètes · {total} cartes
      </p>

      {/* Progress */}
      <div className="flex gap-0.5">
        {order.map((origIdx, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              mastered.has(origIdx) ? "bg-success" : i === pointer ? "bg-primary" : i < pointer ? "bg-primary/30" : "bg-muted"
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
                <>
                  <span className="text-6xl mb-4">{card.emoji}</span>
                  <h2 className="text-2xl font-bold text-foreground mb-2">{card.prophet}</h2>
                  <p className="font-arabic text-xl text-primary mb-2">{card.prophetAr}</p>
                  {card.cardType && card.cardType !== "main" && (
                    <span className="text-[10px] font-bold uppercase bg-muted text-muted-foreground px-2 py-0.5 rounded-full mb-2">
                      {card.cardType === "lesson" ? "Leçon" : card.cardType === "trial" ? "Épreuve" : card.cardType === "people" ? "Peuple" : ""}
                    </span>
                  )}
                  <p className="text-xs text-muted-foreground">{t("flashcards.tapToReveal")}</p>
                </>
              ) : (
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
          disabled={pointer === 0}
          className="w-12 h-12 rounded-full bg-muted flex items-center justify-center disabled:opacity-30"
        >
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <span className="text-sm text-muted-foreground font-medium">
          {pointer + 1} / {total}
        </span>
        <button
          onClick={handleNext}
          className="w-12 h-12 rounded-full bg-primary flex items-center justify-center"
        >
          <ArrowRight size={20} className="text-primary-foreground" />
        </button>
      </div>

      {/* All mastered */}
      {mastered.size === total && (
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
