import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import type { LoginBonusResult } from "@/hooks/useLoginStreak";

interface LoginBonusPopupProps {
  result: LoginBonusResult | null;
  onDismiss: () => void;
}

export default function LoginBonusPopup({ result, onDismiss }: LoginBonusPopupProps) {
  const { t } = useLanguage();

  if (!result) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.9 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm"
      >
        <div className="relative bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
          {/* Gradient header */}
          <div className="bg-gradient-to-r from-primary/20 to-secondary/20 px-5 pt-5 pb-3 text-center">
            <span className="text-4xl block mb-1">{result.emoji}</span>
            <p className="text-lg font-bold text-foreground">
              {t("loginBonus.title" as any) || "Connexion quotidienne !"}
            </p>
          </div>

          {/* Content */}
          <div className="px-5 pb-5 pt-3 text-center space-y-2">
            <div className="flex items-center justify-center gap-3">
              <div className="bg-primary/10 rounded-xl px-4 py-2">
                <p className="text-xs text-muted-foreground">{t("loginBonus.streak" as any) || "Jours consécutifs"}</p>
                <p className="text-2xl font-black text-primary">{result.streak} 🔥</p>
              </div>
              <div className="bg-secondary/10 rounded-xl px-4 py-2">
                <p className="text-xs text-muted-foreground">XP {t("loginBonus.bonus" as any) || "bonus"}</p>
                <p className="text-2xl font-black text-secondary">+{result.xpAwarded}</p>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground">
              {result.streak >= 7
                ? (t("loginBonus.keepGoing" as any) || "Continue comme ça, mâ shâ Allâh ! 🌟")
                : (t("loginBonus.comeBack" as any) || "Reviens demain pour augmenter ton bonus !")
              }
            </p>

            {/* Next tier preview */}
            {result.streak < 30 && (
              <div className="text-[10px] text-muted-foreground bg-muted/50 rounded-lg px-3 py-1.5">
                {result.streak < 3 && `🎯 3 ${t("loginBonus.days" as any) || "jours"} → +10 XP`}
                {result.streak >= 3 && result.streak < 7 && `🎯 7 ${t("loginBonus.days" as any) || "jours"} → +20 XP`}
                {result.streak >= 7 && result.streak < 14 && `🎯 14 ${t("loginBonus.days" as any) || "jours"} → +30 XP`}
                {result.streak >= 14 && result.streak < 30 && `🎯 30 ${t("loginBonus.days" as any) || "jours"} → +50 XP 👑`}
              </div>
            )}
          </div>

          {/* Close */}
          <button
            onClick={onDismiss}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-muted/80 flex items-center justify-center text-muted-foreground hover:bg-muted"
          >
            <X size={14} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
