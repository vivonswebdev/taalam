import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, ChevronsLeft, ChevronsRight, X, Headphones } from "lucide-react";
import { useGlobalAudio } from "@/hooks/useGlobalAudio";
import { useLocation, useNavigate } from "react-router-dom";

export default function MiniPlayer() {
  const { state, pause, resume, stop, nextSurah, prevSurah, setListenTestMode, onSurahComplete } = useGlobalAudio();
  const location = useLocation();
  const navigate = useNavigate();

  const isOnReadingPage = location.pathname === "/reading";

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

  // Reading page: compact fixed bar at bottom center
  if (isOnReadingPage) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          className="fixed z-[1001] opacity-70 hover:opacity-100 active:opacity-100 transition-opacity duration-200"
          style={{
            bottom: "calc(8px + env(safe-area-inset-bottom, 0px))",
            left: "50%",
            transform: "translateX(-50%)",
            maxWidth: "90%",
          }}
        >
          <div className="flex flex-col items-center bg-background/80 backdrop-blur-md border border-border/50 rounded-full shadow-sm px-3 py-1.5">
            {/* Listen-test banner */}
            {state.listenTestMode && state.isPlaying && (
              <p className="text-[11px] text-primary font-medium truncate max-w-[200px] leading-tight mb-0.5">
                <Headphones size={9} className="inline mr-1" />Quiz à la fin 🎧
              </p>
            )}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setListenTestMode(!state.listenTestMode)}
                className={`w-10 h-10 min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center transition-colors ${
                  state.listenTestMode ? "bg-primary text-primary-foreground" : "bg-muted/40 text-muted-foreground"
                }`}
                title="Écoute + Test"
              >
                <Headphones size={14} />
              </button>
              <button
                onClick={prevSurah}
                className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center bg-muted/40 text-muted-foreground"
              >
                <ChevronsLeft size={15} />
              </button>
              <button
                onClick={() => (state.isPlaying ? pause() : resume())}
                className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm"
              >
                {state.isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
              </button>
              <button
                onClick={nextSurah}
                className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center bg-muted/40 text-muted-foreground"
              >
                <ChevronsRight size={15} />
              </button>
              <button
                onClick={stop}
                className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center bg-muted/30 text-muted-foreground"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        </motion.div>
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
