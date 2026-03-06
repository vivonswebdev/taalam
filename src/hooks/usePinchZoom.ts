import { useState, useRef, useCallback } from 'react';

interface PinchZoomOptions {
  minScale?: number;
  maxScale?: number;
  initialScale?: number;
  step?: number;
}

export function usePinchZoom({
  minScale = 0.8,
  maxScale = 3,
  initialScale = 1,
  step = 0.1
}: PinchZoomOptions = {}) {
  const [scale, setScale] = useState(initialScale);
  const lastDistanceRef = useRef(0);
  const isPinchingRef = useRef(false);

  const getDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const dx = touches[1].clientX - touches[0].clientX;
    const dy = touches[1].clientY - touches[0].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      isPinchingRef.current = true;
      lastDistanceRef.current = getDistance(e.touches);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPinchingRef.current || e.touches.length !== 2) return;
    e.preventDefault();

    const currentDistance = getDistance(e.touches);
    const delta = currentDistance - lastDistanceRef.current;
    const scaleChange = delta * 0.005;

    setScale(prev => Math.min(maxScale, Math.max(minScale, prev + scaleChange)));
    lastDistanceRef.current = currentDistance;
  }, [minScale, maxScale]);

  const handleTouchEnd = useCallback(() => {
    isPinchingRef.current = false;
  }, []);

  const zoomIn = useCallback(() => {
    setScale(prev => Math.min(maxScale, prev + step));
  }, [maxScale, step]);

  const zoomOut = useCallback(() => {
    setScale(prev => Math.max(minScale, prev - step));
  }, [minScale, step]);

  const resetZoom = useCallback(() => {
    setScale(initialScale);
  }, [initialScale]);

  const isPinching = isPinchingRef.current;

  return {
    scale,
    isPinching,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    zoomIn,
    zoomOut,
    resetZoom,
  };
}
