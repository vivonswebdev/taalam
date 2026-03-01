import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Play, Pause, Square, Mic, MicOff, ChevronDown,
  Star, Trophy, Zap, Lightbulb, SkipForward, Timer, RotateCcw,
  Target, AlertCircle, Sparkles,
} from "lucide-react";
import type { Surah } from "@/data/surahs";
import { useTahaddiSession, MAX_ATTEMPTS } from "@/hooks/useTahaddiSession";
import { useVoiceRecognition, compareTexts } from "@/hooks/useVoiceRecognition";
import { useQuranXp } from "@/hooks/useQuranXp";
import Confetti from "@/components/Confetti";
import ActiveChildBanner from "@/components/ActiveChildBanner";

interface TahaddiModeProps {
  surah: Surah;
  onBack: () => void;
  isChildMode: boolean;
  t: (key: string) => string;
}

type Screen = "setup" | "challenge" | "results";

const THRESHOLDS = [85, 90, 95] as const;

export default function TahaddiMode({ surah, onBack, isChildMode, t }: TahaddiModeProps) {
  const [screen, setScreen] = useState<Screen>("setup");
  const { addXp } = useQuranXp();

  // Setup state
  const [ayahStart, setAyahStart] = useState(0);
  const [ayahEnd, setAyahEnd] = useState(Math.min(surah.ayahs.length - 1, 6));
  const [threshold, setThreshold] = useState<number>(90);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Session
  const session = useTahaddiSession();
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [revealAnimation, setRevealAnimation] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const voice = useVoiceRecognition({
    lang: "ar-SA",
    continuous: true,
    onResult: (transcript) => setCurrentTranscript(transcript),
  });

  // Timer
  useEffect(() => {
    if (screen === "challenge" && session.isActive) {
      timerRef.current = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [screen, session.isActive]);

  // Auto-advance after reveal animation
  useEffect(() => {
    if (revealAnimation !== null) {
      const timer = setTimeout(() => {
        setRevealAnimation(null);
        session.advanceToNext();
        setCurrentTranscript("");
        setShowHint(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [revealAnimation]);

  // Switch to results
  useEffect(() => {
    if (session.isFinished && session.summary) {
      if (session.summary.starsEarned >= 2) setShowConfetti(true);
      addXP(session.summary.xpEarned);
      setScreen("results");
    }
  }, [session.isFinished, session.summary]);

  // Handle evaluation result
  useEffect(() => {
    if (!session.lastEvaluation) return;
    const { passed } = session.lastEvaluation;
    const currentState = session.ayahStates[session.currentAyahIdx];
    
    if (passed) {
      setRevealAnimation(session.currentAyahIdx);
    } else if (currentState?.status === "failed") {
      // Max attempts reached, auto-advance after delay
      setTimeout(() => {
        session.advanceToNext();
        setCurrentTranscript("");
        setShowHint(false);
      }, 1500);
    }
  }, [session.lastEvaluation]);

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // ─── Start ────────────────────────────────────────────────
  const handleStart = useCallback(() => {
    session.startSession({
      surahNumber: surah.number,
      surahName: surah.name,
      surahNameArabic: surah.nameArabic,
      ayahStart,
      ayahEnd,
      similarityThreshold: threshold,
      createdAt: Date.now(),
    });
    setElapsedSeconds(0);
    setCurrentTranscript("");
    setShowHint(false);
    setScreen("challenge");
  }, [surah, ayahStart, ayahEnd, threshold, session]);

  // ─── Validate ─────────────────────────────────────────────
  const handleValidate = useCallback(() => {
    if (!session.config) return;
    voice.stop();
    const ayahIdx = session.config.ayahStart + session.currentAyahIdx;
    const ayah = surah.ayahs[ayahIdx];
    session.evaluateAyah(currentTranscript, ayah.arabic);
    setCurrentTranscript("");
  }, [session, surah, currentTranscript, voice]);

  // ─── Skip ─────────────────────────────────────────────────
  const handleSkip = useCallback(() => {
    voice.stop();
    setCurrentTranscript("");
    setShowHint(false);
    session.advanceToNext();
  }, [voice, session]);

  // ─── Hint ─────────────────────────────────────────────────
  const handleHint = useCallback(() => {
    session.useHint();
    setShowHint(true);
  }, [session]);

  // ─── Stop ─────────────────────────────────────────────────
  const handleStop = useCallback(() => {
    voice.stop();
    session.finishSession();
  }, [voice, session]);

  // Get first word(s) for hint
  const getHintText = (ayahIdx: number): string => {
    const words = surah.ayahs[ayahIdx].arabic.split(/\s+/);
    return words.slice(0, Math.min(2, words.length)).join(" ") + "...";
  };

  // ═══════════════════════════════════════════════════════════
  // SETUP SCREEN
  // ═══════════════════════════════════════════════════════════
  if (screen === "setup") {
    return (
      <div className="px-6 space-y-5 pb-8">
        {/* Active child banner */}
        <div className="pt-2">
          <ActiveChildBanner
            mode="tahaddi"
            surahName={surah.name}
            ayahFrom={ayahStart + 1}
            ayahTo={ayahEnd + 1}
          />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 rounded-full bg-muted text-foreground flex items-center justify-center">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 text-center">
            <p className="font-arabic text-xl text-primary">{surah.nameArabic}</p>
            <p className="text-xs text-muted-foreground">{t("tahaddi.title")}</p>
          </div>
          <div className="w-9" />
        </div>

        {/* Description */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-center">
          <Target size={24} className="text-primary mx-auto mb-2" />
          <p className="text-sm font-semibold text-foreground mb-1">{t("tahaddi.desc")}</p>
          <p className="text-xs text-muted-foreground">{t("tahaddi.descDetail")}</p>
        </div>

        {/* Passage selection */}
        <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("hifz.selectPassage")}</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <label className="text-[10px] text-muted-foreground font-medium uppercase">{t("hifz.from")}</label>
              <button onClick={() => { setShowStartPicker(!showStartPicker); setShowEndPicker(false); }}
                className="w-full mt-1 flex items-center justify-between bg-muted rounded-xl px-3 py-2.5 text-sm text-foreground">
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
            <div className="relative">
              <label className="text-[10px] text-muted-foreground font-medium uppercase">{t("hifz.to")}</label>
              <button onClick={() => { setShowEndPicker(!showEndPicker); setShowStartPicker(false); }}
                className="w-full mt-1 flex items-center justify-between bg-muted rounded-xl px-3 py-2.5 text-sm text-foreground">
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

        {/* Threshold */}
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("tahaddi.threshold")}</p>
          <div className="flex gap-1.5">
            {THRESHOLDS.map(th => (
              <button key={th} onClick={() => setThreshold(th)}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                  threshold === th
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-accent/50"
                }`}>
                {th}%
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground text-center">
            {threshold >= 95 ? t("tahaddi.thresholdHard") : threshold >= 90 ? t("tahaddi.thresholdMedium") : t("tahaddi.thresholdEasy")}
          </p>
        </div>

        {/* Start */}
        <button onClick={handleStart}
          className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
          <Target size={20} />
          {t("tahaddi.start")}
        </button>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // CHALLENGE SCREEN
  // ═══════════════════════════════════════════════════════════
  if (screen === "challenge" && session.config) {
    const cfg = session.config;
    const totalAyahs = cfg.ayahEnd - cfg.ayahStart + 1;
    const currentAbsIdx = cfg.ayahStart + session.currentAyahIdx;
    const currentAyah = surah.ayahs[currentAbsIdx];
    const currentState = session.ayahStates[session.currentAyahIdx];
    const revealedCount = session.ayahStates.filter(a => a.status === "revealed").length;

    return (
      <div className="px-6 space-y-4 pb-32">
        <Confetti active={showConfetti} emoji={isChildMode} />

        {/* Top bar */}
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="w-9 h-9 rounded-full bg-muted text-foreground flex items-center justify-center">
            <ArrowLeft size={18} />
          </button>
          <div className="text-center flex-1">
            <p className="font-arabic text-lg text-primary">{surah.nameArabic}</p>
            <p className="text-[10px] text-muted-foreground">
              {t("tahaddi.title")} · {threshold}%
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg">
            <Timer size={12} />
            {formatTimer(elapsedSeconds)}
          </div>
        </div>

        {/* Progress: ayah bullets */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {session.ayahStates.map((state, i) => {
              const isCurrent = i === session.currentAyahIdx;
              return (
                <motion.div
                  key={i}
                  animate={isCurrent ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ repeat: isCurrent ? Infinity : 0, duration: 1.5 }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all border-2 ${
                    state.status === "revealed"
                      ? "bg-success/15 border-success text-success"
                      : state.status === "failed"
                        ? "bg-destructive/15 border-destructive text-destructive"
                        : isCurrent
                          ? "bg-primary/15 border-primary text-primary"
                          : "bg-muted border-border text-muted-foreground"
                  }`}
                >
                  {state.status === "revealed" ? "✓" : state.status === "failed" ? "✗" : cfg.ayahStart + i + 1}
                </motion.div>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            {revealedCount}/{totalAyahs} {t("tahaddi.revealed")}
          </p>
        </div>

        {/* Current ayah challenge area */}
        <div className="bg-card border-2 border-primary rounded-2xl p-5 space-y-4 min-h-[200px]">
          {/* Ayah number + attempts */}
          <div className="flex items-center justify-between">
            <span className="w-8 h-8 rounded-lg bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
              {currentAbsIdx + 1}
            </span>
            <div className="flex items-center gap-2">
              {currentState && currentState.attemptsCount > 0 && (
                <span className="text-xs text-muted-foreground font-medium">
                  {t("tahaddi.attempt")} {currentState.attemptsCount}/{MAX_ATTEMPTS}
                </span>
              )}
            </div>
          </div>

          {/* Similarity progress bar */}
          {currentState && currentState.bestSimilarity > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>{t("tahaddi.similarity")}</span>
                <span className={currentState.bestSimilarity >= threshold ? "text-success font-bold" : ""}>
                  {currentState.bestSimilarity}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    currentState.bestSimilarity >= threshold ? "bg-success" : "bg-primary"
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${currentState.bestSimilarity}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              {/* Threshold marker */}
              <div className="relative h-0">
                <div
                  className="absolute -top-3 w-px h-3 bg-destructive"
                  style={{ left: `${threshold}%` }}
                />
              </div>
            </div>
          )}

          {/* Revealed text or hidden state */}
          <AnimatePresence mode="wait">
            {currentState?.status === "revealed" || revealAnimation === session.currentAyahIdx ? (
              <motion.div
                key="revealed"
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="text-center"
              >
                <p className={`arabic-text ${isChildMode ? "text-2xl" : "text-xl"} text-success leading-loose`}>
                  {currentAyah.arabic}
                </p>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="mt-3"
                >
                  <Sparkles size={28} className="text-success mx-auto" />
                </motion.div>
              </motion.div>
            ) : currentState?.status === "failed" ? (
              <motion.div
                key="failed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center space-y-2"
              >
                <p className={`arabic-text ${isChildMode ? "text-2xl" : "text-xl"} text-destructive/60 leading-loose`}>
                  {currentAyah.arabic}
                </p>
                <p className="text-xs text-destructive font-semibold">{t("tahaddi.maxAttempts")}</p>
              </motion.div>
            ) : (
              <motion.div
                key="hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-6"
              >
                <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-3">
                  <span className="text-2xl">🤔</span>
                </div>
                <p className="text-sm text-muted-foreground font-medium">{t("tahaddi.reciteFromMemory")}</p>

                {/* Hint */}
                {showHint && (
                  <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="arabic-text text-lg text-primary/60 mt-3"
                  >
                    {getHintText(currentAbsIdx)}
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Last evaluation feedback */}
          <AnimatePresence>
            {session.lastEvaluation && !session.lastEvaluation.passed && currentState?.status !== "failed" && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-destructive/10 rounded-xl p-3 text-center"
              >
                <p className="text-xs font-semibold text-destructive">
                  {session.lastEvaluation.score}% — {t("tahaddi.notEnough")} ({threshold}%)
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Live transcript */}
        {currentTranscript && currentState?.status === "hidden" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-accent/50 rounded-xl p-3">
            <p className="arabic-text text-lg text-foreground">{currentTranscript}</p>
          </motion.div>
        )}

        {/* Bottom controls */}
        <div className="fixed bottom-16 left-0 right-0 z-40">
          <div className="max-w-lg mx-auto px-4">
            <div className="bg-card border border-border rounded-2xl shadow-xl p-3 flex items-center justify-between gap-2">
              {/* Mic */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={voice.isListening ? voice.stop : voice.start}
                disabled={currentState?.status !== "hidden"}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  voice.isListening
                    ? "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/30 animate-pulse"
                    : "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                } disabled:opacity-40`}
              >
                {voice.isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </motion.button>

              {/* Validate */}
              {currentTranscript && currentState?.status === "hidden" && (
                <button onClick={handleValidate}
                  className="flex items-center gap-1.5 bg-success text-success-foreground px-4 py-2.5 rounded-xl font-semibold text-xs">
                  ✓ {t("detail.validate")}
                </button>
              )}

              {/* Hint */}
              {!showHint && currentState?.status === "hidden" && (
                <button onClick={handleHint}
                  className="w-10 h-10 rounded-full bg-secondary/15 text-secondary flex items-center justify-center">
                  <Lightbulb size={16} />
                </button>
              )}

              {/* Skip */}
              <button onClick={handleSkip}
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
        <Confetti active={showConfetti} emoji={isChildMode} />

        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 rounded-full bg-muted text-foreground flex items-center justify-center">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 text-center">
            <p className="font-bold text-foreground">{t("tahaddi.results")}</p>
          </div>
          <div className="w-9" />
        </div>

        {/* Stars */}
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="text-center py-4">
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3].map(i => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: i * 0.2, type: "spring" }}
              >
                <Star
                  size={isChildMode ? 48 : 40}
                  className={`${i <= s.starsEarned ? "text-secondary fill-secondary" : "text-muted"}`}
                />
              </motion.div>
            ))}
          </div>

          <p className={`${isChildMode ? "text-2xl" : "text-xl"} font-bold text-foreground`}>
            {s.starsEarned === 3 ? (isChildMode ? "🌟 " : "") + t("tahaddi.excellent") :
             s.starsEarned === 2 ? t("tahaddi.good") : t("tahaddi.keepPracticing")}
          </p>

          <p className="text-sm text-muted-foreground mt-1">
            {s.revealedCount}/{s.totalAyahs} {t("tahaddi.ayahsRevealed")}
          </p>
        </motion.div>

        {/* XP + badges */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-primary/10 rounded-2xl p-4 text-center">
            <Zap size={24} className="text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-primary">+{s.xpEarned}</p>
            <p className="text-[10px] text-muted-foreground">XP</p>
          </motion.div>

          {s.perfectPage && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="bg-secondary/10 rounded-2xl p-4 text-center">
              <Trophy size={24} className="text-secondary mx-auto mb-1" />
              <p className="text-xs font-bold text-secondary">{t("tahaddi.perfectBadge")}</p>
              <p className="text-[10px] text-muted-foreground">{t("tahaddi.perfectDesc")}</p>
            </motion.div>
          )}
        </div>

        {/* Stats */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t("tahaddi.stats")}</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-lg font-bold text-foreground">{s.totalAttempts}</p>
              <p className="text-[10px] text-muted-foreground">{t("tahaddi.totalAttempts")}</p>
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{formatTimer(s.durationSeconds)}</p>
              <p className="text-[10px] text-muted-foreground">{t("tahaddi.duration")}</p>
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{session.config?.similarityThreshold}%</p>
              <p className="text-[10px] text-muted-foreground">{t("tahaddi.threshold")}</p>
            </div>
          </div>
        </div>

        {/* Per-ayah details */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t("tahaddi.detail")}</p>
          <div className="space-y-2">
            {s.ayahStates.map((state) => {
              const ayah = surah.ayahs[state.ayahIndex];
              return (
                <div key={state.ayahIndex} className="flex items-center gap-3 p-2 rounded-xl bg-muted/50">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    state.status === "revealed" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
                  }`}>
                    {state.status === "revealed" ? "✓" : "✗"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="arabic-text text-sm text-foreground truncate">{ayah.arabic}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {state.attemptsCount} {t("tahaddi.attempts")} · {state.bestSimilarity}%
                      {state.hintUsed ? ` · ${t("tahaddi.hintUsed")}` : ""}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2 pb-6">
          <button onClick={() => { session.resetSession(); setShowConfetti(false); setScreen("setup"); }}
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
