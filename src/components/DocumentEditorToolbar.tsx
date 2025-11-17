import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  Upload,
  ImagePlus,
  Type,
  Palette,
  Sparkles,
  Plus,
  FilePlus,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Grid3x3,
  Shapes,
  Square,
  Circle,
  Triangle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";

interface DocumentEditorToolbarProps {
  templates: any[];
  selectedTemplate: string | null;
  onTemplateSelect: (templateId: string) => void;
  onImageUpload: (file: File) => void;
  onLogoUpload: (file: File) => void;
  backgroundColor: string;
  onBackgroundColorChange: (color: string) => void;
  textColor: string;
  onTextColorChange: (color: string) => void;
  onDownloadPDF: () => void;
  onFillDocument: (prompt: string) => void;
  onAddSection: () => void;
  onAddPage: () => void;
  onAddShape: (shapeType: string) => void;
  fontFamily: string;
  onFontFamilyChange: (font: string) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  textAlign: string;
  onTextAlignChange: (align: string) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  showGrid: boolean;
  onShowGridChange: (show: boolean) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function DocumentEditorToolbar({
  templates,
  selectedTemplate,
  onTemplateSelect,
  onImageUpload,
  onLogoUpload,
  backgroundColor,
  onBackgroundColorChange,
  textColor,
  onTextColorChange,
  onDownloadPDF,
  onFillDocument,
  onAddSection,
  onAddPage,
  onAddShape,
  fontFamily,
  onFontFamilyChange,
  fontSize,
  onFontSizeChange,
  textAlign,
  onTextAlignChange,
  zoom,
  onZoomChange,
  showGrid,
  onShowGridChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: DocumentEditorToolbarProps) {
  const [imageUploadKey, setImageUploadKey] = useState(0);
  const [logoUploadKey, setLogoUploadKey] = useState(0);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
      setImageUploadKey(prev => prev + 1);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onLogoUpload(file);
      setLogoUploadKey(prev => prev + 1);
    }
  };

  const handleAiFillSubmit = () => {
    if (aiPrompt.trim()) {
      onFillDocument(aiPrompt);
      setIsAiDialogOpen(false);
      setAiPrompt("");
    }
  };

  const fonts = [
    "Inter",
    "Arial",
    "Times New Roman",
    "Courier New",
    "Georgia",
    "Verdana",
    "Helvetica",
    "Playfair Display",
    "Roboto",
    "Open Sans",
    "Lato",
    "Montserrat",
  ];

  const fontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72];

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex items-center gap-2 p-2 flex-wrap">
        {/* Template Selection */}
        <div className="flex items-center gap-2">
          <Select value={selectedTemplate || undefined} onValueChange={onTemplateSelect}>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Select template" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Page Actions */}
        <Button variant="outline" size="sm" onClick={onAddPage}>
          <FilePlus className="h-4 w-4 mr-2" />
          Add Page
        </Button>

        <Button variant="outline" size="sm" onClick={onAddSection}>
          <Plus className="h-4 w-4 mr-2" />
          Add Section
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Shapes className="h-4 w-4 mr-2" />
              Shapes
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56">
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddShape('rectangle')}
                className="flex flex-col items-center gap-1 h-auto py-2"
              >
                <Square className="h-6 w-6" />
                <span className="text-xs">Rectangle</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddShape('circle')}
                className="flex flex-col items-center gap-1 h-auto py-2"
              >
                <Circle className="h-6 w-6" />
                <span className="text-xs">Circle</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddShape('triangle')}
                className="flex flex-col items-center gap-1 h-auto py-2"
              >
                <Triangle className="h-6 w-6" />
                <span className="text-xs">Triangle</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddShape('star')}
                className="flex flex-col items-center gap-1 h-auto py-2"
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                </svg>
                <span className="text-xs">Star</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddShape('arrow')}
                className="flex flex-col items-center gap-1 h-auto py-2"
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeWidth="2" />
                </svg>
                <span className="text-xs">Arrow</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddShape('diamond')}
                className="flex flex-col items-center gap-1 h-auto py-2"
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 2 L22 12 L12 22 L2 12 Z" strokeWidth="2" />
                </svg>
                <span className="text-xs">Diamond</span>
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Sparkles className="h-4 w-4 mr-2" />
              AI Fill
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>AI Fill Document</DialogTitle>
              <DialogDescription>
                Describe what content you'd like the AI to generate for your document
              </DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder="E.g., Create a comprehensive business plan for a tech startup focusing on AI-powered solutions..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="min-h-[120px]"
            />
            <Button onClick={handleAiFillSubmit} disabled={!aiPrompt.trim()}>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Content
            </Button>
          </DialogContent>
        </Dialog>

        <Separator orientation="vertical" className="h-6" />

        {/* Font Controls */}
        <Select value={fontFamily} onValueChange={onFontFamilyChange}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Font" />
          </SelectTrigger>
          <SelectContent>
            {fonts.map((font) => (
              <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={fontSize.toString()} onValueChange={(val) => onFontSizeChange(Number(val))}>
          <SelectTrigger className="w-[80px] h-9">
            <SelectValue placeholder="Size" />
          </SelectTrigger>
          <SelectContent>
            {fontSizes.map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}px
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Separator orientation="vertical" className="h-6" />

        {/* Text Alignment */}
        <ToggleGroup type="single" value={textAlign} onValueChange={onTextAlignChange}>
          <ToggleGroupItem value="left" aria-label="Align left" size="sm">
            <AlignLeft className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Align center" size="sm">
            <AlignCenter className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Align right" size="sm">
            <AlignRight className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="justify" aria-label="Justify" size="sm">
            <AlignJustify className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>

        <Separator orientation="vertical" className="h-6" />

        {/* Undo/Redo */}
        <Button variant="outline" size="sm" onClick={onUndo} disabled={!canUndo}>
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={onRedo} disabled={!canRedo}>
          <Redo className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Image Upload */}
        <div>
          <input
            key={imageUploadKey}
            type="file"
            id="image-upload"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <Button variant="outline" size="sm" asChild>
            <label htmlFor="image-upload" className="cursor-pointer">
              <ImagePlus className="h-4 w-4 mr-2" />
              Upload Image
            </label>
          </Button>
        </div>

        {/* Logo Upload */}
        <div>
          <input
            key={logoUploadKey}
            type="file"
            id="logo-upload"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
          />
          <Button variant="outline" size="sm" asChild>
            <label htmlFor="logo-upload" className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              Logo
            </label>
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={() => onZoomChange(Math.max(25, zoom - 25))}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground w-12 text-center">{zoom}%</span>
          <Button variant="outline" size="sm" onClick={() => onZoomChange(Math.min(200, zoom + 25))}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        <Button
          variant={showGrid ? "default" : "outline"}
          size="sm"
          onClick={() => onShowGridChange(!showGrid)}
        >
          <Grid3x3 className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Color Controls */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Palette className="h-4 w-4 mr-2" />
              Colors
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div>
                <Label htmlFor="bg-color">Background Color</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="bg-color"
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => onBackgroundColorChange(e.target.value)}
                    className="h-10 w-20"
                  />
                  <Input
                    value={backgroundColor}
                    onChange={(e) => onBackgroundColorChange(e.target.value)}
                    placeholder="#ffffff"
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="text-color">Text Color</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="text-color"
                    type="color"
                    value={textColor}
                    onChange={(e) => onTextColorChange(e.target.value)}
                    className="h-10 w-20"
                  />
                  <Input
                    value={textColor}
                    onChange={(e) => onTextColorChange(e.target.value)}
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <div className="ml-auto">
          <Button onClick={onDownloadPDF} size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
