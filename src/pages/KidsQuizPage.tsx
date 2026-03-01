import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, XCircle, Flame, Zap, Star } from "lucide-react";
import { getQuizByCategory, buildQuizSession, type QuizCategory, type QuizQuestion } from "@/data/quizQuestions";
import { useQuranXp } from "@/hooks/useQuranXp";
import { useLanguage } from "@/hooks/useLanguage";
import { getChildSuccessMessage, getChildEncourageMessage } from "@/lib/childMessages";

const KIDS_CATEGORIES: { id: QuizCategory; emoji: string; title: string; subtitle: string; gradient: string; badge: string }[] = [
  { id: "prophets", emoji: "📚", title: "Histoire des Prophètes", subtitle: "Questions amusantes sur les prophètes du Coran", gradient: "from-amber-600 to-yellow-500", badge: "Ami des Prophètes" },
  { id: "islam_basics", emoji: "💡", title: "L'Islam de base", subtitle: "Piliers, croyance, adhkār, akhlaq", gradient: "from-teal-500 to-cyan-600", badge: "Apprenti Musulman" },
  { id: "animals", emoji: "🐫", title: "Animaux dans le Coran", subtitle: "Découvre les animaux mentionnés dans le Coran", gradient: "from-lime-500 to-green-600", badge: "Explorateur des Animaux" },
];

const STICKERS_KEY = "kidsQuizBadges";

function loadBadges(): Record<string, number> {
  try { const s = localStorage.getItem(STICKERS_KEY); return s ? JSON.parse(s) : {}; } catch { return {}; }
}
function saveBadges(b: Record<string, number>) { localStorage.setItem(STICKERS_KEY, JSON.stringify(b)); }

