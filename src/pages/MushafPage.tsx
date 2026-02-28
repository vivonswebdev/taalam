import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, BookOpen, Star, List, Settings2, ChevronLeft } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { TOTAL_MUSHAF_PAGES, getSurahForPage, getJuzForPage, surahStartPage, juzStartPage } from "@/data/mushafPages";
import { fetchSurahList, fetchFullSurah, type SurahMeta } from "@/lib/quranData";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

const LAST_PAGE_KEY = "mushaf_last_page";
const READING_STYLE_KEY = "mushaf_reading_style";

type ReadingStyle = "cards" | "immersive" | "mushaf";

function getMushafImageUrl(page: number) {
  return `https://v4.quran.com/api/v3/pages/${page}/image?quality=high`;
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

  const goPrev = () => onChangePage(Math.max(1, currentPage - 1));
  const goNext = () => onChangePage(Math.min(TOTAL_MUSHAF_PAGES, currentPage + 1));

  useEffect(() => {
    setImgLoading(true);
  }, [currentPage]);

  return (
    <div className="fixed inset-0 z-40 bg-black">
      {/* Full-screen tap zone to toggle chrome */}
      <div
        className="absolute inset-0"
        onClick={() => setChromeVisible((v) => !v)}
      />

      {/* Page image */}
      <div className="relative z-10 h-full w-full flex items-center justify-center">
        {imgLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
          </div>
        )}
        <img
          src={getMushafImageUrl(currentPage)}
          alt={`Mushaf page ${currentPage}`}
          className="max-h-[100dvh] max-w-full object-contain select-none"
          onLoad={() => setImgLoading(false)}
          onError={() => setImgLoading(false)}
          draggable={false}
        />

        {/* Navigation zones (Arabic book: left = next page) */}
        <button
          onClick={(e) => { e.stopPropagation(); goNext(); }}
          className="absolute inset-y-0 left-0 w-1/4 z-30"
          aria-label="Next page"
        />
        <button
          onClick={(e) => { e.stopPropagation(); goPrev(); }}
          className="absolute inset-y-0 right-0 w-1/4 z-30"
          aria-label="Previous page"
        />
      </div>

      {/* Header / Footer overlays */}
      <AnimatePresence>
        {chromeVisible && (
          <>
            <motion.div
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -40, opacity: 0 }}
              className="absolute top-0 left-0 right-0 z-50 pt-10 px-4 pb-3 bg-gradient-to-b from-black/80 to-transparent flex items-center gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onBack}
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
              >
                <ArrowLeft size={18} className="text-white" />
              </button>
              <div className="flex-1 text-center">
                <p className="font-['Amiri','serif'] text-white text-base">{surahMeta?.nameArabic || ""}</p>
                <p className="text-[10px] text-white/70">
                  {t("mushaf.page" as any)} {currentPage} / {TOTAL_MUSHAF_PAGES} — {t("mushaf.juz" as any)} {juz}
                </p>
              </div>
              <button
                onClick={onToggleBookmark}
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
              >
                <Star size={16} className={isBookmarked ? "text-yellow-400 fill-yellow-400" : "text-white/70"} />
              </button>
            </motion.div>

            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 z-50 pb-8 px-6 pt-4 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between text-xs text-white/80"
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
      <div
        className="absolute inset-0 z-10"
        onClick={() => setChromeVisible((v) => !v)}
      />

      {/* Center ayah */}
      <div className="relative z-10 h-full w-full flex items-center justify-center px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="text-center"
            dir="rtl"
          >
            <p
              className="font-['Amiri','Scheherazade_New','serif'] text-foreground leading-[2.4]"
              style={{ fontSize: `${fontSize + 4}px` }}
            >
              {currentAyah.arabic}
            </p>
            <p className="text-primary/60 text-sm font-sans mt-4">
              ﴿{currentAyah.number}﴾
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Left/right navigation */}
        <button
          onClick={(e) => { e.stopPropagation(); onChangeIndex(Math.min(ayahs.length - 1, currentIndex + 1)); }}
          disabled={currentIndex >= ayahs.length - 1}
          className="absolute inset-y-0 left-0 w-1/5 z-20 disabled:opacity-0"
        />
        <button
          onClick={(e) => { e.stopPropagation(); onChangeIndex(Math.max(0, currentIndex - 1)); }}
          disabled={currentIndex <= 0}
          className="absolute inset-y-0 right-0 w-1/5 z-20 disabled:opacity-0"
        />
      </div>

      <AnimatePresence>
        {chromeVisible && (
          <>
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="absolute top-0 left-0 right-0 z-40 pt-10 px-4 pb-3 bg-gradient-to-b from-background via-background/80 to-transparent"
            >
              <div className="flex items-center gap-3">
                <button onClick={(e) => { e.stopPropagation(); onBack(); }} className="p-2 -ml-2">
                  <ChevronLeft size={22} className="text-foreground" />
                </button>
                <div className="flex-1 text-center">
                  <p className="text-sm font-semibold text-foreground">{surahMeta?.nameArabic}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {t("mushaf.page" as any)} — {currentIndex + 1} / {ayahs.length}
                  </p>
                </div>
                <div className="w-9" />
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 z-40 pb-8 px-4 pt-3 bg-gradient-to-t from-background via-background/80 to-transparent"
            >
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
    try { return Number(localStorage.getItem("mushaf_font_size")) || 28; } catch { return 28; }
  });

  // Load last page
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LAST_PAGE_KEY);
      if (saved) setCurrentPage(Number(saved));
    } catch {}
  }, []);

  // Save last page
  useEffect(() => {
    try { localStorage.setItem(LAST_PAGE_KEY, String(currentPage)); } catch {}
  }, [currentPage]);

  // Load surah list
  useEffect(() => {
    fetchSurahList().then(setSurahList).catch(() => {});
  }, []);

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
    if (readingStyle === "mushaf") return; // No text needed for image mode
    let cancelled = false;
    setLoading(true);

    const surahNum = getSurahForPage(currentPage);
    const nextSurah = surahNum < 114 ? surahNum + 1 : null;
    const nextSurahStartsHere = nextSurah && surahStartPage[nextSurah] === currentPage;

    const promises = [fetchFullSurah(surahNum)];
    if (nextSurahStartsHere && nextSurah) {
      promises.push(fetchFullSurah(nextSurah));
    }

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
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [currentPage, readingStyle]);

  const toggleBookmark = async () => {
    if (!user) {
      toast(t("mushaf.loginRequired" as any));
      return;
    }
    const isBookmarked = bookmarkedPages.has(currentPage);
    if (isBookmarked) {
      const bm = bookmarksList.find((b) => b.page_number === currentPage);
      if (bm) {
        await supabase.from("mushaf_bookmarks").delete().eq("id", bm.id);
      }
    } else {
      await supabase.from("mushaf_bookmarks").insert({
        user_id: user.id,
        page_number: currentPage,
        surah_number: getSurahForPage(currentPage),
      });
    }
    await loadBookmarks();
  };

  const goTo = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(TOTAL_MUSHAF_PAGES, page)));
  };

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

  // ─── Cards (text) mode ───
  return (
    <div className="min-h-screen pb-24 bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 pt-10 pb-3">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ChevronLeft size={22} className="text-foreground" />
          </button>
          <div className="text-center flex-1">
            <p className="text-xs text-muted-foreground">
              {t("mushaf.page" as any)} {currentPage} / {TOTAL_MUSHAF_PAGES} — {t("mushaf.juz" as any)} {currentJuz}
            </p>
            <p className="text-sm font-semibold text-foreground">
              {currentSurahMeta?.nameArabic || ""} — {currentSurahMeta?.name || ""}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={toggleBookmark} className="p-2">
              <Star size={20} className={bookmarkedPages.has(currentPage) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"} />
            </button>
            {/* Go To Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <button className="p-2"><List size={20} className="text-muted-foreground" /></button>
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
                        onKeyDown={(e) => {
                          if (e.key === "Enter") goTo(Number((e.target as HTMLInputElement).value));
                        }}
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
                <button className="p-2"><BookOpen size={20} className="text-muted-foreground" /></button>
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
                <button className="p-2"><Settings2 size={20} className="text-muted-foreground" /></button>
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[50vh]">
                <SheetHeader>
                  <SheetTitle>{t("mushaf.readSettings" as any)}</SheetTitle>
                </SheetHeader>
                <div className="p-4 space-y-5">
                  {/* Reading style toggle */}
                  <div>
                    <p className="text-sm font-medium mb-2">{t("mushaf.readingStyle" as any)}</p>
                    <div className="flex gap-2">
                      {([
                        { key: "cards" as const, emoji: "🃏", label: t("mushaf.styleCards" as any) },
                        { key: "immersive" as const, emoji: "🌌", label: t("mushaf.styleImmersive" as any) },
                        { key: "mushaf" as const, emoji: "📖", label: t("mushaf.styleMushaf" as any) },
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
                  {/* Font size (only for text modes) */}
                  <div>
                    <p className="text-sm font-medium mb-2">{t("mushaf.textSize" as any)}</p>
                    <input
                      type="range"
                      min={20}
                      max={42}
                      value={fontSize}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setFontSize(v);
                        localStorage.setItem("mushaf_font_size", String(v));
                      }}
                      className="w-full"
                    />
                    <p className="text-center text-muted-foreground text-xs mt-1">{fontSize}px</p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Reading area - Cards mode */}
      <div className="px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <motion.div
            key={currentPage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-right leading-[2.2] px-2"
            style={{ fontSize: `${fontSize}px` }}
            dir="rtl"
          >
            <p className="font-['Amiri','Scheherazade_New','serif'] text-foreground">
              {ayahs.map((a) => (
                <span key={`${a.surahNumber}-${a.number}`}>
                  {a.arabic}{" "}
                  <span className="text-primary/70 text-[0.6em] font-sans">﴿{a.number}﴾</span>{" "}
                </span>
              ))}
            </p>
          </motion.div>
        )}
      </div>

      {/* Page navigation */}
      <div className="fixed bottom-20 left-0 right-0 flex justify-center gap-6 z-10">
        <div className="bg-card/90 backdrop-blur border border-border rounded-full px-4 py-2 flex items-center gap-4 shadow-lg max-w-lg mx-auto">
          <button
            onClick={() => goTo(isRTL ? currentPage + 1 : currentPage - 1)}
            disabled={isRTL ? currentPage >= TOTAL_MUSHAF_PAGES : currentPage <= 1}
            className="p-2 disabled:opacity-30"
          >
            <ArrowLeft size={22} className="text-foreground" />
          </button>
          <span className="text-sm font-medium text-foreground min-w-[60px] text-center">
            {currentPage}
          </span>
          <button
            onClick={() => goTo(isRTL ? currentPage - 1 : currentPage + 1)}
            disabled={isRTL ? currentPage <= 1 : currentPage >= TOTAL_MUSHAF_PAGES}
            className="p-2 disabled:opacity-30"
          >
            <ArrowRight size={22} className="text-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
