import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  TrendingUp, 
  Coins, 
  PiggyBank, 
  BarChart3,
  Loader2,
  FileText,
  Filter
} from 'lucide-react';
import { useResearchReports, ResearchReport } from '@/hooks/useResearchReports';
import { ResearchReportCard } from '@/components/research/ResearchReportCard';
import { ResearchReportDetail } from '@/components/research/ResearchReportDetail';
import { ViewModeToggle } from '@/components/showcase/ViewModeToggle';
import { ShowcaseDarkToggle } from '@/components/showcase/ShowcaseDarkToggle';
import { ContentShowcase, ShowcaseItem } from '@/components/showcase/ContentShowcase';

export default function ResearchReports() {
  const { 
    reports, 
    selectedReport, 
    changeLogs,
    isLoading, 
    fetchReports, 
    fetchReportById,
    fetchChangeLogs,
    setSelectedReport 
  } = useResearchReports();

  const [assetTypeFilter, setAssetTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('generated_at');
  const [viewMode, setViewMode] = useState<string>('grid');

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const filteredReports = reports
    .filter(report => {
      if (assetTypeFilter !== 'all' && report.asset_type !== assetTypeFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          report.asset_name.toLowerCase().includes(query) ||
          report.asset_symbol?.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'quality':
          return (b.overall_quality_score || 0) - (a.overall_quality_score || 0);
        case 'risk':
          return (a.risk_score || 0) - (b.risk_score || 0);
        case 'name':
          return a.asset_name.localeCompare(b.asset_name);
        default:
          return new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime();
      }
    });

  const handleViewDetails = async (report: ResearchReport) => {
    await fetchReportById(report.id);
    await fetchChangeLogs(report.id);
  };

  const handleBack = () => {
    setSelectedReport(null);
  };

  const assetTypeCounts = {
    all: reports.length,
    stock: reports.filter(r => r.asset_type === 'stock').length,
    crypto: reports.filter(r => r.asset_type === 'crypto').length,
    fund: reports.filter(r => r.asset_type === 'fund').length,
    etf: reports.filter(r => r.asset_type === 'etf').length,
  };

  if (selectedReport) {
    return (
      <div className="container mx-auto py-6 px-4">
        <ResearchReportDetail 
          report={selectedReport} 
          changeLogs={changeLogs}
          onBack={handleBack} 
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Analyst Reports</h1>
            <p className="text-muted-foreground">
              Institutional-grade investment research across all asset classes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ViewModeToggle value={viewMode} onChange={setViewMode} options={["grid", "showcase"]} />
            <ShowcaseDarkToggle />
            <Badge variant="secondary" className="text-sm">
              <FileText className="h-4 w-4 mr-1" />
              {reports.length} Reports
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or symbol..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Tabs value={assetTypeFilter} onValueChange={setAssetTypeFilter} className="w-full md:w-auto">
                <TabsList>
                  <TabsTrigger value="all">All ({assetTypeCounts.all})</TabsTrigger>
                  <TabsTrigger value="stock" className="hidden md:flex">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Stocks ({assetTypeCounts.stock})
                  </TabsTrigger>
                  <TabsTrigger value="crypto" className="hidden md:flex">
                    <Coins className="h-4 w-4 mr-1" />
                    Crypto ({assetTypeCounts.crypto})
                  </TabsTrigger>
                  <TabsTrigger value="fund" className="hidden md:flex">
                    <PiggyBank className="h-4 w-4 mr-1" />
                    Funds ({assetTypeCounts.fund})
                  </TabsTrigger>
                  <TabsTrigger value="etf" className="hidden md:flex">
                    <BarChart3 className="h-4 w-4 mr-1" />
                    ETFs ({assetTypeCounts.etf})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="generated_at">Most Recent</SelectItem>
                  <SelectItem value="quality">Highest Quality</SelectItem>
                  <SelectItem value="risk">Lowest Risk</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Reports Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredReports.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Research Reports Found</h3>
              <p className="text-muted-foreground">
                {searchQuery || assetTypeFilter !== 'all' 
                  ? 'Try adjusting your filters or search query'
                  : 'Research reports will appear here once generated by administrators'}
              </p>
            </CardContent>
          </Card>
        ) : viewMode === "showcase" ? (
          <ContentShowcase
            items={filteredReports.map((report) => ({
              id: report.id,
              title: report.asset_name,
              subtitle: report.asset_symbol || report.asset_type,
              description: `Quality: ${report.overall_quality_score?.toFixed(1) || 'N/A'}/10 | Risk: ${report.risk_score?.toFixed(1) || 'N/A'}/10`,
              icon: <FileText className="h-10 w-10" />,
              badges: [
                { label: report.asset_type.toUpperCase() },
                ...(report.confidence_level ? [{ label: report.confidence_level }] : []),
              ],
              stats: [
                ...(report.overall_quality_score ? [{ label: "Quality", value: `${report.overall_quality_score.toFixed(1)}/10`, className: "text-primary" }] : []),
                ...(report.risk_score ? [{ label: "Risk", value: `${report.risk_score.toFixed(1)}/10` }] : []),
              ],
              onClick: () => handleViewDetails(report),
            }))}
            emptyMessage="No research reports found"
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredReports.map((report) => (
              <ResearchReportCard
                key={report.id}
                report={report}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}

        {/* Disclaimer */}
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground text-center">
              This content is for informational and research purposes only and does not constitute investment advice.
              All analysis is model-driven and should be verified with additional sources before making any investment decisions.
            </p>
          </CardContent>
        </Card>
      </div>
  );
}
