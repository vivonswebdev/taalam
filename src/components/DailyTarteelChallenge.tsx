import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, X, CheckCircle2, XCircle, Trophy, Star, Sparkles, EyeOff } from "lucide-react";
import { type Surah } from "@/data/surahs";
import { useVoiceRecognition, compareSurahDictation } from "@/hooks/useVoiceRecognition";
import { useLiveWordFeedback, type LiveWordStatus } from "@/hooks/useLiveWordFeedback";
import { useLanguage } from "@/hooks/useLanguage";
import { useQuranXp } from "@/hooks/useQuranXp";
import { useSound } from "@/hooks/useSound";
import Confetti from "@/components/Confetti";

interface Props {
  surah: Surah;
  onComplete: (score: number) => void;
  onDismiss: () => void;
}

type Phase = "intro" | "recording" | "result";

const getLiveWordColor = (status: LiveWordStatus) => {
  switch (status) {
    case "correct": return "text-success bg-success/10";
    case "almost": return "text-warning bg-warning/10";
    case "incorrect": return "text-destructive bg-destructive/10";
    case "pending": return "text-muted-foreground/40";
  }
};

export default function DailyTarteelChallenge({ surah, onComplete, onDismiss }: Props) {
  const { t } = useLanguage();
  const xp = useXP();
  const { play, vibrate } = useSound();
  const [phase, setPhase] = useState<Phase>("intro");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [finalScore, setFinalScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const xpAwardedRef = useRef(false);

  const allArabicTexts = surah.ayahs.map((a) => a.arabic);
  const { liveWords, totalMatched } = useLiveWordFeedback(allArabicTexts, liveTranscript);
  const totalWords = surah.ayahs.reduce((a, ay) => a + ay.arabic.split(/\s+/).filter(Boolean).length, 0);

  const voice = useVoiceRecognition({
    lang: "ar-SA",
    continuous: true,
    onResult: (transcript) => setLiveTranscript(transcript),
  });

  const handleStart = useCallback(() => {
    setPhase("recording");
    setLiveTranscript("");
    voice.start();
  }, [voice]);

  const handleStop = useCallback(() => {
    voice.stop();
    const result = compareSurahDictation(allArabicTexts, liveTranscript);
    setFinalScore(result.totalScore);
    setPhase("result");

    if (result.totalScore >= 70) {
      setShowConfetti(true);
      play("sessionComplete");
      vibrate([50, 30, 80]);
    } else {
      play("error");
    }
  }, [voice, allArabicTexts, liveTranscript]);

  // Award x2 XP for daily challenge
  const xpGain = Math.max(10, Math.round(finalScore / 2) * 2);

  useEffect(() => {
    if (phase === "result" && !xpAwardedRef.current) {
      xpAwardedRef.current = true;
      xp.addXP(xpGain);
    }
  }, [phase, finalScore]);

  const handleFinish = () => {
    onComplete(finalScore);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background/80 backdrop-blur-md"
          onClick={phase === "intro" ? onDismiss : undefined}
        />

        <Confetti active={showConfetti} />

        {/* Card */}
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative w-full max-w-lg mx-4 mb-4 sm:mb-0 bg-card border border-border rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Close button */}
          {phase === "intro" && (
            <button
              onClick={onDismiss}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>
          )}

          {/* ═══ INTRO ═══ */}
          {phase === "intro" && (
            <div className="p-6 text-center space-y-5">
              {/* Badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent-foreground flex items-center justify-center shadow-lg shadow-primary/30"
              >
                <span className="text-3xl">🎯</span>
              </motion.div>

              <div>
                <motion.h2
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-xl font-bold text-foreground"
                >
                  {t("daily.title")}
                </motion.h2>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-1.5 bg-secondary/15 text-secondary rounded-full px-3 py-1 mt-2 font-bold text-sm"
                >
                  <Star size={14} className="fill-secondary" />
                  x2 XP {t("daily.bonus")}
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm text-muted-foreground mt-1"
                >
                  {t("daily.subtitle")}
                </motion.p>
              </div>

              {/* Surah info */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-primary/5 border border-primary/10 rounded-2xl p-4"
              >
                <p className="font-arabic text-2xl text-primary">{surah.nameArabic}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {surah.frenchName} · {surah.versesCount} {t("detail.verses")}
                </p>
              </motion.div>

              {/* Progress bar placeholder */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="flex items-center gap-3"
              >
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-0 bg-primary rounded-full" />
                </div>
                <span className="text-xs text-muted-foreground font-mono">0/{surah.versesCount}</span>
              </motion.div>

              {/* Mushaf preview — full text visible before recording */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-card border border-border rounded-2xl p-4 max-h-40 overflow-y-auto text-right"
                dir="rtl"
              >
                {surah.ayahs.map((ayah, i) => (
                  <span key={i} className="inline">
                    <span className="arabic-text text-lg text-foreground leading-[3]">{ayah.arabic}</span>
                    <span className="inline-flex items-center mx-1">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold font-sans">
                        {ayah.number}
                      </span>
                    </span>
                    {i < surah.ayahs.length - 1 && <span className="text-muted-foreground mx-0.5">·</span>}
                  </span>
                ))}
              </motion.div>

              {/* Hide & Recite hint */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground"
              >
                <EyeOff size={12} />
                <span>{t("daily.hideHint")}</span>
              </motion.div>

              {/* CTA */}
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStart}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-primary to-accent-foreground text-primary-foreground font-bold text-lg shadow-lg shadow-primary/25"
              >
                <Mic size={22} />
                {t("daily.startButton")}
              </motion.button>
            </div>
          )}

          {/* ═══ RECORDING ═══ */}
          {phase === "recording" && (
            <div className="p-6 space-y-4">
              {/* Header */}
              <div className="text-center">
                <p className="font-arabic text-xl text-primary">{surah.nameArabic}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
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
              </div>

              {/* Hide & Recite: text hidden, reveals word-by-word */}
              <div className="bg-muted/30 border border-border rounded-2xl p-4 max-h-52 overflow-y-auto" dir="rtl">
                {surah.ayahs.map((ayah, i) => {
                  const words = ayah.arabic.split(/\s+/).filter(Boolean);
                  const ayahLiveWords = liveWords[i] || [];
                  return (
                    <span key={i} className="inline">
                      <span className="arabic-text text-xl leading-[3]">
                        {words.map((word, wi) => {
                          const lw = ayahLiveWords[wi];
                          const status = lw?.status || "pending";
                          const isRevealed = status !== "pending";
                          const colorClass = getLiveWordColor(status);
                          return (
                            <motion.span
                              key={wi}
                              initial={isRevealed ? { scale: 1.15, opacity: 0 } : false}
                              animate={isRevealed ? { scale: 1, opacity: 1 } : { scale: 1, opacity: 1 }}
                              transition={{ type: "spring", stiffness: 400, damping: 20 }}
                              className={`inline-block px-0.5 py-0.5 rounded-md transition-all duration-300 ${
                                isRevealed
                                  ? colorClass
                                  : "text-transparent bg-muted/60 select-none"
                              }`}
                            >
                              {isRevealed ? word : "████"}{" "}
                            </motion.span>
                          );
                        })}
                      </span>
                      <span className="inline-flex items-center mx-1">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold font-sans">
                          {ayah.number}
                        </span>
                      </span>
                      {i < surah.ayahs.length - 1 && <span className="text-muted-foreground mx-0.5">·</span>}
                    </span>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-success"><CheckCircle2 size={12} /> {t("dictation.legendCorrect")}</span>
                <span className="flex items-center gap-1 text-warning">⚠️ {t("daily.almost")}</span>
                <span className="flex items-center gap-1 text-destructive"><XCircle size={12} /> {t("dictation.legendIncorrect")}</span>
              </div>

              {/* Progress */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    animate={{ width: `${(totalMatched / Math.max(1, totalWords)) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <span className="text-xs text-muted-foreground font-mono">{totalMatched}/{totalWords}</span>
              </div>

              {/* Stop button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleStop}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-destructive text-destructive-foreground font-bold text-lg"
              >
                <Mic size={22} />
                {t("daily.stopButton")}
              </motion.button>
            </div>
          )}

          {/* ═══ RESULT ═══ */}
          {phase === "result" && (
            <div className="p-6 text-center space-y-5">
              {/* Score circle */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center ${
                  finalScore >= 90 ? "bg-success/15" : finalScore >= 70 ? "bg-primary/15" : finalScore >= 50 ? "bg-warning/15" : "bg-destructive/15"
                }`}
              >
                <div>
                  <p className={`text-3xl font-bold ${
                    finalScore >= 90 ? "text-success" : finalScore >= 70 ? "text-primary" : finalScore >= 50 ? "text-warning" : "text-destructive"
                  }`}>
                    {finalScore}%
                  </p>
                </div>
              </motion.div>

              {/* Message */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h3 className="text-lg font-bold text-foreground">
                  {finalScore >= 90 ? t("daily.excellent") : finalScore >= 70 ? t("daily.good") : finalScore >= 50 ? t("daily.notBad") : t("daily.tryAgain")}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {surah.nameArabic} · {surah.frenchName}
                </p>
              </motion.div>

              {/* XP earned with x2 badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="flex flex-col items-center gap-2"
              >
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2">
                  <Star size={16} className="fill-primary" />
                  <span className="font-bold text-sm">+{xpGain} XP</span>
                </div>
                <div className="inline-flex items-center gap-1.5 bg-secondary/15 text-secondary rounded-full px-3 py-1 text-xs font-bold">
                  🔥 x2 XP · {t("daily.challengeBadge")}
                </div>
              </motion.div>

              {/* Badges */}
              {finalScore >= 90 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center justify-center gap-2"
                >
                  <Trophy size={16} className="text-warning" />
                  <span className="text-sm font-semibold text-warning">{t("daily.perfectBadge")}</span>
                </motion.div>
              )}

              {/* CTA */}
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleFinish}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg"
              >
                <Sparkles size={20} />
                {t("daily.continue")}
              </motion.button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
