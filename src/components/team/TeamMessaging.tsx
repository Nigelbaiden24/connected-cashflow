import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Send, Search, Paperclip, Smile, MoreVertical, Phone, Video, Check, CheckCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  message: string;
  read: boolean;
  read_at: string | null;
  created_at: string;
  sender?: {
    email: string;
    full_name?: string;
  };
}

interface TeamMember {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  status?: string;
}

interface TeamMessagingProps {
  currentUserId: string;
  selectedMember: TeamMember | null;
  onSelectMember: (member: TeamMember) => void;
}

export function TeamMessaging({ currentUserId, selectedMember, onSelectMember }: TeamMessagingProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  useEffect(() => {
    if (selectedMember) {
      fetchMessages(selectedMember.id);
      markMessagesAsRead(selectedMember.id);
      subscribeToMessages();
    }
  }, [selectedMember]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchTeamMembers = async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('user_id, email, full_name, avatar_url')
      .neq('user_id', currentUserId);

    if (error) {
      console.error('Error fetching team members:', error);
      return;
    }

    setTeamMembers(data.map(u => ({ 
      id: u.user_id, 
      email: u.email, 
      full_name: u.full_name || undefined,
      avatar_url: u.avatar_url || undefined,
      status: 'active' 
    })));
  };

  const fetchMessages = async (recipientId: string) => {
    const { data, error } = await supabase
      .from('team_messages')
      .select('*')
      .or(`and(sender_id.eq.${currentUserId},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${currentUserId})`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    // Fetch sender details separately
    if (data) {
      const enrichedMessages = await Promise.all(
        data.map(async (msg) => {
          const { data: senderData } = await supabase
            .from('user_profiles')
            .select('email, full_name')
            .eq('user_id', msg.sender_id)
            .single();
          
          return {
            ...msg,
            sender: senderData || { email: 'Unknown', full_name: undefined }
          };
        })
      );
      setMessages(enrichedMessages);
    }
  };

  const markMessagesAsRead = async (senderId: string) => {
    await supabase
      .from('team_messages')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('recipient_id', currentUserId)
      .eq('sender_id', senderId)
      .eq('read', false);
  };

  const subscribeToMessages = () => {
    const subscription = supabase
      .channel('team_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'team_messages',
        },
        (payload) => {
          const newMsg = payload.new as Message;
          if (
            (newMsg.sender_id === currentUserId && newMsg.recipient_id === selectedMember?.id) ||
            (newMsg.sender_id === selectedMember?.id && newMsg.recipient_id === currentUserId)
          ) {
            setMessages(prev => [...prev, newMsg]);
            if (newMsg.sender_id === selectedMember?.id) {
              markMessagesAsRead(selectedMember.id);
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedMember) return;

    const { error } = await supabase
      .from('team_messages')
      .insert({
        sender_id: currentUserId,
        recipient_id: selectedMember.id,
        message: newMessage.trim(),
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      return;
    }

    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email?.slice(0, 2).toUpperCase() || 'U';
  };

  const filteredMembers = teamMembers.filter(member =>
    member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-12rem)] gap-4">
      {/* Members List */}
      <Card className="w-80 flex flex-col">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Team Messages</CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <ScrollArea className="flex-1">
          <div className="space-y-1 p-4 pt-0">
            {filteredMembers.map((member) => (
              <button
                key={member.id}
                onClick={() => onSelectMember(member)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-accent/50",
                  selectedMember?.id === member.id && "bg-accent"
                )}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                      {getInitials(member.full_name, member.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-background" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-semibold truncate">{member.full_name || member.email}</p>
                  <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col">
        {selectedMember ? (
          <>
            {/* Chat Header */}
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedMember.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                      {getInitials(selectedMember.full_name, selectedMember.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{selectedMember.full_name || selectedMember.email}</h3>
                    <p className="text-xs text-muted-foreground">Active now</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg) => {
                  const isOwn = msg.sender_id === currentUserId;
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex gap-3 animate-in fade-in slide-in-from-bottom-2",
                        isOwn && "flex-row-reverse"
                      )}
                    >
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback className={cn(
                          "text-xs",
                          isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
                        )}>
                          {isOwn ? getInitials(undefined, 'You') : getInitials(selectedMember.full_name, selectedMember.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className={cn("flex flex-col gap-1 max-w-[70%]", isOwn && "items-end")}>
                        <div
                          className={cn(
                            "rounded-2xl px-4 py-2 text-sm",
                            isOwn
                              ? "bg-primary text-primary-foreground rounded-tr-sm"
                              : "bg-muted rounded-tl-sm"
                          )}
                        >
                          {msg.message}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground px-2">
                          <span>{format(new Date(msg.created_at), 'HH:mm')}</span>
                          {isOwn && (
                            msg.read ? (
                              <CheckCheck className="h-3 w-3 text-success" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t p-4">
              {isTyping && (
                <p className="text-xs text-muted-foreground mb-2 animate-pulse">
                  {selectedMember.full_name || selectedMember.email} is typing...
                </p>
              )}
              <div className="flex items-end gap-2">
                <Button variant="ghost" size="icon" className="rounded-full flex-shrink-0">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pr-10 rounded-full"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  size="icon"
                  className="rounded-full flex-shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Send className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Select a team member</h3>
              <p className="text-sm text-muted-foreground">
                Choose someone from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}