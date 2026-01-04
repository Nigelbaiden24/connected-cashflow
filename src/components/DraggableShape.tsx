import { useState, useEffect, useRef, useCallback } from "react";
import { Trash2, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DraggableShapeProps {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  onPositionChange: (id: string, x: number, y: number) => void;
  onSizeChange: (id: string, width: number, height: number) => void;
  onRemove: (id: string) => void;
  onColorChange?: (id: string, color: string) => void;
}

export function DraggableShape({
  id,
  type,
  x,
  y,
  width,
  height,
  color,
  onPositionChange,
  onSizeChange,
  onRemove,
  onColorChange,
}: DraggableShapeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [localColor, setLocalColor] = useState(color);
  const shapeRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const initialPosRef = useRef({ x: 0, y: 0 });
  const initialSizeRef = useRef({ width: 0, height: 0 });

  useEffect(() => {
    setLocalColor(color);
  }, [color]);

  // Unified pointer handler for mouse and touch - full XY movement
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if ((e.target as HTMLElement).closest('button')) return;
    if ((e.target as HTMLElement).closest('[data-no-drag="true"]')) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    initialPosRef.current = { x, y };
    
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

  // Handle pointer move - full XY axis movement
  const handlePointerMove = useCallback((e: PointerEvent) => {
    e.preventDefault();
    
    if (isDragging) {
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      
      const newX = initialPosRef.current.x + deltaX;
      const newY = initialPosRef.current.y + deltaY;
      
      onPositionChange(id, Math.max(0, newX), Math.max(0, newY));
    } else if (isResizing) {
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      
      const newWidth = Math.max(50, initialSizeRef.current.width + deltaX);
      const newHeight = Math.max(50, initialSizeRef.current.height + deltaY);
      
      onSizeChange(id, newWidth, newHeight);
    }
  }, [isDragging, isResizing, id, onPositionChange, onSizeChange]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  // Prevent touch scroll during drag
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isDragging || isResizing) {
      e.preventDefault();
    }
  }, [isDragging, isResizing]);

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('pointermove', handlePointerMove, { passive: false });
      document.addEventListener('pointerup', handlePointerUp);
      document.addEventListener('pointercancel', handlePointerUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
    }

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerUp);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isDragging, isResizing, handlePointerMove, handlePointerUp, handleTouchMove]);

  const renderShape = () => {
    const svgProps = {
      width: width,
      height: height,
      viewBox: `0 0 ${width} ${height}`,
      style: { display: 'block', pointerEvents: 'none' as const }
    };

    switch (type) {
      case 'rectangle':
        return (
          <svg {...svgProps}>
            <rect x="2" y="2" width={width - 4} height={height - 4} fill={localColor} stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case 'circle':
        return (
          <svg {...svgProps}>
            <ellipse cx={width / 2} cy={height / 2} rx={width / 2 - 2} ry={height / 2 - 2} fill={localColor} stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case 'triangle':
        return (
          <svg {...svgProps}>
            <polygon points={`${width / 2},2 ${width - 2},${height - 2} 2,${height - 2}`} fill={localColor} stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case 'star':
        const cx = width / 2;
        const cy = height / 2;
        const outerRadius = Math.min(width, height) / 2 - 2;
        const innerRadius = outerRadius * 0.4;
        const points = [];
        for (let i = 0; i < 5; i++) {
          const outerAngle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
          const innerAngle = ((i * 4 + 2) * Math.PI) / 5 - Math.PI / 2;
          points.push(`${cx + outerRadius * Math.cos(outerAngle)},${cy + outerRadius * Math.sin(outerAngle)}`);
          points.push(`${cx + innerRadius * Math.cos(innerAngle)},${cy + innerRadius * Math.sin(innerAngle)}`);
        }
        return (
          <svg {...svgProps}>
            <polygon points={points.join(' ')} fill={localColor} stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case 'arrow':
        return (
          <svg {...svgProps}>
            <path d={`M 10 ${height / 2} L ${width - 30} ${height / 2} M ${width - 30} 10 L ${width - 5} ${height / 2} L ${width - 30} ${height - 10}`} 
                  fill="none" stroke={localColor} strokeWidth="3" />
          </svg>
        );
      case 'diamond':
        return (
          <svg {...svgProps}>
            <polygon points={`${width / 2},2 ${width - 2},${height / 2} ${width / 2},${height - 2} 2,${height / 2}`} 
                     fill={localColor} stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case 'line':
        return (
          <svg {...svgProps}>
            <line x1="5" y1="5" x2={width - 5} y2={height - 5} stroke={localColor} strokeWidth="3" strokeLinecap="round" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={shapeRef}
      className="absolute cursor-move group select-none"
      style={{
        left: x,
        top: y,
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        transform: 'translate3d(0, 0, 0)',
        zIndex: isHovered || isDragging || isResizing ? 100 : 50,
      }}
      onPointerDown={handlePointerDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
    >
      {renderShape()}
      
      {/* Controls - always visible on mobile */}
      {(isHovered || isDragging || isResizing) && (
        <>
          <div className="absolute -top-12 left-0 flex gap-1 bg-background border rounded-md p-1 shadow-lg" data-no-drag="true">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Palette className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64" onClick={(e) => e.stopPropagation()}>
                <div className="space-y-2">
                  <Label>Shape Color</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="color"
                      value={localColor}
                      onChange={(e) => {
                        setLocalColor(e.target.value);
                        onColorChange?.(id, e.target.value);
                      }}
                      className="w-12 h-8 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={localColor}
                      onChange={(e) => {
                        setLocalColor(e.target.value);
                        onColorChange?.(id, e.target.value);
                      }}
                      className="flex-1"
                      placeholder="#000000"
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            <Button
              variant="destructive"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Resize handle - larger for touch */}
          <div
            className="absolute -bottom-2 -right-2 h-12 w-12 bg-primary cursor-se-resize rounded-full border-2 border-background flex items-center justify-center select-none"
            style={{ touchAction: 'none' }}
            onPointerDown={handleResizePointerDown}
          >
            <div className="w-4 h-4 bg-background rounded-full pointer-events-none" />
          </div>
        </>
      )}
    </div>
  );
}
