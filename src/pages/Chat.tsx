import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Send, Bot, User, TrendingUp, Shield, FileText, Search, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { DocumentUpload } from "@/components/DocumentUpload";
import { generateFinancialReport } from "@/utils/pdfGenerator";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  category?: "market" | "client" | "compliance" | "general";
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content: "Hello! I'm your AI financial advisor assistant. I can help you with market data, client information, compliance checks, and more. How can I assist you today?",
      timestamp: new Date(),
      category: "general",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickActions = [
    {
      label: "Market Update",
      icon: TrendingUp,
      query: "Give me a quick market summary for today",
      category: "market" as const,
    },
    {
      label: "Compliance Check",
      icon: Shield,
      query: "What compliance requirements should I consider for high-risk investments?",
      category: "compliance" as const,
    },
    {
      label: "Client Search",
      icon: Search,
      query: "Help me find clients with conservative risk profiles",
      category: "client" as const,
    },
    {
      label: "Generate Report",
      icon: FileText,
      query: "Create a weekly market analysis report",
      category: "general" as const,
    },
  ];

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('financial-chat', {
        body: { messages: [...messages, userMessage].map(m => ({ role: m.type === 'user' ? 'user' : 'assistant', content: m.content })) },
      });

      if (error) throw error;

      const aiResponse: Message = {
        id: Date.now().toString(),
        type: "assistant",
        content: data.choices?.[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.",
        timestamp: new Date(),
        category: categorizeMessage(data.choices?.[0]?.message?.content || ""),
      };

      setMessages(prev => [...prev, aiResponse]);
      
      toast({
        title: "Response received",
        description: "AI analysis complete",
      });
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
      
      // Remove user message on error
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
      setInput(currentInput);
    } finally {
      setIsLoading(false);
    }
  };

  const categorizeMessage = (content: string): "market" | "client" | "compliance" | "general" => {
    const lower = content.toLowerCase();
    if (lower.includes("market") || lower.includes("stock") || lower.includes("ftse") || lower.includes("price")) return "market";
    if (lower.includes("compliance") || lower.includes("regulation") || lower.includes("fca")) return "compliance";
    if (lower.includes("client") || lower.includes("portfolio")) return "client";
    return "general";
  };

  const handleDocumentText = async (text: string, type: 'ocr' | 'text') => {
    const prompt = type === 'ocr' 
      ? `I've extracted text from a handwritten/scanned document. Please analyze this content and provide insights or create a structured report:\n\n${text}`
      : `I've uploaded typed notes. Please analyze and create a professional summary or brainstorm ideas based on this content:\n\n${text}`;
    
    setInput(prompt);
    toast({
      title: "Document processed",
      description: `Text extracted via ${type === 'ocr' ? 'OCR' : 'file upload'}. Review and send.`,
    });
  };

  const handleVoiceTranscription = (text: string) => {
    setInput(text);
    toast({
      title: "Voice transcribed",
      description: "Your speech has been converted to text",
    });
  };

  const handleGenerateReport = async () => {
    if (messages.length <= 1) {
      toast({
        title: "No content",
        description: "Have a conversation first, then generate a report",
        variant: "destructive",
      });
      return;
    }

    const conversationContent = messages
      .map(m => `${m.type === 'user' ? 'User' : 'FlowPulse AI'}: ${m.content}`)
      .join('\n\n');

    generateFinancialReport({
      title: 'AI Assistant Conversation Report',
      content: conversationContent,
      generatedBy: 'FlowPulse AI Assistant',
      date: new Date(),
    });

    toast({
      title: "Report generated",
      description: "PDF report downloaded successfully",
    });
  };

  const handleQuickAction = (query: string) => {
    setInput(query);
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case "market":
        return <TrendingUp className="h-3 w-3" />;
      case "compliance":
        return <Shield className="h-3 w-3" />;
      case "client":
        return <Search className="h-3 w-3" />;
      default:
        return <Bot className="h-3 w-3" />;
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case "market":
        return "bg-chart-1/10 text-chart-1";
      case "compliance":
        return "bg-warning/10 text-warning-foreground";
      case "client":
        return "bg-chart-2/10 text-chart-2";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">FlowPulse AI Assistant</h1>
            <p className="text-sm text-muted-foreground">
              Your intelligent financial advisor with voice, document analysis & reporting
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleGenerateReport}>
            <Download className="h-4 w-4 mr-2" />
            Generate PDF Report
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-b p-4">
        <div className="flex gap-2 overflow-x-auto">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 whitespace-nowrap"
              onClick={() => handleQuickAction(action.query)}
            >
              <action.icon className="h-4 w-4" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.type === "assistant" && (
              <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Bot className="h-4 w-4" />
              </div>
            )}
            
            <div
              className={`rounded-lg px-3 py-2 max-w-[70%] ${
                message.type === "user"
                  ? "bg-primary text-primary-foreground ml-auto"
                  : "bg-muted"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {message.type === "assistant" && message.category && (
                  <Badge
                    variant="secondary"
                    className={`text-xs h-5 ${getCategoryColor(message.category)}`}
                  >
                    {getCategoryIcon(message.category)}
                    <span className="ml-1 capitalize">{message.category}</span>
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
            </div>

            {message.type === "user" && (
              <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md bg-background border">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-lg px-3 py-2 bg-muted">
              <div className="flex space-x-1">
                <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-pulse"></div>
                <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-pulse delay-100"></div>
                <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-pulse delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2 mb-2">
          <VoiceRecorder onTranscription={handleVoiceTranscription} />
          <DocumentUpload onTextExtracted={handleDocumentText} />
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about markets, clients, compliance, upload documents, or use voice..."
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          💬 Voice recording | 📄 Document upload (OCR) | 📊 Generate PDF reports | Financial analysis powered by FlowPulse.io
        </p>
      </div>
    </div>
  );
};

export default Chat;