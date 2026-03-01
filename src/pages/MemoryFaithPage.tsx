import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useNavigate } from "react-router-dom";
import { useXP } from "@/hooks/useXP";
import Confetti from "@/components/Confetti";

const MEMORY_CARDS = ["🕋", "📖", "🕌", "🌙", "📿", "🤲"];

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function MemoryFaithPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { addXP } = useXP();
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [xpAwarded, setXpAwarded] = useState(false);

  const initGame = useCallback(() => {
    const shuffled = [...MEMORY_CARDS, ...MEMORY_CARDS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, id) => ({ id, emoji, isFlipped: false, isMatched: false }));
    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setXpAwarded(false);
  }, []);

  useEffect(() => { initGame(); }, [initGame]);

  const isVictory = matched.length === MEMORY_CARDS.length;

  useEffect(() => {
    if (isVictory && !xpAwarded) {
      setXpAwarded(true);
      const xp = Math.max(2, 8 - Math.floor(moves / 3));
      addXP(xp);
    }
  }, [isVictory, xpAwarded, moves, addXP]);

  const handleCardClick = (index: number) => {
    if (flipped.length === 2 || cards[index].isFlipped || cards[index].isMatched) return;

    const newCards = cards.map((c, i) => i === index ? { ...c, isFlipped: true } : c);
    setCards(newCards);
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const isMatch = newCards[newFlipped[0]].emoji === newCards[newFlipped[1]].emoji;
      setTimeout(() => {
        if (isMatch) {
          setCards(prev => prev.map((c, i) =>
            i === newFlipped[0] || i === newFlipped[1] ? { ...c, isMatched: true } : c
          ));
          setMatched(prev => [...prev, newCards[newFlipped[0]].emoji]);
        } else {
          setCards(prev => prev.map((c, i) =>
            i === newFlipped[0] || i === newFlipped[1] ? { ...c, isFlipped: false } : c
          ));
        }
        setFlipped([]);
      }, 900);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-4 pt-10 pb-2">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center active:scale-90 transition-transform">
            <ArrowLeft size={18} className="text-foreground" />
          </button>
          <h1 className="text-base font-bold text-foreground flex items-center gap-1.5 flex-1">
            <span>🧠</span> {t("memoryFaith.title" as any)}
          </h1>
          <div className="bg-primary/15 text-primary px-3 py-1 rounded-full text-xs font-bold">
            {t("memoryFaith.moves" as any)}: {moves}
          </div>
          <button onClick={initGame} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center active:scale-90 transition-transform">
            <RotateCcw size={15} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      <p className="px-4 text-xs text-muted-foreground mb-4">{t("memoryFaith.subtitle" as any)}</p>

      {/* Pairs found */}
      <div className="px-4 mb-3">
        <div className="flex gap-1.5 justify-center">
          {MEMORY_CARDS.map((emoji) => (
            <div key={emoji} className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all duration-300
              ${matched.includes(emoji) ? "bg-primary/20 scale-110" : "bg-muted/40 opacity-40"}`}>
              {emoji}
            </div>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 flex items-start justify-center px-4 pb-8">
        <div className="grid grid-cols-3 gap-3 w-full max-w-[320px]">
          {cards.map((card, idx) => (
            <motion.button
              key={card.id}
              whileTap={{ scale: 0.93 }}
              onClick={() => handleCardClick(idx)}
              className={`aspect-square rounded-2xl flex items-center justify-center text-4xl sm:text-5xl shadow-md border transition-all duration-300
                ${card.isMatched
                  ? "bg-primary/10 border-primary/30 shadow-primary/10"
                  : card.isFlipped
                    ? "bg-card border-border"
                    : "bg-gradient-to-br from-primary/80 to-primary border-primary/40 shadow-lg"
                }`}
              style={{ perspective: 1000 }}
            >
              <motion.span
                initial={false}
                animate={{
                  rotateY: card.isFlipped || card.isMatched ? 0 : 180,
                  scale: card.isMatched ? [1, 1.3, 1] : 1,
                }}
                transition={{ duration: 0.4, type: "spring", damping: 15 }}
                className="select-none pointer-events-none"
              >
                {card.isFlipped || card.isMatched ? card.emoji : "✨"}
              </motion.span>
            </motion.button>
          ))}
        </div>
      </div>

      <Confetti active={isVictory} emoji duration={3000} />

      {/* Victory */}
      <AnimatePresence>
        {isVictory && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.6, y: 40 }} animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", damping: 12 }}
              className="bg-card border border-border rounded-3xl p-6 mx-6 text-center shadow-2xl max-w-sm w-full">
              <span className="text-5xl block mb-3">🏆</span>
              <h2 className="text-xl font-bold text-foreground mb-1">{t("memoryFaith.victory" as any)}</h2>
              <p className="text-sm text-muted-foreground mb-4">
                {t("memoryFaith.victoryDesc" as any, { moves: String(moves) } as any)}
              </p>
              <div className="flex gap-2 justify-center mb-4">
                <span className="bg-primary/15 px-3 py-1 rounded-full text-xs font-semibold text-primary">
                  ⭐ +{Math.max(2, 8 - Math.floor(moves / 3))} XP
                </span>
              </div>
              <button onClick={initGame}
                className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm active:scale-95 transition-transform flex items-center justify-center gap-2">
                <RotateCcw size={16} /> {t("memoryFaith.replay" as any)}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
