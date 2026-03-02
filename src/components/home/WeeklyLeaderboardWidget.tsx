import { useEffect, useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
      // Get family members
      const { data: familyLinks } = await supabase
        .from("family_members")
        .select("family_id, user_id")
        .eq("user_id", user!.id);

      // Get classroom members
      const { data: classLinks } = await supabase
        .from("classroom_members")
        .select("classroom_id, user_id")
        .eq("user_id", user!.id);

      const peerIds = new Set<string>();
      peerIds.add(user!.id);

      // Fetch all family peers
      if (familyLinks && familyLinks.length > 0) {
        const familyIds = familyLinks.map((f) => f.family_id);
        const { data: familyPeers } = await supabase
          .from("family_members")
          .select("user_id")
          .in("family_id", familyIds);
        familyPeers?.forEach((p) => peerIds.add(p.user_id));
      }

      // Fetch all class peers
      if (classLinks && classLinks.length > 0) {
        const classIds = classLinks.map((c) => c.classroom_id);
        const { data: classPeers } = await supabase
          .from("classroom_members")
          .select("user_id")
          .in("classroom_id", classIds);
        classPeers?.forEach((p) => peerIds.add(p.user_id));
      }

      if (peerIds.size <= 1) return;

      // Get profiles + XP for peers
      const ids = Array.from(peerIds);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_emoji, xp_total")
        .in("user_id", ids)
        .order("xp_total", { ascending: false })
        .limit(5);

      if (profiles && profiles.length > 0) {
        setEntries(profiles);

        // Find rival message
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
  }, [user, t]);

  if (entries.length <= 1) return null;

  return (
    <div className="px-5 mt-4">
      <button
        onClick={() => navigate("/leaderboard")}
        className="w-full rounded-2xl bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20 p-4 shadow-sm active:scale-[0.98] transition-transform text-left"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-primary" />
            <span className="text-sm font-bold text-foreground">{t("leaderboard.weeklyTitle" as any)}</span>
          </div>
          <ChevronRight size={14} className="text-muted-foreground" />
        </div>

        {/* Rival alert */}
        {rivalMessage && (
          <p className="text-xs text-destructive font-semibold mb-2 animate-pulse">
            🔥 {rivalMessage}
          </p>
        )}

        {/* Top 3 */}
        <div className="space-y-1.5">
          {entries.slice(0, 3).map((entry, i) => (
            <div
              key={entry.user_id}
              className={`flex items-center gap-2 rounded-xl px-3 py-1.5 ${
                entry.user_id === user?.id ? "bg-primary/10 border border-primary/20" : ""
              }`}
            >
              <span className="text-xs font-bold text-muted-foreground w-5">
                {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
              </span>
              <span className="text-sm">{entry.avatar_emoji}</span>
              <span className="text-xs font-medium text-foreground flex-1 truncate">
                {entry.display_name}
                {entry.user_id === user?.id && (
                  <span className="text-muted-foreground ml-1">({t("leaderboard.you" as any)})</span>
                )}
              </span>
              <span className="text-xs font-bold text-primary">{entry.xp_total} XP</span>
            </div>
          ))}
        </div>
      </button>
    </div>
  );
}
