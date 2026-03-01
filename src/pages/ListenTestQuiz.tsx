import { useState, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, XCircle, Headphones, Trophy } from "lucide-react";
import { generateListenTestQuestions } from "@/lib/listenTestQuestions";
import { useLanguage } from "@/hooks/useLanguage";
import { useQuranXp } from "@/hooks/useQuranXp";
import { surahs } from "@/data/surahs";
import type { QuizQuestion } from "@/data/quizQuestions";

export default function ListenTestQuiz() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const xp = useXP();
  const xpAwardedRef = useRef(false);

  const surahNum = Number(searchParams.get("surah")) || 1;
  const surah = surahs.find((s) => s.number === surahNum);

  const [questions] = useState<QuizQuestion[]>(() => generateListenTestQuestions(surahNum));
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  const question = questions[current];

  const handleSelect = useCallback(
    (idx: number) => {
      if (selected !== null || !question) return;
      setSelected(idx);
      const correct = idx === question.correctIndex;
      if (correct) setScore((s) => s + 1);

      setTimeout(() => {
        if (current < questions.length - 1) {
          setCurrent((c) => c + 1);
          setSelected(null);
        } else {
          setFinished(true);
          xpAwardedRef.current = false;
        }
      }, 1000);
    },
    [selected, current, question, questions]
  );

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <Headphones size={48} className="text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Pas de questions disponibles pour cette sourate.</p>
        <button onClick={() => navigate(-1)} className="mt-4 bg-primary text-primary-foreground rounded-2xl px-6 py-3 font-semibold text-sm">
          Retour
        </button>
      </div>
    );
  }

  if (finished) {
    const percentage = Math.round((score / questions.length) * 100);
    if (!xpAwardedRef.current) {
      xpAwardedRef.current = true;
      const xpGain = score * 4;
      if (xpGain > 0) xp.addXP(xpGain);
    }

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }} className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center mb-6">
          <Trophy size={36} className="text-secondary" />
        </motion.div>
        <h1 className="text-2xl font-bold text-foreground">
          {percentage >= 80 ? "Excellent ! 🎉" : percentage >= 50 ? "Bien joué ! 👏" : "Continue tes efforts 💪"}
        </h1>
        <p className="text-muted-foreground mt-2">
          Score : {score}/{questions.length} ({percentage}%)
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          🎧 Test après écoute de {surah?.name || `Sourate ${surahNum}`}
        </p>
        <div className="flex gap-3 mt-6">
          <button onClick={() => navigate("/")} className="bg-muted text-foreground rounded-2xl px-6 py-3 font-semibold text-sm">
            Accueil
          </button>
          <button onClick={() => navigate(-1)} className="bg-primary text-primary-foreground rounded-2xl px-6 py-3 font-semibold text-sm">
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      <div className="px-6 pt-14 pb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground mb-4">
          <ArrowLeft size={20} />
          <span className="text-sm">Retour</span>
        </button>

        <div className="flex items-center gap-2 mb-6">
          <Headphones size={18} className="text-primary" />
          <span className="text-xs font-semibold text-primary">
            🎧 Test après écoute – {surah?.name || `Sourate ${surahNum}`}
          </span>
        </div>

        <div className="flex gap-1.5 mb-8">
          {questions.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i < current ? "bg-primary" : i === current ? "bg-primary/50" : "bg-muted"}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={current} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
            <p className="text-xs text-muted-foreground font-medium mb-2">
              Question {current + 1}/{questions.length}
            </p>
            <h2 className="text-xl font-bold text-foreground mb-8">{question.question}</h2>

            <div className="space-y-3">
              {question.options.map((option, idx) => {
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
                    <span className="font-arabic text-sm leading-relaxed">{option}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
