import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight } from "lucide-react";
import { useState } from "react";

interface RecruitmentHeroProps {
  onSearch: (query: string) => void;
}

export function RecruitmentHero({ onSearch }: RecruitmentHeroProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-primary/10 via-background to-background border-b">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Find Your Perfect Role
          </h1>
          <p className="text-xl text-muted-foreground">
            Specialist recruitment in Technology & Finance, plus generalist services across all sectors
          </p>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Job title, keywords, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10 h-12 text-base"
              />
            </div>
            <Button size="lg" className="h-12 px-8" onClick={handleSearch}>
              Search Jobs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            <span className="text-sm text-muted-foreground">Popular:</span>
            {["Developer", "Analyst", "Manager", "Remote"].map((term) => (
              <Button
                key={term}
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery(term);
                  onSearch(term);
                }}
              >
                {term}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
