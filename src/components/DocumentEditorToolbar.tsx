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
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

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
  onFillDocument: () => void;
  onAddSection: () => void;
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
}: DocumentEditorToolbarProps) {
  const [imageUploadKey, setImageUploadKey] = useState(0);
  const [logoUploadKey, setLogoUploadKey] = useState(0);

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

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex items-center gap-2 p-3 flex-wrap">
        {/* Template Selection */}
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Template:</Label>
          <Select value={selectedTemplate || undefined} onValueChange={onTemplateSelect}>
            <SelectTrigger className="w-[200px] h-9">
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

        {/* Content Actions */}
        <Button variant="outline" size="sm" onClick={onAddSection}>
          <Plus className="h-4 w-4 mr-2" />
          Add Section
        </Button>

        <Button variant="outline" size="sm" onClick={onFillDocument}>
          <Sparkles className="h-4 w-4 mr-2" />
          AI Fill Document
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
