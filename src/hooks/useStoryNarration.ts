import { useRef, useState, useCallback } from "react";

export function useStoryNarration() {
  const [isNarrating, setIsNarrating] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const narrate = useCallback((text: string, lang: string) => {
    if (!text) return;
    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      // Map app lang to BCP-47
      const langMap: Record<string, string> = {
        fr: "fr-FR", en: "en-US", ar: "ar-SA", nl: "nl-NL", tr: "tr-TR", ur: "ur-PK",
      };
      utterance.lang = langMap[lang] || "en-US";
      utterance.rate = 0.65; // Very slow for kids
      utterance.pitch = 1.15; // Slightly higher = friendlier
      utterance.volume = 1;

      const voices = window.speechSynthesis.getVoices();
      const match = voices.find((v) => v.lang.startsWith(lang === "ar" ? "ar" : lang === "ur" ? "ur" : lang));
      if (match) utterance.voice = match;

      utterance.onstart = () => setIsNarrating(true);
      utterance.onend = () => setIsNarrating(false);
      utterance.onerror = () => setIsNarrating(false);

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch {
      setIsNarrating(false);
    }
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsNarrating(false);
  }, []);

  const toggle = useCallback((text: string, lang: string) => {
    if (isNarrating) {
      stop();
    } else {
      narrate(text, lang);
    }
  }, [isNarrating, narrate, stop]);

  return { isNarrating, narrate, stop, toggle };
}
