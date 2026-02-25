import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface WeeklyChallenge {
  id: string;
  class_id: string;
  week_start: string;
  surah_number: number;
  ayah_from: number;
  ayah_to: number;
  double_xp: boolean;
  created_by: string;
  created_at: string;
}

export interface ChallengeResult {
  id: string;
  challenge_id: string;
  class_id: string;
  user_id: string;
  score: number;
  completed_at: string;
}

/** Returns the Monday (ISO date) of the current week */
export function getCurrentWeekStart(): string {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().slice(0, 10);
}

export function useWeeklyChallenge(classId?: string) {
  const { user } = useAuth();
  const [challenge, setChallenge] = useState<WeeklyChallenge | null>(null);
  const [results, setResults] = useState<ChallengeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [myResult, setMyResult] = useState<ChallengeResult | null>(null);
  const [pastChallenges, setPastChallenges] = useState<(WeeklyChallenge & { results: ChallengeResult[] })[]>([]);

  const weekStart = getCurrentWeekStart();

  const fetchChallenge = useCallback(async () => {
    if (!classId) return;
    setLoading(true);

    // Current week challenge
    const { data } = await supabase
      .from("class_weekly_challenges")
      .select("*")
      .eq("class_id", classId)
      .eq("week_start", weekStart)
      .maybeSingle();
    
    const ch = data as WeeklyChallenge | null;
    setChallenge(ch);

    if (ch) {
      const { data: res } = await supabase
        .from("class_challenge_results")
        .select("*")
        .eq("challenge_id", ch.id);
      const results = (res || []) as ChallengeResult[];
      setResults(results);
      if (user) {
        setMyResult(results.find((r) => r.user_id === user.id) || null);
      }
    } else {
      setResults([]);
      setMyResult(null);
    }

    // Past challenges (not current week)
    const { data: pastData } = await supabase
      .from("class_weekly_challenges")
      .select("*")
      .eq("class_id", classId)
      .neq("week_start", weekStart)
      .order("week_start", { ascending: false })
      .limit(10);

    if (pastData && pastData.length > 0) {
      const pastIds = (pastData as WeeklyChallenge[]).map((c) => c.id);
      const { data: pastResults } = await supabase
        .from("class_challenge_results")
        .select("*")
        .in("challenge_id", pastIds);
      const allPastResults = (pastResults || []) as ChallengeResult[];

      setPastChallenges(
        (pastData as WeeklyChallenge[]).map((c) => ({
          ...c,
          results: allPastResults.filter((r) => r.challenge_id === c.id).sort((a, b) => b.score - a.score),
        }))
      );
    } else {
      setPastChallenges([]);
    }

    setLoading(false);
  }, [classId, weekStart, user]);

  useEffect(() => { fetchChallenge(); }, [fetchChallenge]);

  const createChallenge = useCallback(async (
    surahNumber: number, ayahFrom: number, ayahTo: number, doubleXp: boolean
  ) => {
    if (!user || !classId) return null;
    const { data, error } = await supabase
      .from("class_weekly_challenges")
      .insert({
        class_id: classId,
        week_start: weekStart,
        surah_number: surahNumber,
        ayah_from: ayahFrom,
        ayah_to: ayahTo,
        double_xp: doubleXp,
        created_by: user.id,
      })
      .select()
      .single();
    if (error) { console.error(error); return null; }
    const newCh = data as WeeklyChallenge;
    setChallenge(newCh);
    return newCh;
  }, [user, classId, weekStart]);

  const submitResult = useCallback(async (score: number) => {
    if (!user || !challenge || !classId) return;
    const { data, error } = await supabase
      .from("class_challenge_results")
      .insert({
        challenge_id: challenge.id,
        class_id: classId,
        user_id: user.id,
        score,
      })
      .select()
      .single();
    if (error) {
      if (error.code === "23505") return; // already submitted
      console.error(error);
      return;
    }
    const result = data as ChallengeResult;
    setMyResult(result);
    setResults((prev) => [...prev, result]);
  }, [user, challenge, classId]);

  return {
    challenge,
    results,
    myResult,
    loading,
    createChallenge,
    submitResult,
    refetch: fetchChallenge,
    weekStart,
    pastChallenges,
  };
}

/** Fetch active challenges across ALL classes user belongs to */
export function useMyClassChallenges() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<(WeeklyChallenge & { className: string })[]>([]);
  const [myResults, setMyResults] = useState<ChallengeResult[]>([]);

  useEffect(() => {
    if (!user) return;
    const weekStart = getCurrentWeekStart();

    (async () => {
      // Get user's class IDs
      const { data: memberships } = await supabase
        .from("classroom_members")
        .select("classroom_id")
        .eq("user_id", user.id);

      const { data: taught } = await supabase
        .from("classrooms")
        .select("id")
        .eq("teacher_id", user.id);

      const allIds = [
        ...(memberships || []).map((m: any) => m.classroom_id),
        ...(taught || []).map((c: any) => c.id),
      ];
      const uniqueIds = [...new Set(allIds)];
      if (uniqueIds.length === 0) return;

      // Fetch challenges for this week
      const { data: chs } = await supabase
        .from("class_weekly_challenges")
        .select("*")
        .in("class_id", uniqueIds)
        .eq("week_start", weekStart);

      if (!chs || chs.length === 0) return;

      // Get class names
      const { data: classes } = await supabase
        .from("classrooms")
        .select("id, name")
        .in("id", uniqueIds);
      const nameMap = new Map((classes || []).map((c: any) => [c.id, c.name]));

      const enriched = (chs as WeeklyChallenge[]).map((ch) => ({
        ...ch,
        className: nameMap.get(ch.class_id) || "",
      }));
      setChallenges(enriched);

      // Get my results for these challenges
      const challengeIds = enriched.map((c) => c.id);
      const { data: res } = await supabase
        .from("class_challenge_results")
        .select("*")
        .in("challenge_id", challengeIds)
        .eq("user_id", user.id);
      setMyResults((res || []) as ChallengeResult[]);
    })();
  }, [user]);

  return { challenges, myResults };
}
