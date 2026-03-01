import { useState, useCallback, useRef } from "react";
import { useImmersiveBg } from "@/hooks/useImmersiveBg";
import { getEpicBg } from "@/lib/epicBg";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, XCircle, Trophy, BookOpen, Star, Sparkles, Baby, Brain, Flame, Zap, Landmark, Lightbulb } from "lucide-react";
import { getQuizByCategory, buildQuizSession, type QuizCategory, type QuizQuestion } from "@/data/quizQuestions";
import { localizeQuestion } from "@/data/quizI18n";
import { useProgress } from "@/hooks/useProgress";
import { useLanguage } from "@/hooks/useLanguage";
import ProphetFlashcards from "@/components/ProphetFlashcards";
import { useXP } from "@/hooks/useXP";
import ProgressBarDuolingo from "@/components/ProgressBarDuolingo";
import { usePerfectChallenge } from "@/hooks/usePerfectChallenge";
import { useQuestionStats, getQuestionId, buildAdaptiveSession } from "@/hooks/useQuestionStats";
import WeakCardsPanel from "@/components/WeakCardsPanel";
import { useShareExploit } from "@/hooks/useShareExploit";
import { Share2, Loader2 } from "lucide-react";

// Persist quiz stats in localStorage
const QUIZ_STATS_KEY = "quranEasyQuizStats";
const QUIZ_STREAK_KEY = "quranEasyQuizStreak";

interface QuizStats {
  general: { completed: number; totalCorrect: number; totalQuestions: number };
  memorization: { completed: number; totalCorrect: number; totalQuestions: number };
  tajweed: { completed: number; totalCorrect: number; totalQuestions: number };
  kids: { completed: number; totalCorrect: number; totalQuestions: number };
  perfect: { completed: number; totalCorrect: number; totalQuestions: number };
  adaptive: { completed: number; totalCorrect: number; totalQuestions: number };
  prophets: { completed: number; totalCorrect: number; totalQuestions: number };
  islam_basics: { completed: number; totalCorrect: number; totalQuestions: number };
  animals: { completed: number; totalCorrect: number; totalQuestions: number };
}

interface QuizStreak {
  days: number;
  lastDate: string; // YYYY-MM-DD
}

function loadQuizStats(): QuizStats {
  try {
    const stored = localStorage.getItem(QUIZ_STATS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const defaults = { completed: 0, totalCorrect: 0, totalQuestions: 0 };
      if (!parsed.perfect) parsed.perfect = { ...defaults };
      if (!parsed.adaptive) parsed.adaptive = { ...defaults };
      if (!parsed.prophets) parsed.prophets = { ...defaults };
      if (!parsed.islam_basics) parsed.islam_basics = { ...defaults };
      if (!parsed.animals) parsed.animals = { ...defaults };
      return parsed;
    }
  } catch {}
  return {
    general: { completed: 0, totalCorrect: 0, totalQuestions: 0 },
    memorization: { completed: 0, totalCorrect: 0, totalQuestions: 0 },
    tajweed: { completed: 0, totalCorrect: 0, totalQuestions: 0 },
    kids: { completed: 0, totalCorrect: 0, totalQuestions: 0 },
    perfect: { completed: 0, totalCorrect: 0, totalQuestions: 0 },
    adaptive: { completed: 0, totalCorrect: 0, totalQuestions: 0 },
    prophets: { completed: 0, totalCorrect: 0, totalQuestions: 0 },
    islam_basics: { completed: 0, totalCorrect: 0, totalQuestions: 0 },
    animals: { completed: 0, totalCorrect: 0, totalQuestions: 0 },
  };
}

function saveQuizStats(stats: QuizStats) {
  localStorage.setItem(QUIZ_STATS_KEY, JSON.stringify(stats));
}

