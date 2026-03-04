import { useState, useEffect } from "react";

export interface TajwidBBox {
  bbox: [number, number, number, number]; // x1, y1, x2, y2 (percentage 0-100)
  rule: string;
  color: string;
}

export type TajwidPageData = Record<string, TajwidBBox[]>;

const CACHE_KEY = "tajwid_overlay_data";

/**
 * Lazy-loads tajwid overlay data for Mushaf pages.
 * Falls back to empty object if not available.
 */
export function useTajwidData() {
  const [data, setData] = useState<TajwidPageData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // Try cache first
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached) as TajwidPageData;
          if (!cancelled) setData(parsed);
        }
      } catch {}

      // Try fetch from public
      try {
        const res = await fetch("/tajwidColors.json");
        if (res.ok) {
          const json = (await res.json()) as TajwidPageData;
          if (!cancelled) {
            setData(json);
            try { localStorage.setItem(CACHE_KEY, JSON.stringify(json)); } catch {}
          }
        }
      } catch {}

      if (!cancelled) setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const getPageData = (page: number): TajwidBBox[] => {
    return data[`page${page}`] || [];
  };

  return { data, loading, getPageData };
}
