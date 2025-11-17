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
      name: "Aggressive Growth",
      riskLevel: "High",
      expectedReturn: "12-15%",
      allocation: {
        stocks: 80,
        crypto: 10,
        alternatives: 10
      },
      performance: "+18.5%",
      color: "text-red-600"
    },
    {
      id: "2",
      name: "Balanced Growth",
      riskLevel: "Medium",
      expectedReturn: "8-12%",
      allocation: {
        stocks: 60,
        bonds: 20,
        alternatives: 20
      },
      performance: "+12.3%",
      color: "text-yellow-600"
    },
    {
      id: "3",
      name: "Conservative Income",
      riskLevel: "Low",
      expectedReturn: "5-8%",
      allocation: {
        bonds: 60,
        stocks: 30,
        cash: 10
      },
      performance: "+6.8%",
      color: "text-green-600"
    },
  ];

  return (
    <div className="p-6 space-y-6 investor-theme">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Model Portfolios</h1>
          <p className="text-muted-foreground mt-2">
            Professionally managed portfolio strategies for different risk profiles
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {portfolios.map((portfolio) => (
          <Card key={portfolio.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <Briefcase className="h-8 w-8 text-primary" />
                <Badge variant="secondary">{portfolio.riskLevel} Risk</Badge>
              </div>
              <CardTitle className="mt-4">{portfolio.name}</CardTitle>
              <CardDescription>
                Target Return: {portfolio.expectedReturn}
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
