import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FileSearch, Target, Send, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const stages = [
  { key: 'new_lead', label: 'New Leads', icon: Users, color: 'bg-blue-500' },
  { key: 'discovery', label: 'Discovery', icon: FileSearch, color: 'bg-purple-500' },
  { key: 'risk_profile', label: 'Risk Profile', icon: Target, color: 'bg-orange-500' },
  { key: 'proposal_sent', label: 'Proposal Sent', icon: Send, color: 'bg-yellow-500' },
  { key: 'active_client', label: 'Active Client', icon: CheckCircle2, color: 'bg-green-500' },
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
    <Card>
      <CardHeader>
        <CardTitle>Pipeline Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-4">
          {stages.map((stage) => {
            const Icon = stage.icon;
            const count = stageCounts[stage.key] || 0;
            
            return (
              <div
                key={stage.key}
                onClick={() => navigate(`/finance-crm?stage=${stage.key}`)}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:bg-accent hover:shadow-md cursor-pointer transition-all duration-200 active:scale-95"
              >
                <div className={`p-3 rounded-full ${stage.color} bg-opacity-10`}>
                  <Icon className={`h-5 w-5 ${stage.color.replace('bg-', 'text-')}`} />
                </div>
                <Badge variant="secondary" className="text-xl font-bold">
                  {count}
                </Badge>
                <span className="text-xs text-center text-muted-foreground font-medium">
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
