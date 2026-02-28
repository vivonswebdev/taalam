import { useEffect, useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, X, Star, StarOff, PenLine, Share2, Trash2 } from "lucide-react";
import { useTafsir, TAFSIR_SOURCES, type TafsirSourceId, type TafsirAyah } from "@/hooks/useTafsir";
import { useAyahStudy, type AyahNote } from "@/hooks/useAyahStudy";
import { AVAILABLE_EDITIONS } from "@/hooks/useTranslationPreference";

interface StudySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  surahNumber: number;
  ayahNumber: number;
  arabicText: string;
  translation?: string;
  t: (key: string) => string;
}

export default function StudySheet({
  open,
  onOpenChange,
  surahNumber,
  ayahNumber,
  arabicText,
  translation,
  t,
}: StudySheetProps) {
  const { getTafsirForAyah, loading: tafsirLoading, error: tafsirError } = useTafsir();
  const { isFavorite, toggleFavorite, getNote, saveNote, deleteNote, getSharedNotes } = useAyahStudy();

  const [tafsir, setTafsir] = useState<TafsirAyah | null>(null);
  const [tafsirSource, setTafsirSource] = useState<TafsirSourceId>("ar.muyassar");
  const [tab, setTab] = useState<"translations" | "tafsir" | "notes">("translations");

  // Multi-translations
  const [extraTranslations, setExtraTranslations] = useState<Record<string, string>>({});
  const [loadingTranslations, setLoadingTranslations] = useState(false);

  // Notes
  const [noteText, setNoteText] = useState("");
  const [isShared, setIsShared] = useState(false);
  const [sharedNotes, setSharedNotes] = useState<AyahNote[]>([]);

  const fav = isFavorite(surahNumber, ayahNumber);

  // Load tafsir when tab changes
  useEffect(() => {
    if (!open || tab !== "tafsir") return;
    setTafsir(null);
    getTafsirForAyah(surahNumber, ayahNumber, tafsirSource).then((r) => {
      if (r) setTafsir(r);
    });
  }, [open, surahNumber, ayahNumber, tafsirSource, tab]);

  // Load multi-translations
  useEffect(() => {
    if (!open || tab !== "translations") return;
    setLoadingTranslations(true);
    const fetches = AVAILABLE_EDITIONS.map(async (ed) => {
      try {
        const res = await fetch(`https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/${ed.id}`);
        if (!res.ok) return { id: ed.id, text: "" };
        const json = await res.json();
        return { id: ed.id, text: json.data?.text || "" };
      } catch {
        return { id: ed.id, text: "" };
      }
    });
    Promise.all(fetches).then((results) => {
      const map: Record<string, string> = {};
      results.forEach((r) => { if (r.text) map[r.id] = r.text; });
      setExtraTranslations(map);
      setLoadingTranslations(false);
    });
  }, [open, surahNumber, ayahNumber, tab]);

  // Load note
  useEffect(() => {
    if (!open) return;
    const note = getNote(surahNumber, ayahNumber);
    setNoteText(note?.content || "");
    setIsShared(note?.is_shared || false);
  }, [open, surahNumber, ayahNumber, getNote]);

  // Load shared notes
  useEffect(() => {
    if (!open || tab !== "notes") return;
    getSharedNotes(surahNumber, ayahNumber).then(setSharedNotes);
  }, [open, tab, surahNumber, ayahNumber]);

  const tabs = [
    { key: "translations" as const, label: t("study.translations") },
    { key: "tafsir" as const, label: t("study.tafsir") },
    { key: "notes" as const, label: t("study.notes") },
  ];

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="pb-2">
          <div className="flex items-center justify-between">
            <DrawerTitle className="flex items-center gap-2 text-base">
              <BookOpen size={16} className="text-primary" />
              {t("study.ayah")} {ayahNumber}
            </DrawerTitle>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleFavorite(surahNumber, ayahNumber)}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${fav ? "bg-yellow-500/15 text-yellow-500" : "bg-muted text-muted-foreground"}`}
              >
                {fav ? <Star size={16} fill="currentColor" /> : <StarOff size={16} />}
              </button>
              <DrawerClose asChild>
                <button className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <X size={16} />
                </button>
              </DrawerClose>
            </div>
          </div>
        </DrawerHeader>

        {/* Arabic verse */}
        <div className="px-4 pb-2">
          <div className="rounded-xl bg-primary/5 p-3">
            <p className="arabic-text text-lg leading-[2.2] text-foreground text-right" dir="rtl">
              {arabicText}
            </p>
            {translation && (
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{translation}</p>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 pb-2 flex gap-1.5">
          {tabs.map((tb) => (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className={`flex-1 text-xs font-semibold py-2 rounded-xl transition-colors ${
                tab === tb.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {tb.label}
            </button>
          ))}
        </div>

        <div className="px-4 pb-6 overflow-y-auto max-h-[50vh] space-y-3">
          {/* ═══ TRANSLATIONS TAB ═══ */}
          {tab === "translations" && (
            loadingTranslations ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            ) : (
              <div className="space-y-3">
                {AVAILABLE_EDITIONS.map((ed) => {
                  const text = extraTranslations[ed.id];
                  if (!text) return null;
                  return (
                    <div key={ed.id} className="rounded-xl bg-muted/50 border border-border p-3">
                      <p className="text-[10px] font-bold text-primary mb-1">{ed.label}</p>
                      <p className="text-sm text-foreground leading-relaxed">{text}</p>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* ═══ TAFSIR TAB ═══ */}
          {tab === "tafsir" && (
            <>
              <div className="flex gap-1.5 flex-wrap">
                {TAFSIR_SOURCES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setTafsirSource(s.id)}
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                      tafsirSource === s.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted border-border text-muted-foreground"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              {tafsirLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              ) : tafsirError ? (
                <p className="text-sm text-destructive">{tafsirError}</p>
              ) : tafsir ? (
                <div className="space-y-2">
                  <p className="text-sm leading-relaxed text-foreground" dir={tafsirSource.startsWith("ar") ? "rtl" : "ltr"}>
                    {tafsir.text}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Source: {tafsir.source}</p>
                </div>
              ) : null}
            </>
          )}

          {/* ═══ NOTES TAB ═══ */}
          {tab === "notes" && (
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <PenLine size={14} className="text-primary" />
                  <span className="text-xs font-bold text-foreground">{t("study.myNote")}</span>
                </div>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder={t("study.notePlaceholder")}
                  className="w-full min-h-[80px] rounded-xl bg-muted/50 border border-border p-3 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                    <Share2 size={12} />
                    <span>{t("study.share")}</span>
                    <input
                      type="checkbox"
                      checked={isShared}
                      onChange={(e) => setIsShared(e.target.checked)}
                      className="accent-primary"
                    />
                  </label>
                  <div className="flex gap-2">
                    {getNote(surahNumber, ayahNumber) && (
                      <button
                        onClick={() => { deleteNote(surahNumber, ayahNumber); setNoteText(""); }}
                        className="text-xs text-destructive flex items-center gap-1"
                      >
                        <Trash2 size={12} /> {t("study.delete")}
                      </button>
                    )}
                    <button
                      onClick={() => saveNote(surahNumber, ayahNumber, noteText, isShared)}
                      disabled={!noteText.trim()}
                      className="text-xs font-bold bg-primary text-primary-foreground px-3 py-1.5 rounded-lg disabled:opacity-40"
                    >
                      {t("study.save")}
                    </button>
                  </div>
                </div>
              </div>

              {/* Shared notes from others */}
              {sharedNotes.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Notes partagées</p>
                  {sharedNotes.map((n) => (
                    <div key={n.id} className="rounded-xl bg-muted/30 border border-border p-3">
                      <p className="text-sm text-foreground leading-relaxed">{n.content}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(n.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
