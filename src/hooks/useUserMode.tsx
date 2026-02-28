import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type UserMode = "solo" | "child" | "teacher" | "parent";

interface UserModeContextValue {
  mode: UserMode;
  setMode: (mode: UserMode) => Promise<void>;
}

const UserModeContext = createContext<UserModeContextValue | null>(null);

export function UserModeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [mode, setModeState] = useState<UserMode>(() => {
    try {
      return (localStorage.getItem("taaloum_user_mode") as UserMode) || "solo";
    } catch {
      return "solo";
    }
  });

  // Load from profile on login
  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("preferred_mode")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.preferred_mode) {
          const m = data.preferred_mode as UserMode;
          setModeState(m);
          localStorage.setItem("taaloum_user_mode", m);
        }
      });
  }, [user]);

  const setMode = useCallback(
    async (next: UserMode) => {
      setModeState(next);
      localStorage.setItem("taaloum_user_mode", next);
      if (user) {
        await supabase
          .from("profiles")
          .update({ preferred_mode: next } as any)
          .eq("user_id", user.id);
      }
    },
    [user]
  );

  return (
    <UserModeContext.Provider value={{ mode, setMode }}>
      {children}
    </UserModeContext.Provider>
  );
}

export function useUserMode() {
  const ctx = useContext(UserModeContext);
  if (!ctx) return { mode: "solo" as UserMode, setMode: async () => {} };
  return ctx;
}
