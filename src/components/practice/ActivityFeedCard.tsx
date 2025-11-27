import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, TrendingUp, Briefcase, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface Activity {
  id: number;
  type: string;
  client: string;
  description: string;
  time: string;
}

interface ActivityFeedCardProps {
  activities: Activity[];
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case "client_meeting": return Users;
    case "new_client": return Plus;
    case "trade_execution": return TrendingUp;
    case "compliance": return Briefcase;
    case "document_upload": return Target;
    default: return Users;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case "client_meeting": return "bg-primary/10 text-primary";
    case "new_client": return "bg-success/10 text-success";
    case "trade_execution": return "bg-chart-3/10 text-chart-3";
    case "compliance": return "bg-warning/10 text-warning";
    case "document_upload": return "bg-chart-5/10 text-chart-5";
    default: return "bg-muted text-muted-foreground";
  }
};

export function ActivityFeedCard({ activities }: ActivityFeedCardProps) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
          Live Activity Feed
        </CardTitle>
        <CardDescription>Real-time practice updates and notifications</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const ActivityIcon = getActivityIcon(activity.type);
            const colorClass = getActivityColor(activity.type);
            
            return (
              <div
                key={activity.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border border-transparent hover:border-border/50 hover:bg-muted/30 transition-all duration-200",
                  "animate-fade-in"
                )}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <div className={cn("p-2 rounded-lg", colorClass)}>
                  <ActivityIcon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{activity.client}</span>
                    <Badge variant="outline" className="text-xs">
                      {activity.type.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground/70">{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
