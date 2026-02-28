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

  // Load page content - fetch ayahs for the current surah on this page
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const surahNum = getSurahForPage(currentPage);
    // Also check if next surah starts on this page
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
      setLoading(false);
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [currentPage]);

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

  const currentSurahNum = getSurahForPage(currentPage);
  const currentJuz = getJuzForPage(currentPage);
  const currentSurahMeta = surahList.find((s) => s.number === currentSurahNum);

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
                          <button key={s.number} onClick={() => { goTo(surahStartPage[s.number] || 1); }} className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-accent/40 flex justify-between items-center">
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
                          if (e.key === "Enter") {
                            goTo(Number((e.target as HTMLInputElement).value));
                          }
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
            {/* Font size */}
            <Sheet>
              <SheetTrigger asChild>
                <button className="p-2"><Settings2 size={20} className="text-muted-foreground" /></button>
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[40vh]">
                <SheetHeader>
                  <SheetTitle>{t("mushaf.readSettings" as any)}</SheetTitle>
                </SheetHeader>
                <div className="p-4 space-y-4">
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

      {/* Reading area */}
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
              {ayahs.map((a, i) => (
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
