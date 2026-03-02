import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";
import Confetti from "@/components/Confetti";

const STORAGE_KEY = "kidsRamadanTracker";
const RAMADAN_DAYS = 30;

function loadFastingData(): { year: number; days: string[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { year: new Date().getFullYear(), days: [] };
    return JSON.parse(raw);
  } catch { return { year: new Date().getFullYear(), days: [] }; }
}

function saveFastingData(data: { year: number; days: string[] }) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getStreak(days: string[]): number {
  if (days.length === 0) return 0;
  const sorted = [...days].sort();
  let streak = 1;
  for (let i = sorted.length - 1; i > 0; i--) {
    const curr = parseInt(sorted[i]);
    const prev = parseInt(sorted[i - 1]);
    if (curr - prev === 1) streak++;
    else break;
  }
  return streak;
}

export default function KidsRamadanTracker() {
  const { t } = useLanguage();
  const [data, setData] = useState(loadFastingData);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => { saveFastingData(data); }, [data]);

  const toggleDay = (dayNum: string) => {
    setData(prev => {
      const newDays = prev.days.includes(dayNum)
        ? prev.days.filter(d => d !== dayNum)
        : [...prev.days, dayNum];
      
      if (!prev.days.includes(dayNum)) {
        toast.success(`${t("kidsRamadan.fastingValidated" as any)} +10⭐`);
        const streak = getStreak(newDays);
        if (streak === 7 || streak === 14 || streak === 21 || streak === 30) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3500);
        }
      }
      
      return { ...prev, days: newDays };
    });
  };

  const streak = useMemo(() => getStreak(data.days), [data.days]);
  const daysArray = Array.from({ length: RAMADAN_DAYS }, (_, i) => String(i + 1));

  // Pad to fill complete weeks (7-col grid)
  const firstDayPadding = 0; // Start on first column

  return (
    <div className="mx-4 rounded-3xl bg-gradient-to-br from-violet-500 via-pink-500 to-orange-400 p-4 shadow-xl text-white relative overflow-hidden">
      <Confetti active={showConfetti} emoji duration={3500} />

      {/* Decorative stars */}
      <div className="absolute top-2 right-3 text-xl opacity-40 animate-pulse">🌙</div>
      <div className="absolute bottom-3 left-3 text-lg opacity-30">✨</div>

      {/* Header */}
      <div className="text-center mb-4 relative z-10">
        <h2 className="text-base font-bold flex items-center justify-center gap-2">
          🌙 {t("kidsRamadan.title" as any)}
        </h2>
        <p className="text-[11px] opacity-80 mt-0.5">
          {t("kidsRamadan.subtitle" as any)}
        </p>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-1 relative z-10">
        {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
          <div key={i} className="text-center text-[9px] font-bold opacity-60">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1.5 mb-4 relative z-10">
        {daysArray.map((dayNum) => {
          const isDone = data.days.includes(dayNum);
          return (
            <motion.button
              key={dayNum}
              onClick={() => toggleDay(dayNum)}
              whileTap={{ scale: 0.85 }}
              animate={{ scale: isDone ? 1.05 : 1 }}
              className={`aspect-square rounded-full text-[11px] font-bold transition-all flex items-center justify-center ${
                isDone
                  ? "bg-white text-violet-600 shadow-lg ring-2 ring-white/50"
                  : "bg-white/20 backdrop-blur-sm hover:bg-white/35"
              }`}
            >
              {isDone ? "✅" : dayNum}
            </motion.button>
          );
        })}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between relative z-10">
        <div className="text-center">
          <div className="text-lg font-bold">{data.days.length}/{RAMADAN_DAYS}</div>
          <div className="text-[10px] opacity-80">{t("kidsRamadan.days" as any)}</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold">{streak} 🔥</div>
          <div className="text-[10px] opacity-80">Streak</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold">{data.days.length * 10}⭐</div>
          <div className="text-[10px] opacity-80">{t("kidsRamadan.points" as any)}</div>
        </div>
      </div>
    </div>
  );
}
