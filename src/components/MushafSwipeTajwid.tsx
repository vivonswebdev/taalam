import { memo, useCallback, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { useTajwidData } from "@/hooks/useTajwidData";
import { TOTAL_MUSHAF_PAGES } from "@/data/mushafPages";

export interface MushafSwipeTajwidProps {
  currentPage: number;
  onChangePage: (page: number) => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  t: (key: string) => string;
  showTajwid: boolean;
}

const SWIPE_THRESHOLD = 100;
const IMG_BASE = "https://cdn.islamic.network/quran/images/";

function getMushafImageUrl(page: number): string {
  const padded = String(page).padStart(3, "0");
  return `${IMG_BASE}page${padded}.png`;
}

/** Tajwid overlay SVG with colored rectangles */
const TajwidOverlay = memo(function TajwidOverlay({
  pageData,
}: {
  pageData: { bbox: [number, number, number, number]; rule: string; color: string }[];
}) {
  if (pageData.length === 0) return null;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {pageData.map((item, i) => {
        const [x1, y1, x2, y2] = item.bbox;
        return (
          <rect
            key={i}
            x={x1}
            y={y1}
            width={x2 - x1}
            height={y2 - y1}
            fill={item.color}
            fillOpacity={0.25}
            stroke={item.color}
            strokeWidth={0.3}
            rx={0.5}
          />
        );
      })}
    </svg>
  );
});

/**
 * MushafSwipeTajwid — swipeable Mushaf page viewer with tajwid color overlay.
 *
 * - Swipe left → next page, swipe right → previous page
 * - 3D page-flip animation
 * - Tap left/right halves as fallback
 * - Keyboard arrow support
 * - Tajwid overlay toggle
 */
const MushafSwipeTajwid = memo(function MushafSwipeTajwid({
  currentPage,
  onChangePage,
  isBookmarked,
  onToggleBookmark,
  t,
  showTajwid,
}: MushafSwipeTajwidProps) {
  const { getPageData } = useTajwidData();
  const [direction, setDirection] = useState(0); // -1 = prev, 1 = next
  const [imgLoaded, setImgLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const rotateY = useTransform(x, [-200, 0, 200], [15, 0, -15]);
  const shadow = useTransform(
    x,
    [-200, 0, 200],
    [
      "8px 0 30px rgba(0,0,0,0.3)",
      "0 0 0 rgba(0,0,0,0)",
      "-8px 0 30px rgba(0,0,0,0.3)",
    ]
  );

  const goNext = useCallback(() => {
    if (currentPage < TOTAL_MUSHAF_PAGES) {
      setDirection(1);
      onChangePage(currentPage + 1);
    }
  }, [currentPage, onChangePage]);

  const goPrev = useCallback(() => {
    if (currentPage > 1) {
      setDirection(-1);
      onChangePage(currentPage - 1);
    }
  }, [currentPage, onChangePage]);

  // Keyboard arrows
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goNext();    // Arabic RTL: left = forward
      if (e.key === "ArrowRight") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev]);

  // Preload adjacent pages
  useEffect(() => {
    setImgLoaded(false);
    if (currentPage < TOTAL_MUSHAF_PAGES) {
      const img = new Image();
      img.src = getMushafImageUrl(currentPage + 1);
    }
    if (currentPage > 1) {
      const img = new Image();
      img.src = getMushafImageUrl(currentPage - 1);
    }
  }, [currentPage]);

  const handleDragEnd = useCallback(
    (_: any, info: { offset: { x: number } }) => {
      if (info.offset.x < -SWIPE_THRESHOLD) goNext();
      else if (info.offset.x > SWIPE_THRESHOLD) goPrev();
    },
    [goNext, goPrev]
  );

  // Tap fallback: left half = next, right half = prev (RTL)
  const handleTap = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const tapX = e.clientX - rect.left;
      if (tapX < rect.width / 2) goNext();
      else goPrev();
    },
    [goNext, goPrev]
  );

  const pageData = showTajwid ? getPageData(currentPage) : [];

  const flipVariants = {
    enter: (dir: number) => ({
      rotateY: dir > 0 ? -90 : 90,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      rotateY: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
    },
    exit: (dir: number) => ({
      rotateY: dir > 0 ? 90 : -90,
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.25 },
    }),
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden select-none"
      style={{ perspective: "1200px" }}
      role="img"
      aria-label={`${t("mushaf.page")} ${currentPage}`}
    >
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentPage}
          custom={direction}
          variants={flipVariants}
          initial="enter"
          animate="center"
          exit="exit"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={handleDragEnd}
          style={{ x, rotateY, boxShadow: shadow }}
          className="relative w-full max-w-[500px] cursor-grab active:cursor-grabbing rounded-lg overflow-hidden"
          onClick={handleTap}
        >
          {/* Loading skeleton */}
          {!imgLoaded && (
            <div className="absolute inset-0 bg-muted animate-pulse rounded-lg" />
          )}

          {/* Mushaf page image */}
          <img
            src={getMushafImageUrl(currentPage)}
            alt={`${t("mushaf.page")} ${currentPage}`}
            className="w-full h-auto block"
            draggable={false}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgLoaded(true)}
            loading="eager"
          />

          {/* Tajwid color overlay */}
          {showTajwid && imgLoaded && <TajwidOverlay pageData={pageData} />}

          {/* Page number badge */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm text-foreground text-[10px] font-semibold px-3 py-1 rounded-full border border-border">
            {currentPage} / {TOTAL_MUSHAF_PAGES}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
});

export default MushafSwipeTajwid;
