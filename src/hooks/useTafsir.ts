import { useState, useCallback, useRef } from "react";

export interface TafsirAyah {
  surahNumber: number;
  ayahNumber: number;
  text: string;
  source: string;
}

export interface TafsirSurahSummary {
  surahNumber: number;
  ayahs: TafsirAyah[];
  source: string;
}

// Tafsir editions from alquran.cloud
export const TAFSIR_SOURCES = [
  { id: "ar.muyassar", label: "التفسير الميسر", lang: "ar" },
  { id: "en.sahih", label: "Sahih International", lang: "en" },
  { id: "fr.hamidullah", label: "Hamidullah (FR)", lang: "fr" },
] as const;

export type TafsirSourceId = typeof TAFSIR_SOURCES[number]["id"];

const cache = new Map<string, TafsirAyah>();

export function useTafsir() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const getTafsirForAyah = useCallback(
    async (
      surahNumber: number,
      ayahNumber: number,
      source: TafsirSourceId = "ar.muyassar"
    ): Promise<TafsirAyah | null> => {
      const key = `${source}:${surahNumber}:${ayahNumber}`;
      if (cache.has(key)) return cache.get(key)!;

      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/${source}`,
          { signal: ctrl.signal }
        );
        if (!res.ok) throw new Error("API error");
        const json = await res.json();
        const d = json.data;
        const tafsir: TafsirAyah = {
          surahNumber,
          ayahNumber,
          text: d.text,
          source: TAFSIR_SOURCES.find((s) => s.id === source)?.label || source,
        };
        cache.set(key, tafsir);
        setLoading(false);
        return tafsir;
      } catch (e: any) {
        if (e.name === "AbortError") return null;
        setError(e.message || "Error");
        setLoading(false);
        return null;
      }
    },
    []
  );

  const getTafsirForSurah = useCallback(
    async (
      surahNumber: number,
      source: TafsirSourceId = "ar.muyassar"
    ): Promise<TafsirSurahSummary | null> => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `https://api.alquran.cloud/v1/surah/${surahNumber}/${source}`
        );
        if (!res.ok) throw new Error("API error");
        const json = await res.json();
        const ayahs: TafsirAyah[] = json.data.ayahs.map((a: any) => {
          const t: TafsirAyah = {
            surahNumber,
            ayahNumber: a.numberInSurah,
            text: a.text,
            source: TAFSIR_SOURCES.find((s) => s.id === source)?.label || source,
          };
          cache.set(`${source}:${surahNumber}:${a.numberInSurah}`, t);
          return t;
        });
        setLoading(false);
        return { surahNumber, ayahs, source: ayahs[0]?.source || source };
      } catch (e: any) {
        setError(e.message || "Error");
        setLoading(false);
        return null;
      }
    },
    []
  );

  return { getTafsirForAyah, getTafsirForSurah, loading, error };
}
