import { useParams, useNavigate } from "react-router-dom";
import { getMoodById } from "@/data/moodPresets";
import { ArrowLeft, Play, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { useGlobalAudio } from "@/hooks/useGlobalAudio";
import { useCallback } from "react";
import { useLanguage } from "@/hooks/useLanguage";

export default function MoodDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const mood = getMoodById(id || "");
  const { play } = useGlobalAudio();
  const { t } = useLanguage();

  const titleKey = `mood.${id}` as any;
  const subKey = `mood.${id}.sub` as any;

  const handleListen = useCallback(() => {
    if (!mood) return;
    const first = mood.verses[0];
    if (!first) return;
    const startAyah = first.start ? first.start - 1 : first.ayahs ? first.ayahs[0] - 1 : 0;
    play(first.surahNumber, first.surahName, first.surahNameArabic, first.end || 286, startAyah);
  }, [mood, play]);

  if (!mood) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{t("moods.notFound")}</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${mood.color} relative`}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative z-10 flex flex-col min-h-screen pb-24">
        <div className="flex items-center gap-3 px-4 py-4">
          <button onClick={() => navigate("/moods")} className="p-2 rounded-full bg-white/10 text-white">
            <ArrowLeft size={20} />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-6">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="text-7xl"
          >
            {mood.emoji}
          </motion.span>

          <div>
            <h1 className="text-2xl font-bold text-white">{t(titleKey) || mood.title}</h1>
            <p className="text-white/50 text-lg mt-1">{mood.titleAr}</p>
            <p className="text-white/70 text-sm mt-3 max-w-xs mx-auto">{t(subKey) || mood.subtitle}</p>
          </div>

          <div className="text-white/40 text-xs">
            {mood.verses.length} {t("moods.passages")} · {mood.verses.reduce((acc, v) => {
              if (v.start && v.end) return acc + (v.end - v.start + 1);
              if (v.ayahs) return acc + v.ayahs.length;
              return acc;
            }, 0)} {t("moods.verses")}
          </div>

          <div className="flex flex-col gap-3 w-full max-w-xs mt-4">
            <button
              onClick={handleListen}
              className="flex items-center justify-center gap-3 bg-white/15 hover:bg-white/25 text-white font-semibold py-4 rounded-2xl border border-white/20 transition-colors"
            >
              <Play size={22} fill="white" />
              {mood.loop ? t("moods.listenLoop") : t("moods.listen")}
            </button>
            <button
              onClick={() => navigate(`/moods/${mood.id}/read`)}
              className="flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 text-white/90 font-medium py-4 rounded-2xl border border-white/10 transition-colors"
            >
              <BookOpen size={20} />
              {t("moods.viewVerses")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
