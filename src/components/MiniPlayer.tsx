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

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        className="fixed left-0 right-0 z-[1001] flex justify-center"
        style={{
          bottom: isOnReadingPage ? "max(15vh, calc(env(safe-area-inset-bottom, 0px) + 60px))" : "5rem",
          paddingBottom: isOnReadingPage ? undefined : "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div
          className="flex flex-col items-center"
          style={{
            background: isOnReadingPage ? "rgba(0,0,0,0.8)" : undefined,
            borderRadius: "50px",
            padding: isOnReadingPage ? "10px 20px" : "4px 12px",
          }}
        >
          {/* Listen-test banner */}
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
            {/* Listen-test toggle */}
            <button
              onClick={() => setListenTestMode(!state.listenTestMode)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                state.listenTestMode
                  ? "bg-primary text-primary-foreground"
                  : isOnReadingPage
                    ? "bg-white/15 text-white/70"
                    : "bg-card/80 backdrop-blur border border-border text-muted-foreground"
              }`}
              title="Écoute + Test"
            >
              <Headphones size={15} />
            </button>
            {/* Prev surah */}
            <button
              onClick={prevSurah}
              className={`w-9 h-9 rounded-full flex items-center justify-center ${
                isOnReadingPage
                  ? "bg-white/15 text-white/70"
                  : "bg-card/80 backdrop-blur border border-border text-muted-foreground"
              }`}
            >
              <ChevronsLeft size={16} />
            </button>
            {/* Play/Pause */}
            <button
              onClick={() => (state.isPlaying ? pause() : resume())}
              className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg"
            >
              {state.isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
            </button>
            {/* Next surah */}
            <button
              onClick={nextSurah}
              className={`w-9 h-9 rounded-full flex items-center justify-center ${
                isOnReadingPage
                  ? "bg-white/15 text-white/70"
                  : "bg-card/80 backdrop-blur border border-border text-muted-foreground"
              }`}
            >
              <ChevronsRight size={16} />
            </button>
            {/* Close */}
            <button
              onClick={stop}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isOnReadingPage ? "bg-white/10 text-white/50" : "bg-muted/60 text-muted-foreground"
              }`}
            >
              <X size={13} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
