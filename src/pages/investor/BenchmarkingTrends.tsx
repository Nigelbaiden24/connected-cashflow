import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Upload, TrendingUp, Activity, BarChart3, PieChart } from "lucide-react";
import { toast } from "sonner";

const BenchmarkingTrends = () => {
  const benchmarks = [
    { name: "S&P 500", value: "5,876.23", change: "+12.5%", ytd: "+18.2%" },
    { name: "MSCI World", value: "3,245.67", change: "+10.2%", ytd: "+15.8%" },
    { name: "Bitcoin", value: "$91,234", change: "+145%", ytd: "+92.3%" },
    { name: "Gold", value: "$2,634", change: "+8.5%", ytd: "+12.1%" },
  ];

  const trends = [
    {
      id: "1",
      title: "AI & Technology Boom",
      description: "Artificial intelligence investments driving market growth",
      impact: "High",
      timeframe: "2024-2025"
    },
    {
      id: "2",
      title: "Green Energy Transition",
      description: "Renewable energy and ESG investments gaining momentum",
      impact: "Medium",
      timeframe: "2024-2030"
    },
    {
      id: "3",
      title: "Digital Currency Adoption",
      description: "Institutional crypto adoption and CBDC development",
      impact: "High",
      timeframe: "2025-2027"
    },
  ];

  return (
    <div className="p-6 space-y-6 investor-theme">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Benchmarking & Trends</h1>
          <p className="text-muted-foreground mt-2">
            Track performance against major indices and identify emerging trends
          </p>
        </div>
      </div>

      <Tabs defaultValue="benchmarks" className="w-full">
        <TabsList>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          <TabsTrigger value="trends">Market Trends</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="benchmarks" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {benchmarks.map((benchmark) => (
              <Card key={benchmark.name}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{benchmark.name}</CardTitle>
                  <Activity className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{benchmark.value}</div>
                  <div className="flex justify-between mt-2">
                    <p className={`text-xs ${benchmark.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {benchmark.change} 1Y
                    </p>
                    <p className="text-xs text-muted-foreground">
                      YTD: {benchmark.ytd}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Comparison</CardTitle>
              <CardDescription>
                Compare your portfolio against major market indices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <LineChart className="h-12 w-12 mx-auto mb-2 text-primary" />
                  <p>Interactive chart visualization</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4 mt-6">
          <div className="grid gap-4">
            {trends.map((trend) => (
              <Card key={trend.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    <span className={`text-sm font-medium px-2 py-1 rounded ${
                      trend.impact === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {trend.impact} Impact
                    </span>
                  </div>
                  <CardTitle className="mt-4">{trend.title}</CardTitle>
                  <CardDescription>{trend.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Timeframe: {trend.timeframe}</span>
                    <Button className="bg-primary hover:bg-primary/90">
                      View Analysis
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Sector Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  Bar chart visualization
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  Asset Allocation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  Pie chart visualization
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BenchmarkingTrends;
