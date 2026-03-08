import { useState, useEffect, useCallback } from "react";
import type { PrayerSettings } from "@/hooks/usePrayerSettings";
import { reverseGeocode } from "@/hooks/useCityAutocomplete";

export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
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
  cityName: string | null;
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

export function calculateDohaTime(sunrise: string): string {
  const [hours, minutes] = sunrise.split(":").map(Number);
  const totalMin = hours * 60 + minutes + 15;
  return `${String(Math.floor(totalMin / 60)).padStart(2, "0")}:${String(totalMin % 60).padStart(2, "0")}`;
}

export function usePrayerTimes(prayerSettings?: PrayerSettings, onAutoDetect?: (city: string, country: string, lat: number, lng: number) => void) {
  const [state, setState] = useState<PrayerTimesState>({
    times: null,
    loading: true,
    error: null,
    nextPrayer: null,
    location: null,
    cityName: null,
  });

  const fetchTimesByCoords = useCallback(async (lat: number, lng: number, method: number, school: number, latAdj: number, knownCity?: string) => {
    try {
      setState((s) => ({ ...s, loading: true, error: null }));
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, "0");
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const yyyy = today.getFullYear();
      const res = await fetch(
        `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${lat}&longitude=${lng}&method=${method}&school=${school}&latitudeAdjustmentMethod=${latAdj}`
      );
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      const t = data.data.timings;
      const times: PrayerTimes = {
        Fajr: t.Fajr, Sunrise: t.Sunrise, Dhuhr: t.Dhuhr, Asr: t.Asr, Maghrib: t.Maghrib, Isha: t.Isha,
      };
      setState((s) => ({ ...s, times, loading: false, location: { lat, lng }, cityName: knownCity || s.cityName }));
    } catch (e: any) {
      setState((s) => ({ ...s, loading: false, error: e.message }));
    }
  }, []);

  // Fetch based on settings
  useEffect(() => {
    const method = prayerSettings?.method ?? 12;
    const school = prayerSettings?.school ?? 0;
    const latAdj = prayerSettings?.latitudeAdjustmentMethod ?? 3;

    if (prayerSettings?.lat && prayerSettings?.lng) {
      const cityDisplay = prayerSettings.city && prayerSettings.country
        ? `${prayerSettings.city}, ${prayerSettings.country}`
        : prayerSettings.city || null;
      fetchTimesByCoords(prayerSettings.lat, prayerSettings.lng, method, school, latAdj, cityDisplay);
      return;
    }

    if (prayerSettings?.source === "city" && prayerSettings.city.trim()) {
      const fetchByCity = async () => {
        try {
          setState((s) => ({ ...s, loading: true, error: null }));
          const today = new Date();
          const dd = String(today.getDate()).padStart(2, "0");
          const mm = String(today.getMonth() + 1).padStart(2, "0");
          const yyyy = today.getFullYear();
          const params = new URLSearchParams({
            city: prayerSettings.city,
            country: prayerSettings.country || "",
            method: String(method),
            school: String(school),
            latitudeAdjustmentMethod: String(latAdj),
          });
          const res = await fetch(`https://api.aladhan.com/v1/timingsByCity/${dd}-${mm}-${yyyy}?${params}`);
          if (!res.ok) throw new Error("API error");
          const data = await res.json();
          const t = data.data.timings;
          const times: PrayerTimes = {
            Fajr: t.Fajr, Sunrise: t.Sunrise, Dhuhr: t.Dhuhr, Asr: t.Asr, Maghrib: t.Maghrib, Isha: t.Isha,
          };
          setState((s) => ({ ...s, times, loading: false, cityName: prayerSettings.city }));
        } catch (e: any) {
          setState((s) => ({ ...s, loading: false, error: e.message }));
        }
      };
      fetchByCity();
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          const geo = await reverseGeocode(latitude, longitude);
          if (geo && onAutoDetect) {
            onAutoDetect(geo.city, geo.country, geo.lat, geo.lng);
          }
          fetchTimesByCoords(latitude, longitude, method, school, latAdj, geo?.displayName || null);
        },
        () => fetchTimesByCoords(DEFAULT_LAT, DEFAULT_LNG, method, school, latAdj, "Bruxelles, Belgique"),
        { timeout: 5000 }
      );
    } else {
      fetchTimesByCoords(DEFAULT_LAT, DEFAULT_LNG, method, school, latAdj, "Bruxelles, Belgique");
    }
  }, [prayerSettings?.source, prayerSettings?.city, prayerSettings?.country, prayerSettings?.method, prayerSettings?.school, prayerSettings?.latitudeAdjustmentMethod, prayerSettings?.lat, prayerSettings?.lng, fetchTimesByCoords, onAutoDetect]);

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
