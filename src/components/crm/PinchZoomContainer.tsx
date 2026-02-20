import { useRef, useState, useCallback, useEffect, ReactNode } from "react";

interface PinchZoomContainerProps {
  children: ReactNode;
  minScale?: number;
  maxScale?: number;
}

/**
 * Wraps CRM table content with pinch-zoom on mobile only.
 * Allows zooming out below 100% to see the full table.
 * Stops touch events from propagating to prevent accidental navigation.
 */
export function PinchZoomContainer({
  children,
  minScale = 0.3,
  maxScale = 3,
}: PinchZoomContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const gestureRef = useRef({
    initialDistance: 0,
    initialScale: 1,
    isPinching: false,
    startX: 0,
    startY: 0,
    isPanning: false,
  });

  const getDistance = (t1: { clientX: number; clientY: number }, t2: { clientX: number; clientY: number }) => {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isMobile) return;
    if (e.touches.length === 2) {
      e.preventDefault();
      e.stopPropagation();
      const g = gestureRef.current;
      g.initialDistance = getDistance(e.touches[0], e.touches[1]);
      g.initialScale = scale;
      g.isPinching = true;
      g.isPanning = false;
    } else if (e.touches.length === 1 && scale !== 1) {
      const g = gestureRef.current;
      g.startX = e.touches[0].clientX - translate.x;
      g.startY = e.touches[0].clientY - translate.y;
      g.isPanning = true;
      e.stopPropagation();
    }
  }, [isMobile, scale, translate]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isMobile) return;
    const g = gestureRef.current;
    if (g.isPinching && e.touches.length === 2) {
      e.preventDefault();
      e.stopPropagation();
      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      const ratio = currentDistance / g.initialDistance;
      const newScale = Math.min(maxScale, Math.max(minScale, g.initialScale * ratio));
      setScale(newScale);
    } else if (g.isPanning && e.touches.length === 1 && scale !== 1) {
      e.preventDefault();
      e.stopPropagation();
      const newX = e.touches[0].clientX - g.startX;
      const newY = e.touches[0].clientY - g.startY;
      setTranslate({ x: newX, y: newY });
    }
  }, [isMobile, scale, minScale, maxScale]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isMobile) return;
    const g = gestureRef.current;
    if (g.isPinching || g.isPanning) {
      e.preventDefault();
      e.stopPropagation();
    }
    g.isPinching = false;
    g.isPanning = false;
    if (Math.abs(scale - 1) < 0.05) {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
    }
  }, [isMobile, scale]);

  const resetZoom = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, []);

  // Prevent native gestures on the container (mobile only)
  useEffect(() => {
    if (!isMobile) return;
    const el = containerRef.current;
    if (!el) return;
    const prevent = (e: Event) => {
      if (gestureRef.current.isPinching) e.preventDefault();
    };
    const preventTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) e.preventDefault();
    };
    el.addEventListener("gesturestart", prevent, { passive: false });
    el.addEventListener("gesturechange", prevent, { passive: false });
    el.addEventListener("touchmove", preventTouchMove, { passive: false });
    return () => {
      el.removeEventListener("gesturestart", prevent);
      el.removeEventListener("gesturechange", prevent);
      el.removeEventListener("touchmove", preventTouchMove);
    };
  }, [isMobile]);

  // On desktop, just render children directly
  if (!isMobile) {
    return <>{children}</>;
  }

  const isZoomed = scale !== 1;
  const scalePercent = Math.round(scale * 100);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden"
      style={{ touchAction: "none" }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {isZoomed && (
        <div className="sticky top-0 z-50 flex items-center justify-between px-3 py-1.5 bg-primary/90 text-primary-foreground text-xs font-medium rounded-b-lg mx-2 backdrop-blur-sm">
          <span>Zoom: {scalePercent}%</span>
          <button
            onClick={resetZoom}
            className="px-2 py-0.5 rounded bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-colors"
          >
            Reset
          </button>
        </div>
      )}
      <div
        style={{
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
          transformOrigin: "top left",
          transition: gestureRef.current.isPinching ? "none" : "transform 0.15s ease-out",
        }}
      >
        {children}
      </div>
    </div>
  );
}
