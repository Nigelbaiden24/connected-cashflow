import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileText, Sparkles, Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generateFinancialReport } from "@/utils/pdfGenerator";

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
  const [documentType, setDocumentType] = useState("");
  const [prompt, setPrompt] = useState("");
  const [clientName, setClientName] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const getSystemPrompt = (type: string) => {
    const prompts: Record<string, string> = {
      "financial-plan": "You are a UK-based financial planning expert. Create a comprehensive financial plan with sections for: Executive Summary, Current Financial Position, Goals & Objectives, Recommendations, Action Plan, and Risk Analysis. Use UK financial terminology and regulations.",
      "proposal": "You are a professional financial advisor. Create a detailed proposal with sections for: Introduction, Services Offered, Methodology, Investment Philosophy, Fee Structure, and Next Steps.",
      "client-letter": "You are a professional financial advisor. Write a formal but warm letter to a client addressing their financial matters. Use UK business letter format.",
      "portfolio-summary": "You are a portfolio manager. Create a detailed portfolio summary including: Asset Allocation, Performance Analysis, Holdings Breakdown, Risk Metrics, and Forward-Looking Recommendations.",
      "kyc-form": "Generate a comprehensive KYC onboarding form following UK FCA requirements. Include sections for: Personal Information, Financial Situation, Investment Experience, Risk Assessment, and Regulatory Declarations.",
      "compliance-report": "You are a compliance officer. Create a detailed compliance report covering: Regulatory Framework, Compliance Status, Risk Assessment, Recommendations, and Action Items. Reference UK FCA regulations.",
      "whitepaper": "You are a financial research analyst. Write a detailed whitepaper with: Abstract, Introduction, Analysis, Methodology, Findings, Conclusions, and References.",
      "market-commentary": "You are a market analyst. Create market commentary including: Market Overview, Key Developments, Sector Analysis, Outlook, and Investment Implications. Focus on UK and global markets.",
      "meeting-agenda": "Create a professional meeting agenda with: Meeting Details, Attendees, Objectives, Discussion Points, Action Items, and Next Steps.",
      "scenario-analysis": "You are a financial analyst. Create a scenario analysis with: Base Case, Bull Case, Bear Case, Assumptions, Probability Assessments, and Recommendations.",
      "multi-page-report": "Create a comprehensive multi-page report with: Executive Summary, Detailed Analysis, Data Visualizations, Findings, Recommendations, and Appendices.",
      "pitch-deck": "Create a professional pitch deck outline with: Cover, Problem Statement, Solution, Market Opportunity, Business Model, Competitive Analysis, Financial Projections, Team, and Call to Action."
    };
    return prompts[type] || "You are a professional financial advisor. Create a professional document based on the request.";
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
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: fullPrompt }
          ]
        },
      });

      if (error) throw error;

      const content = data.choices?.[0]?.message?.content || "Failed to generate content";
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
      date: new Date(),
    });

    toast({
      title: "PDF downloaded",
      description: "Your document has been saved as PDF",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Document Generator</h1>
          <p className="text-muted-foreground">Generate professional financial documents with AI</p>
        </div>
        <Sparkles className="h-8 w-8 text-primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Configuration
            </CardTitle>
            <CardDescription>Select document type and provide details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="documentType">Document Type *</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger id="documentType">
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
              <Label htmlFor="clientName">Client Name (Optional)</Label>
              <Input
                id="clientName"
                placeholder="Enter client name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt">Document Details *</Label>
              <Textarea
                id="prompt"
                placeholder="Describe what you want in the document..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalDetails">Additional Information (Optional)</Label>
              <Textarea
                id="additionalDetails"
                placeholder="Any specific requirements, data, or formatting preferences..."
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
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Document
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Document</CardTitle>
            <CardDescription>AI-generated content preview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
    </div>
  );
};

export default AIGenerator;
