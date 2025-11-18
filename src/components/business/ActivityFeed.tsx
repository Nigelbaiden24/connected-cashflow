import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, FileText, MessageSquare, Zap, TrendingUp, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Activity {
  id: string;
  activity_type: string;
  title: string;
  description: string;
  created_at: string;
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('activity-feed')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'business_activity_feed' 
      }, (payload) => {
        setActivities(prev => [payload.new as Activity, ...prev].slice(0, 20));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchActivities = async () => {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return;

      const { data } = await supabase
        .from('business_activity_feed')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'task_created': return CheckCircle;
      case 'task_completed': return CheckCircle;
      case 'document_uploaded': return FileText;
      case 'comment_added': return MessageSquare;
      case 'workflow_triggered': return Zap;
      case 'ai_insight': return TrendingUp;
      default: return AlertCircle;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'task_completed': return 'text-green-600';
      case 'task_created': return 'text-blue-600';
      case 'workflow_triggered': return 'text-yellow-600';
      case 'ai_insight': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Team Activity Feed</span>
          <Badge variant="secondary" className="animate-pulse">Live</Badge>
        </CardTitle>
        <CardDescription>Real-time team updates and changes</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading activities...</div>
          ) : activities.length === 0 ? (
            <div className="text-sm text-muted-foreground">No recent activity</div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => {
                const Icon = getIcon(activity.activity_type);
                const color = getColor(activity.activity_type);
                
                return (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <Icon className={`h-5 w-5 mt-0.5 ${color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatTime(activity.created_at)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
