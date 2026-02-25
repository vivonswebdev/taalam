import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Star, ArrowRight } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import { surahs } from "@/data/surahs";
import islamicPattern from "@/assets/islamic-pattern.jpg";

export default function Home() {
  const navigate = useNavigate();
  const { progress, getMasteredCount } = useProgress();
  const mastered = getMasteredCount();
  const hasLevel = progress.level !== null;

  return (
    <div className="min-h-screen pb-24">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-primary/5 to-background" />
        <img
          src={islamicPattern}
          alt=""
          className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 opacity-10 pointer-events-none"
        />
        <div className="relative px-6 pt-14 pb-8 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-arabic text-2xl text-primary mb-2"
          >
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-3xl font-bold text-foreground tracking-tight"
          >
            Quran<span className="text-primary">Easy</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground mt-2 text-sm"
          >
            Apprenez le Coran facilement, pas à pas
          </motion.p>
        </div>
      </div>

      <div className="px-6 space-y-5">
        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-2xl p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
              <Star size={20} className="text-secondary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-card-foreground">Votre progression</p>
              <p className="text-xs text-muted-foreground">
                {hasLevel ? `Niveau ${progress.level === "easy" ? "Débutant" : progress.level === "medium" ? "Intermédiaire" : "Avancé"}` : "Pas encore de niveau"}
              </p>
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-foreground">{mastered}<span className="text-base font-normal text-muted-foreground">/{surahs.length}</span></p>
              <p className="text-xs text-muted-foreground">sourates maîtrisées</p>
            </div>
            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(mastered / surahs.length) * 100}%` }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="h-full bg-primary rounded-full"
              />
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        {!hasLevel ? (
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            onClick={() => navigate("/quiz")}
            className="w-full flex items-center justify-center gap-3 bg-primary text-primary-foreground rounded-2xl p-4 font-semibold text-lg active:scale-[0.98] transition-transform"
          >
            <BookOpen size={22} />
            Commencer le Quiz Niveau
            <ArrowRight size={18} />
          </motion.button>
        ) : (
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            onClick={() => navigate("/learn")}
            className="w-full flex items-center justify-center gap-3 bg-primary text-primary-foreground rounded-2xl p-4 font-semibold text-lg active:scale-[0.98] transition-transform"
          >
            <BookOpen size={22} />
            Continuer l'apprentissage
            <ArrowRight size={18} />
          </motion.button>
        )}

        {/* Quick Actions */}
        {hasLevel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-2 gap-3"
          >
            <button
              onClick={() => navigate("/quiz")}
              className="flex flex-col items-center gap-2 p-4 bg-accent rounded-2xl text-accent-foreground active:scale-[0.98] transition-transform"
            >
              <Star size={20} />
              <span className="text-sm font-medium">Refaire le quiz</span>
            </button>
            <button
              onClick={() => navigate("/progress")}
              className="flex flex-col items-center gap-2 p-4 bg-secondary/15 rounded-2xl text-secondary-foreground active:scale-[0.98] transition-transform"
            >
              <BookOpen size={20} />
              <span className="text-sm font-medium">Ma progression</span>
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
