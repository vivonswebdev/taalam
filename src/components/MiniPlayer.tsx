import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, ChevronsLeft, ChevronsRight, X } from "lucide-react";
import { useGlobalAudio } from "@/hooks/useGlobalAudio";
import { useLocation } from "react-router-dom";

export default function MiniPlayer() {
  const { state, pause, resume, stop, nextSurah, prevSurah } = useGlobalAudio();
  const location = useLocation();

  const isOnReadingPage = location.pathname === "/reading";

  if (state.surahNumber === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        className={`fixed ${isOnReadingPage ? "bottom-0" : "bottom-16"} left-0 right-0 z-40 safe-area-bottom`}
      >
        <div className="max-w-lg mx-auto px-3 pb-1">
          <div className="flex items-center justify-center gap-1 py-1.5">
            {/* Prev surah */}
            <button
              onClick={prevSurah}
              className="w-8 h-8 rounded-full bg-card/80 backdrop-blur border border-border text-muted-foreground flex items-center justify-center"
            >
              <ChevronsLeft size={14} />
            </button>
            {/* Play/Pause */}
            <button
              onClick={() => (state.isPlaying ? pause() : resume())}
              className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md"
            >
              {state.isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
            </button>
            {/* Next surah */}
            <button
              onClick={nextSurah}
              className="w-8 h-8 rounded-full bg-card/80 backdrop-blur border border-border text-muted-foreground flex items-center justify-center"
            >
              <ChevronsRight size={14} />
            </button>
            {/* Close */}
            <button
              onClick={stop}
              className="w-7 h-7 rounded-full bg-muted/60 text-muted-foreground flex items-center justify-center ml-1"
            >
              <X size={11} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
