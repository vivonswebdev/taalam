import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, SkipForward, SkipBack, Volume2, Gauge, User, List } from "lucide-react";

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
  compact?: boolean;
  jumpToAyahRef?: React.MutableRefObject<((index: number) => void) | null>;
}

export default function AudioPlayer({
  surahNumber,
  surahName,
  surahNameArabic,
  totalAyahs,
  onAyahChange,
  onPlayStateChange,
  onFinished,
  compact = false,
  jumpToAyahRef,
}: AudioPlayerProps) {
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

  // Fetch audio URLs
  const fetchUrls = useCallback(async (reciterId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/${reciterId}`);
      const data = await res.json();
      if (data.data?.ayahs) {
        const urls = data.data.ayahs.map((a: { audio: string }) => a.audio);
        setAudioUrls(urls);
        setLoading(false);
        return urls;
      }
    } catch {}
    setLoading(false);
    return [];
  }, [surahNumber]);

  // Cleanup
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const updateProgress = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentTime(audio.currentTime);
    setDuration(audio.duration || 0);
    setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
  }, []);

  const playAyah = useCallback((index: number, urls: string[]) => {
    if (index >= urls.length) {
      setPlaying(false);
      setCurrentAyah(0);
      setProgress(0);
      onPlayStateChange?.(false);
      onFinished?.();
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    audioRef.current?.pause();
    if (intervalRef.current) clearInterval(intervalRef.current);

    const audio = new Audio(urls[index]);
    audio.playbackRate = speed;
    audioRef.current = audio;
    setCurrentAyah(index);
    onAyahChange?.(index);

    audio.onloadedmetadata = () => {
      setDuration(audio.duration);
    };

    audio.onended = () => playAyah(index + 1, urls);
    audio.onerror = () => playAyah(index + 1, urls);

    intervalRef.current = setInterval(updateProgress, 200);
    audio.play().catch(() => playAyah(index + 1, urls));
  }, [speed, onAyahChange, onPlayStateChange, onFinished, updateProgress]);

  const handlePlayPause = useCallback(async () => {
    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
      onPlayStateChange?.(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    let urls = audioUrls;
    if (urls.length === 0) {
      urls = await fetchUrls(reciter.id);
      if (urls.length === 0) return;
    }

    setPlaying(true);
    onPlayStateChange?.(true);
    playAyah(currentAyah, urls);
  }, [playing, audioUrls, currentAyah, reciter.id, fetchUrls, playAyah, onPlayStateChange]);

  const handleNext = useCallback(() => {
    if (audioUrls.length === 0) return;
    const next = Math.min(currentAyah + 1, audioUrls.length - 1);
    if (playing) {
      playAyah(next, audioUrls);
    } else {
      setCurrentAyah(next);
      onAyahChange?.(next);
    }
  }, [currentAyah, audioUrls, playing, playAyah, onAyahChange]);

  const handlePrev = useCallback(() => {
    if (audioUrls.length === 0) return;
    const prev = Math.max(currentAyah - 1, 0);
    if (playing) {
      playAyah(prev, audioUrls);
    } else {
      setCurrentAyah(prev);
      onAyahChange?.(prev);
    }
  }, [currentAyah, audioUrls, playing, playAyah, onAyahChange]);

  const handleSpeedChange = (s: number) => {
    setSpeed(s);
    if (audioRef.current) audioRef.current.playbackRate = s;
    setShowSpeedMenu(false);
  };

  const handleReciterChange = async (r: typeof RECITERS[number]) => {
    setReciter(r);
    setShowReciterMenu(false);
    const wasPlaying = playing;
    audioRef.current?.pause();
    setPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    const urls = await fetchUrls(r.id);
    setAudioUrls(urls);
    if (wasPlaying && urls.length > 0) {
      setPlaying(true);
      onPlayStateChange?.(true);
      playAyah(currentAyah, urls);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = ratio * audio.duration;
    updateProgress();
  };

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (compact) {
    return (
      <div className="bg-card border border-border rounded-2xl p-3">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePlayPause}
            disabled={loading}
            className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : playing ? (
              <Pause size={18} />
            ) : (
              <Play size={18} className="ml-0.5" />
            )}
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">{surahNameArabic} · {reciter.name}</p>
            <div className="h-1.5 bg-muted rounded-full mt-1 cursor-pointer" onClick={handleSeek}>
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground shrink-0">
            {currentAyah + 1}/{totalAyahs}
          </span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-5 space-y-4"
    >
      {/* Surah info */}
      <div className="text-center">
        <p className="font-arabic text-xl text-primary">{surahNameArabic}</p>
        <p className="text-xs text-muted-foreground">{surahName} · Verset {currentAyah + 1}/{totalAyahs}</p>
      </div>

      {/* Progress bar */}
      <div>
        <div className="h-2 bg-muted rounded-full cursor-pointer overflow-hidden" onClick={handleSeek}>
          <motion.div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-muted-foreground">{formatTime(currentTime)}</span>
          <span className="text-[10px] text-muted-foreground">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Main controls */}
      <div className="flex items-center justify-center gap-4">
        <button onClick={handlePrev} className="w-10 h-10 rounded-full bg-muted text-foreground flex items-center justify-center">
          <SkipBack size={18} />
        </button>
        <button
          onClick={handlePlayPause}
          disabled={loading}
          className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : playing ? (
            <Pause size={24} />
          ) : (
            <Play size={24} className="ml-1" />
          )}
        </button>
        <button onClick={handleNext} className="w-10 h-10 rounded-full bg-muted text-foreground flex items-center justify-center">
          <SkipForward size={18} />
        </button>
      </div>

      {/* Secondary controls */}
      <div className="flex items-center justify-center gap-3">
        {/* Speed */}
        <div className="relative">
          <button
            onClick={() => { setShowSpeedMenu(!showSpeedMenu); setShowReciterMenu(false); }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted text-xs font-semibold text-foreground"
          >
            <Gauge size={14} /> {speed}x
          </button>
          {showSpeedMenu && (
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSpeedChange(s)}
                  className={`block w-full px-4 py-2 text-xs text-left hover:bg-accent/50 transition-colors ${
                    speed === s ? "bg-primary/10 text-primary font-bold" : "text-foreground"
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reciter */}
        <div className="relative">
          <button
            onClick={() => { setShowReciterMenu(!showReciterMenu); setShowSpeedMenu(false); }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted text-xs font-semibold text-foreground"
          >
            <User size={14} /> {reciter.name}
          </button>
          {showReciterMenu && (
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden min-w-[160px]">
              {RECITERS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleReciterChange(r)}
                  className={`block w-full px-4 py-2.5 text-left hover:bg-accent/50 transition-colors ${
                    reciter.id === r.id ? "bg-primary/10" : ""
                  }`}
                >
                  <p className={`text-xs font-semibold ${reciter.id === r.id ? "text-primary" : "text-foreground"}`}>{r.name}</p>
                  <p className="text-[10px] text-muted-foreground font-arabic">{r.label}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
