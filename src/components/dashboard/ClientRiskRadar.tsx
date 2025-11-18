import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
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
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Client Risk Radar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {riskStats.critical > 0 && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="font-medium text-sm">{riskStats.critical} client{riskStats.critical !== 1 ? 's' : ''} require immediate rebalancing</span>
            </div>
            <Badge variant="destructive">Critical</Badge>
          </div>
        )}
        
        {riskStats.medium > 0 && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/20">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="font-medium text-sm">{riskStats.medium} client{riskStats.medium !== 1 ? 's' : ''} nearing risk threshold</span>
            </div>
            <Badge className="bg-warning text-warning-foreground">Warning</Badge>
          </div>
        )}

        <div className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/20">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-success" />
            <span className="font-medium text-sm">{riskStats.compliant} client{riskStats.compliant !== 1 ? 's' : ''} fully compliant</span>
          </div>
          <Badge className="bg-success text-success-foreground">Healthy</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
