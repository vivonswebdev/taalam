import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trophy, RotateCcw, Star, Gamepad2, Zap } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useCrushLeaderboard } from "@/hooks/useCrushLeaderboard";
import { useXP } from "@/hooks/useXP";
import { useAuth } from "@/hooks/useAuth";
import Confetti from "@/components/Confetti";

// --- Configuration du jeu ---
const WIDTH = 6;
const HEIGHT = 8;
const CANDY_TYPES = ["🕋", "📖", "🕌", "🌙", "📿", "⭐"];
const BASE_TARGET = 700;
const BASE_MOVES = 25;

const CRUSH_LEVEL_KEY = "coran_crush_level";
const CRUSH_HIGHSCORE_KEY = "coran_crush_highscore";

function loadLevel(): number {
  try { return parseInt(localStorage.getItem(CRUSH_LEVEL_KEY) || "1", 10); } catch { return 1; }
}

interface CellData {
  id: string;
  type: string;
}

const createBoard = (): (CellData | null)[] => {
  const board: (CellData | null)[] = [];
  for (let i = 0; i < WIDTH * HEIGHT; i++) {
    board.push({
      id: Math.random().toString(36).substr(2, 9),
      type: CANDY_TYPES[Math.floor(Math.random() * CANDY_TYPES.length)],
    });
  }
  return board;
};

