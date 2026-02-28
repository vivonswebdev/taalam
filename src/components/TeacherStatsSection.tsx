import { motion } from "framer-motion";
import { TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

interface StudentData {
  userId: string;
  displayName: string;
  avatarEmoji: string;
  quranMinutes: number;
  hifzAyat: number;
  streakDays: number;
  quizCompleted: number;
}

interface AssignmentData {
  id: string;
  title: string;
  completed?: number;
  totalStudents?: number;
  is_active: boolean;
  due_date: string;
}

interface Props {
  students: StudentData[];
  assignments: AssignmentData[];
}

export default function TeacherStatsSection({ students, assignments }: Props) {
  const { t } = useLanguage();

  // Class Quran activity - average minutes per student
  const avgMinutes = students.length > 0
    ? Math.round(students.reduce((s, st) => s + st.quranMinutes, 0) / students.length)
    : 0;

  // Assignment completion data
  const activeAssignments = assignments
    .filter(a => a.is_active && typeof a.completed === "number" && typeof a.totalStudents === "number")
    .slice(0, 5);

  const assignmentChartData = activeAssignments.map(a => ({
    name: a.title.length > 12 ? a.title.slice(0, 12) + "…" : a.title,
    percent: a.totalStudents! > 0 ? Math.round((a.completed! / a.totalStudents!) * 100) : 0,
  }));

  // At-risk students (lowest activity)
  const atRiskStudents = [...students]
    .sort((a, b) => (a.quranMinutes + a.hifzAyat) - (b.quranMinutes + b.hifzAyat))
    .slice(0, 3)
    .filter(s => s.quranMinutes < 10 || s.hifzAyat < 5);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          {t("teacher.stats.sectionTitle" as any)}
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Class Quran activity summary */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-xl p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={16} className="text-primary" />
          <span className="text-sm font-semibold">{t("teacher.stats.quranClass7d" as any)}</span>
        </div>
        <div className="text-center mb-2">
          <p className="text-2xl font-bold text-foreground">{avgMinutes}</p>
          <p className="text-[10px] text-muted-foreground">min/élève (7j)</p>
        </div>
      </motion.div>

      {/* Assignment completion */}
      {assignmentChartData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={16} className="text-green-500" />
            <span className="text-sm font-semibold">{t("teacher.stats.assignmentsCompletion" as any)}</span>
          </div>
          <ResponsiveContainer width="100%" height={Math.max(80, assignmentChartData.length * 32)}>
            <BarChart data={assignmentChartData} layout="vertical" margin={{ left: 0 }}>
              <XAxis type="number" hide domain={[0, 100]} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={80} />
              <Bar dataKey="percent" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* At-risk students */}
      {atRiskStudents.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-card border border-amber-500/30 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-amber-500" />
            <span className="text-sm font-semibold">{t("teacher.stats.atRisk" as any)}</span>
          </div>
          <div className="space-y-2">
            {atRiskStudents.map(s => (
              <div key={s.userId} className="flex items-center gap-2 bg-muted rounded-lg p-2">
                <span className="text-lg">{s.avatarEmoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{s.displayName}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {s.quranMinutes}min · {s.hifzAyat} āyāt · 🔥{s.streakDays}j
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
