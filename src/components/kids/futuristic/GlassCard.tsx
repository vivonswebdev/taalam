import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  gradient?: "primary" | "cosmic" | "sunset" | "forest";
  className?: string;
  onClick?: () => void;
  delay?: number;
}

const GRADIENT_MAP: Record<string, string> = {
  primary: "from-purple-500/30 via-blue-500/20 to-cyan-500/20",
  cosmic: "from-blue-400/30 via-cyan-400/20 to-teal-400/20",
  sunset: "from-pink-400/30 via-orange-400/20 to-yellow-400/20",
  forest: "from-cyan-500/30 via-purple-500/20 to-indigo-500/20",
};

export function GlassCard({
  children,
  gradient = "primary",
  className,
  onClick,
  delay = 0,
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 260, damping: 22 }}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-3xl",
        "backdrop-blur-xl border border-white/20",
        `bg-gradient-to-br ${GRADIENT_MAP[gradient]}`,
        "shadow-[0_8px_32px_rgba(0,0,0,0.12)]",
        "cursor-pointer transition-shadow duration-300",
        "hover:shadow-[0_12px_40px_rgba(100,100,255,0.2)]",
        className
      )}
    >
      {/* Shimmer overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
