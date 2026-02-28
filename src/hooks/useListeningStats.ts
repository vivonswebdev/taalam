import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface ListeningSession {
  id: string;
  surah_number: number;
  from_ayah: number;
  to_ayah: number | null;
  duration_seconds: number;
  has_quiz: boolean;
  quiz_score: number | null;
  created_at: string;
}

export interface DailyListening {
  date: string;
  minutes: number;
  sessions: number;
}

export interface ListeningStats {
  todayListeningMinutes: number;
  totalListeningMinutes: number;
  lastSession: ListeningSession | null;
  averageQuizScore: number | null;
  sessionsCount: number;
  dailyListening: Record<string, DailyListening>;
}

export function useListeningStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ListeningStats>({
    todayListeningMinutes: 0,
    totalListeningMinutes: 0,
    lastSession: null,
    averageQuizScore: null,
    sessionsCount: 0,
    dailyListening: {},
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      const today = new Date().toISOString().slice(0, 10);
      const { data: sessions } = await supabase
        .from("listening_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(500);

      if (!sessions || sessions.length === 0) {
        setStats({ todayListeningMinutes: 0, totalListeningMinutes: 0, lastSession: null, averageQuizScore: null, sessionsCount: 0 });
        setLoading(false);
        return;
      }

      let totalSeconds = 0;
      let todaySeconds = 0;
      let quizTotal = 0;
      let quizCount = 0;

      for (const s of sessions) {
        const dur = (s as any).duration_seconds || 0;
        totalSeconds += dur;
        if (s.created_at?.startsWith(today)) todaySeconds += dur;
        if ((s as any).has_quiz && (s as any).quiz_score != null) {
          quizTotal += (s as any).quiz_score;
          quizCount++;
        }
      }

      setStats({
        todayListeningMinutes: Math.round(todaySeconds / 60),
        totalListeningMinutes: Math.round(totalSeconds / 60),
        lastSession: sessions[0] as any,
        averageQuizScore: quizCount > 0 ? Math.round(quizTotal / quizCount) : null,
        sessionsCount: sessions.length,
      });
    } catch {
      // silent
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const saveSession = useCallback(async (params: {
    surah_number: number;
    from_ayah: number;
    to_ayah: number;
    duration_seconds: number;
    has_quiz: boolean;
    quiz_score?: number;
  }) => {
    if (!user) return;
    await supabase.from("listening_sessions").insert({
      user_id: user.id,
      surah_number: params.surah_number,
      from_ayah: params.from_ayah,
      to_ayah: params.to_ayah,
      duration_seconds: params.duration_seconds,
      listened_full: params.to_ayah > 0,
      has_quiz: params.has_quiz,
      quiz_score: params.quiz_score ?? null,
      source: "advanced",
    } as any);
    fetchStats();
  }, [user, fetchStats]);

  return { ...stats, loading, saveSession, refresh: fetchStats };
}
