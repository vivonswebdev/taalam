import { useState, useRef, useCallback } from "react";

/**
 * Global-style anti-double-audio hook.
 * Prevents overlapping playback when the user taps rapidly.
 *
 * - `playSafely(src)` — plays audio only if nothing else is playing.
 *   Returns a boolean indicating whether playback started.
 * - `playManaged(audio)` — registers an externally-created Audio element
 *   so the busy flag is set until it ends.
 * - `stopCurrent()` — stops whatever is playing and resets the flag.
 */
export default function useAntiDoubleAudio() {
  const [isAudioBusy, setIsAudioBusy] = useState(false);
  const currentAudio = useRef<HTMLAudioElement | null>(null);

  const stopCurrent = useCallback(() => {
    if (currentAudio.current) {
      currentAudio.current.pause();
      currentAudio.current.onended = null;
      currentAudio.current.onerror = null;
      currentAudio.current = null;
    }
    setIsAudioBusy(false);
  }, []);

  const playSafely = useCallback(
    async (src: string): Promise<boolean> => {
      if (isAudioBusy) return false;

      stopCurrent();
      setIsAudioBusy(true);

      const audio = new Audio(src);
      currentAudio.current = audio;

      const cleanup = () => {
        setIsAudioBusy(false);
        currentAudio.current = null;
      };

      audio.onended = cleanup;
      audio.onerror = cleanup;

      try {
        await audio.play();
        return true;
      } catch {
        cleanup();
        return false;
      }
    },
    [isAudioBusy, stopCurrent]
  );

  /** Register an external Audio so busy flag tracks it */
  const playManaged = useCallback(
    (audio: HTMLAudioElement) => {
      stopCurrent();
      setIsAudioBusy(true);
      currentAudio.current = audio;

      const prevOnEnded = audio.onended;
      const prevOnError = audio.onerror;

      audio.onended = (e) => {
        setIsAudioBusy(false);
        currentAudio.current = null;
        if (typeof prevOnEnded === "function") prevOnEnded.call(audio, e);
      };
      audio.onerror = (e) => {
        setIsAudioBusy(false);
        currentAudio.current = null;
        if (typeof prevOnError === "function") (prevOnError as any).call(audio, e);
      };
    },
    [stopCurrent]
  );

  return { isAudioBusy, playSafely, playManaged, stopCurrent };
}
