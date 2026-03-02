import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, Star, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { RARITY_COLORS } from "@/data/achievementsData";

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar_emoji: string;
  country_code: string | null;
  age: number | null;
  total_points: number;
  parent_id: string;
  badges?: { icon: string; rarity: string }[];
}

const AGE_FILTERS = [
  { label: "3-6", min: 3, max: 6 },
  { label: "7-10", min: 7, max: 10 },
  { label: "11-14", min: 11, max: 14 },
  { label: "15-17", min: 15, max: 17 },
];

export default function KidsLeaderboardPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [ageFilter, setAgeFilter] = useState<string | null>(null);
  const [showMineOnly, setShowMineOnly] = useState(false);

  const activeChildId = localStorage.getItem("taaloum_active_child_id");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("children_profiles")
        .select("id, name, avatar_emoji, country_code, age, total_points, parent_id")
        .order("total_points", { ascending: false })
        .limit(100);
      const profiles = (data as LeaderboardEntry[]) || [];

      // Fetch badges for all children
      const childIds = profiles.map(p => p.id);
      if (childIds.length > 0) {
        const { data: badges } = await supabase
          .from("child_achievements" as any)
          .select("child_id, icon, rarity")
          .in("child_id", childIds);
        const badgeMap = new Map<string, { icon: string; rarity: string }[]>();
        ((badges as any[]) || []).forEach((b: any) => {
          const arr = badgeMap.get(b.child_id) || [];
          arr.push({ icon: b.icon, rarity: b.rarity });
          badgeMap.set(b.child_id, arr);
        });
        profiles.forEach(p => { p.badges = badgeMap.get(p.id) || []; });
      }

      setEntries(profiles);
      setLoading(false);
    })();
  }, []);

  let filtered = entries;
  if (showMineOnly && user) {
    filtered = filtered.filter(e => e.parent_id === user.id);
  }
  if (ageFilter) {
    const af = AGE_FILTERS.find(a => a.label === ageFilter);
    if (af) filtered = filtered.filter(e => e.age && e.age >= af.min && e.age <= af.max);
  }

  const activeChildRank = filtered.findIndex(e => e.id === activeChildId);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="flex items-center gap-3 p-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border shadow-sm">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <Trophy size={22} className="text-amber-500" />
        <h1 className="text-lg font-bold text-foreground">{t("kids.leaderboardTitle" as any) || "Classement des Champions"}</h1>
      </div>

      {/* Filters */}
      <div className="px-4 mb-3 space-y-2">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setShowMineOnly(!showMineOnly)}
            className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              showMineOnly ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border"
            }`}
          >
            {t("kids.myChildren" as any) || "Mes enfants"}
          </button>
          {AGE_FILTERS.map(af => (
            <button
              key={af.label}
              onClick={() => setAgeFilter(ageFilter === af.label ? null : af.label)}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                ageFilter === af.label ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border"
              }`}
            >
              {af.label} {t("profile.yearsOld" as any) || "ans"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><span className="animate-spin text-2xl">⏳</span></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12">
          <span className="text-5xl">🏆</span>
          <p className="text-sm text-muted-foreground">{t("kids.noEntries" as any) || "Aucun participant"}</p>
        </div>
      ) : (
        <div className="px-4 space-y-2">
          {/* Top 3 podium */}
          {filtered.length >= 3 && (
            <div className="flex items-end justify-center gap-3 mb-4 pt-4">
              <PodiumCard entry={filtered[1]} rank={2} />
              <PodiumCard entry={filtered[0]} rank={1} />
              <PodiumCard entry={filtered[2]} rank={3} />
            </div>
          )}

          {/* Rest of list */}
          {filtered.slice(filtered.length >= 3 ? 3 : 0).map((entry, i) => {
            const rank = (filtered.length >= 3 ? 3 : 0) + i + 1;
            const isActive = entry.id === activeChildId;
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className={`flex items-center gap-3 py-3 px-4 rounded-2xl border transition-all ${
                  isActive ? "bg-primary/10 border-primary/30 shadow-sm" : "bg-card border-border"
                }`}
              >
                <span className="text-sm font-bold text-muted-foreground w-7 text-center">{rank}</span>
                <span className="text-2xl w-10 h-10 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center shrink-0">
                  {entry.avatar_emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${isActive ? "text-primary" : "text-foreground"}`}>{entry.name}</p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    {entry.country_code && <span>{getFlagEmoji(entry.country_code)}</span>}
                    {entry.age && <span>{entry.age} {t("profile.yearsOld" as any) || "ans"}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                  <Star size={14} fill="currentColor" />
                  {entry.total_points}
                </div>
              </motion.div>
            );
          })}

          {/* Show active child position if not in top */}
          {activeChildId && activeChildRank >= 100 && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              {t("kids.yourRank" as any) || "Votre position"}: #{activeChildRank + 1}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PodiumCard({ entry, rank }: { entry: LeaderboardEntry; rank: number }) {
  const medals = ["🥇", "🥈", "🥉"];
  const sizes = rank === 1
    ? "w-20 h-20 text-4xl"
    : "w-16 h-16 text-3xl";
  const height = rank === 1 ? "pb-6" : "pb-2";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1 }}
      className={`flex flex-col items-center ${height}`}
    >
      <span className="text-2xl mb-1">{medals[rank - 1]}</span>
      <div className={`${sizes} rounded-full bg-gradient-to-br from-primary/20 to-accent/10 border-4 ${
        rank === 1 ? "border-amber-400" : rank === 2 ? "border-gray-400" : "border-orange-400"
      } flex items-center justify-center mb-1`}>
        {entry.avatar_emoji}
      </div>
      <p className="text-xs font-bold text-foreground truncate max-w-[80px]">{entry.name}</p>
      {entry.country_code && <span className="text-[10px]">{getFlagEmoji(entry.country_code)}</span>}
      <div className="flex items-center gap-0.5 text-amber-500 mt-0.5">
        <Star size={10} fill="currentColor" />
        <span className="text-[11px] font-bold">{entry.total_points}</span>
      </div>
    </motion.div>
  );
}

function getFlagEmoji(countryCode: string): string {
  const cc = countryCode.toUpperCase();
  return cc.replace(/./g, (c) => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65));
}
