import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, TrendingUp, Users, DollarSign, BarChart3, FileText } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const BusinessPlanning = () => {
  const goals = [
    { name: "Revenue Growth", target: 1000000, current: 750000, unit: "$" },
    { name: "Customer Acquisition", target: 500, current: 380, unit: "" },
    { name: "Market Share", target: 15, current: 11, unit: "%" },
    { name: "Team Expansion", target: 50, current: 42, unit: " people" },
  ];

  return (
    <div className="flex-1 p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Business Planning</h1>
        <p className="text-muted-foreground">Strategic planning and goal tracking</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Revenue Goal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1M</div>
            <p className="text-xs text-muted-foreground">75% achieved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">8 on track</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23%</div>
            <p className="text-xs text-muted-foreground">Year over year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Strategic Initiatives</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Key Goals & Objectives
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {goals.map((goal, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{goal.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {goal.unit === "$" ? "$" : ""}{goal.current.toLocaleString()}{goal.unit !== "$" ? goal.unit : ""} / {goal.unit === "$" ? "$" : ""}{goal.target.toLocaleString()}{goal.unit !== "$" ? goal.unit : ""}
                  </span>
                </div>
                <Progress value={(goal.current / goal.target) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Strategic Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start gap-2">
              <FileText className="h-4 w-4" />
              Business Plan 2024
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <FileText className="h-4 w-4" />
              Market Analysis Report
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <FileText className="h-4 w-4" />
              Competitive Strategy
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <FileText className="h-4 w-4" />
              Growth Roadmap
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Strategic Initiatives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2 p-4 border rounded-lg">
              <h4 className="font-semibold">Product Expansion</h4>
              <p className="text-sm text-muted-foreground">Launch 3 new product lines</p>
              <Progress value={60} className="h-2" />
              <p className="text-xs text-muted-foreground">Q2 2024</p>
            </div>
            <div className="space-y-2 p-4 border rounded-lg">
              <h4 className="font-semibold">Market Penetration</h4>
              <p className="text-sm text-muted-foreground">Enter 2 new regional markets</p>
              <Progress value={45} className="h-2" />
              <p className="text-xs text-muted-foreground">Q3 2024</p>
            </div>
            <div className="space-y-2 p-4 border rounded-lg">
              <h4 className="font-semibold">Digital Transformation</h4>
              <p className="text-sm text-muted-foreground">Modernize core systems</p>
              <Progress value={75} className="h-2" />
              <p className="text-xs text-muted-foreground">Q4 2024</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessPlanning;
