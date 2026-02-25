import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useProgress } from "@/hooks/useProgress";
import { juzData, getSurahsInJuz, getJuzLabel } from "@/data/juzData";
import { surahs } from "@/data/surahs";

function getJuzScore(juzNumber: number, surahProgress: { surahNumber: number; bestScore: number }[]): number {
  const surahsInJuz = getSurahsInJuz(juzNumber);
  const availableSurahs = surahsInJuz.filter((sj) => surahs.some((s) => s.number === sj.surahNumber));
  if (availableSurahs.length === 0) return -1; // No data available

  const scores = availableSurahs.map((sj) => {
    const progress = surahProgress.find((sp) => sp.surahNumber === sj.surahNumber);
    return progress ? progress.bestScore : 0;
  });

  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

function getScoreColor(score: number): string {
  if (score < 0) return "bg-muted text-muted-foreground";
  if (score < 50) return "bg-destructive/15 text-destructive";
  if (score < 80) return "bg-secondary/15 text-secondary";
  return "bg-success/15 text-success";
}

function getBarColor(score: number): string {
  if (score < 50) return "hsl(var(--destructive))";
  if (score < 80) return "hsl(var(--secondary))";
  return "hsl(var(--success))";
}

export default function Juz() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { progress } = useProgress();
  const [selectedJuz, setSelectedJuz] = useState<number | null>(null);

  const handleStartJuz = (juzNumber: number) => {
    // Find the first available surah in this Juz and navigate to Quran page
    const surahsInJuz = getSurahsInJuz(juzNumber);
    const firstAvailable = surahsInJuz.find((sj) => surahs.some((s) => s.number === sj.surahNumber));
    if (firstAvailable) {
      navigate(`/quran?juz=${juzNumber}`);
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="px-6 pt-14 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/progress")} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xl font-bold text-foreground">
            {t("juz.title")}
          </motion.h1>
        </div>
        <p className="text-xs text-muted-foreground mt-1 ml-9">{t("juz.subtitle")}</p>
      </div>

      <div className="px-6 space-y-2">
        {juzData.map((juz, i) => {
          const score = getJuzScore(juz.juz, progress.surahProgress);
          const surahsInJuz = getSurahsInJuz(juz.juz);
          const hasAvailableSurahs = surahsInJuz.some((sj) => surahs.some((s) => s.number === sj.surahNumber));
          const isExpanded = selectedJuz === juz.juz;

          return (
            <motion.div
              key={juz.juz}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
            >
              <button
                onClick={() => setSelectedJuz(isExpanded ? null : juz.juz)}
                className="w-full bg-card border border-border rounded-2xl p-4 text-left transition-colors hover:bg-accent/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary text-sm font-bold flex items-center justify-center shrink-0">
                    {juz.juz}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-arabic text-base text-foreground">{juz.name}</span>
                      <span className="text-[10px] text-muted-foreground">Juz {juz.juz}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">{getJuzLabel(juz.juz)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {score >= 0 && (
                      <>
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${score}%`, backgroundColor: getBarColor(score) }}
                          />
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${getScoreColor(score)}`}>
                          {score}%
                        </span>
                      </>
                    )}
                    {score < 0 && (
                      <span className="text-[10px] text-muted-foreground">—</span>
                    )}
                  </div>
                </div>
              </button>

              {/* Expanded: show surahs in this Juz */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-card border border-border border-t-0 rounded-b-2xl -mt-2 pt-4 px-4 pb-4 space-y-2"
                >
                  {surahsInJuz.map((sj) => {
                    const surah = surahs.find((s) => s.number === sj.surahNumber);
                    const sp = progress.surahProgress.find((p) => p.surahNumber === sj.surahNumber);

                    return (
                      <div key={sj.surahNumber} className="flex items-center gap-2 text-xs">
                        <span className="w-6 text-right text-muted-foreground font-mono">{sj.surahNumber}</span>
                        {surah ? (
                          <>
                            <span className="font-arabic text-sm text-foreground flex-1">{surah.nameArabic}</span>
                            <span className="text-muted-foreground">{surah.frenchName}</span>
                            {sp && (
                              <span className={`font-bold px-1.5 py-0.5 rounded ${getScoreColor(sp.bestScore)}`}>
                                {sp.bestScore}%
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-muted-foreground italic flex-1">{t("juz.notAvailable")}</span>
                        )}
                      </div>
                    );
                  })}

                  {hasAvailableSurahs && (
                    <button
                      onClick={() => handleStartJuz(juz.juz)}
                      className="w-full mt-2 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-xl text-xs font-semibold active:scale-[0.98] transition-transform"
                    >
                      <BookOpen size={14} />
                      {t("juz.startRevision")}
                    </button>
                  )}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
