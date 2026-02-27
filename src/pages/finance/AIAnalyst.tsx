import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, TrendingUp, FileText, MessageSquare, Target, DollarSign, Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAIAnalyst } from "@/hooks/useAIAnalyst";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import { StarryBackground } from "@/components/showcase/StarryBackground";

export default function FinanceAIAnalyst() {
  const [query, setQuery] = useState("");
  const [company, setCompany] = useState("");
  const [response, setResponse] = useState("");
  const [analysisType, setAnalysisType] = useState("company-qa");
  const { toast } = useToast();

  const { analyzeWithAI, isLoading } = useAIAnalyst({
    onDelta: (text) => {
      setResponse((prev) => prev + text);
    },
    onDone: () => {
      toast({
        title: "Analysis Complete",
        description: "AI analysis has been generated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    },
  });

  const handleAnalyze = async () => {
    if (!query.trim() && analysisType === "company-qa") {
      toast({
        title: "Input Required",
        description: "Please enter a question or topic to analyze",
        variant: "destructive",
      });
      return;
    }

    setResponse("");
    await analyzeWithAI(query, analysisType, company);
  };

  const quickPrompts = {
    "company-qa": [
      "What are the key growth drivers?",
      "Analyze the competitive landscape",
      "What are the major risks?",
      "Explain the business model",
    ],
    trends: [
      "What are the emerging market trends?",
      "Analyze sector performance YTD",
      "Identify momentum stocks",
      "Explain recent market volatility",
    ],
    "research-summary": ["Generate full research report"],
    "qa-filings": [
      "Summarize latest earnings call",
      "Explain recent SEC filing",
      "What did management say about guidance?",
      "Analyze cash flow trends",
    ],
    swot: ["Generate SWOT analysis"],
    valuation: ["Analyze current valuation"],
  };

  const analysisCategories = [
    {
      id: "company-qa",
      title: "Ask About Companies",
      description: "Get detailed answers about any company",
      icon: MessageSquare,
      color: "text-blue-500",
    },
    {
      id: "trends",
      title: "Trend Breakdowns",
      description: "Analyze market and sector trends",
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      id: "research-summary",
      title: "Research Summaries",
      description: "AI-generated comprehensive reports",
      icon: FileText,
      color: "text-purple-500",
    },
    {
      id: "qa-filings",
      title: "Filings & Earnings Q&A",
      description: "Ask about SEC filings and earnings",
      icon: Brain,
      color: "text-orange-500",
    },
    {
      id: "swot",
      title: "SWOT Analysis",
      description: "Generate strategic analysis",
      icon: Target,
      color: "text-red-500",
    },
    {
      id: "valuation",
      title: "Valuation Commentary",
      description: "Get valuation insights and metrics",
      icon: DollarSign,
      color: "text-yellow-500",
    },
  ];

  return (
    <StarryBackground className="min-h-screen">
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Analyst</h1>
        <p className="text-muted-foreground mt-2">
          Your intelligent investment research assistant powered by advanced AI
        </p>
      </div>

      <Tabs value={analysisType} onValueChange={setAnalysisType} className="space-y-6">
        <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full">
          {analysisCategories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
              <category.icon className={`h-4 w-4 ${category.color}`} />
              <span className="hidden lg:inline">{category.title.split(" ")[0]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {analysisCategories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <category.icon className={`h-5 w-5 ${category.color}`} />
                  {category.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Company/Ticker (Optional)</Label>
                  <Input
                    placeholder="e.g., AAPL, Microsoft, Tesla"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>

                {category.id !== "research-summary" &&
                  category.id !== "swot" &&
                  category.id !== "valuation" && (
                    <div className="space-y-2">
                      <Label>Your Question</Label>
                      <Textarea
                        placeholder={`Ask about ${category.title.toLowerCase()}...`}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                  )}

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Quick Prompts</Label>
                  <div className="flex flex-wrap gap-2">
                    {quickPrompts[category.id as keyof typeof quickPrompts]?.map((prompt, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary/10"
                        onClick={() => setQuery(prompt)}
                      >
                        {prompt}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={handleAnalyze}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Analysis
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setQuery("");
                      setCompany("");
                      setResponse("");
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            {response && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    AI Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown>{response}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>AI Analyst Capabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {analysisCategories.map((capability) => (
              <div key={capability.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <capability.icon className={`h-5 w-5 mt-0.5 ${capability.color}`} />
                <div>
                  <p className="font-medium text-sm">{capability.title}</p>
                  <p className="text-xs text-muted-foreground">{capability.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
    </StarryBackground>
  );
}
