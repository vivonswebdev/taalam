import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Star, List, Settings2, BookOpen,
  ZoomIn, ZoomOut, RotateCcw, Eye, EyeOff, Volume2, VolumeX
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { usePinchZoom } from '@/hooks/usePinchZoom';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { loadMushafPage } from '@/lib/quranV4API';
import { getUserBookmarks, toggleLocalBookmark, type MushafVerse, type MushafBookmarkLocal } from '@/lib/mushafDB';
import { TOTAL_MUSHAF_PAGES, getSurahForPage, getJuzForPage, surahStartPage, juzStartPage } from '@/data/mushafPages';
import { fetchSurahList, type SurahMeta } from '@/lib/quranData';
import { getHizbForPage, toArabicNum } from '@/data/hizbData';
import TajwidText from './TajwidText';
import AyahBookmark from './AyahBookmark';
import OfflineDownloadPrompt from './OfflineDownloadPrompt';
import { supabase } from '@/integrations/supabase/client';

const LAST_PAGE_KEY = 'mushaf_v2_last_page';
const THEME_KEY = 'mushaf_v2_theme';
const TAJWID_KEY = 'mushaf_v2_tajwid';
const TRANSLATION_KEY = 'mushaf_v2_translation';

type MushafTheme = 'cream' | 'night' | 'blue' | 'white';

const THEMES: Record<MushafTheme, {
  bg: string; text: string; medallion: string; medallionText: string;
  frame: string; headerBg: string; label: string; emoji: string;
}> = {
  cream: { bg: '#f5f0e1', text: '#1a1200', medallion: '#1a4a7a', medallionText: '#fff', frame: '#c9a84c', headerBg: 'rgba(245,240,225,0.95)', label: 'Crème', emoji: '📜' },
  white: { bg: '#ffffff', text: '#111111', medallion: '#1a4a7a', medallionText: '#fff', frame: '#c9a84c', headerBg: 'rgba(255,255,255,0.95)', label: 'Blanc', emoji: '⬜' },
  night: { bg: '#111827', text: '#e8dcc8', medallion: '#c9a84c', medallionText: '#111', frame: '#c9a84c', headerBg: 'rgba(17,24,39,0.95)', label: 'Nuit', emoji: '🌙' },
  blue: { bg: '#0d1b2a', text: '#d4d8e0', medallion: '#6b93d6', medallionText: '#fff', frame: '#4a6fa5', headerBg: 'rgba(13,27,42,0.95)', label: 'Bleuté', emoji: '🔵' },
};

// Ayah number medallion
function AyahMedallion({ number, color, textColor }: { number: number; color: string; textColor: string }) {
  return (
    <span
      className="inline-flex items-center justify-center flex-shrink-0"
      style={{
        width: '26px', height: '26px', borderRadius: '50%',
        backgroundColor: color, color: textColor,
        fontSize: '10px', fontWeight: 700, fontFamily: 'sans-serif',
        verticalAlign: 'middle', margin: '0 2px',
        boxShadow: `0 0 0 2px ${color}33, 0 1px 3px rgba(0,0,0,0.15)`,
        lineHeight: 1,
      }}
    >
      {number}
    </span>
  );
}

