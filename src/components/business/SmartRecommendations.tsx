import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

      const { data: aiData, error: aiError } = await supabase.functions.invoke('business-recommendations', {
        body: { tasks, projects, workflows }
      });

      if (aiError) {
        setRecommendations([{
          id: '1',
          type: 'suggestion',
          title: 'AI recommendations temporarily unavailable',
          description: 'Using basic analysis mode. AI-powered insights will return shortly.',
        }]);
      } else if (aiData?.recommendations) {
        setRecommendations(aiData.recommendations.map((rec: any, idx: number) => ({
          ...rec,
          id: `ai-${idx}`
        })));
      } else {
        setRecommendations([{
          id: '1',
          type: 'success',
          title: 'All systems running smoothly',
          description: 'Your business operations are on track!'
        }]);
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
      setRecommendations([{
        id: 'error',
        type: 'warning',
        title: 'Unable to generate recommendations',
        description: 'Please try refreshing the page.'
      }]);
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

  const getAccent = (type: string) => {
    switch (type) {
      case 'warning': return 'border-l-destructive';
      case 'success': return 'border-l-emerald-500';
      default: return 'border-l-primary';
    }
  };

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Lightbulb className="h-4 w-4 text-primary" />
          AI Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          <div className="text-center py-6 text-sm text-muted-foreground">
            <Lightbulb className="h-6 w-6 mx-auto mb-2 animate-pulse text-primary" />
            Analyzing your data...
          </div>
        ) : (
          <div className="max-h-[380px] overflow-y-auto pr-1 space-y-2">
            {recommendations.map((rec) => {
              const Icon = getIcon(rec.type);
              return (
                <div
                  key={rec.id}
                  className={`p-3 rounded-lg border border-border border-l-4 ${getAccent(rec.type)} bg-muted/20 hover:bg-muted/40 transition-colors`}
                >
                  <div className="flex items-start gap-2.5">
                    <Icon className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <h4 className="font-medium text-sm text-foreground">{rec.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{rec.description}</p>
                      {rec.actionLabel && (
                        <Badge variant="outline" className="text-xs mt-1">{rec.actionLabel}</Badge>
                      )}
                    </div>
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
