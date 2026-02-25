import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Bookmark, BookmarkCheck, Trash2, Play, Tag, Plus, X,
} from "lucide-react";
import { useBookmarks, type BookmarkAyah, type BookmarkRange } from "@/hooks/useBookmarks";
import { useLanguage } from "@/hooks/useLanguage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Bookmarks() {
  const { bookmarks, ranges, removeBookmark, addRange, removeRange } = useBookmarks();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [tab, setTab] = useState<"ayahs" | "ranges">("ayahs");
  const [showAddRange, setShowAddRange] = useState(false);

  // Range form state
  const [rangeLabel, setRangeLabel] = useState("");
  const [fromSurah, setFromSurah] = useState("");
  const [fromAyah, setFromAyah] = useState("");
  const [toSurah, setToSurah] = useState("");
  const [toAyah, setToAyah] = useState("");

  const handleAddRange = () => {
    if (!rangeLabel.trim() || !fromSurah || !fromAyah || !toSurah || !toAyah) return;
    addRange({
      label: rangeLabel.trim(),
      fromSurah: Number(fromSurah),
      fromSurahName: `Surah ${fromSurah}`,
      fromAyah: Number(fromAyah),
      toSurah: Number(toSurah),
      toSurahName: `Surah ${toSurah}`,
      toAyah: Number(toAyah),
    });
    setRangeLabel("");
    setFromSurah("");
    setFromAyah("");
    setToSurah("");
    setToAyah("");
    setShowAddRange(false);
  };

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <div className="px-6 pt-14 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">{t("bookmarks.title")}</h1>
            <p className="text-xs text-muted-foreground">{t("bookmarks.subtitle")}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 mb-4">
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          <button
            onClick={() => setTab("ayahs")}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              tab === "ayahs" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            <Bookmark size={14} className="inline mr-1" />
            {t("bookmarks.ayahs")} ({bookmarks.length})
          </button>
          <button
            onClick={() => setTab("ranges")}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              tab === "ranges" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            <Tag size={14} className="inline mr-1" />
            {t("bookmarks.ranges")} ({ranges.length})
          </button>
        </div>
      </div>

      {/* Ayahs tab */}
      {tab === "ayahs" && (
        <div className="px-6 space-y-2">
          {bookmarks.length === 0 && (
            <div className="text-center py-12">
              <Bookmark size={40} className="mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">{t("bookmarks.noAyahs")}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("bookmarks.noAyahsHint")}</p>
            </div>
          )}
          {bookmarks.map((bm) => (
            <motion.div
              key={bm.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-xl p-3 flex items-start gap-3"
            >
              <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                {bm.surahNumber}:{bm.ayahNumber}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{bm.surahNameArabic} · {bm.surahName}</p>
                <p className="arabic-text text-base text-foreground mt-1 leading-relaxed line-clamp-2">{bm.arabicText}</p>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button
                  onClick={() => navigate(`/quran?surah=${bm.surahNumber}&ayah=${bm.ayahNumber - 1}&mode=mushaf`)}
                  className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center"
                >
                  <Play size={14} />
                </button>
                <button
                  onClick={() => removeBookmark(bm.surahNumber, bm.ayahNumber)}
                  className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Ranges tab */}
      {tab === "ranges" && (
        <div className="px-6 space-y-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddRange(!showAddRange)}
            className="w-full"
          >
            <Plus size={14} className="mr-1" />
            {t("bookmarks.addRange")}
          </Button>

          <AnimatePresence>
            {showAddRange && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                  <Input
                    placeholder={t("bookmarks.labelPlaceholder")}
                    value={rangeLabel}
                    onChange={(e) => setRangeLabel(e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder={t("bookmarks.fromSurah")}
                      value={fromSurah}
                      onChange={(e) => setFromSurah(e.target.value)}
                      min={1}
                      max={114}
                    />
                    <Input
                      type="number"
                      placeholder={t("bookmarks.fromAyah")}
                      value={fromAyah}
                      onChange={(e) => setFromAyah(e.target.value)}
                      min={1}
                    />
                    <Input
                      type="number"
                      placeholder={t("bookmarks.toSurah")}
                      value={toSurah}
                      onChange={(e) => setToSurah(e.target.value)}
                      min={1}
                      max={114}
                    />
                    <Input
                      type="number"
                      placeholder={t("bookmarks.toAyah")}
                      value={toAyah}
                      onChange={(e) => setToAyah(e.target.value)}
                      min={1}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddRange} className="flex-1">{t("parent.save")}</Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowAddRange(false)}>
                      <X size={14} />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {ranges.length === 0 && !showAddRange && (
            <div className="text-center py-12">
              <Tag size={40} className="mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">{t("bookmarks.noRanges")}</p>
            </div>
          )}

          {ranges.map((r) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-xl p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-sm text-foreground">{r.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t("bookmarks.from")} {r.fromSurah}:{r.fromAyah} → {r.toSurah}:{r.toAyah}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => navigate(`/quran?surah=${r.fromSurah}&ayah=${r.fromAyah - 1}&mode=mushaf`)}
                    className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center"
                  >
                    <Play size={14} />
                  </button>
                  <button
                    onClick={() => removeRange(r.id)}
                    className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
