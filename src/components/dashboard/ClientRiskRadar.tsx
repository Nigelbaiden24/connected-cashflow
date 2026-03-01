import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, AlertCircle, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function ClientRiskRadar() {
  const [riskStats, setRiskStats] = useState({ critical: 0, high: 0, medium: 0, low: 0, compliant: 0 });

  useEffect(() => {
    fetchRiskData();
  }, []);

  const fetchRiskData = async () => {
    try {
      const { data, error } = await supabase.from('client_risk_assessments').select('risk_level');
      if (error) throw error;
      setRiskStats({
        critical: data?.filter(r => r.risk_level === 'critical').length || 0,
        high: data?.filter(r => r.risk_level === 'high').length || 0,
        medium: data?.filter(r => r.risk_level === 'medium').length || 0,
        low: data?.filter(r => r.risk_level === 'low').length || 0,
        compliant: data?.filter(r => r.risk_level === 'low').length || 0
      });
    } catch (error) {
      console.error('Error fetching risk data:', error);
    }
  };

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Shield className="h-4 w-4 text-primary" />
          Client Risk Radar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {riskStats.critical > 0 && (
          <div className="flex items-center justify-between p-3 rounded-lg border border-destructive/20 bg-destructive/5">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="font-medium text-sm">{riskStats.critical} client{riskStats.critical !== 1 ? 's' : ''} require rebalancing</span>
            </div>
            <Badge variant="destructive" className="text-xs">Critical</Badge>
          </div>
        )}
        {riskStats.medium > 0 && (
          <div className="flex items-center justify-between p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="font-medium text-sm">{riskStats.medium} client{riskStats.medium !== 1 ? 's' : ''} nearing threshold</span>
            </div>
            <Badge variant="outline" className="text-xs text-amber-600 border-amber-500/20 bg-amber-500/10">Warning</Badge>
          </div>
        )}
        <div className="flex items-center justify-between p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            <span className="font-medium text-sm">{riskStats.compliant} client{riskStats.compliant !== 1 ? 's' : ''} fully compliant</span>
          </div>
          <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-500/20 bg-emerald-500/10">Healthy</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
