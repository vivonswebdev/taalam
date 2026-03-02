import { useState, useEffect, useCallback } from "react";

const HIJRI_MONTHS = [
  "Muḥarram", "Ṣafar", "Rabīʿ al-Awwal", "Rabīʿ ath-Thānī",
  "Jumādā al-Ūlā", "Jumādā ath-Thāniyah", "Rajab", "Shaʿbān",
  "Ramaḍān", "Shawwāl", "Dhū al-Qaʿdah", "Dhū al-Ḥijjah"
];

export interface HijriDay {
  hijriDay: number;
  hijriMonth: number;
  hijriMonthName: string;
  hijriYear: number;
  gregorianDate: string; // YYYY-MM-DD
  gregorianDay: number;
  gregorianMonth: number;
  weekday: string;
}

export interface IslamicEvent {
  month: number; // hijri month (1-based)
  day: number;
  nameKey: string;
  color: string; // tailwind class
  emoji: string;
}

// Major Islamic events with hijri month/day
export const ISLAMIC_EVENTS: IslamicEvent[] = [
  { month: 1, day: 1, nameKey: "hijri.newYear", color: "bg-primary", emoji: "🌙" },
  { month: 1, day: 10, nameKey: "hijri.ashura", color: "bg-destructive", emoji: "🔴" },
  { month: 3, day: 12, nameKey: "hijri.mawlid", color: "bg-emerald-500", emoji: "🟢" },
  { month: 7, day: 27, nameKey: "hijri.isra", color: "bg-accent", emoji: "✨" },
  { month: 8, day: 15, nameKey: "hijri.shabaan", color: "bg-secondary", emoji: "🌕" },
  { month: 9, day: 1, nameKey: "hijri.ramadan", color: "bg-emerald-500", emoji: "🌙" },
  { month: 9, day: 27, nameKey: "hijri.laylat", color: "bg-amber-500", emoji: "⭐" },
  { month: 10, day: 1, nameKey: "hijri.eidFitr", color: "bg-amber-500", emoji: "🎉" },
  { month: 12, day: 9, nameKey: "hijri.arafat", color: "bg-primary", emoji: "🏔️" },
  { month: 12, day: 10, nameKey: "hijri.eidAdha", color: "bg-amber-500", emoji: "🐑" },
];

export function getEventsForDay(hijriMonth: number, hijriDay: number): IslamicEvent[] {
  return ISLAMIC_EVENTS.filter(e => e.month === hijriMonth && e.day === hijriDay);
}

export function useHijriCalendar() {
  const [days, setDays] = useState<HijriDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentHijriMonth, setCurrentHijriMonth] = useState(1);
  const [currentHijriYear, setCurrentHijriYear] = useState(1447);
  const [todayHijri, setTodayHijri] = useState<{ day: number; month: number; year: number } | null>(null);

  // Get today's hijri date
  useEffect(() => {
    fetch("https://api.aladhan.com/v1/gToH?date=" + new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "-"))
      .then(r => r.json())
      .then(data => {
        if (data?.data?.hijri) {
          const h = data.data.hijri;
          const m = parseInt(h.month.number);
          const y = parseInt(h.year);
          const d = parseInt(h.day);
          setCurrentHijriMonth(m);
          setCurrentHijriYear(y);
          setTodayHijri({ day: d, month: m, year: y });
        }
      })
      .catch(() => {});
  }, []);

  const loadMonth = useCallback(async (month: number, year: number) => {
    setLoading(true);
    try {
      const res = await fetch(`https://api.aladhan.com/v1/hToGCalendar/${month}/${year}`);
      const json = await res.json();
      if (json?.data) {
        const mapped: HijriDay[] = json.data.map((d: any) => ({
          hijriDay: parseInt(d.hijri.day),
          hijriMonth: parseInt(d.hijri.month.number),
          hijriMonthName: d.hijri.month.en,
          hijriYear: parseInt(d.hijri.year),
          gregorianDate: `${d.gregorian.year}-${d.gregorian.month.number.toString().padStart(2, "0")}-${d.gregorian.day.padStart(2, "0")}`,
          gregorianDay: parseInt(d.gregorian.day),
          gregorianMonth: parseInt(d.gregorian.month.number),
          weekday: d.gregorian.weekday.en,
        }));
        setDays(mapped);
        setCurrentHijriMonth(month);
        setCurrentHijriYear(year);
      }
    } catch {
      setDays([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load initial month once we know it
  useEffect(() => {
    if (currentHijriMonth && currentHijriYear) {
      loadMonth(currentHijriMonth, currentHijriYear);
    }
  }, []); // only once on mount - loadMonth called via prev/next after

  const goNext = () => {
    let m = currentHijriMonth + 1;
    let y = currentHijriYear;
    if (m > 12) { m = 1; y++; }
    loadMonth(m, y);
  };

  const goPrev = () => {
    let m = currentHijriMonth - 1;
    let y = currentHijriYear;
    if (m < 1) { m = 12; y--; }
    loadMonth(m, y);
  };

  return {
    days,
    loading,
    currentHijriMonth,
    currentHijriYear,
    hijriMonthName: HIJRI_MONTHS[currentHijriMonth - 1] || "",
    todayHijri,
    goNext,
    goPrev,
    loadMonth,
  };
}
