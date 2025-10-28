import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send, Paperclip, Smile } from "lucide-react";
import { toast } from "sonner";

const TeamChat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const member = location.state?.member;

  if (!member) {
    navigate("/team");
    return null;
  }

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "user",
      content: "Hi! Can we discuss the project timeline?",
      timestamp: "10:30 AM",
    },
    {
      id: 2,
      sender: "member",
      content: "Of course! I have some time this afternoon. What specific aspects would you like to cover?",
      timestamp: "10:32 AM",
    },
    {
      id: 3,
      sender: "user",
      content: "I wanted to review the milestones for Q1 and make sure we're aligned.",
      timestamp: "10:35 AM",
    },
  ]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleSendMessage = () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    const newMessage = {
      id: messages.length + 1,
      sender: "user",
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, newMessage]);
    setMessage("");
    toast.success("Message sent");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex-1 p-6">
      <Card className="h-[calc(100vh-120px)]">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/team")}
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
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/team/profile", { state: { member } })}>
              View Profile
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0 flex flex-col h-[calc(100%-80px)]">
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
                      <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="border-t p-4">
            <div className="flex gap-2">
              <Button variant="ghost" size="icon">
                <Paperclip className="h-5 w-5" />
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
              <Button onClick={handleSendMessage}>
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

export default TeamChat;
