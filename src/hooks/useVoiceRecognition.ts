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
}

export function useVoiceRecognition(options: UseVoiceRecognitionOptions = {}) {
  const { lang = "ar-SA", continuous = true, onResult, onEnd } = options;
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const finalTranscriptRef = useRef("");
  const onResultRef = useRef(onResult);
  const onEndRef = useRef(onEnd);

  // Keep refs in sync without triggering re-renders
  useEffect(() => { onResultRef.current = onResult; }, [onResult]);
  useEffect(() => { onEndRef.current = onEnd; }, [onEnd]);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(!!SR);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      try { recognitionRef.current?.abort(); } catch {}
    };
  }, []);

  const start = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("[VoiceRecognition] Not supported in this browser");
      return;
    }

    // Stop any previous instance
    try { recognitionRef.current?.abort(); } catch {}

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;

    finalTranscriptRef.current = "";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
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
      // Auto-restart if we're still supposed to be listening (handles no-speech timeout)
      if (isListeningRef.current) {
        console.log("[VoiceRecognition] Auto-restarting after onend");
        try {
          recognition.start();
        } catch (e) {
          console.warn("[VoiceRecognition] Restart failed:", e);
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
      console.warn("[VoiceRecognition] Error:", error);
      // For "no-speech" or "aborted", let onend handle restart
      if (error === "no-speech" || error === "aborted") return;
      // For real errors (not-allowed, network, etc.), stop completely
      isListeningRef.current = false;
      setIsListening(false);
      if (error === "not-allowed") {
        console.error("[VoiceRecognition] Microphone permission denied. Grant mic access and retry.");
      }
    };

    recognitionRef.current = recognition;
    setTranscript("");
    isListeningRef.current = true;
    setIsListening(true);

    try {
      recognition.start();
      console.log("[VoiceRecognition] Started successfully");
    } catch (e) {
      console.error("[VoiceRecognition] Start failed:", e);
      isListeningRef.current = false;
      setIsListening(false);
    }
  }, [lang, continuous]);

  const stop = useCallback(() => {
    isListeningRef.current = false;
    try { recognitionRef.current?.stop(); } catch {}
    setIsListening(false);
  }, []);

  return { isListening, transcript, isSupported, start, stop };
}

// Normalize Arabic text for comparison: remove diacritics, normalize chars
function normalizeArabic(text: string): string {
  return text
    // Remove tashkeel/diacritics
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7-\u06E8\u06EA-\u06ED\u0890-\u0891\u08D3-\u08FF]/g, "")
    // Normalize alef variants to plain alef
    .replace(/[\u0622\u0623\u0625\u0671]/g, "\u0627")
    // Normalize teh marbuta to heh
    .replace(/\u0629/g, "\u0647")
    // Normalize alef maksura to ya
    .replace(/\u0649/g, "\u064A")
    // Remove tatweel
    .replace(/\u0640/g, "")
    // Remove small/superscript letters
    .replace(/[\u06D0-\u06D5\u06E5-\u06E6]/g, "")
    .trim();
}

export function compareTexts(original: string, spoken: string): { results: WordResult[]; score: number } {
  const origWords = normalizeArabic(original).split(/\s+/).filter(Boolean);
  const spokenWords = normalizeArabic(spoken).split(/\s+/).filter(Boolean);

  // Get the display words (with diacritics) from original
  const displayWords = original.split(/\s+/).filter(Boolean);

  const results: WordResult[] = displayWords.map((word, i) => {
    const normOrig = normalizeArabic(word);
    // Check if any spoken word matches (fuzzy: at least 60% char match)
    const matched = spokenWords.some((sw) => {
      if (normOrig === sw) return true;
      // Simple similarity check
      const longer = normOrig.length > sw.length ? normOrig : sw;
      const shorter = normOrig.length > sw.length ? sw : normOrig;
      if (longer.length === 0) return false;
      let matches = 0;
      for (let j = 0; j < shorter.length; j++) {
        if (longer.includes(shorter[j])) matches++;
      }
      return matches / longer.length > 0.6;
    });
    return { word, correct: matched };
  });

  const correctCount = results.filter((r) => r.correct).length;
  const score = displayWords.length > 0 ? Math.round((correctCount / displayWords.length) * 100) : 0;

  return { results, score };
}
