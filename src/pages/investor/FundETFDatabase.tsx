import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Database, Search, Scale, Sparkles, TrendingUp, DollarSign, BarChart3, Globe, Download, Bookmark, Star, ShieldCheck } from "lucide-react";
import { fundDatabase } from "@/data/fundDatabase";
import { FundSearchFilters } from "@/components/fund-database/FundSearchFilters";
import { FundTable } from "@/components/fund-database/FundTable";
import { FundComparison } from "@/components/fund-database/FundComparison";
import { AIFundInsights } from "@/components/fund-database/AIFundInsights";
import { FundScreener } from "@/components/fund-database/FundScreener";
import { FundWatchlist } from "@/components/fund-database/FundWatchlist";
import { FundAnalystActivityHub } from "@/components/market/FundAnalystActivityHub";
import { DataIntegrityBanner } from "@/components/fund-database/DataIntegrityBanner";
import { MorningstarDetailPanel } from "@/components/market/MorningstarDetailPanel";
import type { CompleteFund, FundSearchFilters as FiltersType } from "@/types/fund";
import { useToast } from "@/hooks/use-toast";

export default function FundETFDatabase() {
  const [filters, setFilters] = useState<FiltersType>({});
  const [selectedFunds, setSelectedFunds] = useState<string[]>([]);
  const [viewingFund, setViewingFund] = useState<CompleteFund | null>(null);
  const [comparisonFunds, setComparisonFunds] = useState<CompleteFund[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const { toast } = useToast();

  const filteredFunds = useMemo(() => {
    let result = [...fundDatabase];

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(f => 
        f.name.toLowerCase().includes(q) || 
        f.isin.toLowerCase().includes(q) ||
        f.ticker?.toLowerCase().includes(q)
      );
    }
    if (filters.fundTypes?.length) result = result.filter(f => filters.fundTypes!.includes(f.fundType));
    if (filters.assetClasses?.length) result = result.filter(f => filters.assetClasses!.includes(f.assetClass));
    if (filters.providers?.length) result = result.filter(f => filters.providers!.includes(f.provider));
    if (filters.categories?.length) result = result.filter(f => filters.categories!.includes(f.category));
    if (filters.riskRatingMin) result = result.filter(f => f.risk.srriRating >= filters.riskRatingMin!);
    if (filters.riskRatingMax) result = result.filter(f => f.risk.srriRating <= filters.riskRatingMax!);
    if (filters.ocfMax) result = result.filter(f => f.costs.ocf <= filters.ocfMax!);
    if (filters.aumMin) result = result.filter(f => f.aum >= filters.aumMin!);
    if (filters.ucitsOnly) result = result.filter(f => f.ucitsStatus);
    if (filters.accumulatingOnly) result = result.filter(f => f.shareClass === 'Accumulating');
    if (filters.esgOnly) result = result.filter(f => f.exposure.esgRating);

    const sortBy = filters.sortBy || 'name';
    const sortOrder = filters.sortOrder || 'asc';
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'performance1Y': comparison = a.performance.oneYearReturn - b.performance.oneYearReturn; break;
        case 'performance3Y': comparison = a.performance.threeYearReturn - b.performance.threeYearReturn; break;
        case 'ocf': comparison = a.costs.ocf - b.costs.ocf; break;
        case 'aum': comparison = a.aum - b.aum; break;
        case 'risk': comparison = a.risk.srriRating - b.risk.srriRating; break;
        default: comparison = a.name.localeCompare(b.name);
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [filters]);

  const handleSelectFund = (isin: string) => {
    setSelectedFunds(prev => prev.includes(isin) ? prev.filter(i => i !== isin) : [...prev, isin]);
  };

  const handleAddToComparison = (fund: CompleteFund) => {
    if (comparisonFunds.length >= 5) {
      toast({ title: "Limit reached", description: "Maximum 5 funds for comparison", variant: "destructive" });
      return;
    }
    if (comparisonFunds.find(f => f.isin === fund.isin)) {
      toast({ title: "Already added", description: "This fund is already in comparison" });
      return;
    }
    setComparisonFunds(prev => [...prev, fund]);
    setShowComparison(true);
    toast({ title: "Added to comparison", description: fund.name });
  };

  // Calculate stats
  const totalAUM = fundDatabase.reduce((sum, f) => sum + f.aum, 0);
  const avgOCF = (fundDatabase.reduce((sum, f) => sum + f.costs.ocf, 0) / fundDatabase.length).toFixed(2);
  const avgReturn = (fundDatabase.reduce((sum, f) => sum + f.performance.oneYearReturn, 0) / fundDatabase.length).toFixed(1);
  const ratedFunds = fundDatabase.filter(f => f.ratings?.starRating).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Premium Header */}
      <div className="relative overflow-hidden border-b border-border/50 bg-gradient-to-r from-primary/5 via-primary/10 to-chart-2/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--chart-2)/0.1),transparent_50%)]" />
        
        <div className="relative p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                  <div className="relative h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25">
                    <Database className="h-6 w-6 text-primary-foreground" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                    Fund & ETF Database
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Research platform for investors • {fundDatabase.length.toLocaleString()} funds
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {selectedFunds.length > 0 && (
                <Badge variant="secondary" className="px-3 py-1.5 bg-primary/10 text-primary border-primary/20">
                  {selectedFunds.length} selected
                </Badge>
              )}
              {comparisonFunds.length > 0 && (
                <Button 
                  onClick={() => setShowComparison(!showComparison)} 
                  variant={showComparison ? "default" : "outline"}
                  className={showComparison ? "shadow-lg shadow-primary/25" : "border-primary/30 hover:border-primary/50"}
                >
                  <Scale className="h-4 w-4 mr-2" />
                  Compare ({comparisonFunds.length})
                </Button>
              )}
              <Button variant="outline" size="icon" className="border-border/50">
                <Bookmark className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="border-border/50">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
            <Card className="bg-background/60 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-chart-1/20 to-chart-1/10 flex items-center justify-center">
                    <Database className="h-5 w-5 text-chart-1" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Funds</p>
                    <p className="text-lg font-bold">{fundDatabase.length.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-background/60 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-chart-2/20 to-chart-2/10 flex items-center justify-center">
                    <Globe className="h-5 w-5 text-chart-2" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Combined AUM</p>
                    <p className="text-lg font-bold">${(totalAUM / 1000).toFixed(0)}B</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-background/60 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Avg. 1Y Return</p>
                    <p className="text-lg font-bold text-emerald-500">+{avgReturn}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-background/60 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-chart-4/20 to-chart-4/10 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-chart-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Avg. OCF</p>
                    <p className="text-lg font-bold">{avgOCF}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-background/60 backdrop-blur-sm border-border/50 hover:border-amber-500/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-500/10 flex items-center justify-center">
                    <Star className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Rated Funds</p>
                    <p className="text-lg font-bold">{ratedFunds}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Data Integrity Banner */}
        <DataIntegrityBanner variant="verified" />

        {/* Fund Analyst Activity Hub */}
        <FundAnalystActivityHub />

        {showComparison && comparisonFunds.length > 0 && (
          <FundComparison 
            funds={comparisonFunds} 
            onRemoveFund={(isin) => setComparisonFunds(prev => prev.filter(f => f.isin !== isin))}
            onClose={() => setShowComparison(false)}
          />
        )}

        <Tabs defaultValue="search" className="space-y-6">
          <TabsList className="bg-muted/50 backdrop-blur-sm p-1 h-auto">
            <TabsTrigger value="search" className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2.5 gap-2">
              <Search className="h-4 w-4" />
              <span>Search & Filter</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2.5 gap-2">
              <Sparkles className="h-4 w-4" />
              <span>AI Analyst</span>
            </TabsTrigger>
            <TabsTrigger value="screener" className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2.5 gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>Screener</span>
            </TabsTrigger>
            <TabsTrigger value="watchlist" className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2.5 gap-2">
              <Bookmark className="h-4 w-4" />
              <span>Watchlist</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4 mt-0">
            <FundSearchFilters filters={filters} onFiltersChange={setFilters} resultCount={filteredFunds.length} />
            <FundTable 
              funds={filteredFunds} 
              selectedFunds={selectedFunds} 
              onSelectFund={handleSelectFund}
              onViewFund={setViewingFund}
              onAddToComparison={handleAddToComparison}
              isAdmin={false}
            />
          </TabsContent>

          <TabsContent value="ai" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FundSearchFilters filters={filters} onFiltersChange={setFilters} resultCount={filteredFunds.length} />
                <FundTable 
                  funds={filteredFunds.slice(0, 15)} 
                  selectedFunds={selectedFunds} 
                  onSelectFund={handleSelectFund}
                  onViewFund={setViewingFund}
                  onAddToComparison={handleAddToComparison}
                  isAdmin={false}
                />
              </div>
              <AIFundInsights fund={viewingFund || undefined} />
            </div>
          </TabsContent>

          <TabsContent value="screener" className="mt-0">
            <FundScreener onViewFund={setViewingFund} onAddToComparison={handleAddToComparison} />
          </TabsContent>

          <TabsContent value="watchlist" className="mt-0">
            <FundWatchlist onViewFund={setViewingFund} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Morningstar-Style Fund Detail Panel */}
      {viewingFund && (
        <div className="fixed inset-0 z-50 flex">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setViewingFund(null)}
          />
          <div className="relative ml-auto w-full max-w-4xl h-full">
            <MorningstarDetailPanel
              asset={{
                id: viewingFund.isin,
                symbol: viewingFund.ticker || viewingFund.isin.slice(-4),
                name: viewingFund.name,
                assetType: 'fund',
                currentPrice: viewingFund.performance.dailyNav,
                priceChange24h: viewingFund.performance.ytdReturn / 12,
                priceChange7d: viewingFund.performance.ytdReturn / 52,
                priceChange30d: viewingFund.performance.ytdReturn / 12,
                priceChange1y: viewingFund.performance.oneYearReturn,
                aum: viewingFund.aum,
                analystRating: viewingFund.ratings?.analystRating,
                overallScore: viewingFund.ratings?.starRating,
                currency: viewingFund.currency,
                ocf: viewingFund.costs.ocf,
                srriRating: viewingFund.risk.srriRating,
                sector: viewingFund.category,
              }}
              onClose={() => setViewingFund(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
