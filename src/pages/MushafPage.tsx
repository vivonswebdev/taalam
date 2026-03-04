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

const DEFAULT_FONT_SIZE = 24;
const MIN_FONT_SIZE = 18;
const MAX_FONT_SIZE = 56;

// ─── Ayah Medallion ───
function AyahMedallion({ number, color, textColor }: { number: number; color: string; textColor: string }) {
  return (
    <span
      className="mushaf-medallion"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "26px",
        height: "26px",
        borderRadius: "50%",
        backgroundColor: color,
        color: textColor,
        fontSize: "10px",
        fontWeight: 700,
        fontFamily: "sans-serif",
        verticalAlign: "middle",
        margin: "0 2px",
        boxShadow: `0 0 0 2px ${color}33, 0 1px 3px rgba(0,0,0,0.15)`,
        lineHeight: 1,
        flexShrink: 0,
      }}
    >
      {number}
    </span>
  );
}

// ─── Hizb Marker ───
function HizbBadge({ label, frameColor, onClick }: { label: string; frameColor: string; onClick?: () => void }) {
  return (
    <span
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: "32px",
        height: "24px",
        borderRadius: "6px",
        backgroundColor: frameColor,
        color: "#fff",
        fontSize: "9px",
        fontWeight: 700,
        fontFamily: "'Amiri', serif",
        verticalAlign: "middle",
        margin: "0 3px",
        padding: "0 5px",
        boxShadow: `0 1px 4px ${frameColor}60`,
        cursor: onClick ? "pointer" : "default",
        lineHeight: 1,
        flexShrink: 0,
      }}
    >
      {label}
    </span>
  );
}

// ─── Sajda Marker ───
function SajdaBadge({ frameColor, onClick }: { frameColor: string; onClick?: () => void }) {
  return (
    <span
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "24px",
        height: "24px",
        borderRadius: "4px",
        backgroundColor: "#d4382c",
        color: "#fff",
        fontSize: "11px",
        fontWeight: 700,
        verticalAlign: "middle",
        margin: "0 2px",
        cursor: onClick ? "pointer" : "default",
        lineHeight: 1,
        flexShrink: 0,
      }}
      title="سجدة التلاوة"
    >
      ۩
    </span>
  );
}

// ─── Tajwid-colored text rendering ───
function TajwidInlineText({
  text,
  tajwidEnabled,
  textColor,
}: {
  text: string;
  tajwidEnabled: boolean;
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
          <span style={{ color: word.primaryColor ? `hsl(${word.primaryColor})` : textColor }}>
            {word.text}
          </span>
          {i < words.length - 1 && " "}
        </span>
      ))}
    </>
  );
}

