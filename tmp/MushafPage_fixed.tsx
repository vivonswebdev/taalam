// ═══════════════════════════════════════════════════════════════════════
// MushafPage.tsx — VERSION CORRIGÉE
// 3 fixes ciblés, RIEN d'autre ne change :
//  FIX 1 — Layout : min-h-screen → h-[100dvh] flex flex-col
//           Les deux barres fixed → éléments flex dans le flux
//  FIX 2 — Swipe : onTouchStart/Move/End sur le container cards
//  FIX 3 — DecoratedMushafContent : minHeight "50vh" → flex-1 dynamique
// ═══════════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useMemo, useRef, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SEOHead from "@/components/SEOHead";
import { ArrowLeft, ArrowRight, BookOpen, Star, List, Settings2, ChevronLeft, Type, Palette, Volume2, VolumeX, Eye, EyeOff } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { TOTAL_MUSHAF_PAGES, getSurahForPage, getJuzForPage, surahStartPage, juzStartPage } from "@/data/mushafPages";
import { fetchSurahList, fetchFullSurah, type SurahMeta } from "@/lib/quranData";
import { getHizbMarkerAt, getSajdaAt, getHizbForPage, toArabicNum } from "@/data/hizbData";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { analyzeAyahTajwid } from "@/data/tajwidRules";
import { playPageTurnSound } from "@/lib/mushafSound";
import { useMushafPageData, type MushafPageAyah } from "@/hooks/useMushafPageData";

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

const FONT_PRESETS = [
  { key: "small",   size: 24,  icon: "S"   },
  { key: "medium",  size: 36,  icon: "M"   },
  { key: "large",   size: 56,  icon: "L"   },
  { key: "xlarge",  size: 96,  icon: "XL"  },
  { key: "xxlarge", size: 168, icon: "XXL" },
] as const;
const DEFAULT_FONT_SIZE = 36;

// ─── Tous vos sous-composants restent IDENTIQUES ───────────────────────
// AyahMedallion, HizbBadge, SajdaBadge, TajwidInlineText — copiez-collez
// les vôtres tels quels ici, je ne les répète pas pour la lisibilité.
// ───────────────────────────────────────────────────────────────────────

// ─── FIX 3 : DecoratedMushafContent ────────────────────────────────────
// SEUL CHANGEMENT : supprimer minHeight "50vh", ajouter height "100%"
// sur le div interne + passer la prop `fillHeight` depuis le parent.
// ───────────────────────────────────────────────────────────────────────
interface DecoratedContentProps {
  ayahs: { number: number; arabic: string; surahNumber: number }[];
  theme: typeof THEMES.cream;
  fontSize: number;
  tajwidEnabled: boolean;
  currentPage: number;
  currentJuz: number;
  currentHizb: number;
  surahMeta: SurahMeta | undefined;
  t: (k: any) => string;
  fullscreen?: boolean;
  // ↓ NOUVEAU : permet au composant de remplir l'espace dispo
  fillHeight?: boolean;
  onBookmarkHizb?: (surah: number, ayah: number, hizb: number, label: string) => void;
  onBookmarkSajda?: (surah: number, ayah: number) => void;
}

