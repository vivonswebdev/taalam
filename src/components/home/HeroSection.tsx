import { motion } from "framer-motion";
import { Flame, TrendingUp } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useQuranXp } from "@/hooks/useQuranXp";
import { useStreak } from "@/hooks/useStreak";
import ProfileBubble from "@/components/ProfileBubble";

export default function HeroSection() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const xp = useQuranXp();
  const { streak } = useStreak();

  const displayName = profile?.display_name || user?.user_metadata?.display_name || t("home.guest" as any);
  const dailyProgress = Math.min(xp.percent, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="px-4 pt-[env(safe-area-inset-top)] pb-2"
    >
      {/* Basmala */}
      <p className="font-arabic text-lg text-[hsl(var(--primary))] text-center mt-4 mb-1 opacity-80">
        بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
      </p>
      <div className="w-16 h-[1px] bg-[hsl(43,70%,55%)] mx-auto mb-4 opacity-60" />

      {/* Main card */}
      <div className="relative rounded-2xl p-4 bg-card/60 backdrop-blur-xl border border-border/30 shadow-lg">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-0.5">{t("home.salutation" as any)}</p>
            <h1 className="text-lg font-bold text-foreground truncate">{displayName}</h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1 rounded-full px-2 py-1 bg-destructive/10 border border-destructive/20">
              <Flame size={12} className="text-destructive" />
              <span className="text-[11px] font-bold text-foreground">{streak.currentStreak}</span>
            </div>
            <div className="flex items-center gap-1 rounded-full px-2 py-1 bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/20">
              <TrendingUp size={12} className="text-[hsl(var(--primary))]" />
              <span className="text-[11px] font-bold text-foreground">{xp.xp}</span>
            </div>
            <ProfileBubble />
          </div>
        </div>

        {/* Daily progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground">
              {t("home.dailyGoal" as any)}
            </span>
            <span className="text-[11px] font-bold text-foreground">{dailyProgress}%</span>
          </div>
          <div className="relative h-2 rounded-full bg-muted/60 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${dailyProgress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(142,72%,45%)]"
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2.5s_infinite] -translate-x-full" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
