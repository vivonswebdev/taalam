import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "taaloum_immersive_bg";
const BG_CHOICES_KEY = "taaloum_bg_choices";

export type BgTheme = "mountain" | "desert" | "mosque" | "galaxy" | "garden" | "ocean" | "starry" | "none";

export interface BgChoices {
  home: BgTheme;
  reading: BgTheme;
  tarteel: BgTheme;
  quiz: BgTheme;
}

const DEFAULT_CHOICES: BgChoices = {
  home: "starry",
  reading: "mountain",
  tarteel: "desert",
  quiz: "mosque",
};

export const BG_OPTIONS: { id: BgTheme; label: string; emoji: string }[] = [
  { id: "mountain", label: "Montagne", emoji: "🏔️" },
  { id: "desert", label: "Désert", emoji: "🏜️" },
  { id: "mosque", label: "Mosquée", emoji: "🕌" },
  { id: "galaxy", label: "Galaxie", emoji: "🌌" },
  { id: "garden", label: "Jardin", emoji: "🌿" },
  { id: "ocean", label: "Océan", emoji: "🌊" },
  { id: "starry", label: "Étoilé", emoji: "✨" },
  { id: "none", label: "Aucun", emoji: "⬜" },
];

function loadChoices(): BgChoices {
  try {
    const stored = localStorage.getItem(BG_CHOICES_KEY);
    if (stored) return { ...DEFAULT_CHOICES, ...JSON.parse(stored) };
  } catch {}
  return DEFAULT_CHOICES;
}

export function useImmersiveBg() {
  const [enabled, setEnabled] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored !== null ? stored === "true" : true;
    } catch {
      return true;
    }
  });

  const [choices, setChoices] = useState<BgChoices>(loadChoices);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(enabled));
  }, [enabled]);

  useEffect(() => {
    localStorage.setItem(BG_CHOICES_KEY, JSON.stringify(choices));
  }, [choices]);

  const toggle = useCallback(() => setEnabled((v) => !v), []);

  const setModeTheme = useCallback((mode: keyof BgChoices, theme: BgTheme) => {
    setChoices((prev) => ({ ...prev, [mode]: theme }));
  }, []);

  return {
    immersiveEnabled: enabled,
    toggleImmersive: toggle,
    setImmersive: setEnabled,
    choices,
    setModeTheme,
  };
}

// CSS class mapping
export const BG_CSS_CLASS: Record<BgTheme, string> = {
  mountain: "reading-epic-bg",
  desert: "tarteel-epic-bg",
  mosque: "quiz-epic-bg",
  galaxy: "galaxy-epic-bg",
  garden: "garden-epic-bg",
  ocean: "ocean-epic-bg",
  none: "",
};
