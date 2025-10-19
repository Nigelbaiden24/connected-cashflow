import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { 
  Type, Image as ImageIcon, Square, Circle, 
  Download, Save, Undo, Redo, Trash2, 
  AlignLeft, AlignCenter, AlignRight, Bold, 
  Italic, Underline, Upload, ZoomIn, ZoomOut,
  Copy, ArrowUp, ArrowDown, RotateCw, Layers
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateFinancialReport } from "@/utils/pdfGenerator";

interface EditorElement {
  id: string;
  type: "text" | "image" | "shape";
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  textAlign?: string;
  textDecoration?: string;
  color?: string;
  backgroundColor?: string;
  borderRadius?: number;
  rotation?: number;
  zIndex: number;
}

interface DocumentEditorProps {
  initialContent?: string;
  onSave?: (content: string) => void;
}

export function DocumentEditor({ initialContent = "", onSave }: DocumentEditorProps) {
  const { toast } = useToast();
  const [elements, setElements] = useState<EditorElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [history, setHistory] = useState<EditorElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [showHtmlPreview, setShowHtmlPreview] = useState(false);

  useEffect(() => {
    const trimmedContent = initialContent?.trim() || '';
    console.log('DocumentEditor received content:', trimmedContent.substring(0, 200));
    
    if (initialContent && (trimmedContent.startsWith('<!DOCTYPE html>') || trimmedContent.startsWith('<html'))) {
      // If it's full HTML document, show in preview mode
      console.log('Showing HTML preview mode');
      setShowHtmlPreview(true);
    } else if (initialContent) {
      // Parse initial content if provided
      const parser = new DOMParser();
      const doc = parser.parseFromString(initialContent, 'text/html');
      // Convert HTML to editor elements (simplified)
      const textElements = Array.from(doc.querySelectorAll('p, h1, h2, h3, span')).map((el, i) => ({
        id: `element-${i}`,
        type: "text" as const,
        content: el.textContent || "",
        x: 50,
        y: 50 + (i * 40),
        width: 400,
        height: 30,
        fontSize: 16,
        fontWeight: "normal",
        fontStyle: "normal",
        textAlign: "left",
        textDecoration: "none",
        color: "#000000",
        backgroundColor: "transparent",
        zIndex: i
      }));
      setElements(textElements);
      saveToHistory(textElements);
    }
  }, [initialContent]);

  const saveToHistory = (newElements: EditorElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newElements)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(JSON.parse(JSON.stringify(history[historyIndex - 1])));
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(JSON.parse(JSON.stringify(history[historyIndex + 1])));
    }
  };

  const addTextElement = () => {
    const newElement: EditorElement = {
      id: `text-${Date.now()}`,
      type: "text",
      content: "Double-click to edit",
      x: 100,
      y: 100,
      width: 300,
      height: 40,
      fontSize: 16,
      fontWeight: "normal",
      fontStyle: "normal",
      textAlign: "left",
      textDecoration: "none",
      color: "#000000",
      backgroundColor: "transparent",
      zIndex: elements.length
    };
    const newElements = [...elements, newElement];
    setElements(newElements);
    saveToHistory(newElements);
    setSelectedElement(newElement.id);
  };

  const addShape = (shapeType: "rectangle" | "circle") => {
    const newElement: EditorElement = {
      id: `shape-${Date.now()}`,
      type: "shape",
      content: shapeType,
      x: 100,
      y: 100,
      width: 150,
      height: shapeType === "circle" ? 150 : 100,
      backgroundColor: "#3b82f6",
      borderRadius: shapeType === "circle" ? 50 : 0,
      zIndex: elements.length
    };
    const newElements = [...elements, newElement];
    setElements(newElements);
    saveToHistory(newElements);
    setSelectedElement(newElement.id);
  };

  const uploadImage = async (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const newElement: EditorElement = {
        id: `image-${Date.now()}`,
        type: "image",
        content: e.target?.result as string,
        x: 100,
        y: 100,
        width: 200,
        height: 200,
        zIndex: elements.length
      };
      const newElements = [...elements, newElement];
      setElements(newElements);
      saveToHistory(newElements);
      setSelectedElement(newElement.id);
    };
    reader.readAsDataURL(file);
  };

  const updateElement = (id: string, updates: Partial<EditorElement>) => {
    const newElements = elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    );
    setElements(newElements);
    saveToHistory(newElements);
  };

  const deleteElement = (id: string) => {
    const newElements = elements.filter(el => el.id !== id);
    setElements(newElements);
    saveToHistory(newElements);
    setSelectedElement(null);
  };

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    setSelectedElement(elementId);
    setIsDragging(true);
    
    const element = elements.find(el => el.id === elementId);
    if (element) {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setDragOffset({
        x: e.clientX - element.x * zoom,
        y: e.clientY - element.y * zoom
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && selectedElement) {
      const newX = (e.clientX - dragOffset.x) / zoom;
      const newY = (e.clientY - dragOffset.y) / zoom;
      updateElement(selectedElement, { x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = (elementId: string) => {
    const element = elements.find(el => el.id === elementId);
    if (element && element.type === "text") {
      const newContent = prompt("Edit text:", element.content);
      if (newContent !== null) {
        updateElement(elementId, { content: newContent });
      }
    }
  };

  const exportAsHTML = () => {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
    .canvas { position: relative; width: 1000px; height: 1400px; background: white; }
    .element { position: absolute; }
  </style>
</head>
<body>
  <div class="canvas">
    ${elements.map(el => {
      const style = `
        left: ${el.x}px;
        top: ${el.y}px;
        width: ${el.width}px;
        height: ${el.height}px;
        ${el.fontSize ? `font-size: ${el.fontSize}px;` : ''}
        ${el.fontWeight ? `font-weight: ${el.fontWeight};` : ''}
        ${el.fontStyle ? `font-style: ${el.fontStyle};` : ''}
        ${el.textAlign ? `text-align: ${el.textAlign};` : ''}
        ${el.textDecoration ? `text-decoration: ${el.textDecoration};` : ''}
        ${el.color ? `color: ${el.color};` : ''}
        ${el.backgroundColor ? `background-color: ${el.backgroundColor};` : ''}
        ${el.borderRadius ? `border-radius: ${el.borderRadius}%;` : ''}
        z-index: ${el.zIndex};
      `.trim();

      if (el.type === "text") {
        return `<div class="element" style="${style}">${el.content}</div>`;
      } else if (el.type === "image") {
        return `<img class="element" src="${el.content}" style="${style}" />`;
      } else {
        return `<div class="element" style="${style}"></div>`;
      }
    }).join('\n')}
  </div>
</body>
</html>
    `.trim();

    onSave?.(html);
    
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Exported",
      description: "Document exported as HTML"
    });
  };

  const exportAsPDF = async () => {
    try {
      const html = `
        <div>
          ${elements.map(el => {
            if (el.type === "text") {
              return `<p style="font-size: ${el.fontSize}px; font-weight: ${el.fontWeight}; color: ${el.color};">${el.content}</p>`;
            }
            return '';
          }).join('\n')}
        </div>
      `;
      
      await generateFinancialReport({
        title: "Custom Document",
        content: html,
        generatedBy: "Document Editor",
        date: new Date()
      });
      toast({
        title: "Success",
        description: "Document exported as PDF"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export PDF",
        variant: "destructive"
      });
    }
  };

  const duplicateElement = () => {
    if (!selectedElement) return;
    const element = elements.find(el => el.id === selectedElement);
    if (!element) return;

    const newElement: EditorElement = {
      ...element,
      id: `${element.type}-${Date.now()}`,
      x: element.x + 20,
      y: element.y + 20,
      zIndex: elements.length
    };

    const newElements = [...elements, newElement];
    setElements(newElements);
    saveToHistory(newElements);
    setSelectedElement(newElement.id);
    toast({
      title: "Duplicated",
      description: "Element has been duplicated"
    });
  };

  const bringForward = () => {
    if (!selectedElement) return;
    const newElements = [...elements];
    const index = newElements.findIndex(el => el.id === selectedElement);
    if (index < newElements.length - 1) {
      const temp = newElements[index].zIndex;
      newElements[index].zIndex = newElements[index + 1].zIndex;
      newElements[index + 1].zIndex = temp;
      newElements.sort((a, b) => a.zIndex - b.zIndex);
      setElements(newElements);
      saveToHistory(newElements);
    }
  };

  const sendBackward = () => {
    if (!selectedElement) return;
    const newElements = [...elements];
    const index = newElements.findIndex(el => el.id === selectedElement);
    if (index > 0) {
      const temp = newElements[index].zIndex;
      newElements[index].zIndex = newElements[index - 1].zIndex;
      newElements[index - 1].zIndex = temp;
      newElements.sort((a, b) => a.zIndex - b.zIndex);
      setElements(newElements);
      saveToHistory(newElements);
    }
  };

  const selectedElementData = selectedElement ? elements.find(el => el.id === selectedElement) : null;

  if (showHtmlPreview && initialContent) {
    return (
      <div className="flex h-screen flex-col">
        <div className="border-b bg-background p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Document Preview</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowHtmlPreview(false)}>
                Edit Mode
              </Button>
              <Button onClick={exportAsHTML}>
                <Download className="h-4 w-4 mr-2" />
                Export HTML
              </Button>
              <Button onClick={exportAsPDF}>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-muted p-4">
          <div className="mx-auto bg-white shadow-lg">
            <iframe
              srcDoc={initialContent}
              className="w-full h-full min-h-[1400px] border-0"
              title="Document Preview"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Toolbar */}
      <div className="w-64 border-r bg-background p-4 space-y-4 overflow-y-auto">
        <div className="space-y-2">
          <h3 className="font-semibold">Tools</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={addTextElement}>
              <Type className="h-4 w-4 mr-1" />
              Text
            </Button>
            <Button variant="outline" size="sm" onClick={() => addShape("rectangle")}>
              <Square className="h-4 w-4 mr-1" />
              Box
            </Button>
            <Button variant="outline" size="sm" onClick={() => addShape("circle")}>
              <Circle className="h-4 w-4 mr-1" />
              Circle
            </Button>
            <Button variant="outline" size="sm" onClick={() => document.getElementById('image-upload')?.click()}>
              <ImageIcon className="h-4 w-4 mr-1" />
              Image
            </Button>
          </div>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadImage(file);
            }}
          />
        </div>

        {selectedElementData && (
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold">Properties</h3>
              
              {selectedElementData.type === "text" && (
                <>
                  <div>
                    <Label>Font Size</Label>
                    <Slider
                      value={[selectedElementData.fontSize || 16]}
                      onValueChange={([val]) => updateElement(selectedElement, { fontSize: val })}
                      min={8}
                      max={72}
                      step={1}
                    />
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      variant={selectedElementData.fontWeight === "bold" ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateElement(selectedElement, { 
                        fontWeight: selectedElementData.fontWeight === "bold" ? "normal" : "bold" 
                      })}
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={selectedElementData.fontStyle === "italic" ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateElement(selectedElement, { 
                        fontStyle: selectedElementData.fontStyle === "italic" ? "normal" : "italic" 
                      })}
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={selectedElementData.textDecoration === "underline" ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateElement(selectedElement, { 
                        textDecoration: selectedElementData.textDecoration === "underline" ? "none" : "underline" 
                      })}
                    >
                      <Underline className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex gap-1">
                    <Button
                      variant={selectedElementData.textAlign === "left" ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateElement(selectedElement, { textAlign: "left" })}
                    >
                      <AlignLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={selectedElementData.textAlign === "center" ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateElement(selectedElement, { textAlign: "center" })}
                    >
                      <AlignCenter className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={selectedElementData.textAlign === "right" ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateElement(selectedElement, { textAlign: "right" })}
                    >
                      <AlignRight className="h-4 w-4" />
                    </Button>
                  </div>

                   <div>
                    <Label>Text Color</Label>
                    <Input
                      type="color"
                      value={selectedElementData.color}
                      onChange={(e) => updateElement(selectedElement, { color: e.target.value })}
                    />
                  </div>
                </>
              )}

              <div>
                <Label>Background</Label>
                <Input
                  type="color"
                  value={selectedElementData.backgroundColor || "#ffffff"}
                  onChange={(e) => updateElement(selectedElement, { backgroundColor: e.target.value })}
                />
              </div>

              <div>
                <Label>Position</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">X</Label>
                    <Input
                      type="number"
                      value={selectedElementData.x}
                      onChange={(e) => updateElement(selectedElement, { x: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Y</Label>
                    <Input
                      type="number"
                      value={selectedElementData.y}
                      onChange={(e) => updateElement(selectedElement, { y: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Size</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Width</Label>
                    <Input
                      type="number"
                      value={selectedElementData.width}
                      onChange={(e) => updateElement(selectedElement, { width: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Height</Label>
                    <Input
                      type="number"
                      value={selectedElementData.height}
                      onChange={(e) => updateElement(selectedElement, { height: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Rotation</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[selectedElementData.rotation || 0]}
                    onValueChange={([val]) => updateElement(selectedElement, { rotation: val })}
                    min={0}
                    max={360}
                    step={5}
                  />
                  <span className="text-xs w-10">{selectedElementData.rotation || 0}°</span>
                </div>
              </div>

              <div className="pt-2 space-y-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={duplicateElement}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={() => deleteElement(selectedElement)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Top toolbar */}
        <div className="border-b p-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={undo} disabled={historyIndex <= 0}>
              <Undo className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1}>
              <Redo className="h-4 w-4" />
            </Button>
          </div>

          {selectedElement && (
            <div className="flex gap-2 border-l pl-2">
              <Button variant="outline" size="sm" onClick={duplicateElement} title="Duplicate">
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={bringForward} title="Bring Forward">
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={sendBackward} title="Send Backward">
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm w-16 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(2, zoom + 0.25))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={exportAsHTML}>
              <Download className="h-4 w-4 mr-2" />
              HTML
            </Button>
            <Button size="sm" onClick={exportAsPDF}>
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>

        {/* Canvas area */}
        <div className="flex-1 overflow-auto bg-muted p-8">
          <div
            ref={canvasRef}
            className="bg-white shadow-lg mx-auto"
            style={{
              width: `${1000 * zoom}px`,
              height: `${1400 * zoom}px`,
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
              position: 'relative'
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onClick={() => setSelectedElement(null)}
          >
            {elements.map(element => (
              <div
                key={element.id}
                className={`absolute cursor-move ${selectedElement === element.id ? 'ring-2 ring-primary' : ''}`}
                style={{
                  left: `${element.x}px`,
                  top: `${element.y}px`,
                  width: `${element.width}px`,
                  height: `${element.height}px`,
                  fontSize: element.fontSize ? `${element.fontSize}px` : undefined,
                  fontWeight: element.fontWeight,
                  fontStyle: element.fontStyle,
                  textAlign: element.textAlign as any,
                  textDecoration: element.textDecoration,
                  color: element.color,
                  backgroundColor: element.backgroundColor,
                  borderRadius: element.borderRadius ? `${element.borderRadius}%` : undefined,
                  zIndex: element.zIndex,
                  padding: element.type === "text" ? '8px' : undefined,
                  transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
                  transformOrigin: 'center'
                }}
                onMouseDown={(e) => handleMouseDown(e, element.id)}
                onDoubleClick={() => handleDoubleClick(element.id)}
              >
                {element.type === "text" && element.content}
                {element.type === "image" && (
                  <img src={element.content} alt="" className="w-full h-full object-cover" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}