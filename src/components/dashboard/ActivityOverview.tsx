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

      const { data: activityData } = await supabase
        .from('advisor_activity')
        .select('activity_type')
        .eq('user_id', user.user.id)
        .gte('created_at', monthStart.toISOString());

      const queriesRun = activityData?.filter(a => a.activity_type === 'query').length || 0;
      const documentsGenerated = activityData?.filter(a => a.activity_type === 'document_generated').length || 0;
      const meetingsScheduled = activityData?.filter(a => a.activity_type === 'meeting_scheduled').length || 0;

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
      gradient: 'from-blue-500 to-cyan-500',
      glow: 'shadow-blue-500/20',
    },
    {
      label: 'Documents Generated',
      value: activity.documentsGenerated,
      icon: FileText,
      gradient: 'from-violet-500 to-purple-500',
      glow: 'shadow-violet-500/20',
    },
    {
      label: 'Clients Onboarded',
      value: activity.clientsOnboarded,
      icon: UserPlus,
      gradient: 'from-emerald-500 to-green-500',
      glow: 'shadow-emerald-500/20',
    },
    {
      label: 'Meetings Scheduled',
      value: activity.meetingsScheduled,
      icon: TrendingUp,
      gradient: 'from-amber-500 to-orange-500',
      glow: 'shadow-amber-500/20',
    }
  ];

  return (
    <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-xl">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Activity className="h-4 w-4 text-primary" />
          </div>
          Your Activity Overview
          <span className="text-sm font-normal text-muted-foreground ml-auto">This month</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="relative group text-center space-y-3 p-4 rounded-xl border border-border/50 bg-muted/20 backdrop-blur-sm hover:bg-muted/40 transition-all duration-300 hover:-translate-y-1">
                <div className={`w-14 h-14 mx-auto rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg ${stat.glow} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
