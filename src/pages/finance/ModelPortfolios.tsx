import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Briefcase, ExternalLink, Download, Upload, Sparkles, TrendingUp, PieChart, BarChart3, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

interface Portfolio {
  id: string;
  title: string;
  description: string | null;
  file_path: string;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
  user_id: string | null;
}

interface Holding {
  ticker: string;
  allocation: number;
  sector?: string;
}

export default function FinanceModelPortfolios() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [userHoldings, setUserHoldings] = useState<Holding[]>([{ ticker: "", allocation: 0 }]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string>("");

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const fetchPortfolios = async () => {
    try {
      setLoading(true);
      
      // Fetch all model portfolios - admin uploads should be visible to all users
      const { data, error } = await supabase
        .from('model_portfolios')
        .select('id, title, description, file_path, thumbnail_url, created_at, updated_at, user_id')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPortfolios(data || []);
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      toast.error('Failed to load model portfolios');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPortfolio = async (portfolio: Portfolio) => {
    try {
      const { data, error } = await supabase.storage
        .from('portfolios')
        .createSignedUrl(portfolio.file_path, 3600);

      if (error) throw error;

      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (error) {
      console.error('Error accessing portfolio:', error);
      toast.error('Failed to open portfolio');
    }
  };

  const handleDownloadPortfolio = async (portfolio: Portfolio) => {
    try {
      const { data, error } = await supabase.storage
        .from('portfolios')
        .download(portfolio.file_path);

      if (error) throw error;

      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${portfolio.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Portfolio downloaded successfully');
    } catch (error) {
      console.error('Error downloading portfolio:', error);
      toast.error('Failed to download portfolio');
    }
  };

  const addHolding = () => {
    setUserHoldings([...userHoldings, { ticker: "", allocation: 0 }]);
  };

  const updateHolding = (index: number, field: keyof Holding, value: string | number) => {
    const updated = [...userHoldings];
    updated[index] = { ...updated[index], [field]: value };
    setUserHoldings(updated);
  };

  const removeHolding = (index: number) => {
    setUserHoldings(userHoldings.filter((_, i) => i !== index));
  };

  const handleAnalyzePortfolio = async () => {
    const validHoldings = userHoldings.filter(h => h.ticker && h.allocation > 0);
    
    if (validHoldings.length === 0) {
      toast.error("Please add at least one holding with ticker and allocation");
      return;
    }

    const totalAllocation = validHoldings.reduce((sum, h) => sum + h.allocation, 0);
    if (Math.abs(totalAllocation - 100) > 0.01) {
      toast.error("Total allocation must equal 100%");
      return;
    }

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('portfolio-analysis', {
        body: {
          userPortfolio: {
            holdings: validHoldings,
            totalValue: 100,
          },
          modelPortfolios: portfolios.map(p => ({
            title: p.title,
            description: p.description,
          })),
        },
      });

      if (error) {
        if (error.message?.includes("429")) {
          toast.error("Rate limit exceeded. Please try again later.");
        } else if (error.message?.includes("402")) {
          toast.error("AI credits exhausted. Please add credits to continue.");
        } else {
          throw error;
        }
        return;
      }

      setAnalysis(data.analysis);
      toast.success("Portfolio analysis complete!");
    } catch (error) {
      console.error('Error analyzing portfolio:', error);
      toast.error('Failed to analyze portfolio');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-secondary to-accent p-12 text-white shadow-2xl">
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Briefcase className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-5xl font-bold tracking-tight">Model Portfolios</h1>
                <p className="text-white/90 text-xl mt-2">
                  Elite investment strategies powered by AI insights
                </p>
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/30">
                    <Sparkles className="h-5 w-5 mr-2" />
                    Analyze My Portfolio
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                      <Sparkles className="h-6 w-6 text-primary" />
                      AI Portfolio Analysis
                    </DialogTitle>
                    <DialogDescription>
                      Upload your portfolio holdings to get AI-powered insights and comparisons with our model portfolios
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6 py-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="text-lg font-semibold">Your Holdings</Label>
                        <Button onClick={addHolding} variant="outline" size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Add Holding
                        </Button>
                      </div>
                      
                      {userHoldings.map((holding, index) => (
                        <div key={index} className="flex gap-3 items-end p-4 bg-muted/50 rounded-lg">
                          <div className="flex-1">
                            <Label htmlFor={`ticker-${index}`}>Ticker Symbol</Label>
                            <Input
                              id={`ticker-${index}`}
                              placeholder="e.g., AAPL"
                              value={holding.ticker}
                              onChange={(e) => updateHolding(index, 'ticker', e.target.value.toUpperCase())}
                              className="mt-1"
                            />
                          </div>
                          <div className="w-32">
                            <Label htmlFor={`allocation-${index}`}>Allocation %</Label>
                            <Input
                              id={`allocation-${index}`}
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              placeholder="0.00"
                              value={holding.allocation || ""}
                              onChange={(e) => updateHolding(index, 'allocation', parseFloat(e.target.value) || 0)}
                              className="mt-1"
                            />
                          </div>
                          <div className="w-40">
                            <Label htmlFor={`sector-${index}`}>Sector</Label>
                            <Input
                              id={`sector-${index}`}
                              placeholder="Tech, Finance..."
                              value={holding.sector || ""}
                              onChange={(e) => updateHolding(index, 'sector', e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => removeHolding(index)}
                            disabled={userHoldings.length === 1}
                          >
                            ×
                          </Button>
                        </div>
                      ))}

                      <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Total Allocation:</span>
                          <span className={`font-bold ${
                            Math.abs(userHoldings.reduce((sum, h) => sum + h.allocation, 0) - 100) < 0.01
                              ? 'text-green-600'
                              : 'text-destructive'
                          }`}>
                            {userHoldings.reduce((sum, h) => sum + h.allocation, 0).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={handleAnalyzePortfolio}
                      disabled={analyzing}
                      className="w-full h-12 text-lg"
                      size="lg"
                    >
                      {analyzing ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Analyzing Portfolio...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-5 w-5 mr-2" />
                          Analyze with AI
                        </>
                      )}
                    </Button>

                    {analysis && (
                      <div className="mt-6 p-6 bg-card rounded-xl border shadow-sm">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-primary" />
                          AI Analysis Results
                        </h3>
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <ReactMarkdown>{analysis}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-primary/20 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                Total Portfolios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{portfolios.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Professional strategies available</p>
            </CardContent>
          </Card>

          <Card className="border-secondary/20 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                AI-Powered Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">Active</div>
              <p className="text-xs text-muted-foreground mt-1">Compare with your holdings</p>
            </CardContent>
          </Card>

          <Card className="border-accent/20 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Performance Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">Live</div>
              <p className="text-xs text-muted-foreground mt-1">Real-time portfolio insights</p>
            </CardContent>
          </Card>
        </div>

        {/* Portfolios Grid */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="all">All Portfolios</TabsTrigger>
            <TabsTrigger value="my">My Portfolios</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {portfolios.map((portfolio) => (
                <Card 
                  key={portfolio.id} 
                  className="group hover:shadow-2xl transition-all duration-300 border-border/50 hover:border-primary/50 bg-card/50 backdrop-blur-sm overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                        <Briefcase className="h-7 w-7 text-primary" />
                      </div>
                      <Badge 
                        variant={portfolio.user_id ? "default" : "secondary"}
                        className="shadow-sm"
                      >
                        {portfolio.user_id ? "Personal" : "Professional"}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {portfolio.title}
                    </CardTitle>
                    {portfolio.description && (
                      <CardDescription className="line-clamp-2 mt-2">
                        {portfolio.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3 relative">
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1 bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all"
                        onClick={() => handleViewPortfolio(portfolio)}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleDownloadPortfolio(portfolio)}
                        title="Download PDF"
                        className="shadow-sm hover:shadow-md transition-all"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="my" className="mt-0">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {portfolios.filter(p => p.user_id).length > 0 ? (
                portfolios.filter(p => p.user_id).map((portfolio) => (
                  <Card 
                    key={portfolio.id} 
                    className="group hover:shadow-2xl transition-all duration-300 border-border/50 hover:border-primary/50 bg-card/50 backdrop-blur-sm overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="relative">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                          <Briefcase className="h-7 w-7 text-primary" />
                        </div>
                        <Badge variant="default" className="shadow-sm">Personal</Badge>
                      </div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        {portfolio.title}
                      </CardTitle>
                      {portfolio.description && (
                        <CardDescription className="line-clamp-2 mt-2">
                          {portfolio.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3 relative">
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1 bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all"
                          onClick={() => handleViewPortfolio(portfolio)}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleDownloadPortfolio(portfolio)}
                          title="Download PDF"
                          className="shadow-sm hover:shadow-md transition-all"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="col-span-full">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="p-4 bg-muted rounded-full mb-4">
                      <Briefcase className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No Personal Portfolios</h3>
                    <p className="text-muted-foreground text-center max-w-md">
                      Your personal portfolio uploads will appear here. Use the AI analysis feature to get started.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
