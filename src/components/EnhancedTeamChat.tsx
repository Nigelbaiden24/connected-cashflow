import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send, Paperclip, Smile, Mic, Image as ImageIcon, FileText, Check, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  sender: "user" | "member";
  content: string;
  timestamp: string;
  read?: boolean;
  type?: "text" | "image" | "file";
  fileUrl?: string;
  fileName?: string;
}

const EnhancedTeamChat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const member = location.state?.member;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "user",
      content: "Hi! Can we discuss the project timeline?",
      timestamp: "10:30 AM",
      read: true,
      type: "text",
    },
    {
      id: "2",
      sender: "member",
      content: "Of course! I have some time this afternoon. What specific aspects would you like to cover?",
      timestamp: "10:32 AM",
      read: true,
      type: "text",
    },
    {
      id: "3",
      sender: "user",
      content: "I wanted to review the milestones for Q1 and make sure we're aligned.",
      timestamp: "10:35 AM",
      read: true,
      type: "text",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!member) {
      navigate("/messages");
      return;
    }

    // Simulate real-time updates
    const channel = supabase
      .channel(`chat_${member.id}`)
      .on('presence', { event: 'sync' }, () => {
        // Handle presence sync
      })
      .subscribe();

    // Simulate typing indicator
    const typingTimeout = setTimeout(() => {
      if (Math.random() > 0.7) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearTimeout(typingTimeout);
    };
  }, [member, navigate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      type: "text",
    };

    setMessages([...messages, newMessage]);
    setMessage("");

    // Mark message as sent
    setTimeout(() => {
      setMessages(prev => 
        prev.map(m => m.id === newMessage.id ? { ...m, read: false } : m)
      );
    }, 500);

    // Simulate read receipt after 2 seconds
    setTimeout(() => {
      setMessages(prev => 
        prev.map(m => m.id === newMessage.id ? { ...m, read: true } : m)
      );
    }, 2000);

    // Simulate member typing
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const replyMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender: "member",
          content: "That sounds great! Let me check my calendar and get back to you.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false,
          type: "text",
        };
        setMessages(prev => [...prev, replyMessage]);
      }, 2000);
    }, 1000);

    toast.success("Message sent");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = () => {
    toast.info("File upload feature coming soon!");
  };

  const handleImageUpload = () => {
    toast.info("Image upload feature coming soon!");
  };

  const handleVoiceMessage = () => {
    toast.info("Voice message feature coming soon!");
  };

  if (!member) {
    return null;
  }

  return (
    <div className="flex-1 p-6">
      <Card className="h-[calc(100vh-120px)] flex flex-col">
        <CardHeader className="border-b shrink-0">
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
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {member.role} • {isTyping ? 'typing...' : 'Active now'}
                  </p>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/team/profile", { state: { member } })}>
              View Profile
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0 flex flex-col flex-1 min-h-0">
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex gap-3 max-w-[70%] ${msg.sender === "user" ? "flex-row-reverse" : ""}`}>
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className={msg.sender === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"}>
                        {msg.sender === "user" ? "ME" : getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`space-y-1 ${msg.sender === "user" ? "items-end" : "items-start"} flex flex-col`}>
                      <div
                        className={`rounded-lg px-4 py-2 ${
                          msg.sender === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                        {msg.sender === "user" && (
                          <span className="text-xs text-muted-foreground">
                            {msg.read ? <CheckCheck className="h-3 w-3 text-blue-500" /> : <Check className="h-3 w-3" />}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[70%]">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-secondary">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg px-4 py-2 bg-muted">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="border-t p-4 shrink-0">
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={handleFileUpload}>
                <Paperclip className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleImageUpload}>
                <ImageIcon className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleVoiceMessage}>
                <Mic className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Smile className="h-5 w-5" />
              </Button>
              <Input
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={!message.trim()}>
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedTeamChat;
