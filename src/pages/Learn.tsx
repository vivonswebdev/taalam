import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { surahs } from "@/data/surahs";
import { useProgress } from "@/hooks/useProgress";
import { useLanguage } from "@/hooks/useLanguage";
import SurahCard from "@/components/SurahCard";

export default function Learn() {
  const navigate = useNavigate();
  const { progress } = useProgress();
  const { t } = useLanguage();

  if (!progress.level) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center pb-24">
        <h2 className="text-xl font-bold text-foreground mb-2">{t("learn.determineLevel")}</h2>
        <p className="text-muted-foreground mb-6 text-sm">{t("learn.takeQuiz")}</p>
        <button onClick={() => navigate("/quiz")} className="bg-primary text-primary-foreground rounded-2xl px-6 py-3 font-semibold flex items-center gap-2 active:scale-[0.98] transition-transform">
          {t("learn.startQuiz")} <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  const levelLabel = progress.level === "easy" ? t("home.level.easy") : progress.level === "medium" ? t("home.level.medium") : t("home.level.hard");

  return (
    <div className="min-h-screen pb-24">
      <div className="px-6 pt-14 pb-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-2xl font-bold text-foreground">{t("learn.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("home.level")} <span className="text-primary font-medium">{levelLabel}</span> · {surahs.length} {t("learn.surahs")}
          </p>
        </motion.div>
      </div>

      <div className="px-6 space-y-3">
        {surahs.map((surah, i) => (
          <SurahCard key={surah.number} surah={surah} progress={progress.surahProgress.find((s) => s.surahNumber === surah.number)} onClick={() => navigate(`/learn/${surah.number}`)} index={i} />
        ))}
      </div>
    </div>
  );
}
