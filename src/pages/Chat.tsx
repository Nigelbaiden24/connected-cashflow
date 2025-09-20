import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Send, Bot, User, TrendingUp, Shield, FileText, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

  const simulateAIResponse = (userMessage: string): Message => {
    let response = "";
    let category: "market" | "client" | "compliance" | "general" = "general";

    if (userMessage.toLowerCase().includes("market") || userMessage.toLowerCase().includes("stock") || userMessage.toLowerCase().includes("price")) {
      category = "market";
      response = "📈 **Market Update**: S&P 500 is up 0.8% today at 4,247 points. Key movers include AAPL (+1.2%), MSFT (+0.9%), and GOOGL (+1.1%). Treasury yields are steady at 4.2%. Current market sentiment is cautiously optimistic with strong earnings reports from tech sector.";
    } else if (userMessage.toLowerCase().includes("compliance") || userMessage.toLowerCase().includes("regulation")) {
      category = "compliance";
      response = "🛡️ **Compliance Reminder**: For high-risk investments, ensure: 1) Suitability assessment completed, 2) Risk disclosure signed, 3) Portfolio concentration limits maintained (<10% single position), 4) Documentation of investment rationale. Always verify client's risk tolerance aligns with recommendation.";
    } else if (userMessage.toLowerCase().includes("client") || userMessage.toLowerCase().includes("profile")) {
      category = "client";
      response = "👥 **Client Insights**: Found 47 clients with conservative risk profiles. Average age: 62, median AUM: $850K. Common allocations: 60% bonds, 30% equity, 10% alternatives. Recent trend shows interest in ESG funds. Would you like me to generate a detailed report or schedule follow-ups?";
    } else if (userMessage.toLowerCase().includes("report") || userMessage.toLowerCase().includes("analysis")) {
      category = "general";
      response = "📊 **Report Generated**: Weekly Market Analysis ready. Key highlights: Fed policy unchanged, earnings season 85% complete with avg 8% growth, sector rotation toward value stocks. Energy +3.2%, Tech +1.8%, Healthcare +1.1%. Download PDF available in Reports section.";
    } else {
      response = "I understand you're asking about financial advisory matters. I can help with market data, client analysis, compliance guidance, and report generation. Could you be more specific about what information you need?";
    }

    return {
      id: Date.now().toString(),
      type: "assistant",
      content: response,
      timestamp: new Date(),
      category,
    };
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate API delay
    setTimeout(() => {
      const aiResponse = simulateAIResponse(input);
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
      
      toast({
        title: "Response Generated",
        description: "AI assistant has provided analysis and insights.",
      });
    }, 1500);
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
        <h1 className="text-xl font-semibold">AI Financial Assistant</h1>
        <p className="text-sm text-muted-foreground">
          Get instant insights on markets, clients, and compliance
        </p>
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
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about markets, clients, compliance, or generate reports..."
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Try: "Market update", "Check compliance for options trading", or "Find clients with tech exposure"
        </p>
      </div>
    </div>
  );
};

export default Chat;