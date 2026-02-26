import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { QuizQuestion } from "@/data/quizQuestions";

export interface QuestionStat {
  id: string;
  question_id: string;
  seen: number;
  correct: number;
  last_seen_at: string;
  difficulty: number; // computed: 1 - (correct / max(seen,1))
}

/** Generate a stable ID from question text */
export function getQuestionId(q: QuizQuestion): string {
  // Simple hash: first 60 chars of the question string, sanitized
  return q.question.slice(0, 60).replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, "_").toLowerCase();
}

export function useQuestionStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<QuestionStat[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!user) { setStats([]); setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from("question_stats")
      .select("*")
      .eq("user_id", user.id);

    const enriched: QuestionStat[] = (data || []).map((row: any) => {
      const seen = row.seen || 1;
      const correct = row.correct || 0;
      // Time decay: add 0.01 per day since last seen (max 0.3)
      const daysSince = (Date.now() - new Date(row.last_seen_at).getTime()) / 86400000;
      const timeBonus = Math.min(0.3, daysSince * 0.01);
      const baseDifficulty = 1 - (correct / Math.max(seen, 1));
      return {
        ...row,
        difficulty: Math.min(1, baseDifficulty + timeBonus),
      };
    });

    // Sort by difficulty descending
    enriched.sort((a, b) => b.difficulty - a.difficulty);
    setStats(enriched);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  /** Record that a question was answered */
  const recordAnswer = useCallback(async (questionId: string, wasCorrect: boolean) => {
    if (!user) return;

    const { data: existing } = await supabase
      .from("question_stats")
      .select("id, seen, correct")
      .eq("user_id", user.id)
      .eq("question_id", questionId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("question_stats")
        .update({
          seen: (existing.seen as number) + 1,
          correct: (existing.correct as number) + (wasCorrect ? 1 : 0),
          last_seen_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("question_stats").insert({
        user_id: user.id,
        question_id: questionId,
        seen: 1,
        correct: wasCorrect ? 1 : 0,
      });
    }
  }, [user]);

  /** Batch record answers for a full quiz session */
  const recordSession = useCallback(async (
    answers: { question: QuizQuestion; selectedIndex: number }[]
  ) => {
    for (const a of answers) {
      const qid = getQuestionId(a.question);
      const correct = a.selectedIndex === a.question.correctIndex;
      await recordAnswer(qid, correct);
    }
    await fetchStats();
  }, [recordAnswer, fetchStats]);

  /** Get top N weakest questions (highest difficulty) */
  const getWeakCards = useCallback((n = 5): QuestionStat[] => {
    return stats.filter((s) => s.difficulty > 0.3).slice(0, n);
  }, [stats]);

  return { stats, loading, recordAnswer, recordSession, getWeakCards, refetch: fetchStats };
}

/**
 * Build an adaptive quiz session: prioritize hardest questions, fill with normals.
 * Does NOT modify existing buildQuizSession logic.
 */
export function buildAdaptiveSession(
  pool: QuizQuestion[],
  stats: QuestionStat[],
  count = 10
): QuizQuestion[] {
  // Map question_id → difficulty
  const diffMap = new Map(stats.map((s) => [s.question_id, s.difficulty]));

  // Score each question
  const scored = pool.map((q) => ({
    question: q,
    difficulty: diffMap.get(getQuestionId(q)) ?? 0.5, // unseen = medium
  }));

  // Sort by difficulty descending
  scored.sort((a, b) => b.difficulty - a.difficulty);

  // Take top N
  const selected = scored.slice(0, count).map((s) => s.question);

  // Shuffle for variety
  for (let i = selected.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [selected[i], selected[j]] = [selected[j], selected[i]];
  }

  return selected;
}
