import { useState, useEffect } from "react";
import { useQuranXp } from "@/hooks/useQuranXp";
import { AnimatePresence, motion } from "framer-motion";

export default function FloatingXpWidget() {
  const { xp, level, levelProgress, badge, lastGain } = useQuranXp();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setCollapsed(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Expand briefly on new XP gain
  useEffect(() => {
    if (lastGain) {
      setCollapsed(false);
      const timer = setTimeout(() => setCollapsed(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [lastGain]);

  return (
    <button
      onClick={() => setCollapsed((c) => !c)}
      className="fixed top-3 right-3 z-50 flex items-center gap-1.5 bg-background/80 backdrop-blur-md border border-border rounded-full pl-2 pr-3 py-1 shadow-lg transition-all duration-300 cursor-pointer"
    >
      <span className="text-base">{badge.emoji}</span>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ width: collapsed ? 0 : "auto", maxWidth: collapsed ? 0 : 120, opacity: collapsed ? 0 : 1 }}
      >
        <div className="flex items-center gap-1.5 whitespace-nowrap">
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
          <span className="text-[10px] font-semibold text-muted-foreground">{xp}</span>
        </div>
      </div>
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
    </button>
  );
}
