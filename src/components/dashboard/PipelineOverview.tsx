import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileSearch, Target, Send, CheckCircle2, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const stages = [
  { key: 'new_lead', label: 'New Leads', icon: Users, color: 'hsl(210, 100%, 56%)' },
  { key: 'discovery', label: 'Discovery', icon: FileSearch, color: 'hsl(262, 83%, 58%)' },
  { key: 'risk_profile', label: 'Risk Profile', icon: Target, color: 'hsl(25, 95%, 53%)' },
  { key: 'proposal_sent', label: 'Proposal', icon: Send, color: 'hsl(340, 82%, 52%)' },
  { key: 'active_client', label: 'Active', icon: CheckCircle2, color: 'hsl(142, 71%, 45%)' },
];

export function PipelineOverview() {
  const [stageCounts, setStageCounts] = useState<Record<string, number>>({});
  const navigate = useNavigate();

  useEffect(() => { fetchPipelineData(); }, []);

  const fetchPipelineData = async () => {
    try {
      const { data, error } = await supabase.from('client_pipeline').select('stage');
      if (error) throw error;
      const counts: Record<string, number> = {};
      stages.forEach(stage => {
        counts[stage.key] = data?.filter(p => p.stage === stage.key).length || 0;
      });
      setStageCounts(counts);
    } catch (error) {
      console.error('Error fetching pipeline data:', error);
    }
  };

  const chartData = stages.map(s => ({
    name: s.label,
    value: stageCounts[s.key] || 0,
    color: s.color,
    key: s.key,
  }));

  const totalLeads = Object.values(stageCounts).reduce((s, v) => s + v, 0);

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base font-semibold">
          <div className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            Pipeline Overview
          </div>
          <span className="text-xs font-normal text-muted-foreground">{totalLeads} total prospects</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Funnel Bar Chart */}
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={80}
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(value: number) => [`${value} prospects`, ""]}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} animationDuration={1200} barSize={28}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} cursor="pointer" onClick={() => navigate(`/finance-crm?stage=${entry.key}`)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Stage Cards */}
          <div className="grid grid-cols-5 gap-2">
            {stages.map((stage, index) => {
              const Icon = stage.icon;
              const count = stageCounts[stage.key] || 0;
              const pct = totalLeads > 0 ? ((count / totalLeads) * 100).toFixed(0) : '0';
              return (
                <div
                  key={stage.key}
                  onClick={() => navigate(`/finance-crm?stage=${stage.key}`)}
                  className="relative flex flex-col items-center gap-1.5 p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 cursor-pointer transition-all hover:-translate-y-0.5 group"
                >
                  <div className="p-2 rounded-lg transition-colors" style={{ backgroundColor: `${stage.color}20` }}>
                    <Icon className="h-4 w-4" style={{ color: stage.color }} />
                  </div>
                  <div className="text-xl font-bold text-foreground">{count}</div>
                  <span className="text-[10px] text-center text-muted-foreground leading-tight">{stage.label}</span>
                  <span className="text-[10px] font-medium" style={{ color: stage.color }}>{pct}%</span>
                  {index < stages.length - 1 && (
                    <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 hidden lg:block">
                      <ArrowRight className="h-3 w-3 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
