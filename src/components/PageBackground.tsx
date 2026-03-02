import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

type IntensityLevel = "subtle" | "medium" | "immersive";

interface PageBackgroundProps {
  intensity?: IntensityLevel;
  children: React.ReactNode;
}

const CONFIGS = {
  subtle: {
    particleCount: 12,
    particleOpacity: 0.15,
    gradientOpacity: 0.04,
    animDuration: 30,
  },
  medium: {
    particleCount: 20,
    particleOpacity: 0.2,
    gradientOpacity: 0.07,
    animDuration: 25,
  },
  immersive: {
    particleCount: 30,
    particleOpacity: 0.3,
    gradientOpacity: 0.12,
    animDuration: 20,
  },
} as const;

export default function PageBackground({
  intensity = "medium",
  children,
}: PageBackgroundProps) {
  const shouldReduceMotion = useReducedMotion();

  const config = CONFIGS[intensity];

  const particles = useMemo(() => {
    return Array.from({ length: config.particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 3 + Math.random() * 4,
      delay: Math.random() * config.animDuration,
      duration: config.animDuration + Math.random() * 10,
    }));
  }, [config.particleCount, config.animDuration]);

  if (shouldReduceMotion) {
    return <div className="relative min-h-screen">{children}</div>;
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Gradient orbs */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -20, 15, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{ duration: config.animDuration, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-1/4 -right-1/4 w-[60vw] h-[60vw] rounded-full"
          style={{
            background: `radial-gradient(circle, hsl(var(--primary) / ${config.gradientOpacity}), transparent 70%)`,
          }}
        />
        <motion.div
          animate={{
            x: [0, -25, 20, 0],
            y: [0, 25, -10, 0],
            scale: [1, 0.95, 1.08, 1],
          }}
          transition={{ duration: config.animDuration + 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-1/4 -left-1/4 w-[50vw] h-[50vw] rounded-full"
          style={{
            background: `radial-gradient(circle, hsl(var(--accent) / ${config.gradientOpacity}), transparent 70%)`,
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-primary"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${p.y}%`,
              opacity: config.particleOpacity,
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, 15, -10, 0],
              opacity: [config.particleOpacity, config.particleOpacity * 1.5, config.particleOpacity],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-0">{children}</div>
    </div>
  );
}
