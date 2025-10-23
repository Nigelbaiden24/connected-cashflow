import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Layout, ArrowLeft, Sparkles, Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BusinessSidebar } from "@/components/BusinessSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import { businessTemplates } from "@/data/businessTemplates";
import { renderTemplateToHtml } from "@/lib/templateRenderer";
import html2pdf from "html2pdf.js";

const BusinessAIGenerator = () => {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isGeneratingField, setIsGeneratingField] = useState<string | null>(null);
  const [userEmail] = useState("business@flowpulse.io");
  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);

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
    setFormData({});
  };

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleAIAssist = async (fieldId: string) => {
    const template = businessTemplates.find(t => t.id === selectedTemplate);
    if (!template) return;

    const section = template.sections.find(s => s.id === fieldId);
    if (!section) return;

    setIsGeneratingField(fieldId);
    
    try {
      const prompt = `Generate professional business content for a ${section.type} section titled "${section.id}". 
      Context: ${formData.clientName || 'Professional client'} - ${template.name}
      Requirements: 
      - ${section.type === 'heading' ? 'Create a short, impactful title (max 10 words)' : ''}
      - ${section.type === 'subheading' ? 'Create a concise section title (max 8 words)' : ''}
      - ${section.type === 'body' ? 'Write 2-3 professional paragraphs' : ''}
      - ${section.type === 'bullet-list' ? 'Create 3-5 bullet points (no bullet characters)' : ''}
      Return ONLY the content, no formatting or explanations.`;

      const { data, error } = await supabase.functions.invoke('generate-document', {
        body: { messages: [{ role: "user", content: prompt }] }
      });

      if (error) throw error;

      const content = data?.choices?.[0]?.message?.content || data?.response || "";
      handleFieldChange(fieldId, content.trim());

      toast({
        title: "Content generated!",
        description: "AI has filled this field for you.",
      });
    } catch (error: any) {
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsGeneratingField(null);
    }
  };

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;

    const opt = {
      margin: 10,
      filename: `${selectedTemplate}-${Date.now()}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    try {
      await html2pdf().set(opt).from(previewRef.current).save();
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

  const template = businessTemplates.find(t => t.id === selectedTemplate);
  const editableFields = template?.sections.filter(s => s.editable) || [];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full business-theme">
        <BusinessSidebar userEmail={userEmail} onLogout={handleLogout} />
        
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/business-dashboard")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">AI Document Generator</h1>
              </div>
              {template && (
                <Button onClick={handleDownloadPDF} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              )}
            </div>
          </header>

          {!template ? (
            <main className="p-6">
              <h3 className="text-xl font-semibold mb-4">Select a Template</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {businessTemplates.map((tmpl) => (
                  <Card 
                    key={tmpl.id}
                    className={`cursor-pointer transition-all hover:shadow-lg hover:ring-2 hover:ring-success/50`}
                    onClick={() => handleTemplateSelect(tmpl.id)}
                  >
                    <CardContent className="p-4">
                      <div className="aspect-video rounded-lg mb-3 overflow-hidden">
                        {tmpl.thumbnail ? (
                          <img src={tmpl.thumbnail} alt={tmpl.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="bg-gradient-to-br from-success/10 to-success/20 h-full flex items-center justify-center">
                            <FileText className="h-12 w-12 text-success" />
                          </div>
                        )}
                      </div>
                      <h4 className="font-semibold text-sm mb-1">{tmpl.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">{tmpl.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </main>
          ) : (
            <div className="flex-1 grid grid-cols-2 gap-6 p-6">
              {/* Left Column - Input Fields */}
              <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-120px)]">
                <Card>
                  <CardHeader>
                    <CardTitle>{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTemplate("")}
                      className="mt-2"
                    >
                      Change Template
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {editableFields.map((field) => (
                      <div key={field.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={field.id} className="capitalize">
                            {field.id.replace(/-|_/g, ' ')}
                          </Label>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAIAssist(field.id)}
                            disabled={isGeneratingField === field.id}
                          >
                            {isGeneratingField === field.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Sparkles className="h-3 w-3" />
                            )}
                            <span className="ml-1 text-xs">AI</span>
                          </Button>
                        </div>
                        {field.type === 'body' || field.type === 'bullet-list' ? (
                          <Textarea
                            id={field.id}
                            placeholder={field.placeholder}
                            value={formData[field.id] || ''}
                            onChange={(e) => handleFieldChange(field.id, e.target.value)}
                            rows={field.type === 'body' ? 4 : 6}
                            className="text-sm"
                          />
                        ) : (
                          <Input
                            id={field.id}
                            placeholder={field.placeholder}
                            value={formData[field.id] || ''}
                            onChange={(e) => handleFieldChange(field.id, e.target.value)}
                            className="text-sm"
                          />
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Live Preview */}
              <div className="overflow-y-auto max-h-[calc(100vh-120px)]">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Live Preview</CardTitle>
                    <CardDescription>See your document as you type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div 
                      ref={previewRef}
                      className="bg-white p-8 rounded-lg shadow-sm min-h-[297mm]"
                      dangerouslySetInnerHTML={{
                        __html: renderTemplateToHtml(template, formData)
                      }}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default BusinessAIGenerator;
