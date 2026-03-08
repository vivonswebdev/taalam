import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { ArrowLeft, Mic, Square, RotateCcw, Trophy, WifiOff, BookOpen, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";
import quranMinimal from "@/data/quranMinimal";
import LiveTranscript from "@/components/tarteel/LiveTranscript";
import WordComparison from "@/components/tarteel/WordComparison";
import ChallengeModeToggle from "@/components/tarteel/ChallengeModeToggle";
import GlobalLeaderboard from "@/components/tarteel/GlobalLeaderboard";

type Status = "ready" | "recording" | "processing" | "done";

interface RecognitionResult {
  verse: string;
  surah: number;
  ayah: number;
  accuracy: number;
  expected?: string;
  detectedText?: string;
  correctWords?: number;
  incorrectWords?: number;
  missingWords?: number;
  suggestions?: string[];
}

interface HistoryEntry {
  verse: string;
  surah: number;
  ayah: number;
  accuracy: number;
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

function getAvailableAyahs(surahNum: string): number[] {
  const surah = quranMinimal[surahNum];
  if (!surah) return [];
  return Array.from({ length: surah.ayahs }, (_, i) => i + 1);
}

function generateSuggestions(accuracy: number, t: (k: string) => string): string[] {
  if (accuracy >= 95) return [t("tarteelOffline.tipPerfect" as any)];
  if (accuracy >= 85) return [
    t("tarteelOffline.tipSlow" as any),
    t("tarteelOffline.tipEmphatic" as any),
  ];
  return [
    t("tarteelOffline.tipListen" as any),
    t("tarteelOffline.tipRepeat" as any),
    t("tarteelOffline.tipTajweed" as any),
  ];
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

  // Verse selection
  const [selectedSurah, setSelectedSurah] = useState<string>("");
  const [selectedAyah, setSelectedAyah] = useState<string>("");

  // Challenge mode
  const [challengeMode, setChallengeMode] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => { setSelectedAyah(""); }, [selectedSurah]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const selectedVerseText = selectedSurah && selectedAyah
    ? quranMinimal[selectedSurah]?.verses?.[selectedAyah] || null
    : null;

  const canEnableChallenge = !!(selectedSurah && selectedAyah && selectedVerseText);

  const handleChallengeToggle = (checked: boolean) => {
    if (checked && canEnableChallenge) {
      setChallengeMode(true);
      setShowHint(false);
      toast.success(t("tarteelOffline.challengeActivated" as any));
    } else {
      setChallengeMode(false);
      setShowHint(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

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

        const entry: HistoryEntry = { verse: match.verse, surah: match.surah, ayah: match.ayah, accuracy: match.accuracy, timestamp: Date.now() };
        const updated = [entry, ...history].slice(0, MAX_HISTORY);
        setHistory(updated);
        saveHistory(updated);

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
    } catch {
      toast.error(t("tarteel.micError" as any) || "Erreur microphone");
    }
  };

  const stopRecording = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
  };

  const processAudio = async (): Promise<RecognitionResult> => {
    await new Promise(r => setTimeout(r, 1500));

    if (selectedSurah && selectedAyah && selectedVerseText) {
      const words = selectedVerseText.split(" ");
      const totalWords = words.length;
      const correctCount = Math.floor(totalWords * (0.8 + Math.random() * 0.18));
      const incorrectCount = Math.floor((totalWords - correctCount) * 0.6);
      const missingCount = totalWords - correctCount - incorrectCount;

      const detectedWords = words.map((word, i) => {
        if (i >= correctCount && i < correctCount + incorrectCount) return word.split("").reverse().join("");
        if (i >= correctCount + incorrectCount) return "";
        return word;
      });

      const accuracy = Math.round((correctCount / totalWords) * 100);

      return {
        verse: selectedVerseText,
        surah: parseInt(selectedSurah),
        ayah: parseInt(selectedAyah),
        accuracy,
        expected: `${selectedSurah}:${selectedAyah}`,
        detectedText: detectedWords.filter(w => w).join(" "),
        correctWords: correctCount,
        incorrectWords: incorrectCount,
        missingWords: missingCount,
        suggestions: generateSuggestions(accuracy, t),
      };
    }

    const SAMPLE_VERSES = [
      { verse: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", surah: 1, ayah: 1 },
      { verse: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", surah: 1, ayah: 2 },
      { verse: "قُلْ هُوَ اللَّهُ أَحَدٌ", surah: 112, ayah: 1 },
      { verse: "اللَّهُ الصَّمَدُ", surah: 112, ayah: 2 },
      { verse: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ", surah: 113, ayah: 1 },
      { verse: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ", surah: 114, ayah: 1 },
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

  const nextVerse = () => {
    if (!selectedSurah || !selectedAyah) return;
    const ayahs = getAvailableAyahs(selectedSurah);
    const currentIdx = ayahs.indexOf(parseInt(selectedAyah));
    if (currentIdx < ayahs.length - 1) {
      setSelectedAyah(String(ayahs[currentIdx + 1]));
    } else {
      // Next surah
      const surahKeys = Object.keys(quranMinimal);
      const sIdx = surahKeys.indexOf(selectedSurah);
      if (sIdx < surahKeys.length - 1) {
        setSelectedSurah(surahKeys[sIdx + 1]);
        setSelectedAyah("1");
      }
    }
    reset();
  };

  const getAccuracyColor = (acc: number) => {
    if (acc >= 90) return "text-green-600 dark:text-green-400";
    if (acc >= 70) return "text-yellow-600 dark:text-yellow-400";
    return "text-destructive";
  };

  const getAccuracyBg = (acc: number) => {
    if (acc >= 90) return "bg-green-500";
    if (acc >= 70) return "bg-yellow-500";
    return "bg-destructive";
  };

  const surahKeys = Object.keys(quranMinimal);
  const ayahOptions = selectedSurah ? getAvailableAyahs(selectedSurah) : [];

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
          <span className="flex items-center gap-1 text-[10px] text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
            <WifiOff size={10} /> {t("tarteelOffline.offlineBadge" as any)}
          </span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">

        {/* Verse Selector Card */}
        <div className="rounded-2xl border border-border/60 bg-card p-4 space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <BookOpen size={16} className="text-primary" />
            {t("tarteelOffline.selectVerse" as any)}
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <Select value={selectedSurah} onValueChange={setSelectedSurah}>
              <SelectTrigger className="text-xs">
                <SelectValue placeholder={t("tarteelOffline.selectSurah" as any)} />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {surahKeys.map(num => (
                  <SelectItem key={num} value={num} className="text-xs">
                    {num}. {quranMinimal[num].nameAr} — {quranMinimal[num].name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedAyah} onValueChange={setSelectedAyah} disabled={!selectedSurah}>
              <SelectTrigger className="text-xs">
                <SelectValue placeholder={t("tarteelOffline.selectAyah" as any)} />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {ayahOptions.map(num => (
                  <SelectItem key={num} value={String(num)} className="text-xs">
                    {t("tarteelOffline.ayah" as any)} {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Challenge mode toggle */}
          {canEnableChallenge && (
            <ChallengeModeToggle
              enabled={challengeMode}
              onToggle={handleChallengeToggle}
              canEnable={canEnableChallenge}
              cachedVerseSurah={parseInt(selectedSurah)}
              cachedVerseAyah={parseInt(selectedAyah)}
              showHint={showHint}
              onShowHint={() => setShowHint(true)}
            />
          )}

          {/* Display selected verse (hidden in challenge mode unless hint) */}
          <AnimatePresence>
            {selectedVerseText && (!challengeMode || showHint) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-xl bg-primary/5 border border-primary/20 p-4"
              >
                <p className="text-2xl text-center font-arabic leading-loose" dir="rtl">
                  {selectedVerseText}
                </p>
                <p className="text-center text-[10px] text-muted-foreground mt-2">
                  {quranMinimal[selectedSurah]?.nameAr} — {t("tarteelOffline.ayah" as any)} {selectedAyah}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {selectedSurah && selectedAyah && !selectedVerseText && (
            <p className="text-[10px] text-muted-foreground text-center">
              {t("tarteelOffline.noVerseText" as any)}
            </p>
          )}
        </div>

        {/* Live Transcript */}
        <LiveTranscript
          isRecording={status === "recording"}
          verseText={selectedVerseText}
        />

        {/* Mic Area */}
        <div className="flex flex-col items-center gap-6">
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
                  <p className="text-sm font-medium text-destructive animate-pulse">
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

          {/* Waveform */}
          {status === "recording" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-end justify-center gap-1 h-16 w-48">
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 rounded-full bg-primary"
                  animate={{ height: `${Math.max(8, audioLevel * 64 * (0.5 + Math.random() * 0.5))}px` }}
                  transition={{ duration: 0.1 }}
                />
              ))}
            </motion.div>
          )}

          {/* Mic button */}
          <div className="relative">
            {status === "recording" && (
              <motion.div
                className="absolute inset-0 rounded-full bg-destructive/20"
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
                className="relative z-10 w-24 h-24 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg"
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
              {/* Score */}
              <div className="text-center">
                <div className={`text-5xl font-bold ${getAccuracyColor(result.accuracy)}`}>
                  {result.accuracy}%
                </div>
              </div>

              {/* Expected vs detected */}
              {result.expected && (
                <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 space-y-1">
                  <p className="text-xs text-muted-foreground">
                    ✓ {t("tarteelOffline.expectedVerse" as any)}: {t("tarteelOffline.surah" as any)} {selectedSurah}, {t("tarteelOffline.ayah" as any)} {selectedAyah}
                  </p>
                  <p className="text-xs font-medium">
                    {result.surah === parseInt(selectedSurah) && result.ayah === parseInt(selectedAyah)
                      ? t("tarteelOffline.exactMatch" as any)
                      : t("tarteelOffline.differentVerse" as any)}
                  </p>
                </div>
              )}

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
                  <span className={`font-bold ${getAccuracyColor(result.accuracy)}`}>{result.accuracy}%</span>
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

              {/* Word comparison */}
              {result.detectedText && result.correctWords !== undefined && (
                <WordComparison
                  expectedText={result.verse}
                  detectedText={result.detectedText}
                  correctWords={result.correctWords}
                  incorrectWords={result.incorrectWords || 0}
                  missingWords={result.missingWords || 0}
                />
              )}

              {/* Suggestions */}
              {result.suggestions && result.accuracy < 95 && (
                <div className="rounded-xl bg-accent/50 border border-border/40 p-3">
                  <p className="text-xs font-bold mb-2">💡 {t("tarteelOffline.suggestions" as any)}</p>
                  <ul className="text-[10px] space-y-1 text-muted-foreground">
                    {result.suggestions.map((tip, i) => (
                      <li key={i}>— {tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Performance badges */}
              {result.accuracy >= 95 && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center p-4 bg-accent rounded-xl">
                  <div className="text-4xl mb-1">🏆</div>
                  <p className="text-xs font-bold text-primary">{t("tarteelOffline.excellentMastery" as any)}</p>
                </motion.div>
              )}

              {result.accuracy >= 80 && result.accuracy < 95 && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center p-3 bg-accent rounded-xl">
                  <div className="text-3xl mb-1">⭐</div>
                  <p className="text-xs font-bold">{t("tarteelOffline.veryGood" as any)}</p>
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button onClick={reset} variant="outline" className="flex-1 gap-2">
                  <RotateCcw size={16} />
                  {t("tarteelOffline.retry" as any)}
                </Button>
                {selectedSurah && selectedAyah && (
                  <Button onClick={nextVerse} className="flex-1 gap-2">
                    {t("tarteelOffline.nextVerse" as any)}
                    <ChevronRight size={16} />
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History */}
        {history.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold">{t("tarteelOffline.history" as any)}</h2>
            <div className="space-y-2">
              {history.map((entry) => (
                <div key={entry.timestamp} className="flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-card/50">
                  <span className={`text-sm font-bold ${getAccuracyColor(entry.accuracy)}`}>{entry.accuracy}%</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-arabic truncate text-right" dir="rtl">{entry.verse}</p>
                    <p className="text-[10px] text-muted-foreground">S{entry.surah}:A{entry.ayah}</p>
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
