import { useState, useEffect, useRef, useCallback } from "react";
import { useZoomScaleRef } from "@/contexts/ZoomScaleContext";
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
  const [showSignDialog, setShowSignDialog] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  
  // Refs for drag/resize state to avoid stale closures
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const startPosRef = useRef({ x: 0, y: 0 });
  const movementRef = useRef(0);
  const zoomScaleRef = useZoomScaleRef();

  // Mobile tap threshold (8px movement = drag, less = tap)
  const TAP_THRESHOLD = 8;

  const getEffectiveScale = useCallback((): number => {
    const el = fieldRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      const logicalWidth = el.offsetWidth;
      if (logicalWidth > 0) return rect.width / logicalWidth;
    }
    return zoomScaleRef.current || 1;
  }, [zoomScaleRef]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.preventDefault();
    e.stopPropagation();
    
    const isResize = (e.target as HTMLElement).classList.contains('resize-handle');
    const scale = getEffectiveScale();

    movementRef.current = 0;
    startPosRef.current = { x: e.clientX, y: e.clientY };

    if (isResize) {
      isResizingRef.current = true;
      resizeStartRef.current = { x: e.clientX, y: e.clientY, width, height };
    } else {
      isDraggingRef.current = true;
      dragStartRef.current = { x: e.clientX / scale - x, y: e.clientY / scale - y };
    }
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [x, y, width, height, getEffectiveScale]);

  const handleResizePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isResizingRef.current = true;
    const scale = getEffectiveScale();
    resizeStartRef.current = { x: e.clientX, y: e.clientY, width, height };
    movementRef.current = 0;
    startPosRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [width, height, getEffectiveScale]);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const dx = e.clientX - startPosRef.current.x;
      const dy = e.clientY - startPosRef.current.y;
      movementRef.current = Math.sqrt(dx * dx + dy * dy);

      if (isDraggingRef.current && movementRef.current > TAP_THRESHOLD) {
        e.preventDefault();
        const scale = getEffectiveScale();
        const newX = e.clientX / scale - dragStartRef.current.x;
        const newY = e.clientY / scale - dragStartRef.current.y;
        onPositionChange(id, Math.max(0, newX), Math.max(0, newY));
      } else if (isResizingRef.current) {
        e.preventDefault();
        const scale = getEffectiveScale();
        const deltaX = (e.clientX - resizeStartRef.current.x) / scale;
        const deltaY = (e.clientY - resizeStartRef.current.y) / scale;
        const newWidth = Math.max(150, resizeStartRef.current.width + deltaX);
        const newHeight = Math.max(60, resizeStartRef.current.height + deltaY);
        onSizeChange(id, newWidth, newHeight);
      }
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
      isResizingRef.current = false;
    };

    document.addEventListener('pointermove', handlePointerMove, { passive: false });
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointercancel', handlePointerUp);

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [id, onPositionChange, onSizeChange, getEffectiveScale]);

  // Canvas drawing functions - support touch
  const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pos = getCanvasPos(e);
    setIsDrawing(true);
    setLastPos(pos);
    const ctx = canvas.getContext('2d');
    if (ctx) { ctx.beginPath(); ctx.moveTo(pos.x, pos.y); }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pos = getCanvasPos(e);
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = '#1e3a5f';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      setLastPos(pos);
    }
  };

  const stopDrawing = () => { setIsDrawing(false); };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
  };

  const handleSignatureConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    if (onSign) onSign(id, dataUrl);
    setShowSignDialog(false);
  };

  const handleFieldClick = (e: React.MouseEvent) => {
    // Only open sign dialog if it was a tap (not a drag)
    if (!signed && movementRef.current < TAP_THRESHOLD && !(e.target as HTMLElement).classList.contains('resize-handle')) {
      e.stopPropagation();
      setShowSignDialog(true);
    }
  };

  useEffect(() => {
    if (showSignDialog && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    }
  }, [showSignDialog]);

  return (
    <>
      <div
        ref={fieldRef}
        data-draggable="true"
        className={`absolute border-2 ${
          signed ? 'border-green-500 bg-green-50' : 'border-primary bg-primary/5'
        } rounded-lg shadow-lg group touch-none select-none`}
        style={{
          left: `${x}px`,
          top: `${y}px`,
          width: `${width}px`,
          height: `${height}px`,
          touchAction: "none",
          userSelect: "none",
        }}
        onPointerDown={handlePointerDown}
        onClick={handleFieldClick}
      >
        <div className="h-full flex flex-col items-center justify-center p-3 pointer-events-none">
          {signed && signatureData ? (
            <div className="text-center w-full h-full flex flex-col items-center justify-center">
              <img src={signatureData} alt="Signature" className="max-w-full max-h-[calc(100%-24px)] object-contain" />
              <p className="text-xs text-green-600 mt-1">{new Date().toLocaleDateString()}</p>
            </div>
          ) : signed ? (
            <div className="text-center">
              <Check className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-green-700">Signed</p>
              <p className="text-xs text-green-600">{new Date().toLocaleDateString()}</p>
            </div>
          ) : (
            <div className="text-center">
              <FileSignature className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-xs font-semibold text-primary">Signature Required</p>
              <p className="text-xs text-muted-foreground">Tap to sign</p>
            </div>
          )}
        </div>

        {/* Drag Handle - always visible on mobile, larger touch target */}
        <div className="absolute top-0 left-0 right-0 h-10 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity bg-primary/10 rounded-t-lg cursor-move">
          <GripVertical className="h-5 w-5 text-primary" />
        </div>

        {/* Remove Button - larger for mobile */}
        <Button
          variant="destructive"
          size="icon"
          className="absolute -top-3 -right-3 h-8 w-8 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity pointer-events-auto"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(id);
          }}
        >
          <X className="h-3.5 w-3.5" />
        </Button>

        {/* Resize Handle - larger touch target for mobile */}
        <div
          className="resize-handle absolute -bottom-3 -right-3 w-10 h-10 bg-primary cursor-se-resize opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center touch-none pointer-events-auto"
          onPointerDown={handleResizePointerDown}
        >
          <div className="w-3.5 h-3.5 bg-background rounded-full pointer-events-none" />
        </div>
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
              Use your finger or mouse to draw your signature below.
            </p>
            <div className="border-2 border-dashed border-border rounded-lg p-2 bg-white">
              <canvas
                ref={canvasRef}
                width={400}
                height={150}
                className="w-full cursor-crosshair border border-border/50 rounded touch-none"
                style={{ touchAction: "none" }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
            <Button variant="outline" size="sm" onClick={clearCanvas} className="gap-2">
              <Eraser className="h-4 w-4" />
              Clear
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSignDialog(false)}>Cancel</Button>
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
