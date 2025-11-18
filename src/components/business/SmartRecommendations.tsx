import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Recommendation {
  id: string;
  type: 'warning' | 'suggestion' | 'success';
  title: string;
  description: string;
  actionLabel?: string;
}

export function SmartRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateRecommendations();
  }, []);

  const generateRecommendations = async () => {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return;

      const [tasksRes, projectsRes, workflowsRes] = await Promise.all([
        supabase.from('business_tasks').select('*').eq('user_id', userId),
        supabase.from('business_projects').select('*').eq('user_id', userId),
        supabase.from('business_workflows').select('*').eq('user_id', userId)
      ]);

      const tasks = tasksRes.data || [];
      const projects = projectsRes.data || [];
      const workflows = workflowsRes.data || [];
      
      const recs: Recommendation[] = [];

      // Check for unassigned tasks
      const unassignedTasks = tasks.filter(t => !t.assigned_to && t.status !== 'completed');
      if (unassignedTasks.length > 0) {
        recs.push({
          id: '1',
          type: 'warning',
          title: `${unassignedTasks.length} tasks have no assignee`,
          description: 'Would you like to auto-distribute them based on workload?',
          actionLabel: 'Auto-Assign'
        });
      }

      // Check for at-risk projects
      const atRiskProjects = projects.filter(p => p.health_status === 'at-risk' || p.health_status === 'behind');
      if (atRiskProjects.length > 0) {
        recs.push({
          id: '2',
          type: 'warning',
          title: `${atRiskProjects.length} projects are running behind`,
          description: 'Based on current task velocity, consider adjusting timelines or resources',
          actionLabel: 'View Projects'
        });
      }

      // Check for inactive workflows
      const inactiveWorkflows = workflows.filter(w => {
        if (!w.last_run_at) return true;
        const daysSinceRun = (Date.now() - new Date(w.last_run_at).getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceRun > 12;
      });
      
      if (inactiveWorkflows.length > 0) {
        recs.push({
          id: '3',
          type: 'suggestion',
          title: `${inactiveWorkflows.length} workflows haven't run recently`,
          description: 'These automations may need review or deactivation',
          actionLabel: 'Review Workflows'
        });
      }

      // Success message if everything is good
      if (recs.length === 0) {
        recs.push({
          id: '4',
          type: 'success',
          title: 'All systems running smoothly',
          description: 'Your projects and workflows are on track. Keep up the great work!'
        });
      }

      setRecommendations(recs);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return AlertTriangle;
      case 'success': return CheckCircle;
      default: return TrendingUp;
    }
  };

  const getVariant = (type: string): "default" | "secondary" | "destructive" => {
    switch (type) {
      case 'warning': return 'destructive';
      case 'success': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-purple-600" />
          AI Smart Recommendations
        </CardTitle>
        <CardDescription>AI-powered insights based on your workload</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-muted-foreground">Analyzing workspace...</div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec) => {
              const Icon = getIcon(rec.type);
              
              return (
                <div key={rec.id} className="flex items-start gap-3 p-4 rounded-lg border bg-background">
                  <Icon className={`h-5 w-5 mt-0.5 ${
                    rec.type === 'warning' ? 'text-destructive' : 
                    rec.type === 'success' ? 'text-green-600' : 
                    'text-primary'
                  }`} />
                  <div className="flex-1 space-y-2">
                    <div>
                      <p className="font-medium text-sm">{rec.title}</p>
                      <p className="text-xs text-muted-foreground">{rec.description}</p>
                    </div>
                    {rec.actionLabel && (
                      <Button size="sm" variant={getVariant(rec.type)}>
                        {rec.actionLabel}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
