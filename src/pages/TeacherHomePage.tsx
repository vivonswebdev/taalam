import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Users, BookOpen, ClipboardCheck, ChevronRight, Plus } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import PageBackground from "@/components/PageBackground";

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
}

interface Alert {
  id: string;
  type: "homework" | "streak" | "halaqa";
  message: string;
  action?: string;
}

export default function TeacherHomePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();

  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [topStudents, setTopStudents] = useState<StudentQuick[]>([]);
  const [pendingSubmissions, setPendingSubmissions] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        // Fetch classes
        const { data: classData } = await supabase
          .from("classrooms")
          .select("id, name, join_code")
          .eq("teacher_id", user.id);
        const classList = (classData || []) as TeacherClass[];

        // Fetch member counts
        if (classList.length > 0) {
          const classIds = classList.map(c => c.id);
          const { data: members } = await supabase
            .from("classroom_members")
            .select("classroom_id, user_id")
            .in("classroom_id", classIds);

          const countMap = new Map<string, number>();
          (members || []).forEach(m => {
            countMap.set(m.classroom_id, (countMap.get(m.classroom_id) || 0) + 1);
          });
          classList.forEach(c => { c.memberCount = countMap.get(c.id) || 0; });

          // Fetch top students across all classes
          const allMemberIds = [...new Set((members || []).map(m => m.user_id))];
          if (allMemberIds.length > 0) {
            const { data: profiles } = await supabase
              .from("profiles")
              .select("user_id, display_name, avatar_emoji, xp_total")
              .in("user_id", allMemberIds)
              .order("xp_total", { ascending: false })
              .limit(5);

            // Count pending tasks per student
            const { data: tasks } = await supabase
              .from("student_tasks")
              .select("student_id")
              .in("class_id", classIds)
              .eq("status", "pending");

            const taskCountMap = new Map<string, number>();
            (tasks || []).forEach(t => {
              taskCountMap.set(t.student_id, (taskCountMap.get(t.student_id) || 0) + 1);
            });

            // Get streaks
            const { data: progress } = await supabase
              .from("user_progress")
              .select("user_id, streak_days")
              .in("user_id", allMemberIds);
            const streakMap = new Map<string, number>();
            (progress || []).forEach(p => { streakMap.set(p.user_id, p.streak_days); });

            setTopStudents((profiles || []).map(p => ({
              userId: p.user_id,
              displayName: p.display_name,
              avatarEmoji: p.avatar_emoji,
              xpTotal: p.xp_total,
              pendingTasks: taskCountMap.get(p.user_id) || 0,
              streakDays: streakMap.get(p.user_id) || 0,
            })));
          }

          // Pending submissions count
          const { count } = await supabase
            .from("task_submissions")
            .select("*", { count: "exact", head: true })
            .in("class_id", classIds)
            .eq("status", "pending");
          setPendingSubmissions(count || 0);
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

  const alerts = useMemo<Alert[]>(() => {
    const a: Alert[] = [];
    if (pendingSubmissions > 0) {
      a.push({ id: "hw", type: "homework", message: `${pendingSubmissions} ${t("teacherHome.submissionsToReview" as any)}` });
    }
    const lostStreak = topStudents.filter(s => s.streakDays === 0);
    if (lostStreak.length > 0) {
      a.push({ id: "streak", type: "streak", message: `${lostStreak.length} ${t("teacherHome.studentsLostStreak" as any)}` });
    }
    return a;
  }, [pendingSubmissions, topStudents, t]);

  if (authLoading || loading) {
    return (
      <PageBackground>
        <div className="flex items-center justify-center min-h-screen">
          <span className="animate-spin text-3xl">⏳</span>
        </div>
      </PageBackground>
    );
  }

  if (!user) {
    return (
      <PageBackground>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
          <GraduationCap size={48} className="text-muted-foreground" />
          <p className="text-lg font-semibold">{t("teacher.loginRequired" as any)}</p>
          <button onClick={() => navigate("/auth")} className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-semibold">
            {t("more.loginProfile" as any)}
          </button>
        </div>
      </PageBackground>
    );
  }

  const MEDAL_COLORS = [
    "from-yellow-400 to-amber-500",
    "from-gray-300 to-gray-400",
    "from-amber-600 to-orange-500",
  ];

  return (
    <PageBackground intensity="immersive">
      <div className="min-h-screen pb-24">
        {/* Header */}
        <div className="px-5 pt-6 pb-3">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-xl font-extrabold text-foreground flex items-center gap-2">
              <GraduationCap size={22} className="text-primary" />
              {t("teacherHome.greeting" as any)}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {totalStudents} {t("teacherHome.studentsTotal" as any)} · {classes.length} {t("teacherHome.classes" as any)}
            </p>
          </motion.div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 px-4 mb-4">
          {[
            { emoji: "👨‍🎓", value: totalStudents, label: t("teacherHome.students" as any) },
            { emoji: "📝", value: pendingSubmissions, label: t("teacherHome.toCorrect" as any) },
            { emoji: "📚", value: classes.length, label: t("teacherHome.classes" as any) },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-3 text-center shadow-sm"
            >
              <span className="text-2xl">{stat.emoji}</span>
              <p className="text-lg font-bold text-foreground mt-1">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Urgent Alerts */}
        {alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mx-4 mb-4 bg-destructive/10 border-2 border-destructive/30 rounded-2xl p-3"
          >
            <h3 className="text-sm font-bold text-destructive flex items-center gap-2 mb-2">
              🚨 {alerts.length} {t("teacherHome.urgentActions" as any)}
            </h3>
            <div className="space-y-2">
              {alerts.map(alert => (
                <button
                  key={alert.id}
                  onClick={() => navigate("/prof-dashboard")}
                  className="w-full flex items-center justify-between p-2.5 bg-card rounded-xl text-left"
                >
                  <span className="text-xs text-foreground">{alert.message}</span>
                  <span className="text-[10px] bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full font-bold">
                    {t("teacherHome.act" as any)}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Top Students */}
        {topStudents.length > 0 && (
          <div className="mx-4 mb-4 bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-4 shadow-sm">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
              🏆 {t("teacherHome.topStudents" as any)}
            </h2>
            <div className="space-y-2">
              {topStudents.slice(0, 3).map((student, i) => (
                <motion.div
                  key={student.userId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${MEDAL_COLORS[i] || "from-muted to-muted"} flex items-center justify-center text-xs font-bold text-white shadow-sm`}>
                      {i + 1}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-foreground">
                        {student.avatarEmoji} {student.displayName}
                      </span>
                      {student.streakDays > 0 && (
                        <span className="text-[10px] text-muted-foreground ml-1">🔥{student.streakDays}j</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-primary">⭐{student.xpTotal}</span>
                    {student.pendingTasks > 0 && (
                      <p className="text-[10px] text-muted-foreground">{student.pendingTasks} 📝</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* My Classes */}
        <div className="mx-4 mb-4">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
            📅 {t("teacherHome.myClasses" as any)}
          </h2>
          <div className="space-y-2">
            {classes.map((c, i) => (
              <motion.button
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                onClick={() => navigate("/prof-dashboard")}
                className="w-full flex items-center justify-between p-4 bg-card/80 backdrop-blur-sm border border-border rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <BookOpen size={18} className="text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-foreground">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Users size={10} /> {c.memberCount || 0} {t("teacherHome.students" as any)}
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-muted-foreground" />
              </motion.button>
            ))}

            {classes.length === 0 && (
              <div className="text-center py-8">
                <GraduationCap size={36} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">{t("teacher.noClasses" as any)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mx-4 mb-4">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
            ✨ {t("teacherHome.quickActions" as any)}
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { emoji: "📝", label: t("teacherHome.correctHomework" as any), href: "/prof-dashboard" },
              { emoji: "➕", label: t("teacherHome.newClass" as any), href: "/classrooms" },
              { emoji: "📣", label: t("teacherHome.announce" as any), href: "/announcements" },
            ].map((action, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => navigate(action.href)}
                className="flex flex-col items-center gap-2 p-4 bg-primary/10 border border-primary/20 rounded-2xl hover:bg-primary/15 transition-colors"
              >
                <span className="text-2xl">{action.emoji}</span>
                <span className="text-[10px] font-bold text-foreground text-center leading-tight">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </PageBackground>
  );
}
