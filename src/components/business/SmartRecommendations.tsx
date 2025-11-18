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

      // Call AI function for smart recommendations
      const { data: aiData, error: aiError } = await supabase.functions.invoke('business-recommendations', {
        body: { tasks, projects, workflows }
      });

      if (aiError) {
        console.error('AI recommendations error:', aiError);
        // Fallback to basic recommendations
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

  const getVariant = (type: string): "default" | "secondary" | "destructive" => {
    switch (type) {
      case 'warning': return 'destructive';
      case 'success': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="h-5 w-5 text-primary" />
          AI Smart Recommendations
        </CardTitle>
        <CardDescription className="text-xs">Intelligent insights powered by AI analytics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          <div className="text-center py-6 text-sm text-muted-foreground">
            <Lightbulb className="h-8 w-8 mx-auto mb-2 animate-pulse text-primary" />
            Analyzing your business data with AI...
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto pr-1 space-y-2">
            {recommendations.map((rec) => {
              const Icon = getIcon(rec.type);
              return (
                <div
                  key={rec.id}
                  className="p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Icon className="h-4 w-4 mt-0.5 shrink-0 flex-shrink-0" />
                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="font-medium text-sm leading-tight break-words">{rec.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed break-words">{rec.description}</p>
                      {rec.actionLabel && (
                        <Badge variant={getVariant(rec.type)} className="text-xs mt-1">
                          {rec.actionLabel}
                        </Badge>
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
