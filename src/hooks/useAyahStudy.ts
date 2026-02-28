import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface AyahNote {
  id: string;
  user_id: string;
  surah_number: number;
  ayah_number: number;
  content: string;
  is_shared: boolean;
  shared_to_family_id: string | null;
  shared_to_class_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AyahFavorite {
  id: string;
  user_id: string;
  surah_number: number;
  ayah_number: number;
  created_at: string;
}

const LOCAL_FAVS_KEY = "ayah_favorites";
const LOCAL_NOTES_KEY = "ayah_notes";

function loadLocal<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}
function saveLocal<T>(key: string, data: T[]) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

export function useAyahStudy() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<AyahFavorite[]>([]);
  const [notes, setNotes] = useState<AyahNote[]>([]);
  const [loading, setLoading] = useState(false);

  // Load data
  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([
        supabase.from("ayah_favorites").select("*").eq("user_id", user.id),
        supabase.from("ayah_notes").select("*").eq("user_id", user.id),
      ]).then(([favRes, noteRes]) => {
        if (favRes.data) setFavorites(favRes.data as AyahFavorite[]);
        if (noteRes.data) setNotes(noteRes.data as AyahNote[]);
        setLoading(false);
      });
    } else {
      setFavorites(loadLocal<AyahFavorite>(LOCAL_FAVS_KEY));
      setNotes(loadLocal<AyahNote>(LOCAL_NOTES_KEY));
    }
  }, [user]);

  const isFavorite = useCallback(
    (surah: number, ayah: number) => favorites.some((f) => f.surah_number === surah && f.ayah_number === ayah),
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (surah: number, ayah: number) => {
      const existing = favorites.find((f) => f.surah_number === surah && f.ayah_number === ayah);
      if (existing) {
        // Remove
        const next = favorites.filter((f) => f.id !== existing.id);
        setFavorites(next);
        if (user) {
          await supabase.from("ayah_favorites").delete().eq("id", existing.id);
        } else {
          saveLocal(LOCAL_FAVS_KEY, next);
        }
      } else {
        // Add
        if (user) {
          const { data } = await supabase
            .from("ayah_favorites")
            .insert({ user_id: user.id, surah_number: surah, ayah_number: ayah })
            .select()
            .single();
          if (data) setFavorites((prev) => [...prev, data as AyahFavorite]);
        } else {
          const newFav: AyahFavorite = {
            id: crypto.randomUUID(),
            user_id: "local",
            surah_number: surah,
            ayah_number: ayah,
            created_at: new Date().toISOString(),
          };
          const next = [...favorites, newFav];
          setFavorites(next);
          saveLocal(LOCAL_FAVS_KEY, next);
        }
      }
    },
    [favorites, user]
  );

  const getNote = useCallback(
    (surah: number, ayah: number) => notes.find((n) => n.surah_number === surah && n.ayah_number === ayah) || null,
    [notes]
  );

  const saveNote = useCallback(
    async (surah: number, ayah: number, content: string, isShared = false, sharedToFamilyId?: string, sharedToClassId?: string) => {
      const existing = notes.find((n) => n.surah_number === surah && n.ayah_number === ayah);
      if (existing) {
        const updated = { ...existing, content, is_shared: isShared, shared_to_family_id: sharedToFamilyId || null, shared_to_class_id: sharedToClassId || null, updated_at: new Date().toISOString() };
        const next = notes.map((n) => (n.id === existing.id ? updated : n));
        setNotes(next);
        if (user) {
          await supabase.from("ayah_notes").update({ content, is_shared: isShared, shared_to_family_id: sharedToFamilyId || null, shared_to_class_id: sharedToClassId || null, updated_at: new Date().toISOString() }).eq("id", existing.id);
        } else {
          saveLocal(LOCAL_NOTES_KEY, next);
        }
      } else {
        if (user) {
          const { data } = await supabase
            .from("ayah_notes")
            .insert({ user_id: user.id, surah_number: surah, ayah_number: ayah, content, is_shared: isShared, shared_to_family_id: sharedToFamilyId || null, shared_to_class_id: sharedToClassId || null })
            .select()
            .single();
          if (data) setNotes((prev) => [...prev, data as AyahNote]);
        } else {
          const newNote: AyahNote = {
            id: crypto.randomUUID(),
            user_id: "local",
            surah_number: surah,
            ayah_number: ayah,
            content,
            is_shared: isShared,
            shared_to_family_id: sharedToFamilyId || null,
            shared_to_class_id: sharedToClassId || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          const next = [...notes, newNote];
          setNotes(next);
          saveLocal(LOCAL_NOTES_KEY, next);
        }
      }
    },
    [notes, user]
  );

  const deleteNote = useCallback(
    async (surah: number, ayah: number) => {
      const existing = notes.find((n) => n.surah_number === surah && n.ayah_number === ayah);
      if (!existing) return;
      const next = notes.filter((n) => n.id !== existing.id);
      setNotes(next);
      if (user) {
        await supabase.from("ayah_notes").delete().eq("id", existing.id);
      } else {
        saveLocal(LOCAL_NOTES_KEY, next);
      }
    },
    [notes, user]
  );

  const getSharedNotes = useCallback(
    async (surah: number, ayah: number): Promise<AyahNote[]> => {
      if (!user) return [];
      const { data } = await supabase
        .from("ayah_notes")
        .select("*")
        .eq("surah_number", surah)
        .eq("ayah_number", ayah)
        .eq("is_shared", true)
        .neq("user_id", user.id);
      return (data || []) as AyahNote[];
    },
    [user]
  );

  return {
    favorites,
    notes,
    loading,
    isFavorite,
    toggleFavorite,
    getNote,
    saveNote,
    deleteNote,
    getSharedNotes,
  };
}
