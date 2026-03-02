import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { ArrowLeft, Maximize, RefreshCw } from "lucide-react";

const MAKKAH_SOURCES = [
  "https://streamer-1.toffeelive.com/live/quran_tv_576/index.m3u8",
  "http://m.live.net.sa:1935/live/quran/playlist.m3u8",
];

export default function MekkahLivePage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [sourceIdx, setSourceIdx] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || error) return;
    const src = MAKKAH_SOURCES[sourceIdx];
    if (!src) { setError(true); return; }
    video.src = src;
    video.load();
    video.play().catch(() => {});
    const onError = () => {
      if (sourceIdx + 1 < MAKKAH_SOURCES.length) setSourceIdx(i => i + 1);
      else setError(true);
    };
    video.addEventListener("error", onError);
    return () => video.removeEventListener("error", onError);
  }, [sourceIdx, error]);

  const toggleFullscreen = () => {
    const el = document.getElementById("makkah-stream");
    if (el) {
      if (document.fullscreenElement) document.exitFullscreen();
      else el.requestFullscreen?.();
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="flex items-center gap-3 p-4 pb-2">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border shadow-sm">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground flex-1">🕋 {t("liveHaramain.makkah" as any) || "Makkah Live"}</h1>
        <button onClick={toggleFullscreen} className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border shadow-sm">
          <Maximize className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="px-4 mt-2">
        <div id="makkah-stream" className="rounded-2xl overflow-hidden border border-border shadow-lg aspect-video bg-black relative">
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/80">
              <p className="text-sm">⚠️ Flux indisponible</p>
              <button onClick={() => { setError(false); setSourceIdx(0); }} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold">
                <RefreshCw size={14} /> Réessayer
              </button>
            </div>
          ) : (
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline controls />
          )}
        </div>
      </div>

      <div className="px-4 mt-3">
        <div className="p-4 rounded-2xl bg-card border border-border">
          <h3 className="font-semibold text-foreground text-sm mb-1">🕋 Al-Masjid al-Haram</h3>
          <p className="text-xs text-muted-foreground">
            {t("liveHaramain.makkahDesc" as any) || "Diffusion en direct depuis la Mosquée Sacrée de La Mecque."}
          </p>
        </div>
      </div>
    </div>
  );
}
