import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, Check, X, Save } from "lucide-react";

interface Permission {
  can_access_dashboard: boolean;
  can_access_projects: boolean;
  can_access_tasks: boolean;
  can_access_chat: boolean;
  can_access_calendar: boolean;
  can_access_document_generator: boolean;
  can_access_analytics: boolean;
  can_access_revenue: boolean;
  can_access_crm: boolean;
  can_access_team_management: boolean;
  can_access_payroll: boolean;
  can_access_security: boolean;
  can_access_automation: boolean;
}

interface TeamMember {
  id: string;
  email: string;
  full_name?: string;
}

interface PermissionManagerProps {
  currentUserId: string;
  isAdmin: boolean;
}

const permissionGroups = {
  "Core Workspace": [
    { key: "can_access_dashboard", label: "Dashboard", description: "View main dashboard and KPIs" },
    { key: "can_access_projects", label: "Projects", description: "Manage projects and milestones" },
    { key: "can_access_tasks", label: "Tasks", description: "Create and manage tasks" },
    { key: "can_access_chat", label: "AI Chatbot", description: "Access AI assistant" },
    { key: "can_access_calendar", label: "Calendar", description: "View and manage calendar" },
    { key: "can_access_document_generator", label: "Document Generator", description: "Generate AI documents" },
  ],
  "Business Management": [
    { key: "can_access_analytics", label: "Analytics", description: "View analytics and insights" },
    { key: "can_access_revenue", label: "Revenue Tracking", description: "Track revenue and financial data" },
    { key: "can_access_crm", label: "CRM", description: "Manage customer relationships" },
    { key: "can_access_team_management", label: "Team Management", description: "Manage team members" },
  ],
  "Operations": [
    { key: "can_access_payroll", label: "HR & Payroll", description: "Access payroll and HR features" },
    { key: "can_access_security", label: "Security", description: "Manage security settings" },
    { key: "can_access_automation", label: "Automation Center", description: "Configure automations" },
  ],
};

export function PermissionManager({ currentUserId, isAdmin }: PermissionManagerProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [permissions, setPermissions] = useState<Permission | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isAdmin) {
      fetchTeamMembers();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (selectedMember) {
      fetchPermissions(selectedMember.id);
    }
  }, [selectedMember]);

  const fetchTeamMembers = async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('user_id, email, full_name')
      .neq('user_id', currentUserId);

    if (error) {
      console.error('Error fetching team members:', error);
      return;
    }

    setTeamMembers(data.map(u => ({ 
      id: u.user_id, 
      email: u.email, 
      full_name: u.full_name || undefined 
    })));

    if (data.length > 0) {
      setSelectedMember({ 
        id: data[0].user_id, 
        email: data[0].email, 
        full_name: data[0].full_name || undefined 
      });
    }
  };

  const fetchPermissions = async (userId: string) => {
    const { data, error } = await supabase
      .from('platform_permissions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching permissions:', error);
      return;
    }

    if (data) {
      setPermissions(data);
    } else {
      // Set default permissions if none exist
      setPermissions({
        can_access_dashboard: true,
        can_access_projects: true,
        can_access_tasks: true,
        can_access_chat: true,
        can_access_calendar: true,
        can_access_document_generator: true,
        can_access_analytics: true,
        can_access_revenue: true,
        can_access_crm: true,
        can_access_team_management: false,
        can_access_payroll: false,
        can_access_security: false,
        can_access_automation: false,
      });
    }
    setHasChanges(false);
  };

  const updatePermission = (key: keyof Permission, value: boolean) => {
    if (!permissions) return;
    setPermissions({ ...permissions, [key]: value });
    setHasChanges(true);
  };

  const savePermissions = async () => {
    if (!selectedMember || !permissions) return;

    const { error } = await supabase
      .from('platform_permissions')
      .upsert({
        user_id: selectedMember.id,
        ...permissions,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save permissions",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Permissions updated successfully",
    });
    setHasChanges(false);
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email?.slice(0, 2).toUpperCase() || 'U';
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Admin Access Required</h3>
          <p className="text-sm text-muted-foreground">
            You need admin permissions to manage team member access
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-12rem)]">
      {/* Team Members List */}
      <Card className="w-80">
        <CardHeader>
          <CardTitle className="text-lg">Team Members</CardTitle>
          <CardDescription>Select a member to manage permissions</CardDescription>
        </CardHeader>
        <ScrollArea className="h-[calc(100%-8rem)]">
          <div className="space-y-1 p-4 pt-0">
            {teamMembers.map((member) => (
              <button
                key={member.id}
                onClick={() => setSelectedMember(member)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-accent/50 ${
                  selectedMember?.id === member.id ? 'bg-accent' : ''
                }`}
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                    {getInitials(member.full_name, member.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-semibold truncate">{member.full_name || member.email}</p>
                  <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Permissions Panel */}
      <Card className="flex-1">
        {selectedMember && permissions ? (
          <>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Platform Access Control
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Manage {selectedMember.full_name || selectedMember.email}'s access to platform features
                  </CardDescription>
                </div>
                <Button 
                  onClick={savePermissions} 
                  disabled={!hasChanges}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardHeader>

            <ScrollArea className="h-[calc(100%-8rem)]">
              <div className="p-6 space-y-6">
                {Object.entries(permissionGroups).map(([groupName, perms]) => (
                  <div key={groupName} className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                      {groupName}
                      <Badge variant="secondary" className="text-xs">
                        {perms.filter(p => permissions[p.key as keyof Permission]).length}/{perms.length} enabled
                      </Badge>
                    </h3>
                    <div className="grid gap-4">
                      {perms.map((perm) => {
                        const isEnabled = permissions[perm.key as keyof Permission];
                        return (
                          <div
                            key={perm.key}
                            className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
                          >
                            <div className="flex-1">
                              <Label htmlFor={perm.key} className="text-base font-medium cursor-pointer flex items-center gap-2">
                                {perm.label}
                                {isEnabled ? (
                                  <Check className="h-4 w-4 text-success" />
                                ) : (
                                  <X className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Label>
                              <p className="text-sm text-muted-foreground mt-1">{perm.description}</p>
                            </div>
                            <Switch
                              id={perm.key}
                              checked={isEnabled}
                              onCheckedChange={(checked) => updatePermission(perm.key as keyof Permission, checked)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Member Selected</h3>
              <p className="text-sm text-muted-foreground">
                Select a team member to manage their permissions
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}