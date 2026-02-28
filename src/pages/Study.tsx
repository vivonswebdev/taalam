import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Star, StarOff, PenLine, BookOpen, ChevronDown } from "lucide-react";
import { surahs } from "@/data/surahs";
import { useAyahStudy } from "@/hooks/useAyahStudy";
import { useTafsir, TAFSIR_SOURCES, type TafsirSourceId } from "@/hooks/useTafsir";
import { AVAILABLE_EDITIONS } from "@/hooks/useTranslationPreference";
import { Skeleton } from "@/components/ui/skeleton";

interface AyahData {
  number: number;
  arabic: string;
  translations: Record<string, string>;
}

export default function Study() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const surahNum = parseInt(params.get("surah") || "1");
  const surah = surahs.find((s) => s.number === surahNum) || surahs[0];

  const [ayahs, setAyahs] = useState<AyahData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAyah, setSelectedAyah] = useState<number | null>(null);
  const [showSurahPicker, setShowSurahPicker] = useState(false);

  const { isFavorite, toggleFavorite, getNote, saveNote } = useAyahStudy();
  const { getTafsirForAyah } = useTafsir();

  // Tafsir for selected ayah
  const [tafsirText, setTafsirText] = useState("");
  const [tafsirSource, setTafsirSource] = useState<TafsirSourceId>("ar.muyassar");
  const [tafsirLoading, setTafsirLoading] = useState(false);

  // Note editing
  const [noteText, setNoteText] = useState("");

  // Load all translations for the surah
  useEffect(() => {
    setLoading(true);
    setSelectedAyah(null);
    const editions = AVAILABLE_EDITIONS.map((e) => e.id);
    
    Promise.all(
      editions.map(async (edId) => {
        try {
          const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/${edId}`);
          if (!res.ok) return { edId, ayahs: [] };
          const json = await res.json();
          return { edId, ayahs: json.data?.ayahs || [] };
        } catch {
          return { edId, ayahs: [] };
        }
      })
    ).then((results) => {
      // Also fetch Arabic
      fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/ar.alafasy`)
        .then((r) => r.json())
        .then((arJson) => {
          const arAyahs = arJson.data?.ayahs || [];
          const combined: AyahData[] = arAyahs.map((a: any, i: number) => {
            const translations: Record<string, string> = {};
            results.forEach((r) => {
              if (r.ayahs[i]) translations[r.edId] = r.ayahs[i].text;
            });
            return { number: a.numberInSurah, arabic: a.text, translations };
          });
          setAyahs(combined);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    });
  }, [surahNum]);

  // Load tafsir when ayah selected
  useEffect(() => {
    if (selectedAyah === null) return;
    setTafsirLoading(true);
    setTafsirText("");
    getTafsirForAyah(surahNum, selectedAyah, tafsirSource).then((r) => {
      setTafsirText(r?.text || "");
      setTafsirLoading(false);
    });
  }, [selectedAyah, tafsirSource, surahNum]);

  // Load note when ayah selected
  useEffect(() => {
    if (selectedAyah === null) { setNoteText(""); return; }
    const note = getNote(surahNum, selectedAyah);
    setNoteText(note?.content || "");
  }, [selectedAyah, surahNum, getNote]);

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <button onClick={() => setShowSurahPicker(!showSurahPicker)} className="flex items-center gap-1.5">
            <h1 className="text-lg font-bold text-foreground truncate">{surah.name}</h1>
            <span className="font-arabic text-primary">{surah.nameArabic}</span>
            <ChevronDown size={14} className="text-muted-foreground" />
          </button>
          <p className="text-[10px] text-muted-foreground">Mode étude · {surah.versesCount} versets</p>
        </div>
      </div>

      {/* Surah picker */}
      {showSurahPicker && (
        <div className="px-4 pb-3">
          <div className="bg-card border border-border rounded-xl max-h-48 overflow-y-auto">
            {surahs.map((s) => (
              <button
                key={s.number}
                onClick={() => { navigate(`/study?surah=${s.number}`); setShowSurahPicker(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-accent/40 text-sm ${s.number === surahNum ? "bg-primary/10 text-primary font-bold" : "text-foreground"}`}
              >
                <span className="text-xs text-muted-foreground w-6">{s.number}</span>
                <span>{s.name}</span>
                <span className="font-arabic text-xs text-muted-foreground ml-auto">{s.nameArabic}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="px-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2 p-4 bg-card rounded-xl border border-border">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          ))}
        </div>
      ) : (
        <div className="px-4 space-y-3">
          {ayahs.map((ayah) => {
            const isSelected = selectedAyah === ayah.number;
            const fav = isFavorite(surahNum, ayah.number);
            const note = getNote(surahNum, ayah.number);

            return (
              <motion.div
                key={ayah.number}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl border p-4 transition-all cursor-pointer ${
                  isSelected ? "bg-primary/5 border-primary/30" : "bg-card border-border"
                }`}
                onClick={() => setSelectedAyah(isSelected ? null : ayah.number)}
              >
                {/* Header row */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/15 text-primary text-xs font-bold">
                    {ayah.number}
                  </span>
                  <div className="flex-1" />
                  {note && <PenLine size={12} className="text-primary" />}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(surahNum, ayah.number); }}
                    className={fav ? "text-yellow-500" : "text-muted-foreground"}
                  >
                    {fav ? <Star size={14} fill="currentColor" /> : <StarOff size={14} />}
                  </button>
                </div>

                {/* Arabic */}
                <p className="arabic-text text-xl leading-[2.2] text-foreground text-right mb-2" dir="rtl">
                  {ayah.arabic}
                </p>

                {/* Primary translation */}
                {Object.values(ayah.translations)[0] && (
                  <p className="text-sm text-muted-foreground leading-relaxed border-t border-border/30 pt-2">
                    {Object.values(ayah.translations)[0]}
                  </p>
                )}

                {/* Expanded: all translations + tafsir + notes */}
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3 space-y-3 border-t border-border pt-3"
                  >
                    {/* All translations */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Traductions</p>
                      {AVAILABLE_EDITIONS.map((ed) => {
                        const text = ayah.translations[ed.id];
                        if (!text) return null;
                        return (
                          <div key={ed.id} className="rounded-lg bg-muted/40 p-2.5">
                            <p className="text-[10px] font-bold text-primary mb-0.5">{ed.label}</p>
                            <p className="text-xs text-foreground leading-relaxed">{text}</p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Tafsir */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <BookOpen size={10} /> Tafsîr
                      </p>
                      <div className="flex gap-1 flex-wrap">
                        {TAFSIR_SOURCES.map((s) => (
                          <button
                            key={s.id}
                            onClick={(e) => { e.stopPropagation(); setTafsirSource(s.id); }}
                            className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                              tafsirSource === s.id ? "bg-primary text-primary-foreground border-primary" : "bg-muted border-border text-muted-foreground"
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                      {tafsirLoading ? (
                        <Skeleton className="h-12 w-full" />
                      ) : tafsirText ? (
                        <p className="text-xs text-foreground leading-relaxed rounded-lg bg-muted/40 p-2.5" dir={tafsirSource.startsWith("ar") ? "rtl" : "ltr"}>
                          {tafsirText}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">Aucun tafsir disponible</p>
                      )}
                    </div>

                    {/* Note */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <PenLine size={10} /> Ma note
                      </p>
                      <textarea
                        value={noteText}
                        onChange={(e) => { e.stopPropagation(); setNoteText(e.target.value); }}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="Écris ta réflexion..."
                        className="w-full min-h-[60px] rounded-lg bg-muted/40 border border-border p-2.5 text-xs text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      <button
                        onClick={(e) => { e.stopPropagation(); saveNote(surahNum, ayah.number, noteText); }}
                        disabled={!noteText.trim()}
                        className="text-[10px] font-bold bg-primary text-primary-foreground px-3 py-1 rounded-lg disabled:opacity-40"
                      >
                        Sauvegarder
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
