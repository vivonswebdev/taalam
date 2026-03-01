import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { Badge } from "@/components/ui/badge";
import type { StudentStats } from "@/hooks/useTeacherDashboard";
import { BarChart, Bar, ResponsiveContainer, Cell } from "recharts";

function MiniSparkline({ value, max }: { value: number; max: number }) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
      <div className="h-full rounded-full bg-primary/70 transition-all" style={{ width: `${percent}%` }} />
    </div>
  );
}

interface Props {
  students: StudentStats[];
  classId?: string | null;
}

export default function StudentsList({ students, classId }: Props) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const maxMinutes = Math.max(1, ...students.map(s => s.quranMinutes));
  const maxHifz = Math.max(1, ...students.map(s => s.hifzAyat));

  // Sort by XP descending
  const sorted = [...students].sort((a, b) => b.xpTotal - a.xpTotal);

  if (students.length === 0) {
    return <p className="text-xs text-muted-foreground text-center py-6">{t("teacher.noStudents" as any)}</p>;
  }

  return (
    <div>
      <p className="text-sm font-bold mb-3">{t("teacher.studentProgress" as any)}</p>
      <div className="space-y-2">
        {sorted.map((s, i) => (
          <motion.div
            key={s.userId}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-card border border-border rounded-xl p-3 hover:shadow-sm transition-shadow cursor-pointer"
            onClick={() => classId && navigate(`/student-stats/${classId}/${s.userId}`)}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="text-2xl">{s.avatarEmoji}</span>
                <span className="absolute -bottom-1 -right-1 text-[9px] bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {i + 1}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold truncate">{s.displayName}</span>
                  <Badge variant="outline" className="text-[9px] shrink-0">🔥 {s.streakDays}j</Badge>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] text-muted-foreground">Qur'an</span>
                    <MiniSparkline value={s.quranMinutes} max={maxMinutes} />
                    <span className="text-[10px] font-semibold">{s.quranMinutes}m</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] text-muted-foreground">Hifz</span>
                    <MiniSparkline value={s.hifzAyat} max={maxHifz} />
                    <span className="text-[10px] font-semibold">{s.hifzAyat}</span>
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-bold text-primary">{s.xpTotal} XP</p>
                <p className="text-[9px] text-muted-foreground">{s.quizCompleted} quiz</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
