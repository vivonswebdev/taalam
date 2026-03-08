import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

interface WordComparisonProps {
  expectedText: string;
  detectedText: string;
  correctWords: number;
  incorrectWords: number;
  missingWords: number;
}

export default function WordComparison({
  expectedText,
  detectedText,
  correctWords,
  incorrectWords,
  missingWords,
}: WordComparisonProps) {
  const { t } = useLanguage();
  const expectedWords = expectedText.split(" ");
  const detectedWords = detectedText.split(" ");

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold flex items-center gap-2">
        📊 {t("tarteelOffline.detailedAnalysis" as any)}
      </h4>

      {/* Word-by-word comparison */}
      <div className="rounded-xl bg-muted/30 border border-border/40 p-4" dir="rtl">
        <p className="text-[10px] text-muted-foreground mb-2 text-center" dir="ltr">
          {t("tarteelOffline.expected" as any)}
        </p>
        <div className="flex flex-wrap gap-1.5 justify-center text-xl font-arabic">
          {expectedWords.map((word, i) => {
            const isCorrect = detectedWords[i] === word;
            const isMissing = !detectedWords[i];

            return (
              <span
                key={i}
                className={cn(
                  "px-1.5 py-0.5 rounded transition-all",
                  isCorrect && "bg-green-500/20 text-green-700 dark:text-green-400",
                  !isCorrect && !isMissing && "bg-destructive/20 text-destructive line-through",
                  isMissing && "bg-orange-500/20 text-orange-700 dark:text-orange-400"
                )}
              >
                {word}
              </span>
            );
          })}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2.5 bg-green-500/10 rounded-xl">
          <div className="text-xl font-bold text-green-600 dark:text-green-400">
            {correctWords}
          </div>
          <div className="text-[10px] text-muted-foreground">
            {t("tarteelOffline.correctWords" as any)}
          </div>
        </div>
        <div className="p-2.5 bg-destructive/10 rounded-xl">
          <div className="text-xl font-bold text-destructive">
            {incorrectWords}
          </div>
          <div className="text-[10px] text-muted-foreground">
            {t("tarteelOffline.errors" as any)}
          </div>
        </div>
        <div className="p-2.5 bg-orange-500/10 rounded-xl">
          <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
            {missingWords}
          </div>
          <div className="text-[10px] text-muted-foreground">
            {t("tarteelOffline.missing" as any)}
          </div>
        </div>
      </div>
    </div>
  );
}
