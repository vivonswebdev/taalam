import { useState, useCallback, useEffect } from "react";

// ─── Data Models ────────────────────────────────────────────

export interface BookmarkAyah {
  id: string;
  surahNumber: number;
  surahName: string;
  surahNameArabic: string;
  ayahNumber: number; // 1-indexed
  arabicText: string;
  createdAt: string;
}

export interface BookmarkRange {
  id: string;
  label: string;
  fromSurah: number;
  fromSurahName: string;
  fromAyah: number;
  toSurah: number;
  toSurahName: string;
  toAyah: number;
  createdAt: string;
}

export interface ReadingPosition {
  surahNumber: number;
  ayahIndex: number; // 0-indexed
  scrollY: number;
  updatedAt: string;
}

// ─── Storage Keys ───────────────────────────────────────────
const BOOKMARKS_KEY = "quranEasyBookmarkAyahs";
const RANGES_KEY = "quranEasyBookmarkRanges";
const READING_POS_KEY = "quranEasyReadingPosition";

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

// ─── Hook ───────────────────────────────────────────────────

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkAyah[]>(() => loadJSON(BOOKMARKS_KEY, []));
  const [ranges, setRanges] = useState<BookmarkRange[]>(() => loadJSON(RANGES_KEY, []));
  const [readingPosition, setReadingPosition] = useState<ReadingPosition | null>(() => loadJSON(READING_POS_KEY, null));

  // Persist
  useEffect(() => saveJSON(BOOKMARKS_KEY, bookmarks), [bookmarks]);
  useEffect(() => saveJSON(RANGES_KEY, ranges), [ranges]);
  useEffect(() => saveJSON(READING_POS_KEY, readingPosition), [readingPosition]);

  const addBookmark = useCallback((b: Omit<BookmarkAyah, "id" | "createdAt">) => {
    setBookmarks((prev) => {
      // Avoid duplicates
      if (prev.some((x) => x.surahNumber === b.surahNumber && x.ayahNumber === b.ayahNumber)) return prev;
      return [...prev, { ...b, id: crypto.randomUUID(), createdAt: new Date().toISOString() }];
    });
  }, []);

  const removeBookmark = useCallback((surahNumber: number, ayahNumber: number) => {
    setBookmarks((prev) => prev.filter((x) => !(x.surahNumber === surahNumber && x.ayahNumber === ayahNumber)));
  }, []);

  const isBookmarked = useCallback(
    (surahNumber: number, ayahNumber: number) => bookmarks.some((x) => x.surahNumber === surahNumber && x.ayahNumber === ayahNumber),
    [bookmarks]
  );

  const addRange = useCallback((r: Omit<BookmarkRange, "id" | "createdAt">) => {
    setRanges((prev) => [...prev, { ...r, id: crypto.randomUUID(), createdAt: new Date().toISOString() }]);
  }, []);

  const removeRange = useCallback((id: string) => {
    setRanges((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const saveReadingPosition = useCallback((pos: Omit<ReadingPosition, "updatedAt">) => {
    setReadingPosition({ ...pos, updatedAt: new Date().toISOString() });
  }, []);

  return {
    bookmarks,
    ranges,
    readingPosition,
    addBookmark,
    removeBookmark,
    isBookmarked,
    addRange,
    removeRange,
    saveReadingPosition,
  };
}
