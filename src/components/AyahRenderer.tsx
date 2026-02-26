import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, X, SkipForward, CheckCircle2, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import type { Surah } from "@/data/surahs";
import { compareTexts } from "@/hooks/useVoiceRecognition";
import { useTarteelAyah } from "@/hooks/useTarteelAyah";
import { useGlobalAudio } from "@/hooks/useGlobalAudio";

interface AyaScore {
  ayaIndex: number;
  score: number;
  correct: boolean;
  transcript: string;
}

type ScreenMode = "intro" | "recitation" | "validated";

interface AyahRendererProps {
  surah: Surah;
  translations: Record<number, string>;
  lang: string;
  isChildMode: boolean;
  onFinish: (scores: AyaScore[]) => void;
  onBack?: () => void;
}

export default function AyahRenderer({ surah, translations, lang, isChildMode, onFinish, onBack }: AyahRendererProps) {
  const [scores, setScores] = useState<AyaScore[]>([]);
  const [screenMode, setScreenMode] = useState<ScreenMode>("intro");
  const globalAudio = useGlobalAudio();

  const {
    currentAyahIndex,
    currentAyahText,
    showArabic,
    transcript,
    wordResults,
    isListening,
    recognitionError,
    isSupported,
    startMicro,
    stopMicro,
    setAyah,
    nextAyah,
  } = useTarteelAyah({ ayahs: surah.ayahs.map((a) => a.arabic), lang: "ar-SA" });

  const ayah = surah.ayahs[currentAyahIndex];
  const progress = useMemo(
    () => Math.round(((currentAyahIndex + 1) / surah.ayahs.length) * 100),
    [currentAyahIndex, surah.ayahs.length]
  );

  // Stop global audio when entering recitation
  useEffect(() => {
    globalAudio.requestExclusiveAudio();
  }, []);

  // When micro starts → enter recitation mode
  const handleStartMicro = () => {
    globalAudio.requestExclusiveAudio();
    startMicro();
    setScreenMode("recitation");
  };

  const handleValidate = () => {
    if (!ayah) return;
    stopMicro();

    const { score } = compareTexts(ayah.arabic, transcript);
    const nextScore: AyaScore = {
      ayaIndex: currentAyahIndex,
      score,
      correct: score >= 90,
      transcript,
    };

    const updated = [...scores, nextScore];
    setScores(updated);

    if (currentAyahIndex >= surah.ayahs.length - 1) {
      onFinish(updated);
      return;
    }

    setScreenMode("validated");
  };

  const handleContinue = () => {
    nextAyah();
    setScreenMode("intro");
  };

  const handleSkip = () => {
    stopMicro();
    const nextScore: AyaScore = {
      ayaIndex: currentAyahIndex,
      score: 0,
      correct: false,
      transcript: "",
    };
    const updated = [...scores, nextScore];
    setScores(updated);

    if (currentAyahIndex >= surah.ayahs.length - 1) {
      onFinish(updated);
      return;
    }

    nextAyah();
    setScreenMode("intro");
  };

  const handleExit = () => {
    stopMicro();
    onBack?.();
  };

  const canGoPrev = currentAyahIndex > 0;
  const canGoNext = currentAyahIndex < surah.ayahs.length - 1;

  // ─── INTRO mode: show full ayah before starting ───
  if (screenMode === "intro") {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        {/* Mini header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
          <button onClick={handleExit} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
            <ArrowLeft size={18} className="text-foreground" />
          </button>
          <div className="flex-1 text-center">
            <p className="font-arabic text-lg text-primary">{surah.nameArabic}</p>
            <p className="text-[10px] text-muted-foreground">
              Ayah {currentAyahIndex + 1}/{surah.ayahs.length}
            </p>
          </div>
          {/* Surah stepper */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => canGoPrev && setAyah(currentAyahIndex - 1)}
              disabled={!canGoPrev}
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center disabled:opacity-30"
            >
              <ChevronLeft size={16} className="text-foreground" />
            </button>
            <button
              onClick={() => canGoNext && setAyah(currentAyahIndex + 1)}
              disabled={!canGoNext}
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center disabled:opacity-30"
            >
              <ChevronRight size={16} className="text-foreground" />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="px-4 pt-3">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div className="h-full bg-primary" animate={{ width: `${progress}%` }} />
          </div>
          <p className="text-[10px] text-muted-foreground text-right mt-1">{progress}%</p>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          {/* Arabic text visible */}
          <div className="bg-card border border-border rounded-2xl p-6 w-full" dir="rtl">
            <p className="arabic-text text-2xl text-foreground leading-loose text-center">
              {currentAyahText}
            </p>
          </div>

          {/* Translation */}
          <p className="text-sm text-muted-foreground text-center leading-relaxed">
            {translations[currentAyahIndex] || ayah?.translation}
          </p>

          {/* Transliteration */}
          {ayah?.transliteration && (
            <p className="text-sm text-primary/70 italic text-center">{ayah.transliteration}</p>
          )}

          {!isSupported ? (
            <div className="bg-destructive/10 text-destructive rounded-xl p-3 text-sm text-center w-full">
              Micro indisponible sur ce navigateur
            </div>
          ) : (
            <button
              onClick={handleStartMicro}
              className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30 transition-transform active:scale-95"
            >
              <Mic size={32} />
            </button>
          )}
          <p className="text-xs text-muted-foreground">Touchez le micro pour réciter</p>
        </div>
      </div>
    );
  }

  // ─── VALIDATED mode: "Cliquez pour poursuivre" ───
  if (screenMode === "validated") {
    const lastScore = scores[scores.length - 1];
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center px-6 gap-8">
        {/* Score feedback */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-3"
        >
          <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center text-2xl font-bold ${
            lastScore?.correct ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
          }`}>
            {lastScore?.score ?? 0}%
          </div>
          <p className="text-lg font-semibold text-foreground">
            {lastScore?.correct ? "Excellent ! ✅" : "Continue ! 💪"}
          </p>
          <p className="text-xs text-muted-foreground">
            Ayah {currentAyahIndex + 1}/{surah.ayahs.length}
          </p>
        </motion.div>

        {/* Continue button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={handleContinue}
          className="w-full max-w-xs py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg shadow-lg shadow-primary/20 active:scale-95 transition-transform"
        >
          Cliquez pour poursuivre →
        </motion.button>
      </div>
    );
  }

  // ─── RECITATION mode: clean, minimal ───
  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Minimal top bar */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <button onClick={handleExit} className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
          <X size={16} className="text-muted-foreground" />
        </button>
        <p className="text-xs text-muted-foreground">
          Ayah {currentAyahIndex + 1}/{surah.ayahs.length} · {progress}%
        </p>
        <button onClick={handleSkip} className="text-xs text-muted-foreground px-3 py-1.5 rounded-lg bg-muted/50">
          Passer →
        </button>
      </div>

      {/* Progress */}
      <div className="px-4">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Main content - centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
        {/* Translation always visible */}
        <p className="text-sm text-muted-foreground text-center leading-relaxed max-w-sm">
          {translations[currentAyahIndex] || ayah?.translation}
        </p>

        {/* Transliteration always visible */}
        {ayah?.transliteration && (
          <p className="text-sm text-primary/70 italic text-center">{ayah.transliteration}</p>
        )}

        {/* Arabic: word-by-word reveal with colors */}
        <div className="bg-card border border-border rounded-2xl p-5 w-full" dir="rtl">
          <div className="arabic-text text-2xl leading-loose text-center flex flex-wrap gap-x-2 justify-center">
            {currentAyahText.split(/\s+/).filter(Boolean).map((word, i) => {
              const wr = wordResults[i];
              const status = wr?.status;
              const isRevealed = status === "correct" || status === "almost" || status === "wrong";
              const isPending = !status || status === "pending";

              let colorClass = "text-foreground/10 bg-muted/40 select-none";
              if (status === "correct") colorClass = "text-success bg-success/10";
              else if (status === "almost") colorClass = "text-warning bg-warning/10";
              else if (status === "wrong") colorClass = "text-destructive bg-destructive/10";

              return (
                <motion.span
                  key={i}
                  initial={isRevealed ? { scale: 1.15 } : false}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className={`inline-block px-1 py-0.5 rounded-md transition-colors duration-300 ${colorClass}`}
                >
                  {isPending ? "████" : word}
                </motion.span>
              );
            })}
          </div>
        </div>

        {/* Incorrect words shown separately */}
        {wordResults.some(wr => wr.status === "correct" || wr.status === "almost" || wr.status === "wrong") && (
          <div className="flex flex-wrap justify-center gap-3 text-[10px]">
            <span className="flex items-center gap-1 text-success"><CheckCircle2 size={10} /> Correct</span>
            <span className="flex items-center gap-1 text-warning">🟠 Presque</span>
            <span className="flex items-center gap-1 text-destructive">🔴 Faux</span>
            <span className="flex items-center gap-1 text-muted-foreground/40">⬜ En attente</span>
          </div>
        )}

        {/* Live transcript */}
        {transcript && (
          <div className="bg-accent/30 rounded-xl p-3 w-full" dir="rtl">
            <p className="arabic-text text-base text-foreground/70 text-center">{transcript}</p>
          </div>
        )}

        {/* Micro button */}
        <button
          onClick={recognitionError ? handleStartMicro : (isListening ? stopMicro : handleStartMicro)}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${
            recognitionError
              ? "bg-destructive text-destructive-foreground shadow-destructive/30 animate-pulse"
              : isListening
                ? "bg-success text-success-foreground shadow-success/30 animate-pulse"
                : "bg-primary text-primary-foreground shadow-primary/30"
          }`}
        >
          <Mic size={24} />
        </button>
        <p className="text-[10px] text-muted-foreground">
          {recognitionError ? `Erreur (${recognitionError})` : isListening ? "🟢 Micro actif — Récitez..." : "Micro en pause"}
        </p>
      </div>

      {/* Bottom action bar */}
      <div className="px-4 pb-6 pt-2 shrink-0 space-y-2">
        <button
          onClick={handleValidate}
          disabled={!transcript}
          className="w-full py-3.5 rounded-xl bg-success text-success-foreground font-semibold disabled:opacity-40 transition-opacity"
        >
          ✅ Valider cette aya
        </button>
        <button
          onClick={handleSkip}
          className="w-full py-2.5 rounded-xl bg-muted text-muted-foreground font-medium text-sm"
        >
          Passer à l'ayah suivante →
        </button>
      </div>
    </div>
  );
}
