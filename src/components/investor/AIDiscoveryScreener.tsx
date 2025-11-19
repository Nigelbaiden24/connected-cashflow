import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Sparkles, TrendingUp, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useAIAnalyst } from "@/hooks/useAIAnalyst";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function AIDiscoveryScreener() {
  const [aiFilters, setAiFilters] = useState({
    lowDebt: false,
    strongMargins: false,
    highGrowth: false,
    undervalued: false,
    strongCashFlow: false,
    dividendPaying: false,
    marketLeader: false,
    innovativeTech: false,
  });
  
  const [discoveries, setDiscoveries] = useState<any[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false);
  const [detailedAnalysis, setDetailedAnalysis] = useState("");

  const { analyzeWithAI, isLoading: isAnalyzing } = useAIAnalyst({
    onDelta: (text) => setDetailedAnalysis(prev => prev + text),
    onDone: () => {
      toast.success("Analysis complete");
    },
    onError: (error) => {
      toast.error(error);
      setDetailedAnalysis("");
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
    
    setIsDiscovering(true);
    setDiscoveries([]);
    
    try {
      const { data, error } = await supabase.functions.invoke("ai-stock-discovery", {
        body: { filters: aiFilters }
      });

      if (error) throw error;

      if (data.discoveries && data.discoveries.length > 0) {
        setDiscoveries(data.discoveries);
        toast.success(`Discovered ${data.discoveries.length} opportunities!`);
      } else {
        toast.error("No opportunities found matching your criteria");
      }
    } catch (error: any) {
      console.error("Discovery error:", error);
      if (error.message?.includes("429")) {
        toast.error("Rate limit exceeded. Please try again in a moment.");
      } else if (error.message?.includes("402")) {
        toast.error("Credits depleted. Please add more credits.");
      } else {
        toast.error("Failed to discover opportunities");
      }
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleAnalyzeStock = async (stock: any) => {
    setSelectedStock(stock);
    setDetailedAnalysis("");
    setAnalysisDialogOpen(true);
    
    const query = `Provide a comprehensive investment analysis for ${stock.name} (${stock.symbol}). 
    
Current Price: ${stock.price}
AI Score: ${stock.aiScore}/100
Upside Potential: ${stock.potential}

Include:
1. Fundamental analysis (financials, valuation)
2. Technical analysis (price trends, support/resistance)
3. Competitive positioning
4. Growth catalysts and risks
5. Investment recommendation with target price
6. Key metrics: ${JSON.stringify(stock.keyMetrics || {})}

Focus on actionable insights for investors.`;

    await analyzeWithAI(query, "company-qa", stock.symbol);
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
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="lowDebt"
                checked={aiFilters.lowDebt}
                onCheckedChange={() => toggleFilter("lowDebt")}
              />
              <Label htmlFor="lowDebt" className="text-sm font-medium cursor-pointer">
                Low Debt Ratio
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="strongMargins"
                checked={aiFilters.strongMargins}
                onCheckedChange={() => toggleFilter("strongMargins")}
              />
              <Label htmlFor="strongMargins" className="text-sm font-medium cursor-pointer">
                Strong Margins
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="highGrowth"
                checked={aiFilters.highGrowth}
                onCheckedChange={() => toggleFilter("highGrowth")}
              />
              <Label htmlFor="highGrowth" className="text-sm font-medium cursor-pointer">
                High Growth
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="undervalued"
                checked={aiFilters.undervalued}
                onCheckedChange={() => toggleFilter("undervalued")}
              />
              <Label htmlFor="undervalued" className="text-sm font-medium cursor-pointer">
                Undervalued
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="strongCashFlow"
                checked={aiFilters.strongCashFlow}
                onCheckedChange={() => toggleFilter("strongCashFlow")}
              />
              <Label htmlFor="strongCashFlow" className="text-sm font-medium cursor-pointer">
                Strong Cash Flow
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="dividendPaying"
                checked={aiFilters.dividendPaying}
                onCheckedChange={() => toggleFilter("dividendPaying")}
              />
              <Label htmlFor="dividendPaying" className="text-sm font-medium cursor-pointer">
                Dividend Paying
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="marketLeader"
                checked={aiFilters.marketLeader}
                onCheckedChange={() => toggleFilter("marketLeader")}
              />
              <Label htmlFor="marketLeader" className="text-sm font-medium cursor-pointer">
                Market Leader
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="innovativeTech"
                checked={aiFilters.innovativeTech}
                onCheckedChange={() => toggleFilter("innovativeTech")}
              />
              <Label htmlFor="innovativeTech" className="text-sm font-medium cursor-pointer">
                Innovative Tech
              </Label>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleDiscoverWithAI} 
              disabled={isDiscovering}
              className="flex-1 gap-2 bg-primary hover:bg-primary/90"
            >
              {isDiscovering ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Discovering...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Discover with AI
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => {
                setAiFilters({
                  lowDebt: false,
                  strongMargins: false,
                  highGrowth: false,
                  undervalued: false,
                  strongCashFlow: false,
                  dividendPaying: false,
                  marketLeader: false,
                  innovativeTech: false,
                });
                setDiscoveries([]);
              }}
            >
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {discoveries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              AI-Discovered Opportunities ({discoveries.length})
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
                  <TableHead>Matched</TableHead>
                  <TableHead>AI Insight</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {discoveries.map((stock) => (
                  <TableRow key={stock.symbol} className="hover:bg-primary/5">
                    <TableCell className="font-medium text-primary">{stock.symbol}</TableCell>
                    <TableCell className="font-medium">{stock.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="font-bold text-primary">{stock.aiScore}/100</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{stock.price}</TableCell>
                    <TableCell>
                      <span className="text-green-600 font-medium">{stock.potential}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{stock.matched} criteria</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-sm text-muted-foreground line-clamp-2">{stock.insight}</p>
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleAnalyzeStock(stock)}
                        className="gap-1"
                      >
                        <Search className="h-3 w-3" />
                        Analyze
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Detailed Analysis Dialog */}
      <Dialog open={analysisDialogOpen} onOpenChange={setAnalysisDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Detailed Analysis: {selectedStock?.name} ({selectedStock?.symbol})
            </DialogTitle>
            <DialogDescription>
              AI-powered comprehensive investment analysis
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedStock && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Current Price</p>
                  <p className="text-lg font-bold">{selectedStock.price}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">AI Score</p>
                  <p className="text-lg font-bold text-primary">{selectedStock.aiScore}/100</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Potential</p>
                  <p className="text-lg font-bold text-green-600">{selectedStock.potential}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Matched Criteria</p>
                  <p className="text-lg font-bold">{selectedStock.matched}</p>
                </div>
              </div>
            )}
            
            {isAnalyzing && !detailedAnalysis && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            
            {detailedAnalysis && (
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap">{detailedAnalysis}</div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
