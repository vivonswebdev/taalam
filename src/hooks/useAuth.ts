import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUpWithEmail = useCallback(async (email: string, displayName: string, avatarEmoji: string, isPublic: boolean, countryCode?: string, password?: string) => {
    const pwd = password || crypto.randomUUID();
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pwd,
      options: { data: { display_name: displayName, avatar_emoji: avatarEmoji } },
    });
    if (error) throw error;

    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        user_id: data.user.id,
        display_name: displayName,
        avatar_emoji: avatarEmoji,
        is_public: isPublic,
        country_code: countryCode || null,
      });
      if (profileError) console.error("Profile creation error:", profileError);
    }
    return data;
  }, []);

  const sendMagicLink = useCallback(async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return { user, session, loading, signUpWithEmail, sendMagicLink, signOut };
}
