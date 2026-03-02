import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, FileText, MessageSquare, UserPlus, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";

const COLORS = ['hsl(210, 100%, 56%)', 'hsl(262, 83%, 58%)', 'hsl(142, 71%, 45%)', 'hsl(25, 95%, 53%)'];

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
    { label: 'Queries', value: activity.queriesRun, icon: MessageSquare, fullLabel: 'Queries Run' },
    { label: 'Documents', value: activity.documentsGenerated, icon: FileText, fullLabel: 'Documents Generated' },
    { label: 'Onboarded', value: activity.clientsOnboarded, icon: UserPlus, fullLabel: 'Clients Onboarded' },
    { label: 'Meetings', value: activity.meetingsScheduled, icon: TrendingUp, fullLabel: 'Meetings Scheduled' },
  ];

  const radarData = stats.map(s => ({ subject: s.label, value: s.value, fullMark: Math.max(...stats.map(x => x.value), 10) }));
  const pieData = stats.filter(s => s.value > 0).map((s, i) => ({ name: s.fullLabel, value: s.value, color: COLORS[i] }));
  const totalActivity = stats.reduce((s, v) => s + v.value, 0);

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base font-semibold">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Activity Overview
          </div>
          <span className="text-xs font-normal text-muted-foreground">{totalActivity} actions this month</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Radar Chart */}
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Radar dataKey="value" stroke="hsl(210, 100%, 56%)" fill="hsl(210, 100%, 56%)" fillOpacity={0.25} strokeWidth={2} animationDuration={1200} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="h-[200px] flex items-center justify-center">
            {totalActivity > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                    animationDuration={1200}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No activity yet</p>
              </div>
            )}
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 gap-2">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center p-3 rounded-lg border border-border bg-muted/20">
                  <div className="p-1.5 rounded-lg w-fit mx-auto mb-1" style={{ backgroundColor: `${COLORS[i]}20` }}>
                    <Icon className="h-3.5 w-3.5" style={{ color: COLORS[i] }} />
                  </div>
                  <div className="text-xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{stat.fullLabel}</div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