export default function MushafReaderV2() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [currentPage, setCurrentPage] = useState(() => {
    try { const s = localStorage.getItem(LAST_PAGE_KEY); return s ? Number(s) : 1; } catch { return 1; }
  });
  const [verses, setVerses] = useState<MushafVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [surahList, setSurahList] = useState<SurahMeta[]>([]);
  const [bookmarkedVerses, setBookmarkedVerses] = useState<Set<string>>(new Set());
  const [showDownloadPrompt, setShowDownloadPrompt] = useState(false);
  const [mushafTheme, setMushafTheme] = useState<MushafTheme>(() => {
    try { return (localStorage.getItem(THEME_KEY) as MushafTheme) || 'cream'; } catch { return 'cream'; }
  });
  const [tajwidEnabled, setTajwidEnabled] = useState(() => {
    try { return localStorage.getItem(TAJWID_KEY) !== 'false'; } catch { return true; }
  });
  const [translationVisible, setTranslationVisible] = useState(() => {
    try { return localStorage.getItem(TRANSLATION_KEY) === 'true'; } catch { return false; }
  });

  // Supabase bookmarks
  const [supabaseBookmarkedPages, setSupabaseBookmarkedPages] = useState<Set<number>>(new Set());

  const theme = THEMES[mushafTheme];
  const currentSurahNum = getSurahForPage(currentPage);
  const currentJuz = getJuzForPage(currentPage);
  const currentHizb = getHizbForPage(currentPage);
  const currentSurahMeta = surahList.find(s => s.number === currentSurahNum);

  // Pinch zoom
  const { scale, handlers: pinchHandlers, zoomIn, zoomOut, resetZoom } = usePinchZoom({
    minScale: 0.8, maxScale: 3, initialScale: 1, step: 0.15
  });

  // Swipe navigation
  const swipeHandlers = useSwipeNavigation({
    onSwipeLeft: () => setCurrentPage(p => Math.min(TOTAL_MUSHAF_PAGES, p + 1)),
    onSwipeRight: () => setCurrentPage(p => Math.max(1, p - 1)),
    threshold: 50
  });

  // Combined touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      pinchHandlers.onTouchStart(e);
    } else {
      swipeHandlers.onTouchStart(e);
    }
  }, [pinchHandlers, swipeHandlers]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      pinchHandlers.onTouchMove(e);
    }
  }, [pinchHandlers]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    pinchHandlers.onTouchEnd(e);
    swipeHandlers.onTouchEnd(e);
  }, [pinchHandlers, swipeHandlers]);

  // Check first launch
  useEffect(() => {
    const hasDownloaded = localStorage.getItem('mushaf_v2_downloaded');
    const hasSkipped = localStorage.getItem('mushaf_v2_download_skipped');
    if (!hasDownloaded && !hasSkipped && navigator.onLine) {
      setShowDownloadPrompt(true);
    }
  }, []);

  // Load surah list
  useEffect(() => { fetchSurahList().then(setSurahList).catch(() => {}); }, []);

  // Persist settings
  useEffect(() => { try { localStorage.setItem(LAST_PAGE_KEY, String(currentPage)); } catch {} }, [currentPage]);
  useEffect(() => { try { localStorage.setItem(THEME_KEY, mushafTheme); } catch {} }, [mushafTheme]);
  useEffect(() => { try { localStorage.setItem(TAJWID_KEY, String(tajwidEnabled)); } catch {} }, [tajwidEnabled]);
  useEffect(() => { try { localStorage.setItem(TRANSLATION_KEY, String(translationVisible)); } catch {} }, [translationVisible]);

  // Load page content (offline-first via IndexedDB → API)
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    loadMushafPage(currentPage)
      .then(data => {
        if (!cancelled) {
          setVerses(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          console.error('Failed to load page:', err);
          if (err.message === 'offline') {
            toast.error(t("mushaf.offlineError" as any) || 'Page non disponible hors ligne');
          } else {
            toast.error(t("mushaf.loadError" as any) || 'Erreur de chargement');
          }
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [currentPage]);

  // Load bookmarks
  useEffect(() => {
    if (!user) return;
    getUserBookmarks(user.id).then(bms => {
      setBookmarkedVerses(new Set(bms.map(b => b.verse_id)));
    });
    // Also load supabase page bookmarks
    supabase.from('mushaf_bookmarks').select('id, page_number')
      .eq('user_id', user.id).then(({ data }) => {
        if (data) setSupabaseBookmarkedPages(new Set(data.map(b => b.page_number)));
      });
  }, [user]);

  const handleToggleVerseBookmark = useCallback((verseId: string) => {
    setBookmarkedVerses(prev => {
      const next = new Set(prev);
      if (next.has(verseId)) next.delete(verseId);
      else next.add(verseId);
      return next;
    });
  }, []);

  // Supabase page bookmark
  const togglePageBookmark = useCallback(async () => {
    if (!user) { toast(t("mushaf.loginRequired" as any)); return; }
    const isBookmarked = supabaseBookmarkedPages.has(currentPage);
    if (isBookmarked) {
      await supabase.from('mushaf_bookmarks').delete()
        .eq('user_id', user.id).eq('page_number', currentPage);
      setSupabaseBookmarkedPages(prev => { const n = new Set(prev); n.delete(currentPage); return n; });
    } else {
      await supabase.from('mushaf_bookmarks').insert({
        user_id: user.id, page_number: currentPage,
        surah_number: getSurahForPage(currentPage),
      });
      setSupabaseBookmarkedPages(prev => new Set(prev).add(currentPage));
    }
  }, [user, currentPage, supabaseBookmarkedPages]);

  const goTo = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(TOTAL_MUSHAF_PAGES, page)));
  }, []);

  const baseFontSize = 28;
  const effectiveFontSize = baseFontSize * scale;

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ height: '100dvh', backgroundColor: theme.bg }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Download prompt */}
      <OfflineDownloadPrompt
        open={showDownloadPrompt}
        onComplete={() => setShowDownloadPrompt(false)}
        onSkip={() => setShowDownloadPrompt(false)}
      />

      {/* Header */}
      <div
        className="flex-shrink-0 z-20 backdrop-blur border-b px-3 pt-10 pb-2"
        style={{ backgroundColor: theme.headerBg, borderColor: `${theme.frame}40` }}
      >
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ChevronLeft size={20} style={{ color: theme.text }} />
          </button>
          <div className="text-center flex-1 min-w-0">
            <p className="text-[10px] truncate" style={{ color: `${theme.text}99` }}>
              {t("mushaf.page" as any)} {currentPage} — {t("mushaf.juz" as any)} {currentJuz} · حزب {toArabicNum(currentHizb)}
            </p>
            <p className="text-sm font-semibold font-['Amiri','serif'] truncate" style={{ color: theme.text }}>
              {currentSurahMeta?.nameArabic || ''}
            </p>
          </div>
          <div className="flex items-center gap-0.5">
            {/* Page bookmark */}
            <button onClick={togglePageBookmark} className="p-1.5">
              <Star
                size={18}
                className={supabaseBookmarkedPages.has(currentPage) ? 'fill-yellow-400' : ''}
                style={{ color: supabaseBookmarkedPages.has(currentPage) ? '#facc15' : `${theme.text}80` }}
              />
            </button>

            {/* Go To sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <button className="p-1.5"><List size={18} style={{ color: `${theme.text}80` }} /></button>
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[70vh]">
                <SheetHeader><SheetTitle>{t("mushaf.goTo" as any)}</SheetTitle></SheetHeader>
                <Tabs defaultValue="surah" className="mt-3">
                  <TabsList className="w-full">
                    <TabsTrigger value="surah" className="flex-1">{t("mushaf.surah" as any)}</TabsTrigger>
                    <TabsTrigger value="juz" className="flex-1">{t("mushaf.juz" as any)}</TabsTrigger>
                    <TabsTrigger value="page" className="flex-1">{t("mushaf.page" as any)}</TabsTrigger>
                  </TabsList>
                  <TabsContent value="surah">
                    <ScrollArea className="h-[45vh]">
                      <div className="space-y-1 p-2">
                        {surahList.map(s => (
                          <button key={s.number} onClick={() => goTo(surahStartPage[s.number] || 1)}
                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-accent/40 flex justify-between items-center">
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
                        {Array.from({ length: 30 }, (_, i) => i + 1).map(j => (
                          <button key={j} onClick={() => goTo(juzStartPage[j] || 1)}
                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-accent/40 flex justify-between items-center">
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
                        type="number" min={1} max={TOTAL_MUSHAF_PAGES} defaultValue={currentPage}
                        className="w-full rounded-xl border border-border bg-card px-4 py-3 text-center text-lg"
                        onKeyDown={(e) => { if (e.key === 'Enter') goTo(Number((e.target as HTMLInputElement).value)); }}
                      />
                      <p className="text-[11px] text-muted-foreground text-center">{t("mushaf.enterPage" as any)}</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </SheetContent>
            </Sheet>

            {/* Settings sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <button className="p-1.5"><Settings2 size={18} style={{ color: `${theme.text}80` }} /></button>
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[75vh]">
                <SheetHeader><SheetTitle>{t("mushaf.readSettings" as any)}</SheetTitle></SheetHeader>
                <ScrollArea className="h-[60vh]">
                  <div className="p-4 space-y-5">
                    {/* Theme */}
                    <div>
                      <p className="text-sm font-medium mb-2">{t("reading.bgTheme" as any) || 'Thème'}</p>
                      <div className="flex gap-2">
                        {(Object.keys(THEMES) as MushafTheme[]).map(key => (
                          <button key={key} onClick={() => setMushafTheme(key)}
                            className={`flex-1 py-2 px-1 rounded-xl text-xs font-medium border transition-colors ${mushafTheme === key ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-muted-foreground hover:bg-accent/40'}`}>
                            <span className="block text-base mb-0.5">{THEMES[key].emoji}</span>{THEMES[key].label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Tajwid */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {tajwidEnabled ? <Eye size={14} className="text-muted-foreground" /> : <EyeOff size={14} className="text-muted-foreground" />}
                        <span className="text-sm font-medium">{t("mushaf.tajwidColored" as any) || 'Tajwid coloré'}</span>
                      </div>
                      <Switch checked={tajwidEnabled} onCheckedChange={setTajwidEnabled} />
                    </div>
                    {/* Translation */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🌐</span>
                        <span className="text-sm font-medium">{t("reading.showTranslation" as any)}</span>
                      </div>
                      <Switch checked={translationVisible} onCheckedChange={setTranslationVisible} />
                    </div>
                    {/* Zoom controls */}
                    <div>
                      <p className="text-sm font-medium mb-2">{t("mushaf.textSize" as any) || 'Zoom'}</p>
                      <div className="flex items-center justify-center gap-3">
                        <Button variant="outline" size="sm" onClick={zoomOut} disabled={scale <= 0.8}>
                          <ZoomOut size={16} />
                        </Button>
                        <span className="text-sm font-bold text-primary min-w-[3rem] text-center">{Math.round(scale * 100)}%</span>
                        <Button variant="outline" size="sm" onClick={zoomIn} disabled={scale >= 3}>
                          <ZoomIn size={16} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={resetZoom}>
                          <RotateCcw size={14} />
                        </Button>
                      </div>
                      <p className="text-[10px] text-muted-foreground text-center mt-1">
                        {t("mushaf.pinchToZoom" as any) || 'Pincez pour zoomer sur mobile'}
                      </p>
                    </div>
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-2 py-2">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: `${theme.frame}60`, borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Decorated frame */}
              <div
                style={{
                  border: `3px solid ${theme.frame}`,
                  borderRadius: '6px',
                  padding: '4px',
                  background: `linear-gradient(135deg, ${theme.frame}15, transparent, ${theme.frame}15)`,
                }}
              >
                <div
                  style={{
                    border: `1.5px solid ${theme.frame}80`,
                    borderRadius: '4px',
                    padding: '12px 10px 14px',
                    backgroundColor: theme.bg,
                    position: 'relative',
                  }}
                >
                  {/* Page header inside frame */}
                  <div className="flex items-center justify-between mb-1 pb-1"
                    style={{ borderBottom: `1px solid ${theme.frame}30` }}>
                    <span className="text-[9px] font-sans" style={{ color: `${theme.text}80` }}>
                      {t("mushaf.juz" as any)} {currentJuz} · حزب {toArabicNum(currentHizb)}
                    </span>
                    <span className="text-xs font-['Amiri','serif'] font-bold" style={{ color: theme.medallion }}>
                      {currentSurahMeta?.nameArabic || ''}
                    </span>
                    <span className="text-[9px] font-sans" style={{ color: `${theme.text}80` }}>
                      {currentPage}
                    </span>
                  </div>

                  {/* Bismillah */}
                  {verses.length > 0 && verses[0].verse_number === 1 && verses[0].surah_number !== 1 && verses[0].surah_number !== 9 && (
                    <div className="text-center mb-2">
                      <p className="font-['Amiri','serif']" style={{
                        fontSize: `${effectiveFontSize * 0.72}px`,
                        color: `${theme.text}bb`
                      }} dir="rtl">
                        بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                      </p>
                    </div>
                  )}

                  {/* Verses */}
                  <div dir="rtl" style={{ textAlign: 'justify', textAlignLast: 'center' }}>
                    {verses.map(verse => (
                      <span key={verse.id} className="inline">
                        <TajwidText
                          text={tajwidEnabled ? verse.text_tajwid : verse.text_uthmani}
                          fontSize={effectiveFontSize}
                          enableTajwid={tajwidEnabled}
                          textColor={theme.text}
                        />
                        {' '}
                        <AyahMedallion
                          number={verse.verse_number}
                          color={theme.medallion}
                          textColor={theme.medallionText}
                        />
                        {/* Verse bookmark */}
                        <span className="inline-flex align-middle">
                          <AyahBookmark
                            verseId={verse.id}
                            verseText={verse.text_uthmani}
                            isBookmarked={bookmarkedVerses.has(verse.id)}
                            onToggle={() => handleToggleVerseBookmark(verse.id)}
                          />
                        </span>
                        {' '}
                      </span>
                    ))}
                  </div>

                  {/* Translation (collapsible) */}
                  {translationVisible && verses.some(v => v.translation_fr) && (
                    <div className="mt-3 pt-2 space-y-2" style={{ borderTop: `1px solid ${theme.frame}20` }}>
                      {verses.filter(v => v.translation_fr).map(verse => (
                        <div key={`tr-${verse.id}`} className="flex gap-2 text-xs" style={{ color: `${theme.text}90` }}>
                          <span className="font-bold text-[10px] shrink-0" style={{ color: theme.medallion }}>
                            {verse.verse_number}
                          </span>
                          <p className="leading-relaxed" dangerouslySetInnerHTML={{ __html: verse.translation_fr }} />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Page footer */}
                  <div className="flex items-center justify-center mt-2 pt-1"
                    style={{ borderTop: `1px solid ${theme.frame}30` }}>
                    <span className="text-[9px] font-sans" style={{ color: `${theme.text}60` }}>
                      — {currentPage} —
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Footer navigation */}
      <div className="flex-shrink-0 px-3 py-2 border-t"
        style={{ backgroundColor: theme.headerBg, borderColor: `${theme.frame}40` }}>
        <div className="flex items-center justify-between">
          <Button
            variant="ghost" size="sm"
            onClick={() => goTo(currentPage - 1)}
            disabled={currentPage <= 1}
            style={{ color: theme.text }}
          >
            ←
          </Button>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={zoomOut} disabled={scale <= 0.8}>
              <ZoomOut size={14} style={{ color: `${theme.text}80` }} />
            </Button>
            <span className="text-xs font-bold" style={{ color: `${theme.text}99` }}>
              {currentPage} / {TOTAL_MUSHAF_PAGES}
            </span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={zoomIn} disabled={scale >= 3}>
              <ZoomIn size={14} style={{ color: `${theme.text}80` }} />
            </Button>
          </div>
          <Button
            variant="ghost" size="sm"
            onClick={() => goTo(currentPage + 1)}
            disabled={currentPage >= TOTAL_MUSHAF_PAGES}
            style={{ color: theme.text }}
          >
            →
          </Button>
        </div>
      </div>
    </div>
  );
}
