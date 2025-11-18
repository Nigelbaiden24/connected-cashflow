import { Card, CardContent } from "@/components/ui/card";
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
import { Mail, Phone, MoreVertical, Eye, Edit, UserX } from "lucide-react";
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
}

interface TeamMemberCardProps {
  member: TeamMember;
  onViewProfile: (member: TeamMember) => void;
  onRefresh: () => void;
}

export function TeamMemberCard({ member, onViewProfile, onRefresh }: TeamMemberCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'on_leave':
        return 'bg-yellow-500';
      case 'inactive':
        return 'bg-gray-500';
      case 'offboarded':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getWorkloadColor = (score: number) => {
    if (score >= 80) return 'bg-red-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const initials = `${member.first_name[0]}${member.last_name[0]}`.toUpperCase();

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6 space-y-4">
        {/* Header with Avatar and Actions */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={member.avatar_url} alt={`${member.first_name} ${member.last_name}`} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{member.first_name} {member.last_name}</h3>
              <p className="text-sm text-muted-foreground">{member.role_title}</p>
            </div>
          </div>
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
        </div>

        {/* Department and Status */}
        <div className="flex items-center gap-2">
          <Badge variant="outline">{member.department}</Badge>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${getStatusColor(member.status)}`} />
            <span className="text-sm capitalize">{member.status.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span className="truncate">{member.email}</span>
          </div>
          {member.phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{member.phone}</span>
            </div>
          )}
        </div>

        {/* Workload Score */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Workload</span>
            <span className="font-medium">{member.workload_score}%</span>
          </div>
          <Progress 
            value={member.workload_score} 
            className="h-2"
          />
        </div>

        {/* Utilization */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Utilization</span>
          <span className="font-medium">{member.utilization_score}%</span>
        </div>

        {/* Join Date */}
        <div className="flex justify-between text-sm border-t pt-3">
          <span className="text-muted-foreground">Joined</span>
          <span className="font-medium">{format(new Date(member.join_date), 'MMM dd, yyyy')}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => onViewProfile(member)}>
            View Profile
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            Message
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}