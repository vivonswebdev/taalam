import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, BookOpen, Star, List, Settings2, ChevronLeft, Type, Palette, Volume2, VolumeX, Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { TOTAL_MUSHAF_PAGES, getSurahForPage, getJuzForPage, surahStartPage, juzStartPage } from "@/data/mushafPages";
import { fetchSurahList, fetchFullSurah, type SurahMeta } from "@/lib/quranData";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { analyzeAyahTajwid } from "@/data/tajwidRules";
import { playPageTurnSound } from "@/lib/mushafSound";

const LAST_PAGE_KEY = "mushaf_last_page";
const READING_STYLE_KEY = "mushaf_reading_style";
const MUSHAF_THEME_KEY = "mushaf_theme";
const MUSHAF_FONT_KEY = "mushaf_font_size";
const MUSHAF_TAJWID_KEY = "mushaf_tajwid";
const MUSHAF_SOUND_KEY = "mushaf_sound";

type ReadingStyle = "cards" | "immersive" | "mushaf";
type MushafTheme = "cream" | "night" | "blue" | "white";

const THEMES: Record<MushafTheme, { bg: string; text: string; medallion: string; medallionText: string; frame: string; headerBg: string; label: string; emoji: string }> = {
  cream: { bg: "#f5f0e1", text: "#1a1200", medallion: "#1a4a7a", medallionText: "#fff", frame: "#c9a84c", headerBg: "rgba(245,240,225,0.95)", label: "Crème", emoji: "📜" },
  white: { bg: "#ffffff", text: "#111111", medallion: "#1a4a7a", medallionText: "#fff", frame: "#c9a84c", headerBg: "rgba(255,255,255,0.95)", label: "Blanc", emoji: "⬜" },
  night: { bg: "#111827", text: "#e8dcc8", medallion: "#c9a84c", medallionText: "#111", frame: "#c9a84c", headerBg: "rgba(17,24,39,0.95)", label: "Nuit", emoji: "🌙" },
  blue: { bg: "#0d1b2a", text: "#d4d8e0", medallion: "#6b93d6", medallionText: "#fff", frame: "#4a6fa5", headerBg: "rgba(13,27,42,0.95)", label: "Bleuté", emoji: "🔵" },
};

const FONT_SIZES = [
  { key: "small", value: 22, label: "Petit" },
  { key: "medium", value: 28, label: "Moyen" },
  { key: "large", value: 36, label: "Grand" },
];

function getMushafImageUrl(page: number) {
  const padded = String(page).padStart(3, "0");
  return `https://raw.githubusercontent.com/GovarJabbar/Quran-PNG/master/${padded}.png`;
}

// ─── Ayah Medallion ───
function AyahMedallion({ number, color, textColor }: { number: number; color: string; textColor: string }) {
  return (
    <span
      className="mushaf-medallion"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "30px",
        height: "30px",
        borderRadius: "50%",
        backgroundColor: color,
        color: textColor,
        fontSize: "11px",
        fontWeight: 700,
        fontFamily: "sans-serif",
        verticalAlign: "middle",
        margin: "0 4px",
        boxShadow: `0 0 0 2px ${color}33, 0 1px 3px rgba(0,0,0,0.15)`,
        lineHeight: 1,
        flexShrink: 0,
      }}
    >
      {number}
    </span>
  );
}

// ─── Tajwid-colored text rendering ───
function TajwidInlineText({
  text,
  tajwidEnabled,
  fontSize,
  textColor,
}: {
  text: string;
  tajwidEnabled: boolean;
  fontSize: number;
  textColor: string;
}) {
  const words = useMemo(() => (tajwidEnabled ? analyzeAyahTajwid(text) : null), [text, tajwidEnabled]);

  if (!tajwidEnabled || !words) {
    return <span style={{ color: textColor }}>{text}</span>;
  }

  return (
    <>
      {words.map((word, i) => (
        <span key={i}>
          <span
            style={{
              color: word.primaryColor ? `hsl(${word.primaryColor})` : textColor,
            }}
          >
            {word.text}
          </span>
          {i < words.length - 1 && " "}
        </span>
      ))}
    </>
  );
}

