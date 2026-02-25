import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Volume2, Palette } from "lucide-react";
import AudioPlayer from "@/components/AudioPlayer";
import TajwidBar from "@/components/TajwidBar";
import TajwidAyahText from "@/components/TajwidAyahText";
import { analyzeAyahTajwid } from "@/data/tajwidRules";
import { Switch } from "@/components/ui/switch";
import type { Surah } from "@/data/surahs";

interface ReadOnlyModeProps {
  surah: Surah;
  translations: Record<number, string>;
  isArabicOnly: boolean;
  lang: string;
  onBack: () => void;
  isChildMode: boolean;
  t: (key: string) => string;
}

export default function ReadOnlyMode({
  surah,
  translations,
  isArabicOnly,
  lang,
  onBack,
  isChildMode,
  t,
}: ReadOnlyModeProps) {
  const [currentAyah, setCurrentAyah] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [tajwidEnabled, setTajwidEnabled] = useState(true);
  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  const ayahRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Media Session API for background playback
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: `${surah.nameArabic} - ${surah.name}`,
      artist: "QuranEasy",
      album: "Quran",
    });

    navigator.mediaSession.setActionHandler("play", () => {});
    navigator.mediaSession.setActionHandler("pause", () => {});

    return () => {
      navigator.mediaSession.metadata = null;
    };
  }, [surah]);

  // Auto-scroll to current ayah when playing
  useEffect(() => {
    if (!playing) return;
    const el = ayahRefs.current.get(currentAyah);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentAyah, playing]);

  const setAyahRef = useCallback((index: number, el: HTMLDivElement | null) => {
    if (el) {
      ayahRefs.current.set(index, el);
    } else {
      ayahRefs.current.delete(index);
    }
  }, []);

  const jumpToAyahRef = useRef<((index: number) => void) | null>(null);

  const handleAyahClick = useCallback((index: number) => {
    jumpToAyahRef.current?.(index);
  }, []);

  const bodyTextClass = isChildMode ? "text-base" : "text-sm";

  return (
    <div className="px-6 space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-muted text-foreground flex items-center justify-center"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 text-center">
          <p className="font-arabic text-xl text-primary">{surah.nameArabic}</p>
          <p className="text-xs text-muted-foreground">{surah.name} · {surah.versesCount} {t("detail.verses")}</p>
        </div>
        <div className="w-9" /> {/* spacer */}
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground text-center italic">
        {t("quran.readOnlyDesc")}
      </p>

      {/* Tajwid toggle + bar */}
      <div className="flex items-center justify-between bg-card border border-border rounded-xl px-3 py-2">
        <div className="flex items-center gap-2">
          <Palette size={14} className="text-primary" />
          <span className="text-sm font-medium">Tajwid</span>
        </div>
        <Switch checked={tajwidEnabled} onCheckedChange={setTajwidEnabled} />
      </div>

      {tajwidEnabled && (
        <TajwidBar
          activeRules={(() => {
            const ayah = surah.ayahs[currentAyah];
            if (!ayah) return [];
            const words = analyzeAyahTajwid(ayah.arabic);
            const idx = activeWordIndex >= 0 ? activeWordIndex : 0;
            return words[idx]?.rules || [];
          })()}
          nextRule={(() => {
            const ayah = surah.ayahs[currentAyah];
            if (!ayah) return null;
            const words = analyzeAyahTajwid(ayah.arabic);
            const start = (activeWordIndex >= 0 ? activeWordIndex : 0) + 1;
            for (let j = start; j < words.length; j++) {
              if (words[j].rules.length > 0) {
                return { rule: words[j].rules[0], wordsAhead: j - (activeWordIndex >= 0 ? activeWordIndex : 0) };
              }
            }
            return null;
          })()}
        />
      )}

      {/* Audio Player */}
      <AudioPlayer
        surahNumber={surah.number}
        surahName={surah.name}
        surahNameArabic={surah.nameArabic}
        totalAyahs={surah.ayahs.length}
        onAyahChange={(idx) => { setCurrentAyah(idx); setActiveWordIndex(-1); }}
        onPlayStateChange={setPlaying}
        jumpToAyahRef={jumpToAyahRef}
      />

      {/* Ayahs list */}
      <div className="space-y-3">
        {surah.ayahs.map((ayah, i) => {
          const isActive = i === currentAyah && playing;

          return (
            <motion.div
              key={ayah.number}
              ref={(el) => setAyahRef(i, el)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.6) }}
              onClick={() => handleAyahClick(i)}
              className={`bg-card border rounded-2xl p-4 transition-all duration-300 cursor-pointer ${
                isActive
                  ? "border-primary shadow-lg shadow-primary/10 bg-primary/5 scale-[1.01]"
                  : "border-border hover:border-primary/30"
              }`}
            >
              {/* Aya number */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                  {ayah.number}
                </span>
                {isActive && <Volume2 size={14} className="text-primary animate-pulse mt-1" />}
              </div>

              {/* Arabic text with Tajwid */}
              <TajwidAyahText
                arabicText={ayah.arabic}
                activeWordIndex={isActive ? activeWordIndex : -1}
                onWordTap={(wi) => {
                  setCurrentAyah(i);
                  setActiveWordIndex(wi);
                }}
                tajwidEnabled={tajwidEnabled}
                className={`arabic-text ${isChildMode ? "text-2xl" : "text-xl"} text-foreground mb-2 leading-loose block`}
              />

              {/* Transliteration */}
              {ayah.transliteration && (
                <p className={`${bodyTextClass} text-primary/70 italic mb-1`}>
                  {ayah.transliteration}
                </p>
              )}

              {/* Translation */}
              {!isArabicOnly && (
                <p className={`${bodyTextClass} text-muted-foreground`}>
                  {translations[i] || ayah.translation}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
