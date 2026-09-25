import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useXP } from "@/hooks/useXP";
import { HelpCircle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useVoiceRecognition, compareSurahDictation } from "@/hooks/useVoiceRecognition";
import { getSurahText } from "@/utils/arabicUtils";
import { getSurahAyahs } from "@/hooks/useMushafPageData";
import { stripLeadingBasmala } from "@/lib/arabicMatch";
import MicPermissionHelp from "./MicPermissionHelp";
import type { VerifiedVerse } from "./LiveTranscriptionPanel";

export interface TranscriptionData {
  detected: string;
  expected: string;
  score: number;
  matches: Array<{ word: string; correct: boolean }>;
}

interface SimpleRecorderProps {
  surahNumber: number;
  onScore: (score: number, transcription: TranscriptionData) => void;
  onLiveTranscript?: (text: string) => void;
  onVerseVerified?: (verse: VerifiedVerse) => void;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
}

const MAX_RECORDING_S = 120;
// Web Speech API doesn't fire onEnd after an explicit stop: don't wait forever
const FINAL_TRANSCRIPT_WAIT_MS = 1500;
export default function SimpleRecorder({ surahNumber, onScore, onLiveTranscript, onRecordingStart, onRecordingStop }: SimpleRecorderProps) {
  const { t } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  // Visual only: the mic is owned by the speech engine (native on iOS), so no analyser node
  const audioLevel = isRecording ? 0.35 : 0;

  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const finalizeTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const transcriptRef = useRef("");
  const awaitingResultRef = useRef(false);
  const engineStartedRef = useRef(false);
  const { addXP } = useXP();

  // Score the real transcript against the selected surah
  const analyze = useCallback(async () => {
    if (!awaitingResultRef.current) return;
    awaitingResultRef.current = false;
    if (finalizeTimerRef.current) clearTimeout(finalizeTimerRef.current);

    const detected = transcriptRef.current.trim();
    if (!detected) {
      toast.error(t("tarteel.emptyRecording" as any));
      setIsAnalyzing(false);
      return;
    }

    let ayahs: string[] = [];
    try {
      ayahs = await getSurahAyahs(surahNumber);
    } catch (e) {
      console.warn("[TarteelEasy] mushaf text unavailable:", e);
    }
    if (ayahs.length === 0) ayahs = [getSurahText(surahNumber)];
    const expected = ayahs.join(" ");
    const spoken = surahNumber === 1 ? detected : stripLeadingBasmala(detected);
    const { wordResults, totalScore } = compareSurahDictation(ayahs, spoken);
    const matches = wordResults
      .filter((r) => r.originalIndex !== undefined)
      .map((r) => ({ word: r.word, correct: r.status === "correct" }));

    addXP(10);
    setIsAnalyzing(false);
    onScore(totalScore, { detected, expected, score: totalScore, matches });
  }, [surahNumber, addXP, onScore, t]);

  const voice = useVoiceRecognition({
    lang: "ar-SA",
    continuous: true,
    onResult: (text) => {
      transcriptRef.current = text;
      onLiveTranscript?.(text);
    },
    onEnd: () => { void analyze(); },
    onError: (code) => {
      if (code === "not-allowed" || code === "mic-error" || code === "capacitor-error") {
        toast.error(t("tarteel.micError" as any));
        setShowHelp(true);
      }
    },
  });

  // The engine stopped by itself without us asking (permission refused, iOS error…)
  useEffect(() => {
    if (voice.isListening) {
      engineStartedRef.current = true;
      return;
    }
    if (isRecording && engineStartedRef.current && !awaitingResultRef.current) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsRecording(false);
      onRecordingStop?.();
      if (transcriptRef.current.trim()) {
        awaitingResultRef.current = true;
        setIsAnalyzing(true);
        void analyze();
      }
    }
  }, [voice.isListening, isRecording, analyze, onRecordingStop]);

  const startRecording = () => {
    transcriptRef.current = "";
    awaitingResultRef.current = false;
    engineStartedRef.current = false;
    voice.start();
    setIsRecording(true);
    setRecordingTime(0);
    onRecordingStart?.();

    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);

    toast.success(t("tarteel.recordingStarted" as any));
  };

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    awaitingResultRef.current = true;
    setIsRecording(false);
    setIsAnalyzing(true);
    onRecordingStop?.();
    voice.stop();
    finalizeTimerRef.current = setTimeout(() => { void analyze(); }, FINAL_TRANSCRIPT_WAIT_MS);
  }, [voice, analyze, onRecordingStop]);

  useEffect(() => {
    if (isRecording && recordingTime >= MAX_RECORDING_S) stopRecording();
  }, [isRecording, recordingTime, stopRecording]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (finalizeTimerRef.current) clearTimeout(finalizeTimerRef.current);
    };
  }, []);

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="text-5xl">
          🧠
        </motion.div>
        <p className="text-sm font-semibold">{t("tarteel.analyzing" as any)}</p>
        <p className="text-xs text-muted-foreground">
          {t("tarteel.duration" as any)}: {recordingTime}s
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center py-8 space-y-6">
        {/* Waveform */}
        <div className="h-24 w-full flex items-center justify-center">
          <AnimatePresence>
            {isRecording && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-end gap-[3px] h-20">
                {[...Array(20)].map((_, i) => {
                  const h = 20 + audioLevel * 60 + Math.sin(Date.now() / 100 + i) * 10;
                  return (
                    <motion.div
                      key={i}
                      className="w-1.5 rounded-full bg-primary"
                      animate={{ height: h }}
                      transition={{ duration: 0.05 }}
                    />
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Timer */}
        {isRecording && (
          <div className="text-center">
            <span className="text-2xl font-mono font-bold">
              {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, "0")}
            </span>
            <span className="text-xs text-muted-foreground ml-1">/2:00</span>
          </div>
        )}

        {/* Record button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={isRecording ? stopRecording : startRecording}
          className={`w-24 h-24 rounded-full text-4xl flex items-center justify-center transition-all shadow-xl ${
            isRecording
              ? "bg-destructive text-destructive-foreground animate-pulse shadow-destructive/40"
              : "bg-primary text-primary-foreground shadow-primary/40"
          }`}
        >
          {isRecording ? "⏹️" : "🎤"}
        </motion.button>

        <div className="text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            {isRecording ? t("tarteel.tapStop" as any) : t("tarteel.tapStart" as any)}
          </p>

          <button onClick={() => setShowHelp(true)} className="flex items-center gap-1.5 text-xs text-primary hover:underline mx-auto">
            <HelpCircle size={14} />
            {t("tarteel.micHelp" as any)}
          </button>
        </div>
      </div>

      <MicPermissionHelp open={showHelp} onClose={() => setShowHelp(false)} />
    </>
  );
}
