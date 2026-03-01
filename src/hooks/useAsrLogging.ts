import { useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface AsrLogEntry {
  mode: string;
  surahNumber?: number;
  ayahNumber?: number;
  expectedText?: string;
  recognizedText?: string;
  confidenceScore?: number;
  isCorrect?: boolean;
  durationMs?: number;
  volumeAvg?: number;
  volumePeak?: number;
}

function getDeviceInfo(): string {
  try {
    const ua = navigator.userAgent;
    const platform = navigator.platform || "";
    return `${platform} | ${ua.slice(0, 120)}`;
  } catch { return "unknown"; }
}

function computeWER(expected: string, recognized: string): number {
  const expWords = expected.trim().split(/\s+/).filter(Boolean);
  const recWords = recognized.trim().split(/\s+/).filter(Boolean);
  if (expWords.length === 0) return recognized.trim() ? 1 : 0;

  const n = expWords.length;
  const m = recWords.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  for (let i = 0; i <= n; i++) dp[i][0] = i;
  for (let j = 0; j <= m; j++) dp[0][j] = j;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = expWords[i - 1] === recWords[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[n][m] / n;
}

function computeCER(expected: string, recognized: string): number {
  const a = expected.replace(/\s/g, "");
  const b = recognized.replace(/\s/g, "");
  if (a.length === 0) return b.length ? 1 : 0;

  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  for (let i = 0; i <= n; i++) dp[i][0] = i;
  for (let j = 0; j <= m; j++) dp[0][j] = j;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[n][m] / n;
}

/**
 * Hook for logging ASR dictation results to the asr_logs table.
 * Non-blocking: errors are silently caught so they never break the UX.
 */
export function useAsrLogging() {
  const { user } = useAuth();
  const sessionIdRef = useRef(`s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);

  const getVoiceProfile = useCallback((): string => {
    try { return localStorage.getItem("asr_voice_profile") || "adult"; } catch { return "adult"; }
  }, []);

  const getScoringMode = useCallback((): string => {
    try { return localStorage.getItem("asr_scoring_mode") || "beginner"; } catch { return "beginner"; }
  }, []);

  const logResult = useCallback(async (entry: AsrLogEntry) => {
    try {
      const wer = entry.expectedText && entry.recognizedText
        ? computeWER(entry.expectedText, entry.recognizedText)
        : null;
      const cer = entry.expectedText && entry.recognizedText
        ? computeCER(entry.expectedText, entry.recognizedText)
        : null;

      await supabase.from("asr_logs" as any).insert({
        user_id: user?.id || null,
        session_id: sessionIdRef.current,
        mode: entry.mode,
        surah_number: entry.surahNumber ?? null,
        ayah_number: entry.ayahNumber ?? null,
        expected_text: entry.expectedText ?? null,
        recognized_text: entry.recognizedText ?? null,
        confidence_score: entry.confidenceScore ?? null,
        wer_score: wer,
        cer_score: cer,
        is_correct: entry.isCorrect ?? false,
        duration_ms: entry.durationMs ?? null,
        device_info: getDeviceInfo(),
        volume_avg: entry.volumeAvg ?? null,
        volume_peak: entry.volumePeak ?? null,
        voice_profile: getVoiceProfile(),
        scoring_mode: getScoringMode(),
        reported_by_user: false,
        report_reason: null,
      } as any);
    } catch (e) {
      console.warn("[AsrLog] Failed to log:", e);
    }
  }, [user]);

  const reportResult = useCallback(async (logId: string, reason: string) => {
    try {
      await supabase.from("asr_logs" as any)
        .update({ reported_by_user: true, report_reason: reason } as any)
        .eq("id", logId);
    } catch (e) {
      console.warn("[AsrLog] Failed to report:", e);
    }
  }, []);

  const newSession = useCallback(() => {
    sessionIdRef.current = `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }, []);

  return { logResult, reportResult, newSession, sessionId: sessionIdRef.current };
}
