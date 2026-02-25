import { useState, useCallback, useEffect } from "react";

// ─── Arabic Font Options ────────────────────────────────────
export const ARABIC_FONTS = [
  { id: "amiri", label: "Amiri (Uthmani)", family: "'Amiri', serif" },
  { id: "scheherazade", label: "Scheherazade (Naskh)", family: "'Scheherazade New', serif" },
  { id: "noto-naskh", label: "Noto Naskh Arabic", family: "'Noto Naskh Arabic', serif" },
  { id: "lateef", label: "Lateef (IndoPak)", family: "'Lateef', serif" },
] as const;

export type ArabicFontId = typeof ARABIC_FONTS[number]["id"];

// ─── Reciters ───────────────────────────────────────────────
export const RECITERS = [
  { id: "ar.alafasy", name: "Al-Afasy", label: "مشاري العفاسي" },
  { id: "ar.husary", name: "Al-Husary", label: "محمود خليل الحصري" },
  { id: "ar.minshawi", name: "Al-Minshawi", label: "محمد صديق المنشاوي" },
  { id: "ar.abdurrahmaansudais", name: "As-Sudais", label: "عبد الرحمن السديس" },
] as const;

export type ReciterId = typeof RECITERS[number]["id"];

// ─── Settings Interface ─────────────────────────────────────
export interface ReadingSettings {
  darkModeReading: boolean;
  arabicFont: ArabicFontId;
  defaultReciter: ReciterId;
}

const STORAGE_KEY = "quranEasyReadingSettings";

const DEFAULT_SETTINGS: ReadingSettings = {
  darkModeReading: false,
  arabicFont: "amiri",
  defaultReciter: "ar.alafasy",
};

function loadSettings(): ReadingSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch {}
  return DEFAULT_SETTINGS;
}

export function useReadingSettings() {
  const [settings, setSettings] = useState<ReadingSettings>(loadSettings);

  // Persist on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  const setDarkModeReading = useCallback((v: boolean) => {
    setSettings((s) => ({ ...s, darkModeReading: v }));
  }, []);

  const setArabicFont = useCallback((v: ArabicFontId) => {
    setSettings((s) => ({ ...s, arabicFont: v }));
  }, []);

  const setDefaultReciter = useCallback((v: ReciterId) => {
    setSettings((s) => ({ ...s, defaultReciter: v }));
  }, []);

  // Get the CSS font-family string for the selected font
  const arabicFontFamily = ARABIC_FONTS.find((f) => f.id === settings.arabicFont)?.family || ARABIC_FONTS[0].family;

  return {
    settings,
    setDarkModeReading,
    setArabicFont,
    setDefaultReciter,
    arabicFontFamily,
  };
}
