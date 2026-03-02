import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { ArrowLeft, Maximize, Minimize } from "lucide-react";
import { motion } from "framer-motion";

const MAKKAH_STREAMS = [
  { id: "hY5wCJBFGEk", labelKey: "live.officialHaramain" },
  { id: "gCaiPergnbo", labelKey: "live.makkahHD" },
];

export default function MekkahLivePage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeStream, setActiveStream] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setFullscreen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 pb-2">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border shadow-sm">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">{t("live.makkahTitle" as any)}</h1>
          <p className="text-xs text-muted-foreground">{t("live.makkahSubtitle" as any)}</p>
        </div>
        <button onClick={toggleFullscreen} className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border shadow-sm">
          {fullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </button>
      </div>

      {/* Stream selector */}
      <div className="flex gap-2 px-4 py-2">
        {MAKKAH_STREAMS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setActiveStream(i)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeStream === i
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-card border border-border text-muted-foreground"
            }`}
          >
            {t(s.labelKey as any)}
          </button>
        ))}
      </div>

      {/* Video */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="px-4 mt-2"
      >
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-xl border border-border/50 bg-black">
          <iframe
            key={MAKKAH_STREAMS[activeStream].id}
            src={`https://www.youtube.com/embed/${MAKKAH_STREAMS[activeStream].id}?autoplay=1&mute=0&rel=0`}
            title="Makkah Live"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
      </motion.div>

      {/* Info card */}
      <div className="px-4 mt-4">
        <div className="p-4 bg-gradient-to-br from-primary/10 to-accent/5 rounded-2xl border border-primary/20 shadow-sm">
          <p className="text-sm font-bold text-foreground">🕋 {t("live.makkahInfo" as any)}</p>
          <p className="text-xs text-muted-foreground mt-1">{t("live.makkahDesc" as any)}</p>
        </div>
      </div>
    </div>
  );
}
