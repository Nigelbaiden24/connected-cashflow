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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GripVertical,
  Plus,
  Edit,
  Trash2,
  Sparkles,
  Wand2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface HeaderSection {
  id: string;
  title: string;
  content: string;
  order: number;
  isCustom?: boolean;
}

interface DraggableHeaderManagerProps {
  sections: HeaderSection[];
  onSectionsChange: (sections: HeaderSection[]) => void;
  documentType: string;
}

function SortableHeader({
  section,
  onEdit,
  onDelete,
  onGenerateContent,
  isGenerating,
}: {
  section: HeaderSection;
  onEdit: (section: HeaderSection) => void;
  onDelete: (id: string) => void;
  onGenerateContent: (section: HeaderSection) => void;
  isGenerating: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="p-4 mb-2 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing mt-1"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">{section.title}</h4>
              {section.isCustom && (
                <Badge variant="secondary" className="text-xs">
                  Custom
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {isExpanded && (
            <div className="space-y-2 animate-accordion-down">
              <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md max-h-40 overflow-y-auto">
                {section.content || "No content yet"}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onGenerateContent(section)}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      AI Generate
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm" onClick={() => onEdit(section)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                {section.isCustom && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(section.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export function DraggableHeaderManager({
  sections,
  onSectionsChange,
  documentType,
}: DraggableHeaderManagerProps) {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<HeaderSection | null>(null);
  const [newHeaderTitle, setNewHeaderTitle] = useState("");
  const [newHeaderContent, setNewHeaderContent] = useState("");
  const [isGeneratingHeader, setIsGeneratingHeader] = useState(false);
  const [generatingSectionId, setGeneratingSectionId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);

      const newSections = arrayMove(sections, oldIndex, newIndex).map((s, idx) => ({
        ...s,
        order: idx,
      }));

      onSectionsChange(newSections);
      toast({
        title: "Section reordered",
        description: "Header position updated successfully.",
      });
    }
  };

  const generateAISuggestions = async () => {
    setIsGeneratingHeader(true);
    try {
      const { data, error } = await supabase.functions.invoke("financial-chat", {
        body: {
          messages: [
            {
              role: "system",
              content: `You are a professional ${documentType} document assistant. Suggest creative and relevant section titles for this type of document. Return ONLY a JSON array of 5 title suggestions, like: ["Title 1", "Title 2", ...]`,
            },
            {
              role: "user",
              content: `Suggest 5 creative section titles for a ${documentType} document.`,
            },
          ],
        },
      });

      if (error) throw error;

      // Parse AI response for suggestions
      const suggestions = data.generatedText.match(/"([^"]+)"/g)?.map((s: string) => s.replace(/"/g, "")) || [];
      
      if (suggestions.length > 0) {
        toast({
          title: "AI Suggestions",
          description: `Try: ${suggestions.slice(0, 3).join(", ")}`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error getting suggestions",
        description: "Using default suggestions instead.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingHeader(false);
    }
  };

  const handleAddSection = async () => {
    if (!newHeaderTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a header title.",
        variant: "destructive",
      });
      return;
    }

    const newSection: HeaderSection = {
      id: `custom-${Date.now()}`,
      title: newHeaderTitle,
      content: newHeaderContent,
      order: sections.length,
      isCustom: true,
    };

    onSectionsChange([...sections, newSection]);
    
    toast({
      title: "Section added",
      description: `"${newHeaderTitle}" has been added to your document.`,
    });

    setNewHeaderTitle("");
    setNewHeaderContent("");
    setIsAddDialogOpen(false);
  };

  const handleEditSection = () => {
    if (!editingSection) return;

    const updatedSections = sections.map((s) =>
      s.id === editingSection.id ? editingSection : s
    );

    onSectionsChange(updatedSections);
    
    toast({
      title: "Section updated",
      description: "Changes saved successfully.",
    });

    setEditingSection(null);
    setIsEditDialogOpen(false);
  };

  const handleDeleteSection = (id: string) => {
    const updatedSections = sections
      .filter((s) => s.id !== id)
      .map((s, idx) => ({ ...s, order: idx }));

    onSectionsChange(updatedSections);
    
    toast({
      title: "Section removed",
      description: "Custom section has been deleted.",
    });
  };

  const handleGenerateContent = async (section: HeaderSection) => {
    setGeneratingSectionId(section.id);
    try {
      const { data, error } = await supabase.functions.invoke("financial-chat", {
        body: {
          messages: [
            {
              role: "system",
              content: `You are a professional ${documentType} document writer. Generate comprehensive, professional content for document sections.`,
            },
            {
              role: "user",
              content: `Write detailed, professional content for a section titled "${section.title}" in a ${documentType} document. Make it comprehensive but concise (2-3 paragraphs).`,
            },
          ],
        },
      });

      if (error) throw error;

      const updatedSections = sections.map((s) =>
        s.id === section.id ? { ...s, content: data.generatedText } : s
      );

      onSectionsChange(updatedSections);
      
      toast({
        title: "Content generated",
        description: `AI content added to "${section.title}".`,
      });
    } catch (error: any) {
      toast({
        title: "Error generating content",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGeneratingSectionId(null);
    }
  };

  const openEditDialog = (section: HeaderSection) => {
    setEditingSection({ ...section });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Document Sections</h3>
          <p className="text-sm text-muted-foreground">
            Drag to reorder, click to expand and edit
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Custom Section
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Custom Section</DialogTitle>
              <DialogDescription>
                Create a new section for your document. Use AI suggestions for inspiration!
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Label htmlFor="title">Section Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Executive Summary, Risk Assessment..."
                    value={newHeaderTitle}
                    onChange={(e) => setNewHeaderTitle(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={generateAISuggestions}
                  disabled={isGeneratingHeader}
                >
                  {isGeneratingHeader ? (
                    <>
                      <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                      Thinking...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      AI Suggest
                    </>
                  )}
                </Button>
              </div>
              <div>
                <Label htmlFor="content">Content (Optional)</Label>
                <Textarea
                  id="content"
                  placeholder="Add content now or generate it later with AI..."
                  value={newHeaderContent}
                  onChange={(e) => setNewHeaderContent(e.target.value)}
                  rows={6}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddSection}>Add Section</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {sections.map((section) => (
              <SortableHeader
                key={section.id}
                section={section}
                onEdit={openEditDialog}
                onDelete={handleDeleteSection}
                onGenerateContent={handleGenerateContent}
                isGenerating={generatingSectionId === section.id}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
            <DialogDescription>
              Update the section title and content.
            </DialogDescription>
          </DialogHeader>
          {editingSection && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Section Title</Label>
                <Input
                  id="edit-title"
                  value={editingSection.title}
                  onChange={(e) =>
                    setEditingSection({ ...editingSection, title: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-content">Content</Label>
                <Textarea
                  id="edit-content"
                  value={editingSection.content}
                  onChange={(e) =>
                    setEditingSection({ ...editingSection, content: e.target.value })
                  }
                  rows={8}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditSection}>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
