import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, DollarSign, Users, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Goal { goal_type: string; target_value: number; current_value: number; }

export function AdvisorGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => { fetchGoals(); }, []);

  const fetchGoals = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;
      const now = new Date();
      const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      const { data, error } = await supabase.from('advisor_goals').select('*').eq('user_id', user.user.id).eq('status', 'active').gte('period_start', quarterStart.toISOString().split('T')[0]);
      if (error) throw error;
      setGoals(data || []);
    } catch (error) { console.error('Error fetching goals:', error); }
  };

  const getGoalIcon = (type: string) => { switch (type) { case 'aum_target': return DollarSign; case 'new_clients': return Users; case 'revenue': return TrendingUp; default: return Target; } };
  const getGoalLabel = (type: string) => { switch (type) { case 'aum_target': return 'AUM Target'; case 'new_clients': return 'New Clients'; case 'revenue': return 'Fee Revenue'; default: return type; } };
  const formatValue = (type: string, value: number) => {
    if (type === 'aum_target' || type === 'revenue') return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
    return value.toString();
  };

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Target className="h-4 w-4 text-primary" />
          Quarterly Goals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {goals.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Target className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No active goals</p>
          </div>
        ) : goals.map((goal, i) => {
          const Icon = getGoalIcon(goal.goal_type);
          const progress = Math.min((goal.current_value / goal.target_value) * 100, 100);
          return (
            <div key={i} className="space-y-1.5 p-3 rounded-lg border border-border bg-muted/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  <span className="font-medium text-sm">{getGoalLabel(goal.goal_type)}</span>
                </div>
                <span className="text-xs text-muted-foreground">{formatValue(goal.goal_type, goal.current_value)} / {formatValue(goal.goal_type, goal.target_value)}</span>
              </div>
              <Progress value={progress} className="h-1.5" />
              <div className="text-xs text-muted-foreground text-right">{progress.toFixed(0)}%</div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
