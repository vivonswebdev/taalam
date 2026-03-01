import { motion } from "framer-motion";
import { Users, Clock, Brain, Trophy, TrendingUp, TrendingDown } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface Props {
  totalStudents: number;
  avgQuranMinutes: number;
  avgHifzAyat: number;
  totalQuizzes: number;
}

function GlassCard({ icon, label, value, trend, delay }: {
  icon: React.ReactNode; label: string; value: string; trend?: number; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="relative overflow-hidden rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-4 text-center"
    >
      <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full -translate-y-4 translate-x-4" />
      <div className="flex justify-center mb-2">{icon}</div>
      <p className="text-xl font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
      {trend !== undefined && trend !== 0 && (
        <div className={`flex items-center justify-center gap-0.5 mt-1 text-[10px] font-semibold ${trend > 0 ? "text-green-500" : "text-red-400"}`}>
          {trend > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {trend > 0 ? "+" : ""}{trend}%
        </div>
      )}
    </motion.div>
  );
}

export default function TeacherSummaryCards({ totalStudents, avgQuranMinutes, avgHifzAyat, totalQuizzes }: Props) {
  const { t } = useLanguage();
  return (
    <div className="grid grid-cols-2 gap-3">
      <GlassCard icon={<Users size={18} className="text-primary" />} label={t("teacher.students" as any)} value={String(totalStudents)} delay={0} />
      <GlassCard icon={<Clock size={18} className="text-green-500" />} label={t("teacher.avgQuran7d" as any)} value={`${avgQuranMinutes} min`} delay={0.05} />
      <GlassCard icon={<Brain size={18} className="text-purple-500" />} label={t("teacher.avgHifz7d" as any)} value={`${avgHifzAyat} āyāt`} delay={0.1} />
      <GlassCard icon={<Trophy size={18} className="text-amber-500" />} label={t("teacher.totalQuizzes" as any)} value={String(totalQuizzes)} delay={0.15} />
    </div>
  );
}
