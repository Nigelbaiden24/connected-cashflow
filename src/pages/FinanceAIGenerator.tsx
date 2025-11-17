import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { documentTemplates } from "@/data/documentTemplates";
import { FinanceLayout } from "@/components/FinanceLayout";
import { useDocumentSections, HeaderSection } from "@/hooks/useDocumentSections";
import { EnhancedDocumentEditor } from "@/components/EnhancedDocumentEditor";
import { DocumentEditorToolbar } from "@/components/DocumentEditorToolbar";
import html2pdf from "html2pdf.js";

interface UploadedImage {
  id: string;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const FinanceAIGenerator = () => {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#000000");
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [fontFamily, setFontFamily] = useState("Inter");
  const [fontSize, setFontSize] = useState(16);
  const [textAlign, setTextAlign] = useState("left");
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const { toast } = useToast();
  
  const template = documentTemplates.find(t => t.id === selectedTemplate);
  const { sections, setSections, updateSectionContent } = useDocumentSections(template?.sections || []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/login");
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setBackgroundColor("#ffffff");
    setTextColor("#000000");
    setLogoUrl("");
    setUploadedImages([]);
  };

  const handleImagePositionChange = (id: string, x: number, y: number) => {
    setUploadedImages(images =>
      images.map(img => img.id === id ? { ...img, x, y } : img)
    );
  };

  const handleImageSizeChange = (id: string, width: number, height: number) => {
    setUploadedImages(images =>
      images.map(img => img.id === id ? { ...img, width, height } : img)
    );
  };

  const handleImageRemove = (id: string) => {
    setUploadedImages(images => images.filter(img => img.id !== id));
  };

  const handleLogoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const newImage: UploadedImage = {
        id: `img-${Date.now()}`,
        url: reader.result as string,
        x: 100,
        y: 200,
        width: 200,
        height: 150,
      };
      setUploadedImages(prev => [...prev, newImage]);
      toast({
        title: "Image uploaded",
        description: "You can now drag and resize the image in the document",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFillDocument = async (prompt: string) => {
    if (!template) return;

    toast({
      title: "Generating content...",
      description: "AI is filling the document with content based on your prompt",
    });

    try {
      for (const section of sections.filter(s => s.editable)) {
        const { data, error } = await supabase.functions.invoke("financial-chat", {
          body: {
            message: `Based on this user request: "${prompt}"\n\nGenerate professional content for a document section titled "${section.title}". Provide detailed, well-structured content suitable for a financial or business document that aligns with the user's request.`,
          },
        });

        if (error) throw error;

        const generatedContent = data.response || "";
        updateSectionContent(section.id, generatedContent);
      }

      toast({
        title: "Document filled",
        description: "AI has generated content for all sections based on your prompt",
      });
    } catch (error) {
      console.error("Error generating content:", error);
      toast({
        title: "Generation failed",
        description: "Could not generate content. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddPage = () => {
    const newSection: HeaderSection = {
      id: `page-${Date.now()}`,
      title: "New Page",
      content: "",
      type: "body",
      editable: true,
      placeholder: "Enter content for new page...",
      order: sections.length,
      x: 50,
      y: sections.length > 0 ? Math.max(...sections.map(s => s.y + s.height)) + 50 : 50,
      width: 700,
      height: 200,
      isCustom: true,
    };
    setSections([...sections, newSection]);
    toast({
      title: "New page added",
      description: "Scroll down to see the new page",
    });
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setSections(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setSections(history[historyIndex + 1]);
    }
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById("document-preview");
    if (!element) return;

    try {
      const opt = {
        margin: 10,
        filename: `${template?.name || 'document'}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };
      
      await html2pdf().set(opt).from(element).save();
      toast({
        title: "PDF downloaded!",
        description: "Your document has been saved.",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not generate PDF",
        variant: "destructive"
      });
    }
  };

  return (
    <FinanceLayout userEmail="finance@flowpulse.io" onLogout={handleLogout}>
      <div className="min-h-screen bg-background flex flex-col">
        <DocumentEditorToolbar
          templates={documentTemplates}
          selectedTemplate={selectedTemplate}
          onTemplateSelect={handleTemplateSelect}
          onImageUpload={handleImageUpload}
          onLogoUpload={handleLogoUpload}
          backgroundColor={backgroundColor}
          onBackgroundColorChange={setBackgroundColor}
          textColor={textColor}
          onTextColorChange={setTextColor}
          onDownloadPDF={handleDownloadPDF}
          onFillDocument={handleFillDocument}
          onAddPage={handleAddPage}
          fontFamily={fontFamily}
          onFontFamilyChange={setFontFamily}
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          textAlign={textAlign}
          onTextAlignChange={setTextAlign}
          zoom={zoom}
          onZoomChange={setZoom}
          showGrid={showGrid}
          onShowGridChange={setShowGrid}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          onAddSection={() => {
            const newSection: HeaderSection = {
              id: `custom-${Date.now()}`,
              title: "New Section",
              content: "",
              type: "body",
              editable: true,
              placeholder: "Enter content...",
              order: sections.length,
              x: 50,
              y: sections.length > 0 ? Math.max(...sections.map(s => s.y + s.height)) + 20 : 50,
              width: 600,
              height: 100,
              isCustom: true,
            };
            setSections([...sections, newSection]);
          }}
        />

        <div className="flex-1 overflow-auto">
          {!selectedTemplate ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <p className="text-lg">Select a template from the toolbar to get started</p>
              </div>
            </div>
          ) : (
            <div 
              id="document-preview" 
              className="w-full h-full"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top left',
                fontFamily: fontFamily,
                fontSize: `${fontSize}px`,
              }}
            >
              <EnhancedDocumentEditor
                sections={sections}
                onSectionsChange={setSections}
                onContentChange={updateSectionContent}
                backgroundColor={backgroundColor}
                logoUrl={logoUrl}
                uploadedImages={uploadedImages}
                onImagePositionChange={handleImagePositionChange}
                onImageSizeChange={handleImageSizeChange}
                onImageRemove={handleImageRemove}
              />
            </div>
          )}
        </div>
      </div>
    </FinanceLayout>
  );
};

export default FinanceAIGenerator;
