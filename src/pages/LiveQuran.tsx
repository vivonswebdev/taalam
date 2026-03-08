import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play, Pause, Radio, Wifi, WifiOff, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import BottomNav from "@/components/BottomNav";

interface QuranStation {
  id: string;
  name: string;
  nameAr: string;
  reciter: string;
  url: string;
  country?: string;
}

const STATIONS: QuranStation[] = [
  { id: "makkah", name: "Quran Radio Makkah", nameAr: "إذاعة القرآن الكريم من مكة", reciter: "Imam Al-Haram", url: "https://Qurango.net/radio/tarateel", country: "🇸🇦" },
  { id: "madinah", name: "Quran Radio Madinah", nameAr: "إذاعة القرآن الكريم من المدينة", reciter: "Imam Al-Masjid An-Nabawi", url: "https://backup.qurango.net/radio/madinah", country: "🇸🇦" },
  { id: "mishary", name: "Mishary Rashid Al-Afasy", nameAr: "مشاري راشد العفاسي", reciter: "Mishary Al-Afasy", url: "https://backup.qurango.net/radio/mishary", country: "🇰🇼" },
  { id: "sudais", name: "Abdul Rahman Al-Sudais", nameAr: "عبد الرحمن السديس", reciter: "Al-Sudais", url: "https://backup.qurango.net/radio/sudais", country: "🇸🇦" },
  { id: "shuraim", name: "Saud Al-Shuraim", nameAr: "سعود الشريم", reciter: "Al-Shuraim", url: "https://backup.qurango.net/radio/shuraim", country: "🇸🇦" },
  { id: "ajamy", name: "Ahmad Al-Ajamy", nameAr: "أحمد بن علي العجمي", reciter: "Al-Ajamy", url: "https://backup.qurango.net/radio/ajamy", country: "🇸🇦" },
  { id: "hudhaify", name: "Ali Al-Hudhaify", nameAr: "علي الحذيفي", reciter: "Al-Hudhaify", url: "https://backup.qurango.net/radio/hudhaify", country: "🇸🇦" },
  { id: "basfar", name: "Abdullah Basfar", nameAr: "عبد الله بصفر", reciter: "Basfar", url: "https://backup.qurango.net/radio/basfar", country: "🇸🇦" },
  { id: "minshawi_mujawwad", name: "Al-Minshawi (Mujawwad)", nameAr: "المنشاوي - مجوّد", reciter: "Al-Minshawi", url: "https://backup.qurango.net/radio/minshawi_mujawwad", country: "🇪🇬" },
  { id: "husary", name: "Mahmoud Khalil Al-Husary", nameAr: "محمود خليل الحصري", reciter: "Al-Husary", url: "https://backup.qurango.net/radio/husary", country: "🇪🇬" },
  { id: "french", name: "French Translation", nameAr: "ترجمة فرنسية", reciter: "Traduction FR", url: "https://backup.qurango.net/radio/french", country: "🇫🇷" },
  { id: "english", name: "English Translation", nameAr: "ترجمة إنجليزية", reciter: "Translation EN", url: "https://backup.qurango.net/radio/english", country: "🇬🇧" },
];

