import { useParams, useNavigate } from "react-router-dom";
import { getMoodById, MoodVerse } from "@/data/moodPresets";
import { ArrowLeft, Play, Pause, Repeat, Minus, Plus } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { useTranslationPreference } from "@/hooks/useTranslationPreference";
import moodSleep from "@/assets/mood-sleep.jpg";
import moodEmotion from "@/assets/mood-emotion.jpg";
import moodRuqya from "@/assets/mood-ruqya.jpg";
import moodStudy from "@/assets/mood-study.jpg";
import moodSuccess from "@/assets/mood-success.jpg";

const MOOD_BG: Record<string, string> = {
  sleep: moodSleep,
  emotion: moodEmotion,
  ruqya: moodRuqya,
  study: moodStudy,
  success: moodSuccess,
};

interface FlatAyah {
  surahNumber: number;
  surahName: string;
  surahNameArabic: string;
  ayahNumber: number;
  text: string;
  translation: string;
}

function expandVerses(verses: MoodVerse[]): { surahNumber: number; surahName: string; surahNameArabic: string; ayahNumber: number }[] {
  const result: { surahNumber: number; surahName: string; surahNameArabic: string; ayahNumber: number }[] = [];
  for (const v of verses) {
    if (v.start && v.end) {
      for (let i = v.start; i <= v.end; i++) {
        result.push({ surahNumber: v.surahNumber, surahName: v.surahName, surahNameArabic: v.surahNameArabic, ayahNumber: i });
      }
    } else if (v.ayahs) {
      for (const a of v.ayahs) {
        result.push({ surahNumber: v.surahNumber, surahName: v.surahName, surahNameArabic: v.surahNameArabic, ayahNumber: a });
      }
    }
  }
  return result;
}

