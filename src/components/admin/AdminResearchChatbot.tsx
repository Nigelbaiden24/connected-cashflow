import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Send, 
  Bot, 
  User, 
  FileText, 
  Download, 
  Loader2, 
  Sparkles, 
  TrendingUp,
  BarChart3,
  Shield,
  Globe,
  Briefcase,
  PieChart,
  AlertTriangle,
  BookOpen,
  RefreshCw
} from "lucide-react";
import jsPDF from "jspdf";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isReport?: boolean;
}

const QUICK_PROMPTS = [
  { 
    label: "Market Outlook", 
    icon: TrendingUp, 
    prompt: "Generate a comprehensive Q1 2026 Global Market Outlook report covering equities, fixed income, and alternative investments with key risks and opportunities.",
    isReport: true
  },
  { 
    label: "Sector Analysis", 
    icon: BarChart3, 
    prompt: "Create a detailed Technology Sector Analysis report including valuations, growth drivers, key players, and investment recommendations.",
    isReport: true
  },
  { 
    label: "Risk Assessment", 
    icon: Shield, 
    prompt: "Generate a Portfolio Risk Assessment report analyzing market risk, credit risk, liquidity risk, and operational risk with mitigation strategies.",
    isReport: true
  },
  { 
    label: "ESG Report", 
    icon: Globe, 
    prompt: "Create an ESG Investment Analysis report covering environmental, social, and governance factors for a diversified equity portfolio.",
    isReport: true
  },
  { 
    label: "Fund Due Diligence", 
    icon: Briefcase, 
    prompt: "Generate a comprehensive Fund Due Diligence report template for evaluating a multi-strategy hedge fund.",
    isReport: true
  },
  { 
    label: "Asset Allocation", 
    icon: PieChart, 
    prompt: "Create a Strategic Asset Allocation report for a moderate-risk investor with £500,000 portfolio over a 10-year horizon.",
    isReport: true
  },
];