export default function LiveQuran() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [activeStation, setActiveStation] = useState<QuranStation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep audio alive across navigations — only destroy on explicit stop
  useEffect(() => {
    return () => {
      // Don't destroy audio on unmount to allow background playback
      // Audio will be cleaned up when user explicitly stops or plays a new station
    };
  }, []);

  // Sync play/pause state from system controls (lock screen, notification center)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, [activeStation]);

  // MediaSession integration for background control (lock screen, notification)
  useEffect(() => {
    if (!("mediaSession" in navigator) || !activeStation) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: activeStation.name,
      artist: activeStation.reciter,
      album: "Live Coran – Radio Quran 24/7",
      artwork: [
        { src: "/favicon.ico", sizes: "64x64", type: "image/x-icon" },
      ],
    });

    const handleMediaPlay = () => {
      audioRef.current?.play().catch(() => {});
    };
    const handleMediaPause = () => {
      audioRef.current?.pause();
    };
    const handleMediaStop = () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
      setActiveStation(null);
      setIsPlaying(false);
    };

    navigator.mediaSession.setActionHandler("play", handleMediaPlay);
    navigator.mediaSession.setActionHandler("pause", handleMediaPause);
    navigator.mediaSession.setActionHandler("stop", handleMediaStop);

    // Update playback state
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";

    return () => {
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
      navigator.mediaSession.setActionHandler("stop", null);
    };
  }, [activeStation, isPlaying]);

  const playStation = useCallback((station: QuranStation) => {
    setError(null);
    setIsLoading(true);

    // Stop existing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }

    const audio = new Audio(station.url);
    audio.preload = "auto";
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;

    audio.onplaying = () => { setIsLoading(false); setIsPlaying(true); };
    audio.onerror = () => {
      setIsLoading(false);
      setIsPlaying(false);
      setError(t("liveQuran.connectionError" as any));
    };
    audio.onstalled = () => {
      // Stream stalled — give it a moment then show error
      setTimeout(() => {
        if (audioRef.current === audio && !audio.paused && audio.readyState < 3) {
          setError("Connexion lente… la station charge.");
        }
      }, 8000);
    };

    setActiveStation(station);
    audio.play().catch(() => {
      setIsLoading(false);
      setError("Impossible de lancer la lecture. Essayez une autre station.");
    });
  }, []);

  const pausePlayback = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const resumePlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) pausePlayback();
    else if (activeStation) resumePlayback();
  }, [isPlaying, activeStation, pausePlayback, resumePlayback]);

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="px-6 pt-14 pb-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground mb-3">
          <ArrowLeft size={20} />
          <span className="text-sm">Retour</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-900 flex items-center justify-center text-2xl">
            📻
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Live Coran</h1>
            <p className="text-sm text-muted-foreground">Écoutez le Coran en continu</p>
          </div>
        </div>
      </div>

      {/* Active player */}
      {activeStation && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-6 mb-4"
        >
          <div className="bg-gradient-to-br from-indigo-600/20 to-blue-900/20 border border-indigo-500/30 rounded-2xl p-5">
            {/* Live indicator */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <motion.div
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-red-500"
              />
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-400">En direct</span>
            </div>

            {/* Station info */}
            <div className="text-center mb-4">
              <p className="font-arabic text-lg text-foreground">{activeStation.nameAr}</p>
              <p className="text-sm text-muted-foreground">{activeStation.name}</p>
              {activeStation.country && (
                <span className="text-xs text-muted-foreground">{activeStation.country} · {activeStation.reciter}</span>
              )}
            </div>

            {/* Play/Pause button */}
            <div className="flex items-center justify-center">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={togglePlayPause}
                disabled={isLoading}
                className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xl shadow-primary/30"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Radio size={28} />
                  </motion.div>
                ) : isPlaying ? (
                  <Pause size={28} />
                ) : (
                  <Play size={28} className="ml-1" />
                )}
              </motion.button>
            </div>

            {/* Audio visualizer */}
            {isPlaying && (
              <div className="flex items-center justify-center gap-1 mt-3">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ scaleY: [1, 2.5, 1] }}
                    transition={{ duration: 0.5 + i * 0.1, repeat: Infinity, repeatType: "reverse" }}
                    className="w-1 h-3 bg-primary rounded-full"
                  />
                ))}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mt-3 flex items-center justify-center gap-2 text-destructive">
                <WifiOff size={14} />
                <span className="text-xs">{error}</span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Stations list */}
      <div className="px-6">
        <p className="text-sm font-semibold text-foreground mb-3">Stations disponibles</p>
        <div className="space-y-2">
          {STATIONS.map((station, i) => {
            const isActive = activeStation?.id === station.id;
            return (
              <motion.button
                key={station.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => playStation(station)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-all active:scale-[0.98] ${
                  isActive
                    ? "bg-primary/10 border-2 border-primary/40 shadow-md shadow-primary/10"
                    : "bg-card border border-border hover:bg-accent/30"
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm shrink-0 ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-gradient-to-br from-indigo-600/20 to-blue-900/20 text-indigo-400"
                }`}>
                  {isActive && isPlaying ? (
                    <Volume2 size={18} />
                  ) : (
                    <Radio size={18} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${isActive ? "text-primary" : "text-foreground"}`}>
                    {station.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {station.country} {station.reciter}
                  </p>
                </div>
                {isActive && isPlaying && (
                  <div className="flex items-center gap-0.5 shrink-0">
                    {[0, 1, 2].map((j) => (
                      <motion.div
                        key={j}
                        animate={{ scaleY: [1, 2, 1] }}
                        transition={{ duration: 0.4 + j * 0.1, repeat: Infinity }}
                        className="w-0.5 h-2.5 bg-primary rounded-full"
                      />
                    ))}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
