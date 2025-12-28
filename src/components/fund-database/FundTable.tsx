import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Plus
} from "lucide-react";
import type { CompleteFund } from "@/types/fund";

interface FundTableProps {
  funds: CompleteFund[];
  selectedFunds: string[];
  onSelectFund: (isin: string) => void;
  onViewFund: (fund: CompleteFund) => void;
  onAddToComparison: (fund: CompleteFund) => void;
}

export function FundTable({ 
  funds, 
  selectedFunds, 
  onSelectFund, 
  onViewFund,
  onAddToComparison 
}: FundTableProps) {
  const getReturnColor = (value: number) => {
    if (value > 0) return "text-emerald-500";
    if (value < 0) return "text-red-500";
    return "text-muted-foreground";
  };

  const getRiskColor = (rating: number) => {
    if (rating <= 2) return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    if (rating <= 4) return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    return "bg-red-500/10 text-red-500 border-red-500/20";
  };

  const getQuartileBadge = (quartile: 1 | 2 | 3 | 4) => {
    const colors = {
      1: "bg-emerald-500/10 text-emerald-500",
      2: "bg-blue-500/10 text-blue-500",
      3: "bg-amber-500/10 text-amber-500",
      4: "bg-red-500/10 text-red-500"
    };
    return colors[quartile];
  };

  const formatAUM = (aum: number) => {
    if (aum >= 1000) return `$${(aum / 1000).toFixed(1)}B`;
    return `$${aum}M`;
  };

  return (
    <ScrollArea className="h-[600px] rounded-md border">
      <Table>
        <TableHeader className="sticky top-0 bg-background z-10">
          <TableRow>
            <TableHead className="w-10">
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
              />
            </TableHead>
            <TableHead className="min-w-[250px]">Fund</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">OCF</TableHead>
            <TableHead className="text-right">AUM</TableHead>
            <TableHead className="text-right">1Y</TableHead>
            <TableHead className="text-right">3Y</TableHead>
            <TableHead className="text-right">5Y</TableHead>
            <TableHead className="text-center">Quartile</TableHead>
            <TableHead className="text-center">Risk</TableHead>
            <TableHead className="w-24"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {funds.map((fund) => (
            <TableRow 
              key={fund.isin} 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onViewFund(fund)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox 
                  checked={selectedFunds.includes(fund.isin)}
                  onCheckedChange={() => onSelectFund(fund.isin)}
                />
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium text-sm leading-tight">{fund.name}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">{fund.isin}</span>
                    {fund.ticker && (
                      <Badge variant="outline" className="text-xs py-0">{fund.ticker}</Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">{fund.provider}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <Badge variant="outline" className="text-xs">{fund.fundType}</Badge>
                  <div className="text-xs text-muted-foreground">{fund.structure}</div>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className={fund.costs.ocf <= 0.25 ? "text-emerald-500 font-medium" : ""}>
                        {fund.costs.ocf.toFixed(2)}%
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>AMC: {fund.costs.amc.toFixed(2)}%</p>
                      <p>Transaction: {fund.costs.transactionCosts.toFixed(2)}%</p>
                      <p>Total: {fund.costs.totalCostOfOwnership.toFixed(2)}%</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell className="text-right text-sm">
                {formatAUM(fund.aum)}
              </TableCell>
              <TableCell className={`text-right font-medium ${getReturnColor(fund.performance.oneYearReturn)}`}>
                <div className="flex items-center justify-end gap-1">
                  {fund.performance.oneYearReturn > 0 ? 
                    <TrendingUp className="h-3 w-3" /> : 
                    fund.performance.oneYearReturn < 0 ? 
                    <TrendingDown className="h-3 w-3" /> : null
                  }
                  {fund.performance.oneYearReturn.toFixed(1)}%
                </div>
              </TableCell>
              <TableCell className={`text-right ${getReturnColor(fund.performance.threeYearReturn)}`}>
                {fund.performance.threeYearReturn.toFixed(1)}%
              </TableCell>
              <TableCell className={`text-right ${getReturnColor(fund.performance.fiveYearReturn)}`}>
                {fund.performance.fiveYearReturn.toFixed(1)}%
              </TableCell>
              <TableCell className="text-center">
                <Badge className={`${getQuartileBadge(fund.performance.quartileRank1Y)} border`}>
                  Q{fund.performance.quartileRank1Y}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge className={`${getRiskColor(fund.risk.srriRating)} border`}>
                  {fund.risk.srriRating}/7
                </Badge>
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <div className="flex gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="icon" variant="ghost" onClick={() => onViewFund(fund)}>
                          <Info className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>View Details</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="icon" variant="ghost" onClick={() => onAddToComparison(fund)}>
                          <Scale className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Add to Comparison</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
