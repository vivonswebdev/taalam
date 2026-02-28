import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import useAntiDoubleAudio from "@/hooks/useAntiDoubleAudio";
import { analyzeAyahTajwid } from "@/data/tajwidRules";
import { motion } from "framer-motion";
import {
  Mic, MicOff, RotateCcw, AlertCircle, Volume2, ArrowLeft, Server,
} from "lucide-react";
import { type Surah } from "@/data/surahs";
import { Switch } from "@/components/ui/switch";
import {
  useVoiceRecognition,
  compareSurahDictation,
} from "@/hooks/useVoiceRecognition";
import { useLiveWordFeedback } from "@/hooks/useLiveWordFeedback";
import { useLanguage } from "@/hooks/useLanguage";
import { useXP } from "@/hooks/useXP";
import ProgressBarDuolingo from "@/components/ProgressBarDuolingo";
import ReciterPicker, { getStoredReciter, type ReciterOption } from "@/components/ReciterPicker";
import AyahFeedback, { type FeedbackWord } from "@/components/AyahFeedback";

interface DictationModeProps {
  surah: Surah;
  onBack: () => void;
  isChildMode: boolean;
  onRequestNextSurah?: () => void;
}

// Per-ayah phases
type AyahPhase = "listen" | "recite" | "recording" | "feedback" | "complete";

