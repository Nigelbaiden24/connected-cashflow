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
  RefreshCw,
  Bot,
  Zap
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
    { icon: TrendingUp, label: "Performance Analysis", prompt: "Analyze the performance of this fund vs its benchmark and peers", color: "text-emerald-500 bg-emerald-500/10" },
    { icon: Shield, label: "Risk Assessment", prompt: "Assess the risk metrics and suitability for different investor profiles", color: "text-blue-500 bg-blue-500/10" },
    { icon: DollarSign, label: "Cost Analysis", prompt: "Compare the costs to similar funds and evaluate value for money", color: "text-amber-500 bg-amber-500/10" },
    { icon: Lightbulb, label: "Alternatives", prompt: "Suggest alternative funds with similar objectives but potentially better characteristics", color: "text-purple-500 bg-purple-500/10" },
    { icon: FileText, label: "Client Commentary", prompt: "Generate a plain-English summary suitable for a client report", color: "text-chart-2 bg-chart-2/10" },
    { icon: AlertTriangle, label: "Risk Flags", prompt: "Identify any red flags or concerns with this fund", color: "text-red-500 bg-red-500/10" }
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
      <Card className={`${className} border-border/50 bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden`}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.1),transparent_60%)] pointer-events-none" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <span>AI Fund Insights</span>
          </CardTitle>
          <CardDescription>Select a fund to get AI-powered analysis</CardDescription>
        </CardHeader>
        <CardContent className="relative text-center py-16">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center mx-auto mb-6">
            <Bot className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <p className="text-muted-foreground max-w-xs mx-auto">
            Select a fund from the table to unlock AI-powered insights, analysis, and recommendations
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} border-border/50 bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden`}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.1),transparent_60%)] pointer-events-none" />
      <CardHeader className="pb-3 relative border-b border-border/50">
        <CardTitle className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <span className="block">AI Fund Insights</span>
            <span className="text-xs font-normal text-muted-foreground">Powered by GPT-4</span>
          </div>
        </CardTitle>
        <CardDescription className="truncate mt-2 p-2 rounded-lg bg-muted/30 border border-border/50 text-sm">
          <span className="font-medium text-foreground">{fund.name}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4 relative">
        {/* Quick Prompts */}
        <div className="grid grid-cols-2 gap-2">
          {quickPrompts.map((item, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              className="justify-start text-xs h-auto py-2.5 px-3 border-border/50 hover:border-primary/30 hover:bg-primary/5 group transition-all"
              onClick={() => handleSubmit(item.prompt)}
              disabled={isLoading}
            >
              <div className={`h-6 w-6 rounded-md ${item.color} flex items-center justify-center mr-2 group-hover:scale-110 transition-transform`}>
                <item.icon className="h-3.5 w-3.5" />
              </div>
              <span className="truncate">{item.label}</span>
            </Button>
          ))}
        </div>

        {/* Custom Query */}
        <div className="space-y-2.5">
          <Textarea
            placeholder="Ask a custom question about this fund..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-h-[70px] text-sm bg-background border-border/50 focus:border-primary/50 resize-none"
          />
          <Button 
            onClick={() => handleSubmit(query)} 
            disabled={!query.trim() || isLoading}
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Get AI Insight
              </>
            )}
          </Button>
        </div>

        {/* Response */}
        {response && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="gap-1.5 bg-primary/10 text-primary border-0">
                <Sparkles className="h-3 w-3" />
                AI Analysis
              </Badge>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setResponse("")}
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>
            <ScrollArea className="h-[320px] rounded-xl border border-border/50 bg-gradient-to-br from-muted/30 to-muted/10 p-4">
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed">
                {response}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
