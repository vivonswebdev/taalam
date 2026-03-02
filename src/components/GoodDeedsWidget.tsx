import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Zap } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useXP } from "@/hooks/useXP";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { isHifzBoostActive } from "@/hooks/useGoodDeedsRewards";

const DEEDS = [
  { id: "fajr", emoji: "🌅", xp: 10 },
  { id: "dua", emoji: "🤲", xp: 5 },
  { id: "smile", emoji: "😊", xp: 5 },
  { id: "sadaqah", emoji: "💰", xp: 10 },
  { id: "parents", emoji: "👨‍👩‍👧", xp: 10 },
  { id: "quran", emoji: "📖", xp: 15 },
] as const;

const LOCAL_KEY = "good_deeds_";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getLocalDeeds(date: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY + date) || "[]");
  } catch {
    return [];
  }
}

export default function GoodDeedsWidget() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { addXP } = useXP();
  const [completed, setCompleted] = useState<string[]>([]);
  const [boostActive, setBoostActive] = useState(isHifzBoostActive());
  const date = todayKey();

  // Load from Supabase or localStorage
  useEffect(() => {
    if (user) {
      supabase
        .from("good_deeds_progress")
        .select("completed_deeds, boost_active, boost_expires_at")
        .eq("user_id", user.id)
        .eq("deed_date", date)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error) {
            console.error("Good deeds fetch error:", error);
            setCompleted(getLocalDeeds(date));
            return;
          }
          if (data) {
            setCompleted(data.completed_deeds || []);
            if (data.boost_expires_at) {
              setBoostActive(new Date(data.boost_expires_at).getTime() > Date.now());
            }
          } else {
            setCompleted(getLocalDeeds(date));
          }
        });
    } else {
      setCompleted(getLocalDeeds(date));
    }
  }, [user, date]);

  const toggleDeed = useCallback(async (deedId: string) => {
    const isCompleting = !completed.includes(deedId);
    const newCompleted = isCompleting
      ? [...completed, deedId]
      : completed.filter(d => d !== deedId);

    setCompleted(newCompleted);
    localStorage.setItem(LOCAL_KEY + date, JSON.stringify(newCompleted));

    // XP on complete
    if (isCompleting) {
      const deed = DEEDS.find(d => d.id === deedId);
      if (deed) addXP(deed.xp);
    }

    // Check 6/6 boost
    const newBoost = newCompleted.length >= 6;
    const boostExpiry = newBoost ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null;

    if (newBoost && !boostActive) {
      setBoostActive(true);
      localStorage.setItem("kids_hifz_boost", boostExpiry!);
      toast.success(`🔥 ${t("goodDeeds.boostActivated" as any)}`);
    }

    // Sync to Supabase
    if (user) {
      await supabase.from("good_deeds_progress").upsert({
        user_id: user.id,
        deed_date: date,
        completed_deeds: newCompleted,
        boost_active: newBoost,
        boost_expires_at: boostExpiry,
      }, { onConflict: "user_id,deed_date" });
    }
  }, [completed, date, user, addXP, boostActive, t]);

  const remaining = 6 - completed.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-md p-4 space-y-3"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-amber-400" />
          <h3 className="text-sm font-bold text-card-foreground">
            {t("goodDeeds.title" as any)} ({completed.length}/6)
          </h3>
        </div>
        {boostActive && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full"
          >
            <Zap size={10} /> BOOST x2
          </motion.span>
        )}
      </div>

      {/* Global progress bar */}
      <div className="space-y-1.5">
        <div className="relative h-2.5 bg-muted rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-primary via-secondary to-primary transition-all duration-500"
            style={{ width: `${(completed.length / 6) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-semibold">
          <span className="text-muted-foreground">
            {completed.length}/6 {t("goodDeeds.actions" as any)}
          </span>
          <span className={completed.length >= 6 ? "text-primary" : "text-muted-foreground"}>
            {completed.length >= 6 ? `🔥 ${t("goodDeeds.boostActivated" as any)}` : `${6 - completed.length} ${t("goodDeeds.remaining" as any)}`}
          </span>
        </div>
      </div>

      {/* Deeds grid */}
      <div className="grid grid-cols-3 gap-2">
        {DEEDS.map((deed) => {
          const done = completed.includes(deed.id);
          return (
            <motion.button
              key={deed.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => toggleDeed(deed.id)}
              className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl transition-all text-center ${
                done
                  ? "bg-primary/15 border border-primary/30 shadow-sm"
                  : "bg-muted/40 border border-transparent hover:border-border/50"
              }`}
            >
              <span className="text-xl">{done ? "✅" : deed.emoji}</span>
              <span className={`text-[10px] font-medium leading-tight ${done ? "text-primary" : "text-muted-foreground"}`}>
                {t(`goodDeeds.deed_${deed.id}` as any)}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Remaining hint */}
      {remaining > 0 && remaining <= 3 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-[11px] font-semibold text-amber-500"
        >
          {remaining} {t("goodDeeds.remaining" as any)} = 🔥 HIFZ BOOST x2 XP 24h!
        </motion.p>
      )}
    </motion.div>
  );
}
