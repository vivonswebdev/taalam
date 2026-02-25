import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipForward, SkipBack, X, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useGlobalAudio } from "@/hooks/useGlobalAudio";
import { useLocation } from "react-router-dom";

export default function MiniPlayer() {
  const { state, pause, resume, stop, nextAyah, prevAyah, nextSurah, prevSurah } = useGlobalAudio();
  const location = useLocation();

  // Don't show mini-player on the reading page when a surah is open (full player visible)
  // We detect this by checking if we're on /reading — the MushafReader has its own player
  const isOnReadingPage = location.pathname === "/reading";

  // Don't show if nothing is loaded
  if (state.surahNumber === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        className={`fixed ${isOnReadingPage ? "bottom-0" : "bottom-16"} left-0 right-0 z-40 safe-area-bottom`}
      >
        <div className="max-w-lg mx-auto px-3 pb-1">
          <div className="bg-card/95 backdrop-blur-lg border border-border rounded-2xl shadow-lg px-3 py-2">
            {/* Progress bar on top */}
            <div className="h-1 bg-muted rounded-full mb-2 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${state.progress}%` }}
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Surah info */}
              <div className="flex-1 min-w-0">
                <p className="font-arabic text-sm text-primary truncate">{state.surahNameArabic}</p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {state.surahName} · {state.currentAyah + 1}/{state.totalAyahs}
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Prev surah */}
                <button
                  onClick={prevSurah}
                  className="w-7 h-7 rounded-full bg-muted/50 text-muted-foreground flex items-center justify-center"
                >
                  <ChevronsLeft size={12} />
                </button>
                {/* Prev ayah */}
                <button
                  onClick={prevAyah}
                  className="w-7 h-7 rounded-full bg-muted text-foreground flex items-center justify-center"
                >
                  <SkipBack size={12} />
                </button>
                {/* Play/Pause */}
                <button
                  onClick={() => state.isPlaying ? pause() : resume()}
                  className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                >
                  {state.isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                </button>
                {/* Next ayah */}
                <button
                  onClick={nextAyah}
                  className="w-7 h-7 rounded-full bg-muted text-foreground flex items-center justify-center"
                >
                  <SkipForward size={12} />
                </button>
                {/* Next surah */}
                <button
                  onClick={nextSurah}
                  className="w-7 h-7 rounded-full bg-muted/50 text-muted-foreground flex items-center justify-center"
                >
                  <ChevronsRight size={12} />
                </button>
                {/* Close */}
                <button
                  onClick={stop}
                  className="w-7 h-7 rounded-full bg-muted text-muted-foreground flex items-center justify-center ml-1"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
