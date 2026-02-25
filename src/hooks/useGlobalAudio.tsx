import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";

const RECITERS = [
  { id: "ar.alafasy", name: "Al-Afasy", label: "مشاري العفاسي" },
  { id: "ar.husary", name: "Al-Husary", label: "محمود خليل الحصري" },
  { id: "ar.minshawi", name: "Al-Minshawi", label: "محمد صديق المنشاوي" },
  { id: "ar.abdurrahmaansudais", name: "As-Sudais", label: "عبد الرحمن السديس" },
];

export interface GlobalAudioState {
  isPlaying: boolean;
  surahNumber: number;
  surahName: string;
  surahNameArabic: string;
  currentAyah: number;
  totalAyahs: number;
  progress: number;
  continuousMode: boolean;
}

interface GlobalAudioContextType {
  state: GlobalAudioState;
  play: (surahNumber: number, surahName: string, surahNameArabic: string, totalAyahs: number, startAyah?: number) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  nextAyah: () => void;
  prevAyah: () => void;
  nextSurah: () => void;
  prevSurah: () => void;
  jumpToAyah: (index: number) => void;
  setContinuousMode: (v: boolean) => void;
  /** Call this from any other audio source to stop global player */
  requestExclusiveAudio: () => void;
  /** Subscribe to ayah changes (surahNumber, ayahIndex) */
  onAyahChange: React.MutableRefObject<((surahNumber: number, ayah: number) => void) | null>;
}

const defaultState: GlobalAudioState = {
  isPlaying: false,
  surahNumber: 0,
  surahName: "",
  surahNameArabic: "",
  currentAyah: 0,
  totalAyahs: 0,
  progress: 0,
  continuousMode: true,
};

const GlobalAudioContext = createContext<GlobalAudioContextType | null>(null);

