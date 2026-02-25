import { motion } from "framer-motion";
import { type ReactNode } from "react";

interface RoundActionButtonProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
  delay?: number;
}

export default function RoundActionButton({ icon, title, subtitle, onClick, delay = 0 }: RoundActionButtonProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 300, damping: 25 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="group w-full flex items-center gap-5 rounded-[2rem] p-5 text-left transition-shadow
        bg-gradient-to-r from-primary to-accent-foreground
        shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30
        active:shadow-md"
    >
      <div className="shrink-0 w-14 h-14 rounded-2xl bg-primary-foreground/15 backdrop-blur-sm flex items-center justify-center text-3xl">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-lg font-bold text-primary-foreground leading-tight">{title}</p>
        <p className="text-sm text-primary-foreground/70 mt-0.5">{subtitle}</p>
      </div>
      <svg className="shrink-0 w-5 h-5 text-primary-foreground/60 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </motion.button>
  );
}
