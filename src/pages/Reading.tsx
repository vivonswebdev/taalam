import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Loader2, ArrowLeft, Settings2, Moon, Sun, Type, User,
  Bookmark, ChevronRight, Star,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useTranslationPreference } from "@/hooks/useTranslationPreference";
import { useReadingSettings, ARABIC_FONTS, RECITERS } from "@/hooks/useReadingSettings";
import { useBookmarks } from "@/hooks/useBookmarks";
import { fetchSurahList, fetchFullSurah, type SurahMeta } from "@/lib/quranData";
import { surahs, type Surah } from "@/data/surahs";
import MushafReader from "@/components/MushafReader";
import { useGlobalAudio } from "@/hooks/useGlobalAudio";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useImmersiveBg, BG_OPTIONS, type BgTheme } from "@/hooks/useImmersiveBg";
import { getEpicBg } from "@/lib/epicBg";

import readingBg from "@/assets/reading-bg.jpg";
import FloatingXpWidget from "@/components/FloatingXpWidget";
import tarteelBg from "@/assets/tarteel-bg.jpg";
import quizBg from "@/assets/quiz-bg.jpg";
import galaxyBg from "@/assets/bg-galaxy.jpg";
import gardenBg from "@/assets/bg-garden.jpg";
import oceanBg from "@/assets/bg-ocean.jpg";
import starryBg from "@/assets/bg-starry-calligraphy.jpg";
import forestBg from "@/assets/bg-forest.jpg";
import auroraBg from "@/assets/bg-aurora.jpg";
import sunsetBg from "@/assets/bg-sunset.jpg";

const BG_THUMBS: Record<BgTheme, string | null> = {
  mountain: readingBg,
  desert: tarteelBg,
  mosque: quizBg,
  galaxy: galaxyBg,
  garden: gardenBg,
  ocean: oceanBg,
  starry: starryBg,
  forest: forestBg,
  aurora: auroraBg,
  sunset: sunsetBg,
  none: null,
};

