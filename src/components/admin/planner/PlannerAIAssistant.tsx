import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, Loader2, AlertTriangle, Target, Clock, TrendingUp } from "lucide-react";
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
      default: return Bot;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'action': return 'text-blue-500';
      case 'priority': return 'text-purple-500';
      case 'risk': return 'text-amber-500';
      case 'time': return 'text-emerald-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="p-1.5 rounded-md bg-gradient-to-br from-violet-500 to-purple-600">
            <Bot className="h-4 w-4 text-white" />
          </div>
          Planner AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Input */}
        <div className="space-y-2">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask for planning suggestions, priority advice, or risk analysis..."
            className="min-h-[80px] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleSubmit();
              }
            }}
          />
          <Button
            onClick={handleSubmit}
            disabled={loading || !prompt.trim()}
            className="w-full gap-2"
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
        <ScrollArea className="flex-1 min-h-[200px]">
          {recommendations.length > 0 ? (
            <div className="space-y-3">
              {recommendations.map((rec, index) => {
                const Icon = getIcon(rec.type);
                return (
                  <div
                    key={index}
                    className={cn(
                      "p-3 rounded-lg border bg-muted/30",
                      "flex items-start gap-3"
                    )}
                  >
                    <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", getIconColor(rec.type))} />
                    <p className="text-sm leading-relaxed">{rec.content}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Ask a question to get AI-powered planning insights</p>
              <p className="text-xs mt-1 opacity-70">
                Tip: Try "What should I prioritize today?"
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
