import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, Calendar, BookOpen } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { surahs as SURAHS } from "@/data/surahs";

interface HifzSnapshot {
  date: string;
  totalAyat: number;
}

interface HifzItem {
  surah_number: number;
  ayah_from: number;
  ayah_to: number;
  status: string;
  created_at: string;
  ease_factor: number;
  repetitions: number;
}

interface TaskSub {
  id: string;
  status: string;
  score_tajwid: number | null;
  teacher_note: string | null;
  created_at: string;
  assignment_title?: string;
}

export default function StudentStatsPage() {
  const { studentId, classId } = useParams<{ studentId: string; classId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [hifzItems, setHifzItems] = useState<HifzItem[]>([]);
  const [submissions, setSubmissions] = useState<TaskSub[]>([]);
  const [activity, setActivity] = useState<{ date: string; minutes: number; ayat: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId || !user) return;
    (async () => {
      setLoading(true);
      try {
        const [profileRes, hifzRes, subsRes, activityRes] = await Promise.all([
          supabase.from("profiles").select("*").eq("user_id", studentId).single(),
          supabase.from("hifz_items").select("surah_number, ayah_from, ayah_to, status, created_at, ease_factor, repetitions").eq("user_id", studentId).order("created_at", { ascending: true }),
          supabase.from("task_submissions").select("id, status, score_tajwid, teacher_note, created_at, assignment_id").eq("student_id", studentId).eq("class_id", classId!).order("created_at", { ascending: false }).limit(20),
          supabase.from("quran_daily_activity").select("activity_date, minutes_quran, ayat_recited").eq("user_id", studentId).order("activity_date", { ascending: true }).limit(30),
        ]);

        setProfile(profileRes.data);
        setHifzItems((hifzRes.data || []) as HifzItem[]);
        setActivity((activityRes.data || []).map(a => ({ date: a.activity_date, minutes: a.minutes_quran, ayat: a.ayat_recited })));

        // Enrich submissions with assignment titles
        const subs = (subsRes.data || []) as any[];
        if (subs.length > 0) {
          const assignIds = [...new Set(subs.map(s => s.assignment_id))];
          const { data: assigns } = await supabase.from("class_assignments").select("id, title").in("id", assignIds);
          const assignMap = new Map((assigns || []).map(a => [a.id, a.title]));
          setSubmissions(subs.map(s => ({ ...s, assignment_title: assignMap.get(s.assignment_id) || "?" })));
        } else {
          setSubmissions([]);
        }
      } catch (err) {
        console.error("Student stats error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [studentId, classId, user]);

  // Build Hifz progression chart data
  const hifzProgression = useMemo(() => {
    if (hifzItems.length === 0) return [];
    const sorted = [...hifzItems].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    const snapshots: HifzSnapshot[] = [];
    let cumulative = 0;
    const seen = new Set<string>();

    for (const item of sorted) {
      const key = `${item.surah_number}:${item.ayah_from}-${item.ayah_to}`;
      if (!seen.has(key)) {
        seen.add(key);
        cumulative += (item.ayah_to - item.ayah_from + 1);
      }
      const dateStr = new Date(item.created_at).toLocaleDateString("fr", { day: "2-digit", month: "short" });
      // Merge same-day entries
      if (snapshots.length > 0 && snapshots[snapshots.length - 1].date === dateStr) {
        snapshots[snapshots.length - 1].totalAyat = cumulative;
      } else {
        snapshots.push({ date: dateStr, totalAyat: cumulative });
      }
    }
    return snapshots;
  }, [hifzItems]);

  // Hifz summary stats
  const hifzStats = useMemo(() => {
    const totalAyat = hifzItems.reduce((s, i) => s + (i.ayah_to - i.ayah_from + 1), 0);
    const mastered = hifzItems.filter(i => i.status === "mastered").reduce((s, i) => s + (i.ayah_to - i.ayah_from + 1), 0);
    const learning = hifzItems.filter(i => i.status === "learning").reduce((s, i) => s + (i.ayah_to - i.ayah_from + 1), 0);
    const uniqueSurahs = new Set(hifzItems.map(i => i.surah_number)).size;
    return { totalAyat, mastered, learning, uniqueSurahs };
  }, [hifzItems]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><span className="animate-spin text-2xl">⏳</span></div>;
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft size={16} />
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-2xl">{profile?.avatar_emoji || "🌙"}</span>
          <div className="min-w-0">
            <p className="text-sm font-bold truncate">{profile?.display_name || "?"}</p>
            <p className="text-[10px] text-muted-foreground">{profile?.xp_total || 0} XP</p>
          </div>
        </div>
        <Badge variant="outline" className="text-[9px] shrink-0">🔥 {profile?.sessions_count || 0}</Badge>
      </div>

      <div className="px-4 py-4 space-y-5">
        {/* Hifz Summary Cards */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: "📖", label: t("studentStats.totalAyat" as any), value: hifzStats.totalAyat },
            { icon: "⭐", label: t("studentStats.mastered" as any), value: hifzStats.mastered },
            { icon: "📚", label: t("studentStats.learning" as any), value: hifzStats.learning },
            { icon: "🕌", label: t("studentStats.surahs" as any), value: hifzStats.uniqueSurahs },
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl p-3 text-center"
            >
              <p className="text-lg">{card.icon}</p>
              <p className="text-lg font-bold">{card.value}</p>
              <p className="text-[10px] text-muted-foreground">{card.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Hifz Progression Chart */}
        {hifzProgression.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-primary" />
              <p className="text-sm font-bold">{t("studentStats.hifzProgression" as any)}</p>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={hifzProgression}>
                <defs>
                  <linearGradient id="hifzGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} width={30} />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8 }}
                  formatter={(value: number) => [`${value} ${t("studentStats.ayat" as any)}`, t("studentStats.totalAyat" as any)]}
                />
                <Area type="monotone" dataKey="totalAyat" stroke="hsl(var(--primary))" fill="url(#hifzGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Surahs in Hifz */}
        {hifzItems.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={14} className="text-primary" />
              <p className="text-sm font-bold">{t("studentStats.surahsInHifz" as any)}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[...new Set(hifzItems.map(i => i.surah_number))].sort((a, b) => a - b).map(sn => {
                const surah = SURAHS.find(s => s.number === sn);
                const items = hifzItems.filter(i => i.surah_number === sn);
                const totalAyat = items.reduce((s, i) => s + (i.ayah_to - i.ayah_from + 1), 0);
                const mastered = items.filter(i => i.status === "mastered").reduce((s, i) => s + (i.ayah_to - i.ayah_from + 1), 0);
                const pct = surah ? Math.round((totalAyat / surah.ayahs) * 100) : 0;
                return (
                  <Badge
                    key={sn}
                    variant={mastered === totalAyat ? "default" : "secondary"}
                    className="text-[9px] gap-1"
                  >
                    {surah?.name || `S${sn}`} {pct}%
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Submissions */}
        {submissions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={14} className="text-primary" />
              <p className="text-sm font-bold">{t("studentStats.recentSubmissions" as any)}</p>
            </div>
            <div className="space-y-1.5">
              {submissions.slice(0, 8).map(s => (
                <div key={s.id} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-1.5">
                  <span className="text-xs">
                    {s.status === "approved" ? "✅" : s.status === "rejected" ? "❌" : "⏳"}
                  </span>
                  <span className="text-xs font-medium flex-1 truncate">{s.assignment_title}</span>
                  {s.score_tajwid != null && (
                    <Badge variant="outline" className="text-[9px]">{Math.round(s.score_tajwid)}%</Badge>
                  )}
                  <span className="text-[9px] text-muted-foreground">{new Date(s.created_at).toLocaleDateString("fr", { day: "2-digit", month: "short" })}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
