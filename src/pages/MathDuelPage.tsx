import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useXP } from "@/hooks/useXP";
import { generateQuestion, generateChoices, getDifficultyForLevel } from "@/data/mathDifficultyConfig";
import Confetti from "@/components/Confetti";
import DifficultySelector from "@/components/DifficultySelector";

const DIFF_CONFIG: Record<string, { startLevel: number; botSpeed: number; totalRounds: number; botAccuracy: number; xp: number }> = {
  easy:   { startLevel: 1,  botSpeed: 6000, totalRounds: 7,  botAccuracy: 0.4, xp: 10 },
  medium: { startLevel: 10, botSpeed: 4000, totalRounds: 10, botAccuracy: 0.6, xp: 20 },
  hard:   { startLevel: 25, botSpeed: 2000, totalRounds: 15, botAccuracy: 0.8, xp: 35 },
};

export default function MathDuelPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { addXP } = useXP();

  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [level, setLevel] = useState(1);
  const [question, setQuestion] = useState(() => generateQuestion(1));
  const [choices, setChoices] = useState(() => generateChoices(generateQuestion(1).answer));
  const [playerScore, setPlayerScore] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [round, setRound] = useState(1);
  const [feedback, setFeedback] = useState<"player" | "bot" | "wrong" | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const botTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const cfg = difficulty ? DIFF_CONFIG[difficulty] : null;

  const startGame = (diff: string) => {
    const c = DIFF_CONFIG[diff];
    setDifficulty(diff);
    setLevel(c.startLevel);
    setPlayerScore(0);
    setBotScore(0);
    setRound(1);
    setFeedback(null);
    setIsFinished(false);
    const q = generateQuestion(c.startLevel);
    setQuestion(q);
    setChoices(generateChoices(q.answer));
  };

  const newQ = () => {
    const q = generateQuestion(level);
    setQuestion(q);
    setChoices(generateChoices(q.answer));
  };

  useEffect(() => {
    if (feedback || isFinished || !cfg) return;
    botTimerRef.current = setTimeout(() => {
      const botCorrect = Math.random() < cfg.botAccuracy;
      if (botCorrect) {
        setFeedback("bot");
        setBotScore(s => s + 1);
        setTimeout(() => {
          setFeedback(null);
          if (round >= cfg.totalRounds) {
            setIsFinished(true);
            if (playerScore >= botScore) addXP(cfg.xp);
          } else { setRound(r => r + 1); newQ(); }
        }, 700);
      }
    }, cfg.botSpeed);
    return () => clearTimeout(botTimerRef.current);
  }, [question, feedback, isFinished, round, cfg]);

  const handleAnswer = (ans: number) => {
    if (feedback || isFinished || !cfg) return;
    clearTimeout(botTimerRef.current);
    if (ans === question.answer) { setFeedback("player"); setPlayerScore(s => s + 1); }
    else { setFeedback("wrong"); }
    setTimeout(() => {
      setFeedback(null);
      if (round >= cfg.totalRounds) {
        setIsFinished(true);
        if (playerScore + (ans === question.answer ? 1 : 0) > botScore) addXP(cfg.xp);
      } else { setRound(r => r + 1); newQ(); }
    }, 700);
  };

  const restart = () => { if (difficulty) startGame(difficulty); };
  const playerWins = playerScore > botScore;

  if (!difficulty) {
    return <DifficultySelector title={t("mathGames.mathDuel" as any)} icon="⚔️" onSelect={startGame} onBack={() => navigate(-1)} t={(k) => t(k as any)} difficulties={[
      { key: "easy", emoji: "🌱", xpBase: 10, description: "7 rounds — Bot lent" },
      { key: "medium", emoji: "🌿", xpBase: 20, description: "10 rounds — Bot moyen" },
      { key: "hard", emoji: "🔥", xpBase: 35, description: "15 rounds — Bot rapide" },
    ]} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-orange-50 to-amber-50 dark:from-background dark:via-background dark:to-background flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-6 pb-2">
        <button onClick={() => setDifficulty(null)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft size={18} className="text-foreground" />
        </button>
        <h1 className="text-sm font-bold text-foreground flex-1">⚔️ {t(`memoryFaith.${difficulty}` as any)}</h1>
        <span className="text-xs text-muted-foreground font-bold">{round}/{cfg?.totalRounds}</span>
      </div>

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

      {!feedback && !isFinished && (
        <div className="text-center mb-2">
          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-xs text-muted-foreground">🤖 {t("mathGames.botThinking" as any)}...</motion.span>
        </div>
      )}

      <AnimatePresence>
        {feedback && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            className={`mx-auto mb-2 px-4 py-1 rounded-full text-xs font-bold ${
              feedback === "player" ? "bg-emerald-500/20 text-emerald-600" : feedback === "bot" ? "bg-destructive/20 text-destructive" : "bg-amber-500/20 text-amber-600"
            }`}>
            {feedback === "player" ? "✅ +1" : feedback === "bot" ? "🤖 +1" : "❌"}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        <motion.div key={question.display} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="text-4xl font-black text-foreground px-8 py-6 rounded-3xl border-2 border-border bg-card shadow-lg">
          {question.display} = ?
        </motion.div>
        <div className="grid grid-cols-2 gap-3 w-full max-w-[300px]">
          {choices.map((c, i) => (
            <motion.button key={`${c}-${i}`} whileTap={{ scale: 0.9 }} onClick={() => handleAnswer(c)}
              className="py-4 rounded-2xl bg-card border border-border shadow-md text-xl font-bold text-foreground active:bg-primary/10 transition-colors">{c}</motion.button>
          ))}
        </div>
      </div>

      <Confetti active={isFinished && playerWins} emoji duration={3000} />
      <AnimatePresence>
        {isFinished && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.6 }} animate={{ scale: 1 }} className="bg-card border border-border rounded-3xl p-6 mx-6 text-center shadow-2xl max-w-sm w-full">
              <span className="text-5xl block mb-3">{playerWins ? "🏆" : "😤"}</span>
              <h2 className="text-xl font-bold text-foreground mb-1">{playerWins ? t("memoryFaith.victory" as any) : t("mathGames.botWins" as any)}</h2>
              <p className="text-sm text-muted-foreground mb-4">{playerScore} - {botScore}</p>
              <div className="flex gap-2">
                <button onClick={restart} className="flex-1 py-3 rounded-2xl bg-muted text-foreground font-bold text-sm"><RotateCcw size={14} className="inline mr-1" /> {t("mathGames.rematch" as any)}</button>
                <button onClick={() => setDifficulty(null)} className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm">{t("memoryFaith.changeDifficulty" as any)}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
