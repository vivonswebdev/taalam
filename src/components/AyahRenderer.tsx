import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Mic, Pause, SkipBack, SkipForward, AlertCircle, CheckCircle2 } from "lucide-react";
import type { Surah } from "@/data/surahs";
import { compareTexts } from "@/hooks/useVoiceRecognition";
import { useTarteelAyah } from "@/hooks/useTarteelAyah";

interface AyaScore {
  ayaIndex: number;
  score: number;
  correct: boolean;
  transcript: string;
}

interface AyahRendererProps {
  surah: Surah;
  translations: Record<number, string>;
  lang: string;
  isChildMode: boolean;
  onFinish: (scores: AyaScore[]) => void;
}

export default function AyahRenderer({ surah, translations, lang, isChildMode, onFinish }: AyahRendererProps) {
  const [scores, setScores] = useState<AyaScore[]>([]);

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
  const progress = useMemo(() => Math.round(((currentAyahIndex + 1) / surah.ayahs.length) * 100), [currentAyahIndex, surah.ayahs.length]);

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

    nextAyah();
  };

  const canGoPrev = currentAyahIndex > 0;
  const canGoNext = currentAyahIndex < surah.ayahs.length - 1;

  return (
    <div className="px-6 space-y-4 pb-32">
      <div className="text-center">
        <p className="font-arabic text-2xl text-primary">{surah.nameArabic}</p>
        <p className="text-xs text-muted-foreground">Ayah {currentAyahIndex + 1}/{surah.ayahs.length} · {progress}%</p>
      </div>

      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div className="h-full bg-primary" animate={{ width: `${progress}%` }} />
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <p className={`${isChildMode ? "text-base" : "text-sm"} text-muted-foreground`}>
          {lang === "ar" ? ayah.translation : (translations[currentAyahIndex] || ayah.translation)}
        </p>

        <p className="text-sm text-primary/70 italic">{ayah.transliteration}</p>

        <div className="rounded-xl bg-muted/40 p-4" dir="rtl">
          {showArabic ? (
            <p className="arabic-text text-2xl text-foreground leading-loose">{currentAyahText}</p>
          ) : (
            <p className="arabic-text text-2xl text-foreground/20 leading-loose select-none">░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░</p>
          )}
        </div>

        {!isSupported && (
          <div className="bg-destructive/10 text-destructive rounded-xl p-3 text-sm text-center">
            <AlertCircle size={16} className="inline mr-1" />
            Micro indisponible sur ce navigateur
          </div>
        )}

        <div className="flex flex-col items-center gap-2">
          <button
            onClick={recognitionError ? startMicro : (isListening ? stopMicro : startMicro)}
            className={`${isChildMode ? "w-20 h-20" : "w-16 h-16"} rounded-full flex items-center justify-center transition-all shadow-lg ${
              recognitionError
                ? "bg-destructive text-destructive-foreground shadow-destructive/30"
                : isListening
                  ? "bg-success text-success-foreground shadow-success/30"
                  : "bg-primary text-primary-foreground shadow-primary/30"
            }`}
          >
            <Mic size={isChildMode ? 32 : 24} />
          </button>
          <p className="text-xs text-muted-foreground text-center">
            {recognitionError ? `Micro bloqué (${recognitionError})` : isListening ? "Micro actif" : "Touchez le micro"}
          </p>
        </div>

        {transcript && (
          <div className="bg-accent/40 rounded-xl p-3" dir="rtl">
            <p className="arabic-text text-lg text-foreground">{transcript}</p>
          </div>
        )}

        <div className="bg-accent/20 rounded-xl p-3" dir="rtl">
          <div className="arabic-text text-xl leading-loose">
            {wordResults.map((result, i) => (
              <span
                key={`${result.word}-${i}`}
                className={result.status === "correct" ? "text-success" : result.status === "almost" ? "text-warning" : "text-muted-foreground/40"}
              >
                {result.status === "correct" && <CheckCircle2 size={14} className="inline mr-1" />}
                {result.word}{" "}
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={handleValidate}
          disabled={!transcript}
          className="w-full py-3 rounded-xl bg-success text-success-foreground font-semibold disabled:opacity-50"
        >
          Valider cette aya
        </button>
      </div>

      <div className="fixed bottom-16 left-0 right-0 z-40">
        <div className="max-w-lg mx-auto px-4">
          <div className="bg-card border border-border rounded-2xl shadow-xl p-3 flex items-center justify-between gap-2">
            <button
              onClick={() => canGoPrev && setAyah(currentAyahIndex - 1)}
              disabled={!canGoPrev}
              className="w-10 h-10 rounded-full bg-muted text-foreground flex items-center justify-center disabled:opacity-30"
            >
              <SkipBack size={18} />
            </button>

            <button
              onClick={stopMicro}
              className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20"
            >
              <Pause size={24} />
            </button>

            <button
              onClick={() => canGoNext && setAyah(currentAyahIndex + 1)}
              disabled={!canGoNext}
              className="w-10 h-10 rounded-full bg-muted text-foreground flex items-center justify-center disabled:opacity-30"
            >
              <SkipForward size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
