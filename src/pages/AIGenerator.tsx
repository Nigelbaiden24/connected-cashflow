import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, FileText, Download, Layout, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generateFinancialReport } from "@/utils/pdfGenerator";
import { templates, loadTemplate } from "@/lib/templateManager";
import { DocumentEditor } from "@/components/DocumentEditor";
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

const AIGenerator = () => {
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
  const { toast } = useToast();

  const getSystemPrompt = (type: string) => {
    const prompts: Record<string, string> = {
      "financial-plan": `Create a comprehensive UK financial plan with clear sections, bold headings, specific figures, and realistic UK context. Include asset allocations, tax allowances (£20,000 ISA, £60,000 pension), and FCA-compliant advice.`,
      "proposal": `Create a professional financial advisory proposal with firm credentials, services, fee structure in tables, and regulatory information.`,
      "client-letter": `Create a UK business letter with proper formatting, date, address, salutation, and professional closing.`,
      "portfolio-summary": `Create a detailed portfolio review with holdings tables, performance metrics, asset allocation, and risk analysis.`,
      "kyc-form": `Create a comprehensive KYC form with personal information, financial situation, investment experience, risk assessment, and regulatory declarations.`,
      "compliance-report": `Create a detailed compliance report with executive summary, regulatory framework, assessment by area, risk register, and recommendations.`,
      "whitepaper": `Create an authoritative whitepaper with abstract, methodology, analysis, conclusions, and references.`,
      "market-commentary": `Create market commentary with key takeaways, market overview, economic context, sector analysis, and outlook.`,
      "meeting-agenda": `Create a professional meeting agenda with times, agenda items, action items table, and preparation materials.`,
      "scenario-analysis": `Create scenario analysis with base/bull/bear cases, probability weights, sensitivity analysis, and recommendations.`,
      "multi-page-report": `Create a comprehensive multi-page report with table of contents, executive summary, detailed analysis, and appendices.`,
      "pitch-deck": `Create a pitch deck with 10-15 slides including problem, solution, market, business model, team, and financials.`
    };
    return prompts[type] || "Create a professional, detailed financial document with proper formatting and UK context.";
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

    setIsGenerating(true);
    try {
      const templateHtml = await loadTemplate(selectedTemplate);
      
      const systemPrompt = `You are a content generator. Generate ONLY the text content (no HTML tags) that should replace placeholder text in a professional document. 
      Generate content for the following sections in order, separated by '---SECTION---':
      1. Main title/heading
      2. Executive summary or introduction (2-3 paragraphs)
      3. First main section content (2-3 paragraphs)
      4. Second main section content (2-3 paragraphs)
      5. Key metrics or data points (as bullet points)
      6. Conclusion or next steps (1-2 paragraphs)
      
      Keep the tone professional and the content relevant to: ${documentType}`;
      
      const fullPrompt = `${systemPrompt}\n\nClient: ${clientName}\nDocument Type: ${documentType}\n\nUser Request: ${prompt}\n\nAdditional Context: ${additionalDetails}`;

      const { data: functionData, error: functionError } = await supabase.functions.invoke('financial-chat', {
        body: { 
          messages: [{ role: "user", content: fullPrompt }]
        }
      });

      if (functionError) throw functionError;

      const aiContent = functionData?.choices?.[0]?.message?.content || functionData?.response || functionData?.text || "";
      
      // Parse AI content into sections
      const sections = aiContent.split('---SECTION---').map(s => s.trim()).filter(s => s);
      
      // Parse template HTML and intelligently replace content
      const parser = new DOMParser();
      const doc = parser.parseFromString(templateHtml, 'text/html');
      
      // Replace client name and date placeholders
      const replaceInNode = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE && node.textContent) {
          node.textContent = node.textContent
            .replace(/\[CLIENT_NAME\]/g, clientName || 'Client')
            .replace(/\[DATE\]/g, new Date().toLocaleDateString('en-GB'));
        }
        node.childNodes.forEach(replaceInNode);
      };
      replaceInNode(doc.body);
      
      // Find and replace content in headings and paragraphs
      let sectionIndex = 0;
      
      // Replace main heading
      const h1 = doc.querySelector('h1');
      if (h1 && sections[sectionIndex]) {
        h1.textContent = sections[sectionIndex++];
      }
      
      // Replace paragraphs with AI content while preserving structure
      const paragraphs = Array.from(doc.querySelectorAll('p'));
      const contentSections = sections.slice(sectionIndex);
      
      contentSections.forEach((content, idx) => {
        if (paragraphs[idx]) {
          // Check if content has bullet points
          if (content.includes('•') || content.includes('-')) {
            // Convert to list if parent allows
            const parent = paragraphs[idx].parentElement;
            if (parent) {
              const ul = doc.createElement('ul');
              ul.className = paragraphs[idx].className;
              content.split('\n').filter(line => line.trim()).forEach(line => {
                const li = doc.createElement('li');
                li.textContent = line.replace(/^[•\-]\s*/, '');
                ul.appendChild(li);
              });
              parent.replaceChild(ul, paragraphs[idx]);
            }
          } else {
            paragraphs[idx].textContent = content;
          }
        }
      });
      
      const modifiedHtml = doc.documentElement.outerHTML;
      
      setEditorContent(modifiedHtml);
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

  const handleGenerate = async () => {
    if (!documentType || !prompt) {
      toast({
        title: "Missing information",
        description: "Please select a document type and provide details",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedContent("");

    try {
      const systemPrompt = getSystemPrompt(documentType);
      const fullPrompt = `${systemPrompt}\n\nClient Name: ${clientName || "Not specified"}\n\nDocument Request: ${prompt}\n\nAdditional Details: ${additionalDetails || "None"}`;

      const { data, error } = await supabase.functions.invoke('financial-chat', {
        body: {
          messages: [{ role: "user", content: fullPrompt }]
        },
      });

      if (error) throw error;

      const content = data?.choices?.[0]?.message?.content || data?.response || data?.text || "Failed to generate content";
      setGeneratedContent(content);

      toast({
        title: "Document generated",
        description: "Your document has been created successfully",
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!generatedContent) {
      toast({
        title: "No content",
        description: "Generate a document first before downloading",
        variant: "destructive",
      });
      return;
    }

    const documentLabel = documentTypes.find(d => d.value === documentType)?.label || "Document";
    
    generateFinancialReport({
      title: `${documentLabel}${clientName ? ` - ${clientName}` : ''}`,
      content: generatedContent,
      generatedBy: "FlowPulse AI Generator",
      date: new Date()
    });

    toast({
      title: "PDF downloaded",
      description: "Your document has been saved as PDF",
    });
  };

  if (showEditor) {
    return (
      <div className="h-screen flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Document Editor</h1>
            <p className="text-sm text-muted-foreground">Edit your generated document</p>
          </div>
          <Button onClick={() => setShowEditor(false)} variant="outline">
            Back to Generator
          </Button>
        </div>
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
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Recruitment
            </Button>
          </div>
          <h1 className="text-3xl font-bold">FlowPulse AI Tool</h1>
          <p className="text-muted-foreground">Generate professional financial documents with AI assistance</p>
        </div>
      </div>

      <Tabs defaultValue="standard" className="space-y-6">
        <TabsList>
          <TabsTrigger value="standard">Standard Generation</TabsTrigger>
          <TabsTrigger value="template">
            <Layout className="h-4 w-4 mr-2" />
            Template-Based
          </TabsTrigger>
        </TabsList>

        <TabsContent value="standard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Document Configuration</CardTitle>
                <CardDescription>Configure your document parameters and requirements</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="documentType">Document Type</Label>
                  <Select value={documentType} onValueChange={setDocumentType}>
                    <SelectTrigger id="documentType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name (Optional)</Label>
                  <Input
                    id="clientName"
                    placeholder="Enter client name"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prompt">Document Details</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Describe what you want in the document..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalDetails">Additional Information</Label>
                  <Textarea
                    id="additionalDetails"
                    placeholder="Any specific requirements..."
                    value={additionalDetails}
                    onChange={(e) => setAdditionalDetails(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !documentType || !prompt}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Document
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Generated Document</CardTitle>
                <CardDescription>AI-generated content preview</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                {generatedContent ? (
                  <>
                    <div className="bg-muted rounded-lg p-4 max-h-[500px] overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm">{generatedContent}</pre>
                    </div>
                    <Button onClick={handleDownloadPDF} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download as PDF
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      {isGenerating
                        ? "Generating your document..."
                        : "Your generated document will appear here"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="template" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Select Template</CardTitle>
                  <CardDescription>Choose a professional template</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {templates.map((template) => (
                    <Card
                      key={template.id}
                      className={`cursor-pointer transition-all ${
                        selectedTemplate === template.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-32 h-24 bg-muted rounded overflow-hidden flex-shrink-0 border">
                            <iframe 
                              src={template.htmlPath} 
                              className="w-full h-full pointer-events-none"
                              style={{ transform: 'scale(0.25)', transformOrigin: 'top left', width: '400%', height: '400%' }}
                              title={template.name}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold">{template.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                            <p className="text-xs text-primary mt-2">{template.category}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Document Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="template-client">Client Name</Label>
                    <Input
                      id="template-client"
                      placeholder="Enter client name"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="template-type">Document Type</Label>
                    <Select value={documentType} onValueChange={setDocumentType}>
                      <SelectTrigger id="template-type">
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent>
                        {documentTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="template-prompt">Content Instructions</Label>
                    <Textarea
                      id="template-prompt"
                      placeholder="Describe what you want..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={6}
                    />
                  </div>

                  <Button
                    onClick={handleGenerateWithTemplate}
                    disabled={isGenerating || !selectedTemplate}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Generate & Edit
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>Template preview</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedTemplate ? (
                  <div className="aspect-[8.5/11] bg-white rounded border overflow-hidden">
                    <iframe 
                      src={templates.find(t => t.id === selectedTemplate)?.htmlPath}
                      className="w-full h-full"
                      title="Template Preview"
                    />
                  </div>
                ) : (
                  <div className="aspect-[8.5/11] bg-muted rounded flex items-center justify-center">
                    <div className="text-center">
                      <Layout className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Select a template to preview</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIGenerator;