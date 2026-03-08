import { useState, useEffect } from "react";

export type DesignMode = "classic" | "futuristic";

export function useDesignPreference() {
  const [mode, setMode] = useState<DesignMode>(() => {
    const saved = localStorage.getItem("design-mode");
    if (saved === "classic" || saved === "futuristic") return saved;

    // Existing user detection: if they have any app data, default to classic
    const hasUserData =
      localStorage.getItem("quranEasyLang") ||
      localStorage.getItem("user-mode") ||
      localStorage.getItem("hifz-items");

    if (hasUserData) {
      return "classic";
    }
    // New user → futuristic
    localStorage.setItem("user-last-visit", Date.now().toString());
    return "futuristic";
  });

  useEffect(() => {
    localStorage.setItem("design-mode", mode);
  }, [mode]);

  const toggleMode = () =>
    setMode((prev) => (prev === "classic" ? "futuristic" : "classic"));

  return {
    mode,
    toggleMode,
    isClassic: mode === "classic",
    isFuturistic: mode === "futuristic",
  };
}
