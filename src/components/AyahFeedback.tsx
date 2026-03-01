import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Volume2, BookOpen } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { analyzeAyahTajwid } from "@/data/tajwidRules";
import AsrReportButton from "@/components/AsrReportButton";

export type FeedbackWordStatus = "correct" | "almost" | "incorrect" | "missing";

export interface FeedbackWord {
  word: string;
  status: FeedbackWordStatus;
}

interface AyahFeedbackProps {
  ayahText: string;
  wordStatuses: FeedbackWord[];
  score: number;
  simpleExplanation?: string;
  onRetry: () => void;
  onNext: () => void;
  onListenAyah: () => void;
  isLastAyah: boolean;
  isChildMode: boolean;
  onReport?: (reason: string) => void;
}

export default function AyahFeedback({
  ayahText,
  wordStatuses,
  score,
  simpleExplanation,
  onRetry,
  onNext,
  onListenAyah,
  isLastAyah,
  isChildMode,
  onReport,
}: AyahFeedbackProps) {
  const { t } = useLanguage();

  const getWordColor = (status: FeedbackWordStatus) => {
    switch (status) {
      case "correct": return "text-success bg-success/10";
      case "almost": return "text-warning bg-warning/10";
      case "incorrect": return "text-destructive bg-destructive/10";
      case "missing": return "text-destructive/60 bg-destructive/5 line-through";
    }
  };

  // Detect tajwid tips for incorrect words
  const tajwidWords = analyzeAyahTajwid(ayahText);
  const incorrectTajwidTips = wordStatuses
    .map((ws, i) => {
      if (ws.status !== "incorrect" && ws.status !== "almost") return null;
      const tw = tajwidWords[i];
      if (!tw?.rules?.length) return null;
      return { word: ws.word, rule: tw.rules[0].name };
    })
    .filter(Boolean)
    .slice(0, 2);

  const feedbackEmoji = score >= 90 ? "🌟" : score >= 70 ? "💪" : score >= 50 ? "📖" : "🔁";
  const feedbackText = score >= 90
    ? "Excellent ! Macha Allah !"
    : score >= 70
    ? `Très bien, tu as bien prononcé ${score}% des mots.`
    : score >= 50
    ? `Pas mal ! ${score}% correct. Continue !`
    : `${score}% – Réessaie, tu vas y arriver !`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Step label */}
      <div className="flex items-center gap-2">
        <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">3</span>
        <span className="text-sm font-bold text-foreground">{t("dictation.step3Title")}</span>
      </div>

      {/* Score */}
      <div className="text-center py-3">
        <span className="text-3xl">{feedbackEmoji}</span>
        <p className={`${isChildMode ? "text-lg" : "text-sm"} font-semibold text-foreground mt-1`}>
          {feedbackText}
        </p>
      </div>

      {/* Color-coded ayah */}
      <div className="bg-card border border-border rounded-2xl p-4" dir="rtl">
        <div className="arabic-text text-xl leading-[3] text-center">
          {wordStatuses.map((ws, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`inline-block px-1 py-0.5 mx-0.5 rounded-lg ${getWordColor(ws.status)}`}
            >
              {ws.word}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 text-[11px]">
        <span className="flex items-center gap-1 text-success"><CheckCircle2 size={11} /> {t("dictation.legendCorrect")}</span>
        <span className="flex items-center gap-1 text-warning">⚠️ Presque</span>
        <span className="flex items-center gap-1 text-destructive"><XCircle size={11} /> {t("dictation.legendIncorrect")}</span>
      </div>

      {/* Tajwid tips */}
      {incorrectTajwidTips.length > 0 && (
        <div className="bg-accent/30 rounded-xl p-3 space-y-1">
          <p className="text-xs font-semibold text-foreground">💡 Conseil Tajwid</p>
          {incorrectTajwidTips.map((tip: any, i: number) => (
            <p key={i} className="text-[11px] text-muted-foreground">
              Attention à la prononciation de « <span className="font-arabic text-foreground">{tip.word}</span> » ({tip.rule})
            </p>
          ))}
        </div>
      )}

      {/* Simple explanation */}
      {simpleExplanation && (
        <div className="bg-primary/5 border border-primary/15 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <BookOpen size={13} className="text-primary" />
            <span className="text-xs font-semibold text-foreground">{t("dictation.understand")}</span>
          </div>
          <p className="text-[12px] text-muted-foreground leading-relaxed">{simpleExplanation}</p>
        </div>
      )}

      {/* Listen again */}
      <button
        onClick={onListenAyah}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-muted text-foreground text-sm font-medium"
      >
        <Volume2 size={15} />
        Réécouter le verset
      </button>


      {/* Report incorrect result */}
      {onReport && score < 90 && (
        <div className="flex justify-center">
          <AsrReportButton onReport={onReport} />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="flex-1 py-3 rounded-2xl border-2 border-border text-foreground font-semibold text-sm"
        >
          {t("dictation.retryVerse")}
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm"
        >
          {isLastAyah ? t("dictation.surahComplete").replace(" 🎉", "") : t("dictation.nextVerse")}
        </button>
      </div>
    </motion.div>
  );
}
