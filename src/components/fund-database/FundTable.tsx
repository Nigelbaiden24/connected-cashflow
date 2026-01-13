import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Info, 
  TrendingUp, 
  TrendingDown,
  Scale,
  Star,
  Plus,
  ChevronRight,
  Sparkles,
  Settings,
  ShieldCheck
} from "lucide-react";
import type { CompleteFund } from "@/types/fund";
import { StarRating, AnalystRatingBadge, PillarRatings } from "./FundRatingBadges";
import { DataIntegrityBadge } from "./DataIntegrityBadge";

interface FundTableProps {
  funds: CompleteFund[];
  selectedFunds: string[];
  onSelectFund: (isin: string) => void;
  onViewFund: (fund: CompleteFund) => void;
  onAddToComparison: (fund: CompleteFund) => void;
  onEditRatings?: (fund: CompleteFund) => void;
  isAdmin?: boolean;
}

export function FundTable({ 
  funds, 
  selectedFunds, 
  onSelectFund, 
  onViewFund,
  onAddToComparison,
  onEditRatings,
  isAdmin = false
}: FundTableProps) {
  const getReturnColor = (value: number) => {
    if (value > 0) return "text-emerald-500";
    if (value < 0) return "text-red-500";
    return "text-muted-foreground";
  };

  const getReturnBg = (value: number) => {
    if (value > 10) return "bg-emerald-500/10";
    if (value > 0) return "bg-emerald-500/5";
    if (value < -10) return "bg-red-500/10";
    if (value < 0) return "bg-red-500/5";
    return "";
  };

  const getRiskColor = (rating: number) => {
    if (rating <= 2) return "bg-emerald-500/10 text-emerald-600 border-emerald-500/30";
    if (rating <= 4) return "bg-amber-500/10 text-amber-600 border-amber-500/30";
    return "bg-red-500/10 text-red-600 border-red-500/30";
  };

  const getQuartileBadge = (quartile: 1 | 2 | 3 | 4) => {
    const config = {
      1: { bg: "bg-emerald-500/10", text: "text-emerald-600", border: "border-emerald-500/30", label: "1st" },
      2: { bg: "bg-blue-500/10", text: "text-blue-600", border: "border-blue-500/30", label: "2nd" },
      3: { bg: "bg-amber-500/10", text: "text-amber-600", border: "border-amber-500/30", label: "3rd" },
      4: { bg: "bg-red-500/10", text: "text-red-600", border: "border-red-500/30", label: "4th" }
    };
    return config[quartile];
  };

  const formatAUM = (aum: number) => {
    if (aum >= 1000) return `£${(aum / 1000).toFixed(1)}B`;
    return `£${aum}M`;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ETF': return 'bg-chart-1/10 text-chart-1 border-chart-1/30';
      case 'OEIC': return 'bg-chart-2/10 text-chart-2 border-chart-2/30';
      case 'Unit Trust': return 'bg-chart-3/10 text-chart-3 border-chart-3/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <Card className="border-border/50 overflow-hidden bg-gradient-to-br from-background to-muted/10">
      <ScrollArea className="h-[650px]">
        <Table>
          <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 border-b border-border/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10 pl-4">
                <Checkbox 
                  checked={selectedFunds.length === funds.length && funds.length > 0}
                  onCheckedChange={(checked) => {
                    funds.forEach(f => {
                      if ((checked && !selectedFunds.includes(f.isin)) || 
                          (!checked && selectedFunds.includes(f.isin))) {
                        onSelectFund(f.isin);
                      }
                    });
                  }}
                  className="border-border/50"
                />
              </TableHead>
              <TableHead className="min-w-[280px] font-semibold text-foreground">Fund</TableHead>
              <TableHead className="font-semibold text-foreground">Rating</TableHead>
              <TableHead className="font-semibold text-foreground">Type</TableHead>
              <TableHead className="text-right font-semibold text-foreground">OCF</TableHead>
              <TableHead className="text-right font-semibold text-foreground">AUM</TableHead>
              <TableHead className="text-right font-semibold text-foreground">1Y</TableHead>
              <TableHead className="text-right font-semibold text-foreground">3Y</TableHead>
              <TableHead className="text-center font-semibold text-foreground">Q</TableHead>
              <TableHead className="text-center font-semibold text-foreground">Risk</TableHead>
              <TableHead className="w-28"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {funds.map((fund, index) => (
              <TableRow 
                key={fund.isin} 
                className="cursor-pointer hover:bg-muted/50 group transition-colors border-b border-border/30"
                onClick={() => onViewFund(fund)}
              >
                <TableCell onClick={(e) => e.stopPropagation()} className="pl-4">
                  <Checkbox 
                    checked={selectedFunds.includes(fund.isin)}
                    onCheckedChange={() => onSelectFund(fund.isin)}
                    className="border-border/50"
                  />
                </TableCell>
<TableCell>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="font-medium text-sm leading-tight group-hover:text-primary transition-colors line-clamp-1">
                        {fund.name}
                      </div>
                      <DataIntegrityBadge isin={fund.isin} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                        {fund.isin}
                      </span>
                      {fund.ticker && (
                        <Badge variant="outline" className="text-[10px] py-0 h-5 border-primary/30 text-primary">
                          {fund.ticker}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span>{fund.provider}</span>
                      {fund.exposure.esgRating && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Sparkles className="h-3 w-3 text-emerald-500" />
                            </TooltipTrigger>
                            <TooltipContent>ESG Rating: {fund.exposure.esgRating}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="space-y-1.5">
                    {fund.ratings?.starRating ? (
                      <StarRating rating={fund.ratings.starRating} size="sm" />
                    ) : (
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className="h-3 w-3 text-muted-foreground/20" />
                        ))}
                      </div>
                    )}
                    {fund.ratings?.analystRating ? (
                      <AnalystRatingBadge rating={fund.ratings.analystRating} size="sm" />
                    ) : (
                      <span className="text-[10px] text-muted-foreground">Not rated</span>
                    )}
                    {fund.ratings && (fund.ratings.peopleRating || fund.ratings.processRating) && (
                      <PillarRatings ratings={fund.ratings} compact />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1.5">
                    <Badge variant="outline" className={`text-xs ${getTypeColor(fund.fundType)}`}>
                      {fund.fundType}
                    </Badge>
                    <div className="text-xs text-muted-foreground">{fund.structure}</div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <span className={`font-medium ${fund.costs.ocf <= 0.25 ? "text-emerald-500" : fund.costs.ocf >= 1 ? "text-amber-500" : ""}`}>
                          {fund.costs.ocf.toFixed(2)}%
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="space-y-1">
                        <p className="font-medium">Cost Breakdown</p>
                        <p className="text-xs">AMC: {fund.costs.amc.toFixed(2)}%</p>
                        <p className="text-xs">Transaction: {fund.costs.transactionCosts.toFixed(2)}%</p>
                        <p className="text-xs font-medium border-t border-border pt-1">Total: {fund.costs.totalCostOfOwnership.toFixed(2)}%</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
                  {formatAUM(fund.aum)}
                </TableCell>
                <TableCell className={`text-right ${getReturnBg(fund.performance.oneYearReturn)} rounded-sm`}>
                  <div className={`flex items-center justify-end gap-1 font-semibold ${getReturnColor(fund.performance.oneYearReturn)}`}>
                    {fund.performance.oneYearReturn > 0 ? 
                      <TrendingUp className="h-3.5 w-3.5" /> : 
                      fund.performance.oneYearReturn < 0 ? 
                      <TrendingDown className="h-3.5 w-3.5" /> : null
                    }
                    {fund.performance.oneYearReturn > 0 ? '+' : ''}{fund.performance.oneYearReturn.toFixed(1)}%
                  </div>
                </TableCell>
                <TableCell className={`text-right font-medium ${getReturnColor(fund.performance.threeYearReturn)}`}>
                  {fund.performance.threeYearReturn > 0 ? '+' : ''}{fund.performance.threeYearReturn.toFixed(1)}%
                </TableCell>
                <TableCell className="text-center">
                  {(() => {
                    const q = getQuartileBadge(fund.performance.quartileRank1Y);
                    return (
                      <Badge className={`${q.bg} ${q.text} ${q.border} border font-semibold text-[10px] px-1.5`}>
                        Q{fund.performance.quartileRank1Y}
                      </Badge>
                    );
                  })()}
                </TableCell>
                <TableCell className="text-center">
                  <Badge className={`${getRiskColor(fund.risk.srriRating)} border font-semibold text-[10px] px-1.5`}>
                    {fund.risk.srriRating}/7
                  </Badge>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => onViewFund(fund)}
                            className="h-7 w-7 hover:bg-primary/10 hover:text-primary"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>View Details</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => onAddToComparison(fund)}
                            className="h-7 w-7 hover:bg-chart-2/10 hover:text-chart-2"
                          >
                            <Scale className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Add to Comparison</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {isAdmin && onEditRatings && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => onEditRatings(fund)}
                              className="h-7 w-7 hover:bg-amber-500/10 hover:text-amber-600"
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit Ratings</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </Card>
  );
}
