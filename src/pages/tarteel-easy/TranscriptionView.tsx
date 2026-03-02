import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export interface TranscriptionData {
  detected: string;
  expected: string;
  score: number;
  matches: Array<{ word: string; correct: boolean }>;
}

export default function TranscriptionView({
  transcription,
  onContinue,
}: {
  transcription: TranscriptionData;
  onContinue: () => void;
}) {
  const { t } = useLanguage();
  const correctCount = transcription.matches.filter((m) => m.correct).length;
  const missingCount = transcription.matches.filter((m) => !m.correct).length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-base font-bold">🎤 {t("tarteel.detectedText" as any)}</h2>
        <p className="text-xs text-muted-foreground">{t("tarteel.comparisonDesc" as any)}</p>
      </div>

      {/* Detected text */}
      <div className="bg-card rounded-2xl p-4 border border-border/40">
        <div className="flex items-center gap-2 mb-2">
          <span>🗣️</span>
          <p className="text-xs font-semibold">{t("tarteel.youSaid" as any)}</p>
        </div>
        <p className="text-lg font-arabic text-center leading-loose" dir="rtl">
          {transcription.detected}
        </p>
      </div>

      {/* Expected text with highlighting */}
      <div className="bg-card rounded-2xl p-4 border border-border/40">
        <div className="flex items-center gap-2 mb-2">
          <span>📖</span>
          <p className="text-xs font-semibold">{t("tarteel.fullText" as any)}</p>
        </div>
        <div className="flex flex-wrap gap-2 justify-center" dir="rtl">
          {transcription.matches.map((match, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-arabic ${
                match.correct
                  ? "bg-green-500/10 text-green-700 dark:text-green-400"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {match.word}
              {match.correct ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-green-500/10 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-green-600 dark:text-green-400">{correctCount}</p>
          <p className="text-[10px] text-muted-foreground">{t("tarteel.correct" as any)}</p>
        </div>
        <div className="bg-destructive/10 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-destructive">{missingCount}</p>
          <p className="text-[10px] text-muted-foreground">{t("tarteel.missing" as any)}</p>
        </div>
        <div className="bg-primary/10 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-primary">{transcription.score}%</p>
          <p className="text-[10px] text-muted-foreground">Score</p>
        </div>
      </div>

      {/* Continue button */}
      <Button className="w-full" onClick={onContinue}>
        {t("tarteel.seeDetails" as any)} ➡️
      </Button>
    </motion.div>
  );
}
