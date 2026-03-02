import { useState } from "react";
import { surahs } from "@/data/surahs";
import { Volume2, VolumeX, ChevronDown, ChevronUp } from "lucide-react";
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
  const [showAll, setShowAll] = useState(false);

  const juz30Surahs = surahs.filter((s) => s.number >= 78 && s.number <= 114);
  const popularNumbers = [114, 113, 112, 111, 110];
  const displayedSurahs = showAll
    ? juz30Surahs
    : juz30Surahs.filter((s) => popularNumbers.includes(s.number));
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
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-muted-foreground">
            {showAll ? t("tarteel.allSurahs" as any) : t("tarteel.popularSurahs" as any)}
          </p>
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            {showAll ? (
              <>
                <ChevronUp size={14} />
                {t("tarteel.collapse" as any)}
              </>
            ) : (
              <>
                <ChevronDown size={14} />
                {t("tarteel.seeAll" as any)} ({juz30Surahs.length})
              </>
            )}
          </button>
        </div>

        <div className={`grid gap-2 ${showAll ? "grid-cols-5" : "grid-cols-3"}`}>
          {displayedSurahs.map((surah) => (
            <button
              key={surah.number}
              onClick={() => onSelect(surah.number)}
              className={`relative p-3 rounded-xl text-xs font-medium transition-all ${
                selectedSurah === surah.number
                  ? "bg-primary text-primary-foreground shadow-lg scale-105 ring-2 ring-primary/30"
                  : "bg-card hover:bg-muted border border-border/30"
              }`}
            >
              {playingAudio === surah.number && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full animate-pulse bg-green-500" />
              )}
              <p className="font-bold">{surah.number}</p>
              <p className="text-[9px] truncate opacity-80">{surah.name}</p>
              {!showAll && (
                <p className="text-[8px] truncate opacity-60 mt-0.5">{surah.frenchName}</p>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
