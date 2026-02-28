import { useState, useCallback, useEffect } from "react";

export interface ChecklistTask {
  id: string;
  labelKey: string;
  emoji: string;
}

export const KIDS_CHECKLIST_TASKS: ChecklistTask[] = [
  { id: "read_quran", labelKey: "kidsChecklist.readQuran", emoji: "📖" },
  { id: "pray_on_time", labelKey: "kidsChecklist.prayOnTime", emoji: "🕌" },
  { id: "dua_before_sleep", labelKey: "kidsChecklist.duaBeforeSleep", emoji: "🤲" },
  { id: "good_deed", labelKey: "kidsChecklist.goodDeed", emoji: "⭐" },
  { id: "help_parents", labelKey: "kidsChecklist.helpParents", emoji: "🏠" },
  { id: "dhikr", labelKey: "kidsChecklist.dhikr", emoji: "📿" },
];

const STORAGE_KEY = "kids_checklist";

function getDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function loadAll(): Record<string, string[]> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function useKidsChecklist(date?: Date) {
  const today = date || new Date();
  const dateKey = getDateKey(today);

  const [allData, setAllData] = useState<Record<string, string[]>>(loadAll);

  useEffect(() => {
    const handler = () => setAllData(loadAll());
    window.addEventListener("storage", handler);
    window.addEventListener("kids-checklist-update", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("kids-checklist-update", handler);
    };
  }, []);

  const checkedIds = allData[dateKey] || [];

  const toggle = useCallback((taskId: string) => {
    const data = loadAll();
    const arr = data[dateKey] || [];
    if (arr.includes(taskId)) {
      data[dateKey] = arr.filter(id => id !== taskId);
    } else {
      data[dateKey] = [...arr, taskId];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setAllData({ ...data });
    window.dispatchEvent(new Event("kids-checklist-update"));
  }, [dateKey]);

  const completedCount = checkedIds.length;
  const totalCount = KIDS_CHECKLIST_TASKS.length;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Get streak (consecutive days with at least 1 task done)
  const streak = (() => {
    let count = 0;
    const d = new Date(today);
    // Start from yesterday if today has no tasks yet
    if (completedCount === 0) d.setDate(d.getDate() - 1);
    for (let i = 0; i < 60; i++) {
      const key = getDateKey(d);
      if ((allData[key] || []).length > 0) {
        count++;
        d.setDate(d.getDate() - 1);
      } else break;
    }
    if (completedCount > 0) return count; // includes today
    return count;
  })();

  // Last 7 days summary
  const weekSummary = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const key = getDateKey(d);
    const done = (allData[key] || []).length;
    return { date: key, done, total: totalCount, dayOfWeek: d.getDay() };
  });

  return {
    tasks: KIDS_CHECKLIST_TASKS,
    checkedIds,
    toggle,
    completedCount,
    totalCount,
    percent,
    streak,
    weekSummary,
    dateKey,
  };
}
