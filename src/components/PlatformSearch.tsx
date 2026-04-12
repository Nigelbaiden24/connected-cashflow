import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchableRoute {
  title: string;
  url: string;
  group: string;
  keywords: string[];
}

interface PlatformSearchProps {
  routes: SearchableRoute[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PlatformSearch({ routes, open, onOpenChange }: PlatformSearchProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    if (!query.trim()) return routes;
    const q = query.toLowerCase();
    return routes.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.group.toLowerCase().includes(q) ||
      r.keywords.some(k => k.toLowerCase().includes(q))
    );
  }, [query, routes]);

  useEffect(() => { setSelectedIndex(0); }, [query]);

  const handleSelect = useCallback((route: SearchableRoute) => {
    navigate(route.url);
    onOpenChange(false);
    setQuery("");
  }, [navigate, onOpenChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, filtered.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && filtered[selectedIndex]) { handleSelect(filtered[selectedIndex]); }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  useEffect(() => { if (!open) setQuery(""); }, [open]);

  const grouped = useMemo(() => {
    const groups: Record<string, SearchableRoute[]> = {};
    filtered.forEach(r => {
      if (!groups[r.group]) groups[r.group] = [];
      groups[r.group].push(r);
    });
    return groups;
  }, [filtered]);

  let flatIndex = -1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden" onKeyDown={handleKeyDown}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, tools, features..."
            className="border-0 shadow-none focus-visible:ring-0 text-base h-auto py-0 px-0"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ESC
          </kbd>
        </div>
        <div className="max-h-[400px] overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-muted-foreground text-sm">
              No results for "{query}"
            </div>
          ) : (
            Object.entries(grouped).map(([group, items]) => (
              <div key={group}>
                <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group}
                </div>
                {items.map((route) => {
                  flatIndex++;
                  const idx = flatIndex;
                  return (
                    <button
                      key={route.url}
                      onClick={() => handleSelect(route)}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors",
                        idx === selectedIndex
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted/50"
                      )}
                    >
                      <span className="font-medium">{route.title}</span>
                      <ArrowRight className={cn("h-3.5 w-3.5 transition-opacity", idx === selectedIndex ? "opacity-100" : "opacity-0")} />
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
        <div className="border-t border-border/50 px-4 py-2 flex items-center justify-between text-[10px] text-muted-foreground">
          <span>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
          <div className="flex items-center gap-2">
            <kbd className="rounded border bg-muted px-1 py-0.5 font-mono">↑↓</kbd>
            <span>navigate</span>
            <kbd className="rounded border bg-muted px-1 py-0.5 font-mono">↵</kbd>
            <span>select</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper to generate searchable routes from nav groups
export function buildSearchableRoutes(navGroups: { label: string; items: { title: string; url: string }[] }[]): SearchableRoute[] {
  return navGroups.flatMap(g =>
    g.items.map(item => ({
      title: item.title,
      url: item.url,
      group: g.label,
      keywords: [item.title, g.label, ...item.title.split(/[\s&]+/)],
    }))
  );
}
