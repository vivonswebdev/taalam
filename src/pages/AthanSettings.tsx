import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Pause, Volume2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { athanReciters, type AthanReciter } from "@/data/athanData";
import { toast } from "@/components/ui/sonner";
import PageBackground from "@/components/PageBackground";
import BottomNav from "@/components/BottomNav";

export default function AthanSettings() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [selectedId, setSelectedId] = useState(
    () => localStorage.getItem("athan_reciter") || "alafasy"
  );
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [volume, setVolume] = useState(
    () => parseFloat(localStorage.getItem("athan_volume") || "0.8")
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleSelectReciter = (id: string) => {
    setSelectedId(id);
    localStorage.setItem("athan_reciter", id);
    toast.success(t("athan.saved" as any));
  };

  const handlePlayPreview = (reciter: AthanReciter) => {
    if (!reciter.audioUrl) return;

    if (playingId === reciter.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const audio = new Audio(reciter.audioUrl);
    audio.volume = volume;
    audio.play().catch(() => toast.error(t("athan.audioError" as any)));
    audio.onended = () => setPlayingId(null);
    audioRef.current = audio;
    setPlayingId(reciter.id);
  };

  const handleVolumeChange = (value: number[]) => {
    const v = value[0];
    setVolume(v);
    localStorage.setItem("athan_volume", v.toString());
    if (audioRef.current) audioRef.current.volume = v;
  };

  return (
    <PageBackground intensity="medium">
      <div className="min-h-screen pb-24">
        {/* Header */}
        <div className="px-5 pt-10 pb-4">
          <div className="flex items-center gap-3 mb-1">
            <button onClick={() => navigate(-1)} className="p-1.5 rounded-full bg-muted/60 active:scale-95 transition-transform">
              <ArrowLeft size={18} className="text-foreground" />
            </button>
            <div>
              <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xl font-bold text-foreground flex items-center gap-2">
                🕌 {t("athan.title" as any)}
              </motion.h1>
              <p className="text-xs text-muted-foreground">{t("athan.subtitle" as any)}</p>
            </div>
          </div>
        </div>

        <div className="px-4 space-y-4">
          {/* Volume */}
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Volume2 size={16} className="text-primary" />
                <span className="text-sm font-semibold text-foreground">{t("athan.volume" as any)}</span>
              </div>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {Math.round(volume * 100)}%
              </span>
            </div>
            <Slider value={[volume]} onValueChange={handleVolumeChange} min={0} max={1} step={0.05} className="w-full" />
          </div>

          {/* Reciters list */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground px-1">{t("athan.chooseReciter" as any)}</h3>

            {athanReciters.map((reciter, i) => {
              const isSelected = selectedId === reciter.id;
              const isPlaying = playingId === reciter.id;

              return (
                <motion.div
                  key={reciter.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`relative bg-card border rounded-2xl p-4 transition-colors ${
                    isSelected ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  {reciter.popular && (
                    <span className="absolute -top-2 right-3 text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">
                      ⭐ {t("athan.popular" as any)}
                    </span>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{reciter.name}</p>
                      <p className="text-xs text-muted-foreground font-arabic truncate">{reciter.nameArabic}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {reciter.country} • ⏱️ {Math.floor(reciter.duration / 60)}:{(reciter.duration % 60).toString().padStart(2, "0")}
                      </p>
                      <p className="text-[10px] text-muted-foreground/80 mt-0.5">{t(reciter.descriptionKey as any)}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {reciter.audioUrl && (
                        <Button
                          size="icon"
                          variant={isPlaying ? "default" : "outline"}
                          onClick={() => handlePlayPreview(reciter)}
                          className="rounded-full w-9 h-9"
                        >
                          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => handleSelectReciter(reciter.id)}
                        className="rounded-full w-9 h-9"
                      >
                        {isSelected ? <Check size={14} /> : <span className="w-3 h-3 rounded-full border-2 border-current" />}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Info */}
          <div className="bg-muted/50 rounded-2xl p-4">
            <p className="text-xs font-semibold text-foreground mb-1">ℹ️ {t("athan.info" as any)}</p>
            <p className="text-[10px] text-muted-foreground leading-relaxed">{t("athan.infoDesc" as any)}</p>
          </div>
        </div>

        <BottomNav />
      </div>
    </PageBackground>
  );
}
