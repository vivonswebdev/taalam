import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Star, PenLine, Trash2, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAyahStudy, type AyahFavorite, type AyahNote } from "@/hooks/useAyahStudy";
import { surahs } from "@/data/surahs";
import StudySheet from "@/components/StudySheet";
import { useLanguage } from "@/hooks/useLanguage";

function getSurahName(num: number) {
  const s = surahs.find((s) => s.number === num);
  return s ? `${s.nameArabic} – ${s.frenchName}` : `Sourate ${num}`;
}

function getAyahArabic(surahNum: number, ayahNum: number): string {
  const s = surahs.find((s) => s.number === surahNum);
  if (!s) return "";
  const a = s.ayahs.find((a) => a.number === ayahNum);
  return a?.arabic || "";
}

export default function FavoritesNotesPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { favorites, notes, loading, toggleFavorite, deleteNote } = useAyahStudy();
  const [tab, setTab] = useState<"favorites" | "notes">("favorites");

  // Study sheet state
  const [studyOpen, setStudyOpen] = useState(false);
  const [studySurah, setStudySurah] = useState(1);
  const [studyAyah, setStudyAyah] = useState(1);

  const openStudy = (surah: number, ayah: number) => {
    setStudySurah(surah);
    setStudyAyah(ayah);
    setStudyOpen(true);
  };

  const openInReading = (surah: number, ayah: number) => {
    navigate(`/reading?surah=${surah}&ayah=${ayah}`);
  };

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <div className="px-6 pt-14 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
            <ArrowLeft size={18} className="text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">⭐ Favoris & Notes</h1>
            <p className="text-sm text-muted-foreground">Vos versets préférés et annotations</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 mb-4 flex gap-2">
        <button
          onClick={() => setTab("favorites")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
            tab === "favorites" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          <Star size={14} /> Favoris ({favorites.length})
        </button>
        <button
          onClick={() => setTab("notes")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
            tab === "notes" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          <PenLine size={14} /> Notes ({notes.length})
        </button>
      </div>

      {/* Content */}
      <div className="px-6 space-y-2">
        {loading && (
          <p className="text-sm text-muted-foreground text-center py-8">Chargement…</p>
        )}

        {/* ═══ FAVORITES ═══ */}
        {tab === "favorites" && !loading && (
          favorites.length === 0 ? (
            <div className="text-center py-12">
              <Star size={32} className="mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">Aucun favori pour le moment.</p>
              <p className="text-xs text-muted-foreground mt-1">Appuyez sur ⭐ dans la lecture pour ajouter un verset.</p>
            </div>
          ) : (
            favorites.map((fav, i) => {
              const arabic = getAyahArabic(fav.surah_number, fav.ayah_number);
              return (
                <motion.div
                  key={fav.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-card border border-border rounded-2xl p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-primary">
                      {getSurahName(fav.surah_number)} · Verset {fav.ayah_number}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openStudy(fav.surah_number, fav.ayah_number)}
                        className="w-7 h-7 rounded-full bg-muted flex items-center justify-center"
                        title="Étudier"
                      >
                        <BookOpen size={13} className="text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => toggleFavorite(fav.surah_number, fav.ayah_number)}
                        className="w-7 h-7 rounded-full bg-yellow-500/15 flex items-center justify-center"
                        title="Retirer des favoris"
                      >
                        <Star size={13} className="text-yellow-500" fill="currentColor" />
                      </button>
                    </div>
                  </div>
                  {arabic && (
                    <button
                      onClick={() => openInReading(fav.surah_number, fav.ayah_number)}
                      className="w-full text-right"
                    >
                      <p className="arabic-text text-base leading-[2.2] text-foreground" dir="rtl">
                        {arabic}
                      </p>
                    </button>
                  )}
                </motion.div>
              );
            })
          )
        )}

        {/* ═══ NOTES ═══ */}
        {tab === "notes" && !loading && (
          notes.length === 0 ? (
            <div className="text-center py-12">
              <PenLine size={32} className="mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">Aucune note pour le moment.</p>
              <p className="text-xs text-muted-foreground mt-1">Ajoutez des notes depuis le panneau d'étude d'un verset.</p>
            </div>
          ) : (
            notes.map((note, i) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-card border border-border rounded-2xl p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-primary">
                    {getSurahName(note.surah_number)} · Verset {note.ayah_number}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openStudy(note.surah_number, note.ayah_number)}
                      className="w-7 h-7 rounded-full bg-muted flex items-center justify-center"
                      title="Étudier"
                    >
                      <BookOpen size={13} className="text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => openInReading(note.surah_number, note.ayah_number)}
                      className="w-7 h-7 rounded-full bg-muted flex items-center justify-center"
                      title="Ouvrir dans la lecture"
                    >
                      <ArrowLeft size={13} className="text-muted-foreground rotate-180" />
                    </button>
                    <button
                      onClick={() => deleteNote(note.surah_number, note.ayah_number)}
                      className="w-7 h-7 rounded-full bg-destructive/10 flex items-center justify-center"
                      title="Supprimer"
                    >
                      <Trash2 size={13} className="text-destructive" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{note.content}</p>
                {note.is_shared && (
                  <span className="inline-block text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                    Partagée
                  </span>
                )}
                <p className="text-[10px] text-muted-foreground">
                  {new Date(note.updated_at).toLocaleDateString("fr-FR")}
                </p>
              </motion.div>
            ))
          )
        )}
      </div>

      {/* Study Sheet */}
      <StudySheet
        open={studyOpen}
        onOpenChange={setStudyOpen}
        surahNumber={studySurah}
        ayahNumber={studyAyah}
        arabicText={getAyahArabic(studySurah, studyAyah)}
        t={t}
      />
    </div>
  );
}
