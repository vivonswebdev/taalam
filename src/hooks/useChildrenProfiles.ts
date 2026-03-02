import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface ChildProfileDB {
  id: string;
  parent_id: string;
  name: string;
  avatar_emoji: string;
  birth_date: string | null;
  age: number | null;
  country_code: string | null;
  gender: string | null;
  total_points: number;
  created_at: string;
  updated_at: string;
}

export function useChildrenProfiles() {
  const { user } = useAuth();
  const [children, setChildren] = useState<ChildProfileDB[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChildren = useCallback(async () => {
    if (!user) { setChildren([]); setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from("children_profiles")
      .select("*")
      .eq("parent_id", user.id)
      .order("created_at", { ascending: true });
    setChildren((data as any[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchChildren(); }, [fetchChildren]);

  const addChild = useCallback(async (name: string, avatar_emoji: string, age?: number, country_code?: string) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from("children_profiles")
      .insert({ parent_id: user.id, name, avatar_emoji, age: age || null, country_code: country_code || null } as any)
      .select()
      .single();
    if (error) return null;
    setChildren(prev => [...prev, data as any]);
    return data as ChildProfileDB;
  }, [user]);

  const updateChild = useCallback(async (id: string, updates: Partial<Pick<ChildProfileDB, "name" | "avatar_emoji" | "age" | "country_code">>) => {
    const { error } = await supabase
      .from("children_profiles")
      .update(updates as any)
      .eq("id", id);
    if (!error) setChildren(prev => prev.map(c => c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c));
  }, []);

  const deleteChild = useCallback(async (id: string) => {
    await supabase.from("children_profiles").delete().eq("id", id);
    setChildren(prev => prev.filter(c => c.id !== id));
  }, []);

  const addPoints = useCallback(async (childId: string, points: number, activityType: string) => {
    if (!user) return;
    await supabase.from("children_points").insert({
      child_id: childId, parent_id: user.id, points, activity_type: activityType
    } as any);
    setChildren(prev => prev.map(c => c.id === childId ? { ...c, total_points: c.total_points + points } : c));
  }, [user]);

  return { children, loading, addChild, updateChild, deleteChild, addPoints, refetch: fetchChildren };
}
