import { useState, useCallback, useEffect } from "react";
import { juzStartPage } from "@/data/mushafPages";

const OFFLINE_KEY = "mushaf_offline_juz";
const CACHE_NAME = "taalam-mushaf-v1";

export function getOfflineJuzList(): number[] {
  try { return JSON.parse(localStorage.getItem(OFFLINE_KEY) || "[]"); }
  catch { return []; }
}

function saveOfflineJuzList(list: number[]) {
  localStorage.setItem(OFFLINE_KEY, JSON.stringify(list));
}

function getPagesForJuz(juz: number): number[] {
  const start = juzStartPage[juz] || 1;
  const end = juz < 30 ? (juzStartPage[juz + 1] || 604) - 1 : 604;
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function useMushafOffline() {
  const [downloadedJuz, setDownloadedJuz] = useState<number[]>(getOfflineJuzList);
  const [downloadingJuz, setDownloadingJuz] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const visits = Number(localStorage.getItem("mushaf_visits") || "0") + 1;
    localStorage.setItem("mushaf_visits", String(visits));
    const dismissed = localStorage.getItem("mushaf_offline_dismissed");
    if (visits === 3 && downloadedJuz.length === 0 && !dismissed) {
      setTimeout(() => setShowPrompt(true), 1500);
    }
  }, []);

  const downloadJuz = useCallback(async (juz: number) => {
    if (downloadingJuz !== null) return;
    setDownloadingJuz(juz);
    setProgress(0);

    const pages = getPagesForJuz(juz);
    let done = 0;
    const total = pages.length;

    try {
      const cache = await caches.open(CACHE_NAME);
      for (const page of pages) {
        try {
          const url = `https://static.qurancdn.com/images/bg/${page}.png`;
          const cached = await cache.match(url);
          if (!cached) await cache.add(url);
        } catch {}
        done++;
        setProgress(Math.round((done / total) * 100));
      }
    } catch {}

    const newList = [...getOfflineJuzList().filter(j => j !== juz), juz];
    saveOfflineJuzList(newList);
    setDownloadedJuz(newList);
    setDownloadingJuz(null);
    setProgress(0);
  }, [downloadingJuz]);

  const deleteJuz = useCallback(async (juz: number) => {
    const pages = getPagesForJuz(juz);
    try {
      const cache = await caches.open(CACHE_NAME);
      for (const page of pages) {
        await cache.delete(`https://static.qurancdn.com/images/bg/${page}.png`);
      }
    } catch {}
    const newList = getOfflineJuzList().filter(j => j !== juz);
    saveOfflineJuzList(newList);
    setDownloadedJuz(newList);
  }, []);

  const isJuzDownloaded = useCallback((juz: number) => downloadedJuz.includes(juz), [downloadedJuz]);

  const dismissPrompt = () => {
    localStorage.setItem("mushaf_offline_dismissed", "1");
    setShowPrompt(false);
  };

  return {
    downloadedJuz, downloadingJuz, progress,
    downloadJuz, deleteJuz, isJuzDownloaded,
    showPrompt, setShowPrompt, dismissPrompt,
  };
}
