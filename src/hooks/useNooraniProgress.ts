import { useState, useEffect, useCallback } from "react";
import { NOORANI_LESSONS } from "@/data/nooraniLessons";

const PROGRESS_KEY = "noorani_progress";

export function useNooraniProgress() {
  const totalLessons = NOORANI_LESSONS.length;

  const getCompleted = (): string[] => {
    try {
      return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "[]");
    } catch {
      return [];
    }
  };

  const [completedLessons, setCompletedLessons] = useState<string[]>(getCompleted);

  useEffect(() => {
    const handler = () => setCompletedLessons(getCompleted());
    window.addEventListener("noorani-progress", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("noorani-progress", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const completedLessonsCount = completedLessons.length;
  const completionPercent = totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 100) : 0;

  const saveProgress = useCallback((lessonId: string) => {
    try {
      const arr = getCompleted();
      if (!arr.includes(lessonId)) {
        arr.push(lessonId);
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(arr));
        setCompletedLessons(arr);
        window.dispatchEvent(new Event("noorani-progress"));
      }
    } catch {}
  }, []);

  return { completedLessonsCount, totalLessons, completionPercent, completedLessons, saveProgress };
}
