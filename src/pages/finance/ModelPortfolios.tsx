import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, Download, Eye, Loader2, Plus, Trash2, Brain, PieChart, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

interface Portfolio {
  id: string;
  title: string;
  description: string | null;
  file_path: string;
  risk_level?: string;
  target_return?: number;
}

interface Holding {
  ticker: string;
  allocation: number;
  sector?: string;
}

export default function FinanceModelPortfolios() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [holdings, setHoldings] = useState<Holding[]>([{ ticker: "", allocation: 0 }]);
  const [analysisResult, setAnalysisResult] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const fetchPortfolios = async () => {
    try {
      const { data, error } = await supabase
        .from("model_portfolios")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPortfolios(data || []);
    } catch (error) {
      console.error("Error fetching portfolios:", error);
    } finally {
      setLoading(false);
    }
  };

  const addHolding = () => setHoldings([...holdings, { ticker: "", allocation: 0 }]);
  
  const updateHolding = (index: number, field: keyof Holding, value: string | number) => {
    const updated = [...holdings];
    updated[index] = { ...updated[index], [field]: value };
    setHoldings(updated);
  };
  
  const removeHolding = (index: number) => setHoldings(holdings.filter((_, i) => i !== index));

  const handleAnalyzePortfolio = async () => {
    const validHoldings = holdings.filter(h => h.ticker && h.allocation > 0);
    if (validHoldings.length === 0) {
      toast({ title: "Error", description: "Please add at least one holding", variant: "destructive" });
      return;
    }

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("portfolio-analysis", {
        body: { holdings: validHoldings, modelPortfolios: portfolios }
      });

      if (error) throw error;
      setAnalysisResult(data.analysis || "Analysis complete");
    } catch (error) {
      toast({ title: "Error", description: "Analysis failed", variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleViewPortfolio = async (portfolio: Portfolio) => {
    try {
      const { data, error } = await supabase.storage
        .from("portfolios")
        .createSignedUrl(portfolio.file_path, 3600);

      if (error) throw error;
      window.open(data.signedUrl, "_blank");
    } catch (error) {
      toast({ title: "Error", description: "Could not open portfolio", variant: "destructive" });
    }
  };

  const handleDownloadPortfolio = async (portfolio: Portfolio) => {
    try {
      const { data, error } = await supabase.storage
        .from("portfolios")
        .download(portfolio.file_path);

      if (error) throw error;
      
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${portfolio.title}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({ title: "Error", description: "Could not download portfolio", variant: "destructive" });
    }
  };

  const totalAllocation = holdings.reduce((sum, h) => sum + (h.allocation || 0), 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Model Portfolios</h1>
          <p className="text-muted-foreground mt-2">Curated investment portfolios for different risk profiles</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Brain className="h-4 w-4" />
              Analyze My Portfolio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>AI Portfolio Analysis</DialogTitle>
              <DialogDescription>Enter your holdings to compare against model portfolios</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {holdings.map((holding, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label>Ticker</Label>
                    <Input
                      placeholder="AAPL"
                      value={holding.ticker}
                      onChange={(e) => updateHolding(index, "ticker", e.target.value.toUpperCase())}
                    />
                  </div>
                  <div className="w-24">
                    <Label>Allocation %</Label>
                    <Input
                      type="number"
                      placeholder="10"
                      value={holding.allocation || ""}
                      onChange={(e) => updateHolding(index, "allocation", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeHolding(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <div className="flex justify-between items-center">
                <Button variant="outline" size="sm" onClick={addHolding}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Holding
                </Button>
                <Badge variant={totalAllocation === 100 ? "default" : "destructive"}>
                  Total: {totalAllocation}%
                </Badge>
              </div>

              <Button onClick={handleAnalyzePortfolio} disabled={analyzing} className="w-full">
                {analyzing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Brain className="h-4 w-4 mr-2" />}
                Analyze Portfolio
              </Button>

              {analysisResult && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-4 prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown>{analysisResult}</ReactMarkdown>
                  </CardContent>
                </Card>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{portfolios.length}</p>
                <p className="text-muted-foreground text-sm">Model Portfolios</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">AI-Powered</p>
                <p className="text-muted-foreground text-sm">Portfolio Analysis</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <PieChart className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">Live</p>
                <p className="text-muted-foreground text-sm">Performance Tracking</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolios */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Portfolios</TabsTrigger>
          <TabsTrigger value="conservative">Conservative</TabsTrigger>
          <TabsTrigger value="moderate">Moderate</TabsTrigger>
          <TabsTrigger value="aggressive">Aggressive</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : portfolios.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No model portfolios available</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {portfolios.map((portfolio) => (
                <Card key={portfolio.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Badge variant="outline">{portfolio.risk_level || "Balanced"}</Badge>
                      {portfolio.target_return && (
                        <Badge variant="secondary">{portfolio.target_return}% target</Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{portfolio.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{portfolio.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleViewPortfolio(portfolio)}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDownloadPortfolio(portfolio)}>
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {["conservative", "moderate", "aggressive"].map((risk) => (
          <TabsContent key={risk} value={risk}>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {portfolios
                .filter((p) => p.risk_level?.toLowerCase() === risk)
                .map((portfolio) => (
                  <Card key={portfolio.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{portfolio.title}</CardTitle>
                      <CardDescription>{portfolio.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewPortfolio(portfolio)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDownloadPortfolio(portfolio)}>
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
