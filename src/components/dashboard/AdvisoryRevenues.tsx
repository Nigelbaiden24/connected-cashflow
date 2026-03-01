import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp } from "lucide-react";
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

      const { data: ytdData } = await supabase.from('advisory_revenues').select('amount').eq('user_id', user.user.id).gte('period_start', yearStart.toISOString().split('T')[0]);
      const { data: monthlyData } = await supabase.from('advisory_revenues').select('amount').eq('user_id', user.user.id).gte('period_start', monthStart.toISOString().split('T')[0]);
      const { data: clientRevenues } = await supabase.from('advisory_revenues').select('client_id, amount, clients(name)').eq('user_id', user.user.id).order('amount', { ascending: false }).limit(3);

      setRevenues({
        monthly: monthlyData?.reduce((sum, r) => sum + Number(r.amount), 0) || 0,
        ytd: ytdData?.reduce((sum, r) => sum + Number(r.amount), 0) || 0,
        topClients: clientRevenues?.map(r => ({ name: (r.clients as any)?.name || 'Unknown', amount: Number(r.amount) })) || []
      });
    } catch (error) {
      console.error('Error fetching revenues:', error);
    }
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

  return (
    <Card className="border-border bg-card shadow-sm col-span-2">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <DollarSign className="h-4 w-4 text-primary" />
          Advisory Revenues
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 rounded-lg border border-border bg-muted/20">
            <p className="text-xs text-muted-foreground mb-1">Monthly Recurring</p>
            <p className="text-xl font-bold text-foreground">{formatCurrency(revenues.monthly)}</p>
            <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1">
              <TrendingUp className="h-3 w-3" />
              +12% vs last month
            </div>
          </div>
          <div className="p-3 rounded-lg border border-border bg-muted/20">
            <p className="text-xs text-muted-foreground mb-1">Fee Income YTD</p>
            <p className="text-xl font-bold text-foreground">{formatCurrency(revenues.ytd)}</p>
            <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1">
              <TrendingUp className="h-3 w-3" />
              +18% vs last year
            </div>
          </div>
          <div className="p-3 rounded-lg border border-border bg-muted/20">
            <p className="text-xs text-muted-foreground mb-1">Top Fee Producers</p>
            <div className="space-y-1 mt-1">
              {revenues.topClients.length > 0 ? (
                revenues.topClients.map((client, i) => (
                  <div key={i} className="text-xs flex justify-between items-center">
                    <span className="text-muted-foreground truncate">{client.name}</span>
                    <span className="font-medium text-foreground">{formatCurrency(client.amount)}</span>
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
