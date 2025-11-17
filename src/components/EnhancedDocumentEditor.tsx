import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GripVertical, Edit2, Trash2, Plus, Wand2 } from "lucide-react";
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

interface EnhancedDocumentEditorProps {
  sections: HeaderSection[];
  onSectionsChange: (sections: HeaderSection[]) => void;
  onContentChange: (sectionId: string, content: string) => void;
  backgroundColor?: string;
  logoUrl?: string;
  uploadedImages?: Array<{ id: string; url: string; x: number; y: number; width: number; height: number }>;
  onImagePositionChange?: (id: string, x: number, y: number) => void;
  onImageSizeChange?: (id: string, width: number, height: number) => void;
  onImageRemove?: (id: string) => void;
}

function SortableSection({
  section,
  onEdit,
  onDelete,
  onGenerateContent,
  isFirst,
}: {
  section: HeaderSection;
  onEdit: () => void;
  onDelete: () => void;
  onGenerateContent: () => void;
  isFirst: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [isHovered, setIsHovered] = useState(false);

  const renderContent = () => {
    if (section.type === "heading" || section.type === "subheading") {
      return (
        <h2 className="text-2xl font-bold text-primary mb-4">
          {section.content || section.title}
        </h2>
      );
    }
    if (section.type === "body") {
      return (
        <div className="prose max-w-none">
          <p className="text-foreground/80 whitespace-pre-wrap">
            {section.content || section.placeholder || "Add content..."}
          </p>
        </div>
      );
    }
    if (section.type === "list") {
      const items = section.content ? section.content.split("\n").filter(Boolean) : [];
      return (
        <ul className="list-disc list-inside space-y-2">
          {items.map((item, idx) => (
            <li key={idx} className="text-foreground/80">
              {item.replace(/^[-•]\s*/, "")}
            </li>
          ))}
        </ul>
      );
    }
    return null;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group mb-6 p-4 rounded-lg border-2 border-transparent hover:border-primary/20 transition-all bg-background/50"
    >
      <div className="flex items-start gap-2">
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 mt-1 cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
        </div>
        
        <div className="flex-1 min-w-0">{renderContent()}</div>

        {isHovered && (
          <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
      </div>
    </div>
  );
}

export function EnhancedDocumentEditor({
  sections,
  onSectionsChange,
  onContentChange,
  backgroundColor = "#ffffff",
  logoUrl,
  uploadedImages = [],
  onImagePositionChange,
  onImageSizeChange,
  onImageRemove,
}: EnhancedDocumentEditorProps) {
  const [editingSection, setEditingSection] = useState<HeaderSection | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newSectionContent, setNewSectionContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      const newSections = arrayMove(sections, oldIndex, newIndex);
      onSectionsChange(newSections);
      toast({
        title: "Section moved",
        description: "Document structure updated",
      });
    }
  };

  const handleEditSection = (section: HeaderSection) => {
    setEditingSection(section);
  };

  const handleSaveEdit = () => {
    if (editingSection) {
      onContentChange(editingSection.id, editingSection.content);
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
      isCustom: true,
    };
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
      style={{ backgroundColor }}
    >
      {logoUrl && (
        <div className="mb-8">
          <img src={logoUrl} alt="Logo" className="h-16 object-contain" />
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          {sections.map((section, index) => (
            <SortableSection
              key={section.id}
              section={section}
              onEdit={() => handleEditSection(section)}
              onDelete={() => handleDeleteSection(section.id)}
              onGenerateContent={() => handleGenerateContent(section)}
              isFirst={index === 0}
            />
          ))}
        </SortableContext>
      </DndContext>

      <Button
        onClick={() => setIsAddDialogOpen(true)}
        className="mt-6"
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
