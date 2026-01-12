import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  Play, 
  RefreshCw, 
  Search,
  TrendingUp,
  Coins,
  PiggyBank,
  BarChart3,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Zap
} from 'lucide-react';
import { useResearchReports } from '@/hooks/useResearchReports';
import { useStockData, useCryptoData } from '@/hooks/useRealTimeMarketData';
import { allFunds } from '@/data/funds';
import { toast } from 'sonner';

export function ResearchAdmin() {
  const { reports, isGenerating, fetchReports, generateReport, generateBulkReports } = useResearchReports();
  const { data: stocksData, loading: stocksLoading } = useStockData(1, 50);
  const { data: cryptoData, loading: cryptoLoading } = useCryptoData(1, 100);
  
  const [selectedAssetType, setSelectedAssetType] = useState<'fund' | 'etf' | 'stock' | 'crypto'>('stock');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const getAssetList = () => {
    switch (selectedAssetType) {
      case 'stock':
        return stocksData?.map(stock => ({
          id: stock.symbol,
          name: stock.name,
          symbol: stock.symbol,
          data: stock,
        })) || [];
      case 'crypto':
        return cryptoData?.map(crypto => ({
          id: crypto.id,
          name: crypto.name,
          symbol: crypto.symbol.toUpperCase(),
          data: crypto,
        })) || [];
      case 'fund':
      case 'etf':
        return allFunds.map(fund => ({
          id: fund.isin,
          name: fund.fundName || fund.isin,
          symbol: fund.isin,
          data: fund,
        }));
      default:
        return [];
    }
  };

  const filteredAssets = getAssetList().filter(asset => 
    asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleAssetSelection = (assetId: string) => {
    const newSet = new Set(selectedAssets);
    if (newSet.has(assetId)) {
      newSet.delete(assetId);
    } else {
      newSet.add(assetId);
    }
    setSelectedAssets(newSet);
  };

  const selectAll = () => {
    setSelectedAssets(new Set(filteredAssets.map(a => a.id)));
  };

  const clearSelection = () => {
    setSelectedAssets(new Set());
  };

  const handleGenerateSingle = async (asset: any) => {
    await generateReport(
      selectedAssetType,
      asset.id,
      asset.name,
      asset.symbol,
      asset.data
    );
    fetchReports();
  };

  const handleGenerateSelected = async () => {
    if (selectedAssets.size === 0) {
      toast.error('No assets selected');
      return;
    }

    const assetsToGenerate = filteredAssets
      .filter(a => selectedAssets.has(a.id))
      .map(a => ({
        assetType: selectedAssetType,
        assetId: a.id,
        assetName: a.name,
        assetSymbol: a.symbol,
        assetData: a.data,
      }));

    setGenerationProgress({ current: 0, total: assetsToGenerate.length });

    for (let i = 0; i < assetsToGenerate.length; i++) {
      const asset = assetsToGenerate[i];
      await generateReport(
        asset.assetType,
        asset.assetId,
        asset.assetName,
        asset.assetSymbol,
        asset.assetData
      );
      setGenerationProgress({ current: i + 1, total: assetsToGenerate.length });
    }

    setGenerationProgress({ current: 0, total: 0 });
    clearSelection();
    fetchReports();
  };

  const getExistingReportForAsset = (assetId: string) => {
    return reports.find(r => r.asset_id === assetId && r.asset_type === selectedAssetType);
  };

  const assetTypeStats = {
    fund: reports.filter(r => r.asset_type === 'fund').length,
    etf: reports.filter(r => r.asset_type === 'etf').length,
    stock: reports.filter(r => r.asset_type === 'stock').length,
    crypto: reports.filter(r => r.asset_type === 'crypto').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{assetTypeStats.stock}</p>
                <p className="text-sm text-muted-foreground">Stock Reports</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{assetTypeStats.crypto}</p>
                <p className="text-sm text-muted-foreground">Crypto Reports</p>
              </div>
              <Coins className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{assetTypeStats.fund}</p>
                <p className="text-sm text-muted-foreground">Fund Reports</p>
              </div>
              <PiggyBank className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{assetTypeStats.etf}</p>
                <p className="text-sm text-muted-foreground">ETF Reports</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generation Progress */}
      {generationProgress.total > 0 && (
        <Card className="border-primary">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <div className="flex-1">
                <p className="font-medium">Generating Research Reports</p>
                <div className="flex items-center gap-4 mt-2">
                  <Progress 
                    value={(generationProgress.current / generationProgress.total) * 100} 
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground">
                    {generationProgress.current} / {generationProgress.total}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Asset Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Research Report Generator</CardTitle>
          <CardDescription>
            Generate institutional-grade research reports for assets automatically
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={selectedAssetType} onValueChange={(v) => {
            setSelectedAssetType(v as any);
            clearSelection();
          }}>
            <TabsList>
              <TabsTrigger value="stock" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Stocks ({stocksData?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="crypto" className="flex items-center gap-2">
                <Coins className="h-4 w-4" />
                Crypto ({cryptoData?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="fund" className="flex items-center gap-2">
                <PiggyBank className="h-4 w-4" />
                Funds ({allFunds.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm" onClick={selectAll}>
              Select All ({filteredAssets.length})
            </Button>
            <Button variant="outline" size="sm" onClick={clearSelection}>
              Clear
            </Button>
            <Button 
              onClick={handleGenerateSelected} 
              disabled={isGenerating || selectedAssets.size === 0}
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              Generate Selected ({selectedAssets.size})
            </Button>
          </div>

          <ScrollArea className="h-[400px] border rounded-lg">
            <div className="p-4 space-y-2">
              {(stocksLoading || cryptoLoading) ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : filteredAssets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No assets found
                </div>
              ) : (
                filteredAssets.map((asset) => {
                  const existingReport = getExistingReportForAsset(asset.id);
                  const isSelected = selectedAssets.has(asset.id);
                  
                  return (
                    <div
                      key={asset.id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                        isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => toggleAssetSelection(asset.id)}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="h-4 w-4"
                        />
                        <div>
                          <p className="font-medium">{asset.name}</p>
                          <p className="text-sm text-muted-foreground">{asset.symbol}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {existingReport ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span className="text-xs text-muted-foreground">
                              v{existingReport.version}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGenerateSingle(asset);
                              }}
                              disabled={isGenerating}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Not generated</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGenerateSingle(asset);
                              }}
                              disabled={isGenerating}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
