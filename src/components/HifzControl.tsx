import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Play, Pause, Square, Timer, AlertTriangle,
  Eye, Shield, ChevronDown, Mic, MicOff, SkipForward,
  Volume2, RotateCcw, Trophy, Target, AlertCircle,
} from "lucide-react";
import type { Surah } from "@/data/surahs";
import { useHifzSession, type HifzMode, type ToleranceLevel, type WordStatus } from "@/hooks/useHifzSession";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";

interface HifzControlProps {
  surah: Surah;
  onBack: () => void;
  isChildMode: boolean;
  t: (key: string) => string;
}

type Screen = "setup" | "recitation" | "results";

// Color/symbol mapping for word statuses
const STATUS_STYLES: Record<WordStatus, { bg: string; text: string; symbol: string }> = {
  correct: { bg: "bg-success/15", text: "text-success", symbol: "✓" },
  incorrect: { bg: "bg-destructive/15", text: "text-destructive", symbol: "✗" },
  missing: { bg: "bg-yellow-500/15", text: "text-yellow-600 dark:text-yellow-400", symbol: "?" },
  extra: { bg: "bg-blue-500/15", text: "text-blue-600 dark:text-blue-400", symbol: "+" },
  unchecked: { bg: "", text: "text-foreground", symbol: "" },
};

