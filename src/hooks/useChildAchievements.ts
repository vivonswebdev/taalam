import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ACHIEVEMENTS } from "@/data/achievementsData";
import { toast } from "sonner";

export interface UnlockedAchievement {
  id: string;
  achievement_type: string;
  name: string;
  description: string | null;
  icon: string | null;
  rarity: string;
  unlocked_at: string;
}

export function useChildAchievements(childId: string | null) {
  const { user } = useAuth();
  const [unlocked, setUnlocked] = useState<UnlockedAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch unlocked achievements
  useEffect(() => {
    if (!childId) { setUnlocked([]); setLoading(false); return; }
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("child_achievements" as any)
        .select("*")
        .eq("child_id", childId)
        .order("unlocked_at", { ascending: false });
      setUnlocked((data as any[]) || []);
      setLoading(false);
    })();
  }, [childId]);

  // Check and auto-unlock based on points
  const checkAndUnlock = useCallback(async (totalPoints: number) => {
    if (!childId || !user) return;

    const unlockedTypes = new Set(unlocked.map(a => a.achievement_type));

    for (const def of ACHIEVEMENTS) {
      if (unlockedTypes.has(def.id)) continue;
      if (def.pointsRequired && totalPoints >= def.pointsRequired) {
        const { data, error } = await supabase
          .from("child_achievements" as any)
          .upsert({
            child_id: childId,
            achievement_type: def.id,
            name: def.icon + " " + def.id,
            icon: def.icon,
            rarity: def.rarity,
            points_required: def.pointsRequired,
          } as any, { onConflict: "child_id,achievement_type" })
          .select()
          .single();

        if (!error && data) {
          setUnlocked(prev => [data as any, ...prev]);
          toast.success(`🏆 Badge débloqué : ${def.icon}`);
        }
      }
    }
  }, [childId, user, unlocked]);

  const isUnlocked = useCallback((achievementId: string) => {
    return unlocked.some(a => a.achievement_type === achievementId);
  }, [unlocked]);

  return { unlocked, loading, checkAndUnlock, isUnlocked };
}
