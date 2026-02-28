import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface WatchlistItem {
  id: string;
  symbol: string;
  asset_name: string;
  current_price: number;
  daily_change_percent: number;
  affected_clients: number;
}

export function PortfolioWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('portfolio_watchlist')
        .select('*')
        .eq('user_id', user.user.id)
        .order('affected_clients', { ascending: false })
        .limit(6);
      
      if (error) throw error;
      setWatchlist(data || []);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
    }).format(price);
  };

  return (
    <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-xl">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Eye className="h-4 w-4 text-primary" />
          </div>
          Portfolio Watchlist
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {watchlist.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Eye className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>No watchlist items yet</p>
            </div>
          ) : (
            watchlist.map((item) => {
              const isPositive = item.daily_change_percent >= 0;
              
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-muted/20 backdrop-blur-sm hover:bg-muted/40 hover:border-primary/20 cursor-pointer transition-all duration-300 group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm group-hover:text-primary transition-colors">{item.symbol}</span>
                      <span className="text-xs text-muted-foreground">{item.asset_name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground/60 mt-0.5">
                      {item.affected_clients} portfolio{item.affected_clients !== 1 ? 's' : ''} affected
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-medium text-sm">{formatPrice(item.current_price)}</p>
                    <div className={`flex items-center justify-end gap-1 text-xs ${isPositive ? 'text-emerald-500' : 'text-destructive'}`}>
                      {isPositive ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      <span>{isPositive ? '+' : ''}{item.daily_change_percent.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
