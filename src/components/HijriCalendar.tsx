import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2, Star } from "lucide-react";

interface HijriDay {
  gregorian: { day: string; month: { number: number; en: string }; year: string; date: string };
  hijri: { day: string; month: { number: number; en: string; ar: string }; year: string; holidays: string[] };
}

// Major Islamic events to highlight
const IMPORTANT_EVENTS = [
  "Isra and Mi'raj",
  "Lailat-ul-Qadr",
  "Eid-ul-Fitr",
  "Eid-ul-Adha",
  "1st Muharram",
  "Ashura",
  "Mawlid al-Nabi",
  "15th Shaban",
  "1st Ramadan",
];

function isImportantHoliday(holidays: string[]): boolean {
  return holidays.some((h) => IMPORTANT_EVENTS.some((e) => h.toLowerCase().includes(e.toLowerCase())));
}

const WEEKDAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

export default function HijriCalendar() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [days, setDays] = useState<HijriDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [hijriMonthLabel, setHijriMonthLabel] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`https://api.aladhan.com/v1/gToHCalendar/${month}/${year}`)
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        const data: HijriDay[] = json.data || [];
        setDays(data);
        // Derive hijri month label from the middle of the month
        const mid = data[Math.floor(data.length / 2)];
        if (mid) {
          const unique = [...new Set(data.map((d) => `${d.hijri.month.ar} ${d.hijri.year}`))];
          setHijriMonthLabel(unique.join(" / "));
        }
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [month, year]);

  const goNext = () => {
    if (month === 12) { setMonth(1); setYear(year + 1); }
    else setMonth(month + 1);
  };
  const goPrev = () => {
    if (month === 1) { setMonth(12); setYear(year - 1); }
    else setMonth(month - 1);
  };

  // Build calendar grid
  const firstDayOfWeek = days.length > 0 ? new Date(`${year}-${String(month).padStart(2, "0")}-01`).getDay() : 0;
  const totalSlots = firstDayOfWeek + days.length;
  const rows = Math.ceil(totalSlots / 7);

  const todayStr = `${String(today.getDate()).padStart(2, "0")}-${String(today.getMonth() + 1).padStart(2, "0")}-${today.getFullYear()}`;

  const gregMonthNames = ["", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-card border border-border rounded-2xl p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <button onClick={goPrev} className="p-2 rounded-full hover:bg-muted active:scale-95 transition-transform">
          <ChevronLeft size={18} className="text-foreground" />
        </button>
        <div className="text-center">
          <p className="text-sm font-bold text-foreground">{gregMonthNames[month]} {year}</p>
          {hijriMonthLabel && <p className="text-xs text-primary font-arabic mt-0.5">{hijriMonthLabel}</p>}
        </div>
        <button onClick={goNext} className="p-2 rounded-full hover:bg-muted active:scale-95 transition-transform">
          <ChevronRight size={18} className="text-foreground" />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-primary" size={24} />
        </div>
      ) : (
        <>
          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground py-1">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7">
            {Array.from({ length: rows * 7 }).map((_, idx) => {
              const dayIdx = idx - firstDayOfWeek;
              const day = days[dayIdx];
              if (!day) return <div key={idx} className="h-12" />;

              const isToday = day.gregorian.date === todayStr;
              const hasEvent = day.hijri.holidays.length > 0;
              const isImportant = hasEvent && isImportantHoliday(day.hijri.holidays);

              return (
                <div
                  key={idx}
                  className={`relative h-12 flex flex-col items-center justify-center rounded-lg text-xs transition-colors
                    ${isToday ? "bg-primary text-primary-foreground font-bold ring-2 ring-primary/30" : ""}
                    ${isImportant && !isToday ? "bg-accent/30 border border-accent" : ""}
                    ${hasEvent && !isImportant && !isToday ? "bg-secondary/10" : ""}
                  `}
                  title={hasEvent ? day.hijri.holidays.join(", ") : undefined}
                >
                  <span className={`text-[11px] leading-none ${isToday ? "text-primary-foreground" : "text-foreground"}`}>
                    {parseInt(day.gregorian.day)}
                  </span>
                  <span className={`text-[9px] leading-none mt-0.5 font-arabic ${isToday ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    {parseInt(day.hijri.day)}
                  </span>
                  {isImportant && (
                    <Star size={8} className={`absolute top-0.5 right-0.5 ${isToday ? "text-primary-foreground" : "text-accent-foreground"}`} fill="currentColor" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Events legend */}
          {days.some((d) => d.hijri.holidays.length > 0) && (
            <div className="mt-3 pt-3 border-t border-border space-y-1">
              {days
                .filter((d) => d.hijri.holidays.length > 0)
                .map((d, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px]">
                    <span className="text-primary font-bold shrink-0">{parseInt(d.gregorian.day)}</span>
                    <span className="text-muted-foreground">
                      {d.hijri.holidays.join(", ")}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