export default function HifzControl({ surah, onBack, isChildMode, t }: HifzControlProps) {
  const [screen, setScreen] = useState<Screen>("setup");

  // Setup state
  const [ayahStart, setAyahStart] = useState(0);
  const [ayahEnd, setAyahEnd] = useState(Math.min(surah.ayahs.length - 1, 6));
  const [mode, setMode] = useState<HifzMode>("observer");
  const [tolerance, setTolerance] = useState<ToleranceLevel>("medium");
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Session
  const session = useHifzSession();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [accessibilityMode, setAccessibilityMode] = useState(false);

  const voice = useVoiceRecognition({
    lang: "ar-SA",
    continuous: true,
    onResult: (transcript) => setCurrentTranscript(transcript),
  });

  // Timer
  useEffect(() => {
    if (screen === "recitation" && !session.isPaused && !session.isFinished) {
      timerRef.current = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [screen, session.isPaused, session.isFinished]);

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // ─── Start session ────────────────────────────────────────
  const handleStart = useCallback(() => {
    const ayahTexts = surah.ayahs.slice(ayahStart, ayahEnd + 1).map(a => a.arabic);
    session.startSession({
      surahNumber: surah.number,
      surahName: surah.name,
      surahNameArabic: surah.nameArabic,
      ayahStart,
      ayahEnd,
      mode,
      tolerance,
    }, ayahTexts);
    setElapsedSeconds(0);
    setCurrentTranscript("");
    setScreen("recitation");
  }, [surah, ayahStart, ayahEnd, mode, tolerance, session]);

  // ─── Validate current ayah ────────────────────────────────
  const handleValidateAyah = useCallback(() => {
    if (!session.config) return;
    voice.stop();
    const ayah = surah.ayahs[session.currentAyahIndex];
    session.processTranscript(currentTranscript, ayah.arabic, session.currentAyahIndex);
    setCurrentTranscript("");

    // In observer mode, auto-advance
    if (session.config.mode === "observer") {
      if (session.currentAyahIndex >= session.config.ayahEnd) {
        setTimeout(() => session.finishSession(), 500);
      } else {
        session.setCurrentAyahIndex(session.currentAyahIndex + 1);
      }
    }
  }, [session, surah, currentTranscript, voice]);

  // ─── Skip ayah ────────────────────────────────────────────
  const handleSkipAyah = useCallback(() => {
    if (!session.config) return;
    voice.stop();
    setCurrentTranscript("");
    if (session.currentAyahIndex >= session.config.ayahEnd) {
      session.finishSession();
    } else {
      session.setCurrentAyahIndex(session.currentAyahIndex + 1);
    }
  }, [session, voice]);

  // ─── Stop session ─────────────────────────────────────────
  const handleStop = useCallback(() => {
    voice.stop();
    session.finishSession();
    setScreen("results");
  }, [voice, session]);

  // Switch to results when finished
  useEffect(() => {
    if (session.isFinished && session.summary) {
      setScreen("results");
    }
  }, [session.isFinished, session.summary]);

  // Get words for a specific ayah
  const getAyahWords = (ayahIdx: number) => {
    return session.words
      .filter(w => w.ayahIndex === ayahIdx)
      .sort((a, b) => a.wordIndex - b.wordIndex);
  };

  const totalErrors = session.errorCount.incorrect + session.errorCount.missing + session.errorCount.extra;

  // ═══════════════════════════════════════════════════════════
  // SETUP SCREEN
  // ═══════════════════════════════════════════════════════════
  if (screen === "setup") {
    return (
      <div className="px-6 space-y-5 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 rounded-full bg-muted text-foreground flex items-center justify-center">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 text-center">
            <p className="font-arabic text-xl text-primary">{surah.nameArabic}</p>
            <p className="text-xs text-muted-foreground">{t("hifz.title")}</p>
          </div>
          <div className="w-9" />
        </div>

        {/* Passage selection */}
        <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {t("hifz.selectPassage")}
          </p>

          <div className="grid grid-cols-2 gap-3">
            {/* Start ayah */}
            <div className="relative">
              <label className="text-[10px] text-muted-foreground font-medium uppercase">{t("hifz.from")}</label>
              <button
                onClick={() => { setShowStartPicker(!showStartPicker); setShowEndPicker(false); }}
                className="w-full mt-1 flex items-center justify-between bg-muted rounded-xl px-3 py-2.5 text-sm text-foreground"
              >
                <span>{t("hifz.ayah")} {ayahStart + 1}</span>
                <ChevronDown size={14} className={`text-muted-foreground transition-transform ${showStartPicker ? "rotate-180" : ""}`} />
              </button>
              {showStartPicker && (
                <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {surah.ayahs.map((_, i) => (
                    <button key={i} onClick={() => { setAyahStart(i); if (i > ayahEnd) setAyahEnd(i); setShowStartPicker(false); }}
                      className={`w-full px-3 py-2 text-xs text-left hover:bg-accent/50 ${i === ayahStart ? "bg-primary/10 text-primary font-bold" : "text-foreground"}`}>
                      {t("hifz.ayah")} {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* End ayah */}
            <div className="relative">
              <label className="text-[10px] text-muted-foreground font-medium uppercase">{t("hifz.to")}</label>
              <button
                onClick={() => { setShowEndPicker(!showEndPicker); setShowStartPicker(false); }}
                className="w-full mt-1 flex items-center justify-between bg-muted rounded-xl px-3 py-2.5 text-sm text-foreground"
              >
                <span>{t("hifz.ayah")} {ayahEnd + 1}</span>
                <ChevronDown size={14} className={`text-muted-foreground transition-transform ${showEndPicker ? "rotate-180" : ""}`} />
              </button>
              {showEndPicker && (
                <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {surah.ayahs.filter((_, i) => i >= ayahStart).map((_, idx) => {
                    const i = ayahStart + idx;
                    return (
                      <button key={i} onClick={() => { setAyahEnd(i); setShowEndPicker(false); }}
                        className={`w-full px-3 py-2 text-xs text-left hover:bg-accent/50 ${i === ayahEnd ? "bg-primary/10 text-primary font-bold" : "text-foreground"}`}>
                        {t("hifz.ayah")} {i + 1}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground text-center">
            {ayahEnd - ayahStart + 1} {t("hifz.ayahsSelected")}
          </p>
        </div>

        {/* Mode selection */}
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("hifz.mode")}</p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setMode("blocking")}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                mode === "blocking" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
              }`}>
              <Shield size={20} className={mode === "blocking" ? "text-primary" : "text-muted-foreground"} />
              <span className={`text-xs font-semibold ${mode === "blocking" ? "text-primary" : "text-foreground"}`}>
                {t("hifz.blocking")}
              </span>
              <span className="text-[10px] text-muted-foreground text-center leading-tight">
                {t("hifz.blockingDesc")}
              </span>
            </button>
            <button onClick={() => setMode("observer")}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                mode === "observer" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
              }`}>
              <Eye size={20} className={mode === "observer" ? "text-primary" : "text-muted-foreground"} />
              <span className={`text-xs font-semibold ${mode === "observer" ? "text-primary" : "text-foreground"}`}>
                {t("hifz.observer")}
              </span>
              <span className="text-[10px] text-muted-foreground text-center leading-tight">
                {t("hifz.observerDesc")}
              </span>
            </button>
          </div>
        </div>

        {/* Tolerance */}
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("hifz.tolerance")}</p>
          <div className="flex gap-1.5">
            {(["strict", "medium", "lenient"] as const).map(lvl => (
              <button key={lvl} onClick={() => setTolerance(lvl)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  tolerance === lvl
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-accent/50"
                }`}>
                {t(`hifz.${lvl}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Accessibility toggle */}
        <button onClick={() => setAccessibilityMode(!accessibilityMode)}
          className="w-full flex items-center justify-between bg-card border border-border rounded-2xl px-4 py-3">
          <span className="text-xs text-foreground font-medium">{t("hifz.accessibility")}</span>
          <div className={`w-10 h-6 rounded-full transition-colors ${accessibilityMode ? "bg-primary" : "bg-muted"}`}>
            <div className={`w-5 h-5 rounded-full bg-card shadow-sm transition-transform mt-0.5 ${accessibilityMode ? "translate-x-[18px]" : "translate-x-0.5"}`} />
          </div>
        </button>

        {/* Start button */}
        <button onClick={handleStart}
          className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform">
          {t("hifz.start")}
        </button>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // RECITATION SCREEN
  // ═══════════════════════════════════════════════════════════
  if (screen === "recitation" && session.config) {
    const cfg = session.config;
    const progressPct = cfg.ayahEnd > cfg.ayahStart
      ? ((session.currentAyahIndex - cfg.ayahStart) / (cfg.ayahEnd - cfg.ayahStart + 1)) * 100
      : 0;

    return (
      <div className="px-6 space-y-4 pb-32">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="w-9 h-9 rounded-full bg-muted text-foreground flex items-center justify-center">
            <ArrowLeft size={18} />
          </button>
          <div className="text-center flex-1">
            <p className="font-arabic text-lg text-primary">{surah.nameArabic}</p>
            <p className="text-[10px] text-muted-foreground">
              {t("hifz.ayah")} {cfg.ayahStart + 1}–{cfg.ayahEnd + 1} · {cfg.mode === "blocking" ? t("hifz.blocking") : t("hifz.observer")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg">
              <Timer size={12} />
              {formatTimer(elapsedSeconds)}
            </div>
          </div>
        </div>

        {/* Error counter + progress */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <motion.div className="h-full bg-primary rounded-full" style={{ width: `${progressPct}%` }} />
          </div>
          {totalErrors > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-destructive/10 text-destructive text-xs font-bold">
              <AlertTriangle size={12} />
              {totalErrors}
            </div>
          )}
        </div>

        {/* Ayahs */}
        <div className="space-y-3">
          {surah.ayahs.slice(cfg.ayahStart, cfg.ayahEnd + 1).map((ayah, relIdx) => {
            const ayahIdx = cfg.ayahStart + relIdx;
            const isCurrent = ayahIdx === session.currentAyahIndex;
            const ayahWords = getAyahWords(ayahIdx);
            const hasResults = ayahWords.some(w => w.status !== "unchecked");

            return (
              <motion.div
                key={ayah.number}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: relIdx * 0.03 }}
                className={`bg-card border-2 rounded-2xl p-4 transition-all ${
                  isCurrent
                    ? "border-primary shadow-lg shadow-primary/10"
                    : hasResults
                      ? "border-border"
                      : "border-border opacity-50"
                }`}
              >
                {/* Ayah number */}
                <div className="flex items-center justify-between mb-2">
                  <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                    {ayah.number}
                  </span>
                  {isCurrent && <Mic size={14} className="text-primary animate-pulse" />}
                </div>

                {/* Word-by-word display */}
                <div className="arabic-text text-xl leading-[2.8] flex flex-wrap gap-1 justify-end" dir="rtl">
                  {hasResults ? (
                    ayahWords.map(w => {
                      const style = STATUS_STYLES[w.status];
                      return (
                        <span
                          key={w.id}
                          className={`inline-block px-1.5 py-0.5 rounded-lg transition-all ${style.bg} ${style.text} ${
                            w.id === session.blockedWordId ? "ring-2 ring-destructive animate-pulse" : ""
                          }`}
                        >
                          {w.text}
                          {accessibilityMode && w.status !== "unchecked" && w.status !== "correct" && (
                            <sup className="text-[10px] ml-0.5">{style.symbol}</sup>
                          )}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-foreground">{ayah.arabic}</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Blocking error overlay */}
        <AnimatePresence>
          {session.isBlockedOnError && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="fixed bottom-32 left-0 right-0 z-50 px-4"
            >
              <div className="max-w-lg mx-auto bg-destructive/10 border-2 border-destructive/30 rounded-2xl p-4 text-center space-y-3">
                <AlertTriangle size={24} className="text-destructive mx-auto" />
                <p className="text-sm font-bold text-destructive">{t("hifz.errorDetected")}</p>
                <p className="text-xs text-muted-foreground">{t("hifz.correctOrIgnore")}</p>
                <div className="flex gap-2 justify-center">
                  <button onClick={() => { session.ignoreError(); voice.start(); }}
                    className="px-4 py-2 rounded-xl bg-muted text-foreground text-xs font-semibold">
                    {t("hifz.ignoreError")}
                  </button>
                  <button onClick={() => { session.ignoreError(); setCurrentTranscript(""); voice.start(); }}
                    className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold">
                    {t("hifz.retry")}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live transcript */}
        {currentTranscript && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-accent/50 rounded-xl p-3">
            <p className="arabic-text text-lg text-foreground">{currentTranscript}</p>
          </motion.div>
        )}

        {/* Bottom controls */}
        <div className="fixed bottom-16 left-0 right-0 z-40">
          <div className="max-w-lg mx-auto px-4">
            <div className="bg-card border border-border rounded-2xl shadow-xl p-3 flex items-center justify-between gap-2">
              {/* Mic button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={voice.isListening ? voice.stop : voice.start}
                disabled={session.isBlockedOnError}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  voice.isListening
                    ? "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/30 animate-pulse"
                    : "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                } disabled:opacity-50`}
              >
                {voice.isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </motion.button>

              {/* Validate */}
              {currentTranscript && (
                <button onClick={handleValidateAyah}
                  className="flex items-center gap-1.5 bg-success text-success-foreground px-4 py-2.5 rounded-xl font-semibold text-xs">
                  ✓ {t("detail.validate")}
                </button>
              )}

              {/* Skip */}
              <button onClick={handleSkipAyah}
                className="w-10 h-10 rounded-full bg-muted text-foreground flex items-center justify-center">
                <SkipForward size={16} />
              </button>

              {/* Stop */}
              <button onClick={handleStop}
                className="w-10 h-10 rounded-full bg-destructive/15 text-destructive flex items-center justify-center">
                <Square size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // RESULTS SCREEN
  // ═══════════════════════════════════════════════════════════
  if (screen === "results" && session.summary) {
    const s = session.summary;
    return (
      <div className="px-6 space-y-5 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 rounded-full bg-muted text-foreground flex items-center justify-center">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 text-center">
            <p className="font-bold text-foreground">{t("hifz.results")}</p>
          </div>
          <div className="w-9" />
        </div>

        {/* Score circle */}
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="text-center py-4">
          <div className={`w-28 h-28 rounded-full mx-auto flex items-center justify-center font-bold text-3xl mb-3 ${
            s.totalScore >= 80 ? "bg-success/15 text-success" :
            s.totalScore >= 50 ? "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400" :
            "bg-destructive/15 text-destructive"
          }`}>
            {s.totalScore}%
          </div>
          <p className="text-sm text-muted-foreground">
            {s.correctCount}/{s.totalWords} {t("hifz.wordsCorrect")}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            <Timer size={12} className="inline mr-1" />
            {formatTimer(s.durationSeconds)}
          </p>
        </motion.div>

        {/* Error breakdown */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t("hifz.errorBreakdown")}</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-2 rounded-xl bg-destructive/10">
              <p className="text-lg font-bold text-destructive">{s.incorrectCount}</p>
              <p className="text-[10px] text-destructive/80">{t("hifz.incorrect")}</p>
              {accessibilityMode && <p className="text-[10px] text-destructive/60">✗</p>}
            </div>
            <div className="text-center p-2 rounded-xl bg-yellow-500/10">
              <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{s.missingCount}</p>
              <p className="text-[10px] text-yellow-600/80 dark:text-yellow-400/80">{t("hifz.missing")}</p>
              {accessibilityMode && <p className="text-[10px] text-yellow-600/60 dark:text-yellow-400/60">?</p>}
            </div>
            <div className="text-center p-2 rounded-xl bg-blue-500/10">
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{s.extraCount}</p>
              <p className="text-[10px] text-blue-600/80 dark:text-blue-400/80">{t("hifz.extra")}</p>
              {accessibilityMode && <p className="text-[10px] text-blue-600/60 dark:text-blue-400/60">+</p>}
            </div>
          </div>
        </div>

        {/* Worst ayahs */}
        {s.worstAyahs.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t("hifz.worstAyahs")}</p>
            <div className="space-y-2">
              {s.worstAyahs.map(a => {
                const ayah = surah.ayahs[a.ayahIndex];
                return (
                  <div key={a.ayahIndex} className="flex items-center gap-3 p-2 rounded-xl bg-muted/50">
                    <span className="w-7 h-7 rounded-lg bg-destructive/10 text-destructive text-xs font-bold flex items-center justify-center shrink-0">
                      {ayah.number}
                    </span>
                    <p className="arabic-text text-sm text-foreground flex-1 truncate">{ayah.arabic}</p>
                    <span className={`text-xs font-bold ${a.score >= 50 ? "text-yellow-600 dark:text-yellow-400" : "text-destructive"}`}>
                      {a.score}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Per-ayah scores */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t("hifz.ayahScores")}</p>
          <div className="flex flex-wrap gap-1.5">
            {s.ayahScores.map(a => (
              <div key={a.ayahIndex}
                className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center text-[10px] font-bold ${
                  a.score >= 80 ? "bg-success/15 text-success" :
                  a.score >= 50 ? "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400" :
                  "bg-destructive/15 text-destructive"
                }`}>
                <span>{surah.ayahs[a.ayahIndex]?.number}</span>
                <span className="text-[8px] opacity-70">{a.score}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2 pb-6">
          <button onClick={() => { session.resetSession(); setScreen("setup"); }}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-border text-foreground font-semibold active:scale-[0.98] transition-transform">
            <RotateCcw size={18} />
            {t("hifz.retry")}
          </button>
          <button onClick={onBack}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold active:scale-[0.98] transition-transform">
            {t("recitation.changeSurah")}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
