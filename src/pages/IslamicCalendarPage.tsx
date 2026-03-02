import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useHijriCalendar, getEventsForDay, ISLAMIC_EVENTS } from "@/hooks/useHijriCalendar";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAY_MAP: Record<string, number> = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
  Thursday: 4, Friday: 5, Saturday: 6,
};

export default function IslamicCalendarPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { days, loading, currentHijriMonth, currentHijriYear, hijriMonthName, todayHijri, goNext, goPrev } = useHijriCalendar();

  // Build calendar grid with padding
  const firstDayWeekday = days.length > 0 ? WEEKDAY_MAP[days[0].weekday] ?? 0 : 0;
  const paddedDays = [...Array(firstDayWeekday).fill(null), ...days];

  // Events this month
  const monthEvents = ISLAMIC_EVENTS.filter(e => e.month === currentHijriMonth);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 pb-2">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border shadow-sm">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">{t("hijri.title" as any)}</h1>
          <p className="text-xs text-muted-foreground">{t("hijri.subtitle" as any)}</p>
        </div>
      </div>

      {/* Month nav */}
      <div className="flex items-center justify-between px-5 py-3">
        <button onClick={goPrev} className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center active:scale-90 transition-transform">
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">{hijriMonthName}</p>
          <p className="text-xs text-muted-foreground">{currentHijriYear} H</p>
        </div>
        <button onClick={goNext} className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center active:scale-90 transition-transform">
          <ChevronRight className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="px-4">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAYS_SHORT.map(d => (
            <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-7 gap-1"
          >
            {paddedDays.map((day, i) => {
              if (!day) return <div key={`pad-${i}`} />;
              const events = getEventsForDay(day.hijriMonth, day.hijriDay);
              const isToday = todayHijri && day.hijriDay === todayHijri.day && day.hijriMonth === todayHijri.month && day.hijriYear === todayHijri.year;
              const isFriday = day.weekday === "Friday";

              return (
                <div
                  key={day.gregorianDate}
                  className={cn(
                    "relative rounded-xl p-1.5 min-h-[52px] flex flex-col items-center gap-0.5 border transition-all",
                    isToday
                      ? "bg-primary/15 border-primary/40 shadow-md"
                      : events.length > 0
                        ? "bg-accent/10 border-accent/30"
                        : "bg-card/50 border-border/30",
                    isFriday && !isToday && events.length === 0 && "bg-primary/5"
                  )}
                >
                  <span className={cn(
                    "text-sm font-bold",
                    isToday ? "text-primary" : "text-foreground"
                  )}>
                    {day.hijriDay}
                  </span>
                  <span className="text-[9px] text-muted-foreground">{day.gregorianDay}</span>
                  {events.length > 0 && (
                    <div className="flex gap-0.5">
                      {events.map((e, ei) => (
                        <span key={ei} className="text-[10px]">{e.emoji}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Events legend */}
      {monthEvents.length > 0 && (
        <div className="px-5 mt-5 space-y-2">
          <h3 className="text-sm font-bold text-foreground">{t("hijri.eventsThisMonth" as any)}</h3>
          {monthEvents.map((e, i) => (
            <motion.div
              key={i}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border/50 shadow-sm"
            >
              <span className="text-xl">{e.emoji}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{t(e.nameKey as any)}</p>
                <p className="text-[10px] text-muted-foreground">{e.day} {hijriMonthName}</p>
              </div>
              <div className={cn("w-3 h-3 rounded-full", e.color)} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Today info card */}
      {todayHijri && (
        <div className="px-5 mt-5">
          <div className="p-4 bg-gradient-to-br from-primary/10 to-accent/5 rounded-2xl border border-primary/20 shadow-md">
            <p className="text-xs text-muted-foreground">{t("hijri.today" as any)}</p>
            <p className="text-lg font-bold text-foreground mt-1">
              {todayHijri.day} {hijriMonthName} {todayHijri.year} H
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
