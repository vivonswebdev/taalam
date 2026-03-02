import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

const DHIKR_LIST = [
  { key: "subhanallah", labelKey: "tasbih.subhanallah", target: 33 },
  { key: "alhamdulillah", labelKey: "tasbih.alhamdulillah", target: 33 },
  { key: "allahuakbar", labelKey: "tasbih.allahuakbar", target: 34 },
];

export default function TasbihPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeIdx, setActiveIdx] = useState(0);
  const [counts, setCounts] = useState([0, 0, 0]);

  const current = DHIKR_LIST[activeIdx];
  const count = counts[activeIdx];
  const total = counts.reduce((a, b) => a + b, 0);
  const done = count >= current.target;

  const increment = useCallback(() => {
    setCounts(prev => {
      const next = [...prev];
      next[activeIdx]++;
      return next;
    });
    // Auto-advance when target reached
    if (count + 1 >= current.target && activeIdx < DHIKR_LIST.length - 1) {
      setTimeout(() => setActiveIdx(activeIdx + 1), 400);
    }
  }, [activeIdx, count, current.target]);

  const reset = () => {
    setCounts([0, 0, 0]);
    setActiveIdx(0);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 pb-2">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border shadow-sm">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">{t("tasbih.title" as any)}</h1>
          <p className="text-xs text-muted-foreground">{t("tasbih.subtitle" as any)}</p>
        </div>
        <button onClick={reset} className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border shadow-sm">
          <RotateCcw className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Dhikr tabs */}
      <div className="px-4 mt-3 flex gap-2">
        {DHIKR_LIST.map((d, i) => (
          <button
            key={d.key}
            onClick={() => setActiveIdx(i)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
              i === activeIdx
                ? "bg-primary text-primary-foreground border-primary shadow-md"
                : "bg-card text-muted-foreground border-border"
            } ${counts[i] >= d.target ? "opacity-60" : ""}`}
          >
            {t(d.labelKey as any)}
            <span className="block text-[10px] font-normal mt-0.5">{counts[i]}/{d.target}</span>
          </button>
        ))}
      </div>

      {/* Counter */}
      <div className="flex flex-col items-center mt-8">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={increment}
          className={`w-48 h-48 rounded-full flex flex-col items-center justify-center shadow-2xl border-4 transition-colors ${
            done
              ? "bg-accent/20 border-accent/40 text-accent-foreground"
              : "bg-gradient-to-br from-primary/20 to-accent/10 border-primary/30 text-foreground"
          }`}
        >
          <span className="text-5xl font-bold font-mono">{count}</span>
          <span className="text-xs text-muted-foreground mt-1">/ {current.target}</span>
        </motion.button>

        {/* Progress ring visual */}
        <div className="mt-6 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{t("tasbih.total" as any)}:</span>
          <span className="text-sm font-bold font-mono text-foreground">{total}/100</span>
        </div>
      </div>

      {/* Completion */}
      {total >= 100 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mt-6 p-4 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 border border-primary/30 text-center"
        >
          <span className="text-2xl">✨</span>
          <p className="text-sm font-bold text-foreground mt-1">ما شاء الله</p>
        </motion.div>
      )}
    </div>
  );
}
