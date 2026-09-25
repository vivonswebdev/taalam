import { supabase } from "@/integrations/supabase/client";

/**
 * Headers for protected edge functions (find-ayah, elevenlabs-tts, stt-chunk…).
 * They require the signed-in user's JWT: the publishable key alone is rejected (401).
 * Returns null when nobody is signed in.
 */
export async function getEdgeFunctionHeaders(): Promise<Record<string, string> | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return null;
  return {
    "Content-Type": "application/json",
    apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    Authorization: `Bearer ${session.access_token}`,
  };
}

export class AuthRequiredError extends Error {
  constructor() {
    super("auth-required");
    this.name = "AuthRequiredError";
  }
}
