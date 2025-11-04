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

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    e.preventDefault();
    e.stopPropagation();
    
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
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        onPositionChange(id, Math.max(0, newX), Math.max(0, newY));
      } else if (isResizing) {
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
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, id, x, y, width, height, onPositionChange, onSizeChange]);

  return (
    <div
      ref={imageRef}
      className={`absolute group ${isDragging || isResizing ? 'cursor-move' : ''}`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        zIndex: 50
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full h-full">
        {/* Image */}
        <img
          src={src}
          alt="Document"
          className="w-full h-full object-contain border-2 border-dashed border-primary/50 rounded"
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
              className="absolute -bottom-2 -right-2 w-6 h-6 bg-primary rounded-full cursor-nwse-resize shadow-lg flex items-center justify-center"
              onMouseDown={handleResizeMouseDown}
            >
              <div className="w-2 h-2 bg-background rounded-full" />
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
