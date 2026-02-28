import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Headphones, Play, CheckCircle2, Trophy, Home, RotateCcw } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useGlobalAudio } from "@/hooks/useGlobalAudio";
import { useListeningStats } from "@/hooks/useListeningStats";
import { surahs } from "@/data/surahs";
import { generateListenTestQuestions } from "@/lib/listenTestQuestions";

type SessionMode = "simple" | "quiz";
type Difficulty = "all" | "easy" | "medium" | "hard";
type Phase = "choose" | "listening" | "quiz" | "results";

function getDifficulty(s: typeof surahs[0]): Difficulty {
  if (s.versesCount <= 20) return "easy";
  if (s.versesCount <= 80) return "medium";
  return "hard";
}

export default function Listening() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const audio = useGlobalAudio();
  const { todayListeningMinutes, saveSession } = useListeningStats();

  const [phase, setPhase] = useState<Phase>("choose");
  const [difficulty, setDifficulty] = useState<Difficulty>("all");
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [mode, setMode] = useState<SessionMode>("quiz");

  // Session tracking
  const sessionStartRef = useRef<number>(0);
  const ayahsHeardRef = useRef(0);
  const startAyahRef = useRef(0);

  // Quiz state
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState(0);

  const filtered = surahs.filter((s) =>
    difficulty === "all" ? true : getDifficulty(s) === difficulty
  );

  const startSession = useCallback(() => {
    if (!selectedSurah) return;
    const surah = surahs.find((s) => s.number === selectedSurah)!;
    sessionStartRef.current = Date.now();
    ayahsHeardRef.current = 0;
    startAyahRef.current = 0;
    setPhase("listening");
    audio.play(surah.number, surah.name, surah.nameArabic, surah.versesCount, 0);
  }, [selectedSurah, audio]);

  // Track ayah changes
  useEffect(() => {
    if (phase !== "listening") return;
    audio.onAyahChange.current = (_sn: number, ayah: number) => {
      ayahsHeardRef.current = ayah + 1;
    };
    return () => { audio.onAyahChange.current = null; };
  }, [phase, audio]);

  // Listen for surah completion
  useEffect(() => {
    if (phase !== "listening") return;
    audio.onSurahComplete.current = () => {
      endSession();
    };
    return () => { audio.onSurahComplete.current = null; };
  }, [phase, audio, mode]);

  const endSession = useCallback(async () => {
    const durationSeconds = Math.round((Date.now() - sessionStartRef.current) / 1000);
    audio.stop();

    if (mode === "quiz" && selectedSurah) {
      const qs = generateListenTestQuestions(selectedSurah);
      setQuestions(qs);
      setCurrentQ(0);
      setAnswers([]);
      setScore(0);
      setPhase("quiz");
      // save session after quiz
      return;
    }

    // Simple mode — save immediately
    if (selectedSurah) {
      await saveSession({
        surah_number: selectedSurah,
        from_ayah: startAyahRef.current,
        to_ayah: ayahsHeardRef.current,
        duration_seconds: durationSeconds,
        has_quiz: false,
      });
    }
    setPhase("results");
  }, [mode, selectedSurah, audio, saveSession]);

  const handleAnswer = useCallback(async (optIndex: number) => {
    const correct = questions[currentQ]?.correctIndex === optIndex;
    const newScore = correct ? score + 1 : score;
    setScore(newScore);
    const newAnswers = [...answers, optIndex];
    setAnswers(newAnswers);

    if (currentQ + 1 >= questions.length) {
      // Quiz done
      const pct = Math.round((newScore / questions.length) * 100);
      const durationSeconds = Math.round((Date.now() - sessionStartRef.current) / 1000);
      if (selectedSurah) {
        await saveSession({
          surah_number: selectedSurah,
          from_ayah: startAyahRef.current,
          to_ayah: ayahsHeardRef.current,
          duration_seconds: durationSeconds,
          has_quiz: true,
          quiz_score: pct,
        });
      }
      setPhase("results");
    } else {
      setCurrentQ(currentQ + 1);
    }
  }, [currentQ, questions, score, answers, selectedSurah, saveSession]);

  const quizPct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const badge = quizPct >= 80 ? t("listening.badge.hafiz") : t("listening.badge.attentive");

  const reset = () => {
    setPhase("choose");
    setSelectedSurah(null);
    setQuestions([]);
    setCurrentQ(0);
    setAnswers([]);
    setScore(0);
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="px-5 pt-14 pb-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-muted/50">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground">{t("listening.title")}</h1>
          <p className="text-xs text-muted-foreground">{t("listening.subtitle")}</p>
        </div>
        <div className="flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-full">
          <Headphones size={14} className="text-primary" />
          <span className="text-xs font-bold text-primary">{todayListeningMinutes} {t("listening.todayMinutes")}</span>
        </div>
      </div>

      <div className="px-5 space-y-4">
        <AnimatePresence mode="wait">
          {/* ─── CHOOSE ─── */}
          {phase === "choose" && (
            <motion.div key="choose" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              {/* Difficulty filter */}
              <div className="flex gap-2">
                {(["all", "easy", "medium", "hard"] as Difficulty[]).map((d) => (
                  <button key={d} onClick={() => setDifficulty(d)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${difficulty === d ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {t(`listening.${d}` as any)}
                  </button>
                ))}
              </div>

              {/* Surah picker */}
              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                {filtered.map((s) => (
                  <button key={s.number} onClick={() => setSelectedSurah(s.number)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-colors text-left ${selectedSurah === s.number ? "border-primary bg-primary/10" : "border-border"}`}>
                    <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">{s.number}</span>
                    <span className="font-arabic text-sm text-primary flex-1">{s.nameArabic}</span>
                    <span className="text-xs text-muted-foreground">{s.name}</span>
                    <span className="text-[10px] text-muted-foreground">{s.versesCount} ayat</span>
                  </button>
                ))}
              </div>

              {/* Mode picker */}
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setMode("simple")}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-colors ${mode === "simple" ? "border-primary bg-primary/10" : "border-border"}`}>
                  <Play size={20} className="text-primary" />
                  <span className="text-xs font-semibold">{t("listening.simple")}</span>
                  <span className="text-[10px] text-muted-foreground">{t("listening.simpleDesc")}</span>
                </button>
                <button onClick={() => setMode("quiz")}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-colors ${mode === "quiz" ? "border-primary bg-primary/10" : "border-border"}`}>
                  <Trophy size={20} className="text-amber-500" />
                  <span className="text-xs font-semibold">{t("listening.withQuiz")}</span>
                  <span className="text-[10px] text-muted-foreground">{t("listening.withQuizDesc")}</span>
                </button>
              </div>

              {/* Start button */}
              <button onClick={startSession} disabled={!selectedSurah}
                className={`w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 ${selectedSurah ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                <Headphones size={16} /> {t("listening.start")}
              </button>
            </motion.div>
          )}

          {/* ─── LISTENING ─── */}
          {phase === "listening" && (
            <motion.div key="listening" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              <div className="bg-card border border-border rounded-2xl p-5 text-center space-y-4">
                <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-600 px-3 py-1 rounded-full text-xs font-semibold">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  {t("listening.sessionActive")}
                </div>

                <div className="font-arabic text-2xl text-primary">
                  {surahs.find((s) => s.number === selectedSurah)?.nameArabic}
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-muted/50 rounded-xl py-3">
                    <p className="text-lg font-bold text-foreground">{Math.floor((Date.now() - sessionStartRef.current) / 60000)}+</p>
                    <p className="text-[10px] text-muted-foreground">{t("listening.duration")} (min)</p>
                  </div>
                  <div className="bg-muted/50 rounded-xl py-3">
                    <p className="text-lg font-bold text-foreground">{audio.state.currentAyah + 1}</p>
                    <p className="text-[10px] text-muted-foreground">{t("listening.ayahsListened")}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${audio.state.progress}%` }} />
                </div>

                <button onClick={endSession}
                  className="w-full py-3 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold">
                  {t("listening.endSession")}
                </button>
              </div>
            </motion.div>
          )}

          {/* ─── QUIZ ─── */}
          {phase === "quiz" && questions.length > 0 && (
            <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="text-center">
                <h2 className="text-lg font-bold text-foreground">{t("listening.quizTime")}</h2>
                <p className="text-xs text-muted-foreground">{currentQ + 1}/{questions.length}</p>
              </div>

              {/* Progress */}
              <div className="flex gap-1">
                {questions.map((_, i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i < currentQ ? (answers[i] === questions[i].correctIndex ? "bg-green-500" : "bg-destructive") : i === currentQ ? "bg-primary" : "bg-muted"}`} />
                ))}
              </div>

              <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
                <p className="text-sm font-semibold text-foreground font-arabic leading-relaxed">{questions[currentQ].question}</p>
                <div className="space-y-2">
                  {questions[currentQ].options.map((opt: string, i: number) => (
                    <button key={i} onClick={() => handleAnswer(i)}
                      className="w-full text-left px-4 py-3 rounded-xl border-2 border-border text-sm hover:bg-accent/40 transition-colors font-arabic">
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── RESULTS ─── */}
          {phase === "results" && (
            <motion.div key="results" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5 text-center">
              <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                <CheckCircle2 size={48} className="text-green-500 mx-auto" />
                <h2 className="text-xl font-bold text-foreground">
                  {mode === "quiz" ? `${t("listening.score")} : ${quizPct}%` : "✅"}
                </h2>
                {mode === "quiz" && (
                  <p className="text-sm font-semibold text-primary">{badge}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {surahs.find((s) => s.number === selectedSurah)?.name} · {ayahsHeardRef.current} ayahs
                </p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => navigate("/")} className="flex-1 py-3 rounded-xl border border-border text-sm font-medium flex items-center justify-center gap-2">
                  <Home size={16} /> {t("listening.backHome")}
                </button>
                <button onClick={reset} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2">
                  <RotateCcw size={16} /> {t("listening.newSession")}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