export default function KidsQuizPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const xp = useQuranXp();
  const xpAwardedRef = useRef(false);

  const [category, setCategory] = useState<QuizCategory | null>(null);
  const [session, setSession] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [quizXP, setQuizXP] = useState(0);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const question = session[current];
  const catMeta = KIDS_CATEGORIES.find(c => c.id === category);

  const handleSelectCategory = (cat: QuizCategory) => {
    setCategory(cat);
    setCurrent(0); setScore(0); setSelected(null); setFinished(false);
    setQuizXP(0); setConsecutiveCorrect(0); setFeedbackMsg(null);
    xpAwardedRef.current = false;
    setSession(buildQuizSession(getQuizByCategory(cat), 10));
  };

  const handleSelect = useCallback((idx: number) => {
    if (selected !== null || !question) return;
    setSelected(idx);
    const correct = idx === question.correctIndex;
    let earned = 0;
    if (correct) {
      setScore(s => s + 1);
      earned = 10;
      const streak = consecutiveCorrect + 1;
      setConsecutiveCorrect(streak);
      if (streak >= 3) earned += 5;
      setFeedbackMsg(getChildSuccessMessage());
    } else {
      setConsecutiveCorrect(0);
      // Show explanation
      const correctAnswer = question.options[question.correctIndex];
      setFeedbackMsg(`${getChildEncourageMessage()} La bonne réponse est : ${correctAnswer}`);
    }
    setQuizXP(prev => prev + earned);

    setTimeout(() => {
      if (current < session.length - 1) {
        setCurrent(c => c + 1);
        setSelected(null);
        setFeedbackMsg(null);
      } else {
        setFinished(true);
      }
    }, 2200);
  }, [selected, current, question, session, consecutiveCorrect]);

  const handleBack = () => {
    setCategory(null); setSession([]); setCurrent(0); setScore(0);
    setSelected(null); setFinished(false); setQuizXP(0);
  };

  // ─── Finished ───
  if (finished && category) {
    if (!xpAwardedRef.current) {
      xpAwardedRef.current = true;
      if (quizXP > 0) xp.addXp(quizXP, "quiz_correct_answer");
      // Save badge progress
      const badges = loadBadges();
      badges[category] = (badges[category] || 0) + score;
      saveBadges(badges);
    }
    const badges = loadBadges();
    const totalForCat = badges[category] || 0;
    const emoji = score >= 8 ? "🏆" : score >= 5 ? "⭐" : "💪";

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center pb-24">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="text-6xl mb-4">{emoji}</motion.div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Bravo champion ! 🌟</h1>
        <p className="text-lg text-muted-foreground mb-1">{score}/{session.length} bonnes réponses</p>
        <p className="text-sm text-primary font-semibold mb-4">+{quizXP} XP gagnés</p>

        {/* Badge progress */}
        <div className="bg-card border border-border rounded-2xl p-4 w-full max-w-xs mb-6">
          <p className="text-sm font-semibold text-foreground mb-2">{catMeta?.badge || "Badge"}</p>
          <div className="flex items-center gap-3">
            <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
              <div className={`h-full rounded-full bg-gradient-to-r ${catMeta?.gradient || "from-primary to-primary"}`} style={{ width: `${Math.min(100, totalForCat)}%` }} />
            </div>
            <span className="text-xs font-mono text-muted-foreground">{totalForCat}/100</span>
          </div>
          {totalForCat >= 100 && <p className="text-xs text-primary mt-2 font-bold">🏅 Badge débloqué !</p>}
        </div>

        <div className="flex gap-3 w-full max-w-xs">
          <button onClick={handleBack} className="flex-1 bg-muted text-foreground rounded-2xl px-4 py-3 font-semibold text-sm">Autre quiz</button>
          <button onClick={() => handleSelectCategory(category)} className="flex-1 bg-primary text-primary-foreground rounded-2xl px-4 py-3 font-semibold text-sm">Rejouer</button>
        </div>
      </div>
    );
  }

  // ─── Category selection ───
  if (!category) {
    return (
      <div className="min-h-screen pb-24 px-6 pt-14">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground mb-4">
          <ArrowLeft size={20} /><span className="text-sm">Retour</span>
        </button>
        <h1 className="text-2xl font-bold text-foreground mb-1">Quiz Enfants 🧒</h1>
        <p className="text-sm text-muted-foreground mb-6">Apprends en t'amusant avec ces quiz adaptés !</p>

        <div className="space-y-4">
          {KIDS_CATEGORIES.map((cat, i) => {
            const badges = loadBadges();
            const progress = badges[cat.id] || 0;
            return (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => handleSelectCategory(cat.id)}
                className="w-full flex items-center gap-4 bg-card border border-border rounded-3xl p-5 text-left active:scale-[0.97] transition-transform"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center text-3xl shrink-0`}>
                  {cat.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-base">{cat.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{cat.subtitle}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="h-2 flex-1 max-w-[100px] bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${cat.gradient}`} style={{ width: `${Math.min(100, progress)}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">{progress}/100</span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── Quiz questions (kids-friendly UI) ───
  const progressPercent = session.length > 0 ? (current / session.length) * 100 : 0;

  return (
    <div className="min-h-screen pb-8">
      <div className="px-6 pt-14 pb-6">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={handleBack} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <p className="text-base font-bold text-foreground">{catMeta?.title || "Quiz"}</p>
          </div>
          {consecutiveCorrect >= 2 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1 bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/30 rounded-full px-2.5 py-1">
              <Flame size={14} className="text-amber-500" />
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{consecutiveCorrect}</span>
            </motion.div>
          )}
          <div className="flex items-center gap-1 bg-primary/10 rounded-full px-2.5 py-1">
            <Zap size={13} className="text-primary" />
            <span className="text-xs font-bold text-primary">{quizXP}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="h-3 bg-muted rounded-full overflow-hidden mb-8">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${catMeta?.gradient || "from-primary to-primary"}`}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={current} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
            <h2 className="text-xl font-bold text-foreground mb-8">{question?.question}</h2>

            <div className="space-y-3">
              {question?.options.map((option, idx) => {
                const isSelected = selected === idx;
                const isCorrect = idx === question.correctIndex;
                let style = "bg-card border-border text-card-foreground";
                if (selected !== null) {
                  if (isCorrect) style = "bg-success/10 border-success text-success";
                  else if (isSelected) style = "bg-destructive/10 border-destructive text-destructive";
                }

                return (
                  <motion.button
                    key={idx}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSelect(idx)}
                    className={`w-full flex items-center gap-3 p-5 rounded-2xl border-2 transition-all text-left font-medium text-base ${style}`}
                  >
                    <span className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center text-base shrink-0">
                      {selected !== null && isCorrect ? <CheckCircle2 size={20} /> : selected !== null && isSelected ? <XCircle size={20} /> : String.fromCharCode(65 + idx)}
                    </span>
                    {option}
                  </motion.button>
                );
              })}
            </div>

            {/* Feedback message */}
            <AnimatePresence>
              {feedbackMsg && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-5 bg-card border border-border rounded-2xl p-4 text-center"
                >
                  <p className="text-sm font-semibold text-foreground">{feedbackMsg}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
