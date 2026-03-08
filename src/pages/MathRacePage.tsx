import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useXP } from "@/hooks/useXP";
import { generateQuestion, generateChoices, getDifficultyForLevel } from "@/data/mathDifficultyConfig";
import Confetti from "@/components/Confetti";

export default function MathRacePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { addXP } = useXP();

  const [level, setLevel] = useState(1);
  const [question, setQuestion] = useState(() => generateQuestion(1));
  const [choices, setChoices] = useState(() => generateChoices(generateQuestion(1).answer));
  const [position, setPosition] = useState(0); // 0-100%
  const [botPosition, setBotPosition] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [laps, setLaps] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const botRef = useRef<ReturnType<typeof setInterval>>();

  const FINISH_LAPS = 3;
  const STEP = 12;
  const BOT_SPEED = 800 + Math.max(0, 3000 - level * 100);

  useEffect(() => {
    botRef.current = setInterval(() => {
      setBotPosition(prev => {
        const next = prev + 8;
        return next >= 100 ? 0 : next;
      });
    }, BOT_SPEED);
    return () => clearInterval(botRef.current);
  }, [level, BOT_SPEED]);

  const newQ = (lvl: number) => {
    const q = generateQuestion(lvl);
    setQuestion(q);
    setChoices(generateChoices(q.answer));
  };

  const handleAnswer = (ans: number) => {
    if (feedback || isFinished) return;
    if (ans === question.answer) {
      setFeedback("correct");
      const newPos = position + STEP;
      if (newPos >= 100) {
        setPosition(0);
        const newLaps = laps + 1;
        setLaps(newLaps);
        if (newLaps >= FINISH_LAPS) {
          setIsFinished(true);
          addXP(getDifficultyForLevel(level).xpPerWin * 2);
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
    setLevel(l => l + 1);
    setPosition(0);
    setBotPosition(0);
    setLaps(0);
    setIsFinished(false);
    newQ(level + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-blue-50 to-indigo-50 dark:from-background dark:via-background dark:to-background flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-6 pb-2">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft size={18} className="text-foreground" />
        </button>
        <h1 className="text-sm font-bold text-foreground flex-1">🏎️ {t("mathGames.mathRace" as any)}</h1>
        <span className="text-xs font-bold text-muted-foreground">{t("kidsGames.level" as any)} {level}</span>
      </div>

      {/* Track */}
      <div className="px-4 mt-2 mb-4">
        <div className="relative h-16 bg-muted/50 rounded-2xl border border-border overflow-hidden">
          {/* Lap markers */}
          <div className="absolute top-1 right-2 text-[10px] text-muted-foreground font-bold">
            🏁 {laps}/{FINISH_LAPS}
          </div>
          {/* Bot */}
          <motion.div animate={{ left: `${botPosition}%` }} transition={{ duration: 0.3 }}
            className="absolute top-2 text-2xl" style={{ transform: "translateX(-50%)" }}>
            🤖
          </motion.div>
          {/* Player */}
          <motion.div animate={{ left: `${position}%` }} transition={{ type: "spring", damping: 15 }}
            className="absolute bottom-2 text-2xl" style={{ transform: "translateX(-50%)" }}>
            🏎️
          </motion.div>
          {/* Track line */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-border" />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        <motion.div key={question.display} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className={`text-4xl font-black text-foreground px-8 py-6 rounded-3xl border-2 ${
            feedback === "correct" ? "border-emerald-500 bg-emerald-500/10" :
            feedback === "wrong" ? "border-destructive bg-destructive/10" :
            "border-border bg-card"
          } shadow-lg`}>
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

      <Confetti active={isFinished} emoji duration={3000} />
      {isFinished && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.6 }} animate={{ scale: 1 }} className="bg-card border border-border rounded-3xl p-6 mx-6 text-center shadow-2xl max-w-sm w-full">
            <span className="text-5xl block mb-3">🏆</span>
            <h2 className="text-xl font-bold text-foreground mb-2">{t("memoryFaith.victory" as any)}</h2>
            <button onClick={restart} className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm mt-4">
              {t("common.next" as any)} →
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
