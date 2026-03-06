import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import SEOHead from "@/components/SEOHead";
import {
  ChevronLeft, Bookmark, List, Settings2,
  Play, Pause, Loader2, ChevronRight, BookOpen,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  TOTAL_MUSHAF_PAGES, getSurahForPage, getJuzForPage,
  surahStartPage, juzStartPage,
} from "@/data/mushafPages";
import { fetchSurahList, type SurahMeta } from "@/lib/quranData";
import { getHizbMarkerAt, getSajdaAt, getHizbForPage, toArabicNum } from "@/data/hizbData";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { analyzeAyahTajwid } from "@/data/tajwidRules";
import { playPageTurnSound } from "@/lib/mushafSound";
import { useMushafPageData } from "@/hooks/useMushafPageData";
import { useMushafAudio } from "@/hooks/useMushafAudio";
import { useMushafOffline } from "@/hooks/useMushafOffline";
import ReciterSelector from "@/components/mushaf/ReciterSelector";
import AyahFavoriteSheet from "@/components/mushaf/AyahFavoriteSheet";
import WordPopup from "@/components/mushaf/WordPopup";
import OfflineDownloadPrompt from "@/components/mushaf/OfflineDownloadPrompt";
import MushafEditionSheet, { getStoredEdition, setStoredEdition, getEditionById } from "@/components/mushaf/MushafEditionSheet";

// ─── CONSTANTES ─────────────────────────────────────────────
const LAST_PAGE_KEY = "mushaf_last_page";
const MUSHAF_THEME_KEY = "mushaf_theme";
const MUSHAF_TAJWID_KEY = "mushaf_tajwid";
const MUSHAF_SOUND_KEY = "mushaf_sound";
const MUSHAF_MODE_KEY = "mushaf_mode";
const MUSHAF_ZOOM_KEY = "mushaf_zoom";

type MushafTheme = "cream" | "night" | "blue" | "white";
type MushafMode = "image" | "text";

const THEMES = {
  cream: {
    bg: "#f5f0e1", text: "#1a1200", medallion: "#1a4a7a",
    medallionText: "#fff", frame: "#c9a84c",
    headerBg: "rgba(245,240,225,0.97)", label: "Crème", emoji: "📜",
  },
  white: {
    bg: "#ffffff", text: "#111111", medallion: "#1a4a7a",
    medallionText: "#fff", frame: "#c9a84c",
    headerBg: "rgba(255,255,255,0.97)", label: "Blanc", emoji: "⬜",
  },
  night: {
    bg: "#111827", text: "#e8dcc8", medallion: "#c9a84c",
    medallionText: "#111", frame: "#c9a84c",
    headerBg: "rgba(17,24,39,0.97)", label: "Nuit", emoji: "🌙",
  },
  blue: {
    bg: "#0d1b2a", text: "#d4d8e0", medallion: "#6b93d6",
    medallionText: "#fff", frame: "#4a6fa5",
    headerBg: "rgba(13,27,42,0.97)", label: "Bleuté", emoji: "🔵",
  },
} as const;

type ThemeValues = typeof THEMES[MushafTheme];

function getMushafImageUrl(page: number) {
  return `https://static.qurancdn.com/images/bg/${page}.png`;
}

function btnStyle(theme: ThemeValues, size: number): React.CSSProperties {
  return {
    width: size, height: size, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    backgroundColor: `${theme.frame}20`, border: "none", cursor: "pointer",
    color: theme.text, flexShrink: 0,
  };
}

