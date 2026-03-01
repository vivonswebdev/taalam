import { useQuranXp } from "@/hooks/useQuranXp";
import { motion, AnimatePresence } from "framer-motion";

export default function FloatingXpWidget() {
  const { xp, level, levelProgress, badge, lastGain } = useQuranXp();

  return (
    <div className="fixed top-3 right-3 z-50 flex items-center gap-1.5 bg-background/80 backdrop-blur-md border border-border rounded-full pl-2 pr-3 py-1 shadow-lg">
      <span className="text-base">{badge.emoji}</span>
      <div className="flex flex-col items-start leading-none">
        <span className="text-[10px] font-bold text-foreground">Niv. {level}</span>
        <div className="w-14 h-1.5 bg-muted rounded-full overflow-hidden mt-0.5">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={false}
            animate={{ width: `${levelProgress.percent}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>
      </div>
      <span className="text-[10px] font-semibold text-muted-foreground ml-0.5">{xp}</span>
      <AnimatePresence>
        {lastGain && (
          <motion.span
            key={lastGain + Date.now()}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -18 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute -top-3 right-2 text-xs font-bold text-primary"
          >
            +{lastGain}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
