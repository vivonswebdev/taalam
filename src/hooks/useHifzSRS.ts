import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface HifzItem {
  id: string;
  user_id: string;
  surah_number: number;
  ayah_from: number;
  ayah_to: number;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review_date: string;
  last_reviewed_at: string | null;
  last_quality: number | null;
  status: "learning" | "reviewing" | "mastered";
  created_at: string;
  updated_at: string;
}

const LS_KEY = "hifz_srs_items";

function loadLocal(): HifzItem[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; }
}
function saveLocal(items: HifzItem[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(items)); } catch {}
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

/**
 * SM-2 Algorithm
 * quality: 0-5 (0=total blackout, 5=perfect)
 */
function sm2(item: HifzItem, quality: number): Partial<HifzItem> {
  const q = Math.max(0, Math.min(5, quality));
  let { ease_factor, interval_days, repetitions } = item;

  if (q < 3) {
    // Failed — reset
    repetitions = 0;
    interval_days = 1;
  } else {
    if (repetitions === 0) {
      interval_days = 1;
    } else if (repetitions === 1) {
      interval_days = 3;
    } else {
      interval_days = Math.round(interval_days * ease_factor);
    }
    repetitions += 1;
  }

  // Update ease factor
  ease_factor = Math.max(
    1.3,
    ease_factor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  );

  // Determine status
  let status: HifzItem["status"] = "learning";
  if (repetitions >= 5 && interval_days >= 21) {
    status = "mastered";
  } else if (repetitions >= 1) {
    status = "reviewing";
  }

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval_days);

  return {
    ease_factor: Math.round(ease_factor * 100) / 100,
    interval_days,
    repetitions,
    next_review_date: nextDate.toISOString().split("T")[0],
    last_reviewed_at: new Date().toISOString(),
    last_quality: q,
    status,
    updated_at: new Date().toISOString(),
  };
}

export function useHifzSRS() {
  const { user } = useAuth();
  const [items, setItems] = useState<HifzItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Load
  useEffect(() => {
    if (user) {
      setLoading(true);
      supabase
        .from("hifz_items")
        .select("*")
        .eq("user_id", user.id)
        .order("next_review_date", { ascending: true })
        .then(({ data }) => {
          if (data) setItems(data as unknown as HifzItem[]);
          setLoading(false);
        });
    } else {
      setItems(loadLocal());
    }
  }, [user]);

  // Items due today
  const todayItems = items.filter((i) => i.next_review_date <= todayStr());
  const learningCount = items.filter((i) => i.status === "learning").length;
  const reviewingCount = items.filter((i) => i.status === "reviewing").length;
  const masteredCount = items.filter((i) => i.status === "mastered").length;

  // Add a new item to memorize
  const addItem = useCallback(
    async (surahNumber: number, ayahFrom: number, ayahTo: number) => {
      const existing = items.find(
        (i) => i.surah_number === surahNumber && i.ayah_from === ayahFrom && i.ayah_to === ayahTo
      );
      if (existing) return existing;

      if (user) {
        const { data } = await supabase
          .from("hifz_items")
          .insert({
            user_id: user.id,
            surah_number: surahNumber,
            ayah_from: ayahFrom,
            ayah_to: ayahTo,
          })
          .select()
          .single();
        if (data) {
          const item = data as unknown as HifzItem;
          setItems((prev) => [...prev, item]);
          return item;
        }
      } else {
        const newItem: HifzItem = {
          id: crypto.randomUUID(),
          user_id: "local",
          surah_number: surahNumber,
          ayah_from: ayahFrom,
          ayah_to: ayahTo,
          ease_factor: 2.5,
          interval_days: 1,
          repetitions: 0,
          next_review_date: todayStr(),
          last_reviewed_at: null,
          last_quality: null,
          status: "learning",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        const next = [...items, newItem];
        setItems(next);
        saveLocal(next);
        return newItem;
      }
    },
    [items, user]
  );

  // Grade a review (SM-2)
  const gradeReview = useCallback(
    async (itemId: string, quality: number) => {
      const item = items.find((i) => i.id === itemId);
      if (!item) return;

      const updates = sm2(item, quality);
      const updated = { ...item, ...updates };
      const next = items.map((i) => (i.id === itemId ? updated : i));
      setItems(next);

      if (user) {
        await supabase
          .from("hifz_items")
          .update(updates as any)
          .eq("id", itemId);
      } else {
        saveLocal(next);
      }
    },
    [items, user]
  );

  // Remove an item
  const removeItem = useCallback(
    async (itemId: string) => {
      const next = items.filter((i) => i.id !== itemId);
      setItems(next);
      if (user) {
        await supabase.from("hifz_items").delete().eq("id", itemId);
      } else {
        saveLocal(next);
      }
    },
    [items, user]
  );

  return {
    items,
    todayItems,
    loading,
    learningCount,
    reviewingCount,
    masteredCount,
    addItem,
    gradeReview,
    removeItem,
  };
}
