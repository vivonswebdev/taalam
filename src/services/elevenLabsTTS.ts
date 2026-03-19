import { supabase } from "@/integrations/supabase/client";

const CACHE_PREFIX = "tts_cache_";

/**
 * Generate TTS audio via edge function (ElevenLabs)
 * Returns a blob URL for playback
 */
export async function generateTTS(
  text: string,
  voiceId: string,
  settings?: { stability?: number; similarity_boost?: number; speed?: number }
): Promise<string> {
  // Check cache first
  const cacheKey = CACHE_PREFIX + btoa(unescape(encodeURIComponent(`${voiceId}:${text}`))).slice(0, 80);
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      // Convert base64 back to blob URL
      const audioUrl = `data:audio/mpeg;base64,${cached}`;
      return audioUrl;
    } catch {
      localStorage.removeItem(cacheKey);
    }
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        text,
        voiceId,
        stability: settings?.stability,
        similarity_boost: settings?.similarity_boost,
        speed: settings?.speed,
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `TTS failed: ${response.status}`);
  }

  const data = await response.json();
  if (!data.audioContent) throw new Error("No audio returned");

  // Cache in localStorage (limit: ~5MB per entry, prune old if needed)
  try {
    localStorage.setItem(cacheKey, data.audioContent);
  } catch {
    // Storage full — clear oldest TTS caches
    const keys = Object.keys(localStorage).filter((k) => k.startsWith(CACHE_PREFIX));
    keys.slice(0, Math.ceil(keys.length / 2)).forEach((k) => localStorage.removeItem(k));
    try { localStorage.setItem(cacheKey, data.audioContent); } catch { /* ignore */ }
  }

  return `data:audio/mpeg;base64,${data.audioContent}`;
}

/**
 * Pre-generate all lines for a story (batch)
 */
export async function preGenerateStoryAudio(
  lines: Array<{ text: string; speaker: "adult" | "child" }>,
  voiceIds: { adult: string; child: string },
  voiceSettings: Record<string, { stability: number; similarity_boost: number; speed: number }>
): Promise<string[]> {
  const urls: string[] = [];

  for (const line of lines) {
    const voiceId = voiceIds[line.speaker];
    const settings = voiceSettings[line.speaker];
    try {
      const url = await generateTTS(line.text, voiceId, settings);
      urls.push(url);
    } catch (err) {
      console.error("TTS generation failed for line:", line.text, err);
      urls.push("");
    }
  }

  return urls;
}
