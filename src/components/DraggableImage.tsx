import { useState, useRef, useEffect, useCallback } from "react";
import { useZoomScaleRef } from "@/contexts/ZoomScaleContext";
import { X, Move } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DraggableImageProps {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  onPositionChange: (id: string, x: number, y: number) => void;
  onSizeChange: (id: string, width: number, height: number) => void;
  onRemove: (id: string) => void;
}

export function DraggableImage({
  id,
  src,
  x,
  y,
  width,
  height,
  onPositionChange,
  onSizeChange,
  onRemove
}: DraggableImageProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const initialPosRef = useRef({ x: 0, y: 0 });
  const initialSizeRef = useRef({ width: 0, height: 0 });
  const zoomScaleRef = useZoomScaleRef();

  // Unified pointer handler for mouse and touch - full XY movement
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if ((e.target as HTMLElement).closest('button')) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    initialPosRef.current = { x, y };
    
    // Capture pointer for smooth tracking
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [x, y]);

  const handleResizePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    initialSizeRef.current = { width, height };
    
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [width, height]);

  const getEffectiveScale = useCallback(() => {
    const el = imageRef.current?.closest('[id="document-preview"]') as HTMLElement | null;
    if (el) {
      const rect = el.getBoundingClientRect();
      const logicalWidth = el.offsetWidth;
      if (logicalWidth > 0) return rect.width / logicalWidth;
    }
    return zoomScaleRef.current || 1;
  }, [zoomScaleRef]);

  // Handle pointer move - adjusted for zoom scale
  const handlePointerMove = useCallback((e: PointerEvent) => {
    e.preventDefault();
    const scale = getEffectiveScale();
    
    if (isDragging) {
      const deltaX = (e.clientX - dragStartRef.current.x) / scale;
      const deltaY = (e.clientY - dragStartRef.current.y) / scale;
      
      const newX = initialPosRef.current.x + deltaX;
      const newY = initialPosRef.current.y + deltaY;
      
      onPositionChange(id, Math.max(0, newX), Math.max(0, newY));
    } else if (isResizing) {
      const deltaX = (e.clientX - dragStartRef.current.x) / scale;
      const deltaY = (e.clientY - dragStartRef.current.y) / scale;
      
      const newWidth = Math.max(50, initialSizeRef.current.width + deltaX);
      const newHeight = Math.max(50, initialSizeRef.current.height + deltaY);
      
      onSizeChange(id, newWidth, newHeight);
    }
  }, [isDragging, isResizing, id, width, height, onPositionChange, onSizeChange, getEffectiveScale]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  // Prevent touch scroll during drag
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (isDragging || isResizing) {
      e.preventDefault();
    }
  }, [isDragging, isResizing]);

  useEffect(() => {
    if (isDragging || isResizing) {
      // Add listeners with { passive: false } to allow preventDefault on touch
      document.addEventListener('pointermove', handlePointerMove, { passive: false });
      document.addEventListener('pointerup', handlePointerUp);
      document.addEventListener('pointercancel', handlePointerUp);
      document.addEventListener('touchmove', handleTouchStart as any, { passive: false });
    }

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerUp);
      document.removeEventListener('touchmove', handleTouchStart as any);
    };
  }, [isDragging, isResizing, handlePointerMove, handlePointerUp, handleTouchStart]);

  return (
    <div
      ref={imageRef}
      className={`absolute group select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} ${isResizing ? 'cursor-nwse-resize' : ''}`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        zIndex: isHovered || isDragging || isResizing ? 100 : 50,
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        transform: 'translate3d(0, 0, 0)', // GPU acceleration for smooth mobile rendering
      }}
      onPointerDown={handlePointerDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
    >
      <div className="relative w-full h-full">
        {/* Image */}
        <img
          src={src}
          alt="Document"
          className="w-full h-full object-contain pointer-events-none"
          draggable={false}
        />

        {/* Controls - always visible on mobile, hover on desktop */}
        {(isHovered || isDragging || isResizing) && (
          <>
            {/* Move handle */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-background border rounded px-2 py-1 flex items-center gap-2 shadow-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity pointer-events-none">
              <Move className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Drag to move</span>
            </div>

            {/* Remove button */}
            <Button
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 h-7 w-7 p-0 rounded-full shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(id);
              }}
            >
              <X className="h-3 w-3" />
            </Button>

            {/* Resize handle - larger touch target */}
            <div
              className="absolute -bottom-2 -right-2 w-12 h-12 bg-primary rounded-full cursor-nwse-resize shadow-lg flex items-center justify-center select-none"
              style={{ touchAction: 'none' }}
              onPointerDown={handleResizePointerDown}
            >
              <div className="w-4 h-4 bg-background rounded-full pointer-events-none" />
            </div>
          </>
        )}

        {/* Active state indicator */}
        {(isDragging || isResizing) && (
          <div className="absolute inset-0 border-2 border-primary rounded pointer-events-none" />
        )}
      </div>
    </div>
  );
}
