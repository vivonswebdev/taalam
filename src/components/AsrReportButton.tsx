import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flag, X } from "lucide-react";
import { toast } from "sonner";

const REPORT_REASONS = [
  { id: "correct", label: "Je pense que c'était correct", emoji: "✅" },
  { id: "incomplete", label: "L'ayah coupée / pas complète", emoji: "✂️" },
  { id: "mic_noise", label: "Problème de micro / bruit", emoji: "🎤" },
  { id: "other", label: "Autre problème", emoji: "❓" },
];

interface AsrReportButtonProps {
  onReport: (reason: string) => void;
}

export default function AsrReportButton({ onReport }: AsrReportButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors py-1 px-2 rounded-lg hover:bg-muted/50"
      >
        <Flag size={12} />
        Signaler un résultat incorrect
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-border rounded-xl shadow-lg p-3 z-50"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-foreground">Que s'est-il passé ?</span>
              <button onClick={() => setOpen(false)} className="text-muted-foreground">
                <X size={14} />
              </button>
            </div>
            <div className="space-y-1.5">
              {REPORT_REASONS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    onReport(r.id);
                    setOpen(false);
                    toast.success("Merci ! Ton signalement a été enregistré.", { duration: 2000 });
                  }}
                  className="w-full flex items-center gap-2 text-left text-xs px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <span>{r.emoji}</span>
                  <span className="text-foreground">{r.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
