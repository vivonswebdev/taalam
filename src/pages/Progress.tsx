import { motion } from "framer-motion";
import { useProgress } from "@/hooks/useProgress";
import { surahs } from "@/data/surahs";
import { Trophy, BookOpen, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";

export default function Progress() {
  const { progress, getMasteredCount } = useProgress();
  const mastered = getMasteredCount();
  const totalAttempts = progress.surahProgress.reduce((a, s) => a + s.attempts, 0);

  const chartData = progress.surahProgress.map((sp) => {
    const surah = surahs.find((s) => s.number === sp.surahNumber);
    return {
      name: surah?.nameArabic || `${sp.surahNumber}`,
      score: sp.bestScore,
    };
  });

  return (
    <div className="min-h-screen pb-24">
      <div className="px-6 pt-14 pb-4">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold text-foreground">
          Progression
        </motion.h1>
      </div>

      <div className="px-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Trophy, value: mastered, label: "Maîtrisées", color: "text-secondary" },
            { icon: BookOpen, value: totalAttempts, label: "Tentatives", color: "text-primary" },
            { icon: TrendingUp, value: progress.surahProgress.length, label: "Étudiées", color: "text-success" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-2xl p-4 text-center"
            >
              <stat.icon size={20} className={`${stat.color} mx-auto mb-2`} />
              <p className="text-2xl font-bold text-card-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-2xl p-5"
          >
            <h3 className="text-sm font-semibold text-card-foreground mb-4">Scores par sourate</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fontSize: 14, fontFamily: "Amiri" }} tickLine={false} axisLine={false} />
                <YAxis hide domain={[0, 100]} />
                <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.score >= 80 ? "hsl(145, 63%, 42%)" : "hsl(152, 56%, 28%)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Surah list */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Détails</h3>
          {progress.surahProgress.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucune sourate étudiée pour le moment
            </p>
          ) : (
            <div className="space-y-2">
              {progress.surahProgress.map((sp, i) => {
                const surah = surahs.find((s) => s.number === sp.surahNumber);
                if (!surah) return null;
                return (
                  <motion.div
                    key={sp.surahNumber}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    className="flex items-center gap-3 bg-card border border-border rounded-xl p-3"
                  >
                    <span className="font-arabic text-lg text-primary w-16 text-right">{surah.nameArabic}</span>
                    <div className="flex-1">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${sp.bestScore}%`,
                            backgroundColor: sp.bestScore >= 80 ? "hsl(145, 63%, 42%)" : "hsl(152, 56%, 28%)",
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground w-10 text-right">{sp.bestScore}%</span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
