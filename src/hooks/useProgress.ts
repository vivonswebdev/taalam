import { useState, useCallback } from "react";

export interface SurahProgress {
  surahNumber: number;
  attempts: number;
  bestScore: number;
  lastAttempt: string;
}

export interface UserProgress {
  level: "easy" | "medium" | "hard" | null;
  quizScore: number | null;
  surahProgress: SurahProgress[];
}

const STORAGE_KEY = "quranEasyProgress";

const defaultProgress: UserProgress = {
  level: null,
  quizScore: null,
  surahProgress: [],
};

function loadProgress(): UserProgress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { ...defaultProgress };
}

function saveProgress(progress: UserProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(loadProgress);

  const setLevel = useCallback((level: "easy" | "medium" | "hard", quizScore: number) => {
    setProgress((prev) => {
      const next = { ...prev, level, quizScore };
      saveProgress(next);
      return next;
    });
  }, []);

  const updateSurahProgress = useCallback((surahNumber: number, score: number) => {
    setProgress((prev) => {
      const existing = prev.surahProgress.find((s) => s.surahNumber === surahNumber);
      let surahProgress: SurahProgress[];
      if (existing) {
        surahProgress = prev.surahProgress.map((s) =>
          s.surahNumber === surahNumber
            ? { ...s, attempts: s.attempts + 1, bestScore: Math.max(s.bestScore, score), lastAttempt: new Date().toISOString() }
            : s
        );
      } else {
        surahProgress = [...prev.surahProgress, { surahNumber, attempts: 1, bestScore: score, lastAttempt: new Date().toISOString() }];
      }
      const next = { ...prev, surahProgress };
      saveProgress(next);
      return next;
    });
  }, []);

  const getMasteredCount = useCallback(() => {
    return progress.surahProgress.filter((s) => s.bestScore >= 80).length;
  }, [progress]);

  const resetProgress = useCallback(() => {
    const next = { ...defaultProgress };
    saveProgress(next);
    setProgress(next);
  }, []);

  return { progress, setLevel, updateSurahProgress, getMasteredCount, resetProgress };
}
