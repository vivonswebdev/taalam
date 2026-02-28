import { useMemo } from "react";
import { useChildProfiles, type ChildSession } from "@/hooks/useChildProfiles";
import { surahs } from "@/data/surahs";

// ─── Types ──────────────────────────────────────────────────
export interface DayActivity {
  date: string; // YYYY-MM-DD
  active: boolean;
  sessionsCount: number;
  totalMinutes: number;
}

export interface RecentActivityItem {
  id: string;
  label: string;
  emoji: string;
  date: string;
  detail?: string;
}

export interface ChildDashboardStats {
  minutesQuran7d: number;
  versetsWorked7d: number;
  sessionsCount7d: number;
  nooraniCompleted: number;
  nooraniTotal: number;
  kidsPrayerDone: boolean;
  kidsHajjDone: boolean;
  checklistToday: number;
  checklistTotal: number;
  dayTimeline: DayActivity[];
  recentActivities: RecentActivityItem[];
}

// ─── Helpers ────────────────────────────────────────────────
function getDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getDaysBetween(d1: Date, d2: Date): number {
  return Math.floor((d2.getTime() - d1.getTime()) / 86400000);
}

function surahName(n: number): string {
  const s = surahs.find(su => su.number === n);
  return s?.nameArabic || `Sourate ${n}`;
}

const MODE_LABELS: Record<string, string> = {
  control_hifz: "Contrôle Hifz",
  tahaddi: "Tahaddi",
  reading: "Lecture",
};

// ─── Noorani progress from localStorage ─────────────────────
function getNooraniCompleted(): string[] {
  try {
    return JSON.parse(localStorage.getItem("noorani_progress") || "[]");
  } catch {
    return [];
  }
}

// ─── Kids module completion from localStorage ───────────────
function getKidsModuleDone(key: string): boolean {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) === true : false;
  } catch {
    return false;
  }
}

// ─── Hook ───────────────────────────────────────────────────
export function useChildDashboard(childId: string | undefined): ChildDashboardStats | null {
  const { getSessionsForChild } = useChildProfiles();

  return useMemo(() => {
    if (!childId) return null;

    const allSessions = getSessionsForChild(childId);
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    // Filter sessions from last 7 days
    const recentSessions = allSessions.filter(
      s => new Date(s.date) >= sevenDaysAgo
    );

    // Minutes
    const minutesQuran7d = Math.round(
      recentSessions.reduce((sum, s) => sum + (s.durationSeconds || 0), 0) / 60
    );

    // Unique ayah ranges worked (approximate versets count)
    const versetsWorked7d = recentSessions.length; // Each session = passage worked

    // Sessions count
    const sessionsCount7d = recentSessions.length;

    // Noorani progress (global, not per-child for now)
    const nooraniDone = getNooraniCompleted();
    const nooraniTotal = 28; // from NOORANI_LESSONS

    // Kids module checks
    const kidsPrayerDone = getKidsModuleDone(`kidsPrayer_${childId}`);
    const kidsHajjDone = getKidsModuleDone(`kidsHajj_${childId}`);

    // Day timeline (last 7 days)
    const dayTimeline: DayActivity[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateStr = getDateStr(d);
      const daySessions = allSessions.filter(s => s.date.startsWith(dateStr));
      dayTimeline.push({
        date: dateStr,
        active: daySessions.length > 0,
        sessionsCount: daySessions.length,
        totalMinutes: Math.round(daySessions.reduce((sum, s) => sum + (s.durationSeconds || 0), 0) / 60),
      });
    }

    // Recent activities (last 10 sessions)
    const recentActivities: RecentActivityItem[] = allSessions.slice(0, 10).map(s => {
      const name = surahName(s.surahNumber);
      const modeLabel = MODE_LABELS[s.mode] || s.mode;
      return {
        id: s.id,
        label: `${modeLabel} – ${name}`,
        emoji: s.mode === "control_hifz" ? "📝" : s.mode === "tahaddi" ? "🎯" : "📖",
        date: s.date,
        detail: `${s.score}%${s.durationSeconds ? ` · ${Math.round(s.durationSeconds / 60)}min` : ""}`,
      };
    });

    // Add Noorani entries if any
    if (nooraniDone.length > 0) {
      recentActivities.push({
        id: "noorani-progress",
        label: `Noorani – ${nooraniDone.length}/${nooraniTotal} leçons`,
        emoji: "🔤",
        date: new Date().toISOString(),
        detail: `${Math.round((nooraniDone.length / nooraniTotal) * 100)}%`,
      });
    }

    return {
      minutesQuran7d,
      versetsWorked7d,
      sessionsCount7d,
      nooraniCompleted: nooraniDone.length,
      nooraniTotal,
      kidsPrayerDone,
      kidsHajjDone,
      dayTimeline,
      recentActivities: recentActivities.slice(0, 12),
    };
  }, [childId, getSessionsForChild]);
}
