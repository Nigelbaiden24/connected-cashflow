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
  PenTool,
  FileSignature,
  Check,
  Save,
  FolderOpen,
  BarChart3,
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
import { ChartInsertDialog, ChartConfig } from "@/components/ChartInsertDialog";

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
  onLoadDocument?: () => void;
  savedDocuments?: Array<{ id: string; name: string; savedAt: string }>;
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
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-[5]">
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
        {selectedTemplate && (
          <>
            <Select value={currentPageId} onValueChange={onPageChange}>
              <SelectTrigger className="w-[120px] h-9 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border z-50">
                {pages.map((page) => (
                  <SelectItem key={page.id} value={page.id}>
                    {page.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddShape('line')}
                className="flex flex-col items-center gap-1 h-auto py-2"
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M5 19 L19 5" strokeWidth="2" />
                </svg>
                <span className="text-xs">Line</span>
              </Button>
            </div>
          </PopoverContent>
        </Popover>
          </>
        )}

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

        <Dialog open={isTableDialogOpen} onOpenChange={setIsTableDialogOpen}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsTableDialogOpen(true)}
          >
            <Grid3x3 className="h-4 w-4 mr-2" />
            Table
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Insert Table</DialogTitle>
              <DialogDescription>
                Choose the number of rows and columns for your data table.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <Label htmlFor="table-rows">Rows</Label>
                <Input
                  id="table-rows"
                  type="number"
                  min={1}
                  max={20}
                  value={tableRows}
                  onChange={(e) => setTableRows(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="table-cols">Columns</Label>
                <Input
                  id="table-cols"
                  type="number"
                  min={1}
                  max={10}
                  value={tableCols}
                  onChange={(e) => setTableCols(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
                  className="mt-1"
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

        {/* Chart Insert Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsChartDialogOpen(true)}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Charts
        </Button>

        {onInsertChart && (
          <ChartInsertDialog
            open={isChartDialogOpen}
            onOpenChange={setIsChartDialogOpen}
            onInsertChart={onInsertChart}
          />
        )}

        <Separator orientation="vertical" className="h-6" />

        {/* E-Signature Controls */}
        {selectedTemplate && (
          <>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="relative">
                  <FileSignature className="h-4 w-4 mr-2" />
                  E-Signature
                  {signatureFields.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {signatureFields.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">E-Signature Options</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add signature fields and request signatures for your document
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onAddSignatureField}
                      className="w-full justify-start"
                    >
                      <PenTool className="h-4 w-4 mr-2" />
                      Add Signature Field
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        setIsSignatureDialogOpen(true);
                      }}
                      className="w-full justify-start"
                      disabled={signatureFields.length === 0}
                    >
                      <FileSignature className="h-4 w-4 mr-2" />
                      Request Signatures
                    </Button>
                  </div>
                  {signatureFields.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium mb-2">Signature Status</p>
                      <div className="space-y-1">
                        {signatureFields.map((field, idx) => (
                          <div key={field.id} className="flex items-center justify-between text-sm">
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
                    Send this document for electronic signature. Recipients will receive an email with a secure signing link.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="signer-name">Signer Name</Label>
                    <Input
                      id="signer-name"
                      placeholder="Enter signer's full name"
                      value={signatureName}
                      onChange={(e) => setSignatureName(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signer-title">Signer Title/Position</Label>
                    <Input
                      id="signer-title"
                      placeholder="e.g., CEO, Director, Manager"
                      value={signatureTitle}
                      onChange={(e) => setSignatureTitle(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Elite Features Included:</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Secure encrypted signatures</li>
                      <li>• Legally binding digital certificates</li>
                      <li>• Audit trail and timestamp logging</li>
                      <li>• Multi-party signature workflow</li>
                      <li>• Automatic status tracking</li>
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

        <div className="ml-auto flex items-center gap-2">
          {onSaveDocument && (
            <Button onClick={onSaveDocument} size="sm" variant="outline">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          )}
          {onLoadDocument && savedDocuments.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button size="sm" variant="outline">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Load
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Saved Documents</h4>
                  {savedDocuments.map((doc) => (
                    <Button
                      key={doc.id}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-left"
                      onClick={() => {
                        onLoadDocument();
                      }}
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{doc.name}</span>
                        <span className="text-xs text-muted-foreground">{doc.savedAt}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}
          <Button onClick={onDownloadPDF} size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
