import { useState, useEffect, useRef } from "react";
import { X, GripVertical, FileSignature, Check, Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface SignatureFieldProps {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  signed: boolean;
  signatureData?: string;
  onPositionChange: (id: string, x: number, y: number) => void;
  onSizeChange: (id: string, width: number, height: number) => void;
  onRemove: (id: string) => void;
  onSign?: (id: string, signatureData?: string) => void;
}

export function SignatureField({
  id,
  x,
  y,
  width,
  height,
  signed,
  signatureData,
  onPositionChange,
  onSizeChange,
  onRemove,
  onSign,
}: SignatureFieldProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [showSignDialog, setShowSignDialog] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

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

  // Canvas drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    setLastPos({ x, y });
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = '#1e3a5f';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      
      setLastPos({ x, y });
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleSignatureConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL('image/png');
    if (onSign) {
      onSign(id, dataUrl);
    }
    setShowSignDialog(false);
  };

  const handleFieldClick = (e: React.MouseEvent) => {
    if (!signed && !(e.target as HTMLElement).classList.contains('resize-handle')) {
      e.stopPropagation();
      setShowSignDialog(true);
    }
  };

  // Initialize canvas when dialog opens
  useEffect(() => {
    if (showSignDialog && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [showSignDialog]);

  return (
    <>
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
        onClick={handleFieldClick}
      >
        <div className="h-full flex flex-col items-center justify-center p-3 pointer-events-none">
          {signed && signatureData ? (
            <div className="text-center w-full h-full flex flex-col items-center justify-center">
              <img 
                src={signatureData} 
                alt="Signature" 
                className="max-w-full max-h-[calc(100%-24px)] object-contain"
              />
              <p className="text-xs text-green-600 mt-1">
                {new Date().toLocaleDateString()}
              </p>
            </div>
          ) : signed ? (
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

      {/* Signature Drawing Dialog */}
      <Dialog open={showSignDialog} onOpenChange={setShowSignDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSignature className="h-5 w-5 text-primary" />
              Draw Your Signature
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Use your mouse or touchpad to draw your signature in the box below.
            </p>
            
            <div className="border-2 border-dashed border-border rounded-lg p-2 bg-white">
              <canvas
                ref={canvasRef}
                width={400}
                height={150}
                className="w-full cursor-crosshair border border-border/50 rounded"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={clearCanvas}
              className="gap-2"
            >
              <Eraser className="h-4 w-4" />
              Clear
            </Button>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSignDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSignatureConfirm}>
              <Check className="h-4 w-4 mr-2" />
              Confirm Signature
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}