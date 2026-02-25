import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, MicOff, RotateCcw, Eye, EyeOff, AlertCircle, CheckCircle2, XCircle,
  ChevronDown, Volume2, Wifi, WifiOff,
} from "lucide-react";
import { type Surah } from "@/data/surahs";
import {
  useVoiceRecognition,
  compareSurahDictation,
  type DictationWordResult,
} from "@/hooks/useVoiceRecognition";
import { useLanguage } from "@/hooks/useLanguage";

interface DictationModeProps {
  surah: Surah;
  onBack: () => void;
  isChildMode: boolean;
}

type DictationPhase = "ready" | "recording" | "result";

export default function DictationMode({ surah, onBack, isChildMode }: DictationModeProps) {
  const { t } = useLanguage();
  const [phase, setPhase] = useState<DictationPhase>("ready");
  const [showOriginal, setShowOriginal] = useState(true);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [liveResults, setLiveResults] = useState<DictationWordResult[]>([]);
  const [finalResults, setFinalResults] = useState<{
    wordResults: DictationWordResult[];
    ayahScores: { ayahIndex: number; score: number; correct: boolean }[];
    totalScore: number;
  } | null>(null);
  const [micError, setMicError] = useState<string | null>(null);

  const allArabicTexts = surah.ayahs.map((a) => a.arabic);
  const bodyTextClass = isChildMode ? "text-base" : "text-sm";

  const voice = useVoiceRecognition({
    lang: "ar-SA",
    continuous: true,
    onResult: (transcript) => {
      setLiveTranscript(transcript);
      // Real-time comparison
      const result = compareSurahDictation(allArabicTexts, transcript);
      setLiveResults(result.wordResults);
    },
    onError: (error) => {
      if (error === "not-allowed") {
        setMicError("not-allowed");
      }
    },
    onEnd: () => {
      // If recording ended externally
    },
  });

  const handleStart = useCallback(() => {
    setPhase("recording");
    setLiveTranscript("");
    setLiveResults([]);
    setFinalResults(null);
    setMicError(null);
    setShowOriginal(false); // Hide text when recording for memorization test
    voice.start();
  }, [voice]);

  const handleStop = useCallback(() => {
    voice.stop();
    // Calculate final results
    const result = compareSurahDictation(allArabicTexts, liveTranscript);
    setFinalResults(result);
    setPhase("result");
    setShowOriginal(true);
  }, [voice, allArabicTexts, liveTranscript]);

  const handleRestart = useCallback(() => {
    setPhase("ready");
    setLiveTranscript("");
    setLiveResults([]);
    setFinalResults(null);
    setMicError(null);
    setShowOriginal(true);
  }, []);

  const handleRetryErrors = useCallback(() => {
    // Just restart for now
    handleRestart();
  }, [handleRestart]);

  // Get color class for word status
  const getWordColor = (status: DictationWordResult["status"]) => {
    switch (status) {
      case "correct": return "text-success";
      case "incorrect": return "text-destructive";
      case "missing": return "text-destructive underline decoration-wavy";
      case "extra": return "text-destructive line-through";
      default: return "text-foreground";
    }
  };

  // Build colored original text from live results
  const renderColoredText = () => {
    if (liveResults.length === 0) return null;

    return (
      <div className="arabic-text text-2xl leading-[2.8] text-right" dir="rtl">
        {liveResults.map((wr, i) => (
          <span key={i} className={`${getWordColor(wr.status)} ${wr.status === "extra" ? "text-lg opacity-70" : ""}`}>
            {wr.word}{" "}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <p className="font-arabic text-2xl text-primary">{surah.nameArabic}</p>
        <p className="text-xs text-muted-foreground">
          {t("dictation.title")} · {surah.versesCount} {t("detail.verses")}
        </p>
      </div>

      {/* Mode indicator */}
      {voice.mode !== "none" && phase === "recording" && (
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          {voice.mode === "server-fallback" ? (
            <>
              <Wifi size={12} className="text-secondary" />
              <span>{t("dictation.serverMode")}</span>
            </>
          ) : (
            <>
              <Mic size={12} className="text-primary" />
              <span>{t("dictation.webSpeechMode")}</span>
            </>
          )}
        </div>
      )}

      {/* ═══ READY PHASE ═══ */}
      {phase === "ready" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Toggle show/hide original text */}
          <div className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3">
            <span className={`${bodyTextClass} text-foreground font-medium`}>
              {t("dictation.showText")}
            </span>
            <button onClick={() => setShowOriginal(!showOriginal)}
              className={`p-2 rounded-lg ${showOriginal ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
              {showOriginal ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>

          {/* Original text */}
          {showOriginal && (
            <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
              {surah.ayahs.map((ayah, i) => (
                <div key={i} className="flex gap-3 items-start" dir="rtl">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-1">
                    {ayah.number}
                  </span>
                  <p className="arabic-text text-xl text-foreground flex-1">{ayah.arabic}</p>
                </div>
              ))}
            </div>
          )}

          {/* Instructions */}
          <div className="bg-accent/30 rounded-xl p-4 text-center">
            <p className={`${bodyTextClass} text-foreground font-medium mb-1`}>
              {t("dictation.instructions")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("dictation.instructionsHint")}
            </p>
          </div>

          {/* Permission error */}
          {micError === "not-allowed" && (
            <div className="bg-destructive/10 text-destructive rounded-xl p-4 text-center space-y-2">
              <AlertCircle size={20} className="inline" />
              <p className="text-sm font-semibold">{t("aya.micDenied")}</p>
              <p className="text-xs opacity-80">{t("aya.micDeniedHint")}</p>
            </div>
          )}

          {/* Start button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleStart}
            className={`w-full flex items-center justify-center gap-3 ${isChildMode ? "py-5 text-xl" : "py-4 text-lg"} rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20`}
          >
            <Mic size={24} />
            {t("dictation.startReciting")}
          </motion.button>
        </motion.div>
      )}

      {/* ═══ RECORDING PHASE ═══ */}
      {phase === "recording" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Live colored text comparison */}
          <div className="bg-card border-2 border-primary/30 rounded-2xl p-5 min-h-[200px]">
            {liveResults.length > 0 ? (
              renderColoredText()
            ) : (
              <div className="flex items-center justify-center h-full min-h-[180px]">
                <div className="text-center text-muted-foreground">
                  <div className="flex justify-center gap-1 mb-3">
                    {[0, 1, 2, 3].map((b) => (
                      <motion.div key={b}
                        animate={{ scaleY: [1, 2.5, 1] }}
                        transition={{ duration: 0.6, delay: b * 0.12, repeat: Infinity }}
                        className="w-1.5 h-4 bg-primary rounded-full"
                      />
                    ))}
                  </div>
                  <p className={bodyTextClass}>{t("dictation.listening")}</p>
                </div>
              </div>
            )}
          </div>

          {/* Live transcript (raw) */}
          {liveTranscript && (
            <div className="bg-muted/50 rounded-xl p-3">
              <p className="text-xs text-muted-foreground mb-1">{t("dictation.rawTranscript")}</p>
              <p className="arabic-text text-lg text-foreground" dir="rtl">{liveTranscript}</p>
            </div>
          )}

          {/* Stop button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleStop}
            className={`w-full flex items-center justify-center gap-3 ${isChildMode ? "py-5 text-xl" : "py-4 text-lg"} rounded-2xl bg-destructive text-destructive-foreground font-bold animate-pulse`}
          >
            <MicOff size={24} />
            {t("dictation.stopReciting")}
          </motion.button>
        </motion.div>
      )}

      {/* ═══ RESULT PHASE ═══ */}
      {phase === "result" && finalResults && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5">
          {/* Score circle */}
          <div className="text-center py-4">
            <div className={`${isChildMode ? "w-32 h-32 text-4xl" : "w-24 h-24 text-3xl"} rounded-full mx-auto flex items-center justify-center font-bold mb-3 ${
              finalResults.totalScore >= 80 ? "bg-success/15 text-success"
                : finalResults.totalScore >= 50 ? "bg-secondary/15 text-secondary"
                : "bg-destructive/15 text-destructive"
            }`}>
              {finalResults.totalScore}%
            </div>
            <h2 className={`${isChildMode ? "text-2xl" : "text-xl"} font-bold text-foreground`}>
              {finalResults.totalScore >= 80
                ? t("dictation.excellent")
                : finalResults.totalScore >= 50
                  ? t("dictation.good")
                  : t("dictation.needsWork")}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {finalResults.wordResults.filter((r) => r.status === "correct").length} / {surah.ayahs.reduce((a, ay) => a + ay.arabic.split(/\s+/).length, 0)} {t("dictation.wordsCorrect")}
            </p>
          </div>

          {/* Color legend */}
          <div className="flex flex-wrap justify-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-success"><CheckCircle2 size={12} /> {t("dictation.legendCorrect")}</span>
            <span className="flex items-center gap-1 text-destructive"><XCircle size={12} /> {t("dictation.legendIncorrect")}</span>
            <span className="flex items-center gap-1 text-destructive underline decoration-wavy">{t("dictation.legendMissing")}</span>
            <span className="flex items-center gap-1 text-destructive line-through">{t("dictation.legendExtra")}</span>
          </div>

          {/* Detailed word-by-word results */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="arabic-text text-2xl leading-[2.8] text-right" dir="rtl">
              {finalResults.wordResults.map((wr, i) => (
                <span key={i} className={`${getWordColor(wr.status)} ${wr.status === "extra" ? "text-lg opacity-70" : ""}`}>
                  {wr.word}{" "}
                </span>
              ))}
            </div>
          </div>

          {/* Per-ayah breakdown */}
          <div>
            <h3 className={`${bodyTextClass} font-semibold text-foreground mb-3`}>
              {t("dictation.ayahBreakdown")}
            </h3>
            <div className="space-y-2">
              {finalResults.ayahScores.map((as) => {
                const ayah = surah.ayahs[as.ayahIndex];
                return (
                  <div key={as.ayahIndex}
                    className={`flex items-center gap-3 bg-card border rounded-xl px-4 py-3 ${
                      as.correct ? "border-success/30" : "border-destructive/30"
                    }`}>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      as.correct ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
                    }`}>
                      {as.correct ? "✓" : "✗"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="arabic-text text-base text-foreground truncate" dir="rtl">{ayah.arabic}</p>
                    </div>
                    <span className={`text-sm font-bold ${as.correct ? "text-success" : "text-destructive"}`}>
                      {as.score}%
                    </span>
                    <button
                      onClick={() => {
                        fetch(`https://api.alquran.cloud/v1/ayah/${surah.number}:${ayah.number}/ar.husary`)
                          .then((r) => r.json())
                          .then((data) => {
                            if (data.data?.audio) new Audio(data.data.audio).play();
                          }).catch(() => {});
                      }}
                      className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Volume2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 pb-6">
            <button onClick={handleRestart}
              className={`flex-1 flex items-center justify-center gap-2 ${isChildMode ? "py-4 text-lg" : "py-3.5"} rounded-2xl border-2 border-border text-foreground font-semibold`}>
              <RotateCcw size={18} />
              {t("dictation.restart")}
            </button>
            {finalResults.ayahScores.some((a) => !a.correct) && (
              <button onClick={handleRetryErrors}
                className={`flex-1 flex items-center justify-center gap-2 ${isChildMode ? "py-4 text-lg" : "py-3.5"} rounded-2xl bg-primary text-primary-foreground font-semibold`}>
                {t("dictation.retryErrors")}
              </button>
            )}
          </div>

          {/* Back to surah selection */}
          <button onClick={onBack}
            className="w-full py-3 text-sm text-muted-foreground underline">
            {t("recitation.changeSurah")}
          </button>
        </motion.div>
      )}
    </div>
  );
}
