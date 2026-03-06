import { useState, useRef, useCallback, useEffect } from "react";

export type SleepDuration = 0 | 15 | 30 | 60;

export function useSleepTimer(onExpire: () => void) {
  const [remaining, setRemaining] = useState(0); // seconds
  const [activeDuration, setActiveDuration] = useState<SleepDuration>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimeRef = useRef(0);

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRemaining(0);
    setActiveDuration(0);
    endTimeRef.current = 0;
  }, []);

  const start = useCallback((minutes: SleepDuration) => {
    clear();
    if (minutes === 0) return;
    const totalSec = minutes * 60;
    endTimeRef.current = Date.now() + totalSec * 1000;
    setActiveDuration(minutes);
    setRemaining(totalSec);

    intervalRef.current = setInterval(() => {
      const left = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) {
        clear();
        onExpire();
      }
    }, 1000);
  }, [clear, onExpire]);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const formatRemaining = useCallback(() => {
    if (remaining <= 0) return "";
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }, [remaining]);

  return { remaining, activeDuration, start, clear, formatRemaining };
}
