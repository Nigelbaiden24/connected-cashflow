import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserPlus, UserMinus, CheckCircle2, XCircle, Shield, Users, Search, Mail, Loader2, MoreHorizontal, Trash2, Edit, Building2, TrendingUp, Briefcase, Settings2, RefreshCw } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { UserTabPermissionsDialog } from "./UserTabPermissionsDialog";

interface UserWithRole {
  user_id: string;
  email: string;
  full_name: string;
  created_at: string;
  email_confirmed: boolean;
  last_sign_in: string | null;
  roles: string[];
  status: "active" | "pending" | "inactive";
  platforms: {
    finance: boolean;
    business: boolean;
    investor: boolean;
  };
  pending_invite: {
    invited_role: string;
    platform_finance: boolean;
    platform_business: boolean;
    platform_investor: boolean;
    invited_at: string;
  } | null;
}

interface InviteForm {
  email: string;
  fullName: string;
  role: string;
  platforms: {
    finance: boolean;
    business: boolean;
    investor: boolean;
  };
}

export function UserManagement() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState<InviteForm>({ 
    email: "", 
    fullName: "", 
    role: "viewer",
    platforms: { finance: false, business: false, investor: false }
  });
  const [submitting, setSubmitting] = useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [selectedUserForPermissions, setSelectedUserForPermissions] = useState<{
    user_id: string;
    email: string;
    full_name: string;
  } | null>(null);

  const handleOpenPermissionsDialog = (user: UserWithRole) => {
    setSelectedUserForPermissions({
      user_id: user.user_id,
      email: user.email,
      full_name: user.full_name
    });
    setPermissionsDialogOpen(true);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Use edge function to get complete user data including auth.users
      const { data: sessionData } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke("admin-user-management", {
        body: { action: "list" },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to fetch users");
      }

      if (response.data?.users) {
        setUsers(response.data.users);
      } else {
        // Fallback to direct query if edge function fails
        await fetchUsersFallback();
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
      // Try fallback method
      await fetchUsersFallback();
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersFallback = async () => {
    try {
      // Fetch all user profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("user_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      // Fetch platform permissions
      const { data: permissionsData, error: permissionsError } = await supabase
        .from("platform_permissions")
        .select("user_id, can_access_finance_platform, can_access_business_platform, can_access_investor_platform");

      if (permissionsError) throw permissionsError;

      // Fetch pending invitations
      const { data: pendingInvites } = await supabase
        .from("pending_invitations")
        .select("*")
        .is("completed_at", null);

      // Combine the data
      const usersWithRoles: UserWithRole[] = (profilesData || []).map((profile) => {
        const userRoles = rolesData?.filter(r => r.user_id === profile.user_id).map(r => r.role) || [];
        const userPermissions = permissionsData?.find(p => p.user_id === profile.user_id);
        const pendingInvite = pendingInvites?.find(i => i.user_id === profile.user_id);
        
        return {
          user_id: profile.user_id,
          email: profile.email || pendingInvite?.email || "No email",
          full_name: profile.full_name || pendingInvite?.full_name || "Unknown",
          created_at: profile.created_at || "",
          email_confirmed: true,
          last_sign_in: null,
          roles: userRoles,
          status: userRoles.length > 0 ? "active" : "pending",
          platforms: {
            finance: userPermissions?.can_access_finance_platform || false,
            business: userPermissions?.can_access_business_platform || false,
            investor: userPermissions?.can_access_investor_platform || false
          },
          pending_invite: pendingInvite ? {
            invited_role: pendingInvite.invited_role,
            platform_finance: pendingInvite.platform_finance,
            platform_business: pendingInvite.platform_business,
            platform_investor: pendingInvite.platform_investor,
            invited_at: pendingInvite.invited_at,
          } : null,
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Fallback fetch error:", error);
      toast.error("Failed to load users");
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.email || !inviteForm.fullName) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const response = await supabase.functions.invoke("admin-user-management", {
        body: {
          action: "invite",
          email: inviteForm.email,
          fullName: inviteForm.fullName,
          role: inviteForm.role,
          platforms: inviteForm.platforms,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to invite user");
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      toast.success(response.data?.message || `User ${inviteForm.email} invited successfully`);
      
      setAddUserOpen(false);
      setInviteForm({ 
        email: "", 
        fullName: "", 
        role: "viewer",
        platforms: { finance: false, business: false, investor: false }
      });
      await fetchUsers();
    } catch (error: any) {
      console.error("Error inviting user:", error);
      toast.error(error.message || "Failed to invite user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      const response = await supabase.functions.invoke("admin-user-management", {
        body: {
          action: "update_role",
          userId,
          role: "viewer",
        },
      });

      if (response.error || response.data?.error) {
        throw new Error(response.error?.message || response.data?.error);
      }

      toast.success("User approved successfully");
      await fetchUsers();
    } catch (error: any) {
      console.error("Error approving user:", error);
      toast.error("Failed to approve user");
    }
  };

  const handleRemoveUser = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to remove ${email}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await supabase.functions.invoke("admin-user-management", {
        body: {
          action: "delete",
          userId,
        },
      });

      if (response.error || response.data?.error) {
        throw new Error(response.error?.message || response.data?.error);
      }

      toast.success("User removed successfully");
      await fetchUsers();
    } catch (error: any) {
      console.error("Error removing user:", error);
      toast.error("Failed to remove user");
    }
  };

  const handleUpdateRole = async (userId: string, newRole: "admin" | "analyst" | "hr_admin" | "manager" | "payroll_admin" | "viewer") => {
    try {
      const response = await supabase.functions.invoke("admin-user-management", {
        body: {
          action: "update_role",
          userId,
          role: newRole,
        },
      });

      if (response.error || response.data?.error) {
        throw new Error(response.error?.message || response.data?.error);
      }

      toast.success(`Role ${newRole.replace("_", " ")} added successfully`);
      await fetchUsers();
    } catch (error: any) {
      console.error("Error updating role:", error);
      toast.error("Failed to update role");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string, emailConfirmed?: boolean) => {
    if (status === "pending" && emailConfirmed === false) {
      return <Badge className="bg-orange-500/20 text-orange-600 border-orange-500/30">Email Not Confirmed</Badge>;
    }
    switch (status) {
      case "active":
        return <Badge className="bg-success/20 text-success border-success/30">Active</Badge>;
      case "pending":
        return <Badge className="bg-warning/20 text-warning border-warning/30">Pending</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleUpdatePlatformAccess = async (
    userId: string, 
    platform: "finance" | "business" | "investor", 
    hasAccess: boolean
  ) => {
    try {
      const response = await supabase.functions.invoke("admin-user-management", {
        body: {
          action: "update_platform_access",
          userId,
          platform,
          hasAccess,
        },
      });

      if (response.error || response.data?.error) {
        throw new Error(response.error?.message || response.data?.error);
      }

      toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} platform access ${hasAccess ? 'granted' : 'revoked'}`);
      await fetchUsers();
    } catch (error: any) {
      console.error("Error updating platform access:", error);
      toast.error("Failed to update platform access");
    }
  };

  const getPlatformBadges = (platforms: { finance: boolean; business: boolean; investor: boolean }) => {
    const badges = [];
    if (platforms.finance) {
      badges.push(
        <Badge key="finance" className="bg-primary/20 text-primary border-primary/30" variant="outline">
          <Briefcase className="h-3 w-3 mr-1" />
          Finance
        </Badge>
      );
    }
    if (platforms.business) {
      badges.push(
        <Badge key="business" className="bg-success/20 text-success border-success/30" variant="outline">
          <Building2 className="h-3 w-3 mr-1" />
          Business
        </Badge>
      );
    }
    if (platforms.investor) {
      badges.push(
        <Badge key="investor" className="bg-secondary/20 text-secondary border-secondary/30" variant="outline">
          <TrendingUp className="h-3 w-3 mr-1" />
          Investor
        </Badge>
      );
    }
    return badges.length > 0 ? badges : [<Badge key="none" variant="outline" className="text-muted-foreground">No access</Badge>];
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      admin: "bg-destructive/20 text-destructive border-destructive/30",
      hr_admin: "bg-primary/20 text-primary border-primary/30",
      payroll_admin: "bg-success/20 text-success border-success/30",
      manager: "bg-secondary/20 text-secondary border-secondary/30",
      analyst: "bg-accent/20 text-accent border-accent/30",
      viewer: "bg-muted text-muted-foreground border-border"
    };

    return (
      <Badge className={colors[role] || colors.viewer} variant="outline">
        {role.replace("_", " ")}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold text-primary">{users.length}</p>
              </div>
              <Users className="h-10 w-10 text-primary/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-success/20 bg-gradient-to-br from-success/5 to-transparent backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-3xl font-bold text-success">
                  {users.filter(u => u.status === "active").length}
                </p>
              </div>
              <CheckCircle2 className="h-10 w-10 text-success/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-warning/20 bg-gradient-to-br from-warning/5 to-transparent backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold text-warning">
                  {users.filter(u => u.status === "pending").length}
                </p>
              </div>
              <XCircle className="h-10 w-10 text-warning/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-3xl font-bold text-secondary">
                  {users.filter(u => u.roles.some(r => r.includes("admin"))).length}
                </p>
              </div>
              <Shield className="h-10 w-10 text-secondary/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Management Card */}
      <Card className="border-primary/20 shadow-xl bg-card/50 backdrop-blur-sm">
        <CardHeader className="border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Users className="h-6 w-6 text-primary" />
                User Management
              </CardTitle>
              <CardDescription>Manage user accounts, roles, and permissions</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite User
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Invite New User</DialogTitle>
                    <DialogDescription>
                      Send an invitation to join the platform
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleInviteUser} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="invite-email">Email *</Label>
                      <Input
                        id="invite-email"
                        type="email"
                        value={inviteForm.email}
                        onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                        placeholder="user@example.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invite-name">Full Name *</Label>
                      <Input
                        id="invite-name"
                        value={inviteForm.fullName}
                        onChange={(e) => setInviteForm({ ...inviteForm, fullName: e.target.value })}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invite-role">Initial Role</Label>
                      <Select value={inviteForm.role} onValueChange={(value) => setInviteForm({ ...inviteForm, role: value })}>
                        <SelectTrigger id="invite-role">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="analyst">Analyst</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="hr_admin">HR Admin</SelectItem>
                          <SelectItem value="payroll_admin">Payroll Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label>Platform Access</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="platform-finance"
                            checked={inviteForm.platforms.finance}
                            onCheckedChange={(checked) => 
                              setInviteForm({ ...inviteForm, platforms: { ...inviteForm.platforms, finance: checked as boolean }})
                            }
                          />
                          <label htmlFor="platform-finance" className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                            <Briefcase className="h-4 w-4 text-primary" />
                            Finance Platform
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="platform-business"
                            checked={inviteForm.platforms.business}
                            onCheckedChange={(checked) => 
                              setInviteForm({ ...inviteForm, platforms: { ...inviteForm.platforms, business: checked as boolean }})
                            }
                          />
                          <label htmlFor="platform-business" className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                            <Building2 className="h-4 w-4 text-success" />
                            Business Platform
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="platform-investor"
                            checked={inviteForm.platforms.investor}
                            onCheckedChange={(checked) => 
                              setInviteForm({ ...inviteForm, platforms: { ...inviteForm.platforms, investor: checked as boolean }})
                            }
                          />
                          <label htmlFor="platform-investor" className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                            <TrendingUp className="h-4 w-4 text-secondary" />
                            Investor Platform
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setAddUserOpen(false)} className="flex-1">
                        Cancel
                      </Button>
                      <Button type="submit" disabled={submitting} className="flex-1">
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
                        Send Invite
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Search Bar */}
          <div className="flex items-center gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Users Table */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-lg border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Platform Access</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.user_id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-primary/20">
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {user.full_name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{user.full_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.roles.length > 0 ? (
                              user.roles.map((role) => (
                                <span key={role}>{getRoleBadge(role)}</span>
                              ))
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground">No roles</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {getPlatformBadges(user.platforms)}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(user.status, user.email_confirmed)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              {user.status === "pending" && (
                                <>
                                  <DropdownMenuItem onClick={() => handleApproveUser(user.user_id)}>
                                    <CheckCircle2 className="h-4 w-4 mr-2 text-success" />
                                    Approve User
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              <DropdownMenuItem onClick={() => handleUpdateRole(user.user_id, "admin")}>
                                <Shield className="h-4 w-4 mr-2" />
                                Make Admin
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateRole(user.user_id, "manager")}>
                                <Shield className="h-4 w-4 mr-2" />
                                Make Manager
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateRole(user.user_id, "analyst")}>
                                <Shield className="h-4 w-4 mr-2" />
                                Make Analyst
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateRole(user.user_id, "hr_admin")}>
                                <Shield className="h-4 w-4 mr-2" />
                                Make HR Admin
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateRole(user.user_id, "payroll_admin")}>
                                <Shield className="h-4 w-4 mr-2" />
                                Make Payroll Admin
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleUpdatePlatformAccess(user.user_id, "finance", !user.platforms.finance)}>
                                <Briefcase className="h-4 w-4 mr-2" />
                                {user.platforms.finance ? "Revoke" : "Grant"} Finance Access
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdatePlatformAccess(user.user_id, "business", !user.platforms.business)}>
                                <Building2 className="h-4 w-4 mr-2" />
                                {user.platforms.business ? "Revoke" : "Grant"} Business Access
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdatePlatformAccess(user.user_id, "investor", !user.platforms.investor)}>
                                <TrendingUp className="h-4 w-4 mr-2" />
                                {user.platforms.investor ? "Revoke" : "Grant"} Investor Access
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleOpenPermissionsDialog(user)}>
                                <Settings2 className="h-4 w-4 mr-2" />
                                Configure Tab Permissions
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleRemoveUser(user.user_id, user.email)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <UserTabPermissionsDialog
        open={permissionsDialogOpen}
        onOpenChange={setPermissionsDialogOpen}
        user={selectedUserForPermissions}
        onPermissionsUpdated={fetchUsers}
      />
    </div>
  );
}
