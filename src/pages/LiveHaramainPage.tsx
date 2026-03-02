import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { ArrowLeft, Maximize2, Volume2, VolumeX, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

const STREAMS: Record<string, { label: string; sources: string[] }> = {
  makkah: {
    label: "🕋 Makkah",
    sources: [
      "https://streamer-1.toffeelive.com/live/quran_tv_576/index.m3u8",
      "http://m.live.net.sa:1935/live/quran/playlist.m3u8",
    ],
  },
  madinah: {
    label: "🕌 Madinah",
    sources: [
      "https://streamer-1.toffeelive.com/live/sunnah_tv_576/index.m3u8",
    ],
  },
};

export default function LiveHaramainPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [active, setActive] = useState<"makkah" | "madinah">("makkah");
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState(false);
  const [sourceIdx, setSourceIdx] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentSources = STREAMS[active].sources;

  useEffect(() => {
    setError(false);
    setSourceIdx(0);
  }, [active]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const src = currentSources[sourceIdx];
    if (!src) { setError(true); return; }

    video.src = src;
    video.load();
    video.play().catch(() => {});

    const onError = () => {
      if (sourceIdx + 1 < currentSources.length) {
        setSourceIdx(i => i + 1);
      } else {
        setError(true);
      }
    };
    video.addEventListener("error", onError);
    return () => video.removeEventListener("error", onError);
  }, [active, sourceIdx, currentSources]);

  const toggleFullscreen = () => {
    const el = document.getElementById("haramain-stream");
    if (el) {
      if (document.fullscreenElement) document.exitFullscreen();
      else el.requestFullscreen?.();
    }
  };

  const retry = () => {
    setError(false);
    setSourceIdx(0);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="flex items-center gap-3 p-4 pb-2">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border shadow-sm">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">🕋 {t("liveHaramain.title" as any)}</h1>
          <p className="text-xs text-muted-foreground">{t("liveHaramain.subtitle" as any)}</p>
        </div>
        <button onClick={() => setMuted(m => !m)} className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border shadow-sm">
          {muted ? <VolumeX className="w-4 h-4 text-muted-foreground" /> : <Volume2 className="w-4 h-4 text-muted-foreground" />}
        </button>
        <button onClick={toggleFullscreen} className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border shadow-sm">
          <Maximize2 className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="px-4 mt-2 flex gap-2">
        {(["makkah", "madinah"] as const).map(city => (
          <button
            key={city}
            onClick={() => setActive(city)}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border ${
              active === city
                ? "bg-primary text-primary-foreground border-primary shadow-md"
                : "bg-card text-muted-foreground border-border"
            }`}
          >
            {STREAMS[city].label} {t(`liveHaramain.${city}` as any)}
          </button>
        ))}
      </div>

      <motion.div key={active} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 mt-3">
        <div id="haramain-stream" className="rounded-2xl overflow-hidden border border-border shadow-lg aspect-video bg-black relative">
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/80">
              <p className="text-sm">⚠️ {t("liveHaramain.streamError" as any) || "Flux indisponible"}</p>
              <button onClick={retry} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold">
                <RefreshCw size={14} /> {t("common.retry" as any) || "Réessayer"}
              </button>
            </div>
          ) : (
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted={muted}
              controls
            />
          )}
        </div>
      </motion.div>

      <div className="px-4 mt-3">
        <div className="p-4 rounded-2xl bg-card border border-border">
          <h3 className="font-semibold text-foreground text-sm mb-1">
            {active === "makkah" ? "🕋 Al-Masjid al-Haram" : "🕌 Al-Masjid an-Nabawi"}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t(active === "makkah" ? "liveHaramain.makkahDesc" as any : "liveHaramain.madinahDesc" as any)}
          </p>
        </div>
      </div>

      <div className="px-4 mt-2">
        <p className="text-[10px] text-muted-foreground text-center">
          📡 {t("liveHaramain.liveNote" as any) || "Diffusion en direct depuis l'Arabie Saoudite"}
        </p>
      </div>
    </div>
  );
}
