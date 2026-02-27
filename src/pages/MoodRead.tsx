import { useParams, useNavigate } from "react-router-dom";
import { getMoodById, MoodVerse } from "@/data/moodPresets";
import { ArrowLeft, Play, Pause, Repeat, Minus, Plus } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FlatAyah {
  surahNumber: number;
  surahName: string;
  surahNameArabic: string;
  ayahNumber: number;
  text: string;
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

  const [fontSize, setFontSize] = useState(30);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loopEnabled, setLoopEnabled] = useState(mood?.loop ?? false);
  const [ayahs, setAyahs] = useState<FlatAyah[]>([]);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ayahListRef = useRef<{ surahNumber: number; surahName: string; surahNameArabic: string; ayahNumber: number }[]>([]);

  // Fetch all ayah texts
  useEffect(() => {
    if (!mood) return;
    const list = expandVerses(mood.verses);
    ayahListRef.current = list;

    const fetchTexts = async () => {
      setLoading(true);
      const surahCache: Record<number, any[]> = {};
      const results: FlatAyah[] = [];

      for (const item of list) {
        if (!surahCache[item.surahNumber]) {
          try {
            const res = await fetch(`https://api.alquran.cloud/v1/surah/${item.surahNumber}`);
            const data = await res.json();
            surahCache[item.surahNumber] = data.data?.ayahs || [];
          } catch {
            surahCache[item.surahNumber] = [];
          }
        }
        const ayah = surahCache[item.surahNumber].find((a: any) => a.numberInSurah === item.ayahNumber);
        results.push({
          surahNumber: item.surahNumber,
          surahName: item.surahName,
          surahNameArabic: item.surahNameArabic,
          ayahNumber: item.ayahNumber,
          text: ayah?.text || "",
        });
      }
      setAyahs(results);
      setLoading(false);
    };
    fetchTexts();
  }, [mood]);

  // Play audio for current ayah
  const playCurrentAyah = useCallback(async (index: number) => {
    if (index >= ayahs.length) {
      if (loopEnabled) {
        setCurrentIndex(0);
        // will re-trigger via effect
        return;
      }
      setIsPlaying(false);
      return;
    }

    const ayah = ayahs[index];
    // Fetch audio URL
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/ayah/${ayah.surahNumber}:${ayah.ayahNumber}/ar.alafasy`);
      const data = await res.json();
      const audioUrl = data.data?.audio;
      if (!audioUrl) {
        // Skip to next
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

  // React to currentIndex change when playing
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
      // If at end, restart
      if (currentIndex >= ayahs.length) setCurrentIndex(0);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  if (!mood) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Introuvable</div>;
  }

  const currentAyah = ayahs[currentIndex];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${mood.color} relative flex flex-col`}>
      {/* Deep overlay */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => { audioRef.current?.pause(); navigate(-1); }} className="p-2 rounded-full bg-white/10 text-white">
            <ArrowLeft size={20} />
          </button>
          <div className="text-center">
            <span className="text-xl">{mood.emoji}</span>
            <p className="text-white/80 text-xs font-medium">{mood.title}</p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setFontSize(s => Math.max(18, s - 2))} className="p-2 rounded-full bg-white/10 text-white">
              <Minus size={16} />
            </button>
            <span className="text-white/60 text-xs w-6 text-center">{fontSize}</span>
            <button onClick={() => setFontSize(s => Math.min(50, s + 2))} className="p-2 rounded-full bg-white/10 text-white">
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Main text area */}
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          {loading ? (
            <div className="text-white/50 text-lg animate-pulse">تحميل الآيات...</div>
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
                <p className="text-white/50 text-sm">
                  {currentAyah.surahNameArabic} · آية {currentAyah.ayahNumber}
                </p>
              </motion.div>
            </AnimatePresence>
          ) : (
            <p className="text-white/50">Fin des versets</p>
          )}
        </div>

        {/* Bottom controls */}
        <div className="px-6 pb-8 pt-4 flex flex-col items-center gap-4">
          {/* Progress */}
          <div className="w-full max-w-xs">
            <div className="flex justify-between text-white/40 text-[10px] mb-1">
              <span>Verset {Math.min(currentIndex + 1, ayahs.length)}/{ayahs.length}</span>
              <span>{currentAyah?.surahName || ""}</span>
            </div>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/40 rounded-full transition-all"
                style={{ width: `${ayahs.length ? ((currentIndex + 1) / ayahs.length) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Controls */}
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
