import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, MessageSquare, Upload, Send, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const MarketCommentary = () => {
  const [aiQuery, setAiQuery] = useState("");
  const [commentaries] = useState([
    {
      id: "1",
      title: "Weekly Market Wrap-Up",
      author: "Chief Investment Officer",
      date: "2025-01-12",
      excerpt: "Markets showed resilience this week as tech stocks led the charge...",
      category: "Weekly",
      sentiment: "positive"
    },
    {
      id: "2",
      title: "Fed Decision Impact Analysis",
      author: "Market Strategist",
      date: "2025-01-11",
      excerpt: "The Federal Reserve's latest decision has created ripples across...",
      category: "Special Report",
      sentiment: "neutral"
    },
    {
      id: "3",
      title: "Crypto Market Update",
      author: "Digital Assets Lead",
      date: "2025-01-10",
      excerpt: "Bitcoin continues to consolidate as institutional interest grows...",
      category: "Daily",
      sentiment: "positive"
    },
  ]);

  const handleAIQuery = () => {
    if (!aiQuery.trim()) {
      toast.error("Please enter a question");
      return;
    }
    toast.info("AI is analyzing your question...");
    setAiQuery("");
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-600";
      case "negative":
        return "text-red-600";
      default:
        return "text-yellow-600";
    }
  };

  return (
    <div className="p-6 space-y-6 investor-theme">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Market Commentary</h1>
          <p className="text-muted-foreground mt-2">
            Expert insights and AI-powered analysis on current market conditions
          </p>
        </div>
      </div>

      {/* AI Chat Interface */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Market Assistant
          </CardTitle>
          <CardDescription>
            Ask questions about market trends, get instant AI-powered insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Textarea
              placeholder="Ask about market trends, specific assets, or economic indicators..."
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <Button 
            onClick={handleAIQuery} 
            className="mt-4 w-full bg-primary hover:bg-primary/90"
          >
            <Send className="h-4 w-4 mr-2" />
            Ask AI Assistant
          </Button>
        </CardContent>
      </Card>

      {/* Commentary Feed */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Latest Commentary</h2>
        {commentaries.map((commentary) => (
          <Card key={commentary.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <Badge variant="secondary">{commentary.category}</Badge>
                </div>
                <TrendingUp className={`h-5 w-5 ${getSentimentColor(commentary.sentiment)}`} />
              </div>
              <CardTitle className="mt-4">{commentary.title}</CardTitle>
              <CardDescription className="flex items-center gap-2 text-sm">
                <span className="font-medium">{commentary.author}</span>
                <span>•</span>
                <span>{commentary.date}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{commentary.excerpt}</p>
              <Button className="bg-primary hover:bg-primary/90">
                Read Full Commentary
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MarketCommentary;
