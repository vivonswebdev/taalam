import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Bookmark, BookmarkCheck, Settings2,
  ChevronDown, Moon, Gauge, BookOpen,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import AudioPlayer from "@/components/AudioPlayer";
import { useBookmarks } from "@/hooks/useBookmarks";
import TafsirSheet from "@/components/TafsirSheet";
import TafsirSurahView from "@/components/TafsirSurahView";
import type { Surah } from "@/data/surahs";

interface MushafReaderProps {
  surah: Surah;
  translations: Record<number, string>;
  isArabicOnly: boolean;
  onBack: () => void;
  t: (key: string) => string;
  startAtAyah?: number;
}

export default function MushafReader({
  surah,
  translations,
  isArabicOnly,
  onBack,
  t,
  startAtAyah = 0,
}: MushafReaderProps) {
  const { addBookmark, removeBookmark, isBookmarked, saveReadingPosition, readingPosition } = useBookmarks();

  const [autoScroll, setAutoScroll] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [darkOverride, setDarkOverride] = useState(false);
  const [longPressAyah, setLongPressAyah] = useState<number | null>(null);
  const [currentAyah, setCurrentAyah] = useState(0);
  const [playing, setPlaying] = useState(false);

  // Tafsir state
  const [tafsirAyahIndex, setTafsirAyahIndex] = useState<number | null>(null);
  const [showSurahTafsir, setShowSurahTafsir] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollAnimRef = useRef<number | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ayahRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const jumpToAyahRef = useRef<((index: number) => void) | null>(null);

  // Resume reading position on mount
  useEffect(() => {
    if (startAtAyah > 0) {
      setTimeout(() => {
        ayahRefs.current.get(startAtAyah)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    } else if (readingPosition && readingPosition.surahNumber === surah.number) {
      setTimeout(() => {
        ayahRefs.current.get(readingPosition.ayahIndex)?.scrollIntoView({ behavior: "auto", block: "start" });
      }, 300);
    }
  }, []);

  // Save position on unmount
  useEffect(() => {
    return () => {
      if (containerRef.current) {
        let closestIdx = 0;
        let closestDist = Infinity;
        ayahRefs.current.forEach((el, idx) => {
          const dist = Math.abs(el.getBoundingClientRect().top);
          if (dist < closestDist) { closestDist = dist; closestIdx = idx; }
        });
        saveReadingPosition({ surahNumber: surah.number, ayahIndex: closestIdx, scrollY: 0 });
      }
    };
  }, [surah.number, saveReadingPosition]);

  // Auto-scroll
  useEffect(() => {
    if (!autoScroll || !containerRef.current) {
      if (scrollAnimRef.current) cancelAnimationFrame(scrollAnimRef.current);
      return;
    }
    const el = containerRef.current;
    const step = () => {
      el.scrollTop += 0.5 * scrollSpeed;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight) { setAutoScroll(false); return; }
      scrollAnimRef.current = requestAnimationFrame(step);
    };
    scrollAnimRef.current = requestAnimationFrame(step);
    return () => { if (scrollAnimRef.current) cancelAnimationFrame(scrollAnimRef.current); };
  }, [autoScroll, scrollSpeed]);

  // Scroll to current ayah during audio
  useEffect(() => {
    if (!playing) return;
    ayahRefs.current.get(currentAyah)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [currentAyah, playing]);

  // Dark mode override
  useEffect(() => {
    if (darkOverride) document.documentElement.classList.add("dark");
    return () => { if (darkOverride) document.documentElement.classList.remove("dark"); };
  }, [darkOverride]);

  const handleLongPressStart = useCallback((index: number) => {
    longPressTimer.current = setTimeout(() => setLongPressAyah(index), 500);
  }, []);

  const handleLongPressEnd = useCallback(() => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  }, []);

  const toggleBookmark = useCallback(
    (ayahIndex: number) => {
      const ayah = surah.ayahs[ayahIndex];
      if (isBookmarked(surah.number, ayah.number)) {
        removeBookmark(surah.number, ayah.number);
      } else {
        addBookmark({
          surahNumber: surah.number, surahName: surah.name,
          surahNameArabic: surah.nameArabic, ayahNumber: ayah.number,
          arabicText: ayah.arabic.slice(0, 80),
        });
      }
      setLongPressAyah(null);
    },
    [surah, isBookmarked, removeBookmark, addBookmark]
  );

  const setAyahRef = useCallback((index: number, el: HTMLDivElement | null) => {
    if (el) ayahRefs.current.set(index, el); else ayahRefs.current.delete(index);
  }, []);

  const scrollToAyahIndex = useCallback((index: number) => {
    const el = ayahRefs.current.get(index);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // Handle tap on ayah — short tap opens tafsir, distinguish from long press
  const handleAyahTap = useCallback((index: number) => {
    // If long press popup is showing, ignore
    if (longPressAyah !== null) return;
    setTafsirAyahIndex(index);
  }, [longPressAyah]);

  // Show surah tafsir view
  if (showSurahTafsir) {
    return (
      <TafsirSurahView
        surah={surah}
        onBack={() => setShowSurahTafsir(false)}
        onScrollToAyah={scrollToAyahIndex}
        t={t}
      />
    );
  }

  return (
    <div className={`flex flex-col h-[calc(100vh-4rem)] ${darkOverride ? "bg-black" : ""}`}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card shrink-0">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 text-center min-w-0">
          <p className="font-arabic text-lg text-primary truncate">{surah.nameArabic}</p>
          <p className="text-[10px] text-muted-foreground">{surah.name} · {surah.versesCount} {t("detail.verses")}</p>
        </div>
        <button
          onClick={() => setShowSurahTafsir(true)}
          className="w-9 h-9 rounded-full bg-muted flex items-center justify-center"
          title={t("tafsir.surahTafsir")}
        >
          <BookOpen size={16} className="text-primary" />
        </button>
        <button onClick={() => setShowSettings(!showSettings)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
          <Settings2 size={18} />
        </button>
      </div>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-border bg-card"
          >
            <div className="px-4 py-3 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ChevronDown size={14} className="text-muted-foreground" />
                  <span className="text-sm font-medium">{t("mushaf.autoScroll")}</span>
                </div>
                <Switch checked={autoScroll} onCheckedChange={setAutoScroll} />
              </div>
              {autoScroll && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Gauge size={12} /> {t("mushaf.scrollSpeed")}
                    </span>
                    <span className="text-xs font-bold text-primary">{scrollSpeed}×</span>
                  </div>
                  <Slider min={0.5} max={3} step={0.5} value={[scrollSpeed]} onValueChange={([v]) => setScrollSpeed(v)} />
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Moon size={14} className="text-muted-foreground" />
                  <span className="text-sm font-medium">{t("mushaf.darkMode")}</span>
                </div>
                <Switch checked={darkOverride} onCheckedChange={setDarkOverride} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audio Player */}
      <div className="px-4 py-2 shrink-0">
        <AudioPlayer
          surahNumber={surah.number}
          surahName={surah.name}
          surahNameArabic={surah.nameArabic}
          totalAyahs={surah.ayahs.length}
          onAyahChange={setCurrentAyah}
          onPlayStateChange={setPlaying}
          jumpToAyahRef={jumpToAyahRef}
          compact
        />
      </div>

      {/* Ayahs scrollable area */}
      <div ref={containerRef} className="flex-1 overflow-y-auto px-4 pb-8 space-y-2">
        {surah.ayahs.map((ayah, i) => {
          const isActive = i === currentAyah && playing;
          const bookmarked = isBookmarked(surah.number, ayah.number);

          return (
            <div
              key={ayah.number}
              ref={(el) => setAyahRef(i, el)}
              onTouchStart={() => handleLongPressStart(i)}
              onTouchEnd={handleLongPressEnd}
              onMouseDown={() => handleLongPressStart(i)}
              onMouseUp={handleLongPressEnd}
              onMouseLeave={handleLongPressEnd}
              onClick={() => handleAyahTap(i)}
              className={`relative rounded-xl p-3 transition-all cursor-pointer select-none ${
                isActive
                  ? "bg-primary/10 border border-primary/30"
                  : "bg-card border border-transparent hover:border-border"
              }`}
            >
              {bookmarked && (
                <BookmarkCheck size={14} className="absolute top-2 right-2 text-primary" />
              )}

              <AnimatePresence>
                {longPressAyah === i && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute -top-10 left-1/2 -translate-x-1/2 z-50"
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleBookmark(i); }}
                      className="flex items-center gap-1.5 bg-card border border-border shadow-lg rounded-full px-3 py-1.5 text-xs font-semibold"
                    >
                      {bookmarked ? <BookmarkCheck size={14} className="text-primary" /> : <Bookmark size={14} />}
                      {bookmarked ? t("mushaf.removeBookmark") : t("mushaf.addBookmark")}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold mr-2 align-middle">
                {ayah.number}
              </span>
              <span className="arabic-text text-xl leading-[2.2] text-foreground">{ayah.arabic}</span>

              {!isArabicOnly && (
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {translations[i] || ayah.translation}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Dismiss long press overlay */}
      {longPressAyah !== null && (
        <div className="fixed inset-0 z-40" onClick={() => setLongPressAyah(null)} />
      )}

      {/* Tafsir bottom sheet */}
      {tafsirAyahIndex !== null && surah.ayahs[tafsirAyahIndex] && (
        <TafsirSheet
          open={tafsirAyahIndex !== null}
          onOpenChange={(open) => { if (!open) setTafsirAyahIndex(null); }}
          surahNumber={surah.number}
          ayahNumber={surah.ayahs[tafsirAyahIndex].number}
          arabicText={surah.ayahs[tafsirAyahIndex].arabic}
          translation={translations[tafsirAyahIndex] || surah.ayahs[tafsirAyahIndex].translation}
          t={t}
        />
      )}
    </div>
  );
}
