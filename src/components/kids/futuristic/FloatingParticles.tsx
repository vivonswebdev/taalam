import { motion } from "framer-motion";
import { useMemo } from "react";

const EMOJIS = ["⭐", "🌙", "✨", "💫", "🌟", "🔮", "💎", "🦋"];

export function FloatingParticles({ count = 12 }: { count?: number }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        emoji: EMOJIS[i % EMOJIS.length],
        x: `${(i * 37 + 11) % 100}%`,
        size: 10 + (i % 4) * 4,
        duration: 6 + (i % 5) * 2,
        delay: (i * 0.7) % 4,
      })),
    [count]
  );

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute opacity-30"
          style={{ left: p.x, fontSize: p.size, bottom: "-20px" }}
          animate={{ y: [0, -800], opacity: [0, 0.5, 0] }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeOut",
          }}
        >
          {p.emoji}
        </motion.span>
      ))}
    </div>
  );
}
