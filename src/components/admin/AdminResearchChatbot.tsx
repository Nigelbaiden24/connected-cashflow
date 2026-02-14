import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  RefreshCw,
  Database,
  ChevronDown,
  Zap,
  Newspaper,
  Video,
  MessageSquare,
  Upload,
  Bell,
  GraduationCap,
  LineChart,
} from "lucide-react";
import jsPDF from "jspdf";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AdminMeetingPanel } from "./AdminMeetingPanel";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isReport?: boolean;
}

// 18 Research platforms
const RESEARCH_PLATFORMS = [
  { id: "marketbeat", name: "MarketBeat", category: "Ratings & Analysis" },
  { id: "factset", name: "FactSet", category: "Institutional Data" },
  { id: "quartr", name: "Quartr", category: "Earnings Calls" },
  { id: "koyfin", name: "Koyfin", category: "Market Data" },
  { id: "spiking", name: "Spiking", category: "Insider Activity" },
  { id: "seekingalpha", name: "Seeking Alpha", category: "Research & Ideas" },
  { id: "tipranks", name: "TipRanks", category: "Analyst Ratings" },
  { id: "investingcom", name: "Investing.com", category: "Global Markets" },
  { id: "tradingview", name: "TradingView", category: "Technical Analysis" },
  { id: "marketwatch", name: "MarketWatch", category: "Market News" },
  { id: "yahoofinance", name: "Yahoo Finance", category: "General Finance" },
  { id: "cnbc", name: "CNBC", category: "Business News" },
  { id: "bloomberg", name: "Bloomberg", category: "Premium News" },
  { id: "ft", name: "Financial Times", category: "Global Analysis" },
  { id: "morningstar", name: "Morningstar", category: "Fund Research" },
  { id: "zacks", name: "Zacks", category: "Stock Research" },
  { id: "benzinga", name: "Benzinga", category: "Trading News" },
  { id: "thestreet", name: "TheStreet", category: "Investment News" },
];

const QUICK_PROMPTS = [
  { 
    label: "Market Outlook", 
    icon: TrendingUp, 
    prompt: "Generate a comprehensive Q1 2026 Global Market Outlook report covering equities, fixed income, and alternative investments with key risks and opportunities.",
    isReport: true,
    suggestedPlatforms: ["bloomberg", "ft", "cnbc", "marketwatch"]
  },
  { 
    label: "Sector Analysis", 
    icon: BarChart3, 
    prompt: "Create a detailed Technology Sector Analysis report including valuations, growth drivers, key players, and investment recommendations.",
    isReport: true,
    suggestedPlatforms: ["seekingalpha", "tipranks", "zacks", "morningstar"]
  },
  { 
    label: "Risk Assessment", 
    icon: Shield, 
    prompt: "Generate a Portfolio Risk Assessment report analyzing market risk, credit risk, liquidity risk, and operational risk with mitigation strategies.",
    isReport: true,
    suggestedPlatforms: ["factset", "koyfin", "bloomberg"]
  },
  { 
    label: "ESG Report", 
    icon: Globe, 
    prompt: "Create an ESG Investment Analysis report covering environmental, social, and governance factors for a diversified equity portfolio.",
    isReport: true,
    suggestedPlatforms: ["morningstar", "ft", "bloomberg"]
  },
  { 
    label: "Fund Due Diligence", 
    icon: Briefcase, 
    prompt: "Generate a comprehensive Fund Due Diligence report template for evaluating a multi-strategy hedge fund.",
    isReport: true,
    suggestedPlatforms: ["morningstar", "factset", "seekingalpha"]
  },
  { 
    label: "Asset Allocation", 
    icon: PieChart, 
    prompt: "Create a Strategic Asset Allocation report for a moderate-risk investor with £500,000 portfolio over a 10-year horizon.",
    isReport: true,
    suggestedPlatforms: ["koyfin", "morningstar", "yahoofinance"]
  },
  { 
    label: "Live Market News", 
    icon: Newspaper, 
    prompt: "Give me a comprehensive summary of today's most important market news, stock movements, and key events affecting global markets.",
    isReport: false,
    suggestedPlatforms: ["cnbc", "bloomberg", "marketwatch", "yahoofinance", "benzinga"]
  },
  { 
    label: "Analyst Picks", 
    icon: Zap, 
    prompt: "What are the top analyst stock picks and upgrades/downgrades from today? Include price targets and ratings changes.",
    isReport: false,
    suggestedPlatforms: ["tipranks", "marketbeat", "seekingalpha", "zacks"]
  },
];

