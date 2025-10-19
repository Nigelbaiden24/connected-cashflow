import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Textbox, FabricImage, Rect } from "fabric";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Download, Save, Undo, Redo, ZoomIn, ZoomOut,
  Bold, Italic, AlignLeft, AlignCenter, AlignRight,
  Type
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CanvasTemplate, AIContent } from "@/types/template";

interface CanvasEditorProps {
  template: CanvasTemplate;
  aiContent?: AIContent;
  onSave?: (data: string) => void;
}

export function CanvasEditor({ template, aiContent, onSave }: CanvasEditorProps) {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [zoom, setZoom] = useState(1);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    if (!canvasRef.current) return;

    console.log("Initializing Fabric canvas with template:", template.id);
    
    const canvas = new FabricCanvas(canvasRef.current, {
      width: template.width,
      height: template.height,
      backgroundColor: template.backgroundColor,
    });

    // Load background and decoration images
    template.imageRegions.forEach(async (imgRegion) => {
      if (imgRegion.src.startsWith('data:image')) {
        const img = await FabricImage.fromURL(imgRegion.src);
        img.set({
          left: imgRegion.x,
          top: imgRegion.y,
          scaleX: imgRegion.width / (img.width || 1),
          scaleY: imgRegion.height / (img.height || 1),
          selectable: !imgRegion.locked,
          evented: !imgRegion.locked,
        });
        canvas.add(img);
      }
    });

    // Add text regions with AI content or placeholders
    template.textRegions.forEach((region) => {
      const content = aiContent?.[region.id] || region.placeholder;
      
      const textbox = new Textbox(content, {
        left: region.x,
        top: region.y,
        width: region.width,
        fontSize: region.fontSize,
        fontFamily: region.fontFamily,
        fontWeight: region.fontWeight,
        fill: region.color,
        textAlign: region.textAlign,
        lineHeight: region.lineHeight,
        editable: true,
        hasControls: true,
        hasBorders: true,
        borderColor: '#2196F3',
        cornerColor: '#2196F3',
        cornerSize: 8,
        transparentCorners: false,
      });

      canvas.add(textbox);
    });

    canvas.on('selection:created', (e) => {
      setSelectedObject(e.selected?.[0]);
    });

    canvas.on('selection:updated', (e) => {
      setSelectedObject(e.selected?.[0]);
    });

    canvas.on('selection:cleared', () => {
      setSelectedObject(null);
    });

    setFabricCanvas(canvas);
    saveToHistory(canvas);

    return () => {
      canvas.dispose();
    };
  }, [template, aiContent]);

  const saveToHistory = (canvas: FabricCanvas) => {
    const json = JSON.stringify(canvas.toJSON());
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(json);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0 && fabricCanvas) {
      const prevState = history[historyIndex - 1];
      fabricCanvas.loadFromJSON(prevState).then(() => {
        fabricCanvas.renderAll();
        setHistoryIndex(historyIndex - 1);
      });
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1 && fabricCanvas) {
      const nextState = history[historyIndex + 1];
      fabricCanvas.loadFromJSON(nextState).then(() => {
        fabricCanvas.renderAll();
        setHistoryIndex(historyIndex + 1);
      });
    }
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom + 0.1, 2);
    setZoom(newZoom);
    fabricCanvas?.setZoom(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - 0.1, 0.5);
    setZoom(newZoom);
    fabricCanvas?.setZoom(newZoom);
  };

  const addTextBox = () => {
    if (!fabricCanvas) return;
    
    const textbox = new Textbox('Double-click to edit', {
      left: 100,
      top: 100,
      width: 200,
      fontSize: 16,
      fontFamily: 'Arial',
      fill: '#333333',
      editable: true,
    });

    fabricCanvas.add(textbox);
    fabricCanvas.setActiveObject(textbox);
    saveToHistory(fabricCanvas);
  };

  const updateSelectedText = (property: string, value: any) => {
    if (!selectedObject || selectedObject.type !== 'textbox') return;
    
    selectedObject.set(property, value);
    fabricCanvas?.renderAll();
    if (fabricCanvas) saveToHistory(fabricCanvas);
  };

  const exportAsImage = () => {
    if (!fabricCanvas) return;
    
    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2,
    });

    const link = document.createElement('a');
    link.download = `${template.name}-${Date.now()}.png`;
    link.href = dataURL;
    link.click();

    toast({
      title: "Exported",
      description: "Document exported as PNG",
    });
  };

  const handleSave = () => {
    if (!fabricCanvas) return;
    
    const json = fabricCanvas.toJSON();
    onSave?.(JSON.stringify(json));
    
    toast({
      title: "Saved",
      description: "Document saved successfully",
    });
  };

  return (
    <div className="flex h-full">
      {/* Toolbar */}
      <div className="w-64 border-r bg-background p-4 space-y-4 overflow-y-auto">
        <div className="space-y-2">
          <h3 className="font-semibold">Tools</h3>
          <Button variant="outline" size="sm" onClick={addTextBox} className="w-full">
            <Type className="h-4 w-4 mr-2" />
            Add Text
          </Button>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">History</h3>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={undo}
              disabled={historyIndex <= 0}
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">View</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Zoom: {(zoom * 100).toFixed(0)}%</p>
        </div>

        {selectedObject && selectedObject.type === 'textbox' && (
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold">Text Properties</h3>
              
              <div>
                <Label>Font Size</Label>
                <Slider
                  value={[selectedObject.fontSize || 16]}
                  onValueChange={([val]) => updateSelectedText('fontSize', val)}
                  min={8}
                  max={72}
                  step={1}
                />
                <span className="text-xs text-muted-foreground">{selectedObject.fontSize}px</span>
              </div>

              <div>
                <Label>Color</Label>
                <Input
                  type="color"
                  value={selectedObject.fill}
                  onChange={(e) => updateSelectedText('fill', e.target.value)}
                />
              </div>

              <div className="flex gap-1">
                <Button
                  variant={selectedObject.fontWeight === 'bold' ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSelectedText('fontWeight', 
                    selectedObject.fontWeight === 'bold' ? 'normal' : 'bold'
                  )}
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  variant={selectedObject.fontStyle === 'italic' ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSelectedText('fontStyle',
                    selectedObject.fontStyle === 'italic' ? 'normal' : 'italic'
                  )}
                >
                  <Italic className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex gap-1">
                <Button
                  variant={selectedObject.textAlign === 'left' ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSelectedText('textAlign', 'left')}
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant={selectedObject.textAlign === 'center' ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSelectedText('textAlign', 'center')}
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                  variant={selectedObject.textAlign === 'right' ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSelectedText('textAlign', 'right')}
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex flex-col">
        <div className="border-b bg-background p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{template.name}</h2>
          <div className="flex gap-2">
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" onClick={exportAsImage}>
              <Download className="h-4 w-4 mr-2" />
              Export PNG
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-muted p-8 flex items-start justify-center">
          <div className="bg-white shadow-2xl" style={{ 
            transform: `scale(${zoom})`,
            transformOrigin: 'top center'
          }}>
            <canvas ref={canvasRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
