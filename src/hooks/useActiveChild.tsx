import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { useChildProfiles, type ChildProfile } from "@/hooks/useChildProfiles";

interface ActiveChildContextType {
  activeChildId: string | null;
  activeChild: ChildProfile | null;
  setActiveChild: (id: string) => void;
  clearActiveChild: () => void;
}

const STORAGE_KEY = "quranEasyActiveChildId";

const ActiveChildContext = createContext<ActiveChildContextType | null>(null);

export function ActiveChildProvider({ children }: { children: ReactNode }) {
  const { profiles } = useChildProfiles();

  const [activeChildId, setActiveChildIdState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  });

  const activeChild = activeChildId
    ? profiles.find((p) => p.id === activeChildId) || null
    : null;

  const setActiveChild = useCallback((id: string) => {
    setActiveChildIdState(id);
    try { localStorage.setItem(STORAGE_KEY, id); } catch {}
  }, []);

  const clearActiveChild = useCallback(() => {
    setActiveChildIdState(null);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  return (
    <ActiveChildContext.Provider value={{ activeChildId, activeChild, setActiveChild, clearActiveChild }}>
      {children}
    </ActiveChildContext.Provider>
  );
}

export function useActiveChild() {
  const ctx = useContext(ActiveChildContext);
  if (!ctx) {
    return {
      activeChildId: null,
      activeChild: null,
      setActiveChild: () => {},
      clearActiveChild: () => {},
    } as ActiveChildContextType;
  }
  return ctx;
}
