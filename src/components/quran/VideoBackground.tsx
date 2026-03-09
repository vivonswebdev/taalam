import { useEffect, useRef, useState, memo } from 'react';

// Free nature videos from Pixabay/Pexels CDN (royalty-free)
const VIDEOS = [
  'https://cdn.pixabay.com/video/2024/05/31/214698_large.mp4', // ocean waves
  'https://cdn.pixabay.com/video/2020/07/30/45637-445192781_large.mp4', // forest
  'https://cdn.pixabay.com/video/2021/08/12/85029-586698744_large.mp4', // clouds sky
  'https://cdn.pixabay.com/video/2023/09/14/180595-864688154_large.mp4', // sunset
  'https://cdn.pixabay.com/video/2020/05/25/40130-424930975_large.mp4', // waterfall
  'https://cdn.pixabay.com/video/2022/07/22/125477-732611081_large.mp4', // stars night
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
  const [fading, setFading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % VIDEOS.length);
        setFading(false);
      }, 1200);
    }, intervalSeconds * 1000);
    return () => clearInterval(interval);
  }, [autoRotate, intervalSeconds]);

  // When video source changes, play it
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [currentIndex]);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      <video
        ref={videoRef}
        key={currentIndex}
        src={VIDEOS[currentIndex]}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
        style={{
          opacity: fading ? 0 : opacity,
          filter: 'brightness(0.6) saturate(1.2)',
        }}
      />

      {/* Gradient overlays for depth */}
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
