import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useXP } from "@/hooks/useXP";
import Confetti from "@/components/Confetti";
import DifficultySelector from "@/components/DifficultySelector";

interface ColorQuestion {
  letter: string;
  correctColor: string;
  colorLabel: string;
  rule: string;
}

const COLORS = [
  { id: "green", hex: "#22c55e", label: "Idgham" },
  { id: "red", hex: "#ef4444", label: "Qalqalah" },
  { id: "blue", hex: "#3b82f6", label: "Ikhfa" },
  { id: "orange", hex: "#f97316", label: "Ghunna" },
];

const QUESTIONS: ColorQuestion[] = [
  { letter: "قْ", correctColor: "red", colorLabel: "Qalqalah", rule: "ق est une lettre Qalqalah" },
  { letter: "طْ", correctColor: "red", colorLabel: "Qalqalah", rule: "ط est une lettre Qalqalah" },
  { letter: "بْ", correctColor: "red", colorLabel: "Qalqalah", rule: "ب est une lettre Qalqalah" },
  { letter: "دْ", correctColor: "red", colorLabel: "Qalqalah", rule: "د est une lettre Qalqalah" },
  { letter: "جْ", correctColor: "red", colorLabel: "Qalqalah", rule: "ج est une lettre Qalqalah" },
  { letter: "نّ", correctColor: "orange", colorLabel: "Ghunna", rule: "نّ nasalisation (Ghunna)" },
  { letter: "مّ", correctColor: "orange", colorLabel: "Ghunna", rule: "مّ nasalisation (Ghunna)" },
  { letter: "نْ + ي", correctColor: "green", colorLabel: "Idgham", rule: "Noon sakin + Ya = Idgham" },
  { letter: "نْ + و", correctColor: "green", colorLabel: "Idgham", rule: "Noon sakin + Waw = Idgham" },
  { letter: "نْ + ت", correctColor: "blue", colorLabel: "Ikhfa", rule: "Noon sakin + Ta = Ikhfa" },
  { letter: "نْ + ك", correctColor: "blue", colorLabel: "Ikhfa", rule: "Noon sakin + Kaf = Ikhfa" },
  { letter: "نْ + ج", correctColor: "blue", colorLabel: "Ikhfa", rule: "Noon sakin + Jim = Ikhfa" },
];

const DIFF_CONFIG: Record<string, { total: number; timerPerQ: number | null; xp: number }> = {
  easy:   { total: 5,  timerPerQ: null, xp: 10 },
  medium: { total: 8,  timerPerQ: null, xp: 20 },
  hard:   { total: 12, timerPerQ: 8,    xp: 35 },
};

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

