import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, FileText, MessageSquare, UserPlus, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function ActivityOverview() {
  const [activity, setActivity] = useState({
    queriesRun: 0,
    documentsGenerated: 0,
    clientsOnboarded: 0,
    meetingsScheduled: 0
  });

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Fetch activity for current month
      const { data: activityData } = await supabase
        .from('advisor_activity')
        .select('activity_type')
        .eq('user_id', user.user.id)
        .gte('created_at', monthStart.toISOString());

      const queriesRun = activityData?.filter(a => a.activity_type === 'query').length || 0;
      const documentsGenerated = activityData?.filter(a => a.activity_type === 'document_generated').length || 0;
      const meetingsScheduled = activityData?.filter(a => a.activity_type === 'meeting_scheduled').length || 0;

      // Fetch new clients this month
      const { data: clients } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.user.id)
        .gte('created_at', monthStart.toISOString());

      setActivity({
        queriesRun,
        documentsGenerated,
        clientsOnboarded: clients?.length || 0,
        meetingsScheduled
      });
    } catch (error) {
      console.error('Error fetching activity:', error);
    }
  };

  const stats = [
    {
      label: 'Queries Run',
      value: activity.queriesRun,
      icon: MessageSquare,
      color: 'text-blue-500'
    },
    {
      label: 'Documents Generated',
      value: activity.documentsGenerated,
      icon: FileText,
      color: 'text-purple-500'
    },
    {
      label: 'Clients Onboarded',
      value: activity.clientsOnboarded,
      icon: UserPlus,
      color: 'text-green-500'
    },
    {
      label: 'Meetings Scheduled',
      value: activity.meetingsScheduled,
      icon: TrendingUp,
      color: 'text-orange-500'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Your Activity Overview
          <span className="text-sm font-normal text-muted-foreground ml-auto">This month</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="text-center space-y-2">
                <Icon className={`h-8 w-8 mx-auto ${stat.color}`} />
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
