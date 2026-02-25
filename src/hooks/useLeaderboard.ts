import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface LeaderboardEntry {
  id: string;
  display_name: string;
  avatar_emoji: string;
  country_code: string | null;
  mastery_score: number;
  xp_total: number;
  sessions_count: number;
}

export function useLeaderboard() {
  const [globalBoard, setGlobalBoard] = useState<LeaderboardEntry[]>([]);
  const [countryBoard, setCountryBoard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const fetchGlobal = useCallback(async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_emoji, country_code, mastery_score, xp_total, sessions_count")
      .eq("is_public", true)
      .order("xp_total", { ascending: false })
      .limit(100);
    setGlobalBoard((data as LeaderboardEntry[]) || []);
    setLoading(false);
  }, []);

  const fetchByCountry = useCallback(async (country: string) => {
    setSelectedCountry(country);
    const { data } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_emoji, country_code, mastery_score, xp_total, sessions_count")
      .eq("is_public", true)
      .eq("country_code", country)
      .order("xp_total", { ascending: false })
      .limit(50);
    setCountryBoard((data as LeaderboardEntry[]) || []);
  }, []);

  useEffect(() => { fetchGlobal(); }, [fetchGlobal]);

  return { globalBoard, countryBoard, loading, selectedCountry, fetchGlobal, fetchByCountry };
}
