import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AIContent, DocumentTemplate } from "@/types/template";
import { GrapesjsEditor } from "@/components/GrapesjsEditor";
import { renderTemplateToHtml } from "@/lib/templateRenderer";
import { documentTemplates } from "@/data/documentTemplates";
import { businessTemplates } from "@/data/businessTemplates";
import html2pdf from 'html2pdf.js';

const DocumentEditorPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userEmail] = useState("finance@flowpulse.io");
  const [filledHtml, setFilledHtml] = useState<string>("");
  const [loading, setLoading] = useState(true);
  
  const templateId = location.state?.templateId as string;
  const aiContent = location.state?.aiContent as AIContent;

  useEffect(() => {
    const loadAndFillTemplate = async () => {
      if (!templateId || !aiContent) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Find template from both collections
        let template: DocumentTemplate | undefined = documentTemplates.find(t => t.id === templateId);
        if (!template) {
          template = businessTemplates.find(t => t.id === templateId);
        }
        
        if (!template) {
          throw new Error(`Template ${templateId} not found`);
        }
        
        // Render template with AI content
        const renderedHtml = renderTemplateToHtml(template, aiContent);
        setFilledHtml(renderedHtml);
        
        console.log('Template loaded:', template.name);
        console.log('Sections rendered:', template.sections.length);
      } catch (error) {
        console.error('Error loading template:', error);
        toast({
          title: "Error",
          description: "Failed to load template",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadAndFillTemplate();
  }, [templateId, aiContent, toast]);

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

  const handleSave = (html: string, css: string) => {
    console.log('Document saved');
    // Store the HTML and CSS
    localStorage.setItem(`document_${templateId}`, JSON.stringify({ html, css, timestamp: Date.now() }));
    toast({
      title: "Saved",
      description: "Document saved successfully"
    });
  };

  const handleExportPDF = () => {
    if (!filledHtml) return;

    const element = document.createElement('div');
    element.innerHTML = filledHtml;
    
    const opt = {
      margin: 0.5,
      filename: `document_${templateId}_${Date.now()}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in' as const, format: 'letter' as const, orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(element).save();
    
    toast({
      title: "Exporting",
      description: "Your PDF is being generated...",
    });
  };

  if (!templateId || !aiContent) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar userEmail={userEmail} onLogout={handleLogout} />
          
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">No Template Loaded</h2>
              <p className="text-muted-foreground">
                Please generate a document first before opening the editor.
              </p>
              <Button onClick={() => navigate("/finance-ai-generator")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Generator
              </Button>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar userEmail={userEmail} onLogout={handleLogout} />
        
        <div className="flex-1 flex flex-col min-h-0">
          <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">Document Editor</h1>
                <p className="text-sm text-muted-foreground">Drag-and-drop editor with full customization</p>
              </div>
              <Button onClick={handleExportPDF} variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </header>
          
          <div className="flex-1 min-h-0">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading template...</p>
                </div>
              </div>
            ) : filledHtml ? (
              <GrapesjsEditor 
                initialHtml={filledHtml}
                onSave={handleSave}
                height="calc(100vh - 64px)"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No template content available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DocumentEditorPage;