const CONTENT_ACTION_PROMPTS = [
  { label: "Post Newsletter", icon: Newspaper, prompt: "Create and post a weekly market newsletter to all investor platform users covering this week's key market movements, sector performance, and outlook for next week." },
  { label: "Send Alert", icon: Bell, prompt: "Post a market update alert to all users about today's significant market developments and any important price movements or economic data releases." },
  { label: "Post Learning", icon: GraduationCap, prompt: "Create and post a beginner-friendly educational article about portfolio diversification strategies to the learning hub for all users." },
  { label: "Market Commentary", icon: LineChart, prompt: "Write and post a market commentary for all finance platform users analyzing the current macro environment and its implications for portfolios." },
  { label: "Post Trend", icon: TrendingUp, prompt: "Create and post a market trend update about the latest sector rotation patterns and what they signal for investors." },
  { label: "List Users", icon: User, prompt: "Show me a list of all available users so I can target content to specific people." },
];

export const AdminResearchChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isFetchingResearch, setIsFetchingResearch] = useState(false);
  const [platformSelectorOpen, setPlatformSelectorOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<'chat' | 'meeting'>('chat');
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle meeting summary being added to chat
  const handleMeetingSummaryToChat = (summary: string) => {
    const summaryMessage: Message = {
      id: `msg-meeting-${Date.now()}`,
      role: "assistant",
      content: summary,
      timestamp: new Date(),
      isReport: true,
    };
    setMessages(prev => [...prev, summaryMessage]);
    setActiveMode('chat');
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const selectAllPlatforms = () => {
    setSelectedPlatforms(RESEARCH_PLATFORMS.map(p => p.id));
  };

  const clearAllPlatforms = () => {
    setSelectedPlatforms([]);
  };

  const streamChat = async (
    userMessages: Message[], 
    generateReport: boolean = false,
    fetchResearch: boolean = false,
    platforms: string[] = []
  ) => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-research-chat`;

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

    if (fetchResearch && platforms.length > 0) {
      setIsFetchingResearch(true);
      toast.info(`Fetching live research from ${platforms.length} platform(s)...`);
    }

    const response = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        messages: userMessages.map(m => ({ role: m.role, content: m.content })),
        generateReport,
        fetchResearch,
        platforms,
      }),
    });

    setIsFetchingResearch(false);

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

    const contentType = response.headers.get("content-type") || "";
    
    // Handle non-streaming JSON response (tool call results)
    if (contentType.includes("application/json")) {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "Action completed.";
      
      // Show action notifications
      if (data.tool_actions) {
        for (const action of data.tool_actions) {
          if (action.success) {
            toast.success(`✅ ${action.type} "${action.title}" posted successfully!`);
          } else {
            toast.error(`Failed: ${action.error}`);
          }
        }
      }
      
      updateAssistantMessage(content, generateReport);
      return content;
    }

    // Handle SSE stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantContent = "";

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

  const handleSend = async (
    customPrompt?: string, 
    isReport: boolean = false,
    suggestedPlatforms?: string[]
  ) => {
    const messageContent = customPrompt || input.trim();
    if (!messageContent || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: messageContent,
      timestamp: new Date(),
    };

    // Use suggested platforms if provided, otherwise use selected ones
    const platformsToUse = suggestedPlatforms || selectedPlatforms;
    const shouldFetchResearch = platformsToUse.length > 0;

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      await streamChat([...messages, userMessage], isReport, shouldFetchResearch, platformsToUse);
      if (shouldFetchResearch) {
        toast.success(`Analysis complete with live data from ${platformsToUse.length} platform(s)`);
      }
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
      {/* Header with Mode Toggle */}
      <Card className="border-slate-200 shadow-lg bg-gradient-to-r from-violet-50 via-white to-indigo-50">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-slate-900">Research AI Assistant</CardTitle>
                <CardDescription className="text-slate-600">
                  Powered by 18 live research platforms with AI synthesis & meeting transcription
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Mode Toggle */}
              <div className="flex bg-slate-100 rounded-lg p-1">
                <Button
                  variant={activeMode === 'chat' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveMode('chat')}
                  className={activeMode === 'chat' ? 'bg-white shadow-sm' : ''}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat
                </Button>
                <Button
                  variant={activeMode === 'meeting' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveMode('meeting')}
                  className={activeMode === 'meeting' ? 'bg-white shadow-sm' : ''}
                >
                  <Video className="h-4 w-4 mr-2" />
                  Meeting
                </Button>
              </div>
              {messages.length > 0 && activeMode === 'chat' && (
                <Button variant="outline" size="sm" onClick={clearChat}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Meeting Mode */}
      {activeMode === 'meeting' && (
        <AdminMeetingPanel onAddToChat={handleMeetingSummaryToChat} />
      )}

      {/* Chat Mode */}
      {activeMode === 'chat' && (
        <>
      {/* Research Platform Selector */}
      <Card className="border-slate-200 shadow-md bg-white">
        <Collapsible open={platformSelectorOpen} onOpenChange={setPlatformSelectorOpen}>
          <CardHeader className="pb-3">
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-emerald-600" />
                <CardTitle className="text-lg">Live Research Sources</CardTitle>
                {selectedPlatforms.length > 0 && (
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                    {selectedPlatforms.length} selected
                  </Badge>
                )}
              </div>
              <ChevronDown className={`h-5 w-5 text-slate-500 transition-transform ${platformSelectorOpen ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
            <CardDescription>
              Select platforms to fetch live research data for AI-powered analysis
            </CardDescription>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="flex gap-2 mb-4">
                <Button variant="outline" size="sm" onClick={selectAllPlatforms}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={clearAllPlatforms}>
                  Clear All
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {RESEARCH_PLATFORMS.map((platform) => (
                  <div
                    key={platform.id}
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedPlatforms.includes(platform.id)
                        ? "border-emerald-400 bg-emerald-50 shadow-sm"
                        : "border-slate-200 hover:border-emerald-200 hover:bg-slate-50"
                    }`}
                    onClick={() => togglePlatform(platform.id)}
                  >
                    <Checkbox 
                      checked={selectedPlatforms.includes(platform.id)}
                      className="pointer-events-none"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{platform.name}</p>
                      <p className="text-xs text-slate-500 truncate">{platform.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Quick Report Prompts */}
      <Card className="border-slate-200 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-violet-600" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Click any template - reports auto-fetch from optimal research platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {QUICK_PROMPTS.map((item, idx) => (
              <Button
                key={idx}
                variant="outline"
                className="h-auto py-3 px-3 flex flex-col items-center gap-2 hover:bg-violet-50 hover:border-violet-300 transition-all"
                onClick={() => handleSend(item.prompt, item.isReport, item.suggestedPlatforms)}
                disabled={isLoading}
              >
                <item.icon className="h-5 w-5 text-violet-600" />
                <span className="text-xs font-medium text-slate-700 text-center">{item.label}</span>
                {item.suggestedPlatforms && (
                  <span className="text-[10px] text-emerald-600">{item.suggestedPlatforms.length} sources</span>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content Posting Actions */}
      <Card className="border-slate-200 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Upload className="h-5 w-5 text-amber-600" />
            Content Actions
          </CardTitle>
          <CardDescription>
            Post content directly to user accounts — describe what, where, and who
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {CONTENT_ACTION_PROMPTS.map((item, idx) => (
              <Button
                key={idx}
                variant="outline"
                className="h-auto py-3 px-3 flex flex-col items-center gap-2 hover:bg-amber-50 hover:border-amber-300 transition-all"
                onClick={() => handleSend(item.prompt)}
                disabled={isLoading}
              >
                <item.icon className="h-5 w-5 text-amber-600" />
                <span className="text-xs font-medium text-slate-700 text-center">{item.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="border-slate-200 shadow-lg">
        <CardContent className="p-0">
          {/* Loading indicator for research fetch */}
          {isFetchingResearch && (
            <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-3 flex items-center gap-3">
              <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
              <span className="text-sm text-emerald-700">Fetching live research from platforms...</span>
            </div>
          )}
          
          {/* Messages Area */}
          <ScrollArea className="h-[500px] p-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Bot className="h-16 w-16 mb-4 text-violet-300" />
                <h3 className="text-lg font-semibold text-slate-700">AI Research Assistant with Content Posting</h3>
                <p className="text-sm max-w-md mt-2">
                  Ask questions, generate reports, or <strong>post content directly to user accounts</strong>. 
                  Try: "Post a market newsletter to all investor users" or "Send an alert about today's earnings."
                </p>
                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                  <Badge variant="secondary" className="text-xs">18 Research Platforms</Badge>
                  <Badge variant="secondary" className="text-xs">Content Posting</Badge>
                  <Badge variant="secondary" className="text-xs">AI Synthesis</Badge>
                  <Badge variant="secondary" className="text-xs">PDF Export</Badge>
                  <Badge variant="secondary" className="text-xs">User Targeting</Badge>
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
                placeholder="Ask about markets, generate reports, or post content to users (e.g. 'Post a newsletter about tech stocks to all investor users')..."
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
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span>Market Analysis</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              <span>Sector Research</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Upload className="h-4 w-4 text-amber-600" />
              <span>Content Posting</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Bell className="h-4 w-4 text-red-600" />
              <span>Alert Broadcasting</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <FileText className="h-4 w-4 text-violet-600" />
              <span>PDF Reports</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Video className="h-4 w-4 text-indigo-600" />
              <span>Meeting Notes</span>
            </div>
          </div>
        </CardContent>
      </Card>
        </>
      )}
    </div>
  );
};
