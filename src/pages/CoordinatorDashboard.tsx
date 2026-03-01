import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Users, BookOpen, GraduationCap, Plus, ChevronRight, TrendingUp } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface HalaqaInfo {
  id: string;
  name: string;
  join_code: string;
  teacher_id: string;
  teacherName: string;
  teacherEmoji: string;
  studentCount: number;
  totalXp: number;
  avgStreak: number;
  assignmentCount: number;
}

export default function CoordinatorDashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();

  const [halaqas, setHalaqas] = useState<HalaqaInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCoordinator, setIsCoordinator] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      // Check if user is moderator (coordinator)
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "moderator")
        .maybeSingle();
      setIsCoordinator(!!roleData);
      if (!roleData) { setLoading(false); return; }

      // Fetch all classrooms
      const { data: classrooms } = await supabase
        .from("classrooms")
        .select("id, name, join_code, teacher_id")
        .order("created_at", { ascending: false });

      if (!classrooms || classrooms.length === 0) { setHalaqas([]); setLoading(false); return; }

      // Fetch teacher profiles
      const teacherIds = [...new Set(classrooms.map(c => c.teacher_id))];
      const { data: teacherProfiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_emoji")
        .in("user_id", teacherIds);
      const teacherMap = new Map((teacherProfiles || []).map(p => [p.user_id, p]));

      // Fetch all members
      const classIds = classrooms.map(c => c.id);
      const { data: members } = await supabase
        .from("classroom_members")
        .select("classroom_id, user_id")
        .in("classroom_id", classIds);

      // Fetch student profiles for XP
      const studentIds = [...new Set((members || []).map(m => m.user_id))];
      const { data: studentProfiles } = studentIds.length > 0
        ? await supabase.from("profiles").select("user_id, xp_total").in("user_id", studentIds)
        : { data: [] };
      const studentXpMap = new Map((studentProfiles || []).map(p => [p.user_id, p.xp_total]));

      // Fetch streaks
      const { data: progressData } = studentIds.length > 0
        ? await supabase.from("user_progress").select("user_id, streak_days").in("user_id", studentIds)
        : { data: [] };
      const streakMap = new Map((progressData || []).map(p => [p.user_id, p.streak_days]));

      // Fetch assignments count per class
      const { data: assignments } = await supabase
        .from("class_assignments")
        .select("class_id")
        .in("class_id", classIds)
        .eq("is_active", true);

      const assignCountMap = new Map<string, number>();
      for (const a of assignments || []) {
        assignCountMap.set(a.class_id, (assignCountMap.get(a.class_id) || 0) + 1);
      }

      // Build halaqa info
      const membersByClass = new Map<string, string[]>();
      for (const m of members || []) {
        const list = membersByClass.get(m.classroom_id) || [];
        list.push(m.user_id);
        membersByClass.set(m.classroom_id, list);
      }

      const result: HalaqaInfo[] = classrooms.map(c => {
        const teacher = teacherMap.get(c.teacher_id);
        const classMembers = membersByClass.get(c.id) || [];
        const totalXp = classMembers.reduce((sum, id) => sum + (studentXpMap.get(id) || 0), 0);
        const avgStreak = classMembers.length > 0
          ? Math.round(classMembers.reduce((sum, id) => sum + (streakMap.get(id) || 0), 0) / classMembers.length * 10) / 10
          : 0;
        return {
          id: c.id,
          name: c.name,
          join_code: c.join_code,
          teacher_id: c.teacher_id,
          teacherName: teacher?.display_name || "—",
          teacherEmoji: teacher?.avatar_emoji || "👨‍🏫",
          studentCount: classMembers.length,
          totalXp,
          avgStreak,
          assignmentCount: assignCountMap.get(c.id) || 0,
        };
      });

      setHalaqas(result);
      setLoading(false);
    })();
  }, [user]);

  const globalStats = useMemo(() => {
    const totalStudents = halaqas.reduce((s, h) => s + h.studentCount, 0);
    const totalXp = halaqas.reduce((s, h) => s + h.totalXp, 0);
    const avgStreak = halaqas.length > 0
      ? Math.round(halaqas.reduce((s, h) => s + h.avgStreak, 0) / halaqas.length * 10) / 10
      : 0;
    const totalAssignments = halaqas.reduce((s, h) => s + h.assignmentCount, 0);
    return { totalStudents, totalXp, avgStreak, totalAssignments };
  }, [halaqas]);

  if (authLoading || loading) {
    return <div className="flex items-center justify-center min-h-screen"><span className="animate-spin text-2xl">⏳</span></div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <Shield size={48} className="text-muted-foreground" />
        <p className="text-lg font-semibold">{t("coord.loginRequired" as any)}</p>
        <button onClick={() => navigate("/auth")} className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-semibold">
          {t("more.loginProfile" as any)}
        </button>
      </div>
    );
  }

  if (!isCoordinator) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <Shield size={48} className="text-destructive/60" />
        <p className="text-lg font-semibold">{t("coord.accessDenied" as any)}</p>
        <p className="text-sm text-muted-foreground">{t("coord.accessDeniedDesc" as any)}</p>
        <button onClick={() => navigate("/")} className="px-6 py-2 bg-muted text-foreground rounded-xl font-semibold text-sm">
          {t("detail.back" as any)}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent px-4 pt-6 pb-4">
        <button onClick={() => navigate(-1)} className="text-xs text-muted-foreground mb-2">← {t("detail.back" as any)}</button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Shield size={22} className="text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold">{t("coord.title" as any)}</h1>
            <p className="text-[11px] text-muted-foreground">{halaqas.length} {t("coord.halaqas" as any)}</p>
          </div>
        </div>
      </div>

      {/* Global Stats */}
      <div className="px-4 py-3 grid grid-cols-2 gap-3">
        {[
          { icon: Users, label: t("coord.totalStudents" as any), value: globalStats.totalStudents, gradient: "from-blue-500/20 to-blue-600/5" },
          { icon: TrendingUp, label: t("coord.totalXp" as any), value: globalStats.totalXp.toLocaleString(), gradient: "from-amber-500/20 to-amber-600/5" },
          { icon: BookOpen, label: t("coord.avgStreak" as any), value: `🔥 ${globalStats.avgStreak}`, gradient: "from-orange-500/20 to-orange-600/5" },
          { icon: GraduationCap, label: t("coord.activeAssignments" as any), value: globalStats.totalAssignments, gradient: "from-emerald-500/20 to-emerald-600/5" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`bg-gradient-to-br ${stat.gradient} backdrop-blur-sm rounded-2xl p-3 border border-border/40`}
          >
            <stat.icon size={16} className="text-muted-foreground mb-1" />
            <p className="text-xl font-bold">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Halaqas List */}
      <div className="px-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold">{t("coord.halaqasList" as any)}</h2>
          <button
            onClick={() => navigate("/classrooms")}
            className="flex items-center gap-1 text-xs text-primary font-semibold"
          >
            <Plus size={14} /> {t("coord.newHalaqa" as any)}
          </button>
        </div>

        {halaqas.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {t("coord.noHalaqas" as any)}
          </div>
        ) : (
          halaqas.map((h, i) => (
            <motion.div
              key={h.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => navigate(`/classrooms/${h.id}`)}
              className="bg-card/80 backdrop-blur-sm rounded-2xl p-4 border border-border/40 cursor-pointer hover:border-primary/30 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{h.teacherEmoji}</span>
                  <div>
                    <p className="font-semibold text-sm">{h.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {t("coord.teacher" as any)}: {h.teacherName}
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-muted-foreground" />
              </div>

              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users size={12} /> {h.studentCount} {t("coord.students" as any)}
                </span>
                <span>🔥 {h.avgStreak}j</span>
                <span>⭐ {h.totalXp.toLocaleString()} XP</span>
                <span>📋 {h.assignmentCount}</span>
              </div>

              <div className="mt-2">
                <p className="text-[9px] text-muted-foreground font-mono">
                  Code: {h.join_code}
                </p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
