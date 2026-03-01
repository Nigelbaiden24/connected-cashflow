import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileSearch, Target, Send, CheckCircle2, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const stages = [
  { key: 'new_lead', label: 'New Leads', icon: Users },
  { key: 'discovery', label: 'Discovery', icon: FileSearch },
  { key: 'risk_profile', label: 'Risk Profile', icon: Target },
  { key: 'proposal_sent', label: 'Proposal Sent', icon: Send },
  { key: 'active_client', label: 'Active Client', icon: CheckCircle2 },
];

export function PipelineOverview() {
  const [stageCounts, setStageCounts] = useState<Record<string, number>>({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchPipelineData();
  }, []);

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

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <ArrowRight className="h-4 w-4 text-primary" />
          Pipeline Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-3">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const count = stageCounts[stage.key] || 0;
            return (
              <div
                key={stage.key}
                onClick={() => navigate(`/finance-crm?stage=${stage.key}`)}
                className="relative flex flex-col items-center gap-2 p-4 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors group"
              >
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground">{count}</div>
                <span className="text-xs text-center text-muted-foreground">{stage.label}</span>
                {index < stages.length - 1 && (
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2 hidden lg:block">
                    <ArrowRight className="h-3 w-3 text-muted-foreground/30" />
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
