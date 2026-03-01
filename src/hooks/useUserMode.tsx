import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type UserMode = "solo" | "child" | "teacher" | "parent";
export type AgeGroup = "child" | "adult" | "senior";

interface UserModeContextValue {
  mode: UserMode;
  setMode: (mode: UserMode) => Promise<void>;
  ageGroup: AgeGroup;
  setAgeGroup: (ag: AgeGroup) => Promise<void>;
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
  const [ageGroup, setAgeGroupState] = useState<AgeGroup>(() => {
    try {
      return (localStorage.getItem("taaloum_age_group") as AgeGroup) || "adult";
    } catch {
      return "adult";
    }
  });

  // Load from profile on login
  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("preferred_mode, age_group")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.preferred_mode) {
          const m = data.preferred_mode as UserMode;
          setModeState(m);
          localStorage.setItem("taaloum_user_mode", m);
        }
        if ((data as any)?.age_group) {
          const ag = (data as any).age_group as AgeGroup;
          setAgeGroupState(ag);
          localStorage.setItem("taaloum_age_group", ag);
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

  const setAgeGroup = useCallback(
    async (next: AgeGroup) => {
      setAgeGroupState(next);
      localStorage.setItem("taaloum_age_group", next);
      if (user) {
        await supabase
          .from("profiles")
          .update({ age_group: next } as any)
          .eq("user_id", user.id);
      }
    },
    [user]
  );

  return (
    <UserModeContext.Provider value={{ mode, setMode, ageGroup, setAgeGroup }}>
      {children}
    </UserModeContext.Provider>
  );
}

export function useUserMode() {
  const ctx = useContext(UserModeContext);
  if (!ctx) return { mode: "solo" as UserMode, setMode: async () => {}, ageGroup: "adult" as AgeGroup, setAgeGroup: async () => {} };
  return ctx;
}