export function GlobalAudioProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GlobalAudioState>(defaultState);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioUrlsRef = useRef<string[]>([]);
  const currentAyahRef = useRef(0);
  const surahNumberRef = useRef(0);
  const totalAyahsRef = useRef(0);
  const continuousModeRef = useRef(true);
  const isPlayingRef = useRef(false);
  const surahNameRef = useRef("");
  const surahNameArabicRef = useRef("");
  const onAyahChange = useRef<((surahNumber: number, ayah: number) => void) | null>(null);

  const clearInterval_ = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.onloadedmetadata = null;
      audioRef.current.src = "";
      audioRef.current = null;
    }
    clearInterval_();
  }, [clearInterval_]);

  const fetchUrls = useCallback(async (surahNum: number): Promise<string[]> => {
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/ar.alafasy`);
      const data = await res.json();
      if (data.data?.ayahs) {
        return data.data.ayahs.map((a: { audio: string }) => a.audio);
      }
    } catch {}
    return [];
  }, []);

  const startProgressInterval = useCallback(() => {
    clearInterval_();
    intervalRef.current = setInterval(() => {
      if (!audioRef.current) return;
      const dur = audioRef.current.duration || 0;
      const cur = audioRef.current.currentTime || 0;
      setState(prev => ({ ...prev, progress: dur ? (cur / dur) * 100 : 0 }));
    }, 250);
  }, [clearInterval_]);

  const playAyahInternal = useCallback((index: number, urls: string[]) => {
    if (index >= urls.length) {
      // Surah ended
      if (continuousModeRef.current && surahNumberRef.current < 114) {
        // Auto next surah
        const nextNum = surahNumberRef.current + 1;
        surahNumberRef.current = nextNum;
        currentAyahRef.current = 0;
        // We need to fetch surah info – use a simple lookup
        fetchSurahMeta(nextNum).then(meta => {
          if (!meta) return;
          surahNameRef.current = meta.name;
          surahNameArabicRef.current = meta.nameArabic;
          totalAyahsRef.current = meta.versesCount;
          setState(prev => ({
            ...prev,
            surahNumber: nextNum,
            surahName: meta.name,
            surahNameArabic: meta.nameArabic,
            totalAyahs: meta.versesCount,
            currentAyah: 0,
            progress: 0,
          }));
          fetchUrls(nextNum).then(newUrls => {
            if (newUrls.length > 0) {
              audioUrlsRef.current = newUrls;
              playAyahInternal(0, newUrls);
            }
          });
        });
        return;
      }
      // Finished
      stopAudio();
      isPlayingRef.current = false;
      setState(prev => ({ ...prev, isPlaying: false, currentAyah: 0, progress: 0 }));
      return;
    }

    stopAudio();
    const audio = new Audio(urls[index]);
    audioRef.current = audio;
    currentAyahRef.current = index;

    setState(prev => ({ ...prev, currentAyah: index, isPlaying: true }));
    onAyahChange.current?.(surahNumberRef.current, index);

    audio.onended = () => playAyahInternal(index + 1, urls);
    audio.onerror = () => playAyahInternal(index + 1, urls);

    startProgressInterval();
    audio.play().catch(() => playAyahInternal(index + 1, urls));
  }, [stopAudio, fetchUrls, startProgressInterval]);

  const play = useCallback(async (surahNum: number, name: string, nameAr: string, total: number, startAyah = 0) => {
    stopAudio();
    surahNumberRef.current = surahNum;
    surahNameRef.current = name;
    surahNameArabicRef.current = nameAr;
    totalAyahsRef.current = total;
    currentAyahRef.current = startAyah;
    isPlayingRef.current = true;

    setState({
      isPlaying: true,
      surahNumber: surahNum,
      surahName: name,
      surahNameArabic: nameAr,
      currentAyah: startAyah,
      totalAyahs: total,
      progress: 0,
      continuousMode: continuousModeRef.current,
    });

    const urls = await fetchUrls(surahNum);
    if (urls.length === 0) return;
    audioUrlsRef.current = urls;
    playAyahInternal(startAyah, urls);
  }, [stopAudio, fetchUrls, playAyahInternal]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    clearInterval_();
    isPlayingRef.current = false;
    setState(prev => ({ ...prev, isPlaying: false }));
  }, [clearInterval_]);

  const resume = useCallback(() => {
    if (audioRef.current && audioRef.current.src) {
      audioRef.current.play().catch(() => {});
      startProgressInterval();
      isPlayingRef.current = true;
      setState(prev => ({ ...prev, isPlaying: true }));
    }
  }, [startProgressInterval]);

  const stop = useCallback(() => {
    stopAudio();
    isPlayingRef.current = false;
    audioUrlsRef.current = [];
    setState(defaultState);
  }, [stopAudio]);

  const nextAyah = useCallback(() => {
    const urls = audioUrlsRef.current;
    if (urls.length === 0) return;
    const next = Math.min(currentAyahRef.current + 1, urls.length - 1);
    if (isPlayingRef.current) {
      playAyahInternal(next, urls);
    } else {
      currentAyahRef.current = next;
      setState(prev => ({ ...prev, currentAyah: next }));
      onAyahChange.current?.(surahNumberRef.current, next);
    }
  }, [playAyahInternal]);

  const prevAyah = useCallback(() => {
    const urls = audioUrlsRef.current;
    if (urls.length === 0) return;
    const prevIdx = Math.max(currentAyahRef.current - 1, 0);
    if (isPlayingRef.current) {
      playAyahInternal(prevIdx, urls);
    } else {
      currentAyahRef.current = prevIdx;
      setState(s => ({ ...s, currentAyah: prevIdx }));
      onAyahChange.current?.(surahNumberRef.current, prevIdx);
    }
  }, [playAyahInternal]);

  const nextSurah = useCallback(() => {
    if (surahNumberRef.current >= 114) return;
    const nextNum = surahNumberRef.current + 1;
    fetchSurahMeta(nextNum).then(meta => {
      if (meta) play(nextNum, meta.name, meta.nameArabic, meta.versesCount, 0);
    });
  }, [play]);

  const prevSurah = useCallback(() => {
    if (surahNumberRef.current <= 1) return;
    const prevNum = surahNumberRef.current - 1;
    fetchSurahMeta(prevNum).then(meta => {
      if (meta) play(prevNum, meta.name, meta.nameArabic, meta.versesCount, 0);
    });
  }, [play]);

  const jumpToAyah = useCallback((index: number) => {
    const urls = audioUrlsRef.current;
    if (urls.length === 0) return;
    isPlayingRef.current = true;
    playAyahInternal(index, urls);
  }, [playAyahInternal]);

  const setContinuousMode = useCallback((v: boolean) => {
    continuousModeRef.current = v;
    setState(prev => ({ ...prev, continuousMode: v }));
  }, []);

  const requestExclusiveAudio = useCallback(() => {
    if (isPlayingRef.current) {
      pause();
    }
  }, [pause]);

  // MediaSession API for background audio control
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    if (state.isPlaying) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `Ayah ${state.currentAyah + 1}`,
        artist: state.surahName,
        album: 'Quran',
      });
      navigator.mediaSession.setActionHandler('play', resume);
      navigator.mediaSession.setActionHandler('pause', pause);
      navigator.mediaSession.setActionHandler('nexttrack', nextAyah);
      navigator.mediaSession.setActionHandler('previoustrack', prevAyah);
    }
  }, [state.isPlaying, state.currentAyah, state.surahName, resume, pause, nextAyah, prevAyah]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { stopAudio(); };
  }, [stopAudio]);

  return (
    <GlobalAudioContext.Provider value={{
      state, play, pause, resume, stop, nextAyah, prevAyah,
      nextSurah, prevSurah, jumpToAyah, setContinuousMode,
      requestExclusiveAudio, onAyahChange,
    }}>
      {children}
    </GlobalAudioContext.Provider>
  );
}

const noopRef = { current: null };
const noopFn = () => {};
const fallback: GlobalAudioContextType = {
  state: defaultState,
  play: noopFn as any,
  pause: noopFn,
  resume: noopFn,
  stop: noopFn,
  nextAyah: noopFn,
  prevAyah: noopFn,
  nextSurah: noopFn,
  prevSurah: noopFn,
  jumpToAyah: noopFn,
  setContinuousMode: noopFn,
  requestExclusiveAudio: noopFn,
  onAyahChange: noopRef as any,
};

export function useGlobalAudio() {
  const ctx = useContext(GlobalAudioContext);
  return ctx ?? fallback;
}

/** Simple helper to fetch surah meta from API */
async function fetchSurahMeta(num: number): Promise<{ name: string; nameArabic: string; versesCount: number } | null> {
  try {
    const res = await fetch(`https://api.alquran.cloud/v1/surah/${num}`);
    const data = await res.json();
    if (data.data) {
      return {
        name: data.data.englishName,
        nameArabic: data.data.name,
        versesCount: data.data.numberOfAyahs,
      };
    }
  } catch {}
  return null;
}
