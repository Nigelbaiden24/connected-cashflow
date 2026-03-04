import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Sector thumbnail imports
import ukPropertyImg from "@/assets/sectors/uk-property.jpg";
import vehiclesImg from "@/assets/sectors/vehicles.jpg";
import overseasPropertyImg from "@/assets/sectors/overseas-property.jpg";
import businessesImg from "@/assets/sectors/businesses.jpg";
import stocksImg from "@/assets/sectors/stocks.jpg";
import cryptoImg from "@/assets/sectors/crypto.jpg";
import privateEquityImg from "@/assets/sectors/private-equity.jpg";
import memorabiliaImg from "@/assets/sectors/memorabilia.jpg";
import commoditiesImg from "@/assets/sectors/commodities.jpg";
import fundsImg from "@/assets/sectors/funds.jpg";

export const sectorThumbnails: Record<string, string> = {
  uk_property: ukPropertyImg,
  vehicles: vehiclesImg,
  overseas_property: overseasPropertyImg,
  businesses: businessesImg,
  stocks: stocksImg,
  crypto: cryptoImg,
  private_equity: privateEquityImg,
  memorabilia: memorabiliaImg,
  commodities: commoditiesImg,
  funds: fundsImg,
};

interface SectorFolderGridProps {
  categoryConfig: Record<string, { label: string; icon: any; color: string; subCategories: string[] }>;
  categoryCounts: Record<string, number>;
  onSelectCategory: (category: string) => void;
}

export function SectorFolderGrid({ categoryConfig, categoryCounts, onSelectCategory }: SectorFolderGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {Object.entries(categoryConfig).map(([key, config]) => {
        const Icon = config.icon;
        const count = categoryCounts[key] || 0;
        const thumbnail = sectorThumbnails[key];

        return (
          <Card
            key={key}
            onClick={() => onSelectCategory(key)}
            className={cn(
              "group cursor-pointer overflow-hidden border-border/40 hover:border-primary/50",
              "hover:shadow-xl hover:shadow-primary/5 transition-all duration-300",
              "hover:-translate-y-1"
            )}
          >
            {/* Thumbnail */}
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
              {thumbnail ? (
                <img
                  src={thumbnail}
                  alt={config.label}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10">
                  <Icon className="h-10 w-10 text-muted-foreground/40" />
                </div>
              )}
              {/* Dark overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              {/* Count badge */}
              {count > 0 && (
                <Badge className="absolute top-2 right-2 bg-primary/90 text-primary-foreground text-xs backdrop-blur-sm">
                  {count}
                </Badge>
              )}

              {/* Folder label overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="flex items-center gap-1.5">
                  <Icon className="h-4 w-4 text-white/90 flex-shrink-0" />
                  <span className="text-white font-semibold text-sm leading-tight line-clamp-2">
                    {config.label}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
