import { useState, useCallback } from "react";
import { useLanguage, QURAN_TRANSLATION_IDS, type Lang } from "./useLanguage";

const PREF_KEY = "quranEasyTranslationPref";

export interface TranslationEdition {
  id: string;
  label: string;
  lang: string;
}

export const AVAILABLE_EDITIONS: TranslationEdition[] = [
  { id: "fr.hamidullah", label: "Français (Hamidullah)", lang: "fr" },
  { id: "en.asad", label: "English (Asad)", lang: "en" },
  { id: "nl.siregar", label: "Nederlands (Siregar)", lang: "nl" },
  { id: "en.sahih", label: "English (Sahih Int.)", lang: "en" },
  { id: "fr.leclerc", label: "Français (Leclerc)", lang: "fr" },
];

interface Pref {
  auto: boolean;
  manualEditionId: string | null;
}

function loadPref(): Pref {
  try {
    const raw = localStorage.getItem(PREF_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { auto: true, manualEditionId: null };
}

function savePref(pref: Pref) {
  try {
    localStorage.setItem(PREF_KEY, JSON.stringify(pref));
  } catch {}
}

export function useTranslationPreference() {
  const { lang } = useLanguage();
  const [pref, setPrefState] = useState<Pref>(loadPref);

  const setAuto = useCallback((auto: boolean) => {
    const next = { ...pref, auto };
    setPrefState(next);
    savePref(next);
  }, [pref]);

  const setManualEdition = useCallback((editionId: string) => {
    const next = { auto: false, manualEditionId: editionId };
    setPrefState(next);
    savePref(next);
  }, []);

  // Resolve the edition to use
  const resolvedEditionId: string = pref.auto
    ? QURAN_TRANSLATION_IDS[lang] || QURAN_TRANSLATION_IDS.fr
    : pref.manualEditionId || QURAN_TRANSLATION_IDS[lang] || QURAN_TRANSLATION_IDS.fr;

  return {
    isAuto: pref.auto,
    setAuto,
    manualEditionId: pref.manualEditionId,
    setManualEdition,
    resolvedEditionId,
    isArabicOnly: lang === "ar" && pref.auto,
  };
}
