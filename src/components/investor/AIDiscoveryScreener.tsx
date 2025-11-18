import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Sparkles, TrendingUp, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useAIAnalyst } from "@/hooks/useAIAnalyst";
import { toast } from "sonner";

export function AIDiscoveryScreener() {
  const [aiFilters, setAiFilters] = useState({
    lowDebt: false,
    strongMargins: false,
    consistentGrowth: false,
    highROE: false,
    undervalued: false,
    insiderBuying: false,
    positiveEarnings: false,
    lowPE: false,
  });
  
  const [aiResponse, setAiResponse] = useState("");
  const [discoveries, setDiscoveries] = useState<any[]>([]);

  const mockAIDiscoveries = [
    { 
      symbol: "COST", 
      name: "Costco Wholesale", 
      score: 94, 
      matchedCriteria: ["Low Debt", "Strong Margins", "Consistent Growth", "High ROE"], 
      aiInsight: "Exceptional operational efficiency with industry-leading margins",
      price: 789.45,
      potential: "+22%"
    },
    { 
      symbol: "V", 
      name: "Visa Inc.", 
      score: 91, 
      matchedCriteria: ["Strong Margins", "High ROE", "Consistent Growth", "Positive Earnings"], 
      aiInsight: "Dominant market position in digital payments with strong pricing power",
      price: 285.32,
      potential: "+18%"
    },
    { 
      symbol: "MA", 
      name: "Mastercard Inc.", 
      score: 89, 
      matchedCriteria: ["Strong Margins", "High ROE", "Low Debt", "Positive Earnings"], 
      aiInsight: "Strong network effects and expanding into new payment technologies",
      price: 478.56,
      potential: "+16%"
    },
    { 
      symbol: "LLY", 
      name: "Eli Lilly", 
      score: 87, 
      matchedCriteria: ["Strong Margins", "Consistent Growth", "Undervalued", "Positive Earnings"], 
      aiInsight: "Breakthrough drugs in diabetes and obesity markets driving growth",
      price: 712.89,
      potential: "+25%"
    },
    { 
      symbol: "ADBE", 
      name: "Adobe Inc.", 
      score: 85, 
      matchedCriteria: ["High ROE", "Strong Margins", "Consistent Growth", "Low Debt"], 
      aiInsight: "Leading creative software suite with strong recurring revenue",
      price: 623.45,
      potential: "+15%"
    },
  ];

  const { analyzeWithAI, isLoading } = useAIAnalyst({
    onDelta: (text) => setAiResponse(prev => prev + text),
    onDone: () => {
      toast.success("AI discovery complete");
    },
    onError: (error) => {
      toast.error(error);
      setAiResponse("");
    }
  });

  const toggleFilter = (key: keyof typeof aiFilters) => {
    setAiFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  const handleDiscoverWithAI = async () => {
    const activeFilters = Object.entries(aiFilters)
      .filter(([_, value]) => value)
      .map(([key]) => key);
    
    if (activeFilters.length === 0) {
      toast.error("Please select at least one filter");
      return;
    }
    
    setAiResponse("");
    setDiscoveries(mockAIDiscoveries);
    
    const query = `Find investment opportunities that match these criteria: ${activeFilters.join(", ")}. Provide detailed analysis of why these stocks are good candidates based on the selected filters.`;
    
    await analyzeWithAI(query, "company-qa");
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI-Powered Discovery Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="lowDebt" 
                checked={aiFilters.lowDebt}
                onCheckedChange={() => toggleFilter("lowDebt")}
              />
              <Label htmlFor="lowDebt" className="cursor-pointer">Low Debt (D/E &lt; 0.5)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="strongMargins" 
                checked={aiFilters.strongMargins}
                onCheckedChange={() => toggleFilter("strongMargins")}
              />
              <Label htmlFor="strongMargins" className="cursor-pointer">Strong Margins (&gt; 20%)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="consistentGrowth" 
                checked={aiFilters.consistentGrowth}
                onCheckedChange={() => toggleFilter("consistentGrowth")}
              />
              <Label htmlFor="consistentGrowth" className="cursor-pointer">Consistent Growth (3yr+)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="highROE" 
                checked={aiFilters.highROE}
                onCheckedChange={() => toggleFilter("highROE")}
              />
              <Label htmlFor="highROE" className="cursor-pointer">High ROE (&gt; 15%)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="undervalued" 
                checked={aiFilters.undervalued}
                onCheckedChange={() => toggleFilter("undervalued")}
              />
              <Label htmlFor="undervalued" className="cursor-pointer">Undervalued (P/B &lt; 3)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="insiderBuying" 
                checked={aiFilters.insiderBuying}
                onCheckedChange={() => toggleFilter("insiderBuying")}
              />
              <Label htmlFor="insiderBuying" className="cursor-pointer">Insider Buying</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="positiveEarnings" 
                checked={aiFilters.positiveEarnings}
                onCheckedChange={() => toggleFilter("positiveEarnings")}
              />
              <Label htmlFor="positiveEarnings" className="cursor-pointer">Positive Earnings Surprise</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="lowPE" 
                checked={aiFilters.lowPE}
                onCheckedChange={() => toggleFilter("lowPE")}
              />
              <Label htmlFor="lowPE" className="cursor-pointer">Low P/E (&lt; 25)</Label>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={handleDiscoverWithAI}
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
                  Discover with AI
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setAiFilters({
                lowDebt: false,
                strongMargins: false,
                consistentGrowth: false,
                highROE: false,
                undervalued: false,
                insiderBuying: false,
                positiveEarnings: false,
                lowPE: false,
              })}
            >
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Analysis Response */}
      {aiResponse && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap">
              {aiResponse}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            AI-Discovered Opportunities ({mockAIDiscoveries.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>AI Score</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Potential</TableHead>
                <TableHead>Matched Criteria</TableHead>
                <TableHead>AI Insight</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAIDiscoveries.map((stock) => (
                <TableRow key={stock.symbol} className="hover:bg-primary/5">
                  <TableCell className="font-medium">{stock.symbol}</TableCell>
                  <TableCell>{stock.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="font-bold text-primary">{stock.score}/100</span>
                    </div>
                  </TableCell>
                  <TableCell>${stock.price}</TableCell>
                  <TableCell>
                    <span className="text-green-500 font-medium">{stock.potential}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {stock.matchedCriteria.map((criteria, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {criteria}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-sm text-muted-foreground truncate">{stock.aiInsight}</p>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">Analyze</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
