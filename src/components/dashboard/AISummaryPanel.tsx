import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, RefreshCw, TrendingUp, Calendar, FileText, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function AISummaryPanel() {
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [highlights, setHighlights] = useState<Array<{ icon: any; text: string; type: string }>>([]);

  useEffect(() => {
    generateSummary();
  }, []);

  const generateSummary = async () => {
    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Fetch today's data
      const today = new Date().toISOString().split('T')[0];
      
      const [meetings, tasks, alerts, clients] = await Promise.all([
        supabase.from('advisor_tasks').select('*').eq('user_id', user.user.id).eq('task_type', 'meeting').gte('due_date', today).limit(10),
        supabase.from('advisor_tasks').select('*').eq('user_id', user.user.id).in('status', ['pending', 'overdue']).limit(10),
        supabase.from('advisor_alerts').select('*').eq('user_id', user.user.id).eq('is_read', false).limit(10),
        supabase.from('client_risk_assessments').select('risk_level').eq('risk_level', 'high')
      ]);

      const todayMeetings = meetings.data?.length || 0;
      const pendingDocs = tasks.data?.filter(t => t.task_type === 'document_review').length || 0;
      const highRiskClients = clients.data?.length || 0;
      const criticalAlerts = alerts.data?.filter(a => a.severity === 'critical').length || 0;

      // Generate AI-style summary
      const summaryParts = [];
      if (todayMeetings > 0) summaryParts.push(`${todayMeetings} upcoming meeting${todayMeetings > 1 ? 's' : ''}`);
      if (pendingDocs > 0) summaryParts.push(`${pendingDocs} document${pendingDocs > 1 ? 's' : ''} needing review`);
      if (criticalAlerts > 0) summaryParts.push(`${criticalAlerts} critical alert${criticalAlerts > 1 ? 's' : ''}`);

      const summaryText = summaryParts.length > 0
        ? `Today you have ${summaryParts.join(', ')}.`
        : "Your dashboard is clear. Great job staying on top of everything!";

      const newHighlights = [];
      if (todayMeetings > 0) newHighlights.push({ icon: Calendar, text: `${todayMeetings} meetings today`, type: 'info' });
      if (pendingDocs > 0) newHighlights.push({ icon: FileText, text: `${pendingDocs} documents pending`, type: 'warning' });
      if (highRiskClients > 0) newHighlights.push({ icon: AlertCircle, text: `${highRiskClients} high-risk portfolios`, type: 'critical' });
      if (criticalAlerts === 0 && pendingDocs === 0) newHighlights.push({ icon: TrendingUp, text: 'All systems normal', type: 'success' });

      setSummary(summaryText);
      setHighlights(newHighlights);
    } catch (error) {
      console.error('Error generating summary:', error);
      setSummary("Unable to generate summary at this time.");
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-destructive bg-destructive/10';
      case 'warning': return 'border-warning bg-warning/10';
      case 'success': return 'border-success bg-success/10';
      default: return 'border-primary bg-primary/10';
    }
  };

  return (
    <Card className="col-span-full border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Daily Snapshot
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={generateSummary}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-lg font-medium">{summary}</div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {highlights.map((highlight, i) => {
            const Icon = highlight.icon;
            return (
              <div
                key={i}
                className={`flex items-center gap-2 p-3 rounded-lg border ${getTypeColor(highlight.type)}`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{highlight.text}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
