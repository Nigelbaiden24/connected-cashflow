import { useRef, useState, useCallback, useEffect, ReactNode } from "react";

interface PinchZoomContainerProps {
  children: ReactNode;
  minScale?: number;
  maxScale?: number;
}

/**
 * Wraps CRM content with custom pinch-zoom support on mobile.
 * Allows zooming out below 100% so users can see the full board.
 * Prevents touch events from bubbling up and triggering navigation.
 */
export function PinchZoomContainer({
  children,
  minScale = 0.3,
  maxScale = 3,
}: PinchZoomContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  // Touch tracking refs (avoid re-renders during gesture)
  const gestureRef = useRef({
    initialDistance: 0,
    initialScale: 1,
    lastScale: 1,
    isPinching: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    isPanning: false,
  });

  const getDistance = (t1: { clientX: number; clientY: number }, t2: { clientX: number; clientY: number }) => {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      e.stopPropagation();
      const g = gestureRef.current;
      g.initialDistance = getDistance(e.touches[0], e.touches[1]);
      g.initialScale = scale;
      g.isPinching = true;
      g.isPanning = false;
    } else if (e.touches.length === 1 && scale !== 1) {
      // Only allow panning when zoomed
      const g = gestureRef.current;
      g.startX = e.touches[0].clientX - translate.x;
      g.startY = e.touches[0].clientY - translate.y;
      g.isPanning = true;
    }
  }, [scale, translate]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const g = gestureRef.current;

    if (g.isPinching && e.touches.length === 2) {
      e.preventDefault();
      e.stopPropagation();
      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      const ratio = currentDistance / g.initialDistance;
      const newScale = Math.min(maxScale, Math.max(minScale, g.initialScale * ratio));
      g.lastScale = newScale;
      setScale(newScale);
    } else if (g.isPanning && e.touches.length === 1 && scale !== 1) {
      e.preventDefault();
      const newX = e.touches[0].clientX - g.startX;
      const newY = e.touches[0].clientY - g.startY;
      setTranslate({ x: newX, y: newY });
    }
  }, [scale, minScale, maxScale]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const g = gestureRef.current;
    if (g.isPinching) {
      e.preventDefault();
      e.stopPropagation();
    }
    g.isPinching = false;
    g.isPanning = false;

    // If scale is close to 1, snap back
    if (Math.abs(scale - 1) < 0.05) {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
    }
  }, [scale]);

  const resetZoom = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, []);

  // Prevent native browser gestures on the container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const preventGesture = (e: Event) => {
      if (gestureRef.current.isPinching) {
        e.preventDefault();
      }
    };
    el.addEventListener("gesturestart", preventGesture, { passive: false });
    el.addEventListener("gesturechange", preventGesture, { passive: false });
    // Also prevent touchmove at DOM level for pinch
    const preventTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
      }
    };
    el.addEventListener("touchmove", preventTouchMove, { passive: false });
    return () => {
      el.removeEventListener("gesturestart", preventGesture);
      el.removeEventListener("gesturechange", preventGesture);
      el.removeEventListener("touchmove", preventTouchMove);
    };
  }, []);

  const isZoomed = scale !== 1;
  const scalePercent = Math.round(scale * 100);

  return (
    <div
      ref={containerRef}
      className="relative w-full md:touch-action-auto"
      style={{ touchAction: "none" }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Zoom indicator */}
      {isZoomed && (
        <div className="sticky top-0 z-50 flex items-center justify-between px-3 py-1.5 bg-primary/90 text-primary-foreground text-xs font-medium rounded-b-lg mx-4 backdrop-blur-sm">
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
        ref={contentRef}
        style={{
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
          transformOrigin: "top left",
          transition: gestureRef.current.isPinching ? "none" : "transform 0.2s ease-out",
        }}
      >
        {children}
      </div>
    </div>
  );
}
