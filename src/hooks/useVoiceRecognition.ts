import { useState, useRef, useCallback, useEffect } from "react";

export interface WordResult {
  word: string;
  correct: boolean;
}

interface UseVoiceRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  onResult?: (transcript: string) => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

// ─── Constants ──────────────────────────────────────────────
const MAX_RECORDING_DURATION_MS = 60_000;
const TIMESLICE_MS = 2_000; // fire ondataavailable every 2s
const MIN_CHUNK_SIZE = 500; // ignore tiny blobs

export function useVoiceRecognition(options: UseVoiceRecognitionOptions = {}) {
  const { lang = "ar-SA", onResult, onEnd, onError } = options;
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const isListeningRef = useRef(false);
  const onResultRef = useRef(onResult);
  const onEndRef = useRef(onEnd);
  const onErrorRef = useRef(onError);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const maxDurationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transcriptRef = useRef("");
  const chunkQueueRef = useRef<Blob[]>([]);
  const isProcessingRef = useRef(false);

  useEffect(() => { onResultRef.current = onResult; }, [onResult]);
  useEffect(() => { onEndRef.current = onEnd; }, [onEnd]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  useEffect(() => {
    setIsSupported(!!navigator.mediaDevices?.getUserMedia);
  }, []);

  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      cleanup();
    };
  }, []);

  const cleanup = useCallback(() => {
    if (maxDurationTimeoutRef.current) {
      clearTimeout(maxDurationTimeoutRef.current);
      maxDurationTimeoutRef.current = null;
    }
    try {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    } catch {}
    try {
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    } catch {}
    mediaRecorderRef.current = null;
    mediaStreamRef.current = null;
  }, []);

  // Process queue sequentially so transcripts stay in order
  const processQueue = useCallback(async () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    while (chunkQueueRef.current.length > 0) {
      const blob = chunkQueueRef.current.shift()!;
      if (blob.size < MIN_CHUNK_SIZE) continue;

      try {
        const arrayBuffer = await blob.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(arrayBuffer).reduce((d, b) => d + String.fromCharCode(b), "")
        );

        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

        const res = await fetch(`${supabaseUrl}/functions/v1/stt-chunk`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseKey}`,
            "apikey": supabaseKey,
          },
          body: JSON.stringify({ audio: base64, lang: lang.split("-")[0] }),
        });

        const data = await res.json();
        if (data.text) {
          transcriptRef.current = (transcriptRef.current + " " + data.text).trim();
          setTranscript(transcriptRef.current);
          onResultRef.current?.(transcriptRef.current);
        }
      } catch (e) {
        console.warn("[VoiceRecognition] chunk STT error:", e);
      }
    }

    isProcessingRef.current = false;
  }, [lang]);

  const start = useCallback(async () => {
    setPermissionDenied(false);
    setTranscript("");
    transcriptRef.current = "";
    chunkQueueRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : MediaRecorder.isTypeSupported("audio/mp4")
            ? "audio/mp4"
            : "";

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunkQueueRef.current.push(e.data);
          processQueue();
        }
      };

      // Use timeslice to get chunks every 2s
      recorder.start(TIMESLICE_MS);
      isListeningRef.current = true;
      setIsListening(true);

      maxDurationTimeoutRef.current = setTimeout(() => {
        if (isListeningRef.current) {
          console.log("[VoiceRecognition] Max duration reached");
          stop();
        }
      }, MAX_RECORDING_DURATION_MS);

    } catch (e: any) {
      console.error("[VoiceRecognition] Start failed:", e);
      if (e?.name === "NotAllowedError") {
        setPermissionDenied(true);
        onErrorRef.current?.("not-allowed");
      } else {
        onErrorRef.current?.("mic-error");
      }
      setIsListening(false);
      isListeningRef.current = false;
    }
  }, [processQueue]);

  const stop = useCallback(() => {
    isListeningRef.current = false;
    cleanup();
    setIsListening(false);
    onEndRef.current?.();
  }, [cleanup]);

  return { isListening, transcript, isSupported, permissionDenied, mode: "server" as const, start, stop };
}

// ─── Arabic text normalization & comparison ─────────────────
function normalizeArabic(text: string): string {
  return text
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7-\u06E8\u06EA-\u06ED\u0890-\u0891\u08D3-\u08FF]/g, "")
    .replace(/[\u0622\u0623\u0625\u0671]/g, "\u0627")
    .replace(/\u0629/g, "\u0647")
    .replace(/\u0649/g, "\u064A")
    .replace(/\u0640/g, "")
    .replace(/[\u06D0-\u06D5\u06E5-\u06E6]/g, "")
    .trim();
}

function similarityScore(a: string, b: string): number {
  if (a === b) return 1;
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  if (longer.length === 0) return 0;
  let matches = 0;
  for (let j = 0; j < shorter.length; j++) {
    if (longer.includes(shorter[j])) matches++;
  }
  return matches / longer.length;
}

export function compareTexts(original: string, spoken: string): { results: WordResult[]; score: number } {
  const spokenWords = normalizeArabic(spoken).split(/\s+/).filter(Boolean);
  const displayWords = original.split(/\s+/).filter(Boolean);

  const results: WordResult[] = displayWords.map((word) => {
    const normOrig = normalizeArabic(word);
    const matched = spokenWords.some((sw) => {
      if (normOrig === sw) return true;
      return similarityScore(normOrig, sw) > 0.6;
    });
    return { word, correct: matched };
  });

  const correctCount = results.filter((r) => r.correct).length;
  const score = displayWords.length > 0 ? Math.round((correctCount / displayWords.length) * 100) : 0;

  return { results, score };
}

// ─── Full surah comparison for dictation mode ───────────────
export interface DictationWordResult {
  word: string;
  status: "correct" | "incorrect" | "missing" | "extra";
  originalIndex?: number;
}

export function compareSurahDictation(
  originalAyahs: string[],
  spokenText: string
): {
  wordResults: DictationWordResult[];
  ayahScores: { ayahIndex: number; score: number; correct: boolean }[];
  totalScore: number;
} {
  const fullOriginal = originalAyahs.join(" ");
  const origWords = fullOriginal.split(/\s+/).filter(Boolean);
  const normOrigWords = origWords.map((w) => normalizeArabic(w));
  const spokenWords = normalizeArabic(spokenText).split(/\s+/).filter(Boolean);

  const wordResults: DictationWordResult[] = [];
  let spokenIdx = 0;

  for (let i = 0; i < origWords.length; i++) {
    if (spokenIdx >= spokenWords.length) {
      wordResults.push({ word: origWords[i], status: "missing", originalIndex: i });
      continue;
    }

    const normOrig = normOrigWords[i];
    const normSpoken = spokenWords[spokenIdx];

    if (normOrig === normSpoken || similarityScore(normOrig, normSpoken) > 0.6) {
      wordResults.push({ word: origWords[i], status: "correct", originalIndex: i });
      spokenIdx++;
    } else {
      let foundAhead = false;
      for (let look = 1; look <= 3 && i + look < origWords.length; look++) {
        if (normalizeArabic(origWords[i + look]) === normSpoken ||
            similarityScore(normalizeArabic(origWords[i + look]), normSpoken) > 0.6) {
          wordResults.push({ word: origWords[i], status: "missing", originalIndex: i });
          foundAhead = true;
          break;
        }
      }

      if (!foundAhead) {
        let foundInOrig = false;
        for (let look = 1; look <= 3 && spokenIdx + look < spokenWords.length; look++) {
          const futureSpoken = spokenWords[spokenIdx + look];
          if (normOrig === futureSpoken || similarityScore(normOrig, futureSpoken) > 0.6) {
            wordResults.push({ word: spokenWords[spokenIdx], status: "extra" });
            spokenIdx++;
            i--;
            foundInOrig = true;
            break;
          }
        }

        if (!foundInOrig) {
          wordResults.push({ word: origWords[i], status: "incorrect", originalIndex: i });
          spokenIdx++;
        }
      }
    }
  }

  while (spokenIdx < spokenWords.length) {
    wordResults.push({ word: spokenWords[spokenIdx], status: "extra" });
    spokenIdx++;
  }

  let wordIdx = 0;
  const ayahScores = originalAyahs.map((ayah, ayahIndex) => {
    const ayahWordCount = ayah.split(/\s+/).filter(Boolean).length;
    const ayahResults = wordResults.slice(wordIdx, wordIdx + ayahWordCount)
      .filter((r) => r.originalIndex !== undefined);
    wordIdx += ayahWordCount;

    const correct = ayahResults.filter((r) => r.status === "correct").length;
    const total = ayahWordCount;
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { ayahIndex, score, correct: score >= 80 };
  });

  const totalCorrect = wordResults.filter((r) => r.status === "correct").length;
  const totalOrigWords = origWords.length;
  const totalScore = totalOrigWords > 0 ? Math.round((totalCorrect / totalOrigWords) * 100) : 0;

  return { wordResults, ayahScores, totalScore };
}
