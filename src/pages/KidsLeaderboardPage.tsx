import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, Star, GraduationCap, Globe, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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

interface ClassOption {
  id: string;
  name: string;
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
  const [countryFilter, setCountryFilter] = useState<string | null>(null);
  const [classFilter, setClassFilter] = useState<string | null>(null);
  const [classOptions, setClassOptions] = useState<ClassOption[]>([]);
  const [classChildIds, setClassChildIds] = useState<Set<string> | null>(null);

  const activeChildId = localStorage.getItem("taaloum_active_child_id");

  // Fetch classrooms the user is associated with
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: teacherClasses } = await supabase
        .from("classrooms")
        .select("id, name")
        .eq("teacher_id", user.id);

      const { data: memberRows } = await supabase
        .from("classroom_members")
        .select("classroom_id")
        .eq("user_id", user.id);

      const memberClassIds = (memberRows || []).map((m: any) => m.classroom_id);
      let parentClasses: ClassOption[] = [];
      if (memberClassIds.length > 0) {
        const { data } = await supabase
          .from("classrooms")
          .select("id, name")
          .in("id", memberClassIds);
        parentClasses = (data || []) as ClassOption[];
      }

      const all = [...(teacherClasses || []), ...parentClasses] as ClassOption[];
      const unique = Array.from(new Map(all.map(c => [c.id, c])).values());
      setClassOptions(unique);
    })();
  }, [user]);

  // When class filter changes, fetch child IDs in that class
  useEffect(() => {
    if (!classFilter) {
      setClassChildIds(null);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("class_invitations")
        .select("child_profile_id")
        .eq("classroom_id", classFilter)
        .eq("status", "child_created")
        .not("child_profile_id", "is", null);
      const ids = new Set((data || []).map((d: any) => d.child_profile_id).filter(Boolean));
      setClassChildIds(ids);
    })();
  }, [classFilter]);

  // Fetch all children profiles for leaderboard
  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("children_profiles")
        .select("id, name, avatar_emoji, country_code, age, total_points, parent_id")
        .order("total_points", { ascending: false })
        .limit(200);
      const profiles = (data as LeaderboardEntry[]) || [];

      // Fetch badges
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

  // Unique countries for filter
  const countries = useMemo(() => {
    const set = new Set<string>();
    entries.forEach(e => { if (e.country_code) set.add(e.country_code); });
    return Array.from(set).sort();
  }, [entries]);

  // My children count
  const myChildrenCount = useMemo(() => {
    if (!user) return 0;
    return entries.filter(e => e.parent_id === user.id).length;
  }, [entries, user]);

  // Apply filters
  let filtered = entries;
  if (showMineOnly && user) {
    filtered = filtered.filter(e => e.parent_id === user.id);
  }
  if (ageFilter) {
    const af = AGE_FILTERS.find(a => a.label === ageFilter);
    if (af) filtered = filtered.filter(e => e.age && e.age >= af.min && e.age <= af.max);
  }
  if (countryFilter) {
    filtered = filtered.filter(e => e.country_code === countryFilter);
  }
  if (classFilter && classChildIds) {
    filtered = filtered.filter(e => classChildIds.has(e.id));
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

      {/* Stats bar */}
      <div className="px-4 mb-3 flex gap-2">
        <div className="flex-1 bg-card border border-border rounded-xl p-2.5 text-center">
          <p className="text-lg font-bold text-foreground">{entries.length}</p>
          <p className="text-[10px] text-muted-foreground">{t("kids.totalParticipants" as any) || "Participants"}</p>
        </div>
        {myChildrenCount > 0 && (
          <div className="flex-1 bg-primary/10 border border-primary/20 rounded-xl p-2.5 text-center">
            <p className="text-lg font-bold text-primary">{myChildrenCount}</p>
            <p className="text-[10px] text-primary/70">{t("kids.myChildren" as any) || "Mes enfants"}</p>
          </div>
        )}
        {activeChildId && activeChildRank >= 0 && (
          <div className="flex-1 bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 text-center">
            <p className="text-lg font-bold text-amber-600">#{activeChildRank + 1}</p>
            <p className="text-[10px] text-amber-600/70">{t("kids.yourRank" as any) || "Position"}</p>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="px-4 mb-3 space-y-2">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {myChildrenCount > 0 && (
            <button
              onClick={() => setShowMineOnly(!showMineOnly)}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1 ${
                showMineOnly ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border"
              }`}
            >
              <Users size={12} />
              {t("kids.myChildren" as any) || "Mes enfants"}
            </button>
          )}
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

        {/* Country filter */}
        {countries.length > 1 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <Globe size={14} className="text-muted-foreground shrink-0 mt-1" />
            {countries.map(cc => (
              <button
                key={cc}
                onClick={() => setCountryFilter(countryFilter === cc ? null : cc)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  countryFilter === cc ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border"
                }`}
              >
                {getFlagEmoji(cc)} {cc}
              </button>
            ))}
          </div>
        )}

        {/* Class filter */}
        {classOptions.length > 0 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <GraduationCap size={14} className="text-muted-foreground shrink-0 mt-1" />
            {classOptions.map(cls => (
              <button
                key={cls.id}
                onClick={() => setClassFilter(classFilter === cls.id ? null : cls.id)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  classFilter === cls.id ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border"
                }`}
              >
                🎓 {cls.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><span className="animate-spin text-2xl">⏳</span></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12">
          <span className="text-5xl">🏆</span>
          <p className="text-sm text-muted-foreground">{t("kids.noEntries" as any) || "Aucun participant"}</p>
          {myChildrenCount === 0 && user && (
            <p className="text-xs text-muted-foreground text-center max-w-xs">
              {t("kids.addChildToJoin" as any) || "Ajoutez un enfant en mode Parent pour rejoindre le classement !"}
            </p>
          )}
        </div>
      ) : (
        <div className="px-4 space-y-2">
          {/* Top 3 podium */}
          {filtered.length >= 3 && (
            <div className="flex items-end justify-center gap-3 mb-4 pt-4">
              <PodiumCard entry={filtered[1]} rank={2} isOwn={user ? filtered[1].parent_id === user.id : false} />
              <PodiumCard entry={filtered[0]} rank={1} isOwn={user ? filtered[0].parent_id === user.id : false} />
              <PodiumCard entry={filtered[2]} rank={3} isOwn={user ? filtered[2].parent_id === user.id : false} />
            </div>
          )}

          {/* Rest of list */}
          {filtered.slice(filtered.length >= 3 ? 3 : 0).map((entry, i) => {
            const rank = (filtered.length >= 3 ? 3 : 0) + i + 1;
            const isActive = entry.id === activeChildId;
            const isOwn = user ? entry.parent_id === user.id : false;
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className={`flex items-center gap-3 py-3 px-4 rounded-2xl border transition-all ${
                  isActive
                    ? "bg-primary/10 border-primary/30 shadow-sm"
                    : isOwn
                      ? "bg-accent/30 border-accent/40"
                      : "bg-card border-border"
                }`}
              >
                <span className="text-sm font-bold text-muted-foreground w-7 text-center">{rank}</span>
                <span className="text-2xl w-10 h-10 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center shrink-0">
                  {entry.avatar_emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className={`text-sm font-semibold truncate ${isActive ? "text-primary" : "text-foreground"}`}>{entry.name}</p>
                    {isOwn && <span className="text-[9px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-bold shrink-0">👶</span>}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    {entry.country_code && <span>{getFlagEmoji(entry.country_code)}</span>}
                    {entry.age && <span>{entry.age} {t("profile.yearsOld" as any) || "ans"}</span>}
                  </div>
                  {entry.badges && entry.badges.length > 0 && (
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {entry.badges.slice(0, 5).map((b, bi) => (
                        <span key={bi} className="text-[10px]">{b.icon}</span>
                      ))}
                      {entry.badges.length > 5 && <span className="text-[9px] text-muted-foreground">+{entry.badges.length - 5}</span>}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                  <Star size={14} fill="currentColor" />
                  {entry.total_points}
                </div>
              </motion.div>
            );
          })}

          {/* Show active child position if scrolled past */}
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

function PodiumCard({ entry, rank, isOwn }: { entry: LeaderboardEntry; rank: number; isOwn: boolean }) {
  const { t } = useLanguage();
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
      } flex items-center justify-center mb-1 relative`}>
        {entry.avatar_emoji}
        {isOwn && (
          <span className="absolute -bottom-1 -right-1 text-[10px] bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center">👶</span>
        )}
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
