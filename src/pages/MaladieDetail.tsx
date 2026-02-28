import { useParams, useNavigate } from "react-router-dom";
import { getMaladieById } from "@/data/maladiesPresets";
import { ArrowLeft, Play, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { useGlobalAudio } from "@/hooks/useGlobalAudio";
import { useCallback } from "react";

export default function MaladieDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const maladie = getMaladieById(id || "");
  const { play } = useGlobalAudio();

  const handleListen = useCallback(() => {
    if (!maladie) return;
    const first = maladie.verses[0];
    if (!first) return;
    const startAyah = first.start ? first.start - 1 : first.ayahs ? first.ayahs[0] - 1 : 0;
    play(first.surahNumber, first.surahName, first.surahNameArabic, first.end || 286, startAyah);
  }, [maladie, play]);

  if (!maladie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Maladie non trouvée</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${maladie.color} relative`}>
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
            {maladie.emoji}
          </motion.span>

          <div>
            <h1 className="text-2xl font-bold text-white">{maladie.title}</h1>
            <p className="text-white/50 text-lg mt-1">{maladie.titleAr}</p>
            <p className="text-white/70 text-sm mt-3 max-w-xs mx-auto">{maladie.subtitle}</p>
          </div>

          <div className="text-white/40 text-xs">
            {maladie.verses.length} passages · {maladie.verses.reduce((acc, v) => {
              if (v.start && v.end) return acc + (v.end - v.start + 1);
              if (v.ayahs) return acc + v.ayahs.length;
              return acc;
            }, 0)} versets
          </div>

          <div className="flex flex-col gap-3 w-full max-w-xs mt-4">
            <button
              onClick={handleListen}
              className="flex items-center justify-center gap-3 bg-white/15 hover:bg-white/25 text-white font-semibold py-4 rounded-2xl border border-white/20 transition-colors"
            >
              <Play size={22} fill="white" />
              {maladie.loop ? "🔁 Écouter en boucle" : "▶️ Écouter"}
            </button>
            <button
              onClick={() => {
                const first = maladie.verses[0];
                if (first) {
                  const ayah = first.start || (first.ayahs ? first.ayahs[0] : 1);
                  navigate(`/reading?surah=${first.surahNumber}&ayah=${ayah}`);
                }
              }}
              className="flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 text-white/90 font-medium py-4 rounded-2xl border border-white/10 transition-colors"
            >
              <BookOpen size={20} />
              📖 Lire les versets
            </button>
          </div>

          {/* Verses list */}
          <div className="w-full max-w-xs mt-6 space-y-2">
            {maladie.verses.map((v, i) => (
              <button
                key={i}
                onClick={() => {
                  const ayah = v.start || (v.ayahs ? v.ayahs[0] : 1);
                  navigate(`/reading?surah=${v.surahNumber}&ayah=${ayah}`);
                }}
                className="w-full flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-left transition-colors"
              >
                <span className="font-arabic text-white/80">{v.surahNameArabic}</span>
                <span className="text-white/50 text-xs flex-1">{v.surahName}</span>
                <span className="text-white/30 text-[10px]">
                  {v.start && v.end ? `${v.start}-${v.end}` : v.ayahs?.join(", ")}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
