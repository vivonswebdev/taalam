import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

const RECITERS = [
  { id: "ar.alafasy", name: "Al-Afasy", label: "مشاري العفاسي" },
  { id: "ar.husary", name: "Al-Husary", label: "محمود خليل الحصري" },
  { id: "ar.minshawi", name: "Al-Minshawi", label: "محمد صديق المنشاوي" },
  { id: "ar.abdurrahmaansudais", name: "As-Sudais", label: "عبد الرحمن السديس" },
];

export type RepeatMode = "none" | "ayah" | "range" | "surah";

export interface PlaylistItem {
  surahNumber: number;
  surahName: string;
  surahNameArabic: string;
  totalAyahs: number;
}

export interface GlobalAudioState {
  isPlaying: boolean;
  surahNumber: number;
  surahName: string;
  surahNameArabic: string;
  currentAyah: number;
  totalAyahs: number;
  progress: number;
  continuousMode: boolean;
  listenTestMode: boolean;
  repeatMode: RepeatMode;
  repeatRange?: { start: number; end: number };
  playlist: PlaylistItem[];
  currentPlaylistIndex: number;
  currentTime: number;
  duration: number;
}

interface GlobalAudioContextType {
  state: GlobalAudioState;
  play: (surahNumber: number, surahName: string, surahNameArabic: string, totalAyahs: number, startAyah?: number, reciterEdition?: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  nextAyah: () => void;
  prevAyah: () => void;
  nextSurah: () => void;
  prevSurah: () => void;
  jumpToAyah: (index: number) => void;
  setContinuousMode: (v: boolean) => void;
  setListenTestMode: (v: boolean) => void;
  setRepeatMode: (mode: RepeatMode, range?: { start: number; end: number }) => void;
  addToPlaylist: (item: PlaylistItem) => void;
  removeFromPlaylist: (index: number) => void;
  clearPlaylist: () => void;
  playFromPlaylist: (index: number) => void;
  requestExclusiveAudio: () => void;
  onAyahChange: React.MutableRefObject<((surahNumber: number, ayah: number) => void) | null>;
  onSurahComplete: React.MutableRefObject<((surahNumber: number, surahName: string) => void) | null>;
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
  listenTestMode: false,
  repeatMode: "none",
  repeatRange: undefined,
  playlist: [],
  currentPlaylistIndex: -1,
  currentTime: 0,
  duration: 0,
};

const GlobalAudioContext = createContext<GlobalAudioContextType | null>(null);

export function GlobalAudioProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GlobalAudioState>(defaultState);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioUrlsRef = useRef<string[]>([]);
  const reciterEditionRef = useRef("ar.alafasy");
  const currentAyahRef = useRef(0);
  const surahNumberRef = useRef(0);
  const totalAyahsRef = useRef(0);
  const continuousModeRef = useRef(true);
  const isPlayingRef = useRef(false);
  const surahNameRef = useRef("");
  const surahNameArabicRef = useRef("");
  const onAyahChange = useRef<((surahNumber: number, ayah: number) => void) | null>(null);
  const onSurahComplete = useRef<((surahNumber: number, surahName: string) => void) | null>(null);
  const listenTestModeRef = useRef(false);
  const repeatModeRef = useRef<RepeatMode>("none");
  const repeatRangeRef = useRef<{ start: number; end: number } | undefined>(undefined);
  const playlistRef = useRef<PlaylistItem[]>([]);
  const playlistIndexRef = useRef(-1);

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

