import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface ClassInvitation {
  id: string;
  classroom_id: string;
  invite_code: string;
  parent_email: string | null;
  parent_user_id: string | null;
  child_profile_id: string | null;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  classroom_name?: string;
  teacher_name?: string;
}

export function useClassInvites(classroomId?: string | null) {
  const { user } = useAuth();
  const [invites, setInvites] = useState<ClassInvitation[]>([]);
  const [parentInvites, setParentInvites] = useState<ClassInvitation[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch invites for a specific classroom (teacher view)
  const fetchClassInvites = useCallback(async () => {
    if (!classroomId || !user) return;
    setLoading(true);
    const { data } = await supabase
      .from("class_invitations")
      .select("*")
      .eq("classroom_id", classroomId)
      .order("created_at", { ascending: false });
    setInvites((data as any[]) || []);
    setLoading(false);
  }, [classroomId, user]);

  // Fetch invites for the current parent
  const fetchParentInvites = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("class_invitations")
      .select("*")
      .eq("parent_user_id", user.id)
      .in("status", ["pending", "accepted"])
      .order("created_at", { ascending: false });

    // Enrich with classroom info
    const enriched: ClassInvitation[] = [];
    for (const inv of (data as any[]) || []) {
      const { data: cls } = await supabase
        .from("classrooms")
        .select("name, teacher_id")
        .eq("id", inv.classroom_id)
        .single();
      let teacherName = "";
      if (cls) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("user_id", cls.teacher_id)
          .single();
        teacherName = prof?.display_name || "";
      }
      enriched.push({
        ...inv,
        classroom_name: cls?.name || "",
        teacher_name: teacherName,
      });
    }
    setParentInvites(enriched);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (classroomId) fetchClassInvites();
  }, [fetchClassInvites]);

  // Create invitation (teacher)
  const createInvite = useCallback(async (parentEmail?: string) => {
    if (!classroomId || !user) return null;
    const { data, error } = await supabase
      .from("class_invitations")
      .insert({
        classroom_id: classroomId,
        parent_email: parentEmail || null,
        created_by: user.id,
      } as any)
      .select()
      .single();
    if (error) return null;
    await fetchClassInvites();
    return data as ClassInvitation;
  }, [classroomId, user, fetchClassInvites]);

  // Accept invite by code (parent)
  const acceptInviteByCode = useCallback(async (code: string) => {
    if (!user) return { success: false, invite: null as ClassInvitation | null };
    // Lookup using security definer function
    const { data: results } = await supabase.rpc("lookup_invitation_by_code", { _invite_code: code });
    const invite = (results as any[])?.[0];
    if (!invite) return { success: false, invite: null };

    // Claim the invite
    const { error } = await supabase
      .from("class_invitations")
      .update({ parent_user_id: user.id, status: "accepted", updated_at: new Date().toISOString() } as any)
      .eq("id", invite.id);

    if (error) return { success: false, invite: null };
    return { success: true, invite: invite as ClassInvitation };
  }, [user]);

  // Link child to invite and join class
  const linkChildToInvite = useCallback(async (inviteId: string, childId: string) => {
    if (!user) return false;

    // Get invite details
    const { data: inv } = await supabase
      .from("class_invitations")
      .select("*")
      .eq("id", inviteId)
      .single();
    if (!inv) return false;

    // Update invite
    const { error: updateErr } = await supabase
      .from("class_invitations")
      .update({
        child_profile_id: childId,
        status: "child_created",
        updated_at: new Date().toISOString(),
      } as any)
      .eq("id", inviteId);
    if (updateErr) return false;

    // Join the classroom as the parent (if not already a member)
    const { data: existing } = await supabase
      .from("classroom_members")
      .select("id")
      .eq("classroom_id", (inv as any).classroom_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!existing) {
      await supabase.from("classroom_members").insert({
        classroom_id: (inv as any).classroom_id,
        user_id: user.id,
      });
    }

    return true;
  }, [user]);

  // Delete invite (teacher)
  const deleteInvite = useCallback(async (inviteId: string) => {
    await supabase.from("class_invitations").delete().eq("id", inviteId);
    await fetchClassInvites();
  }, [fetchClassInvites]);

  return {
    invites,
    parentInvites,
    loading,
    createInvite,
    acceptInviteByCode,
    linkChildToInvite,
    deleteInvite,
    fetchClassInvites,
    fetchParentInvites,
  };
}
