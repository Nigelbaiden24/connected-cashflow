import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Users, DollarSign, Activity, ArrowUpRight, ArrowDownRight, ArrowLeft, Download, RefreshCw, Filter } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import jsPDF from "jspdf";

const Analytics = () => {
  const navigate = useNavigate();

  const handleDownloadPDF = () => {
    const pdf = new jsPDF();
    
    // Add title
    pdf.setFontSize(20);
    pdf.text("Business Analytics Report", 20, 20);
    
    // Add date
    pdf.setFontSize(12);
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);
    
    // Add metrics
    pdf.setFontSize(14);
    pdf.text("Key Metrics", 20, 45);
    pdf.setFontSize(10);
    pdf.text("Total Revenue: $328K (+12.5%)", 20, 55);
    pdf.text("Active Customers: 1,013 (+8.2%)", 20, 62);
    pdf.text("Conversion Rate: 3.24% (-2.1%)", 20, 69);
    pdf.text("Avg. Transaction: $324 (+5.7%)", 20, 76);
    
    // Add revenue data section
    pdf.setFontSize(14);
    pdf.text("Revenue vs Expenses (Last 6 Months)", 20, 95);
    pdf.setFontSize(10);
    let yPos = 105;
    revenueData.forEach((item) => {
      pdf.text(`${item.month}: Revenue $${item.revenue.toLocaleString()}, Expenses $${item.expenses.toLocaleString()}`, 25, yPos);
      yPos += 7;
    });
    
    // Add customer growth section
    pdf.setFontSize(14);
    pdf.text("Customer Growth", 20, yPos + 10);
    pdf.setFontSize(10);
    yPos += 20;
    customerData.forEach((item) => {
      pdf.text(`${item.month}: ${item.customers} customers`, 25, yPos);
      yPos += 7;
    });
    
    // Add footer
    pdf.setFontSize(8);
    pdf.text("FlowPulse Business - Confidential", 20, 280);
    
    pdf.save(`analytics-report-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success("Analytics report downloaded successfully");
  };

  const handleRefresh = () => {
    toast.info("Refreshing analytics data...");
    // In a real app, this would fetch fresh data
  };

  const handleExport = () => {
    toast.info("Exporting data to CSV...");
    // In a real app, this would export to CSV
  };
  
  const revenueData = [
    { month: "Jan", revenue: 45000, expenses: 32000 },
    { month: "Feb", revenue: 52000, expenses: 35000 },
    { month: "Mar", revenue: 48000, expenses: 33000 },
    { month: "Apr", revenue: 61000, expenses: 38000 },
    { month: "May", revenue: 55000, expenses: 36000 },
    { month: "Jun", revenue: 67000, expenses: 40000 },
  ];

  const customerData = [
    { month: "Jan", customers: 120 },
    { month: "Feb", customers: 145 },
    { month: "Mar", customers: 160 },
    { month: "Apr", customers: 178 },
    { month: "May", customers: 195 },
    { month: "Jun", customers: 215 },
  ];

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Business performance insights and metrics</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Export CSV
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleDownloadPDF}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$328K</div>
            <p className="text-xs text-success flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" />
              12.5% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,013</div>
            <p className="text-xs text-success flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" />
              8.2% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.24%</div>
            <p className="text-xs text-destructive flex items-center gap-1">
              <ArrowDownRight className="h-3 w-3" />
              2.1% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Transaction</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$324</div>
            <p className="text-xs text-success flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" />
              5.7% from last period
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Revenue vs Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" />
                <Bar dataKey="expenses" fill="hsl(var(--muted))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Customer Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={customerData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="customers" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
