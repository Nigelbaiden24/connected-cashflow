import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { FinanceLayout } from "@/components/FinanceLayout";
import { documentTemplates } from "@/data/documentTemplates";
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
  const [shapes, setShapes] = useState<Array<{ id: string; type: string; x: number; y: number; width: number; height: number; color: string }>>([]);
  const [pages, setPages] = useState<Array<{ id: string; name: string }>>([{ id: 'page-1', name: 'Page 1' }]);
  const [currentPageId, setCurrentPageId] = useState('page-1');
  const { toast } = useToast();
  
  const template = documentTemplates.find(t => t.id === selectedTemplate);
  const { sections, setSections, updateSectionContent } = useDocumentSections(template?.sections || []);
  
  // Filter sections by current page
  const currentPageSections = sections.filter(s => (s as any).pageId === currentPageId || (!( s as any).pageId && currentPageId === 'page-1'));
  const currentPageShapes = shapes.filter(s => (s as any).pageId === currentPageId || (!(s as any).pageId && currentPageId === 'page-1'));
  const currentPageImages = uploadedImages.filter(img => (img as any).pageId === currentPageId || (!(img as any).pageId && currentPageId === 'page-1'));

  // Save state to history
  const saveToHistory = () => {
    const currentState = {
      sections,
      shapes,
      uploadedImages,
      backgroundColor,
      textColor,
      pages,
      currentPageId,
    };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(currentState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

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
    const newTemplate = documentTemplates.find(t => t.id === templateId);
    setSelectedTemplate(templateId);
    
    // Apply template colors
    if (newTemplate?.styles) {
      setBackgroundColor(newTemplate.styles.backgroundColor);
      setTextColor(newTemplate.styles.primaryColor);
    } else {
      setBackgroundColor("#ffffff");
      setTextColor("#000000");
    }
    
    setLogoUrl("");
    setUploadedImages([]);
    setPages([{ id: 'page-1', name: 'Page 1' }]);
    setCurrentPageId('page-1');
    
    toast({
      title: "Template Selected",
      description: `${newTemplate?.name} is ready. Click "AI Fill" to generate content.`,
    });
  };

  const handleImagePositionChange = (id: string, x: number, y: number) => {
    setUploadedImages(images =>
      images.map(img => img.id === id ? { ...img, x, y } : img)
    );
    saveToHistory();
  };

  const handleImageSizeChange = (id: string, width: number, height: number) => {
    setUploadedImages(images =>
      images.map(img => img.id === id ? { ...img, width, height } : img)
    );
    saveToHistory();
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
      title: "AI is planning your document...",
      description: "Analyzing your request and structuring the document",
    });

    try {
      // First, ask AI to plan the document structure
      const { data: planData, error: planError } = await supabase.functions.invoke("financial-chat", {
        body: {
          message: `You are an expert document designer with a keen eye for visual aesthetics and professional layouts.

USER REQUEST: "${prompt}"

Create a comprehensive, visually appealing document plan in JSON format. Be creative and professional:

REQUIRED JSON STRUCTURE:
{
  "needsMultiplePages": boolean,
  "numberOfPages": number (create 2-5 pages if the content warrants it),
  "documentColors": {
    "backgroundColor": "professional hex color (use subtle gradients like #f8f9fa, #ffffff, or themed colors)",
    "textColor": "contrasting hex color for readability",
    "accentColor": "bold accent hex color for highlights"
  },
  "pages": [
    {
      "pageName": "descriptive page name",
      "sections": [
        {
          "title": "compelling section title",
          "content": "Rich, detailed paragraph content. Use multiple paragraphs. Include specific data, examples, and insights. Make it comprehensive (200-400 words per section).",
          "order": number,
          "layout": "full-width" | "two-column" | "highlighted"
        }
      ]
    }
  ]
}

DESIGN GUIDELINES:
- Use professional color schemes (corporate blues, elegant grays, modern greens)
- Create multiple pages for complex topics (Executive Summary, Main Content, Analysis, Conclusions)
- Write substantial content - each section should be 200-400 words
- Use varied layouts - mix full-width, two-column, and highlighted sections
- Include specific details, data points, and actionable insights
- Structure logically with clear progression

Make this document impressive, comprehensive, and professionally formatted.`,
        },
      });

      if (planError) throw planError;

      // Parse the AI response to extract JSON
      const responseText = planData.response || "";
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Could not parse document plan");
      
      const plan = JSON.parse(jsonMatch[0]);

      toast({
        title: "Building your document...",
        description: `Creating ${plan.numberOfPages} page(s) with structured content`,
      });

      // Apply colors
      if (plan.documentColors) {
        setBackgroundColor(plan.documentColors.backgroundColor);
        setTextColor(plan.documentColors.textColor);
      }

      // Create pages if needed
      const newPages = plan.pages.map((p: any, idx: number) => ({
        id: `page-${idx + 1}`,
        name: p.pageName || `Page ${idx + 1}`
      }));
      
      setPages(newPages);
      setCurrentPageId(newPages[0].id);

      // Create sections across all pages
      const allNewSections: any[] = [];
      plan.pages.forEach((page: any, pageIdx: number) => {
        page.sections.forEach((section: any, sectionIdx: number) => {
          const newSection = {
            id: `ai-section-${pageIdx}-${sectionIdx}-${Date.now()}`,
            title: section.title,
            content: section.content,
            type: "body",
            editable: true,
            placeholder: "AI generated content",
            order: section.order || sectionIdx,
            x: 50,
            y: 100 + (sectionIdx * 180),
            width: 600,
            height: 150,
            isCustom: true,
            pageId: newPages[pageIdx].id,
          };
          allNewSections.push(newSection);
        });
      });

      setSections(allNewSections);
      saveToHistory();

      toast({
        title: "Document complete!",
        description: `Created ${plan.numberOfPages} page(s) with ${allNewSections.length} sections`,
      });
    } catch (error) {
      console.error("Error generating document:", error);
      toast({
        title: "Generation failed",
        description: "Could not generate document. Please try again with a clearer prompt.",
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
      const prevState = history[historyIndex - 1];
      setSections(prevState.sections);
      setShapes(prevState.shapes);
      setUploadedImages(prevState.uploadedImages);
      setBackgroundColor(prevState.backgroundColor);
      setTextColor(prevState.textColor);
      setPages(prevState.pages);
      setCurrentPageId(prevState.currentPageId);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setSections(nextState.sections);
      setShapes(nextState.shapes);
      setUploadedImages(nextState.uploadedImages);
      setBackgroundColor(nextState.backgroundColor);
      setTextColor(nextState.textColor);
      setPages(nextState.pages);
      setCurrentPageId(nextState.currentPageId);
      setHistoryIndex(historyIndex + 1);
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
      <div className="bg-background flex flex-col h-full">
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
                transformOrigin: "top left",
                fontFamily: fontFamily,
                fontSize: `${fontSize}px`,
              }}
            >
              <EnhancedDocumentEditor
                sections={currentPageSections}
                onSectionsChange={(newSections) => {
                  setSections(newSections);
                  saveToHistory();
                }}
                onContentChange={(id, content) => {
                  updateSectionContent(id, content);
                  saveToHistory();
                }}
                backgroundColor={backgroundColor}
                textColor={textColor}
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
                currentPageId={currentPageId}
              />
            </div>
          )}
        </div>
      </div>
    </FinanceLayout>
  );
};

export default FinanceAIGenerator;
