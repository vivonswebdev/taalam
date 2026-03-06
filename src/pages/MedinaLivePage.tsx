import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { ArrowLeft, Maximize } from "lucide-react";

export default function MedinaLivePage() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const toggleFullscreen = () => {
    const el = document.getElementById("medina-stream");
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
        <h1 className="text-lg font-bold text-foreground flex-1">🕌 {t("liveHaramain.madinah" as any) || "Madinah Live"}</h1>
        <button onClick={toggleFullscreen} className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border shadow-sm">
          <Maximize className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="px-4 mt-2">
        <div id="medina-stream" className="rounded-2xl overflow-hidden border border-border shadow-lg aspect-video bg-black relative">
          <iframe
            src="https://www.youtube.com/embed/nlH55BVcdR0?autoplay=1&mute=0&rel=0&modestbranding=1"
            className="w-full h-full absolute inset-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Madinah Live"
          />
        </div>
      </div>

      <div className="px-4 mt-3">
        <div className="p-4 rounded-2xl bg-card border border-border">
          <h3 className="font-semibold text-foreground text-sm mb-1">🕌 Al-Masjid an-Nabawi</h3>
          <p className="text-xs text-muted-foreground">
            {t("liveHaramain.madinahDesc" as any) || "Diffusion en direct depuis la Mosquée du Prophète à Médine."}
          </p>
        </div>
      </div>
    </div>
  );
}
