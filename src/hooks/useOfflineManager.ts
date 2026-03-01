import { useState, useEffect, useCallback, useRef } from "react";

const OFFLINE_KEY = "taaloum_offline_mode";
const OFFLINE_STATUS_KEY = "taaloum_offline_status";
const CACHE_AUDIO = "offline-audio-v2";
const CACHE_MOODS = "mood-audio-v1";

export type OfflineSection = "mushaf" | "moods" | "tarteel" | "quiz";

export interface OfflineSectionStatus {
  mushaf: boolean;
  moods: boolean;
  tarteel: boolean;
  quiz: boolean;
}

export interface DownloadProgress {
  section: OfflineSection | null;
  current: number;
  total: number;
  paused: boolean;
}

function getStoredMode(): boolean {
  try { return localStorage.getItem(OFFLINE_KEY) === "true"; } catch { return false; }
}

function getStoredStatus(): OfflineSectionStatus {
  try {
    const raw = localStorage.getItem(OFFLINE_STATUS_KEY);
    if (raw) return { ...{ mushaf: false, moods: false, tarteel: false, quiz: true }, ...JSON.parse(raw) };
  } catch {}
  return { mushaf: false, moods: false, tarteel: false, quiz: true };
}

function saveStatus(s: OfflineSectionStatus) {
  localStorage.setItem(OFFLINE_STATUS_KEY, JSON.stringify(s));
}

// Juz Amma surahs (78-114)
const JUZ_AMMA_SURAHS = Array.from({ length: 37 }, (_, i) => i + 78);

