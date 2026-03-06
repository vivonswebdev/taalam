import { motion } from "framer-motion";
import { X, Volume2 } from "lucide-react";

interface WordPopupProps {
  word: { text: string; tajwidRule?: string; tajwidColor?: string };
  position: { x: number; y: number };
  onClose: () => void;
  onPlayWord: () => void;
  isPlaying: boolean;
}

const RULE_LABELS: Record<string, string> = {
  idgham_bighunnah: "Idgham bi Ghunnah",
  idgham_bilaghunnah: "Idgham bila Ghunnah",
  izhar: "Izhar",
  ikhfa: "Ikhfa",
  ikhfa_shafawi: "Ikhfa Shafawi",
  iqlab: "Iqlab",
  idgham_shafawi: "Idgham Shafawi",
  ghunnah: "Ghunnah",
  qalqala: "Qalqala",
  madd_tabii: "Madd Tabii",
  madd_muttasil: "Madd Muttasil",
  lam_shamsiyyah: "Lam Shamsiyyah",
  lam_qamariyyah: "Lam Qamariyyah",
};

export default function WordPopup({ word, position, onClose, onPlayWord, isPlaying }: WordPopupProps) {
  const top = Math.max(60, position.y - 120);
  const left = Math.min(Math.max(20, position.x - 80), window.innerWidth - 180);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[60]" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.15 }}
        className="fixed z-[61] bg-card border border-border rounded-2xl shadow-xl p-4 min-w-[160px]"
        style={{ top, left }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-muted flex items-center justify-center"
        >
          <X size={12} />
        </button>

        {/* Arabic word */}
        <p
          className="text-center font-['Amiri'] leading-relaxed mb-2"
          style={{
            fontSize: 36,
            color: word.tajwidColor || "hsl(var(--foreground))",
            direction: "rtl",
          }}
        >
          {word.text}
        </p>

        {/* Tajwid rule badge */}
        {word.tajwidRule && (
          <div className="flex justify-center mb-3">
            <span
              className="text-[11px] font-semibold px-3 py-1 rounded-full text-white"
              style={{ backgroundColor: word.tajwidColor || "hsl(var(--primary))" }}
            >
              {RULE_LABELS[word.tajwidRule] || word.tajwidRule}
            </span>
          </div>
        )}

        {/* Play button */}
        <button
          onClick={onPlayWord}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium transition-colors"
        >
          <Volume2 size={14} />
          {isPlaying ? "En cours..." : "Écouter"}
        </button>
      </motion.div>
    </>
  );
}
