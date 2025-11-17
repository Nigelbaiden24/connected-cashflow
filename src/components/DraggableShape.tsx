import { useState, useEffect } from "react";
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
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [localColor, setLocalColor] = useState(color);

  useEffect(() => {
    setLocalColor(color);
  }, [color]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = x + (e.clientX - dragStart.x);
        const newY = y + (e.clientY - dragStart.y);
        onPositionChange(id, newX, newY);
        setDragStart({ x: e.clientX, y: e.clientY });
      } else if (isResizing) {
        const newWidth = Math.max(50, width + (e.clientX - dragStart.x));
        const newHeight = Math.max(50, height + (e.clientY - dragStart.y));
        onSizeChange(id, newWidth, newHeight);
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing, x, y, width, height, dragStart, id, onPositionChange, onSizeChange]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const renderShape = () => {
    const svgProps = {
      width: width,
      height: height,
      viewBox: `0 0 ${width} ${height}`,
      style: { display: 'block' }
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
      className="absolute cursor-move group"
      style={{ left: x, top: y }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {renderShape()}
      
      {isHovered && (
        <>
          <div className="absolute -top-10 left-0 flex gap-1 bg-background border rounded-md p-1 shadow-lg">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Palette className="h-3 w-3" />
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
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(id);
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
          
          <div
            className="absolute bottom-0 right-0 h-4 w-4 bg-primary cursor-se-resize rounded-full border-2 border-background"
            onMouseDown={handleResizeMouseDown}
          />
        </>
      )}
    </div>
  );
}
