import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getLigue, getHifzLevel, type Ligue } from "@/components/LigueBadge";

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
}

function enrichEntry(row: any): LeaderboardEntry {
  return {
    ...row,
    ligue: getLigue(row.xp_total || 0),
    level: getHifzLevel(Number(row.mastery_score) || 0),
  };
}

export function useLeaderboard() {
  const [globalBoard, setGlobalBoard] = useState<LeaderboardEntry[]>([]);
  const [countryBoard, setCountryBoard] = useState<LeaderboardEntry[]>([]);
  const [levelBoard, setLevelBoard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");

  const fetchGlobal = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, user_id, display_name, avatar_emoji, country_code, mastery_score, xp_total, sessions_count")
      .eq("is_public", true)
      .order("xp_total", { ascending: false })
      .limit(100);
    setGlobalBoard((data || []).map(enrichEntry));
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
    setCountryBoard((data || []).map(enrichEntry));
  }, []);

  const fetchByLevel = useCallback(async (level: "beginner" | "intermediate" | "advanced") => {
    setSelectedLevel(level);
    // Fetch all public profiles and filter by computed level
    const { data } = await supabase
      .from("profiles")
      .select("id, user_id, display_name, avatar_emoji, country_code, mastery_score, xp_total, sessions_count")
      .eq("is_public", true)
      .order("xp_total", { ascending: false })
      .limit(200);
    const enriched = (data || []).map(enrichEntry);
    setLevelBoard(enriched.filter((e) => e.level === level).slice(0, 50));
  }, []);

  useEffect(() => { fetchGlobal(); }, [fetchGlobal]);

  return {
    globalBoard, countryBoard, levelBoard,
    loading, selectedCountry, selectedLevel,
    fetchGlobal, fetchByCountry, fetchByLevel,
  };
}
