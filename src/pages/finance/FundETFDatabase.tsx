import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, Search, Scale, Sparkles, FileText, BarChart3 } from "lucide-react";
import { fundDatabase } from "@/data/fundDatabase";
import { FundSearchFilters } from "@/components/fund-database/FundSearchFilters";
import { FundTable } from "@/components/fund-database/FundTable";
import { FundDetailPanel } from "@/components/fund-database/FundDetailPanel";
import { FundComparison } from "@/components/fund-database/FundComparison";
import { AIFundInsights } from "@/components/fund-database/AIFundInsights";
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8 text-primary" />
            Fund & ETF Database
          </h1>
          <p className="text-muted-foreground mt-1">Morningstar-style research platform for UK IFAs</p>
        </div>
        {comparisonFunds.length > 0 && (
          <Button onClick={() => setShowComparison(!showComparison)} variant={showComparison ? "default" : "outline"}>
            <Scale className="h-4 w-4 mr-2" />
            Compare ({comparisonFunds.length})
          </Button>
        )}
      </div>

      {showComparison && comparisonFunds.length > 0 && (
        <FundComparison 
          funds={comparisonFunds} 
          onRemoveFund={(isin) => setComparisonFunds(prev => prev.filter(f => f.isin !== isin))}
          onClose={() => setShowComparison(false)}
        />
      )}

      <Tabs defaultValue="search" className="space-y-4">
        <TabsList>
          <TabsTrigger value="search"><Search className="h-4 w-4 mr-2" />Search</TabsTrigger>
          <TabsTrigger value="ai"><Sparkles className="h-4 w-4 mr-2" />AI Analyst</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <FundSearchFilters filters={filters} onFiltersChange={setFilters} resultCount={filteredFunds.length} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className={viewingFund ? "lg:col-span-2" : "lg:col-span-3"}>
              <FundTable 
                funds={filteredFunds} 
                selectedFunds={selectedFunds} 
                onSelectFund={handleSelectFund}
                onViewFund={setViewingFund}
                onAddToComparison={handleAddToComparison}
              />
            </div>
            {viewingFund && (
              <FundDetailPanel 
                fund={viewingFund} 
                onClose={() => setViewingFund(null)}
                onAddToComparison={handleAddToComparison}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="ai">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <FundTable 
                funds={filteredFunds.slice(0, 10)} 
                selectedFunds={selectedFunds} 
                onSelectFund={handleSelectFund}
                onViewFund={setViewingFund}
                onAddToComparison={handleAddToComparison}
              />
            </div>
            <AIFundInsights fund={viewingFund || undefined} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
