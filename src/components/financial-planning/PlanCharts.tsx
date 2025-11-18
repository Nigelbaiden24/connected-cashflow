import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from "recharts";

interface PlanChartsProps {
  plans: any[];
}

export function PlanCharts({ plans }: PlanChartsProps) {
  // Plan type distribution
  const planTypeData = plans.reduce((acc, plan) => {
    const type = plan.plan_type || "unknown";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(planTypeData).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  // Risk distribution
  const riskData = plans.reduce((acc, plan) => {
    const risk = plan.risk_tolerance || "unknown";
    acc[risk] = (acc[risk] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const riskBarData = Object.entries(riskData).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    count: value
  }));

  // AUM trend (simulated monthly data)
  const aumTrendData = Array.from({ length: 12 }, (_, i) => ({
    month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
    aum: plans.reduce((sum, p) => sum + (p.current_net_worth || 0), 0) * (0.85 + Math.random() * 0.3)
  }));

  const COLORS = ["hsl(var(--financial-blue))", "hsl(var(--financial-green))", "hsl(var(--financial-orange))", "hsl(var(--financial-pink))", "hsl(var(--primary))"];

  const formatCurrency = (value: number) => {
    return `£${(value / 1000000).toFixed(1)}M`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Plan Type Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {plans.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Risk Tolerance Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {plans.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={riskBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem"
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--financial-blue))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">AUM Trend (12 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          {plans.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={aumTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={formatCurrency}
                />
                <Tooltip 
                  formatter={(value: number) => [`£${value.toLocaleString()}`, "AUM"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem"
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="aum" 
                  stroke="hsl(var(--financial-green))" 
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--financial-green))", r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Total AUM"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}