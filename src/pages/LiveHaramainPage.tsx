import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { ArrowLeft, Maximize2 } from "lucide-react";
import { motion } from "framer-motion";

const STREAMS = {
  makkah: "https://www.youtube.com/embed/0QGuK8osn04?autoplay=1&mute=0&controls=1",
  madinah: "https://www.youtube.com/embed/rHWSRMcGGBQ?autoplay=1&mute=0&controls=1",
};

export default function LiveHaramainPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [active, setActive] = useState<"makkah" | "madinah">("makkah");

  const toggleFullscreen = () => {
    const el = document.getElementById("haramain-stream");
    if (el) {
      if (document.fullscreenElement) document.exitFullscreen();
      else el.requestFullscreen?.();
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
          <h1 className="text-xl font-bold text-foreground">🕋 {t("liveHaramain.title" as any)}</h1>
          <p className="text-xs text-muted-foreground">{t("liveHaramain.subtitle" as any)}</p>
        </div>
        <button onClick={toggleFullscreen} className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border shadow-sm">
          <Maximize2 className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Tabs */}
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
            {city === "makkah" ? "🕋" : "🕌"} {t(`liveHaramain.${city}` as any)}
          </button>
        ))}
      </div>

      {/* Stream */}
      <motion.div
        key={active}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="px-4 mt-3"
      >
        <div id="haramain-stream" className="rounded-2xl overflow-hidden border border-border shadow-lg aspect-video bg-black">
          <iframe
            src={STREAMS[active]}
            className="w-full h-full"
            allow="autoplay; fullscreen; encrypted-media"
            allowFullScreen
            title={`Live ${active}`}
          />
        </div>
      </motion.div>

      {/* Description */}
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
    </div>
  );
}
