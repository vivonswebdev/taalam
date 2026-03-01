import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, Zap, Trophy } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useCoranCrush } from "@/hooks/useCoranCrush";
import { useCrushLeaderboard } from "@/hooks/useCrushLeaderboard";
import { useXP } from "@/hooks/useXP";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useRef, useCallback, useState } from "react";
import Confetti from "@/components/Confetti";

export default function CoranCrush() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { addXP } = useXP();
  const { user } = useAuth();
  const xpAwardedRef = useRef(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const {
    grid, score, movesLeft, level, combo, maxCombo, selected,
    gameOver, levelComplete, targetScore, cascading, matchedCells,
    totalCleared, selectCell, trySwap, nextLevel, restart, gridSize,
    lastSwapFailed,
  } = useCoranCrush();

  const { leaderboard, myRank, loading: lbLoading, saveScore } = useCrushLeaderboard();

  const dragStartRef = useRef<{ r: number; c: number; x: number; y: number } | null>(null);

  // Save score & award XP on level complete
  useEffect(() => {
    if (levelComplete && !xpAwardedRef.current) {
      xpAwardedRef.current = true;
      addXP(Math.min(10, 2 + Math.floor(maxCombo / 2)));
      saveScore(score, level, maxCombo, totalCleared);
    }
  }, [levelComplete, addXP, maxCombo, saveScore, score, level, totalCleared]);

  useEffect(() => { xpAwardedRef.current = false; }, [level]);

  const progressPercent = Math.min(100, Math.round((score / targetScore) * 100));

  const handlePointerDown = useCallback((r: number, c: number, e: React.PointerEvent) => {
    dragStartRef.current = { r, c, x: e.clientX, y: e.clientY };
    selectCell(r, c);
  }, [selectCell]);

  const handlePointerUp = useCallback((r: number, c: number, e: React.PointerEvent) => {
    if (!dragStartRef.current) return;
    const { r: sr, c: sc, x: sx, y: sy } = dragStartRef.current;
    const dx = e.clientX - sx;
    const dy = e.clientY - sy;
    const threshold = 20;
    if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
      let tr = sr, tc = sc;
      if (Math.abs(dx) > Math.abs(dy)) { tc += dx > 0 ? 1 : -1; }
      else { tr += dy > 0 ? 1 : -1; }
      if (tr >= 0 && tr < gridSize && tc >= 0 && tc < gridSize) {
        trySwap(sr, sc, tr, tc);
      }
    }
    dragStartRef.current = null;
  }, [trySwap, gridSize]);

  return (
    <div className="min-h-screen pb-8 bg-background flex flex-col">
      {/* Header */}
      <div className="px-4 pt-10 pb-1">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center active:scale-90 transition-transform">
            <ArrowLeft size={18} className="text-foreground" />
          </button>
          <h1 className="text-base font-bold text-foreground flex items-center gap-1.5 flex-1">
            <span>🎮</span> {t("coranCrush.title" as any)}
          </h1>
          <button onClick={() => setShowLeaderboard(true)} className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center active:scale-90 transition-transform">
            <Trophy size={16} className="text-primary" />
          </button>
          <button onClick={restart} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center active:scale-90 transition-transform">
            <RotateCcw size={15} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="px-4 mb-1.5">
        <div className="flex items-center justify-between gap-1.5">
          <StatChip label={t("coranCrush.level" as any)} value={String(level)} icon="⭐" />
          <StatChip label={t("coranCrush.score" as any)} value={String(score)} accent />
          <StatChip label={t("coranCrush.moves" as any)} value={String(movesLeft)} warn={movesLeft <= 5} />
          {combo > 1 && (
            <motion.div key={combo} initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-0.5 bg-primary/20 border border-primary/30 rounded-xl px-2 py-1">
              <Zap size={12} className="fill-primary text-primary" />
              <span className="text-sm font-black text-primary">x{combo}</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 mb-3">
        <div className="relative h-3 rounded-full bg-muted/60 overflow-hidden border border-border/50">
          <motion.div className="h-full rounded-full"
            style={{ background: progressPercent >= 100 ? "linear-gradient(90deg, #f59e0b, #ef4444, #ec4899, #8b5cf6, #3b82f6, #10b981)" : "hsl(var(--primary))" }}
            animate={{ width: `${progressPercent}%` }} transition={{ type: "spring", damping: 20 }} />
        </div>
        <div className="flex justify-between mt-0.5">
          <span className="text-[10px] text-muted-foreground font-medium">{score}/{targetScore}</span>
          <span className="text-[10px] text-muted-foreground">{progressPercent}%</span>
        </div>
      </div>

      {/* Game grid */}
      <div className="flex-1 flex items-start justify-center px-1">
        <div className="w-full max-w-[min(100vw-8px,420px)] aspect-square grid gap-[3px] p-1.5 bg-card/80 border border-border rounded-2xl shadow-lg backdrop-blur-sm"
          style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)`, touchAction: "none" }}>
          {grid.map((row, r) =>
            row.map((cell, c) => {
              if (!cell) return <div key={`${r}-${c}`} className="aspect-square" />;
              const isSelected = selected && selected[0] === r && selected[1] === c;
              const isMatched = matchedCells.has(`${r},${c}`);
              const hasSpecial = !!cell.special;
              const hasIce = cell.ice && cell.ice > 0;
              const isFailed = lastSwapFailed && lastSwapFailed[0] === r && lastSwapFailed[1] === c;

              return (
                <motion.button key={cell.id} layout
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{
                    scale: isMatched ? [1.3, 0] : isFailed ? [1, 0.9, 1.1, 1] : 1,
                    opacity: isMatched ? 0 : 1, rotate: isMatched ? 180 : 0,
                  }}
                  transition={isMatched ? { duration: 0.3, ease: "easeOut" } : isFailed ? { duration: 0.4, times: [0, 0.2, 0.6, 1] } : { type: "spring", damping: 18, stiffness: 280 }}
                  onPointerDown={(e) => handlePointerDown(r, c, e)}
                  onPointerUp={(e) => handlePointerUp(r, c, e)}
                  className={`aspect-square rounded-xl flex items-center justify-center relative select-none transition-shadow duration-150
                    ${isSelected ? "ring-[3px] ring-primary ring-offset-1 ring-offset-background z-10 shadow-lg shadow-primary/30" : "hover:brightness-110 active:scale-90"}
                    ${hasIce ? "border-2 border-cyan-400/60" : ""}`}
                  style={{
                    background: isSelected ? `${cell.type.color}30` : "hsl(var(--muted) / 0.4)",
                    borderColor: isSelected ? undefined : hasIce ? undefined : `${cell.type.color}40`,
                    borderWidth: hasIce ? undefined : "1.5px", borderStyle: "solid",
                  }}>
                  <span className="text-[clamp(1.4rem,5vw,2rem)] leading-none select-none pointer-events-none">{cell.type.emoji}</span>
                  {hasSpecial && (
                    <span className="absolute -bottom-0.5 -right-0.5 text-[10px] drop-shadow">
                      {cell.special === "bomb_row" ? "➡️" : cell.special === "bomb_col" ? "⬇️" : cell.special === "bomb_area" ? "💥" : "🌈"}
                    </span>
                  )}
                  {hasIce && <div className={`absolute inset-0 rounded-xl pointer-events-none ${cell.ice === 2 ? "bg-cyan-300/40" : "bg-cyan-200/20"}`} />}
                </motion.button>
              );
            })
          )}
        </div>
      </div>

      <Confetti active={levelComplete} emoji duration={3000} />

      {/* Level Complete overlay */}
      <AnimatePresence>
        {levelComplete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.6, y: 40 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", damping: 12 }}
              className="bg-card border border-border rounded-3xl p-6 mx-6 text-center shadow-2xl max-w-sm w-full">
              <span className="text-5xl block mb-3">🏆</span>
              <h2 className="text-xl font-bold text-foreground mb-1">{t("coranCrush.levelComplete" as any)}</h2>
              <p className="text-sm text-muted-foreground mb-4">{t("coranCrush.level" as any)} {level} — {score} pts</p>
              <div className="flex gap-2 justify-center mb-4 flex-wrap">
                {maxCombo >= 3 && <span className="bg-primary/15 px-3 py-1 rounded-full text-xs font-semibold text-primary">🔥 Combo x{maxCombo}</span>}
                <span className="bg-primary/15 px-3 py-1 rounded-full text-xs font-semibold text-primary">💎 {totalCleared} {t("coranCrush.cleared" as any)}</span>
              </div>
              {!user && <p className="text-xs text-muted-foreground mb-3">{t("coranCrush.loginToSave" as any)}</p>}
              <button onClick={nextLevel} className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm active:scale-95 transition-transform">
                {t("coranCrush.nextLevel" as any)} →
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over overlay */}
      <AnimatePresence>
        {gameOver && !levelComplete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.6, y: 40 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", damping: 12 }}
              className="bg-card border border-border rounded-3xl p-6 mx-6 text-center shadow-2xl max-w-sm w-full">
              <span className="text-5xl block mb-3">😢</span>
              <h2 className="text-xl font-bold text-foreground mb-1">{t("coranCrush.gameOver" as any)}</h2>
              <p className="text-sm text-muted-foreground mb-4">{score}/{targetScore} pts</p>
              <button onClick={restart} className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm active:scale-95 transition-transform">
                {t("coranCrush.retry" as any)}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leaderboard Sheet */}
      <AnimatePresence>
        {showLeaderboard && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm"
            onClick={() => setShowLeaderboard(false)}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-3xl max-h-[75vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}>
              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
              </div>

              <div className="px-5 pb-2 flex items-center gap-2">
                <Trophy size={18} className="text-primary" />
                <h2 className="text-base font-bold text-foreground">{t("coranCrush.leaderboard" as any)}</h2>
                {myRank && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {t("coranCrush.yourRank" as any)}: <span className="font-bold text-primary">#{myRank}</span>
                  </span>
                )}
              </div>

              <div className="flex-1 overflow-y-auto px-4 pb-6">
                {leaderboard.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8">{t("coranCrush.noScores" as any)}</p>
                ) : (
                  <div className="space-y-1.5">
                    {leaderboard.map((entry, i) => {
                      const isMe = user?.id === entry.user_id;
                      const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
                      return (
                        <div key={entry.id}
                          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors
                            ${isMe ? "bg-primary/10 border border-primary/30" : "bg-muted/30"}`}>
                          <span className="w-7 text-center font-bold text-sm text-muted-foreground">
                            {medal || `#${i + 1}`}
                          </span>
                          <span className="text-lg">{entry.avatar_emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold truncate ${isMe ? "text-primary" : "text-foreground"}`}>
                              {entry.display_name}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {t("coranCrush.level" as any)} {entry.level} • 🔥 x{entry.max_combo}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-foreground">{entry.high_score.toLocaleString()}</p>
                            <p className="text-[9px] text-muted-foreground">pts</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatChip({ label, value, icon, accent, warn }: { label: string; value: string; icon?: string; accent?: boolean; warn?: boolean }) {
  return (
    <div className="flex items-center gap-1 bg-card border border-border rounded-xl px-2.5 py-1.5">
      {icon && <span className="text-xs">{icon}</span>}
      <div className="flex flex-col items-center leading-none">
        <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{label}</span>
        <span className={`text-base font-black ${accent ? "text-primary" : warn ? "text-destructive" : "text-foreground"}`}>{value}</span>
      </div>
    </div>
  );
}
