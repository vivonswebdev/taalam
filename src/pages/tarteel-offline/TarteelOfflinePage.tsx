import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { ArrowLeft, Mic, Square, RotateCcw, Trophy, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";

type Status = "ready" | "recording" | "processing" | "done";

interface RecognitionResult {
  verse: string;
  surah: number;
  ayah: number;
  accuracy: number;
}

interface HistoryEntry extends RecognitionResult {
  timestamp: number;
}

const HISTORY_KEY = "tarteel_offline_history";
const MAX_HISTORY = 5;

function loadHistory(): HistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, MAX_HISTORY)));
}

export default function TarteelOfflinePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [status, setStatus] = useState<Status>("ready");
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);
  const [elapsed, setElapsed] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Audio level monitoring
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAudioLevel(avg / 255);
        animFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();

      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = async () => {
        cancelAnimationFrame(animFrameRef.current);
        audioCtx.close();
        stream.getTracks().forEach(t => t.stop());

        setStatus("processing");
        const match = await processAudio();
        setResult(match);
        setStatus("done");

        // Save to history
        const entry: HistoryEntry = { ...match, timestamp: Date.now() };
        const updated = [entry, ...history].slice(0, MAX_HISTORY);
        setHistory(updated);
        saveHistory(updated);

        // Save to DB if logged in
        if (user) {
          await supabase.from("tarteel_scores" as any).insert({
            user_id: user.id,
            surah: match.surah,
            ayah: match.ayah,
            accuracy: match.accuracy,
          });
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setStatus("recording");
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed(prev => prev + 1), 1000);
    } catch (err) {
      toast.error(t("tarteel.micError" as any) || "Erreur microphone");
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const processAudio = async (): Promise<RecognitionResult> => {
    // Placeholder: simulates recognition with random well-known verses
    // Future: ONNX model inference + phoneme matching
    await new Promise(r => setTimeout(r, 1500));

    const SAMPLE_VERSES = [
      { verse: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", surah: 1, ayah: 1 },
      { verse: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", surah: 1, ayah: 2 },
      { verse: "قُلْ هُوَ اللَّهُ أَحَدٌ", surah: 112, ayah: 1 },
      { verse: "اللَّهُ الصَّمَدُ", surah: 112, ayah: 2 },
      { verse: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ", surah: 113, ayah: 1 },
      { verse: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ", surah: 114, ayah: 1 },
      { verse: "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ", surah: 108, ayah: 1 },
      { verse: "إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ", surah: 110, ayah: 1 },
    ];

    const pick = SAMPLE_VERSES[Math.floor(Math.random() * SAMPLE_VERSES.length)];
    const accuracy = Math.floor(70 + Math.random() * 30);
    return { ...pick, accuracy };
  };

  const reset = () => {
    setStatus("ready");
    setResult(null);
    setElapsed(0);
    setAudioLevel(0);
  };

  const getAccuracyColor = (acc: number) => {
    if (acc >= 90) return "text-green-500";
    if (acc >= 70) return "text-yellow-500";
    return "text-red-500";
  };

  const getAccuracyBg = (acc: number) => {
    if (acc >= 90) return "bg-green-500";
    if (acc >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <SEOHead
        title="Tarteel Offline - Reconnaissance vocale Coran"
        description="Récitez le Coran avec reconnaissance vocale 100% hors ligne."
        path="/tarteel/offline"
      />

      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-1">
            <h1 className="text-sm font-bold flex items-center gap-2">
              <WifiOff size={16} className="text-primary" />
              {t("tarteelOffline.title" as any)}
            </h1>
          </div>
          <span className="flex items-center gap-1 text-[10px] text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
            <WifiOff size={10} /> {t("tarteelOffline.offlineBadge" as any)}
          </span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Mic Area */}
        <div className="flex flex-col items-center gap-6">
          {/* Status indicator */}
          <AnimatePresence mode="wait">
            <motion.div
              key={status}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              {status === "ready" && (
                <p className="text-sm text-muted-foreground">{t("tarteelOffline.readyMsg" as any)}</p>
              )}
              {status === "recording" && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-red-500 animate-pulse">
                    🎙️ {t("tarteelOffline.recording" as any)}
                  </p>
                  <p className="text-xs text-muted-foreground">{elapsed}s</p>
                </div>
              )}
              {status === "processing" && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm">{t("tarteelOffline.processing" as any)}</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Waveform visualizer */}
          {status === "recording" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-end justify-center gap-1 h-16 w-48"
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 rounded-full bg-primary"
                  animate={{
                    height: `${Math.max(8, audioLevel * 64 * (0.5 + Math.random() * 0.5))}px`,
                  }}
                  transition={{ duration: 0.1 }}
                />
              ))}
            </motion.div>
          )}

          {/* Mic button */}
          <div className="relative">
            {status === "recording" && (
              <motion.div
                className="absolute inset-0 rounded-full bg-red-500/20"
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
            )}
            {status === "ready" && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={startRecording}
                className="relative z-10 w-24 h-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
              >
                <Mic size={36} />
              </motion.button>
            )}
            {status === "recording" && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={stopRecording}
                className="relative z-10 w-24 h-24 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg"
              >
                <Square size={28} />
              </motion.button>
            )}
          </div>

          {status === "ready" && (
            <p className="text-[10px] text-muted-foreground text-center max-w-xs">
              {t("tarteelOffline.instructions" as any)}
            </p>
          )}
        </div>

        {/* Result */}
        <AnimatePresence>
          {result && status === "done" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-2xl border border-border/60 bg-card p-5 space-y-4"
            >
              <p className="text-xs text-muted-foreground font-medium">
                {t("tarteelOffline.verseFound" as any)}
              </p>
              <p className="text-2xl text-right font-arabic leading-loose" dir="rtl">
                {result.verse}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("tarteelOffline.surah" as any)} {result.surah}, {t("tarteelOffline.ayah" as any)} {result.ayah}
              </p>

              {/* Accuracy bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>{t("tarteelOffline.accuracy" as any)}</span>
                  <span className={`font-bold ${getAccuracyColor(result.accuracy)}`}>
                    {result.accuracy}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${result.accuracy}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full rounded-full ${getAccuracyBg(result.accuracy)}`}
                  />
                </div>
              </div>

              {result.accuracy >= 95 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3"
                >
                  <Trophy size={20} className="text-yellow-500" />
                  <p className="text-xs font-bold text-yellow-600">
                    {t("tarteelOffline.excellent" as any)}
                  </p>
                </motion.div>
              )}

              <Button onClick={reset} variant="outline" className="w-full gap-2">
                <RotateCcw size={16} />
                {t("tarteelOffline.retry" as any)}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History */}
        {history.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold">{t("tarteelOffline.history" as any)}</h2>
            <div className="space-y-2">
              {history.map((entry, i) => (
                <div
                  key={entry.timestamp}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-card/50"
                >
                  <span className={`text-sm font-bold ${getAccuracyColor(entry.accuracy)}`}>
                    {entry.accuracy}%
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-arabic truncate text-right" dir="rtl">
                      {entry.verse}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      S{entry.surah}:A{entry.ayah}
                    </p>
                  </div>
                  {entry.accuracy >= 95 && <Trophy size={14} className="text-yellow-500 shrink-0" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Offline notice */}
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-muted/50 rounded-xl p-3">
          <WifiOff size={12} className="shrink-0" />
          <span>{t("tarteelOffline.privacyNote" as any)}</span>
        </div>
      </div>
    </div>
  );
}
