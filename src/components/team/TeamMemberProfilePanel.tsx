import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

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

  useEffect(() => {
    if (member && open) {
      fetchWorkloadItems();
      fetchAuditLogs();
    }
  }, [member, open]);

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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="workload">Workload</TabsTrigger>
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