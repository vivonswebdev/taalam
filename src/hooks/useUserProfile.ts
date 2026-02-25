import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_emoji: string;
  is_public: boolean;
  country_code: string | null;
  mastery_score: number;
  xp_total: number;
  sessions_count: number;
  created_at: string;
}

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) { setProfile(null); setLoading(false); return; }
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    setProfile(data as UserProfile | null);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const updateProfile = useCallback(async (updates: Partial<Pick<UserProfile, "display_name" | "avatar_emoji" | "is_public" | "country_code">>) => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update(updates).eq("user_id", user.id);
    if (!error) fetchProfile();
    return error;
  }, [user, fetchProfile]);

  return { profile, loading, updateProfile, refetch: fetchProfile };
}
