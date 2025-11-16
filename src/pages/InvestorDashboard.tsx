import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Globe, Coins, Building, BarChart3 } from "lucide-react";

const InvestorDashboard = () => {
  const marketData = [
    { name: "S&P 500", value: "5,876.23", change: "+1.24%", isPositive: true },
    { name: "Bitcoin", value: "$91,234", change: "+3.45%", isPositive: true },
    { name: "EUR/USD", value: "1.0847", change: "-0.23%", isPositive: false },
    { name: "Gold", value: "$2,634", change: "+0.87%", isPositive: true },
  ];

  const assetClasses = [
    { 
      title: "International Stocks",
      icon: Globe,
      description: "Global equity opportunities across emerging and developed markets",
      color: "text-purple-600"
    },
    { 
      title: "Cryptocurrency",
      icon: Coins,
      description: "Digital asset analysis and investment strategies",
      color: "text-purple-600"
    },
    { 
      title: "Property & Land",
      icon: Building,
      description: "International real estate and land investment opportunities",
      color: "text-purple-600"
    },
    { 
      title: "Private Equity",
      icon: BarChart3,
      description: "Exclusive access to businesses and private market deals",
      color: "text-purple-600"
    },
  ];

  return (
    <div className="p-6 space-y-6 investor-theme">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Investment Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to your global investment portal
        </p>
      </div>

      {/* Market Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {marketData.map((market) => (
          <Card key={market.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{market.name}</CardTitle>
              {market.isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{market.value}</div>
              <p className={`text-xs ${market.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {market.change} from yesterday
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Asset Classes */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Investment Focus Areas</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {assetClasses.map((asset) => {
            const Icon = asset.icon;
            return (
              <Card key={asset.title} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Icon className={`h-6 w-6 ${asset.color}`} />
                    </div>
                    <CardTitle>{asset.title}</CardTitle>
                  </div>
                  <CardDescription>{asset.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Research & Analysis</CardTitle>
          <CardDescription>Latest insights and market commentary</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
              <div>
                <h4 className="font-semibold">Q4 2024 Global Markets Outlook</h4>
                <p className="text-sm text-muted-foreground">Published 2 hours ago</p>
              </div>
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
              <div>
                <h4 className="font-semibold">Cryptocurrency Market Analysis</h4>
                <p className="text-sm text-muted-foreground">Published 5 hours ago</p>
              </div>
              <Coins className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
              <div>
                <h4 className="font-semibold">Emerging Markets Property Report</h4>
                <p className="text-sm text-muted-foreground">Published yesterday</p>
              </div>
              <Building className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvestorDashboard;
