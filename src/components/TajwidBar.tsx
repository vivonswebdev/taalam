import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TajwidRule } from "@/data/tajwidRules";
import TajwidTutorialSheet from "@/components/TajwidTutorialSheet";

interface TajwidBarProps {
  /** Active rules for the current word */
  activeRules: TajwidRule[];
  /** Rules coming up in the next few words */
  nextRule?: { rule: TajwidRule; wordsAhead: number } | null;
  /** Whether the bar is visible */
  visible?: boolean;
}

export default function TajwidBar({ activeRules, nextRule, visible = true }: TajwidBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedRule, setSelectedRule] = useState<TajwidRule | null>(null);

  // Auto-scroll to start when rules change
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = 0;
  }, [activeRules]);

  if (!visible) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="bg-card/95 backdrop-blur-sm border border-border rounded-xl px-3 py-2 space-y-1.5"
        >
          {/* Active rules */}
          {activeRules.length > 0 ? (
            <>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Tajwid en cours
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-[9px] text-muted-foreground ml-auto">tap = détails</span>
              </div>
              <div
                ref={scrollRef}
                className="flex gap-2 overflow-x-auto scrollbar-hide pb-1"
              >
                {activeRules.map((rule) => (
                  <motion.button
                    key={rule.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setSelectedRule(rule)}
                    className="shrink-0 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 border cursor-pointer active:scale-95 transition-transform"
                    style={{
                      backgroundColor: `hsl(${rule.color} / 0.15)`,
                      borderColor: `hsl(${rule.color} / 0.3)`,
                    }}
                  >
                    <span className="text-sm">{rule.icon}</span>
                    <div className="min-w-0">
                      <p
                        className="text-xs font-bold leading-tight"
                        style={{ color: `hsl(${rule.color})` }}
                      >
                        {rule.name}
                      </p>
                      <p className="text-[9px] text-muted-foreground leading-tight truncate max-w-[120px]">
                        {rule.description}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </>
          ) : (
            <p className="text-[10px] text-muted-foreground text-center py-0.5">
              Aucune règle Tajwid sur ce mot
            </p>
          )}

          {/* Next rule preview */}
          {nextRule && (
            <button
              onClick={() => setSelectedRule(nextRule.rule)}
              className="flex items-center gap-1.5 pt-0.5 border-t border-border/50 w-full text-left"
            >
              <span className="text-[9px] text-muted-foreground">📖 Prochain :</span>
              <span
                className="text-[10px] font-semibold"
                style={{ color: `hsl(${nextRule.rule.color})` }}
              >
                {nextRule.rule.icon} {nextRule.rule.name}
              </span>
              <span className="text-[9px] text-muted-foreground">
                ({nextRule.wordsAhead} mot{nextRule.wordsAhead > 1 ? "s" : ""})
              </span>
            </button>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Tutorial bottom sheet */}
      <AnimatePresence>
        {selectedRule && (
          <TajwidTutorialSheet
            rule={selectedRule}
            onClose={() => setSelectedRule(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
