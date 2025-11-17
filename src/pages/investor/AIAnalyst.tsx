import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, AlertCircle, Sparkles } from "lucide-react";
import { useState } from "react";

export default function AIAnalyst() {
  const [query, setQuery] = useState("");

  const aiCapabilities = [
    {
      title: "Portfolio Analysis",
      description: "Get AI-powered insights on your portfolio composition and risk factors",
      icon: TrendingUp,
    },
    {
      title: "Market Predictions",
      description: "Access machine learning models for trend analysis and forecasting",
      icon: Brain,
    },
    {
      title: "Risk Assessment",
      description: "Identify potential risks and vulnerabilities in your investment strategy",
      icon: AlertCircle,
    },
    {
      title: "Smart Recommendations",
      description: "Receive personalized investment recommendations based on your goals",
      icon: Sparkles,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Analyst</h1>
        <p className="text-muted-foreground mt-2">Your intelligent investment assistant powered by advanced AI</p>
      </div>

      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Ask the AI Analyst
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Ask about market trends, portfolio analysis, investment opportunities, or any financial question..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-h-[120px]"
          />
          <div className="flex gap-2">
            <Button className="flex-1">
              <Sparkles className="h-4 w-4 mr-2" />
              Analyze
            </Button>
            <Button variant="outline" onClick={() => setQuery("")}>Clear</Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4">AI Capabilities</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {aiCapabilities.map((capability) => (
            <Card key={capability.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <capability.icon className="h-5 w-5 text-primary" />
                  {capability.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{capability.description}</p>
                <Button variant="outline" className="w-full mt-4" size="sm">Try Now</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent AI Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { insight: "Tech sector showing strong momentum", confidence: "High", date: "2 hours ago" },
            { insight: "Emerging markets presenting opportunities", confidence: "Medium", date: "5 hours ago" },
            { insight: "Crypto market volatility increasing", confidence: "High", date: "1 day ago" },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <p className="font-medium">{item.insight}</p>
                <p className="text-sm text-muted-foreground">{item.date}</p>
              </div>
              <Badge variant={item.confidence === "High" ? "default" : "secondary"}>
                {item.confidence} Confidence
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
