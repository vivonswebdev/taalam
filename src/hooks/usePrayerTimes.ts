import { useState, useEffect, useCallback } from "react";

export interface PrayerTimes {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface PrayerTimesState {
  times: PrayerTimes | null;
  loading: boolean;
  error: string | null;
  nextPrayer: { name: string; time: string; countdown: string } | null;
  location: { lat: number; lng: number } | null;
}

const PRAYER_NAMES = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;

// Default: Brussels
const DEFAULT_LAT = 50.8503;
const DEFAULT_LNG = 4.3517;

function parseTime(timeStr: string): Date {
  const [h, m] = timeStr.split(":").map(Number);
  const now = new Date();
  now.setHours(h, m, 0, 0);
  return now;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00";
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
}

export function usePrayerTimes() {
  const [state, setState] = useState<PrayerTimesState>({
    times: null,
    loading: true,
    error: null,
    nextPrayer: null,
    location: null,
  });

  const fetchTimes = useCallback(async (lat: number, lng: number) => {
    try {
      setState((s) => ({ ...s, loading: true, error: null }));
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, "0");
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const yyyy = today.getFullYear();
      const res = await fetch(
        `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${lat}&longitude=${lng}&method=12`
      );
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      const t = data.data.timings;
      const times: PrayerTimes = {
        Fajr: t.Fajr,
        Dhuhr: t.Dhuhr,
        Asr: t.Asr,
        Maghrib: t.Maghrib,
        Isha: t.Isha,
      };
      setState((s) => ({ ...s, times, loading: false, location: { lat, lng } }));
    } catch (e: any) {
      setState((s) => ({ ...s, loading: false, error: e.message }));
    }
  }, []);

  // Get location and fetch
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchTimes(pos.coords.latitude, pos.coords.longitude),
        () => fetchTimes(DEFAULT_LAT, DEFAULT_LNG),
        { timeout: 5000 }
      );
    } else {
      fetchTimes(DEFAULT_LAT, DEFAULT_LNG);
    }
  }, [fetchTimes]);

  // Update next prayer countdown every 30s
  useEffect(() => {
    if (!state.times) return;
    const update = () => {
      const now = new Date();
      let next: { name: string; time: string; countdown: string } | null = null;
      for (const name of PRAYER_NAMES) {
        const pTime = parseTime(state.times![name]);
        if (pTime > now) {
          next = { name, time: state.times![name], countdown: formatCountdown(pTime.getTime() - now.getTime()) };
          break;
        }
      }
      if (!next) {
        // All prayers passed, next is tomorrow's Fajr
        next = { name: "Fajr", time: state.times!.Fajr, countdown: "—" };
      }
      setState((s) => ({ ...s, nextPrayer: next }));
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [state.times]);

  return state;
}
