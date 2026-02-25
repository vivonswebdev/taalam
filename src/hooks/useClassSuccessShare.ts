import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { surahs } from "@/data/surahs";

/**
 * Shares a success message to all classrooms the user belongs to
 * when they complete a surah recitation with a good score.
 */
export function useClassSuccessShare() {
  const { user } = useAuth();

  const shareSuccess = useCallback(async (surahNumber: number, score: number) => {
    if (!user || score < 50) return; // Only share decent scores

    const surah = surahs.find(s => s.number === surahNumber);
    if (!surah) return;

    // Get user display name
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, avatar_emoji")
      .eq("user_id", user.id)
      .maybeSingle();

    const name = profile?.display_name || "Un élève";
    const emoji = profile?.avatar_emoji || "🌙";

    // Build message
    let badge = "";
    if (score >= 90) badge = "🌟 Excellent !";
    else if (score >= 75) badge = "📖 Très bien !";
    else if (score >= 50) badge = "💪 Bien joué !";

    const message = `${badge} ${emoji} ${name} a terminé la sourate ${surah.nameArabic} (${surah.frenchName}) avec un score de ${score}% !`;

    // Get all classrooms the user belongs to (as member or teacher)
    const [{ data: memberRows }, { data: teacherRows }] = await Promise.all([
      supabase
        .from("classroom_members")
        .select("classroom_id")
        .eq("user_id", user.id),
      supabase
        .from("classrooms")
        .select("id")
        .eq("teacher_id", user.id),
    ]);

    const classIds = new Set<string>();
    (memberRows || []).forEach((r) => classIds.add(r.classroom_id));
    (teacherRows || []).forEach((r) => classIds.add(r.id));

    if (classIds.size === 0) return;

    // Send message to each classroom
    const inserts = Array.from(classIds).map((classroom_id) => ({
      classroom_id,
      author_id: user.id,
      author_name: `🤖 ${name}`,
      message,
    }));

    await supabase.from("class_messages").insert(inserts);
  }, [user]);

  return { shareSuccess };
}
