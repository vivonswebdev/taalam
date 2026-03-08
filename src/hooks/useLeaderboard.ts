import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getLigue, getHifzLevel, type Ligue } from "@/components/LigueBadge";
import { getSeedLeaderboardUsers } from "@/data/leaderboardSeedUsers";

export interface LeaderboardEntry {
  id: string;
  display_name: string;
  avatar_emoji: string;
  country_code: string | null;
  mastery_score: number;
  xp_total: number;
  sessions_count: number;
  user_id: string;
  ligue: Ligue;
  level: "beginner" | "intermediate" | "advanced";
  streak_days?: number;
}

function enrichEntry(row: any, streakDays?: number): LeaderboardEntry {
  return {
    ...row,
    ligue: getLigue(row.xp_total || 0),
    level: getHifzLevel(Number(row.mastery_score) || 0),
    streak_days: streakDays ?? 0,
  };
}

async function fetchStreaksForUsers(userIds: string[]): Promise<Map<string, number>> {
  if (userIds.length === 0) return new Map();
  const { data } = await supabase
    .from("quran_daily_activity")
    .select("user_id, activity_date")
    .in("user_id", userIds)
    .gte("activity_date", new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0])
    .order("activity_date", { ascending: false });

  const streakMap = new Map<string, number>();
  if (!data) return streakMap;

  // Group by user
  const byUser = new Map<string, string[]>();
  for (const row of data as any[]) {
    const arr = byUser.get(row.user_id) || [];
    arr.push(row.activity_date);
    byUser.set(row.user_id, arr);
  }

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  for (const [userId, dates] of byUser) {
    const unique = [...new Set(dates)].sort().reverse();
    let streak = 0;
    // Must have practiced today or yesterday to have an active streak
    if (unique[0] !== today && unique[0] !== yesterday) {
      streakMap.set(userId, 0);
      continue;
    }
    let expected = unique[0] === today ? today : yesterday;
    for (const d of unique) {
      if (d === expected) {
        streak++;
        const prev = new Date(expected);
        prev.setDate(prev.getDate() - 1);
        expected = prev.toISOString().split("T")[0];
      } else if (d < expected) {
        break;
      }
    }
    streakMap.set(userId, streak);
  }

  return streakMap;
}

export function useLeaderboard() {
  const [realGlobal, setRealGlobal] = useState<LeaderboardEntry[]>([]);
  const [countryBoard, setCountryBoard] = useState<LeaderboardEntry[]>([]);
  const [levelBoard, setLevelBoard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");

  const seedUsers = useMemo(() => getSeedLeaderboardUsers(), []);

  // Merge real + seed, deduplicate by user_id, sort by xp
  const globalBoard = useMemo(() => {
    const realIds = new Set(realGlobal.map((e) => e.user_id));
    const merged = [...realGlobal, ...seedUsers.filter((s) => !realIds.has(s.user_id))];
    return merged.sort((a, b) => b.xp_total - a.xp_total);
  }, [realGlobal, seedUsers]);

  const fetchGlobal = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, user_id, display_name, avatar_emoji, country_code, mastery_score, xp_total, sessions_count")
      .eq("is_public", true)
      .order("xp_total", { ascending: false })
      .limit(100);

    const profiles = data || [];
    const userIds = profiles.map((p: any) => p.user_id);
    const streakMap = await fetchStreaksForUsers(userIds);

    setRealGlobal(profiles.map((row: any) => enrichEntry(row, streakMap.get(row.user_id))));
    setLoading(false);
  }, []);

  const fetchByCountry = useCallback(async (country: string) => {
    setSelectedCountry(country);
    const { data } = await supabase
      .from("profiles")
      .select("id, user_id, display_name, avatar_emoji, country_code, mastery_score, xp_total, sessions_count")
      .eq("is_public", true)
      .eq("country_code", country)
      .order("xp_total", { ascending: false })
      .limit(50);

    const profiles = data || [];
    const userIds = profiles.map((p: any) => p.user_id);
    const streakMap = await fetchStreaksForUsers(userIds);

    setCountryBoard(profiles.map((row: any) => enrichEntry(row, streakMap.get(row.user_id))));
  }, []);

  const fetchByLevel = useCallback(async (level: "beginner" | "intermediate" | "advanced") => {
    setSelectedLevel(level);
    const { data } = await supabase
      .from("profiles")
      .select("id, user_id, display_name, avatar_emoji, country_code, mastery_score, xp_total, sessions_count")
      .eq("is_public", true)
      .order("xp_total", { ascending: false })
      .limit(200);

    const profiles = data || [];
    const userIds = profiles.map((p: any) => p.user_id);
    const streakMap = await fetchStreaksForUsers(userIds);

    const enriched = profiles.map((row: any) => enrichEntry(row, streakMap.get(row.user_id)));
    setLevelBoard(enriched.filter((e) => e.level === level).slice(0, 50));
  }, []);

  // Initial fetch
  useEffect(() => { fetchGlobal(); }, [fetchGlobal]);

  // Auto-refresh on tab visibility change & every 15s
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchGlobal();
    };
    document.addEventListener("visibilitychange", onVisible);
    const interval = setInterval(fetchGlobal, 15000);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      clearInterval(interval);
    };
  }, [fetchGlobal]);

  return {
    globalBoard, countryBoard, levelBoard,
    loading, selectedCountry, selectedLevel,
    fetchGlobal, fetchByCountry, fetchByLevel,
  };
}
