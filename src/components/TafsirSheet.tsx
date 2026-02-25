import { useEffect, useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, X } from "lucide-react";
import { useTafsir, TAFSIR_SOURCES, type TafsirSourceId, type TafsirAyah } from "@/hooks/useTafsir";

interface TafsirSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  surahNumber: number;
  ayahNumber: number; // 1-based numberInSurah
  arabicText: string;
  translation?: string;
  t: (key: string) => string;
}

export default function TafsirSheet({
  open,
  onOpenChange,
  surahNumber,
  ayahNumber,
  arabicText,
  translation,
  t,
}: TafsirSheetProps) {
  const { getTafsirForAyah, loading, error } = useTafsir();
  const [tafsir, setTafsir] = useState<TafsirAyah | null>(null);
  const [source, setSource] = useState<TafsirSourceId>("ar.muyassar");

  useEffect(() => {
    if (!open) return;
    setTafsir(null);
    getTafsirForAyah(surahNumber, ayahNumber, source).then((r) => {
      if (r) setTafsir(r);
    });
  }, [open, surahNumber, ayahNumber, source]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="pb-2">
          <div className="flex items-center justify-between">
            <DrawerTitle className="flex items-center gap-2 text-base">
              <BookOpen size={16} className="text-primary" />
              {t("tafsir.title")} — {t("tafsir.ayah")} {ayahNumber}
            </DrawerTitle>
            <DrawerClose asChild>
              <button className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <X size={16} />
              </button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="px-4 pb-6 space-y-4 overflow-y-auto max-h-[65vh]">
          {/* Source selector */}
          <div className="flex gap-1.5 flex-wrap">
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

          {/* Arabic verse */}
          <div className="rounded-xl bg-primary/5 p-3">
            <p className="arabic-text text-lg leading-[2.2] text-foreground text-right" dir="rtl">
              {arabicText}
            </p>
            {translation && (
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{translation}</p>
            )}
          </div>

          {/* Tafsir content */}
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : tafsir ? (
            <div className="space-y-2">
              <p
                className="text-sm leading-relaxed text-foreground"
                dir={source.startsWith("ar") ? "rtl" : "ltr"}
              >
                {tafsir.text}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {t("tafsir.source")}: {tafsir.source}
              </p>
            </div>
          ) : null}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