export default function CoranCrush() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { addXP } = useXP();
  const { user } = useAuth();
  const xpAwardedRef = useRef(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const savedLevel = loadLevel();
  const [board, setBoard] = useState(createBoard);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(savedLevel);
  const [moves, setMoves] = useState(BASE_MOVES);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [maxCombo, setMaxCombo] = useState(0);
  const [totalCleared, setTotalCleared] = useState(0);
  const [combo, setCombo] = useState(0);

  const targetScore = BASE_TARGET + (level - 1) * 150;

  const { leaderboard, myRank, saveScore } = useCrushLeaderboard();

  // Check matches
  const checkForMatches = useCallback((currentBoard: (CellData | null)[]) => {
    const matches = new Set<number>();

    for (let r = 0; r < HEIGHT; r++) {
      for (let c = 0; c < WIDTH - 2; c++) {
        const i1 = r * WIDTH + c;
        const i2 = i1 + 1;
        const i3 = i1 + 2;
        if (currentBoard[i1]?.type && currentBoard[i1]!.type === currentBoard[i2]?.type && currentBoard[i1]!.type === currentBoard[i3]?.type) {
          matches.add(i1).add(i2).add(i3);
        }
      }
    }

    for (let c = 0; c < WIDTH; c++) {
      for (let r = 0; r < HEIGHT - 2; r++) {
        const i1 = r * WIDTH + c;
        const i2 = i1 + WIDTH;
        const i3 = i1 + WIDTH * 2;
        if (currentBoard[i1]?.type && currentBoard[i1]!.type === currentBoard[i2]?.type && currentBoard[i1]!.type === currentBoard[i3]?.type) {
          matches.add(i1).add(i2).add(i3);
        }
      }
    }

    return Array.from(matches);
  }, []);

  // Processing engine
  useEffect(() => {
    if (isProcessing) return;

    const matches = checkForMatches(board);
    if (matches.length > 0) {
      setIsProcessing(true);

      setTimeout(() => {
        const newBoard = [...board];
        const points = matches.length * 10;
        setScore(s => s + points);
        setTotalCleared(tc => tc + matches.length);
        setCombo(c => {
          const newC = c + 1;
          setMaxCombo(mc => Math.max(mc, newC));
          return newC;
        });

        if (matches.length >= 5) setFeedback("Excellent ! ✨");
        else if (matches.length === 4) setFeedback("Masha'Allah !");
        else if (matches.length === 3) setFeedback("Bien !");
        setTimeout(() => setFeedback(null), 1200);

        matches.forEach(index => { newBoard[index] = null; });
        setBoard(newBoard);

        setTimeout(() => {
          const filledBoard = [...newBoard];
          for (let c = 0; c < WIDTH; c++) {
            let emptySpots = 0;
            for (let r = HEIGHT - 1; r >= 0; r--) {
              const i = r * WIDTH + c;
              if (filledBoard[i] === null) {
                emptySpots++;
              } else if (emptySpots > 0) {
                filledBoard[i + emptySpots * WIDTH] = filledBoard[i];
                filledBoard[i] = null;
              }
            }
            for (let r = 0; r < emptySpots; r++) {
              const i = r * WIDTH + c;
              filledBoard[i] = {
                id: Math.random().toString(36).substr(2, 9),
                type: CANDY_TYPES[Math.floor(Math.random() * CANDY_TYPES.length)],
              };
            }
          }
          setBoard(filledBoard);
          setIsProcessing(false);
        }, 300);
      }, 300);
    } else {
      setCombo(0);
    }
  }, [board, checkForMatches, isProcessing]);

  // Win/lose check
  useEffect(() => {
    if (isProcessing) return;
    if (score >= targetScore && !victory) {
      setVictory(true);
      const nextLvl = level + 1;
      localStorage.setItem(CRUSH_LEVEL_KEY, String(nextLvl));
      const prev = parseInt(localStorage.getItem(CRUSH_HIGHSCORE_KEY) || "0", 10);
      if (score > prev) localStorage.setItem(CRUSH_HIGHSCORE_KEY, String(score));
    } else if (moves <= 0 && score < targetScore && !gameOver) {
      setGameOver(true);
    }
  }, [score, moves, targetScore, isProcessing, victory, gameOver, level]);

  // XP & leaderboard save
  useEffect(() => {
    if (victory && !xpAwardedRef.current) {
      xpAwardedRef.current = true;
      addXP(Math.min(10, 2 + Math.floor(maxCombo / 2)));
      saveScore(score, level, maxCombo, totalCleared);
    }
  }, [victory, addXP, maxCombo, saveScore, score, level, totalCleared]);

  useEffect(() => { xpAwardedRef.current = false; }, [level]);

  const handleCellClick = (index: number) => {
    if (isProcessing || gameOver || victory) return;

    if (selectedCell === null) {
      setSelectedCell(index);
    } else {
      const sameRow = Math.floor(index / WIDTH) === Math.floor(selectedCell / WIDTH);
      const isHorizontalAdjacent = (index === selectedCell - 1 || index === selectedCell + 1) && sameRow;
      const isVerticalAdjacent = index === selectedCell - WIDTH || index === selectedCell + WIDTH;

      if (isHorizontalAdjacent || isVerticalAdjacent) {
        const newBoard = [...board];
        const temp = newBoard[selectedCell];
        newBoard[selectedCell] = newBoard[index];
        newBoard[index] = temp;
        setBoard(newBoard);
        setMoves(m => m - 1);
        setSelectedCell(null);
        setIsProcessing(true);

        setTimeout(() => {
          const hasMatches = checkForMatches(newBoard).length > 0;
          if (!hasMatches) {
            const revertBoard = [...newBoard];
            revertBoard[index] = revertBoard[selectedCell!];
            revertBoard[selectedCell!] = temp;
            setBoard(revertBoard);
          }
          setIsProcessing(false);
        }, 400);
      } else {
        setSelectedCell(index);
      }
    }
  };

  const restartGame = () => {
    setBoard(createBoard());
    setScore(0);
    setMoves(BASE_MOVES);
    setGameOver(false);
    setVictory(false);
    setSelectedCell(null);
    setCombo(0);
    setMaxCombo(0);
    setTotalCleared(0);
  };

  const nextLevelHandler = () => {
    const nextLvl = level + 1;
    setLevel(nextLvl);
    setBoard(createBoard());
    setScore(0);
    setMoves(Math.max(15, BASE_MOVES - Math.floor(nextLvl / 10)));
    setGameOver(false);
    setVictory(false);
    setSelectedCell(null);
    setCombo(0);
    setMaxCombo(0);
    setTotalCleared(0);
  };

  const progressPercent = Math.min(100, (score / targetScore) * 100);

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto min-h-[100dvh] bg-gradient-to-b from-slate-950 via-indigo-950 to-teal-950 font-sans overflow-hidden relative selection:bg-transparent pb-12">
      {/* HEADER FUTURISTE */}
      <div className="flex items-center justify-between w-full px-6 pt-10 pb-2 z-10">
        <button onClick={() => navigate(-1)} className="p-3 bg-white/10 backdrop-blur-md rounded-2xl shadow-sm text-white hover:bg-white/20 active:scale-95 transition-all border border-white/10">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
          <Gamepad2 className="w-6 h-6 text-cyan-400" /> {t("coranCrush.title" as any)}
        </h1>
        <div className="flex gap-2">
          <button onClick={() => setShowLeaderboard(true)} className="p-3 bg-white/10 backdrop-blur-md rounded-2xl shadow-sm text-white hover:bg-white/20 active:scale-95 transition-all border border-white/10">
            <Trophy className="w-5 h-5 text-amber-400" />
          </button>
          <button onClick={restartGame} className="p-3 bg-white/10 backdrop-blur-md rounded-2xl shadow-sm text-white hover:bg-white/20 active:scale-95 transition-all border border-white/10">
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* STATS ROW (GLASSMORPHISM) */}
      <div className="grid grid-cols-3 gap-3 w-full px-6 mb-6 z-10 mt-4">
        <div className="bg-white/10 backdrop-blur-md rounded-[1.5rem] p-3 border border-white/10 flex flex-col items-center justify-center relative shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
          <span className="text-[10px] text-cyan-200 font-bold tracking-wider uppercase mb-1 flex items-center gap-1">
            <Star className="w-3 h-3 text-cyan-300 fill-cyan-300" /> {t("coranCrush.level" as any)}
          </span>
          <span className="text-2xl font-black text-white">{level}</span>
        </div>
        <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/10 backdrop-blur-md rounded-[1.5rem] p-3 border border-emerald-400/30 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-50" />
          <span className="text-[10px] text-emerald-300 font-bold tracking-wider uppercase mb-1 flex items-center gap-1">
            <Trophy className="w-3 h-3 text-emerald-400" /> {t("coranCrush.score" as any)}
          </span>
          <span className="text-2xl font-black text-emerald-400 drop-shadow-md">{score}</span>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-[1.5rem] p-3 border border-white/10 flex flex-col items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
          <span className="text-[10px] text-rose-200 font-bold tracking-wider uppercase mb-1 flex items-center gap-1">
            <Zap className="w-3 h-3 text-rose-400 fill-rose-400" /> {t("coranCrush.moves" as any)}
          </span>
          <span className={`text-2xl font-black ${moves <= 5 ? "text-rose-400" : "text-white"}`}>{moves}</span>
        </div>
      </div>

      {/* Combo indicator */}
      <AnimatePresence>
        {combo > 1 && (
          <motion.div
            key={combo}
            initial={{ opacity: 0, scale: 0.5, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="bg-orange-500 text-white px-4 py-1.5 rounded-full font-black text-sm flex items-center gap-1 shadow-[0_0_15px_rgba(249,115,22,0.5)] mb-2 z-10"
          >
            🔥 x{combo}
          </motion.div>
        )}
      </AnimatePresence>

      {/* PROGRESS BAR NEON */}
      <div className="w-full px-6 mb-8 z-10">
        <div className="flex justify-between text-xs text-slate-300 font-medium mb-2 px-1">
          <span>{score} / {targetScore} pts</span>
          <span className="text-cyan-300">{Math.floor(progressPercent)}%</span>
        </div>
        <div className="w-full bg-slate-900/50 h-4 rounded-full overflow-hidden border border-white/10 p-0.5 shadow-inner backdrop-blur-sm">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.6)]"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* GAME GRID (FUTURISTIC BOARD) */}
      <div className="flex-1 flex items-center justify-center w-full px-4 z-10">
        <div className="relative w-full max-w-[380px] aspect-[3/4] bg-white/5 p-3 rounded-[2.5rem] border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          {/* Feedback flottant NEON */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 0, scale: 0.5, rotate: -5 }}
                animate={{ opacity: 1, y: -60, scale: 1.2, rotate: 0 }}
                exit={{ opacity: 0, y: -100, scale: 0.8 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-300 drop-shadow-[0_5px_15px_rgba(52,211,153,0.6)] pointer-events-none tracking-widest text-center leading-none w-full"
              >
                {feedback}
              </motion.div>
            )}
          </AnimatePresence>

          <div
            className="grid gap-1.5 w-full h-full"
            style={{
              gridTemplateColumns: `repeat(${WIDTH}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${HEIGHT}, minmax(0, 1fr))`,
            }}
          >
            {board.map((cell, index) => (
              <div
                key={cell ? cell.id : `empty-${index}`}
                onClick={() => cell && handleCellClick(index)}
                className={`relative flex items-center justify-center rounded-2xl cursor-pointer transition-all duration-300
                  ${cell ? "bg-gradient-to-br from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] border border-white/10" : "bg-transparent"}
                  ${selectedCell === index ? "ring-2 ring-cyan-400 ring-offset-2 ring-offset-transparent bg-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.5)] scale-110 z-20" : ""}
                `}
              >
                {cell && (
                  <motion.span
                    layoutId={cell.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="text-2xl sm:text-3xl filter drop-shadow-lg select-none"
                  >
                    {cell.type}
                  </motion.span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Confetti active={victory} emoji duration={3000} />

      {/* OVERLAYS (Victoire / Défaite - GLASSMORPHISM) */}
      <AnimatePresence>
        {(victory || gameOver) && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="absolute inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-slate-900/90 backdrop-blur-2xl border border-slate-700/50 p-8 rounded-[2.5rem] text-center max-w-sm w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
            >
              <div className={`absolute -top-20 -left-20 w-40 h-40 rounded-full blur-[50px] opacity-20 ${victory ? "bg-emerald-500" : "bg-rose-500"}`} />
              <div className={`absolute -bottom-20 -right-20 w-40 h-40 rounded-full blur-[50px] opacity-20 ${victory ? "bg-cyan-500" : "bg-rose-500"}`} />

              <div className="text-7xl mb-4 relative z-10 drop-shadow-xl">
                {victory ? "🏆" : "💔"}
              </div>
              <h2 className="text-3xl font-black text-white mb-2 relative z-10 tracking-tight">
                {victory ? t("coranCrush.levelComplete" as any) : t("coranCrush.gameOver" as any)}
              </h2>
              <p className="text-slate-400 mb-4 text-sm font-medium relative z-10">
                {victory
                  ? t("coranCrush.victoryDesc" as any)
                  : t("coranCrush.defeatDesc" as any)}
              </p>

              {/* Badges */}
              {victory && (
                <div className="flex gap-2 justify-center mb-4 flex-wrap relative z-10">
                  {maxCombo >= 3 && (
                    <span className="bg-orange-500/20 border border-orange-400/30 px-3 py-1 rounded-full text-xs font-semibold text-orange-300">
                      🔥 Combo x{maxCombo}
                    </span>
                  )}
                  <span className="bg-cyan-500/20 border border-cyan-400/30 px-3 py-1 rounded-full text-xs font-semibold text-cyan-300">
                    💎 {totalCleared} {t("coranCrush.cleared" as any)}
                  </span>
                </div>
              )}

              <div className="bg-slate-950/50 rounded-3xl p-5 mb-8 border border-white/5 relative z-10">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{t("coranCrush.score" as any)}</p>
                <p className={`text-4xl font-black drop-shadow-md ${victory ? "text-emerald-400" : "text-white"}`}>{score}</p>
              </div>

              {!user && victory && (
                <p className="text-xs text-slate-500 mb-3 relative z-10">{t("coranCrush.loginToSave" as any)}</p>
              )}

              <button
                onClick={victory ? nextLevelHandler : restartGame}
                className={`w-full py-4 rounded-2xl font-black text-lg transition-all flex justify-center items-center gap-2 relative z-10 shadow-lg active:scale-95
                  ${victory
                    ? "bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-emerald-500/25"
                    : "bg-white/10 hover:bg-white/20 text-white border border-white/10"}`}
              >
                <RotateCcw className="w-5 h-5" />
                {victory ? t("coranCrush.nextLevel" as any) : t("coranCrush.retry" as any)}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leaderboard Sheet */}
      <AnimatePresence>
        {showLeaderboard && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setShowLeaderboard(false)}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-2xl border-t border-slate-700/50 rounded-t-[2.5rem] max-h-[75vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-slate-600" />
              </div>
              <div className="px-5 pb-2 flex items-center gap-2">
                <Trophy size={18} className="text-amber-400" />
                <h2 className="text-base font-bold text-white">{t("coranCrush.leaderboard" as any)}</h2>
                {myRank && (
                  <span className="ml-auto text-xs text-slate-400">
                    {t("coranCrush.yourRank" as any)}: <span className="font-bold text-cyan-400">#{myRank}</span>
                  </span>
                )}
              </div>
              <div className="flex-1 overflow-y-auto px-4 pb-6">
                {leaderboard.length === 0 ? (
                  <p className="text-center text-sm text-slate-500 py-8">{t("coranCrush.noScores" as any)}</p>
                ) : (
                  <div className="space-y-1.5">
                    {leaderboard.map((entry, i) => {
                      const isMe = user?.id === entry.user_id;
                      const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
                      return (
                        <div key={entry.id}
                          className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors
                            ${isMe ? "bg-cyan-500/10 border border-cyan-400/30" : "bg-white/5 border border-white/5"}`}>
                          <span className="w-7 text-center font-bold text-sm text-slate-400">
                            {medal || `#${i + 1}`}
                          </span>
                          <span className="text-lg">{entry.avatar_emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold truncate ${isMe ? "text-cyan-400" : "text-white"}`}>
                              {entry.display_name}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {t("coranCrush.level" as any)} {entry.level} • 🔥 x{entry.max_combo}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-white">{entry.high_score.toLocaleString()}</p>
                            <p className="text-[9px] text-slate-500">pts</p>
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
