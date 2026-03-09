import { useEffect, useRef, useState, memo } from 'react';

// Pexels CDN - Vidéos nature HD libres de droits - CORS OK
const VIDEOS = [
  'https://videos.pexels.com/video-files/854011/854011-hd_1920_1080_25fps.mp4',
  'https://videos.pexels.com/video-files/1448735/1448735-hd_1920_1080_25fps.mp4',
  'https://videos.pexels.com/video-files/3571264/3571264-hd_1920_1080_30fps.mp4',
  'https://videos.pexels.com/video-files/2169880/2169880-hd_1920_1080_30fps.mp4',
  'https://videos.pexels.com/video-files/3048175/3048175-hd_1920_1080_30fps.mp4',
  'https://videos.pexels.com/video-files/857251/857251-hd_1920_1080_25fps.mp4',
];

interface VideoBackgroundProps {
  autoRotate?: boolean;
  intervalSeconds?: number;
  opacity?: number;
}

export const VideoBackground = memo(function VideoBackground({
  autoRotate = true,
  intervalSeconds = 40,
  opacity = 0.5,
}: VideoBackgroundProps) {
  const [currentIndex, setCurrentIndex] = useState(() => Math.floor(Math.random() * VIDEOS.length));
  const videoRef = useRef<HTMLVideoElement>(null);

  // Rotation
  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % VIDEOS.length);
    }, intervalSeconds * 1000);
    return () => clearInterval(interval);
  }, [autoRotate, intervalSeconds]);

  // Autoplay with fallback for browser policies
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    vid.load();
    vid.play().catch(() => {
      const start = () => {
        vid.play().catch(() => {});
        document.removeEventListener('click', start);
        document.removeEventListener('touchstart', start);
      };
      document.addEventListener('click', start, { once: true });
      document.addEventListener('touchstart', start, { once: true });
    });
  }, [currentIndex]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <video
        key={currentIndex}
        ref={videoRef}
        src={VIDEOS[currentIndex]}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          minWidth: '100%',
          minHeight: '100%',
          width: 'auto',
          height: 'auto',
          objectFit: 'cover',
          opacity: opacity,
          filter: 'brightness(0.9) saturate(1.2)',
        }}
        onError={() => {
          console.error('Video error, skipping to next');
          setCurrentIndex(prev => (prev + 1) % VIDEOS.length);
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.6) 100%)',
          zIndex: 1,
        }}
      />
    </div>
  );
});
