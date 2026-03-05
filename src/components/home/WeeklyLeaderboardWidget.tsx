import { useEffect, useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  avatar_emoji: string;
  xp_total: number;
}

export default function WeeklyLeaderboardWidget() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [rivalMessage, setRivalMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    async function loadLeaderboard() {
      const { data: familyLinks } = await supabase
        .from("family_members")
        .select("family_id, user_id")
        .eq("user_id", user!.id);

      const { data: classLinks } = await supabase
        .from("classroom_members")
        .select("classroom_id, user_id")
        .eq("user_id", user!.id);

      const peerIds = new Set<string>();
      peerIds.add(user!.id);

      if (familyLinks && familyLinks.length > 0) {
        const familyIds = familyLinks.map((f) => f.family_id);
        const { data: familyPeers } = await supabase
          .from("family_members")
          .select("user_id")
          .in("family_id", familyIds);
        familyPeers?.forEach((p) => peerIds.add(p.user_id));
      }

      if (classLinks && classLinks.length > 0) {
        const classIds = classLinks.map((c) => c.classroom_id);
        const { data: classPeers } = await supabase
          .from("classroom_members")
          .select("user_id")
          .in("classroom_id", classIds);
        classPeers?.forEach((p) => peerIds.add(p.user_id));
      }

      if (peerIds.size <= 1) return;

      const ids = Array.from(peerIds);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_emoji, xp_total")
        .in("user_id", ids)
        .order("xp_total", { ascending: false })
        .limit(5);

      if (profiles && profiles.length > 0) {
        setEntries(profiles);

        const myIndex = profiles.findIndex((p) => p.user_id === user!.id);
        if (myIndex > 0) {
          const ahead = profiles[myIndex - 1];
          const gap = ahead.xp_total - (profiles[myIndex]?.xp_total ?? 0);
          if (gap > 0 && gap < 200) {
            setRivalMessage(
              t("leaderboard.rivalClose" as any)
                .replace("{name}", ahead.display_name)
                .replace("{gap}", String(gap))
            );
          }
        }
      }
    }

    loadLeaderboard();

    // Auto-refresh every 15s + on tab focus
    const interval = setInterval(loadLeaderboard, 15000);
    const onVisible = () => {
      if (document.visibilityState === "visible") loadLeaderboard();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [user, t]);

  if (entries.length <= 1) return null;

  return (
    <div className="px-5 mt-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full rounded-3xl bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 
                   border border-primary/20 p-6 shadow-2xl hover:shadow-primary/20 
                   active:scale-[0.98] transition-all duration-300 hover:-translate-y-1 cursor-pointer"
        onClick={() => navigate("/leaderboard")}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg text-xl">
            🏆
          </div>
          <div>
            <h3 className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t("leaderboard.weeklyTitle" as any)}
            </h3>
            <p className="text-xs text-muted-foreground">{t("leaderboard.familyClassRank" as any)}</p>
          </div>
        </div>

        {/* Rival alert */}
        {rivalMessage && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-4 p-3 bg-gradient-to-r from-destructive/15 to-destructive/5 border border-destructive/20 rounded-2xl shadow-md"
          >
            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
              🔥 {rivalMessage}
            </p>
          </motion.div>
        )}

        {/* Top 3 */}
        <div className="space-y-2">
          {entries.slice(0, 3).map((entry, i) => (
            <motion.div
              key={entry.user_id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3 p-3 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 hover:bg-card/70 transition-all"
            >
              <div className="w-8 h-8 flex items-center justify-center font-bold text-lg rounded-lg bg-gradient-to-r from-muted to-accent/30">
                {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
              </div>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shadow-md text-sm">
                  {entry.avatar_emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate text-foreground">{entry.display_name}</p>
                  {entry.user_id === user?.id && (
                    <p className="text-xs text-primary font-medium">({t("leaderboard.you" as any)})</p>
                  )}
                </div>
              </div>
              <div className="font-mono font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {entry.xp_total.toLocaleString()} XP
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
