import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface CrushLeaderboardEntry {
  id: string;
  user_id: string;
  display_name: string;
  avatar_emoji: string;
  level: number;
  high_score: number;
  max_combo: number;
  total_cleared: number;
}

export function useCrushLeaderboard() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<CrushLeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("crush_scores")
      .select("*")
      .order("high_score", { ascending: false })
      .limit(50);

    if (!error && data) {
      setLeaderboard(data as CrushLeaderboardEntry[]);
      if (user) {
        const idx = data.findIndex((e: any) => e.user_id === user.id);
        setMyRank(idx >= 0 ? idx + 1 : null);
      }
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);

  const saveScore = useCallback(async (score: number, level: number, maxCombo: number, totalCleared: number) => {
    if (!user) return;

    // Get display name from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, avatar_emoji")
      .eq("user_id", user.id)
      .maybeSingle();

    const displayName = profile?.display_name || "Joueur";
    const avatarEmoji = profile?.avatar_emoji || "🌙";

    const { data: existing } = await supabase
      .from("crush_scores")
      .select("high_score, level")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      // Only update if better
      if (score > (existing as any).high_score || level > (existing as any).level) {
        await supabase
          .from("crush_scores")
          .update({
            high_score: Math.max(score, (existing as any).high_score),
            level: Math.max(level, (existing as any).level),
            max_combo: maxCombo,
            total_cleared: totalCleared,
            display_name: displayName,
            avatar_emoji: avatarEmoji,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);
      }
    } else {
      await supabase
        .from("crush_scores")
        .insert({
          user_id: user.id,
          high_score: score,
          level,
          max_combo: maxCombo,
          total_cleared: totalCleared,
          display_name: displayName,
          avatar_emoji: avatarEmoji,
        });
    }

    fetchLeaderboard();
  }, [user, fetchLeaderboard]);

  return { leaderboard, myRank, loading, saveScore, fetchLeaderboard };
}
