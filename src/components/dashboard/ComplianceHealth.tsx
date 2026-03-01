import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function ComplianceHealth() {
  const [complianceScore, setComplianceScore] = useState({
    score: 0,
    status: 'unknown' as 'compliant' | 'warning' | 'critical' | 'unknown',
    dueItems: 0,
    atRisk: 0
  });

  useEffect(() => {
    fetchComplianceHealth();
  }, []);

  const fetchComplianceHealth = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data: tasks } = await supabase.from('advisor_tasks').select('status, priority').eq('user_id', user.user.id).eq('task_type', 'compliance');
      const { data: docs } = await supabase.from('client_compliance_documents').select('status, expiry_date');

      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const dueSoon = docs?.filter(d => d.expiry_date && new Date(d.expiry_date) <= thirtyDaysFromNow).length || 0;
      const atRisk = tasks?.filter(t => t.status === 'overdue' || t.priority === 'urgent').length || 0;
      const totalItems = (tasks?.length || 0) + (docs?.length || 0);
      const compliantItems = (tasks?.filter(t => t.status === 'completed').length || 0) + (docs?.filter(d => d.status === 'approved').length || 0);
      const score = totalItems > 0 ? Math.round((compliantItems / totalItems) * 100) : 100;
      
      let status: 'compliant' | 'warning' | 'critical' = 'compliant';
      if (score < 70 || atRisk > 0) status = 'critical';
      else if (score < 90 || dueSoon > 0) status = 'warning';

      setComplianceScore({ score, status, dueItems: dueSoon, atRisk });
    } catch (error) {
      console.error('Error fetching compliance health:', error);
    }
  };

  const getStatusDetails = () => {
    switch (complianceScore.status) {
      case 'compliant': return { icon: CheckCircle, color: 'text-emerald-500', strokeColor: 'stroke-emerald-500', label: 'Fully Compliant', badgeClass: 'text-emerald-600 border-emerald-500/20 bg-emerald-500/10' };
      case 'warning': return { icon: AlertTriangle, color: 'text-amber-500', strokeColor: 'stroke-amber-500', label: `${complianceScore.dueItems} Due Soon`, badgeClass: 'text-amber-600 border-amber-500/20 bg-amber-500/10' };
      case 'critical': return { icon: AlertTriangle, color: 'text-destructive', strokeColor: 'stroke-destructive', label: `${complianceScore.atRisk} At Risk`, badgeClass: 'text-destructive border-destructive/20 bg-destructive/10' };
      default: return { icon: Shield, color: 'text-muted-foreground', strokeColor: 'stroke-muted-foreground', label: 'Unknown', badgeClass: '' };
    }
  };

  const status = getStatusDetails();
  const Icon = status.icon;

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Shield className="h-4 w-4 text-primary" />
          Compliance Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          {/* Circular gauge */}
          <div className="relative w-24 h-24 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" strokeWidth="8" className="stroke-muted/30" />
              <circle 
                cx="60" cy="60" r="52" fill="none" strokeWidth="8" 
                className={`${status.strokeColor} transition-all duration-1000`}
                style={{ 
                  stroke: 'currentColor',
                  strokeDasharray: `${(complianceScore.score / 100) * 327} 327`,
                  strokeLinecap: 'round',
                }} 
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold">{complianceScore.score}%</span>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <Badge variant="outline" className={`text-xs ${status.badgeClass}`}>
              <Icon className="h-3 w-3 mr-1" />
              {status.label}
            </Badge>

            {complianceScore.dueItems > 0 && (
              <div className="flex justify-between text-sm p-2 rounded-lg bg-muted/20 border border-border">
                <span className="text-muted-foreground">Expiring soon</span>
                <span className="font-medium">{complianceScore.dueItems}</span>
              </div>
            )}
            {complianceScore.atRisk > 0 && (
              <div className="flex justify-between text-sm p-2 rounded-lg bg-muted/20 border border-border">
                <span className="text-muted-foreground">Overdue tasks</span>
                <span className="font-medium">{complianceScore.atRisk}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
