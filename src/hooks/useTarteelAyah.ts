import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";

export type TarteelWordStatus = "correct" | "almost" | "wrong" | "pending";

export interface TarteelWordResult {
  word: string;
  status: TarteelWordStatus;
}

interface UseTarteelAyahOptions {
  ayahs: string[];
  lang?: string;
}

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
  if (!a || !b) return 0;
  let matches = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] === b[i]) matches++;
  }
  return matches / Math.max(a.length, b.length);
}

function buildWordResults(originalAyah: string, spoken: string): TarteelWordResult[] {
  const originalWords = originalAyah.split(/\s+/).filter(Boolean);
  const spokenWords = normalizeArabic(spoken).split(/\s+/).filter(Boolean);

  return originalWords.map((word, index) => {
    const normalizedOriginal = normalizeArabic(word);
    const normalizedSpoken = spokenWords[index] || "";

    if (!normalizedSpoken) {
      return { word, status: "pending" };
    }

    if (normalizedOriginal === normalizedSpoken) {
      return { word, status: "correct" };
    }

    if (similarityScore(normalizedOriginal, normalizedSpoken) >= 0.6) {
      return { word, status: "almost" };
    }

    return { word, status: "wrong" };
  });
}

export function useTarteelAyah({ ayahs, lang = "ar-SA" }: UseTarteelAyahOptions) {
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [showArabic, setShowArabic] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [wordResults, setWordResults] = useState<TarteelWordResult[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const shouldKeepListeningRef = useRef(false);
  const activeAyahRef = useRef(0);

  const currentAyahText = useMemo(() => ayahs[currentAyahIndex] || "", [ayahs, currentAyahIndex]);

  const cleanupRecognition = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    recognition.onresult = null;
    recognition.onerror = null;
    recognition.onend = null;

    try {
      recognition.stop();
    } catch {
      // no-op
    }

    try {
      recognition.abort();
    } catch {
      // no-op
    }

    recognitionRef.current = null;
  }, []);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(Boolean(SR));

    return () => {
      shouldKeepListeningRef.current = false;
      cleanupRecognition();
    };
  }, [cleanupRecognition]);

  const stopMicro = useCallback(() => {
    shouldKeepListeningRef.current = false;
    setIsListening(false);
    cleanupRecognition();
  }, [cleanupRecognition]);

  const resetAyah = useCallback(() => {
    stopMicro();
    setTranscript("");
    setWordResults([]);
    setShowArabic(true);
    setRecognitionError(null);
  }, [stopMicro]);

  const setAyah = useCallback((index: number) => {
    const bounded = Math.max(0, Math.min(index, ayahs.length - 1));
    activeAyahRef.current = bounded;
    setCurrentAyahIndex(bounded);
    resetAyah();
  }, [ayahs.length, resetAyah]);

  const nextAyah = useCallback(() => {
    setAyah(currentAyahIndex + 1);
  }, [currentAyahIndex, setAyah]);

  const startMicro = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    console.log("[Tarteel] start #", currentAyahIndex + 1);

    if (!SR) {
      setRecognitionError("not-supported");
      setIsListening(false);
      return;
    }

    cleanupRecognition();

    const recognition: SpeechRecognition = new SR();
    activeAyahRef.current = currentAyahIndex;
    shouldKeepListeningRef.current = true;

    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let nextTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        nextTranscript += event.results[i][0].transcript + " ";
      }
      const cleanTranscript = nextTranscript.trim();
      console.log("[Tarteel] onresult:", cleanTranscript);
      setTranscript(cleanTranscript);
      setWordResults(buildWordResults(currentAyahText, cleanTranscript));
      setRecognitionError(null);
    };

    recognition.onerror = (event: any) => {
      const error = event?.error || "unknown";
      console.log("[Tarteel] error:", error);
      setRecognitionError(error);
      setIsListening(false);
      shouldKeepListeningRef.current = false;
      cleanupRecognition();
    };

    recognition.onend = () => {
      const sameAyah = activeAyahRef.current === currentAyahIndex;
      if (shouldKeepListeningRef.current && sameAyah) {
        try {
          recognition.start();
          return;
        } catch {
          setRecognitionError("restart-failed");
        }
      }
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    setTranscript("");
    setWordResults([]);
    setShowArabic(false);
    setRecognitionError(null);
    setIsListening(true);

    try {
      recognition.start();
    } catch {
      setRecognitionError("start-failed");
      setIsListening(false);
      shouldKeepListeningRef.current = false;
      cleanupRecognition();
    }
  }, [cleanupRecognition, currentAyahIndex, currentAyahText, lang]);

  return {
    currentAyahIndex,
    currentAyahText,
    showArabic,
    transcript,
    wordResults,
    isListening,
    recognitionError,
    isSupported,
    startMicro,
    stopMicro,
    resetAyah,
    nextAyah,
    setAyah,
  };
}
