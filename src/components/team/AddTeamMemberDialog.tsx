import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const DEFAULT_ROLES = [
  { id: 'admin', role_name: 'Admin', department: 'Administration', permissions_schema: { can_manage_roles: true, can_edit_team_members: true, can_view_finance: true, can_view_workload: true, can_access_sensitive_tabs: true } },
  { id: 'manager', role_name: 'Manager', department: 'Management', permissions_schema: { can_manage_roles: false, can_edit_team_members: true, can_view_finance: true, can_view_workload: true, can_access_sensitive_tabs: true } },
  { id: 'hr', role_name: 'HR', department: 'Human Resources', permissions_schema: { can_manage_roles: true, can_edit_team_members: true, can_view_finance: false, can_view_workload: true, can_access_sensitive_tabs: true } },
  { id: 'finance', role_name: 'Finance', department: 'Finance', permissions_schema: { can_manage_roles: false, can_edit_team_members: false, can_view_finance: true, can_view_workload: true, can_access_sensitive_tabs: true } }
];

export function AddTeamMemberDialog({ open, onOpenChange, onSuccess }: AddTeamMemberDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<any[]>(DEFAULT_ROLES);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department: '',
    role_title: '',
    role_id: '',
    join_date: new Date().toISOString().split('T')[0],
    status: 'active'
  });

  useEffect(() => {
    if (open) {
      fetchRoles();
    }
  }, [open]);

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('role_name');
      
      if (error) {
        console.error('Error fetching roles:', error);
        // Keep using DEFAULT_ROLES as fallback
        return;
      }
      
      if (data && data.length > 0) {
        setRoles(data);
        console.log('Loaded roles from database:', data.length);
      } else {
        console.log('No roles in database, using default roles');
        // DEFAULT_ROLES already set in state
      }
    } catch (error: any) {
      console.error('Error in fetchRoles:', error);
      // Keep using DEFAULT_ROLES as fallback
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.role_id) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields including permission template",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to add team members. Please log in and try again.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      console.log('Authenticated user:', user.id);

      // Get the selected role's permissions
      const selectedRole = roles.find(r => r.id === formData.role_id);
      
      // Check if role_id is a valid UUID (from database) or a string (fallback)
      const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(formData.role_id);
      
      const memberData: any = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone || null,
        department: formData.department || 'General',
        role_title: formData.role_title || selectedRole?.role_name || 'Team Member',
        join_date: formData.join_date,
        status: formData.status,
        permissions: selectedRole?.permissions_schema || {},
        workload_score: 0,
        utilization_score: 0
      };
      
      // Only include role_id if it's a valid UUID from the database
      if (isValidUUID) {
        memberData.role_id = formData.role_id;
      }

      console.log('Attempting to insert team member:', memberData);

      const { data, error } = await supabase
        .from('team_members')
        .insert([memberData])
        .select();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Successfully inserted:', data);

      toast({
        title: "Success",
        description: `${formData.first_name} ${formData.last_name} added successfully`
      });

      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        department: '',
        role_title: '',
        role_id: '',
        join_date: new Date().toISOString().split('T')[0],
        status: 'active'
      });
    } catch (error: any) {
      console.error('Error adding team member:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add team member. Please check the console for details.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>Add a new member to your team</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Input
                id="department"
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role_title">Role Title *</Label>
              <Input
                id="role_title"
                required
                value={formData.role_title}
                onChange={(e) => setFormData({ ...formData, role_title: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role_id">Permission Template *</Label>
            <Select 
              value={formData.role_id} 
              onValueChange={(value) => {
                const selectedRole = roles.find(r => r.id === value);
                setFormData({ 
                  ...formData, 
                  role_id: value,
                  // Auto-populate department and role title if available
                  department: selectedRole?.department || formData.department,
                  role_title: selectedRole?.role_name || formData.role_title
                });
              }}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select a role template" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {roles.map(role => (
                  <SelectItem key={role.id} value={role.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{role.role_name}</span>
                      <span className="text-xs text-muted-foreground">{role.department}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.role_id && (
              <p className="text-xs text-muted-foreground">
                Department and role title will be auto-populated from the selected template
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="on_leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Member'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}