export default function DictationMode({ surah, onBack, isChildMode, onRequestNextSurah }: DictationModeProps) {
  const { t } = useLanguage();
  const { playSafely: safePlay } = useAntiDoubleAudio();
  const xp = useXP();

  const [currentAyahIdx, setCurrentAyahIdx] = useState(0);
  const [ayahPhase, setAyahPhase] = useState<AyahPhase>("listen");
  const [hasListened, setHasListened] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [micError, setMicError] = useState<string | null>(null);
  const [pendingStop, setPendingStop] = useState(false);
  const [feedbackWords, setFeedbackWords] = useState<FeedbackWord[]>([]);
  const [feedbackScore, setFeedbackScore] = useState(0);
  const [simpleExplanation, setSimpleExplanation] = useState<string>("");
  const [reciter, setReciter] = useState<ReciterOption>(getStoredReciter);
  const [completedAyahs, setCompletedAyahs] = useState<Set<number>>(new Set());
  const [forceServerSTT, setForceServerSTT] = useState(() => {
    try { return localStorage.getItem("dictation_force_server") === "true"; } catch { return false; }
  });
  const preListenAudioRef = useRef<HTMLAudioElement | null>(null);
  const xpAwardedRef = useRef<Set<number>>(new Set());

  const currentAyah = surah.ayahs[currentAyahIdx];
  const totalAyahs = surah.ayahs.length;
  const progress = Math.round((completedAyahs.size / totalAyahs) * 100);

  // Single-ayah arrays for live feedback
  const singleAyahTexts = useMemo(() => currentAyah ? [currentAyah.arabic] : [], [currentAyah]);
  const { liveWords, totalMatched } = useLiveWordFeedback(singleAyahTexts, liveTranscript);

  const voice = useVoiceRecognition({
    lang: "ar-SA",
    continuous: true,
    forceServer: forceServerSTT,
    onResult: (transcript) => {
      setLiveTranscript(transcript);
    },
    onError: (error) => {
      if (error === "not-allowed") setMicError("not-allowed");
      if (error === "mic-error" || error === "auth-required") setMicError("mic-error");
    },
  });

  // ─── Listen to current ayah ───
  const playCurrentAyah = useCallback(() => {
    if (!currentAyah) return;
    // Stop any existing audio
    if (preListenAudioRef.current) {
      preListenAudioRef.current.pause();
      preListenAudioRef.current = null;
    }
    fetch(`https://api.alquran.cloud/v1/ayah/${surah.number}:${currentAyah.number}/${reciter.apiEdition}`)
      .then(r => r.json())
      .then(data => {
        if (data.data?.audio) {
          const audio = new Audio(data.data.audio);
          preListenAudioRef.current = audio;
          audio.onended = () => {
            preListenAudioRef.current = null;
            setHasListened(true);
          };
          audio.play().catch(() => setHasListened(true));
        } else {
          setHasListened(true);
        }
      })
      .catch(() => setHasListened(true));
  }, [surah.number, currentAyah, reciter]);

  // ─── Start recording ───
  const startRecording = useCallback(() => {
    setLiveTranscript("");
    setMicError(null);
    setPendingStop(false);
    setAyahPhase("recording");
    voice.start();
  }, [voice]);

  const finalizeRecording = useCallback(() => {
    if (!currentAyah) return;

    const result = compareSurahDictation([currentAyah.arabic], liveTranscript);
    const words: FeedbackWord[] = result.wordResults.map(wr => ({
      word: wr.word,
      status: wr.status === "correct" ? "correct"
        : wr.status === "missing" ? "missing"
        : wr.status === "extra" ? "incorrect"
        : "incorrect",
    }));

    const correctCount = words.filter(w => w.status === "correct").length;
    const totalWords = currentAyah.arabic.split(/\s+/).filter(Boolean).length;
    const score = Math.round((correctCount / Math.max(1, totalWords)) * 100);

    setFeedbackWords(words);
    setFeedbackScore(score);
    setAyahPhase("feedback");

    if (!xpAwardedRef.current.has(currentAyahIdx) && score >= 50) {
      xpAwardedRef.current.add(currentAyahIdx);
      xp.addXP(Math.max(1, Math.round(correctCount / 3)));
    }

    fetchSimpleExplanation(surah.number, currentAyah.number);
  }, [currentAyah, liveTranscript, currentAyahIdx, surah.number, xp]);

  // ─── Stop recording and compute feedback ───
  const stopRecording = useCallback(() => {
    if (!currentAyah) return;
    setPendingStop(true);
    voice.stop();
  }, [voice, currentAyah]);

  useEffect(() => {
    if (!pendingStop || ayahPhase !== "recording" || voice.isListening) return;
    setPendingStop(false);
    finalizeRecording();
  }, [pendingStop, ayahPhase, voice.isListening, finalizeRecording]);

  // ─── Fetch 1-line explanation from translation ───
  const fetchSimpleExplanation = useCallback((surahNum: number, ayahNum: number) => {
    setSimpleExplanation("");
    fetch(`https://api.alquran.cloud/v1/ayah/${surahNum}:${ayahNum}/fr.hamidullah`)
      .then(r => r.json())
      .then(data => {
        if (data.data?.text) {
          // Truncate to ~120 chars
          const text = data.data.text;
          setSimpleExplanation(text.length > 120 ? text.substring(0, 117) + "…" : text);
        }
      })
      .catch(() => {});
  }, []);

  // ─── Retry same ayah ───
  const retryAyah = useCallback(() => {
    setLiveTranscript("");
    setPendingStop(false);
    setFeedbackWords([]);
    setFeedbackScore(0);
    setSimpleExplanation("");
    setHasListened(false);
    setAyahPhase("listen");
  }, []);

  // ─── Move to next ayah ───
  const nextAyah = useCallback(() => {
    setCompletedAyahs(prev => new Set(prev).add(currentAyahIdx));
    if (currentAyahIdx + 1 >= totalAyahs) {
      setAyahPhase("complete");
    } else {
      setCurrentAyahIdx(prev => prev + 1);
      setLiveTranscript("");
      setPendingStop(false);
      setFeedbackWords([]);
      setFeedbackScore(0);
      setSimpleExplanation("");
      setHasListened(false);
      setAyahPhase("listen");
    }
  }, [currentAyahIdx, totalAyahs]);

  // Auto-advance after feedback (1s delay)
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (ayahPhase === "feedback") {
      autoAdvanceRef.current = setTimeout(() => {
        nextAyah();
      }, 1000);
    }
    return () => {
      if (autoAdvanceRef.current) { clearTimeout(autoAdvanceRef.current); autoAdvanceRef.current = null; }
    };
  }, [ayahPhase, nextAyah]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (preListenAudioRef.current) {
        preListenAudioRef.current.pause();
        preListenAudioRef.current = null;
      }
    };
  }, []);

  const getLiveWordColor = (status: string) => {
    switch (status) {
      case "correct": return "text-success bg-success/10";
      case "almost": return "text-warning bg-warning/10";
      case "incorrect": return "text-destructive bg-destructive/10";
      case "pending": return "text-transparent select-none";
      default: return "text-muted-foreground/40";
    }
  };

  if (!currentAyah && ayahPhase !== "complete") return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <p className="font-arabic text-2xl text-primary">{surah.nameArabic}</p>
        <p className="text-xs text-muted-foreground">
          {t("dictation.title")} · {t("detail.verse")} {currentAyahIdx + 1}/{totalAyahs}
        </p>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-3 px-1">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="text-xs font-mono text-muted-foreground">{progress}%</span>
      </div>

      {/* Reciter picker */}
      {ayahPhase === "listen" && <ReciterPicker selected={reciter} onChange={setReciter} compact />}

      {/* ═══ LISTEN PHASE ═══ */}
      {ayahPhase === "listen" && currentAyah && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Step label */}
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">1</span>
            <span className="text-sm font-bold text-foreground">{t("dictation.step1Title")}</span>
          </div>

          <p className="text-xs text-muted-foreground text-center">{t("dictation.step1Desc")}</p>

          {/* Ayah text with Tajwid */}
          <div className="bg-card border border-border rounded-2xl p-5" dir="rtl">
            <div className="arabic-text text-xl leading-[3] text-center">
              {(() => {
                const tajwidWords = analyzeAyahTajwid(currentAyah.arabic);
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
            </div>
          </div>

          {/* Listen + Skip buttons */}
          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={playCurrentAyah}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm"
            >
              <Volume2 size={18} />
              {t("dictation.listenVerse")}
            </motion.button>
            <button
              onClick={() => { setHasListened(true); setAyahPhase("recite"); }}
              className="px-5 py-3.5 rounded-2xl border-2 border-border text-foreground font-semibold text-sm"
            >
              {t("dictation.skip")}
            </button>
          </div>

          {/* If listened, show step 2 prompt */}
          {hasListened && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">2</span>
                <span className="text-sm font-bold text-foreground">{t("dictation.step2Title")}</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">{t("dictation.step2Desc")}</p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={startRecording}
                className={`w-full flex items-center justify-center gap-3 ${isChildMode ? "py-5 text-xl" : "py-4 text-lg"} rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20`}
              >
                <Mic size={24} />
                {t("dictation.startReciting")}
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* ═══ RECITE PHASE (ready to record) ═══ */}
      {ayahPhase === "recite" && currentAyah && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">2</span>
            <span className="text-sm font-bold text-foreground">{t("dictation.step2Title")}</span>
          </div>
          <p className="text-xs text-muted-foreground text-center">{t("dictation.step2Desc")}</p>

          {/* Ayah text */}
          <div className="bg-card border border-border rounded-2xl p-5" dir="rtl">
            <div className="arabic-text text-xl leading-[3] text-center">
              {analyzeAyahTajwid(currentAyah.arabic).map((tw, wi) => (
                <span key={wi} className="inline-block px-0.5"
                  style={tw.primaryColor ? { color: `hsl(${tw.primaryColor})` } : undefined}>
                  {tw.text}{" "}
                </span>
              ))}
            </div>
          </div>

          {micError && (
            <div className="bg-destructive/10 text-destructive rounded-xl p-4 text-center space-y-2">
              <AlertCircle size={20} className="inline" />
              <p className="text-sm font-semibold">
                {micError === "not-allowed" ? t("aya.micDenied") : "Micro indisponible pour la dictée"}
              </p>
              <p className="text-xs opacity-80">
                {micError === "not-allowed" ? t("aya.micDeniedHint") : "Réessaie en autorisant le micro puis recommence le verset."}
              </p>
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={startRecording}
            className={`w-full flex items-center justify-center gap-3 ${isChildMode ? "py-5 text-xl" : "py-4 text-lg"} rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20`}
          >
            <Mic size={24} />
            {t("dictation.startReciting")}
          </motion.button>
        </motion.div>
      )}

      {/* ═══ RECORDING PHASE ═══ */}
      {ayahPhase === "recording" && currentAyah && (
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
            <span className="text-xs text-muted-foreground">{t("dictation.reciteNow")}</span>
          </div>

          {/* Ayah with live word reveal */}
          <div className="bg-card border border-border rounded-2xl p-5" dir="rtl">
            <div className="arabic-text text-xl leading-[3] text-center">
              {(() => {
                const words = currentAyah.arabic.split(/\s+/).filter(Boolean);
                const ayahLiveWords = liveWords[0] || [];
                return words.map((word, wi) => {
                  const lw = ayahLiveWords[wi];
                  const status = lw?.status || "pending";
                  const isPending = status === "pending";
                  return (
                    <motion.span
                      key={wi}
                      initial={!isPending ? { scale: 1.1 } : false}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      className={`inline-block px-1 py-0.5 mx-0.5 rounded-md transition-colors duration-300 ${
                        isPending ? "text-transparent select-none bg-muted/30" : getLiveWordColor(status)
                      }`}
                    >
                      {isPending ? "████" : word}
                    </motion.span>
                  );
                });
              })()}
            </div>
          </div>

          {/* Live progress */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                animate={{ width: `${(totalMatched / Math.max(1, currentAyah.arabic.split(/\s+/).filter(Boolean).length)) * 100}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              {totalMatched}/{currentAyah.arabic.split(/\s+/).filter(Boolean).length}
            </span>
          </div>

          {/* Stop button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={stopRecording}
            className={`w-full flex items-center justify-center gap-3 ${isChildMode ? "py-5 text-xl" : "py-4 text-lg"} rounded-2xl bg-destructive text-destructive-foreground font-bold animate-pulse`}
          >
            <MicOff size={24} />
            {t("dictation.stopReciting")}
          </motion.button>
        </motion.div>
      )}

      {/* ═══ FEEDBACK PHASE ═══ */}
      {ayahPhase === "feedback" && currentAyah && (
        <AyahFeedback
          ayahText={currentAyah.arabic}
          wordStatuses={feedbackWords}
          score={feedbackScore}
          simpleExplanation={simpleExplanation}
          onRetry={retryAyah}
          onNext={nextAyah}
          onListenAyah={() => {
            fetch(`https://api.alquran.cloud/v1/ayah/${surah.number}:${currentAyah.number}/${reciter.apiEdition}`)
              .then(r => r.json())
              .then(data => { if (data.data?.audio) safePlay(data.data.audio); })
              .catch(() => {});
          }}
          isLastAyah={currentAyahIdx + 1 >= totalAyahs}
          isChildMode={isChildMode}
        />
      )}

      {/* ═══ COMPLETE PHASE ═══ */}
      {ayahPhase === "complete" && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5 text-center py-6">
          <span className="text-5xl">🎉</span>
          <h2 className={`${isChildMode ? "text-2xl" : "text-xl"} font-bold text-foreground`}>
            {t("dictation.surahComplete")}
          </h2>
          <p className="text-sm text-muted-foreground">{t("dictation.surahCompleteDesc")}</p>

          {/* XP Bar */}
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

          <div className="flex gap-3 pt-2">
            <button onClick={() => {
              setCurrentAyahIdx(0);
              setCompletedAyahs(new Set());
              xpAwardedRef.current = new Set();
              retryAyah();
            }}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-border text-foreground font-semibold">
              <RotateCcw size={18} />
              {t("dictation.restart")}
            </button>
            {onRequestNextSurah && (
              <button onClick={onRequestNextSurah}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold">
                {t("recitation.changeSurah")} →
              </button>
            )}
          </div>

          <button onClick={onBack} className="w-full py-3 text-sm text-muted-foreground underline">
            ← {t("detail.back")}
          </button>
        </motion.div>
      )}
    </div>
  );
}
