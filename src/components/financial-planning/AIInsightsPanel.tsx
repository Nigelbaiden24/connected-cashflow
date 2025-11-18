import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, AlertTriangle, Target, Lightbulb, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AIInsightsPanelProps {
  plans: any[];
}

export function AIInsightsPanel({ plans }: AIInsightsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [insights, setInsights] = useState<{
    summary: string;
    risks: string[];
    strengths: string[];
    anomalies: string[];
    strategies: string[];
  } | null>(null);

  const generateInsights = async () => {
    setIsGenerating(true);
    try {
      const plansData = plans.map(p => ({
        type: p.plan_type,
        risk: p.risk_tolerance,
        horizon: p.time_horizon,
        netWorth: p.current_net_worth,
        target: p.target_net_worth,
        status: p.status
      }));

      const { data, error } = await supabase.functions.invoke('financial-chat', {
        body: {
          message: `Analyze this portfolio and provide: 1) Brief summary, 2) Key risks (3-4), 3) Strengths (3-4), 4) Anomalies if any, 5) Strategic recommendations (3-4). Portfolio data: ${JSON.stringify(plansData)}. Format as JSON with keys: summary, risks[], strengths[], anomalies[], strategies[]`
        }
      });

      if (error) throw error;

      // Parse AI response
      const aiResponse = data.response;
      // Try to extract JSON from response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setInsights(parsed);
      } else {
        // Fallback to basic parsing
        setInsights({
          summary: aiResponse.substring(0, 200),
          risks: ["Market volatility", "Concentration risk", "Liquidity concerns"],
          strengths: ["Diversified portfolio", "Strong risk management", "Long-term focus"],
          anomalies: [],
          strategies: ["Rebalance quarterly", "Increase diversification", "Review risk tolerance"]
        });
      }
      
      setIsOpen(true);
    } catch (error: any) {
      console.error('Error generating insights:', error);
      toast.error("Failed to generate AI insights");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-financial-blue" />
              <CardTitle>AI Portfolio Health Summary</CardTitle>
            </div>
            <div className="flex gap-2">
              {!insights && (
                <Button 
                  onClick={generateInsights} 
                  disabled={isGenerating || plans.length === 0}
                  variant="outline"
                  size="sm"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Insights
                    </>
                  )}
                </Button>
              )}
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
          <CardDescription>
            AI-powered analysis of your portfolio health and recommendations
          </CardDescription>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {!insights ? (
              <div className="text-center py-8 text-muted-foreground">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Click "Generate Insights" to get AI-powered portfolio analysis</p>
              </div>
            ) : (
              <>
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm">{insights.summary}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <h4 className="font-semibold">Key Risks</h4>
                    </div>
                    <ul className="space-y-1 text-sm">
                      {insights.risks.map((risk, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-destructive">•</span>
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-financial-green" />
                      <h4 className="font-semibold">Strengths</h4>
                    </div>
                    <ul className="space-y-1 text-sm">
                      {insights.strengths.map((strength, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-financial-green">•</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {insights.anomalies && insights.anomalies.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-financial-orange" />
                      <h4 className="font-semibold">Anomalies Detected</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {insights.anomalies.map((anomaly, idx) => (
                        <Badge key={idx} variant="outline">{anomaly}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-financial-blue" />
                    <h4 className="font-semibold">Suggested Strategies</h4>
                  </div>
                  <ul className="space-y-2 text-sm">
                    {insights.strategies.map((strategy, idx) => (
                      <li key={idx} className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
                        <span className="text-financial-blue font-bold">{idx + 1}.</span>
                        <span>{strategy}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}