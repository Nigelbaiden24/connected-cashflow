import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

  const getHealthBadge = (health: string) => {
    switch (health) {
      case 'on-track':
        return <Badge className="bg-green-600">🟢 On Track</Badge>;
      case 'at-risk':
        return <Badge className="bg-yellow-600">🟡 At Risk</Badge>;
      case 'behind':
        return <Badge className="bg-red-600">🔴 Behind</Badge>;
      case 'completed':
        return <Badge className="bg-blue-600">⚪ Completed</Badge>;
      default:
        return <Badge variant="outline">⚪ Planned</Badge>;
    }
  };

  const healthCounts = {
    'on-track': projects.filter(p => p.health_status === 'on-track').length,
    'at-risk': projects.filter(p => p.health_status === 'at-risk').length,
    'behind': projects.filter(p => p.health_status === 'behind').length,
    'completed': projects.filter(p => p.health_status === 'completed').length,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Health Summary</CardTitle>
        <CardDescription>Traffic-light view of all projects</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Health Summary */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-green-50">
            <div className="text-2xl font-bold text-green-600">{healthCounts['on-track']}</div>
            <div className="text-xs text-muted-foreground">On Track</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-yellow-50">
            <div className="text-2xl font-bold text-yellow-600">{healthCounts['at-risk']}</div>
            <div className="text-xs text-muted-foreground">At Risk</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-red-50">
            <div className="text-2xl font-bold text-red-600">{healthCounts['behind']}</div>
            <div className="text-xs text-muted-foreground">Behind</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-blue-50">
            <div className="text-2xl font-bold text-blue-600">{healthCounts['completed']}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
        </div>

        {/* Project List */}
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="text-sm text-muted-foreground">No projects yet</div>
        ) : (
          <div className="space-y-4">
            {projects.slice(0, 6).map((project) => (
              <div key={project.id} className="p-4 rounded-lg border bg-muted/20 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{project.project_name}</h4>
                    <p className="text-xs text-muted-foreground">Status: {project.status}</p>
                  </div>
                  {getHealthBadge(project.health_status)}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Progress</span>
                    <span className="font-medium">{project.completion_percentage}%</span>
                  </div>
                  <Progress value={project.completion_percentage} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
