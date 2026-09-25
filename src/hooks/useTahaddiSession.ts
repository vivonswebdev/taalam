import { useState, useRef, useCallback } from "react";
import { normalizeArabic, similarityScore as charSimilarity } from "@/lib/arabicMatch";

// ─── Types ──────────────────────────────────────────────────
export type TahaddiAyahStatus = "hidden" | "revealed" | "failed";

export interface TahaddiAyahState {
  ayahIndex: number;
  status: TahaddiAyahStatus;
  attemptsCount: number;
  bestSimilarity: number;
  hintUsed: boolean;
}

export interface TahaddiSessionConfig {
  surahNumber: number;
  surahName: string;
  surahNameArabic: string;
  ayahStart: number;
  ayahEnd: number;
  similarityThreshold: number; // 0-100
  createdAt: number;
}

export interface TahaddiSessionSummary {
  starsEarned: number; // 1-3
  xpEarned: number;
  totalAyahs: number;
  revealedCount: number;
  totalAttempts: number;
  perfectPage: boolean; // all revealed on first attempt
  durationSeconds: number;
  ayahStates: TahaddiAyahState[];
}

function computeSimilarity(original: string, spoken: string): number {
  const origWords = normalizeArabic(original).split(/\s+/).filter(Boolean);
  const spokenWords = normalizeArabic(spoken).split(/\s+/).filter(Boolean);
  if (origWords.length === 0) return 0;

  let matched = 0;
  let spokenIdx = 0;
  for (const ow of origWords) {
    if (spokenIdx >= spokenWords.length) break;
    // Check nearby spoken words (allow some insertion/skip)
    for (let look = 0; look <= 2 && spokenIdx + look < spokenWords.length; look++) {
      const sw = spokenWords[spokenIdx + look];
      if (ow === sw || charSimilarity(ow, sw) > 0.6) {
        matched++;
        spokenIdx = spokenIdx + look + 1;
        break;
      }
    }
  }
  return Math.round((matched / origWords.length) * 100);
}

// ─── XP Calculation ─────────────────────────────────────────
function calculateXP(
  totalAyahs: number,
  stars: number,
  threshold: number,
  totalAttempts: number,
): number {
  // Base: 5 XP per ayah
  const base = totalAyahs * 5;
  // Star multiplier
  const starMult = stars === 3 ? 2 : stars === 2 ? 1.5 : 1;
  // Threshold bonus: harder = more XP
  const thresholdBonus = threshold >= 95 ? 1.5 : threshold >= 90 ? 1.2 : 1;
  // Penalty for too many attempts
  const attemptPenalty = Math.max(0.5, 1 - (totalAttempts - totalAyahs) * 0.05);

  return Math.round(base * starMult * thresholdBonus * attemptPenalty);
}

function calculateStars(ayahStates: TahaddiAyahState[]): number {
  const totalErrors = ayahStates.reduce((sum, a) => sum + Math.max(0, a.attemptsCount - 1), 0);
  const total = ayahStates.length;
  if (totalErrors <= 1) return 3;
  if (totalErrors <= Math.ceil(total * 0.3)) return 2;
  return 1;
}

const MAX_ATTEMPTS = 3;

// ─── Hook ───────────────────────────────────────────────────
export function useTahaddiSession() {
  const [config, setConfig] = useState<TahaddiSessionConfig | null>(null);
  const [ayahStates, setAyahStates] = useState<TahaddiAyahState[]>([]);
  const [currentAyahIdx, setCurrentAyahIdx] = useState(0); // relative index (0-based within passage)
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [summary, setSummary] = useState<TahaddiSessionSummary | null>(null);
  const [lastEvaluation, setLastEvaluation] = useState<{ score: number; passed: boolean } | null>(null);

  const startTimeRef = useRef(0);

  const startSession = useCallback((cfg: TahaddiSessionConfig) => {
    const totalAyahs = cfg.ayahEnd - cfg.ayahStart + 1;
    const states: TahaddiAyahState[] = Array.from({ length: totalAyahs }, (_, i) => ({
      ayahIndex: cfg.ayahStart + i,
      status: "hidden",
      attemptsCount: 0,
      bestSimilarity: 0,
      hintUsed: false,
    }));
    setConfig(cfg);
    setAyahStates(states);
    setCurrentAyahIdx(0);
    setIsActive(true);
    setIsFinished(false);
    setSummary(null);
    setLastEvaluation(null);
    startTimeRef.current = Date.now();
  }, []);

  // Evaluate a recitation against the current ayah
  const evaluateAyah = useCallback((spokenText: string, originalText: string) => {
    if (!config) return;

    const score = computeSimilarity(originalText, spokenText);
    const passed = score >= config.similarityThreshold;

    setAyahStates(prev => {
      const updated = [...prev];
      const state = { ...updated[currentAyahIdx] };
      state.attemptsCount += 1;
      state.bestSimilarity = Math.max(state.bestSimilarity, score);

      if (passed) {
        state.status = "revealed";
      } else if (state.attemptsCount >= MAX_ATTEMPTS) {
        state.status = "failed";
      }
      updated[currentAyahIdx] = state;
      return updated;
    });

    setLastEvaluation({ score, passed });
  }, [config, currentAyahIdx]);

  // Advance to next ayah (call after reveal animation or after failed)
  const advanceToNext = useCallback(() => {
    if (!config) return;
    const totalAyahs = config.ayahEnd - config.ayahStart + 1;
    setLastEvaluation(null);

    if (currentAyahIdx < totalAyahs - 1) {
      setCurrentAyahIdx(prev => prev + 1);
    } else {
      // Finish
      finishSession();
    }
  }, [config, currentAyahIdx]);

  const useHint = useCallback(() => {
    setAyahStates(prev => {
      const updated = [...prev];
      updated[currentAyahIdx] = { ...updated[currentAyahIdx], hintUsed: true };
      return updated;
    });
  }, [currentAyahIdx]);

  const finishSession = useCallback(() => {
    if (!config) return;
    const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
    const stars = calculateStars(ayahStates);
    const totalAttempts = ayahStates.reduce((s, a) => s + a.attemptsCount, 0);
    const revealedCount = ayahStates.filter(a => a.status === "revealed").length;
    const perfectPage = ayahStates.every(a => a.status === "revealed" && a.attemptsCount === 1 && !a.hintUsed);
    const xp = calculateXP(ayahStates.length, stars, config.similarityThreshold, totalAttempts);

    const s: TahaddiSessionSummary = {
      starsEarned: stars,
      xpEarned: xp,
      totalAyahs: ayahStates.length,
      revealedCount,
      totalAttempts,
      perfectPage,
      durationSeconds: duration,
      ayahStates: [...ayahStates],
    };
    setSummary(s);
    setIsFinished(true);
    setIsActive(false);
  }, [config, ayahStates]);

  const resetSession = useCallback(() => {
    setConfig(null);
    setAyahStates([]);
    setCurrentAyahIdx(0);
    setIsActive(false);
    setIsFinished(false);
    setSummary(null);
    setLastEvaluation(null);
  }, []);

  return {
    config,
    ayahStates,
    currentAyahIdx,
    isActive,
    isFinished,
    summary,
    lastEvaluation,
    startSession,
    evaluateAyah,
    advanceToNext,
    useHint,
    finishSession,
    resetSession,
  };
}

export { computeSimilarity, MAX_ATTEMPTS };
