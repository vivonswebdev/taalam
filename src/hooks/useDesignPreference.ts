import { useState, useEffect, useCallback, useSyncExternalStore } from "react";

export type DesignMode = "classic" | "futuristic";

const STORAGE_KEY = "design-mode";
const EVENT_NAME = "design-mode-change";

function getSnapshot(): DesignMode {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "classic" || saved === "futuristic") return saved;

  const hasUserData =
    localStorage.getItem("quranEasyLang") ||
    localStorage.getItem("user-mode") ||
    localStorage.getItem("hifz-items");

  if (hasUserData) return "classic";

  localStorage.setItem("user-last-visit", Date.now().toString());
  return "futuristic";
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT_NAME, callback);
  return () => window.removeEventListener(EVENT_NAME, callback);
}

export function useDesignPreference() {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const toggleMode = useCallback(() => {
    const next = mode === "classic" ? "futuristic" : "classic";
    localStorage.setItem(STORAGE_KEY, next);
    window.dispatchEvent(new Event(EVENT_NAME));
  }, [mode]);

  return {
    mode,
    toggleMode,
    isClassic: mode === "classic",
    isFuturistic: mode === "futuristic",
  };
}