function DecoratedMushafContent({
  ayahs,
  theme,
  fontSize,
  tajwidEnabled,
  currentPage,
  currentJuz,
  currentHizb,
  surahMeta,
  t,
  fullscreen = false,
  fillHeight = false,           // ← nouveau prop
  onBookmarkHizb,
  onBookmarkSajda,
}: DecoratedContentProps) {
  const outerPad = fullscreen ? "2px" : "4px";
  const innerPad = fullscreen ? "10px 8px 12px" : "12px 10px 14px";
  const arabicLineHeight = fontSize >= 120 ? 1.15 : fontSize >= 96 ? 1.2 : fontSize >= 56 ? 1.45 : 2.2;
  const arabicWordSpacing = fontSize >= 96 ? "1px" : fontSize >= 56 ? "2px" : "3px";
  const isLargeZoom = fontSize >= 56;

  return (
    <div
      // ↓ FIX 3a : si fillHeight, le cadre extérieur prend toute la hauteur dispo
      style={{
        border: `3px solid ${theme.frame}`,
        borderRadius: "6px",
        padding: outerPad,
        background: `linear-gradient(135deg, ${theme.frame}15, transparent, ${theme.frame}15)`,
        // ← NOUVEAU : hauteur dynamique quand on est en mode cards
        ...(fillHeight && { height: "100%", display: "flex", flexDirection: "column" }),
      }}
    >
      <div
        style={{
          border: `1.5px solid ${theme.frame}80`,
          borderRadius: "4px",
          padding: innerPad,
          backgroundColor: theme.bg,
          position: "relative",
          // ↓ FIX 3b : REMPLACE minHeight "50vh" — le div s'étire dans son parent flex
          ...(fillHeight
            ? { flex: 1, minHeight: 0, overflowY: "auto" }
            : { minHeight: fullscreen ? "auto" : "200px" }),
        }}
      >
        {/* Corner decorations — INCHANGÉES */}
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
                width: "18px", height: "18px",
                borderTop: isTop ? `2px solid ${theme.frame}` : "none",
                borderBottom: !isTop ? `2px solid ${theme.frame}` : "none",
                borderLeft: isLeft ? `2px solid ${theme.frame}` : "none",
                borderRight: !isLeft ? `2px solid ${theme.frame}` : "none",
                borderRadius: isTop && isLeft ? "4px 0 0 0" : isTop ? "0 4px 0 0" : isLeft ? "0 0 0 4px" : "0 0 4px 0",
              }}
            />
          );
        })}

        {/* Page header inside frame — INCHANGÉ */}
        <div className="flex items-center justify-between mb-1 pb-1" style={{ borderBottom: `1px solid ${theme.frame}30` }}>
          <span className="text-[9px] font-sans" style={{ color: `${theme.text}80` }}>
            {t("mushaf.juz" as any)} {currentJuz} · حزب {toArabicNum(currentHizb)}
          </span>
          <span className="text-xs font-['Amiri','serif'] font-bold" style={{ color: theme.medallion }}>
            {surahMeta?.nameArabic || ""}
          </span>
          <span className="text-[9px] font-sans" style={{ color: `${theme.text}80` }}>
            {currentPage}
          </span>
        </div>

        {/* Bismillah — INCHANGÉE */}
        {ayahs.length > 0 && ayahs[0].number === 1 && ayahs[0].surahNumber !== 1 && ayahs[0].surahNumber !== 9 && (
          <div className="text-center mb-1">
            <span
              className="font-['Amiri','serif'] font-bold inline-block px-3 py-0.5 rounded-full"
              style={{
                fontSize: `${fontSize * 0.65}px`,
                color: theme.medallion,
                background: `linear-gradient(90deg, transparent, ${theme.frame}15, transparent)`,
                border: `1px solid ${theme.frame}30`,
              }}
            >
              {surahMeta?.nameArabic}
            </span>
            <p
              className="font-['Amiri','serif']"
              style={{ fontSize: `${fontSize * 0.72}px`, color: `${theme.text}bb`, margin: "2px 0 4px" }}
              dir="rtl"
            >
              بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
            </p>
          </div>
        )}

        {/* Ayah text — INCHANGÉ */}
        <div
          className="font-['Amiri','Scheherazade_New','serif']"
          dir="rtl"
          style={{
            fontSize: `${fontSize}px`,
            textAlign: isLargeZoom ? "right" : "justify",
            textAlignLast: isLargeZoom ? "right" : "center",
            lineHeight: arabicLineHeight,
            color: theme.text,
            wordSpacing: arabicWordSpacing,
          }}
        >
          {ayahs.map((a) => {
            const hizbMarker = getHizbMarkerAt(a.surahNumber, a.number);
            const sajdaMarker = getSajdaAt(a.surahNumber, a.number);
            return (
              <span key={`${a.surahNumber}-${a.number}`}>
                {hizbMarker && (
                  <HizbBadge
                    label={hizbMarker.label}
                    frameColor={theme.frame}
                    onClick={() => onBookmarkHizb?.(a.surahNumber, a.number, hizbMarker.hizb, hizbMarker.label)}
                  />
                )}
                <TajwidInlineText text={a.arabic} tajwidEnabled={tajwidEnabled} textColor={theme.text} />
                {" "}
                <AyahMedallion number={a.number} color={theme.medallion} textColor={theme.medallionText} />
                {sajdaMarker && (
                  <SajdaBadge
                    frameColor={theme.frame}
                    onClick={() => onBookmarkSajda?.(a.surahNumber, a.number)}
                  />
                )}
                {" "}
              </span>
            );
          })}
        </div>

        {/* Page footer — INCHANGÉ */}
        <div className="flex items-center justify-center mt-2 pt-1" style={{ borderTop: `1px solid ${theme.frame}30` }}>
          <span className="text-[9px] font-sans" style={{ color: `${theme.text}60` }}>— {currentPage} —</span>
        </div>
      </div>
    </div>
  );
}

