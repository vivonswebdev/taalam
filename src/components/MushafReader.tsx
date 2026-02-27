import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Bookmark, BookmarkCheck, Settings2,
  ChevronDown, Moon, Gauge, BookOpen, Palette,
  Play, Pause, SkipForward, SkipBack, ChevronsLeft, ChevronsRight, Repeat,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import TajwidBar from "@/components/TajwidBar";
import TajwidAyahText from "@/components/TajwidAyahText";
import { analyzeAyahTajwid } from "@/data/tajwidRules";
import { useBookmarks } from "@/hooks/useBookmarks";
import TafsirSheet from "@/components/TafsirSheet";
import TafsirSurahView from "@/components/TafsirSurahView";
import ActiveChildBanner from "@/components/ActiveChildBanner";
import { useGlobalAudio } from "@/hooks/useGlobalAudio";
import type { Surah } from "@/data/surahs";

interface MushafReaderProps {
  surah: Surah;
  translations: Record<number, string>;
  isArabicOnly: boolean;
  onBack: () => void;
  t: (key: string) => string;
  startAtAyah?: number;
  onRequestNextSurah?: () => void;
  onRequestPrevSurah?: () => void;
}

export default function MushafReader({
  surah,
  translations,
  isArabicOnly,
  onBack,
  t,
  startAtAyah = 0,
  onRequestNextSurah,
  onRequestPrevSurah,
}: MushafReaderProps) {
  const { addBookmark, removeBookmark, isBookmarked, saveReadingPosition, readingPosition } = useBookmarks();
  const globalAudio = useGlobalAudio();

  const [autoScroll, setAutoScroll] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [darkOverride, setDarkOverride] = useState(false);
  const [longPressAyah, setLongPressAyah] = useState<number | null>(null);
  const [tajwidEnabled, setTajwidEnabled] = useState(true);
  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  const [readingStyle, setReadingStyle] = useState<"cards" | "immersive">(() => {
    try { return (localStorage.getItem("reading-style") as "cards" | "immersive") || "cards"; } catch { return "cards"; }
  });

  // Derive playing state from global audio
  const isGlobalPlaying = globalAudio.state.surahNumber === surah.number && globalAudio.state.isPlaying;
  const currentAyah = globalAudio.state.surahNumber === surah.number ? globalAudio.state.currentAyah : 0;
  const playing = isGlobalPlaying;

  // Tafsir state
  const [tafsirAyahIndex, setTafsirAyahIndex] = useState<number | null>(null);
  const [showSurahTafsir, setShowSurahTafsir] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollAnimRef = useRef<number | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ayahRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Auto-start playback on mount
  const autoStartedRef = useRef(false);
  useEffect(() => {
    if (autoStartedRef.current) return;
    autoStartedRef.current = true;
    globalAudio.play(surah.number, surah.name, surah.nameArabic, surah.ayahs.length, startAtAyah || 0);
  }, []);

  // Listen for surah changes from global audio (e.g. auto-advance to next surah)
  useEffect(() => {
    globalAudio.onAyahChange.current = (surahNum: number, ayahIdx: number) => {
      if (surahNum !== surah.number) {
        // Global audio switched to a different surah — request navigation
        if (surahNum > surah.number && onRequestNextSurah) {
          onRequestNextSurah();
        } else if (surahNum < surah.number && onRequestPrevSurah) {
          onRequestPrevSurah();
        }
      }
    };
    return () => {
      globalAudio.onAyahChange.current = null;
    };
  }, [surah.number, onRequestNextSurah, onRequestPrevSurah]);

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
      {/* Active child banner */}
      <div className="px-4 pt-2 shrink-0">
        <ActiveChildBanner mode="reading" surahName={surah.name} />
      </div>
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
              {/* Reading style toggle */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Palette size={14} className="text-muted-foreground" />
                  <span className="text-sm font-medium">Style de lecture</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setReadingStyle("cards"); localStorage.setItem("reading-style", "cards"); }}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-colors ${
                      readingStyle === "cards" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    🃏 Cartes
                  </button>
                  <button
                    onClick={() => { setReadingStyle("immersive"); localStorage.setItem("reading-style", "immersive"); }}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-colors ${
                      readingStyle === "immersive" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    🌌 Émotions
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette size={14} className="text-muted-foreground" />
                  <span className="text-sm font-medium">Tajwid</span>
                </div>
                <Switch checked={tajwidEnabled} onCheckedChange={setTajwidEnabled} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inline Player Controls (uses global audio) */}
      <div className="px-4 py-2 shrink-0">
        <div className="bg-card border border-border rounded-2xl p-3 space-y-2">
          <div className="flex items-center gap-2">
            <button onClick={onRequestPrevSurah} className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0">
              <ChevronsLeft size={14} />
            </button>
            <button onClick={() => globalAudio.prevAyah()} className="w-8 h-8 rounded-full bg-muted text-foreground flex items-center justify-center shrink-0">
              <SkipBack size={14} />
            </button>
            <button
              onClick={() => {
                if (playing) {
                  globalAudio.pause();
                } else if (globalAudio.state.surahNumber === surah.number) {
                  globalAudio.resume();
                } else {
                  globalAudio.play(surah.number, surah.name, surah.nameArabic, surah.ayahs.length, 0);
                }
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${playing ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              {playing ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </button>
            <button onClick={() => globalAudio.nextAyah()} className="w-8 h-8 rounded-full bg-muted text-foreground flex items-center justify-center shrink-0">
              <SkipForward size={14} />
            </button>
            <button onClick={onRequestNextSurah} className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0">
              <ChevronsRight size={14} />
            </button>
            <div className="flex-1" />
            <button
              onClick={() => {
                const ayah = surah.ayahs[currentAyah];
                if (!ayah) return;
                if (isBookmarked(surah.number, ayah.number)) {
                  removeBookmark(surah.number, ayah.number);
                } else {
                  addBookmark({ surahNumber: surah.number, surahName: surah.name, surahNameArabic: surah.nameArabic, ayahNumber: ayah.number, arabicText: ayah.arabic.slice(0, 80) });
                }
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                surah.ayahs[currentAyah] && isBookmarked(surah.number, surah.ayahs[currentAyah].number) ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
              }`}
            >
              {surah.ayahs[currentAyah] && isBookmarked(surah.number, surah.ayahs[currentAyah].number) ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
            </button>
            <button
              onClick={() => globalAudio.setContinuousMode(!globalAudio.state.continuousMode)}
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                globalAudio.state.continuousMode ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
              }`}
            >
              <Repeat size={14} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground shrink-0">{currentAyah + 1}/{surah.ayahs.length}</span>
            <div className="flex-1 h-1.5 bg-muted rounded-full">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${globalAudio.state.progress}%` }} />
            </div>
            <span className="text-[10px] text-muted-foreground shrink-0">{surah.nameArabic}</span>
          </div>
        </div>
      </div>

      {/* Tajwid Bar */}
      {tajwidEnabled && (
        <div className="px-4 py-1.5 shrink-0">
          <TajwidBar
            activeRules={(() => {
              const ayah = surah.ayahs[currentAyah];
              if (!ayah) return [];
              const words = analyzeAyahTajwid(ayah.arabic);
              const idx = activeWordIndex >= 0 ? activeWordIndex : 0;
              return words[idx]?.rules || [];
            })()}
            nextRule={(() => {
              const ayah = surah.ayahs[currentAyah];
              if (!ayah) return null;
              const words = analyzeAyahTajwid(ayah.arabic);
              const start = (activeWordIndex >= 0 ? activeWordIndex : 0) + 1;
              for (let j = start; j < words.length; j++) {
                if (words[j].rules.length > 0) {
                  return { rule: words[j].rules[0], wordsAhead: j - (activeWordIndex >= 0 ? activeWordIndex : 0) };
                }
              }
              return null;
            })()}
          />
        </div>
      )}

      {/* Ayahs scrollable area */}
      {readingStyle === "immersive" ? (
        /* ═══ IMMERSIVE MODE ═══ */
        <div ref={containerRef} className="flex-1 overflow-y-auto relative">
          {/* Gradient background */}
          <div className="fixed inset-0 pointer-events-none -z-10 bg-gradient-to-br from-primary/20 via-background to-accent/30" />
          
          <div className="min-h-full flex flex-col items-center justify-center px-4 py-8 space-y-6">
            {surah.ayahs.map((ayah, i) => {
              const isActive = i === currentAyah;
              const bookmarked = isBookmarked(surah.number, ayah.number);

              return (
                <motion.div
                  key={ayah.number}
                  ref={(el) => setAyahRef(i, el)}
                  onClick={() => handleAyahTap(i)}
                  onTouchStart={() => handleLongPressStart(i)}
                  onTouchEnd={handleLongPressEnd}
                  onMouseDown={() => handleLongPressStart(i)}
                  onMouseUp={handleLongPressEnd}
                  onMouseLeave={handleLongPressEnd}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: isActive ? 1 : 0.4,
                    y: 0,
                    scale: isActive ? 1 : 0.95,
                  }}
                  transition={{ duration: 0.4 }}
                  className={`w-full max-w-lg mx-auto rounded-3xl p-6 cursor-pointer select-none transition-all ${
                    isActive
                      ? "bg-card/90 backdrop-blur-xl border-2 border-primary/40 shadow-2xl shadow-primary/20"
                      : "bg-card/40 backdrop-blur-sm border border-border/20"
                  }`}
                >
                  {bookmarked && (
                    <BookmarkCheck size={14} className="absolute top-3 right-3 text-primary" />
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

                  {/* Ayah number badge */}
                  <div className="flex items-center justify-center mb-4">
                    <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold ${
                      isActive ? "bg-primary/20 text-primary" : "bg-muted/50 text-muted-foreground"
                    }`}>
                      {ayah.number}
                    </span>
                  </div>

                  {/* Arabic text — extra large for immersive */}
                  <div className="text-center" dir="rtl">
                    <TajwidAyahText
                      arabicText={ayah.arabic}
                      activeWordIndex={isActive ? activeWordIndex : -1}
                      onWordTap={(wi) => {
                        globalAudio.jumpToAyah(i);
                        setActiveWordIndex(wi);
                      }}
                      tajwidEnabled={tajwidEnabled}
                      className={`arabic-text leading-[2.6] ${isActive ? "text-3xl text-foreground" : "text-2xl text-foreground/60"}`}
                    />
                  </div>

                  {/* Translation */}
                  {!isArabicOnly && (translations[i] || ayah.translation) && (
                    <p className={`text-center mt-4 leading-relaxed border-t pt-4 ${
                      isActive 
                        ? "text-sm text-muted-foreground border-border/40" 
                        : "text-xs text-muted-foreground/50 border-border/20"
                    }`}>
                      {translations[i] || ayah.translation}
                    </p>
                  )}

                  {/* Transliteration */}
                  {ayah.transliteration && (
                    <p className={`italic mt-2 leading-relaxed text-center ${
                      isActive ? "text-xs text-primary/60" : "text-[10px] text-primary/30"
                    }`}>
                      {ayah.transliteration}
                    </p>
                  )}

                  {/* Footer */}
                  <p className={`text-center mt-3 ${isActive ? "text-[11px] text-muted-foreground/60" : "text-[9px] text-muted-foreground/30"}`}>
                    {surah.nameArabic} · Ayah {ayah.number}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ═══ CARDS MODE (existing) ═══ */
        <div ref={containerRef} className="flex-1 overflow-y-auto px-4 pb-8 space-y-3">
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
              className={`relative rounded-2xl p-5 transition-all cursor-pointer select-none backdrop-blur-sm ${
                isActive
                  ? "bg-primary/15 border-2 border-primary/40 shadow-lg shadow-primary/10"
                  : "bg-card/80 border border-border/50 hover:border-primary/20 hover:bg-card/90"
              }`}
            >
              {bookmarked && (
                <BookmarkCheck size={14} className="absolute top-3 right-3 text-primary" />
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

              {/* Ayah number badge */}
              <div className="flex items-center justify-center mb-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/15 text-primary text-xs font-bold">
                  {ayah.number}
                </span>
              </div>

              {/* Arabic text — large, centered */}
              <div className="text-center" dir="rtl">
                <TajwidAyahText
                  arabicText={ayah.arabic}
                  activeWordIndex={isActive ? activeWordIndex : -1}
                  onWordTap={(wi) => {
                    globalAudio.jumpToAyah(i);
                    setActiveWordIndex(wi);
                  }}
                  tajwidEnabled={tajwidEnabled}
                  className="arabic-text text-2xl leading-[2.4] text-foreground"
                />
              </div>

              {/* Translation */}
              {!isArabicOnly && (translations[i] || ayah.translation) && (
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed text-center border-t border-border/30 pt-3">
                  {translations[i] || ayah.translation}
                </p>
              )}

              {/* Transliteration */}
              {ayah.transliteration && (
                <p className="text-xs text-primary/60 italic mt-2 leading-relaxed text-center">
                  {ayah.transliteration}
                </p>
              )}

              {/* Surah info footer */}
              <p className="text-[10px] text-muted-foreground/50 text-center mt-2">
                {surah.nameArabic} · Ayah {ayah.number}
              </p>
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
