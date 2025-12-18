import { useState, useRef, useEffect } from "react";
import { Edit2, Trash2, Wand2, GripVertical, Palette } from "lucide-react";
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
  const [tableHeaderColor, setTableHeaderColor] = useState("#f3f4f6");
  const [showHeaderColorPicker, setShowHeaderColorPicker] = useState(false);
  const [showChartEditor, setShowChartEditor] = useState(false);
  const [chartData, setChartData] = useState("");
  const [chartTitle, setChartTitle] = useState("");
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
      // Parse chart data from SVG content
      const parseChartData = () => {
        const titleMatch = content.match(/<text[^>]*class="[^"]*chart-title[^"]*"[^>]*>([^<]+)<\/text>/);
        const dataMatches = content.matchAll(/data-label="([^"]+)"\s+data-value="([^"]+)"/g);
        
        let parsedTitle = chartTitle || "Chart";
        if (titleMatch) parsedTitle = titleMatch[1];
        
        const items: { label: string; value: number }[] = [];
        for (const match of dataMatches) {
          items.push({ label: match[1], value: parseFloat(match[2]) });
        }
        
        // Fallback: try to extract from text elements
        if (items.length === 0) {
          const textMatches = content.matchAll(/<text[^>]*>([^<]+)<\/text>/g);
          const labels: string[] = [];
          for (const match of textMatches) {
            const text = match[1].trim();
            if (text && text !== parsedTitle && !text.includes('%')) {
              labels.push(text);
            }
          }
        }
        
        return { title: parsedTitle, items };
      };

      const handleChartClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const parsed = parseChartData();
        setChartTitle(parsed.title);
        if (parsed.items.length > 0) {
          setChartData(parsed.items.map(i => `${i.label}, ${i.value}`).join('\n'));
        } else {
          setChartData("Q1, 100\nQ2, 150\nQ3, 120\nQ4, 180");
        }
        setShowChartEditor(true);
      };

      const handleChartSave = () => {
        if (!onContentChange) return;
        
        const lines = chartData.split("\n").filter(line => line.trim());
        const data = lines.map((line, idx) => {
          const parts = line.split(",").map(p => p.trim());
          const label = parts[0] || `Item ${idx + 1}`;
          const value = parseFloat(parts[1]) || 0;
          const color = defaultColors[idx % defaultColors.length];
          return { label, value, color };
        });
        
        if (data.length === 0) return;
        
        // Detect chart type from content
        const isBar = content.includes('rect') && !content.includes('circle');
        const isPie = content.includes('circle') || content.includes('arc');
        const isLine = content.includes('polyline') || content.includes('line');
        
        let newSvg = "";
        const maxValue = Math.max(...data.map(d => d.value));
        
        if (isPie) {
          // Generate pie chart
          const total = data.reduce((sum, d) => sum + d.value, 0);
          let currentAngle = 0;
          const cx = 150, cy = 120, r = 80;
          
          const slices = data.map((d, i) => {
            const angle = (d.value / total) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            currentAngle = endAngle;
            
            const startRad = (startAngle - 90) * Math.PI / 180;
            const endRad = (endAngle - 90) * Math.PI / 180;
            
            const x1 = cx + r * Math.cos(startRad);
            const y1 = cy + r * Math.sin(startRad);
            const x2 = cx + r * Math.cos(endRad);
            const y2 = cy + r * Math.sin(endRad);
            
            const largeArc = angle > 180 ? 1 : 0;
            
            return `<path d="M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z" fill="${d.color}" data-label="${d.label}" data-value="${d.value}"/>`;
          }).join('');
          
          const legend = data.map((d, i) => 
            `<rect x="320" y="${40 + i * 25}" width="12" height="12" fill="${d.color}"/>
             <text x="340" y="${51 + i * 25}" font-size="12">${d.label}: ${d.value}</text>`
          ).join('');
          
          newSvg = `<svg viewBox="0 0 500 280" xmlns="http://www.w3.org/2000/svg">
            <text x="250" y="25" text-anchor="middle" font-size="16" font-weight="bold" class="chart-title">${chartTitle}</text>
            ${slices}
            ${legend}
          </svg>`;
        } else {
          // Generate bar chart
          const barWidth = 60;
          const chartWidth = data.length * (barWidth + 20) + 80;
          const chartHeight = 250;
          const maxBarHeight = 150;
          
          const bars = data.map((d, i) => {
            const barHeight = (d.value / maxValue) * maxBarHeight;
            const x = 60 + i * (barWidth + 20);
            const y = 200 - barHeight;
            return `
              <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${d.color}" data-label="${d.label}" data-value="${d.value}"/>
              <text x="${x + barWidth/2}" y="220" text-anchor="middle" font-size="12">${d.label}</text>
              <text x="${x + barWidth/2}" y="${y - 5}" text-anchor="middle" font-size="11">${d.value}</text>
            `;
          }).join('');
          
          newSvg = `<svg viewBox="0 0 ${Math.max(chartWidth, 400)} ${chartHeight}" xmlns="http://www.w3.org/2000/svg">
            <text x="${Math.max(chartWidth, 400)/2}" y="25" text-anchor="middle" font-size="16" font-weight="bold" class="chart-title">${chartTitle}</text>
            <line x1="50" y1="200" x2="${chartWidth - 30}" y2="200" stroke="#e5e7eb" stroke-width="2"/>
            ${bars}
          </svg>`;
        }
        
        onContentChange(id, newSvg);
        setShowChartEditor(false);
      };

      return (
        <>
          <div 
            className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-primary/5 rounded transition-colors"
            onClick={handleChartClick}
            title="Click to edit chart data"
            dangerouslySetInnerHTML={{ __html: content }}
          />
          <Dialog open={showChartEditor} onOpenChange={setShowChartEditor}>
            <DialogContent className="max-w-md" onClick={(e) => e.stopPropagation()}>
              <DialogHeader>
                <DialogTitle>Edit Chart Data</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Chart Title</Label>
                  <Input
                    value={chartTitle}
                    onChange={(e) => setChartTitle(e.target.value)}
                    placeholder="Enter chart title"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Data (Label, Value per line)</Label>
                  <Textarea
                    value={chartData}
                    onChange={(e) => setChartData(e.target.value)}
                    placeholder="Q1, 100&#10;Q2, 150&#10;Q3, 120"
                    className="mt-1.5 h-[150px] font-mono text-sm"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowChartEditor(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleChartSave}>
                    Update Chart
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </>
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
