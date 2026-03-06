import { useState, useRef, useCallback, useEffect } from "react";

const RECITER_KEY = "mushaf_reciter";
const DEFAULT_RECITER = "Alafasy_128kbps";

export const RECITERS = [
  { id: "Alafasy_128kbps", name: "Mishary Rashid Al-Afasy", flag: "🇸🇦", style: "Murattal" },
  { id: "Abdul_Basit_Murattal_192kbps", name: "Abdul Basit Abdusamad", flag: "🇪🇬", style: "Murattal" },
  { id: "Husary_128kbps", name: "Mahmoud Khalil Al-Husary", flag: "🇪🇬", style: "Lent/Pédagogique" },
  { id: "Mohammad_al_Tablawi_128kbps", name: "Muhammad al-Tablawi", flag: "🇪🇬", style: "Murattal" },
  { id: "Minshawy_Murattal_128kbps", name: "Muhammad Siddiq Al-Minshawi", flag: "🇪🇬", style: "Murattal" },
  { id: "Ahmed_ibn_Ali_al-Ajamy_128kbps_ketabook", name: "Ahmed Al-Ajamy", flag: "🇸🇦", style: "Murattal" },
];

function getAudioUrl(surah: number, ayah: number, reciterId: string): string {
  const s = String(surah).padStart(3, "0");
  const a = String(ayah).padStart(3, "0");
  return `https://everyayah.com/data/${reciterId}/${s}${a}.mp3`;
}

export function useMushafAudio() {
  const [reciterId, setReciterIdState] = useState<string>(() =>
    localStorage.getItem(RECITER_KEY) || DEFAULT_RECITER
  );
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const autoPlayQueueRef = useRef<{ surah: number; ayah: number }[]>([]);
  const autoPlayIdxRef = useRef(0);
  const autoPlayRef = useRef(false);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setPlayingKey(null);
    setIsLoading(false);
  }, []);

  const playAyah = useCallback((surah: number, ayah: number) => {
    stopAudio();
    const key = `${surah}:${ayah}`;
    setPlayingKey(key);
    setIsLoading(true);
    const audio = new Audio(getAudioUrl(surah, ayah, reciterId));
    audioRef.current = audio;
    audio.oncanplaythrough = () => setIsLoading(false);
    audio.onended = () => {
      setPlayingKey(null);
      if (autoPlayRef.current && autoPlayQueueRef.current.length > 0) {
        autoPlayIdxRef.current += 1;
        const next = autoPlayQueueRef.current[autoPlayIdxRef.current];
        if (next) {
          // Use setTimeout to avoid recursive call in same tick
          setTimeout(() => {
            const k = `${next.surah}:${next.ayah}`;
            setPlayingKey(k);
            setIsLoading(true);
            const nextAudio = new Audio(getAudioUrl(next.surah, next.ayah, reciterId));
            audioRef.current = nextAudio;
            nextAudio.oncanplaythrough = () => setIsLoading(false);
            nextAudio.onended = audio.onended;
            nextAudio.onerror = () => { setPlayingKey(null); setIsLoading(false); };
            nextAudio.play().catch(() => setPlayingKey(null));
          }, 100);
        }
      }
    };
    audio.onerror = () => { setPlayingKey(null); setIsLoading(false); };
    audio.play().catch(() => setPlayingKey(null));
  }, [reciterId, stopAudio]);

  const toggleAyah = useCallback((surah: number, ayah: number) => {
    const key = `${surah}:${ayah}`;
    if (playingKey === key) stopAudio();
    else playAyah(surah, ayah);
  }, [playingKey, stopAudio, playAyah]);

  const setReciter = useCallback((id: string) => {
    localStorage.setItem(RECITER_KEY, id);
    setReciterIdState(id);
    stopAudio();
  }, [stopAudio]);

  const playPage = useCallback((ayahs: { surahNumber: number; number: number }[]) => {
    autoPlayQueueRef.current = ayahs.map(a => ({ surah: a.surahNumber, ayah: a.number }));
    autoPlayIdxRef.current = 0;
    autoPlayRef.current = true;
    if (ayahs.length > 0) playAyah(ayahs[0].surahNumber, ayahs[0].number);
  }, [playAyah]);

  const stopPagePlay = useCallback(() => {
    autoPlayRef.current = false;
    autoPlayQueueRef.current = [];
    autoPlayIdxRef.current = 0;
    stopAudio();
  }, [stopAudio]);

  useEffect(() => () => stopAudio(), [stopAudio]);

  return {
    reciterId, setReciter,
    playingKey, isLoading,
    toggleAyah, playAyah, stopAudio,
    playPage, stopPagePlay,
    isAutoPlaying: autoPlayRef.current && playingKey !== null,
  };
}
