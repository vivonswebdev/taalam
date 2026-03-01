import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Brain, CheckCircle2, XCircle, AlertTriangle,
  Plus, Trash2, BookOpen, Zap, RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useHifzSRS, type HifzItem } from "@/hooks/useHifzSRS";
import { surahs } from "@/data/surahs";
import { useLanguage } from "@/hooks/useLanguage";

function getSurahName(num: number) {
  const s = surahs.find((s) => s.number === num);
  return s ? s.nameArabic : `Sourate ${num}`;
}

function getAyahsText(surahNum: number, from: number, to: number): string {
  const s = surahs.find((s) => s.number === surahNum);
  if (!s) return "";
  return s.ayahs
    .filter((a) => a.number >= from && a.number <= to)
    .map((a) => a.arabic)
    .join(" ۞ ");
}

const QUALITY_OPTIONS = [
  { value: 0, label: "Oublié", emoji: "😵", color: "bg-destructive/15 text-destructive border-destructive/30" },
  { value: 1, label: "Très dur", emoji: "😰", color: "bg-destructive/10 text-destructive border-destructive/20" },
  { value: 2, label: "Dur", emoji: "😓", color: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  { value: 3, label: "Moyen", emoji: "🤔", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  { value: 4, label: "Bien", emoji: "😊", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  { value: 5, label: "Parfait", emoji: "🌟", color: "bg-primary/10 text-primary border-primary/20" },
];

function StatusBadge({ status }: { status: string }) {
  const styles = {
    learning: "bg-blue-500/10 text-blue-600",
    reviewing: "bg-amber-500/10 text-amber-600",
    mastered: "bg-emerald-500/10 text-emerald-600",
  };
  const labels = { learning: "Apprentissage", reviewing: "Révision", mastered: "Maîtrisé" };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${styles[status as keyof typeof styles] || ""}`}>
      {labels[status as keyof typeof labels] || status}
    </span>
  );
}

export default function HifzTodayPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const {
    items, todayItems, loading,
    learningCount, reviewingCount, masteredCount,
    addItem, gradeReview, removeItem,
  } = useHifzSRS();

  const [reviewingItemId, setReviewingItemId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addSurah, setAddSurah] = useState(114);
  const [addFrom, setAddFrom] = useState(1);
  const [addTo, setAddTo] = useState(6);
  const [view, setView] = useState<"today" | "all">("today");

  const reviewingItem = reviewingItemId ? todayItems.find((i) => i.id === reviewingItemId) : null;

  const handleGrade = async (quality: number) => {
    if (!reviewingItemId) return;
    await gradeReview(reviewingItemId, quality);
    // Move to next item
    const currentIdx = todayItems.findIndex((i) => i.id === reviewingItemId);
    const nextItem = todayItems[currentIdx + 1];
    setReviewingItemId(nextItem?.id || null);
  };

  const handleAdd = async () => {
    await addItem(addSurah, addFrom, addTo);
    setShowAdd(false);
  };

  const selectedSurah = surahs.find((s) => s.number === addSurah);
  const maxAyah = selectedSurah?.versesCount || 286;

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <div className="px-6 pt-14 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
            <ArrowLeft size={18} className="text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">🧠 Hifz SRS</h1>
            <p className="text-sm text-muted-foreground">Répétition espacée intelligente</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 mb-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-blue-600">{learningCount}</p>
            <p className="text-[10px] font-semibold text-blue-600/70">Apprentissage</p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-amber-600">{reviewingCount}</p>
            <p className="text-[10px] font-semibold text-amber-600/70">Révision</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-emerald-600">{masteredCount}</p>
            <p className="text-[10px] font-semibold text-emerald-600/70">Maîtrisé</p>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="px-6 mb-4 flex gap-2">
        <button
          onClick={() => setView("today")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
            view === "today" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          📅 Aujourd'hui ({todayItems.length})
        </button>
        <button
          onClick={() => setView("all")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
            view === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          📚 Tous ({items.length})
        </button>
      </div>

      {/* Loading */}
      {loading && <p className="text-sm text-muted-foreground text-center py-8">Chargement…</p>}

      {/* ═══ REVIEW MODE ═══ */}
      <AnimatePresence>
        {reviewingItem && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="px-6 mb-4"
          >
            <div className="bg-card border-2 border-primary/30 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-primary">
                  {getSurahName(reviewingItem.surah_number)} · Versets {reviewingItem.ayah_from}-{reviewingItem.ayah_to}
                </p>
                <StatusBadge status={reviewingItem.status} />
              </div>

              <div className="rounded-xl bg-primary/5 p-4">
                <p className="arabic-text text-lg leading-[2.4] text-foreground text-right" dir="rtl">
                  {getAyahsText(reviewingItem.surah_number, reviewingItem.ayah_from, reviewingItem.ayah_to)}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2 text-center">Comment était votre récitation ?</p>
                <div className="grid grid-cols-3 gap-2">
                  {QUALITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleGrade(opt.value)}
                      className={`border rounded-xl p-2.5 text-center transition-colors hover:scale-[1.02] active:scale-[0.98] ${opt.color}`}
                    >
                      <span className="text-xl">{opt.emoji}</span>
                      <p className="text-[10px] font-bold mt-0.5">{opt.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Intervalle : {reviewingItem.interval_days}j</span>
                <span>Facilité : {reviewingItem.ease_factor}</span>
                <span>Reps : {reviewingItem.repetitions}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ TODAY VIEW ═══ */}
      {view === "today" && !reviewingItem && !loading && (
        <div className="px-6 space-y-2">
          {todayItems.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 size={40} className="mx-auto text-emerald-500/40 mb-3" />
              <p className="text-sm font-semibold text-foreground">Tout est révisé pour aujourd'hui ! 🎉</p>
              <p className="text-xs text-muted-foreground mt-1">Revenez demain ou ajoutez de nouveaux passages.</p>
            </div>
          ) : (
            <>
              <button
                onClick={() => setReviewingItemId(todayItems[0]?.id || null)}
                className="w-full bg-primary text-primary-foreground rounded-2xl py-4 text-sm font-bold flex items-center justify-center gap-2 mb-3"
              >
                <Zap size={16} /> Commencer la révision ({todayItems.length} passages)
              </button>
              {todayItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-card border border-border rounded-2xl p-4"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-bold text-primary">
                      {getSurahName(item.surah_number)} · {item.ayah_from}-{item.ayah_to}
                    </p>
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>Intervalle : {item.interval_days}j</span>
                    <button
                      onClick={() => setReviewingItemId(item.id)}
                      className="text-primary font-bold"
                    >
                      Réviser →
                    </button>
                  </div>
                </motion.div>
              ))}
            </>
          )}
        </div>
      )}

      {/* ═══ ALL VIEW ═══ */}
      {view === "all" && !loading && (
        <div className="px-6 space-y-2">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <Brain size={40} className="mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">Aucun passage ajouté.</p>
              <p className="text-xs text-muted-foreground mt-1">Appuyez sur + pour ajouter un passage à mémoriser.</p>
            </div>
          ) : (
            items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-card border border-border rounded-2xl p-4"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-bold text-primary">
                    {getSurahName(item.surah_number)} · Versets {item.ayah_from}-{item.ayah_to}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status={item.status} />
                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center"
                    >
                      <Trash2 size={11} className="text-destructive" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
                  <span>Prochaine révision : {item.next_review_date}</span>
                  <span>Facilité : {item.ease_factor} · Reps : {item.repetitions}</span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* ═══ ADD MODAL ═══ */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center"
            onClick={() => setShowAdd(false)}
          >
            <motion.div
              initial={{ y: 200 }}
              animate={{ y: 0 }}
              exit={{ y: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-background border-t border-border rounded-t-2xl p-6 space-y-4"
            >
              <h3 className="text-base font-bold text-foreground">Ajouter un passage</h3>

              {/* Surah selector */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Sourate</label>
                <select
                  value={addSurah}
                  onChange={(e) => {
                    setAddSurah(Number(e.target.value));
                    setAddFrom(1);
                    setAddTo(Math.min(6, surahs.find((s) => s.number === Number(e.target.value))?.versesCount || 6));
                  }}
                  className="w-full mt-1 rounded-xl bg-muted border border-border px-3 py-2.5 text-sm text-foreground"
                >
                  {surahs.map((s) => (
                    <option key={s.number} value={s.number}>
                      {s.number}. {s.nameArabic} – {s.frenchName} ({s.versesCount} v.)
                    </option>
                  ))}
                </select>
              </div>

              {/* Ayah range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Du verset</label>
                  <input
                    type="number"
                    min={1}
                    max={maxAyah}
                    value={addFrom}
                    onChange={(e) => setAddFrom(Number(e.target.value))}
                    className="w-full mt-1 rounded-xl bg-muted border border-border px-3 py-2.5 text-sm text-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Au verset</label>
                  <input
                    type="number"
                    min={addFrom}
                    max={maxAyah}
                    value={addTo}
                    onChange={(e) => setAddTo(Number(e.target.value))}
                    className="w-full mt-1 rounded-xl bg-muted border border-border px-3 py-2.5 text-sm text-foreground"
                  />
                </div>
              </div>

              {/* Preview */}
              {selectedSurah && (
                <div className="rounded-xl bg-primary/5 p-3 max-h-32 overflow-y-auto">
                  <p className="arabic-text text-sm leading-[2] text-foreground text-right" dir="rtl">
                    {getAyahsText(addSurah, addFrom, addTo)}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setShowAdd(false)}
                  className="flex-1 py-3 rounded-xl bg-muted text-muted-foreground text-sm font-semibold"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAdd}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold"
                >
                  Ajouter
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
