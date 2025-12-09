import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Send, Bot, User, TrendingUp, Shield, FileText, Search, Download, Plus, History, Video, Loader2, ArrowLeft, FileDown, FileSpreadsheet, Presentation, FileType, UserPlus, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { DocumentUpload } from "@/components/DocumentUpload";
import { MeetingIntegration } from "@/components/MeetingIntegration";
import { MeetingBooker } from "@/components/MeetingBooker";
import { FileManager } from "@/components/FileManager";
import { generateFinancialReport } from "@/utils/pdfGenerator";
import { useStreamingChat } from "@/hooks/useStreamingChat";
import { useBusinessChat } from "@/hooks/useBusinessChat";
import { useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { 
  exportDocument, 
  parseDocumentFromResponse, 
  detectDocumentIntent,
  DocumentContent 
} from "@/utils/documentGenerator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  isDocumentResponse?: boolean;
  documentTitle?: string;
  crmAction?: CRMContactAction;
}

interface CRMContactAction {
  type: 'add_contact';
  contact: {
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    position?: string;
    status?: string;
    priority?: string;
    notes?: string;
    tags?: string[];
  };
  saved?: boolean;
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
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      if (currentUser) {
        // Load conversations with the fetched user
        await loadConversationsForUser(currentUser.id);
        // Auto-create conversation for logged-in users
        if (!currentConversationId) {
          const newConvId = await startNewConversationForUser(currentUser.id);
          if (newConvId) {
            setCurrentConversationId(newConvId);
          }
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

  const loadConversationsForUser = async (userId: string) => {
    const { data, error } = await supabase
      .from('conversations')
      .select('id, title, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error loading conversations:', error);
    } else if (data) {
      setConversations(data);
    }
  };

  const loadConversations = async () => {
    if (!user) return;
    await loadConversationsForUser(user.id);
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

  const startNewConversationForUser = async (userId: string) => {
    const { data, error } = await supabase
      .from('conversations')
      .insert({ user_id: userId, title: 'New Conversation' })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    } else if (data) {
      setMessages([{
        id: "1",
        type: "assistant",
        content: `Hello! I'm ${botName}, your AI assistant. I can help you with ${isBusinessPlatform ? 'business planning, operations, analytics, and strategy' : 'market data, client information, compliance checks, and more'}. How can I assist you today?`,
        timestamp: new Date(),
        category: "general",
      }]);
      await loadConversationsForUser(userId);
      return data.id;
    }
    return null;
  };

  const startNewConversation = async () => {
    if (!user) {
      return null; // Silently allow guest usage
    }

    const newConvId = await startNewConversationForUser(user.id);
    if (newConvId) {
      setCurrentConversationId(newConvId);
    }
    return newConvId;
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
    {
      label: "Add Contact",
      icon: UserPlus,
      query: "Add a new contact to CRM: ",
      category: "client" as const,
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
    {
      label: "Add Contact",
      icon: UserPlus,
      query: "Add a new contact to CRM: ",
      category: "client" as const,
    },
  ];

  const quickActions = isBusinessPlatform ? businessQuickActions : financeQuickActions;

  // Detect CRM intent from user message
  const detectCRMIntent = (message: string): boolean => {
    const crmKeywords = [
      'add contact', 'add a contact', 'create contact', 'new contact',
      'add lead', 'create lead', 'new lead',
      'add client', 'new client', 'create client',
      'save contact', 'add to crm', 'add them to crm',
      'add this person', 'save this contact', 'add to contacts'
    ];
    const lower = message.toLowerCase();
    return crmKeywords.some(keyword => lower.includes(keyword));
  };

  // Parse CRM contact data from AI response
  const parseCRMContactFromResponse = (content: string): CRMContactAction['contact'] | null => {
    try {
      // Look for JSON block in response
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed.name) return parsed;
      }

      // Look for structured contact data markers
      const contactMarker = content.match(/\[CRM_CONTACT\]([\s\S]*?)\[\/CRM_CONTACT\]/);
      if (contactMarker) {
        const parsed = JSON.parse(contactMarker[1]);
        if (parsed.name) return parsed;
      }

      // Try to extract from markdown-style structured data
      const nameMatch = content.match(/\*\*Name\*\*[:\s]*([^\n*]+)/i) || content.match(/Name[:\s]*([^\n]+)/i);
      if (nameMatch) {
        const contact: CRMContactAction['contact'] = {
          name: nameMatch[1].trim()
        };
        
        const emailMatch = content.match(/\*\*Email\*\*[:\s]*([^\n*]+)/i) || content.match(/Email[:\s]*([^\n]+)/i);
        if (emailMatch) contact.email = emailMatch[1].trim();
        
        const phoneMatch = content.match(/\*\*Phone\*\*[:\s]*([^\n*]+)/i) || content.match(/Phone[:\s]*([^\n]+)/i);
        if (phoneMatch) contact.phone = phoneMatch[1].trim();
        
        const companyMatch = content.match(/\*\*Company\*\*[:\s]*([^\n*]+)/i) || content.match(/Company[:\s]*([^\n]+)/i);
        if (companyMatch) contact.company = companyMatch[1].trim();
        
        const positionMatch = content.match(/\*\*Position\*\*[:\s]*([^\n*]+)/i) || content.match(/Position[:\s]*([^\n]+)/i) || content.match(/\*\*Title\*\*[:\s]*([^\n*]+)/i);
        if (positionMatch) contact.position = positionMatch[1].trim();
        
        const statusMatch = content.match(/\*\*Status\*\*[:\s]*([^\n*]+)/i) || content.match(/Status[:\s]*([^\n]+)/i);
        if (statusMatch) contact.status = statusMatch[1].trim().toLowerCase();
        
        const priorityMatch = content.match(/\*\*Priority\*\*[:\s]*([^\n*]+)/i) || content.match(/Priority[:\s]*([^\n]+)/i);
        if (priorityMatch) contact.priority = priorityMatch[1].trim().toLowerCase();
        
        const notesMatch = content.match(/\*\*Notes\*\*[:\s]*([^\n*]+)/i) || content.match(/Notes[:\s]*([^\n]+)/i);
        if (notesMatch) contact.notes = notesMatch[1].trim();

        return contact;
      }

      return null;
    } catch (e) {
      console.error('Error parsing CRM contact:', e);
      return null;
    }
  };

