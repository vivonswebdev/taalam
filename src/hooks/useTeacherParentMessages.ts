import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface TeacherParentMessage {
  id: string;
  class_id: string;
  sender_id: string;
  receiver_id: string;
  student_id: string | null;
  message: string;
  message_type: string;
  is_read: boolean;
  created_at: string;
  sender_name?: string;
  sender_emoji?: string;
}

export interface Conversation {
  userId: string;
  displayName: string;
  avatarEmoji: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  studentId?: string;
}

export function useTeacherParentMessages(classId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<TeacherParentMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = useCallback(async (otherUserId?: string) => {
    if (!classId || !user) return;
    setLoading(true);
    try {
      let query = supabase
        .from("teacher_parent_messages")
        .select("*")
        .eq("class_id", classId)
        .order("created_at", { ascending: true });

      if (otherUserId) {
        query = query.or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Enrich with sender names
      const senderIds = [...new Set((data || []).map(m => m.sender_id))];
      const { data: profiles } = senderIds.length > 0
        ? await supabase.from("profiles").select("user_id, display_name, avatar_emoji").in("user_id", senderIds)
        : { data: [] };

      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));

      const enriched: TeacherParentMessage[] = (data || []).map(m => ({
        ...m,
        sender_name: profileMap.get(m.sender_id)?.display_name || "?",
        sender_emoji: profileMap.get(m.sender_id)?.avatar_emoji || "🌙",
      }));

      setMessages(enriched);
    } catch (err) {
      console.error("Fetch messages error:", err);
    } finally {
      setLoading(false);
    }
  }, [classId, user]);

  const fetchConversations = useCallback(async () => {
    if (!classId || !user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("teacher_parent_messages")
        .select("*")
        .eq("class_id", classId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) { setConversations([]); setLoading(false); return; }

      // Group by other user
      const convMap = new Map<string, { msgs: any[]; unread: number }>();
      for (const m of data) {
        const otherId = m.sender_id === user.id ? m.receiver_id : m.sender_id;
        if (!convMap.has(otherId)) convMap.set(otherId, { msgs: [], unread: 0 });
        const c = convMap.get(otherId)!;
        c.msgs.push(m);
        if (!m.is_read && m.receiver_id === user.id) c.unread++;
      }

      const otherIds = [...convMap.keys()];
      const { data: profiles } = otherIds.length > 0
        ? await supabase.from("profiles").select("user_id, display_name, avatar_emoji").in("user_id", otherIds)
        : { data: [] };

      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));

      const convs: Conversation[] = otherIds.map(id => {
        const c = convMap.get(id)!;
        const last = c.msgs[0];
        return {
          userId: id,
          displayName: profileMap.get(id)?.display_name || "?",
          avatarEmoji: profileMap.get(id)?.avatar_emoji || "🌙",
          lastMessage: last.message,
          lastMessageAt: last.created_at,
          unreadCount: c.unread,
          studentId: last.student_id,
        };
      });

      convs.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
      setConversations(convs);
    } catch (err) {
      console.error("Fetch conversations error:", err);
    } finally {
      setLoading(false);
    }
  }, [classId, user]);

  const sendMessage = useCallback(async (receiverId: string, message: string, type = "chat", studentId?: string) => {
    if (!classId || !user) return;
    const { error } = await supabase.from("teacher_parent_messages").insert({
      class_id: classId,
      sender_id: user.id,
      receiver_id: receiverId,
      student_id: studentId || null,
      message,
      message_type: type,
    } as any);
    if (error) throw error;
  }, [classId, user]);

  const markAsRead = useCallback(async (senderId: string) => {
    if (!classId || !user) return;
    await supabase
      .from("teacher_parent_messages")
      .update({ is_read: true } as any)
      .eq("class_id", classId)
      .eq("sender_id", senderId)
      .eq("receiver_id", user.id)
      .eq("is_read", false);
  }, [classId, user]);

  const sendAutoNotification = useCallback(async (receiverId: string, message: string, studentId?: string) => {
    return sendMessage(receiverId, message, "auto", studentId);
  }, [sendMessage]);

  // Realtime subscription
  useEffect(() => {
    if (!classId || !user) return;

    const channel = supabase
      .channel(`tpm-${classId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "teacher_parent_messages",
        filter: `class_id=eq.${classId}`,
      }, () => {
        fetchConversations();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [classId, user, fetchConversations]);

  return {
    messages, conversations, loading,
    fetchMessages, fetchConversations,
    sendMessage, markAsRead, sendAutoNotification,
  };
}
