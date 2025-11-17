import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { businessTemplates } from "@/data/businessTemplates";
import { BusinessLayout } from "@/components/BusinessLayout";
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

const BusinessAIGenerator = () => {
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
  const [shapes, setShapes] = useState<Array<{ id: string; type: string; x: number; y: number; width: number; height: number; color: string }>>([]);
  const [pages, setPages] = useState<Array<{ id: string; name: string }>>([{ id: 'page-1', name: 'Page 1' }]);
  const [currentPageId, setCurrentPageId] = useState('page-1');
  const { toast } = useToast();
  
  const template = businessTemplates.find(t => t.id === selectedTemplate);
  const { sections, setSections, updateSectionContent } = useDocumentSections(template?.sections || []);
  
  // Filter sections, shapes, and images by current page
  const currentPageSections = sections.filter(s => (s as any).pageId === currentPageId || (!(s as any).pageId && currentPageId === 'page-1'));
  const currentPageShapes = shapes.filter(s => (s as any).pageId === currentPageId || (!(s as any).pageId && currentPageId === 'page-1'));
  const currentPageImages = uploadedImages.filter(img => (img as any).pageId === currentPageId || (!(img as any).pageId && currentPageId === 'page-1'));

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/login-business");
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
      const newImage: any = {
        id: `img-${Date.now()}`,
        url: reader.result as string,
        x: 100,
        y: 200,
        width: 200,
        height: 150,
        pageId: currentPageId,
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
        const { data, error } = await supabase.functions.invoke("business-chat", {
          body: {
            message: `Based on this user request: "${prompt}"\n\nGenerate professional content for a document section titled "${section.title}". Provide detailed, well-structured content suitable for a business document that aligns with the user's request.`,
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
    const newPageNumber = pages.length + 1;
    const newPageId = `page-${newPageNumber}`;
    const newPageName = `Page ${newPageNumber}`;
    
    setPages([...pages, { id: newPageId, name: newPageName }]);
    setCurrentPageId(newPageId);
    
    toast({
      title: "New page added",
      description: `${newPageName} created and activated`,
    });
  };

  const handleAddShape = (shapeType: string) => {
    const newShape = {
      id: `shape-${Date.now()}`,
      type: shapeType,
      x: 100,
      y: 150,
      width: 150,
      height: 150,
      color: textColor,
      pageId: currentPageId,
    } as any;
    
    setShapes([...shapes, newShape]);
    toast({
      title: "Shape added",
      description: "You can drag and resize the shape",
    });
  };

  const handleShapePositionChange = (id: string, x: number, y: number) => {
    setShapes(shapes.map(shape => 
      shape.id === id ? { ...shape, x, y } : shape
    ));
  };

  const handleShapeSizeChange = (id: string, width: number, height: number) => {
    setShapes(shapes.map(shape => 
      shape.id === id ? { ...shape, width, height } : shape
    ));
  };

  const handleShapeRemove = (id: string) => {
    setShapes(shapes.filter(shape => shape.id !== id));
  };

  const handleShapeColorChange = (id: string, color: string) => {
    setShapes(shapes.map(shape => 
      shape.id === id ? { ...shape, color } : shape
    ));
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
    <BusinessLayout userEmail="business@flowpulse.io" onLogout={handleLogout}>
      <div className="min-h-screen bg-background flex flex-col">
        <DocumentEditorToolbar
          templates={businessTemplates}
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
            const maxY = currentPageSections.length > 0 
              ? Math.max(...currentPageSections.map(s => (s.y || 0) + (s.height || 100))) 
              : 0;
            
            const newSection: any = {
              id: `custom-${Date.now()}`,
              title: "New Section",
              content: "Click to edit this section...",
              type: "body",
              editable: true,
              placeholder: "Enter content...",
              order: sections.length,
              x: 50,
              y: maxY + 50,
              width: 600,
              height: 150,
              isCustom: true,
              pageId: currentPageId,
            };
            setSections([...sections, newSection]);
            toast({
              title: "Section added",
              description: "New section created on current page",
            });
          }}
          onAddShape={handleAddShape}
          pages={pages}
          currentPageId={currentPageId}
          onPageChange={setCurrentPageId}
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
                sections={currentPageSections}
                onSectionsChange={setSections}
                onContentChange={updateSectionContent}
                backgroundColor={backgroundColor}
                logoUrl={logoUrl}
                uploadedImages={currentPageImages}
                onImagePositionChange={handleImagePositionChange}
                onImageSizeChange={handleImageSizeChange}
                onImageRemove={handleImageRemove}
                shapes={currentPageShapes}
                onShapePositionChange={handleShapePositionChange}
                onShapeSizeChange={handleShapeSizeChange}
                onShapeRemove={handleShapeRemove}
                onShapeColorChange={handleShapeColorChange}
              />
            </div>
          )}
        </div>
      </div>
    </BusinessLayout>
  );
};

export default BusinessAIGenerator;
