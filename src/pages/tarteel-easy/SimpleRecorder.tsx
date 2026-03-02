import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useXP } from "@/hooks/useXP";
import { HelpCircle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { getSurahText, normalizeArabic, splitArabicText } from "@/utils/arabicUtils";
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

export default function SimpleRecorder({ surahNumber, onScore, onLiveTranscript, onVerseVerified, onRecordingStart, onRecordingStop }: SimpleRecorderProps) {
  const { t } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const chunksRef = useRef<BlobPart[]>([]);
  const speechRecRef = useRef<SpeechRecognition | null>(null);
  const keepListeningRef = useRef(false);
  const { addXP } = useXP();

  const getSupportedMimeType = () => {
    const types = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/mp4",
      "audio/aac",
      "",
    ];
    for (const type of types) {
      if (type === "" || MediaRecorder.isTypeSupported(type)) return type;
    }
    return "";
  };

  const updateAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    setAudioLevel(average / 255);
    animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      updateAudioLevel();

      const mimeType = getSupportedMimeType();
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType || undefined,
        audioBitsPerSecond: 128000,
      });

      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());
        audioContext.close().catch(() => {});

        if (blob.size === 0) {
          toast.error(t("tarteel.emptyRecording" as any));
          setIsAnalyzing(false);
          return;
        }
        await analyzeAudio(blob);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setRecordingTime(0);
      onRecordingStart?.();

      // Start native SpeechRecognition for live transcription
      startLiveSpeechRecognition();

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 120) {
            stopRecording();
            return 120;
          }
          return prev + 1;
        });
      }, 1000);

      toast.success(t("tarteel.recordingStarted" as any));
    } catch (err) {
      console.error("Mic error:", err);
      toast.error(t("tarteel.micError" as any));
      setShowHelp(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setIsAnalyzing(true);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const analyzeAudio = async (_blob: Blob) => {
    // TODO: replace with real API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Utiliser la sourate sélectionnée (pas hardcodé)
    const mockExpected = getSurahText(surahNumber);
    const allWords = splitArabicText(mockExpected);
    const detectedWordCount = Math.floor(allWords.length * (0.6 + Math.random() * 0.2));
    const mockDetected = allWords.slice(0, detectedWordCount).join(" ");

    const expectedWords = splitArabicText(mockExpected);
    const detectedWords = splitArabicText(mockDetected);

    const matches = expectedWords.map((word, i) => ({
      word,
      correct: i < detectedWords.length
        ? normalizeArabic(word) === normalizeArabic(detectedWords[i])
        : false,
    }));

    const correctCount = matches.filter((m) => m.correct).length;
    const score = Math.round((correctCount / expectedWords.length) * 100);

    const mockTranscription: TranscriptionData = {
      detected: mockDetected,
      expected: mockExpected,
      score,
      matches,
    };

    addXP(10);
    setIsAnalyzing(false);
    onScore(score, mockTranscription);
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
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
