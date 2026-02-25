import { motion } from "framer-motion";
import type { Surah } from "@/data/surahs";
import type { SurahProgress } from "@/hooks/useProgress";
import { BookOpen, CheckCircle2 } from "lucide-react";

interface SurahCardProps {
  surah: Surah;
  progress?: SurahProgress;
  onClick: () => void;
  index: number;
}

export default function SurahCard({ surah, progress, onClick, index }: SurahCardProps) {
  const mastered = progress && progress.bestScore >= 80;

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all text-left group active:scale-[0.98]"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${mastered ? "bg-success/15 text-success" : "bg-primary/10 text-primary"}`}>
        {surah.number}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-card-foreground truncate">{surah.frenchName}</span>
          <span className="font-arabic text-lg text-primary shrink-0">{surah.nameArabic}</span>
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          <BookOpen size={12} />
          <span>{surah.versesCount} versets</span>
          {progress && (
            <>
              <span>·</span>
              <span className={mastered ? "text-success font-medium" : ""}>
                {progress.bestScore}%
              </span>
            </>
          )}
        </div>
      </div>
      {mastered && <CheckCircle2 size={20} className="text-success shrink-0" />}
    </motion.button>
  );
}