export function useOfflineManager() {
  const [offlineMode, setOfflineModeState] = useState(getStoredMode);
  const [status, setStatus] = useState<OfflineSectionStatus>(getStoredStatus);
  const [progress, setProgress] = useState<DownloadProgress>({ section: null, current: 0, total: 0, paused: false });
  const abortRef = useRef(false);
  const pausedRef = useRef(false);

  const setOfflineMode = useCallback((v: boolean) => {
    setOfflineModeState(v);
    localStorage.setItem(OFFLINE_KEY, String(v));
  }, []);

  const readySections = (Object.keys(status) as OfflineSection[]).filter(k => status[k]).length;

  // Check if a specific audio URL is cached
  const isAudioCached = useCallback(async (url: string): Promise<boolean> => {
    try {
      const cache = await caches.open(CACHE_AUDIO);
      const match = await cache.match(url);
      return !!match;
    } catch { return false; }
  }, []);

  // Download Juz Amma audio
  const downloadMushaf = useCallback(async () => {
    abortRef.current = false;
    pausedRef.current = false;
    const cache = await caches.open(CACHE_AUDIO);

    // Count total ayahs
    let totalAyahs = 0;
    const surahAyahs: { surah: number; count: number }[] = [];
    for (const sn of JUZ_AMMA_SURAHS) {
      try {
        const res = await fetch(`https://api.alquran.cloud/v1/surah/${sn}`);
        const data = await res.json();
        const count = data.data?.numberOfAyahs || 0;
        surahAyahs.push({ surah: sn, count });
        totalAyahs += count;
        // Cache the surah meta JSON
        await cache.put(`https://api.alquran.cloud/v1/surah/${sn}`, new Response(JSON.stringify(data)));
      } catch {}
    }

    setProgress({ section: "mushaf", current: 0, total: totalAyahs, paused: false });
    let done = 0;

    for (const { surah, count } of surahAyahs) {
      if (abortRef.current) return;

      // Fetch audio URLs
      try {
        const res = await fetch(`https://api.alquran.cloud/v1/surah/${surah}/ar.alafasy`);
        const data = await res.json();
        await cache.put(`https://api.alquran.cloud/v1/surah/${surah}/ar.alafasy`, new Response(JSON.stringify(data)));
        
        if (data.data?.ayahs) {
          for (const ayah of data.data.ayahs) {
            if (abortRef.current) return;
            while (pausedRef.current) {
              await new Promise(r => setTimeout(r, 300));
              if (abortRef.current) return;
            }
            try {
              const existing = await cache.match(ayah.audio);
              if (!existing) {
                const audioRes = await fetch(ayah.audio);
                await cache.put(ayah.audio, audioRes);
              }
            } catch {}
            done++;
            setProgress(p => ({ ...p, current: done }));
          }
        }
      } catch {}
    }

    setStatus(prev => {
      const next = { ...prev, mushaf: true };
      saveStatus(next);
      return next;
    });
    setProgress({ section: null, current: 0, total: 0, paused: false });
  }, []);

  // Download all mood presets audio
  const downloadMoods = useCallback(async () => {
    abortRef.current = false;
    pausedRef.current = false;

    // Import mood presets dynamically to get all
    const { moodPresets } = await import("@/data/moodPresets");
    const cache = await caches.open(CACHE_MOODS);

    // Count total audio items
    const allItems: { surah: number; ayah: number }[] = [];
    for (const mood of moodPresets) {
      for (const v of mood.verses) {
        if (v.start && v.end) {
          for (let i = v.start; i <= v.end; i++) allItems.push({ surah: v.surahNumber, ayah: i });
        } else if (v.ayahs) {
          for (const a of v.ayahs) allItems.push({ surah: v.surahNumber, ayah: a });
        }
      }
    }

    // Deduplicate
    const unique = [...new Map(allItems.map(i => [`${i.surah}:${i.ayah}`, i])).values()];
    setProgress({ section: "moods", current: 0, total: unique.length, paused: false });
    let done = 0;

    for (const item of unique) {
      if (abortRef.current) return;
      while (pausedRef.current) {
        await new Promise(r => setTimeout(r, 300));
        if (abortRef.current) return;
      }
      const apiUrl = `https://api.alquran.cloud/v1/ayah/${item.surah}:${item.ayah}/ar.alafasy`;
      try {
        const existing = await cache.match(apiUrl);
        if (!existing) {
          const res = await fetch(apiUrl);
          const data = await res.json();
          await cache.put(apiUrl, new Response(JSON.stringify(data)));
          if (data.data?.audio) {
            const audioRes = await fetch(data.data.audio);
            await cache.put(data.data.audio, audioRes);
          }
        }
      } catch {}
      done++;
      setProgress(p => ({ ...p, current: done }));
    }

    setStatus(prev => {
      const next = { ...prev, moods: true };
      saveStatus(next);
      return next;
    });
    setProgress({ section: null, current: 0, total: 0, paused: false });
  }, []);

  // Download tarteel reciter audio (Mishary Al-Afasy for surahs 1, 78-114)
  const downloadTarteel = useCallback(async () => {
    abortRef.current = false;
    pausedRef.current = false;
    const cache = await caches.open(CACHE_AUDIO);
    const surahs = [1, ...JUZ_AMMA_SURAHS];

    let totalAyahs = 0;
    const surahData: { surah: number; ayahs: any[] }[] = [];
    for (const sn of surahs) {
      try {
        const res = await fetch(`https://api.alquran.cloud/v1/surah/${sn}/ar.alafasy`);
        const data = await res.json();
        if (data.data?.ayahs) {
          surahData.push({ surah: sn, ayahs: data.data.ayahs });
          totalAyahs += data.data.ayahs.length;
        }
      } catch {}
    }

    setProgress({ section: "tarteel", current: 0, total: totalAyahs, paused: false });
    let done = 0;

    for (const sd of surahData) {
      for (const ayah of sd.ayahs) {
        if (abortRef.current) return;
        while (pausedRef.current) {
          await new Promise(r => setTimeout(r, 300));
          if (abortRef.current) return;
        }
        try {
          const existing = await cache.match(ayah.audio);
          if (!existing) {
            const audioRes = await fetch(ayah.audio);
            await cache.put(ayah.audio, audioRes);
          }
        } catch {}
        done++;
        setProgress(p => ({ ...p, current: done }));
      }
    }

    setStatus(prev => {
      const next = { ...prev, tarteel: true };
      saveStatus(next);
      return next;
    });
    setProgress({ section: null, current: 0, total: 0, paused: false });
  }, []);

  const downloadAll = useCallback(async () => {
    if (!status.mushaf) await downloadMushaf();
    if (!status.moods) await downloadMoods();
    if (!status.tarteel) await downloadTarteel();
  }, [status, downloadMushaf, downloadMoods, downloadTarteel]);

  const pauseDownload = useCallback(() => {
    pausedRef.current = true;
    setProgress(p => ({ ...p, paused: true }));
  }, []);

  const resumeDownload = useCallback(() => {
    pausedRef.current = false;
    setProgress(p => ({ ...p, paused: false }));
  }, []);

  const cancelDownload = useCallback(() => {
    abortRef.current = true;
    pausedRef.current = false;
    setProgress({ section: null, current: 0, total: 0, paused: false });
  }, []);

  return {
    offlineMode,
    setOfflineMode,
    status,
    readySections,
    progress,
    downloadMushaf,
    downloadMoods,
    downloadTarteel,
    downloadAll,
    pauseDownload,
    resumeDownload,
    cancelDownload,
    isAudioCached,
  };
}
