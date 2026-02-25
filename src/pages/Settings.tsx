import { useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, Info, Globe, Baby } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import { useChildMode } from "@/hooks/useChildMode";
import { StickerCollection } from "@/components/StickerReward";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const { resetProgress } = useProgress();
  const { isChildMode, toggleChildMode, stickers, resetStickers } = useChildMode();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleReset = () => {
    resetProgress();
    resetStickers();
    setShowConfirm(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="px-6 pt-14 pb-4">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold text-foreground">
          Réglages
        </motion.h1>
      </div>

      <div className="px-6 space-y-3">
        {/* Child Mode Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          <button onClick={toggleChildMode} className="w-full flex items-center gap-4 p-4 text-left">
            <Baby size={20} className={isChildMode ? "text-secondary" : "text-primary"} />
            <div className="flex-1">
              <p className="text-sm font-medium text-card-foreground">Mode Enfant</p>
              <p className="text-xs text-muted-foreground">Texte plus gros, stickers et confettis</p>
            </div>
            <div className={`w-12 h-7 rounded-full transition-colors relative ${isChildMode ? "bg-success" : "bg-muted"}`}>
              <motion.div
                animate={{ x: isChildMode ? 20 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-1 w-5 h-5 rounded-full bg-card shadow-md"
              />
            </div>
          </button>
        </motion.div>

        {/* Sticker Collection (only in child mode) */}
        {isChildMode && stickers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-4"
          >
            <p className="text-sm font-semibold text-card-foreground mb-3">🎁 Ma collection de stickers</p>
            <StickerCollection stickers={stickers} />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          <button className="w-full flex items-center gap-4 p-4 text-left opacity-50 cursor-not-allowed">
            <Globe size={20} className="text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium text-card-foreground">Langue</p>
              <p className="text-xs text-muted-foreground">Français (bientôt : العربية)</p>
            </div>
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full flex items-center gap-4 p-4 text-left"
          >
            <RotateCcw size={20} className="text-destructive" />
            <div className="flex-1">
              <p className="text-sm font-medium text-card-foreground">Réinitialiser la progression</p>
              <p className="text-xs text-muted-foreground">Remet tout à zéro</p>
            </div>
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          <div className="flex items-center gap-4 p-4">
            <Info size={20} className="text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-card-foreground">QuranEasy v1.0</p>
              <p className="text-xs text-muted-foreground">Apprendre le Coran facilement</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Reset confirmation */}
      {showConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm px-8"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm"
          >
            <h3 className="text-lg font-bold text-card-foreground mb-2">Confirmer</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Toute votre progression sera perdue. Voulez-vous continuer ?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 rounded-xl border border-border text-sm font-medium text-card-foreground active:scale-[0.98] transition-transform"
              >
                Annuler
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-3 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium active:scale-[0.98] transition-transform"
              >
                Réinitialiser
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
