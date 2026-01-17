import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, Loader2, AlertTriangle, Target, Clock, TrendingUp, Sparkles, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { PlannerItem } from "./PlannerItemsTable";

interface AIRecommendation {
  type: 'action' | 'priority' | 'risk' | 'time';
  content: string;
}

interface PlannerAIAssistantProps {
  items: PlannerItem[];
  timeToday: { hours: number; minutes: number };
  timeThisWeek: number;
}

export function PlannerAIAssistant({ items, timeToday, timeThisWeek }: PlannerAIAssistantProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const contextData = {
        items: items.map(i => ({
          name: i.item_name,
          type: i.item_type,
          status: i.status,
          priority: i.priority,
          target_date: i.target_date,
          crm_link: i.crm_contact_name || null,
        })),
        time_today_minutes: timeToday.hours * 60 + timeToday.minutes,
        time_this_week_hours: Math.round(timeThisWeek / 3600),
        current_date: new Date().toISOString().split('T')[0],
      };

      const { data, error } = await supabase.functions.invoke('planner-ai-assistant', {
        body: { prompt, context: contextData }
      });

      if (error) throw error;

      if (data?.recommendations) {
        setRecommendations(data.recommendations);
        
        // Save to history
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('admin_planner_ai_history').insert({
            user_id: user.id,
            prompt,
            response: JSON.stringify(data.recommendations),
            context_data: contextData,
          });
        }
      }
    } catch (error: any) {
      console.error('AI Assistant error:', error);
      toast.error(error.message || 'Failed to get AI recommendations');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'action': return Target;
      case 'priority': return TrendingUp;
      case 'risk': return AlertTriangle;
      case 'time': return Clock;
      default: return Lightbulb;
    }
  };

  const getIconConfig = (type: string) => {
    switch (type) {
      case 'action': return { 
        color: 'text-blue-600 dark:text-blue-400', 
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        border: 'border-blue-200 dark:border-blue-800/30'
      };
      case 'priority': return { 
        color: 'text-purple-600 dark:text-purple-400', 
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        border: 'border-purple-200 dark:border-purple-800/30'
      };
      case 'risk': return { 
        color: 'text-amber-600 dark:text-amber-400', 
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        border: 'border-amber-200 dark:border-amber-800/30'
      };
      case 'time': return { 
        color: 'text-emerald-600 dark:text-emerald-400', 
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        border: 'border-emerald-200 dark:border-emerald-800/30'
      };
      default: return { 
        color: 'text-muted-foreground', 
        bg: 'bg-muted',
        border: 'border-border'
      };
    }
  };

  const quickPrompts = [
    "What should I prioritize today?",
    "Are there any at-risk deadlines?",
    "How can I improve my productivity?",
  ];

  return (
    <Card className="h-full flex flex-col border-border/50 shadow-sm overflow-hidden">
      <CardHeader className="pb-3 border-b bg-gradient-to-r from-violet-50/50 via-purple-50/30 to-background dark:from-violet-950/20 dark:via-purple-950/10 dark:to-background">
        <CardTitle className="flex items-center gap-3 text-base">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="font-semibold">AI Planning Assistant</span>
            <p className="text-xs font-normal text-muted-foreground mt-0.5">
              Get intelligent recommendations
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 p-4">
        {/* Quick Prompts */}
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((qp) => (
            <Button
              key={qp}
              variant="outline"
              size="sm"
              className="text-xs h-7 bg-muted/30 hover:bg-muted/50"
              onClick={() => setPrompt(qp)}
            >
              {qp}
            </Button>
          ))}
        </div>

        {/* Input */}
        <div className="space-y-3">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask for planning suggestions, priority advice, or risk analysis..."
            className="min-h-[80px] resize-none bg-muted/30 border-border/50"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleSubmit();
              }
            }}
          />
          <Button
            onClick={handleSubmit}
            disabled={loading || !prompt.trim()}
            className="w-full gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-500/20"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Get Recommendations
          </Button>
        </div>

        {/* Recommendations */}
        <ScrollArea className="flex-1 min-h-[180px]">
          {recommendations.length > 0 ? (
            <div className="space-y-3">
              {recommendations.map((rec, index) => {
                const Icon = getIcon(rec.type);
                const config = getIconConfig(rec.type);
                return (
                  <div
                    key={index}
                    className={cn(
                      "p-4 rounded-xl border",
                      "flex items-start gap-3 transition-all",
                      config.bg,
                      config.border
                    )}
                  >
                    <div className={cn("p-1.5 rounded-lg", config.bg)}>
                      <Icon className={cn("h-4 w-4 shrink-0", config.color)} />
                    </div>
                    <p className="text-sm leading-relaxed">{rec.content}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 mb-3">
                <Bot className="h-8 w-8 text-violet-600 dark:text-violet-400" />
              </div>
              <p className="text-sm font-medium text-foreground">Ask a question to get started</p>
              <p className="text-xs mt-1 text-muted-foreground max-w-[200px] mx-auto">
                Get AI-powered insights to optimize your workflow and productivity
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
