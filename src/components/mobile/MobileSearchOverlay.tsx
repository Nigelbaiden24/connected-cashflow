import { useState, useEffect, useRef } from "react";
import { Search, X, ArrowLeft, Clock, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { TranslatedText } from "@/components/TranslatedText";

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  category?: string;
  path?: string;
}

interface MobileSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch?: (query: string) => void;
  results?: SearchResult[];
  recentSearches?: string[];
  trendingSearches?: string[];
  onSelectResult?: (result: SearchResult) => void;
  onSelectRecentSearch?: (query: string) => void;
  placeholder?: string;
  isLoading?: boolean;
}

export function MobileSearchOverlay({
  isOpen,
  onClose,
  onSearch,
  results = [],
  recentSearches = [],
  trendingSearches = [],
  onSelectResult,
  onSelectRecentSearch,
  placeholder = "Search...",
  isLoading = false,
}: MobileSearchOverlayProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus input when overlay opens
      setTimeout(() => inputRef.current?.focus(), 100);
      // Prevent body scroll
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch?.(value);
  };

  const handleClear = () => {
    setQuery("");
    inputRef.current?.focus();
    onSearch?.("");
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[60] bg-background",
        "animate-in fade-in-0 duration-200"
      )}
    >
      {/* Search header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border safe-area-top">
        <div className="flex items-center gap-2 p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-10 w-10 touch-target shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={placeholder}
              className="pl-9 pr-10 h-10 text-base"
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClear}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Search content */}
      <ScrollArea className="h-[calc(100vh-60px-env(safe-area-inset-top))]">
        <div className="p-4 space-y-6">
          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          )}

          {/* Search results */}
          {!isLoading && query && results.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground px-1">
                <TranslatedText>Results</TranslatedText>
              </h3>
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => onSelectResult?.(result)}
                  className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-accent text-left transition-colors touch-target"
                >
                  <Search className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{result.title}</p>
                    {result.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {result.description}
                      </p>
                    )}
                    {result.category && (
                      <span className="text-xs text-primary">{result.category}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {!isLoading && query && results.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                <TranslatedText>No results found</TranslatedText>
              </p>
            </div>
          )}

          {/* Recent searches */}
          {!query && recentSearches.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground px-1 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <TranslatedText>Recent</TranslatedText>
              </h3>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(search);
                    onSelectRecentSearch?.(search);
                    onSearch?.(search);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent text-left transition-colors touch-target"
                >
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm truncate">{search}</span>
                </button>
              ))}
            </div>
          )}

          {/* Trending searches */}
          {!query && trendingSearches.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground px-1 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <TranslatedText>Trending</TranslatedText>
              </h3>
              {trendingSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(search);
                    onSearch?.(search);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent text-left transition-colors touch-target"
                >
                  <TrendingUp className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm truncate">{search}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
