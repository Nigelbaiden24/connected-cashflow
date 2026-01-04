import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Edit2, Trash2, Wand2, GripVertical, Palette, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EnterpriseChart, LegacyChartConfig } from "./EnterpriseChart";

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
  fontFamily?: string;
  fontSize?: number;
  onPositionChange: (id: string, x: number, y: number) => void;
  onSizeChange: (id: string, width: number, height: number) => void;
  onEdit: () => void;
  onDelete: () => void;
  onGenerateContent: () => void;
  onContentChange?: (id: string, content: string) => void;
  onStyleChange?: (id: string, style: { fontFamily?: string; fontSize?: number; textColor?: string }) => void;
}

const defaultColors = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", 
  "#06b6d4", "#ec4899", "#84cc16", "#f97316", "#6366f1"
];

const headerColorPresets = [
  "#f3f4f6", "#e5e7eb", "#3b82f6", "#10b981", "#f59e0b", 
  "#ef4444", "#8b5cf6", "#1e293b", "#0f172a", "#fef3c7"
];

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
  fontFamily = "Inter",
  fontSize = 14,
  onPositionChange,
  onSizeChange,
  onEdit,
  onDelete,
  onGenerateContent,
  onContentChange,
  onStyleChange,
}: DraggableSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [cellValue, setCellValue] = useState("");
  const [tableHeaderColor, setTableHeaderColor] = useState("#f3f4f6");
  const [showHeaderColorPicker, setShowHeaderColorPicker] = useState(false);
  const [showChartEditor, setShowChartEditor] = useState(false);
  const [chartData, setChartData] = useState("");
  const [chartTitle, setChartTitle] = useState("");
  const [showStylePopover, setShowStylePopover] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const cellInputRef = useRef<HTMLInputElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const initialPosRef = useRef({ x: 0, y: 0 });
  const initialSizeRef = useRef({ width: 0, height: 0 });

  const fonts = [
    "Inter", "Arial", "Times New Roman", "Georgia", "Verdana", 
    "Helvetica", "Courier New", "Playfair Display", "Roboto", 
    "Open Sans", "Lato", "Montserrat"
  ];
  const fontSizes = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48];

  const parsedChartConfig = useMemo<LegacyChartConfig | null>(() => {
    if (type !== "chart") return null;

    // New format: JSON
    try {
      const parsed = JSON.parse(content);
      if (parsed?.type && Array.isArray(parsed?.data)) {
        return {
          type: parsed.type,
          title: parsed.title || "Chart",
          data: parsed.data.map((d: any, idx: number) => ({
            label: String(d?.label ?? `Item ${idx + 1}`),
            value: Number(d?.value ?? 0),
            color: String(d?.color ?? defaultColors[idx % defaultColors.length]),
          })),
          showGrid: parsed.showGrid,
          showLegend: parsed.showLegend,
          gradientEnabled: parsed.gradientEnabled,
          animationDuration: parsed.animationDuration,
          width: parsed.width,
          height: parsed.height,
          xAxisLabel: parsed.xAxisLabel,
          yAxisLabel: parsed.yAxisLabel,
          valuePrefix: parsed.valuePrefix,
          valueSuffix: parsed.valueSuffix,
          showValues: parsed.showValues,
        } as LegacyChartConfig;
      }
    } catch {
      // fall through to legacy parsing
    }

    // Legacy SVG parsing
    const titleMatch = content.match(/<text[^>]*class="[^"]*chart-title[^"]*"[^>]*>([^<]+)<\/text>/);
    const dataMatches = content.matchAll(/data-label="([^"]+)"\s+data-value="([^"]+)"/g);

    const parsedTitle = titleMatch?.[1] || "Chart";

    const items: { label: string; value: number; color: string }[] = [];
    let idx = 0;
    for (const match of dataMatches) {
      items.push({
        label: match[1],
        value: parseFloat(match[2]),
        color: defaultColors[idx % defaultColors.length],
      });
      idx++;
    }

    if (items.length === 0) {
      items.push(
        { label: "Q1", value: 100, color: "#3b82f6" },
        { label: "Q2", value: 150, color: "#10b981" },
        { label: "Q3", value: 120, color: "#f59e0b" },
        { label: "Q4", value: 180, color: "#ef4444" }
      );
    }

    const isPie = content.includes("path") && content.includes("L") && content.includes("A");
    const isBar = content.includes("rect") && !isPie;

    return {
      type: isPie ? "pie" : isBar ? "bar" : "bar",
      title: parsedTitle,
      data: items,
      showGrid: true,
      showLegend: true,
      gradientEnabled: true,
      animationDuration: 1200,
    };
  }, [type, content]);

  // Unified pointer handler for mouse and touch - full XY movement
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    const target = e.target as HTMLElement;
    if (target.closest('[data-no-drag="true"]')) return;
    if (target.closest('button')) return;

    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    initialPosRef.current = { x, y };

    // Capture pointer for smooth tracking outside element
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
      
      // Get parent bounds for constraining
      const rect = sectionRef.current?.parentElement?.getBoundingClientRect();
      if (rect) {
        const maxX = rect.width - width;
        const maxY = rect.height - height;
        onPositionChange(
          id,
          Math.max(0, Math.min(maxX, newX)),
          Math.max(0, Math.min(maxY, newY))
        );
      } else {
        onPositionChange(id, Math.max(0, newX), Math.max(0, newY));
      }
    } else if (isResizing) {
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      
      const newWidth = Math.max(200, initialSizeRef.current.width + deltaX);
      const newHeight = Math.max(50, initialSizeRef.current.height + deltaY);
      
      onSizeChange(id, newWidth, newHeight);
    }
  }, [isDragging, isResizing, id, width, height, onPositionChange, onSizeChange]);

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
      // Add listeners with { passive: false } to allow preventDefault on touch
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

  const renderContent = () => {
    const sectionStyle = { 
      color: textColor, 
      fontFamily: fontFamily,
      fontSize: `${fontSize}px`
    };

    if (type === "heading" || type === "subheading") {
      return (
        <h2 className="font-bold mb-4" style={sectionStyle}>
          {content || title}
        </h2>
      );
    }
    if (type === "body") {
      return (
        <div className="prose max-w-none">
          <p className="whitespace-pre-wrap" style={sectionStyle}>
            {content || placeholder || "Add content..."}
          </p>
        </div>
      );
    }
    if (type === "list") {
      const items = content ? content.split("\n").filter(Boolean) : [];
      return (
        <ul className="list-disc list-inside space-y-2" style={{ fontFamily, fontSize: `${fontSize}px` }}>
          {items.map((item, idx) => (
            <li key={idx} style={{ color: textColor }}>
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
      
      // Extract current header color from content
      const headerMatch = content.match(/background:\s*([^;]+)/);
      const currentHeaderColor = headerMatch ? headerMatch[1].trim() : tableHeaderColor;
      
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

      const rebuildTableHtml = (data: typeof tableData, headerBg: string) => {
        const headerRow = data.find(r => r.isHeader);
        const bodyRows = data.filter(r => !r.isHeader);
        
        return `
          <table style="width: 100%; border-collapse: collapse; min-width: 480px;">
            <thead>
              <tr style="background: ${headerBg}; border-bottom: 2px solid #e5e7eb;">
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
      };

      const handleCellSave = () => {
        if (editingCell && onContentChange) {
          const newTableData = [...tableData];
          newTableData[editingCell.row].cells[editingCell.col] = cellValue;
          const newHtml = rebuildTableHtml(newTableData, currentHeaderColor);
          onContentChange(id, newHtml);
        }
        setEditingCell(null);
        setCellValue("");
      };

      const handleHeaderColorChange = (color: string) => {
        setTableHeaderColor(color);
        if (onContentChange) {
          const newHtml = rebuildTableHtml(tableData, color);
          onContentChange(id, newHtml);
        }
        setShowHeaderColorPicker(false);
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
                <tr key={rowIndex} style={{ background: currentHeaderColor, borderBottom: "2px solid #e5e7eb" }}>
                  {row.cells.map((cell, colIndex) => (
                    <th
                      key={colIndex}
                      style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, fontSize: "13px", cursor: "text", position: "relative" }}
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
                      {colIndex === 0 && (
                        <Popover open={showHeaderColorPicker} onOpenChange={setShowHeaderColorPicker}>
                          <PopoverTrigger asChild>
                            <button
                              className="absolute -left-6 top-1/2 -translate-y-1/2 p-1 bg-white rounded shadow-md border opacity-0 hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowHeaderColorPicker(true);
                              }}
                              title="Change header color"
                            >
                              <Palette className="h-3 w-3 text-muted-foreground" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-3 z-[200]" onClick={(e) => e.stopPropagation()}>
                            <div className="space-y-2">
                              <Label className="text-xs font-medium">Header Color</Label>
                              <div className="flex flex-wrap gap-1.5 max-w-[180px]">
                                {headerColorPresets.map((color) => (
                                  <button
                                    key={color}
                                    className="w-6 h-6 rounded border-2 transition-all hover:scale-110"
                                    style={{ 
                                      backgroundColor: color,
                                      borderColor: color === currentHeaderColor ? '#3b82f6' : 'transparent'
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleHeaderColorChange(color);
                                    }}
                                  />
                                ))}
                              </div>
                              <Input
                                type="color"
                                value={currentHeaderColor}
                                onChange={(e) => handleHeaderColorChange(e.target.value)}
                                className="w-full h-8 cursor-pointer"
                              />
                            </div>
                          </PopoverContent>
                        </Popover>
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
      const chartConfig = parsedChartConfig || {
        type: "bar",
        title: "Chart",
        data: [
          { label: "Q1", value: 100, color: "#3b82f6" },
          { label: "Q2", value: 150, color: "#10b981" },
          { label: "Q3", value: 120, color: "#f59e0b" },
          { label: "Q4", value: 180, color: "#ef4444" },
        ],
        showGrid: true,
        showLegend: true,
        gradientEnabled: true,
        animationDuration: 1200,
      } as LegacyChartConfig;

      const handleConfigChange = (newConfig: LegacyChartConfig) => {
        if (onContentChange) {
          // Store as JSON for easy parsing later
          onContentChange(id, JSON.stringify(newConfig));
        }
      };

      return (
        <div 
          className="w-full h-full pointer-events-auto" 
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <EnterpriseChart
            config={chartConfig}
            width={width}
            height={height}
            onConfigChange={handleConfigChange}
            onSizeChange={(newWidth, newHeight) => onSizeChange(id, newWidth, newHeight)}
            editable={true}
          />
        </div>
      );
    }
    // Default fallback for any content with HTML
    if (content && (content.includes('<') || content.includes('>'))) {
      return (
        <div
          className="prose max-w-none"
          style={{ color: textColor, fontFamily, fontSize: `${fontSize}px` }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }
    return (
      <div className="prose max-w-none">
        <p className="whitespace-pre-wrap" style={{ color: textColor, fontFamily, fontSize: `${fontSize}px` }}>
          {content || placeholder || title || "Add content..."}
        </p>
      </div>
    );
  };

  return (
    <div
      ref={sectionRef}
      data-section-id={id}
      className={`absolute group select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} ${isResizing ? 'cursor-nwse-resize' : ''}`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        minHeight: `${height}px`,
        zIndex: isHovered || isDragging || isResizing ? 100 : 50,
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        transform: 'translate3d(0, 0, 0)',
      }}
      onPointerDown={handlePointerDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
    >
    <div className="relative w-full h-full p-4 rounded-lg border-2 border-transparent hover:border-primary/20 transition-all bg-background/50">
        {/* Drag Handle - always visible on mobile */}
        {(isHovered || isDragging) && !isResizing && (
          <div className="absolute -left-2 top-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <GripVertical className="h-5 w-5 text-primary cursor-grab" />
          </div>
        )}

        {/* Content */}
        <div className="w-full">{renderContent()}</div>

        {/* Action Buttons - always visible on mobile */}
        {isHovered && !isDragging && !isResizing && (
          <div className="absolute top-2 right-2 flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity bg-background/90 rounded-md p-1 shadow-sm border border-border/50">
            {/* Font Style Button */}
            <Popover open={showStylePopover} onOpenChange={setShowStylePopover}>
              <PopoverTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  title="Font & Size"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Type className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                data-no-drag="true"
                className="w-64 p-3 z-[200] bg-popover border-border shadow-xl" 
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Font Family</Label>
                    <Select
                      value={fontFamily}
                      onValueChange={(value) => onStyleChange?.(id, { fontFamily: value })}
                    >
                      <SelectTrigger className="h-9 text-xs bg-background">
                        <SelectValue placeholder="Select font" />
                      </SelectTrigger>
                      <SelectContent portalled={false} data-no-drag="true" className="bg-popover border-border shadow-xl z-[300]">
                        {fonts.map((font) => (
                          <SelectItem key={font} value={font} style={{ fontFamily: font }} className="text-xs">
                            {font}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Font Size</Label>
                    <Select
                      value={fontSize.toString()}
                      onValueChange={(value) => onStyleChange?.(id, { fontSize: parseInt(value) })}
                    >
                      <SelectTrigger className="h-9 text-xs bg-background">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent portalled={false} data-no-drag="true" className="bg-popover border-border shadow-xl z-[300]">
                        {fontSizes.map((size) => (
                          <SelectItem key={size} value={size.toString()} className="text-xs">
                            {size}px
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Text Color</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="color"
                        value={textColor}
                        onChange={(e) => onStyleChange?.(id, { textColor: e.target.value })}
                        className="w-12 h-9 p-1 cursor-pointer"
                      />
                      <span className="text-xs text-muted-foreground font-mono">{textColor}</span>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

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

        {/* Resize Handle - larger touch target on mobile */}
        {(isHovered || isResizing) && !isDragging && (
          <div
            className="absolute -bottom-2 -right-2 w-12 h-12 bg-primary cursor-nwse-resize rounded-full flex items-center justify-center select-none"
            style={{ touchAction: 'none' }}
            onPointerDown={handleResizePointerDown}
          >
            <div className="w-4 h-4 bg-background rounded-full pointer-events-none" />
          </div>
        )}

        {/* Visual Indicator when dragging or resizing */}
        {(isDragging || isResizing) && (
          <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none" />
        )}
      </div>
    </div>
  );
}
