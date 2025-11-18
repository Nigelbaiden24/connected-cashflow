import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Target, PieChart, Upload, Calculator, TrendingUp, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function QuickLinks() {
  const navigate = useNavigate();

  const quickLinks = [
    {
      title: "Generate Suitability Report",
      icon: FileText,
      description: "Create client suitability documentation",
      path: "/finance-ai-generator",
      color: "bg-blue-500"
    },
    {
      title: "Portfolio Rebalancer",
      icon: Target,
      description: "Optimize client portfolio allocation",
      path: "/portfolio",
      color: "bg-purple-500"
    },
    {
      title: "Create Risk Profile",
      icon: PieChart,
      description: "Assess client risk tolerance",
      path: "/risk-assessment",
      color: "bg-orange-500"
    },
    {
      title: "Add KYC Document",
      icon: Upload,
      description: "Upload client compliance docs",
      path: "/compliance",
      color: "bg-green-500"
    },
    {
      title: "Investment Proposal",
      icon: Calculator,
      description: "Generate investment proposals",
      path: "/finance-ai-generator",
      color: "bg-red-500"
    },
    {
      title: "Market Analysis",
      icon: TrendingUp,
      description: "View market data and trends",
      path: "/market-data",
      color: "bg-yellow-500"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Quick Actions & Workflows
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Button
                key={link.title}
                variant="outline"
                className="h-auto flex-col gap-2 p-4 hover:bg-accent"
                onClick={() => navigate(link.path)}
              >
                <div className={`p-3 rounded-full ${link.color} bg-opacity-10`}>
                  <Icon className={`h-5 w-5 ${link.color.replace('bg-', 'text-')}`} />
                </div>
                <div className="text-center">
                  <div className="font-medium text-sm">{link.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{link.description}</div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
