import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Medal, Clock } from "lucide-react";
import { usePerfectChallenge } from "@/hooks/usePerfectChallenge";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";

export default function PerfectLeaderboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { challenge, leaderboard, myRank, myScore, loading } = usePerfectChallenge();

  const endsIn = challenge
    ? (() => {
        const diff = new Date(challenge.end_at).getTime() - Date.now();
        const days = Math.max(0, Math.floor(diff / 86400000));
        const hours = Math.max(0, Math.floor((diff % 86400000) / 3600000));
        return `${days}j ${hours}h`;
      })()
    : null;

  return (
    <div className="min-h-screen pb-24">
      <div className="px-6 pt-14 pb-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground mb-4">
          <ArrowLeft size={20} />
          <span className="text-sm">{t("quiz.back")}</span>
        </button>

        <div className="flex items-center gap-3 mb-1">
          <Trophy size={24} className="text-secondary" />
          <h1 className="text-xl font-bold text-foreground">Classement Mode Parfait</h1>
        </div>

        {challenge && endsIn && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
            <Clock size={12} />
            <span>Se termine dans {endsIn}</span>
          </div>
        )}

        {myRank && myScore && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-primary/10 border border-primary/20 rounded-xl p-3 flex items-center gap-3"
          >
            <span className="text-2xl">🏅</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">Ton classement : #{myRank}</p>
              <p className="text-xs text-muted-foreground">
                Meilleur score : {myScore.best_score}/10 · {myScore.plays} partie{myScore.plays > 1 ? "s" : ""}
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {!challenge && !loading && (
        <div className="px-6 text-center mt-12">
          <p className="text-muted-foreground text-sm">Aucun défi actif cette semaine.</p>
          <p className="text-xs text-muted-foreground mt-1">Revenez bientôt !</p>
        </div>
      )}

      {loading && (
        <div className="px-6 mt-8 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {!loading && leaderboard.length > 0 && (
        <div className="px-6 mt-4 space-y-2">
          {leaderboard.map((row, i) => {
            const isMe = user?.id === row.user_id;
            const medalEmoji = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
            return (
              <motion.div
                key={row.user_id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`flex items-center gap-3 p-3 rounded-xl border ${
                  isMe ? "bg-primary/10 border-primary/30" : "bg-card border-border"
                }`}
              >
                <span className="w-8 text-center font-bold text-sm text-muted-foreground">
                  {medalEmoji || `#${i + 1}`}
                </span>
                <span className="text-xl">{row.avatar_emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${isMe ? "text-primary" : "text-foreground"}`}>
                    {row.display_name} {isMe && "(toi)"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {row.plays} partie{row.plays > 1 ? "s" : ""}
                  </p>
                </div>
                <span className="text-sm font-bold text-foreground">{row.best_score}/10</span>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