export default function IslamicColorsPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { addXP } = useXP();

  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [questions, setQuestions] = useState<ColorQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [showVictory, setShowVictory] = useState(false);
  const [timer, setTimer] = useState<number | null>(null);

  const cfg = difficulty ? DIFF_CONFIG[difficulty] : null;

  const startGame = (diff: string) => {
    setDifficulty(diff);
    const c = DIFF_CONFIG[diff];
    setQuestions(shuffle(QUESTIONS).slice(0, c.total));
    setCurrent(0);
    setScore(0);
    setStreak(0);
    setFeedback(null);
    setShowVictory(false);
    setTimer(c.timerPerQ);
  };

  // Timer countdown
  useEffect(() => {
    if (!cfg?.timerPerQ || timer === null || timer <= 0 || feedback) return;
    const id = setTimeout(() => setTimer(t => t !== null ? t - 1 : null), 1000);
    return () => clearTimeout(id);
  }, [timer, cfg, feedback]);

  useEffect(() => {
    if (cfg?.timerPerQ && timer === 0 && !feedback) {
      setFeedback("wrong");
      setStreak(0);
      setTimeout(() => {
        setFeedback(null);
        if (current + 1 >= questions.length) { addXP(score); setShowVictory(true); }
        else { setCurrent(c => c + 1); setTimer(cfg.timerPerQ); }
      }, 1200);
    }
  }, [timer, cfg, feedback, current, questions.length, score, addXP]);

  const handleColorPick = (colorId: string) => {
    if (feedback || !cfg || current >= questions.length) return;
    const q = questions[current];
    const correct = colorId === q.correctColor;

    if (correct) {
      const bonus = streak >= 2 ? 3 : 0;
      setScore(s => s + 10 + bonus);
      setStreak(s => s + 1);
    } else { setStreak(0); }

    setFeedback(correct ? "correct" : "wrong");
    setTimeout(() => {
      setFeedback(null);
      if (current + 1 >= questions.length) { addXP(score + 10); setShowVictory(true); }
      else { setCurrent(c => c + 1); if (cfg.timerPerQ) setTimer(cfg.timerPerQ); }
    }, 1200);
  };

  const restart = () => { if (difficulty) startGame(difficulty); };
  const q = questions[current];

  if (!difficulty) {
    return <DifficultySelector title={t("kidsGames.islamicColors" as any)} icon="🎨" onSelect={startGame} onBack={() => navigate(-1)} t={(k) => t(k as any)} difficulties={[
      { key: "easy", emoji: "🌱", xpBase: 10, description: "5 questions" },
      { key: "medium", emoji: "🌿", xpBase: 20, description: "8 questions" },
      { key: "hard", emoji: "🔥", xpBase: 35, description: "12 questions + ⏱️" },
    ]} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-purple-50 to-pink-50 dark:from-background dark:via-background dark:to-background flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-6 pb-3">
        <button onClick={() => setDifficulty(null)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft size={18} className="text-foreground" />
        </button>
        <h1 className="text-sm font-bold text-foreground flex-1">🎨 {t(`memoryFaith.${difficulty}` as any)}</h1>
        {timer !== null && (
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${timer <= 3 ? "bg-destructive/15 text-destructive animate-pulse" : "bg-muted text-muted-foreground"}`}>⏱️ {timer}s</span>
        )}
        <span className="bg-primary/15 text-primary px-3 py-1 rounded-full text-xs font-bold">⭐ {score}</span>
      </div>

      <div className="px-4 mb-4">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${((current + (feedback ? 1 : 0)) / (cfg?.total || 1)) * 100}%` }} />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1 text-center">{current + 1} / {cfg?.total}</p>
      </div>

      {q && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          {streak >= 2 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-amber-500/15 px-3 py-1 rounded-full text-xs font-bold text-amber-600 dark:text-amber-400">🔥 {streak} combo!</motion.div>
          )}
          <p className="text-sm text-muted-foreground text-center">{t("kidsGames.whatColor" as any)}</p>
          <motion.div key={current} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className={`w-32 h-32 rounded-3xl bg-card border-2 border-border shadow-xl flex items-center justify-center text-5xl font-bold font-quran ${
              feedback === "correct" ? "border-emerald-500 bg-emerald-500/10" : feedback === "wrong" ? "border-destructive bg-destructive/10" : ""
            }`} dir="rtl">{q.letter}</motion.div>
          <AnimatePresence>
            {feedback && <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs text-center text-muted-foreground">{q.rule}</motion.p>}
          </AnimatePresence>
          <div className="grid grid-cols-2 gap-3 w-full max-w-[280px]">
            {COLORS.map((c) => (
              <motion.button key={c.id} whileTap={{ scale: 0.9 }} onClick={() => handleColorPick(c.id)}
                className="flex flex-col items-center gap-1 p-4 rounded-2xl border border-border bg-card shadow-md active:shadow-sm transition-all">
                <div className="w-10 h-10 rounded-full" style={{ backgroundColor: c.hex }} />
                <span className="text-[10px] font-bold text-foreground">{c.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <Confetti active={showVictory} emoji duration={3000} />
      <AnimatePresence>
        {showVictory && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.6 }} animate={{ scale: 1 }} className="bg-card border border-border rounded-3xl p-6 mx-6 text-center shadow-2xl max-w-sm w-full">
              <span className="text-5xl block mb-3">🎨</span>
              <h2 className="text-xl font-bold text-foreground mb-2">{t("memoryFaith.victory" as any)}</h2>
              <p className="text-sm text-muted-foreground mb-4">⭐ {score} XP</p>
              <div className="flex gap-2">
                <button onClick={restart} className="flex-1 py-3 rounded-2xl bg-muted text-foreground font-bold text-sm">{t("memoryFaith.replay" as any)}</button>
                <button onClick={() => setDifficulty(null)} className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm">{t("memoryFaith.changeDifficulty" as any)}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
