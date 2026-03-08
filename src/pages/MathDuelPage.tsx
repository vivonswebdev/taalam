import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useXP } from "@/hooks/useXP";
import { generateQuestion, generateChoices, getDifficultyForLevel } from "@/data/mathDifficultyConfig";
import Confetti from "@/components/Confetti";

export default function MathDuelPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { addXP } = useXP();

  const [level, setLevel] = useState(1);
  const [question, setQuestion] = useState(() => generateQuestion(1));
  const [choices, setChoices] = useState(() => generateChoices(generateQuestion(1).answer));
  const [playerScore, setPlayerScore] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [round, setRound] = useState(1);
  const [feedback, setFeedback] = useState<"player" | "bot" | "wrong" | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const botTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const TOTAL_ROUNDS = 10;
  const BOT_SPEED = Math.max(1500, 5000 - level * 300); // Bot gets faster with level

  const newQ = () => {
    const q = generateQuestion(level);
    setQuestion(q);
    setChoices(generateChoices(q.answer));
  };

  // Bot auto-answers
  useEffect(() => {
    if (feedback || isFinished) return;
    botTimerRef.current = setTimeout(() => {
      // Bot answers correctly 60-80% of the time
      const botCorrect = Math.random() < (0.5 + level * 0.03);
      if (botCorrect) {
        setFeedback("bot");
        setBotScore(s => s + 1);
        setTimeout(() => {
          setFeedback(null);
          if (round >= TOTAL_ROUNDS) {
            setIsFinished(true);
            if (playerScore >= botScore) addXP(getDifficultyForLevel(level).xpPerWin);
          } else {
            setRound(r => r + 1);
            newQ();
          }
        }, 700);
      }
    }, BOT_SPEED);
    return () => clearTimeout(botTimerRef.current);
  }, [question, feedback, isFinished, round]);

  const handleAnswer = (ans: number) => {
    if (feedback || isFinished) return;
    clearTimeout(botTimerRef.current);

    if (ans === question.answer) {
      setFeedback("player");
      setPlayerScore(s => s + 1);
    } else {
      setFeedback("wrong");
    }

    setTimeout(() => {
      setFeedback(null);
      if (round >= TOTAL_ROUNDS) {
        setIsFinished(true);
        if (playerScore + (ans === question.answer ? 1 : 0) > botScore) addXP(getDifficultyForLevel(level).xpPerWin);
      } else {
        setRound(r => r + 1);
        newQ();
      }
    }, 700);
  };

  const restart = () => {
    setLevel(l => l + 1);
    setPlayerScore(0);
    setBotScore(0);
    setRound(1);
    setFeedback(null);
    setIsFinished(false);
    newQ();
  };

  const playerWins = playerScore > botScore;

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-orange-50 to-amber-50 dark:from-background dark:via-background dark:to-background flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-6 pb-2">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft size={18} className="text-foreground" />
        </button>
        <h1 className="text-sm font-bold text-foreground flex-1">⚔️ {t("mathGames.mathDuel" as any)}</h1>
        <span className="text-xs text-muted-foreground font-bold">{round}/{TOTAL_ROUNDS}</span>
      </div>

      {/* Scoreboard */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between bg-card border border-border rounded-2xl p-3">
          <div className="text-center flex-1">
            <p className="text-2xl font-black text-primary">{playerScore}</p>
            <p className="text-[10px] text-muted-foreground font-bold">🧑 {t("mathGames.you" as any)}</p>
          </div>
          <div className="text-xl font-black text-muted-foreground">VS</div>
          <div className="text-center flex-1">
            <p className="text-2xl font-black text-destructive">{botScore}</p>
            <p className="text-[10px] text-muted-foreground font-bold">🤖 Bot</p>
          </div>
        </div>
      </div>

      {/* Bot thinking indicator */}
      {!feedback && !isFinished && (
        <div className="text-center mb-2">
          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-xs text-muted-foreground">🤖 {t("mathGames.botThinking" as any)}...</motion.span>
        </div>
      )}

      {/* Feedback flash */}
      <AnimatePresence>
        {feedback && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            className={`mx-auto mb-2 px-4 py-1 rounded-full text-xs font-bold ${
              feedback === "player" ? "bg-emerald-500/20 text-emerald-600" :
              feedback === "bot" ? "bg-destructive/20 text-destructive" :
              "bg-amber-500/20 text-amber-600"
            }`}>
            {feedback === "player" ? "✅ +1" : feedback === "bot" ? "🤖 +1" : "❌"}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        <motion.div key={question.display} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="text-4xl font-black text-foreground px-8 py-6 rounded-3xl border-2 border-border bg-card shadow-lg">
          {question.display} = ?
        </motion.div>

        <div className="grid grid-cols-2 gap-3 w-full max-w-[300px]">
          {choices.map((c, i) => (
            <motion.button key={`${c}-${i}`} whileTap={{ scale: 0.9 }}
              onClick={() => handleAnswer(c)}
              className="py-4 rounded-2xl bg-card border border-border shadow-md text-xl font-bold text-foreground active:bg-primary/10 transition-colors">
              {c}
            </motion.button>
          ))}
        </div>
      </div>

      <Confetti active={isFinished && playerWins} emoji duration={3000} />
      <AnimatePresence>
        {isFinished && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.6 }} animate={{ scale: 1 }} className="bg-card border border-border rounded-3xl p-6 mx-6 text-center shadow-2xl max-w-sm w-full">
              <span className="text-5xl block mb-3">{playerWins ? "🏆" : "😤"}</span>
              <h2 className="text-xl font-bold text-foreground mb-1">
                {playerWins ? t("memoryFaith.victory" as any) : t("mathGames.botWins" as any)}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">{playerScore} - {botScore}</p>
              <button onClick={restart} className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm">
                <RotateCcw size={14} className="inline mr-1" /> {t("mathGames.rematch" as any)}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
