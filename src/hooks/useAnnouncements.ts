import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Announcement {
  id: string;
  class_code: string;
  title: string;
  message: string;
  author_uid: string;
  author_name: string | null;
  created_at: string;
  isRead?: boolean;
}

export function useAnnouncements(classCodes: string[]) {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = useCallback(async () => {
    if (!classCodes.length) { setAnnouncements([]); setLoading(false); return; }
    const { data } = await supabase
      .from("announcements")
      .select("*")
      .in("class_code", classCodes)
      .order("created_at", { ascending: false })
      .limit(100);
    setAnnouncements((data as Announcement[]) || []);
    setLoading(false);
  }, [classCodes]);

  const fetchReads = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("announcement_reads")
      .select("announcement_id")
      .eq("user_id", user.id);
    if (data) setReadIds(new Set(data.map((r: any) => r.announcement_id)));
  }, [user]);

  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);
  useEffect(() => { fetchReads(); }, [fetchReads]);

  const createAnnouncement = useCallback(async (classCode: string, title: string, message: string, authorName?: string) => {
    if (!user) return;
    const { error } = await supabase.from("announcements").insert({
      class_code: classCode,
      title,
      message,
      author_uid: user.id,
      author_name: authorName || null,
    });
    if (!error) fetchAnnouncements();
    return error;
  }, [user, fetchAnnouncements]);

  const markAsRead = useCallback(async (announcementId: string) => {
    if (!user) return;
    await supabase.from("announcement_reads").insert({
      announcement_id: announcementId,
      user_id: user.id,
    });
    setReadIds((prev) => new Set([...prev, announcementId]));
  }, [user]);

  const unreadCount = announcements.filter((a) => !readIds.has(a.id)).length;

  const enrichedAnnouncements = announcements.map((a) => ({
    ...a,
    isRead: readIds.has(a.id),
  }));

  return { announcements: enrichedAnnouncements, unreadCount, loading, createAnnouncement, markAsRead, refetch: fetchAnnouncements };
}