  // Save contact to CRM
  const saveCRMContact = async (contact: CRMContactAction['contact']): Promise<boolean> => {
    try {
      const { error } = await supabase.from('crm_contacts').insert({
        name: contact.name,
        email: contact.email || null,
        phone: contact.phone || null,
        company: contact.company || null,
        position: contact.position || null,
        status: contact.status || 'lead',
        priority: contact.priority || 'medium',
        notes: contact.notes || null,
        tags: contact.tags || [],
        user_id: user?.id || null,
      });

      if (error) {
        console.error('Error saving CRM contact:', error);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Error saving CRM contact:', e);
      return false;
    }
  };

  // Handle document download from AI response
  const handleDocumentDownload = (messageContent: string, format: string) => {
    const doc = parseDocumentFromResponse(messageContent);
    if (doc) {
      exportDocument(doc, format);
      toast({
        title: "Document Downloaded",
        description: `Your ${format.toUpperCase()} file has been generated and downloaded.`,
      });
    } else {
      toast({
        title: "Export Error",
        description: "Could not parse document content. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle saving CRM contact from message
  const handleSaveCRMContact = async (messageId: string, contact: CRMContactAction['contact']) => {
    const success = await saveCRMContact(contact);
    if (success) {
      setMessages(prev => prev.map(m => 
        m.id === messageId 
          ? { ...m, crmAction: { ...m.crmAction!, saved: true } }
          : m
      ));
      toast({
        title: "Contact Added!",
        description: `${contact.name} has been added to your CRM.`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to save contact. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // Detect if user wants a document
    const documentIntent = detectDocumentIntent(input);
    // Detect if user wants to add a CRM contact
    const crmIntent = detectCRMIntent(input);

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
            // Check if this is a document response
            const parsedDoc = parseDocumentFromResponse(streamedContent);
            const isDocResponse = documentIntent.wantsDocument && streamedContent.length > 200;
            
            // Check for CRM contact data
            let crmAction: CRMContactAction | undefined;
            if (crmIntent) {
              const contactData = parseCRMContactFromResponse(streamedContent);
              if (contactData) {
                crmAction = {
                  type: 'add_contact',
                  contact: contactData,
                  saved: false,
                };
              }
            }
            
            const finalMessage: Message = {
              id: tempId,
              type: "assistant",
              content: streamedContent || "I apologize, but I couldn't generate a response. Please try again.",
              timestamp: new Date(),
              category: categorizeMessage(streamedContent),
              isDocumentResponse: isDocResponse,
              documentTitle: parsedDoc?.title || documentIntent.documentType || 'Document',
              crmAction,
            };

            // Update message with document flag and CRM action
            setMessages(prev => 
              prev.map(m => m.id === tempId ? finalMessage : m)
            );

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
              description: crmAction ? "Contact ready to add to CRM!" : (isDocResponse ? "Document ready for download!" : "AI analysis finished"),
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

        const responseContent = data.choices?.[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";
        const parsedDoc = parseDocumentFromResponse(responseContent);
        const isDocResponse = documentIntent.wantsDocument && responseContent.length > 200;

        // Check for CRM contact data in non-streaming response
        let crmAction: CRMContactAction | undefined;
        if (crmIntent) {
          const contactData = parseCRMContactFromResponse(responseContent);
          if (contactData) {
            crmAction = {
              type: 'add_contact',
              contact: contactData,
              saved: false,
            };
          }
        }

        const aiResponse: Message = {
          id: Date.now().toString(),
          type: "assistant",
          content: responseContent,
          timestamp: new Date(),
          category: categorizeMessage(responseContent),
          isDocumentResponse: isDocResponse,
          documentTitle: parsedDoc?.title || documentIntent.documentType || 'Document',
          crmAction,
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
          description: crmAction ? "Contact ready to add to CRM!" : (isDocResponse ? "Document ready for download!" : "AI analysis complete"),
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
    <div className="flex h-full flex-col relative ai-chat-gradient dark:ai-chat-gradient-dark min-h-screen">
      {/* Floating Particles Background */}
      <div className="ai-floating-particles" />
      
      {/* Header */}
      <div className="ai-header-gradient backdrop-blur-xl p-4 sticky top-0 z-20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-2 hover:bg-primary/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              {/* AI Avatar Orb */}
              <div className="ai-orb h-12 w-12 rounded-full flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                  {botName} - FlowPulse Elite AI
                </h1>
                <p className="text-sm text-muted-foreground">
                  Enterprise-grade document intelligence & reporting
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <FileManager />
            <MeetingBooker />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="ai-glass-card border-primary/20 hover:border-primary/50 hover:bg-primary/5">
                  <History className="h-4 w-4 mr-2" />
                  History
                </Button>
              </SheetTrigger>
              <SheetContent className="ai-glass-card">
                <SheetHeader>
                  <SheetTitle className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                    Conversation History
                  </SheetTitle>
                  <SheetDescription>
                    View and load your previous conversations
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-2">
                  <Button
                    onClick={startNewConversation}
                    className="w-full justify-start bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
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
                            className={`w-full justify-start text-left transition-all ${
                              currentConversationId === conv.id 
                                ? 'bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/30' 
                                : 'hover:bg-primary/5'
                            }`}
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
            <div className="flex items-center gap-2 ai-glass-card px-3 py-1 rounded-lg">
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
              className="w-32 ai-glass-card border-primary/20 focus:border-primary/50"
            />
            <Button variant="outline" size="sm" onClick={handleGenerateReport} className="ai-glass-card border-primary/20 hover:border-primary/50 hover:bg-primary/5">
              <Download className="h-4 w-4 mr-2" />
              Generate PDF Report
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowMeetingIntegration(!showMeetingIntegration)}
              className="ai-glass-card border-primary/20 hover:border-primary/50 hover:bg-primary/5"
            >
              <Video className="h-4 w-4 mr-2" />
              {showMeetingIntegration ? "Hide Meetings" : "Join Meeting"}
            </Button>
          </div>
        </div>
      </div>

      {/* Meeting Integration Panel */}
      {showMeetingIntegration && (
        <div className="border-b border-border/30 p-4 ai-glass-card">
          <MeetingIntegration onMeetingJoined={handleMeetingJoined} />
        </div>
      )}

      {/* Quick Actions */}
      <div className="p-4 border-b border-border/30">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {quickActions.map((action) => (
            <button
              key={action.label}
              className="ai-quick-action flex items-center gap-2 whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-medium"
              onClick={() => handleQuickAction(action.query)}
            >
              <action.icon className="h-4 w-4 text-primary" />
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-40">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-4 animate-fade-in ${
              message.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.type === "assistant" && (
              <div className="ai-orb flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-full shadow-lg">
                <Bot className="h-5 w-5 text-white" />
              </div>
            )}
            
            <div
              className={`rounded-2xl px-4 py-3 max-w-[75%] shadow-lg transition-all ${
                message.type === "user"
                  ? "ai-message-user-gradient text-white ml-auto"
                  : "ai-message-gradient ai-glass-card"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {message.type === "assistant" && message.category && (
                  <Badge
                    variant="secondary"
                    className={`text-xs h-5 ${getCategoryColor(message.category)} rounded-full`}
                  >
                    {getCategoryIcon(message.category)}
                    <span className="ml-1 capitalize">{message.category}</span>
                  </Badge>
                )}
                <span className={`text-xs ${message.type === "user" ? "text-white/70" : "text-muted-foreground"}`}>
                  {message.timestamp.toLocaleTimeString()}
                </span>
                {message.type === "assistant" && message.content.length > 50 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs hover:bg-primary/10 rounded-full">
                        <Download className="h-3 w-3 mr-1" />
                        Export
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="ai-glass-card border-primary/20">
                      <DropdownMenuItem onClick={() => handleDocumentDownload(message.content, 'pdf')} className="hover:bg-primary/10">
                        <FileDown className="h-3 w-3 mr-2 text-red-500" /> PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDocumentDownload(message.content, 'docx')} className="hover:bg-primary/10">
                        <FileType className="h-3 w-3 mr-2 text-blue-500" /> Word
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDocumentDownload(message.content, 'xlsx')} className="hover:bg-primary/10">
                        <FileSpreadsheet className="h-3 w-3 mr-2 text-green-500" /> Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDocumentDownload(message.content, 'pptx')} className="hover:bg-primary/10">
                        <Presentation className="h-3 w-3 mr-2 text-orange-500" /> PowerPoint
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDocumentDownload(message.content, 'md')} className="hover:bg-primary/10">
                        <FileText className="h-3 w-3 mr-2 text-purple-500" /> Markdown
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDocumentDownload(message.content, 'txt')} className="hover:bg-primary/10">
                        <FileText className="h-3 w-3 mr-2 text-gray-500" /> Text
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              <div className="text-sm">
                {message.type === "assistant" ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h2: ({node, ...props}) => <h2 className="text-base font-bold mt-3 mb-2 text-foreground bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-sm font-semibold mt-2 mb-1 text-foreground" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-1 my-2 text-foreground" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal list-inside space-y-1 my-2 text-foreground" {...props} />,
                        p: ({node, ...props}) => <p className="my-1 text-foreground leading-relaxed" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-semibold text-primary" {...props} />,
                        table: ({node, ...props}) => <div className="overflow-x-auto my-2"><table className="border-collapse border border-primary/20 w-full rounded-lg overflow-hidden" {...props} /></div>,
                        th: ({node, ...props}) => <th className="border border-primary/20 p-2 bg-gradient-to-r from-primary/10 to-purple-500/10 font-semibold text-left text-foreground" {...props} />,
                        td: ({node, ...props}) => <td className="border border-primary/20 p-2 text-foreground" {...props} />,
                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gradient-to-b from-primary to-purple-500 pl-3 italic my-2 text-muted-foreground bg-primary/5 py-2 rounded-r-lg" {...props} />,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                    
                    {/* Document Download Buttons */}
                    {message.isDocumentResponse && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl border border-primary/20">
                        <p className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          Download "{message.documentTitle}" as:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDocumentDownload(message.content, 'pdf')}
                            className="h-8 text-xs rounded-lg bg-gradient-to-r from-red-500/10 to-red-600/10 border-red-500/30 hover:border-red-500/50 hover:bg-red-500/20"
                          >
                            <FileDown className="h-3 w-3 mr-1 text-red-500" />
                            PDF
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDocumentDownload(message.content, 'docx')}
                            className="h-8 text-xs rounded-lg bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-500/30 hover:border-blue-500/50 hover:bg-blue-500/20"
                          >
                            <FileType className="h-3 w-3 mr-1 text-blue-500" />
                            Word
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDocumentDownload(message.content, 'xlsx')}
                            className="h-8 text-xs rounded-lg bg-gradient-to-r from-green-500/10 to-green-600/10 border-green-500/30 hover:border-green-500/50 hover:bg-green-500/20"
                          >
                            <FileSpreadsheet className="h-3 w-3 mr-1 text-green-500" />
                            Excel
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDocumentDownload(message.content, 'pptx')}
                            className="h-8 text-xs rounded-lg bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-orange-500/30 hover:border-orange-500/50 hover:bg-orange-500/20"
                          >
                            <Presentation className="h-3 w-3 mr-1 text-orange-500" />
                            PowerPoint
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDocumentDownload(message.content, 'md')}
                            className="h-8 text-xs rounded-lg bg-gradient-to-r from-purple-500/10 to-purple-600/10 border-purple-500/30 hover:border-purple-500/50 hover:bg-purple-500/20"
                          >
                            <FileText className="h-3 w-3 mr-1 text-purple-500" />
                            Markdown
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDocumentDownload(message.content, 'txt')}
                            className="h-8 text-xs rounded-lg bg-gradient-to-r from-gray-500/10 to-gray-600/10 border-gray-500/30 hover:border-gray-500/50 hover:bg-gray-500/20"
                          >
                            <FileText className="h-3 w-3 mr-1 text-gray-500" />
                            Text
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* CRM Contact Card */}
                    {message.crmAction && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-500/30">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-semibold text-foreground flex items-center gap-2">
                            <UserPlus className="h-4 w-4 text-emerald-500" />
                            Contact Ready to Add
                          </p>
                          {message.crmAction.saved ? (
                            <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30">
                              <Check className="h-3 w-3 mr-1" />
                              Added to CRM
                            </Badge>
                          ) : null}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                          <div>
                            <span className="text-muted-foreground">Name:</span>
                            <span className="ml-2 font-medium text-foreground">{message.crmAction.contact.name}</span>
                          </div>
                          {message.crmAction.contact.email && (
                            <div>
                              <span className="text-muted-foreground">Email:</span>
                              <span className="ml-2 font-medium text-foreground">{message.crmAction.contact.email}</span>
                            </div>
                          )}
                          {message.crmAction.contact.phone && (
                            <div>
                              <span className="text-muted-foreground">Phone:</span>
                              <span className="ml-2 font-medium text-foreground">{message.crmAction.contact.phone}</span>
                            </div>
                          )}
                          {message.crmAction.contact.company && (
                            <div>
                              <span className="text-muted-foreground">Company:</span>
                              <span className="ml-2 font-medium text-foreground">{message.crmAction.contact.company}</span>
                            </div>
                          )}
                          {message.crmAction.contact.position && (
                            <div>
                              <span className="text-muted-foreground">Position:</span>
                              <span className="ml-2 font-medium text-foreground">{message.crmAction.contact.position}</span>
                            </div>
                          )}
                          {message.crmAction.contact.status && (
                            <div>
                              <span className="text-muted-foreground">Status:</span>
                              <span className="ml-2 font-medium text-foreground capitalize">{message.crmAction.contact.status}</span>
                            </div>
                          )}
                        </div>
                        {!message.crmAction.saved && (
                          <Button
                            size="sm"
                            onClick={() => handleSaveCRMContact(message.id, message.crmAction!.contact)}
                            className="w-full h-9 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add to CRM
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                )}
              </div>
            </div>

            {message.type === "user" && (
              <div className="flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-full bg-gradient-to-r from-primary to-purple-500 shadow-lg">
                <User className="h-5 w-5 text-white" />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-4 justify-start animate-fade-in">
            <div className="ai-orb flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-full">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div className="ai-message-gradient ai-glass-card rounded-2xl px-4 py-3">
              <div className="ai-typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input - Fixed at bottom with glass effect */}
      <div className="fixed bottom-0 left-0 right-0 p-4 z-20 md:left-64">
        <div className="ai-glass-card rounded-2xl p-4 shadow-2xl border border-primary/20 ai-glow-border">
          <div className="flex gap-3 mb-3 relative z-10">
            <VoiceRecorder onTranscription={handleVoiceTranscription} />
            <DocumentUpload onTextExtracted={handleDocumentText} />
            <div className="flex-1 ai-input-glow rounded-xl overflow-hidden">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Generate reports, analyze documents, create business plans..."
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 border-0 bg-background/50 focus:bg-background transition-all h-11 text-base rounded-xl"
              />
            </div>
            <Button 
              onClick={handleSend} 
              disabled={isLoading || !input.trim()}
              className="h-11 px-6 rounded-xl bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 shadow-lg hover:shadow-primary/25 transition-all"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center relative z-10">
            <span className="bg-gradient-to-r from-primary via-purple-500 to-cyan-500 bg-clip-text text-transparent font-medium">{botName}</span>
            {" "}• Enterprise-grade AI for reports, documents, analysis & insights
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;