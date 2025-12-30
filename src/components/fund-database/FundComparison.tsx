import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { X, Download, Scale, Trophy, Star } from "lucide-react";
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
    
    switch (format) {
      case 'percent':
        return (
          <div className="flex items-center justify-end gap-1.5">
            <span className={isBest ? 'font-bold text-primary' : ''}>{numValue.toFixed(2)}%</span>
            {isBest && <Trophy className="h-3.5 w-3.5 text-primary" />}
          </div>
        );
      case 'percent_int':
        return (
          <div className="flex items-center justify-end gap-1.5">
            <span className={isBest ? 'font-bold text-primary' : ''}>{numValue}%</span>
            {isBest && <Trophy className="h-3.5 w-3.5 text-primary" />}
          </div>
        );
      case 'return':
        return (
          <div className="flex items-center justify-end gap-1.5">
            <span className={`${getReturnColor(numValue)} ${isBest ? 'font-bold' : ''}`}>
              {numValue > 0 ? '+' : ''}{numValue.toFixed(1)}%
            </span>
            {isBest && <Trophy className="h-3.5 w-3.5 text-primary" />}
          </div>
        );
      case 'risk':
        return <span className={`font-semibold ${getRiskColor(numValue)}`}>{numValue}/7</span>;
      case 'number':
        return (
          <div className="flex items-center justify-end gap-1.5">
            <span className={isBest ? 'font-bold text-primary' : ''}>{typeof value === 'number' ? value.toFixed(2) : value}</span>
            {isBest && <Trophy className="h-3.5 w-3.5 text-primary" />}
          </div>
        );
      default:
        return <span>{value}</span>;
    }
  };

  if (funds.length === 0) {
    return null;
  }

  return (
    <Card className="w-full border-border/50 bg-gradient-to-br from-background to-muted/10 overflow-hidden">
      <CardHeader className="flex-row items-center justify-between border-b border-border/50 bg-muted/30">
        <CardTitle className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-chart-2/20 to-chart-2/5 flex items-center justify-center">
            <Scale className="h-5 w-5 text-chart-2" />
          </div>
          <div>
            <span className="block">Fund Comparison</span>
            <Badge variant="secondary" className="mt-1 bg-chart-2/10 text-chart-2 border-0 text-xs">
              {funds.length} funds selected
            </Badge>
          </div>
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-border/50 hover:border-primary/30">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="w-full">
          <div className="min-w-max">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/50 hover:bg-transparent">
                  <TableHead className="w-52 sticky left-0 bg-background z-10 font-semibold">Metric</TableHead>
                  {funds.map(fund => (
                    <TableHead key={fund.isin} className="min-w-[220px]">
                      <div className="flex items-start justify-between gap-2 pr-2">
                        <div className="space-y-1">
                          <div className="font-semibold text-sm text-foreground line-clamp-2">{fund.name}</div>
                          <div className="text-[10px] text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded inline-block">
                            {fund.isin}
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 flex-shrink-0"
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
                    <TableRow key={section.category} className="bg-muted/40 hover:bg-muted/40">
                      <TableCell 
                        colSpan={funds.length + 1} 
                        className="font-semibold text-sm text-foreground py-2.5 sticky left-0 bg-muted/40"
                      >
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
                        <TableRow key={metric.label} className="border-b border-border/30 hover:bg-muted/30">
                          <TableCell className="sticky left-0 bg-background text-muted-foreground text-sm font-medium py-2.5">
                            {metric.label}
                          </TableCell>
                          {funds.map(fund => (
                            <TableCell key={fund.isin} className="text-sm py-2.5">
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