export const AdminResearchChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamChat = async (userMessages: Message[], generateReport: boolean = false) => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-research-chat`;

    const response = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        messages: userMessages.map(m => ({ role: m.role, content: m.content })),
        generateReport,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 429) {
        toast.error("Rate limit exceeded. Please wait a moment and try again.");
      } else if (response.status === 402) {
        toast.error("Usage limit reached. Please add credits to continue.");
      } else {
        toast.error(errorData.error || "Failed to get response");
      }
      throw new Error(errorData.error || "Failed to start stream");
    }

    if (!response.body) throw new Error("No response body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantContent = "";

    const updateAssistantMessage = (content: string, isReport: boolean) => {
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => 
            i === prev.length - 1 ? { ...m, content, isReport } : m
          );
        }
        return [...prev, {
          id: `msg-${Date.now()}`,
          role: "assistant" as const,
          content,
          timestamp: new Date(),
          isReport,
        }];
      });
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            assistantContent += content;
            updateAssistantMessage(assistantContent, generateReport);
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    return assistantContent;
  };

  const handleSend = async (customPrompt?: string, isReport: boolean = false) => {
    const messageContent = customPrompt || input.trim();
    if (!messageContent || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: messageContent,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      await streamChat([...messages, userMessage], isReport);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const generatePDF = async (content: string, title: string = "Research Report") => {
    setIsGeneratingPDF(true);
    
    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Header
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, pageWidth, 35, "F");
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text("FlowPulse Research", margin, 15);
      
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Generated: ${new Date().toLocaleDateString("en-GB", { 
        day: "numeric", 
        month: "long", 
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })}`, margin, 25);

      yPosition = 45;
      pdf.setTextColor(0, 0, 0);

      // Process markdown content
      const lines = content.split("\n");
      
      for (const line of lines) {
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }

        const trimmedLine = line.trim();

        if (trimmedLine.startsWith("## ")) {
          // Main heading
          yPosition += 8;
          pdf.setFontSize(14);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(15, 23, 42);
          const headingText = trimmedLine.replace("## ", "");
          pdf.text(headingText, margin, yPosition);
          yPosition += 8;
          pdf.setDrawColor(59, 130, 246);
          pdf.setLineWidth(0.5);
          pdf.line(margin, yPosition, margin + 40, yPosition);
          yPosition += 6;
        } else if (trimmedLine.startsWith("### ")) {
          // Subheading
          yPosition += 5;
          pdf.setFontSize(12);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(51, 65, 85);
          const subheadingText = trimmedLine.replace("### ", "");
          pdf.text(subheadingText, margin, yPosition);
          yPosition += 6;
        } else if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ")) {
          // Bullet points
          pdf.setFontSize(10);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(71, 85, 105);
          const bulletText = trimmedLine.replace(/^[-*]\s/, "");
          const wrappedLines = pdf.splitTextToSize(`• ${bulletText}`, contentWidth - 5);
          wrappedLines.forEach((wrappedLine: string) => {
            if (yPosition > pageHeight - margin) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(wrappedLine, margin + 5, yPosition);
            yPosition += 5;
          });
        } else if (trimmedLine.startsWith("|")) {
          // Table row - simplified handling
          pdf.setFontSize(9);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(71, 85, 105);
          const cleanedLine = trimmedLine.replace(/\|/g, "  ").trim();
          if (cleanedLine && !cleanedLine.match(/^[-\s]+$/)) {
            pdf.text(cleanedLine, margin, yPosition);
            yPosition += 5;
          }
        } else if (trimmedLine.startsWith("**") && trimmedLine.endsWith("**")) {
          // Bold text
          pdf.setFontSize(10);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(30, 41, 59);
          const boldText = trimmedLine.replace(/\*\*/g, "");
          pdf.text(boldText, margin, yPosition);
          yPosition += 5;
        } else if (trimmedLine) {
          // Regular paragraph
          pdf.setFontSize(10);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(71, 85, 105);
          const wrappedLines = pdf.splitTextToSize(trimmedLine, contentWidth);
          wrappedLines.forEach((wrappedLine: string) => {
            if (yPosition > pageHeight - margin) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(wrappedLine, margin, yPosition);
            yPosition += 5;
          });
        } else {
          yPosition += 3;
        }
      }

      // Footer on each page
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(156, 163, 175);
        pdf.text(
          `FlowPulse Research | Confidential | Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" }
        );
      }

      const fileName = `FlowPulse-Report-${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(fileName);
      
      toast.success("PDF report downloaded successfully!");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    toast.success("Chat cleared");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-slate-200 shadow-lg bg-gradient-to-r from-violet-50 via-white to-indigo-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-slate-900">Research AI Assistant</CardTitle>
                <CardDescription className="text-slate-600">
                  Specialist financial research chatbot with PDF report generation
                </CardDescription>
              </div>
            </div>
            {messages.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearChat}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear Chat
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Quick Report Prompts */}
      <Card className="border-slate-200 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-violet-600" />
            Quick Report Generation
          </CardTitle>
          <CardDescription>
            Click any template to generate a professional PDF-ready report
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {QUICK_PROMPTS.map((item, idx) => (
              <Button
                key={idx}
                variant="outline"
                className="h-auto py-3 px-4 flex flex-col items-center gap-2 hover:bg-violet-50 hover:border-violet-300 transition-all"
                onClick={() => handleSend(item.prompt, item.isReport)}
                disabled={isLoading}
              >
                <item.icon className="h-5 w-5 text-violet-600" />
                <span className="text-xs font-medium text-slate-700">{item.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="border-slate-200 shadow-lg">
        <CardContent className="p-0">
          {/* Messages Area */}
          <ScrollArea className="h-[500px] p-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Bot className="h-16 w-16 mb-4 text-violet-300" />
                <h3 className="text-lg font-semibold text-slate-700">Financial Research Assistant</h3>
                <p className="text-sm max-w-md mt-2">
                  Ask me anything about financial markets, investments, or generate professional research reports. 
                  Use the quick templates above for instant report generation.
                </p>
                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                  <Badge variant="secondary" className="text-xs">Investment Analysis</Badge>
                  <Badge variant="secondary" className="text-xs">Market Research</Badge>
                  <Badge variant="secondary" className="text-xs">Risk Assessment</Badge>
                  <Badge variant="secondary" className="text-xs">ESG Analysis</Badge>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-xl px-4 py-3 ${
                        message.role === "user"
                          ? "bg-gradient-to-br from-violet-500 to-indigo-600 text-white"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {message.role === "assistant" ? (
                        <div className="prose prose-sm max-w-none prose-headings:text-slate-800 prose-p:text-slate-700 prose-li:text-slate-700">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content}
                          </ReactMarkdown>
                          {message.isReport && message.content.length > 100 && (
                            <div className="mt-4 pt-3 border-t border-slate-200">
                              <Button
                                size="sm"
                                onClick={() => generatePDF(message.content)}
                                disabled={isGeneratingPDF}
                                className="bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700"
                              >
                                {isGeneratingPDF ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Generating PDF...
                                  </>
                                ) : (
                                  <>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download as PDF
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm">{message.content}</p>
                      )}
                    </div>
                    {message.role === "user" && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                        <User className="h-4 w-4 text-slate-600" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-slate-100 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-violet-600" />
                        <span className="text-sm text-slate-600">Analyzing and generating response...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-slate-200 p-4 bg-slate-50">
            <div className="flex gap-3">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about financial markets, request analysis, or generate reports..."
                className="min-h-[60px] resize-none bg-white"
                disabled={isLoading}
              />
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 h-full"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
              <AlertTriangle className="h-3 w-3" />
              <span>AI-generated content is for informational purposes only. Always verify with authoritative sources.</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Capabilities Info */}
      <Card className="border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
        <CardContent className="py-4">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-5 w-5 text-slate-600" />
            <span className="font-semibold text-slate-700">AI Capabilities</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span>Market Analysis</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              <span>Sector Research</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Shield className="h-4 w-4 text-orange-600" />
              <span>Risk Assessment</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <FileText className="h-4 w-4 text-violet-600" />
              <span>PDF Reports</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
