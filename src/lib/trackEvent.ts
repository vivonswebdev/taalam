import { supabase } from "@/integrations/supabase/client";

/**
 * Fire-and-forget event tracking for admin analytics.
 * Never blocks UI — silently fails on error.
 */
export async function trackEvent(
  eventType: string,
  module: string,
  payload?: Record<string, any>
) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    await supabase.from("app_events").insert({
      user_id: session?.user?.id ?? null,
      event_type: eventType,
      module,
      payload: payload || {},
    });
  } catch {
    // Never break the app
  }
}
