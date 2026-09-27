import { useState, useRef, useCallback } from "react";
import { normalizeArabic, similarityScore as similarity } from "@/lib/arabicMatch";

// ─── Types ──────────────────────────────────────────────────
export type WordStatus = "correct" | "incorrect" | "missing" | "extra" | "unchecked";
export type HifzMode = "blocking" | "observer";
export type ToleranceLevel = "strict" | "medium" | "lenient";

export interface HifzWord {
  id: string;
  text: string;
  ayahIndex: number;
  wordIndex: number;
  status: WordStatus;
}

export interface HifzSessionConfig {
  surahNumber: number;
  surahName: string;
  surahNameArabic: string;
  ayahStart: number; // 0-based index
  ayahEnd: number;   // 0-based index (inclusive)
  mode: HifzMode;
  tolerance: ToleranceLevel;
}

export interface AyahScore {
  ayahIndex: number;
  score: number;
  correct: boolean;
}

export interface HifzSessionSummary {
  totalScore: number;
  incorrectCount: number;
  missingCount: number;
  extraCount: number;
  correctCount: number;
  totalWords: number;
  ayahScores: AyahScore[];
  worstAyahs: AyahScore[];
  durationSeconds: number;
}

function getThreshold(tolerance: ToleranceLevel): number {
  switch (tolerance) {
    case "strict": return 0.85;
    case "medium": return 0.65;
    case "lenient": return 0.5;
  }
}

