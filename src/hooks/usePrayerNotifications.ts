import { useState, useEffect, useCallback, useRef } from "react";
import type { PrayerTimes } from "@/hooks/usePrayerTimes";
import { getAthanReciterById, getDefaultAthanReciter } from "@/data/athanData";

export interface PrayerNotifConfig {
  enabled: boolean;
  prayers: Record<string, boolean>;
  offsetMinutes: number;
  athanEnabled: boolean;
  vibrationEnabled: boolean;
}

const STORAGE_KEY = "quranEasyPrayerNotifs";
const PRAYER_NAMES = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;

const defaultConfig: PrayerNotifConfig = {
  enabled: false,
  prayers: { Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true },
  offsetMinutes: 10,
  athanEnabled: true,
  vibrationEnabled: true,
};

function load(): PrayerNotifConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...defaultConfig, ...JSON.parse(stored) };
  } catch {}
  return { ...defaultConfig };
}

function save(c: PrayerNotifConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
}

function getSelectedReciterId(): string {
  return localStorage.getItem("athan_reciter") || "alafasy";
}

function getAthanVolume(): number {
  return parseFloat(localStorage.getItem("athan_volume") || "0.8");
}

/** Play athan audio for the selected reciter, returns stop function */
function playAthanAudio(): (() => void) | null {
  const reciter = getAthanReciterById(getSelectedReciterId()) || getDefaultAthanReciter();
  if (!reciter.audioUrl) return null;

  try {
    const audio = new Audio(reciter.audioUrl);
    audio.volume = getAthanVolume();
    // Play only ~30s of the athan (short version)
    audio.play().catch(() => {});
    const stopTimer = setTimeout(() => {
      try { audio.pause(); audio.currentTime = 0; } catch {}
    }, 30000);
    
    return () => {
      clearTimeout(stopTimer);
      try { audio.pause(); audio.currentTime = 0; } catch {}
    };
  } catch {
    return null;
  }
}

/** Vibrate pattern for athan: long pulse */
function vibrateAthan() {
  try {
    navigator.vibrate?.([300, 100, 300, 100, 500]);
  } catch {}
}

export function usePrayerNotifications(times: PrayerTimes | null, cityName?: string) {
  const [config, setConfig] = useState<PrayerNotifConfig>(load);
  const [permissionState, setPermissionState] = useState<NotificationPermission | "unsupported">("default");
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const stopAthanRef = useRef<(() => void) | null>(null);

  // Check support
  useEffect(() => {
    if (!("Notification" in window)) {
      setPermissionState("unsupported");
    } else {
      setPermissionState(Notification.permission);
    }
  }, []);

  // Cleanup athan audio on unmount
  useEffect(() => {
    return () => {
      stopAthanRef.current?.();
    };
  }, []);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return;
    const perm = await Notification.requestPermission();
    setPermissionState(perm);
    if (perm === "granted") {
      updateConfig({ enabled: true });
    }
  }, []);

  const updateConfig = useCallback((partial: Partial<PrayerNotifConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...partial };
      save(next);
      return next;
    });
  }, []);

  const togglePrayer = useCallback((name: string) => {
    setConfig((prev) => {
      const next = { ...prev, prayers: { ...prev.prayers, [name]: !prev.prayers[name] } };
      save(next);
      return next;
    });
  }, []);

  // Schedule notifications + athan sound
  useEffect(() => {
    // Clear previous timers
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    if (!config.enabled || !times || permissionState !== "granted") return;

    const now = new Date();

    for (const name of PRAYER_NAMES) {
      if (!config.prayers[name]) continue;

      const [h, m] = times[name].split(":").map(Number);
      const prayerDate = new Date();
      prayerDate.setHours(h, m, 0, 0);

      // 1) Offset notification (X min before)
      if (config.offsetMinutes > 0) {
        const notifTime = new Date(prayerDate.getTime() - config.offsetMinutes * 60000);
        const delay = notifTime.getTime() - now.getTime();

        if (delay > 0) {
          const timer = setTimeout(() => {
            new Notification(`🕌 ${name}`, {
              body: cityName
                ? `Il reste ${config.offsetMinutes} min avant ${name} à ${cityName}`
                : `Il reste ${config.offsetMinutes} min avant ${name}`,
              icon: "/icon-192.png",
              tag: `prayer-pre-${name}`,
              silent: true,
            });
          }, delay);
          timersRef.current.push(timer);
        }
      }

      // 2) Exact prayer time: athan sound + vibration + notification
      const athanDelay = prayerDate.getTime() - now.getTime();
      if (athanDelay > 0) {
        const timer = setTimeout(() => {
          // Show notification
          new Notification(`🕌 ${name} — الله أكبر`, {
            body: cityName
              ? `C'est l'heure de ${name} à ${cityName}`
              : `C'est l'heure de ${name}`,
            icon: "/icon-192.png",
            tag: `prayer-athan-${name}`,
            silent: true, // We handle sound ourselves
            requireInteraction: true,
          });

          // Play athan audio
          if (config.athanEnabled !== false) {
            stopAthanRef.current?.();
            stopAthanRef.current = playAthanAudio();
          }

          // Vibrate
          if (config.vibrationEnabled !== false) {
            vibrateAthan();
          }
        }, athanDelay);
        timersRef.current.push(timer);
      }
    }

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [config, times, permissionState, cityName]);

  return {
    config,
    updateConfig,
    togglePrayer,
    permissionState,
    requestPermission,
    supported: permissionState !== "unsupported",
    stopAthan: () => {
      stopAthanRef.current?.();
      stopAthanRef.current = null;
    },
  };
}