import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Brain, Send, Loader2, TrendingUp, Shield, BarChart3, FileText, Lightbulb, Sparkles } from "lucide-react";
import { useAIAnalyst } from "@/hooks/useAIAnalyst";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

export default function FinanceAIAnalyst() {
  const [query, setQuery] = useState("");
  const [company, setCompany] = useState("");
  const [response, setResponse] = useState("");
  const [activeTab, setActiveTab] = useState("fundamental");
  const { analyzeWithAI, isLoading } = useAIAnalyst("investment");
  const { toast } = useToast();

  const quickPrompts: Record<string, string[]> = {
    fundamental: [
      "Analyze the financial health and key metrics",
      "Evaluate the competitive moat and market position",
      "Review management quality and capital allocation",
      "Assess valuation multiples vs peers"
    ],
    technical: [
      "Identify key support and resistance levels",
      "Analyze volume trends and momentum indicators",
      "Evaluate moving average crossovers",
      "Chart pattern recognition and targets"
    ],
    risk: [
      "Assess volatility and drawdown risk",
      "Evaluate sector and market correlation",
      "Analyze liquidity and concentration risk",
      "Stress test under adverse scenarios"
    ],
    esg: [
      "Evaluate environmental sustainability practices",
      "Review social responsibility metrics",
      "Assess governance and board structure",
      "Compare ESG scores vs industry peers"
    ]
  };

  const analysisCategories = [
    { id: "fundamental", title: "Fundamental Analysis", icon: BarChart3, color: "text-blue-500" },
    { id: "technical", title: "Technical Analysis", icon: TrendingUp, color: "text-green-500" },
    { id: "risk", title: "Risk Assessment", icon: Shield, color: "text-red-500" },
    { id: "esg", title: "ESG Analysis", icon: Lightbulb, color: "text-yellow-500" }
  ];

  const handleAnalyze = async () => {
    if (!query.trim()) {
      toast({ title: "Error", description: "Please enter a query", variant: "destructive" });
      return;
    }

    const fullQuery = company 
      ? `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} analysis for ${company}: ${query}`
      : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} analysis: ${query}`;

    setResponse("");
    analyzeWithAI(fullQuery, {
      onDelta: (chunk: string) => setResponse(prev => prev + chunk),
      onDone: () => toast({ title: "Analysis Complete" }),
      onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" })
    });
  };

  const handleQuickPrompt = (prompt: string) => {
    setQuery(prompt);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          AI Analyst
        </h1>
        <p className="text-muted-foreground mt-2">Advanced AI-powered investment analysis for wealth advisors</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          {analysisCategories.map((cat) => (
            <TabsTrigger key={cat.id} value={cat.id} className="gap-2">
              <cat.icon className={`h-4 w-4 ${cat.color}`} />
              <span className="hidden sm:inline">{cat.title.split(" ")[0]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {analysisCategories.map((cat) => (
          <TabsContent key={cat.id} value={cat.id}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <cat.icon className={`h-5 w-5 ${cat.color}`} />
                  {cat.title}
                </CardTitle>
                <CardDescription>
                  Get AI-powered {cat.title.toLowerCase()} insights for your investment decisions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Company / Ticker (Optional)</label>
                    <Input
                      placeholder="e.g., AAPL or Apple Inc."
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Your Question</label>
                  <Textarea
                    placeholder={`Ask about ${cat.title.toLowerCase()}...`}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground">Quick prompts:</span>
                  {quickPrompts[cat.id].map((prompt, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => handleQuickPrompt(prompt)}
                    >
                      {prompt.substring(0, 30)}...
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAnalyze} disabled={isLoading} className="gap-2">
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    Generate Analysis
                  </Button>
                  <Button variant="outline" onClick={() => { setQuery(""); setResponse(""); }}>
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Response */}
      {response && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{response}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Capabilities */}
      <Card>
        <CardHeader>
          <CardTitle>AI Analyst Capabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {analysisCategories.map((cat) => (
              <div key={cat.id} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <cat.icon className={`h-6 w-6 ${cat.color} flex-shrink-0`} />
                <div>
                  <h4 className="font-medium">{cat.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {cat.id === "fundamental" && "Deep dive into financials, valuations, and competitive positioning"}
                    {cat.id === "technical" && "Chart patterns, indicators, and price momentum analysis"}
                    {cat.id === "risk" && "Portfolio risk metrics, correlations, and stress testing"}
                    {cat.id === "esg" && "Environmental, social, and governance scoring"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
