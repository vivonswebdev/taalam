import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export interface DifficultyOption {
  key: string;
  emoji: string;
  xpBase: number;
  description?: string;
}

const DEFAULT_DIFFICULTIES: DifficultyOption[] = [
  { key: "easy", emoji: "🌱", xpBase: 5 },
  { key: "medium", emoji: "🌿", xpBase: 10 },
  { key: "hard", emoji: "🔥", xpBase: 15 },
];

interface Props {
  title: string;
  icon: string;
  onSelect: (key: string) => void;
  onBack: () => void;
  t: (key: string) => string;
  difficulties?: DifficultyOption[];
}

export default function DifficultySelector({ title, icon, onSelect, onBack, t, difficulties = DEFAULT_DIFFICULTIES }: Props) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="px-4 pt-10 pb-2">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center active:scale-90 transition-transform">
            <ArrowLeft size={18} className="text-foreground" />
          </button>
          <h1 className="text-base font-bold text-foreground flex items-center gap-1.5">
            <span>{icon}</span> {title}
          </h1>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 pb-20">
        <span className="text-6xl">{icon}</span>
        <h2 className="text-lg font-bold text-foreground">{t("memoryFaith.chooseDifficulty")}</h2>
        <div className="w-full max-w-xs space-y-3">
          {difficulties.map((d) => (
            <motion.button key={d.key} whileTap={{ scale: 0.96 }}
              onClick={() => onSelect(d.key)}
              className="w-full flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-4 active:bg-muted/50 transition-colors">
              <span className="text-2xl">{d.emoji}</span>
              <div className="text-left flex-1">
                <p className="text-sm font-bold text-foreground">{t(`memoryFaith.${d.key}`)}</p>
                {d.description && <p className="text-[10px] text-muted-foreground">{d.description}</p>}
              </div>
              <span className="text-xs text-primary font-bold">+{d.xpBase} XP</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
