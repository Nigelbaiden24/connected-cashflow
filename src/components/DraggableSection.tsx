import { useState, useRef, useEffect } from "react";
import { Edit2, Trash2, Wand2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DraggableSectionProps {
  id: string;
  title: string;
  content: string;
  type?: string;
  placeholder?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isFirst: boolean;
  textColor?: string;
  onPositionChange: (id: string, x: number, y: number) => void;
  onSizeChange: (id: string, width: number, height: number) => void;
  onEdit: () => void;
  onDelete: () => void;
  onGenerateContent: () => void;
}

export function DraggableSection({
  id,
  title,
  content,
  type,
  placeholder,
  x,
  y,
  width,
  height,
  isFirst,
  textColor = "#000000",
  onPositionChange,
  onSizeChange,
  onEdit,
  onDelete,
  onGenerateContent,
}: DraggableSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('button')) return;
    e.preventDefault();
    e.stopPropagation();
    
    const rect = sectionRef.current?.parentElement?.getBoundingClientRect();
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
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        const rect = sectionRef.current?.parentElement?.getBoundingClientRect();
        if (!rect) return;
        
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        
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
        const newWidth = Math.max(200, width + deltaX);
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

  const renderContent = () => {
    if (type === "heading" || type === "subheading") {
      return (
        <h2 className="text-2xl font-bold mb-4" style={{ color: textColor }}>
          {content || title}
        </h2>
      );
    }
    if (type === "body") {
      return (
        <div className="prose max-w-none">
          <p className="whitespace-pre-wrap" style={{ color: textColor }}>
            {content || placeholder || "Add content..."}
          </p>
        </div>
      );
    }
    if (type === "list") {
      const items = content ? content.split("\n").filter(Boolean) : [];
      return (
        <ul className="list-disc list-inside space-y-2">
          {items.map((item, idx) => (
            <li key={idx} className="text-foreground/80">
              {item.replace(/^[ -•]\s*/, "")}
            </li>
          ))}
        </ul>
      );
    }
    if (type === "table") {
      return (
        <div className="max-w-full overflow-x-auto">
          <div
            className="min-w-full text-sm text-foreground/90"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      );
    }
    return null;
  };

  return (
    <div
      ref={sectionRef}
      className={`absolute group ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} ${isResizing ? 'cursor-nwse-resize' : ''}`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        minHeight: `${height}px`,
        zIndex: isHovered || isDragging || isResizing ? 100 : 50,
        userSelect: 'none'
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full h-full p-4 rounded-lg border-2 border-transparent hover:border-primary/20 transition-all bg-background/50">
        {/* Drag Handle */}
        {(isHovered || isDragging) && !isResizing && (
          <div className="absolute -left-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="h-5 w-5 text-primary cursor-grab" />
          </div>
        )}

        {/* Content */}
        <div className="w-full">{renderContent()}</div>

        {/* Action Buttons */}
        {isHovered && !isDragging && !isResizing && (
          <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 rounded-md p-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={onGenerateContent}
              className="h-8 w-8 p-0"
              title="Generate with AI"
            >
              <Wand2 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onEdit}
              className="h-8 w-8 p-0"
              title="Edit section"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            {!isFirst && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onDelete}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                title="Delete section"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Resize Handle */}
        {(isHovered || isResizing) && !isDragging && (
          <div
            className="absolute bottom-0 right-0 w-4 h-4 bg-primary/50 cursor-nwse-resize"
            onMouseDown={handleResizeMouseDown}
            style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}
          />
        )}

        {/* Visual Indicator when dragging or resizing */}
        {(isDragging || isResizing) && (
          <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none" />
        )}
      </div>
    </div>
  );
}
