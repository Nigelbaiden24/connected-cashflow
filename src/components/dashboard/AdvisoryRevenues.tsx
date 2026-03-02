import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface MonthlyRevenue {
  month: string;
  amount: number;
}

export function AdvisoryRevenues() {
  const [revenues, setRevenues] = useState({
    monthly: 0,
    ytd: 0,
    topClients: [] as Array<{ name: string; amount: number }>,
    monthlyTrend: [] as MonthlyRevenue[],
  });

  useEffect(() => { fetchRevenues(); }, []);

  const fetchRevenues = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const now = new Date();
      const yearStart = new Date(now.getFullYear(), 0, 1);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const { data: ytdData } = await supabase.from('advisory_revenues').select('amount, period_start').eq('user_id', user.user.id).gte('period_start', yearStart.toISOString().split('T')[0]);
      const { data: monthlyData } = await supabase.from('advisory_revenues').select('amount').eq('user_id', user.user.id).gte('period_start', monthStart.toISOString().split('T')[0]);
      const { data: clientRevenues } = await supabase.from('advisory_revenues').select('client_id, amount, clients(name)').eq('user_id', user.user.id).order('amount', { ascending: false }).limit(3);

      // Build monthly trend from real data
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyTrend: MonthlyRevenue[] = [];
      for (let i = 0; i <= now.getMonth(); i++) {
        const monthRevenues = ytdData?.filter(r => {
          const d = new Date(r.period_start);
          return d.getMonth() === i;
        }) || [];
        monthlyTrend.push({
          month: monthNames[i],
          amount: monthRevenues.reduce((sum, r) => sum + Number(r.amount), 0),
        });
      }

      setRevenues({
        monthly: monthlyData?.reduce((sum, r) => sum + Number(r.amount), 0) || 0,
        ytd: ytdData?.reduce((sum, r) => sum + Number(r.amount), 0) || 0,
        topClients: clientRevenues?.map(r => ({ name: (r.clients as any)?.name || 'Unknown', amount: Number(r.amount) })) || [],
        monthlyTrend,
      });
    } catch (error) {
      console.error('Error fetching revenues:', error);
    }
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

  return (
    <Card className="border-border bg-card shadow-sm col-span-2">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base font-semibold">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            Advisory Revenues
          </div>
          <span className="text-xs font-normal text-muted-foreground">YTD: {formatCurrency(revenues.ytd)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Revenue Trend Chart */}
          <div className="lg:col-span-2 h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenues.monthlyTrend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                />
                <Area type="monotone" dataKey="amount" stroke="hsl(142, 71%, 45%)" strokeWidth={2.5} fill="url(#revGradient)" animationDuration={1500} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Summary */}
          <div className="space-y-3">
            <div className="p-3 rounded-lg border border-border bg-muted/20">
              <p className="text-xs text-muted-foreground mb-1">Monthly Recurring</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(revenues.monthly)}</p>
              <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1">
                <TrendingUp className="h-3 w-3" />
                +12% vs last month
              </div>
            </div>
            <div className="p-3 rounded-lg border border-border bg-muted/20">
              <p className="text-xs text-muted-foreground mb-1">Top Fee Producers</p>
              <div className="space-y-1.5 mt-1">
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
        </div>
      </CardContent>
    </Card>
  );
}
