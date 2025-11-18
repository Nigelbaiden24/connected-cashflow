import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, MessageSquare, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  status: "online" | "offline" | "away";
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

const Messages = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const teamMembers: TeamMember[] = [
    {
      id: "1",
      name: "Sarah Johnson",
      role: "Senior Financial Advisor",
      email: "sarah.johnson@flowpulse.io",
      status: "online",
      lastMessage: "Thanks for the update on the portfolio analysis.",
      lastMessageTime: "10:32 AM",
      unreadCount: 2,
    },
    {
      id: "2",
      name: "Michael Chen",
      role: "Portfolio Manager",
      email: "michael.chen@flowpulse.io",
      status: "online",
      lastMessage: "Can we schedule a meeting for tomorrow?",
      lastMessageTime: "Yesterday",
      unreadCount: 0,
    },
    {
      id: "3",
      name: "Emily Rodriguez",
      role: "Compliance Officer",
      email: "emily.rodriguez@flowpulse.io",
      status: "away",
      lastMessage: "I've reviewed the compliance documents.",
      lastMessageTime: "2 days ago",
      unreadCount: 0,
    },
    {
      id: "4",
      name: "David Thompson",
      role: "Investment Analyst",
      email: "david.thompson@flowpulse.io",
      status: "offline",
      lastMessage: "The market analysis report is ready.",
      lastMessageTime: "3 days ago",
      unreadCount: 1,
    },
    {
      id: "5",
      name: "Jessica Martinez",
      role: "Client Relations Manager",
      email: "jessica.martinez@flowpulse.io",
      status: "online",
      lastMessage: "Client feedback has been very positive!",
      lastMessageTime: "Last week",
      unreadCount: 0,
    },
  ];

  const filteredMembers = teamMembers.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-success";
      case "away":
        return "bg-warning";
      case "offline":
        return "bg-muted-foreground";
      default:
        return "bg-muted-foreground";
    }
  };

  const handleOpenChat = (member: TeamMember) => {
    navigate("/team/chat", { state: { member } });
  };

  return (
    <div className="flex-1 space-y-6 p-6 ml-64">
      <div className="mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground">
            Chat with your team members
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/team")}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Team Management
          </button>
          <Badge variant="secondary" className="text-sm">
            {teamMembers.filter(m => m.unreadCount && m.unreadCount > 0).length} Unread
          </Badge>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search team members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-2">
        {filteredMembers.map((member) => (
          <Card
            key={member.id}
            className="cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => handleOpenChat(member)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${getStatusColor(
                      member.status
                    )}`}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-sm truncate">{member.name}</h3>
                    {member.lastMessageTime && (
                      <span className="text-xs text-muted-foreground ml-2">
                        {member.lastMessageTime}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{member.role}</p>
                  {member.lastMessage && (
                    <p className="text-sm text-muted-foreground truncate">
                      {member.lastMessage}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {member.unreadCount && member.unreadCount > 0 && (
                    <Badge variant="default" className="rounded-full h-6 w-6 p-0 flex items-center justify-center">
                      {member.unreadCount}
                    </Badge>
                  )}
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No team members found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
