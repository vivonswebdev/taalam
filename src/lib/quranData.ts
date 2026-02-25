import type { Surah, Ayah } from "@/data/surahs";

const CACHE_KEY = "quranEasyFullQuranV2";
const SURAH_LIST_KEY = "quranEasySurahList";

/**
 * Metadata for all 114 surahs (fetched once, cached).
 */
export interface SurahMeta {
  number: number;
  name: string;         // English transliteration
  nameArabic: string;
  englishName: string;  // English name
  versesCount: number;
  revelationType: string; // "Meccan" | "Medinan"
}

/**
 * Fetch the list of all 114 surahs (metadata only, no ayahs).
 * Cached in localStorage.
 */
export async function fetchSurahList(): Promise<SurahMeta[]> {
  // Check cache
  try {
    const cached = localStorage.getItem(SURAH_LIST_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as SurahMeta[];
      if (parsed.length === 114) return parsed;
    }
  } catch {}

  const res = await fetch("https://api.alquran.cloud/v1/surah");
  if (!res.ok) throw new Error("Failed to fetch surah list");
  const json = await res.json();
  const data = json.data as any[];

  const list: SurahMeta[] = data.map((s) => ({
    number: s.number,
    name: s.englishName,
    nameArabic: s.name,
    englishName: s.englishNameTranslation,
    versesCount: s.numberOfAyahs,
    revelationType: s.revelationType,
  }));

  try {
    localStorage.setItem(SURAH_LIST_KEY, JSON.stringify(list));
  } catch {}

  return list;
}

/**
 * Determine difficulty based on verse count.
 */
function getDifficulty(versesCount: number): "easy" | "medium" | "hard" {
  if (versesCount <= 20) return "easy";
  if (versesCount <= 60) return "medium";
  return "hard";
}

/**
 * Fetch a single surah's full text from the API and convert to app's Surah type.
 * Cached per-surah in localStorage.
 */
export async function fetchFullSurah(surahNumber: number): Promise<Surah> {
  // Check per-surah cache
  const cacheKey = `${CACHE_KEY}_s${surahNumber}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached) as Surah;
  } catch {}

  // Fetch Arabic text (Uthmani script)
  const res = await fetch(
    `https://api.alquran.cloud/v1/surah/${surahNumber}/quran-uthmani`
  );
  if (!res.ok) throw new Error(`Failed to fetch surah ${surahNumber}`);
  const json = await res.json();
  const data = json.data;

  const ayahs: Ayah[] = data.ayahs.map((a: any) => ({
    number: a.numberInSurah,
    arabic: a.text,
    transliteration: "",
    translation: "",
  }));

  const surah: Surah = {
    number: data.number,
    name: data.englishName,
    nameArabic: data.name,
    frenchName: data.englishNameTranslation,
    versesCount: data.numberOfAyahs,
    difficulty: getDifficulty(data.numberOfAyahs),
    ayahs,
  };

  // Cache
  try {
    localStorage.setItem(cacheKey, JSON.stringify(surah));
  } catch {}

  return surah;
}

/**
 * Convert SurahMeta to a partial Surah (without ayahs) for list display.
 */
export function metaToSurah(meta: SurahMeta): Surah {
  return {
    number: meta.number,
    name: meta.name,
    nameArabic: meta.nameArabic,
    frenchName: meta.englishName,
    versesCount: meta.versesCount,
    difficulty: getDifficulty(meta.versesCount),
    ayahs: [], // will be loaded on demand
  };
}
