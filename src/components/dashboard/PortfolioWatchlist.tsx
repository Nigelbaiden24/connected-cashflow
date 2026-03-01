import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface WatchlistItem { id: string; symbol: string; asset_name: string; current_price: number; daily_change_percent: number; affected_clients: number; }

export function PortfolioWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

  useEffect(() => { fetchWatchlist(); }, []);

  const fetchWatchlist = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;
      const { data, error } = await supabase.from('portfolio_watchlist').select('*').eq('user_id', user.user.id).order('affected_clients', { ascending: false }).limit(6);
      if (error) throw error;
      setWatchlist(data || []);
    } catch (error) { console.error('Error fetching watchlist:', error); }
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 2 }).format(price);

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Eye className="h-4 w-4 text-primary" />
          Portfolio Watchlist
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1.5">
          {watchlist.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Eye className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No watchlist items</p>
            </div>
          ) : watchlist.map((item) => {
            const isPositive = item.daily_change_percent >= 0;
            return (
              <div key={item.id} className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-muted/10 hover:bg-muted/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">{item.symbol}</span>
                    <span className="text-xs text-muted-foreground">{item.asset_name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.affected_clients} portfolio{item.affected_clients !== 1 ? 's' : ''}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm text-foreground">{formatPrice(item.current_price)}</p>
                  <div className={`flex items-center justify-end gap-0.5 text-xs ${isPositive ? 'text-emerald-600' : 'text-destructive'}`}>
                    {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    <span>{isPositive ? '+' : ''}{item.daily_change_percent.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
