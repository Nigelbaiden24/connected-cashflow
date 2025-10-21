import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { EnhancedDocumentEditor } from "@/components/EnhancedDocumentEditor";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { documentTemplates } from "@/data/documentTemplates";
import { AIContent } from "@/types/template";

const DocumentEditorPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userEmail] = useState("finance@flowpulse.io");
  
  const templateId = location.state?.templateId as string;
  const aiContent = location.state?.aiContent as AIContent;

  console.log('=== DocumentEditorPage Debug ===');
  console.log('templateId:', templateId);
  console.log('aiContent:', aiContent);

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

  const handleSave = (data: AIContent) => {
    console.log('Document saved:', Object.keys(data).length, 'sections');
    toast({
      title: "Saved",
      description: "Document saved successfully"
    });
  };

  const template = documentTemplates.find(t => t.id === templateId);

  if (!template) {
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
                onClick={() => navigate("/finance-ai-generator")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Generator
              </Button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">Document Editor</h1>
                <p className="text-sm text-muted-foreground">Edit and customize your document</p>
              </div>
            </div>
          </header>
          
          <div className="flex-1 min-h-0">
            <EnhancedDocumentEditor 
              template={template}
              aiContent={aiContent}
              onSave={handleSave}
            />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DocumentEditorPage;
