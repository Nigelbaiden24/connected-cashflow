import { useState, useEffect, useRef } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Send, Paperclip, Smile, Check, CheckCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface TeamMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department: string;
  role_title: string;
  avatar_url?: string;
  status: string;
  workload_score: number;
  utilization_score: number;
  join_date: string;
  permissions: any;
}

interface TeamMemberProfilePanelProps {
  member: TeamMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh: () => void;
}

export function TeamMemberProfilePanel({ member, open, onOpenChange, onRefresh }: TeamMemberProfilePanelProps) {
  const [workloadItems, setWorkloadItems] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (member && open && currentUserId) {
      fetchWorkloadItems();
      fetchAuditLogs();
      fetchMessages();
      subscribeToMessages();
    }
  }, [member, open, currentUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUserId(user.id);
  };

  const fetchWorkloadItems = async () => {
    if (!member) return;
    const { data } = await supabase
      .from('workload_items')
      .select('*')
      .eq('member_id', member.id)
      .order('created_at', { ascending: false });
    if (data) setWorkloadItems(data);
  };

  const fetchAuditLogs = async () => {
    if (!member) return;
    const { data } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('resource_id', member.id)
      .order('timestamp', { ascending: false })
      .limit(20);
    if (data) setAuditLogs(data);
  };

  const fetchMessages = async () => {
    if (!member || !currentUserId) return;
    
    const { data, error } = await supabase
      .from('team_messages')
      .select('*')
      .or(`and(sender_id.eq.${currentUserId},recipient_id.eq.${member.id}),and(sender_id.eq.${member.id},recipient_id.eq.${currentUserId})`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    if (data) {
      setMessages(data);
      markMessagesAsRead();
    }
  };

  const markMessagesAsRead = async () => {
    if (!member || !currentUserId) return;
    
    await supabase
      .from('team_messages')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('recipient_id', currentUserId)
      .eq('sender_id', member.id)
      .eq('read', false);
  };

  const subscribeToMessages = () => {
    if (!member || !currentUserId) return;

    const subscription = supabase
      .channel('team_messages_profile')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'team_messages',
        },
        (payload) => {
          const newMsg = payload.new as any;
          if (
            (newMsg.sender_id === currentUserId && newMsg.recipient_id === member.id) ||
            (newMsg.sender_id === member.id && newMsg.recipient_id === currentUserId)
          ) {
            setMessages(prev => [...prev, newMsg]);
            if (newMsg.sender_id === member.id) {
              markMessagesAsRead();
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
    if (!newMessage.trim() || !member || !currentUserId) return;

    const { error } = await supabase
      .from('team_messages')
      .insert({
        sender_id: currentUserId,
        recipient_id: member.id,
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

  if (!member) return null;

  const initials = `${member.first_name[0]}${member.last_name[0]}`.toUpperCase();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Team Member Profile</SheetTitle>
          <SheetDescription>View and manage team member details</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Profile Header */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={member.avatar_url} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{member.first_name} {member.last_name}</h2>
              <p className="text-muted-foreground">{member.role_title}</p>
              <div className="flex gap-2 mt-2">
                <Badge>{member.department}</Badge>
                <Badge variant="outline">{member.status}</Badge>
              </div>
            </div>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="workload">Workload</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{member.email}</span>
                  </div>
                  {member.phone && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone</span>
                      <span className="font-medium">{member.phone}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Joined</span>
                    <span className="font-medium">{format(new Date(member.join_date), 'MMMM dd, yyyy')}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Workload Score</span>
                      <span className="font-medium">{member.workload_score}%</span>
                    </div>
                    <Progress value={member.workload_score} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Utilization</span>
                      <span className="font-medium">{member.utilization_score}%</span>
                    </div>
                    <Progress value={member.utilization_score} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Workload Tab */}
            <TabsContent value="workload" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tasks & Assignments</CardTitle>
                  <CardDescription>{workloadItems.length} total tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  {workloadItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No tasks assigned</p>
                  ) : (
                    <div className="space-y-3">
                      {workloadItems.map(item => (
                        <div key={item.id} className="border-l-2 border-primary pl-3 space-y-1">
                          <div className="flex justify-between items-start">
                            <p className="font-medium">{item.title}</p>
                            <Badge variant="outline">{item.status}</Badge>
                          </div>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>Priority: {item.priority}</span>
                            {item.due_date && <span>Due: {format(new Date(item.due_date), 'MMM dd')}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages" className="space-y-4 h-[600px] flex flex-col">
              <Card className="flex-1 flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Direct Messages</CardTitle>
                  <CardDescription>Send instant messages to {member.first_name}</CardDescription>
                </CardHeader>
                <ScrollArea className="flex-1 px-6">
                  <div className="space-y-4 pb-4">
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
                          <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                            <AvatarImage src={isOwn ? undefined : member.avatar_url} />
                            <AvatarFallback className={cn(
                              "text-xs",
                              isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
                            )}>
                              {isOwn ? 'Me' : initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className={cn("flex flex-col gap-1 max-w-[70%]", isOwn && "items-end")}>
                            <div
                              className={cn(
                                "rounded-2xl px-4 py-2 text-sm break-words",
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
                    {messages.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                <div className="border-t p-4">
                  <div className="flex items-end gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full flex-shrink-0">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 relative">
                      <Input
                        placeholder={`Message ${member.first_name}...`}
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
              </Card>
            </TabsContent>

            {/* Permissions Tab */}
            <TabsContent value="permissions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Current Permissions</CardTitle>
                </CardHeader>
                <CardContent>
                  {member.permissions && Object.keys(member.permissions).length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(member.permissions).map(([key, value]) => (
                        <Badge key={key} variant={value ? "default" : "outline"}>
                          {key.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No permissions assigned</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  {auditLogs.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No activity recorded</p>
                  ) : (
                    <div className="space-y-4">
                      {auditLogs.map(log => (
                        <div key={log.id} className="border-l-2 pl-3 space-y-1">
                          <p className="font-medium">{log.action.replace(/_/g, ' ')}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}