// ─── Decorated mushaf content block ───
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
  onBookmarkHizb,
  onBookmarkSajda,
}: DecoratedContentProps) {
  const outerPad = fullscreen ? "2px" : "4px";
  const innerPad = fullscreen ? "10px 8px 12px" : "12px 10px 14px";

  return (
    <div
      style={{
        border: `3px solid ${theme.frame}`,
        borderRadius: "6px",
        padding: outerPad,
        background: `linear-gradient(135deg, ${theme.frame}15, transparent, ${theme.frame}15)`,
      }}
    >
      <div
        style={{
          border: `1.5px solid ${theme.frame}80`,
          borderRadius: "4px",
          padding: innerPad,
          backgroundColor: theme.bg,
          minHeight: fullscreen ? "auto" : "50vh",
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
                width: "18px",
                height: "18px",
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

        {/* Bismillah - compact */}
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
            <p className="font-['Amiri','serif']" style={{ fontSize: `${fontSize * 0.72}px`, color: `${theme.text}bb`, margin: "2px 0 4px" }} dir="rtl">
              بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
            </p>
          </div>
        )}

        {/* Ayah text */}
        <div
          className="font-['Amiri','Scheherazade_New','serif'] leading-[2.2]"
          dir="rtl"
          style={{
            fontSize: `${fontSize}px`,
            textAlign: "justify",
            textAlignLast: "center",
            color: theme.text,
            wordSpacing: "3px",
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

        {/* Page footer */}
        <div className="flex items-center justify-center mt-2 pt-1" style={{ borderTop: `1px solid ${theme.frame}30` }}>
          <span className="text-[9px] font-sans" style={{ color: `${theme.text}60` }}>— {currentPage} —</span>
        </div>
      </div>
    </div>
  );
}

// ─── Hook: split ayahs into screen-sized chunks ───
function useScreenChunks(
  ayahs: { number: number; arabic: string; surahNumber: number }[],
  fontSize: number,
) {
  const ayahsPerScreen = useMemo(() => {
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
                  <p className="text-[10px] text-muted-foreground">{currentIndex + 1} / {ayahs.length}</p>
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

// ─── Fullscreen Decorated Mushaf ───
function FullscreenMushafView({
  ayahs,
  theme,
  fontSize,
  tajwidEnabled,
  currentPage,
  currentJuz,
  currentHizb,
  surahMeta,
  onBack,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  t,
  onBookmarkHizb,
  onBookmarkSajda,
}: {
  ayahs: { number: number; arabic: string; surahNumber: number }[];
  theme: typeof THEMES.cream;
  fontSize: number;
  tajwidEnabled: boolean;
  currentPage: number;
  currentJuz: number;
  currentHizb: number;
  surahMeta: SurahMeta | undefined;
  onBack: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  t: (k: any) => string;
  onBookmarkHizb?: (surah: number, ayah: number, hizb: number, label: string) => void;
  onBookmarkSajda?: (surah: number, ayah: number) => void;
}) {
  const [chromeVisible, setChromeVisible] = useState(true);
  const chunks = useScreenChunks(ayahs, fontSize);
  const [screenIdx, setScreenIdx] = useState(0);

  useEffect(() => { setScreenIdx(0); }, [currentPage]);

  const currentChunk = chunks[screenIdx] || [];
  const totalScreens = chunks.length;

  const goPrevScreen = useCallback(() => {
    if (screenIdx > 0) setScreenIdx(screenIdx - 1);
    else if (hasPrev) onPrev();
  }, [screenIdx, hasPrev, onPrev]);
  const goNextScreen = useCallback(() => {
    if (screenIdx < totalScreens - 1) setScreenIdx(screenIdx + 1);
    else if (hasNext) onNext();
  }, [screenIdx, totalScreens, hasNext, onNext]);

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goNextScreen();  // RTL: left = forward
      if (e.key === "ArrowRight") goPrevScreen();
      if (e.key === "Escape") onBack();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNextScreen, goPrevScreen, onBack]);

  return (
    <div className="fixed inset-0 z-40" style={{ backgroundColor: theme.bg }}>
      <div className="absolute inset-0 z-10" onClick={() => setChromeVisible((v) => !v)} />

      <div className="relative z-10 h-full w-full flex items-center justify-center p-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentPage}-${screenIdx}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full flex items-center"
          >
            <div className="w-full">
              <DecoratedMushafContent
                ayahs={currentChunk}
                theme={theme}
                fontSize={fontSize}
                tajwidEnabled={tajwidEnabled}
                currentPage={currentPage}
                currentJuz={currentJuz}
                currentHizb={currentHizb}
                surahMeta={surahMeta}
                t={t}
                fullscreen
                onBookmarkHizb={onBookmarkHizb}
                onBookmarkSajda={onBookmarkSajda}
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Tap zones */}
        <button onClick={(e) => { e.stopPropagation(); goNextScreen(); }} className="absolute inset-y-0 left-0 w-1/4 z-20" />
        <button onClick={(e) => { e.stopPropagation(); goPrevScreen(); }} className="absolute inset-y-0 right-0 w-1/4 z-20" />
      </div>

      <AnimatePresence>
        {chromeVisible && (
          <>
            <motion.div
              initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -40, opacity: 0 }}
              className="absolute top-0 left-0 right-0 z-50 pt-10 px-4 pb-2"
              style={{ background: `linear-gradient(to bottom, ${theme.bg}f0, transparent)` }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <button onClick={onBack} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: `${theme.text}15` }}>
                  <ChevronLeft size={18} style={{ color: theme.text }} />
                </button>
                <div className="flex-1 text-center">
                  <p className="font-['Amiri','serif'] text-sm" style={{ color: theme.text }}>{surahMeta?.nameArabic || ""}</p>
                  <p className="text-[10px]" style={{ color: `${theme.text}80` }}>
                    {t("mushaf.page" as any)} {currentPage} — {t("mushaf.juz" as any)} {currentJuz} · حزب {toArabicNum(currentHizb)}
                    {totalScreens > 1 && ` — ${screenIdx + 1}/${totalScreens}`}
                  </p>
                </div>
                <div className="w-9" />
              </div>
            </motion.div>
            <motion.div
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 z-50 pb-8 px-6 pt-3"
              style={{ background: `linear-gradient(to top, ${theme.bg}f0, transparent)` }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <button onClick={goNextScreen} disabled={screenIdx >= totalScreens - 1 && !hasNext} className="p-2 disabled:opacity-20" style={{ color: theme.text }}>→</button>
                <span className="text-[10px]" style={{ color: `${theme.text}60` }}>{t("mushaf.tipTap" as any)}</span>
                <button onClick={goPrevScreen} disabled={screenIdx === 0 && !hasPrev} className="p-2 disabled:opacity-20" style={{ color: theme.text }}>←</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main MushafPage ───
export default function MushafPage() {
  const { t } = useLanguage();
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

  // Settings
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

  // Reset screen index on page change
  useEffect(() => { setScreenIdx(0); }, [currentPage]);

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
  }, [currentPage]);

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

  // Bookmark hizb position
  const bookmarkHizb = useCallback(async (surah: number, ayah: number, hizb: number, label: string) => {
    if (!user) { toast(t("mushaf.loginRequired" as any)); return; }
    await supabase.from("mushaf_bookmarks").insert({
      user_id: user.id,
      page_number: currentPage,
      surah_number: surah,
      ayah_key: `${surah}:${ayah}`,
      note: `${label}`,
    });
    toast.success(`${label} — Position sauvegardée ⭐`);
    await loadBookmarks();
  }, [user, currentPage, loadBookmarks, t]);

  // Bookmark sajda position
  const bookmarkSajda = useCallback(async (surah: number, ayah: number) => {
    if (!user) { toast(t("mushaf.loginRequired" as any)); return; }
    await supabase.from("mushaf_bookmarks").insert({
      user_id: user.id,
      page_number: currentPage,
      surah_number: surah,
      ayah_key: `${surah}:${ayah}`,
      note: `سجدة التلاوة — ${surah}:${ayah}`,
    });
    toast.success("سجدة التلاوة — Position sauvegardée ⭐");
    await loadBookmarks();
  }, [user, currentPage, loadBookmarks, t]);

  // FIXED: Simple page navigation, no RTL flipping
  const goTo = useCallback((page: number) => {
    const p = Math.max(1, Math.min(TOTAL_MUSHAF_PAGES, page));
    if (p !== currentPage) {
      setCurrentPage(p);
      if (pageSoundEnabled) playPageTurnSound();
    }
  }, [currentPage, pageSoundEnabled]);

  // Navigate by SURAH: ← = previous surah start, → = next surah start
  const currentSurahForNav = getSurahForPage(currentPage);
  const goToPrevPage = useCallback(() => {
    if (currentSurahForNav <= 1) return;
    goTo(surahStartPage[currentSurahForNav - 1]);
  }, [goTo, currentSurahForNav]);
  const goToNextPage = useCallback(() => {
    if (currentSurahForNav >= 114) return;
    goTo(surahStartPage[currentSurahForNav + 1]);
  }, [goTo, currentSurahForNav]);

  const changeStyle = (style: ReadingStyle) => {
    setReadingStyle(style);
    localStorage.setItem(READING_STYLE_KEY, style);
  };

  const currentSurahNum = getSurahForPage(currentPage);
  const currentJuz = getJuzForPage(currentPage);
  const currentHizb = getHizbForPage(currentPage);
  const currentSurahMeta = surahList.find((s) => s.number === currentSurahNum);

  // ─── Fullscreen decorated mushaf ───
  if (readingStyle === "mushaf") {
    return (
      <FullscreenMushafView
        ayahs={ayahs}
        theme={theme}
        fontSize={fontSize}
        tajwidEnabled={tajwidEnabled}
        currentPage={currentPage}
        currentJuz={currentJuz}
        currentHizb={currentHizb}
        surahMeta={currentSurahMeta}
        onBack={() => changeStyle("cards")}
        onPrev={goToPrevPage}
        onNext={goToNextPage}
        hasPrev={currentSurahForNav > 1}
        hasNext={currentSurahForNav < 114}
        t={t}
        onBookmarkHizb={bookmarkHizb}
        onBookmarkSajda={bookmarkSajda}
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

  // ─── Cards mode (decorated, screen-chunked) ───
  const currentChunk = chunks[screenIdx] || ayahs;
  const totalScreens = chunks.length;

  // Screen nav: only changes screenIdx, never changes page
  const goPrevScreen = () => {
    if (screenIdx > 0) setScreenIdx(screenIdx - 1);
  };
  const goNextScreen = () => {
    if (screenIdx < totalScreens - 1) setScreenIdx(screenIdx + 1);
  };

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: theme.bg }}>
      <SEOHead title="Mushaf - Lecture du Coran" description="Lisez le Coran dans un Mushaf numérique avec tajwid coloré, thèmes personnalisables et marque-pages." path="/mushaf" />
      {/* Header */}
      <div
        className="sticky top-0 z-20 backdrop-blur border-b px-3 pt-10 pb-2"
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
          <div className="flex items-center gap-0.5">
            <button onClick={toggleBookmark} className="p-1.5">
              <Star size={18} className={bookmarkedPages.has(currentPage) ? "fill-yellow-400" : ""} style={{ color: bookmarkedPages.has(currentPage) ? "#facc15" : `${theme.text}80` }} />
            </button>

            {/* Go To Sheet */}
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
                      <input
                        type="number" min={1} max={TOTAL_MUSHAF_PAGES} defaultValue={currentPage}
                        className="w-full rounded-xl border border-border bg-card px-4 py-3 text-center text-lg"
                        onKeyDown={(e) => { if (e.key === "Enter") goTo(Number((e.target as HTMLInputElement).value)); }}
                      />
                      <p className="text-[11px] text-muted-foreground text-center">{t("mushaf.enterPage" as any)}</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </SheetContent>
            </Sheet>

            {/* Bookmarks */}
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

            {/* Settings */}
            <Sheet>
              <SheetTrigger asChild>
                <button className="p-1.5"><Settings2 size={18} style={{ color: `${theme.text}80` }} /></button>
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[75vh]">
                <SheetHeader><SheetTitle>{t("mushaf.readSettings" as any)}</SheetTitle></SheetHeader>
                <ScrollArea className="h-[60vh]">
                  <div className="p-4 space-y-5">
                    {/* Reading style */}
                    <div>
                      <p className="text-sm font-medium mb-2">{t("mushaf.readingStyle" as any)}</p>
                      <div className="flex gap-2">
                        {([
                          { key: "cards" as const, emoji: "📖", label: t("mushaf.styleCards" as any) },
                          { key: "immersive" as const, emoji: "🌌", label: t("mushaf.styleImmersive" as any) },
                          { key: "mushaf" as const, emoji: "🕌", label: t("mushaf.styleFullscreen" as any) || "Plein écran" },
                        ]).map((s) => (
                          <button
                            key={s.key}
                            onClick={() => changeStyle(s.key)}
                            className={`flex-1 py-2 px-2 rounded-xl text-xs font-medium border transition-colors ${
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

                    {/* Theme */}
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
                            className={`flex-1 py-2 px-1 rounded-xl text-xs font-medium border transition-colors ${
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
                      <div className="flex items-center gap-3">
                        <span className="font-['Amiri','serif'] text-muted-foreground" style={{ fontSize: '14px' }}>ب</span>
                        <Slider
                          min={MIN_FONT_SIZE}
                          max={MAX_FONT_SIZE}
                          step={2}
                          value={[fontSize]}
                          onValueChange={([v]) => { setFontSize(v); localStorage.setItem(MUSHAF_FONT_KEY, String(v)); }}
                          className="flex-1"
                        />
                        <span className="font-['Amiri','serif'] text-muted-foreground" style={{ fontSize: '28px' }}>ب</span>
                        <span className="text-[10px] text-muted-foreground w-8 text-right">{fontSize}px</span>
                      </div>
                    </div>

                    {/* Tajwid */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {tajwidEnabled ? <Eye size={14} className="text-muted-foreground" /> : <EyeOff size={14} className="text-muted-foreground" />}
                        <span className="text-sm font-medium">Tajwid coloré</span>
                      </div>
                      <Switch checked={tajwidEnabled} onCheckedChange={setTajwidEnabled} />
                    </div>

                    {/* Sound */}
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

      {/* ═══ DECORATED MUSHAF CONTENT ═══ */}
      <div className="px-2 py-2">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentPage}-${screenIdx}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
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
                onBookmarkHizb={bookmarkHizb}
                onBookmarkSajda={bookmarkSajda}
              />
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Navigation bar - FIXED: ← always = page-1, → always = page+1, ▲▼ only screen */}
      <div className="fixed bottom-16 left-0 right-0 flex justify-center z-10 px-4">
        <div
          className="backdrop-blur rounded-full px-3 py-1.5 flex items-center gap-3 shadow-lg w-full max-w-sm"
          style={{ backgroundColor: `${theme.bg}ee`, border: `1px solid ${theme.frame}40` }}
        >
          <button
            onClick={goToPrevPage}
            disabled={currentSurahForNav <= 1}
            className="p-1.5 disabled:opacity-30"
          >
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

          <button
            onClick={goToNextPage}
            disabled={currentSurahForNav >= 114}
            className="p-1.5 disabled:opacity-30"
          >
            <ArrowRight size={20} style={{ color: theme.text }} />
          </button>
        </div>
      </div>
    </div>
  );
}
