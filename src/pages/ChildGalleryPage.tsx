import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, Share2, Star, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useChildAchievements } from "@/hooks/useChildAchievements";
import { ACHIEVEMENTS, RARITY_COLORS } from "@/data/achievementsData";
import { supabase } from "@/integrations/supabase/client";
import Confetti from "@/components/Confetti";
import BottomNav from "@/components/BottomNav";

interface ChildInfo {
  name: string;
  avatar_emoji: string;
  age: number | null;
  total_points: number;
}

export default function ChildGalleryPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const activeChildId = localStorage.getItem("taaloum_active_child_id");
  const { unlocked, loading, isUnlocked, checkAndUnlock } = useChildAchievements(activeChildId);

  const [child, setChild] = useState<ChildInfo | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!activeChildId) return;
    supabase
      .from("children_profiles")
      .select("name, avatar_emoji, age, total_points")
      .eq("id", activeChildId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setChild(data as ChildInfo);
          checkAndUnlock(data.total_points);
        }
      });
  }, [activeChildId, checkAndUnlock]);

  const unlockedCount = unlocked.length;
  const totalCount = ACHIEVEMENTS.length;
  const progress = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  if (!activeChildId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <Trophy size={48} className="text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{t("badges.noChild" as any) || "Sélectionnez un enfant"}</p>
        <button onClick={() => navigate("/select-child")} className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-semibold text-sm">
          {t("badges.selectChild" as any) || "Choisir un enfant"}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {showConfetti && <Confetti active={showConfetti} />}

      {/* Header */}
      <div className="bg-gradient-to-br from-amber-500/20 via-primary/10 to-purple-500/10 px-4 pt-5 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-card/80 backdrop-blur flex items-center justify-center border border-border/40">
            <ArrowLeft size={18} />
          </button>
          <Trophy size={22} className="text-amber-500" />
          <h1 className="text-lg font-bold">{t("badges.galleryTitle" as any) || "Galerie des Trophées"}</h1>
        </div>

        {child && (
          <div className="flex items-center gap-4 bg-card/60 backdrop-blur-sm rounded-2xl p-4 border border-border/30">
            <span className="text-4xl">{child.avatar_emoji}</span>
            <div className="flex-1">
              <p className="font-bold text-foreground">{child.name}</p>
              {child.age && <p className="text-xs text-muted-foreground">{child.age} {t("profile.yearsOld" as any) || "ans"}</p>}
              <div className="flex items-center gap-1 mt-1">
                <Star size={14} className="text-amber-500" fill="currentColor" />
                <span className="text-sm font-bold text-amber-600">{child.total_points} pts</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{unlockedCount}/{totalCount}</p>
              <p className="text-[10px] text-muted-foreground">{t("badges.unlocked" as any) || "débloqués"}</p>
            </div>
          </div>
        )}

        {/* Progress bar */}
        <div className="mt-3">
          <div className="h-2.5 bg-muted/40 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-amber-400 to-primary rounded-full"
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1 text-right">{progress}%</p>
        </div>
      </div>

      {/* Badge Grid */}
      <div className="px-4 mt-4">
        {/* Rarity sections */}
        {(["legendary", "gold", "silver", "bronze"] as const).map(rarity => {
          const badgesForRarity = ACHIEVEMENTS.filter(a => a.rarity === rarity);
          if (badgesForRarity.length === 0) return null;
          const colors = RARITY_COLORS[rarity];
          const rarityLabels: Record<string, string> = {
            legendary: "💎 " + (t("badges.legendary" as any) || "Légendaire"),
            gold: "🥇 " + (t("badges.gold" as any) || "Or"),
            silver: "🥈 " + (t("badges.silver" as any) || "Argent"),
            bronze: "🥉 " + (t("badges.bronze" as any) || "Bronze"),
          };

          return (
            <div key={rarity} className="mb-5">
              <h3 className={`text-xs font-bold mb-2 ${colors.text}`}>{rarityLabels[rarity]}</h3>
              <div className="grid grid-cols-4 gap-2.5">
                {badgesForRarity.map((def, i) => {
                  const unlk = isUnlocked(def.id);
                  return (
                    <motion.div
                      key={def.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className={`relative aspect-square rounded-2xl border-2 flex flex-col items-center justify-center p-1.5 transition-all ${
                        unlk
                          ? `bg-gradient-to-br ${colors.bg} ${colors.border} shadow-lg`
                          : "bg-muted/20 border-border/30 opacity-50 grayscale"
                      }`}
                    >
                      <span className="text-2xl">{def.icon}</span>
                      <p className="text-[8px] text-center font-semibold mt-1 leading-tight text-foreground">
                        {t(`badges.${def.i18nKey}` as any) || def.id}
                      </p>
                      {!unlk && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Lock size={16} className="text-muted-foreground/60" />
                        </div>
                      )}
                      {unlk && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center"
                        >
                          <span className="text-[8px] text-primary-foreground">✓</span>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Share button */}
      <div className="px-4 mt-2">
        <button
          onClick={() => {
            if (navigator.share && child) {
              navigator.share({
                title: `${child.name} - ${unlockedCount} trophées 🏆`,
                text: `${child.name} a débloqué ${unlockedCount}/${totalCount} badges sur Taaloum ! ⭐${child.total_points} pts`,
                url: window.location.origin,
              }).catch(() => {});
            }
          }}
          className="w-full py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-2xl font-semibold flex items-center justify-center gap-2 text-sm"
        >
          <Share2 size={16} />
          {t("badges.share" as any) || "Partager mes trophées"}
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
