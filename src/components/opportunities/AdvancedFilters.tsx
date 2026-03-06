import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Filter, X, ChevronDown, MapPin, DollarSign, TrendingUp, Shield, Layers } from "lucide-react";

interface FilterState {
  geography: string;
  ticketMin: string;
  ticketMax: string;
  expectedReturn: string;
  riskRating: string;
  dealStage: string;
}

const initialFilters: FilterState = {
  geography: "all",
  ticketMin: "",
  ticketMax: "",
  expectedReturn: "all",
  riskRating: "all",
  dealStage: "all",
};

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  activeCategory: string;
}

export function AdvancedFilters({ onFiltersChange, activeCategory }: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [isOpen, setIsOpen] = useState(false);

  const activeCount = Object.entries(filters).filter(
    ([key, val]) => val !== "" && val !== "all"
  ).length;

  const updateFilter = (key: keyof FilterState, value: string) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    onFiltersChange(next);
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    onFiltersChange(initialFilters);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 relative">
          <Filter className="h-4 w-4" />
          Advanced Filters
          <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          {activeCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-primary">
              {activeCount}
            </Badge>
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3">
        <Card className="border-border/50 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
          <CardContent className="pt-4 pb-4">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              {/* Geography */}
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-3 w-3" /> Geography
                </Label>
                <Select value={filters.geography} onValueChange={(v) => updateFilter("geography", v)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="All regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    <SelectItem value="UK">United Kingdom</SelectItem>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="Europe">Europe</SelectItem>
                    <SelectItem value="Asia">Asia</SelectItem>
                    <SelectItem value="Middle East">Middle East</SelectItem>
                    <SelectItem value="Africa">Africa</SelectItem>
                    <SelectItem value="South America">South America</SelectItem>
                    <SelectItem value="Global">Global</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Ticket Size Min */}
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1 text-muted-foreground">
                  <DollarSign className="h-3 w-3" /> Min Ticket (£)
                </Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.ticketMin}
                  onChange={(e) => updateFilter("ticketMin", e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              {/* Ticket Size Max */}
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1 text-muted-foreground">
                  <DollarSign className="h-3 w-3" /> Max Ticket (£)
                </Label>
                <Input
                  type="number"
                  placeholder="No limit"
                  value={filters.ticketMax}
                  onChange={(e) => updateFilter("ticketMax", e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              {/* Expected Return */}
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1 text-muted-foreground">
                  <TrendingUp className="h-3 w-3" /> Expected Return
                </Label>
                <Select value={filters.expectedReturn} onValueChange={(v) => updateFilter("expectedReturn", v)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    <SelectItem value="0-5">0-5%</SelectItem>
                    <SelectItem value="5-10">5-10%</SelectItem>
                    <SelectItem value="10-20">10-20%</SelectItem>
                    <SelectItem value="20-50">20-50%</SelectItem>
                    <SelectItem value="50+">50%+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Risk Rating */}
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1 text-muted-foreground">
                  <Shield className="h-3 w-3" /> Risk Rating
                </Label>
                <Select value={filters.riskRating} onValueChange={(v) => updateFilter("riskRating", v)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    <SelectItem value="Gold">Gold</SelectItem>
                    <SelectItem value="Silver">Silver</SelectItem>
                    <SelectItem value="Bronze">Bronze</SelectItem>
                    <SelectItem value="Neutral">Neutral</SelectItem>
                    <SelectItem value="Negative">Negative</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Deal Stage */}
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1 text-muted-foreground">
                  <Layers className="h-3 w-3" /> Deal Stage
                </Label>
                <Select value={filters.dealStage} onValueChange={(v) => updateFilter("dealStage", v)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Stage</SelectItem>
                    <SelectItem value="pre-seed">Pre-Seed</SelectItem>
                    <SelectItem value="seed">Seed</SelectItem>
                    <SelectItem value="series-a">Series A</SelectItem>
                    <SelectItem value="series-b">Series B+</SelectItem>
                    <SelectItem value="growth">Growth</SelectItem>
                    <SelectItem value="buyout">Buyout</SelectItem>
                    <SelectItem value="asset-backed">Asset Backed</SelectItem>
                    <SelectItem value="mature">Mature</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {activeCount > 0 && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{activeCount} filter{activeCount > 1 ? "s" : ""} active</span>
                </div>
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs gap-1">
                  <X className="h-3 w-3" /> Clear all
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}

export type { FilterState };
