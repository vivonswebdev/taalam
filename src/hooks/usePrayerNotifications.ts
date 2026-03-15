import { useState, useEffect, useCallback, useRef } from "react";
import type { PrayerTimes } from "@/hooks/usePrayerTimes";
import { getAthanReciterById, getDefaultAthanReciter } from "@/data/athanData";
import { Capacitor } from "@capacitor/core";

export interface PrayerNotifConfig {
  enabled: boolean;
  prayers: Record<string, boolean>;
  offsetMinutes: number;
  athanEnabled: boolean;
  vibrationEnabled: boolean;
}

const STORAGE_KEY = "quranEasyPrayerNotifs";
const PRAYER_NAMES = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
const PRAYER_IDS: Record<string, number> = { Fajr: 1, Dhuhr: 2, Asr: 3, Maghrib: 4, Isha: 5 };
const PRE_PRAYER_ID_OFFSET = 100; // pre-notification IDs: 101-105

const isNative = Capacitor.isNativePlatform();

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

// ─── Native Local Notifications helpers ──────────────────────
async function scheduleNativeNotifications(
  config: PrayerNotifConfig,
  times: PrayerTimes,
  cityName?: string,
) {
  if (!isNative) return;

  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");

    // Cancel all existing prayer notifications
    const allIds = PRAYER_NAMES.flatMap((name) => [
      { id: PRAYER_IDS[name] },
      { id: PRE_PRAYER_ID_OFFSET + PRAYER_IDS[name] },
    ]);
    await LocalNotifications.cancel({ notifications: allIds });

    if (!config.enabled) return;

    const notifications: any[] = [];
    const now = new Date();

    for (const name of PRAYER_NAMES) {
      if (!config.prayers[name]) continue;

      const [h, m] = times[name].split(":").map(Number);
      const prayerDate = new Date();
      prayerDate.setHours(h, m, 0, 0);

      // Skip if already passed
      if (prayerDate.getTime() <= now.getTime()) continue;

      // Pre-notification (X min before)
      if (config.offsetMinutes > 0) {
        const preDate = new Date(prayerDate.getTime() - config.offsetMinutes * 60000);
        if (preDate.getTime() > now.getTime()) {
          notifications.push({
            id: PRE_PRAYER_ID_OFFSET + PRAYER_IDS[name],
            title: `🕌 ${name}`,
            body: cityName
              ? `Il reste ${config.offsetMinutes} min avant ${name} à ${cityName}`
              : `Il reste ${config.offsetMinutes} min avant ${name}`,
            schedule: { at: preDate },
            channelId: "prayers",
            smallIcon: "ic_stat_icon_config_sample",
            iconColor: "#C8A96E",
          });
        }
      }

      // Exact prayer time
      notifications.push({
        id: PRAYER_IDS[name],
        title: `🕌 ${name} — الله أكبر`,
        body: cityName
          ? `C'est l'heure de ${name} à ${cityName}`
          : `C'est l'heure de ${name}`,
        schedule: { at: prayerDate },
        channelId: "prayers",
        sound: config.athanEnabled ? "azan.wav" : undefined,
        smallIcon: "ic_stat_icon_config_sample",
        iconColor: "#C8A96E",
        actionTypeId: "PRAYER_ACTION",
        extra: { prayer: name },
      });
    }

    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
      console.log(`[PrayerNotif] Scheduled ${notifications.length} native notifications`);
    }
  } catch (e) {
    console.error("[PrayerNotif] Native scheduling error:", e);
  }
}

async function createNativeChannel() {
  if (!isNative) return;
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    await LocalNotifications.createChannel({
      id: "prayers",
      name: "Prières",
      description: "Notifications des heures de prière",
      importance: 5,
      sound: "azan.wav",
      vibration: true,
    });
  } catch (e) {
    console.warn("[PrayerNotif] Channel creation error:", e);
  }
}

// ─── Hook ────────────────────────────────────────────────────
export function usePrayerNotifications(times: PrayerTimes | null, cityName?: string) {
  const [config, setConfig] = useState<PrayerNotifConfig>(load);
  const [permissionState, setPermissionState] = useState<NotificationPermission | "unsupported">("default");
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const stopAthanRef = useRef<(() => void) | null>(null);

  // Check support + create native channel
  useEffect(() => {
    if (isNative) {
      createNativeChannel();
      checkNativePermission();
    } else {
      if (!("Notification" in window)) {
        setPermissionState("unsupported");
      } else {
        setPermissionState(Notification.permission);
      }
    }
  }, []);

  const checkNativePermission = useCallback(async () => {
    try {
      const { LocalNotifications } = await import("@capacitor/local-notifications");
      const perm = await LocalNotifications.checkPermissions();
      setPermissionState(perm.display === "granted" ? "granted" : "default");
    } catch {
      setPermissionState("unsupported");
    }
  }, []);

  // Cleanup athan audio on unmount
  useEffect(() => {
    return () => {
      stopAthanRef.current?.();
    };
  }, []);

  const requestPermission = useCallback(async () => {
    if (isNative) {
      try {
        const { LocalNotifications } = await import("@capacitor/local-notifications");
        const perm = await LocalNotifications.requestPermissions();
        const granted = perm.display === "granted";
        setPermissionState(granted ? "granted" : "denied");
        if (granted) updateConfig({ enabled: true });
      } catch {
        setPermissionState("unsupported");
      }
      return;
    }

    // Web fallback
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

  // Schedule notifications
  useEffect(() => {
    if (!times || permissionState !== "granted") return;

    if (isNative) {
      // Native: use LocalNotifications scheduler
      scheduleNativeNotifications(config, times, cityName);
      return;
    }

    // ─── Web fallback (existing setTimeout logic) ──────────
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    if (!config.enabled) return;

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
          new Notification(`🕌 ${name} — الله أكبر`, {
            body: cityName
              ? `C'est l'heure de ${name} à ${cityName}`
              : `C'est l'heure de ${name}`,
            icon: "/icon-192.png",
            tag: `prayer-athan-${name}`,
            silent: true,
            requireInteraction: true,
          });

          if (config.athanEnabled !== false) {
            stopAthanRef.current?.();
            stopAthanRef.current = playAthanAudio();
          }

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
