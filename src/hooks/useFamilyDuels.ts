import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface FamilyChallenge {
  id: string;
  family_id: string;
  title: string;
  challenge_type: string;
  surah_number: number | null;
  ayah_from: number | null;
  ayah_to: number | null;
  xp_reward: number;
  created_by: string;
  starts_at: string;
  ends_at: string;
  created_at: string;
}

export interface FamilyChallengeScore {
  id: string;
  challenge_id: string;
  family_id: string;
  user_id: string;
  score: number;
  completed_at: string;
  // joined
  display_name?: string;
  avatar_emoji?: string;
}

export function useFamilyDuels(familyId: string | null) {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<FamilyChallenge[]>([]);
  const [scores, setScores] = useState<FamilyChallengeScore[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChallenges = useCallback(async () => {
    if (!familyId || !user) { setLoading(false); return; }
    setLoading(true);

    const { data } = await supabase
      .from("family_challenges")
      .select("*")
      .eq("family_id", familyId)
      .order("created_at", { ascending: false });

    setChallenges((data as FamilyChallenge[]) || []);

    if (data && data.length > 0) {
      const challengeIds = data.map((c: any) => c.id);
      const { data: scoreData } = await supabase
        .from("family_challenge_scores")
        .select("*")
        .in("challenge_id", challengeIds);

      if (scoreData && scoreData.length > 0) {
        const userIds = [...new Set(scoreData.map((s: any) => s.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name, avatar_emoji")
          .in("user_id", userIds);
        const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

        setScores(
          scoreData.map((s: any) => ({
            ...s,
            display_name: profileMap.get(s.user_id)?.display_name || "?",
            avatar_emoji: profileMap.get(s.user_id)?.avatar_emoji || "🌙",
          }))
        );
      } else {
        setScores([]);
      }
    }
    setLoading(false);
  }, [familyId, user]);

  useEffect(() => { fetchChallenges(); }, [fetchChallenges]);

  const createChallenge = useCallback(async (challenge: {
    title: string;
    challenge_type: string;
    surah_number?: number;
    ayah_from?: number;
    ayah_to?: number;
    xp_reward?: number;
    ends_at?: string;
  }) => {
    if (!user || !familyId) return null;
    const { data, error } = await supabase
      .from("family_challenges")
      .insert({
        family_id: familyId,
        created_by: user.id,
        title: challenge.title,
        challenge_type: challenge.challenge_type,
        surah_number: challenge.surah_number || null,
        ayah_from: challenge.ayah_from || null,
        ayah_to: challenge.ayah_to || null,
        xp_reward: challenge.xp_reward || 50,
        ends_at: challenge.ends_at || new Date(Date.now() + 7 * 86400000).toISOString(),
      })
      .select()
      .single();
    if (!error && data) {
      await fetchChallenges();
      return data;
    }
    return null;
  }, [user, familyId, fetchChallenges]);

  const submitScore = useCallback(async (challengeId: string, score: number) => {
    if (!user || !familyId) return false;
    const { error } = await supabase
      .from("family_challenge_scores")
      .upsert({
        challenge_id: challengeId,
        family_id: familyId,
        user_id: user.id,
        score,
        completed_at: new Date().toISOString(),
      }, { onConflict: "challenge_id,user_id" });
    if (!error) await fetchChallenges();
    return !error;
  }, [user, familyId, fetchChallenges]);

  const deleteChallenge = useCallback(async (challengeId: string) => {
    const { error } = await supabase
      .from("family_challenges")
      .delete()
      .eq("id", challengeId);
    if (!error) await fetchChallenges();
    return !error;
  }, [fetchChallenges]);

  const getScoresForChallenge = useCallback(
    (challengeId: string) =>
      scores
        .filter((s) => s.challenge_id === challengeId)
        .sort((a, b) => b.score - a.score),
    [scores]
  );

  const activeChallenges = challenges.filter((c) => new Date(c.ends_at) > new Date());
  const pastChallenges = challenges.filter((c) => new Date(c.ends_at) <= new Date());

  return {
    challenges,
    activeChallenges,
    pastChallenges,
    scores,
    loading,
    createChallenge,
    submitScore,
    deleteChallenge,
    getScoresForChallenge,
    refresh: fetchChallenges,
  };
}
