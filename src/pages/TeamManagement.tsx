import { useState, useEffect } from "react";
import { BusinessLayout } from "@/components/BusinessLayout";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Plus, 
  Grid3x3, 
  List, 
  Search, 
  Filter,
  Download,
  TrendingUp,
  Clock,
  Building2,
  BarChart3,
  ArrowLeft
} from "lucide-react";
import { TeamMemberCard } from "@/components/team/TeamMemberCard";
import { TeamMemberTable } from "@/components/team/TeamMemberTable";
import { AddTeamMemberDialog } from "@/components/team/AddTeamMemberDialog";
import { TeamMemberProfilePanel } from "@/components/team/TeamMemberProfilePanel";
import { TeamAnalyticsDashboard } from "@/components/team/TeamAnalyticsDashboard";

interface TeamMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department: string;
  role_title: string;
  role_id?: string;
  avatar_url?: string;
  status: 'active' | 'inactive' | 'on_leave' | 'offboarded';
  workload_score: number;
  utilization_score: number;
  join_date: string;
  permissions: any;
  created_at: string;
  updated_at: string;
  roles?: { role_name: string; department: string };
}

export default function TeamManagement() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Metrics
  const [metrics, setMetrics] = useState({
    total: 0,
    activeToday: 0,
    avgTenure: 0,
    departments: 0
  });

  const handleLogout = () => {
    navigate('/login-business');
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  useEffect(() => {
    filterAndSortMembers();
  }, [teamMembers, searchQuery, selectedDepartment, selectedStatus, selectedRole, sortBy]);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          roles (
            role_name,
            department
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTeamMembers(data as any || []);
      calculateMetrics(data as any || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (members: TeamMember[]) => {
    const activeMembers = members.filter(m => m.status === 'active');
    const departments = new Set(members.map(m => m.department)).size;
    
    const avgTenure = members.length > 0
      ? members.reduce((sum, m) => {
          const joinDate = new Date(m.join_date);
          const today = new Date();
          const monthsDiff = (today.getFullYear() - joinDate.getFullYear()) * 12 + 
                           (today.getMonth() - joinDate.getMonth());
          return sum + monthsDiff;
        }, 0) / members.length
      : 0;

    setMetrics({
      total: members.length,
      activeToday: activeMembers.length,
      avgTenure: Math.round(avgTenure),
      departments
    });
  };

  const filterAndSortMembers = () => {
    let filtered = [...teamMembers];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.first_name.toLowerCase().includes(query) ||
        m.last_name.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query) ||
        m.department.toLowerCase().includes(query)
      );
    }

    // Department filter
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(m => m.department === selectedDepartment);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(m => m.status === selectedStatus);
    }

    // Role filter
    if (selectedRole !== 'all') {
      filtered = filtered.filter(m => m.roles?.role_name === selectedRole);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
        case 'join_date':
          return new Date(a.join_date).getTime() - new Date(b.join_date).getTime();
        case 'department':
          return a.department.localeCompare(b.department);
        case 'workload':
          return b.workload_score - a.workload_score;
        default:
          return 0;
      }
    });

    setFilteredMembers(filtered);
  };

  const departments = Array.from(new Set(teamMembers.map(m => m.department)));
  const roles = Array.from(new Set(teamMembers.map(m => m.roles?.role_name).filter(Boolean)));

  const handleViewProfile = (member: TeamMember) => {
    setSelectedMember(member);
    setIsPanelOpen(true);
  };

  return (
    <BusinessLayout userEmail="business@flowpulse.io" onLogout={handleLogout}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/business/dashboard')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Team Management</h1>
              <p className="text-muted-foreground">Manage your team members, roles, and workload</p>
            </div>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Team Member
          </Button>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Today</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activeToday}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Tenure</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.avgTenure} mo</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.departments}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and View Toggle */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="on_leave">On Leave</SelectItem>
                <SelectItem value="offboarded">Offboarded</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="join_date">Join Date</SelectItem>
                <SelectItem value="department">Department</SelectItem>
                <SelectItem value="workload">Workload</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button
              variant={viewMode === 'card' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('card')}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('table')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Team Members Display */}
        {loading ? (
          <div className="text-center py-12">Loading team members...</div>
        ) : viewMode === 'card' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map(member => (
              <TeamMemberCard
                key={member.id}
                member={member}
                onViewProfile={handleViewProfile}
                onRefresh={fetchTeamMembers}
              />
            ))}
          </div>
        ) : (
          <TeamMemberTable
            members={filteredMembers}
            onViewProfile={handleViewProfile}
            onRefresh={fetchTeamMembers}
          />
        )}

        {filteredMembers.length === 0 && !loading && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No team members found</p>
            </CardContent>
          </Card>
        )}
      </div>

      <AddTeamMemberDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={fetchTeamMembers}
      />

      <TeamMemberProfilePanel
        member={selectedMember}
        open={isPanelOpen}
        onOpenChange={setIsPanelOpen}
        onRefresh={fetchTeamMembers}
      />
    </BusinessLayout>
  );
}