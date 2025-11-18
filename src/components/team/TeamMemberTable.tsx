import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Eye, Edit, UserX } from "lucide-react";
import { format } from "date-fns";

interface TeamMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  role_title: string;
  avatar_url?: string;
  status: string;
  workload_score: number;
  utilization_score: number;
  join_date: string;
}

interface TeamMemberTableProps {
  members: TeamMember[];
  onViewProfile: (member: TeamMember) => void;
  onRefresh: () => void;
}

export function TeamMemberTable({ members, onViewProfile, onRefresh }: TeamMemberTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'on_leave':
        return 'warning';
      case 'inactive':
      case 'offboarded':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getWorkloadColor = (score: number) => {
    if (score >= 80) return 'bg-red-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Workload</TableHead>
            <TableHead>Utilization</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Join Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => {
            const initials = `${member.first_name[0]}${member.last_name[0]}`.toUpperCase();
            
            return (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar_url} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{member.first_name} {member.last_name}</div>
                      <div className="text-sm text-muted-foreground">{member.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{member.department}</Badge>
                </TableCell>
                <TableCell>{member.role_title}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={member.workload_score} 
                        className="h-2 w-20"
                      />
                      <span className="text-sm">{member.workload_score}%</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{member.utilization_score}%</TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(member.status) as any}>
                    {member.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>{format(new Date(member.join_date), 'MMM dd, yyyy')}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewProfile(member)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Member
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <UserX className="h-4 w-4 mr-2" />
                        Deactivate
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}