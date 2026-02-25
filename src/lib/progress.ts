import { supabase } from "@/integrations/supabase/client";

export interface UserProgress {
  xp_total: number;
  xp_today: number;
  streak_days: number;
  last_xp_date: string | null;
}

const MAX_XP_PER_DAY = 100;

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function isYesterday(dateStr: string, today: string): boolean {
  const d = new Date(dateStr);
  const t = new Date(today);
  const diff = Math.round((t.getTime() - d.getTime()) / 86400000);
  return diff === 1;
}

/**
 * Add XP for the current authenticated user.
 * Falls back gracefully if not authenticated.
 */
export async function addXP(
  userId: string,
  amount: number,
  today: Date = new Date()
): Promise<UserProgress | null> {
  if (amount <= 0) return null;

  const todayStr = toDateStr(today);

  // Fetch current row
  const { data: existing, error: fetchErr } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchErr) {
    console.error("Error fetching user_progress:", fetchErr);
    return null;
  }

  if (!existing) {
    // Create new row
    const newRow = {
      user_id: userId,
      xp_total: amount,
      xp_today: amount,
      streak_days: 1,
      last_xp_date: todayStr,
    };
    const { error: insertErr } = await supabase
      .from("user_progress")
      .insert(newRow);

    if (insertErr) {
      console.error("Error inserting user_progress:", insertErr);
      return null;
    }

    return {
      xp_total: amount,
      xp_today: amount,
      streak_days: 1,
      last_xp_date: todayStr,
    };
  }

  // Existing row — calculate updates
  let newXpToday: number;
  let newStreakDays: number;

  if (existing.last_xp_date === todayStr) {
    // Same day: cap daily XP
    newXpToday = Math.min(existing.xp_today + amount, MAX_XP_PER_DAY);
    amount = newXpToday - existing.xp_today; // actual gain after cap
    newStreakDays = existing.streak_days;
  } else if (existing.last_xp_date && isYesterday(existing.last_xp_date, todayStr)) {
    // Yesterday → streak continues
    newXpToday = amount;
    newStreakDays = existing.streak_days + 1;
  } else {
    // Streak broken
    newXpToday = amount;
    newStreakDays = 1;
  }

  const newXpTotal = existing.xp_total + amount;

  const { error: updateErr } = await supabase
    .from("user_progress")
    .update({
      xp_total: newXpTotal,
      xp_today: newXpToday,
      streak_days: newStreakDays,
      last_xp_date: todayStr,
    })
    .eq("user_id", userId);

  if (updateErr) {
    console.error("Error updating user_progress:", updateErr);
    return null;
  }

  return {
    xp_total: newXpTotal,
    xp_today: newXpToday,
    streak_days: newStreakDays,
    last_xp_date: todayStr,
  };
}

/**
 * Fetch the current user's progress from Supabase.
 */
export async function fetchUserProgress(userId: string): Promise<UserProgress | null> {
  const { data, error } = await supabase
    .from("user_progress")
    .select("xp_total, xp_today, streak_days, last_xp_date")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return data as UserProgress;
}
