import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface Community {
  id: string;
  name: string;
  description: string;
  language: string;
  region: string;
  category: string;
  requires_approval: boolean;
  created_by: string;
  created_at: string;
  member_count?: number;
  user_role?: string | null;
  request_status?: string | null;
}

export interface CommunityMessage {
  id: string;
  community_id: string;
  user_id: string;
  author_name: string;
  content: string;
  is_pinned: boolean;
  message_type: string;
  created_at: string;
}

export interface CommunityMember {
  id: string;
  community_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  display_name?: string;
  avatar_emoji?: string;
}

export interface JoinRequest {
  id: string;
  community_id: string;
  user_id: string;
  status: string;
  created_at: string;
  display_name?: string;
  avatar_emoji?: string;
}

export function useCommunityList(filters?: { search?: string; category?: string; language?: string; region?: string }) {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetch = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("communities").select("*").order("created_at", { ascending: false });

    if (filters?.search) query = query.ilike("name", `%${filters.search}%`);
    if (filters?.category && filters.category !== "all") query = query.eq("category", filters.category);
    if (filters?.language && filters.language !== "all") query = query.eq("language", filters.language);
    if (filters?.region && filters.region !== "all") query = query.ilike("region", `%${filters.region}%`);

    const { data, error } = await query;
    if (error) { console.error(error); setLoading(false); return; }

    // Get member counts and user membership status
    const enriched: Community[] = [];
    for (const c of data || []) {
      const { count } = await supabase.from("community_members").select("*", { count: "exact", head: true }).eq("community_id", c.id);

      let user_role: string | null = null;
      let request_status: string | null = null;
      if (user) {
        const { data: memberData } = await supabase.from("community_members").select("role").eq("community_id", c.id).eq("user_id", user.id).maybeSingle();
        user_role = memberData?.role || null;

        if (!user_role) {
          const { data: reqData } = await supabase.from("community_join_requests").select("status").eq("community_id", c.id).eq("user_id", user.id).eq("status", "pending").maybeSingle();
          request_status = reqData?.status || null;
        }
      }

      enriched.push({ ...c, member_count: count || 0, user_role, request_status });
    }

    setCommunities(enriched);
    setLoading(false);
  }, [user, filters?.search, filters?.category, filters?.language, filters?.region]);

  useEffect(() => { fetch(); }, [fetch]);

  return { communities, loading, refetch: fetch };
}

