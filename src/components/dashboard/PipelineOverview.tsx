import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FileSearch, Target, Send, CheckCircle2, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const stages = [
  { key: 'new_lead', label: 'New Leads', icon: Users, gradient: 'from-blue-500 to-blue-600', glow: 'shadow-blue-500/20' },
  { key: 'discovery', label: 'Discovery', icon: FileSearch, gradient: 'from-violet-500 to-purple-600', glow: 'shadow-violet-500/20' },
  { key: 'risk_profile', label: 'Risk Profile', icon: Target, gradient: 'from-amber-500 to-orange-600', glow: 'shadow-amber-500/20' },
  { key: 'proposal_sent', label: 'Proposal Sent', icon: Send, gradient: 'from-cyan-500 to-blue-600', glow: 'shadow-cyan-500/20' },
  { key: 'active_client', label: 'Active Client', icon: CheckCircle2, gradient: 'from-emerald-500 to-green-600', glow: 'shadow-emerald-500/20' },
];

export function PipelineOverview() {
  const [stageCounts, setStageCounts] = useState<Record<string, number>>({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchPipelineData();
  }, []);

  const fetchPipelineData = async () => {
    try {
      const { data, error } = await supabase
        .from('client_pipeline')
        .select('stage');
      
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

  return (
    <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-xl">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <ArrowRight className="h-4 w-4 text-primary" />
          </div>
          Pipeline Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-4">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const count = stageCounts[stage.key] || 0;
            
            return (
              <div
                key={stage.key}
                onClick={() => navigate(`/finance-crm?stage=${stage.key}`)}
                className={`relative flex flex-col items-center gap-3 p-5 rounded-xl border border-border/50 bg-muted/20 backdrop-blur-sm hover:bg-muted/40 hover:shadow-lg ${stage.glow} cursor-pointer transition-all duration-300 hover:-translate-y-1 group`}
              >
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stage.gradient} shadow-lg ${stage.glow} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="text-3xl font-bold tracking-tight">
                  {count}
                </div>
                <span className="text-xs text-center text-muted-foreground font-medium">
                  {stage.label}
                </span>
                {/* Connector arrow between stages */}
                {index < stages.length - 1 && (
                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 hidden lg:block">
                    <ArrowRight className="h-4 w-4 text-muted-foreground/30" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
