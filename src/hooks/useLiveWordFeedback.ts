import { useMemo } from "react";
import { normalizeArabic } from "@/lib/arabicMatch";

export type LiveWordStatus = "correct" | "almost" | "incorrect" | "pending";

export interface LiveWord {
  word: string;        // Original Quran word
  status: LiveWordStatus;
  similarity: number;  // 0-1
}

function charSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  if (longer.length === 0) return 0;

  // Levenshtein-based ratio for better accuracy
  const matrix: number[][] = [];
  for (let i = 0; i <= shorter.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= longer.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= shorter.length; i++) {
    for (let j = 1; j <= longer.length; j++) {
      const cost = shorter[i - 1] === longer[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  const distance = matrix[shorter.length][longer.length];
  return 1 - distance / longer.length;
}

function getStatus(sim: number): LiveWordStatus {
  if (sim >= 0.95) return "correct";
  if (sim >= 0.80) return "almost";
  return "incorrect";
}

/**
 * Hook: given reference ayah texts and a live transcript string,
 * returns per-word LiveWordStatus for every reference word.
 * Words not yet reached by the speaker are "pending".
 */
export function useLiveWordFeedback(
  referenceTexts: string[],
  liveTranscript: string
): { liveWords: LiveWord[][]; currentWordIndex: number; totalMatched: number } {
  return useMemo(() => {
    const spokenNorm = normalizeArabic(liveTranscript)
      .split(/\s+/)
      .filter(Boolean);

    const allRefWords: { word: string; norm: string; ayahIdx: number }[] = [];
    referenceTexts.forEach((text, ayahIdx) => {
      text.split(/\s+/).filter(Boolean).forEach((w) => {
        allRefWords.push({ word: w, norm: normalizeArabic(w), ayahIdx });
      });
    });

    // Align spoken words to reference words using greedy matching with look-ahead
    const statuses: (LiveWordStatus | "pending")[] = new Array(allRefWords.length).fill("pending");
    const similarities: number[] = new Array(allRefWords.length).fill(0);

    let spokenIdx = 0;
    let refIdx = 0;

    while (refIdx < allRefWords.length && spokenIdx < spokenNorm.length) {
      const sim = charSimilarity(allRefWords[refIdx].norm, spokenNorm[spokenIdx]);

      if (sim >= 0.80) {
        // Match
        statuses[refIdx] = getStatus(sim);
        similarities[refIdx] = sim;
        spokenIdx++;
        refIdx++;
      } else {
        // Look ahead in reference (skipped/missing words)
        let foundAhead = false;
        for (let look = 1; look <= 3 && refIdx + look < allRefWords.length; look++) {
          const futSim = charSimilarity(allRefWords[refIdx + look].norm, spokenNorm[spokenIdx]);
          if (futSim >= 0.80) {
            // Mark skipped reference words as incorrect (missing)
            for (let skip = 0; skip < look; skip++) {
              statuses[refIdx + skip] = "incorrect";
              similarities[refIdx + skip] = 0;
            }
            statuses[refIdx + look] = getStatus(futSim);
            similarities[refIdx + look] = futSim;
            refIdx += look + 1;
            spokenIdx++;
            foundAhead = true;
            break;
          }
        }
        if (!foundAhead) {
          // Look ahead in spoken (extra words spoken)
          let foundInSpoken = false;
          for (let look = 1; look <= 2 && spokenIdx + look < spokenNorm.length; look++) {
            const futSim = charSimilarity(allRefWords[refIdx].norm, spokenNorm[spokenIdx + look]);
            if (futSim >= 0.80) {
              spokenIdx += look; // skip extra spoken words
              statuses[refIdx] = getStatus(futSim);
              similarities[refIdx] = futSim;
              spokenIdx++;
              refIdx++;
              foundInSpoken = true;
              break;
            }
          }
          if (!foundInSpoken) {
            // Current ref word is wrong
            statuses[refIdx] = "incorrect";
            similarities[refIdx] = sim;
            spokenIdx++;
            refIdx++;
          }
        }
      }
    }

    // Build per-ayah result
    const liveWords: LiveWord[][] = [];
    let idx = 0;
    referenceTexts.forEach((text) => {
      const words = text.split(/\s+/).filter(Boolean);
      const ayahResult: LiveWord[] = [];
      words.forEach((w) => {
        const status = statuses[idx] as LiveWordStatus | "pending";
        ayahResult.push({
          word: w,
          status: status === "pending" ? "pending" : status,
          similarity: similarities[idx],
        });
        idx++;
      });
      liveWords.push(ayahResult);
    });

    // Current word = first "pending" word index
    const currentWordIndex = statuses.findIndex((s) => s === "pending");
    const totalMatched = statuses.filter((s) => s !== "pending").length;

    return { liveWords, currentWordIndex: currentWordIndex === -1 ? allRefWords.length : currentWordIndex, totalMatched };
  }, [referenceTexts, liveTranscript]);
}