// ─── Mode IMAGE ─────────────────────────────────────────────
function MushafImageMode({
  page, theme, zoom, onSwipeLeft, onSwipeRight,
}: {
  page: number; theme: ThemeValues; zoom: number;
  onSwipeLeft: () => void; onSwipeRight: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => { setLoaded(false); setError(false); }, [page]);

  // Preload adjacent pages
  useEffect(() => {
    [page - 1, page + 1].forEach(p => {
      if (p >= 1 && p <= TOTAL_MUSHAF_PAGES) {
        const img = new window.Image();
        img.src = getMushafImageUrl(p);
      }
    });
  }, [page]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX.current || !touchStartY.current) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.8) {
      if (dx < 0) onSwipeLeft(); else onSwipeRight();
    }
    touchStartX.current = null; touchStartY.current = null;
  };

  return (
    <div
      style={{
        flex: 1, minHeight: 0, display: "flex", alignItems: "center",
        justifyContent: "center", backgroundColor: theme.bg,
        overflow: zoom > 1 ? "auto" : "hidden",
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {!loaded && !error && (
        <div className="flex items-center justify-center">
          <Loader2 className="animate-spin" size={32} style={{ color: theme.frame }} />
        </div>
      )}
      {error && (
        <div className="text-center p-4" style={{ color: theme.text }}>
          <p className="text-2xl mb-2">⚠️</p>
          <p className="text-sm">Image indisponible · Page {page}</p>
          <p className="text-xs opacity-60">Vérifiez votre connexion</p>
        </div>
      )}
      <img
        src={getMushafImageUrl(page)}
        alt={`Mushaf page ${page}`}
        style={{
          maxWidth: "100%", maxHeight: "100%", objectFit: "contain",
          transform: `scale(${zoom})`, transformOrigin: "center",
          display: loaded && !error ? "block" : "none",
          touchAction: zoom > 1 ? "pinch-zoom" : "pan-y",
        }}
        onLoad={() => setLoaded(true)}
        onError={() => { setError(true); setLoaded(true); }}
        draggable={false}
      />
    </div>
  );
}

// ─── Tajwid Word ────────────────────────────────────────────
function TajwidWord({
  word, textColor, onTap, isPlaying,
}: {
  word: { text: string; primaryColor?: string | null };
  textColor: string;
  onTap: (e: React.MouseEvent, w: { text: string; tajwidRule?: string; tajwidColor?: string }) => void;
  isPlaying: boolean;
}) {
  const color = word.primaryColor
    ? (word.primaryColor.startsWith("hsl") ? word.primaryColor : `hsl(${word.primaryColor})`)
    : textColor;
  const rule = (word as any).rules?.[0];
  const tajwidRule = rule?.id;
  const tajwidColor = rule?.color ? `hsl(${rule.color})` : undefined;

  return (
    <span
      onClick={(e) => onTap(e, { text: word.text, tajwidRule, tajwidColor })}
      style={{
        color: isPlaying ? "#22C55E" : color,
        cursor: "pointer", borderRadius: 3, padding: "0 1px",
        backgroundColor: isPlaying ? "#22C55E15" : "transparent",
        transition: "all 0.15s", display: "inline",
      }}
    >
      {word.text}
    </span>
  );
}

// ─── Mode TEXTE ─────────────────────────────────────────────
function MushafTextMode({
  ayahs, theme, tajwidEnabled, fontSize,
  currentPage, currentJuz, currentHizb, surahMeta,
  audio, favoriteAyahs, onAyahLongPress, onWordTap,
  onSwipeLeft, onSwipeRight,
}: {
  ayahs: { number: number; arabic: string; surahNumber: number }[];
  theme: ThemeValues; tajwidEnabled: boolean; fontSize: number;
  currentPage: number; currentJuz: number; currentHizb: number;
  surahMeta: SurahMeta | undefined;
  audio: ReturnType<typeof useMushafAudio>;
  favoriteAyahs: Set<string>;
  onAyahLongPress: (ayah: { number: number; arabic: string; surahNumber: number }) => void;
  onWordTap: (e: React.MouseEvent, word: { text: string; tajwidRule?: string; tajwidColor?: string }) => void;
  onSwipeLeft: () => void; onSwipeRight: () => void;
}) {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX.current || !touchStartY.current) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.8) {
      if (dx < 0) onSwipeLeft(); else onSwipeRight();
    }
    touchStartX.current = null; touchStartY.current = null;
  };

  const showBismillah = ayahs.length > 0
    && ayahs[0].number === 1
    && ayahs[0].surahNumber !== 1
    && ayahs[0].surahNumber !== 9;

  return (
    <div
      data-mushaf-page
      style={{
        flex: 1, minHeight: 0, overflow: "auto", backgroundColor: theme.bg,
        WebkitOverflowScrolling: "touch",
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Decorative frame */}
      <div style={{ padding: 8, minHeight: "100%" }}>
        <div style={{
          border: `2px solid ${theme.frame}40`, borderRadius: 12,
          padding: "12px 10px", minHeight: "100%", position: "relative",
        }}>
          {/* Corner decorations */}
          {(["top-left", "top-right", "bottom-left", "bottom-right"] as const).map((pos) => (
            <div key={pos} style={{
              position: "absolute",
              [pos.includes("top") ? "top" : "bottom"]: -2,
              [pos.includes("left") ? "left" : "right"]: -2,
              width: 18, height: 18, borderRadius: 3,
              border: `2px solid ${theme.frame}60`,
              borderTop: pos.includes("bottom") ? "none" : undefined,
              borderBottom: pos.includes("top") ? "none" : undefined,
              borderLeft: pos.includes("right") ? "none" : undefined,
              borderRight: pos.includes("left") ? "none" : undefined,
            }} />
          ))}

          {/* Page header */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: 10, padding: "0 4px",
            borderBottom: `1px solid ${theme.frame}30`, paddingBottom: 6,
          }}>
            <span style={{ fontSize: 10, color: theme.frame, fontFamily: "sans-serif" }}>
              ج{currentJuz} · حزب {toArabicNum(currentHizb)}
            </span>
            <span style={{ fontSize: 13, color: theme.frame, fontFamily: "'Amiri', serif", fontWeight: 700 }}>
              {surahMeta?.nameArabic || ""}
            </span>
            <span style={{ fontSize: 10, color: theme.frame, fontFamily: "sans-serif" }}>
              {currentPage}
            </span>
          </div>

          {/* Bismillah */}
          {showBismillah && (
            <div style={{ textAlign: "center", margin: "8px 0 12px", direction: "rtl" as const }}>
              <div style={{
                fontSize: 14, color: theme.frame, fontFamily: "'Amiri', serif",
                fontWeight: 700, marginBottom: 4,
              }}>
                {surahMeta?.nameArabic}
              </div>
              <div style={{
                fontSize: 20, color: theme.text, fontFamily: "'Amiri', serif",
                letterSpacing: 1,
              }}>
                بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
              </div>
            </div>
          )}

          {/* Verses */}
          <div style={{
            fontFamily: "'Amiri', 'Scheherazade New', serif",
            fontSize, lineHeight: fontSize >= 28 ? 2.5 : 2.2,
            direction: "rtl" as const, textAlign: "justify",
            textAlignLast: "center" as const, color: theme.text,
            wordSpacing: "3px",
          }}>
            {ayahs.map((a) => {
              const hizbMarker = getHizbMarkerAt(a.surahNumber, a.number);
              const sajdaMarker = getSajdaAt(a.surahNumber, a.number);
              const isFav = favoriteAyahs.has(`${a.surahNumber}:${a.number}`);
              const isPlayingThis = audio.playingKey === `${a.surahNumber}:${a.number}`;
              const words = tajwidEnabled ? analyzeAyahTajwid(a.arabic) : null;

              return (
                <span
                  key={`${a.surahNumber}:${a.number}`}
                  onContextMenu={(e) => { e.preventDefault(); onAyahLongPress(a); }}
                >
                  {hizbMarker && (
                    <span style={{
                      fontSize: 9, color: theme.medallion, fontFamily: "sans-serif",
                      verticalAlign: "super", margin: "0 2px",
                    }}>
                      {hizbMarker.label}
                    </span>
                  )}

                  {words ? (
                    words.map((w, i) => (
                      <span key={i}>
                        <TajwidWord word={w} textColor={theme.text} onTap={onWordTap} isPlaying={isPlayingThis} />
                        {i < words.length - 1 ? " " : ""}
                      </span>
                    ))
                  ) : (
                    <span>{a.arabic}</span>
                  )}

                  {" "}

                  {/* Ayah number medallion */}
                  <span
                    onClick={() => audio.toggleAyah(a.surahNumber, a.number)}
                    style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      width: 24, height: 24, borderRadius: "50%",
                      backgroundColor: isPlayingThis ? "#22C55E" : theme.medallion,
                      color: isPlayingThis ? "#fff" : theme.medallionText,
                      fontSize: 9, fontWeight: 700, fontFamily: "sans-serif",
                      verticalAlign: "middle", margin: "0 3px",
                      boxShadow: `0 0 0 2px ${theme.medallion}30`,
                      cursor: "pointer", flexShrink: 0, transition: "all 0.2s",
                    }}
                    title="Écouter ce verset"
                  >
                    {isPlayingThis ? (audio.isLoading ? "…" : "⏸") : a.number}
                  </span>

                  {isFav && <span style={{ fontSize: 10, verticalAlign: "super" }}>⭐</span>}

                  {sajdaMarker && (
                    <span style={{
                      fontSize: 12, color: "#ef4444", verticalAlign: "super", margin: "0 2px",
                    }}>
                      ۩
                    </span>
                  )}
                  {" "}
                </span>
              );
            })}
          </div>

          {/* Page footer */}
          <div style={{
            textAlign: "center", marginTop: 12, paddingTop: 6,
            borderTop: `1px solid ${theme.frame}30`,
          }}>
            <span style={{ fontSize: 10, color: theme.frame, fontFamily: "sans-serif" }}>
              — {currentPage} —
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL ────────────────────────────────────
export default function MushafPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [currentPage, setCurrentPage] = useState(() => {
    try { const s = localStorage.getItem(LAST_PAGE_KEY); return s ? Number(s) : 1; } catch { return 1; }
  });
  const [mushafMode, setMushafMode] = useState<MushafMode>(() => {
    try { return (localStorage.getItem(MUSHAF_MODE_KEY) as MushafMode) || "text"; } catch { return "text"; }
  });
  const [mushafTheme, setMushafTheme] = useState<MushafTheme>(() => {
    try { return (localStorage.getItem(MUSHAF_THEME_KEY) as MushafTheme) || "cream"; } catch { return "cream"; }
  });
  const [tajwidEnabled, setTajwidEnabled] = useState(() => {
    try { return localStorage.getItem(MUSHAF_TAJWID_KEY) !== "false"; } catch { return true; }
  });
  const [pageSoundEnabled, setPageSoundEnabled] = useState(() => {
    try { return localStorage.getItem(MUSHAF_SOUND_KEY) !== "false"; } catch { return true; }
  });
  const [fontSize, setFontSize] = useState(() => {
    try { const s = localStorage.getItem(MUSHAF_ZOOM_KEY); return s ? Number(s) : 22; } catch { return 22; }
  });
  const [zoom, setZoom] = useState(1);
  const [mushafEdition, setMushafEdition] = useState(() => getStoredEdition());
  const [showEditionSheet, setShowEditionSheet] = useState(false);
  const currentEditionData = getEditionById(mushafEdition);

  // UI State
  const [showReciterSelector, setShowReciterSelector] = useState(() =>
    !localStorage.getItem("mushaf_reciter")
  );
  const [wordPopup, setWordPopup] = useState<{
    word: { text: string; tajwidRule?: string; tajwidColor?: string };
    position: { x: number; y: number };
  } | null>(null);
  const [ayahForFavorite, setAyahForFavorite] = useState<{
    number: number; arabic: string; surahNumber: number;
  } | null>(null);
  const [surahList, setSurahList] = useState<SurahMeta[]>([]);
  const [favoriteAyahs, setFavoriteAyahs] = useState<Set<string>>(new Set());
  const [bookmarksList, setBookmarksList] = useState<{ page_number: number; id: string }[]>([]);
  const [bookmarkedPages, setBookmarkedPages] = useState<Set<number>>(new Set());

  // Hooks
  const audio = useMushafAudio();
  const offline = useMushafOffline();
  const theme = THEMES[mushafTheme];

  // Data
  const { data: pageData, loading } = useMushafPageData(currentPage);
  const ayahs = useMemo(() =>
    pageData?.ayahs?.map(a => ({ number: a.number, arabic: a.arabic, surahNumber: a.surahNumber })) ?? [],
    [pageData]
  );

  const currentSurahNum = getSurahForPage(currentPage);
  const currentJuz = getJuzForPage(currentPage);
  const currentHizb = getHizbForPage(currentPage);
  const currentSurahMeta = useMemo(() =>
    surahList.find(s => s.number === currentSurahNum), [surahList, currentSurahNum]
  );

  // Persistence
  useEffect(() => { try { localStorage.setItem(LAST_PAGE_KEY, String(currentPage)); } catch {} }, [currentPage]);
  useEffect(() => { try { localStorage.setItem(MUSHAF_MODE_KEY, mushafMode); } catch {} }, [mushafMode]);
  useEffect(() => { try { localStorage.setItem(MUSHAF_THEME_KEY, mushafTheme); } catch {} }, [mushafTheme]);
  useEffect(() => { try { localStorage.setItem(MUSHAF_TAJWID_KEY, String(tajwidEnabled)); } catch {} }, [tajwidEnabled]);
  useEffect(() => { try { localStorage.setItem(MUSHAF_ZOOM_KEY, String(fontSize)); } catch {} }, [fontSize]);

  // Load surah list
  useEffect(() => { fetchSurahList().then(setSurahList).catch(() => {}); }, []);

  // Bookmarks
  const loadBookmarks = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("mushaf_bookmarks").select("id, page_number")
      .eq("user_id", user.id).order("created_at", { ascending: false });
    if (data) {
      setBookmarkedPages(new Set(data.map(b => b.page_number)));
      setBookmarksList(data);
    }
  }, [user]);
  useEffect(() => { loadBookmarks(); }, [loadBookmarks]);

  // Favorites
  const loadFavoriteAyahs = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("ayah_favorites").select("surah_number, ayah_number")
      .eq("user_id", user.id);
    if (data) {
      setFavoriteAyahs(new Set(data.map(f => `${f.surah_number}:${f.ayah_number}`)));
    }
  }, [user]);
  useEffect(() => { loadFavoriteAyahs(); }, [loadFavoriteAyahs]);

  // Navigation
  const goTo = useCallback((page: number) => {
    const p = Math.max(1, Math.min(TOTAL_MUSHAF_PAGES, page));
    if (p !== currentPage) {
      setCurrentPage(p);
      audio.stopAudio();
      setWordPopup(null);
      if (pageSoundEnabled) playPageTurnSound();
    }
  }, [currentPage, pageSoundEnabled, audio]);

  const goNext = useCallback(() => goTo(currentPage + 1), [goTo, currentPage]);
  const goPrev = useCallback(() => goTo(currentPage - 1), [goTo, currentPage]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goNext();
      if (e.key === "ArrowRight") goPrev();
      if (e.key === "Escape") navigate(-1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev, navigate]);

  // Bookmark toggle
  const toggleBookmark = async () => {
    if (!user) { toast("Connectez-vous pour sauvegarder"); return; }
    const isBookmarked = bookmarkedPages.has(currentPage);
    if (isBookmarked) {
      const bm = bookmarksList.find(b => b.page_number === currentPage);
      if (bm) await supabase.from("mushaf_bookmarks").delete().eq("id", bm.id);
      toast("Marque-page supprimé");
    } else {
      await supabase.from("mushaf_bookmarks").insert({
        user_id: user.id, page_number: currentPage,
        surah_number: getSurahForPage(currentPage),
      });
      toast.success("Page sauvegardée ⭐");
    }
    await loadBookmarks();
  };

  // Word tap
  const handleWordTap = useCallback((
    e: React.MouseEvent,
    word: { text: string; tajwidRule?: string; tajwidColor?: string }
  ) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setWordPopup({ word, position: { x: rect.left + rect.width / 2, y: rect.top } });
  }, []);

  const handleAyahLongPress = useCallback((
    ayah: { number: number; arabic: string; surahNumber: number }
  ) => {
    setAyahForFavorite(ayah);
  }, []);

  // ─── RENDER ────────────────────────────────────────────────
  return (
    <>
      <SEOHead
        title="Mushaf - Lecture du Coran"
        description="Lisez le Coran avec tajwid coloré, mode image et audio. Zoom intelligent et favoris personnalisés."
        path="/mushaf"
      />

      {/* Reciter selector on first visit */}
      {showReciterSelector && (
        <ReciterSelector
          onSelect={(id) => { audio.setReciter(id); setShowReciterSelector(false); }}
          onDismiss={() => setShowReciterSelector(false)}
        />
      )}

      {/* Offline download prompt */}
      {offline.showPrompt && (
        <OfflineDownloadPrompt
          onDownload={(juzList) => {
            juzList.forEach(j => offline.downloadJuz(j));
            offline.dismissPrompt();
          }}
          onDismiss={offline.dismissPrompt}
          downloadedJuz={offline.downloadedJuz}
        />
      )}

      {/* Word popup */}
      <AnimatePresence>
        {wordPopup && (
          <WordPopup
            word={wordPopup.word}
            position={wordPopup.position}
            onClose={() => setWordPopup(null)}
            onPlayWord={() => setWordPopup(null)}
            isPlaying={false}
          />
        )}
      </AnimatePresence>

      {/* Favorite sheet */}
      {ayahForFavorite && (
        <AyahFavoriteSheet
          ayah={ayahForFavorite}
          onClose={() => setAyahForFavorite(null)}
          onSaved={() => { loadFavoriteAyahs(); setAyahForFavorite(null); }}
        />
      )}

      {/* Mushaf edition sheet */}
      <MushafEditionSheet
        open={showEditionSheet}
        onOpenChange={setShowEditionSheet}
        currentEdition={mushafEdition}
        onSelect={(id) => {
          setMushafEdition(id);
          setStoredEdition(id);
          toast.success(`Mushaf changé : ${getEditionById(id).label}`);
        }}
      />

      {/* ═══ MAIN CONTAINER ═══ */}
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 40,
          display: "flex", flexDirection: "column",
          backgroundColor: theme.bg,
        }}
        onClick={() => setWordPopup(null)}
      >
        {/* ═══ HEADER ═══ */}
        <div style={{
          flexShrink: 0, display: "flex", alignItems: "center",
          gap: 6, padding: "8px 10px",
          paddingTop: "calc(8px + env(safe-area-inset-top, 0px))",
          backgroundColor: theme.headerBg,
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${theme.frame}20`,
        }}>
          {/* Back */}
          <button onClick={() => navigate(-1)} style={btnStyle(theme, 36)}>
            <ChevronLeft size={18} />
          </button>

          {/* Center info */}
          <div style={{ flex: 1, textAlign: "center", minWidth: 0 }}>
            <div style={{ fontSize: 11, color: theme.text, fontFamily: "sans-serif", opacity: 0.8 }}>
              Page {currentPage} · Juz {currentJuz} · حزب {toArabicNum(currentHizb)}
            </div>
            <div style={{
              fontSize: 14, color: theme.frame, fontFamily: "'Amiri', serif", fontWeight: 700,
            }}>
              {currentSurahMeta?.nameArabic || ""}
            </div>
          </div>

          {/* Edition selector */}
          <button
            onClick={() => setShowEditionSheet(true)}
            style={{ ...btnStyle(theme, 34), fontSize: 14 }}
            title="Changer de Mushaf"
          >
            <BookOpen size={15} color={theme.frame} />
          </button>

          {/* Mode toggle */}
          <button
            onClick={() => setMushafMode(m => m === "text" ? "image" : "text")}
            style={{ ...btnStyle(theme, 34), fontSize: 11, fontWeight: 700, color: theme.frame }}
          >
            {mushafMode === "text" ? "IMG" : "تج"}
          </button>

          {/* Bookmark */}
          <button onClick={toggleBookmark} style={btnStyle(theme, 34)}>
            <Bookmark size={16} fill={bookmarkedPages.has(currentPage) ? theme.frame : "none"} color={theme.frame} />
          </button>

          {/* GoTo Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <button style={btnStyle(theme, 34)}>
                <List size={16} />
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl max-h-[70vh]">
              <SheetHeader>
                <SheetTitle>Aller à</SheetTitle>
              </SheetHeader>
              <Tabs defaultValue="surah" className="mt-2">
                <TabsList className="w-full">
                  <TabsTrigger value="surah" className="flex-1">Sourate</TabsTrigger>
                  <TabsTrigger value="juz" className="flex-1">Juz</TabsTrigger>
                  <TabsTrigger value="page" className="flex-1">Page</TabsTrigger>
                </TabsList>
                <TabsContent value="surah">
                  <ScrollArea className="h-[45vh]">
                    <div className="space-y-1 p-1">
                      {surahList.map(s => (
                        <button
                          key={s.number}
                          onClick={() => goTo(surahStartPage[s.number] || 1)}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-accent/40 flex justify-between items-center"
                        >
                          <span>
                            <span className="text-xs text-muted-foreground mr-1">{s.number}.</span>
                            <span className="text-sm">{s.nameArabic} — {s.name}</span>
                          </span>
                          <span className="text-xs text-muted-foreground">p.{surahStartPage[s.number]}</span>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="juz">
                  <ScrollArea className="h-[45vh]">
                    <div className="space-y-1 p-1">
                      {Array.from({ length: 30 }, (_, i) => i + 1).map(j => (
                        <button
                          key={j}
                          onClick={() => goTo(juzStartPage[j] || 1)}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-accent/40 flex justify-between items-center"
                        >
                          <span className="text-sm">Juz {j}</span>
                          <span className="text-xs text-muted-foreground">p.{juzStartPage[j]}</span>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="page">
                  <div className="p-4">
                    <input
                      type="number"
                      min={1}
                      max={604}
                      placeholder="Numéro de page (1-604)"
                      className="w-full rounded-xl border border-border px-4 py-3 text-center bg-background"
                      onKeyDown={(e) => { if (e.key === "Enter") goTo(Number((e.target as HTMLInputElement).value)); }}
                    />
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Appuyez Entrée pour aller à la page
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </SheetContent>
          </Sheet>

          {/* Settings Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <button style={btnStyle(theme, 34)}>
                <Settings2 size={16} />
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl max-h-[70vh]">
              <SheetHeader>
                <SheetTitle>Paramètres Mushaf</SheetTitle>
              </SheetHeader>
              <div className="py-4 space-y-5">
                {/* Theme */}
                <div>
                  <p className="text-sm font-semibold mb-2">Thème</p>
                  <div className="flex gap-2">
                    {(Object.keys(THEMES) as MushafTheme[]).map(k => (
                      <button
                        key={k}
                        onClick={() => setMushafTheme(k)}
                        className={`flex-1 py-2 rounded-xl border text-xs font-medium transition-all ${
                          mushafTheme === k ? "border-primary bg-primary/10" : "border-border"
                        }`}
                      >
                        {THEMES[k].emoji} {THEMES[k].label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font size (text mode) */}
                <div>
                  <p className="text-sm font-semibold mb-2">Taille du texte: {fontSize}px</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setFontSize(f => Math.max(16, f - 2))}
                      className="w-10 h-10 rounded-xl border border-border flex items-center justify-center text-lg"
                    >
                      A
                    </button>
                    <input
                      type="range" min={16} max={40} value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="flex-1"
                    />
                    <button
                      onClick={() => setFontSize(f => Math.min(40, f + 2))}
                      className="w-10 h-10 rounded-xl border border-border flex items-center justify-center text-xl font-bold"
                    >
                      A
                    </button>
                  </div>
                </div>

                {/* Tajwid toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Tajwid coloré</span>
                  <Switch checked={tajwidEnabled} onCheckedChange={setTajwidEnabled} />
                </div>

                {/* Page turn sound */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Son de page</span>
                  <Switch checked={pageSoundEnabled} onCheckedChange={(v) => {
                    setPageSoundEnabled(v);
                    try { localStorage.setItem(MUSHAF_SOUND_KEY, String(v)); } catch {}
                  }} />
                </div>

                {/* Mushaf Edition */}
                <div>
                  <p className="text-sm font-semibold mb-2">Édition du Mushaf</p>
                  <button
                    onClick={() => setShowEditionSheet(true)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border text-sm text-left hover:bg-accent/40 flex items-center gap-2"
                  >
                    <span>{currentEditionData.icon}</span>
                    <span className="flex-1">{currentEditionData.label}</span>
                    <span className="text-xs text-muted-foreground">Changer</span>
                  </button>
                </div>

                {/* Reciter */}
                <div>
                  <p className="text-sm font-semibold mb-2">Récitant</p>
                  <button
                    onClick={() => setShowReciterSelector(true)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border text-sm text-left hover:bg-accent/40"
                  >
                    🔊 Changer le récitant
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* ═══ CONTENT ═══ */}
        {loading ? (
          <div style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
            backgroundColor: theme.bg,
          }}>
            <Loader2 className="animate-spin" size={32} style={{ color: theme.frame }} />
          </div>
        ) : mushafMode === "image" ? (
          <MushafImageMode
            page={currentPage} theme={theme} zoom={zoom}
            onSwipeLeft={goNext} onSwipeRight={goPrev}
          />
        ) : (
          <MushafTextMode
            ayahs={ayahs} theme={theme} tajwidEnabled={tajwidEnabled}
            fontSize={fontSize} currentPage={currentPage}
            currentJuz={currentJuz} currentHizb={currentHizb}
            surahMeta={currentSurahMeta} audio={audio}
            favoriteAyahs={favoriteAyahs}
            onAyahLongPress={handleAyahLongPress}
            onWordTap={handleWordTap}
            onSwipeLeft={goNext} onSwipeRight={goPrev}
          />
        )}

        {/* ═══ FOOTER ═══ */}
        <div style={{
          flexShrink: 0, display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: 8,
          padding: "8px 16px",
          paddingBottom: "calc(8px + env(safe-area-inset-bottom, 0px))",
          backgroundColor: theme.headerBg,
          backdropFilter: "blur(12px)",
          borderTop: `1px solid ${theme.frame}20`,
        }}>
          {/* Previous */}
          <button
            onClick={goPrev}
            disabled={currentPage <= 1}
            style={{
              ...btnStyle(theme, 40),
              opacity: currentPage <= 1 ? 0.3 : 1,
            }}
          >
            <ChevronRight size={20} />
          </button>

          {/* Play page */}
          <button
            onClick={() => {
              if (audio.playingKey) audio.stopAudio();
              else audio.playPage(ayahs);
            }}
            style={{
              ...btnStyle(theme, 44),
              backgroundColor: audio.playingKey ? "#22C55E" : `${theme.frame}30`,
              color: audio.playingKey ? "#fff" : theme.text,
            }}
          >
            {audio.isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : audio.playingKey ? (
              <Pause size={18} />
            ) : (
              <Play size={18} />
            )}
          </button>

          {/* Page indicator */}
          <span style={{ fontSize: 12, color: theme.text, fontFamily: "sans-serif", opacity: 0.7 }}>
            {currentPage} / {TOTAL_MUSHAF_PAGES}
          </span>

          {/* Next */}
          <button
            onClick={goNext}
            disabled={currentPage >= TOTAL_MUSHAF_PAGES}
            style={{
              ...btnStyle(theme, 40),
              opacity: currentPage >= TOTAL_MUSHAF_PAGES ? 0.3 : 1,
            }}
          >
            <ChevronLeft size={20} />
          </button>
        </div>
      </div>
    </>
  );
}
