import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";

interface SimpleFeedbackProps {
  score: number;
  surahNumber: number;
  onRetry: () => void;
  onNext: () => void;
}

export default function SimpleFeedback({ score, surahNumber, onRetry, onNext }: SimpleFeedbackProps) {
  const { t } = useLanguage();

  const getFeedback = () => {
    if (score >= 80) return { emoji: "😊", labelKey: "tarteel.excellent", color: "text-green-500" };
    if (score >= 60) return { emoji: "🙂", labelKey: "tarteel.good", color: "text-yellow-500" };
    return { emoji: "😐", labelKey: "tarteel.needsWork", color: "text-orange-500" };
  };

  const feedback = getFeedback();

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-8 space-y-5">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }} className="text-6xl">
        {feedback.emoji}
      </motion.div>

      <p className={`text-4xl font-bold ${feedback.color}`}>{score}%</p>
      <p className="text-sm font-semibold">{t(feedback.labelKey as any)}</p>

      {/* Progress bar */}
      <div className="w-full max-w-xs">
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 w-full max-w-xs">
        <Button variant="outline" className="flex-1" onClick={onRetry}>
          🔄 {t("tarteel.retry" as any)}
        </Button>
        <Button className="flex-1" onClick={onNext}>
          ➡️ {t("tarteel.next" as any)}
        </Button>
      </div>

      {/* Tip */}
      {score < 80 && (
        <div className="bg-muted/50 rounded-xl p-3 text-center max-w-xs">
          <p className="text-xs font-semibold mb-1">💡 {t("tarteel.tip" as any)}</p>
          <p className="text-[10px] text-muted-foreground">{t("tarteel.tipDesc" as any)}</p>
        </div>
      )}
    </motion.div>
  );
}
