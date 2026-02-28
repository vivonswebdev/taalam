import { useRef } from "react";

export function useNooraniAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = (url?: string) => {
    if (!url) return;
    try {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play().catch(() => {});
    } catch {}
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  return { play, stop };
}
