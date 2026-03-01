import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, FileText, MessageSquare, UserPlus, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function ActivityOverview() {
  const [activity, setActivity] = useState({ queriesRun: 0, documentsGenerated: 0, clientsOnboarded: 0, meetingsScheduled: 0 });

  useEffect(() => { fetchActivity(); }, []);

  const fetchActivity = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const { data: activityData } = await supabase.from('advisor_activity').select('activity_type').eq('user_id', user.user.id).gte('created_at', monthStart.toISOString());
      const { data: clients } = await supabase.from('clients').select('id').eq('user_id', user.user.id).gte('created_at', monthStart.toISOString());
      setActivity({
        queriesRun: activityData?.filter(a => a.activity_type === 'query').length || 0,
        documentsGenerated: activityData?.filter(a => a.activity_type === 'document_generated').length || 0,
        clientsOnboarded: clients?.length || 0,
        meetingsScheduled: activityData?.filter(a => a.activity_type === 'meeting_scheduled').length || 0
      });
    } catch (error) { console.error('Error fetching activity:', error); }
  };

  const stats = [
    { label: 'Queries Run', value: activity.queriesRun, icon: MessageSquare },
    { label: 'Documents Generated', value: activity.documentsGenerated, icon: FileText },
    { label: 'Clients Onboarded', value: activity.clientsOnboarded, icon: UserPlus },
    { label: 'Meetings Scheduled', value: activity.meetingsScheduled, icon: TrendingUp },
  ];

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base font-semibold">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Activity Overview
          </div>
          <span className="text-xs font-normal text-muted-foreground">This month</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="text-center p-4 rounded-lg border border-border bg-muted/20">
                <div className="p-2 rounded-lg bg-primary/10 w-fit mx-auto mb-2">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
