import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, SkipForward, SkipBack, Gauge, User, Repeat, Bookmark, BookmarkCheck, ChevronsLeft, ChevronsRight } from "lucide-react";

const RECITERS = [
  { id: "ar.alafasy", name: "Al-Afasy", label: "مشاري العفاسي" },
  { id: "ar.husary", name: "Al-Husary", label: "محمود خليل الحصري" },
  { id: "ar.minshawi", name: "Al-Minshawi", label: "محمد صديق المنشاوي" },
  { id: "ar.abdurrahmaansudais", name: "As-Sudais", label: "عبد الرحمن السديس" },
];

type Reciter = typeof RECITERS[number];
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

interface AudioPlayerProps {
  surahNumber: number;
  surahName: string;
  surahNameArabic: string;
  totalAyahs: number;
  onAyahChange?: (ayahIndex: number) => void;
  onPlayStateChange?: (playing: boolean) => void;
  onFinished?: () => void;
  onRequestNextSurah?: () => void;
  onRequestPrevSurah?: () => void;
  compact?: boolean;
  continuousMode?: boolean;
  onContinuousModeChange?: (enabled: boolean) => void;
  jumpToAyahRef?: React.MutableRefObject<((index: number) => void) | null>;
  isCurrentAyahBookmarked?: boolean;
  onToggleBookmark?: (ayahIndex: number) => void;
  onGoToBookmark?: () => void;
  hasBookmark?: boolean;
}

