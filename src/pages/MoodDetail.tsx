import { useParams, useNavigate } from "react-router-dom";
import { getMoodById } from "@/data/moodPresets";
import { ArrowLeft, Play, BookOpen, Headphones } from "lucide-react";
import { motion } from "framer-motion";
import { useGlobalAudio } from "@/hooks/useGlobalAudio";
import { useCallback, useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import type { MoodVerse } from "@/data/moodPresets";
import { trackMoodVisit } from "@/pages/Moods";

function verseLabel(v: MoodVerse): string {
  if (v.start && v.end) return `${v.start}–${v.end}`;
  if (v.ayahs && v.ayahs.length) {
    if (v.ayahs.length <= 4) return v.ayahs.join(", ");
    return `${v.ayahs[0]}–${v.ayahs[v.ayahs.length - 1]}`;
  }
  return "";
}

function verseCount(v: MoodVerse): number {
  if (v.start && v.end) return v.end - v.start + 1;
  if (v.ayahs) return v.ayahs.length;
  return 0;
}

export default function MoodDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const mood = getMoodById(id || "");
  const { play } = useGlobalAudio();
  const { t } = useLanguage();

  useEffect(() => { if (id) trackMoodVisit(id); }, [id]);

  const titleKey = `mood.${id}` as any;
  const subKey = `mood.${id}.sub` as any;

  const handleListenAll = useCallback(() => {
    if (!mood) return;
    const first = mood.verses[0];
    if (!first) return;
    const startAyah = first.start ? first.start - 1 : first.ayahs ? first.ayahs[0] - 1 : 0;
    play(first.surahNumber, first.surahName, first.surahNameArabic, first.end || 286, startAyah);
  }, [mood, play]);

  const handleListenVerse = useCallback((v: MoodVerse) => {
    const startAyah = v.start ? v.start - 1 : v.ayahs ? v.ayahs[0] - 1 : 0;
    const endAyah = v.end || (v.ayahs ? v.ayahs[v.ayahs.length - 1] : 286);
    play(v.surahNumber, v.surahName, v.surahNameArabic, endAyah, startAyah);
  }, [play]);

  const handleReadVerse = useCallback((v: MoodVerse) => {
    const ayah = v.start || (v.ayahs ? v.ayahs[0] : 1);
    navigate(`/reading?surah=${v.surahNumber}&ayah=${ayah}`);
  }, [navigate]);

  if (!mood) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{t("moods.notFound")}</p>
      </div>
    );
  }

  const totalVerses = mood.verses.reduce((acc, v) => acc + verseCount(v), 0);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${mood.color} relative`}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative z-10 flex flex-col min-h-screen pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4">
          <button onClick={() => navigate("/moods")} className="p-2 rounded-full bg-white/10 text-white">
            <ArrowLeft size={20} />
          </button>
        </div>

        {/* Hero */}
        <div className="flex flex-col items-center px-6 text-center gap-4 pt-2">
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
            {mood.verses.length} {t("moods.passages")} · {totalVerses} {t("moods.verses")}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 w-full max-w-xs mt-2">
            <button
              onClick={handleListenAll}
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

        {/* Verses list */}
        <div className="px-4 mt-8">
          <h2 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3 px-1">
            📖 {t("moods.passages")}
          </h2>
          <div className="space-y-2">
            {mood.verses.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3"
              >
                {/* Surah info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {v.surahName} <span className="text-white/40 font-normal">({v.surahNumber})</span>
                  </p>
                  <p className="text-[11px] text-white/50 mt-0.5">
                    <span className="font-arabic">{v.surahNameArabic}</span>
                    {" · "}
                    {t("moods.verses")}: {verseLabel(v)}
                    {" · "}
                    {verseCount(v)} {t("moods.verses")}
                  </p>
                </div>

                {/* Per-verse actions */}
                <button
                  onClick={() => handleReadVerse(v)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 transition-colors"
                  title={t("moods.viewVerses")}
                >
                  <BookOpen size={16} />
                </button>
                <button
                  onClick={() => handleListenVerse(v)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 transition-colors"
                  title={t("moods.listen")}
                >
                  <Headphones size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
