import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download, Save, Eye, Edit3, Palette, Type, Image as ImageIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DocumentTemplate, AIContent } from "@/types/template";
import { TemplateRenderer } from "./TemplateRenderer";

interface DocumentEditorProps {
  template: DocumentTemplate;
  aiContent?: AIContent;
  onSave?: (data: AIContent) => void;
}

export function DocumentEditor({ template, aiContent, onSave }: DocumentEditorProps) {
  const { toast } = useToast();
  const [content, setContent] = useState<AIContent>(aiContent || {});
  const [editMode, setEditMode] = useState(true);
  const [activeTab, setActiveTab] = useState("edit");

  const handleSectionEdit = (sectionId: string, newContent: string) => {
    setContent(prev => ({
      ...prev,
      [sectionId]: newContent
    }));
  };

  const handleSave = () => {
    onSave?.(content);
    toast({
      title: "Saved",
      description: "Document saved successfully",
    });
  };

  const handleExport = () => {
    // For now, this creates a simple export
    // In production, you'd want to integrate with jsPDF or similar
    toast({
      title: "Export",
      description: "Export functionality coming soon",
    });
  };

  return (
    <div className="flex h-full">
      {/* Sidebar with Controls */}
      <div className="w-80 border-r bg-background overflow-y-auto">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
          <p className="text-sm text-muted-foreground">{template.description}</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="edit">
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </TabsTrigger>
            <TabsTrigger value="style">
              <Palette className="h-4 w-4 mr-2" />
              Style
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="p-4 space-y-4">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Quick Actions</h4>
              <div className="flex gap-2">
                <Button
                  variant={editMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEditMode(!editMode)}
                  className="flex-1"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  {editMode ? "Editing" : "View Only"}
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-4 space-y-3">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Editable Sections
                </h4>
                <p className="text-xs text-muted-foreground">
                  Click on any text in the document to edit it directly. Changes are saved automatically.
                </p>
                <div className="space-y-2">
                  {template.sections.filter(s => s.editable).map(section => (
                    <div key={section.id} className="text-xs p-2 bg-muted rounded">
                      <span className="font-medium">{section.id}</span>
                      <span className="text-muted-foreground ml-2">({section.type})</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="style" className="p-4 space-y-4">
            <Card>
              <CardContent className="p-4 space-y-3">
                <h4 className="font-medium text-sm">Template Colors</h4>
                
                <div className="space-y-2">
                  <Label className="text-xs">Primary Color</Label>
                  <div className="flex gap-2 items-center">
                    <div 
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: template.styles.primaryColor }}
                    />
                    <Input 
                      type="text" 
                      value={template.styles.primaryColor}
                      readOnly
                      className="flex-1 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Secondary Color</Label>
                  <div className="flex gap-2 items-center">
                    <div 
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: template.styles.secondaryColor }}
                    />
                    <Input 
                      type="text" 
                      value={template.styles.secondaryColor}
                      readOnly
                      className="flex-1 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Accent Color</Label>
                  <div className="flex gap-2 items-center">
                    <div 
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: template.styles.accentColor }}
                    />
                    <Input 
                      type="text" 
                      value={template.styles.accentColor}
                      readOnly
                      className="flex-1 text-xs"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Add Images
                </h4>
                <p className="text-xs text-muted-foreground">
                  Image upload and management coming soon.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        <div className="border-b bg-background p-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Button
              variant={editMode ? "default" : "outline"}
              size="sm"
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? <Edit3 className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {editMode ? "Edit Mode" : "Preview"}
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleSave} size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" onClick={handleExport} size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-muted p-8">
          <TemplateRenderer
            template={template}
            aiContent={content}
            editMode={editMode}
            onSectionEdit={handleSectionEdit}
          />
        </div>
      </div>
    </div>
  );
}
