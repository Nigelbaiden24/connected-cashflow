import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Shield, Users, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PERMISSIONS = [
  { id: "read", label: "Read Access" },
  { id: "write", label: "Write Access" },
  { id: "delete", label: "Delete Access" },
  { id: "admin", label: "Admin Access" },
  { id: "export", label: "Export Data" },
  { id: "manage_users", label: "Manage Users" },
];

export const RoleManagement = () => {
  const [roles, setRoles] = useState<any[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newRole, setNewRole] = useState({
    user_id: "",
    role: "viewer",
    permissions: [] as string[],
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRoles(data || []);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const addRole = async () => {
    if (!newRole.user_id) {
      toast.error("Please enter a user ID");
      return;
    }

    try {
      const { error } = await supabase.from("user_roles").insert([
        {
          user_id: newRole.user_id,
          role: newRole.role as any,
          permissions: newRole.permissions,
        },
      ]);

      if (error) throw error;

      toast.success("Role assigned successfully");
      setShowAddDialog(false);
      setNewRole({ user_id: "", role: "viewer", permissions: [] });
      fetchRoles();

      await supabase.from("audit_logs").insert({
        action: "role_assigned",
        resource_type: "user_roles",
        severity: "info",
        details: { user_id: newRole.user_id, role: newRole.role },
      });
    } catch (error: any) {
      console.error("Error adding role:", error);
      toast.error(error.message || "Failed to assign role");
    }
  };

  const togglePermission = (permission: string) => {
    setNewRole((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const deleteRole = async (id: string, userId: string) => {
    if (!confirm("Are you sure you want to remove this role assignment?")) return;

    try {
      const { error } = await supabase.from("user_roles").delete().eq("id", id);

      if (error) throw error;

      toast.success("Role removed successfully");
      fetchRoles();

      await supabase.from("audit_logs").insert({
        action: "role_removed",
        resource_type: "user_roles",
        resource_id: id,
        severity: "warning",
        details: { user_id: userId },
      });
    } catch (error) {
      console.error("Error deleting role:", error);
      toast.error("Failed to remove role");
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/10 text-red-700 border-red-200";
      case "manager":
        return "bg-blue-500/10 text-blue-700 border-blue-200";
      case "analyst":
        return "bg-purple-500/10 text-purple-700 border-purple-200";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Role-Based Access Control</h2>
          <p className="text-sm text-muted-foreground">
            Manage user roles and permissions across the system
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Assign Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Assign User Role</DialogTitle>
              <DialogDescription>
                Configure role and permissions for a user
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>User ID</Label>
                <Input
                  value={newRole.user_id}
                  onChange={(e) => setNewRole({ ...newRole, user_id: e.target.value })}
                  placeholder="Enter user UUID"
                />
              </div>
              <div>
                <Label>Role</Label>
                <Select
                  value={newRole.role}
                  onValueChange={(value) => setNewRole({ ...newRole, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="analyst">Analyst</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Permissions</Label>
                <div className="space-y-2 mt-2">
                  {PERMISSIONS.map((perm) => (
                    <div key={perm.id} className="flex items-center gap-2">
                      <Checkbox
                        checked={newRole.permissions.includes(perm.id)}
                        onCheckedChange={() => togglePermission(perm.id)}
                      />
                      <Label className="text-sm cursor-pointer">{perm.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={addRole}>Assign Role</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.length}</div>
            <p className="text-xs text-muted-foreground">With assigned roles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {roles.filter((r) => r.role === "admin").length}
            </div>
            <p className="text-xs text-muted-foreground">Administrative access</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Managers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {roles.filter((r) => r.role === "manager").length}
            </div>
            <p className="text-xs text-muted-foreground">Management access</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Roles</CardTitle>
          <CardDescription>Current role assignments and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Assigned</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No roles assigned yet
                  </TableCell>
                </TableRow>
              ) : (
                roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-mono text-sm">
                      {role.user_id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getRoleColor(role.role)}>
                        {role.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(role.permissions || []).slice(0, 3).map((perm: string) => (
                          <Badge key={perm} variant="secondary" className="text-xs">
                            {perm}
                          </Badge>
                        ))}
                        {(role.permissions || []).length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{(role.permissions || []).length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(role.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteRole(role.id, role.user_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
