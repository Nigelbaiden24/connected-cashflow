import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, AlertCircle, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function ClientRiskRadar() {
  const [riskStats, setRiskStats] = useState({
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    compliant: 0
  });

  useEffect(() => {
    fetchRiskData();
  }, []);

  const fetchRiskData = async () => {
    try {
      const { data, error } = await supabase
        .from('client_risk_assessments')
        .select('risk_level');
      
      if (error) throw error;

      const stats = {
        critical: data?.filter(r => r.risk_level === 'critical').length || 0,
        high: data?.filter(r => r.risk_level === 'high').length || 0,
        medium: data?.filter(r => r.risk_level === 'medium').length || 0,
        low: data?.filter(r => r.risk_level === 'low').length || 0,
        compliant: data?.filter(r => r.risk_level === 'low').length || 0
      };

      setRiskStats(stats);
    } catch (error) {
      console.error('Error fetching risk data:', error);
    }
  };

  return (
    <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-xl">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          Client Risk Radar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 relative">
        {riskStats.critical > 0 && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-destructive/5 border border-destructive/20 backdrop-blur-sm hover:bg-destructive/10 transition-all duration-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="font-medium text-sm">{riskStats.critical} client{riskStats.critical !== 1 ? 's' : ''} require immediate rebalancing</span>
            </div>
            <Badge variant="destructive" className="text-xs">Critical</Badge>
          </div>
        )}
        
        {riskStats.medium > 0 && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 backdrop-blur-sm hover:bg-amber-500/10 transition-all duration-300">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="font-medium text-sm">{riskStats.medium} client{riskStats.medium !== 1 ? 's' : ''} nearing risk threshold</span>
            </div>
            <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-xs">Warning</Badge>
          </div>
        )}

        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 backdrop-blur-sm hover:bg-emerald-500/10 transition-all duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            <span className="font-medium text-sm">{riskStats.compliant} client{riskStats.compliant !== 1 ? 's' : ''} fully compliant</span>
          </div>
          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs">Healthy</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
