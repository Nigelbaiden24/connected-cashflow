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

      // Fetch compliance-related tasks
      const { data: tasks } = await supabase
        .from('advisor_tasks')
        .select('status, priority')
        .eq('user_id', user.user.id)
        .eq('task_type', 'compliance');

      // Fetch client compliance documents
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

      // Calculate compliance score (simple algorithm)
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
          color: 'bg-success/10 border-success/20',
          badgeVariant: 'default' as const,
          badgeClass: 'bg-success text-success-foreground',
          label: 'Fully Compliant'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          color: 'bg-warning/10 border-warning/20',
          badgeVariant: 'secondary' as const,
          badgeClass: 'bg-warning text-warning-foreground',
          label: `${complianceScore.dueItems} Item${complianceScore.dueItems !== 1 ? 's' : ''} Due Soon`
        };
      case 'critical':
        return {
          icon: AlertTriangle,
          color: 'bg-destructive/10 border-destructive/20',
          badgeVariant: 'destructive' as const,
          badgeClass: '',
          label: `${complianceScore.atRisk} At-Risk Item${complianceScore.atRisk !== 1 ? 's' : ''}`
        };
      default:
        return {
          icon: Shield,
          color: 'bg-muted/10 border-muted/20',
          badgeVariant: 'outline' as const,
          badgeClass: '',
          label: 'Unknown'
        };
    }
  };

  const status = getStatusDetails();
  const Icon = status.icon;

  return (
    <Card className={`border ${status.color}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Compliance Health Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-4">
          <div>
            <div className="text-6xl font-bold mb-2">{complianceScore.score}%</div>
            <Badge variant={status.badgeVariant} className={status.badgeClass}>
              <Icon className="h-3 w-3 mr-1" />
              {status.label}
            </Badge>
          </div>

          {complianceScore.status !== 'compliant' && (
            <div className="space-y-2 text-sm text-left">
              {complianceScore.dueItems > 0 && (
                <div className="flex justify-between p-2 rounded bg-muted">
                  <span>Documents expiring soon</span>
                  <span className="font-medium">{complianceScore.dueItems}</span>
                </div>
              )}
              {complianceScore.atRisk > 0 && (
                <div className="flex justify-between p-2 rounded bg-muted">
                  <span>Overdue compliance tasks</span>
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
