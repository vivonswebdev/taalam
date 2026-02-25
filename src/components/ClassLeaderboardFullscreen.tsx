import { motion } from "framer-motion";
import { Minimize2, Trophy } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import LigueBadge, { type Ligue } from "@/components/LigueBadge";
import type { LeaderboardEntry } from "@/hooks/useLeaderboard";
import type { ClassStats } from "@/hooks/useClassLeaderboard";

interface Props {
  className: string;
  board: LeaderboardEntry[];
  stats: ClassStats;
  userId?: string;
  onClose: () => void;
}

export default function ClassLeaderboardFullscreen({ className: classTitle, board, stats, userId, onClose }: Props) {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-background flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <Trophy size={28} className="text-secondary" />
          <div>
            <h1 className="text-2xl font-black text-foreground">📚 {classTitle}</h1>
            <p className="text-sm text-muted-foreground">{stats.memberCount} {t("lb.statMembers")}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-3 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
        >
          <Minimize2 size={22} />
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-4 px-8 py-4 border-b border-border bg-muted/30">
        <div className="text-center">
          <p className="text-3xl font-black text-primary">{stats.avgMastery}%</p>
          <p className="text-xs text-muted-foreground">{t("lb.statAvgHifz")}</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-black text-secondary">{stats.avgStreak} 🔥</p>
          <p className="text-xs text-muted-foreground">{t("lb.statAvgStreak")}</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-black text-foreground">{stats.totalSessions}</p>
          <p className="text-xs text-muted-foreground">{t("lb.statTotalSessions")}</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-black text-foreground">{stats.memberCount}</p>
          <p className="text-xs text-muted-foreground">{t("lb.statMembers")}</p>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-y-auto px-8 py-4">
        <div className="max-w-4xl mx-auto space-y-3">
          {board.map((entry, i) => {
            const rank = i + 1;
            const isMe = !!userId && entry.user_id === userId;
            const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(rank * 0.05, 1) }}
                className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                  isMe
                    ? "bg-primary/10 border-2 border-primary ring-2 ring-primary/20 scale-[1.02]"
                    : rank <= 3
                    ? "bg-primary/5 border border-primary/10"
                    : "bg-card border border-border"
                }`}
              >
                <div className="w-12 text-center">
                  {medal ? (
                    <span className="text-3xl">{medal}</span>
                  ) : (
                    <span className="text-lg font-black text-muted-foreground">#{rank}</span>
                  )}
                </div>
                <span className="text-4xl">{entry.avatar_emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold text-foreground truncate">
                    {entry.display_name}
                    {isMe && <span className="text-sm text-primary ml-2">← toi</span>}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {entry.xp_total} XP · {Number(entry.mastery_score).toFixed(0)}% Hifz
                  </p>
                </div>
                <LigueBadge ligue={entry.ligue as Ligue} size="lg" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
