import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useXP } from "@/hooks/useXP";
import { generateQuestion, generateChoices, getDifficultyForLevel } from "@/data/mathDifficultyConfig";
import Confetti from "@/components/Confetti";
import DifficultySelector from "@/components/DifficultySelector";

const DIFF_CONFIG: Record<string, { startLevel: number; botInterval: number; laps: number; step: number; xp: number }> = {
  easy:   { startLevel: 1,  botInterval: 4000, laps: 2, step: 15, xp: 10 },
  medium: { startLevel: 10, botInterval: 2500, laps: 3, step: 12, xp: 20 },
  hard:   { startLevel: 25, botInterval: 1500, laps: 4, step: 10, xp: 35 },
};

export default function MathRacePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { addXP } = useXP();

  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [level, setLevel] = useState(1);
  const [question, setQuestion] = useState(() => generateQuestion(1));
  const [choices, setChoices] = useState(() => generateChoices(generateQuestion(1).answer));
  const [position, setPosition] = useState(0);
  const [botPosition, setBotPosition] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [laps, setLaps] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const botRef = useRef<ReturnType<typeof setInterval>>();

  const cfg = difficulty ? DIFF_CONFIG[difficulty] : null;

  const startGame = (diff: string) => {
    const c = DIFF_CONFIG[diff];
    setDifficulty(diff);
    setLevel(c.startLevel);
    setPosition(0);
    setBotPosition(0);
    setLaps(0);
    setIsFinished(false);
    const q = generateQuestion(c.startLevel);
    setQuestion(q);
    setChoices(generateChoices(q.answer));
  };

  useEffect(() => {
    if (!cfg || isFinished) return;
    botRef.current = setInterval(() => {
      setBotPosition(prev => {
        const next = prev + 8;
        return next >= 100 ? 0 : next;
      });
    }, cfg.botInterval);
    return () => clearInterval(botRef.current);
  }, [cfg, isFinished, level]);

  const newQ = (lvl: number) => {
    const q = generateQuestion(lvl);
    setQuestion(q);
    setChoices(generateChoices(q.answer));
  };

  const handleAnswer = (ans: number) => {
    if (feedback || isFinished || !cfg) return;
    if (ans === question.answer) {
      setFeedback("correct");
      const newPos = position + cfg.step;
      if (newPos >= 100) {
        setPosition(0);
        const newLaps = laps + 1;
        setLaps(newLaps);
        if (newLaps >= cfg.laps) {
          setIsFinished(true);
          addXP(cfg.xp);
        }
      } else {
        setPosition(newPos);
      }
      setTimeout(() => { setFeedback(null); newQ(level); }, 400);
    } else {
      setFeedback("wrong");
      setPosition(p => Math.max(0, p - 5));
      setTimeout(() => setFeedback(null), 500);
    }
  };

  const restart = () => {
    if (!cfg) return;
    setLevel(l => l + 1);
    setPosition(0);
    setBotPosition(0);
    setLaps(0);
    setIsFinished(false);
    newQ(level + 1);
  };

  if (!difficulty) {
    return <DifficultySelector title={t("mathGames.mathRace" as any)} icon="🏎️" onSelect={startGame} onBack={() => navigate(-1)} t={(k) => t(k as any)} difficulties={[
      { key: "easy", emoji: "🌱", xpBase: 10, description: "2 🏁 — Bot lent" },
      { key: "medium", emoji: "🌿", xpBase: 20, description: "3 🏁 — Bot moyen" },
      { key: "hard", emoji: "🔥", xpBase: 35, description: "4 🏁 — Bot rapide" },
    ]} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-blue-50 to-indigo-50 dark:from-background dark:via-background dark:to-background flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-6 pb-2">
        <button onClick={() => setDifficulty(null)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft size={18} className="text-foreground" />
        </button>
        <h1 className="text-sm font-bold text-foreground flex-1">🏎️ {t(`memoryFaith.${difficulty}` as any)}</h1>
        <span className="text-xs font-bold text-muted-foreground">{t("kidsGames.level" as any)} {level}</span>
      </div>

      <div className="px-4 mt-2 mb-4">
        <div className="relative h-16 bg-muted/50 rounded-2xl border border-border overflow-hidden">
          <div className="absolute top-1 right-2 text-[10px] text-muted-foreground font-bold">🏁 {laps}/{cfg?.laps}</div>
          <motion.div animate={{ left: `${botPosition}%` }} transition={{ duration: 0.3 }} className="absolute top-2 text-2xl" style={{ transform: "translateX(-50%)" }}>🤖</motion.div>
          <motion.div animate={{ left: `${position}%` }} transition={{ type: "spring", damping: 15 }} className="absolute bottom-2 text-2xl" style={{ transform: "translateX(-50%)" }}>🏎️</motion.div>
          <div className="absolute top-1/2 left-0 right-0 h-px bg-border" />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        <motion.div key={question.display} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className={`text-4xl font-black text-foreground px-8 py-6 rounded-3xl border-2 ${
            feedback === "correct" ? "border-emerald-500 bg-emerald-500/10" : feedback === "wrong" ? "border-destructive bg-destructive/10" : "border-border bg-card"
          } shadow-lg`}>{question.display} = ?</motion.div>
        <div className="grid grid-cols-2 gap-3 w-full max-w-[300px]">
          {choices.map((c, i) => (
            <motion.button key={`${c}-${i}`} whileTap={{ scale: 0.9 }} onClick={() => handleAnswer(c)}
              className="py-4 rounded-2xl bg-card border border-border shadow-md text-xl font-bold text-foreground active:bg-primary/10 transition-colors">{c}</motion.button>
          ))}
        </div>
      </div>

      <Confetti active={isFinished} emoji duration={3000} />
      {isFinished && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.6 }} animate={{ scale: 1 }} className="bg-card border border-border rounded-3xl p-6 mx-6 text-center shadow-2xl max-w-sm w-full">
            <span className="text-5xl block mb-3">🏆</span>
            <h2 className="text-xl font-bold text-foreground mb-2">{t("memoryFaith.victory" as any)}</h2>
            <div className="flex gap-2 mt-4">
              <button onClick={restart} className="flex-1 py-3 rounded-2xl bg-muted text-foreground font-bold text-sm">{t("common.next" as any)} →</button>
              <button onClick={() => setDifficulty(null)} className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm">{t("memoryFaith.changeDifficulty" as any)}</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
