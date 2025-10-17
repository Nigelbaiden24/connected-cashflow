import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, CreditCard, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Revenue = () => {
  const revenueStreams = [
    { name: "Product Sales", amount: 125000, growth: 12.5, trend: "up" },
    { name: "Subscriptions", amount: 48000, growth: 8.3, trend: "up" },
    { name: "Consulting", amount: 32000, growth: -3.2, trend: "down" },
    { name: "Licensing", amount: 18000, growth: 15.7, trend: "up" },
  ];

  const recentTransactions = [
    { id: 1, client: "Acme Corp", amount: 15000, date: "2024-02-18", status: "completed" },
    { id: 2, client: "TechStart Inc", amount: 8500, date: "2024-02-17", status: "completed" },
    { id: 3, client: "Global Solutions", amount: 22000, date: "2024-02-16", status: "pending" },
    { id: 4, client: "Innovation Labs", amount: 12000, date: "2024-02-15", status: "completed" },
  ];

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Revenue Tracking</h1>
          <p className="text-muted-foreground">Monitor income streams and financial performance</p>
        </div>
        <Button className="gap-2">
          <DollarSign className="h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£223,000</div>
            <p className="text-xs text-success flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" />
              10.2% vs last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Recurring</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£48,000</div>
            <p className="text-xs text-success flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" />
              8.3% growth
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Transaction</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£14,375</div>
            <p className="text-xs text-muted-foreground">Based on last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£22,000</div>
            <p className="text-xs text-muted-foreground">3 invoices pending</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="streams" className="space-y-4">
        <TabsList>
          <TabsTrigger value="streams">Revenue Streams</TabsTrigger>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="streams" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {revenueStreams.map((stream, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">{stream.name}</h3>
                    <div className={`flex items-center gap-1 text-sm ${stream.trend === 'up' ? 'text-success' : 'text-destructive'}`}>
                      {stream.trend === 'up' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      {Math.abs(stream.growth)}%
                    </div>
                  </div>
                  <div className="text-3xl font-bold">£{stream.amount.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground mt-2">This month</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">{transaction.client}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="font-semibold">£{transaction.amount.toLocaleString()}</div>
                      <div className={`text-xs ${transaction.status === 'completed' ? 'text-success' : 'text-warning'}`}>
                        {transaction.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Revenue;
