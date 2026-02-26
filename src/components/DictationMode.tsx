import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import useAntiDoubleAudio from "@/hooks/useAntiDoubleAudio";
import { analyzeAyahTajwid } from "@/data/tajwidRules";
import { motion } from "framer-motion";
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
import { useLiveWordFeedback, type LiveWordStatus } from "@/hooks/useLiveWordFeedback";
import { useLanguage } from "@/hooks/useLanguage";
import { useXP } from "@/hooks/useXP";
import ProgressBarDuolingo from "@/components/ProgressBarDuolingo";

interface DictationModeProps {
  surah: Surah;
  onBack: () => void;
  isChildMode: boolean;
  onRequestNextSurah?: () => void;
}

type DictationPhase = "ready" | "listening" | "recording" | "result";

// ─── Waqf signs data ─────────────────────────────────────────
const WAQF_SIGNS: Record<string, { symbol: string; translationKey: string; color: string }> = {
  "مـ": { symbol: "مـ", translationKey: "waqf.obligatory", color: "text-destructive" },
  "ط": { symbol: "ط", translationKey: "waqf.complete", color: "text-secondary" },
  "ج": { symbol: "ج", translationKey: "waqf.permissible", color: "text-primary" },
  "ۖ": { symbol: "ۖ", translationKey: "waqf.sufficient", color: "text-primary" },
  "ۗ": { symbol: "ۗ", translationKey: "waqf.good", color: "text-success" },
  "ۚ": { symbol: "ۚ", translationKey: "waqf.obligatory", color: "text-destructive" },
};

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

