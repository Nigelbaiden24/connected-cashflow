import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Download, FileText, TrendingUp, Users, DollarSign, Target, Calendar, Building, Mail, Phone } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface ReportData {
  id: string;
  title: string;
  generatedAt: Date;
  type: 'practice' | 'client' | 'compliance';
  data: any;
}

export default function Reports() {
  const [reports, setReports] = useState<ReportData[]>([]);

  useEffect(() => {
    // Check if there's a report in sessionStorage (from export function)
    const exportedReport = sessionStorage.getItem('exportedReport');
    if (exportedReport) {
      const reportData = JSON.parse(exportedReport);
      setReports([reportData]);
      sessionStorage.removeItem('exportedReport'); // Clear after use
    }
  }, []);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderPracticeReport = (data: any) => (
    <div className="space-y-6">
      <div className="text-center p-6 border-b">
        <h1 className="text-3xl font-bold mb-2">Practice Management Report</h1>
        <p className="text-muted-foreground">Generated on {new Date().toLocaleDateString()}</p>
      </div>

      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Executive Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{data.totalClients}</div>
              <div className="text-sm text-muted-foreground">Total Clients</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{formatCurrency(data.aum)}</div>
              <div className="text-sm text-muted-foreground">Assets Under Management</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{formatCurrency(data.monthlyRevenue)}</div>
              <div className="text-sm text-muted-foreground">Monthly Revenue</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{data.clientRetention}%</div>
              <div className="text-sm text-muted-foreground">Client Retention</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Performance Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Key Performance Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.performanceMetrics?.map((metric: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{metric.metric}</div>
                  <div className="text-sm text-muted-foreground">Target: {metric.target}{metric.unit}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{metric.value}{metric.unit}</div>
                  <Badge variant={metric.status === 'excellent' ? 'default' : 'secondary'}>
                    {metric.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Client Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Client Growth Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.clientGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="totalClients" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Revenue Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Bar dataKey="fees" stackId="a" fill="hsl(var(--primary))" name="Management Fees" />
              <Bar dataKey="commissions" stackId="a" fill="hsl(var(--muted-foreground))" name="Commissions" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">View and manage generated reports</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Download All
        </Button>
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Reports Generated</h3>
            <p className="text-muted-foreground text-center mb-4">
              Generate reports from the Practice Management or other sections to view them here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {report.title}
                    </CardTitle>
                    <CardDescription>
                      Generated on {report.generatedAt.toLocaleDateString()} at {report.generatedAt.toLocaleTimeString()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={report.type === 'practice' ? 'default' : 'secondary'}>
                      {report.type}
                    </Badge>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {report.type === 'practice' && renderPracticeReport(report.data)}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}