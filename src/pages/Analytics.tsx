import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart3, TrendingUp, Users, DollarSign, Activity, ArrowUpRight, ArrowDownRight, ArrowLeft, Download, RefreshCw, Filter, Plus, Eye, List } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import html2pdf from "html2pdf.js";
import { useState, useRef, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const Analytics = () => {
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  
  const [revenueData, setRevenueData] = useState([
    { month: "Jan", revenue: 45000, expenses: 32000 },
    { month: "Feb", revenue: 52000, expenses: 35000 },
    { month: "Mar", revenue: 48000, expenses: 33000 },
    { month: "Apr", revenue: 61000, expenses: 38000 },
    { month: "May", revenue: 55000, expenses: 36000 },
    { month: "Jun", revenue: 67000, expenses: 40000 },
    { month: "Jul", revenue: 71000, expenses: 42000 },
    { month: "Aug", revenue: 68000, expenses: 41000 },
    { month: "Sep", revenue: 74000, expenses: 43000 },
    { month: "Oct", revenue: 79000, expenses: 45000 },
    { month: "Nov", revenue: 82000, expenses: 46000 },
    { month: "Dec", revenue: 88000, expenses: 48000 },
  ]);

  const [customerData, setCustomerData] = useState([
    { month: "Jan", customers: 120 },
    { month: "Feb", customers: 145 },
    { month: "Mar", customers: 160 },
    { month: "Apr", customers: 178 },
    { month: "May", customers: 195 },
    { month: "Jun", customers: 215 },
    { month: "Jul", customers: 238 },
    { month: "Aug", customers: 255 },
    { month: "Sep", customers: 276 },
    { month: "Oct", customers: 295 },
    { month: "Nov", customers: 318 },
    { month: "Dec", customers: 342 },
  ]);

  const [newRevenue, setNewRevenue] = useState({ month: "", revenue: "", expenses: "" });
  
  // Individual customer tracking
  interface IndividualCustomer {
    id: string;
    name: string;
    revenue: number;
    month: string;
    date: string;
  }
  
  const [individualCustomers, setIndividualCustomers] = useState<IndividualCustomer[]>([
    { id: "1", name: "Acme Corp", revenue: 12500, month: "Jan", date: "2025-01-15" },
    { id: "2", name: "TechStart Ltd", revenue: 8900, month: "Jan", date: "2025-01-22" },
    { id: "3", name: "Global Industries", revenue: 15600, month: "Feb", date: "2025-02-05" },
    { id: "4", name: "Innovation Hub", revenue: 11200, month: "Feb", date: "2025-02-18" },
    { id: "5", name: "Future Systems", revenue: 9800, month: "Mar", date: "2025-03-08" },
  ]);
  
  const [newIndividualCustomer, setNewIndividualCustomer] = useState({
    name: "",
    revenue: "",
    month: "",
    date: ""
  });

  // Calculate aggregate customer data from individual customers
  const aggregateCustomerData = useMemo(() => {
    const monthCounts: { [key: string]: number } = {};
    
    individualCustomers.forEach(customer => {
      monthCounts[customer.month] = (monthCounts[customer.month] || 0) + 1;
    });
    
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let cumulative = 0;
    
    return months.map(month => {
      const count = monthCounts[month] || 0;
      cumulative += count;
      return { month, customers: cumulative };
    });
  }, [individualCustomers]);

  // Calculate total revenue from individual customers
  const totalCustomerRevenue = useMemo(() => {
    return individualCustomers.reduce((sum, customer) => sum + customer.revenue, 0);
  }, [individualCustomers]);

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;

    toast.info("Generating PDF from screen content...");

    const options = {
      margin: 10,
      filename: `analytics-report-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    try {
      await html2pdf().set(options).from(contentRef.current).save();
      toast.success("Analytics report downloaded successfully");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    }
  };

  const handleRefresh = () => {
    toast.info("Refreshing analytics data...");
    // In a real app, this would fetch fresh data
  };

  const handleExport = () => {
    toast.info("Exporting data to CSV...");
    // In a real app, this would export to CSV
  };

  const handleAddRevenue = () => {
    if (newRevenue.month && newRevenue.revenue && newRevenue.expenses) {
      setRevenueData([...revenueData, {
        month: newRevenue.month,
        revenue: parseFloat(newRevenue.revenue),
        expenses: parseFloat(newRevenue.expenses)
      }]);
      setNewRevenue({ month: "", revenue: "", expenses: "" });
      toast.success("Revenue data added successfully");
    } else {
      toast.error("Please fill all revenue fields");
    }
  };

  const handleAddIndividualCustomer = () => {
    if (newIndividualCustomer.name && newIndividualCustomer.revenue && newIndividualCustomer.month && newIndividualCustomer.date) {
      const customer: IndividualCustomer = {
        id: Date.now().toString(),
        name: newIndividualCustomer.name,
        revenue: parseFloat(newIndividualCustomer.revenue),
        month: newIndividualCustomer.month,
        date: newIndividualCustomer.date
      };
      setIndividualCustomers([...individualCustomers, customer]);
      setNewIndividualCustomer({ name: "", revenue: "", month: "", date: "" });
      toast.success("Customer added successfully");
    } else {
      toast.error("Please fill all customer fields");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="flex-1 p-6 space-y-6" ref={contentRef}>
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
            onClick={() => navigate(-1)}
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
            <div className="text-2xl font-bold">£328K</div>
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
            <div className="text-2xl font-bold">£324</div>
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
          <CardContent className="space-y-4">
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
            
            <div className="border-t pt-4 space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Data
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="month">Month</Label>
                  <Input
                    id="month"
                    placeholder="e.g., Jul"
                    value={newRevenue.month}
                    onChange={(e) => setNewRevenue({ ...newRevenue, month: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="revenue">Revenue</Label>
                  <Input
                    id="revenue"
                    type="number"
                    placeholder="45000"
                    value={newRevenue.revenue}
                    onChange={(e) => setNewRevenue({ ...newRevenue, revenue: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="expenses">Expenses</Label>
                  <Input
                    id="expenses"
                    type="number"
                    placeholder="32000"
                    value={newRevenue.expenses}
                    onChange={(e) => setNewRevenue({ ...newRevenue, expenses: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={handleAddRevenue} size="sm" className="w-full">
                Add Revenue Data
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Customer Growth & Revenue
              </div>
              <div className="text-sm font-normal text-muted-foreground">
                Total Revenue: {formatCurrency(totalCustomerRevenue)}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview" className="gap-2">
                  <Eye className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="individual" className="gap-2">
                  <List className="h-4 w-4" />
                  Individual Customers
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={aggregateCustomerData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="customers" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
                <div className="text-sm text-muted-foreground">
                  Total Customers: {individualCustomers.length}
                </div>
              </TabsContent>

              <TabsContent value="individual" className="space-y-4">
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer Name</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Month</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {individualCustomers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            No customers added yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        individualCustomers.map((customer) => (
                          <TableRow key={customer.id}>
                            <TableCell className="font-medium">{customer.name}</TableCell>
                            <TableCell>{formatCurrency(customer.revenue)}</TableCell>
                            <TableCell>{customer.month}</TableCell>
                            <TableCell>{customer.date}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <div className="border-t pt-4 space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add New Customer
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Label htmlFor="customer-name">Customer Name</Label>
                    <Input
                      id="customer-name"
                      placeholder="e.g., Acme Corp"
                      value={newIndividualCustomer.name}
                      onChange={(e) => setNewIndividualCustomer({ ...newIndividualCustomer, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer-revenue">Revenue (£)</Label>
                    <Input
                      id="customer-revenue"
                      type="number"
                      placeholder="12500"
                      value={newIndividualCustomer.revenue}
                      onChange={(e) => setNewIndividualCustomer({ ...newIndividualCustomer, revenue: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer-month">Month</Label>
                    <Input
                      id="customer-month"
                      placeholder="e.g., Jan"
                      value={newIndividualCustomer.month}
                      onChange={(e) => setNewIndividualCustomer({ ...newIndividualCustomer, month: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="customer-date">Date</Label>
                    <Input
                      id="customer-date"
                      type="date"
                      value={newIndividualCustomer.date}
                      onChange={(e) => setNewIndividualCustomer({ ...newIndividualCustomer, date: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={handleAddIndividualCustomer} size="sm" className="w-full">
                  Add Customer
                </Button>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
