import { useState } from "react";
import { surahs } from "@/data/surahs";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";

interface SurahSelectorProps {
  selectedSurah: number;
  onSelect: (num: number) => void;
}

export default function SurahSelector({ selectedSurah, onSelect }: SurahSelectorProps) {
  const { t } = useLanguage();
  const [playingAudio, setPlayingAudio] = useState<number | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const juz30Surahs = surahs.filter((s) => s.number >= 78 && s.number <= 114);
  const selectedSurahData = juz30Surahs.find((s) => s.number === selectedSurah);

  const playAudio = (surahNumber: number) => {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }

    if (playingAudio === surahNumber) {
      setPlayingAudio(null);
      setAudioElement(null);
      return;
    }

    const audioUrl = `https://everyayah.com/data/Alafasy_128kbps/${String(surahNumber).padStart(3, "0")}001.mp3`;
    const audio = new Audio(audioUrl);
    audio.play().catch((err) => console.error("Audio play error:", err));
    audio.onended = () => {
      setPlayingAudio(null);
      setAudioElement(null);
    };
    setPlayingAudio(surahNumber);
    setAudioElement(audio);
  };

  return (
    <div className="space-y-3">
      {/* Selected surah card */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-4 border border-border/40">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {t("tarteel.selectedSurah" as any)}
            </p>
            <p className="text-sm font-bold mt-0.5">
              {selectedSurahData?.number}. {selectedSurahData?.name}
            </p>
            <p className="text-xs text-muted-foreground font-arabic">
              {selectedSurahData?.nameArabic}
            </p>
          </div>

          <Button
            variant={playingAudio === selectedSurah ? "destructive" : "outline"}
            size="icon"
            onClick={() => playAudio(selectedSurah)}
            className="rounded-full w-12 h-12"
          >
            {playingAudio === selectedSurah ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </Button>
        </div>
      </div>

      {/* Surah grid */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-2">
          {t("tarteel.chooseSurah" as any)}
        </p>
        <div className="grid grid-cols-5 gap-1.5">
          {juz30Surahs.map((surah) => (
            <button
              key={surah.number}
              onClick={() => onSelect(surah.number)}
              className={`relative p-2 rounded-xl text-xs font-medium transition-all ${
                selectedSurah === surah.number
                  ? "bg-primary text-primary-foreground shadow-lg scale-105"
                  : "bg-card hover:bg-muted border border-border/30"
              }`}
            >
              {playingAudio === surah.number && (
                <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              )}
              <p className="font-bold">{surah.number}</p>
              <p className="text-[9px] truncate opacity-80">{surah.name}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
