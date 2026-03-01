import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, X, Volume2, VolumeX } from "lucide-react";

const MIC_TUTORIAL_KEY = "mic_tutorial_seen";

interface MicTutorialProps {
  onDismiss: () => void;
}

const tips = [
  { emoji: "📱", text: "Tiens ton téléphone à 20–30 cm de ta bouche" },
  { emoji: "🤫", text: "Récite dans un endroit calme, sans bruit de fond" },
  { emoji: "🎤", text: "Parle clairement et à un rythme naturel" },
  { emoji: "⏳", text: "Attends que le micro s'active avant de commencer" },
];

export default function MicTutorial({ onDismiss }: MicTutorialProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-card border border-border rounded-2xl p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Mic size={16} className="text-primary" />
          </div>
          <span className="text-sm font-bold text-foreground">Conseils pour la dictée</span>
        </div>
        <button onClick={onDismiss} className="text-muted-foreground hover:text-foreground">
          <X size={16} />
        </button>
      </div>

      <div className="space-y-2">
        {tips.map((tip, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-2.5"
          >
            <span className="text-base mt-0.5">{tip.emoji}</span>
            <span className="text-xs text-muted-foreground leading-relaxed">{tip.text}</span>
          </motion.div>
        ))}
      </div>

      <button
        onClick={() => {
          try { localStorage.setItem(MIC_TUTORIAL_KEY, "true"); } catch {}
          onDismiss();
        }}
        className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
      >
        Compris ✓
      </button>
    </motion.div>
  );
}

export function shouldShowMicTutorial(): boolean {
  try { return !localStorage.getItem(MIC_TUTORIAL_KEY); } catch { return true; }
}
