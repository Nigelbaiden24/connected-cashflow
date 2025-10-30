import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Plus, Users, UserCheck, Clock, Mail, Phone, ArrowLeft, MessageSquare, Eye, Shield, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Team = () => {
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState([
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Product Manager",
      department: "Product",
      email: "sarah.j@company.com",
      phone: "+1 234 567 8901",
      status: "active",
      joinDate: "2023-01-15",
      permissions: ["view", "edit", "manage"],
      workload: 85,
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Senior Developer",
      department: "Engineering",
      email: "michael.c@company.com",
      phone: "+1 234 567 8902",
      status: "active",
      joinDate: "2022-08-20",
      permissions: ["view", "edit"],
      workload: 72,
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "Marketing Lead",
      department: "Marketing",
      email: "emily.r@company.com",
      phone: "+1 234 567 8903",
      status: "active",
      joinDate: "2023-03-10",
      permissions: ["view", "edit", "manage"],
      workload: 90,
    },
    {
      id: 4,
      name: "David Kim",
      role: "UX Designer",
      department: "Design",
      email: "david.k@company.com",
      phone: "+1 234 567 8904",
      status: "away",
      joinDate: "2023-06-05",
      permissions: ["view"],
      workload: 65,
    },
  ]);

  const getDepartmentColor = (department: string) => {
    switch (department) {
      case "Product":
        return "bg-primary text-primary-foreground";
      case "Engineering":
        return "bg-secondary text-secondary-foreground";
      case "Marketing":
        return "bg-warning text-warning-foreground";
      case "Design":
        return "bg-accent text-accent-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    role: "",
    department: "",
    email: "",
    phone: "",
  });

  const handleAddMember = () => {
    if (!newMember.name || !newMember.role || !newMember.department || !newMember.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    const member = {
      id: teamMembers.length + 1,
      ...newMember,
      status: "active" as const,
      joinDate: new Date().toISOString().split('T')[0],
      permissions: ["view"] as string[],
      workload: 0,
    };

    setTeamMembers([...teamMembers, member]);
    setIsAddDialogOpen(false);
    setNewMember({ name: "", role: "", department: "", email: "", phone: "" });
    toast.success(`${newMember.name} has been added to the team`);
  };

  const handleViewProfile = (member: typeof teamMembers[0]) => {
    navigate("/team/profile", { state: { member } });
  };

  const handleMessage = (member: typeof teamMembers[0]) => {
    navigate("/team/chat", { state: { member } });
  };

  const getWorkloadColor = (workload: number) => {
    if (workload >= 85) return "text-destructive";
    if (workload >= 70) return "text-warning";
    return "text-success";
  };

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">Manage team members, roles, permissions, and workload</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Team Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
                <DialogDescription>
                  Add a new member to your team. Fill in their details below.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Input
                    id="role"
                    placeholder="Software Engineer"
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select value={newMember.department} onValueChange={(value) => setNewMember({ ...newMember, department: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Product">Product</SelectItem>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@company.com"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="+1 234 567 8900"
                    value={newMember.phone}
                    onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddMember}>Add Member</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers.length}</div>
            <p className="text-xs text-muted-foreground">Across 4 departments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers.filter(m => m.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">Currently online</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Tenure</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2 years</div>
            <p className="text-xs text-muted-foreground">Company average</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="members" className="space-y-6">
        <TabsList>
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="workload">Workload</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            {teamMembers.map((member) => (
              <Card key={member.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg">{member.name}</h3>
                          <Badge className={getDepartmentColor(member.department)}>
                            {member.department}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          {member.email}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          {member.phone}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-muted-foreground">
                          Joined {new Date(member.joinDate).toLocaleDateString()}
                        </span>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewProfile(member)}
                            className="gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            View Profile
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleMessage(member)}
                            className="gap-1"
                          >
                            <MessageSquare className="h-3 w-3" />
                            Message
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Roles & Permissions
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Manage access control and permissions based on modern RBAC principles
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => {
                        toast.success("Permission management opened");
                      }}>
                        <Shield className="h-4 w-4 mr-2" />
                        Manage Access
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Access Level:</span>
                        <Badge variant={member.permissions.includes("manage") ? "default" : "secondary"}>
                          {member.permissions.includes("manage") ? "Administrator" : 
                           member.permissions.includes("edit") ? "Editor" : "Viewer"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          {member.permissions.includes("view") && "Read Access"}
                        </Badge>
                        {member.permissions.includes("edit") && (
                          <Badge variant="outline" className="text-xs">
                            Write Access
                          </Badge>
                        )}
                        {member.permissions.includes("manage") && (
                          <Badge variant="outline" className="text-xs">
                            Full Control
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Team Workload Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {teamMembers.map((member) => (
                  <div key={member.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                      <span className={`text-lg font-bold ${getWorkloadColor(member.workload)}`}>
                        {member.workload}%
                      </span>
                    </div>
                    <Progress value={member.workload} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {member.workload >= 85 ? "High workload - consider reallocation" : 
                       member.workload >= 70 ? "Moderate workload" : 
                       "Capacity available"}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Team;
