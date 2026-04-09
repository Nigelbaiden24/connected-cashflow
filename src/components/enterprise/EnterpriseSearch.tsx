import { useState, useCallback, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Search, Filter, X, Save, ChevronDown, ChevronUp, Calendar as CalendarIcon, Bookmark, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface FilterField {
  key: string;
  label: string;
  type: "select" | "range" | "date-range" | "text";
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
}

export interface ActiveFilters {
  [key: string]: string | number | Date | [number, number] | [Date | undefined, Date | undefined] | undefined;
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: ActiveFilters;
  createdAt: string;
}

interface EnterpriseSearchProps {
  placeholder?: string;
  filterFields?: FilterField[];
  onSearch: (query: string, filters: ActiveFilters) => void;
  storageKey?: string;
  className?: string;
  resultCount?: number;
}

// Simple fuzzy match
function fuzzyMatch(text: string, query: string): boolean {
  if (!query) return true;
  const lower = text.toLowerCase();
  const terms = query.toLowerCase().split(/\s+/);
  return terms.every(term => {
    if (lower.includes(term)) return true;
    // Allow 1 char difference for short terms
    if (term.length <= 2) return lower.includes(term);
    for (let i = 0; i < lower.length - term.length + 1; i++) {
      let mismatches = 0;
      for (let j = 0; j < term.length; j++) {
        if (lower[i + j] !== term[j]) mismatches++;
        if (mismatches > 1) break;
      }
      if (mismatches <= 1) return true;
    }
    return false;
  });
}

export function enterpriseFuzzyMatch(text: string, query: string): boolean {
  return fuzzyMatch(text, query);
}

export function EnterpriseSearch({
  placeholder = "Search...",
  filterFields = [],
  onSearch,
  storageKey = "enterprise_search",
  className,
  resultCount,
}: EnterpriseSearchProps) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<ActiveFilters>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState("");

  // Load saved searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`saved_searches_${storageKey}`);
      if (stored) setSavedSearches(JSON.parse(stored));
    } catch {}
  }, [storageKey]);

  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter(v => v !== undefined && v !== "" && v !== "all").length;
  }, [filters]);

  const handleSearch = useCallback(() => {
    onSearch(query, filters);
  }, [query, filters, onSearch]);

  useEffect(() => {
    const timeout = setTimeout(handleSearch, 300);
    return () => clearTimeout(timeout);
  }, [query, filters]);

  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
    setQuery("");
  };

  const saveSearch = () => {
    if (!saveName.trim()) return;
    const newSearch: SavedSearch = {
      id: crypto.randomUUID(),
      name: saveName.trim(),
      query,
      filters,
      createdAt: new Date().toISOString(),
    };
    const updated = [...savedSearches, newSearch];
    setSavedSearches(updated);
    localStorage.setItem(`saved_searches_${storageKey}`, JSON.stringify(updated));
    setSaveName("");
    setSaveDialogOpen(false);
    toast.success("Search preset saved");
  };

  const loadSearch = (search: SavedSearch) => {
    setQuery(search.query);
    setFilters(search.filters);
    toast.success(`Loaded preset: ${search.name}`);
  };

  const deleteSearch = (id: string) => {
    const updated = savedSearches.filter(s => s.id !== id);
    setSavedSearches(updated);
    localStorage.setItem(`saved_searches_${storageKey}`, JSON.stringify(updated));
    toast.success("Preset deleted");
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Main search bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {filterFields.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={cn(activeFilterCount > 0 && "border-primary text-primary")}
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        )}

        {/* Saved searches */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Bookmark className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Presets</span>
              {savedSearches.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {savedSearches.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            {savedSearches.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">No saved presets</div>
            ) : (
              savedSearches.map(search => (
                <DropdownMenuItem key={search.id} className="flex items-center justify-between">
                  <button onClick={() => loadSearch(search)} className="flex-1 text-left text-sm">
                    {search.name}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteSearch(search.id); }}
                    className="ml-2 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            {saveDialogOpen ? (
              <div className="p-2 space-y-2">
                <Input
                  placeholder="Preset name..."
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveSearch()}
                  autoFocus
                  className="h-8 text-sm"
                />
                <div className="flex gap-1">
                  <Button size="sm" variant="default" className="h-7 text-xs flex-1" onClick={saveSearch}>Save</Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <DropdownMenuItem onClick={() => setSaveDialogOpen(true)}>
                <Save className="h-4 w-4 mr-2" />
                Save current search
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active filter badges & result count */}
      {(activeFilterCount > 0 || resultCount !== undefined) && (
        <div className="flex items-center gap-2 flex-wrap">
          {resultCount !== undefined && (
            <span className="text-sm text-muted-foreground">{resultCount} result{resultCount !== 1 ? "s" : ""}</span>
          )}
          {activeFilterCount > 0 && (
            <>
              {Object.entries(filters).map(([key, value]) => {
                if (!value || value === "all") return null;
                const field = filterFields.find(f => f.key === key);
                const displayValue = typeof value === "string"
                  ? field?.options?.find(o => o.value === value)?.label || value
                  : String(value);
                return (
                  <Badge key={key} variant="secondary" className="gap-1 pr-1">
                    {field?.label}: {displayValue}
                    <button
                      onClick={() => updateFilter(key, undefined)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
              <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={clearFilters}>
                Clear all
              </Button>
            </>
          )}
        </div>
      )}

      {/* Expanded filter panel */}
      <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <CollapsibleContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-4 bg-muted/30 rounded-lg border">
            {filterFields.map(field => (
              <div key={field.key} className="space-y-1.5">
                <Label className="text-xs font-medium">{field.label}</Label>
                {field.type === "select" && field.options && (
                  <Select
                    value={(filters[field.key] as string) || "all"}
                    onValueChange={(v) => updateFilter(field.key, v === "all" ? undefined : v)}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {field.options.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {field.type === "text" && (
                  <Input
                    className="h-9 text-sm"
                    placeholder={`Filter by ${field.label.toLowerCase()}...`}
                    value={(filters[field.key] as string) || ""}
                    onChange={(e) => updateFilter(field.key, e.target.value || undefined)}
                  />
                )}
                {field.type === "range" && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      className="h-9 text-sm w-full"
                      placeholder={field.prefix ? `${field.prefix} Min` : "Min"}
                      value={Array.isArray(filters[field.key]) ? (filters[field.key] as [number, number])[0] || "" : ""}
                      onChange={(e) => {
                        const current = (filters[field.key] as [number, number]) || [undefined, undefined];
                        updateFilter(field.key, [e.target.value ? Number(e.target.value) : undefined, current[1]]);
                      }}
                    />
                    <span className="text-muted-foreground text-xs">to</span>
                    <Input
                      type="number"
                      className="h-9 text-sm w-full"
                      placeholder={field.prefix ? `${field.prefix} Max` : "Max"}
                      value={Array.isArray(filters[field.key]) ? (filters[field.key] as [number, number])[1] || "" : ""}
                      onChange={(e) => {
                        const current = (filters[field.key] as [number, number]) || [undefined, undefined];
                        updateFilter(field.key, [current[0], e.target.value ? Number(e.target.value) : undefined]);
                      }}
                    />
                  </div>
                )}
                {field.type === "date-range" && (
                  <div className="flex items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-9 text-xs w-full justify-start">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          {Array.isArray(filters[field.key]) && (filters[field.key] as [Date | undefined, Date | undefined])[0]
                            ? format((filters[field.key] as [Date, Date])[0], "dd/MM/yy")
                            : "From"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={Array.isArray(filters[field.key]) ? (filters[field.key] as [Date | undefined, Date | undefined])[0] : undefined}
                          onSelect={(date) => {
                            const current = (filters[field.key] as [Date | undefined, Date | undefined]) || [undefined, undefined];
                            updateFilter(field.key, [date, current[1]]);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-9 text-xs w-full justify-start">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          {Array.isArray(filters[field.key]) && (filters[field.key] as [Date | undefined, Date | undefined])[1]
                            ? format((filters[field.key] as [Date, Date])[1], "dd/MM/yy")
                            : "To"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={Array.isArray(filters[field.key]) ? (filters[field.key] as [Date | undefined, Date | undefined])[1] : undefined}
                          onSelect={(date) => {
                            const current = (filters[field.key] as [Date | undefined, Date | undefined]) || [undefined, undefined];
                            updateFilter(field.key, [current[0], date]);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
