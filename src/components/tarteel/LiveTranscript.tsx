import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface LiveTranscriptProps {
  isRecording: boolean;
  verseText: string | null;
}

export default function LiveTranscript({ isRecording, verseText }: LiveTranscriptProps) {
  const { t } = useLanguage();
  const [liveWords, setLiveWords] = useState<string[]>([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const collapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const words = verseText?.split(" ") || [];
  const totalWords = words.length;

  useEffect(() => {
    if (!isRecording || !verseText) {
      setLiveWords([]);
      setWordIndex(0);
      setCollapsed(false);
      return;
    }

    const interval = setInterval(() => {
      setWordIndex((prev) => {
        if (prev >= totalWords) {
          clearInterval(interval);
          return prev;
        }
        setLiveWords((w) => [...w, words[prev]]);
        return prev + 1;
      });
    }, 500 + Math.random() * 1000);

    return () => clearInterval(interval);
  }, [isRecording, verseText, totalWords]);

  // Auto-collapse after 3 seconds
  useEffect(() => {
    if (!isRecording) {
      setCollapsed(false);
      return;
    }

    if (collapseTimer.current) clearTimeout(collapseTimer.current);
    collapseTimer.current = setTimeout(() => setCollapsed(true), 3000);

    return () => {
      if (collapseTimer.current) clearTimeout(collapseTimer.current);
    };
  }, [isRecording]);

  // Expand briefly when a new word appears, then re-collapse after 3s
  useEffect(() => {
    if (!isRecording || wordIndex === 0) return;
    setCollapsed(false);
    if (collapseTimer.current) clearTimeout(collapseTimer.current);
    collapseTimer.current = setTimeout(() => setCollapsed(true), 3000);
  }, [wordIndex, isRecording]);

  // Reset when recording stops
  useEffect(() => {
    if (!isRecording) {
      setLiveWords([]);
      setWordIndex(0);
      setCollapsed(false);
    }
  }, [isRecording]);

  if (!isRecording || !verseText) return null;

  const progress = totalWords > 0 ? (wordIndex / totalWords) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border/60 bg-card overflow-hidden cursor-pointer"
      dir="rtl"
      onClick={() => setCollapsed((c) => !c)}
    >
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-5 pb-2">
              <p className="text-[10px] text-muted-foreground mb-2 text-center" dir="ltr">
                📝 {t("tarteelOffline.liveTranscription" as any)}
              </p>

              <div
                ref={containerRef}
                className="text-2xl leading-loose text-center min-h-[80px] font-arabic"
              >
                {liveWords.map((word, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      "inline-block mx-1 transition-all duration-300",
                      i === liveWords.length - 1
                        ? "text-primary font-bold scale-110"
                        : "text-foreground"
                    )}
                  >
                    {word}
                  </motion.span>
                ))}
                {wordIndex < totalWords && (
                  <span className="inline-block w-0.5 h-6 bg-primary animate-pulse ml-1 align-middle" />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar — always visible */}
      <div className="px-4 py-2">
        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-[10px] text-center mt-1 text-muted-foreground" dir="ltr">
          {wordIndex} / {totalWords} {t("tarteelOffline.wordsLabel" as any)}
        </p>
      </div>
    </motion.div>
  );
}
