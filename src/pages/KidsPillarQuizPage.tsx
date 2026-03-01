import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Zap, Users, RotateCcw, CheckCircle2, XCircle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { PILLAR_QUESTIONS, PillarQuestion } from "@/data/quizPillarQuestions";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function KidsPillarQuizPage() {
  const navigate = useNavigate();
  const { lang } = useLanguage();

  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<PillarQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [joker5050, setJoker5050] = useState(true);
  const [jokerFamily, setJokerFamily] = useState(true);
  const [eliminated, setEliminated] = useState<Set<number>>(new Set());
  const [familyHint, setFamilyHint] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  const labels: Record<string, Record<string, string>> = {
    title: { fr: "Quiz des 5 Piliers", en: "5 Pillars Quiz", ar: "اختبار أركان الإسلام", nl: "5 Zuilen Quiz", tr: "5 Şart Testi", ur: "5 ارکان کوئز" },
    start: { fr: "Commencer", en: "Start", ar: "ابدأ", nl: "Begin", tr: "Başla", ur: "شروع کریں" },
    desc: { fr: "Teste tes connaissances sur les 5 piliers de l'Islam !", en: "Test your knowledge of the 5 pillars of Islam!", ar: "اختبر معلوماتك عن أركان الإسلام الخمسة!", nl: "Test je kennis over de 5 zuilen!", tr: "İslam'ın 5 şartı hakkında bilgini test et!", ur: "اسلام کے 5 ارکان کے بارے میں اپنا علم آزمائیں!" },
    qOf: { fr: "Question", en: "Question", ar: "سؤال", nl: "Vraag", tr: "Soru", ur: "سوال" },
    next: { fr: "Suivant", en: "Next", ar: "التالي", nl: "Volgende", tr: "Sonraki", ur: "اگلا" },
    joker5050: { fr: "50/50", en: "50/50", ar: "٥٠/٥٠", nl: "50/50", tr: "50/50", ur: "50/50" },
    jokerFamily: { fr: "Famille", en: "Family", ar: "العائلة", nl: "Familie", tr: "Aile", ur: "خاندان" },
    bravo: { fr: "Bravo ! MashaAllah !", en: "Bravo! MashaAllah!", ar: "أحسنت! ماشاء الله!", nl: "Bravo! MashaAllah!", tr: "Bravo! MaşaAllah!", ur: "شاباش! ماشاء اللہ!" },
    score: { fr: "Score", en: "Score", ar: "النتيجة", nl: "Score", tr: "Puan", ur: "سکور" },
    retry: { fr: "Rejouer", en: "Play again", ar: "إعادة", nl: "Opnieuw", tr: "Tekrar", ur: "دوبارہ" },
    menu: { fr: "Menu Kids", en: "Kids Menu", ar: "قائمة الأطفال", nl: "Kindermenu", tr: "Çocuk Menüsü", ur: "بچوں کا مینیو" },
    familySays: { fr: "La famille pense que c'est la réponse", en: "The family thinks it's answer", ar: "تعتقد العائلة أن الإجابة هي", nl: "De familie denkt dat het antwoord is", tr: "Aile cevabın şu olduğunu düşünüyor", ur: "خاندان کا خیال ہے کہ جواب ہے" },
  };
  const L = (k: string) => labels[k]?.[lang] || labels[k]?.fr || k;

  const startQuiz = () => {
    setQuestions(shuffle(PILLAR_QUESTIONS).slice(0, 10));
    setCurrentIdx(0);
    setScore(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setJoker5050(true);
    setJokerFamily(true);
    setEliminated(new Set());
    setFamilyHint(null);
    setFinished(false);
    setStarted(true);
  };

  const q = questions[currentIdx];

  const handleSelect = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    if (idx === q.correctIndex) setScore(s => s + 1);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentIdx + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrentIdx(i => i + 1);
      setSelectedOption(null);
      setShowExplanation(false);
      setEliminated(new Set());
      setFamilyHint(null);
    }
  };

  const use5050 = () => {
    if (!joker5050 || selectedOption !== null) return;
    setJoker5050(false);
    const wrong = q.options.map((_, i) => i).filter(i => i !== q.correctIndex);
    const toRemove = shuffle(wrong).slice(0, 2);
    setEliminated(new Set(toRemove));
  };

  const useFamily = () => {
    if (!jokerFamily || selectedOption !== null) return;
    setJokerFamily(false);
    // 80% chance correct
    setFamilyHint(Math.random() < 0.8 ? q.correctIndex : q.options.findIndex((_, i) => i !== q.correctIndex));
  };

  if (!started) {
    return (
      <div className="min-h-screen pb-24 px-5 pt-14">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/kids")} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center"><ArrowLeft size={18} /></button>
          <h1 className="text-xl font-bold">🕌 {L("title")}</h1>
        </div>
        <div className="bg-gradient-to-br from-amber-600/20 to-orange-600/10 border border-amber-500/20 rounded-2xl p-6 text-center">
          <p className="text-6xl mb-4">🕋</p>
          <p className="text-sm text-muted-foreground mb-6">{L("desc")}</p>
          <button onClick={startQuiz} className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold">{L("start")}</button>
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="min-h-screen pb-24 px-5 pt-14 flex flex-col items-center justify-center gap-4">
        <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl">🏆</motion.p>
        <h2 className="text-xl font-bold">{L("bravo")}</h2>
        <p className="text-lg font-semibold text-primary">{L("score")}: {score}/{questions.length}</p>
        <div className="flex gap-3 mt-4">
          <button onClick={startQuiz} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center gap-1"><RotateCcw size={14} /> {L("retry")}</button>
          <button onClick={() => navigate("/kids")} className="px-4 py-2 rounded-xl bg-muted text-foreground text-sm font-bold">{L("menu")}</button>
        </div>
      </div>
    );
  }

  const getText = (obj: Record<string, string>) => obj[lang] || obj.fr;

  return (
    <div className="min-h-screen pb-24 px-5 pt-14">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate("/kids")} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center"><ArrowLeft size={18} /></button>
        <h1 className="text-lg font-bold flex-1">🕌 {L("title")}</h1>
        <span className="text-xs font-bold text-primary">{score}/{questions.length}</span>
      </div>

      {/* Progress */}
      <div className="h-2 rounded-full bg-muted mb-4 overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }} />
      </div>

      {/* Question */}
      <p className="text-xs text-muted-foreground mb-1">{L("qOf")} {currentIdx + 1}/{questions.length}</p>
      <h2 className="text-base font-bold text-foreground mb-4">{getText(q.question as any)}</h2>

      {/* Jokers */}
      <div className="flex gap-2 mb-4">
        <button disabled={!joker5050 || selectedOption !== null} onClick={use5050}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold ${joker5050 ? "bg-amber-500/20 text-amber-400" : "bg-muted text-muted-foreground opacity-50"}`}>
          <Zap size={12} /> {L("joker5050")}
        </button>
        <button disabled={!jokerFamily || selectedOption !== null} onClick={useFamily}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold ${jokerFamily ? "bg-blue-500/20 text-blue-400" : "bg-muted text-muted-foreground opacity-50"}`}>
          <Users size={12} /> {L("jokerFamily")}
        </button>
      </div>

      {familyHint !== null && selectedOption === null && (
        <p className="text-xs text-blue-400 mb-3">👨‍👩‍👧 {L("familySays")} {familyHint + 1}</p>
      )}

      {/* Options */}
      <div className="flex flex-col gap-2">
        {q.options.map((opt, i) => {
          if (eliminated.has(i)) return null;
          const isSelected = selectedOption === i;
          const isCorrect = i === q.correctIndex;
          const revealed = selectedOption !== null;
          let bg = "bg-card border border-border";
          if (revealed && isCorrect) bg = "bg-emerald-500/20 border-2 border-emerald-400";
          else if (revealed && isSelected && !isCorrect) bg = "bg-red-500/20 border-2 border-red-400";
          return (
            <motion.button key={i} whileTap={{ scale: 0.97 }} onClick={() => handleSelect(i)}
              className={`p-3 rounded-xl text-left text-sm font-medium ${bg} flex items-center gap-2`}>
              <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
              <span className="flex-1">{getText(opt as any)}</span>
              {revealed && isCorrect && <CheckCircle2 size={16} className="text-emerald-400" />}
              {revealed && isSelected && !isCorrect && <XCircle size={16} className="text-red-400" />}
            </motion.button>
          );
        })}
      </div>

      {/* Explanation */}
      {showExplanation && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 rounded-xl bg-primary/10 border border-primary/20">
          <p className="text-xs text-foreground">{getText(q.explanation as any)}</p>
        </motion.div>
      )}

      {selectedOption !== null && (
        <div className="mt-4 text-center">
          <button onClick={handleNext} className="px-6 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm">{L("next")}</button>
        </div>
      )}
    </div>
  );
}
