import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "taaloum_immersive_bg";

export function useImmersiveBg() {
  const [enabled, setEnabled] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored !== null ? stored === "true" : true; // enabled by default
    } catch {
      return true;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(enabled));
  }, [enabled]);

  const toggle = useCallback(() => setEnabled((v) => !v), []);

  return { immersiveEnabled: enabled, toggleImmersive: toggle, setImmersive: setEnabled };
}
