import { motion } from "framer-motion";
import { BookOpen, Play, AlertTriangle } from "lucide-react";
import { useWeakSurahs } from "@/hooks/useWeakSurahs";
import { useGlobalAudio } from "@/hooks/useGlobalAudio";
import { surahs } from "@/data/surahs";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function WeakSurahsSection() {
  const { user } = useAuth();
  const { weakSurahs, loading } = useWeakSurahs();
  const globalAudio = useGlobalAudio();
  const navigate = useNavigate();

  // Only show surahs with score > 0.2
  const top3 = weakSurahs.filter((w) => w.weakness_score > 0.2).slice(0, 3);

  if (!user || loading || top3.length === 0) return null;

  const playWeakPlaylist = () => {
    const first = top3[0];
    const surah = surahs.find((s) => s.number === first.surah_number);
    if (!surah) return;
    globalAudio.setContinuousMode(false);
    globalAudio.play(surah.number, surah.name, surah.nameArabic, surah.versesCount, 0);
  };

  const strengthLabel = (score: number) => {
    if (score >= 0.7) return { text: "Très faible", color: "text-destructive" };
    if (score >= 0.4) return { text: "À revoir", color: "text-yellow-600" };
    return { text: "Presque ok", color: "text-muted-foreground" };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.52 }}
      className="px-6 mt-4"
    >
      <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-yellow-600" />
            <h3 className="text-sm font-bold text-foreground">À revoir</h3>
          </div>
          <button
            onClick={playWeakPlaylist}
            className="flex items-center gap-1.5 bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-semibold"
          >
            <Play size={12} /> Tout écouter
          </button>
        </div>

        {top3.map((w, i) => {
          const surah = surahs.find((s) => s.number === w.surah_number);
          if (!surah) return null;
          const label = strengthLabel(w.weakness_score);
          return (
            <button
              key={w.surah_number}
              onClick={() => navigate(`/reading?surah=${surah.number}`)}
              className="w-full flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
            >
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                {surah.number}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {surah.name} <span className="font-arabic text-xs text-muted-foreground">{surah.nameArabic}</span>
                </p>
                <p className={`text-[10px] font-semibold ${label.color}`}>{label.text}</p>
              </div>
              <div className="w-12 bg-muted rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-destructive rounded-full transition-all"
                  style={{ width: `${Math.round(w.weakness_score * 100)}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
