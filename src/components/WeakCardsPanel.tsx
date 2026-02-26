import { motion } from "framer-motion";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { type QuestionStat } from "@/hooks/useQuestionStats";
import { type QuizQuestion } from "@/data/quizQuestions";

interface WeakCardsProps {
  weakCards: QuestionStat[];
  allQuestions: QuizQuestion[];
  onReviewNow?: () => void;
}

/** Maps question_id back to the question text for display */
function findQuestionText(qid: string, pool: QuizQuestion[]): string | null {
  // Match by regenerating the ID
  for (const q of pool) {
    const id = q.question.slice(0, 60).replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, "_").toLowerCase();
    if (id === qid) return q.question;
  }
  return null;
}

export default function WeakCardsPanel({ weakCards, allQuestions, onReviewNow }: WeakCardsProps) {
  if (weakCards.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="w-full max-w-xs mt-6"
    >
      <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-destructive" />
            <span className="text-xs font-bold text-foreground">Tes cartes faibles</span>
          </div>
          <span className="text-[10px] text-muted-foreground">{weakCards.length} question{weakCards.length > 1 ? "s" : ""}</span>
        </div>

        {weakCards.slice(0, 5).map((card, i) => {
          const text = findQuestionText(card.question_id, allQuestions);
          const pct = Math.round(card.difficulty * 100);
          return (
            <div key={card.question_id} className="flex items-start gap-2">
              <div className="mt-1 w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center text-[10px] font-bold text-destructive shrink-0">
                {pct}%
              </div>
              <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
                {text || card.question_id}
              </p>
            </div>
          );
        })}

        {onReviewNow && (
          <button
            onClick={onReviewNow}
            className="w-full flex items-center justify-center gap-2 bg-primary/10 text-primary rounded-xl py-2 text-xs font-bold mt-2"
          >
            <RotateCcw size={12} /> Réviser ces cartes maintenant
          </button>
        )}
      </div>
    </motion.div>
  );
}
