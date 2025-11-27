import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Send, Bot, User, TrendingUp, Shield, FileText, Search, Download, Plus, History, Video, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { DocumentUpload } from "@/components/DocumentUpload";
import { MeetingIntegration } from "@/components/MeetingIntegration";
import { TextToSpeech } from "@/components/TextToSpeech";
import { MeetingBooker } from "@/components/MeetingBooker";
import { FileManager } from "@/components/FileManager";
import { generateFinancialReport } from "@/utils/pdfGenerator";
import { useStreamingChat } from "@/hooks/useStreamingChat";
import { useBusinessChat } from "@/hooks/useBusinessChat";
import { useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  category?: "market" | "client" | "compliance" | "general";
}

const Chat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isBusinessPlatform = location.pathname.includes('/business/');
  
  const defaultBotName = isBusinessPlatform ? 'Atlas' : 'Theodore';
  const defaultMessage = isBusinessPlatform 
    ? "Hello! I'm Atlas, your AI business strategist. I can help you with business planning, operations, analytics, strategy, and more. How can I drive your business forward today?"
    : "Hello! I'm Theodore, your AI financial advisor assistant. I can help you with market data, client information, compliance checks, and more. How can I assist you today?";
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content: defaultMessage,
      timestamp: new Date(),
      category: "general",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [useStreaming, setUseStreaming] = useState(() => {
    return localStorage.getItem('useStreaming') === 'true';
  });
  const [botName, setBotName] = useState(() => {
    return localStorage.getItem('botName') || defaultBotName;
  });
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Array<{ id: string; title: string; updated_at: string }>>([]);
  const [user, setUser] = useState<any>(null);
  const [showMeetingIntegration, setShowMeetingIntegration] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { streamChat: streamFinanceChat, isStreaming: isFinanceStreaming } = useStreamingChat();
  const { streamChat: streamBusinessChat, isStreaming: isBusinessStreaming } = useBusinessChat();
  
  const streamChat = isBusinessPlatform ? streamBusinessChat : streamFinanceChat;
  const isStreaming = isBusinessPlatform ? isBusinessStreaming : isFinanceStreaming;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        loadConversations();
        // Auto-create conversation for logged-in users
        if (!currentConversationId) {
          await startNewConversation();
        }
      }
    };
    checkUser();
  }, []);

  useEffect(() => {
    localStorage.setItem('botName', botName);
  }, [botName]);

  useEffect(() => {
    localStorage.setItem('useStreaming', String(useStreaming));
  }, [useStreaming]);

  const loadConversations = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('conversations')
      .select('id, title, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error loading conversations:', error);
    } else if (data) {
      setConversations(data);
    }
  };

  const loadConversation = async (conversationId: string) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "Failed to load conversation",
        variant: "destructive",
      });
      return;
    }

    if (data) {
      const loadedMessages: Message[] = data.map(msg => ({
        id: msg.id,
        type: msg.type as "user" | "assistant",
        content: msg.content,
        timestamp: new Date(msg.created_at),
        category: msg.category as "market" | "client" | "compliance" | "general" | undefined,
      }));
      setMessages(loadedMessages);
      setCurrentConversationId(conversationId);
    }
  };

  const startNewConversation = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save conversations",
        variant: "destructive",
      });
      return null;
    }

    const { data, error } = await supabase
      .from('conversations')
      .insert({ user_id: user.id, title: 'New Conversation' })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    } else if (data) {
      setCurrentConversationId(data.id);
      setMessages([{
        id: "1",
        type: "assistant",
        content: `Hello! I'm ${botName}, your AI financial advisor assistant. I can help you with market data, client information, compliance checks, and more. How can I assist you today?`,
        timestamp: new Date(),
        category: "general",
      }]);
      loadConversations();
      return data.id;
    }
    return null;
  };

  const saveMessage = async (message: Message, conversationId?: string) => {
    const convId = conversationId || currentConversationId;
    
    if (!convId) {
      console.error('No conversation ID available');
      return;
    }

    if (!user) {
      return; // Skip saving if not logged in
    }

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: convId,
        type: message.type,
        content: message.content,
        category: message.category,
      });

    if (error) {
      console.error('Error saving message:', error);
    }
  };

  const financeQuickActions = [
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

  const businessQuickActions = [
    {
      label: "SWOT Analysis",
      icon: Shield,
      query: "Conduct a SWOT analysis for my business",
      category: "general" as const,
    },
    {
      label: "Market Research",
      icon: Search,
      query: "Help me research market trends and competitors in my industry",
      category: "market" as const,
    },
    {
      label: "Business Plan",
      icon: FileText,
      query: "Help me create a business plan for the next quarter",
      category: "general" as const,
    },
    {
      label: "KPI Analysis",
      icon: TrendingUp,
      query: "Analyze my business KPIs and suggest improvements",
      category: "general" as const,
    },
  ];

  const quickActions = isBusinessPlatform ? businessQuickActions : financeQuickActions;

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

    // Ensure conversation exists
    let convId = currentConversationId;
    if (!convId && user) {
      convId = await startNewConversation();
    }

    // Save user message
    if (convId) {
      await saveMessage(userMessage, convId);
    }

    try {
      if (useStreaming) {
        // Streaming mode
        let streamedContent = '';
        const tempId = Date.now().toString();
        
        // Add placeholder message
        const placeholderMessage: Message = {
          id: tempId,
          type: "assistant",
          content: '',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, placeholderMessage]);

        await streamChat({
          messages: [...messages, userMessage].map(m => ({ 
            role: m.type === 'user' ? 'user' : 'assistant', 
            content: m.content 
          })),
          onDelta: (chunk) => {
            streamedContent += chunk;
            setMessages(prev => 
              prev.map(m => m.id === tempId 
                ? { ...m, content: streamedContent, category: categorizeMessage(streamedContent) }
                : m
              )
            );
          },
          onDone: async () => {
            const finalMessage: Message = {
              id: tempId,
              type: "assistant",
              content: streamedContent || "I apologize, but I couldn't generate a response. Please try again.",
              timestamp: new Date(),
              category: categorizeMessage(streamedContent),
            };

            if (convId) {
              await saveMessage(finalMessage, convId);
              
              if (messages.length === 1) {
                const title = currentInput.slice(0, 50) + (currentInput.length > 50 ? '...' : '');
                await supabase.from('conversations').update({ title }).eq('id', convId);
                loadConversations();
              }
            }
            
            setIsLoading(false);
            toast({
              title: "Response complete",
              description: "AI analysis finished",
            });
          },
          onError: (error) => {
            console.error('Streaming error:', error);
            toast({
              title: "Error",
              description: error || "Failed to get AI response. Please try again.",
              variant: "destructive",
            });
            setMessages(prev => prev.filter(m => m.id !== userMessage.id && m.id !== tempId));
            setInput(currentInput);
            setIsLoading(false);
          },
        });
      } else {
        // Non-streaming mode
        const functionName = isBusinessPlatform ? 'business-chat' : 'financial-chat';
        const { data, error } = await supabase.functions.invoke(functionName, {
          body: { 
            messages: [...messages, userMessage].map(m => ({ 
              role: m.type === 'user' ? 'user' : 'assistant', 
              content: m.content 
            })),
            stream: false
          },
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
        
        if (convId) {
          await saveMessage(aiResponse, convId);
          
          if (messages.length === 1) {
            const title = currentInput.slice(0, 50) + (currentInput.length > 50 ? '...' : '');
            await supabase.from('conversations').update({ title }).eq('id', convId);
            loadConversations();
          }
        }
        
        toast({
          title: "Response received",
          description: "AI analysis complete",
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
      
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
      setInput(currentInput);
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
      .map(m => `${m.type === 'user' ? 'User' : botName}: ${m.content}`)
      .join('\n\n');

    generateFinancialReport({
      title: `${botName} - AI Assistant Conversation Report`,
      content: conversationContent,
      generatedBy: `${botName} - FlowPulse AI Assistant`,
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

  const handleMeetingJoined = (platform: string, meetingUrl: string) => {
    const meetingMessage: Message = {
      id: Date.now().toString(),
      type: "assistant",
      content: `Successfully joined ${platform} meeting. Live transcription is now active. All dialogue will be captured and can be analyzed.`,
      timestamp: new Date(),
      category: "general",
    };
    setMessages(prev => [...prev, meetingMessage]);
    if (currentConversationId) {
      saveMessage(meetingMessage);
    }
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
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold">{botName} - FlowPulse AI Assistant</h1>
              <p className="text-sm text-muted-foreground">
                Your intelligent financial advisor with voice, document analysis & reporting
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <FileManager />
            <MeetingBooker />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <History className="h-4 w-4 mr-2" />
                  History
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Conversation History</SheetTitle>
                  <SheetDescription>
                    View and load your previous conversations
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-2">
                  <Button
                    onClick={startNewConversation}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Conversation
                  </Button>
                  <Separator className="my-4" />
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-2 pr-4">
                      {conversations.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          No conversations yet. Start chatting to create your first conversation!
                        </p>
                      ) : (
                        conversations.map((conv) => (
                          <Button
                            key={conv.id}
                            onClick={() => loadConversation(conv.id)}
                            variant={currentConversationId === conv.id ? "secondary" : "ghost"}
                            className="w-full justify-start text-left"
                          >
                            <div className="flex-1 truncate">
                              <div className="font-medium truncate">{conv.title}</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(conv.updated_at).toLocaleDateString()} {new Date(conv.updated_at).toLocaleTimeString()}
                              </div>
                            </div>
                          </Button>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2">
              <Switch
                id="streaming-mode"
                checked={useStreaming}
                onCheckedChange={setUseStreaming}
              />
              <Label htmlFor="streaming-mode" className="text-sm">Stream</Label>
            </div>
            <Input
              placeholder="Bot name"
              value={botName}
              onChange={(e) => setBotName(e.target.value)}
              className="w-32"
            />
            <Button variant="outline" size="sm" onClick={handleGenerateReport}>
              <Download className="h-4 w-4 mr-2" />
              Generate PDF Report
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowMeetingIntegration(!showMeetingIntegration)}
            >
              <Video className="h-4 w-4 mr-2" />
              {showMeetingIntegration ? "Hide Meetings" : "Join Meeting"}
            </Button>
          </div>
        </div>
      </div>

      {/* Meeting Integration Panel */}
      {showMeetingIntegration && (
        <div className="border-b p-4">
          <MeetingIntegration onMeetingJoined={handleMeetingJoined} />
        </div>
      )}

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
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
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
              <div className="text-sm">
                {message.type === "assistant" ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h2: ({node, ...props}) => <h2 className="text-base font-bold mt-3 mb-2 text-foreground" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-sm font-semibold mt-2 mb-1 text-foreground" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-1 my-2 text-foreground" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal list-inside space-y-1 my-2 text-foreground" {...props} />,
                        p: ({node, ...props}) => <p className="my-1 text-foreground leading-relaxed" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-semibold text-foreground" {...props} />,
                        table: ({node, ...props}) => <div className="overflow-x-auto my-2"><table className="border-collapse border border-border w-full" {...props} /></div>,
                        th: ({node, ...props}) => <th className="border border-border p-2 bg-muted font-semibold text-left text-foreground" {...props} />,
                        td: ({node, ...props}) => <td className="border border-border p-2 text-foreground" {...props} />,
                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary pl-3 italic my-2 text-muted-foreground" {...props} />,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                )}
              </div>
              {message.type === "assistant" && (
                <div className="mt-2">
                  <TextToSpeech text={message.content} />
                </div>
              )}
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

      {/* Input - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 border-t p-4 bg-background z-10 md:left-64">
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