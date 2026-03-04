import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useDragControls, useMotionValue, useTransform } from "framer-motion";
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

const SWIPE_THRESHOLD = 80;
const IMG_BASE = "https://cdn.islamic.network/quran/images/";

function getMushafImageUrl(page: number): string {
  const padded = String(page).padStart(3, "0");
  return `${IMG_BASE}page${padded}.png`;
}

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
            fillOpacity={0.3}
            stroke={item.color}
            strokeWidth={0.3}
            rx={0.4}
          />
        );
      })}
    </svg>
  );
});

const MushafSwipeTajwid = memo(function MushafSwipeTajwid({
  currentPage,
  onChangePage,
  isBookmarked,
  onToggleBookmark,
  t,
  showTajwid,
}: MushafSwipeTajwidProps) {
  const { getPageData } = useTajwidData();
  const constraintsRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  const [imgLoaded, setImgLoaded] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [lastDragOffset, setLastDragOffset] = useState(0);

  const x = useMotionValue(0);
  const rotateY = useTransform(x, [-160, 0, 160], [14, 0, -14]);
  const shadow = useTransform(
    x,
    [-160, 0, 160],
    [
      "10px 0 26px hsl(var(--foreground) / 0.20)",
      "0 0 0 hsl(var(--foreground) / 0)",
      "-10px 0 26px hsl(var(--foreground) / 0.20)",
    ]
  );

  const pageData = useMemo(() => (showTajwid ? getPageData(currentPage) : []), [showTajwid, getPageData, currentPage]);

  const goNext = useCallback(() => {
    if (currentPage >= TOTAL_MUSHAF_PAGES) return;
    setDirection(1);
    onChangePage(currentPage + 1);
  }, [currentPage, onChangePage]);

  const goPrev = useCallback(() => {
    if (currentPage <= 1) return;
    setDirection(-1);
    onChangePage(currentPage - 1);
  }, [currentPage, onChangePage]);

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number } }) => {
      const offsetX = info.offset.x;
      setLastDragOffset(Math.round(offsetX));
      console.log("drag offset:", offsetX);

      if (offsetX <= -SWIPE_THRESHOLD) {
        goNext();
      } else if (offsetX >= SWIPE_THRESHOLD) {
        goPrev();
      }

      x.set(0);
    },
    [goNext, goPrev, x]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      dragControls.start(e);
    },
    [dragControls]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goNext();
      if (e.key === "ArrowRight") goPrev();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNext, goPrev]);

  useEffect(() => {
    setImgLoaded(false);
    x.set(0);

    if (currentPage < TOTAL_MUSHAF_PAGES) {
      const nextImg = new Image();
      nextImg.src = getMushafImageUrl(currentPage + 1);
    }

    if (currentPage > 1) {
      const prevImg = new Image();
      prevImg.src = getMushafImageUrl(currentPage - 1);
    }
  }, [currentPage, x]);

  const flipVariants = {
    enter: (dir: 1 | -1) => ({
      rotateY: dir === 1 ? -180 : 180,
      opacity: 0.75,
      scale: 0.97,
    }),
    center: {
      rotateY: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: "easeInOut" as const },
    },
    exit: (dir: 1 | -1) => ({
      rotateY: dir === 1 ? 180 : -180,
      opacity: 0.75,
      scale: 0.97,
      transition: { duration: 0.3, ease: "easeInOut" as const },
    }),
  };

  return (
    <div
      className="relative w-full h-screen overflow-hidden select-none touch-pan-y"
      style={{ touchAction: "pan-y", userSelect: "none", perspective: "1200px" }}
      role="img"
      aria-label={`${t("mushaf.page")} ${currentPage}`}
      data-testid="mushaf-swipe-root"
    >
      <div ref={constraintsRef} className="absolute inset-0" />

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentPage}
          custom={direction}
          variants={flipVariants}
          initial="enter"
          animate="center"
          exit="exit"
          drag="x"
          dragListener={false}
          dragControls={dragControls}
          dragConstraints={constraintsRef}
          dragElastic={0}
          dragMomentum={false}
          onPointerDown={handlePointerDown}
          onDragEnd={handleDragEnd}
          style={{ x, rotateY, boxShadow: shadow }}
          className="absolute inset-0 mx-auto my-auto h-full max-h-screen w-full max-w-[560px] cursor-grab active:cursor-grabbing"
          data-testid="mushaf-draggable"
        >
          {!imgLoaded && <div className="absolute inset-0 bg-muted animate-pulse" />}

          <img
            src={getMushafImageUrl(currentPage)}
            alt={`${t("mushaf.page")} ${currentPage}`}
            className="h-full w-full object-contain"
            draggable={false}
            loading="eager"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgLoaded(true)}
          />

          {showTajwid && imgLoaded && <TajwidOverlay pageData={pageData} />}
        </motion.div>
      </AnimatePresence>

      <button
        type="button"
        aria-label={t("mushaf.nextPage") || "Next page"}
        onClick={goNext}
        className="absolute inset-y-0 left-0 z-30 w-1/2"
        data-testid="tap-left-next"
      />
      <button
        type="button"
        aria-label={t("mushaf.prevPage") || "Previous page"}
        onClick={goPrev}
        className="absolute inset-y-0 right-0 z-30 w-1/2"
        data-testid="tap-right-prev"
      />

      <button
        type="button"
        aria-label={isBookmarked ? t("mushaf.removeBookmark") || "Remove bookmark" : t("mushaf.addBookmark") || "Add bookmark"}
        onClick={onToggleBookmark}
        className="absolute top-3 right-3 z-40 rounded-full border border-border bg-background/80 px-2 py-1 text-[10px] text-foreground backdrop-blur-sm"
      >
        {isBookmarked ? "★" : "☆"}
      </button>

      <div className="absolute bottom-3 left-3 z-40 rounded-md border border-border bg-background/85 px-2 py-1 text-[10px] font-medium text-foreground backdrop-blur-sm">
        {`Page ${currentPage} | Drag: offset ${lastDragOffset}`}
      </div>
    </div>
  );
});

export default MushafSwipeTajwid;
