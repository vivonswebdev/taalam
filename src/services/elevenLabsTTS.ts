import Dexie, { type Table } from "dexie";
import { getEdgeFunctionHeaders, AuthRequiredError } from "@/lib/edgeFunctionAuth";

/* ────── IndexedDB schema for TTS audio cache ────── */
interface TTSCacheEntry {
  key: string;           // hash of voiceId + text
  audioBase64: string;   // base64 audio data
  voiceId: string;
  textPreview: string;   // first 60 chars for debugging
  createdAt: number;
  sizeBytes: number;
}

class TTSDatabase extends Dexie {
  cache!: Table<TTSCacheEntry, string>;

  constructor() {
    super("taalam_tts_cache");
    this.version(1).stores({
      cache: "key, voiceId, createdAt",
    });
  }
}

const db = new TTSDatabase();

// Max cache size: 200MB
const MAX_CACHE_BYTES = 200 * 1024 * 1024;

/* ────── helpers ────── */
function makeCacheKey(voiceId: string, text: string): string {
  // Simple hash for cache key
  const raw = `${voiceId}:${text}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0;
  }
  return `tts_${Math.abs(hash).toString(36)}`;
}

/* ────── Public API ────── */

/**
 * Generate TTS audio via edge function (ElevenLabs).
 * Audio is cached in IndexedDB for offline playback.
 * Returns a data URI for immediate playback.
 */
export async function generateTTS(
  text: string,
  voiceId: string,
  settings?: { stability?: number; similarity_boost?: number; speed?: number }
): Promise<string> {
  const cacheKey = makeCacheKey(voiceId, text);

  // 1. Check IndexedDB cache
  try {
    const cached = await db.cache.get(cacheKey);
    if (cached) {
      return `data:audio/mpeg;base64,${cached.audioBase64}`;
    }
  } catch {
    // DB error — continue to fetch
  }

  // 2. Also check legacy localStorage cache & migrate
  const legacyKey = "tts_cache_" + btoa(unescape(encodeURIComponent(`${voiceId}:${text}`))).slice(0, 80);
  const legacyCached = localStorage.getItem(legacyKey);
  if (legacyCached) {
    // Migrate to IndexedDB
    try {
      await db.cache.put({
        key: cacheKey,
        audioBase64: legacyCached,
        voiceId,
        textPreview: text.slice(0, 60),
        createdAt: Date.now(),
        sizeBytes: legacyCached.length,
      });
      localStorage.removeItem(legacyKey);
    } catch { /* ignore */ }
    return `data:audio/mpeg;base64,${legacyCached}`;
  }

  // 3. Fetch from edge function (requires a signed-in user)
  const headers = await getEdgeFunctionHeaders();
  if (!headers) throw new AuthRequiredError();
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
    {
      method: "POST",
      headers,
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

  // 4. Store in IndexedDB
  try {
    await db.cache.put({
      key: cacheKey,
      audioBase64: data.audioContent,
      voiceId,
      textPreview: text.slice(0, 60),
      createdAt: Date.now(),
      sizeBytes: data.audioContent.length,
    });
    // Prune if over limit
    pruneCache();
  } catch {
    // Storage error — still return audio
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

/**
 * Check if a specific audio is cached offline
 */
export async function isTTSCached(voiceId: string, text: string): Promise<boolean> {
  try {
    const entry = await db.cache.get(makeCacheKey(voiceId, text));
    return !!entry;
  } catch {
    return false;
  }
}

/**
 * Get total cache size and entry count
 */
export async function getTTSCacheStats(): Promise<{ count: number; sizeBytes: number }> {
  try {
    const all = await db.cache.toArray();
    return {
      count: all.length,
      sizeBytes: all.reduce((sum, e) => sum + e.sizeBytes, 0),
    };
  } catch {
    return { count: 0, sizeBytes: 0 };
  }
}

/**
 * Clear all TTS cache
 */
export async function clearTTSCache(): Promise<void> {
  try {
    await db.cache.clear();
    // Also clean legacy localStorage
    Object.keys(localStorage)
      .filter((k) => k.startsWith("tts_cache_"))
      .forEach((k) => localStorage.removeItem(k));
  } catch { /* ignore */ }
}

/** Remove oldest entries if over size limit */
async function pruneCache() {
  try {
    const all = await db.cache.orderBy("createdAt").toArray();
    let totalSize = all.reduce((sum, e) => sum + e.sizeBytes, 0);
    let i = 0;
    while (totalSize > MAX_CACHE_BYTES && i < all.length) {
      totalSize -= all[i].sizeBytes;
      await db.cache.delete(all[i].key);
      i++;
    }
  } catch { /* ignore */ }
}
