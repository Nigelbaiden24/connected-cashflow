import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Users, MessageSquare, Clock, DollarSign } from "lucide-react";

const Dashboard = () => {
  const metrics = [
    {
      title: "Active Clients",
      value: "2,847",
      change: "+12%",
      trend: "up",
      icon: Users,
    },
    {
      title: "Conversations Today",
      value: "156",
      change: "+8%",
      trend: "up",
      icon: MessageSquare,
    },
    {
      title: "Avg Response Time",
      value: "2.3s",
      change: "-15%",
      trend: "down",
      icon: Clock,
    },
    {
      title: "AUM Analyzed",
      value: "$2.4B",
      change: "+3%",
      trend: "up",
      icon: DollarSign,
    },
  ];

  const recentQueries = [
    {
      query: "What's the current P/E ratio for AAPL?",
      advisor: "Sarah Chen",
      time: "2 min ago",
      status: "resolved",
    },
    {
      query: "Generate Q3 portfolio performance report for client Johnson",
      advisor: "Michael Torres",
      time: "5 min ago",
      status: "processing",
    },
    {
      query: "Check compliance requirements for ESG fund recommendations",
      advisor: "Emma Davis",
      time: "8 min ago",
      status: "resolved",
    },
    {
      query: "Find similar risk profiles to client portfolio #4782",
      advisor: "David Kim",
      time: "12 min ago",
      status: "resolved",
    },
  ];

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Badge variant="secondary" className="text-sm">
          Live Data
        </Badge>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {metric.trend === "up" ? (
                  <TrendingUp className="mr-1 h-3 w-3 text-success" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3 text-success" />
                )}
                <span className="text-success">{metric.change}</span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Queries</CardTitle>
          <CardDescription>
            Latest advisor interactions with the AI assistant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentQueries.map((query, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b pb-4 last:border-0"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {query.query}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    by {query.advisor} • {query.time}
                  </p>
                </div>
                <Badge
                  variant={query.status === "resolved" ? "secondary" : "outline"}
                >
                  {query.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;