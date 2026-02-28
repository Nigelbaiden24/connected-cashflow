import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Target, PieChart, Upload, Calculator, TrendingUp, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function QuickLinks() {
  const navigate = useNavigate();

  const quickLinks = [
    { title: "Generate Suitability Report", icon: FileText, description: "Create client suitability documentation", path: "/finance-ai-generator", gradient: "from-blue-500 to-blue-600", glow: "shadow-blue-500/20" },
    { title: "Portfolio Rebalancer", icon: Target, description: "Optimize client portfolio allocation", path: "/portfolio", gradient: "from-violet-500 to-purple-600", glow: "shadow-violet-500/20" },
    { title: "Create Risk Profile", icon: PieChart, description: "Assess client risk tolerance", path: "/risk", gradient: "from-amber-500 to-orange-600", glow: "shadow-amber-500/20" },
    { title: "Add KYC Document", icon: Upload, description: "Upload client compliance docs", path: "/compliance", gradient: "from-emerald-500 to-green-600", glow: "shadow-emerald-500/20" },
    { title: "Investment Proposal", icon: Calculator, description: "Generate investment proposals", path: "/finance-ai-generator", gradient: "from-rose-500 to-pink-600", glow: "shadow-rose-500/20" },
    { title: "Market Analysis", icon: TrendingUp, description: "View market data and trends", path: "/market", gradient: "from-cyan-500 to-blue-600", glow: "shadow-cyan-500/20" },
  ];

  return (
    <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-xl">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Zap className="h-4 w-4 text-primary" />
          </div>
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
                className={`h-auto flex-col gap-3 p-5 border-border/50 bg-muted/20 backdrop-blur-sm hover:bg-muted/40 hover:shadow-lg ${link.glow} hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 group`}
                onClick={() => navigate(link.path)}
              >
                <div className={`p-3 rounded-xl bg-gradient-to-br ${link.gradient} shadow-lg ${link.glow} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-5 w-5 text-white" />
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