export default function DictationMode({ surah, onBack, isChildMode, onRequestNextSurah }: DictationModeProps) {
  const { t } = useLanguage();
  const { playSafely: safePlay } = useAntiDoubleAudio();
  const [phase, setPhase] = useState<DictationPhase>("ready");
  const [showOriginal, setShowOriginal] = useState(true);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [liveResult, setLiveResult] = useState<{
    wordResults: DictationWordResult[];
    ayahScores: { ayahIndex: number; score: number; correct: boolean }[];
    totalScore: number;
  } | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [hoveredWaqf, setHoveredWaqf] = useState<string | null>(null);
  const [listeningAyahIdx, setListeningAyahIdx] = useState(0);
  const preListenAudioRef = useRef<HTMLAudioElement | null>(null);

  const allArabicTexts = surah.ayahs.map((a) => a.arabic);
  const bodyTextClass = isChildMode ? "text-base" : "text-sm";

  // Live word-by-word feedback
  const { liveWords, currentWordIndex, totalMatched } = useLiveWordFeedback(allArabicTexts, liveTranscript);

  const getLiveWordColor = (status: LiveWordStatus) => {
    switch (status) {
      case "correct": return "text-success bg-success/10";
      case "almost": return "text-warning bg-warning/10";
      case "incorrect": return "text-destructive bg-destructive/10";
      case "pending": return "text-muted-foreground/40";
    }
  };

  const voice = useVoiceRecognition({
    lang: "ar-SA",
    continuous: true,
    onResult: (transcript) => {
      setLiveTranscript(transcript);
      const result = compareSurahDictation(allArabicTexts, transcript);
      setLiveResult(result);
    },
    onError: (error) => {
      if (error === "not-allowed") setMicError("not-allowed");
    },
  });

  // Play ayah audio sequentially before recording
  const playAyahAudio = useCallback((ayahIdx: number) => {
    const ayah = surah.ayahs[ayahIdx];
    if (!ayah) {
      // All ayahs played, start recording
      setPhase("recording");
      setShowOriginal(true);
      voice.start();
      return;
    }
    setListeningAyahIdx(ayahIdx);
    fetch(`https://api.alquran.cloud/v1/ayah/${surah.number}:${ayah.number}/ar.husary`)
      .then(r => r.json())
      .then(data => {
        if (data.data?.audio) {
          const audio = new Audio(data.data.audio);
          preListenAudioRef.current = audio;
          audio.onended = () => {
            preListenAudioRef.current = null;
            playAyahAudio(ayahIdx + 1);
          };
          audio.onerror = () => {
            preListenAudioRef.current = null;
            playAyahAudio(ayahIdx + 1);
          };
          audio.play().catch(() => playAyahAudio(ayahIdx + 1));
        } else {
          playAyahAudio(ayahIdx + 1);
        }
      })
      .catch(() => playAyahAudio(ayahIdx + 1));
  }, [surah, voice]);

  const handleStart = useCallback(() => {
    setPhase("listening");
    setLiveTranscript("");
    setLiveResult(null);
    setMicError(null);
    setListeningAyahIdx(0);
    playAyahAudio(0);
  }, [playAyahAudio]);

  const skipPreListen = useCallback(() => {
    if (preListenAudioRef.current) {
      preListenAudioRef.current.pause();
      preListenAudioRef.current = null;
    }
    setPhase("recording");
    setShowOriginal(true);
    voice.start();
  }, [voice]);

  const xp = useXP();
  const xpAwardedRef = useRef(false);

  const handleStop = useCallback(() => {
    voice.stop();
    const result = liveResult || compareSurahDictation(allArabicTexts, liveTranscript);
    if (!liveResult) setLiveResult(result);
    setPhase("result");
  }, [voice, allArabicTexts, liveTranscript, liveResult]);

  // Award XP once when result phase is shown
  useEffect(() => {
    if (phase === "result" && liveResult && !xpAwardedRef.current) {
      xpAwardedRef.current = true;
      if (liveResult.totalScore >= 50) {
        const correctWords = liveResult.wordResults.filter((r) => r.status === "correct").length;
        const xpGain = Math.max(1, Math.round(correctWords / 2));
        xp.addXP(xpGain);
      }
    }
    if (phase === "ready") xpAwardedRef.current = false;
  }, [phase, liveResult]);

  const handleRestart = useCallback(() => {
    setPhase("ready");
    setLiveTranscript("");
    setLiveResult(null);
    setMicError(null);
    setShowOriginal(true);
  }, []);

  const getWordColor = (status: DictationWordResult["status"]) => {
    switch (status) {
      case "correct": return "text-success";
      case "incorrect": return "text-destructive";
      case "missing": return "text-destructive underline decoration-wavy";
      case "extra": return "text-destructive line-through";
      default: return "text-foreground";
    }
  };

  // ─── Compute per-aya word slices from the live result ───
  const ayahWordSlices = useMemo(() => {
    if (!liveResult) return [];
    const slices: DictationWordResult[][] = [];
    let wordIdx = 0;
    for (const ayah of surah.ayahs) {
      const ayaWordCount = ayah.arabic.split(/\s+/).filter(Boolean).length;
      const relevantWords: DictationWordResult[] = [];
      let consumed = 0;
      for (let w = wordIdx; w < liveResult.wordResults.length && consumed < ayaWordCount; w++) {
        relevantWords.push(liveResult.wordResults[w]);
        if (liveResult.wordResults[w].status !== "extra") consumed++;
      }
      wordIdx += relevantWords.length;
      slices.push(relevantWords);
    }
    return slices;
  }, [liveResult, surah.ayahs]);


  // ─── Render Mushaf page with live word-by-word coloring ───
  const renderMushafLive = (isRecording: boolean) => {
    return (
      <div className="bg-card border border-border rounded-2xl p-5 space-y-0" dir="rtl">
        {surah.ayahs.map((ayah, i) => {
          const waqfSigns = detectWaqfSigns(ayah.arabic);
          const words = ayah.arabic.split(/\s+/).filter(Boolean);
          const ayahLiveWords = isRecording ? (liveWords[i] || []) : [];

          return (
            <span key={i} className="inline">
              {isRecording ? (
                // During recording: hide pending words, reveal with Tajwid underline
                <span className="arabic-text text-xl leading-[3]">
                  {(() => {
                    const tajwidWords = analyzeAyahTajwid(ayah.arabic);
                    return words.map((word, wi) => {
                      const lw = ayahLiveWords[wi];
                      const status = lw?.status || "pending";
                      const isPending = status === "pending";
                      const colorClass = getLiveWordColor(status);
                      const tw = tajwidWords[wi];
                      const tajwidBorder = !isPending && tw?.primaryColor
                        ? `3px solid hsl(${tw.primaryColor})`
                        : undefined;
                      return (
                        <motion.span
                          key={wi}
                          initial={!isPending ? { scale: 1.1 } : false}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 20 }}
                          className={`inline-block px-0.5 py-0.5 rounded-md transition-colors duration-300 ${
                            isPending ? "text-transparent select-none" : colorClass
                          }`}
                          style={{ borderBottom: tajwidBorder }}
                        >
                          {isPending ? "████" : word}{" "}
                        </motion.span>
                      );
                    });
                  })()}
                </span>
              ) : (
                // Not recording: show with Tajwid colors
                <span className="arabic-text text-xl leading-[3]">
                  {(() => {
                    const tajwidWords = analyzeAyahTajwid(ayah.arabic);
                    return tajwidWords.map((tw, wi) => (
                      <span
                        key={wi}
                        className="inline-block px-0.5"
                        style={tw.primaryColor ? { color: `hsl(${tw.primaryColor})` } : undefined}
                      >
                        {tw.text}{" "}
                      </span>
                    ));
                  })()}
                </span>
              )}

              {/* Aya end marker */}
              <span className="inline-flex items-center mx-1">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-[10px] font-bold font-sans">
                  {ayah.number}
                </span>
              </span>

              {/* Waqf signs */}
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

              {i < surah.ayahs.length - 1 && <span className="text-muted-foreground mx-1">·</span>}
            </span>
          );
        })}
      </div>
    );
  };

  // ─── Render final result view (per-aya cards) ───
  const renderFinalResults = () => {
    if (!liveResult) return null;
    return (
      <div className="space-y-3" dir="rtl">
        {surah.ayahs.map((ayah, ayaIdx) => {
          const relevantWords = ayahWordSlices[ayaIdx] || [];
          const ayaScore = liveResult.ayahScores[ayaIdx];
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
                          if (data.data?.audio) safePlay(data.data.audio);
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

          {showOriginal && renderMushafLive(false)}

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

          {micError === "not-allowed" && (
            <div className="bg-destructive/10 text-destructive rounded-xl p-4 text-center space-y-2">
              <AlertCircle size={20} className="inline" />
              <p className="text-sm font-semibold">{t("aya.micDenied")}</p>
              <p className="text-xs opacity-80">{t("aya.micDeniedHint")}</p>
            </div>
          )}

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

      {/* ═══ RECORDING PHASE — Same mushaf page with hidden→reveal ═══ */}
      {phase === "recording" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Recording indicator */}
          <div className="flex items-center justify-center gap-2 py-2">
            <div className="flex gap-1">
              {[0, 1, 2, 3].map((b) => (
                <motion.div key={b}
                  animate={{ scaleY: [1, 2.5, 1] }}
                  transition={{ duration: 0.6, delay: b * 0.12, repeat: Infinity }}
                  className="w-1.5 h-4 bg-primary rounded-full"
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">{t("dictation.listening")}</span>
          </div>

          {/* Same mushaf page — ayahs hidden, revealed as recited */}
          {renderMushafLive(true)}

          {/* Color legend during recording */}
          <div className="flex flex-wrap justify-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-success"><CheckCircle2 size={12} /> {t("dictation.legendCorrect")}</span>
            <span className="flex items-center gap-1 text-warning">⚠️ Presque</span>
            <span className="flex items-center gap-1 text-destructive"><XCircle size={12} /> {t("dictation.legendIncorrect")}</span>
          </div>

          {/* Live progress */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                animate={{ width: `${(totalMatched / Math.max(1, surah.ayahs.reduce((a, ay) => a + ay.arabic.split(/\s+/).filter(Boolean).length, 0))) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              {totalMatched}/{surah.ayahs.reduce((a, ay) => a + ay.arabic.split(/\s+/).filter(Boolean).length, 0)}
            </span>
          </div>

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
      {phase === "result" && liveResult && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5">
          {/* Score */}
          <div className="text-center py-4">
            <div className={`${isChildMode ? "w-32 h-32 text-4xl" : "w-24 h-24 text-3xl"} rounded-full mx-auto flex items-center justify-center font-bold mb-3 ${
              liveResult.totalScore >= 80 ? "bg-success/15 text-success"
                : liveResult.totalScore >= 50 ? "bg-secondary/15 text-secondary"
                : "bg-destructive/15 text-destructive"
            }`}>
              {liveResult.totalScore}%
            </div>
            <h2 className={`${isChildMode ? "text-2xl" : "text-xl"} font-bold text-foreground`}>
              {liveResult.totalScore >= 80
                ? t("dictation.excellent")
                : liveResult.totalScore >= 50
                  ? t("dictation.good")
                  : t("dictation.needsWork")}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {liveResult.wordResults.filter((r) => r.status === "correct").length} / {surah.ayahs.reduce((a, ay) => a + ay.arabic.split(/\s+/).length, 0)} {t("dictation.wordsCorrect")}
            </p>
          </div>

          {/* XP Progress Bar */}
          <ProgressBarDuolingo
            level={xp.level}
            xpInLevel={xp.xpInLevel}
            xpForNext={xp.xpForNext}
            xpTotal={xp.xpTotal}
            xpToday={xp.xpToday}
            streakDays={xp.streakDays}
            lastGain={xp.lastGain}
            compact
          />

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-success"><CheckCircle2 size={12} /> {t("dictation.legendCorrect")}</span>
            <span className="flex items-center gap-1 text-destructive"><XCircle size={12} /> {t("dictation.legendIncorrect")}</span>
            <span className="flex items-center gap-1 text-destructive underline decoration-wavy">{t("dictation.legendMissing")}</span>
            <span className="flex items-center gap-1 text-destructive line-through">{t("dictation.legendExtra")}</span>
          </div>

          {/* Per-aya results */}
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
            {onRequestNextSurah && (
              <button onClick={onRequestNextSurah}
                className={`flex-1 flex items-center justify-center gap-2 ${isChildMode ? "py-4 text-lg" : "py-3.5"} rounded-2xl bg-primary text-primary-foreground font-semibold`}>
                {t("recitation.changeSurah")} →
              </button>
            )}
          </div>

          <button onClick={onBack}
            className="w-full py-3 text-sm text-muted-foreground underline">
            ← {t("recitation.changeSurah")}
          </button>
        </motion.div>
      )}
    </div>
  );
}
