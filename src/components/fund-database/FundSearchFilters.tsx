import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Search, 
  Filter, 
  ChevronDown, 
  X,
  RotateCcw
} from "lucide-react";
import { fundCategories, fundProviders, assetClasses, fundTypes } from "@/data/fundDatabase";
import type { FundSearchFilters as FiltersType } from "@/types/fund";

interface FundSearchFiltersProps {
  filters: FiltersType;
  onFiltersChange: (filters: FiltersType) => void;
  resultCount: number;
}

export function FundSearchFilters({ filters, onFiltersChange, resultCount }: FundSearchFiltersProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const updateFilter = <K extends keyof FiltersType>(key: K, value: FiltersType[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    onFiltersChange({
      searchQuery: "",
      fundTypes: [],
      assetClasses: [],
      providers: [],
      categories: [],
      riskRatingMin: 1,
      riskRatingMax: 7,
      ocfMax: undefined,
      aumMin: undefined,
      performanceMin1Y: undefined,
      ucitsOnly: false,
      accumulatingOnly: false,
      esgOnly: false,
      sortBy: 'name',
      sortOrder: 'asc'
    });
  };

  const activeFilterCount = [
    filters.fundTypes?.length,
    filters.assetClasses?.length,
    filters.providers?.length,
    filters.categories?.length,
    filters.ocfMax ? 1 : 0,
    filters.aumMin ? 1 : 0,
    filters.performanceMin1Y ? 1 : 0,
    filters.ucitsOnly ? 1 : 0,
    filters.accumulatingOnly ? 1 : 0,
    filters.esgOnly ? 1 : 0
  ].reduce((sum, count) => sum + (count || 0), 0);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Search & Filter
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{resultCount} funds</Badge>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-1">
                <RotateCcw className="h-3 w-3" />
                Clear ({activeFilterCount})
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by fund name, ISIN, or ticker..."
            value={filters.searchQuery || ""}
            onChange={(e) => updateFilter("searchQuery", e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Quick Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Fund Type</Label>
            <Select 
              value={filters.fundTypes?.[0] || "all"} 
              onValueChange={(v) => updateFilter("fundTypes", v === "all" ? [] : [v])}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {fundTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Asset Class</Label>
            <Select 
              value={filters.assetClasses?.[0] || "all"} 
              onValueChange={(v) => updateFilter("assetClasses", v === "all" ? [] : [v])}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Assets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assets</SelectItem>
                {assetClasses.map(ac => (
                  <SelectItem key={ac} value={ac}>{ac}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Provider</Label>
            <Select 
              value={filters.providers?.[0] || "all"} 
              onValueChange={(v) => updateFilter("providers", v === "all" ? [] : [v])}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Providers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                {fundProviders.map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Category</Label>
            <Select 
              value={filters.categories?.[0] || "all"} 
              onValueChange={(v) => updateFilter("categories", v === "all" ? [] : [v])}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {fundCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Filters */}
        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Advanced Filters
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Risk Rating */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Risk Rating (SRRI): {filters.riskRatingMin || 1} - {filters.riskRatingMax || 7}
                </Label>
                <div className="px-2">
                  <Slider
                    value={[filters.riskRatingMin || 1, filters.riskRatingMax || 7]}
                    min={1}
                    max={7}
                    step={1}
                    onValueChange={([min, max]) => {
                      updateFilter("riskRatingMin", min);
                      updateFilter("riskRatingMax", max);
                    }}
                  />
                </div>
              </div>

              {/* Max OCF */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Max OCF (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="e.g., 0.50"
                  value={filters.ocfMax || ""}
                  onChange={(e) => updateFilter("ocfMax", e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </div>

              {/* Min AUM */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Min AUM (£M)</Label>
                <Input
                  type="number"
                  placeholder="e.g., 100"
                  value={filters.aumMin || ""}
                  onChange={(e) => updateFilter("aumMin", e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </div>
            </div>

            {/* Toggle Filters */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={filters.ucitsOnly || false}
                  onCheckedChange={(v) => updateFilter("ucitsOnly", v)}
                />
                <Label className="text-sm">UCITS Only</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={filters.accumulatingOnly || false}
                  onCheckedChange={(v) => updateFilter("accumulatingOnly", v)}
                />
                <Label className="text-sm">Accumulating Only</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={filters.esgOnly || false}
                  onCheckedChange={(v) => updateFilter("esgOnly", v)}
                />
                <Label className="text-sm">ESG Funds Only</Label>
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex gap-4">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Sort By</Label>
                <Select 
                  value={filters.sortBy || "name"} 
                  onValueChange={(v) => updateFilter("sortBy", v as FiltersType['sortBy'])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="performance1Y">1Y Performance</SelectItem>
                    <SelectItem value="performance3Y">3Y Performance</SelectItem>
                    <SelectItem value="ocf">OCF</SelectItem>
                    <SelectItem value="aum">AUM</SelectItem>
                    <SelectItem value="risk">Risk Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-32">
                <Label className="text-xs text-muted-foreground">Order</Label>
                <Select 
                  value={filters.sortOrder || "asc"} 
                  onValueChange={(v) => updateFilter("sortOrder", v as 'asc' | 'desc')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
