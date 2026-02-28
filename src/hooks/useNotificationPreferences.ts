import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface NotificationPrefs {
  hifz_reminder: boolean;
  assignment_reminder: boolean;
  nudge_enabled: boolean;
  reminder_hour: number;
  reminder_minute: number;
  nudge_after_days: number;
}

const DEFAULT_PREFS: NotificationPrefs = {
  hifz_reminder: true,
  assignment_reminder: true,
  nudge_enabled: true,
  reminder_hour: 8,
  reminder_minute: 0,
  nudge_after_days: 3,
};

export function useNotificationPreferences() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPrefs = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setPrefs({
        hifz_reminder: data.hifz_reminder,
        assignment_reminder: data.assignment_reminder,
        nudge_enabled: data.nudge_enabled,
        reminder_hour: data.reminder_hour,
        reminder_minute: data.reminder_minute,
        nudge_after_days: data.nudge_after_days,
      });
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchPrefs();
  }, [fetchPrefs]);

  const savePrefs = useCallback(
    async (updated: Partial<NotificationPrefs>) => {
      if (!user) return;
      setSaving(true);
      const merged = { ...prefs, ...updated };
      setPrefs(merged);

      const { error } = await supabase
        .from("notification_preferences")
        .upsert(
          { user_id: user.id, ...merged, updated_at: new Date().toISOString() },
          { onConflict: "user_id" }
        );

      if (error) console.error("Failed to save notification preferences:", error);
      setSaving(false);
    },
    [user, prefs]
  );

  // FCM token management
  const saveFcmToken = useCallback(
    async (token: string, deviceInfo?: string) => {
      if (!user) return;
      await supabase
        .from("fcm_tokens")
        .upsert(
          { user_id: user.id, token, device_info: deviceInfo || "", updated_at: new Date().toISOString() },
          { onConflict: "user_id,token" }
        );
    },
    [user]
  );

  return { prefs, loading, saving, savePrefs, saveFcmToken };
}
