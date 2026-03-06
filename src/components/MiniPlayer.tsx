import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, ChevronsLeft, ChevronsRight, X, Headphones,
  Repeat, Repeat1, Moon, ListMusic, Timer,
} from "lucide-react";
import { useGlobalAudio, type RepeatMode } from "@/hooks/useGlobalAudio";
import { useSleepTimer, type SleepDuration } from "@/hooks/useSleepTimer";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { Progress } from "@/components/ui/progress";
import PlaylistManager from "@/components/PlaylistManager";
import {
  Popover, PopoverContent, PopoverTrigger
} from "@/components/ui/popover";

function formatTime(sec: number) {
  if (!sec || !isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

const REPEAT_CYCLE: RepeatMode[] = ["none", "ayah", "surah"];

export default function MiniPlayer() {
  const {
    state, pause, resume, stop, nextSurah, prevSurah,
    setListenTestMode, onSurahComplete, setRepeatMode,
  } = useGlobalAudio();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const isOnReadingPage = location.pathname === "/reading";

  const sleepTimer = useSleepTimer(stop);

  // Auto-hide on reading page
  const [hidden, setHidden] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    setHidden(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setHidden(true), 5000);
  }, []);

  useEffect(() => {
    if (!isOnReadingPage || state.surahNumber === 0) return;
    resetTimer();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isOnReadingPage, state.surahNumber, state.isPlaying, resetTimer]);

  // Listen-test redirect
  useEffect(() => {
    onSurahComplete.current = (surahNumber: number, _surahName: string) => {
      if (state.listenTestMode) {
        navigate(`/listen-test?surah=${surahNumber}`);
      }
    };
    return () => { onSurahComplete.current = null; };
  }, [state.listenTestMode, navigate, onSurahComplete]);

  const cycleRepeat = useCallback(() => {
    const idx = REPEAT_CYCLE.indexOf(state.repeatMode);
    const next = REPEAT_CYCLE[(idx + 1) % REPEAT_CYCLE.length];
    setRepeatMode(next);
  }, [state.repeatMode, setRepeatMode]);

  const repeatIcon = state.repeatMode === "ayah" ? (
    <Repeat1 size={14} />
  ) : (
    <Repeat size={14} />
  );

  if (state.surahNumber === 0) return null;

  // === READING PAGE: compact bar ===
  if (isOnReadingPage) {
    return (
      <AnimatePresence>
        {!hidden && (
          <motion.div
            key="reading-mini"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.25 }}
            onPointerDown={resetTimer}
            className="fixed z-[1001] transition-opacity duration-200"
            style={{
              bottom: "calc(4.5rem + env(safe-area-inset-bottom, 0px))",
              left: "50%",
              transform: "translateX(-50%) scale(0.5)",
              transformOrigin: "center bottom",
              maxWidth: "80%",
            }}
          >
            <div className="flex flex-col items-center bg-background/80 backdrop-blur-md border border-border/40 rounded-full shadow-sm px-2 py-1">
              {state.listenTestMode && state.isPlaying && (
                <p className="text-[10px] text-primary font-medium truncate max-w-[160px] leading-tight">
                  <Headphones size={8} className="inline mr-0.5" />Quiz 🎧
                </p>
              )}
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => { setListenTestMode(!state.listenTestMode); resetTimer(); }}
                  className={`w-10 h-10 min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center transition-colors ${
                    state.listenTestMode ? "bg-primary text-primary-foreground" : "bg-muted/40 text-muted-foreground"
                  }`}
                >
                  <Headphones size={13} />
                </button>
                <button
                  onClick={() => { prevSurah(); resetTimer(); }}
                  className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center bg-muted/40 text-muted-foreground"
                >
                  <ChevronsLeft size={14} />
                </button>
                <button
                  onClick={() => { state.isPlaying ? pause() : resume(); resetTimer(); }}
                  className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm"
                >
                  {state.isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                </button>
                <button
                  onClick={() => { nextSurah(); resetTimer(); }}
                  className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center bg-muted/40 text-muted-foreground"
                >
                  <ChevronsRight size={14} />
                </button>
                <button
                  onClick={() => { stop(); resetTimer(); }}
                  className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center bg-muted/30 text-muted-foreground"
                >
                  <X size={11} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // === DEFAULT: enhanced floating player ===
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        className="fixed left-2 right-2 z-[1001]"
        style={{
          bottom: "5rem",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div className="mx-auto max-w-md bg-card/95 backdrop-blur-lg border border-border rounded-2xl shadow-lg overflow-hidden">
          {/* Progress bar */}
          <Progress value={state.progress} className="h-1 rounded-none" />

          {/* Line 1: Info */}
          <div className="flex items-center gap-2 px-3 pt-2 pb-1">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold truncate">{state.surahName}</span>
                <span className="text-xs text-muted-foreground font-arabic truncate">{state.surahNameArabic}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span>{t("player.ayah") || "Verset"} {state.currentAyah + 1}/{state.totalAyahs}</span>
                <span>·</span>
                <span>{formatTime(state.currentTime)} / {formatTime(state.duration)}</span>
                {sleepTimer.remaining > 0 && (
                  <>
                    <span>·</span>
                    <span className="text-primary flex items-center gap-0.5">
                      <Moon size={8} /> {sleepTimer.formatRemaining()}
                    </span>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={stop}
              className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted/40"
            >
              <X size={14} />
            </button>
          </div>

          {/* Line 2: Controls */}
          <div className="flex items-center justify-between px-3 pb-2.5 pt-0.5">
            {/* Left options */}
            <div className="flex items-center gap-1">
              {/* Repeat */}
              <button
                onClick={cycleRepeat}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  state.repeatMode !== "none"
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-muted/40"
                }`}
                title={state.repeatMode === "ayah" ? "Repeat Ayah" : state.repeatMode === "surah" ? "Repeat Surah" : "No Repeat"}
              >
                {repeatIcon}
              </button>

              {/* Sleep Timer */}
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      sleepTimer.remaining > 0
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    <Moon size={14} />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-40 p-2" side="top" align="start">
                  <p className="text-xs font-semibold mb-1.5 text-muted-foreground">
                    {t("player.sleepTimer") || "Minuterie"}
                  </p>
                  {([0, 15, 30, 60] as SleepDuration[]).map(d => (
                    <button
                      key={d}
                      onClick={() => sleepTimer.start(d)}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-sm transition-colors ${
                        sleepTimer.activeDuration === d && d !== 0
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-muted/40"
                      }`}
                    >
                      {d === 0 ? (t("player.off") || "Désactivé") : `${d} min`}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>

              {/* Listen Test */}
              <button
                onClick={() => setListenTestMode(!state.listenTestMode)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  state.listenTestMode
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted/40"
                }`}
              >
                <Headphones size={14} />
              </button>
            </div>

            {/* Center: playback controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={prevSurah}
                className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted/40"
              >
                <ChevronsLeft size={16} />
              </button>
              <button
                onClick={() => (state.isPlaying ? pause() : resume())}
                className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md"
              >
                {state.isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
              </button>
              <button
                onClick={nextSurah}
                className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted/40"
              >
                <ChevronsRight size={16} />
              </button>
            </div>

            {/* Right: playlist */}
            <div className="flex items-center gap-1">
              <PlaylistManager
                trigger={
                  <button
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      state.playlist.length > 0
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    <ListMusic size={14} />
                    {state.playlist.length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-primary text-primary-foreground text-[8px] flex items-center justify-center font-bold">
                        {state.playlist.length}
                      </span>
                    )}
                  </button>
                }
              />
            </div>
          </div>

          {/* Listen test banner */}
          {state.listenTestMode && state.isPlaying && (
            <div className="bg-primary/10 text-primary text-[10px] font-semibold text-center py-1 flex items-center justify-center gap-1">
              <Headphones size={10} /> {t("player.quizAfterListening") || "Un petit quiz t'attend à la fin 🎧"}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
