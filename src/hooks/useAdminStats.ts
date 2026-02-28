import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface AdminStats {
  dailyActiveUsers: { date: string; count: number }[];
  monthlyActiveUsers: number;
  moduleUsage: { module: string; count: number }[];
  kidsSpaceOpens: number;
  kidsProfiles: number;
  kidsModulesUsage: number;
  hifzPlansCreated: number;
  hifzTasksCompleted: number;
  hifzRatio: number;
  totalEvents: number;
}

const EMPTY: AdminStats = {
  dailyActiveUsers: [],
  monthlyActiveUsers: 0,
  moduleUsage: [],
  kidsSpaceOpens: 0,
  kidsProfiles: 0,
  kidsModulesUsage: 0,
  hifzPlansCreated: 0,
  hifzTasksCompleted: 0,
  hifzRatio: 0,
  totalEvents: 0,
};

export function useAdminStats() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>(EMPTY);

  // Check admin role
  useEffect(() => {
    if (!user) { setIsAdmin(false); setLoading(false); return; }
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => {
        setIsAdmin(!!data);
        setLoading(false);
      });
  }, [user]);

  const fetchStats = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);

    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyStr = thirtyDaysAgo.toISOString();

    try {
      // Fetch all events from last 30 days
      const { data: events } = await supabase
        .from("app_events")
        .select("user_id, event_type, module, created_at")
        .gte("created_at", thirtyStr)
        .order("created_at", { ascending: false })
        .limit(1000);

      const allEvents = events || [];

      // Daily active users (last 7 days)
      const dailyMap = new Map<string, Set<string>>();
      for (let i = 0; i < 7; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        dailyMap.set(d.toISOString().split("T")[0], new Set());
      }
      for (const e of allEvents) {
        const day = e.created_at.split("T")[0];
        if (dailyMap.has(day) && e.user_id) {
          dailyMap.get(day)!.add(e.user_id);
        }
      }
      const dailyActiveUsers = Array.from(dailyMap.entries())
        .map(([date, users]) => ({ date, count: users.size }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Monthly active users
      const monthlySet = new Set<string>();
      for (const e of allEvents) {
        if (e.user_id) monthlySet.add(e.user_id);
      }

      // Module usage
      const moduleCounts = new Map<string, number>();
      for (const e of allEvents) {
        moduleCounts.set(e.module, (moduleCounts.get(e.module) || 0) + 1);
      }
      const moduleUsage = Array.from(moduleCounts.entries())
        .map(([module, count]) => ({ module, count }))
        .sort((a, b) => b.count - a.count);

      // Kids stats
      const kidsSpaceOpens = allEvents.filter(e => e.event_type === "module_open" && e.module === "kids_space").length;
      const kidsProfiles = allEvents.filter(e => e.event_type === "kids_profile_created").length;
      const kidsModules = ["noorani", "kids_prayer", "kids_hajj", "kids_mosque_map"];
      const kidsModulesUsage = allEvents.filter(e => kidsModules.includes(e.module)).length;

      // Hifz funnel
      const hifzPlansCreated = allEvents.filter(e => e.event_type === "plan_hifz_created").length;
      const hifzTasksCompleted = allEvents.filter(e => e.event_type === "hifz_task_completed").length;
      const hifzRatio = hifzPlansCreated > 0 ? Math.round((hifzTasksCompleted / hifzPlansCreated) * 100) : 0;

      setStats({
        dailyActiveUsers,
        monthlyActiveUsers: monthlySet.size,
        moduleUsage,
        kidsSpaceOpens,
        kidsProfiles,
        kidsModulesUsage,
        hifzPlansCreated,
        hifzTasksCompleted,
        hifzRatio,
        totalEvents: allEvents.length,
      });
    } catch (err) {
      console.error("Admin stats error:", err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) fetchStats();
  }, [isAdmin, fetchStats]);

  return { isAdmin, loading, stats, refresh: fetchStats };
}
