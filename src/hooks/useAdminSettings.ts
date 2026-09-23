import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AdminSettings {
  id: string;
  hide_announcement: boolean;
  hide_daily_challenge: boolean;
}

const DEFAULT_SETTINGS: AdminSettings = {
  id: "",
  hide_announcement: false,
  hide_daily_challenge: false,
};

export function useAdminSettings() {
  const [settings, setSettings] = useState<AdminSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data, error } = await supabase.rpc("get_public_admin_settings" as any);
    const row = Array.isArray(data) ? data[0] : data;
    if (!error && row) {
      setSettings(row as any);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const update = useCallback(async (updates: Partial<Pick<AdminSettings, "hide_announcement" | "hide_daily_challenge">>) => {
    if (!settings.id) return;
    const { error } = await supabase
      .from("admin_settings" as any)
      .update({ ...updates, updated_at: new Date().toISOString() } as any)
      .eq("id", settings.id);

    if (!error) {
      setSettings(prev => ({ ...prev, ...updates }));
    }
    return error;
  }, [settings.id]);

  return { settings, loading, update, refresh: fetch };
}
