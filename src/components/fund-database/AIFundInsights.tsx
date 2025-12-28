import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sparkles, 
  Send, 
  Loader2,
  TrendingUp,
  Shield,
  DollarSign,
  Lightbulb,
  AlertTriangle,
  FileText,
  RefreshCw
} from "lucide-react";
import type { CompleteFund } from "@/types/fund";
import { supabase } from "@/integrations/supabase/client";

interface AIFundInsightsProps {
  fund?: CompleteFund;
  className?: string;
}

export function AIFundInsights({ fund, className }: AIFundInsightsProps) {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const quickPrompts = [
    { icon: TrendingUp, label: "Performance Analysis", prompt: "Analyze the performance of this fund vs its benchmark and peers" },
    { icon: Shield, label: "Risk Assessment", prompt: "Assess the risk metrics and suitability for different investor profiles" },
    { icon: DollarSign, label: "Cost Analysis", prompt: "Compare the costs to similar funds and evaluate value for money" },
    { icon: Lightbulb, label: "Alternative Suggestions", prompt: "Suggest alternative funds with similar objectives but potentially better characteristics" },
    { icon: FileText, label: "Client Commentary", prompt: "Generate a plain-English summary suitable for a client report" },
    { icon: AlertTriangle, label: "Risk Flags", prompt: "Identify any red flags or concerns with this fund" }
  ];

  const handleSubmit = async (promptText: string) => {
    if (!fund) return;
    
    setIsLoading(true);
    setResponse("");
    
    const fullPrompt = `
Fund Analysis Request for: ${fund.name} (${fund.isin})

Fund Details:
- Provider: ${fund.provider}
- Type: ${fund.fundType} (${fund.structure})
- Category: ${fund.category}
- OCF: ${fund.costs.ocf}%
- AUM: $${fund.aum}M
- 1Y Return: ${fund.performance.oneYearReturn}%
- 3Y Return: ${fund.performance.threeYearReturn}%
- Risk Rating: ${fund.risk.srriRating}/7
- Volatility (3Y): ${fund.risk.volatility3Y}%
- Sharpe Ratio (3Y): ${fund.risk.sharpeRatio3Y}
- Max Drawdown: ${fund.risk.maxDrawdown}%
- Benchmark: ${fund.benchmark.primaryBenchmark}

User Query: ${promptText}

Please provide a comprehensive, UK IFA-focused analysis.
    `;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(
        `https://wlsmdcdfyudtvbnbqfmn.supabase.co/functions/v1/financial-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ 
            prompt: fullPrompt,
            category: "fund_analysis"
          }),
        }
      );

      if (!res.ok || !res.body) {
        throw new Error("Failed to get AI response");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              setResponse(prev => prev + content);
            }
          } catch {
            // Continue if JSON parse fails
          }
        }
      }
    } catch (error) {
      console.error("AI insight error:", error);
      setResponse("Unable to generate insights. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!fund) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Fund Insights
          </CardTitle>
          <CardDescription>Select a fund to get AI-powered analysis</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>Select a fund from the list to generate AI insights</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Fund Insights
        </CardTitle>
        <CardDescription className="truncate">
          {fund.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Prompts */}
        <div className="grid grid-cols-2 gap-2">
          {quickPrompts.map((item, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              className="justify-start text-xs h-auto py-2"
              onClick={() => handleSubmit(item.prompt)}
              disabled={isLoading}
            >
              <item.icon className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </Button>
          ))}
        </div>

        {/* Custom Query */}
        <div className="space-y-2">
          <Textarea
            placeholder="Ask a custom question about this fund..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-h-[60px] text-sm"
          />
          <Button 
            onClick={() => handleSubmit(query)} 
            disabled={!query.trim() || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Get AI Insight
              </>
            )}
          </Button>
        </div>

        {/* Response */}
        {response && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="h-3 w-3" />
                AI Analysis
              </Badge>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setResponse("")}
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
            <ScrollArea className="h-[300px] rounded-lg border bg-muted/30 p-4">
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                {response}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
