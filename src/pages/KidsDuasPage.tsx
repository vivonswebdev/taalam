import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Volume2, ChevronRight, Trophy, RotateCcw } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { KIDS_DUAS, DUA_CATEGORIES, generateDuaQuiz, type DuaCategory, type DuaQuizQuestion } from "@/data/kidsDuas";
import { Badge } from "@/components/ui/badge";
import Confetti from "@/components/Confetti";

function speakArabic(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ar-SA";
  u.rate = 0.7;
  window.speechSynthesis.speak(u);
}

type View = "categories" | "list" | "detail" | "quiz" | "quizResult";

export default function KidsDuasPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [view, setView] = useState<View>("categories");
  const [selectedCategory, setSelectedCategory] = useState<DuaCategory | null>(null);
  const [selectedDuaId, setSelectedDuaId] = useState<string | null>(null);

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<DuaQuizQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Progress from localStorage
  const [learnedIds, setLearnedIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("kids_duas_learned") || "[]"); } catch { return []; }
  });

  const markLearned = (id: string) => {
    if (learnedIds.includes(id)) return;
    const next = [...learnedIds, id];
    setLearnedIds(next);
    localStorage.setItem("kids_duas_learned", JSON.stringify(next));
  };

  const filteredDuas = useMemo(
    () => selectedCategory ? KIDS_DUAS.filter(d => d.category === selectedCategory) : KIDS_DUAS,
    [selectedCategory]
  );

  const selectedDua = KIDS_DUAS.find(d => d.id === selectedDuaId);
  const currentQuizQ = quizQuestions[quizIndex];

  const startQuiz = () => {
    setQuizQuestions(generateDuaQuiz(5));
    setQuizIndex(0);
    setQuizScore(0);
    setQuizAnswer(null);
    setView("quiz");
  };

  const answerQuiz = (duaId: string) => {
    if (quizAnswer) return;
    setQuizAnswer(duaId);
    const correct = duaId === currentQuizQ.correctDuaId;
    if (correct) setQuizScore(s => s + 1);

    setTimeout(() => {
      if (quizIndex + 1 < quizQuestions.length) {
        setQuizIndex(i => i + 1);
        setQuizAnswer(null);
      } else {
        setView("quizResult");
        if (quizScore + (correct ? 1 : 0) >= 3) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen pb-24">
      <Confetti active={showConfetti} />

      {/* Header */}
      <div className="px-6 pt-14 pb-2">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => {
              if (view === "detail") setView("list");
              else if (view === "list") setView("categories");
              else if (view === "quiz" || view === "quizResult") setView("categories");
              else navigate(-1);
            }}
            className="w-9 h-9 rounded-full bg-muted flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span>🤲</span> {t("kidsDuas.title" as any)}
            </h1>
            <p className="text-xs text-muted-foreground">{t("kidsDuas.subtitle" as any)}</p>
          </div>
        </div>
      </div>

      {/* ═══ CATEGORIES VIEW ═══ */}
      {view === "categories" && (
        <div className="px-5 space-y-3">
          {/* Progress */}
          <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
            <span className="text-2xl">📿</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                {learnedIds.length}/{KIDS_DUAS.length} {t("kidsDuas.learned" as any)}
              </p>
              <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden mt-1">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.round((learnedIds.length / KIDS_DUAS.length) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quiz button */}
          <button
            onClick={startQuiz}
            className="w-full flex items-center gap-3 bg-gradient-to-r from-primary/15 to-accent/10 border border-primary/20 rounded-2xl p-4 active:scale-[0.98] transition-transform"
          >
            <Trophy size={20} className="text-primary" />
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-foreground">{t("kidsDuas.quizTitle" as any)}</p>
              <p className="text-[10px] text-muted-foreground">{t("kidsDuas.quizDesc" as any)}</p>
            </div>
            <ChevronRight size={16} className="text-muted-foreground" />
          </button>

          {/* Category grid */}
          <div className="grid grid-cols-2 gap-3">
            {DUA_CATEGORIES.map((cat, i) => {
              const count = KIDS_DUAS.filter(d => d.category === cat.id).length;
              const learnedCount = KIDS_DUAS.filter(d => d.category === cat.id && learnedIds.includes(d.id)).length;
              return (
                <motion.button
                  key={cat.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => { setSelectedCategory(cat.id); setView("list"); }}
                  className="flex flex-col items-center gap-2 rounded-2xl p-4 bg-card border border-border shadow-sm"
                >
                  <span className="text-3xl">{cat.emoji}</span>
                  <p className="text-sm font-bold text-foreground">{t(cat.labelKey as any)}</p>
                  <p className="text-[10px] text-muted-foreground">{learnedCount}/{count}</p>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ LIST VIEW ═══ */}
      {view === "list" && (
        <div className="px-5 space-y-2">
          {filteredDuas.map((dua, i) => {
            const learned = learnedIds.includes(dua.id);
            return (
              <motion.button
                key={dua.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => { setSelectedDuaId(dua.id); setView("detail"); }}
                className="w-full flex items-center gap-3 bg-card border border-border rounded-2xl p-3.5 text-left active:scale-[0.98] transition-transform"
              >
                <span className="text-2xl shrink-0">{dua.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{t(dua.titleKey as any)}</p>
                  <p className="text-[10px] text-muted-foreground truncate font-arabic">{dua.arabic}</p>
                </div>
                {learned && (
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0.5 shrink-0">✅</Badge>
                )}
                <ChevronRight size={16} className="text-muted-foreground shrink-0" />
              </motion.button>
            );
          })}
        </div>
      )}

      {/* ═══ DETAIL VIEW ═══ */}
      {view === "detail" && selectedDua && (
        <div className="px-5 space-y-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-5 text-center"
          >
            <span className="text-5xl mb-3 block">{selectedDua.emoji}</span>
            <p className="text-xs text-muted-foreground mb-1">{t(selectedDua.titleKey as any)}</p>
            {selectedDua.reference && (
              <p className="text-[9px] text-muted-foreground/60 mb-4">({selectedDua.reference})</p>
            )}

            {/* Arabic */}
            <div className="bg-muted/30 rounded-xl p-4 mb-3">
              <p className="font-arabic text-2xl leading-loose text-foreground" dir="rtl">
                {selectedDua.arabic}
              </p>
            </div>

            {/* Audio button */}
            <button
              onClick={() => speakArabic(selectedDua.arabic)}
              className="mx-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-semibold active:scale-95 transition-transform mb-4"
            >
              <Volume2 size={16} /> {t("kidsDuas.listen" as any)}
            </button>

            {/* Transliteration */}
            <div className="bg-muted/20 rounded-xl p-3 mb-3 text-left">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{t("kidsDuas.transliteration" as any)}</p>
              <p className="text-sm text-foreground italic">{selectedDua.transliteration}</p>
            </div>

            {/* Translation */}
            <div className="bg-muted/20 rounded-xl p-3 text-left">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{t("kidsDuas.translation" as any)}</p>
              <p className="text-sm text-foreground">{t(selectedDua.translationKey as any)}</p>
            </div>
          </motion.div>

          {/* Mark as learned */}
          {!learnedIds.includes(selectedDua.id) ? (
            <button
              onClick={() => markLearned(selectedDua.id)}
              className="w-full py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-bold active:scale-[0.97] transition-transform"
            >
              ✅ {t("kidsDuas.markLearned" as any)}
            </button>
          ) : (
            <div className="text-center py-3">
              <Badge variant="secondary" className="text-xs px-3 py-1">✅ {t("kidsDuas.alreadyLearned" as any)}</Badge>
            </div>
          )}
        </div>
      )}

      {/* ═══ QUIZ VIEW ═══ */}
      {view === "quiz" && currentQuizQ && (
        <div className="px-5 space-y-4">
          {/* Progress */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full bg-muted/50 overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${((quizIndex + 1) / quizQuestions.length) * 100}%` }} />
            </div>
            <span className="text-xs text-muted-foreground">{quizIndex + 1}/{quizQuestions.length}</span>
          </div>

          {/* Question */}
          <motion.div key={currentQuizQ.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-card border border-border rounded-2xl p-5 text-center"
          >
            <p className="text-xs text-muted-foreground mb-2">{t("kidsDuas.quizQuestion" as any)}</p>
            <p className="text-base font-bold text-foreground mb-1">{t(currentQuizQ.questionKey as any)}</p>
          </motion.div>

          {/* Options */}
          <div className="space-y-2">
            {currentQuizQ.options.map(optId => {
              const dua = KIDS_DUAS.find(d => d.id === optId);
              if (!dua) return null;
              const isCorrect = optId === currentQuizQ.correctDuaId;
              const isSelected = quizAnswer === optId;
              const showResult = quizAnswer !== null;

              let borderClass = "border-border";
              if (showResult && isCorrect) borderClass = "border-green-500 bg-green-500/10";
              else if (showResult && isSelected && !isCorrect) borderClass = "border-red-500 bg-red-500/10";

              return (
                <button
                  key={optId}
                  onClick={() => answerQuiz(optId)}
                  disabled={quizAnswer !== null}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all active:scale-[0.98] ${borderClass} bg-card`}
                >
                  <p className="font-arabic text-base text-foreground" dir="rtl">{dua.arabic}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 italic">{dua.transliteration}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ QUIZ RESULT VIEW ═══ */}
      {view === "quizResult" && (
        <div className="px-5">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl p-6 text-center"
          >
            <span className="text-5xl block mb-3">{quizScore >= 4 ? "🏆" : quizScore >= 3 ? "⭐" : "💪"}</span>
            <p className="text-xl font-bold text-foreground">{quizScore}/{quizQuestions.length}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {quizScore >= 4
                ? t("kidsDuas.quizExcellent" as any)
                : quizScore >= 3
                ? t("kidsDuas.quizGood" as any)
                : t("kidsDuas.quizRetry" as any)}
            </p>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setView("categories")}
                className="flex-1 py-3 rounded-xl bg-muted text-foreground text-sm font-semibold"
              >
                {t("kidsDuas.backToDuas" as any)}
              </button>
              <button
                onClick={startQuiz}
                className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-1.5"
              >
                <RotateCcw size={14} /> {t("kidsDuas.retryQuiz" as any)}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