// ─── Hook ───────────────────────────────────────────────────
export function useHifzSession() {
  const [config, setConfig] = useState<HifzSessionConfig | null>(null);
  const [words, setWords] = useState<HifzWord[]>([]);
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [errorCount, setErrorCount] = useState({ incorrect: 0, missing: 0, extra: 0 });
  const [isPaused, setIsPaused] = useState(false);
  const [isBlockedOnError, setIsBlockedOnError] = useState(false);
  const [blockedWordId, setBlockedWordId] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [summary, setSummary] = useState<HifzSessionSummary | null>(null);

  const startTimeRef = useRef<number>(0);

  // Initialize session with ayahs text
  const startSession = useCallback((cfg: HifzSessionConfig, ayahTexts: string[]) => {
    const allWords: HifzWord[] = [];
    ayahTexts.forEach((text, relIdx) => {
      const ayahIdx = cfg.ayahStart + relIdx;
      const wordTokens = text.split(/\s+/).filter(Boolean);
      wordTokens.forEach((w, wIdx) => {
        allWords.push({
          id: `${ayahIdx}-${wIdx}`,
          text: w,
          ayahIndex: ayahIdx,
          wordIndex: wIdx,
          status: "unchecked",
        });
      });
    });
    setConfig(cfg);
    setWords(allWords);
    setCurrentAyahIndex(cfg.ayahStart);
    setErrorCount({ incorrect: 0, missing: 0, extra: 0 });
    setIsPaused(false);
    setIsBlockedOnError(false);
    setBlockedWordId(null);
    setIsFinished(false);
    setSummary(null);
    startTimeRef.current = Date.now();
  }, []);

  // Process spoken transcript for current ayah
  const processTranscript = useCallback((spokenText: string, ayahOriginalText: string, ayahIndex: number) => {
    if (!config) return;
    const threshold = getThreshold(config.tolerance);
    const origWords = ayahOriginalText.split(/\s+/).filter(Boolean);
    const normOrig = origWords.map(w => normalizeArabic(w));
    const spokenWords = normalizeArabic(spokenText).split(/\s+/).filter(Boolean);

    const newStatuses: { wordIndex: number; status: WordStatus }[] = [];
    let spokenIdx = 0;
    const extraWords: string[] = [];

    for (let i = 0; i < origWords.length; i++) {
      if (spokenIdx >= spokenWords.length) {
        newStatuses.push({ wordIndex: i, status: "missing" });
        continue;
      }
      const sim = similarity(normOrig[i], spokenWords[spokenIdx]);
      if (normOrig[i] === spokenWords[spokenIdx] || sim >= threshold) {
        newStatuses.push({ wordIndex: i, status: "correct" });
        spokenIdx++;
      } else {
        // Look ahead in original to see if spoken word matches a future original word
        let foundAhead = false;
        for (let look = 1; look <= 3 && i + look < origWords.length; look++) {
          const futSim = similarity(normalizeArabic(origWords[i + look]), spokenWords[spokenIdx]);
          if (futSim >= threshold) {
            newStatuses.push({ wordIndex: i, status: "missing" });
            foundAhead = true;
            break;
          }
        }
        if (!foundAhead) {
          // Look ahead in spoken to see if future spoken word matches current original
          let foundInSpoken = false;
          for (let look = 1; look <= 3 && spokenIdx + look < spokenWords.length; look++) {
            const futSim = similarity(normOrig[i], spokenWords[spokenIdx + look]);
            if (futSim >= threshold) {
              extraWords.push(spokenWords[spokenIdx]);
              spokenIdx++;
              i--;
              foundInSpoken = true;
              break;
            }
          }
          if (!foundInSpoken) {
            newStatuses.push({ wordIndex: i, status: "incorrect" });
            spokenIdx++;
          }
        }
      }
    }

    // Remaining spoken words are extra
    while (spokenIdx < spokenWords.length) {
      extraWords.push(spokenWords[spokenIdx]);
      spokenIdx++;
    }

    // Update words state
    setWords(prev => {
      const updated = [...prev];
      // Remove old extras for this ayah
      const filtered = updated.filter(w => !(w.ayahIndex === ayahIndex && w.status === "extra"));
      
      newStatuses.forEach(({ wordIndex, status }) => {
        const idx = filtered.findIndex(w => w.ayahIndex === ayahIndex && w.wordIndex === wordIndex);
        if (idx !== -1) {
          filtered[idx] = { ...filtered[idx], status };
        }
      });

      // Add extra words
      extraWords.forEach((ew, i) => {
        filtered.push({
          id: `${ayahIndex}-extra-${i}`,
          text: ew,
          ayahIndex,
          wordIndex: 9000 + i,
          status: "extra",
        });
      });

      return filtered;
    });

    // Update error counts
    const inc = newStatuses.filter(s => s.status === "incorrect").length;
    const miss = newStatuses.filter(s => s.status === "missing").length;
    const ext = extraWords.length;

    setErrorCount(prev => ({
      incorrect: prev.incorrect + inc,
      missing: prev.missing + miss,
      extra: prev.extra + ext,
    }));

    // Blocking mode: pause on first error
    if (config.mode === "blocking" && (inc > 0 || miss > 0)) {
      const firstErrorStatus = newStatuses.find(s => s.status === "incorrect" || s.status === "missing");
      if (firstErrorStatus) {
        setIsBlockedOnError(true);
        setBlockedWordId(`${ayahIndex}-${firstErrorStatus.wordIndex}`);
        setIsPaused(true);
      }
    }
  }, [config]);

  // Ignore current blocked error and continue
  const ignoreError = useCallback(() => {
    setIsBlockedOnError(false);
    setBlockedWordId(null);
    setIsPaused(false);
  }, []);

  // Move to next ayah
  const advanceAyah = useCallback(() => {
    if (!config) return;
    if (currentAyahIndex >= config.ayahEnd) {
      finishSession();
    } else {
      setCurrentAyahIndex(prev => prev + 1);
      setIsBlockedOnError(false);
      setBlockedWordId(null);
    }
  }, [config, currentAyahIndex]);

  // Finish session and compute summary
  const finishSession = useCallback(() => {
    if (!config) return;
    const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
    const sessionWords = words.filter(w => w.status !== "extra");
    const correctCount = sessionWords.filter(w => w.status === "correct").length;
    const totalWords = sessionWords.length;
    const totalScore = totalWords > 0 ? Math.round((correctCount / totalWords) * 100) : 0;

    // Compute per-ayah scores
    const ayahScores: AyahScore[] = [];
    for (let a = config.ayahStart; a <= config.ayahEnd; a++) {
      const ayahWords = sessionWords.filter(w => w.ayahIndex === a);
      const ayahCorrect = ayahWords.filter(w => w.status === "correct").length;
      const score = ayahWords.length > 0 ? Math.round((ayahCorrect / ayahWords.length) * 100) : 0;
      ayahScores.push({ ayahIndex: a, score, correct: score >= 80 });
    }

    const worstAyahs = [...ayahScores].sort((a, b) => a.score - b.score).slice(0, 5).filter(a => a.score < 100);

    setSummary({
      totalScore,
      incorrectCount: errorCount.incorrect,
      missingCount: errorCount.missing,
      extraCount: errorCount.extra,
      correctCount,
      totalWords,
      ayahScores,
      worstAyahs,
      durationSeconds: duration,
    });
    setIsFinished(true);
  }, [config, words, errorCount]);

  const resetSession = useCallback(() => {
    setConfig(null);
    setWords([]);
    setCurrentAyahIndex(0);
    setErrorCount({ incorrect: 0, missing: 0, extra: 0 });
    setIsPaused(false);
    setIsBlockedOnError(false);
    setBlockedWordId(null);
    setIsFinished(false);
    setSummary(null);
  }, []);

  return {
    config,
    words,
    currentAyahIndex,
    errorCount,
    isPaused,
    setIsPaused,
    isBlockedOnError,
    blockedWordId,
    isFinished,
    summary,
    startSession,
    processTranscript,
    ignoreError,
    advanceAyah,
    finishSession,
    resetSession,
    setCurrentAyahIndex,
  };
}
