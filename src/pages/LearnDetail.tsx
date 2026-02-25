import { useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Square, Volume2 } from "lucide-react";
import { getSurahByNumber } from "@/data/surahs";
import { useProgress } from "@/hooks/useProgress";

export default function LearnDetail() {
  const { surahNumber } = useParams();
  const navigate = useNavigate();
  const { updateSurahProgress } = useProgress();
  const [playing, setPlaying] = useState(false);
  const [currentAyah, setCurrentAyah] = useState(-1);
  const [audioLoading, setAudioLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ayahAudiosRef = useRef<string[]>([]);

  const surah = getSurahByNumber(Number(surahNumber));

  const playAyah = useCallback((index: number, urls: string[], surahNum: number) => {
    if (index >= urls.length) {
      setPlaying(false);
      setCurrentAyah(-1);
      updateSurahProgress(surahNum, 70);
      return;
    }
    setCurrentAyah(index);
    const audio = new Audio(urls[index]);
    audioRef.current = audio;
    audio.onended = () => playAyah(index + 1, urls, surahNum);
    audio.onerror = () => playAyah(index + 1, urls, surahNum);
    audio.play().catch(() => playAyah(index + 1, urls, surahNum));
  }, [updateSurahProgress]);

  const fetchAndPlayAudio = useCallback(async () => {
    if (!surah) return;
    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
      setCurrentAyah(-1);
      return;
    }
    setAudioLoading(true);
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surah.number}/ar.alafasy`);
      const data = await res.json();
      if (data.data?.ayahs) {
        const urls = data.data.ayahs.map((a: { audio: string }) => a.audio);
        ayahAudiosRef.current = urls;
        setPlaying(true);
        setAudioLoading(false);
        playAyah(0, urls, surah.number);
      }
    } catch {
      setAudioLoading(false);
    }
  }, [playing, surah, playAyah]);

  if (!surah) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Sourate introuvable</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      <div className="px-6 pt-14 pb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground mb-4">
          <ArrowLeft size={20} />
          <span className="text-sm">Retour</span>
        </button>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="font-arabic text-3xl text-primary mb-1">{surah.nameArabic}</p>
          <h1 className="text-xl font-bold text-foreground">{surah.frenchName}</h1>
          <p className="text-xs text-muted-foreground mt-1">{surah.versesCount} versets · Sourate n°{surah.number}</p>
        </motion.div>
      </div>

      <div className="flex justify-center mb-6">
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={fetchAndPlayAudio}
          disabled={audioLoading}
          className={`flex items-center gap-3 px-8 py-3.5 rounded-full font-semibold transition-colors ${
            playing ? "bg-destructive/10 text-destructive border-2 border-destructive" : "bg-primary text-primary-foreground"
          }`}
        >
          {audioLoading ? (
            <><div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> Chargement...</>
          ) : playing ? (
            <><Square size={18} /> Arrêter</>
          ) : (
            <><Play size={18} /> Écouter la récitation</>
          )}
        </motion.button>
      </div>

      <div className="px-6 space-y-4">
        {surah.ayahs.map((ayah, i) => (
          <motion.div
            key={ayah.number}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-card border rounded-2xl p-5 transition-all ${currentAyah === i ? "border-primary shadow-lg shadow-primary/10" : "border-border"}`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">{ayah.number}</span>
              {currentAyah === i && <Volume2 size={16} className="text-primary animate-pulse mt-1" />}
            </div>
            <p className="arabic-text text-2xl text-foreground mb-3 leading-[2.6]">{ayah.arabic}</p>
            <p className="text-sm text-primary/80 italic mb-1">{ayah.transliteration}</p>
            <p className="text-sm text-muted-foreground">{ayah.translation}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
