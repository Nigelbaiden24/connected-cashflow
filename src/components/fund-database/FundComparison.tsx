import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { X, Download, Plus } from "lucide-react";
import type { CompleteFund } from "@/types/fund";

interface FundComparisonProps {
  funds: CompleteFund[];
  onRemoveFund: (isin: string) => void;
  onClose: () => void;
}

export function FundComparison({ funds, onRemoveFund, onClose }: FundComparisonProps) {
  const getReturnColor = (value: number) => {
    if (value > 0) return "text-emerald-500";
    if (value < 0) return "text-red-500";
    return "text-muted-foreground";
  };

  const getRiskColor = (rating: number) => {
    if (rating <= 2) return "text-emerald-500";
    if (rating <= 4) return "text-amber-500";
    return "text-red-500";
  };

  const getBestValue = (values: number[], higherIsBetter: boolean) => {
    if (higherIsBetter) {
      return Math.max(...values);
    }
    return Math.min(...values.filter(v => v > 0));
  };

  const metrics = [
    { 
      category: "Overview",
      items: [
        { label: "ISIN", getValue: (f: CompleteFund) => f.isin, format: 'text' },
        { label: "Provider", getValue: (f: CompleteFund) => f.provider, format: 'text' },
        { label: "Type", getValue: (f: CompleteFund) => f.fundType, format: 'text' },
        { label: "Structure", getValue: (f: CompleteFund) => f.structure, format: 'text' },
        { label: "Share Class", getValue: (f: CompleteFund) => f.shareClass, format: 'text' },
        { label: "Domicile", getValue: (f: CompleteFund) => f.domicile, format: 'text' },
        { label: "AUM", getValue: (f: CompleteFund) => `$${f.aum.toLocaleString()}M`, format: 'text' },
      ]
    },
    {
      category: "Costs",
      items: [
        { label: "OCF", getValue: (f: CompleteFund) => f.costs.ocf, format: 'percent', lowerBetter: true },
        { label: "AMC", getValue: (f: CompleteFund) => f.costs.amc, format: 'percent', lowerBetter: true },
        { label: "Transaction Costs", getValue: (f: CompleteFund) => f.costs.transactionCosts, format: 'percent', lowerBetter: true },
        { label: "Total Cost", getValue: (f: CompleteFund) => f.costs.totalCostOfOwnership, format: 'percent', lowerBetter: true },
      ]
    },
    {
      category: "Performance",
      items: [
        { label: "YTD Return", getValue: (f: CompleteFund) => f.performance.ytdReturn, format: 'return', higherBetter: true },
        { label: "1Y Return", getValue: (f: CompleteFund) => f.performance.oneYearReturn, format: 'return', higherBetter: true },
        { label: "3Y Return", getValue: (f: CompleteFund) => f.performance.threeYearReturn, format: 'return', higherBetter: true },
        { label: "5Y Return", getValue: (f: CompleteFund) => f.performance.fiveYearReturn, format: 'return', higherBetter: true },
        { label: "Excess Return (1Y)", getValue: (f: CompleteFund) => f.performance.excessReturn1Y, format: 'return', higherBetter: true },
        { label: "Quartile (1Y)", getValue: (f: CompleteFund) => `Q${f.performance.quartileRank1Y}`, format: 'text' },
      ]
    },
    {
      category: "Risk",
      items: [
        { label: "Risk Rating (SRRI)", getValue: (f: CompleteFund) => f.risk.srriRating, format: 'risk' },
        { label: "Volatility (3Y)", getValue: (f: CompleteFund) => f.risk.volatility3Y, format: 'percent', lowerBetter: true },
        { label: "Sharpe Ratio (3Y)", getValue: (f: CompleteFund) => f.risk.sharpeRatio3Y, format: 'number', higherBetter: true },
        { label: "Max Drawdown", getValue: (f: CompleteFund) => f.risk.maxDrawdown, format: 'percent' },
        { label: "Alpha (3Y)", getValue: (f: CompleteFund) => f.risk.alpha3Y, format: 'number', higherBetter: true },
        { label: "Beta (3Y)", getValue: (f: CompleteFund) => f.risk.beta3Y, format: 'number' },
        { label: "Tracking Error", getValue: (f: CompleteFund) => f.risk.trackingError, format: 'percent' },
        { label: "Upside Capture", getValue: (f: CompleteFund) => f.risk.upsideCaptureRatio, format: 'percent_int', higherBetter: true },
        { label: "Downside Capture", getValue: (f: CompleteFund) => f.risk.downsideCaptureRatio, format: 'percent_int', lowerBetter: true },
      ]
    },
    {
      category: "Holdings",
      items: [
        { label: "Number of Holdings", getValue: (f: CompleteFund) => f.exposure.numberOfHoldings, format: 'number' },
        { label: "Top 10 Weight", getValue: (f: CompleteFund) => f.exposure.top10Weight, format: 'percent' },
        { label: "Top Sector", getValue: (f: CompleteFund) => `${f.exposure.sectorExposure[0]?.sector} (${f.exposure.sectorExposure[0]?.weight}%)`, format: 'text' },
        { label: "Top Region", getValue: (f: CompleteFund) => `${f.exposure.regionExposure[0]?.region} (${f.exposure.regionExposure[0]?.weight}%)`, format: 'text' },
      ]
    },
    {
      category: "ESG",
      items: [
        { label: "ESG Rating", getValue: (f: CompleteFund) => f.exposure.esgRating || '-', format: 'text' },
        { label: "Carbon Intensity", getValue: (f: CompleteFund) => f.exposure.carbonIntensity || '-', format: 'text' },
        { label: "SFDR Classification", getValue: (f: CompleteFund) => f.classification.sfdcClassification || '-', format: 'text' },
      ]
    }
  ];

  const formatValue = (value: any, format: string, allValues?: number[], higherBetter?: boolean, lowerBetter?: boolean) => {
    const numValue = typeof value === 'number' ? value : 0;
    const isBest = allValues && allValues.length > 1 && (
      (higherBetter && numValue === Math.max(...allValues)) ||
      (lowerBetter && numValue === Math.min(...allValues.filter(v => v > 0)))
    );
    
    const bestClass = isBest ? 'font-bold text-primary' : '';
    
    switch (format) {
      case 'percent':
        return <span className={bestClass}>{numValue.toFixed(2)}%</span>;
      case 'percent_int':
        return <span className={bestClass}>{numValue}%</span>;
      case 'return':
        return <span className={`${getReturnColor(numValue)} ${bestClass}`}>{numValue.toFixed(1)}%</span>;
      case 'risk':
        return <span className={`${getRiskColor(numValue)} ${bestClass}`}>{numValue}/7</span>;
      case 'number':
        return <span className={bestClass}>{typeof value === 'number' ? value.toFixed(2) : value}</span>;
      default:
        return <span className={bestClass}>{value}</span>;
    }
  };

  if (funds.length === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          Fund Comparison
          <Badge variant="secondary">{funds.length} funds</Badge>
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Comparison
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full">
          <div className="min-w-max">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-48 sticky left-0 bg-background z-10">Metric</TableHead>
                  {funds.map(fund => (
                    <TableHead key={fund.isin} className="min-w-[200px]">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-sm">{fund.name.slice(0, 30)}...</div>
                          <div className="text-xs text-muted-foreground font-mono">{fund.isin}</div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => onRemoveFund(fund.isin)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.map(section => (
                  <>
                    <TableRow key={section.category} className="bg-muted/50">
                      <TableCell colSpan={funds.length + 1} className="font-semibold">
                        {section.category}
                      </TableCell>
                    </TableRow>
                    {section.items.map(metric => {
                      const allValues = metric.format === 'return' || metric.format === 'percent' || metric.format === 'number' || metric.format === 'percent_int'
                        ? funds.map(f => {
                            const val = metric.getValue(f);
                            return typeof val === 'number' ? val : 0;
                          })
                        : undefined;
                      
                      return (
                        <TableRow key={metric.label}>
                          <TableCell className="sticky left-0 bg-background text-muted-foreground">
                            {metric.label}
                          </TableCell>
                          {funds.map(fund => (
                            <TableCell key={fund.isin}>
                              {formatValue(
                                metric.getValue(fund), 
                                metric.format,
                                allValues,
                                (metric as any).higherBetter,
                                (metric as any).lowerBetter
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    })}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