export default function MoodRead() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const mood = getMoodById(id || "");
  const { t } = useLanguage();
  const { resolvedEditionId, isArabicOnly } = useTranslationPreference();
  const [fontSize, setFontSize] = useState(() => {
    try { return parseInt(localStorage.getItem("taaloum_mood_fontsize") || "30") || 30; } catch { return 30; }
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loopEnabled, setLoopEnabled] = useState(mood?.loop ?? false);
  const [ayahs, setAyahs] = useState<FlatAyah[]>([]);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ayahListRef = useRef<{ surahNumber: number; surahName: string; surahNameArabic: string; ayahNumber: number }[]>([]);

  const titleKey = `mood.${id}` as any;

  useEffect(() => {
    if (!mood) return;
    const list = expandVerses(mood.verses);
    ayahListRef.current = list;

    const fetchTexts = async () => {
      setLoading(true);
      const surahCache: Record<number, any[]> = {};
      const translationCache: Record<number, any[]> = {};
      const results: FlatAyah[] = [];

      for (const item of list) {
        if (!surahCache[item.surahNumber]) {
          try {
            const [arRes, trRes] = await Promise.all([
              fetch(`https://api.alquran.cloud/v1/surah/${item.surahNumber}`),
              isArabicOnly ? Promise.resolve(null) : fetch(`https://api.alquran.cloud/v1/surah/${item.surahNumber}/${resolvedEditionId}`),
            ]);
            const arData = await arRes.json();
            surahCache[item.surahNumber] = arData.data?.ayahs || [];
            if (trRes) {
              const trData = await trRes.json();
              translationCache[item.surahNumber] = trData.data?.ayahs || [];
            }
          } catch {
            surahCache[item.surahNumber] = [];
          }
        }
        const ayah = surahCache[item.surahNumber].find((a: any) => a.numberInSurah === item.ayahNumber);
        const trAyah = translationCache[item.surahNumber]?.find((a: any) => a.numberInSurah === item.ayahNumber);
        results.push({
          surahNumber: item.surahNumber,
          surahName: item.surahName,
          surahNameArabic: item.surahNameArabic,
          ayahNumber: item.ayahNumber,
          text: ayah?.text || "",
          translation: trAyah?.text || "",
        });
      }
      setAyahs(results);
      setLoading(false);
    };
    fetchTexts();
  }, [mood, resolvedEditionId, isArabicOnly]);

  const playCurrentAyah = useCallback(async (index: number) => {
    if (index >= ayahs.length) {
      if (loopEnabled) {
        setCurrentIndex(0);
        return;
      }
      setIsPlaying(false);
      return;
    }

    const ayah = ayahs[index];
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/ayah/${ayah.surahNumber}:${ayah.ayahNumber}/ar.alafasy`);
      const data = await res.json();
      const audioUrl = data.data?.audio;
      if (!audioUrl) {
        setCurrentIndex(index + 1);
        return;
      }

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        const nextIdx = index + 1;
        if (nextIdx >= ayahs.length && loopEnabled) {
          setCurrentIndex(0);
        } else {
          setCurrentIndex(nextIdx);
        }
      };

      audio.onerror = () => {
        setCurrentIndex(index + 1);
      };

      await audio.play();
    } catch {
      setCurrentIndex(index + 1);
    }
  }, [ayahs, loopEnabled]);

  useEffect(() => {
    if (isPlaying && ayahs.length > 0) {
      playCurrentAyah(currentIndex);
    }
  }, [currentIndex, isPlaying, ayahs.length]); // eslint-disable-line

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      if (currentIndex >= ayahs.length) setCurrentIndex(0);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  if (!mood) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">{t("moods.notFound")}</div>;
  }

  const currentAyah = ayahs[currentIndex];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${mood.color} relative flex flex-col`}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => { audioRef.current?.pause(); navigate(-1); }} className="p-2 rounded-full bg-white/10 text-white">
            <ArrowLeft size={20} />
          </button>
          <div className="text-center">
            <span className="text-xl">{mood.emoji}</span>
            <p className="text-white/80 text-xs font-medium">{t(titleKey) || mood.title}</p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setFontSize(s => { const v = Math.max(18, s - 2); localStorage.setItem("taaloum_mood_fontsize", String(v)); return v; })} className="p-2 rounded-full bg-white/10 text-white">
              <Minus size={16} />
            </button>
            <span className="text-white/60 text-xs w-6 text-center">{fontSize}</span>
            <button onClick={() => setFontSize(s => { const v = Math.min(50, s + 2); localStorage.setItem("taaloum_mood_fontsize", String(v)); return v; })} className="p-2 rounded-full bg-white/10 text-white">
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Main text area */}
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          {loading ? (
            <div className="text-white/50 text-lg animate-pulse">{t("moods.loading")}</div>
          ) : currentAyah ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="text-center max-w-lg"
              >
                <p
                  className="text-white font-arabic leading-[2] mb-6"
                  style={{ fontSize: `${fontSize}px`, fontFamily: "'Amiri', 'Noto Naskh Arabic', serif" }}
                  dir="rtl"
                >
                  {currentAyah.text}
                  <span className="text-white/40 text-lg mr-2">﴿{currentAyah.ayahNumber}﴾</span>
                </p>
                {currentAyah.translation && (
                  <p className="text-white/60 text-sm leading-relaxed mb-4 max-w-md mx-auto italic">
                    {currentAyah.translation}
                  </p>
                )}
                <p className="text-white/50 text-sm">
                  {currentAyah.surahNameArabic} · {t("moods.ayah")} {currentAyah.ayahNumber}
                </p>
              </motion.div>
            </AnimatePresence>
          ) : (
            <p className="text-white/50">{t("moods.endOfVerses")}</p>
          )}
        </div>

        {/* Bottom controls */}
        <div className="px-6 pb-8 pt-4 flex flex-col items-center gap-4">
          <div className="w-full max-w-xs">
            <div className="flex justify-between text-white/40 text-[10px] mb-1">
              <span>{t("moods.verse")} {Math.min(currentIndex + 1, ayahs.length)}/{ayahs.length}</span>
              <span>{currentAyah?.surahName || ""}</span>
            </div>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/40 rounded-full transition-all"
                style={{ width: `${ayahs.length ? ((currentIndex + 1) / ayahs.length) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setLoopEnabled(!loopEnabled)}
              className={`p-3 rounded-full transition-colors ${loopEnabled ? "bg-white/20 text-white" : "bg-white/5 text-white/40"}`}
            >
              <Repeat size={20} />
            </button>
            <button
              onClick={togglePlay}
              className="p-5 rounded-full bg-white/20 text-white border border-white/20 hover:bg-white/30 transition-colors"
            >
              {isPlaying ? <Pause size={28} /> : <Play size={28} fill="white" />}
            </button>
            <button
              onClick={() => {
                if (currentIndex < ayahs.length - 1) setCurrentIndex(currentIndex + 1);
                else if (loopEnabled) setCurrentIndex(0);
              }}
              className="p-3 rounded-full bg-white/5 text-white/60"
            >
              <span className="text-sm font-bold">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
