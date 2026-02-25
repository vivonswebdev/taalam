import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  size: number;
  rotation: number;
  emoji?: string;
}

interface ConfettiProps {
  active: boolean;
  emoji?: boolean;
  duration?: number;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--success))",
  "hsl(var(--gold))",
  "#FF6B6B",
  "#4ECDC4",
  "#FFE66D",
  "#A78BFA",
];

const EMOJIS = ["⭐", "🌙", "🏆", "💚", "📖", "🕌", "🎉", "✨"];

export default function Confetti({ active, emoji = false, duration = 3000 }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (!active) {
      setPieces([]);
      return;
    }

    const newPieces: ConfettiPiece[] = Array.from({ length: emoji ? 20 : 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.5,
      size: emoji ? 24 : Math.random() * 8 + 4,
      rotation: Math.random() * 360,
      emoji: emoji ? EMOJIS[Math.floor(Math.random() * EMOJIS.length)] : undefined,
    }));
    setPieces(newPieces);

    const timer = setTimeout(() => setPieces([]), duration);
    return () => clearTimeout(timer);
  }, [active, emoji, duration]);

  return (
    <AnimatePresence>
      {pieces.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
          {pieces.map((piece) => (
            <motion.div
              key={piece.id}
              initial={{
                x: `${piece.x}vw`,
                y: -20,
                rotate: 0,
                opacity: 1,
                scale: 0,
              }}
              animate={{
                y: "110vh",
                rotate: piece.rotation + 720,
                opacity: [1, 1, 0.8, 0],
                scale: [0, 1.2, 1, 0.8],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 2.5 + Math.random(),
                delay: piece.delay,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="absolute"
              style={{ left: 0, top: 0 }}
            >
              {piece.emoji ? (
                <span style={{ fontSize: piece.size }}>{piece.emoji}</span>
              ) : (
                <div
                  style={{
                    width: piece.size,
                    height: piece.size,
                    backgroundColor: piece.color,
                    borderRadius: Math.random() > 0.5 ? "50%" : "2px",
                  }}
                />
              )}
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
