import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, MicOff, RotateCcw, Eye, EyeOff, AlertCircle, CheckCircle2, XCircle,
  Volume2, Info,
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

// ─── Waqf signs data ─────────────────────────────────────────
const WAQF_SIGNS: Record<string, { symbol: string; translationKey: string; color: string }> = {
  "مـ": { symbol: "مـ", translationKey: "waqf.obligatory", color: "text-destructive" },
  "ط": { symbol: "ط", translationKey: "waqf.complete", color: "text-secondary" },
  "ج": { symbol: "ج", translationKey: "waqf.permissible", color: "text-primary" },
  "ۖ": { symbol: "ۖ", translationKey: "waqf.sufficient", color: "text-primary" },
  "ۗ": { symbol: "ۗ", translationKey: "waqf.good", color: "text-success" },
  "ۚ": { symbol: "ۚ", translationKey: "waqf.obligatory", color: "text-destructive" },
};

// Detect waqf signs in text
function detectWaqfSigns(text: string): { sign: string; position: number }[] {
  const signs: { sign: string; position: number }[] = [];
  const waqfChars = Object.keys(WAQF_SIGNS);
  for (let i = 0; i < text.length; i++) {
    for (const sign of waqfChars) {
      if (text.substring(i, i + sign.length) === sign) {
        signs.push({ sign, position: i });
      }
    }
  }
  return signs;
}

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
  const [hoveredWaqf, setHoveredWaqf] = useState<string | null>(null);

  const allArabicTexts = surah.ayahs.map((a) => a.arabic);
  const bodyTextClass = isChildMode ? "text-base" : "text-sm";

  const voice = useVoiceRecognition({
    lang: "ar-SA",
    continuous: true,
    onResult: (transcript) => {
      setLiveTranscript(transcript);
      const result = compareSurahDictation(allArabicTexts, transcript);
      setLiveResults(result.wordResults);
    },
    onError: (error) => {
      if (error === "not-allowed") setMicError("not-allowed");
    },
  });

  const handleStart = useCallback(() => {
    setPhase("recording");
    setLiveTranscript("");
    setLiveResults([]);
    setFinalResults(null);
    setMicError(null);
    setShowOriginal(false);
    voice.start();
  }, [voice]);

  const handleStop = useCallback(() => {
    voice.stop();
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
    handleRestart();
  }, [handleRestart]);

  const getWordColor = (status: DictationWordResult["status"]) => {
    switch (status) {
      case "correct": return "text-success";
      case "incorrect": return "text-destructive";
      case "missing": return "text-destructive underline decoration-wavy";
      case "extra": return "text-destructive line-through";
      default: return "text-foreground";
    }
  };

  // ─── Render Mushaf-style text with aya numbers & waqf signs ───
  const renderMushafText = () => {
    return (
      <div className="bg-card border border-border rounded-2xl p-5 space-y-0">
        {surah.ayahs.map((ayah, i) => {
          const waqfSigns = detectWaqfSigns(ayah.arabic);
          return (
            <div key={i} className="inline" dir="rtl">
              <span className="arabic-text text-xl text-foreground leading-[3]">
                {ayah.arabic}
              </span>
              {/* Aya end marker */}
              <span className="inline-flex items-center mx-1">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-[10px] font-bold font-sans">
                  {ayah.number}
                </span>
              </span>
              {/* Waqf signs tooltips */}
              {waqfSigns.map((ws, j) => {
                const info = WAQF_SIGNS[ws.sign];
                if (!info) return null;
                return (
                  <span
                    key={j}
                    className={`relative inline-block mx-0.5 cursor-help ${info.color} font-bold`}
                    onMouseEnter={() => setHoveredWaqf(`${i}-${j}`)}
                    onMouseLeave={() => setHoveredWaqf(null)}
                    onClick={() => setHoveredWaqf(hoveredWaqf === `${i}-${j}` ? null : `${i}-${j}`)}
                  >
                    {info.symbol}
                    {hoveredWaqf === `${i}-${j}` && (
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-card border border-border rounded-lg shadow-lg text-xs text-foreground whitespace-nowrap z-10 font-sans font-normal">
                        {t(info.translationKey as any)}
                      </span>
                    )}
                  </span>
                );
              })}
              {/* Separator between ayas */}
              {i < surah.ayahs.length - 1 && <span className="text-muted-foreground mx-1">·</span>}
            </div>
          );
        })}
      </div>
    );
  };

  // ─── Render colored live results grouped by aya ───
  const renderColoredLiveText = () => {
    if (liveResults.length === 0) return null;
    // Group results by aya boundaries
    let wordIdx = 0;
    return (
      <div className="space-y-3" dir="rtl">
        {surah.ayahs.map((ayah, ayaIdx) => {
          const ayaWordCount = ayah.arabic.split(/\s+/).length;
          const ayaWords = liveResults.slice(wordIdx, wordIdx + ayaWordCount + 5); // grab some extra for "extra" words
          // Actually render all words that belong to this aya range
          const relevantWords: DictationWordResult[] = [];
          let consumed = 0;
          for (let w = wordIdx; w < liveResults.length && consumed < ayaWordCount; w++) {
            relevantWords.push(liveResults[w]);
            if (liveResults[w].status !== "extra") consumed++;
          }
          wordIdx += relevantWords.length;

          if (relevantWords.length === 0 && ayaIdx > 0) return null;

          return (
            <div key={ayaIdx} className="flex gap-2 items-start">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-2 font-sans">
                {ayah.number}
              </span>
              <div className="arabic-text text-xl leading-[2.8] flex-1">
                {relevantWords.map((wr, i) => (
                  <span key={i} className={`${getWordColor(wr.status)} ${wr.status === "extra" ? "text-base opacity-70" : ""}`}>
                    {wr.word}{" "}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ─── Render final results grouped by aya with aya markers ───
  const renderFinalResults = () => {
    if (!finalResults) return null;
    let wordIdx = 0;
    return (
      <div className="space-y-3" dir="rtl">
        {surah.ayahs.map((ayah, ayaIdx) => {
          const ayaWordCount = ayah.arabic.split(/\s+/).length;
          const relevantWords: DictationWordResult[] = [];
          let consumed = 0;
          for (let w = wordIdx; w < finalResults.wordResults.length && consumed < ayaWordCount; w++) {
            relevantWords.push(finalResults.wordResults[w]);
            if (finalResults.wordResults[w].status !== "extra") consumed++;
          }
          wordIdx += relevantWords.length;

          const ayaScore = finalResults.ayahScores[ayaIdx];
          const waqfSigns = detectWaqfSigns(ayah.arabic);

          return (
            <div key={ayaIdx} className={`bg-card border rounded-xl p-3 ${
              ayaScore?.correct ? "border-success/30" : "border-destructive/30"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    ayaScore?.correct ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
                  }`}>
                    {ayaScore?.correct ? "✓" : "✗"}
                  </span>
                  <span className="text-xs text-muted-foreground font-sans">
                    {t("aya.progress")} {ayah.number}
                  </span>
                  {/* Waqf sign badges */}
                  {waqfSigns.map((ws, j) => {
                    const info = WAQF_SIGNS[ws.sign];
                    return info ? (
                      <span key={j} className={`text-xs px-1.5 py-0.5 rounded ${info.color} bg-muted font-bold`} title={t(info.translationKey as any)}>
                        {info.symbol}
                      </span>
                    ) : null;
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${ayaScore?.correct ? "text-success" : "text-destructive"}`}>
                    {ayaScore?.score}%
                  </span>
                  <button
                    onClick={() => {
                      fetch(`https://api.alquran.cloud/v1/ayah/${surah.number}:${ayah.number}/ar.husary`)
                        .then((r) => r.json())
                        .then((data) => {
                          if (data.data?.audio) new Audio(data.data.audio).play();
                        }).catch(() => {});
                    }}
                    className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0"
                  >
                    <Volume2 size={12} />
                  </button>
                </div>
              </div>
              <div className="arabic-text text-lg leading-[2.5]">
                {relevantWords.map((wr, i) => (
                  <span key={i} className={`${getWordColor(wr.status)} ${wr.status === "extra" ? "text-base opacity-70" : ""}`}>
                    {wr.word}{" "}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
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
      {phase === "recording" && (
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Mic size={12} className="text-primary" />
          <span>{t("dictation.serverMode")}</span>
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

          {/* Original text in Mushaf style with aya markers & waqf signs */}
          {showOriginal && renderMushafText()}

          {/* Waqf legend */}
          {showOriginal && (
            <div className="bg-accent/30 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <Info size={14} className="text-muted-foreground" />
                <span className="text-xs font-semibold text-foreground">Signes d'arrêt (Waqf)</span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {Object.entries(WAQF_SIGNS).slice(0, 5).map(([key, info]) => (
                  <span key={key} className={`px-2 py-1 rounded-lg bg-card border border-border ${info.color} font-bold`}>
                    {info.symbol} = {t(info.translationKey as any)}
                  </span>
                ))}
              </div>
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
          {/* Live colored text grouped by aya */}
          <div className="bg-card border-2 border-primary/30 rounded-2xl p-5 min-h-[200px]">
            {liveResults.length > 0 ? (
              renderColoredLiveText()
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

          {/* Detailed per-aya results with waqf signs */}
          <div>
            <h3 className={`${bodyTextClass} font-semibold text-foreground mb-3`}>
              {t("dictation.ayahBreakdown")}
            </h3>
            {renderFinalResults()}
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
