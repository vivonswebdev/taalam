import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useXP } from "@/hooks/useXP";
import Confetti from "@/components/Confetti";

interface ChainStep {
  op: string;
  value: number;
  result: number;
  display: string;
}

function generateChain(length: number, maxVal: number): { start: number; steps: ChainStep[] } {
  const ops = ["+", "-", "×"];
  let current = Math.floor(Math.random() * 10) + 5;
  const start = current;
  const steps: ChainStep[] = [];

  for (let i = 0; i < length; i++) {
    const op = ops[Math.floor(Math.random() * ops.length)];
    let val: number, result: number;
    switch (op) {
      case "-":
        val = Math.floor(Math.random() * Math.min(current, maxVal)) + 1;
        result = current - val;
        break;
      case "×":
        val = Math.floor(Math.random() * 5) + 2;
        result = current * val;
        break;
      default:
        val = Math.floor(Math.random() * maxVal) + 1;
        result = current + val;
    }
    steps.push({ op, value: val, result, display: `${op} ${val}` });
    current = result;
  }
  return { start, steps };
}

function generateChoicesFor(answer: number): number[] {
  const choices = new Set<number>([answer]);
  while (choices.size < 4) {
    const offset = Math.floor(Math.random() * Math.max(10, Math.abs(answer))) - 5;
    const wrong = answer + (offset === 0 ? (Math.random() > 0.5 ? 1 : -1) : offset);
    if (wrong >= 0) choices.add(wrong);
  }
  return Array.from(choices).sort(() => Math.random() - 0.5);
}

export default function MathChainPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { addXP } = useXP();

  const [level, setLevel] = useState(1);
  const chainLength = Math.min(3 + Math.floor(level / 2), 7);
  const maxVal = 5 + level * 2;

  const [chain, setChain] = useState(() => generateChain(3, 10));
  const [stepIdx, setStepIdx] = useState(0);
  const [currentValue, setCurrentValue] = useState(chain.start);
  const [choices, setChoices] = useState(() => generateChoicesFor(chain.steps[0].result));
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [showVictory, setShowVictory] = useState(false);

  const step = chain.steps[stepIdx];

  const handleAnswer = (ans: number) => {
    if (feedback) return;
    if (ans === step.result) {
      setFeedback("correct");
      const bonus = combo >= 2 ? combo * 2 : 0;
      setScore(s => s + 10 + bonus);
      setCombo(c => c + 1);

      setTimeout(() => {
        setFeedback(null);
        setCurrentValue(step.result);
        if (stepIdx + 1 >= chain.steps.length) {
          addXP(10 + level * 2);
          setShowVictory(true);
        } else {
          setStepIdx(i => i + 1);
          setChoices(generateChoicesFor(chain.steps[stepIdx + 1].result));
        }
      }, 500);
    } else {
      setFeedback("wrong");
      setCombo(0);
      setTimeout(() => setFeedback(null), 600);
    }
  };

  const nextLevel = () => {
    const newLevel = level + 1;
    setLevel(newLevel);
    const newChain = generateChain(Math.min(3 + Math.floor(newLevel / 2), 7), 5 + newLevel * 2);
    setChain(newChain);
    setStepIdx(0);
    setCurrentValue(newChain.start);
    setChoices(generateChoicesFor(newChain.steps[0].result));
    setShowVictory(false);
    setCombo(0);
  };

  const restart = () => {
    setLevel(1);
    const newChain = generateChain(3, 10);
    setChain(newChain);
    setStepIdx(0);
    setCurrentValue(newChain.start);
    setChoices(generateChoicesFor(newChain.steps[0].result));
    setScore(0);
    setCombo(0);
    setShowVictory(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-emerald-50 to-green-50 dark:from-background dark:via-background dark:to-background flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-6 pb-2">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft size={18} className="text-foreground" />
        </button>
        <h1 className="text-sm font-bold text-foreground flex-1">⛓️ {t("mathGames.mathChain" as any)}</h1>
        <span className="bg-primary/15 text-primary px-3 py-1 rounded-full text-xs font-bold">⭐ {score}</span>
      </div>

      {/* Chain progress */}
      <div className="px-4 mb-4">
        <div className="flex items-center gap-1 justify-center flex-wrap">
          <span className="text-xs font-bold text-foreground bg-primary/10 px-2 py-1 rounded-lg">{chain.start}</span>
          {chain.steps.map((s, i) => (
            <div key={i} className="flex items-center gap-1">
              <span className="text-muted-foreground text-xs">{s.display}</span>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                i < stepIdx ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" :
                i === stepIdx ? "bg-primary/15 text-primary ring-1 ring-primary/30" :
                "bg-muted text-muted-foreground"
              }`}>
                {i < stepIdx ? s.result : "?"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {combo >= 2 && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center mb-2">
          <span className="bg-amber-500/15 px-3 py-1 rounded-full text-xs font-bold text-amber-600 dark:text-amber-400">🔥 {combo}x combo!</span>
        </motion.div>
      )}

      {/* Question */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        <motion.div key={stepIdx} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className={`text-center px-8 py-6 rounded-3xl border-2 shadow-lg ${
            feedback === "correct" ? "border-emerald-500 bg-emerald-500/10" :
            feedback === "wrong" ? "border-destructive bg-destructive/10" :
            "border-border bg-card"
          }`}>
          <p className="text-2xl font-black text-foreground">{currentValue} {step?.display} = ?</p>
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

      <Confetti active={showVictory} emoji duration={3000} />
      <AnimatePresence>
        {showVictory && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.6 }} animate={{ scale: 1 }} className="bg-card border border-border rounded-3xl p-6 mx-6 text-center shadow-2xl max-w-sm w-full">
              <span className="text-5xl block mb-3">⛓️</span>
              <h2 className="text-xl font-bold text-foreground mb-2">{t("memoryFaith.victory" as any)}</h2>
              <p className="text-sm text-muted-foreground mb-4">⭐ {score} XP</p>
              <div className="flex gap-2">
                <button onClick={restart} className="flex-1 py-3 rounded-2xl bg-muted text-foreground font-bold text-sm">
                  <RotateCcw size={14} className="inline mr-1" /> {t("memoryFaith.replay" as any)}
                </button>
                <button onClick={nextLevel} className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm">
                  {t("common.next" as any)} →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
