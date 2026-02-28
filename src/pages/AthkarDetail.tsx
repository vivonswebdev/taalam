import { useParams, useNavigate } from "react-router-dom";
import { getAthkarGroupById, type Dhikr } from "@/data/athkarData";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";

function DhikrCard({ dhikr }: { dhikr: Dhikr }) {
  const [count, setCount] = useState(0);
  const { t } = useLanguage();
  const done = count >= dhikr.repeat;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-4 transition-colors ${
        done ? "bg-primary/10 border-primary/30" : "bg-card/80 border-border/50"
      }`}
    >
      <div dir="rtl" className="font-arabic text-xl leading-[2.2] text-foreground text-center mb-3">
        {dhikr.arabic}
      </div>
      <p className="text-xs text-primary/70 italic text-center mb-1">{dhikr.transliteration}</p>
      <p className="text-xs text-muted-foreground text-center mb-3">{dhikr.translation}</p>
      {dhikr.source && (
        <p className="text-[10px] text-muted-foreground/50 text-center mb-3">📚 {dhikr.source}</p>
      )}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setCount(0)}
          className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground"
        >
          <RotateCcw size={14} />
        </button>
        <button
          onClick={() => { if (!done) setCount(c => c + 1); }}
          className={`px-6 py-2.5 rounded-2xl font-bold text-sm transition-colors ${
            done
              ? "bg-primary text-primary-foreground"
              : "bg-primary/15 text-primary hover:bg-primary/25"
          }`}
        >
          {done ? `✅ ${t("athkar.done" as any)}` : `${count} / ${dhikr.repeat}`}
        </button>
      </div>
    </motion.div>
  );
}

export default function AthkarDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const group = getAthkarGroupById(id || "");

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{t("athkar.notFound" as any)}</p>
      </div>
    );
  }

  const title = t(`athkar.${group.id}` as any) || group.title;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-black/30 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-background/70 border-b border-border/50 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate("/moods")} className="p-1.5 rounded-full hover:bg-muted">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-semibold">{group.emoji} {title}</h1>
          <p className="text-[11px] text-muted-foreground">{group.titleAr} · {group.adhkar.length} {t("athkar.adhkarCount" as any)}</p>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {group.adhkar.map((d) => (
          <DhikrCard key={d.id} dhikr={d} />
        ))}
      </div>
    </div>
  );
}
