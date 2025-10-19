import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Layout, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { templates, loadTemplate } from "@/lib/templateManager";
import { DocumentEditor } from "@/components/DocumentEditor";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";

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
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [userEmail] = useState("finance@flowpulse.io");
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
      const templateHtml = await loadTemplate(selectedTemplate);
      const parser = new DOMParser();
      const doc = parser.parseFromString(templateHtml, 'text/html');
      
      // Extract all text elements from template for context
      const headings = Array.from(doc.querySelectorAll('h1, h2, h3')).map(h => h.textContent?.trim()).filter(Boolean);
      const templateStructure = headings.join(', ');
      
      const systemPrompt = `You are a professional content generator for financial documents. 
      
Generate comprehensive, detailed content that will populate this document template structure: ${templateStructure}

Your response must follow this EXACT format with sections separated by '---SECTION---':

1. Document Title (one compelling line)
---SECTION---
2. Executive Summary (3-4 professional paragraphs)
---SECTION---
3. Main Content Section 1 (3-4 detailed paragraphs)
---SECTION---
4. Main Content Section 2 (3-4 detailed paragraphs)
---SECTION---
5. Key Data Points (5-8 bullet points, each starting with •)
---SECTION---
6. Conclusion and Recommendations (2-3 paragraphs)

Make content specific, professional, and relevant to: ${documentType}.
Use realistic figures, UK context, and industry terminology.
Do NOT include HTML tags or markdown formatting.`;
      
      const fullPrompt = `${systemPrompt}\n\nClient: ${clientName || "Professional Client"}\nDocument Type: ${documentType}\n\nUser Instructions: ${prompt}\n\nAdditional Context: ${additionalDetails || "N/A"}`;

      const { data: functionData, error: functionError } = await supabase.functions.invoke('generate-document', {
        body: { 
          messages: [{ role: "user", content: fullPrompt }]
        }
      });

      if (functionError) throw functionError;

      const aiContent = functionData?.choices?.[0]?.message?.content || functionData?.response || functionData?.text || "";
      
      // Parse AI sections
      const sections = aiContent.split('---SECTION---').map(s => s.trim()).filter(s => s);
      
      console.log('Parsed sections:', sections.length);
      
      // Create a new styled document with the AI content
      const styledContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              max-width: 210mm;
              margin: 0 auto;
              padding: 40px;
              background: white;
              color: #333;
              line-height: 1.6;
            }
            h1 {
              color: #1a237e;
              font-size: 28px;
              margin-bottom: 30px;
              border-bottom: 3px solid #3f51b5;
              padding-bottom: 15px;
            }
            h2 {
              color: #3f51b5;
              font-size: 22px;
              margin-top: 30px;
              margin-bottom: 15px;
            }
            p {
              margin-bottom: 15px;
              text-align: justify;
            }
            ul {
              margin: 20px 0;
              padding-left: 30px;
            }
            li {
              margin-bottom: 10px;
            }
            .section {
              margin-bottom: 30px;
            }
            .meta {
              color: #666;
              font-size: 14px;
              margin-bottom: 30px;
            }
          </style>
        </head>
        <body>
          <div class="meta">
            <strong>Client:</strong> ${clientName || 'Professional Client'} | 
            <strong>Date:</strong> ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} | 
            <strong>Document Type:</strong> ${documentType}
          </div>
          
          <h1>${sections[0] || 'Financial Document'}</h1>
          
          <div class="section">
            <h2>Executive Summary</h2>
            ${sections[1]?.split('\n\n').map(para => `<p>${para}</p>`).join('') || ''}
          </div>
          
          <div class="section">
            <h2>Analysis</h2>
            ${sections[2]?.split('\n\n').map(para => `<p>${para}</p>`).join('') || ''}
          </div>
          
          <div class="section">
            <h2>Detailed Review</h2>
            ${sections[3]?.split('\n\n').map(para => `<p>${para}</p>`).join('') || ''}
          </div>
          
          <div class="section">
            <h2>Key Highlights</h2>
            <ul>
              ${sections[4]?.split('\n').filter(line => line.trim()).map(line => 
                `<li>${line.replace(/^[•\-*]\s*/, '').trim()}</li>`
              ).join('') || ''}
            </ul>
          </div>
          
          <div class="section">
            <h2>Conclusion and Recommendations</h2>
            ${sections[5]?.split('\n\n').map(para => `<p>${para}</p>`).join('') || ''}
          </div>
        </body>
        </html>
      `;
      
      console.log('Setting styled content');
      setEditorContent(styledContent);
      setGeneratedContent(aiContent);
      setShowEditor(true);

      toast({
        title: "Template ready!",
        description: "Your document has been generated with AI content. You can now edit it.",
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


  if (showEditor) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar userEmail={userEmail} onLogout={handleLogout} />
          
          <div className="flex-1 flex flex-col">
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
                  <h1 className="text-2xl font-bold">Document Editor</h1>
                  <p className="text-sm text-muted-foreground">Edit your generated document</p>
                </div>
                <Button onClick={() => setShowEditor(false)} variant="outline">
                  Back to Generator
                </Button>
              </div>
            </header>
            <DocumentEditor 
              initialContent={editorContent}
              onSave={(content) => {
                setGeneratedContent(content);
                toast({
                  title: "Saved",
                  description: "Document saved successfully"
                });
              }}
            />
          </div>
        </div>
      </SidebarProvider>
    );
  }

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
                  {templates.map((template) => (
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
                          <img 
                            src={template.thumbnailUrl} 
                            alt={template.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-base mb-1">{template.name}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                          <span className="text-xs bg-secondary px-2 py-1 rounded">{template.category}</span>
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Template Preview</CardTitle>
                <CardDescription>Live preview of selected template</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedTemplate ? (
                  <div className="border rounded-lg overflow-hidden bg-white">
                    <iframe 
                      src={templates.find(t => t.id === selectedTemplate)?.htmlPath} 
                      title="Template preview"
                      className="w-full h-[600px] border-0"
                      sandbox="allow-same-origin"
                    />
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

export default FinanceAIGenerator;
