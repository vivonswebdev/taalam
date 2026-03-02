import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { ISLAMIC_EVENTS, type IslamicEvent } from "@/hooks/useHijriCalendar";
import { motion } from "framer-motion";

interface TodayHijri {
  day: number;
  month: number;
  monthName: string;
  year: number;
}

export default function HijriMiniWidget() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [today, setToday] = useState<TodayHijri | null>(null);
  const [upcomingEvent, setUpcomingEvent] = useState<IslamicEvent | null>(null);

  useEffect(() => {
    const dateStr = new Date().toLocaleDateString("en-GB", {
      day: "2-digit", month: "2-digit", year: "numeric",
    }).replace(/\//g, "-");

    fetch(`https://api.aladhan.com/v1/gToH?date=${dateStr}`)
      .then(r => r.json())
      .then(data => {
        if (data?.data?.hijri) {
          const h = data.data.hijri;
          const m = parseInt(h.month.number);
          const d = parseInt(h.day);
          const y = parseInt(h.year);
          setToday({ day: d, month: m, monthName: h.month.en, year: y });

          // Find next event
          const sorted = [...ISLAMIC_EVENTS].sort((a, b) => {
            const aDist = a.month === m ? (a.day >= d ? a.day - d : 400) : (a.month > m ? (a.month - m) * 30 : (a.month + 12 - m) * 30);
            const bDist = b.month === m ? (b.day >= d ? b.day - d : 400) : (b.month > m ? (b.month - m) * 30 : (b.month + 12 - m) * 30);
            return aDist - bDist;
          });
          if (sorted.length > 0) setUpcomingEvent(sorted[0]);
        }
      })
      .catch(() => {});
  }, []);

  if (!today) return null;

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      onClick={() => navigate("/islamic-calendar")}
      className="w-full flex items-center gap-3 rounded-2xl p-3.5 bg-gradient-to-r from-accent/10 to-primary/5 border border-accent/20 shadow-sm active:scale-[0.98] transition-transform text-left"
    >
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xl shadow-sm">
        🗓️
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground">
          {today.day} {today.monthName} {today.year}H
        </p>
        {upcomingEvent && (
          <p className="text-[10px] text-muted-foreground truncate">
            {upcomingEvent.emoji} {t(upcomingEvent.nameKey as any)}
          </p>
        )}
      </div>
      <span className="text-xs text-primary font-semibold shrink-0">→</span>
    </motion.button>
  );
}
