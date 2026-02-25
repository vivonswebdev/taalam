import { useState, useEffect, useMemo } from "react";
import { surahs, type Surah } from "@/data/surahs";

const CHALLENGE_KEY = "iqraa_daily_tarteel";

// Pool of 12 easy surahs (Juz Amma, ≤10 verses)
const EASY_POOL_NUMBERS = [112, 113, 114, 108, 110, 111, 109, 107, 106, 105, 103, 101];

interface ChallengeState {
  date: string; // YYYY-MM-DD
  completed: boolean;
  score: number | null;
  surahNumber: number;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Deterministic daily surah: same for all users on a given day */
function getDailySurahNumber(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) | 0;
  }
  return EASY_POOL_NUMBERS[Math.abs(hash) % EASY_POOL_NUMBERS.length];
}

function loadState(): ChallengeState | null {
  try {
    const raw = localStorage.getItem(CHALLENGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveState(state: ChallengeState) {
  localStorage.setItem(CHALLENGE_KEY, JSON.stringify(state));
}

export function useDailyTarteelChallenge() {
  const t = todayStr();
  const surahNumber = useMemo(() => getDailySurahNumber(t), [t]);
  const surah: Surah | undefined = surahs.find((s) => s.number === surahNumber);

  const [state, setState] = useState<ChallengeState>(() => {
    const saved = loadState();
    if (saved && saved.date === t) return saved;
    return { date: t, completed: false, score: null, surahNumber };
  });

  // Reset if date changed
  useEffect(() => {
    if (state.date !== t) {
      const fresh: ChallengeState = { date: t, completed: false, score: null, surahNumber };
      setState(fresh);
      saveState(fresh);
    }
  }, [t, surahNumber]);

  const complete = (score: number) => {
    const updated: ChallengeState = { ...state, completed: true, score };
    setState(updated);
    saveState(updated);
  };

  const dismiss = () => {
    // Mark as completed with 0 score (dismissed)
    const updated: ChallengeState = { ...state, completed: true, score: 0 };
    setState(updated);
    saveState(updated);
  };

  return {
    surah: surah || null,
    surahNumber,
    isCompleted: state.completed,
    score: state.score,
    complete,
    dismiss,
  };
}
