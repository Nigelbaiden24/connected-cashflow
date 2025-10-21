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
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import { documentTemplates } from "@/data/documentTemplates";
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

const FinanceAIGenerator = () => {
  const navigate = useNavigate();
  const [documentType, setDocumentType] = useState("financial-plan");
  const [prompt, setPrompt] = useState("");
  const [clientName, setClientName] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("financial-plan");
  const [generatedAIContent, setGeneratedAIContent] = useState<AIContent | null>(null);
  const [userEmail] = useState("finance@flowpulse.io");
  const { toast } = useToast();

  // Update selected template when document type changes
  const handleDocumentTypeChange = (value: string) => {
    setDocumentType(value);
    setSelectedTemplate(value); // Use the same ID for template
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
      const template = documentTemplates.find(t => t.id === selectedTemplate);
      if (!template) {
        throw new Error('Template not found');
      }

      console.log('Using template:', template.name);
      console.log('Template has', template.sections.length, 'sections');
      
      const sectionDescriptions = template.sections
        .filter(s => s.editable)
        .map(s => `- ${s.id} (${s.type}): ${s.placeholder}`)
        .join('\n');
      
      const systemPrompt = `You are a professional content generator for financial documents.

Generate content for a document template with these editable sections:
${sectionDescriptions}

Return a JSON object where each key is a section ID and the value is the generated content for that section.

Requirements:
- Make content specific, professional, and relevant to: ${documentType}
- Use realistic figures and UK context
- For "heading" types: Create short, impactful titles (max 10 words)
- For "subheading" types: Create concise section titles (max 8 words)
- For "body" types: Write 2-4 professional paragraphs
- For "bullet-list" types: Create 3-5 bullet points, separated by newlines
- Do NOT include bullet characters (•, -, *) in bullet-list content
- Do NOT include any special formatting

Return ONLY valid JSON in this exact format:
{
  "title": "Generated title here",
  "subtitle": "Generated subtitle here",
  ...
}`;
      
      const fullPrompt = `${systemPrompt}\n\nClient: ${clientName || "Professional Client"}\nDocument Type: ${documentType}\n\nUser Instructions: ${prompt}\n\nAdditional Context: ${additionalDetails || "N/A"}`;

      console.log('Calling AI to generate content...');
      const { data: functionData, error: functionError } = await supabase.functions.invoke('generate-document', {
        body: { 
          messages: [{ role: "user", content: fullPrompt }]
        }
      });

      if (functionError) {
        console.error('AI generation error:', functionError);
        throw functionError;
      }

      const aiResponse = functionData?.choices?.[0]?.message?.content || functionData?.response || functionData?.text || "";
      
      if (!aiResponse) {
        throw new Error('No content generated from AI');
      }
      
      console.log('AI Response:', aiResponse.substring(0, 200));
      
      let aiContent: AIContent;
      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiContent = JSON.parse(jsonMatch[0]);
        } else {
          aiContent = JSON.parse(aiResponse);
        }
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        const sections = aiResponse.split('\n\n').filter(s => s.trim());
        aiContent = {};
        template.sections.filter(s => s.editable).forEach((section, idx) => {
          aiContent[section.id] = sections[idx] || section.defaultContent || section.placeholder;
        });
      }
      
      console.log('Parsed AI content:', Object.keys(aiContent).length, 'regions');
      
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
      <div className="flex min-h-screen w-full">
        <AppSidebar userEmail={userEmail} onLogout={handleLogout} />
        
        <div className="flex-1">
          <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
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
              <h2 className="text-lg font-semibold mb-2">AI Document Generation</h2>
              <p className="text-muted-foreground">Generate professional financial documents with AI</p>
            </div>

            {/* Template Selection Grid */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Select a Template</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {documentTemplates.map((template) => (
                  <Card 
                    key={template.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedTemplate === template.id 
                        ? 'ring-2 ring-primary shadow-lg' 
                        : 'hover:ring-1 hover:ring-primary/50'
                    }`}
                    onClick={() => {
                      setSelectedTemplate(template.id);
                      setDocumentType(template.id);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="aspect-video rounded-lg mb-3 overflow-hidden">
                        {template.thumbnail ? (
                          <img src={template.thumbnail} alt={template.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="bg-gradient-to-br from-primary/10 to-chart-2/10 h-full flex items-center justify-center border border-primary/20">
                            <Layout className="h-8 w-8 text-primary" />
                          </div>
                        )}
                      </div>
                      <h4 className="font-semibold text-sm mb-1">{template.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Document Generator</CardTitle>
                  <CardDescription>Provide details to generate your document</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="templateClientName">Client Name</Label>
                    <Input
                      id="templateClientName"
                      placeholder="Enter client name..."
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="templateType">Selected Template</Label>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="font-medium">
                        {documentTemplates.find(t => t.id === selectedTemplate)?.name || "No template selected"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {documentTemplates.find(t => t.id === selectedTemplate)?.description}
                      </p>
                    </div>
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
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Document
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
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default FinanceAIGenerator;
