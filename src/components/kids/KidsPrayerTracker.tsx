import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { usePrayerSettings } from "@/hooks/usePrayerSettings";
import { toast } from "sonner";

const PRAYER_KEYS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;

const PRAYER_EMOJIS: Record<string, string> = {
  Fajr: "🌅", Dhuhr: "☀️", Asr: "🌤️", Maghrib: "🌆", Isha: "🌙",
};

const STORAGE_KEY = "kidsPrayerChecklist";

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function loadChecked(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (data.date !== getTodayKey()) return [];
    return data.checked || [];
  } catch { return []; }
}

function saveChecked(checked: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: getTodayKey(), checked }));
}

export default function KidsPrayerTracker() {
  const { t } = useLanguage();
  const { settings } = usePrayerSettings();
  const { times, loading } = usePrayerTimes(settings);
  const [checked, setChecked] = useState<string[]>(loadChecked);
  const [justChecked, setJustChecked] = useState<string | null>(null);

  useEffect(() => { saveChecked(checked); }, [checked]);

  const toggle = useCallback((name: string) => {
    if (checked.includes(name)) return;
    setChecked(prev => [...prev, name]);
    setJustChecked(name);
    toast.success(`${t("kidsPrayerTracker.validated" as any)} +5⭐`);
    setTimeout(() => setJustChecked(null), 1200);
  }, [checked, t]);

  const completedCount = checked.length;

  if (loading || !times) return null;

  return (
    <div className="mx-4 rounded-3xl bg-gradient-to-br from-pink-100/80 to-blue-100/80 dark:from-pink-900/30 dark:to-blue-900/30 p-4 shadow-lg border border-primary/10">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          ⏰ {t("kidsPrayerTracker.title" as any)}
        </h2>
        <span className="text-xs font-bold bg-primary/15 text-primary rounded-full px-2.5 py-0.5">
          {completedCount}/5 ✅
        </span>
      </div>

      <div className="space-y-2">
        {PRAYER_KEYS.map((name) => {
          const isDone = checked.includes(name);
          const isJust = justChecked === name;
          return (
            <motion.button
              key={name}
              onClick={() => toggle(name)}
              whileTap={{ scale: 0.96 }}
              className={`w-full p-3 rounded-2xl flex items-center justify-between transition-all ${
                isDone
                  ? "bg-emerald-100 dark:bg-emerald-900/40 border-2 border-emerald-400 dark:border-emerald-600 shadow-md"
                  : "bg-card border-2 border-border hover:border-primary/40 hover:shadow-sm"
              }`}
            >
              <div className="flex items-center gap-3">
                <AnimatePresence mode="wait">
                  {isDone ? (
                    <motion.span
                      key="done"
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="text-lg"
                    >✅</motion.span>
                  ) : (
                    <motion.span key="todo" className="text-lg">
                      {PRAYER_EMOJIS[name]}
                    </motion.span>
                  )}
                </AnimatePresence>
                <div className="text-left">
                  <div className="text-sm font-semibold text-foreground">
                    {t(`prayers.${name.toLowerCase()}` as any)}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {times[name]}
                  </div>
                </div>
              </div>
              {isDone && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-emerald-600 dark:text-emerald-400 text-xs font-bold"
                >
                  +5⭐
                </motion.div>
              )}
              {isJust && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.5, 1] }}
                  className="absolute text-2xl"
                >✨</motion.span>
              )}
            </motion.button>
          );
        })}
      </div>

      {completedCount === 5 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-center text-sm font-bold text-emerald-600 dark:text-emerald-400"
        >
          🎉 {t("kidsPrayerTracker.allDone" as any)} +25⭐
        </motion.div>
      )}
    </div>
  );
}