export function useCommunityDetail(communityId: string | undefined) {
  const [community, setCommunity] = useState<Community | null>(null);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchAll = useCallback(async () => {
    if (!communityId) return;
    setLoading(true);

    const { data: cData } = await supabase.from("communities").select("*").eq("id", communityId).single();
    if (cData) {
      let user_role: string | null = null;
      if (user) {
        const { data: m } = await supabase.from("community_members").select("role").eq("community_id", communityId).eq("user_id", user.id).maybeSingle();
        user_role = m?.role || null;
      }
      setCommunity({ ...cData, user_role });
    }

    const { data: membersData } = await supabase.from("community_members").select("*").eq("community_id", communityId);
    // Enrich with profile data
    if (membersData) {
      const userIds = membersData.map(m => m.user_id);
      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, avatar_emoji").in("user_id", userIds);
      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));
      setMembers(membersData.map(m => ({
        ...m,
        display_name: profileMap.get(m.user_id)?.display_name || "Anonyme",
        avatar_emoji: profileMap.get(m.user_id)?.avatar_emoji || "🌙",
      })));
    }

    const { data: msgData } = await supabase.from("community_messages").select("*").eq("community_id", communityId).order("created_at", { ascending: true });
    setMessages(msgData || []);

    // Fetch pending requests (admin only)
    const { data: reqData } = await supabase.from("community_join_requests").select("*").eq("community_id", communityId).eq("status", "pending");
    if (reqData && reqData.length > 0) {
      const reqUserIds = reqData.map(r => r.user_id);
      const { data: reqProfiles } = await supabase.from("profiles").select("user_id, display_name, avatar_emoji").in("user_id", reqUserIds);
      const reqMap = new Map((reqProfiles || []).map(p => [p.user_id, p]));
      setRequests(reqData.map(r => ({
        ...r,
        display_name: reqMap.get(r.user_id)?.display_name || "Anonyme",
        avatar_emoji: reqMap.get(r.user_id)?.avatar_emoji || "🌙",
      })));
    } else {
      setRequests([]);
    }

    setLoading(false);
  }, [communityId, user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Realtime messages
  useEffect(() => {
    if (!communityId) return;
    const channel = supabase.channel(`community-${communityId}`).on("postgres_changes", { event: "*", schema: "public", table: "community_messages", filter: `community_id=eq.${communityId}` }, () => {
      // Refetch messages on any change
      supabase.from("community_messages").select("*").eq("community_id", communityId).order("created_at", { ascending: true }).then(({ data }) => { if (data) setMessages(data); });
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [communityId]);

  return { community, members, messages, requests, loading, refetch: fetchAll };
}

export function useCommunityActions() {
  const { user } = useAuth();

  const createCommunity = useCallback(async (data: { name: string; description?: string; language: string; region: string; category: string; requires_approval: boolean }) => {
    if (!user) return null;
    const { data: community, error } = await supabase.from("communities").insert({ ...data, description: data.description || "", created_by: user.id }).select().single();
    if (error) { toast.error(error.message); return null; }
    // Add creator as admin
    await supabase.from("community_members").insert({ community_id: community.id, user_id: user.id, role: "admin" });
    return community;
  }, [user]);

  const joinCommunity = useCallback(async (communityId: string, requiresApproval: boolean, communityName?: string) => {
    if (!user) return;
    if (requiresApproval) {
      const { error } = await supabase.from("community_join_requests").insert({ community_id: communityId, user_id: user.id });
      if (error) { toast.error(error.message); return; }
      toast.success("Demande envoyée !");
      // Notify admins
      supabase.functions.invoke("community-notify", {
        body: { type: "join_request", community_id: communityId, community_name: communityName || "" },
      }).catch(() => {});
    } else {
      const { error } = await supabase.from("community_members").insert({ community_id: communityId, user_id: user.id });
      if (error) { toast.error(error.message); return; }
      toast.success("Tu as rejoint le groupe !");
    }
  }, [user]);

  const leaveCommunity = useCallback(async (communityId: string) => {
    if (!user) return;
    await supabase.from("community_members").delete().eq("community_id", communityId).eq("user_id", user.id);
  }, [user]);

  const sendMessage = useCallback(async (communityId: string, content: string, authorName: string, messageType = "text") => {
    if (!user) return;
    const { error } = await supabase.from("community_messages").insert({ community_id: communityId, user_id: user.id, author_name: authorName, content, message_type: messageType });
    if (error) toast.error(error.message);
  }, [user]);

  const deleteMessage = useCallback(async (messageId: string) => {
    await supabase.from("community_messages").delete().eq("id", messageId);
  }, []);

  const togglePin = useCallback(async (messageId: string, isPinned: boolean) => {
    await supabase.from("community_messages").update({ is_pinned: !isPinned }).eq("id", messageId);
  }, []);

  const approveRequest = useCallback(async (requestId: string, communityId: string, userId: string) => {
    await supabase.from("community_members").insert({ community_id: communityId, user_id: userId });
    await supabase.from("community_join_requests").update({ status: "approved" }).eq("id", requestId);
  }, []);

  const rejectRequest = useCallback(async (requestId: string) => {
    await supabase.from("community_join_requests").update({ status: "rejected" }).eq("id", requestId);
  }, []);

  const removeMember = useCallback(async (communityId: string, userId: string) => {
    await supabase.from("community_members").delete().eq("community_id", communityId).eq("user_id", userId);
  }, []);

  const deleteCommunity = useCallback(async (communityId: string) => {
    await supabase.from("communities").delete().eq("id", communityId);
  }, []);

  const updateCommunity = useCallback(async (communityId: string, data: Partial<{ name: string; description: string; requires_approval: boolean }>) => {
    const { error } = await supabase.from("communities").update(data).eq("id", communityId);
    if (error) toast.error(error.message);
  }, []);

  return { createCommunity, joinCommunity, leaveCommunity, sendMessage, deleteMessage, togglePin, approveRequest, rejectRequest, removeMember, deleteCommunity, updateCommunity };
}
