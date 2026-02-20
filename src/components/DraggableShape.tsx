import { useState, useEffect, useRef, useCallback } from "react";
import { useZoomScaleRef } from "@/contexts/ZoomScaleContext";
import { Trash2, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type ShapeType = 
  | 'rectangle' | 'circle' | 'triangle' | 'star' | 'arrow' | 'diamond' | 'line'
  | 'pentagon' | 'hexagon' | 'octagon' | 'heart' | 'cross' | 'plus' | 'minus'
  | 'cloud' | 'speechBubble' | 'banner' | 'parallelogram' | 'trapezoid'
  | 'crescent' | 'lightning' | 'checkmark' | 'xmark' | 'curvedArrow'
  | 'arrowUp' | 'arrowDown' | 'arrowLeft' | 'doubleArrow' | 'chevronRight'
  | 'chevronLeft' | 'chevronUp' | 'chevronDown' | 'bracket' | 'brace'
  | 'roundedRect' | 'pill' | 'callout' | 'explosion' | 'sun' | 'moon';

interface DraggableShapeProps {
  id: string;
  type: ShapeType | string;
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
  const zoomScaleRef = useZoomScaleRef();

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

  const getEffectiveScale = useCallback(() => {
    const el = shapeRef.current?.closest('[id="document-preview"]') as HTMLElement | null;
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
  }, [isDragging, isResizing, id, onPositionChange, onSizeChange, getEffectiveScale]);

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

    const cx = width / 2;
    const cy = height / 2;

    switch (type) {
      case 'rectangle':
        return (
          <svg {...svgProps}>
            <rect x="2" y="2" width={width - 4} height={height - 4} fill={localColor} stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case 'roundedRect':
        return (
          <svg {...svgProps}>
            <rect x="2" y="2" width={width - 4} height={height - 4} rx="12" ry="12" fill={localColor} stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case 'pill':
        return (
          <svg {...svgProps}>
            <rect x="2" y="2" width={width - 4} height={height - 4} rx={height / 2} ry={height / 2} fill={localColor} stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case 'circle':
        return (
          <svg {...svgProps}>
            <ellipse cx={cx} cy={cy} rx={cx - 2} ry={cy - 2} fill={localColor} stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case 'triangle':
        return (
          <svg {...svgProps}>
            <polygon points={`${cx},2 ${width - 2},${height - 2} 2,${height - 2}`} fill={localColor} stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case 'pentagon':
        const pentPoints = Array.from({ length: 5 }, (_, i) => {
          const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
          return `${cx + (cx - 4) * Math.cos(angle)},${cy + (cy - 4) * Math.sin(angle)}`;
        }).join(' ');
        return (
          <svg {...svgProps}>
            <polygon points={pentPoints} fill={localColor} stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case 'hexagon':
        const hexPoints = Array.from({ length: 6 }, (_, i) => {
          const angle = (i * Math.PI) / 3;
          return `${cx + (cx - 4) * Math.cos(angle)},${cy + (cy - 4) * Math.sin(angle)}`;
        }).join(' ');
        return (
          <svg {...svgProps}>
            <polygon points={hexPoints} fill={localColor} stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case 'octagon':
        const octPoints = Array.from({ length: 8 }, (_, i) => {
          const angle = (i * Math.PI) / 4 + Math.PI / 8;
          return `${cx + (cx - 4) * Math.cos(angle)},${cy + (cy - 4) * Math.sin(angle)}`;
        }).join(' ');
        return (
          <svg {...svgProps}>
            <polygon points={octPoints} fill={localColor} stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case 'star':
        const outerRadius = Math.min(width, height) / 2 - 2;
        const innerRadius = outerRadius * 0.4;
        const starPoints = [];
        for (let i = 0; i < 5; i++) {
          const outerAngle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
          const innerAngle = ((i * 4 + 2) * Math.PI) / 5 - Math.PI / 2;
          starPoints.push(`${cx + outerRadius * Math.cos(outerAngle)},${cy + outerRadius * Math.sin(outerAngle)}`);
          starPoints.push(`${cx + innerRadius * Math.cos(innerAngle)},${cy + innerRadius * Math.sin(innerAngle)}`);
        }
        return (
          <svg {...svgProps}>
            <polygon points={starPoints.join(' ')} fill={localColor} stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case 'heart':
        return (
          <svg {...svgProps}>
            <path d={`M ${cx} ${height * 0.85} C ${width * 0.2} ${height * 0.6} 2 ${height * 0.35} 2 ${height * 0.25} C 2 ${height * 0.1} ${width * 0.15} 2 ${cx} ${height * 0.2} C ${width * 0.85} 2 ${width - 2} ${height * 0.1} ${width - 2} ${height * 0.25} C ${width - 2} ${height * 0.35} ${width * 0.8} ${height * 0.6} ${cx} ${height * 0.85} Z`} fill={localColor} stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case 'cross':
      case 'plus':
        const crossW = width * 0.3;
        const crossH = height * 0.3;
        return (
          <svg {...svgProps}>
            <polygon points={`${cx - crossW},2 ${cx + crossW},2 ${cx + crossW},${cy - crossH} ${width - 2},${cy - crossH} ${width - 2},${cy + crossH} ${cx + crossW},${cy + crossH} ${cx + crossW},${height - 2} ${cx - crossW},${height - 2} ${cx - crossW},${cy + crossH} 2,${cy + crossH} 2,${cy - crossH} ${cx - crossW},${cy - crossH}`} fill={localColor} stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case 'minus':
        return (
          <svg {...svgProps}>
            <rect x="4" y={cy - height * 0.15} width={width - 8} height={height * 0.3} fill={localColor} stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case 'arrow':
        return (
          <svg {...svgProps}>
            <path d={`M 10 ${cy} L ${width - 30} ${cy} M ${width - 30} 10 L ${width - 5} ${cy} L ${width - 30} ${height - 10}`} fill="none" stroke={localColor} strokeWidth="3" />
          </svg>
        );
      case 'arrowUp':
        return (
          <svg {...svgProps}>
            <polygon points={`${cx},2 ${width - 4},${height * 0.45} ${cx + width * 0.15},${height * 0.45} ${cx + width * 0.15},${height - 2} ${cx - width * 0.15},${height - 2} ${cx - width * 0.15},${height * 0.45} 4,${height * 0.45}`} fill={localColor} stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case 'arrowDown':
        return (
          <svg {...svgProps}>
            <polygon points={`${cx},${height - 2} ${width - 4},${height * 0.55} ${cx + width * 0.15},${height * 0.55} ${cx + width * 0.15},2 ${cx - width * 0.15},2 ${cx - width * 0.15},${height * 0.55} 4,${height * 0.55}`} fill={localColor} stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case 'arrowLeft':
        return (
          <svg {...svgProps}>
            <polygon points={`2,${cy} ${width * 0.45},4 ${width * 0.45},${cy - height * 0.15} ${width - 2},${cy - height * 0.15} ${width - 2},${cy + height * 0.15} ${width * 0.45},${cy + height * 0.15} ${width * 0.45},${height - 4}`} fill={localColor} stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case 'doubleArrow':
        return (
          <svg {...svgProps}>
            <polygon points={`2,${cy} ${width * 0.25},${height * 0.2} ${width * 0.25},${height * 0.4} ${width * 0.75},${height * 0.4} ${width * 0.75},${height * 0.2} ${width - 2},${cy} ${width * 0.75},${height * 0.8} ${width * 0.75},${height * 0.6} ${width * 0.25},${height * 0.6} ${width * 0.25},${height * 0.8}`} fill={localColor} stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case 'diamond':
        return (
          <svg {...svgProps}>
            <polygon points={`${cx},2 ${width - 2},${cy} ${cx},${height - 2} 2,${cy}`} fill={localColor} stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case 'parallelogram':
        return (
          <svg {...svgProps}>
            <polygon points={`${width * 0.2},2 ${width - 2},2 ${width * 0.8},${height - 2} 2,${height - 2}`} fill={localColor} stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case 'trapezoid':
        return (
          <svg {...svgProps}>
            <polygon points={`${width * 0.2},2 ${width * 0.8},2 ${width - 2},${height - 2} 2,${height - 2}`} fill={localColor} stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case 'cloud':
        return (
          <svg {...svgProps}>
            <path d={`M ${width * 0.25} ${height * 0.7} C ${width * 0.1} ${height * 0.7} 4 ${height * 0.55} 4 ${height * 0.45} C 4 ${height * 0.3} ${width * 0.15} ${height * 0.2} ${width * 0.3} ${height * 0.25} C ${width * 0.35} ${height * 0.1} ${width * 0.5} 4 ${width * 0.65} ${height * 0.15} C ${width * 0.8} 4 ${width - 4} ${height * 0.15} ${width - 4} ${height * 0.35} C ${width - 4} ${height * 0.55} ${width * 0.9} ${height * 0.7} ${width * 0.75} ${height * 0.7} Z`} fill={localColor} stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case 'speechBubble':
      case 'callout':
        return (
          <svg {...svgProps}>
            <path d={`M 8 8 H ${width - 8} Q ${width - 4} 8 ${width - 4} 12 V ${height * 0.65} Q ${width - 4} ${height * 0.7} ${width - 8} ${height * 0.7} H ${width * 0.4} L ${width * 0.2} ${height - 4} V ${height * 0.7} H 8 Q 4 ${height * 0.7} 4 ${height * 0.65} V 12 Q 4 8 8 8 Z`} fill={localColor} stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case 'lightning':
        return (
          <svg {...svgProps}>
            <polygon points={`${width * 0.55},2 ${width * 0.25},${height * 0.45} ${width * 0.45},${height * 0.45} ${width * 0.35},${height - 2} ${width * 0.75},${height * 0.5} ${width * 0.55},${height * 0.5}`} fill={localColor} stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case 'checkmark':
        return (
          <svg {...svgProps}>
            <polyline points={`${width * 0.15},${cy} ${width * 0.4},${height * 0.75} ${width * 0.85},${height * 0.25}`} fill="none" stroke={localColor} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'xmark':
        return (
          <svg {...svgProps}>
            <line x1={width * 0.2} y1={height * 0.2} x2={width * 0.8} y2={height * 0.8} stroke={localColor} strokeWidth="6" strokeLinecap="round" />
            <line x1={width * 0.8} y1={height * 0.2} x2={width * 0.2} y2={height * 0.8} stroke={localColor} strokeWidth="6" strokeLinecap="round" />
          </svg>
        );
      case 'chevronRight':
        return (
          <svg {...svgProps}>
            <polyline points={`${width * 0.3},${height * 0.1} ${width * 0.7},${cy} ${width * 0.3},${height * 0.9}`} fill="none" stroke={localColor} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'chevronLeft':
        return (
          <svg {...svgProps}>
            <polyline points={`${width * 0.7},${height * 0.1} ${width * 0.3},${cy} ${width * 0.7},${height * 0.9}`} fill="none" stroke={localColor} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'chevronUp':
        return (
          <svg {...svgProps}>
            <polyline points={`${width * 0.1},${height * 0.7} ${cx},${height * 0.3} ${width * 0.9},${height * 0.7}`} fill="none" stroke={localColor} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'chevronDown':
        return (
          <svg {...svgProps}>
            <polyline points={`${width * 0.1},${height * 0.3} ${cx},${height * 0.7} ${width * 0.9},${height * 0.3}`} fill="none" stroke={localColor} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'line':
        return (
          <svg {...svgProps}>
            <line x1="5" y1="5" x2={width - 5} y2={height - 5} stroke={localColor} strokeWidth="3" strokeLinecap="round" />
          </svg>
        );
      case 'explosion':
        const expPoints = Array.from({ length: 12 }, (_, i) => {
          const angle = (i * Math.PI) / 6;
          const r = i % 2 === 0 ? Math.min(cx, cy) - 4 : Math.min(cx, cy) * 0.5;
          return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
        }).join(' ');
        return (
          <svg {...svgProps}>
            <polygon points={expPoints} fill={localColor} stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case 'sun':
        const sunRays = Array.from({ length: 12 }, (_, i) => {
          const angle = (i * Math.PI) / 6;
          const r1 = Math.min(cx, cy) * 0.45;
          const r2 = Math.min(cx, cy) - 4;
          return `M ${cx + r1 * Math.cos(angle)} ${cy + r1 * Math.sin(angle)} L ${cx + r2 * Math.cos(angle)} ${cy + r2 * Math.sin(angle)}`;
        }).join(' ');
        return (
          <svg {...svgProps}>
            <circle cx={cx} cy={cy} r={Math.min(cx, cy) * 0.35} fill={localColor} stroke="currentColor" strokeWidth="2" />
            <path d={sunRays} stroke={localColor} strokeWidth="3" strokeLinecap="round" />
          </svg>
        );
      case 'moon':
      case 'crescent':
        return (
          <svg {...svgProps}>
            <path d={`M ${cx + Math.min(cx, cy) * 0.3} ${cy - Math.min(cx, cy) * 0.8} A ${Math.min(cx, cy) * 0.9} ${Math.min(cx, cy) * 0.9} 0 1 1 ${cx + Math.min(cx, cy) * 0.3} ${cy + Math.min(cx, cy) * 0.8} A ${Math.min(cx, cy) * 0.65} ${Math.min(cx, cy) * 0.65} 0 0 0 ${cx + Math.min(cx, cy) * 0.3} ${cy - Math.min(cx, cy) * 0.8}`} fill={localColor} stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case 'bracket':
        return (
          <svg {...svgProps}>
            <path d={`M ${width * 0.35} 6 H ${width * 0.2} V ${height - 6} H ${width * 0.35} M ${width * 0.65} 6 H ${width * 0.8} V ${height - 6} H ${width * 0.65}`} fill="none" stroke={localColor} strokeWidth="4" strokeLinecap="round" />
          </svg>
        );
      case 'brace':
        return (
          <svg {...svgProps}>
            <path d={`M ${width * 0.35} 6 Q ${width * 0.2} 6 ${width * 0.2} ${height * 0.25} V ${height * 0.4} Q ${width * 0.2} ${cy} ${width * 0.1} ${cy} Q ${width * 0.2} ${cy} ${width * 0.2} ${height * 0.6} V ${height * 0.75} Q ${width * 0.2} ${height - 6} ${width * 0.35} ${height - 6} M ${width * 0.65} 6 Q ${width * 0.8} 6 ${width * 0.8} ${height * 0.25} V ${height * 0.4} Q ${width * 0.8} ${cy} ${width * 0.9} ${cy} Q ${width * 0.8} ${cy} ${width * 0.8} ${height * 0.6} V ${height * 0.75} Q ${width * 0.8} ${height - 6} ${width * 0.65} ${height - 6}`} fill="none" stroke={localColor} strokeWidth="3" />
          </svg>
        );
      case 'curvedArrow':
        return (
          <svg {...svgProps}>
            <path d={`M ${width * 0.15} ${height * 0.7} Q ${width * 0.1} ${height * 0.2} ${cx} ${height * 0.2} L ${cx} ${height * 0.05} L ${width * 0.75} ${height * 0.25} L ${cx} ${height * 0.45} V ${height * 0.3} Q ${width * 0.25} ${height * 0.3} ${width * 0.25} ${height * 0.7} Z`} fill={localColor} stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case 'banner':
        return (
          <svg {...svgProps}>
            <path d={`M 4 ${height * 0.2} H ${width - 4} V ${height * 0.8} H 4 Z M 4 ${height * 0.2} L ${width * 0.1} 4 L ${width * 0.2} ${height * 0.2} M ${width * 0.8} ${height * 0.2} L ${width * 0.9} 4 L ${width - 4} ${height * 0.2} M 4 ${height * 0.8} L ${width * 0.1} ${height - 4} L ${width * 0.2} ${height * 0.8} M ${width * 0.8} ${height * 0.8} L ${width * 0.9} ${height - 4} L ${width - 4} ${height * 0.8}`} fill={localColor} stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      default:
        return (
          <svg {...svgProps}>
            <rect x="2" y="2" width={width - 4} height={height - 4} fill={localColor} stroke="currentColor" strokeWidth="2" />
          </svg>
        );
    }
  };

  return (
    <div
      data-draggable="true"
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
              <PopoverContent className="w-72" onClick={(e) => e.stopPropagation()}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Color</Label>
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
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Dimensions</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Width (px)</Label>
                        <Input
                          type="number"
                          min="20"
                          max="800"
                          value={width}
                          onChange={(e) => {
                            const newWidth = Math.max(20, Math.min(800, Number(e.target.value)));
                            onSizeChange(id, newWidth, height);
                          }}
                          className="h-8"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Height (px)</Label>
                        <Input
                          type="number"
                          min="20"
                          max="800"
                          value={height}
                          onChange={(e) => {
                            const newHeight = Math.max(20, Math.min(800, Number(e.target.value)));
                            onSizeChange(id, width, newHeight);
                          }}
                          className="h-8"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => {
                        const maxDim = Math.max(width, height);
                        onSizeChange(id, maxDim, maxDim);
                      }}
                    >
                      Make Square
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => {
                        onSizeChange(id, width * 2, height);
                      }}
                    >
                      Double Width
                    </Button>
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
