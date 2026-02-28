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

      const { data: tasks } = await supabase
        .from('advisor_tasks')
        .select('status, priority')
        .eq('user_id', user.user.id)
        .eq('task_type', 'compliance');

      const { data: docs } = await supabase
        .from('client_compliance_documents')
        .select('status, expiry_date');

      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const dueSoon = docs?.filter(d => 
        d.expiry_date && new Date(d.expiry_date) <= thirtyDaysFromNow
      ).length || 0;

      const atRisk = tasks?.filter(t => 
        t.status === 'overdue' || t.priority === 'urgent'
      ).length || 0;

      const totalItems = (tasks?.length || 0) + (docs?.length || 0);
      const compliantItems = (tasks?.filter(t => t.status === 'completed').length || 0) +
                            (docs?.filter(d => d.status === 'approved').length || 0);
      
      const score = totalItems > 0 ? Math.round((compliantItems / totalItems) * 100) : 100;
      
      let status: 'compliant' | 'warning' | 'critical' = 'compliant';
      if (score < 70 || atRisk > 0) status = 'critical';
      else if (score < 90 || dueSoon > 0) status = 'warning';

      setComplianceScore({
        score,
        status,
        dueItems: dueSoon,
        atRisk
      });
    } catch (error) {
      console.error('Error fetching compliance health:', error);
    }
  };

  const getStatusDetails = () => {
    switch (complianceScore.status) {
      case 'compliant':
        return {
          icon: CheckCircle,
          ringColor: 'text-emerald-500',
          badgeClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
          label: 'Fully Compliant',
          bgGlow: 'bg-emerald-500/5',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          ringColor: 'text-amber-500',
          badgeClass: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
          label: `${complianceScore.dueItems} Item${complianceScore.dueItems !== 1 ? 's' : ''} Due Soon`,
          bgGlow: 'bg-amber-500/5',
        };
      case 'critical':
        return {
          icon: AlertTriangle,
          ringColor: 'text-destructive',
          badgeClass: 'bg-destructive/10 text-destructive border-destructive/20',
          label: `${complianceScore.atRisk} At-Risk Item${complianceScore.atRisk !== 1 ? 's' : ''}`,
          bgGlow: 'bg-destructive/5',
        };
      default:
        return {
          icon: Shield,
          ringColor: 'text-muted-foreground',
          badgeClass: '',
          label: 'Unknown',
          bgGlow: 'bg-muted/5',
        };
    }
  };

  const status = getStatusDetails();
  const Icon = status.icon;

  return (
    <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-xl">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          Compliance Health Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-4 relative">
          <div>
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" strokeWidth="8" className="stroke-muted/30" />
                <circle 
                  cx="60" cy="60" r="52" fill="none" strokeWidth="8" 
                  className={`${status.ringColor} transition-all duration-1000`}
                  style={{ 
                    stroke: 'currentColor',
                    strokeDasharray: `${(complianceScore.score / 100) * 327} 327`,
                    strokeLinecap: 'round',
                  }} 
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold tracking-tight">{complianceScore.score}%</span>
              </div>
            </div>
            <Badge className={`${status.badgeClass} text-xs`}>
              <Icon className="h-3 w-3 mr-1" />
              {status.label}
            </Badge>
          </div>

          {complianceScore.status !== 'compliant' && (
            <div className="space-y-2 text-sm text-left">
              {complianceScore.dueItems > 0 && (
                <div className="flex justify-between p-3 rounded-xl bg-muted/20 backdrop-blur-sm border border-border/50">
                  <span className="text-muted-foreground">Documents expiring soon</span>
                  <span className="font-medium">{complianceScore.dueItems}</span>
                </div>
              )}
              {complianceScore.atRisk > 0 && (
                <div className="flex justify-between p-3 rounded-xl bg-muted/20 backdrop-blur-sm border border-border/50">
                  <span className="text-muted-foreground">Overdue compliance tasks</span>
                  <span className="font-medium">{complianceScore.atRisk}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
