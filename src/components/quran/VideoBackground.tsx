import { useEffect, useRef, useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const VIDEOS = [
  '/videos/nature_01.mp4',
  '/videos/nature_02.mp4',
  '/videos/nature_03.mp4',
  '/videos/nature_04.mp4',
  '/videos/nature_05.mp4',
  '/videos/nature_06.mp4',
];

interface VideoBackgroundProps {
  autoRotate?: boolean;
  intervalSeconds?: number;
  opacity?: number;
}

export const VideoBackground = memo(function VideoBackground({
  autoRotate = true,
  intervalSeconds = 40,
  opacity = 0.4,
}: VideoBackgroundProps) {
  const [currentIndex, setCurrentIndex] = useState(() => Math.floor(Math.random() * VIDEOS.length));
  const [nextIndex, setNextIndex] = useState(() => (currentIndex + 1) % VIDEOS.length);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const nextVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(nextIndex);
        setNextIndex((nextIndex + 1) % VIDEOS.length);
        setIsTransitioning(false);
      }, 1000);
    }, intervalSeconds * 1000);
    return () => clearInterval(interval);
  }, [autoRotate, intervalSeconds, nextIndex]);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      <AnimatePresence>
        <motion.video
          key={currentIndex}
          ref={videoRef}
          src={VIDEOS[currentIndex]}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: isTransitioning ? 0 : opacity }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'brightness(0.6) saturate(1.2)' }}
        />
      </AnimatePresence>

      <video
        ref={nextVideoRef}
        src={VIDEOS[nextIndex]}
        muted
        preload="auto"
        className="hidden"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
        }}
      />
    </div>
  );
});
