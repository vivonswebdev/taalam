import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, Zap, Trophy } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useCoranCrush } from "@/hooks/useCoranCrush";
import { useXP } from "@/hooks/useXP";
import { useEffect, useRef } from "react";

export default function CoranCrush() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { addXP } = useXP();
  const xpAwardedRef = useRef(false);
  const {
    grid, score, movesLeft, level, combo, maxCombo, selected,
    gameOver, levelComplete, targetScore, cascading, matchedCells,
    totalCleared, selectCell, nextLevel, restart, gridSize, highScore,
  } = useCoranCrush();

  // Award XP on level complete
  useEffect(() => {
    if (levelComplete && !xpAwardedRef.current) {
      xpAwardedRef.current = true;
      const xp = Math.min(10, 2 + Math.floor(maxCombo / 2));
      addXP(xp);
    }
  }, [levelComplete, addXP, maxCombo]);

  // Reset xp flag on level change
  useEffect(() => {
    xpAwardedRef.current = false;
  }, [level]);

  const progressPercent = Math.min(100, Math.round((score / targetScore) * 100));

  return (
    <div className="min-h-screen pb-8 bg-background">
      {/* Header */}
      <div className="px-4 pt-12 pb-2">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
            <ArrowLeft size={18} className="text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span>🎮</span> {t("coranCrush.title" as any)}
            </h1>
          </div>
          <button onClick={restart} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
            <RotateCcw size={16} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="px-4 mb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 bg-card border border-border rounded-xl px-3 py-1.5">
            <span className="text-[10px] text-muted-foreground">{t("coranCrush.level" as any)}</span>
            <span className="text-sm font-bold text-foreground">{level}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-card border border-border rounded-xl px-3 py-1.5">
            <span className="text-[10px] text-muted-foreground">{t("coranCrush.score" as any)}</span>
            <span className="text-sm font-bold text-primary">{score}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-card border border-border rounded-xl px-3 py-1.5">
            <span className="text-[10px] text-muted-foreground">{t("coranCrush.moves" as any)}</span>
            <span className={`text-sm font-bold ${movesLeft <= 5 ? "text-destructive" : "text-foreground"}`}>{movesLeft}</span>
          </div>
        </div>
      </div>

      {/* Progress bar to target */}
      <div className="px-4 mb-2">
        <div className="relative h-2.5 rounded-full bg-muted/50 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: progressPercent >= 100
                ? "linear-gradient(90deg, #f59e0b, #ef4444, #ec4899, #8b5cf6, #3b82f6, #10b981)"
                : "hsl(var(--primary))",
            }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ type: "spring", damping: 20 }}
          />
        </div>
        <div className="flex justify-between mt-0.5">
          <span className="text-[9px] text-muted-foreground">{score}/{targetScore}</span>
          {combo > 1 && (
            <motion.span
              key={combo}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-[10px] font-bold text-primary flex items-center gap-0.5"
            >
              <Zap size={10} className="fill-primary" /> x{combo}
            </motion.span>
          )}
        </div>
      </div>

      {/* Game grid */}
      <div className="px-2">
        <div
          className="mx-auto aspect-square max-w-[min(100vw-16px,400px)] grid gap-[2px] p-1 bg-card border border-border rounded-2xl"
          style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => {
              if (!cell) return <div key={`${r}-${c}`} className="aspect-square" />;

              const isSelected = selected && selected[0] === r && selected[1] === c;
              const isMatched = matchedCells.has(`${r},${c}`);
              const hasSpecial = !!cell.special;
              const hasIce = cell.ice && cell.ice > 0;

              return (
                <motion.button
                  key={cell.id}
                  layout
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{
                    scale: isMatched ? 0 : 1,
                    opacity: isMatched ? 0 : 1,
                    rotate: isMatched ? 180 : 0,
                  }}
                  transition={{ type: "spring", damping: 15, stiffness: 300 }}
                  onClick={() => selectCell(r, c)}
                  className={`
                    aspect-square rounded-lg flex items-center justify-center text-lg sm:text-xl relative
                    transition-all duration-150
                    ${isSelected
                      ? "ring-2 ring-primary ring-offset-1 ring-offset-background scale-110 z-10 bg-primary/20"
                      : "bg-muted/30 hover:bg-muted/50 active:scale-95"
                    }
                    ${hasIce ? "border-2 border-cyan-400/60" : ""}
                  `}
                >
                  <span className="select-none">{cell.type.emoji}</span>
                  {hasSpecial && (
                    <span className="absolute bottom-0 right-0 text-[8px]">
                      {cell.special === "bomb_row" ? "➡️" : cell.special === "bomb_col" ? "⬇️" : cell.special === "bomb_area" ? "💥" : "🌈"}
                    </span>
                  )}
                  {hasIce && (
                    <div className={`absolute inset-0 rounded-lg pointer-events-none ${cell.ice === 2 ? "bg-cyan-300/40" : "bg-cyan-200/25"}`} />
                  )}
                </motion.button>
              );
            })
          )}
        </div>
      </div>

      {/* Level Complete overlay */}
      <AnimatePresence>
        {levelComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.7, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-card border border-border rounded-3xl p-6 mx-6 text-center shadow-2xl max-w-sm w-full"
            >
              <span className="text-5xl block mb-3">🏆</span>
              <h2 className="text-xl font-bold text-foreground mb-1">
                {t("coranCrush.levelComplete" as any)}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                {t("coranCrush.level" as any)} {level} — {score} pts
              </p>
              <div className="flex gap-2 justify-center mb-3">
                {maxCombo >= 3 && (
                  <span className="bg-primary/15 px-3 py-1 rounded-full text-xs font-semibold text-primary">
                    🔥 Combo x{maxCombo}
                  </span>
                )}
                <span className="bg-primary/15 px-3 py-1 rounded-full text-xs font-semibold text-primary">
                  💎 {totalCleared} {t("coranCrush.cleared" as any)}
                </span>
              </div>
              <button
                onClick={nextLevel}
                className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm active:scale-95 transition-transform"
              >
                {t("coranCrush.nextLevel" as any)} →
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over overlay */}
      <AnimatePresence>
        {gameOver && !levelComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.7, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-card border border-border rounded-3xl p-6 mx-6 text-center shadow-2xl max-w-sm w-full"
            >
              <span className="text-5xl block mb-3">😢</span>
              <h2 className="text-xl font-bold text-foreground mb-1">
                {t("coranCrush.gameOver" as any)}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                {score}/{targetScore} pts
              </p>
              <button
                onClick={restart}
                className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm active:scale-95 transition-transform"
              >
                {t("coranCrush.retry" as any)}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
