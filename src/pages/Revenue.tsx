import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ResizablePanelGroup, ResizablePanel } from "@/components/ui/resizable";
import { DollarSign, TrendingUp, TrendingDown, CreditCard, Clock, ArrowLeft, Plus, Search, Filter, ArrowUpDown, BarChart3, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RevenueMetricCard } from "@/components/business/RevenueMetricCard";
import { RevenueChart } from "@/components/business/RevenueChart";
import { TransactionCard } from "@/components/business/TransactionCard";

const Revenue = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");
  const [showFilters, setShowFilters] = useState(false);
  const [deleteTransactionId, setDeleteTransactionId] = useState<number | null>(null);

  const monthlyData = [
    { month: "January", revenue: 198000, recurring: 42000, transactions: 14 },
    { month: "February", revenue: 215000, recurring: 44000, transactions: 16 },
    { month: "March", revenue: 203000, recurring: 45000, transactions: 15 },
    { month: "April", revenue: 226000, recurring: 46000, transactions: 17 },
    { month: "May", revenue: 223000, recurring: 48000, transactions: 15 },
    { month: "June", revenue: 235000, recurring: 49000, transactions: 18 },
    { month: "July", revenue: 241000, recurring: 50000, transactions: 19 },
    { month: "August", revenue: 229000, recurring: 51000, transactions: 16 },
    { month: "September", revenue: 247000, recurring: 52000, transactions: 20 },
    { month: "October", revenue: 253000, recurring: 53000, transactions: 21 },
    { month: "November", revenue: 268000, recurring: 54000, transactions: 22 },
    { month: "December", revenue: 279000, recurring: 55000, transactions: 24 },
  ];

  const [recentTransactions, setRecentTransactions] = useState([
    { id: 1, client: "Acme Corp", amount: 15000, date: "2024-02-18", status: "completed", category: "Product Sales" },
    { id: 2, client: "TechStart Inc", amount: 8500, date: "2024-02-17", status: "completed", category: "Subscriptions" },
    { id: 3, client: "Global Solutions", amount: 22000, date: "2024-02-16", status: "pending", category: "Consulting" },
    { id: 4, client: "Innovation Labs", amount: 12000, date: "2024-02-15", status: "completed", category: "Product Sales" },
    { id: 5, client: "Digital Dynamics", amount: 18500, date: "2024-02-14", status: "completed", category: "Licensing" },
    { id: 6, client: "Future Tech", amount: 9200, date: "2024-02-13", status: "pending", category: "Subscriptions" },
  ]);

  // Calculate dynamic totals
  const currentMonthData = monthlyData[monthlyData.length - 1];
  const previousMonthData = monthlyData[monthlyData.length - 2];
  const revenueGrowth = ((currentMonthData.revenue - previousMonthData.revenue) / previousMonthData.revenue * 100).toFixed(1);
  const recurringGrowth = ((currentMonthData.recurring - previousMonthData.recurring) / previousMonthData.recurring * 100).toFixed(1);
  const avgTransaction = Math.round(currentMonthData.revenue / currentMonthData.transactions);
  const pendingAmount = recentTransactions.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.amount, 0);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<typeof recentTransactions[0] | null>(null);
  const [formData, setFormData] = useState({
    client: "",
    amount: "",
    date: "",
    status: "completed",
    category: "",
  });

  const handleSaveTransaction = () => {
    if (!formData.client || !formData.amount || !formData.date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const newTransaction = {
      id: recentTransactions.length > 0 ? Math.max(...recentTransactions.map(t => t.id)) + 1 : 1,
      client: formData.client,
      amount: parseFloat(formData.amount),
      date: formData.date,
      status: formData.status,
      category: formData.category || "Other",
    };
    setRecentTransactions([newTransaction, ...recentTransactions]);
    toast({
      title: "Success",
      description: "Transaction created successfully",
    });
    setDialogOpen(false);
    setFormData({ client: "", amount: "", date: "", status: "completed", category: "" });
  };

  const handleUpdateTransaction = () => {
    if (!selectedTransaction || !formData.client || !formData.amount || !formData.date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setRecentTransactions(recentTransactions.map(t => 
      t.id === selectedTransaction.id 
        ? { ...t, client: formData.client, amount: parseFloat(formData.amount), date: formData.date, status: formData.status, category: formData.category || t.category }
        : t
    ));
    toast({
      title: "Success",
      description: "Transaction updated successfully",
    });
    setEditDialogOpen(false);
    setSelectedTransaction(null);
    setFormData({ client: "", amount: "", date: "", status: "completed", category: "" });
  };

  const handleDeleteTransaction = (id: number) => {
    setRecentTransactions(recentTransactions.filter(t => t.id !== id));
    setDeleteTransactionId(null);
    toast({
      title: "Success",
      description: "Transaction deleted successfully",
    });
  };

  const handleEditTransaction = (transaction: typeof recentTransactions[0]) => {
    setSelectedTransaction(transaction);
    setFormData({
      client: transaction.client,
      amount: transaction.amount.toString(),
      date: transaction.date,
      status: transaction.status,
      category: transaction.category || "",
    });
    setEditDialogOpen(true);
  };

  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = recentTransactions;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter(t => t.status === filterStatus);
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "amount":
          return b.amount - a.amount;
        case "client":
          return a.client.localeCompare(b.client);
        default:
          return 0;
      }
    });

    return sorted;
  }, [recentTransactions, searchQuery, filterStatus, sortBy]);

  const hasActiveFilters = searchQuery || filterStatus !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setFilterStatus("all");
  };

  const revenueStreams = [
    { name: "Product Sales", amount: 125000, growth: 12.5, trend: "up" },
    { name: "Subscriptions", amount: 48000, growth: 8.3, trend: "up" },
    { name: "Consulting", amount: 32000, growth: -3.2, trend: "down" },
    { name: "Licensing", amount: 18000, growth: 15.7, trend: "up" },
  ];

  return (
    <div className="flex-1 w-full">
      <ResizablePanelGroup direction="horizontal" className="min-h-screen">
        <ResizablePanel defaultSize={100} minSize={50}>
          <div className="h-full p-6 space-y-6 overflow-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(-1)}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Revenue Tracking
                  </h1>
                  <p className="text-muted-foreground mt-1">Monitor income streams and financial performance</p>
                </div>
              </div>

              <Button 
                className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70" 
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Add Transaction
              </Button>
            </div>

            {/* Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <RevenueMetricCard
                title="Total Revenue"
                value={`£${currentMonthData.revenue.toLocaleString()}`}
                subtitle="This month"
                icon={DollarSign}
                trend={{ value: parseFloat(revenueGrowth), direction: "up" }}
                gradient="from-blue-500/20 to-blue-600/20"
              />
              <RevenueMetricCard
                title="Monthly Recurring"
                value={`£${currentMonthData.recurring.toLocaleString()}`}
                subtitle="Subscription revenue"
                icon={TrendingUp}
                trend={{ value: parseFloat(recurringGrowth), direction: "up" }}
                gradient="from-green-500/20 to-green-600/20"
              />
              <RevenueMetricCard
                title="Avg. Transaction"
                value={`£${avgTransaction.toLocaleString()}`}
                subtitle="Based on current month"
                icon={CreditCard}
                gradient="from-purple-500/20 to-purple-600/20"
              />
              <RevenueMetricCard
                title="Pending Payments"
                value={`£${pendingAmount.toLocaleString()}`}
                subtitle={`${recentTransactions.filter(t => t.status === 'pending').length} invoices pending`}
                icon={Clock}
                gradient="from-orange-500/20 to-orange-600/20"
              />
            </div>

            {/* Revenue Chart */}
            <RevenueChart data={monthlyData} />

            {/* Revenue Streams */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Revenue Streams</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {revenueStreams.map((stream, index) => (
                    <Card key={index} className="overflow-hidden hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sm">{stream.name}</h4>
                          <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-2xl font-bold mb-1">£{stream.amount.toLocaleString()}</div>
                        <div className={`flex items-center gap-1 text-sm ${
                          stream.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stream.trend === 'up' ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {Math.abs(stream.growth)}% this month
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Transactions Section */}
            <Card className="bg-gradient-to-br from-card to-card/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Recent Transactions</h3>
                  <span className="text-sm text-muted-foreground">
                    {filteredAndSortedTransactions.length} transactions
                  </span>
                </div>

                {/* Search and Filters */}
                <div className="space-y-3 mb-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search transactions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Button
                      variant={showFilters ? "default" : "outline"}
                      onClick={() => setShowFilters(!showFilters)}
                      className="gap-2"
                    >
                      <Filter className="h-4 w-4" />
                      Filters
                    </Button>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[180px]">
                        <ArrowUpDown className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Sort by Date</SelectItem>
                        <SelectItem value="amount">Sort by Amount</SelectItem>
                        <SelectItem value="client">Sort by Client</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {showFilters && (
                    <div className="flex gap-2 pt-2 border-t animate-fade-in">
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>

                      {hasActiveFilters && (
                        <Button variant="ghost" onClick={clearFilters} className="gap-2">
                          <X className="h-4 w-4" />
                          Clear
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Transactions List */}
                <div className="space-y-3">
                  {filteredAndSortedTransactions.length === 0 ? (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <p className="text-muted-foreground">
                          {hasActiveFilters ? "No transactions match your filters" : "No transactions yet. Add your first transaction!"}
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    filteredAndSortedTransactions.map((transaction) => (
                      <TransactionCard
                        key={transaction.id}
                        transaction={transaction}
                        onEdit={handleEditTransaction}
                        onDelete={(id) => setDeleteTransactionId(id)}
                      />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Add Transaction Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Add New Transaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="client">Client Name *</Label>
              <Input
                id="client"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                placeholder="Enter client name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (£) *</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
                    <Select value={formData.category || ""} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Product Sales">Product Sales</SelectItem>
                  <SelectItem value="Subscriptions">Subscriptions</SelectItem>
                  <SelectItem value="Consulting">Consulting</SelectItem>
                  <SelectItem value="Licensing">Licensing</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveTransaction} className="bg-gradient-to-r from-primary to-primary/80">
              Add Transaction
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Transaction Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Edit Transaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-client">Client Name *</Label>
              <Input
                id="edit-client"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                placeholder="Enter client name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-amount">Amount (£) *</Label>
              <Input
                id="edit-amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-date">Date *</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select value={formData.category || ""} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Product Sales">Product Sales</SelectItem>
                  <SelectItem value="Subscriptions">Subscriptions</SelectItem>
                  <SelectItem value="Consulting">Consulting</SelectItem>
                  <SelectItem value="Licensing">Licensing</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateTransaction} className="bg-gradient-to-r from-primary to-primary/80">
              Update Transaction
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteTransactionId !== null} onOpenChange={() => setDeleteTransactionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteTransactionId && handleDeleteTransaction(deleteTransactionId)} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Revenue;
