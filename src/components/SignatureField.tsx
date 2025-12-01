import { useState, useEffect } from "react";
import { X, GripVertical, FileSignature, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SignatureFieldProps {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  signed: boolean;
  onPositionChange: (id: string, x: number, y: number) => void;
  onSizeChange: (id: string, width: number, height: number) => void;
  onRemove: (id: string) => void;
  onSign?: (id: string) => void;
}

export function SignatureField({
  id,
  x,
  y,
  width,
  height,
  signed,
  onPositionChange,
  onSizeChange,
  onRemove,
  onSign,
}: SignatureFieldProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('resize-handle')) {
      setIsResizing(true);
      setResizeStart({ x: e.clientX, y: e.clientY, width, height });
    } else {
      setIsDragging(true);
      setDragStart({ x: e.clientX - x, y: e.clientY - y });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      onPositionChange(id, Math.max(0, newX), Math.max(0, newY));
    } else if (isResizing) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      const newWidth = Math.max(150, resizeStart.width + deltaX);
      const newHeight = Math.max(60, resizeStart.height + deltaY);
      onSizeChange(id, newWidth, newHeight);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing]);

  return (
    <div
      className={`absolute border-2 ${
        signed 
          ? 'border-green-500 bg-green-50' 
          : 'border-primary bg-primary/5'
      } rounded-lg shadow-lg ${isDragging || isResizing ? 'cursor-move' : ''} group`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        if (!signed && onSign && !(e.target as HTMLElement).classList.contains('resize-handle')) {
          e.stopPropagation();
          onSign(id);
        }
      }}
    >
      <div className="h-full flex flex-col items-center justify-center p-3 pointer-events-none">
        {signed ? (
          <div className="text-center">
            <Check className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-green-700">Signed</p>
            <p className="text-xs text-green-600">
              {new Date().toLocaleDateString()}
            </p>
          </div>
        ) : (
          <div className="text-center">
            <FileSignature className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-xs font-semibold text-primary">Signature Required</p>
            <p className="text-xs text-muted-foreground">Click to sign</p>
          </div>
        )}
      </div>

      {/* Drag Handle */}
      <div className="absolute top-0 left-0 right-0 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-primary/10 rounded-t-lg cursor-move">
        <GripVertical className="h-4 w-4 text-primary" />
      </div>

      {/* Remove Button */}
      <Button
        variant="destructive"
        size="icon"
        className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(id);
        }}
      >
        <X className="h-3 w-3" />
      </Button>

      {/* Resize Handle */}
      <div
        className="resize-handle absolute bottom-0 right-0 w-4 h-4 bg-primary cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
        }}
      />
    </div>
  );
}