  const fetchUrls = useCallback(async (surahNum: number, edition?: string): Promise<string[]> => {
    const reciterEd = edition || reciterEditionRef.current || "ar.alafasy";
    try {
      const isOffline = localStorage.getItem("taaloum_offline_mode") === "true";
      if (isOffline) {
        try {
          const cache = await caches.open("offline-audio-v2");
          const cached = await cache.match(`https://api.alquran.cloud/v1/surah/${surahNum}/${reciterEd}`);
          if (cached) {
            const data = await cached.json();
            if (data.data?.ayahs) return data.data.ayahs.map((a: { audio: string }) => a.audio);
          }
          const moodCache = await caches.open("mood-audio-v1");
          const moodCached = await moodCache.match(`https://api.alquran.cloud/v1/surah/${surahNum}/${reciterEd}`);
          if (moodCached) {
            const data = await moodCached.json();
            if (data.data?.ayahs) return data.data.ayahs.map((a: { audio: string }) => a.audio);
          }
          toast({ title: "Mode Offline", description: "Audio non téléchargé. Allez dans Réglages > Offline." });
          return [];
        } catch {}
      }
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/${reciterEd}`);
      const data = await res.json();
      if (data.data?.ayahs) return data.data.ayahs.map((a: { audio: string }) => a.audio);
    } catch {}
    return [];
  }, []);

  const startProgressInterval = useCallback(() => {
    clearInterval_();
    intervalRef.current = setInterval(() => {
      if (!audioRef.current) return;
      const dur = audioRef.current.duration || 0;
      const cur = audioRef.current.currentTime || 0;
      setState(prev => ({
        ...prev,
        progress: dur ? (cur / dur) * 100 : 0,
        currentTime: cur,
        duration: dur,
      }));
    }, 250);
  }, [clearInterval_]);

  const playNextFromPlaylist = useCallback(() => {
    const pl = playlistRef.current;
    const nextIdx = playlistIndexRef.current + 1;
    if (nextIdx < pl.length) {
      playlistIndexRef.current = nextIdx;
      const item = pl[nextIdx];
      surahNumberRef.current = item.surahNumber;
      surahNameRef.current = item.surahName;
      surahNameArabicRef.current = item.surahNameArabic;
      totalAyahsRef.current = item.totalAyahs;
      currentAyahRef.current = 0;
      setState(prev => ({
        ...prev,
        surahNumber: item.surahNumber,
        surahName: item.surahName,
        surahNameArabic: item.surahNameArabic,
        totalAyahs: item.totalAyahs,
        currentAyah: 0,
        progress: 0,
        currentPlaylistIndex: nextIdx,
      }));
      return item;
    }
    return null;
  }, []);

  const playAyahInternal = useCallback((index: number, urls: string[]) => {
    if (index >= urls.length) {
      // Repeat logic
      const rm = repeatModeRef.current;
      if (rm === "surah") {
        // Replay from beginning
        playAyahInternal(0, urls);
        return;
      }
      if (rm === "range" && repeatRangeRef.current) {
        playAyahInternal(repeatRangeRef.current.start, urls);
        return;
      }

      // Check playlist
      if (playlistRef.current.length > 0) {
        const nextItem = playNextFromPlaylist();
        if (nextItem) {
          fetchUrls(nextItem.surahNumber, reciterEditionRef.current).then(newUrls => {
            if (newUrls.length > 0) {
              audioUrlsRef.current = newUrls;
              playAyahInternal(0, newUrls);
            }
          });
          return;
        }
      }

      // Continuous mode
      if (continuousModeRef.current && surahNumberRef.current < 114) {
        const nextNum = surahNumberRef.current + 1;
        surahNumberRef.current = nextNum;
        currentAyahRef.current = 0;
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
          fetchUrls(nextNum, reciterEditionRef.current).then(newUrls => {
            if (newUrls.length > 0) {
              audioUrlsRef.current = newUrls;
              playAyahInternal(0, newUrls);
            }
          });
        });
        return;
      }

      // Finished
      const completedSurahNum = surahNumberRef.current;
      const completedSurahName = surahNameRef.current;
      stopAudio();
      isPlayingRef.current = false;
      setState(prev => ({ ...prev, isPlaying: false, currentAyah: 0, progress: 0 }));
      if (listenTestModeRef.current) {
        onSurahComplete.current?.(completedSurahNum, completedSurahName);
      }
      return;
    }

    // Repeat ayah: if we just finished playing this index and repeat is ayah
    // This is handled via onended below

    stopAudio();
    const audio = new Audio(urls[index]);
    audioRef.current = audio;
    currentAyahRef.current = index;

    setState(prev => ({ ...prev, currentAyah: index, isPlaying: true }));
    onAyahChange.current?.(surahNumberRef.current, index);

    audio.onended = () => {
      const rm = repeatModeRef.current;
      if (rm === "ayah") {
        // Replay same ayah
        playAyahInternal(index, urls);
        return;
      }
      if (rm === "range" && repeatRangeRef.current) {
        const { start, end } = repeatRangeRef.current;
        if (index >= end) {
          playAyahInternal(start, urls);
          return;
        }
      }
      playAyahInternal(index + 1, urls);
    };
    audio.onerror = () => playAyahInternal(index + 1, urls);

    startProgressInterval();
    audio.play().catch(() => playAyahInternal(index + 1, urls));
  }, [stopAudio, fetchUrls, startProgressInterval, playNextFromPlaylist]);

  const play = useCallback(async (surahNum: number, name: string, nameAr: string, total: number, startAyah = 0, reciterEdition?: string) => {
    stopAudio();
    if (reciterEdition) reciterEditionRef.current = reciterEdition;
    surahNumberRef.current = surahNum;
    surahNameRef.current = name;
    surahNameArabicRef.current = nameAr;
    totalAyahsRef.current = total;
    currentAyahRef.current = startAyah;
    isPlayingRef.current = true;

    setState(prev => ({
      ...prev,
      isPlaying: true,
      surahNumber: surahNum,
      surahName: name,
      surahNameArabic: nameAr,
      currentAyah: startAyah,
      totalAyahs: total,
      progress: 0,
      currentTime: 0,
      duration: 0,
      continuousMode: continuousModeRef.current,
      listenTestMode: listenTestModeRef.current,
      repeatMode: repeatModeRef.current,
      repeatRange: repeatRangeRef.current,
    }));

    const urls = await fetchUrls(surahNum, reciterEditionRef.current);
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
    // If playlist exists, use it
    if (playlistRef.current.length > 0) {
      const nextItem = playNextFromPlaylist();
      if (nextItem) {
        play(nextItem.surahNumber, nextItem.surahName, nextItem.surahNameArabic, nextItem.totalAyahs, 0);
        return;
      }
    }
    if (surahNumberRef.current >= 114) return;
    const nextNum = surahNumberRef.current + 1;
    fetchSurahMeta(nextNum).then(meta => {
      if (meta) play(nextNum, meta.name, meta.nameArabic, meta.versesCount, 0);
    });
  }, [play, playNextFromPlaylist]);

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

  const setListenTestMode = useCallback((v: boolean) => {
    listenTestModeRef.current = v;
    setState(prev => ({ ...prev, listenTestMode: v }));
  }, []);

  const setRepeatMode = useCallback((mode: RepeatMode, range?: { start: number; end: number }) => {
    repeatModeRef.current = mode;
    repeatRangeRef.current = range;
    setState(prev => ({ ...prev, repeatMode: mode, repeatRange: range }));
  }, []);

  const addToPlaylist = useCallback((item: PlaylistItem) => {
    playlistRef.current = [...playlistRef.current, item];
    setState(prev => ({ ...prev, playlist: [...playlistRef.current] }));
  }, []);

  const removeFromPlaylist = useCallback((index: number) => {
    playlistRef.current = playlistRef.current.filter((_, i) => i !== index);
    // Adjust current index
    if (playlistIndexRef.current >= index && playlistIndexRef.current > 0) {
      playlistIndexRef.current--;
    }
    setState(prev => ({
      ...prev,
      playlist: [...playlistRef.current],
      currentPlaylistIndex: playlistIndexRef.current,
    }));
  }, []);

  const clearPlaylist = useCallback(() => {
    playlistRef.current = [];
    playlistIndexRef.current = -1;
    setState(prev => ({ ...prev, playlist: [], currentPlaylistIndex: -1 }));
  }, []);

  const playFromPlaylist = useCallback((index: number) => {
    const pl = playlistRef.current;
    if (index < 0 || index >= pl.length) return;
    playlistIndexRef.current = index;
    const item = pl[index];
    setState(prev => ({ ...prev, currentPlaylistIndex: index }));
    play(item.surahNumber, item.surahName, item.surahNameArabic, item.totalAyahs, 0);
  }, [play]);

  const requestExclusiveAudio = useCallback(() => {
    if (isPlayingRef.current) pause();
  }, [pause]);

  // MediaSession API
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

  useEffect(() => {
    return () => { stopAudio(); };
  }, [stopAudio]);

  return (
    <GlobalAudioContext.Provider value={{
      state, play, pause, resume, stop, nextAyah, prevAyah,
      nextSurah, prevSurah, jumpToAyah, setContinuousMode, setListenTestMode,
      setRepeatMode, addToPlaylist, removeFromPlaylist, clearPlaylist, playFromPlaylist,
      requestExclusiveAudio, onAyahChange, onSurahComplete,
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
  setListenTestMode: noopFn,
  setRepeatMode: noopFn,
  addToPlaylist: noopFn,
  removeFromPlaylist: noopFn,
  clearPlaylist: noopFn,
  playFromPlaylist: noopFn,
  requestExclusiveAudio: noopFn,
  onAyahChange: noopRef as any,
  onSurahComplete: noopRef as any,
};

export function useGlobalAudio() {
  const ctx = useContext(GlobalAudioContext);
  return ctx ?? fallback;
}

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
