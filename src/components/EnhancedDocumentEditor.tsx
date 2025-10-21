import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download, Save, Eye, Edit3, Palette, Type, Image as ImageIcon,
  AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline,
  Plus, Trash2, Move, Shapes, Circle, Square, ChevronUp, ChevronDown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DocumentTemplate, AIContent } from "@/types/template";
import { TemplateRenderer } from "./TemplateRenderer";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EnhancedDocumentEditorProps {
  template: DocumentTemplate;
  aiContent?: AIContent;
  onSave?: (data: AIContent) => void;
}

export function EnhancedDocumentEditor({ template, aiContent, onSave }: EnhancedDocumentEditorProps) {
  const { toast } = useToast();
  const [content, setContent] = useState<AIContent>(aiContent || {});
  const [editMode, setEditMode] = useState(true);
  const [activeTab, setActiveTab] = useState("edit");
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [fontSize, setFontSize] = useState("16");
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

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
    toast({
      title: "Exporting",
      description: "Preparing your document for download...",
    });
  };

  const colorPresets = [
    "#000000", "#374151", "#7c3aed", "#3b82f6", "#059669", 
    "#f59e0b", "#ef4444", "#ec4899", "#ffffff"
  ];

  return (
    <div className="flex h-full">
      {/* Enhanced Sidebar */}
      <div className="w-80 border-r bg-background">
        <ScrollArea className="h-full">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
            <p className="text-sm text-muted-foreground">{template.description}</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-3 m-2">
              <TabsTrigger value="edit">
                <Edit3 className="h-4 w-4 mr-1" />
                Edit
              </TabsTrigger>
              <TabsTrigger value="design">
                <Palette className="h-4 w-4 mr-1" />
                Design
              </TabsTrigger>
              <TabsTrigger value="insert">
                <Plus className="h-4 w-4 mr-1" />
                Insert
              </TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="p-4 space-y-4">
              <Card className="p-4 space-y-3">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Text Formatting
                </h4>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Underline className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <AlignCenter className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <AlignRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Font Size</Label>
                  <Input 
                    type="number" 
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                    className="w-full"
                  />
                </div>
              </Card>

              <Card className="p-4 space-y-3">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Move className="h-4 w-4" />
                  Layers
                </h4>
                <ScrollArea className="h-48">
                  {template.sections.filter(s => s.editable).map((section, idx) => (
                    <div 
                      key={section.id}
                      className={`flex items-center justify-between p-2 mb-1 rounded cursor-pointer hover:bg-muted ${selectedSection === section.id ? 'bg-muted' : ''}`}
                      onClick={() => setSelectedSection(section.id)}
                    >
                      <span className="text-xs font-medium truncate">{section.id}</span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </Card>
            </TabsContent>

            <TabsContent value="design" className="p-4 space-y-4">
              <Card className="p-4 space-y-3">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Color Picker
                </h4>
                <div className="space-y-2">
                  <Input 
                    type="color" 
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-full h-12"
                  />
                  <div className="grid grid-cols-5 gap-2">
                    {colorPresets.map((color) => (
                      <button
                        key={color}
                        className="w-full h-10 rounded border-2 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color, borderColor: selectedColor === color ? '#3b82f6' : '#e5e7eb' }}
                        onClick={() => setSelectedColor(color)}
                      />
                    ))}
                  </div>
                </div>
              </Card>

              <Card className="p-4 space-y-3">
                <h4 className="font-medium text-sm">Template Colors</h4>
                {Object.entries(template.styles).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded border flex-shrink-0"
                      style={{ backgroundColor: value }}
                    />
                    <div className="flex-1">
                      <p className="text-xs font-medium capitalize">{key.replace('Color', '')}</p>
                      <p className="text-xs text-muted-foreground">{value}</p>
                    </div>
                  </div>
                ))}
              </Card>
            </TabsContent>

            <TabsContent value="insert" className="p-4 space-y-4">
              <Card className="p-4 space-y-3">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Shapes className="h-4 w-4" />
                  Elements
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="flex flex-col h-20">
                    <Type className="h-6 w-6 mb-1" />
                    <span className="text-xs">Text Box</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col h-20">
                    <ImageIcon className="h-6 w-6 mb-1" />
                    <span className="text-xs">Image</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col h-20">
                    <Square className="h-6 w-6 mb-1" />
                    <span className="text-xs">Rectangle</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col h-20">
                    <Circle className="h-6 w-6 mb-1" />
                    <span className="text-xs">Circle</span>
                  </Button>
                </div>
              </Card>

              <Card className="p-4 space-y-3">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Upload Image
                </h4>
                <Button variant="outline" className="w-full">
                  Choose File
                </Button>
                <p className="text-xs text-muted-foreground">
                  Supports JPG, PNG, SVG up to 10MB
                </p>
              </Card>
            </TabsContent>
          </Tabs>
        </ScrollArea>
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
              Export PDF
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 bg-muted p-8">
          <TemplateRenderer
            template={template}
            aiContent={content}
            editMode={editMode}
            onSectionEdit={handleSectionEdit}
          />
        </ScrollArea>
      </div>
    </div>
  );
}
