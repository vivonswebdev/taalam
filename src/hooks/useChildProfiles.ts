import { useState, useCallback, useEffect } from "react";

// ─── Types ──────────────────────────────────────────────────
export interface ChildProfile {
  id: string;
  name: string;
  avatarEmoji: string;
  age?: number;
  createdAt: string;
}

export interface ChildSession {
  id: string;
  childId: string;
  date: string;
  mode: "control_hifz" | "tahaddi" | "reading";
  surahNumber: number;
  ayahRange?: string;
  score: number;
  durationSeconds?: number;
}

export interface ChildWeeklyReport {
  childId: string;
  weekStart: string;
  weekEnd: string;
  passagesWorked: { surahNumber: number; ayahRange?: string }[];
  sessionsCount: number;
  avgScore: number;
  strongSurahs: number[];
  weakSurahs: number[];
  totalTimeSeconds: number;
  progressDelta: number;
}

// ─── Constants ──────────────────────────────────────────────
const PROFILES_KEY = "quranEasyChildProfiles";
const SESSIONS_KEY = "quranEasyChildSessions";
const PIN_KEY = "quranEasyParentPin";

const AVATAR_EMOJIS = ["👦", "👧", "🧒", "👶", "🧒🏽", "👦🏾", "👧🏻", "🧕"];

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ─── Hook ───────────────────────────────────────────────────
export function useChildProfiles() {
  const [profiles, setProfiles] = useState<ChildProfile[]>(() => {
    try {
      const s = localStorage.getItem(PROFILES_KEY);
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

  const [sessions, setSessions] = useState<ChildSession[]>(() => {
    try {
      const s = localStorage.getItem(SESSIONS_KEY);
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  }, [sessions]);

  // ─── Profile CRUD ──────────────────────────────────────────
  const addProfile = useCallback((name: string, avatarEmoji?: string, age?: number): ChildProfile => {
    const profile: ChildProfile = {
      id: generateId(),
      name,
      avatarEmoji: avatarEmoji || AVATAR_EMOJIS[Math.floor(Math.random() * AVATAR_EMOJIS.length)],
      age,
      createdAt: new Date().toISOString(),
    };
    setProfiles(prev => [...prev, profile]);
    return profile;
  }, []);

  const updateProfile = useCallback((id: string, updates: Partial<Pick<ChildProfile, "name" | "avatarEmoji" | "age">>) => {
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const deleteProfile = useCallback((id: string) => {
    setProfiles(prev => prev.filter(p => p.id !== id));
    setSessions(prev => prev.filter(s => s.childId !== id));
  }, []);

  // ─── Sessions ──────────────────────────────────────────────
  const addSession = useCallback((session: Omit<ChildSession, "id">): ChildSession => {
    const full: ChildSession = { ...session, id: generateId() };
    setSessions(prev => [...prev, full]);
    return full;
  }, []);

  const getSessionsForChild = useCallback((childId: string): ChildSession[] => {
    return sessions.filter(s => s.childId === childId).sort((a, b) => b.date.localeCompare(a.date));
  }, [sessions]);

  // ─── Stats ─────────────────────────────────────────────────
  const getChildMastery = useCallback((childId: string): number => {
    const childSessions = sessions.filter(s => s.childId === childId);
    if (childSessions.length === 0) return 0;
    const surahScores = new Map<number, number>();
    childSessions.forEach(s => {
      const current = surahScores.get(s.surahNumber) || 0;
      surahScores.set(s.surahNumber, Math.max(current, s.score));
    });
    const total = Array.from(surahScores.values()).reduce((a, b) => a + b, 0);
    return Math.round(total / surahScores.size);
  }, [sessions]);

  const getChildSurahBestScores = useCallback((childId: string): Map<number, number> => {
    const childSessions = sessions.filter(s => s.childId === childId);
    const map = new Map<number, number>();
    childSessions.forEach(s => {
      const current = map.get(s.surahNumber) || 0;
      map.set(s.surahNumber, Math.max(current, s.score));
    });
    return map;
  }, [sessions]);

  // ─── Weekly Report ─────────────────────────────────────────
  const generateWeeklyReport = useCallback((childId: string): ChildWeeklyReport => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);

    const weekSessions = sessions.filter(
      s => s.childId === childId && new Date(s.date) >= weekStart
    );

    const passages = weekSessions.map(s => ({
      surahNumber: s.surahNumber,
      ayahRange: s.ayahRange,
    }));

    const surahScores = new Map<number, number[]>();
    weekSessions.forEach(s => {
      const arr = surahScores.get(s.surahNumber) || [];
      arr.push(s.score);
      surahScores.set(s.surahNumber, arr);
    });

    const strongSurahs: number[] = [];
    const weakSurahs: number[] = [];
    surahScores.forEach((scores, surah) => {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (avg >= 70) strongSurahs.push(surah);
      else if (avg < 50) weakSurahs.push(surah);
    });

    const totalTime = weekSessions.reduce((a, s) => a + (s.durationSeconds || 0), 0);
    const avgScore = weekSessions.length > 0
      ? Math.round(weekSessions.reduce((a, s) => a + s.score, 0) / weekSessions.length)
      : 0;

    // Simple progress delta: compare this week avg to all-time avg
    const allSessions = sessions.filter(s => s.childId === childId);
    const allTimeAvg = allSessions.length > 0
      ? allSessions.reduce((a, s) => a + s.score, 0) / allSessions.length
      : 0;
    const progressDelta = Math.round(avgScore - allTimeAvg);

    return {
      childId,
      weekStart: weekStart.toISOString(),
      weekEnd: now.toISOString(),
      passagesWorked: passages,
      sessionsCount: weekSessions.length,
      avgScore,
      strongSurahs,
      weakSurahs,
      totalTimeSeconds: totalTime,
      progressDelta,
    };
  }, [sessions]);

  // ─── PIN ───────────────────────────────────────────────────
  const getPin = useCallback((): string | null => {
    return localStorage.getItem(PIN_KEY);
  }, []);

  const setPin = useCallback((pin: string) => {
    localStorage.setItem(PIN_KEY, pin);
  }, []);

  const verifyPin = useCallback((input: string): boolean => {
    const stored = localStorage.getItem(PIN_KEY);
    return stored === input;
  }, []);

  return {
    profiles,
    sessions,
    addProfile,
    updateProfile,
    deleteProfile,
    addSession,
    getSessionsForChild,
    getChildMastery,
    getChildSurahBestScores,
    generateWeeklyReport,
    getPin,
    setPin,
    verifyPin,
    AVATAR_EMOJIS,
  };
}
