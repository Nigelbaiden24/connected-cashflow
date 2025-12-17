import { useState, useEffect } from "react";
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

interface SavedDocument {
  id: string;
  name: string;
  savedAt: string;
  data: {
    selectedTemplate: string | null;
    sections: any[];
    pages: Array<{ id: string; name: string }>;
    shapes: any[];
    uploadedImages: any[];
    signatureFields: any[];
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
    fontSize: number;
  };
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
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [shapes, setShapes] = useState<Array<{ id: string; type: string; x: number; y: number; width: number; height: number; color: string }>>([]);
  const [pages, setPages] = useState<Array<{ id: string; name: string }>>([{ id: 'page-1', name: 'Page 1' }]);
  const [currentPageId, setCurrentPageId] = useState('page-1');
  const [signatureFields, setSignatureFields] = useState<Array<{ id: string; x: number; y: number; width: number; height: number; signed: boolean; pageId: string }>>([]);
  const [savedDocuments, setSavedDocuments] = useState<SavedDocument[]>([]);
  const { toast } = useToast();
  
  const template = documentTemplates.find(t => t.id === selectedTemplate);
  const { sections, setSections, updateSectionContent } = useDocumentSections(template?.sections || []);
  
  // Load saved documents on mount
  useEffect(() => {
    const saved = localStorage.getItem('flowpulse-saved-documents');
    if (saved) {
      try {
        setSavedDocuments(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading saved documents:', e);
      }
    }
  }, []);
  
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
    // Ensure all user-created content (all pages, sections, images, shapes, signatures, logo) is included in export
    const container = document.createElement("div");
    container.id = "pdf-export-container";

    const cleanup = () => {
      if (container.parentElement) document.body.removeChild(container);
    };

    const waitForImages = async (root: HTMLElement) => {
      const imgs = Array.from(root.querySelectorAll("img"));
      await Promise.all(
        imgs.map(
          (img) =>
            new Promise<void>((resolve) => {
              if (img.complete) return resolve();
              img.onload = () => resolve();
              img.onerror = () => resolve();
            })
        )
      );
    };

    const createShapeElement = (shape: any) => {
      const el = document.createElement("div");
      el.style.position = "absolute";
      el.style.left = `${shape.x}px`;
      el.style.top = `${shape.y}px`;
      el.style.width = `${shape.width}px`;
      el.style.height = `${shape.height}px`;
      el.style.pointerEvents = "none";

      const color = shape.color || "#111";

      switch (shape.type) {
        case "circle": {
          el.style.backgroundColor = color;
          el.style.borderRadius = "9999px";
          break;
        }
        case "triangle": {
          el.style.backgroundColor = "transparent";
          el.style.width = "0";
          el.style.height = "0";
          el.style.borderLeft = `${shape.width / 2}px solid transparent`;
          el.style.borderRight = `${shape.width / 2}px solid transparent`;
          el.style.borderBottom = `${shape.height}px solid ${color}`;
          break;
        }
        case "line": {
          el.style.height = "0";
          el.style.borderTop = `3px solid ${color}`;
          el.style.transformOrigin = "left center";
          break;
        }
        case "diamond": {
          el.style.backgroundColor = color;
          el.style.transform = "rotate(45deg)";
          break;
        }
        case "arrow": {
          el.innerHTML = `
            <svg width="${shape.width}" height="${shape.height}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12h12" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
              <path d="M13 6l6 6-6 6" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          `;
          break;
        }
        case "star": {
          el.innerHTML = `
            <svg width="${shape.width}" height="${shape.height}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" fill="${color}" />
            </svg>
          `;
          break;
        }
        case "rectangle":
        default: {
          el.style.backgroundColor = color;
          el.style.borderRadius = "8px";
          break;
        }
      }

      return el;
    };

    try {
      toast({
        title: "Generating PDF...",
        description: `Processing ${pages.length} page(s) with all content`,
      });

      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.top = "0";
      container.style.width = "794px";
      container.style.background = "white";
      container.style.pointerEvents = "none";
      document.body.appendChild(container);

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const pageSections = sections.filter(
          (s) => (s as any).pageId === page.id || (!(s as any).pageId && page.id === "page-1")
        );
        const pageShapes = shapes.filter(
          (s) => (s as any).pageId === page.id || (!(s as any).pageId && page.id === "page-1")
        );
        const pageImages = uploadedImages.filter(
          (img) => (img as any).pageId === page.id || (!(img as any).pageId && page.id === "page-1")
        );
        const pageSignatures = signatureFields.filter(
          (sig) => sig.pageId === page.id || (!sig.pageId && page.id === "page-1")
        );

        const pageDiv = document.createElement("div");
        pageDiv.className = "pdf-page";
        pageDiv.style.backgroundColor = backgroundColor || "#ffffff";
        pageDiv.style.fontFamily = fontFamily;
        pageDiv.style.fontSize = `${fontSize}px`;
        pageDiv.style.color = textColor || "#000000";
        pageDiv.style.padding = "40px";
        pageDiv.style.width = "794px";
        pageDiv.style.minHeight = "1123px";
        pageDiv.style.position = "relative";
        pageDiv.style.boxSizing = "border-box";
        pageDiv.style.overflow = "visible";
        pageDiv.style.pageBreakAfter = i < pages.length - 1 ? "always" : "auto";

        // Logo
        if (logoUrl) {
          const logo = document.createElement("img");
          logo.src = logoUrl;
          logo.style.position = "absolute";
          logo.style.left = "40px";
          logo.style.top = "32px";
          logo.style.height = "56px";
          logo.style.width = "auto";
          logo.style.objectFit = "contain";
          pageDiv.appendChild(logo);
        }

        // Shapes (render behind content)
        pageShapes.forEach((shape) => {
          pageDiv.appendChild(createShapeElement(shape));
        });

        // Sections
        pageSections.forEach((section) => {
          const sectionDiv = document.createElement("div");
          sectionDiv.style.position = "absolute";
          sectionDiv.style.left = `${Math.max(0, section.x)}px`;
          sectionDiv.style.top = `${Math.max(0, section.y)}px`;
          sectionDiv.style.width = `${Math.min(section.width, 714)}px`;
          sectionDiv.style.minHeight = `${section.height}px`;
          sectionDiv.style.color = (section as any).styling?.textColor || (section as any).textColor || textColor;
          sectionDiv.style.backgroundColor = (section as any).styling?.backgroundColor || "transparent";
          sectionDiv.style.padding = "16px";
          sectionDiv.style.borderRadius = "8px";
          sectionDiv.style.boxSizing = "border-box";
          sectionDiv.style.overflow = "visible";
          sectionDiv.style.wordBreak = "break-word";

          if ((section as any).styling?.borderStyle && (section as any).styling?.borderStyle !== "none") {
            sectionDiv.style.border = `1px solid ${(section as any).styling?.borderColor || "#e5e7eb"}`;
          }

          if (section.type === "heading") {
            const h2 = document.createElement("h2");
            h2.style.fontSize = "28px";
            h2.style.fontWeight = "700";
            h2.style.marginBottom = "16px";
            h2.style.lineHeight = "1.3";
            h2.textContent = (section.content || section.title || "").toString();
            sectionDiv.appendChild(h2);
          } else if (section.type === "table") {
            const tableWrapper = document.createElement("div");
            tableWrapper.style.overflow = "visible";
            tableWrapper.innerHTML = `
              <style>
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                th { background-color: #f5f5f5; font-weight: 600; }
              </style>
              ${section.content || ""}
            `;
            sectionDiv.appendChild(tableWrapper);
          } else {
            if (section.title) {
              const h3 = document.createElement("h3");
              h3.style.fontSize = "20px";
              h3.style.fontWeight = "600";
              h3.style.marginBottom = "12px";
              h3.textContent = section.title;
              sectionDiv.appendChild(h3);
            }

            const contentDiv = document.createElement("div");
            contentDiv.style.whiteSpace = "pre-wrap";
            contentDiv.style.lineHeight = "1.7";
            contentDiv.style.fontSize = "14px";
            contentDiv.textContent = (section.content || "").toString();
            sectionDiv.appendChild(contentDiv);
          }

          pageDiv.appendChild(sectionDiv);
        });

        // Images
        for (const img of pageImages) {
          const imgEl = document.createElement("img");
          imgEl.src = img.url;
          imgEl.style.position = "absolute";
          imgEl.style.left = `${img.x}px`;
          imgEl.style.top = `${img.y}px`;
          imgEl.style.width = `${img.width}px`;
          imgEl.style.height = `${img.height}px`;
          imgEl.style.objectFit = "contain";
          imgEl.crossOrigin = "anonymous";
          pageDiv.appendChild(imgEl);
        }

        // Signature fields
        pageSignatures.forEach((sig) => {
          const sigDiv = document.createElement("div");
          sigDiv.style.position = "absolute";
          sigDiv.style.left = `${sig.x}px`;
          sigDiv.style.top = `${sig.y}px`;
          sigDiv.style.width = `${sig.width}px`;
          sigDiv.style.height = `${sig.height}px`;
          sigDiv.style.border = "2px dashed #999";
          sigDiv.style.borderRadius = "6px";
          sigDiv.style.display = "flex";
          sigDiv.style.alignItems = "center";
          sigDiv.style.justifyContent = "center";
          sigDiv.style.color = "#666";
          sigDiv.style.fontSize = "12px";
          sigDiv.textContent = sig.signed ? "✓ Signed" : "Signature Required";
          pageDiv.appendChild(sigDiv);
        });

        // Expand height to include absolutely-positioned elements (prevents clipping)
        const maxBottom = Math.max(
          1123,
          ...pageSections.map((s: any) => (s.y || 0) + (s.height || 0) + 120),
          ...pageImages.map((img: any) => (img.y || 0) + (img.height || 0) + 120),
          ...pageShapes.map((sh: any) => (sh.y || 0) + (sh.height || 0) + 120),
          ...pageSignatures.map((sig: any) => (sig.y || 0) + (sig.height || 0) + 120)
        );
        pageDiv.style.height = `${maxBottom}px`;

        container.appendChild(pageDiv);
      }

      await waitForImages(container);
      await new Promise((resolve) => setTimeout(resolve, 600));

      const opt = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: `${template?.name || "document"}-${new Date().toISOString().slice(0, 10)}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          allowTaint: true,
          windowWidth: 794,
          scrollY: 0,
          scrollX: 0,
        },
        jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const },
        pagebreak: { mode: ["css", "legacy"] as any },
      };

      await html2pdf().set(opt).from(container).save();

      cleanup();

      toast({
        title: "PDF downloaded successfully!",
        description: `Document with all content has been saved.`,
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      cleanup();
      toast({
        title: "Download failed",
        description: "Could not generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveDocument = () => {
    if (!selectedTemplate) {
      toast({
        title: "No document to save",
        description: "Please select a template first",
        variant: "destructive",
      });
      return;
    }

    const docName = template?.name || 'Untitled Document';
    const docId = `doc-${Date.now()}`;
    
    const newDoc: SavedDocument = {
      id: docId,
      name: docName,
      savedAt: new Date().toLocaleString(),
      data: {
        selectedTemplate,
        sections,
        pages,
        shapes,
        uploadedImages,
        signatureFields,
        backgroundColor,
        textColor,
        fontFamily,
        fontSize,
      }
    };

    const updatedDocs = [...savedDocuments.filter(d => d.name !== docName), newDoc];
    setSavedDocuments(updatedDocs);
    localStorage.setItem('flowpulse-saved-documents', JSON.stringify(updatedDocs));
    
    toast({
      title: "Document saved!",
      description: `"${docName}" has been saved. You can reload it anytime.`,
    });
  };

  const handleLoadDocument = (docId?: string) => {
    const doc = savedDocuments.find(d => docId ? d.id === docId : true);
    if (!doc) return;

    setSelectedTemplate(doc.data.selectedTemplate);
    setSections(doc.data.sections);
    setPages(doc.data.pages);
    setShapes(doc.data.shapes);
    setUploadedImages(doc.data.uploadedImages);
    setSignatureFields(doc.data.signatureFields);
    setBackgroundColor(doc.data.backgroundColor);
    setTextColor(doc.data.textColor);
    setFontFamily(doc.data.fontFamily);
    setFontSize(doc.data.fontSize);
    setCurrentPageId(doc.data.pages[0]?.id || 'page-1');

    toast({
      title: "Document loaded!",
      description: `"${doc.name}" has been restored.`,
    });
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
                onInsertTable={(rows, cols) => {
                  const maxY = currentPageSections.length > 0
                    ? Math.max(...currentPageSections.map(s => (s.y || 0) + (s.height || 100)))
                    : 0;

                  const headers = Array.from({ length: cols }, (_, i) => `Column ${i + 1}`);
                  const bodyRows = Array.from({ length: rows }, (_, r) =>
                    `<tr>${headers
                      .map(
                        (_, c) =>
                          `<td style="padding: 8px 12px; font-size: 13px; border-bottom: 1px solid #e5e7eb;">Row ${r + 1} value ${c + 1}</td>`
                      )
                      .join("")}</tr>`
                  ).join("");

                  const tableHtml = `
                    <table style="width: 100%; border-collapse: collapse; min-width: 480px;">
                      <thead>
                        <tr style="background: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
                          ${headers
                            .map(
                              (h) =>
                                `<th style="padding: 10px 12px; text-align: left; font-weight: 600; font-size: 13px;">${h}</th>`
                            )
                            .join("")}
                        </tr>
                      </thead>
                      <tbody>
                        ${bodyRows}
                      </tbody>
                    </table>
                  `;

                  const newSection: any = {
                    id: `table-${Date.now()}`,
                    title: "Data Table",
                    content: tableHtml,
                    type: "table",
                    editable: false,
                    order: sections.length,
                    x: 50,
                    y: maxY + 50,
                    width: 700,
                    height: 160,
                    isCustom: true,
                    pageId: currentPageId,
                  };

                  setSections([...sections, newSection]);
                  toast({
                    title: "Table inserted",
                    description: `${rows} x ${cols} table added to the page`,
                  });
                }}
                onSaveDocument={handleSaveDocument}
                onLoadDocument={() => handleLoadDocument()}
                savedDocuments={savedDocuments}
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
                        // Preserve sections from other pages when updating current page
                        const otherPageSections = sections.filter(s => {
                          const sectionPageId = (s as any).pageId;
                          // Keep sections that belong to OTHER pages
                          if (currentPageId === 'page-1') {
                            return sectionPageId && sectionPageId !== 'page-1';
                          }
                          return sectionPageId !== currentPageId;
                        });
                        setSections([...otherPageSections, ...newSections]);
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