export default function AudioPlayer({
  surahNumber,
  surahName,
  surahNameArabic,
  totalAyahs,
  onAyahChange,
  onPlayStateChange,
  onFinished,
  onRequestNextSurah,
  onRequestPrevSurah,
  compact = false,
  jumpToAyahRef,
  continuousMode: externalContinuous,
  onContinuousModeChange,
  isCurrentAyahBookmarked,
  onToggleBookmark,
  onGoToBookmark,
  hasBookmark,
}: AudioPlayerProps) {
  const [internalContinuous, setInternalContinuous] = useState(true);
  const continuousMode = externalContinuous ?? internalContinuous;
  const setContinuousMode = onContinuousModeChange ?? setInternalContinuous;

  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentAyah, setCurrentAyah] = useState(0);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState<number>(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [reciter, setReciter] = useState(RECITERS[0]);
  const [showReciterMenu, setShowReciterMenu] = useState(false);
  const [audioUrls, setAudioUrls] = useState<string[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoStartedRef = useRef(false);

  // ─── REFS for stable closure access ───────────────────────
  const continuousModeRef = useRef(continuousMode);
  const onRequestNextSurahRef = useRef(onRequestNextSurah);
  const onAyahChangeRef = useRef(onAyahChange);
  const onPlayStateChangeRef = useRef(onPlayStateChange);
  const onFinishedRef = useRef(onFinished);
  const speedRef = useRef(speed);
  const playingRef = useRef(playing);
  const audioUrlsRef = useRef(audioUrls);
  const currentAyahRef = useRef(currentAyah);

  useEffect(() => { continuousModeRef.current = continuousMode; }, [continuousMode]);
  useEffect(() => { onRequestNextSurahRef.current = onRequestNextSurah; }, [onRequestNextSurah]);
  useEffect(() => { onAyahChangeRef.current = onAyahChange; }, [onAyahChange]);
  useEffect(() => { onPlayStateChangeRef.current = onPlayStateChange; }, [onPlayStateChange]);
  useEffect(() => { onFinishedRef.current = onFinished; }, [onFinished]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { playingRef.current = playing; }, [playing]);
  useEffect(() => { audioUrlsRef.current = audioUrls; }, [audioUrls]);
  useEffect(() => { currentAyahRef.current = currentAyah; }, [currentAyah]);

  // ─── Fetch audio URLs ─────────────────────────────────────
  const fetchUrls = useCallback(async (reciterId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/${reciterId}`);
      const data = await res.json();
      if (data.data?.ayahs) {
        const urls = data.data.ayahs.map((a: { audio: string }) => a.audio);
        setAudioUrls(urls);
        audioUrlsRef.current = urls;
        setLoading(false);
        return urls;
      }
    } catch {}
    setLoading(false);
    return [];
  }, [surahNumber]);

  // ─── Core playAyah using refs (no stale closures) ────────
  const playAyahStable = useCallback((index: number, urls: string[]) => {
    if (index >= urls.length) {
      // Surah finished
      console.log("[AudioPlayer] Surah finished, continuous:", continuousModeRef.current);
      if (continuousModeRef.current && onRequestNextSurahRef.current) {
        console.log("[AudioPlayer] Requesting next surah...");
        onRequestNextSurahRef.current();
        return;
      }
      setPlaying(false);
      playingRef.current = false;
      setCurrentAyah(0);
      currentAyahRef.current = 0;
      setProgress(0);
      onPlayStateChangeRef.current?.(false);
      onFinishedRef.current?.();
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    // Stop current audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.onloadedmetadata = null;
    }
    if (intervalRef.current) clearInterval(intervalRef.current);

    const audio = new Audio(urls[index]);
    audio.playbackRate = speedRef.current;
    audioRef.current = audio;

    setCurrentAyah(index);
    currentAyahRef.current = index;
    onAyahChangeRef.current?.(index);

    audio.onloadedmetadata = () => setDuration(audio.duration);

    // KEY FIX: onended uses stable ref-based callback, not stale closure
    audio.onended = () => playAyahStable(index + 1, urls);
    audio.onerror = () => playAyahStable(index + 1, urls);

    intervalRef.current = setInterval(() => {
      if (!audioRef.current) return;
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
      setProgress(audioRef.current.duration ? (audioRef.current.currentTime / audioRef.current.duration) * 100 : 0);
    }, 200);

    audio.play().catch(() => playAyahStable(index + 1, urls));
  }, []); // No deps — uses only refs

  // ─── When surahNumber changes while playing → auto-start new surah ──
  const prevSurahRef = useRef(surahNumber);
  useEffect(() => {
    if (prevSurahRef.current !== surahNumber && playingRef.current) {
      console.log("[AudioPlayer] Surah changed while playing, auto-starting surah", surahNumber);
      setCurrentAyah(0);
      currentAyahRef.current = 0;
      setProgress(0);
      setAudioUrls([]);
      audioUrlsRef.current = [];
      fetchUrls(reciter.id).then((urls) => {
        if (urls.length > 0) {
          playAyahStable(0, urls);
        }
      });
    }
    prevSurahRef.current = surahNumber;
  }, [surahNumber, reciter.id, fetchUrls, playAyahStable]);

  // Auto-start playback on mount
  useEffect(() => {
    if (autoStartedRef.current) return;
    autoStartedRef.current = true;
    (async () => {
      const urls = await fetchUrls(reciter.id);
      if (urls.length > 0) {
        setPlaying(true);
        playingRef.current = true;
        onPlayStateChangeRef.current?.(true);
        playAyahStable(0, urls);
      }
    })();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        audioRef.current.onloadedmetadata = null;
        audioRef.current.src = "";
        audioRef.current = null;
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // ─── Controls ─────────────────────────────────────────────
  const handlePlayPause = useCallback(async () => {
    if (playingRef.current) {
      audioRef.current?.pause();
      setPlaying(false);
      playingRef.current = false;
      onPlayStateChangeRef.current?.(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    let urls = audioUrlsRef.current;
    if (urls.length === 0) {
      urls = await fetchUrls(reciter.id);
      if (urls.length === 0) return;
    }

    setPlaying(true);
    playingRef.current = true;
    onPlayStateChangeRef.current?.(true);

    // Resume from paused position if possible
    if (audioRef.current && audioRef.current.paused && audioRef.current.src) {
      audioRef.current.play().catch(() => {});
      intervalRef.current = setInterval(() => {
        if (!audioRef.current) return;
        setCurrentTime(audioRef.current.currentTime);
        setDuration(audioRef.current.duration || 0);
        setProgress(audioRef.current.duration ? (audioRef.current.currentTime / audioRef.current.duration) * 100 : 0);
      }, 200);
      return;
    }

    playAyahStable(currentAyahRef.current, urls);
  }, [reciter.id, fetchUrls, playAyahStable]);

  const handleNext = useCallback(() => {
    const urls = audioUrlsRef.current;
    if (urls.length === 0) return;
    const next = Math.min(currentAyahRef.current + 1, urls.length - 1);
    if (playingRef.current) {
      playAyahStable(next, urls);
    } else {
      setCurrentAyah(next);
      currentAyahRef.current = next;
      onAyahChangeRef.current?.(next);
    }
  }, [playAyahStable]);

  const handlePrev = useCallback(() => {
    const urls = audioUrlsRef.current;
    if (urls.length === 0) return;
    const prev = Math.max(currentAyahRef.current - 1, 0);
    if (playingRef.current) {
      playAyahStable(prev, urls);
    } else {
      setCurrentAyah(prev);
      currentAyahRef.current = prev;
      onAyahChangeRef.current?.(prev);
    }
  }, [playAyahStable]);

  // Expose jumpToAyah
  const jumpToAyah = useCallback(async (index: number) => {
    let urls = audioUrlsRef.current;
    if (urls.length === 0) {
      urls = await fetchUrls(reciter.id);
      if (urls.length === 0) return;
    }
    setPlaying(true);
    playingRef.current = true;
    onPlayStateChangeRef.current?.(true);
    playAyahStable(index, urls);
  }, [reciter.id, fetchUrls, playAyahStable]);

  useEffect(() => {
    if (jumpToAyahRef) jumpToAyahRef.current = jumpToAyah;
  }, [jumpToAyah, jumpToAyahRef]);

  const handleSpeedChange = (s: number) => {
    setSpeed(s);
    speedRef.current = s;
    if (audioRef.current) audioRef.current.playbackRate = s;
    setShowSpeedMenu(false);
  };

  const handleReciterChange = async (r: Reciter) => {
    setReciter(r);
    setShowReciterMenu(false);
    const wasPlaying = playingRef.current;
    audioRef.current?.pause();
    setPlaying(false);
    playingRef.current = false;
    if (intervalRef.current) clearInterval(intervalRef.current);
    const urls = await fetchUrls(r.id);
    setAudioUrls(urls);
    audioUrlsRef.current = urls;
    if (wasPlaying && urls.length > 0) {
      setPlaying(true);
      playingRef.current = true;
      onPlayStateChangeRef.current?.(true);
      playAyahStable(currentAyahRef.current, urls);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = ratio * audio.duration;
  };

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // ─── Compact UI ───────────────────────────────────────────
  if (compact) {
    return (
      <div className="bg-card border border-border rounded-2xl p-3 space-y-2">
        {/* Row 1: Controls */}
        <div className="flex items-center gap-2">
          {/* Prev surah */}
          <button
            onClick={() => onRequestPrevSurah?.()}
            className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0"
            title={t ? t("audio.prevSurah" as any) : "Previous surah"}
          >
            <ChevronsLeft size={14} />
          </button>
          {/* Prev ayah */}
          <button onClick={handlePrev} className="w-8 h-8 rounded-full bg-muted text-foreground flex items-center justify-center shrink-0">
            <SkipBack size={14} />
          </button>
          {/* Play/Pause */}
          {playing ? (
            <button onClick={handlePlayPause} className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
              <Pause size={18} />
            </button>
          ) : loading ? (
            <div className="w-10 h-10 rounded-full bg-primary/70 flex items-center justify-center shrink-0">
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            </div>
          ) : (
            <button onClick={handlePlayPause} className="w-10 h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0">
              <Play size={18} className="ml-0.5" />
            </button>
          )}
          {/* Next ayah */}
          <button onClick={handleNext} className="w-8 h-8 rounded-full bg-muted text-foreground flex items-center justify-center shrink-0">
            <SkipForward size={14} />
          </button>
          {/* Next surah */}
          <button
            onClick={() => onRequestNextSurah?.()}
            className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0"
            title="Sourate suivante"
          >
            <ChevronsRight size={14} />
          </button>
          {/* Spacer */}
          <div className="flex-1" />
          {/* Bookmark current ayah */}
          <button
            onClick={() => onToggleBookmark?.(currentAyah)}
            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              isCurrentAyahBookmarked ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
            }`}
            title="Marquer ce verset"
          >
            {isCurrentAyahBookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
          </button>
          {/* Go to bookmark */}
          {hasBookmark && (
            <button
              onClick={() => onGoToBookmark?.()}
              className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0"
              title="Aller au signet"
            >
              <BookmarkCheck size={14} />
            </button>
          )}
          {/* Continuous mode */}
          <button
            onClick={() => setContinuousMode(!continuousMode)}
            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              continuousMode ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
            }`}
            title="Lecture continue"
          >
            <Repeat size={14} />
          </button>
        </div>
        {/* Row 2: Progress */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground shrink-0">{currentAyah + 1}/{totalAyahs}</span>
          <div className="flex-1 h-1.5 bg-muted rounded-full cursor-pointer" onClick={handleSeek}>
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-[10px] text-muted-foreground shrink-0">{surahNameArabic}</span>
        </div>
      </div>
    );
  }

  // ─── Full UI ──────────────────────────────────────────────
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-5 space-y-4">
      <div className="text-center">
        <p className="font-arabic text-xl text-primary">{surahNameArabic}</p>
        <p className="text-xs text-muted-foreground">{surahName} · Verset {currentAyah + 1}/{totalAyahs}</p>
      </div>

      <div>
        <div className="h-2 bg-muted rounded-full cursor-pointer overflow-hidden" onClick={handleSeek}>
          <motion.div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-muted-foreground">{formatTime(currentTime)}</span>
          <span className="text-[10px] text-muted-foreground">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button onClick={handlePrev} className="w-10 h-10 rounded-full bg-muted text-foreground flex items-center justify-center">
          <SkipBack size={18} />
        </button>
        {playing ? (
          <button onClick={handlePlayPause} className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
            <Pause size={24} />
          </button>
        ) : loading ? (
          <div className="w-14 h-14 rounded-full bg-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          </div>
        ) : (
          <button onClick={handlePlayPause} className="w-14 h-14 rounded-full bg-muted text-muted-foreground flex items-center justify-center shadow-lg">
            <Play size={24} className="ml-1" />
          </button>
        )}
        <button onClick={handleNext} className="w-10 h-10 rounded-full bg-muted text-foreground flex items-center justify-center">
          <SkipForward size={18} />
        </button>
      </div>

      <div className="flex items-center justify-center gap-3">
        <div className="relative">
          <button onClick={() => { setShowSpeedMenu(!showSpeedMenu); setShowReciterMenu(false); }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted text-xs font-semibold text-foreground">
            <Gauge size={14} /> {speed}x
          </button>
          {showSpeedMenu && (
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
              {SPEEDS.map((s) => (
                <button key={s} onClick={() => handleSpeedChange(s)}
                  className={`block w-full px-4 py-2 text-xs text-left hover:bg-accent/50 transition-colors ${speed === s ? "bg-primary/10 text-primary font-bold" : "text-foreground"}`}>
                  {s}x
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button onClick={() => { setShowReciterMenu(!showReciterMenu); setShowSpeedMenu(false); }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted text-xs font-semibold text-foreground">
            <User size={14} /> {reciter.name}
          </button>
          {showReciterMenu && (
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden min-w-[160px]">
              {RECITERS.map((r) => (
                <button key={r.id} onClick={() => handleReciterChange(r)}
                  className={`block w-full px-4 py-2.5 text-left hover:bg-accent/50 transition-colors ${reciter.id === r.id ? "bg-primary/10" : ""}`}>
                  <p className={`text-xs font-semibold ${reciter.id === r.id ? "text-primary" : "text-foreground"}`}>{r.name}</p>
                  <p className="text-[10px] text-muted-foreground font-arabic">{r.label}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => setContinuousMode(!continuousMode)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            continuousMode ? "bg-primary/15 text-primary border border-primary/30" : "bg-muted text-muted-foreground"
          }`}>
          <Repeat size={14} /> Continue
        </button>
      </div>
    </motion.div>
  );
}
