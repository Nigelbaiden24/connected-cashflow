import { useState, useRef, useEffect } from "react";
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
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  // Unified pointer handlers for mouse and touch
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if ((e.target as HTMLElement).closest('button')) return;
    e.preventDefault();
    e.stopPropagation();
    
    const rect = imageRef.current?.parentElement?.getBoundingClientRect();
    if (!rect) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - x,
      y: e.clientY - y
    });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleResizePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY
    });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  // Legacy mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    if ((e.target as HTMLElement).closest('button')) return; // Don't drag when clicking buttons
    e.preventDefault();
    e.stopPropagation();
    
    const rect = imageRef.current?.parentElement?.getBoundingClientRect();
    if (!rect) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - x,
      y: e.clientY - y
    });
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY
    });
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (isDragging) {
        e.preventDefault();
        const rect = imageRef.current?.parentElement?.getBoundingClientRect();
        if (!rect) return;
        
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        
        // Keep within parent bounds
        const maxX = rect.width - width;
        const maxY = rect.height - height;
        
        onPositionChange(
          id, 
          Math.max(0, Math.min(maxX, newX)), 
          Math.max(0, Math.min(maxY, newY))
        );
      } else if (isResizing) {
        e.preventDefault();
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        const newWidth = Math.max(50, width + deltaX);
        const newHeight = Math.max(50, height + deltaY);
        onSizeChange(id, newWidth, newHeight);
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        const rect = imageRef.current?.parentElement?.getBoundingClientRect();
        if (!rect) return;
        
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        
        // Keep within parent bounds
        const maxX = rect.width - width;
        const maxY = rect.height - height;
        
        onPositionChange(
          id, 
          Math.max(0, Math.min(maxX, newX)), 
          Math.max(0, Math.min(maxY, newY))
        );
      } else if (isResizing) {
        e.preventDefault();
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        const newWidth = Math.max(50, width + deltaX);
        const newHeight = Math.max(50, height + deltaY);
        onSizeChange(id, newWidth, newHeight);
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
      document.addEventListener('pointercancel', handlePointerUp);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerUp);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, id, x, y, width, height, onPositionChange, onSizeChange]);

  return (
    <div
      ref={imageRef}
      className={`absolute group ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} ${isResizing ? 'cursor-nwse-resize' : ''} touch-none`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        zIndex: isHovered || isDragging || isResizing ? 100 : 50,
        userSelect: 'none'
      }}
      onPointerDown={handlePointerDown}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
    >
      <div className="relative w-full h-full">
        {/* Image */}
        <img
          src={src}
          alt="Document"
          className="w-full h-full object-contain"
          draggable={false}
        />

        {/* Controls - visible on hover */}
        {isHovered && !isDragging && !isResizing && (
          <>
            {/* Move handle */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-background border rounded px-2 py-1 flex items-center gap-2 shadow-lg">
              <Move className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Drag to move</span>
            </div>

            {/* Remove button */}
            <Button
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(id);
              }}
            >
              <X className="h-3 w-3" />
            </Button>

            {/* Resize handle */}
            <div
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full cursor-nwse-resize shadow-lg flex items-center justify-center touch-none"
              onPointerDown={handleResizePointerDown}
              onMouseDown={handleResizeMouseDown}
            >
              <div className="w-3 h-3 bg-background rounded-full" />
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
