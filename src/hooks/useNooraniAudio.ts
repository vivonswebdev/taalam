import { useRef, useCallback } from "react";

export function useNooraniAudio() {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string) => {
    if (!text) return;
    try {
      // Stop any current speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ar-SA";
      utterance.rate = 0.7; // Slower for learning
      utterance.pitch = 1;
      utterance.volume = 1;

      // Try to find an Arabic voice
      const voices = window.speechSynthesis.getVoices();
      const arabicVoice = voices.find(
        (v) => v.lang.startsWith("ar")
      );
      if (arabicVoice) {
        utterance.voice = arabicVoice;
      }

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Speech synthesis failed:", e);
    }
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
  }, []);

  return { speak, stop };
}
