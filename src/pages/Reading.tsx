import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Loader2, ArrowLeft, Settings2, Moon, Sun, Type, User,
  Bookmark, ChevronRight,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useTranslationPreference } from "@/hooks/useTranslationPreference";
import { useReadingSettings, ARABIC_FONTS, RECITERS } from "@/hooks/useReadingSettings";
import { useBookmarks } from "@/hooks/useBookmarks";
import { fetchSurahList, fetchFullSurah, type SurahMeta } from "@/lib/quranData";
import { surahs, type Surah } from "@/data/surahs";
import MushafReader from "@/components/MushafReader";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Reading() {
  const { t } = useLanguage();
  const { resolvedEditionId, isArabicOnly } = useTranslationPreference();
  const { settings, setDarkModeReading, setArabicFont, setDefaultReciter, arabicFontFamily } = useReadingSettings();
  const { readingPosition } = useBookmarks();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // URL params for deep-linking
  const urlSurah = searchParams.get("surah");
  const urlAyah = searchParams.get("ayah");

  const [allSurahs, setAllSurahs] = useState<SurahMeta[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [loading, setLoading] = useState(false);
  const [startAyah, setStartAyah] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [translations, setTranslations] = useState<Record<number, string>>({});

  // Fetch 114 surahs list
  useEffect(() => {
    fetchSurahList().then(setAllSurahs).catch(console.error);
  }, []);

  // Deep-link handling
  useEffect(() => {
    if (urlSurah) {
      const num = Number(urlSurah);
      handleSelectSurah(num, urlAyah ? Number(urlAyah) : 0);
    }
  }, []);

  // Fetch translations when surah changes
  useEffect(() => {
    if (!selectedSurah || isArabicOnly) {
      setTranslations({});
      return;
    }
    fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah.number}/${resolvedEditionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.data?.ayahs) {
          const map: Record<number, string> = {};
          data.data.ayahs.forEach((a: { text: string }, i: number) => {
            map[i] = a.text;
          });
          setTranslations(map);
        }
      })
      .catch(() => {});
  }, [selectedSurah, resolvedEditionId, isArabicOnly]);

  // Apply reading dark mode
  useEffect(() => {
    if (selectedSurah && settings.darkModeReading) {
      document.documentElement.classList.add("dark");
    }
    return () => {
      if (settings.darkModeReading) {
        document.documentElement.classList.remove("dark");
      }
    };
  }, [selectedSurah, settings.darkModeReading]);

  const handleSelectSurah = async (surahNumber: number, ayah = 0) => {
    const local = surahs.find((s) => s.number === surahNumber);
    if (local) {
      setSelectedSurah(local);
      setStartAyah(ayah);
      return;
    }
    setLoading(true);
    try {
      const full = await fetchFullSurah(surahNumber);
      setSelectedSurah(full);
      setStartAyah(ayah);
    } catch (e) {
      console.error("Failed to load surah", e);
    } finally {
      setLoading(false);
    }
  };

  const filteredSurahs = allSurahs.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      s.nameArabic.includes(q) ||
      s.englishName.toLowerCase().includes(q) ||
      String(s.number).includes(q)
    );
  });

  // ─── Reader View ──────────────────────────────────────────
  if (selectedSurah) {
    return (
      <div style={{ "--arabic-font": arabicFontFamily } as React.CSSProperties}>
        <style>{`
          .arabic-text { font-family: ${arabicFontFamily} !important; }
        `}</style>
        <MushafReader
          surah={selectedSurah}
          translations={translations}
          isArabicOnly={isArabicOnly}
          onBack={() => setSelectedSurah(null)}
          t={t}
          startAtAyah={startAyah}
        />
      </div>
    );
  }

  // ─── Surah List View ──────────────────────────────────────
  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <div className="px-6 pt-14 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">📖 {t("reading.title")}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{t("reading.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/bookmarks")}
              className="w-9 h-9 rounded-full bg-muted flex items-center justify-center"
            >
              <Bookmark size={18} className="text-foreground" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-9 h-9 rounded-full bg-muted flex items-center justify-center"
            >
              <Settings2 size={18} className="text-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mx-6 mb-4 bg-card border border-border rounded-2xl p-4 space-y-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("reading.settings")}
              </p>

              {/* Dark mode for reading */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Moon size={16} className="text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{t("reading.darkMode")}</span>
                </div>
                <button
                  onClick={() => setDarkModeReading(!settings.darkModeReading)}
                  className={`w-12 h-7 rounded-full transition-colors relative ${settings.darkModeReading ? "bg-primary" : "bg-muted"}`}
                >
                  <motion.div
                    animate={{ x: settings.darkModeReading ? 20 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute top-1 w-5 h-5 rounded-full bg-card shadow-md"
                  />
                </button>
              </div>

              {/* Arabic Font */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Type size={16} className="text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{t("reading.arabicFont")}</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {ARABIC_FONTS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setArabicFont(f.id)}
                      className={`px-3 py-2 rounded-xl border-2 text-xs font-medium transition-colors ${
                        settings.arabicFont === f.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:bg-accent/50 text-foreground"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Default Reciter */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <User size={16} className="text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{t("reading.defaultReciter")}</span>
                </div>
                <div className="space-y-1.5">
                  {RECITERS.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setDefaultReciter(r.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl border-2 transition-colors ${
                        settings.defaultReciter === r.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:bg-accent/50"
                      }`}
                    >
                      <span className={`text-xs font-semibold ${settings.defaultReciter === r.id ? "text-primary" : "text-foreground"}`}>
                        {r.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground ml-2 font-arabic">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resume reading card */}
      {readingPosition && (
        <div className="px-6 mb-4">
          <motion.button
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => handleSelectSurah(readingPosition.surahNumber, readingPosition.ayahIndex)}
            className="w-full flex items-center gap-3 bg-primary/5 border-2 border-primary/20 rounded-2xl px-4 py-3 text-left hover:bg-primary/10 transition-colors"
          >
            <span className="w-10 h-10 rounded-xl bg-primary/15 text-primary text-sm font-bold flex items-center justify-center shrink-0">
              📖
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-primary font-semibold uppercase tracking-wider">
                {t("reading.resume")}
              </p>
              <p className="text-sm text-foreground font-medium">
                {t("reading.resumeSurah")} {readingPosition.surahNumber} · {t("detail.verse")} {readingPosition.ayahIndex + 1}
              </p>
            </div>
            <ChevronRight size={18} className="text-primary shrink-0" />
          </motion.button>
        </div>
      )}

      {/* Search */}
      <div className="px-6 mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("reading.searchPlaceholder")}
            className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-8 gap-2 text-primary">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm font-medium">{t("reading.loading")}</span>
        </div>
      )}

      {/* Surah list */}
      <div className="px-6 space-y-1.5">
        {filteredSurahs.map((s, i) => (
          <motion.button
            key={s.number}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.008, 0.4) }}
            onClick={() => handleSelectSurah(s.number)}
            className="w-full flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-xl hover:bg-accent/30 transition-colors text-left"
          >
            <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
              {s.number}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-arabic text-lg text-foreground">{s.nameArabic}</span>
                <span className="text-[10px] text-muted-foreground">{s.revelationType}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {s.name} · {s.englishName} · {s.versesCount} {t("detail.verses")}
              </p>
            </div>
          </motion.button>
        ))}
        {filteredSurahs.length === 0 && !loading && (
          <p className="text-center text-sm text-muted-foreground py-6">{t("reading.noResults")}</p>
        )}
      </div>
    </div>
  );
}
