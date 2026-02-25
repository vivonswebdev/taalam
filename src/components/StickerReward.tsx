import { motion, AnimatePresence } from "framer-motion";
import type { EarnedSticker, StickerType } from "@/hooks/useChildMode";

const STICKER_EMOJIS: Record<StickerType, string> = {
  star: "⭐",
  moon: "🌙",
  book: "📖",
  trophy: "🏆",
  heart: "💚",
  mosque: "🕌",
};

interface StickerRewardProps {
  sticker: EarnedSticker | null;
  onDismiss: () => void;
}

export default function StickerReward({ sticker, onDismiss }: StickerRewardProps) {
  if (!sticker) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] flex items-center justify-center bg-foreground/30 backdrop-blur-sm px-8"
        onClick={onDismiss}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="bg-card border-2 border-secondary rounded-3xl p-8 text-center shadow-2xl max-w-xs w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.4, 1] }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-7xl mb-4"
          >
            {STICKER_EMOJIS[sticker.type]}
          </motion.div>

          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-2xl font-bold text-foreground mb-2"
          >
            Bravo ! 🎉
          </motion.h3>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-muted-foreground mb-6"
          >
            Tu as gagné un sticker !
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDismiss}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-2xl font-bold text-lg active:scale-[0.98] transition-transform"
          >
            Super ! ✨
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

interface StickerCollectionProps {
  stickers: EarnedSticker[];
}

export function StickerCollection({ stickers }: StickerCollectionProps) {
  if (stickers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-4xl mb-3">🎁</p>
        <p className="text-sm">Pas encore de stickers ! Continue à apprendre pour en gagner !</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-5 gap-3">
      {stickers.map((s, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.05, type: "spring" }}
          className="aspect-square bg-accent rounded-2xl flex items-center justify-center text-2xl"
          title={`Sourate ${s.surahNumber}`}
        >
          {STICKER_EMOJIS[s.type]}
        </motion.div>
      ))}
    </div>
  );
}
