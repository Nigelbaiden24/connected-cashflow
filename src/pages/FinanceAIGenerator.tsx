import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { documentTemplates } from "@/data/documentTemplates";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
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
  const [signatureFields, setSignatureFields] = useState<Array<{ id: string; x: number; y: number; width: number; height: number; signed: boolean; pageId: string }>>([]);
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
      title: "🎨 Elite AI is crafting your document...",
      description: "Analyzing requirements and designing premium content",
    });

    try {
      const { data: aiResponse, error: aiError } = await supabase.functions.invoke("generate-document", {
        body: {
          messages: [
            {
              role: "user",
              content: `USER REQUEST: "${prompt}"

ELITE DOCUMENT REQUIREMENTS:
1. Generate 3-5 pages with SUBSTANTIAL, EXPERT-LEVEL content on EVERY page
2. Each page MUST have 3-5 sections with 300-600 words of rich, valuable, professional content
3. ALL sections MUST use WHITE BACKGROUNDS (#ffffff) - this is MANDATORY unless user explicitly requests colors
4. Include specific data points, percentages, metrics, case studies, and actionable insights
5. Write like a McKinsey consultant - authoritative, data-driven, strategic
6. NEVER leave any page empty - distribute premium quality content across ALL pages
7. Every section styling.backgroundColor MUST be "#ffffff"`
            }
          ],
        },
      });

      if (aiError) throw aiError;

      // Handle response - the edge function returns parsed JSON directly
      let plan;
      
      // Check if response is already parsed JSON
      if (aiResponse && typeof aiResponse === 'object' && !aiResponse.choices) {
        // Direct JSON response from edge function
        plan = aiResponse;
      } else if (aiResponse?.choices?.[0]?.message?.content) {
        // Standard chat completion response
        const responseText = aiResponse.choices[0].message.content;
        try {
          plan = JSON.parse(responseText);
        } catch {
          // Try to extract JSON from response
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            plan = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error("Could not parse AI response as JSON");
          }
        }
      } else {
        throw new Error("Invalid AI response format");
      }

      // Validate the plan structure
      if (!plan.pages || !Array.isArray(plan.pages) || plan.pages.length === 0) {
        throw new Error("AI response missing pages array");
      }

      toast({
        title: "✨ Building premium document...",
        description: `Creating ${plan.numberOfPages || plan.pages?.length || 1} page(s) with elite styling`,
      });

      // Always use white background for document
      setBackgroundColor("#ffffff");
      setTextColor(plan.documentColors?.textColor || "#1f2937");

      // Create pages with WHITE backgrounds only
      const newPages = plan.pages.map((p: any, idx: number) => ({
        id: `page-${idx + 1}`,
        name: p.pageName || `Page ${idx + 1}`,
        backgroundColor: "#ffffff"
      }));
      
      setPages(newPages);
      setCurrentPageId(newPages[0].id);

      // Create sophisticated sections with enhanced styling
      const allNewSections: any[] = [];
      let sectionYOffset = 100;

      plan.pages.forEach((page: any, pageIdx: number) => {
        sectionYOffset = 100; // Reset for each page
        
        // Validate page has sections
        if (!page.sections || page.sections.length === 0) {
          console.warn(`Page ${pageIdx + 1} has no sections, creating default content`);
          page.sections = [
            {
              title: "Content Section",
              content: "This section contains important information. Please review and update as needed.",
              sectionType: "standard",
              order: 0
            }
          ];
        }
        
        page.sections.forEach((section: any, sectionIdx: number) => {
          const styling = section.styling || {};
          const sectionType = section.sectionType || "standard";
          
          // Calculate dynamic height based on content and section type
          const contentLength = (section.content || "").length;
          let baseHeight = Math.max(150, Math.min(400, Math.ceil(contentLength / 4)));
          
          if (sectionType === "hero") baseHeight = Math.max(250, baseHeight);
          if (sectionType === "callout") baseHeight = Math.max(120, baseHeight * 0.7);

          const newSection = {
            id: `elite-section-${pageIdx}-${sectionIdx}-${Date.now()}`,
            title: section.title,
            content: section.content,
            type: sectionType === "hero" ? "heading" : "body",
            editable: true,
            placeholder: "Elite AI generated content",
            order: section.order || sectionIdx,
            x: 50,
            y: sectionYOffset,
            width: section.layout === "two-column" ? 400 : 700,
            height: baseHeight,
            isCustom: true,
            pageId: newPages[pageIdx].id,
            styling: {
              backgroundColor: "#ffffff",
              textColor: styling.textColor || "#1f2937",
              fontSize: styling.fontSize || "medium",
              fontWeight: styling.fontWeight || (sectionType === "hero" ? "bold" : "medium"),
              padding: styling.padding || "medium",
              borderColor: "#e5e7eb",
              borderStyle: sectionType === "callout" ? "solid" : "none",
            }
          };
          
          allNewSections.push(newSection);
          sectionYOffset += baseHeight + 40; // Add spacing between sections
        });
      });

      setSections(allNewSections);
      saveToHistory();

      console.log(`Created ${allNewSections.length} sections across ${plan.pages.length} pages`);
      allNewSections.forEach(s => console.log(`Section on ${s.pageId}: ${s.title}`));

      toast({
        title: "🎯 Elite document complete!",
        description: `Created ${plan.numberOfPages || plan.pages?.length} premium page(s) with ${allNewSections.length} styled sections`,
      });
    } catch (error) {
      console.error("Error generating elite document:", error);
      toast({
        title: "Generation failed",
        description: "Could not generate document. Please try again with a more specific prompt.",
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

  const handleAddSignatureField = () => {
    const newField = {
      id: `signature-${Date.now()}`,
      x: 100,
      y: 500,
      width: 250,
      height: 80,
      signed: false,
      pageId: currentPageId,
    };
    
    setSignatureFields([...signatureFields, newField]);
    toast({
      title: "Signature field added",
      description: "Drag and resize the signature field as needed",
    });
  };

  const handleRequestSignature = () => {
    const unsignedCount = signatureFields.filter(f => !f.signed).length;
    
    toast({
      title: "Signature request sent",
      description: `Document sent for ${unsignedCount} signature(s). Recipients will receive secure signing links via email.`,
    });
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
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar userEmail="finance@flowpulse.io" onLogout={handleLogout} />
        <div className="flex-1 flex flex-col">
          <main className="flex-1">
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
                onAddSignatureField={handleAddSignatureField}
                onRequestSignature={handleRequestSignature}
                signatureFields={signatureFields}
              />

              <div className="flex-1 overflow-auto">
                {!selectedTemplate ? (
                  <div className="flex items-center justify-center h-full pointer-events-none">
                    <div className="text-center text-muted-foreground pointer-events-auto">
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
                      signatureFields={signatureFields.filter(f => f.pageId === currentPageId || (!f.pageId && currentPageId === 'page-1'))}
                      onSignaturePositionChange={(id, x, y) => {
                        setSignatureFields(signatureFields.map(f => 
                          f.id === id ? { ...f, x, y } : f
                        ));
                      }}
                      onSignatureSizeChange={(id, width, height) => {
                        setSignatureFields(signatureFields.map(f => 
                          f.id === id ? { ...f, width, height } : f
                        ));
                      }}
                      onSignatureRemove={(id) => {
                        setSignatureFields(signatureFields.filter(f => f.id !== id));
                      }}
                      onSignatureSign={(id) => {
                        setSignatureFields(signatureFields.map(f => 
                          f.id === id ? { ...f, signed: true } : f
                        ));
                        toast({
                          title: "Document signed",
                          description: "Signature applied successfully",
                        });
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default FinanceAIGenerator;
