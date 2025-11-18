import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Wand2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { HeaderSection } from "@/hooks/useDocumentSections";
import { DraggableImage } from "@/components/DraggableImage";
import { DraggableSection } from "@/components/DraggableSection";
import { DraggableShape } from "@/components/DraggableShape";

interface EnhancedDocumentEditorProps {
  sections: HeaderSection[];
  onSectionsChange: (sections: HeaderSection[]) => void;
  onContentChange: (sectionId: string, content: string) => void;
  backgroundColor?: string;
  textColor?: string;
  logoUrl?: string;
  uploadedImages?: Array<{ id: string; url: string; x: number; y: number; width: number; height: number }>;
  onImagePositionChange?: (id: string, x: number, y: number) => void;
  onImageSizeChange?: (id: string, width: number, height: number) => void;
  onImageRemove?: (id: string) => void;
  shapes?: Array<{ id: string; type: string; x: number; y: number; width: number; height: number; color: string }>;
  onShapePositionChange?: (id: string, x: number, y: number) => void;
  onShapeSizeChange?: (id: string, width: number, height: number) => void;
  onShapeRemove?: (id: string) => void;
  onShapeColorChange?: (id: string, color: string) => void;
  currentPageId?: string;
}

export function EnhancedDocumentEditor({
  sections,
  onSectionsChange,
  onContentChange,
  backgroundColor = "#ffffff",
  textColor = "#000000",
  logoUrl,
  uploadedImages = [],
  onImagePositionChange,
  onImageSizeChange,
  onImageRemove,
  shapes = [],
  onShapePositionChange,
  onShapeSizeChange,
  onShapeRemove,
  onShapeColorChange,
  currentPageId = "page-1",
}: EnhancedDocumentEditorProps) {
  const [editingSection, setEditingSection] = useState<HeaderSection | null>(null);
  const [editTextColor, setEditTextColor] = useState("#000000");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newSectionContent, setNewSectionContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleSectionPositionChange = (id: string, x: number, y: number) => {
    const newSections = sections.map((s) =>
      s.id === id ? { ...s, x, y } : s
    );
    onSectionsChange(newSections);
  };

  const handleSectionSizeChange = (id: string, width: number, height: number) => {
    const newSections = sections.map((s) =>
      s.id === id ? { ...s, width, height } : s
    );
    onSectionsChange(newSections);
  };

  const handleEditSection = (section: HeaderSection) => {
    setEditingSection(section);
    setEditTextColor(section.textColor || textColor || "#000000");
  };

  const handleSaveEdit = () => {
    if (editingSection) {
      const updatedSections = sections.map((s) =>
        s.id === editingSection.id
          ? { ...s, content: editingSection.content, textColor: editTextColor }
          : s
      );
      onSectionsChange(updatedSections);
      setEditingSection(null);
      toast({
        title: "Section updated",
        description: "Changes saved successfully",
      });
    }
  };

  const handleDeleteSection = (sectionId: string) => {
    const newSections = sections.filter((s) => s.id !== sectionId);
    onSectionsChange(newSections);
    toast({
      title: "Section deleted",
      description: "Section removed from document",
    });
  };

  const handleAddSection = () => {
    const newSection: HeaderSection = {
      id: `custom-${Date.now()}`,
      title: newSectionTitle,
      content: newSectionContent,
      type: "body",
      editable: true,
      placeholder: "Enter content...",
      order: sections.length,
      x: 50,
      y: sections.length > 0 ? Math.max(...sections.map(s => s.y + s.height)) + 20 : 50,
      width: 600,
      height: 100,
      isCustom: true,
      pageId: currentPageId,
      textColor: textColor,
    } as any;
    onSectionsChange([...sections, newSection]);
    setIsAddDialogOpen(false);
    setNewSectionTitle("");
    setNewSectionContent("");
    toast({
      title: "Section added",
      description: "New section created successfully",
    });
  };

  const handleGenerateContent = async (section: HeaderSection) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("financial-chat", {
        body: {
          message: `Generate professional content for a document section titled "${section.title}". Provide detailed, well-structured content suitable for a financial or business document.`,
        },
      });

      if (error) throw error;

      const generatedContent = data.response || "";
      onContentChange(section.id, generatedContent);
      toast({
        title: "Content generated",
        description: "AI has generated content for this section",
      });
    } catch (error) {
      console.error("Error generating content:", error);
      toast({
        title: "Generation failed",
        description: "Could not generate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      className="w-full h-full overflow-auto p-8 relative"
      style={{ backgroundColor, minHeight: "1000px" }}
    >
      {logoUrl && (
        <div className="absolute top-8 left-8 z-10">
          <img src={logoUrl} alt="Logo" className="h-16 object-contain" />
        </div>
      )}

      {sections.map((section, index) => (
        <DraggableSection
          key={section.id}
          id={section.id}
          title={section.title}
          content={section.content}
          type={section.type}
          placeholder={section.placeholder}
          x={section.x}
          y={section.y}
          width={section.width}
          height={section.height}
          isFirst={index === 0}
          textColor={section.textColor || textColor}
          onPositionChange={handleSectionPositionChange}
          onSizeChange={handleSectionSizeChange}
          onEdit={() => handleEditSection(section)}
          onDelete={() => handleDeleteSection(section.id)}
          onGenerateContent={() => handleGenerateContent(section)}
        />
      ))}

      <Button
        onClick={() => setIsAddDialogOpen(true)}
        className="absolute bottom-8 left-8 z-10"
        variant="outline"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Custom Section
      </Button>

      {uploadedImages.map((img) => (
        <DraggableImage
          key={img.id}
          id={img.id}
          src={img.url}
          x={img.x}
          y={img.y}
          width={img.width}
          height={img.height}
          onPositionChange={(id, x, y) => onImagePositionChange?.(id, x, y)}
          onSizeChange={(id, width, height) => onImageSizeChange?.(id, width, height)}
          onRemove={(id) => onImageRemove?.(id)}
        />
      ))}

      {/* Draggable Shapes */}
      {shapes.map((shape) => (
        <DraggableShape
          key={shape.id}
          id={shape.id}
          type={shape.type}
          x={shape.x}
          y={shape.y}
          width={shape.width}
          height={shape.height}
          color={shape.color}
          onPositionChange={(id, x, y) => onShapePositionChange?.(id, x, y)}
          onSizeChange={(id, width, height) => onShapeSizeChange?.(id, width, height)}
          onRemove={(id) => onShapeRemove?.(id)}
          onColorChange={(id, color) => onShapeColorChange?.(id, color)}
        />
      ))}

      {/* Edit Dialog */}
      <Dialog open={!!editingSection} onOpenChange={() => setEditingSection(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
            <DialogDescription>Modify the section content</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={editingSection?.title || ""}
                onChange={(e) =>
                  setEditingSection((prev) =>
                    prev ? { ...prev, title: e.target.value } : null
                  )
                }
              />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea
                value={editingSection?.content || ""}
                onChange={(e) =>
                  setEditingSection((prev) =>
                    prev ? { ...prev, content: e.target.value } : null
                  )
                }
                rows={10}
              />
            </div>
            <div className="space-y-2">
              <Label>Text Color</Label>
              <div className="flex gap-2 items-center">
                <Input
                  type="color"
                  value={editTextColor}
                  onChange={(e) => setEditTextColor(e.target.value)}
                  className="w-20 h-10"
                />
                <span className="text-sm text-muted-foreground">{editTextColor}</span>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingSection(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Section</DialogTitle>
            <DialogDescription>Create a new section in your document</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Section Title</Label>
              <Input
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                placeholder="e.g., Risk Analysis"
              />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea
                value={newSectionContent}
                onChange={(e) => setNewSectionContent(e.target.value)}
                placeholder="Enter section content..."
                rows={6}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddSection} disabled={!newSectionTitle}>
                Add Section
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {isGenerating && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <Wand2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground">Generating content with AI...</p>
          </div>
        </div>
      )}
    </div>
  );
}
