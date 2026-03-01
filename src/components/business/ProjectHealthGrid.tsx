import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Project {
  id: string;
  project_name: string;
  health_status: string;
  completion_percentage: number;
  status: string;
}

export function ProjectHealthGrid() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return;

      const { data } = await supabase
        .from('business_projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'on-track': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'at-risk': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'behind': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'completed': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getHealthLabel = (health: string) => {
    switch (health) {
      case 'on-track': return 'On Track';
      case 'at-risk': return 'At Risk';
      case 'behind': return 'Behind';
      case 'completed': return 'Done';
      default: return 'Planned';
    }
  };

  const healthCounts = {
    'on-track': projects.filter(p => p.health_status === 'on-track').length,
    'at-risk': projects.filter(p => p.health_status === 'at-risk').length,
    'behind': projects.filter(p => p.health_status === 'behind').length,
    'completed': projects.filter(p => p.health_status === 'completed').length,
  };

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Project Health</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Health Summary */}
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(healthCounts).map(([key, count]) => (
            <div key={key} className={`text-center p-2.5 rounded-lg border ${getHealthColor(key)}`}>
              <div className="text-xl font-bold">{count}</div>
              <div className="text-xs">{getHealthLabel(key)}</div>
            </div>
          ))}
        </div>

        {/* Project List */}
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4">No projects yet</div>
        ) : (
          <div className="space-y-2">
            {projects.slice(0, 6).map((project) => (
              <div key={project.id} className="p-3 rounded-lg border border-border bg-muted/20 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-foreground truncate">{project.project_name}</h4>
                    <p className="text-xs text-muted-foreground">Status: {project.status}</p>
                  </div>
                  <Badge variant="outline" className={`text-xs ${getHealthColor(project.health_status)}`}>
                    {getHealthLabel(project.health_status)}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{project.completion_percentage}%</span>
                  </div>
                  <Progress value={project.completion_percentage} className="h-1.5" />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
