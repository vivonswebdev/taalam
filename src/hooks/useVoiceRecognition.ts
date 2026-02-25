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

export type VoiceMode = "web-speech" | "server-fallback" | "none";

// Detect iOS Safari / PWA
function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

export function useVoiceRecognition(options: UseVoiceRecognitionOptions = {}) {
  const { lang = "ar-SA", continuous = true, onResult, onEnd, onError } = options;
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(true); // optimistic
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [mode, setMode] = useState<VoiceMode>("none");

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const finalTranscriptRef = useRef("");
  const onResultRef = useRef(onResult);
  const onEndRef = useRef(onEnd);
  const onErrorRef = useRef(onError);

  // MediaRecorder fallback refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fallbackIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fallbackTranscriptRef = useRef("");

  // Timeout for detecting no-result from Web Speech
  const noResultTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gotResultRef = useRef(false);

  useEffect(() => { onResultRef.current = onResult; }, [onResult]);
  useEffect(() => { onEndRef.current = onEnd; }, [onEnd]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(!!SR || !!navigator.mediaDevices?.getUserMedia);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      try { recognitionRef.current?.abort(); } catch {}
      stopFallback();
    };
  }, []);

  // ─── Server Fallback (MediaRecorder → Edge Function) ───────
  const sendAudioChunk = useCallback(async (blob: Blob) => {
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
      );

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const res = await fetch(`${supabaseUrl}/functions/v1/stt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseKey}`,
          "apikey": supabaseKey,
        },
        body: JSON.stringify({ audio: base64, lang: lang.split("-")[0] }),
      });

      const data = await res.json();
      if (data.transcript) {
        fallbackTranscriptRef.current += (fallbackTranscriptRef.current ? " " : "") + data.transcript;
        setTranscript(fallbackTranscriptRef.current);
        onResultRef.current?.(fallbackTranscriptRef.current);
      }
    } catch (e) {
      console.warn("[VoiceRecognition] Fallback STT error:", e);
    }
  }, [lang]);

  const startFallback = useCallback(async () => {
    console.log("[VoiceRecognition] Starting server fallback mode");
    setMode("server-fallback");
    fallbackTranscriptRef.current = "";

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
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        // Send final accumulated audio
        if (audioChunksRef.current.length > 0) {
          const fullBlob = new Blob(audioChunksRef.current, { type: mimeType || "audio/webm" });
          sendAudioChunk(fullBlob);
        }
      };

      recorder.start();
      isListeningRef.current = true;
      setIsListening(true);

      // Send chunks every 4 seconds for real-time feedback
      fallbackIntervalRef.current = setInterval(() => {
        if (recorder.state === "recording" && audioChunksRef.current.length > 0) {
          const blob = new Blob(audioChunksRef.current, { type: mimeType || "audio/webm" });
          sendAudioChunk(blob);
        }
      }, 4000);

    } catch (e: any) {
      console.error("[VoiceRecognition] Fallback start failed:", e);
      if (e?.name === "NotAllowedError") {
        setPermissionDenied(true);
        onErrorRef.current?.("not-allowed");
      } else {
        onErrorRef.current?.("fallback-failed");
      }
      setIsListening(false);
      isListeningRef.current = false;
    }
  }, [sendAudioChunk]);

  const stopFallback = useCallback(() => {
    if (fallbackIntervalRef.current) {
      clearInterval(fallbackIntervalRef.current);
      fallbackIntervalRef.current = null;
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

  // ─── Web Speech API ────────────────────────────────────────
  const startWebSpeech = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return false;

    try { recognitionRef.current?.abort(); } catch {}

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    // iOS Safari doesn't support continuous well — use single-shot mode
    recognition.continuous = isIOS() ? false : continuous;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;

    finalTranscriptRef.current = "";
    gotResultRef.current = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      gotResultRef.current = true;
      // Clear the no-result timeout since we got a result
      if (noResultTimeoutRef.current) {
        clearTimeout(noResultTimeoutRef.current);
        noResultTimeoutRef.current = null;
      }

      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscriptRef.current += result[0].transcript + " ";
        } else {
          interim += result[0].transcript;
        }
      }
      const full = (finalTranscriptRef.current + interim).trim();
      setTranscript(full);
      onResultRef.current?.(full);
    };

    recognition.onend = () => {
      if (isListeningRef.current) {
        // Auto-restart if still listening
        try {
          recognition.start();
        } catch {
          isListeningRef.current = false;
          setIsListening(false);
          onEndRef.current?.();
        }
        return;
      }
      setIsListening(false);
      onEndRef.current?.();
    };

    recognition.onerror = (event: any) => {
      const error = event?.error || "unknown";
      console.warn("[VoiceRecognition] Web Speech error:", error);

      if (error === "not-allowed") {
        isListeningRef.current = false;
        setIsListening(false);
        setPermissionDenied(true);
        onErrorRef.current?.("not-allowed");
        return;
      }

      // For no-speech / aborted, let onend handle restart
      if (error === "no-speech" || error === "aborted") return;

      // For other real errors, stop
      isListeningRef.current = false;
      setIsListening(false);
      onErrorRef.current?.(error);
    };

    recognitionRef.current = recognition;
    setTranscript("");
    isListeningRef.current = true;
    setIsListening(true);
    setMode("web-speech");

    try {
      recognition.start();
      console.log("[VoiceRecognition] Web Speech started");

      // Set a timeout: if no result after 7 seconds, switch to fallback
      noResultTimeoutRef.current = setTimeout(() => {
        if (!gotResultRef.current && isListeningRef.current) {
          console.warn("[VoiceRecognition] No result after 7s, switching to server fallback");
          isListeningRef.current = false;
          try { recognition.abort(); } catch {}
          setIsListening(false);
          // Start fallback
          startFallback();
        }
      }, 7000);

      return true;
    } catch (e) {
      console.error("[VoiceRecognition] Web Speech start failed:", e);
      return false;
    }
  }, [lang, continuous, startFallback]);

  // ─── Public API ────────────────────────────────────────────
  const start = useCallback(() => {
    setPermissionDenied(false);
    setTranscript("");
    finalTranscriptRef.current = "";
    fallbackTranscriptRef.current = "";

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const success = startWebSpeech();
      if (!success) {
        // Web Speech failed to start, try fallback
        startFallback();
      }
    } else {
      // No Web Speech API available, go straight to fallback
      console.log("[VoiceRecognition] No Web Speech API, using server fallback");
      startFallback();
    }
  }, [startWebSpeech, startFallback]);

  const stop = useCallback(() => {
    isListeningRef.current = false;

    // Clear no-result timeout
    if (noResultTimeoutRef.current) {
      clearTimeout(noResultTimeoutRef.current);
      noResultTimeoutRef.current = null;
    }

    if (mode === "web-speech") {
      try { recognitionRef.current?.stop(); } catch {}
    } else if (mode === "server-fallback") {
      stopFallback();
    }

    setIsListening(false);
    onEndRef.current?.();
  }, [mode, stopFallback]);

  return { isListening, transcript, isSupported, permissionDenied, mode, start, stop };
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

  // Simple greedy alignment
  const wordResults: DictationWordResult[] = [];
  let spokenIdx = 0;

  for (let i = 0; i < origWords.length; i++) {
    if (spokenIdx >= spokenWords.length) {
      // Remaining original words are missing
      wordResults.push({ word: origWords[i], status: "missing", originalIndex: i });
      continue;
    }

    const normOrig = normOrigWords[i];
    const normSpoken = spokenWords[spokenIdx];

    if (normOrig === normSpoken || similarityScore(normOrig, normSpoken) > 0.6) {
      wordResults.push({ word: origWords[i], status: "correct", originalIndex: i });
      spokenIdx++;
    } else {
      // Check if the spoken word matches any of the next few original words (skip ahead)
      let foundAhead = false;
      for (let look = 1; look <= 3 && i + look < origWords.length; look++) {
        if (normalizeArabic(origWords[i + look]) === normSpoken ||
            similarityScore(normalizeArabic(origWords[i + look]), normSpoken) > 0.6) {
          // Mark current as missing, will process the match in next iteration
          wordResults.push({ word: origWords[i], status: "missing", originalIndex: i });
          foundAhead = true;
          break;
        }
      }

      if (!foundAhead) {
        // Check if spoken word is extra (doesn't match any nearby original)
        let foundInOrig = false;
        for (let look = 1; look <= 3 && spokenIdx + look < spokenWords.length; look++) {
          const futureSpoken = spokenWords[spokenIdx + look];
          if (normOrig === futureSpoken || similarityScore(normOrig, futureSpoken) > 0.6) {
            // Current spoken word is extra
            wordResults.push({ word: spokenWords[spokenIdx], status: "extra" });
            spokenIdx++;
            i--; // Re-process current original word
            foundInOrig = true;
            break;
          }
        }

        if (!foundInOrig) {
          // Mark as incorrect (wrong word spoken)
          wordResults.push({ word: origWords[i], status: "incorrect", originalIndex: i });
          spokenIdx++;
        }
      }
    }
  }

  // Any remaining spoken words are extra
  while (spokenIdx < spokenWords.length) {
    wordResults.push({ word: spokenWords[spokenIdx], status: "extra" });
    spokenIdx++;
  }

  // Calculate per-ayah scores
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
