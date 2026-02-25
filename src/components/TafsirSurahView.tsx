import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Loader2 } from "lucide-react";
import { useTafsir, TAFSIR_SOURCES, type TafsirSourceId, type TafsirSurahSummary } from "@/hooks/useTafsir";
import type { Surah } from "@/data/surahs";

interface TafsirSurahViewProps {
  surah: Surah;
  onBack: () => void;
  onScrollToAyah: (index: number) => void;
  t: (key: string) => string;
}

export default function TafsirSurahView({ surah, onBack, onScrollToAyah, t }: TafsirSurahViewProps) {
  const { getTafsirForSurah, loading, error } = useTafsir();
  const [data, setData] = useState<TafsirSurahSummary | null>(null);
  const [source, setSource] = useState<TafsirSourceId>("ar.muyassar");

  useEffect(() => {
    setData(null);
    getTafsirForSurah(surah.number, source).then((r) => {
      if (r) setData(r);
    });
  }, [surah.number, source]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card shrink-0">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 text-center min-w-0">
          <p className="font-semibold text-sm flex items-center justify-center gap-1.5">
            <BookOpen size={14} className="text-primary" />
            {t("tafsir.surahTafsir")}
          </p>
          <p className="text-xs text-muted-foreground">{surah.nameArabic} — {surah.name}</p>
        </div>
        <div className="w-9" />
      </div>

      {/* Source selector */}
      <div className="px-4 py-2 flex gap-1.5 flex-wrap shrink-0">
        {TAFSIR_SOURCES.map((s) => (
          <button
            key={s.id}
            onClick={() => setSource(s.id)}
            className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
              source === s.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted border-border text-muted-foreground"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-primary" />
          </div>
        ) : error ? (
          <p className="text-sm text-destructive text-center py-8">{error}</p>
        ) : data ? (
          data.ayahs.map((a) => (
            <motion.div
              key={a.ayahNumber}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(a.ayahNumber * 0.02, 0.5) }}
              className="rounded-xl border border-border bg-card p-3 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                  {a.ayahNumber}
                </span>
                <button
                  onClick={() => { onScrollToAyah(a.ayahNumber - 1); onBack(); }}
                  className="text-[10px] text-primary font-semibold"
                >
                  {t("tafsir.goToAyah")}
                </button>
              </div>
              <p
                className="text-sm leading-relaxed text-foreground"
                dir={source.startsWith("ar") ? "rtl" : "ltr"}
              >
                {a.text}
              </p>
            </motion.div>
          ))
        ) : null}
      </div>
    </div>
  );
}