// ─── Mushaf Image View (fullscreen book mode) ───
function MushafImageView({
  currentPage,
  onChangePage,
  surahMeta,
  juz,
  onBack,
  onToggleBookmark,
  isBookmarked,
  t,
}: {
  currentPage: number;
  onChangePage: (p: number) => void;
  surahMeta: SurahMeta | undefined;
  juz: number;
  onBack: () => void;
  onToggleBookmark: () => void;
  isBookmarked: boolean;
  t: (k: any) => string;
}) {
  const [chromeVisible, setChromeVisible] = useState(true);
  const [imgLoading, setImgLoading] = useState(true);
  const [direction, setDirection] = useState(0);

  const goPrev = () => {
    if (currentPage > 1) { setDirection(1); onChangePage(currentPage - 1); }
  };
  const goNext = () => {
    if (currentPage < TOTAL_MUSHAF_PAGES) { setDirection(-1); onChangePage(currentPage + 1); }
  };

  useEffect(() => { setImgLoading(true); }, [currentPage]);

  return (
    <div className="fixed inset-0 z-40 bg-[#f5f0e8]">
      <div className="absolute inset-0" onClick={() => setChromeVisible((v) => !v)} />
      <div className="relative z-10 h-full w-full flex items-center justify-center overflow-hidden">
        {imgLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-amber-300/40 border-t-amber-600 animate-spin" />
          </div>
        )}
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.img
            key={currentPage}
            src={getMushafImageUrl(currentPage)}
            alt={`Mushaf page ${currentPage}`}
            className="max-h-[100dvh] max-w-full object-contain select-none"
            initial={{ x: direction * 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction * -300, opacity: 0 }}
            transition={{ type: "tween", duration: 0.25 }}
            onLoad={() => setImgLoading(false)}
            onError={() => setImgLoading(false)}
            draggable={false}
          />
        </AnimatePresence>
        <button onClick={(e) => { e.stopPropagation(); goNext(); }} className="absolute inset-y-0 left-0 w-1/4 z-30" aria-label="Next page" />
        <button onClick={(e) => { e.stopPropagation(); goPrev(); }} className="absolute inset-y-0 right-0 w-1/4 z-30" aria-label="Previous page" />
      </div>
      <AnimatePresence>
        {chromeVisible && (
          <>
            <motion.div
              initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -40, opacity: 0 }}
              className="absolute top-0 left-0 right-0 z-50 pt-10 px-4 pb-3 bg-gradient-to-b from-[#e8dfcf]/95 to-transparent flex items-center gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={onBack} className="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center">
                <ArrowLeft size={18} className="text-amber-900" />
              </button>
              <div className="flex-1 text-center">
                <p className="font-['Amiri','serif'] text-amber-900 text-base">{surahMeta?.nameArabic || ""}</p>
                <p className="text-[10px] text-amber-800/70">
                  {t("mushaf.page" as any)} {currentPage} / {TOTAL_MUSHAF_PAGES} — {t("mushaf.juz" as any)} {juz}
                </p>
              </div>
              <button onClick={onToggleBookmark} className="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center">
                <Star size={16} className={isBookmarked ? "text-yellow-600 fill-yellow-500" : "text-amber-800/70"} />
              </button>
            </motion.div>
            <motion.div
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 z-50 pb-8 px-6 pt-4 bg-gradient-to-t from-[#e8dfcf]/95 to-transparent flex items-center justify-between text-xs text-amber-900/80"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={goPrev} disabled={currentPage <= 1} className="p-2 disabled:opacity-30">←</button>
              <span className="text-[11px] opacity-80">{t("mushaf.tipTap" as any)}</span>
              <button onClick={goNext} disabled={currentPage >= TOTAL_MUSHAF_PAGES} className="p-2 disabled:opacity-30">→</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Immersive Verse View ───
function ImmersiveVerseView({
  ayahs,
  currentIndex,
  onChangeIndex,
  surahMeta,
  onBack,
  fontSize,
  t,
}: {
  ayahs: { number: number; arabic: string; surahNumber: number }[];
  currentIndex: number;
  onChangeIndex: (i: number) => void;
  surahMeta: SurahMeta | undefined;
  onBack: () => void;
  fontSize: number;
  t: (k: any) => string;
}) {
  const [chromeVisible, setChromeVisible] = useState(true);
  const currentAyah = ayahs[currentIndex];
  if (!currentAyah) return null;

  return (
    <div className="fixed inset-0 z-40 bg-background">
      <div className="absolute inset-0 z-10" onClick={() => setChromeVisible((v) => !v)} />
      <div className="relative z-10 h-full w-full flex items-center justify-center px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="text-center" dir="rtl"
          >
            <p className="font-['Amiri','Scheherazade_New','serif'] text-foreground leading-[2.4]" style={{ fontSize: `${fontSize + 4}px` }}>
              {currentAyah.arabic}
            </p>
            <p className="text-primary/60 text-sm font-sans mt-4">﴿{currentAyah.number}﴾</p>
          </motion.div>
        </AnimatePresence>
        <button onClick={(e) => { e.stopPropagation(); onChangeIndex(Math.min(ayahs.length - 1, currentIndex + 1)); }} disabled={currentIndex >= ayahs.length - 1} className="absolute inset-y-0 left-0 w-1/5 z-20 disabled:opacity-0" />
        <button onClick={(e) => { e.stopPropagation(); onChangeIndex(Math.max(0, currentIndex - 1)); }} disabled={currentIndex <= 0} className="absolute inset-y-0 right-0 w-1/5 z-20 disabled:opacity-0" />
      </div>
      <AnimatePresence>
        {chromeVisible && (
          <>
            <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="absolute top-0 left-0 right-0 z-40 pt-10 px-4 pb-3 bg-gradient-to-b from-background via-background/80 to-transparent">
              <div className="flex items-center gap-3">
                <button onClick={(e) => { e.stopPropagation(); onBack(); }} className="p-2 -ml-2"><ChevronLeft size={22} className="text-foreground" /></button>
                <div className="flex-1 text-center">
                  <p className="text-sm font-semibold text-foreground">{surahMeta?.nameArabic}</p>
                  <p className="text-[10px] text-muted-foreground">{t("mushaf.page" as any)} — {currentIndex + 1} / {ayahs.length}</p>
                </div>
                <div className="w-9" />
              </div>
            </motion.div>
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="absolute bottom-0 left-0 right-0 z-40 pb-8 px-4 pt-3 bg-gradient-to-t from-background via-background/80 to-transparent">
              <p className="text-[10px] text-muted-foreground text-center">{t("mushaf.tipTap" as any)}</p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main MushafPage ───
export default function MushafPage() {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [currentPage, setCurrentPage] = useState(1);
  const [ayahs, setAyahs] = useState<{ number: number; arabic: string; surahNumber: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [surahList, setSurahList] = useState<SurahMeta[]>([]);
  const [bookmarkedPages, setBookmarkedPages] = useState<Set<number>>(new Set());
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [bookmarksList, setBookmarksList] = useState<{ page_number: number; id: string }[]>([]);
  const [immersiveIndex, setImmersiveIndex] = useState(0);
  const [readingStyle, setReadingStyle] = useState<ReadingStyle>(() => {
    try { return (localStorage.getItem(READING_STYLE_KEY) as ReadingStyle) || "cards"; } catch { return "cards"; }
  });
  const [fontSize, setFontSize] = useState(() => {
    try { return Number(localStorage.getItem(MUSHAF_FONT_KEY)) || 28; } catch { return 28; }
  });

  // New settings
  const [mushafTheme, setMushafTheme] = useState<MushafTheme>(() => {
    try { return (localStorage.getItem(MUSHAF_THEME_KEY) as MushafTheme) || "cream"; } catch { return "cream"; }
  });
  const [tajwidEnabled, setTajwidEnabled] = useState(() => {
    try { return localStorage.getItem(MUSHAF_TAJWID_KEY) !== "false"; } catch { return true; }
  });
  const [pageSoundEnabled, setPageSoundEnabled] = useState(() => {
    try { return localStorage.getItem(MUSHAF_SOUND_KEY) !== "false"; } catch { return true; }
  });

  const theme = THEMES[mushafTheme];

  // Persist settings
  useEffect(() => { try { localStorage.setItem(MUSHAF_THEME_KEY, mushafTheme); } catch {} }, [mushafTheme]);
  useEffect(() => { try { localStorage.setItem(MUSHAF_TAJWID_KEY, String(tajwidEnabled)); } catch {} }, [tajwidEnabled]);
  useEffect(() => { try { localStorage.setItem(MUSHAF_SOUND_KEY, String(pageSoundEnabled)); } catch {} }, [pageSoundEnabled]);

  // Load last page
  useEffect(() => {
    try { const saved = localStorage.getItem(LAST_PAGE_KEY); if (saved) setCurrentPage(Number(saved)); } catch {}
  }, []);

  // Save last page
  useEffect(() => { try { localStorage.setItem(LAST_PAGE_KEY, String(currentPage)); } catch {} }, [currentPage]);

  // Load surah list
  useEffect(() => { fetchSurahList().then(setSurahList).catch(() => {}); }, []);

  // Load bookmarks
  const loadBookmarks = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("mushaf_bookmarks")
      .select("id, page_number")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) {
      setBookmarkedPages(new Set(data.map((b) => b.page_number)));
      setBookmarksList(data);
    }
  }, [user]);

  useEffect(() => { loadBookmarks(); }, [loadBookmarks]);

  // Load page content
  useEffect(() => {
    if (readingStyle === "mushaf") return;
    let cancelled = false;
    setLoading(true);

    const surahNum = getSurahForPage(currentPage);
    const nextSurah = surahNum < 114 ? surahNum + 1 : null;
    const nextSurahStartsHere = nextSurah && surahStartPage[nextSurah] === currentPage;

    const promises = [fetchFullSurah(surahNum)];
    if (nextSurahStartsHere && nextSurah) promises.push(fetchFullSurah(nextSurah));

    Promise.all(promises).then((surahs) => {
      if (cancelled) return;
      const allAyahs: { number: number; arabic: string; surahNumber: number }[] = [];
      for (const s of surahs) {
        for (const a of s.ayahs) {
          allAyahs.push({ number: a.number, arabic: a.arabic, surahNumber: s.number });
        }
      }
      setAyahs(allAyahs);
      setImmersiveIndex(0);
      setLoading(false);
    }).catch(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [currentPage, readingStyle]);

  const toggleBookmark = async () => {
    if (!user) { toast(t("mushaf.loginRequired" as any)); return; }
    const isBookmarked = bookmarkedPages.has(currentPage);
    if (isBookmarked) {
      const bm = bookmarksList.find((b) => b.page_number === currentPage);
      if (bm) await supabase.from("mushaf_bookmarks").delete().eq("id", bm.id);
    } else {
      await supabase.from("mushaf_bookmarks").insert({
        user_id: user.id,
        page_number: currentPage,
        surah_number: getSurahForPage(currentPage),
      });
    }
    await loadBookmarks();
  };

  const goTo = useCallback((page: number) => {
    const p = Math.max(1, Math.min(TOTAL_MUSHAF_PAGES, page));
    if (p !== currentPage) {
      setCurrentPage(p);
      if (pageSoundEnabled) playPageTurnSound();
    }
  }, [currentPage, pageSoundEnabled]);

  const changeStyle = (style: ReadingStyle) => {
    setReadingStyle(style);
    localStorage.setItem(READING_STYLE_KEY, style);
  };

  const currentSurahNum = getSurahForPage(currentPage);
  const currentJuz = getJuzForPage(currentPage);
  const currentSurahMeta = surahList.find((s) => s.number === currentSurahNum);

  // ─── Mushaf image mode ───
  if (readingStyle === "mushaf") {
    return (
      <MushafImageView
        currentPage={currentPage}
        onChangePage={goTo}
        surahMeta={currentSurahMeta}
        juz={currentJuz}
        onBack={() => changeStyle("cards")}
        onToggleBookmark={toggleBookmark}
        isBookmarked={bookmarkedPages.has(currentPage)}
        t={t}
      />
    );
  }

  // ─── Immersive verse mode ───
  if (readingStyle === "immersive") {
    return (
      <ImmersiveVerseView
        ayahs={ayahs}
        currentIndex={immersiveIndex}
        onChangeIndex={setImmersiveIndex}
        surahMeta={currentSurahMeta}
        onBack={() => changeStyle("cards")}
        fontSize={fontSize}
        t={t}
      />
    );
  }

  // ─── Decorated Cards (Mushaf-like) mode ───
  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: theme.bg }}>
      {/* Header */}
      <div
        className="sticky top-0 z-20 backdrop-blur border-b px-4 pt-10 pb-3"
        style={{ backgroundColor: theme.headerBg, borderColor: `${theme.frame}40` }}
      >
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ChevronLeft size={22} style={{ color: theme.text }} />
          </button>
          <div className="text-center flex-1">
            <p className="text-xs" style={{ color: `${theme.text}99` }}>
              {t("mushaf.page" as any)} {currentPage} / {TOTAL_MUSHAF_PAGES} — {t("mushaf.juz" as any)} {currentJuz}
            </p>
            <p className="text-sm font-semibold font-['Amiri','serif']" style={{ color: theme.text }}>
              {currentSurahMeta?.nameArabic || ""} — {currentSurahMeta?.name || ""}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={toggleBookmark} className="p-2">
              <Star size={20} className={bookmarkedPages.has(currentPage) ? "fill-yellow-400" : ""} style={{ color: bookmarkedPages.has(currentPage) ? "#facc15" : `${theme.text}80` }} />
            </button>

            {/* Go To Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <button className="p-2"><List size={20} style={{ color: `${theme.text}80` }} /></button>
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[70vh]">
                <SheetHeader>
                  <SheetTitle>{t("mushaf.goTo" as any)}</SheetTitle>
                </SheetHeader>
                <Tabs defaultValue="surah" className="mt-3">
                  <TabsList className="w-full">
                    <TabsTrigger value="surah" className="flex-1">{t("mushaf.surah" as any)}</TabsTrigger>
                    <TabsTrigger value="juz" className="flex-1">{t("mushaf.juz" as any)}</TabsTrigger>
                    <TabsTrigger value="page" className="flex-1">{t("mushaf.page" as any)}</TabsTrigger>
                  </TabsList>
                  <TabsContent value="surah">
                    <ScrollArea className="h-[45vh]">
                      <div className="space-y-1 p-2">
                        {surahList.map((s) => (
                          <button key={s.number} onClick={() => goTo(surahStartPage[s.number] || 1)} className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-accent/40 flex justify-between items-center">
                            <span className="text-sm"><span className="text-muted-foreground mr-2">{s.number}.</span> {s.nameArabic} — {s.name}</span>
                            <span className="text-[10px] text-muted-foreground">p.{surahStartPage[s.number]}</span>
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="juz">
                    <ScrollArea className="h-[45vh]">
                      <div className="space-y-1 p-2">
                        {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => (
                          <button key={j} onClick={() => goTo(juzStartPage[j] || 1)} className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-accent/40 flex justify-between items-center">
                            <span className="text-sm">{t("mushaf.juz" as any)} {j}</span>
                            <span className="text-[10px] text-muted-foreground">p.{juzStartPage[j]}</span>
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="page">
                    <div className="p-4 space-y-3">
                      <input
                        type="number"
                        min={1}
                        max={TOTAL_MUSHAF_PAGES}
                        defaultValue={currentPage}
                        className="w-full rounded-xl border border-border bg-card px-4 py-3 text-center text-lg"
                        onKeyDown={(e) => { if (e.key === "Enter") goTo(Number((e.target as HTMLInputElement).value)); }}
                      />
                      <p className="text-[11px] text-muted-foreground text-center">{t("mushaf.enterPage" as any)}</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </SheetContent>
            </Sheet>

            {/* Bookmarks list */}
            <Sheet open={showBookmarks} onOpenChange={setShowBookmarks}>
              <SheetTrigger asChild>
                <button className="p-2"><BookOpen size={20} style={{ color: `${theme.text}80` }} /></button>
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[60vh]">
                <SheetHeader>
                  <SheetTitle>{t("mushaf.bookmarks" as any)}</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[40vh] mt-3">
                  {bookmarksList.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">{t("mushaf.noBookmarks" as any)}</p>
                  ) : (
                    <div className="space-y-1 p-2">
                      {bookmarksList.map((bm) => {
                        const s = getSurahForPage(bm.page_number);
                        const meta = surahList.find((su) => su.number === s);
                        return (
                          <button key={bm.id} onClick={() => { goTo(bm.page_number); setShowBookmarks(false); }} className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-accent/40 flex justify-between items-center">
                            <span className="text-sm">{t("mushaf.page" as any)} {bm.page_number} — {meta?.nameArabic || ""}</span>
                            <Star size={14} className="text-yellow-400 fill-yellow-400" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </SheetContent>
            </Sheet>

            {/* Settings */}
            <Sheet>
              <SheetTrigger asChild>
                <button className="p-2"><Settings2 size={20} style={{ color: `${theme.text}80` }} /></button>
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[75vh]">
                <SheetHeader>
                  <SheetTitle>{t("mushaf.readSettings" as any)}</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[60vh]">
                  <div className="p-4 space-y-5">
                    {/* Reading style toggle */}
                    <div>
                      <p className="text-sm font-medium mb-2">{t("mushaf.readingStyle" as any)}</p>
                      <div className="flex gap-2">
                        {([
                          { key: "cards" as const, emoji: "📖", label: t("mushaf.styleCards" as any) },
                          { key: "immersive" as const, emoji: "🌌", label: t("mushaf.styleImmersive" as any) },
                          { key: "mushaf" as const, emoji: "🕌", label: t("mushaf.styleMushaf" as any) },
                        ]).map((s) => (
                          <button
                            key={s.key}
                            onClick={() => changeStyle(s.key)}
                            className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-medium border transition-colors ${
                              readingStyle === s.key
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-card text-muted-foreground hover:bg-accent/40"
                            }`}
                          >
                            <span className="block text-base mb-0.5">{s.emoji}</span>
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Theme picker */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Palette size={14} className="text-muted-foreground" />
                        <span className="text-sm font-medium">Thème de fond</span>
                      </div>
                      <div className="flex gap-2">
                        {(Object.keys(THEMES) as MushafTheme[]).map((key) => (
                          <button
                            key={key}
                            onClick={() => setMushafTheme(key)}
                            className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-medium border transition-colors ${
                              mushafTheme === key
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-card text-muted-foreground hover:bg-accent/40"
                            }`}
                          >
                            <span className="block text-base mb-0.5">{THEMES[key].emoji}</span>
                            {THEMES[key].label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Font size */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Type size={14} className="text-muted-foreground" />
                        <span className="text-sm font-medium">{t("mushaf.textSize" as any)}</span>
                      </div>
                      <div className="flex gap-2">
                        {FONT_SIZES.map((fs) => (
                          <button
                            key={fs.key}
                            onClick={() => { setFontSize(fs.value); localStorage.setItem(MUSHAF_FONT_KEY, String(fs.value)); }}
                            className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-medium border transition-colors ${
                              fontSize === fs.value
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-card text-muted-foreground hover:bg-accent/40"
                            }`}
                          >
                            <span className="block text-base mb-0.5 font-['Amiri','serif']" style={{ fontSize: `${fs.value * 0.5}px` }}>ب</span>
                            {fs.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tajwid toggle */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {tajwidEnabled ? <Eye size={14} className="text-muted-foreground" /> : <EyeOff size={14} className="text-muted-foreground" />}
                        <span className="text-sm font-medium">Tajwid coloré</span>
                      </div>
                      <Switch checked={tajwidEnabled} onCheckedChange={setTajwidEnabled} />
                    </div>

                    {/* Page turn sound */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {pageSoundEnabled ? <Volume2 size={14} className="text-muted-foreground" /> : <VolumeX size={14} className="text-muted-foreground" />}
                        <span className="text-sm font-medium">Son de page</span>
                      </div>
                      <Switch checked={pageSoundEnabled} onCheckedChange={setPageSoundEnabled} />
                    </div>
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* ═══ DECORATED MUSHAF PAGE ═══ */}
      <div className="px-3 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
            >
              {/* Outer decorative frame */}
              <div
                className="mushaf-outer-frame"
                style={{
                  border: `3px solid ${theme.frame}`,
                  borderRadius: "6px",
                  padding: "4px",
                  background: `linear-gradient(135deg, ${theme.frame}15, transparent, ${theme.frame}15)`,
                }}
              >
                {/* Inner frame */}
                <div
                  className="mushaf-inner-frame"
                  style={{
                    border: `1.5px solid ${theme.frame}80`,
                    borderRadius: "4px",
                    padding: "16px 12px 20px",
                    backgroundColor: theme.bg,
                    minHeight: "60vh",
                    position: "relative",
                  }}
                >
                  {/* Corner decorations */}
                  {["top-left", "top-right", "bottom-left", "bottom-right"].map((corner) => {
                    const isTop = corner.includes("top");
                    const isLeft = corner.includes("left");
                    return (
                      <div
                        key={corner}
                        style={{
                          position: "absolute",
                          [isTop ? "top" : "bottom"]: "-1px",
                          [isLeft ? "left" : "right"]: "-1px",
                          width: "24px",
                          height: "24px",
                          borderTop: isTop ? `2px solid ${theme.frame}` : "none",
                          borderBottom: !isTop ? `2px solid ${theme.frame}` : "none",
                          borderLeft: isLeft ? `2px solid ${theme.frame}` : "none",
                          borderRight: !isLeft ? `2px solid ${theme.frame}` : "none",
                          borderRadius: isTop && isLeft ? "4px 0 0 0" : isTop ? "0 4px 0 0" : isLeft ? "0 0 0 4px" : "0 0 4px 0",
                        }}
                      />
                    );
                  })}

                  {/* Page header inside frame */}
                  <div
                    className="flex items-center justify-between mb-3 pb-2"
                    style={{ borderBottom: `1px solid ${theme.frame}30` }}
                  >
                    <span className="text-[10px] font-sans" style={{ color: `${theme.text}80` }}>
                      {t("mushaf.juz" as any)} {currentJuz}
                    </span>
                    <span className="text-sm font-['Amiri','serif'] font-bold" style={{ color: theme.medallion }}>
                      {currentSurahMeta?.nameArabic || ""}
                    </span>
                    <span className="text-[10px] font-sans" style={{ color: `${theme.text}80` }}>
                      {currentPage}
                    </span>
                  </div>

                  {/* Surah Bismillah header (if page starts a surah) */}
                  {ayahs.length > 0 && ayahs[0].number === 1 && ayahs[0].surahNumber !== 1 && ayahs[0].surahNumber !== 9 && (
                    <div className="text-center mb-4">
                      <div
                        className="inline-block px-6 py-1.5 rounded-full mb-2"
                        style={{
                          background: `linear-gradient(90deg, transparent, ${theme.frame}20, transparent)`,
                          border: `1px solid ${theme.frame}40`,
                        }}
                      >
                        <span className="font-['Amiri','serif'] text-lg font-bold" style={{ color: theme.medallion }}>
                          {currentSurahMeta?.nameArabic}
                        </span>
                      </div>
                      <p
                        className="font-['Amiri','serif'] text-base"
                        style={{ color: `${theme.text}cc` }}
                        dir="rtl"
                      >
                        بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                      </p>
                    </div>
                  )}

                  {/* Ayah text - continuous flow like a real mushaf */}
                  <div
                    className="mushaf-text-area font-['Amiri','Scheherazade_New','serif'] leading-[2.6]"
                    dir="rtl"
                    style={{
                      fontSize: `${fontSize}px`,
                      textAlign: "justify",
                      textAlignLast: "center",
                      color: theme.text,
                      wordSpacing: "4px",
                    }}
                  >
                    {ayahs.map((a) => (
                      <span key={`${a.surahNumber}-${a.number}`}>
                        <TajwidInlineText
                          text={a.arabic}
                          tajwidEnabled={tajwidEnabled}
                          fontSize={fontSize}
                          textColor={theme.text}
                        />
                        {" "}
                        <AyahMedallion
                          number={a.number}
                          color={theme.medallion}
                          textColor={theme.medallionText}
                        />
                        {" "}
                      </span>
                    ))}
                  </div>

                  {/* Page footer inside frame */}
                  <div
                    className="flex items-center justify-center mt-4 pt-2"
                    style={{ borderTop: `1px solid ${theme.frame}30` }}
                  >
                    <span className="text-[10px] font-sans" style={{ color: `${theme.text}60` }}>
                      — {currentPage} —
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Page navigation */}
      <div className="fixed bottom-20 left-0 right-0 flex justify-center gap-6 z-10">
        <div
          className="backdrop-blur rounded-full px-4 py-2 flex items-center gap-4 shadow-lg max-w-lg mx-auto"
          style={{
            backgroundColor: `${theme.bg}ee`,
            border: `1px solid ${theme.frame}40`,
          }}
        >
          <button
            onClick={() => goTo(isRTL ? currentPage + 1 : currentPage - 1)}
            disabled={isRTL ? currentPage >= TOTAL_MUSHAF_PAGES : currentPage <= 1}
            className="p-2 disabled:opacity-30"
          >
            <ArrowLeft size={22} style={{ color: theme.text }} />
          </button>
          <span className="text-sm font-medium min-w-[60px] text-center" style={{ color: theme.text }}>
            {currentPage}
          </span>
          <button
            onClick={() => goTo(isRTL ? currentPage - 1 : currentPage + 1)}
            disabled={isRTL ? currentPage <= 1 : currentPage >= TOTAL_MUSHAF_PAGES}
            className="p-2 disabled:opacity-30"
          >
            <ArrowRight size={22} style={{ color: theme.text }} />
          </button>
        </div>
      </div>
    </div>
  );
}
