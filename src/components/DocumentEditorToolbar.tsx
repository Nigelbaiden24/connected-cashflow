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
  Palette,
  Sparkles,
  Plus,
  FilePlus,
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
  PenTool,
  FileSignature,
  Check,
  Save,
  FolderOpen,
  BarChart3,
  ChevronDown,
  FileText,
  Type,
  Layout,
  Layers,
  MoreHorizontal,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ChartInsertDialog, ChartConfig } from "@/components/ChartInsertDialog";
import { cn } from "@/lib/utils";

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
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  pages: Array<{ id: string; name: string }>;
  currentPageId: string;
  onPageChange: (pageId: string) => void;
  onAddSignatureField?: () => void;
  onRequestSignature?: () => void;
  signatureFields?: Array<{ id: string; signed: boolean }>;
  onInsertTable: (rows: number, cols: number) => void;
  onInsertChart?: (chartConfig: ChartConfig) => void;
  onSaveDocument?: () => void;
  onLoadDocument?: (docId: string) => void;
  savedDocuments?: Array<{ id: string; name: string; savedAt: string }>;
}

// Toolbar button with tooltip
const ToolbarButton = ({
  onClick,
  disabled,
  tooltip,
  children,
  variant = "ghost",
  className,
}: {
  onClick?: () => void;
  disabled?: boolean;
  tooltip: string;
  children: React.ReactNode;
  variant?: "ghost" | "outline" | "default";
  className?: string;
}) => (
  <TooltipProvider delayDuration={200}>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={variant}
          size="sm"
          onClick={onClick}
          disabled={disabled}
          className={cn(
            "h-7 px-1.5 text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-all duration-150",
            variant === "default" && "text-primary-foreground hover:text-primary-foreground",
            className
          )}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

// Section wrapper for toolbar groups
const ToolbarSection = ({
  children,
  label,
  className,
}: {
  children: React.ReactNode;
  label?: string;
  className?: string;
}) => (
  <div className={cn("flex items-center gap-1", className)}>
    {label && (
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium mr-1 hidden xl:inline">
        {label}
      </span>
    )}
    {children}
  </div>
);

const ToolbarDivider = () => (
  <div className="h-5 w-px bg-border/40 mx-0.5" />
);

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
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  pages,
  currentPageId,
  onPageChange,
  onAddSignatureField,
  onRequestSignature,
  signatureFields = [],
  onInsertTable,
  onInsertChart,
  onSaveDocument,
  onLoadDocument,
  savedDocuments = [],
}: DocumentEditorToolbarProps) {
  const [imageUploadKey, setImageUploadKey] = useState(0);
  const [logoUploadKey, setLogoUploadKey] = useState(0);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [isSignatureDialogOpen, setIsSignatureDialogOpen] = useState(false);
  const [signatureName, setSignatureName] = useState("");
  const [signatureTitle, setSignatureTitle] = useState("");
  const [isTableDialogOpen, setIsTableDialogOpen] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [isChartDialogOpen, setIsChartDialogOpen] = useState(false);

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
    <div className="sticky top-0 z-[5] border-b border-border/40 bg-gradient-to-b from-background via-background to-background/95 backdrop-blur-xl shadow-sm">
      {/* Main Toolbar Row */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 flex-wrap min-h-[44px]">
        {/* File & Template Section */}
        <ToolbarSection>
          <Select value={selectedTemplate || undefined} onValueChange={onTemplateSelect}>
            <SelectTrigger className="h-7 w-[130px] text-[11px] font-medium bg-muted/50 border-border/50 hover:bg-muted transition-colors">
              <FileText className="h-3 w-3 mr-1 text-muted-foreground" />
              <SelectValue placeholder="Template" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border shadow-xl">
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id} className="text-[11px]">
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </ToolbarSection>

        <ToolbarDivider />

        {/* Page Navigation */}
        {selectedTemplate && (
          <>
            <ToolbarSection>
              <Select value={currentPageId} onValueChange={onPageChange}>
                <SelectTrigger className="h-7 w-[80px] text-[11px] bg-muted/50 border-border/50">
                  <Layers className="h-3 w-3 mr-1 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border shadow-xl z-50">
                  {pages.map((page) => (
                    <SelectItem key={page.id} value={page.id} className="text-[11px]">
                      {page.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <ToolbarButton tooltip="Add page" onClick={onAddPage}>
                <FilePlus className="h-3.5 w-3.5" />
              </ToolbarButton>

              <ToolbarButton tooltip="Add section" onClick={onAddSection}>
                <Plus className="h-3.5 w-3.5" />
              </ToolbarButton>
            </ToolbarSection>

            <ToolbarDivider />
          </>
        )}

        {/* History Controls */}
        <ToolbarSection>
          <ToolbarButton tooltip="Undo" onClick={onUndo} disabled={!canUndo}>
            <Undo className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton tooltip="Redo" onClick={onRedo} disabled={!canRedo}>
            <Redo className="h-3.5 w-3.5" />
          </ToolbarButton>
        </ToolbarSection>

        <ToolbarDivider />

        {/* Typography Section */}
        <ToolbarSection>
          <Select value={fontFamily} onValueChange={onFontFamilyChange}>
            <SelectTrigger className="h-7 w-[90px] text-[11px] bg-muted/50 border-border/50">
              <SelectValue placeholder="Font" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border shadow-xl">
              {fonts.map((font) => (
                <SelectItem key={font} value={font} style={{ fontFamily: font }} className="text-[11px]">
                  {font}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={fontSize.toString()} onValueChange={(val) => onFontSizeChange(Number(val))}>
            <SelectTrigger className="h-7 w-[55px] text-[11px] bg-muted/50 border-border/50">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border shadow-xl">
              {fontSizes.map((size) => (
                <SelectItem key={size} value={size.toString()} className="text-[11px]">
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </ToolbarSection>

        <ToolbarDivider />

        {/* Text Alignment */}
        <ToolbarSection>
          <ToggleGroup
            type="single"
            value={textAlign}
            onValueChange={onTextAlignChange}
            className="bg-muted/30 rounded p-0.5"
          >
            <ToggleGroupItem value="left" aria-label="Left" className="h-6 w-6 data-[state=on]:bg-background data-[state=on]:shadow-sm">
              <AlignLeft className="h-3 w-3" />
            </ToggleGroupItem>
            <ToggleGroupItem value="center" aria-label="Center" className="h-6 w-6 data-[state=on]:bg-background data-[state=on]:shadow-sm">
              <AlignCenter className="h-3 w-3" />
            </ToggleGroupItem>
            <ToggleGroupItem value="right" aria-label="Right" className="h-6 w-6 data-[state=on]:bg-background data-[state=on]:shadow-sm">
              <AlignRight className="h-3 w-3" />
            </ToggleGroupItem>
            <ToggleGroupItem value="justify" aria-label="Justify" className="h-6 w-6 data-[state=on]:bg-background data-[state=on]:shadow-sm">
              <AlignJustify className="h-3 w-3" />
            </ToggleGroupItem>
          </ToggleGroup>
        </ToolbarSection>

        <ToolbarDivider />

        {/* Insert Menu */}
        <ToolbarSection>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[11px] font-medium text-muted-foreground hover:text-foreground"
              >
                <Layout className="h-3.5 w-3.5 mr-1" />
                Insert
                <ChevronDown className="h-2.5 w-2.5 ml-1 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 bg-popover border-border shadow-xl">
              <DropdownMenuLabel className="text-xs text-muted-foreground">Media</DropdownMenuLabel>
              <DropdownMenuItem asChild className="text-xs cursor-pointer">
                <label htmlFor="image-upload" className="flex items-center cursor-pointer w-full">
                  <ImagePlus className="h-4 w-4 mr-2" />
                  Upload Image
                </label>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="text-xs cursor-pointer">
                <label htmlFor="logo-upload" className="flex items-center cursor-pointer w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Logo
                </label>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">Elements</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setIsTableDialogOpen(true)} className="text-xs cursor-pointer">
                <Grid3x3 className="h-4 w-4 mr-2" />
                Insert Table
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsChartDialogOpen(true)} className="text-xs cursor-pointer">
                <BarChart3 className="h-4 w-4 mr-2" />
                Insert Chart
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">Shapes</DropdownMenuLabel>
              <div className="grid grid-cols-4 gap-1 p-2">
                <Button variant="ghost" size="sm" onClick={() => onAddShape('rectangle')} className="h-9 w-9 p-0">
                  <Square className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onAddShape('circle')} className="h-9 w-9 p-0">
                  <Circle className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onAddShape('triangle')} className="h-9 w-9 p-0">
                  <Triangle className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onAddShape('star')} className="h-9 w-9 p-0">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                  </svg>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onAddShape('arrow')} className="h-9 w-9 p-0">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeWidth="2" />
                  </svg>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onAddShape('diamond')} className="h-9 w-9 p-0">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 2 L22 12 L12 22 L2 12 Z" strokeWidth="2" />
                  </svg>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onAddShape('line')} className="h-9 w-9 p-0">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M5 19 L19 5" strokeWidth="2" />
                  </svg>
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Hidden file inputs */}
          <input
            key={imageUploadKey}
            type="file"
            id="image-upload"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <input
            key={logoUploadKey}
            type="file"
            id="logo-upload"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
          />
        </ToolbarSection>

        {/* Colors */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-1.5 text-muted-foreground hover:text-foreground">
              <Palette className="h-3.5 w-3.5" />
              <div className="flex ml-1 gap-0.5">
                <div className="h-2.5 w-2.5 rounded-sm border border-border/50" style={{ backgroundColor: backgroundColor }} />
                <div className="h-2.5 w-2.5 rounded-sm border border-border/50" style={{ backgroundColor: textColor }} />
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 bg-popover border-border shadow-xl">
            <div className="space-y-4">
              <div>
                <Label htmlFor="bg-color" className="text-xs font-medium">Background Color</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="bg-color"
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => onBackgroundColorChange(e.target.value)}
                    className="h-9 w-14 p-1 cursor-pointer"
                  />
                  <Input
                    value={backgroundColor}
                    onChange={(e) => onBackgroundColorChange(e.target.value)}
                    placeholder="#ffffff"
                    className="flex-1 h-9 text-xs font-mono"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="text-color" className="text-xs font-medium">Text Color</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="text-color"
                    type="color"
                    value={textColor}
                    onChange={(e) => onTextColorChange(e.target.value)}
                    className="h-9 w-14 p-1 cursor-pointer"
                  />
                  <Input
                    value={textColor}
                    onChange={(e) => onTextColorChange(e.target.value)}
                    placeholder="#000000"
                    className="flex-1 h-9 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <ToolbarDivider />

        {/* AI Fill */}
        <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 bg-gradient-to-r from-violet-500/10 to-purple-500/10 hover:from-violet-500/20 hover:to-purple-500/20 text-violet-600 dark:text-violet-400 border border-violet-500/20"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              <span className="text-[11px] font-medium">AI</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-500" />
                AI Document Generator
              </DialogTitle>
              <DialogDescription>
                Describe the content you'd like AI to generate for your document
              </DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder="E.g., Create a comprehensive business plan for a tech startup focusing on AI-powered solutions..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="min-h-[120px] text-sm"
            />
            <Button
              onClick={handleAiFillSubmit}
              disabled={!aiPrompt.trim()}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Content
            </Button>
          </DialogContent>
        </Dialog>

        {/* E-Signature */}
        {selectedTemplate && (
          <>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-1.5 text-muted-foreground hover:text-foreground relative">
                  <FileSignature className="h-3.5 w-3.5" />
                  {signatureFields.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[9px] rounded-full h-3.5 w-3.5 flex items-center justify-center font-medium">
                      {signatureFields.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 bg-popover border-border shadow-xl">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm">E-Signature</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Add signature fields and request signatures
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onAddSignatureField}
                      className="w-full justify-start text-xs"
                    >
                      <PenTool className="h-4 w-4 mr-2" />
                      Add Signature Field
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setIsSignatureDialogOpen(true)}
                      className="w-full justify-start text-xs"
                      disabled={signatureFields.length === 0}
                    >
                      <FileSignature className="h-4 w-4 mr-2" />
                      Request Signatures
                    </Button>
                  </div>
                  {signatureFields.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-xs font-medium mb-2">Signature Status</p>
                      <div className="space-y-1">
                        {signatureFields.map((field, idx) => (
                          <div key={field.id} className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Field {idx + 1}</span>
                            {field.signed ? (
                              <span className="text-green-600 flex items-center gap-1">
                                <Check className="h-3 w-3" />
                                Signed
                              </span>
                            ) : (
                              <span className="text-amber-600">Pending</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            <Dialog open={isSignatureDialogOpen} onOpenChange={setIsSignatureDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Document Signatures</DialogTitle>
                  <DialogDescription>
                    Send this document for electronic signature
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="signer-name" className="text-xs">Signer Name</Label>
                    <Input
                      id="signer-name"
                      placeholder="Enter signer's full name"
                      value={signatureName}
                      onChange={(e) => setSignatureName(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signer-title" className="text-xs">Signer Title/Position</Label>
                    <Input
                      id="signer-title"
                      placeholder="e.g., CEO, Director, Manager"
                      value={signatureTitle}
                      onChange={(e) => setSignatureTitle(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg border">
                    <h4 className="font-semibold text-xs mb-2">Elite Features Included:</h4>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li>• Secure encrypted signatures</li>
                      <li>• Legally binding digital certificates</li>
                      <li>• Audit trail and timestamp logging</li>
                    </ul>
                  </div>
                  <Button
                    onClick={() => {
                      if (onRequestSignature) {
                        onRequestSignature();
                        setIsSignatureDialogOpen(false);
                        setSignatureName("");
                        setSignatureTitle("");
                      }
                    }}
                    disabled={!signatureName.trim()}
                    className="w-full"
                  >
                    <FileSignature className="h-4 w-4 mr-2" />
                    Send for Signature
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}

        <ToolbarDivider />

        {/* Zoom Controls */}
        <ToolbarSection>
          <div className="flex items-center gap-0.5 bg-muted/30 rounded px-0.5 py-0.5">
            <ToolbarButton tooltip="Zoom out" onClick={() => onZoomChange(Math.max(25, zoom - 25))}>
              <ZoomOut className="h-3 w-3" />
            </ToolbarButton>
            <span className="text-[10px] font-medium text-muted-foreground w-8 text-center tabular-nums">
              {zoom}%
            </span>
            <ToolbarButton tooltip="Zoom in" onClick={() => onZoomChange(Math.min(200, zoom + 25))}>
              <ZoomIn className="h-3 w-3" />
            </ToolbarButton>
          </div>
        </ToolbarSection>

        {/* Right Actions */}
        <div className="ml-auto flex items-center gap-1">
          {onSaveDocument && (
            <ToolbarButton tooltip="Save" onClick={onSaveDocument} variant="outline">
              <Save className="h-3.5 w-3.5" />
            </ToolbarButton>
          )}
          
          {onLoadDocument && savedDocuments.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 px-1.5">
                  <FolderOpen className="h-3.5 w-3.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 bg-popover border-border shadow-xl">
                <div className="space-y-2">
                  <h4 className="font-semibold text-xs">Saved Documents</h4>
                  {savedDocuments.map((doc) => (
                    <Button
                      key={doc.id}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-left h-auto py-2"
                      onClick={() => onLoadDocument(doc.id)}
                    >
                      <div className="flex flex-col items-start">
                        <span className="text-xs font-medium">{doc.name}</span>
                        <span className="text-[10px] text-muted-foreground">{doc.savedAt}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}

          <Button
            onClick={onDownloadPDF}
            size="sm"
            className="h-7 px-3 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm text-[11px] font-medium"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export
          </Button>
        </div>
      </div>

      {/* Table Dialog */}
      <Dialog open={isTableDialogOpen} onOpenChange={setIsTableDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Grid3x3 className="h-5 w-5" />
              Insert Table
            </DialogTitle>
            <DialogDescription>
              Configure your table dimensions
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <Label htmlFor="table-rows" className="text-xs">Rows</Label>
              <Input
                id="table-rows"
                type="number"
                min={1}
                max={20}
                value={tableRows}
                onChange={(e) => setTableRows(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="table-cols" className="text-xs">Columns</Label>
              <Input
                id="table-cols"
                type="number"
                min={1}
                max={10}
                value={tableCols}
                onChange={(e) => setTableCols(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
                className="mt-1.5"
              />
            </div>
          </div>
          <Button
            className="mt-4"
            onClick={() => {
              onInsertTable(tableRows, tableCols);
              setIsTableDialogOpen(false);
            }}
          >
            <Grid3x3 className="h-4 w-4 mr-2" />
            Insert Table
          </Button>
        </DialogContent>
      </Dialog>

      {/* Chart Dialog */}
      {onInsertChart && (
        <ChartInsertDialog
          open={isChartDialogOpen}
          onOpenChange={setIsChartDialogOpen}
          onInsertChart={onInsertChart}
        />
      )}
    </div>
  );
}
