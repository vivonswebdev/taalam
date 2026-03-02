import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Mic } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";

export interface VerifiedVerse {
  text: string;
  correct: boolean;
}

interface LiveTranscriptionPanelProps {
  verifiedVerses: VerifiedVerse[];
  liveTranscript: string;
  isListening: boolean;
  expectedText?: string;
  totalVerses?: number;
}

export default function LiveTranscriptionPanel({
  verifiedVerses,
  liveTranscript,
  isListening,
  expectedText,
  totalVerses = 0,
}: LiveTranscriptionPanelProps) {
  const { t } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new content
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [verifiedVerses, liveTranscript]);

  const correctCount = verifiedVerses.filter((v) => v.correct).length;
  const progressPercent = totalVerses > 0 ? Math.round((verifiedVerses.length / totalVerses) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border/40 bg-card overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30 bg-muted/30">
        <div className="flex items-center gap-2">
          <span className="text-base">🎤</span>
          <span className="text-xs font-semibold">{t("tarteel.liveTranscription" as any)}</span>
        </div>
        {isListening && (
          <span className="flex items-center gap-1.5 text-[10px] text-destructive font-medium">
            <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
            {t("tarteel.liveListening" as any)}
          </span>
        )}
      </div>

      {/* Expected verse hint */}
      {expectedText && isListening && (
        <div className="px-4 py-2 border-b border-border/20 bg-primary/5">
          <p className="text-[10px] text-muted-foreground mb-1">{t("tarteel.expectedVerse" as any)}</p>
          <p className="text-sm font-arabic text-primary/70 leading-relaxed" dir="rtl">
            {expectedText}
          </p>
        </div>
      )}

      {/* Progress bar */}
      {totalVerses > 0 && verifiedVerses.length > 0 && (
        <div className="px-4 py-2 border-b border-border/20">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
            <span>{verifiedVerses.length}/{totalVerses} {t("tarteel.versesRecited" as any)}</span>
            <span>{correctCount} ✅</span>
          </div>
          <Progress value={progressPercent} className="h-1.5" />
        </div>
      )}

      {/* Scrollable transcript area */}
      <ScrollArea className="max-h-60">
        <div ref={scrollRef} className="px-4 py-3 space-y-2 min-h-[100px]">
          {/* Verified verses */}
          <AnimatePresence>
            {verifiedVerses.map((verse, idx) => (
              <motion.div
                key={`v-${idx}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex items-start gap-2 p-2.5 rounded-xl ${
                  verse.correct
                    ? "bg-green-500/10 border border-green-500/20"
                    : "bg-destructive/10 border border-destructive/20"
                }`}
              >
                <span className="mt-0.5 shrink-0">
                  {verse.correct ? (
                    <CheckCircle2 size={14} className="text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircle size={14} className="text-destructive" />
                  )}
                </span>
                <p className="text-sm font-arabic leading-relaxed" dir="rtl">
                  {verse.text}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Live interim text */}
          {liveTranscript && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-2 p-2.5 rounded-xl bg-muted/50 border border-border/30"
            >
              <span className="mt-0.5 shrink-0">
                <Mic size={14} className="text-muted-foreground animate-pulse" />
              </span>
              <p className="text-sm font-arabic text-muted-foreground leading-relaxed italic" dir="rtl">
                {liveTranscript}
              </p>
            </motion.div>
          )}

          {/* Empty state */}
          {!liveTranscript && verifiedVerses.length === 0 && (
            <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
              <Mic size={28} className="mb-2 opacity-40" />
              <p className="text-xs text-center">{t("tarteel.tapToStartRecite" as any)}</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </motion.div>
  );
}
