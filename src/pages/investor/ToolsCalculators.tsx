import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, PieChart, TrendingUp, DollarSign, Percent, Calendar } from "lucide-react";

export default function ToolsCalculators() {
  const tools = [
    {
      title: "Investment Return Calculator",
      description: "Calculate potential returns on your investments with compound interest",
      icon: Calculator,
    },
    {
      title: "Portfolio Diversification Analyzer",
      description: "Analyze your portfolio allocation and diversification metrics",
      icon: PieChart,
    },
    {
      title: "Retirement Planning Calculator",
      description: "Plan your retirement savings and estimate future income needs",
      icon: Calendar,
    },
    {
      title: "Risk-Return Calculator",
      description: "Evaluate the risk-return profile of your investment strategy",
      icon: TrendingUp,
    },
    {
      title: "Currency Converter",
      description: "Convert between currencies with real-time exchange rates",
      icon: DollarSign,
    },
    {
      title: "Tax Impact Calculator",
      description: "Estimate tax implications of your investment decisions",
      icon: Percent,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tools & Calculators</h1>
        <p className="text-muted-foreground mt-2">Financial tools to help with your investment decisions</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <tool.icon className="h-5 w-5 text-primary" />
                {tool.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{tool.description}</p>
              <Button className="w-full">Launch Tool</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-primary/50">
        <CardHeader>
          <CardTitle>Advanced Investment Calculators</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground">
            Access our suite of professional-grade calculators for detailed financial planning and analysis.
          </p>
          <div className="flex gap-2">
            <Button>View All Tools</Button>
            <Button variant="outline">Request Custom Calculator</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
