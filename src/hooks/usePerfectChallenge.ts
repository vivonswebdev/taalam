import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface PerfectChallenge {
  id: string;
  type: string;
  start_at: string;
  end_at: string;
  created_at: string;
}

export interface PerfectChallengeScore {
  id: string;
  challenge_id: string;
  user_id: string;
  best_score: number;
  plays: number;
  updated_at: string;
}

export interface LeaderboardRow {
  user_id: string;
  best_score: number;
  plays: number;
  display_name: string;
  avatar_emoji: string;
}

export function usePerfectChallenge() {
  const { user } = useAuth();
  const [challenge, setChallenge] = useState<PerfectChallenge | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [myScore, setMyScore] = useState<PerfectChallengeScore | null>(null);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchActive = useCallback(async () => {
    setLoading(true);
    const now = new Date().toISOString();

    // Get active challenge
    const { data: ch } = await supabase
      .from("perfect_challenges")
      .select("*")
      .lte("start_at", now)
      .gte("end_at", now)
      .order("start_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const active = ch as PerfectChallenge | null;
    setChallenge(active);

    if (!active) {
      setLeaderboard([]);
      setMyScore(null);
      setMyRank(null);
      setLoading(false);
      return;
    }

    // Get scores for this challenge
    const { data: scores } = await supabase
      .from("perfect_challenge_scores")
      .select("*")
      .eq("challenge_id", active.id)
      .order("best_score", { ascending: false });

    const allScores = (scores || []) as PerfectChallengeScore[];

    // Get profiles for display names
    const userIds = allScores.map((s) => s.user_id);
    let profileMap = new Map<string, { display_name: string; avatar_emoji: string }>();
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_emoji")
        .in("user_id", userIds);
      (profiles || []).forEach((p: any) => {
        profileMap.set(p.user_id, { display_name: p.display_name, avatar_emoji: p.avatar_emoji });
      });
    }

    const board: LeaderboardRow[] = allScores.map((s) => ({
      user_id: s.user_id,
      best_score: s.best_score,
      plays: s.plays,
      display_name: profileMap.get(s.user_id)?.display_name || "???",
      avatar_emoji: profileMap.get(s.user_id)?.avatar_emoji || "🌙",
    }));
    setLeaderboard(board);

    if (user) {
      const mine = allScores.find((s) => s.user_id === user.id) || null;
      setMyScore(mine);
      const rank = board.findIndex((r) => r.user_id === user.id);
      setMyRank(rank >= 0 ? rank + 1 : null);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchActive();
  }, [fetchActive]);

  /** Submit or update score after a Mode Parfait quiz */
  const submitScore = useCallback(
    async (score: number) => {
      if (!user || !challenge) return;

      if (myScore) {
        // Update: increment plays, keep best
        await supabase
          .from("perfect_challenge_scores")
          .update({
            best_score: Math.max(myScore.best_score, score),
            plays: myScore.plays + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", myScore.id);
      } else {
        // Insert new
        await supabase.from("perfect_challenge_scores").insert({
          challenge_id: challenge.id,
          user_id: user.id,
          best_score: score,
          plays: 1,
        });
      }

      // Refresh
      await fetchActive();
    },
    [user, challenge, myScore, fetchActive]
  );

  return { challenge, leaderboard, myScore, myRank, loading, submitScore, refetch: fetchActive };
}