function loadQuizStreak(): QuizStreak {
  try {
    const stored = localStorage.getItem(QUIZ_STREAK_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { days: 0, lastDate: "" };
}

function updateQuizStreak(): QuizStreak {
  const today = new Date().toISOString().split("T")[0];
  const streak = loadQuizStreak();
  if (streak.lastDate === today) return streak; // already counted today
  
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const newStreak: QuizStreak = {
    days: streak.lastDate === yesterday ? streak.days + 1 : 1,
    lastDate: today,
  };
  localStorage.setItem(QUIZ_STREAK_KEY, JSON.stringify(newStreak));
  return newStreak;
}

export { loadQuizStats, type QuizStats };

// ─── Category config with i18n keys ───
const CATEGORY_CONFIG: Record<string, { gradient: string; emoji: string; titleKey: string; subtitleKey: string; icon: typeof Star }> = {
  tajweed: { gradient: "from-violet-500 to-purple-600", emoji: "📖", titleKey: "quiz.cat.tajweed", subtitleKey: "quiz.cat.tajweedDesc", icon: Sparkles },
  memorization: { gradient: "from-blue-500 to-blue-600", emoji: "🔎", titleKey: "quiz.cat.memorization", subtitleKey: "quiz.cat.memorizationDesc", icon: BookOpen },
  general: { gradient: "from-emerald-500 to-emerald-600", emoji: "🌿", titleKey: "quiz.cat.general", subtitleKey: "quiz.cat.generalDesc", icon: Star },
  adaptive: { gradient: "from-amber-500 to-orange-500", emoji: "🧠", titleKey: "quiz.cat.adaptive", subtitleKey: "quiz.cat.adaptiveDesc", icon: Brain },
  perfect: { gradient: "from-rose-500 to-pink-600", emoji: "🏆", titleKey: "quiz.cat.perfect", subtitleKey: "quiz.cat.perfectDesc", icon: Trophy },
  kids: { gradient: "from-sky-400 to-cyan-500", emoji: "🧒", titleKey: "quiz.cat.kids", subtitleKey: "quiz.cat.kidsDesc", icon: Baby },
  prophets: { gradient: "from-amber-600 to-yellow-500", emoji: "📚", titleKey: "quiz.cat.prophets", subtitleKey: "quiz.cat.prophetsDesc", icon: Landmark },
  islam_basics: { gradient: "from-teal-500 to-cyan-600", emoji: "💡", titleKey: "quiz.cat.islam_basics", subtitleKey: "quiz.cat.islam_basicsDesc", icon: Lightbulb },
  animals: { gradient: "from-lime-500 to-green-600", emoji: "🐫", titleKey: "quiz.cat.animals", subtitleKey: "quiz.cat.animalsDesc", icon: Star },
};

export default function Quiz() {
  const navigate = useNavigate();
  const { immersiveEnabled, choices } = useImmersiveBg();
  const epicBg = immersiveEnabled ? getEpicBg(choices.quiz) : null;
  const { setLevel } = useProgress();
  const { t } = useLanguage();
  const [category, setCategory] = useState<QuizCategory | null>(null);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [quizXP, setQuizXP] = useState(0);
  const xp = useXP();
  const perfectChallenge = usePerfectChallenge();
  const questionStats = useQuestionStats();
  const xpAwardedRef = useRef(false);
  const exploit = useShareExploit();
  const answersRef = useRef<{ question: QuizQuestion; selectedIndex: number }[]>([]);

  const [session, setSession] = useState<QuizQuestion[]>([]);
  const questions = session;
  const question = questions[current];

  const quizStreak = loadQuizStreak();

  const handleSelectCategory = (cat: QuizCategory) => {
    setCategory(cat);
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setFinished(false);
    setConsecutiveCorrect(0);
    setBestStreak(0);
    setQuizXP(0);
    answersRef.current = [];
    const pool = getQuizByCategory(cat);
    if (cat === "adaptive") {
      setSession(buildAdaptiveSession(pool, questionStats.stats, 10));
    } else {
      setSession(buildQuizSession(pool, 10));
    }
  };

  const handleSelect = useCallback(
    (idx: number) => {
      if (selected !== null || !question) return;
      setSelected(idx);
      const correct = idx === question.correctIndex;
      
      let earnedXP = 0;
      if (correct) {
        setScore((s) => s + 1);
        earnedXP = 10; // base XP
        const newStreak = consecutiveCorrect + 1;
        setConsecutiveCorrect(newStreak);
        if (newStreak > bestStreak) setBestStreak(newStreak);
        // Streak bonus
        if (newStreak >= 3) earnedXP += 5;
        if (newStreak >= 5) earnedXP += 5;
      } else {
        setConsecutiveCorrect(0);
      }
      setQuizXP(prev => prev + earnedXP);
      
      answersRef.current.push({ question, selectedIndex: idx });

      setTimeout(() => {
        if (current < questions.length - 1) {
          setCurrent((c) => c + 1);
          setSelected(null);
        } else {
          const finalScore = correct ? score + 1 : score;
          const stats = loadQuizStats();
          if (category) {
            stats[category].completed += 1;
            stats[category].totalCorrect += finalScore;
            stats[category].totalQuestions += questions.length;
            saveQuizStats(stats);
          }
          if (category === "general") {
            const level = finalScore <= 2 ? "easy" : finalScore <= 4 ? "medium" : "hard";
            setLevel(level as "easy" | "medium" | "hard", finalScore);
          }
          setFinished(true);
          xpAwardedRef.current = false;
        }
      }, 1000);
    },
    [selected, current, question, score, setLevel, category, questions, consecutiveCorrect, bestStreak]
  );

  const handleBackToCategories = () => {
    setCategory(null);
    setShowFlashcards(false);
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setFinished(false);
    setSession([]);
    setQuizXP(0);
    setConsecutiveCorrect(0);
    setBestStreak(0);
    exploit.reset();
  };

  // Flashcards mode
  if (showFlashcards) {
    return (
      <div className="min-h-screen pb-24 px-6 pt-14">
        <ProphetFlashcards onBack={() => setShowFlashcards(false)} />
      </div>
    );
  }

  const catConfig = category ? CATEGORY_CONFIG[category] : null;

  // ═══ CATEGORY SELECTION ═══
  if (!category) {
    const categoryOrder: QuizCategory[] = ["tajweed", "memorization", "general", "prophets", "islam_basics", "animals", "adaptive", "perfect", "kids"];

    return (
      <div className={`min-h-screen pb-24 ${epicBg ? epicBg.className : ""}`} style={epicBg?.image ? { backgroundImage: `url(${epicBg.image})` } : undefined}>
        <div className="px-6 pt-14 pb-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground mb-4">
            <ArrowLeft size={20} />
            <span className="text-sm">{t("quiz.back")}</span>
          </button>
          <h1 className="text-2xl font-bold text-foreground mb-1">Quiz Hifz</h1>
          <p className="text-sm text-muted-foreground">Choisis ta catégorie et progresse</p>
        </div>

        {/* Quiz streak banner */}
        {quizStreak.days > 0 && (
          <div className="mx-6 mb-4 bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/30 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Flame size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Streak Quiz : {quizStreak.days} jour{quizStreak.days > 1 ? "s" : ""} 🔥</p>
              <p className="text-[11px] text-muted-foreground">Continue chaque jour pour maintenir ta série</p>
            </div>
          </div>
        )}

        <div className="px-6 space-y-3">
          {categoryOrder.map((catId, i) => {
            const config = CATEGORY_CONFIG[catId];
            const stats = loadQuizStats()[catId];
            const successRate = stats.totalQuestions > 0
              ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
              : null;

            return (
              <motion.button
                key={catId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => handleSelectCategory(catId)}
                className="w-full flex items-center gap-4 bg-card border border-border rounded-2xl p-4 text-left active:scale-[0.98] transition-transform"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-2xl shrink-0`}>
                  <span className="drop-shadow-sm">{config.emoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm">{config.title}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{config.subtitle}</p>
                  {successRate !== null && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="h-1.5 flex-1 max-w-[80px] bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full bg-gradient-to-r ${config.gradient}`} style={{ width: `${successRate}%` }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono">{successRate}%</span>
                    </div>
                  )}
                </div>
                <config.icon size={16} className="text-muted-foreground shrink-0" />
              </motion.button>
            );
          })}

          {/* Flashcards */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => setShowFlashcards(true)}
            className="w-full flex items-center gap-4 bg-card border-2 border-dashed border-primary/30 rounded-2xl p-4 text-left active:scale-[0.98] transition-transform"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
              🃏
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground text-sm">{t("quiz.flashcards")}</p>
              <p className="text-[11px] text-muted-foreground">{t("quiz.flashcardsDesc")}</p>
            </div>
          </motion.button>
        </div>
      </div>
    );
  }

  // ═══ QUIZ FINISHED ═══
  if (finished) {
    const finalScore = score;
    const totalXP = quizXP;

    if (!xpAwardedRef.current) {
      xpAwardedRef.current = true;
      if (totalXP > 0) xp.addXP(totalXP);
      // Update daily quiz streak
      updateQuizStreak();
      // Submit to weekly perfect challenge if category is "perfect"
      if (category === "perfect" && perfectChallenge.challenge) {
        perfectChallenge.submitScore(finalScore);
      }
      // Record answers for SRS stats
      questionStats.recordSession(answersRef.current);
    }

    const updatedStreak = loadQuizStreak();
    const weakCards = questionStats.getWeakCards(5);
    const allPoolQuestions = getQuizByCategory(category);
    const emoji = finalScore >= 8 ? "🏆" : finalScore >= 5 ? "💪" : "📖";

    return (
      <div className={`min-h-screen flex flex-col items-center justify-center px-6 text-center ${epicBg ? epicBg.className : ""}`} style={epicBg?.image ? { backgroundImage: `url(${epicBg.image})` } : undefined}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }} className="text-5xl mb-4">
          {emoji}
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-2xl font-bold text-foreground">
          Bravo pour ce quiz !
        </motion.h1>

        {/* XP and streak stats */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="w-full max-w-xs mt-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card border border-border rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Zap size={14} className="text-primary" />
                <span className="text-[11px] text-muted-foreground">XP gagnés</span>
              </div>
              <p className="text-xl font-bold text-primary">+{totalXP}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Flame size={14} className="text-amber-500" />
                <span className="text-[11px] text-muted-foreground">Meilleure série</span>
              </div>
              <p className="text-xl font-bold text-foreground">{bestStreak}</p>
            </div>
          </div>

          {/* Quiz streak */}
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-3 flex items-center gap-3">
            <Flame size={18} className="text-amber-500 shrink-0" />
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">Streak Quiz : {updatedStreak.days} jour{updatedStreak.days > 1 ? "s" : ""}</p>
              <p className="text-[10px] text-muted-foreground">Reviens demain pour continuer ta série</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="w-full max-w-xs mt-4">
          <ProgressBarDuolingo
            level={xp.level}
            xpInLevel={xp.xpInLevel}
            xpForNext={xp.xpForNext}
            xpTotal={xp.xpTotal}
            xpToday={xp.xpToday}
            streakDays={xp.streakDays}
            lastGain={xp.lastGain}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex flex-col gap-3 mt-5 w-full max-w-xs">
          {category === "perfect" && perfectChallenge.challenge && (
            <button onClick={() => navigate("/perfect-leaderboard")} className="bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-2xl px-6 py-3 font-semibold text-sm flex items-center justify-center gap-2">
              <Trophy size={16} /> Classement de la semaine
            </button>
          )}
          {/* Share exploit button */}
          <button
            onClick={() => exploit.shareExploit({
              type: "quiz",
              category: catConfig?.title || category,
              score: Math.round((finalScore / questions.length) * 100),
              xp: totalXP,
              streak: bestStreak,
            })}
            disabled={exploit.sharing || exploit.shared}
            className={`w-full flex items-center justify-center gap-2 rounded-2xl px-6 py-3 font-semibold text-sm transition-all ${
              exploit.shared
                ? "bg-success/15 text-success border border-success/30"
                : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white active:scale-[0.98]"
            }`}
          >
            {exploit.sharing ? <Loader2 size={16} className="animate-spin" /> : exploit.shared ? <CheckCircle2 size={16} /> : <Share2 size={16} />}
            {exploit.shared ? "Partagé dans tes groupes !" : "Partager mon exploit"}
          </button>

          <div className="flex gap-3">
            <button onClick={handleBackToCategories} className="flex-1 bg-muted text-foreground rounded-2xl px-6 py-3 font-semibold text-sm">
              Autre quiz
            </button>
            <button onClick={() => handleSelectCategory(category)} className="flex-1 bg-primary text-primary-foreground rounded-2xl px-6 py-3 font-semibold text-sm">
              Rejouer
            </button>
          </div>
        </motion.div>

        <WeakCardsPanel
          weakCards={weakCards}
          allQuestions={allPoolQuestions}
          onReviewNow={() => handleSelectCategory("adaptive")}
        />
      </div>
    );
  }

  // ═══ QUIZ QUESTIONS ═══
  const progressPercent = questions.length > 0 ? ((current) / questions.length) * 100 : 0;

  return (
    <div className={`min-h-screen pb-8 ${epicBg ? epicBg.className : ""}`} style={epicBg?.image ? { backgroundImage: `url(${epicBg.image})` } : undefined}>
      <div className="px-6 pt-14 pb-6">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={handleBackToCategories} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">{catConfig?.title || "Quiz"}</p>
            <p className="text-[11px] text-muted-foreground">Question {current + 1}</p>
          </div>
          {/* Streak indicator */}
          {consecutiveCorrect >= 2 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/30 rounded-full px-2.5 py-1"
            >
              <Flame size={13} className="text-amber-500" />
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{consecutiveCorrect}</span>
            </motion.div>
          )}
          {/* XP counter */}
          <div className="flex items-center gap-1 bg-primary/10 rounded-full px-2.5 py-1">
            <Zap size={12} className="text-primary" />
            <span className="text-xs font-bold text-primary">{quizXP}</span>
          </div>
        </div>

        {/* Smooth progress bar (no numbers) */}
        <div className="h-2 bg-muted rounded-full overflow-hidden mb-8">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${catConfig?.gradient || "from-primary to-primary"}`}
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
                  <motion.button key={idx} whileTap={{ scale: 0.97 }} onClick={() => handleSelect(idx)} className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left font-medium ${style}`}>
                    <span className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center text-sm shrink-0">
                      {selected !== null && isCorrect ? <CheckCircle2 size={18} /> : selected !== null && isSelected ? <XCircle size={18} /> : String.fromCharCode(65 + idx)}
                    </span>
                    {option}
                  </motion.button>
                );
              })}
            </div>

            {/* Streak bonus notification */}
            <AnimatePresence>
              {selected !== null && selected === question?.correctIndex && consecutiveCorrect >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 text-center"
                >
                  <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 rounded-full px-3 py-1.5 text-xs font-bold">
                    <Flame size={14} /> Série de {consecutiveCorrect} ! +5 XP bonus
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
