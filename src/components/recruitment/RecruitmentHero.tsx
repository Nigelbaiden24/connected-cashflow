import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";

interface RecruitmentHeroProps {
  onSearch: (query: string) => void;
  heroImage?: string;
  imageLoading?: boolean;
}

export function RecruitmentHero({ onSearch, heroImage, imageLoading }: RecruitmentHeroProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        {imageLoading ? (
          <div className="w-full h-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center">
            <Loader2 className="h-12 w-12 text-white animate-spin" />
          </div>
        ) : heroImage ? (
          <>
            <img 
              src={heroImage} 
              alt="London Financial District" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-purple-900/85 to-pink-900/90" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600" />
        )}
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-white text-sm font-medium">Live Jobs Updated Daily</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
            Transform Your
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Career Journey
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
            Specialist recruitment in Technology & Finance, plus generalist services across all sectors
          </p>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto pt-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Job title, keywords, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="pl-12 h-14 text-base bg-white/95 backdrop-blur-sm border-white/20 shadow-xl"
              />
            </div>
            <Button 
              size="lg" 
              className="h-14 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl" 
              onClick={handleSearch}
            >
              Search Jobs
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            <span className="text-sm text-white/80">Popular:</span>
            {["Developer", "Analyst", "Manager", "Remote"].map((term) => (
              <Button
                key={term}
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery(term);
                  onSearch(term);
                }}
                className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:text-white"
              >
                {term}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Animated gradient overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/50 to-transparent" />
    </div>
  );
}
