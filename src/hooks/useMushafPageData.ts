import { useState, useEffect, useCallback, useRef } from "react";

// ─── Types matching madani-muhsaf.json structure ────────────
interface MushafVerse {
  verseNumber: string;
  text: string;
}

interface MushafChapter {
  chapterNumber: string;
  titleEn: string;
  titleAr: string;
  verseCount: number;
  text: MushafVerse[];
}

// Each page object has chapter keys + juzNumber
type MushafPageRaw = Record<string, MushafChapter> & { juzNumber: number };

// Parsed output
export interface MushafPageAyah {
  number: number;
  arabic: string;
  surahNumber: number;
  surahNameAr: string;
  surahNameEn: string;
}

export interface MushafPageData {
  page: number;
  juz: number;
  ayahs: MushafPageAyah[];
  surahs: { number: number; nameAr: string; nameEn: string }[];
}

// ─── Singleton cache for the full JSON ──────────────────────
let cachedPages: MushafPageRaw[] | null = null;
let loadingPromise: Promise<MushafPageRaw[]> | null = null;

async function loadMushafJson(): Promise<MushafPageRaw[]> {
  if (cachedPages) return cachedPages;
  if (loadingPromise) return loadingPromise;

  loadingPromise = fetch("/mushaf-text.json")
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load mushaf-text.json");
      return res.json();
    })
    .then((data: MushafPageRaw[]) => {
      cachedPages = data;
      return data;
    });

  return loadingPromise;
}

function parsePage(raw: MushafPageRaw, pageNum: number): MushafPageData {
  const ayahs: MushafPageAyah[] = [];
  const surahsSet = new Map<number, { nameAr: string; nameEn: string }>();

  for (const [key, value] of Object.entries(raw)) {
    if (key === "juzNumber") continue;
    const chapter = value as MushafChapter;
    const surahNum = Number(chapter.chapterNumber);
    if (!surahsSet.has(surahNum)) {
      surahsSet.set(surahNum, { nameAr: chapter.titleAr, nameEn: chapter.titleEn });
    }
    for (const verse of chapter.text) {
      ayahs.push({
        number: Number(verse.verseNumber),
        arabic: verse.text.trim(),
        surahNumber: surahNum,
        surahNameAr: chapter.titleAr,
        surahNameEn: chapter.titleEn,
      });
    }
  }

  const surahs = Array.from(surahsSet.entries()).map(([num, meta]) => ({
    number: num,
    nameAr: meta.nameAr,
    nameEn: meta.nameEn,
  }));

  return {
    page: pageNum,
    juz: raw.juzNumber || 1,
    ayahs,
    surahs,
  };
}

// ─── Hook ───────────────────────────────────────────────────
export function useMushafPageData(page: number) {
  const [data, setData] = useState<MushafPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    loadMushafJson()
      .then((allPages) => {
        if (cancelled) return;
        const raw = allPages[page];
        if (!raw) {
          setError(`Page ${page} not found`);
          setData(null);
        } else {
          setData(parsePage(raw, page));
        }
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [page]);

  return { data, loading, error };
}
