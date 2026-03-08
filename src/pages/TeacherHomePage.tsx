import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Users, BookOpen, ChevronRight, MessageSquare, Trophy, BarChart3, CalendarCheck, Mail, Flame } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface TeacherClass {
  id: string;
  name: string;
  join_code: string;
  memberCount?: number;
}

interface StudentQuick {
  userId: string;
  displayName: string;
  avatarEmoji: string;
  xpTotal: number;
  pendingTasks: number;
  streakDays: number;
  quranMinutes: number;
}

interface Alert {
  id: string;
  type: "homework" | "streak" | "halaqa";
  message: string;
}

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

export default function TeacherHomePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();

  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [topStudents, setTopStudents] = useState<StudentQuick[]>([]);
  const [pendingSubmissions, setPendingSubmissions] = useState(0);
  const [activeAssignments, setActiveAssignments] = useState(0);
  const [pendingInvitations, setPendingInvitations] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        const { data: classData } = await supabase
          .from("classrooms")
          .select("id, name, join_code")
          .eq("teacher_id", user.id);
        const classList = (classData || []) as TeacherClass[];

        if (classList.length > 0) {
          const classIds = classList.map(c => c.id);

          const [membersRes, submissionsRes, assignmentsRes, invitationsRes, messagesRes] = await Promise.all([
            supabase.from("classroom_members").select("classroom_id, user_id").in("classroom_id", classIds),
            supabase.from("task_submissions").select("*", { count: "exact", head: true }).in("class_id", classIds).eq("status", "pending"),
            supabase.from("class_assignments").select("*", { count: "exact", head: true }).in("class_id", classIds).eq("is_active", true),
            supabase.from("class_invitations").select("*", { count: "exact", head: true }).in("classroom_id", classIds).eq("status", "pending"),
            supabase.from("teacher_parent_messages").select("*", { count: "exact", head: true }).eq("receiver_id", user.id).eq("is_read", false),
          ]);

          setPendingSubmissions(submissionsRes.count || 0);
          setActiveAssignments(assignmentsRes.count || 0);
          setPendingInvitations(invitationsRes.count || 0);
          setUnreadMessages(messagesRes.count || 0);

          const members = membersRes.data || [];
          const countMap = new Map<string, number>();
          members.forEach(m => {
            countMap.set(m.classroom_id, (countMap.get(m.classroom_id) || 0) + 1);
          });
          classList.forEach(c => { c.memberCount = countMap.get(c.id) || 0; });

          const allMemberIds = [...new Set(members.map(m => m.user_id))];
          if (allMemberIds.length > 0) {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const dateStr = sevenDaysAgo.toISOString().split("T")[0];

            const [profilesRes, tasksRes, progressRes, activityRes] = await Promise.all([
              supabase.from("profiles").select("user_id, display_name, avatar_emoji, xp_total").in("user_id", allMemberIds).order("xp_total", { ascending: false }).limit(5),
              supabase.from("student_tasks").select("student_id").in("class_id", classIds).eq("status", "pending"),
              supabase.from("user_progress").select("user_id, streak_days").in("user_id", allMemberIds),
              supabase.from("quran_daily_activity").select("user_id, minutes_quran").in("user_id", allMemberIds).gte("activity_date", dateStr),
            ]);

            const taskCountMap = new Map<string, number>();
            (tasksRes.data || []).forEach(t => {
              taskCountMap.set(t.student_id, (taskCountMap.get(t.student_id) || 0) + 1);
            });

            const streakMap = new Map<string, number>();
            (progressRes.data || []).forEach(p => { streakMap.set(p.user_id, p.streak_days); });

            const minutesMap = new Map<string, number>();
            (activityRes.data || []).forEach(a => {
              minutesMap.set(a.user_id, (minutesMap.get(a.user_id) || 0) + a.minutes_quran);
            });

            setTopStudents((profilesRes.data || []).map(p => ({
              userId: p.user_id,
              displayName: p.display_name,
              avatarEmoji: p.avatar_emoji,
              xpTotal: p.xp_total,
              pendingTasks: taskCountMap.get(p.user_id) || 0,
              streakDays: streakMap.get(p.user_id) || 0,
              quranMinutes: minutesMap.get(p.user_id) || 0,
            })));
          }
        }

        setClasses(classList);
      } catch (err) {
        console.error("TeacherHome load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const totalStudents = useMemo(() => classes.reduce((s, c) => s + (c.memberCount || 0), 0), [classes]);
  const avgXp = useMemo(() => topStudents.length ? Math.round(topStudents.reduce((s, st) => s + st.xpTotal, 0) / topStudents.length) : 0, [topStudents]);
  const activeStreaks = useMemo(() => topStudents.filter(s => s.streakDays > 0).length, [topStudents]);
  const avgQuranMin = useMemo(() => topStudents.length ? Math.round(topStudents.reduce((s, st) => s + st.quranMinutes, 0) / topStudents.length) : 0, [topStudents]);

  const alerts = useMemo<Alert[]>(() => {
    const a: Alert[] = [];
    if (pendingSubmissions > 0) {
      a.push({ id: "hw", type: "homework", message: `${pendingSubmissions} ${t("teacherHome.submissionsToReview" as any)}` });
    }
    const lostStreak = topStudents.filter(s => s.streakDays === 0);
    if (lostStreak.length > 0) {
      a.push({ id: "streak", type: "streak", message: `${lostStreak.length} ${t("teacherHome.studentsLostStreak" as any)}` });
    }
    if (unreadMessages > 0) {
      a.push({ id: "msg", type: "halaqa", message: `${unreadMessages} ${t("teacherHome.messages" as any)}` });
    }
    return a;
  }, [pendingSubmissions, topStudents, unreadMessages, t]);

  if (authLoading || loading) {
    return (
      <div className={`${cosmicBg} flex items-center justify-center min-h-screen`}>
        <span className="animate-spin text-3xl">⏳</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`${cosmicBg} min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center`}>
        <NeonGrid />
        <GraduationCap size={48} className="text-white/40 relative z-10" />
        <p className="text-lg font-semibold text-white relative z-10">{t("teacher.loginRequired" as any)}</p>
        <button onClick={() => navigate("/auth")} className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-semibold relative z-10">
          {t("more.loginProfile" as any)}
        </button>
      </div>
    );
  }

  const MEDAL_COLORS = [
    "from-yellow-400 to-amber-500",
    "from-gray-300 to-gray-400",
    "from-amber-600 to-orange-500",
  ];

  const STATS = [
    { emoji: "👨‍🎓", value: totalStudents, label: t("teacherHome.students" as any) },
    { emoji: "📝", value: pendingSubmissions, label: t("teacherHome.toCorrect" as any) },
    { emoji: "📚", value: classes.length, label: t("teacherHome.classes" as any) },
    { emoji: "⭐", value: avgXp, label: t("teacherHome.avgXp" as any) },
    { emoji: "🔥", value: activeStreaks, label: t("teacherHome.activeStreaks" as any) },
    { emoji: "🕌", value: `${avgQuranMin}m`, label: t("teacherHome.quranMinutes7d" as any) },
  ];

  const QUICK_ACTIONS = [
    { emoji: "📝", label: t("teacherHome.correctHomework" as any), href: "/teacher-dashboard", badge: pendingSubmissions },
    { emoji: "➕", label: t("teacherHome.newClass" as any), href: "/classrooms", badge: 0 },
    { emoji: "📣", label: t("teacherHome.announce" as any), href: "/announcements", badge: 0 },
    { emoji: "💬", label: t("teacherHome.messages" as any), href: "/teacher-dashboard", badge: unreadMessages },
    { emoji: "📊", label: t("teacherHome.studentStats" as any), href: "/teacher-dashboard", badge: 0 },
    { emoji: "🏆", label: t("teacherHome.leaderboard" as any), href: "/leaderboard", badge: 0 },
  ];

  const TOOLS = [
    { emoji: "✉️", label: t("teacherHome.invitations" as any), href: "/teacher-dashboard", badge: pendingInvitations },
    { emoji: "📋", label: t("teacherHome.assignments" as any), href: "/teacher-dashboard", badge: activeAssignments },
    { emoji: "🎯", label: t("teacherHome.weeklyChallenge" as any), href: "/teacher-dashboard", badge: 0 },
  ];

  const glass = "bg-white/[0.07] backdrop-blur-md border border-white/15";

  return (
    <div className={`${cosmicBg} min-h-screen pb-24`}>
      <NeonGrid />

      {/* Header */}
      <div className="px-5 pt-6 pb-3 relative z-10">
        <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
          <GraduationCap size={22} className="text-cyan-400" />
          {t("teacherHome.greeting" as any)}
        </h1>
        <p className="text-xs text-white/60 mt-0.5">
          {totalStudents} {t("teacherHome.studentsTotal" as any)} · {classes.length} {t("teacherHome.classes" as any)}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2.5 px-4 mb-4 relative z-10">
        {STATS.map((stat, i) => (
          <div
            key={i}
            className={`${glass} rounded-2xl p-2.5 text-center`}
          >
            <span className="text-xl">{stat.emoji}</span>
            <p className="text-base font-bold text-white mt-0.5">{stat.value}</p>
            <p className="text-[9px] text-white/50 font-medium leading-tight">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Urgent Alerts */}
      {alerts.length > 0 && (
        <div className="mx-4 mb-4 bg-red-500/15 border-2 border-red-400/30 rounded-2xl p-3 relative z-10">
          <h3 className="text-sm font-bold text-red-400 flex items-center gap-2 mb-2">
            🚨 {alerts.length} {t("teacherHome.urgentActions" as any)}
          </h3>
          <div className="space-y-2">
            {alerts.map(alert => (
              <button
                key={alert.id}
                onClick={() => navigate("/teacher-dashboard")}
                className={`w-full flex items-center justify-between p-2.5 ${glass} rounded-xl text-left`}
              >
                <span className="text-xs text-white/90">{alert.message}</span>
                <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">
                  {t("teacherHome.act" as any)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Top Students */}
      {topStudents.length > 0 && (
        <div className={`mx-4 mb-4 ${glass} rounded-2xl p-4 relative z-10`}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              🏆 {t("teacherHome.topStudents" as any)}
            </h2>
            <button onClick={() => navigate("/teacher-dashboard")} className="text-[10px] text-cyan-400 font-semibold">
              {t("teacherHome.viewAll" as any)} →
            </button>
          </div>
          <div className="space-y-2">
            {topStudents.slice(0, 3).map((student, i) => (
              <div
                key={student.userId}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${MEDAL_COLORS[i] || "from-white/10 to-white/5"} flex items-center justify-center text-xs font-bold text-white shadow-sm`}>
                    {i + 1}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-white">
                      {student.avatarEmoji} {student.displayName}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] text-white/50">
                      {student.streakDays > 0 && <span>🔥{student.streakDays}j</span>}
                      {student.quranMinutes > 0 && <span>🕌{student.quranMinutes}m</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-cyan-400">⭐{student.xpTotal}</span>
                  {student.pendingTasks > 0 && (
                    <p className="text-[10px] text-white/40">{student.pendingTasks} 📝</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Classes */}
      <div className="mx-4 mb-4 relative z-10">
        <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
          📅 {t("teacherHome.myClasses" as any)}
        </h2>
        <div className="space-y-2">
          {classes.map((c) => (
            <button
              key={c.id}
              onClick={() => navigate(`/classrooms/${c.id}`)}
              className={`w-full flex items-center justify-between p-4 ${glass} rounded-2xl hover:bg-white/10 transition-all active:scale-[0.98]`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 flex items-center justify-center">
                  <BookOpen size={18} className="text-cyan-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-white">{c.name}</p>
                  <p className="text-[10px] text-white/50 flex items-center gap-1">
                    <Users size={10} /> {c.memberCount || 0} {t("teacherHome.students" as any)}
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className="text-white/30" />
            </button>
          ))}

          {classes.length === 0 && (
            <div className="text-center py-8">
              <GraduationCap size={36} className="mx-auto text-white/30 mb-2" />
              <p className="text-sm text-white/50">{t("teacher.noClasses" as any)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mx-4 mb-4 relative z-10">
        <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
          ✨ {t("teacherHome.quickActions" as any)}
        </h2>
        <div className="grid grid-cols-3 gap-2.5">
          {QUICK_ACTIONS.map((action, i) => (
            <button
              key={i}
              onClick={() => navigate(action.href)}
              className={`relative flex flex-col items-center gap-1.5 p-3 ${glass} rounded-2xl hover:bg-white/10 transition-colors active:scale-[0.96]`}
            >
              {action.badge > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full px-1">
                  {action.badge}
                </span>
              )}
              <span className="text-xl">{action.emoji}</span>
              <span className="text-[9px] font-bold text-white/80 text-center leading-tight">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Teacher Tools */}
      <div className="mx-4 mb-4 relative z-10">
        <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
          🛠️ {t("teacherHome.toolsTitle" as any)}
        </h2>
        <div className="grid grid-cols-3 gap-2.5">
          {TOOLS.map((tool, i) => (
            <button
              key={i}
              onClick={() => navigate(tool.href)}
              className={`relative flex flex-col items-center gap-1.5 p-3 ${glass} rounded-2xl hover:bg-white/10 transition-colors active:scale-[0.96]`}
            >
              {tool.badge > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center bg-cyan-500 text-white text-[9px] font-bold rounded-full px-1">
                  {tool.badge}
                </span>
              )}
              <span className="text-xl">{tool.emoji}</span>
              <span className="text-[9px] font-bold text-white/80 text-center leading-tight">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
