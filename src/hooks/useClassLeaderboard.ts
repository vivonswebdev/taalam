import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { getLigue, getHifzLevel } from "@/components/LigueBadge";
import type { LeaderboardEntry } from "./useLeaderboard";

export interface ClassStats {
  avgMastery: number;
  avgStreak: number;
  totalSessions: number;
  memberCount: number;
}

export interface ClassroomInfo {
  id: string;
  name: string;
  join_code: string;
  teacher_id: string;
  created_at: string;
}

export function useClassLeaderboard() {
  const { user } = useAuth();
  const [myClassrooms, setMyClassrooms] = useState<ClassroomInfo[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [classBoard, setClassBoard] = useState<LeaderboardEntry[]>([]);
  const [classStats, setClassStats] = useState<ClassStats>({ avgMastery: 0, avgStreak: 0, totalSessions: 0, memberCount: 0 });
  const [loading, setLoading] = useState(false);

  // Fetch classrooms where user is teacher or member
  const fetchMyClassrooms = useCallback(async () => {
    if (!user) return;
    
    // Get classrooms where user is teacher
    const { data: teacherClasses } = await supabase
      .from("classrooms")
      .select("*")
      .eq("teacher_id", user.id);

    // Get classrooms where user is member
    const { data: memberRows } = await supabase
      .from("classroom_members")
      .select("classroom_id")
      .eq("user_id", user.id);

    const memberClassIds = (memberRows || []).map((r: any) => r.classroom_id);
    
    let memberClasses: ClassroomInfo[] = [];
    if (memberClassIds.length > 0) {
      const { data } = await supabase
        .from("classrooms")
        .select("*")
        .in("id", memberClassIds);
      memberClasses = (data || []) as ClassroomInfo[];
    }

    // Merge and deduplicate
    const all = [...(teacherClasses || []), ...memberClasses] as ClassroomInfo[];
    const unique = Array.from(new Map(all.map((c) => [c.id, c])).values());
    setMyClassrooms(unique);

    // Auto-select first class
    if (unique.length > 0 && !selectedClassId) {
      setSelectedClassId(unique[0].id);
    }
  }, [user, selectedClassId]);

  // Fetch leaderboard for a specific class
  const fetchClassBoard = useCallback(async (classId: string) => {
    setSelectedClassId(classId);
    setLoading(true);

    // Get member user_ids
    const { data: members } = await supabase
      .from("classroom_members")
      .select("user_id")
      .eq("classroom_id", classId);

    // Also include teacher
    const classroom = myClassrooms.find((c) => c.id === classId);
    const userIds = [
      ...(members || []).map((m: any) => m.user_id),
      ...(classroom?.teacher_id ? [classroom.teacher_id] : []),
    ];

    if (userIds.length === 0) {
      setClassBoard([]);
      setLoading(false);
      return;
    }

    // Fetch profiles and streaks in parallel
    const [profilesRes, streaksRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, user_id, display_name, avatar_emoji, country_code, mastery_score, xp_total, sessions_count")
        .in("user_id", userIds)
        .order("xp_total", { ascending: false }),
      supabase
        .from("user_progress")
        .select("user_id, streak_days")
        .in("user_id", userIds),
    ]);

    const profiles = profilesRes.data || [];
    const streakMap = new Map((streaksRes.data || []).map((r: any) => [r.user_id, r.streak_days || 0]));

    const entries = profiles.map((row: any) => ({
      ...row,
      ligue: getLigue(row.xp_total || 0),
      level: getHifzLevel(Number(row.mastery_score) || 0),
      streak_days: streakMap.get(row.user_id) || 0,
    }));

    setClassBoard(entries);

    // Compute stats
    const memberCount = entries.length;
    if (memberCount > 0) {
      const avgMastery = entries.reduce((a: number, e: any) => a + (Number(e.mastery_score) || 0), 0) / memberCount;
      const avgStreak = entries.reduce((a: number, e: any) => a + (e.streak_days || 0), 0) / memberCount;
      const totalSessions = entries.reduce((a: number, e: any) => a + (e.sessions_count || 0), 0);
      setClassStats({ avgMastery: Math.round(avgMastery * 10) / 10, avgStreak: Math.round(avgStreak * 10) / 10, totalSessions, memberCount });
    } else {
      setClassStats({ avgMastery: 0, avgStreak: 0, totalSessions: 0, memberCount: 0 });
    }

    setLoading(false);
  }, [myClassrooms]);

  // Create a new classroom
  const createClassroom = useCallback(async (name: string) => {
    if (!user) return null;
    const joinCode = generateJoinCode();
    const { data, error } = await supabase
      .from("classrooms")
      .insert({ name, teacher_id: user.id, join_code: joinCode })
      .select()
      .single();
    if (!error && data) {
      await fetchMyClassrooms();
      return data as ClassroomInfo;
    }
    return null;
  }, [user, fetchMyClassrooms]);

  // Join a classroom by code
  const joinByCode = useCallback(async (code: string) => {
    if (!user) return { error: "not_authenticated" };
    
    // Look up classroom - use anon access via the public policy
    const { data: rpcData } = await supabase
      .rpc("lookup_classroom_by_code", { _join_code: code.toUpperCase() });
    const classroom = rpcData?.[0] || null;

    if (!classroom) return { error: "not_found" };

    // Insert membership
    const { error } = await supabase
      .from("classroom_members")
      .insert({ classroom_id: classroom.id, user_id: user.id });

    if (error?.code === "23505") return { error: "already_member" };
    if (error) return { error: error.message };

    await fetchMyClassrooms();
    return { error: null, classroom: classroom as ClassroomInfo };
  }, [user, fetchMyClassrooms]);

  useEffect(() => { fetchMyClassrooms(); }, [fetchMyClassrooms]);

  useEffect(() => {
    if (selectedClassId) fetchClassBoard(selectedClassId);
  }, [selectedClassId, fetchClassBoard]);

  return {
    myClassrooms,
    classBoard,
    classStats,
    selectedClassId,
    loading,
    setSelectedClassId: (id: string) => {
      setSelectedClassId(id);
      fetchClassBoard(id);
    },
    createClassroom,
    joinByCode,
    refetch: fetchMyClassrooms,
  };
}

function generateJoinCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}