// ─── useScreenChunks — INCHANGÉ ────────────────────────────────────────
function useScreenChunks(
  ayahs: { number: number; arabic: string; surahNumber: number }[],
  fontSize: number,
) {
  const ayahsPerScreen = useMemo(() => {
    if (fontSize >= 96) return 1;
    if (fontSize >= 56) return 2;
    if (fontSize >= 36) return 4;
    if (fontSize >= 28) return 6;
    return 10;
  }, [fontSize]);

  const chunks = useMemo(() => {
    if (ayahs.length === 0) return [];
    const result: typeof ayahs[] = [];
    for (let i = 0; i < ayahs.length; i += ayahsPerScreen) {
      result.push(ayahs.slice(i, i + ayahsPerScreen));
    }
    return result;
  }, [ayahs, ayahsPerScreen]);

  return chunks;
}

// ─── ImmersiveVerseView — INCHANGÉ ─────────────────────────────────────
// (copiez le vôtre tel quel)

// ─── FullscreenMushafView — INCHANGÉ ───────────────────────────────────
// (copiez le vôtre tel quel)

// ═══════════════════════════════════════════════════════════════════════
// ─── Main MushafPage — SEULE LA PARTIE "cards mode" CHANGE ─────────────
// ═══════════════════════════════════════════════════════════════════════
export default function MushafPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();

  // ─── Tout votre état existant — INCHANGÉ ───────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [ayahs, setAyahs] = useState<{ number: number; arabic: string; surahNumber: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [surahList, setSurahList] = useState<SurahMeta[]>([]);
  const [bookmarkedPages, setBookmarkedPages] = useState<Set<number>>(new Set());
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [bookmarksList, setBookmarksList] = useState<{ page_number: number; id: string }[]>([]);
  const [immersiveIndex, setImmersiveIndex] = useState(0);
  const [readingStyle, setReadingStyle] = useState<ReadingStyle>(() => {
    try {
      const saved = localStorage.getItem(READING_STYLE_KEY) as ReadingStyle;
      if (saved === "mushaf" || saved === "cards" || saved === "immersive") return saved;
      return "cards";
    } catch { return "cards"; }
  });
  const [fontSize, setFontSize] = useState(() => {
    try {
      const saved = localStorage.getItem(MUSHAF_FONT_KEY);
      return saved ? Number(saved) : DEFAULT_FONT_SIZE;
    } catch { return DEFAULT_FONT_SIZE; }
  });
  const [screenIdx, setScreenIdx] = useState(0);
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
  const chunks = useScreenChunks(ayahs, fontSize);

  // ─── Tous vos useEffect, callbacks — INCHANGÉS ─────────────────────
  useEffect(() => { setScreenIdx(0); }, [currentPage]);
  useEffect(() => { try { localStorage.setItem(MUSHAF_THEME_KEY, mushafTheme); } catch {} }, [mushafTheme]);
  useEffect(() => { try { localStorage.setItem(MUSHAF_TAJWID_KEY, String(tajwidEnabled)); } catch {} }, [tajwidEnabled]);
  useEffect(() => { try { localStorage.setItem(MUSHAF_SOUND_KEY, String(pageSoundEnabled)); } catch {} }, [pageSoundEnabled]);
  useEffect(() => {
    try { const saved = localStorage.getItem(LAST_PAGE_KEY); if (saved) setCurrentPage(Number(saved)); } catch {}
  }, []);
  useEffect(() => { try { localStorage.setItem(LAST_PAGE_KEY, String(currentPage)); } catch {} }, [currentPage]);
  useEffect(() => { fetchSurahList().then(setSurahList).catch(() => {}); }, []);

  const loadBookmarks = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("mushaf_bookmarks").select("id, page_number").eq("user_id", user.id).order("created_at", { ascending: false });
    if (data) { setBookmarkedPages(new Set(data.map((b) => b.page_number))); setBookmarksList(data); }
  }, [user]);
  useEffect(() => { loadBookmarks(); }, [loadBookmarks]);

  const { data: pageData, loading: pageLoading } = useMushafPageData(currentPage);
  useEffect(() => {
    if (pageData) {
      setAyahs(pageData.ayahs.map((a) => ({ number: a.number, arabic: a.arabic, surahNumber: a.surahNumber })));
      setImmersiveIndex(0);
      setLoading(false);
    } else if (pageLoading) {
      setLoading(true);
    }
  }, [pageData, pageLoading]);

  const toggleBookmark = async () => {
    if (!user) { toast(t("mushaf.loginRequired" as any)); return; }
    const isBookmarked = bookmarkedPages.has(currentPage);
    if (isBookmarked) {
      const bm = bookmarksList.find((b) => b.page_number === currentPage);
      if (bm) await supabase.from("mushaf_bookmarks").delete().eq("id", bm.id);
    } else {
      await supabase.from("mushaf_bookmarks").insert({ user_id: user.id, page_number: currentPage, surah_number: getSurahForPage(currentPage) });
    }
    await loadBookmarks();
  };

  const bookmarkHizb = useCallback(async (surah: number, ayah: number, hizb: number, label: string) => {
    if (!user) { toast(t("mushaf.loginRequired" as any)); return; }
    await supabase.from("mushaf_bookmarks").insert({ user_id: user.id, page_number: currentPage, surah_number: surah, ayah_key: `${surah}:${ayah}`, note: `${label}` });
    toast.success(`${label} — Position sauvegardée ⭐`);
    await loadBookmarks();
  }, [user, currentPage, loadBookmarks, t]);

  const bookmarkSajda = useCallback(async (surah: number, ayah: number) => {
    if (!user) { toast(t("mushaf.loginRequired" as any)); return; }
    await supabase.from("mushaf_bookmarks").insert({ user_id: user.id, page_number: currentPage, surah_number: surah, ayah_key: `${surah}:${ayah}`, note: `سجدة التلاوة — ${surah}:${ayah}` });
    toast.success("سجدة التلاوة — Position sauvegardée ⭐");
    await loadBookmarks();
  }, [user, currentPage, loadBookmarks, t]);

  const goTo = useCallback((page: number) => {
    const p = Math.max(1, Math.min(TOTAL_MUSHAF_PAGES, page));
    if (p !== currentPage) { setCurrentPage(p); if (pageSoundEnabled) playPageTurnSound(); }
  }, [currentPage, pageSoundEnabled]);

  const goToPrevPage = useCallback(() => goTo(currentPage - 1), [goTo, currentPage]);
  const goToNextPage = useCallback(() => goTo(currentPage + 1), [goTo, currentPage]);
  const changeStyle = (style: ReadingStyle) => { setReadingStyle(style); localStorage.setItem(READING_STYLE_KEY, style); };

  const currentSurahNum = getSurahForPage(currentPage);
  const currentJuz = getJuzForPage(currentPage);
  const currentHizb = getHizbForPage(currentPage);
  const currentSurahMeta = surahList.find((s) => s.number === currentSurahNum);

  // ─── Fullscreen + Immersive — INCHANGÉS ────────────────────────────
  if (readingStyle === "mushaf") {
    return (
      <FullscreenMushafView
        ayahs={ayahs} theme={theme} fontSize={fontSize}
        setFontSize={(s) => { setFontSize(s); localStorage.setItem(MUSHAF_FONT_KEY, String(s)); }}
        tajwidEnabled={tajwidEnabled} currentPage={currentPage} currentJuz={currentJuz}
        currentHizb={currentHizb} surahMeta={currentSurahMeta}
        onBack={() => changeStyle("cards")} onPrev={goToPrevPage} onNext={goToNextPage}
        hasPrev={currentPage > 1} hasNext={currentPage < TOTAL_MUSHAF_PAGES}
        t={t} onBookmarkHizb={bookmarkHizb} onBookmarkSajda={bookmarkSajda}
      />
    );
  }
  if (readingStyle === "immersive") {
    return (
      <ImmersiveVerseView
        ayahs={ayahs} currentIndex={immersiveIndex} onChangeIndex={setImmersiveIndex}
        surahMeta={currentSurahMeta} onBack={() => changeStyle("cards")} fontSize={fontSize} t={t}
      />
    );
  }

  // ───────────────────────────────────────────────────────────────────
  // ═══ CARDS MODE — LES 3 FIXES SONT ICI ════════════════════════════
  // ───────────────────────────────────────────────────────────────────
  const currentChunk = chunks[screenIdx] || ayahs;
  const totalScreens = chunks.length;
  const goPrevScreen = () => { if (screenIdx > 0) setScreenIdx(screenIdx - 1); };
  const goNextScreen = () => { if (screenIdx < totalScreens - 1) setScreenIdx(screenIdx + 1); };

  // ── FIX 2 : Swipe touch ────────────────────────────────────────────
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Si le geste est clairement horizontal, bloquer le scroll de la page
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
    if (dx > dy * 1.5 && dx > 12) e.stopPropagation();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // Ignorer les gestes trop verticaux
    if (Math.abs(dy) > Math.abs(dx) * 1.3) { touchStartX.current = null; return; }

    if (Math.abs(dx) > 55) {
      if (dx < 0) {
        // Swipe gauche → avancer
        if (screenIdx < totalScreens - 1) goNextScreen();
        else goToNextPage();
      } else {
        // Swipe droit → reculer
        if (screenIdx > 0) goPrevScreen();
        else goToPrevPage();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // ── FIX 1 : Layout plein écran ─────────────────────────────────────
  return (
    // AVANT : <div className="min-h-screen pb-24" ...>
    // APRÈS  : flex column qui occupe exactement 100dvh
    <div
      className="flex flex-col overflow-hidden"
      style={{
        height: "100dvh",           // ← remplace min-h-screen
        backgroundColor: theme.bg,
      }}
      // ← FIX 2 : swipe branché ici
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <SEOHead
        title="Mushaf - Lecture du Coran"
        description="Lisez le Coran dans un Mushaf numérique avec tajwid coloré, thèmes personnalisables et marque-pages."
        path="/mushaf"
      />

      {/* ── HEADER : flex-shrink-0 garantit qu'il ne rétrécit jamais ── */}
      <div
        className="flex-shrink-0 sticky top-0 z-20 backdrop-blur border-b px-3 pt-10 pb-2"
        style={{ backgroundColor: theme.headerBg, borderColor: `${theme.frame}40` }}
      >
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ChevronLeft size={20} style={{ color: theme.text }} />
          </button>
          <div className="text-center flex-1 min-w-0">
            <p className="text-[10px] truncate" style={{ color: `${theme.text}99` }}>
              {t("mushaf.page" as any)} {currentPage} — {t("mushaf.juz" as any)} {currentJuz} · حزب {toArabicNum(currentHizb)}
              {totalScreens > 1 && ` — ${screenIdx + 1}/${totalScreens}`}
            </p>
            <p className="text-sm font-semibold font-['Amiri','serif'] truncate" style={{ color: theme.text }}>
              {currentSurahMeta?.nameArabic || ""}
            </p>
          </div>
          {/* ── Vos 4 boutons header (Star, List, BookOpen, Settings2) INCHANGÉS ── */}
          <div className="flex items-center gap-0.5">
            <button onClick={toggleBookmark} className="p-1.5">
              <Star
                size={18}
                className={bookmarkedPages.has(currentPage) ? "fill-yellow-400" : ""}
                style={{ color: bookmarkedPages.has(currentPage) ? "#facc15" : `${theme.text}80` }}
              />
            </button>
            {/* Sheet GoTo — INCHANGÉ (copiez le vôtre) */}
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
                        {surahList.map((s) => (
                          <button key={s.number} onClick={() => goTo(surahStartPage[s.number] || 1)} className="w-full text-left px-3 py-2 rounded-xl hover:bg-accent/40 flex justify-between items-center">
                            <span className="text-sm"><span className="text-muted-foreground mr-2">{s.number}.</span>{s.nameArabic} — {s.name}</span>
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
                          <button key={j} onClick={() => goTo(juzStartPage[j] || 1)} className="w-full text-left px-3 py-2 rounded-xl hover:bg-accent/40 flex justify-between items-center">
                            <span className="text-sm">{t("mushaf.juz" as any)} {j}</span>
                            <span className="text-[10px] text-muted-foreground">p.{juzStartPage[j]}</span>
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="page">
                    <div className="p-4 space-y-3">
                      <input type="number" min={1} max={TOTAL_MUSHAF_PAGES} defaultValue={currentPage}
                        className="w-full rounded-xl border border-border bg-card px-4 py-3 text-center text-lg"
                        onKeyDown={(e) => { if (e.key === "Enter") goTo(Number((e.target as HTMLInputElement).value)); }}
                      />
                      <p className="text-[11px] text-muted-foreground text-center">{t("mushaf.enterPage" as any)}</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </SheetContent>
            </Sheet>
            {/* Sheet Bookmarks — INCHANGÉ */}
            <Sheet open={showBookmarks} onOpenChange={setShowBookmarks}>
              <SheetTrigger asChild>
                <button className="p-1.5"><BookOpen size={18} style={{ color: `${theme.text}80` }} /></button>
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[60vh]">
                <SheetHeader><SheetTitle>{t("mushaf.bookmarks" as any)}</SheetTitle></SheetHeader>
                <ScrollArea className="h-[40vh] mt-3">
                  {bookmarksList.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">{t("mushaf.noBookmarks" as any)}</p>
                  ) : (
                    <div className="space-y-1 p-2">
                      {bookmarksList.map((bm) => {
                        const s = getSurahForPage(bm.page_number);
                        const meta = surahList.find((su) => su.number === s);
                        return (
                          <button key={bm.id} onClick={() => { goTo(bm.page_number); setShowBookmarks(false); }} className="w-full text-left px-3 py-2 rounded-xl hover:bg-accent/40 flex justify-between items-center">
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
            {/* Sheet Settings — INCHANGÉ */}
            <Sheet>
              <SheetTrigger asChild>
                <button className="p-1.5"><Settings2 size={18} style={{ color: `${theme.text}80` }} /></button>
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[75vh]">
                <SheetHeader><SheetTitle>{t("mushaf.readSettings" as any)}</SheetTitle></SheetHeader>
                <ScrollArea className="h-[60vh]">
                  <div className="p-4 space-y-5">
                    <div>
                      <p className="text-sm font-medium mb-2">{t("mushaf.readingStyle" as any)}</p>
                      <div className="flex gap-2">
                        {([
                          { key: "cards" as const, emoji: "📖", label: t("mushaf.styleCards" as any) },
                          { key: "immersive" as const, emoji: "🌌", label: t("mushaf.styleImmersive" as any) },
                          { key: "mushaf" as const, emoji: "🕌", label: t("mushaf.styleFullscreen" as any) || "Plein écran" },
                        ]).map((s) => (
                          <button key={s.key} onClick={() => changeStyle(s.key)}
                            className={`flex-1 py-2 px-2 rounded-xl text-xs font-medium border transition-colors ${readingStyle === s.key ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:bg-accent/40"}`}>
                            <span className="block text-base mb-0.5">{s.emoji}</span>{s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2"><Palette size={14} className="text-muted-foreground" /><span className="text-sm font-medium">Thème de fond</span></div>
                      <div className="flex gap-2">
                        {(Object.keys(THEMES) as MushafTheme[]).map((key) => (
                          <button key={key} onClick={() => setMushafTheme(key)}
                            className={`flex-1 py-2 px-1 rounded-xl text-xs font-medium border transition-colors ${mushafTheme === key ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:bg-accent/40"}`}>
                            <span className="block text-base mb-0.5">{THEMES[key].emoji}</span>{THEMES[key].label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2"><Type size={14} className="text-muted-foreground" /><span className="text-sm font-medium">{t("mushaf.textSize" as any)}</span></div>
                      <div className="grid grid-cols-5 gap-1.5">
                        {FONT_PRESETS.map((p) => {
                          const active = fontSize === p.size;
                          return (
                            <button key={p.key} onClick={() => { setFontSize(p.size); localStorage.setItem(MUSHAF_FONT_KEY, String(p.size)); }}
                              className={`flex flex-col items-center gap-0.5 py-2 rounded-xl border-2 transition-all ${active ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:border-muted-foreground/40"}`}>
                              <span className="font-['Amiri','serif']" style={{ fontSize: `${Math.min(p.size / 4 + 8, 24)}px` }}>ب</span>
                              <span className="text-[9px] font-bold">{p.icon}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {tajwidEnabled ? <Eye size={14} className="text-muted-foreground" /> : <EyeOff size={14} className="text-muted-foreground" />}
                        <span className="text-sm font-medium">Tajwid coloré</span>
                      </div>
                      <Switch checked={tajwidEnabled} onCheckedChange={setTajwidEnabled} />
                    </div>
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

      {/* ── FIX 1 : CONTENU MUSHAF — flex-1 remplace px-2 py-2 flottant ── */}
      {/* flex-1 = prend TOUT l'espace entre header et footer, min-h-0 crucial */}
      <div className="flex-1 min-h-0 px-2 py-2 flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div
              className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: `${theme.frame}60`, borderTopColor: "transparent" }}
            />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentPage}-${screenIdx}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              // ← flex-1 + flex flex-col pour passer la hauteur à DecoratedMushafContent
              className="flex-1 flex flex-col"
              style={{ minHeight: 0 }}
            >
              {/* FIX 3 : fillHeight={true} → le cadre s'étire jusqu'au footer */}
              <DecoratedMushafContent
                ayahs={currentChunk}
                theme={theme}
                fontSize={fontSize}
                tajwidEnabled={tajwidEnabled}
                currentPage={currentPage}
                currentJuz={currentJuz}
                currentHizb={currentHizb}
                surahMeta={currentSurahMeta}
                t={t}
                fillHeight={true}          // ← NOUVEAU : remplace minHeight "50vh"
                onBookmarkHizb={bookmarkHizb}
                onBookmarkSajda={bookmarkSajda}
              />
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* ── FIX 1 : BARRE TAILLE POLICE — flex-shrink-0 dans le flux ────── */}
      {/* AVANT : fixed bottom-[88px] → conflit avec BottomNav de App.tsx  */}
      {/* APRÈS : élément normal dans le flex, toujours visible en bas       */}
      <div
        className="flex-shrink-0 flex justify-center px-4 py-1"
        style={{ backgroundColor: `${theme.bg}f0` }}
      >
        <div
          className="backdrop-blur rounded-full px-2 py-1 flex items-center gap-1 shadow-md"
          style={{ backgroundColor: `${theme.bg}dd`, border: `1px solid ${theme.frame}30` }}
        >
          {FONT_PRESETS.map((p) => {
            const active = fontSize === p.size;
            return (
              <button
                key={p.key}
                onClick={() => { setFontSize(p.size); localStorage.setItem(MUSHAF_FONT_KEY, String(p.size)); }}
                style={{
                  padding: "2px 8px", borderRadius: "9999px",
                  fontSize: "10px", fontWeight: 700,
                  color: active ? theme.bg : `${theme.text}99`,
                  backgroundColor: active ? theme.frame : "transparent",
                  transition: "all 0.15s",
                }}
              >
                {p.icon}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── FIX 1 : BARRE DE NAVIGATION — flex-shrink-0 dans le flux ──────── */}
      {/* AVANT : fixed bottom-16 → positionné par rapport au viewport,       */}
      {/*         chevauche la BottomNav globale de App.tsx                    */}
      {/* APRÈS : collé juste au-dessus de la BottomNav globale                */}
      <div
        className="flex-shrink-0 flex justify-center px-4 pb-2 pt-1"
        style={{
          backgroundColor: `${theme.bg}f5`,
          borderTop: `1px solid ${theme.frame}30`,
        }}
      >
        <div
          className="backdrop-blur rounded-full px-3 py-1.5 flex items-center gap-3 w-full max-w-sm"
          style={{ backgroundColor: `${theme.bg}ee`, border: `1px solid ${theme.frame}40` }}
        >
          <button onClick={goToPrevPage} disabled={currentPage <= 1} className="p-1.5 disabled:opacity-30 active:scale-90 transition-transform">
            <ArrowLeft size={20} style={{ color: theme.text }} />
          </button>

          {totalScreens > 1 && (
            <button onClick={goPrevScreen} disabled={screenIdx <= 0} className="text-[10px] disabled:opacity-30" style={{ color: theme.text }}>▲</button>
          )}

          <span className="text-xs font-medium flex-1 text-center" style={{ color: theme.text }}>
            {currentPage}
            {totalScreens > 1 && <span className="text-[10px] opacity-60"> ({screenIdx + 1}/{totalScreens})</span>}
          </span>

          {totalScreens > 1 && (
            <button onClick={goNextScreen} disabled={screenIdx >= totalScreens - 1} className="text-[10px] disabled:opacity-30" style={{ color: theme.text }}>▼</button>
          )}

          <button onClick={goToNextPage} disabled={currentPage >= TOTAL_MUSHAF_PAGES} className="p-1.5 disabled:opacity-30 active:scale-90 transition-transform">
            <ArrowRight size={20} style={{ color: theme.text }} />
          </button>
        </div>
      </div>

    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// RÉSUMÉ DES CHANGEMENTS (cherchez "FIX" dans ce fichier) :
//
// FIX 1 — Layout (3 endroits) :
//   • div racine : min-h-screen pb-24 → flex flex-col + height:100dvh
//   • div contenu : px-2 py-2        → flex-1 min-h-0 flex flex-col
//   • Barre police : fixed bottom-[88px] → flex-shrink-0 dans le flux
//   • Barre nav    : fixed bottom-16     → flex-shrink-0 dans le flux
//
// FIX 2 — Swipe (nouveau) :
//   • handleTouchStart/Move/End sur le div racine
//   • Détection angle horizontal (ignore gestes verticaux)
//   • Swipe gauche/droite = chunk ou page suivant/précédent
//
// FIX 3 — DecoratedMushafContent (1 endroit) :
//   • Nouvelle prop fillHeight?: boolean
//   • Si fillHeight=true : minHeight "50vh" → flex:1 + overflowY:auto
//   • Passé avec fillHeight={true} depuis le mode cards
// ═══════════════════════════════════════════════════════════════════════
