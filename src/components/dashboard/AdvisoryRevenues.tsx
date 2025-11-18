import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function AdvisoryRevenues() {
  const [revenues, setRevenues] = useState({
    monthly: 0,
    ytd: 0,
    topClients: [] as Array<{ name: string; amount: number }>
  });

  useEffect(() => {
    fetchRevenues();
  }, []);

  const fetchRevenues = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const now = new Date();
      const yearStart = new Date(now.getFullYear(), 0, 1);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Fetch YTD revenues
      const { data: ytdData } = await supabase
        .from('advisory_revenues')
        .select('amount')
        .eq('user_id', user.user.id)
        .gte('period_start', yearStart.toISOString().split('T')[0]);

      // Fetch monthly revenues
      const { data: monthlyData } = await supabase
        .from('advisory_revenues')
        .select('amount')
        .eq('user_id', user.user.id)
        .gte('period_start', monthStart.toISOString().split('T')[0]);

      // Fetch top clients by revenue
      const { data: clientRevenues } = await supabase
        .from('advisory_revenues')
        .select('client_id, amount, clients(name)')
        .eq('user_id', user.user.id)
        .order('amount', { ascending: false })
        .limit(3);

      const ytdTotal = ytdData?.reduce((sum, r) => sum + Number(r.amount), 0) || 0;
      const monthlyTotal = monthlyData?.reduce((sum, r) => sum + Number(r.amount), 0) || 0;

      const topClients = clientRevenues?.map(r => ({
        name: (r.clients as any)?.name || 'Unknown',
        amount: Number(r.amount)
      })) || [];

      setRevenues({
        monthly: monthlyTotal,
        ytd: ytdTotal,
        topClients
      });
    } catch (error) {
      console.error('Error fetching revenues:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Advisory Revenues
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Monthly Recurring</p>
            <p className="text-2xl font-bold">{formatCurrency(revenues.monthly)}</p>
            <div className="flex items-center gap-1 text-xs text-success">
              <TrendingUp className="h-3 w-3" />
              <span>+12% vs last month</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Fee Income YTD</p>
            <p className="text-2xl font-bold">{formatCurrency(revenues.ytd)}</p>
            <div className="flex items-center gap-1 text-xs text-success">
              <TrendingUp className="h-3 w-3" />
              <span>+18% vs last year</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Top Fee Producers</p>
            <div className="space-y-1">
              {revenues.topClients.length > 0 ? (
                revenues.topClients.map((client, i) => (
                  <div key={i} className="text-xs flex justify-between">
                    <span className="text-muted-foreground truncate">{client.name}</span>
                    <span className="font-medium">{formatCurrency(client.amount)}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">No data yet</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
