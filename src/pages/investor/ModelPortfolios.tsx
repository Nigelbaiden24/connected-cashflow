import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Briefcase, Upload, TrendingUp, Shield, Target } from "lucide-react";
import { toast } from "sonner";

const ModelPortfolios = () => {
  const portfolios = [
    {
      id: "1",
      name: "AI & Automation",
      theme: "Technology Innovation",
      expectedReturn: "15-20%",
      allocation: {
        "AI Companies": 40,
        "Robotics": 30,
        "Cloud Infrastructure": 20,
        "Semiconductors": 10
      },
      performance: "+24.3%",
      holdings: 25
    },
    {
      id: "2",
      name: "Cybersecurity",
      theme: "Digital Security",
      expectedReturn: "12-16%",
      allocation: {
        "Security Software": 45,
        "Network Security": 30,
        "Cloud Security": 15,
        "Identity Management": 10
      },
      performance: "+19.7%",
      holdings: 18
    },
    {
      id: "3",
      name: "Renewable Energy",
      theme: "Sustainable Future",
      expectedReturn: "10-14%",
      allocation: {
        "Solar Power": 35,
        "Wind Energy": 30,
        "Energy Storage": 20,
        "EV Infrastructure": 15
      },
      performance: "+16.2%",
      holdings: 22
    },
    {
      id: "4",
      name: "Consumer Staples Stability",
      theme: "Defensive Growth",
      expectedReturn: "6-9%",
      allocation: {
        "Food & Beverage": 40,
        "Household Products": 30,
        "Personal Care": 20,
        "Retail": 10
      },
      performance: "+8.5%",
      holdings: 30
    },
    {
      id: "5",
      name: "High-Cash-Flow Businesses",
      theme: "Cash Generation",
      expectedReturn: "9-12%",
      allocation: {
        "Infrastructure": 30,
        "Utilities": 25,
        "REITs": 25,
        "Telecoms": 20
      },
      performance: "+11.4%",
      holdings: 28
    },
    {
      id: "6",
      name: "Dividend Strength Portfolio",
      theme: "Income Focus",
      expectedReturn: "7-10%",
      allocation: {
        "Dividend Aristocrats": 50,
        "High Yield Stocks": 25,
        "Dividend Growth": 15,
        "Preferred Stocks": 10
      },
      performance: "+9.8%",
      holdings: 35
    },
  ];

  return (
    <div className="p-6 space-y-6 investor-theme">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Model Portfolios</h1>
          <p className="text-muted-foreground mt-2">
            Thematic investment strategies for modern investors
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {portfolios.map((portfolio) => (
          <Card key={portfolio.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <Briefcase className="h-8 w-8 text-primary" />
                <Badge variant="secondary">{portfolio.theme}</Badge>
              </div>
              <CardTitle className="mt-4">{portfolio.name}</CardTitle>
              <CardDescription>
                Target Return: {portfolio.expectedReturn} • {portfolio.holdings} Holdings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">YTD Performance</span>
                <span className={`text-lg font-bold ${portfolio.performance.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {portfolio.performance}
                </span>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium">Asset Allocation</h4>
                {Object.entries(portfolio.allocation).map(([asset, percentage]) => (
                  <div key={asset} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{asset}</span>
                      <span className="font-medium">{percentage}%</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-4 border-t">
                <div className="flex flex-col items-center">
                  <Shield className="h-4 w-4 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">Protected</span>
                </div>
                <div className="flex flex-col items-center">
                  <Target className="h-4 w-4 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">Rebalanced</span>
                </div>
                <div className="flex flex-col items-center">
                  <TrendingUp className="h-4 w-4 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">Optimized</span>
                </div>
              </div>

              <Button className="w-full bg-primary hover:bg-primary/90">
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ModelPortfolios;
