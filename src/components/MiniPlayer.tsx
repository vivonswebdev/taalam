import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, ChevronsLeft, ChevronsRight, X, Headphones } from "lucide-react";
import { useGlobalAudio } from "@/hooks/useGlobalAudio";
import { useLocation, useNavigate } from "react-router-dom";

export default function MiniPlayer() {
  const { state, pause, resume, stop, nextSurah, prevSurah, setListenTestMode, onSurahComplete } = useGlobalAudio();
  const location = useLocation();
  const navigate = useNavigate();

  const isOnReadingPage = location.pathname === "/reading";

  // Auto-hide after 5s of inactivity on reading page
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

  // Listen-test: redirect to quiz when surah finishes
  useEffect(() => {
    onSurahComplete.current = (surahNumber: number, _surahName: string) => {
      if (state.listenTestMode) {
        navigate(`/listen-test?surah=${surahNumber}`);
      }
    };
    return () => { onSurahComplete.current = null; };
  }, [state.listenTestMode, navigate, onSurahComplete]);

  if (state.surahNumber === 0) return null;

  // Reading page: ultra-compact bar just above bottom nav (~4.5rem)
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

  // Default (non-reading pages)
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        className="fixed left-0 right-0 z-[1001] flex justify-center"
        style={{
          bottom: "5rem",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div
          className="flex flex-col items-center"
          style={{ borderRadius: "50px", padding: "4px 12px" }}
        >
          {state.listenTestMode && state.isPlaying && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-1.5 px-2 py-0.5 text-[10px] font-semibold text-primary"
            >
              <Headphones size={10} /> Un petit quiz t'attend à la fin 🎧
            </motion.div>
          )}
          <div className="flex items-center justify-center gap-5">
            <button
              onClick={() => setListenTestMode(!state.listenTestMode)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                state.listenTestMode
                  ? "bg-primary text-primary-foreground"
                  : "bg-card/80 backdrop-blur border border-border text-muted-foreground"
              }`}
              title="Écoute + Test"
            >
              <Headphones size={15} />
            </button>
            <button
              onClick={prevSurah}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-card/80 backdrop-blur border border-border text-muted-foreground"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={() => (state.isPlaying ? pause() : resume())}
              className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg"
            >
              {state.isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
            </button>
            <button
              onClick={nextSurah}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-card/80 backdrop-blur border border-border text-muted-foreground"
            >
              <ChevronsRight size={16} />
            </button>
            <button
              onClick={stop}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-muted/60 text-muted-foreground"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
