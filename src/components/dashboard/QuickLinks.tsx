import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Target, PieChart, Upload, Calculator, TrendingUp, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function QuickLinks() {
  const navigate = useNavigate();

  const quickLinks = [
    { title: "Suitability Report", icon: FileText, description: "Generate documentation", path: "/finance-ai-generator" },
    { title: "Portfolio Rebalancer", icon: Target, description: "Optimize allocations", path: "/portfolio" },
    { title: "Risk Profile", icon: PieChart, description: "Assess risk tolerance", path: "/risk" },
    { title: "KYC Document", icon: Upload, description: "Upload compliance docs", path: "/compliance" },
    { title: "Investment Proposal", icon: Calculator, description: "Generate proposals", path: "/finance-ai-generator" },
    { title: "Market Analysis", icon: TrendingUp, description: "View market trends", path: "/market" },
  ];

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Zap className="h-4 w-4 text-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Button
                key={link.title}
                variant="outline"
                className="h-auto flex-col gap-2 p-4 border-border bg-muted/10 hover:bg-muted/30 transition-colors"
                onClick={() => navigate(link.path)}
              >
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="text-center">
                  <div className="font-medium text-xs text-foreground">{link.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{link.description}</div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
