import { useRef, useState, useCallback, useEffect, ReactNode } from "react";

interface PinchZoomContainerProps {
  children: ReactNode;
  minScale?: number;
  maxScale?: number;
}

/**
 * Wraps CRM table content with pinch-zoom on mobile only.
 * Uses direct DOM transforms during gestures for smooth performance,
 * then syncs React state on gesture end.
 * Single-tap clicks pass through to children even when zoomed.
 */
export function PinchZoomContainer({
  children,
  minScale = 0.3,
  maxScale = 3,
}: PinchZoomContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  // React state only for UI indicator; actual transform is DOM-driven
  const [displayScale, setDisplayScale] = useState(1);

  // Live transform values (not React state — no re-renders during gestures)
  const transformRef = useRef({ scale: 1, x: 0, y: 0 });

  const gestureRef = useRef({
    initialDistance: 0,
    initialScale: 1,
    isPinching: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    isPanning: false,
    movedDistance: 0, // track movement to distinguish tap vs pan
  });

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const getDistance = (t1: Touch, t2: Touch) => {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const applyTransform = useCallback((s: number, x: number, y: number, animate = false) => {
    const el = contentRef.current;
    if (!el) return;
    el.style.transition = animate ? "transform 0.2s ease-out" : "none";
    el.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
    el.style.width = s < 1 ? `${100 / s}%` : "";
    transformRef.current = { scale: s, x, y };
  }, []);

  // Use native event listeners for non-passive touch handling
  useEffect(() => {
    if (!isMobile) return;
    const container = containerRef.current;
    if (!container) return;

    const onTouchStart = (e: TouchEvent) => {
      const g = gestureRef.current;

      if (e.touches.length === 2) {
        e.preventDefault();
        e.stopPropagation();
        g.initialDistance = getDistance(e.touches[0], e.touches[1]);
        g.initialScale = transformRef.current.scale;
        g.isPinching = true;
        g.isPanning = false;
      } else if (e.touches.length === 1 && transformRef.current.scale !== 1) {
        // Don't preventDefault or stopPropagation yet — wait to see if it's a tap or pan
        g.startX = e.touches[0].clientX;
        g.startY = e.touches[0].clientY;
        g.lastX = transformRef.current.x;
        g.lastY = transformRef.current.y;
        g.isPanning = false; // will become true after threshold
        g.movedDistance = 0;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      const g = gestureRef.current;

      if (g.isPinching && e.touches.length === 2) {
        e.preventDefault();
        e.stopPropagation();
        const currentDistance = getDistance(e.touches[0], e.touches[1]);
        const ratio = currentDistance / g.initialDistance;
        const newScale = Math.min(maxScale, Math.max(minScale, g.initialScale * ratio));
        applyTransform(newScale, transformRef.current.x, transformRef.current.y);
        setDisplayScale(Math.round(newScale * 100));
      } else if (e.touches.length === 1 && transformRef.current.scale !== 1) {
        const dx = e.touches[0].clientX - g.startX;
        const dy = e.touches[0].clientY - g.startY;
        g.movedDistance = Math.sqrt(dx * dx + dy * dy);

        // Only start panning after 8px threshold — below that, let it be a tap
        if (g.movedDistance > 8) {
          if (!g.isPanning) {
            g.isPanning = true;
          }
          e.preventDefault();
          e.stopPropagation();
          const newX = g.lastX + dx;
          const newY = g.lastY + dy;
          applyTransform(transformRef.current.scale, newX, newY);
        }
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      const g = gestureRef.current;
      const wasPinching = g.isPinching;
      const wasPanning = g.isPanning;

      if (wasPinching || wasPanning) {
        e.stopPropagation();
      }

      g.isPinching = false;
      g.isPanning = false;
      g.movedDistance = 0;

      // Snap back to 1 if very close
      const t = transformRef.current;
      if (Math.abs(t.scale - 1) < 0.08) {
        applyTransform(1, 0, 0, true);
        setDisplayScale(100);
      } else {
        setDisplayScale(Math.round(t.scale * 100));
      }
    };

    // Prevent Safari gesture events
    const preventGesture = (e: Event) => {
      if (gestureRef.current.isPinching) e.preventDefault();
    };
    const preventDoubleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) e.preventDefault();
    };

    container.addEventListener("touchstart", onTouchStart, { passive: false });
    container.addEventListener("touchmove", onTouchMove, { passive: false });
    container.addEventListener("touchend", onTouchEnd, { passive: false });
    container.addEventListener("gesturestart", preventGesture, { passive: false });
    container.addEventListener("gesturechange", preventGesture, { passive: false });
    container.addEventListener("touchmove", preventDoubleTouchMove, { passive: false });

    return () => {
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
      container.removeEventListener("touchend", onTouchEnd);
      container.removeEventListener("gesturestart", preventGesture);
      container.removeEventListener("gesturechange", preventGesture);
      container.removeEventListener("touchmove", preventDoubleTouchMove);
    };
  }, [isMobile, minScale, maxScale, applyTransform]);

  const resetZoom = useCallback(() => {
    applyTransform(1, 0, 0, true);
    setDisplayScale(100);
  }, [applyTransform]);

  // On desktop, just render children directly
  if (!isMobile) {
    return <>{children}</>;
  }

  const isZoomed = displayScale !== 100;

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ touchAction: "none", overflow: "visible" }}
    >
      {isZoomed && (
        <div className="sticky top-0 z-50 flex items-center justify-between px-3 py-1.5 bg-primary/90 text-primary-foreground text-xs font-medium rounded-b-lg mx-2 backdrop-blur-sm">
          <span>Zoom: {displayScale}%</span>
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
        style={{ transformOrigin: "top left" }}
      >
        {children}
      </div>
    </div>
  );
}