export default function Reading() {
  const { t } = useLanguage();
  const { resolvedEditionId, isArabicOnly, setManualEdition, isAuto, setAuto } = useTranslationPreference();
  const { settings, setDarkModeReading, setArabicFont, setDefaultReciter, arabicFontFamily } = useReadingSettings();
  const { readingPosition } = useBookmarks();
  const { immersiveEnabled, toggleImmersive, choices, setModeTheme } = useImmersiveBg();
  const epicBg = immersiveEnabled ? getEpicBg(choices.reading) : null;
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
  const [transliterations, setTransliterations] = useState<Record<number, string>>({});
  const [reciterSearch, setReciterSearch] = useState("");

  const filteredRecitersPopular = RECITERS.filter(r => r.popular && (
    !reciterSearch || r.name.toLowerCase().includes(reciterSearch.toLowerCase()) || r.label.includes(reciterSearch)
  ));
  const filteredRecitersOther = RECITERS.filter(r => !r.popular && (
    !reciterSearch || r.name.toLowerCase().includes(reciterSearch.toLowerCase()) || r.label.includes(reciterSearch)
  ));

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

  // Fetch transliterations when surah changes
  useEffect(() => {
    if (!selectedSurah) { setTransliterations({}); return; }
    // If local data already has transliteration, skip API
    if (selectedSurah.ayahs[0]?.transliteration) { setTransliterations({}); return; }
    fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah.number}/en.transliteration`)
      .then((r) => r.json())
      .then((data) => {
        if (data.data?.ayahs) {
          const map: Record<number, string> = {};
          data.data.ayahs.forEach((a: { text: string }, i: number) => {
            map[i] = a.text;
          });
          setTransliterations(map);
        }
      })
      .catch(() => {});
  }, [selectedSurah]);

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
      <div
        className={epicBg ? epicBg.className : "min-h-screen"}
        style={epicBg?.image ? { backgroundImage: `url(${epicBg.image})`, "--arabic-font": arabicFontFamily } as React.CSSProperties : { "--arabic-font": arabicFontFamily } as React.CSSProperties}
      >
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
          onRequestNextSurah={() => {
            if (selectedSurah.number < 114) {
              const nextNum = selectedSurah.number + 1;
              handleSelectSurah(nextNum, 0);
            }
          }}
          onRequestPrevSurah={() => {
            if (selectedSurah.number > 1) {
              const prevNum = selectedSurah.number - 1;
              handleSelectSurah(prevNum, 0);
            }
          }}
        />
      </div>
    );
  }

  // ─── Surah List View ──────────────────────────────────────
  return (
    <div className={`${epicBg ? epicBg.className : "min-h-screen"} pb-28`} style={epicBg?.image ? { backgroundImage: `url(${epicBg.image})` } : undefined}>
      <FloatingXpWidget />
      {/* Header */}
      <div className="px-6 pt-14 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold epic-text-light">📖 {t("reading.title")}</h1>
            <p className="text-sm epic-text-muted mt-0.5">{t("reading.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/favorites-notes")}
              className="w-9 h-9 rounded-full bg-black/40 backdrop-blur flex items-center justify-center"
            >
              <Star size={18} className="epic-text-gold" />
            </button>
            <button
              onClick={() => navigate("/bookmarks")}
              className="w-9 h-9 rounded-full bg-black/40 backdrop-blur flex items-center justify-center"
            >
              <Bookmark size={18} className="epic-text-gold" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-9 h-9 rounded-full bg-black/40 backdrop-blur flex items-center justify-center"
            >
              <Settings2 size={18} className="epic-text-light" />
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
                <input
                  type="text"
                  placeholder="🔍 ..."
                  value={reciterSearch}
                  onChange={(e) => setReciterSearch(e.target.value)}
                  className="w-full mb-2 px-3 py-2 rounded-xl border border-border bg-background text-xs outline-none focus:ring-2 focus:ring-primary/30"
                />
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {/* Populaires */}
                  {filteredRecitersPopular.length > 0 && (
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1 mb-0.5">⭐ {t("reciter.popular" as any)}</p>
                  )}
                  {filteredRecitersPopular.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setDefaultReciter(r.id as any)}
                      className={`w-full text-left px-3 py-2 rounded-xl border-2 transition-colors ${
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
                  {/* Autres */}
                  {filteredRecitersOther.length > 0 && (
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-2 mb-0.5">📚 {t("reciter.others" as any)}</p>
                  )}
                  {filteredRecitersOther.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setDefaultReciter(r.id as any)}
                      className={`w-full text-left px-3 py-2 rounded-xl border-2 transition-colors ${
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

              {/* Background Theme */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🎨</span>
                    <span className="text-sm font-medium text-foreground">{t("reading.bgTheme" as any)}</span>
                  </div>
                  <button
                    onClick={toggleImmersive}
                    className={`w-12 h-7 rounded-full transition-colors relative ${immersiveEnabled ? "bg-primary" : "bg-muted"}`}
                  >
                    <motion.div
                      animate={{ x: immersiveEnabled ? 20 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="absolute top-1 w-5 h-5 rounded-full bg-card shadow-md"
                    />
                  </button>
                </div>
                {immersiveEnabled && (
                  <div className="grid grid-cols-4 gap-2">
                    {BG_OPTIONS.map((opt) => {
                      const selected = choices.reading === opt.id;
                      const thumb = BG_THUMBS[opt.id];
                      return (
                        <button
                          key={opt.id}
                          onClick={() => setModeTheme("reading", opt.id)}
                          className={`relative rounded-xl overflow-hidden border-2 transition-all aspect-[4/3] ${
                            selected ? "border-primary ring-2 ring-primary/30 scale-[1.02]" : "border-border hover:border-muted-foreground/40"
                          }`}
                        >
                          {thumb ? (
                            <img src={thumb} alt={opt.label} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <span className="text-lg">⬜</span>
                            </div>
                          )}
                          <div className="absolute inset-x-0 bottom-0 bg-foreground/60 backdrop-blur-sm px-1 py-0.5">
                            <span className="text-[9px] font-medium text-primary-foreground leading-none">{opt.emoji} {opt.label}</span>
                          </div>
                          {selected && (
                            <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                              <span className="text-[8px] text-primary-foreground">✓</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
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
            className="w-full flex items-center gap-4 bg-primary/10 border-2 border-primary/30 rounded-2xl px-5 py-4 text-left hover:bg-primary/15 transition-colors shadow-lg"
          >
            <span className="w-12 h-12 rounded-xl bg-primary/20 text-primary text-lg font-bold flex items-center justify-center shrink-0">
              📖
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-primary font-bold uppercase tracking-wider">
                {t("reading.resume")}
              </p>
              <p className="text-sm text-foreground font-semibold mt-0.5">
                {t("reading.resumeSurah")} {readingPosition.surahNumber} · {t("detail.verse")} {readingPosition.ayahIndex + 1}
              </p>
            </div>
            <span className="text-sm font-extrabold text-primary-foreground bg-primary px-4 py-2 rounded-xl shrink-0 shadow-md animate-pulse">
              {t("mode.resume")} →
            </span>
          </motion.button>
        </div>
      )}

      {/* Search */}
      <div className="px-6 mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 epic-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("reading.searchPlaceholder")}
            className="w-full bg-black/40 backdrop-blur border border-white/10 rounded-xl pl-9 pr-4 py-3 text-sm epic-text-light placeholder:text-white/30 outline-none focus:ring-2 focus:ring-yellow-500/40"
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
            className="w-full flex items-center gap-3 px-4 py-3 ayah-card-epic rounded-xl hover:bg-white/5 transition-colors text-left"
          >
            <span className="w-8 h-8 rounded-lg bg-yellow-500/15 epic-text-gold text-xs font-bold flex items-center justify-center shrink-0">
              {s.number}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-arabic text-lg epic-text-light">{s.nameArabic}</span>
                <span className="text-[10px] epic-text-muted">{s.revelationType}</span>
              </div>
              <p className="text-xs epic-text-muted truncate">
                {s.name} · {s.englishName} · {s.versesCount} {t("detail.verses")}
              </p>
            </div>
          </motion.button>
        ))}
        {filteredSurahs.length === 0 && !loading && (
          <p className="text-center text-sm epic-text-muted py-6">{t("reading.noResults")}</p>
        )}
      </div>
    </div>
  );
}
