import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Flame, TrendingUp } from "lucide-react";
import { useQuranXp } from "@/hooks/useQuranXp";
import { useStreak } from "@/hooks/useStreak";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useLanguage } from "@/hooks/useLanguage";
import ProfileBubble from "@/components/ProfileBubble";

export default function HeroSection() {
  const { t } = useLanguage();
  const { xp, level, levelProgress, badge } = useQuranXp();
  const { streak } = useStreak();
  const { user } = useAuth();
  const { profile } = useUserProfile();

  const displayName = profile?.display_name || (user?.email?.split("@")[0]) || t("home.guest" as any);
  const dailyProgress = Math.min(100, Math.round((levelProgress.currentInLevel / 500) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="px-4 pt-6 pb-2"
    >
      {/* Bismillah */}
      <p className="text-center text-lg font-['Amiri'] text-[hsl(43_85%_55%)] mb-3 opacity-80">
        بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
      </p>

      {/* Hero Card */}
      <div className="relative rounded-2xl p-4 overflow-hidden border border-white/10"
        style={{ background: "linear-gradient(135deg, #0F3823 0%, #0A2A1A 50%, #112D20 100%)" }}>
        {/* Decorative glow */}
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[hsl(152_65%_38%)] opacity-10 blur-3xl" />

        <div className="relative z-10 flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-[hsl(43_85%_55%)] text-xs font-medium mb-0.5">
              ٱلسَّلَامُ عَلَيْكُمْ
            </p>
            <h1 className="text-white text-lg font-bold truncate">
              {displayName}
            </h1>
            <p className="text-white/50 text-[10px] mt-0.5">
              {badge.emoji} {badge.title} · {t("home.level.label" as any)} {level}
            </p>
          </div>
          <ProfileBubble />
        </div>

        {/* Stats row */}
        <div className="relative z-10 flex items-center gap-3 mt-3">
          <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-2.5 py-1">
            <Flame size={14} className="text-orange-400" />
            <span className="text-white text-xs font-bold">{streak.currentStreak}j</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-2.5 py-1">
            <TrendingUp size={14} className="text-[hsl(152_65%_50%)]" />
            <span className="text-white text-xs font-bold">{xp} XP</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative z-10 mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white/40 text-[10px]">{t("home.dailyProgress" as any)}</span>
            <span className="text-white/60 text-[10px] font-bold">{dailyProgress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, hsl(152 65% 38%), hsl(152 65% 55%))" }}
              initial={{ width: 0 }}
              animate={{ width: `${dailyProgress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Guest signup */}
      {!user && (
        <Link
          to="/auth"
          className="mt-3 flex items-center gap-3 rounded-xl p-3 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <span className="text-lg">✨</span>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-bold">{t("home.signupTitle" as any)}</p>
            <p className="text-white/50 text-[10px]">{t("home.signupDesc" as any)}</p>
          </div>
          <span className="text-[hsl(152_65%_50%)] text-xs font-bold">{t("home.signupBtn" as any)} →</span>
        </Link>
      )}
    </motion.div>
  );
}
