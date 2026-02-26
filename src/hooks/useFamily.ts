import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Family {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  created_at: string;
}

export interface FamilyMember {
  id: string;
  family_id: string;
  user_id: string;
  role_in_family: "parent" | "child";
  created_at: string;
  // joined from profiles
  display_name?: string;
  avatar_emoji?: string;
  xp_total?: number;
  streak_days?: number;
  xp_today?: number;
  last_xp_date?: string | null;
}

export interface FamilyNotification {
  id: string;
  family_id: string;
  from_user_id: string;
  to_user_id: string;
  type: "trophy" | "message";
  payload: { text?: string; trophyType?: string };
  created_at: string;
  read_at: string | null;
  from_display_name?: string;
}

export function useFamily() {
  const { user } = useAuth();
  const [families, setFamilies] = useState<Family[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [notifications, setNotifications] = useState<FamilyNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFamilies = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);

    // Get families where user is a member
    const { data: memberRows } = await supabase
      .from("family_members")
      .select("family_id")
      .eq("user_id", user.id);

    if (!memberRows || memberRows.length === 0) {
      setFamilies([]);
      setMembers([]);
      setLoading(false);
      return;
    }

    const familyIds = memberRows.map((m: any) => m.family_id);

    const { data: familyData } = await supabase
      .from("families")
      .select("*")
      .in("id", familyIds);

    setFamilies((familyData as Family[]) || []);

    // Get all members of these families with their profiles + progress
    const { data: allMembers } = await supabase
      .from("family_members")
      .select("*")
      .in("family_id", familyIds);

    if (allMembers && allMembers.length > 0) {
      const userIds = [...new Set(allMembers.map((m: any) => m.user_id))];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_emoji, xp_total")
        .in("user_id", userIds);

      const { data: progress } = await supabase
        .from("user_progress")
        .select("user_id, streak_days, xp_today, last_xp_date")
        .in("user_id", userIds);

      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
      const progressMap = new Map((progress || []).map((p: any) => [p.user_id, p]));

      const enriched: FamilyMember[] = allMembers.map((m: any) => {
        const prof = profileMap.get(m.user_id);
        const prog = progressMap.get(m.user_id);
        return {
          ...m,
          display_name: prof?.display_name || "?",
          avatar_emoji: prof?.avatar_emoji || "🌙",
          xp_total: prof?.xp_total || 0,
          streak_days: prog?.streak_days || 0,
          xp_today: prog?.xp_today || 0,
          last_xp_date: prog?.last_xp_date || null,
        };
      });

      setMembers(enriched);
    }

    setLoading(false);
  }, [user]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("family_notifications")
      .select("*")
      .eq("to_user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (data) {
      // Enrich with sender name
      const fromIds = [...new Set(data.map((n: any) => n.from_user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", fromIds);
      const nameMap = new Map((profiles || []).map((p: any) => [p.user_id, p.display_name]));

      setNotifications(
        data.map((n: any) => ({
          ...n,
          payload: n.payload as any,
          from_display_name: nameMap.get(n.from_user_id) || "?",
        }))
      );
    }
  }, [user]);

  useEffect(() => {
    fetchFamilies();
    fetchNotifications();
  }, [fetchFamilies, fetchNotifications]);

  const createFamily = useCallback(async (name: string) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from("families")
      .insert({ name, created_by: user.id })
      .select()
      .single();
    if (error || !data) return null;

    // Add creator as parent
    await supabase.from("family_members").insert({
      family_id: data.id,
      user_id: user.id,
      role_in_family: "parent",
    });

    await fetchFamilies();
    return data as Family;
  }, [user, fetchFamilies]);

  const joinFamily = useCallback(async (inviteCode: string) => {
    if (!user) return false;
    const { data: family } = await supabase
      .from("families")
      .select("id")
      .eq("invite_code", inviteCode.toUpperCase().trim())
      .single();

    if (!family) return false;

    const { error } = await supabase.from("family_members").insert({
      family_id: family.id,
      user_id: user.id,
      role_in_family: "child",
    });

    if (!error) await fetchFamilies();
    return !error;
  }, [user, fetchFamilies]);

  const sendNotification = useCallback(async (
    familyId: string,
    toUserId: string,
    type: "trophy" | "message",
    payload: { text?: string; trophyType?: string }
  ) => {
    if (!user) return false;
    const { error } = await supabase.from("family_notifications").insert({
      family_id: familyId,
      from_user_id: user.id,
      to_user_id: toUserId,
      type,
      payload,
    });
    return !error;
  }, [user]);

  const markNotificationRead = useCallback(async (notifId: string) => {
    await supabase
      .from("family_notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", notifId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read_at: new Date().toISOString() } : n))
    );
  }, []);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const getMembersForFamily = useCallback(
    (familyId: string) => members.filter((m) => m.family_id === familyId),
    [members]
  );

  const getMyRole = useCallback(
    (familyId: string) => {
      if (!user) return null;
      return members.find((m) => m.family_id === familyId && m.user_id === user.id)?.role_in_family || null;
    },
    [members, user]
  );

  return {
    families,
    members,
    notifications,
    unreadCount,
    loading,
    createFamily,
    joinFamily,
    sendNotification,
    markNotificationRead,
    getMembersForFamily,
    getMyRole,
    refresh: fetchFamilies,
  };
}
