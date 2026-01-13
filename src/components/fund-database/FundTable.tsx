import { memo, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  TrendingUp, 
  TrendingDown,
  Scale,
  Star,
  ChevronRight,
  Sparkles,
  Settings
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

// Helper functions moved outside component to avoid recreation
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

const QUARTILE_CONFIG = {
  1: { bg: "bg-emerald-500/10", text: "text-emerald-600", border: "border-emerald-500/30" },
  2: { bg: "bg-blue-500/10", text: "text-blue-600", border: "border-blue-500/30" },
  3: { bg: "bg-amber-500/10", text: "text-amber-600", border: "border-amber-500/30" },
  4: { bg: "bg-red-500/10", text: "text-red-600", border: "border-red-500/30" }
} as const;

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

// Memoized fund row component for performance
const FundRow = memo(({ 
  fund, 
  isSelected, 
  onSelect, 
  onView, 
  onCompare, 
  onEditRatings,
  isAdmin 
}: {
  fund: CompleteFund;
  isSelected: boolean;
  onSelect: () => void;
  onView: () => void;
  onCompare: () => void;
  onEditRatings?: () => void;
  isAdmin: boolean;
}) => {
  const q = QUARTILE_CONFIG[fund.performance.quartileRank1Y];

  return (
    <TableRow 
      className="cursor-pointer hover:bg-muted/50 group transition-colors border-b border-border/30"
      onClick={onView}
    >
      <TableCell onClick={(e) => e.stopPropagation()} className="pl-4">
        <Checkbox 
          checked={isSelected}
          onCheckedChange={onSelect}
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
              <span title={`ESG Rating: ${fund.exposure.esgRating}`}>
                <Sparkles className="h-3 w-3 text-emerald-500" />
              </span>
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
      <TableCell className="text-right whitespace-nowrap">
        <span className={`font-medium ${fund.costs.ocf <= 0.25 ? "text-emerald-500" : fund.costs.ocf >= 1 ? "text-amber-500" : ""}`}>
          {fund.costs.ocf.toFixed(2)}%
        </span>
      </TableCell>
      <TableCell className="text-right text-sm text-muted-foreground whitespace-nowrap">
        {formatAUM(fund.aum)}
      </TableCell>
      <TableCell className={`text-right whitespace-nowrap ${getReturnBg(fund.performance.oneYearReturn)} rounded-sm`}>
        <div className={`flex items-center justify-end gap-1 font-semibold ${getReturnColor(fund.performance.oneYearReturn)}`}>
          {fund.performance.oneYearReturn > 0 ? 
            <TrendingUp className="h-3.5 w-3.5" /> : 
            fund.performance.oneYearReturn < 0 ? 
            <TrendingDown className="h-3.5 w-3.5" /> : null
          }
          {fund.performance.oneYearReturn > 0 ? '+' : ''}{fund.performance.oneYearReturn.toFixed(1)}%
        </div>
      </TableCell>
      <TableCell className={`text-right font-medium whitespace-nowrap ${getReturnColor(fund.performance.threeYearReturn)}`}>
        {fund.performance.threeYearReturn > 0 ? '+' : ''}{fund.performance.threeYearReturn.toFixed(1)}%
      </TableCell>
      <TableCell className="text-center whitespace-nowrap">
        <Badge className={`${q.bg} ${q.text} ${q.border} border font-semibold text-[10px] px-1.5`}>
          Q{fund.performance.quartileRank1Y}
        </Badge>
      </TableCell>
      <TableCell className="text-center whitespace-nowrap">
        <Badge className={`${getRiskColor(fund.risk.srriRating)} border font-semibold text-[10px] px-1.5`}>
          {fund.risk.srriRating}/7
        </Badge>
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={onView}
            className="h-7 w-7 hover:bg-primary/10 hover:text-primary"
            title="View Details"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={onCompare}
            className="h-7 w-7 hover:bg-chart-2/10 hover:text-chart-2"
            title="Add to Comparison"
          >
            <Scale className="h-4 w-4" />
          </Button>
          {isAdmin && onEditRatings && (
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={onEditRatings}
              className="h-7 w-7 hover:bg-amber-500/10 hover:text-amber-600"
              title="Edit Ratings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
});

FundRow.displayName = 'FundRow';

export function FundTable({ 
  funds, 
  selectedFunds, 
  onSelectFund, 
  onViewFund,
  onAddToComparison,
  onEditRatings,
  isAdmin = false
}: FundTableProps) {
  // Memoized callbacks for select all
  const handleSelectAll = useCallback((checked: boolean | 'indeterminate') => {
    funds.forEach(f => {
      if ((checked === true && !selectedFunds.includes(f.isin)) || 
          (checked === false && selectedFunds.includes(f.isin))) {
        onSelectFund(f.isin);
      }
    });
  }, [funds, selectedFunds, onSelectFund]);

  return (
    <Card className="border-border/50 overflow-hidden bg-gradient-to-br from-background to-muted/10">
      <ScrollArea className="h-[650px]">
        <div className="overflow-x-auto">
          <Table className="min-w-[1200px]">
            <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 border-b border-border/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10 pl-4 whitespace-nowrap">
                  <Checkbox 
                    checked={selectedFunds.length === funds.length && funds.length > 0}
                    onCheckedChange={handleSelectAll}
                    className="border-border/50"
                  />
                </TableHead>
                <TableHead className="min-w-[280px] font-semibold text-foreground whitespace-nowrap">Fund</TableHead>
                <TableHead className="min-w-[120px] font-semibold text-foreground whitespace-nowrap">Rating</TableHead>
                <TableHead className="min-w-[100px] font-semibold text-foreground whitespace-nowrap">Type</TableHead>
                <TableHead className="min-w-[80px] text-right font-semibold text-foreground whitespace-nowrap">OCF</TableHead>
                <TableHead className="min-w-[100px] text-right font-semibold text-foreground whitespace-nowrap">AUM</TableHead>
                <TableHead className="min-w-[90px] text-right font-semibold text-foreground whitespace-nowrap">1Y Return</TableHead>
                <TableHead className="min-w-[90px] text-right font-semibold text-foreground whitespace-nowrap">3Y Return</TableHead>
                <TableHead className="min-w-[70px] text-center font-semibold text-foreground whitespace-nowrap">Quartile</TableHead>
                <TableHead className="min-w-[70px] text-center font-semibold text-foreground whitespace-nowrap">Risk</TableHead>
                <TableHead className="w-28 whitespace-nowrap"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {funds.map((fund) => (
                <FundRow
                  key={fund.isin}
                  fund={fund}
                  isSelected={selectedFunds.includes(fund.isin)}
                  onSelect={() => onSelectFund(fund.isin)}
                  onView={() => onViewFund(fund)}
                  onCompare={() => onAddToComparison(fund)}
                  onEditRatings={onEditRatings ? () => onEditRatings(fund) : undefined}
                  isAdmin={isAdmin}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </Card>
  );
}