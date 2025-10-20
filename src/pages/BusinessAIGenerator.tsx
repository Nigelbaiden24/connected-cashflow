import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Layout, ArrowLeft, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BusinessSidebar } from "@/components/BusinessSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import { businessTemplates } from "@/data/businessTemplates";
import { AIContent } from "@/types/template";

const documentTypes = [
  { value: "financial-plan", label: "Financial Plan" },
  { value: "proposal", label: "Proposal" },
  { value: "client-letter", label: "Client Letter" },
  { value: "portfolio-summary", label: "Portfolio Summary" },
  { value: "kyc-form", label: "KYC Onboarding Form" },
  { value: "compliance-report", label: "Compliance Report" },
  { value: "whitepaper", label: "Whitepaper" },
  { value: "market-commentary", label: "Market Commentary" },
  { value: "meeting-agenda", label: "Meeting Agenda" },
  { value: "scenario-analysis", label: "Scenario Analysis Summary" },
  { value: "multi-page-report", label: "Multi-Page Report" },
  { value: "pitch-deck", label: "Pitch Deck" },
];

const BusinessAIGenerator = () => {
  const navigate = useNavigate();
  const [documentType, setDocumentType] = useState("financial-plan");
  const [prompt, setPrompt] = useState("");
  const [clientName, setClientName] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [generatedAIContent, setGeneratedAIContent] = useState<AIContent | null>(null);
  const [userEmail] = useState("business@flowpulse.io");
  const { toast } = useToast();

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

  const handleGenerateWithTemplate = async () => {
    if (!selectedTemplate) {
      toast({
        title: "No template selected",
        description: "Please select a template first",
        variant: "destructive"
      });
      return;
    }

    if (!prompt) {
      toast({
        title: "Missing information",
        description: "Please provide content instructions",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const template = businessTemplates.find(t => t.id === selectedTemplate);
      if (!template) {
        throw new Error('Template not found');
      }

      const sectionDescriptions = template.sections
        .filter(s => s.editable)
        .map(s => `- ${s.id} (${s.type}): ${s.placeholder}`)
        .join('\n');
      
      const systemPrompt = `You are a professional content generator for business documents.

Generate content for a document template with these editable sections:
${sectionDescriptions}

Return a JSON object where each key is a section ID and the value is the generated content.

Requirements:
- Make content specific, professional, and relevant to: ${documentType}
- Use realistic figures and UK context
- For "heading" types: Create short, impactful titles (max 10 words)
- For "subheading" types: Create concise section titles (max 8 words)
- For "body" types: Write 2-4 professional paragraphs
- For "bullet-list" types: Create 3-5 bullet points, separated by newlines
- Do NOT include bullet characters in bullet-list content

Return ONLY valid JSON.`;
      
      const fullPrompt = `${systemPrompt}\n\nClient: ${clientName || "Professional Client"}\nDocument Type: ${documentType}\n\nUser Instructions: ${prompt}\n\nAdditional Context: ${additionalDetails || "N/A"}`;

      const { data: functionData, error: functionError } = await supabase.functions.invoke('generate-document', {
        body: { 
          messages: [{ role: "user", content: fullPrompt }]
        }
      });

      if (functionError) throw functionError;

      const aiResponse = functionData?.choices?.[0]?.message?.content || "";
      
      let aiContent: AIContent;
      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        aiContent = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(aiResponse);
      } catch (parseError) {
        const sections = aiResponse.split('\n\n').filter(s => s.trim());
        aiContent = {};
        template.sections.filter(s => s.editable).forEach((section, idx) => {
          aiContent[section.id] = sections[idx] || section.defaultContent || section.placeholder;
        });
      }
      
      setGeneratedAIContent(aiContent);

      toast({
        title: "Content generated!",
        description: "Click 'Open in Editor' to view and customize your document.",
        duration: 5000,
      });
      
    } catch (error: any) {
      console.error('Generation error:', error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate document",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenInEditor = () => {
    if (!generatedAIContent || !selectedTemplate) {
      toast({
        title: "No document to edit",
        description: "Please generate a document first",
        variant: "destructive"
      });
      return;
    }
    
    navigate("/document-editor", { 
      state: { 
        templateId: selectedTemplate,
        aiContent: generatedAIContent
      } 
    });
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full business-theme">
        <BusinessSidebar userEmail={userEmail} onLogout={handleLogout} />
        
        <div className="flex-1">
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
                Back to Dashboard
              </Button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">AI Document Generator</h1>
              </div>
            </div>
          </header>

          <main className="p-6 space-y-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Template-Based Document Generation</h2>
              <p className="text-muted-foreground">Select a template and let AI generate professional content</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Template</CardTitle>
                <CardDescription>Choose a pre-designed template for your document</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {businessTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                        selectedTemplate === template.id
                          ? "border-primary bg-primary/5 shadow-lg"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex gap-4 items-start">
                        <div className="w-24 h-24 bg-muted rounded overflow-hidden flex-shrink-0 border">
                          {template.thumbnail && (
                            <img 
                              src={template.thumbnail} 
                              alt={template.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-base mb-1">{template.name}</h4>
                          <p className="text-sm text-muted-foreground mb-1">
                            {template.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {template.sections.filter(s => s.editable).length} editable sections • Native components
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="templateClientName">Client Name</Label>
                  <Input
                    id="templateClientName"
                    placeholder="Enter client name"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="templatePrompt">Content Instructions</Label>
                  <Textarea
                    id="templatePrompt"
                    placeholder="Describe what content to generate..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="templateDetails">Additional Context</Label>
                  <Textarea
                    id="templateDetails"
                    placeholder="Any specific details..."
                    value={additionalDetails}
                    onChange={(e) => setAdditionalDetails(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleGenerateWithTemplate}
                  disabled={isGenerating || !selectedTemplate}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Layout className="h-4 w-4 mr-2" />
                      Generate from Template
                    </>
                  )}
                </Button>
                
                {generatedAIContent && (
                  <Button
                    onClick={handleOpenInEditor}
                    variant="default"
                    size="lg"
                    className="w-full"
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    Open in Editor
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Template Preview</CardTitle>
                <CardDescription>Live preview of selected template</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedTemplate ? (
                  <div className="border rounded-lg overflow-hidden bg-white p-4">
                    <div className="aspect-[8/11] bg-gradient-to-br from-green-50 to-white rounded flex items-center justify-center">
                      {businessTemplates.find(t => t.id === selectedTemplate)?.thumbnail ? (
                        <img 
                          src={businessTemplates.find(t => t.id === selectedTemplate)?.thumbnail}
                          alt="Template preview"
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <div className="text-center p-8">
                          <Layout className="h-16 w-16 mx-auto mb-4 text-success" />
                          <p className="font-medium">{businessTemplates.find(t => t.id === selectedTemplate)?.name}</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            {businessTemplates.find(t => t.id === selectedTemplate)?.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {businessTemplates.find(t => t.id === selectedTemplate)?.sections.filter(s => s.editable).length} editable sections
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-muted rounded-lg p-8 text-center text-muted-foreground h-[600px] flex items-center justify-center">
                    <div>
                      <Layout className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Select a template to see preview</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default BusinessAIGenerator;
