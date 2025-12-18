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
  onContentChange?: (id: string, content: string) => void;
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
  onContentChange,
}: DraggableSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [cellValue, setCellValue] = useState("");
  const sectionRef = useRef<HTMLDivElement>(null);
  const cellInputRef = useRef<HTMLInputElement>(null);

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
      // Parse table HTML to make cells editable
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, "text/html");
      const table = doc.querySelector("table");
      
      if (!table) {
        return (
          <div className="max-w-full overflow-x-auto">
            <div
              className="min-w-full text-sm text-foreground/90"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        );
      }

      const rows = table.querySelectorAll("tr");
      const tableData: { isHeader: boolean; cells: string[] }[] = [];
      
      rows.forEach((row, rowIndex) => {
        const cells = row.querySelectorAll("th, td");
        const cellTexts: string[] = [];
        cells.forEach((cell) => {
          cellTexts.push(cell.textContent || "");
        });
        tableData.push({
          isHeader: row.parentElement?.tagName === "THEAD" || row.querySelector("th") !== null,
          cells: cellTexts,
        });
      });

      const handleCellClick = (rowIndex: number, colIndex: number, currentValue: string, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setEditingCell({ row: rowIndex, col: colIndex });
        setCellValue(currentValue);
        setTimeout(() => cellInputRef.current?.focus(), 0);
      };

      const handleCellSave = () => {
        if (editingCell && onContentChange) {
          const newTableData = [...tableData];
          newTableData[editingCell.row].cells[editingCell.col] = cellValue;
          
          // Rebuild HTML
          const headerRow = newTableData.find(r => r.isHeader);
          const bodyRows = newTableData.filter(r => !r.isHeader);
          
          const newHtml = `
            <table style="width: 100%; border-collapse: collapse; min-width: 480px;">
              <thead>
                <tr style="background: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
                  ${headerRow?.cells.map(cell => 
                    `<th style="padding: 10px 12px; text-align: left; font-weight: 600; font-size: 13px;">${cell}</th>`
                  ).join("") || ""}
                </tr>
              </thead>
              <tbody>
                ${bodyRows.map(row => 
                  `<tr>${row.cells.map(cell => 
                    `<td style="padding: 8px 12px; font-size: 13px; border-bottom: 1px solid #e5e7eb;">${cell}</td>`
                  ).join("")}</tr>`
                ).join("")}
              </tbody>
            </table>
          `;
          
          onContentChange(id, newHtml);
        }
        setEditingCell(null);
        setCellValue("");
      };

      const handleCellKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
          handleCellSave();
        } else if (e.key === "Escape") {
          setEditingCell(null);
          setCellValue("");
        }
      };

      return (
        <div className="max-w-full overflow-x-auto" onClick={(e) => e.stopPropagation()}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "480px" }}>
            <thead>
              {tableData.filter(r => r.isHeader).map((row, rowIndex) => (
                <tr key={rowIndex} style={{ background: "#f3f4f6", borderBottom: "2px solid #e5e7eb" }}>
                  {row.cells.map((cell, colIndex) => (
                    <th
                      key={colIndex}
                      style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, fontSize: "13px", cursor: "text" }}
                      onClick={(e) => handleCellClick(tableData.indexOf(row), colIndex, cell, e)}
                    >
                      {editingCell?.row === tableData.indexOf(row) && editingCell?.col === colIndex ? (
                        <input
                          ref={cellInputRef}
                          type="text"
                          value={cellValue}
                          onChange={(e) => setCellValue(e.target.value)}
                          onBlur={handleCellSave}
                          onKeyDown={handleCellKeyDown}
                          className="w-full bg-white border border-primary px-1 py-0.5 rounded text-sm font-semibold"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        cell
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {tableData.filter(r => !r.isHeader).map((row, rowIndex) => {
                const actualRowIndex = tableData.indexOf(row);
                return (
                  <tr key={rowIndex}>
                    {row.cells.map((cell, colIndex) => (
                      <td
                        key={colIndex}
                        style={{ padding: "8px 12px", fontSize: "13px", borderBottom: "1px solid #e5e7eb", cursor: "text" }}
                        onClick={(e) => handleCellClick(actualRowIndex, colIndex, cell, e)}
                      >
                        {editingCell?.row === actualRowIndex && editingCell?.col === colIndex ? (
                          <input
                            ref={cellInputRef}
                            type="text"
                            value={cellValue}
                            onChange={(e) => setCellValue(e.target.value)}
                            onBlur={handleCellSave}
                            onKeyDown={handleCellKeyDown}
                            className="w-full bg-white border border-primary px-1 py-0.5 rounded text-sm"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          cell
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }
    if (type === "chart") {
      return (
        <div 
          className="w-full h-full flex items-center justify-center"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }
    // Default fallback for any content with HTML
    if (content && (content.includes('<') || content.includes('>'))) {
      return (
        <div
          className="prose max-w-none"
          style={{ color: textColor }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }
    return (
      <div className="prose max-w-none">
        <p className="whitespace-pre-wrap" style={{ color: textColor }}>
          {content || placeholder || title || "Add content..."}
        </p>
      </div>
    );
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
