import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Users, BookOpen, GraduationCap, Plus, ChevronRight, TrendingUp } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

function NeonGrid() {
  return (
    <div
      className="pointer-events-none fixed inset-0 opacity-[0.04] z-0"
      style={{
        backgroundImage:
          "linear-gradient(hsl(0 0% 100% / 0.1) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100% / 0.1) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    />
  );
}

const cosmicBg = "bg-gradient-to-b from-[hsl(260,50%,12%)] via-[hsl(240,40%,18%)] to-[hsl(220,35%,10%)]";
const glass = "bg-white/[0.07] backdrop-blur-md border border-white/15";

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
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "moderator")
        .maybeSingle();
      setIsCoordinator(!!roleData);
      if (!roleData) { setLoading(false); return; }

      const { data: classrooms } = await supabase
        .from("classrooms")
        .select("id, name, join_code, teacher_id")
        .order("created_at", { ascending: false });

      if (!classrooms || classrooms.length === 0) { setHalaqas([]); setLoading(false); return; }

      const teacherIds = [...new Set(classrooms.map(c => c.teacher_id))];
      const { data: teacherProfiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_emoji")
        .in("user_id", teacherIds);
      const teacherMap = new Map((teacherProfiles || []).map(p => [p.user_id, p]));

      const classIds = classrooms.map(c => c.id);
      const { data: members } = await supabase
        .from("classroom_members")
        .select("classroom_id, user_id")
        .in("classroom_id", classIds);

      const studentIds = [...new Set((members || []).map(m => m.user_id))];
      const { data: studentProfiles } = studentIds.length > 0
        ? await supabase.from("profiles").select("user_id, xp_total").in("user_id", studentIds)
        : { data: [] };
      const studentXpMap = new Map((studentProfiles || []).map(p => [p.user_id, p.xp_total]));

      const { data: progressData } = studentIds.length > 0
        ? await supabase.from("user_progress").select("user_id, streak_days").in("user_id", studentIds)
        : { data: [] };
      const streakMap = new Map((progressData || []).map(p => [p.user_id, p.streak_days]));

      const { data: assignments } = await supabase
        .from("class_assignments")
        .select("class_id")
        .in("class_id", classIds)
        .eq("is_active", true);

      const assignCountMap = new Map<string, number>();
      for (const a of assignments || []) {
        assignCountMap.set(a.class_id, (assignCountMap.get(a.class_id) || 0) + 1);
      }

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
    return <div className={`${cosmicBg} flex items-center justify-center min-h-screen`}><span className="animate-spin text-2xl">⏳</span></div>;
  }

  if (!user) {
    return (
      <div className={`${cosmicBg} min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center`}>
        <NeonGrid />
        <Shield size={48} className="text-white/40 relative z-10" />
        <p className="text-lg font-semibold text-white relative z-10">{t("coord.loginRequired" as any)}</p>
        <button onClick={() => navigate("/auth")} className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-semibold relative z-10">
          {t("more.loginProfile" as any)}
        </button>
      </div>
    );
  }

  if (!isCoordinator) {
    return (
      <div className={`${cosmicBg} min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center`}>
        <NeonGrid />
        <Shield size={48} className="text-red-400/60 relative z-10" />
        <p className="text-lg font-semibold text-white relative z-10">{t("coord.accessDenied" as any)}</p>
        <p className="text-sm text-white/50 relative z-10">{t("coord.accessDeniedDesc" as any)}</p>
        <button onClick={() => navigate("/")} className="px-6 py-2 bg-white/10 text-white rounded-xl font-semibold text-sm relative z-10">
          {t("detail.back" as any)}
        </button>
      </div>
    );
  }

  return (
    <div className={`${cosmicBg} min-h-screen pb-24`}>
      <NeonGrid />

      {/* Header */}
      <div className="bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/5 px-4 pt-6 pb-4 relative z-10">
        <button onClick={() => navigate(-1)} className="text-xs text-white/50 mb-2">← {t("detail.back" as any)}</button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center">
            <Shield size={22} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">{t("coord.title" as any)}</h1>
            <p className="text-[11px] text-white/50">{halaqas.length} {t("coord.halaqas" as any)}</p>
          </div>
        </div>
      </div>

      {/* Global Stats */}
      <div className="px-4 py-3 grid grid-cols-2 gap-3 relative z-10">
        {[
          { icon: Users, label: t("coord.totalStudents" as any), value: globalStats.totalStudents, gradient: "from-blue-500/15 to-blue-600/5" },
          { icon: TrendingUp, label: t("coord.totalXp" as any), value: globalStats.totalXp.toLocaleString(), gradient: "from-amber-500/15 to-amber-600/5" },
          { icon: BookOpen, label: t("coord.avgStreak" as any), value: `🔥 ${globalStats.avgStreak}`, gradient: "from-orange-500/15 to-orange-600/5" },
          { icon: GraduationCap, label: t("coord.activeAssignments" as any), value: globalStats.totalAssignments, gradient: "from-emerald-500/15 to-emerald-600/5" },
        ].map((stat, i) => (
          <div
            key={i}
            className={`bg-gradient-to-br ${stat.gradient} backdrop-blur-sm rounded-2xl p-3 border border-white/10`}
          >
            <stat.icon size={16} className="text-white/40 mb-1" />
            <p className="text-xl font-bold text-white">{stat.value}</p>
            <p className="text-[10px] text-white/50">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Halaqas List */}
      <div className="px-4 space-y-3 relative z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">{t("coord.halaqasList" as any)}</h2>
          <button
            onClick={() => navigate("/classrooms")}
            className="flex items-center gap-1 text-xs text-cyan-400 font-semibold"
          >
            <Plus size={14} /> {t("coord.newHalaqa" as any)}
          </button>
        </div>

        {halaqas.length === 0 ? (
          <div className="text-center py-12 text-white/50 text-sm">
            {t("coord.noHalaqas" as any)}
          </div>
        ) : (
          halaqas.map((h) => (
            <div
              key={h.id}
              onClick={() => navigate(`/classrooms/${h.id}`, { state: { from: "coord" } })}
              className={`${glass} rounded-2xl p-4 cursor-pointer hover:bg-white/10 transition-all active:scale-[0.98]`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{h.teacherEmoji}</span>
                  <div>
                    <p className="font-semibold text-sm text-white">{h.name}</p>
                    <p className="text-[10px] text-white/50">
                      {t("coord.teacher" as any)}: {h.teacherName}
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-white/30" />
              </div>

              <div className="flex items-center gap-3 text-[10px] text-white/50">
                <span className="flex items-center gap-1">
                  <Users size={12} /> {h.studentCount} {t("coord.students" as any)}
                </span>
                <span>🔥 {h.avgStreak}j</span>
                <span>⭐ {h.totalXp.toLocaleString()} XP</span>
                <span>📋 {h.assignmentCount}</span>
              </div>

              <div className="mt-2">
                <p className="text-[9px] text-white/30 font-mono">
                  Code: {h.join_code}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
