import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface WeakSurah {
  surah_number: number;
  weakness_score: number;
  last_updated_at: string;
}

export function useWeakSurahs() {
  const { user } = useAuth();
  const [weakSurahs, setWeakSurahs] = useState<WeakSurah[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWeak = useCallback(async () => {
    if (!user) { setWeakSurahs([]); setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from("weak_surahs")
      .select("surah_number, weakness_score, last_updated_at")
      .eq("user_id", user.id)
      .order("weakness_score", { ascending: false })
      .limit(10);
    setWeakSurahs((data || []) as WeakSurah[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchWeak(); }, [fetchWeak]);

  /** Upsert a weakness score for a surah */
  const updateWeakness = useCallback(async (surahNumber: number, score: number) => {
    if (!user) return;
    // Try update first, then insert
    const { data: existing } = await supabase
      .from("weak_surahs")
      .select("id")
      .eq("user_id", user.id)
      .eq("surah_number", surahNumber)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("weak_surahs")
        .update({ weakness_score: score, last_updated_at: new Date().toISOString() })
        .eq("id", existing.id);
    } else {
      await supabase.from("weak_surahs").insert({
        user_id: user.id,
        surah_number: surahNumber,
        weakness_score: score,
      });
    }
    await fetchWeak();
  }, [user, fetchWeak]);

  /** Log a completed listening session */
  const logListeningSession = useCallback(async (
    surahNumber: number,
    listenedFull: boolean,
    source: "reader" | "background" | "playlist_weak" = "reader"
  ) => {
    if (!user) return;
    await supabase.from("listening_sessions").insert({
      user_id: user.id,
      surah_number: surahNumber,
      listened_full: listenedFull,
      source,
      end_at: new Date().toISOString(),
    });

    // If listened in full, reduce weakness score
    if (listenedFull) {
      const { data: ws } = await supabase
        .from("weak_surahs")
        .select("id, weakness_score")
        .eq("user_id", user.id)
        .eq("surah_number", surahNumber)
        .maybeSingle();

      if (ws) {
        const newScore = Math.max(0, (ws.weakness_score as number) * 0.8); // decay by 20%
        await supabase
          .from("weak_surahs")
          .update({ weakness_score: newScore, last_updated_at: new Date().toISOString() })
          .eq("id", ws.id);
        await fetchWeak();
      }
    }
  }, [user, fetchWeak]);

  return { weakSurahs, loading, updateWeakness, logListeningSession, refetch: fetchWeak };
}
