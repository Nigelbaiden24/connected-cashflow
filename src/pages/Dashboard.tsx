import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Users, MessageSquare, Clock, DollarSign, ArrowLeft, FileText, Calendar, UserPlus, PieChart } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import flowpulseLogo from "@/assets/flowpulse-logo.png";
import { ClientRiskRadar } from "@/components/dashboard/ClientRiskRadar";
import { PipelineOverview } from "@/components/dashboard/PipelineOverview";
import { AdvisorTasks } from "@/components/dashboard/AdvisorTasks";
import { AdvisoryRevenues } from "@/components/dashboard/AdvisoryRevenues";
import { PortfolioWatchlist } from "@/components/dashboard/PortfolioWatchlist";
import { DynamicAlerts } from "@/components/dashboard/DynamicAlerts";
import { ComplianceHealth } from "@/components/dashboard/ComplianceHealth";
import { ActivityOverview } from "@/components/dashboard/ActivityOverview";
import { AISummaryPanel } from "@/components/dashboard/AISummaryPanel";
import { QuickLinks } from "@/components/dashboard/QuickLinks";
import { AdvisorGoals } from "@/components/dashboard/AdvisorGoals";
import { CalendarSnapshot } from "@/components/dashboard/CalendarSnapshot";
import { TranslatedText } from "@/components/TranslatedText";

const Dashboard = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<any[]>([]);
  const [totalAUM, setTotalAUM] = useState(0);
  const [loading, setLoading] = useState(true);
  const [botName, setBotName] = useState(() => {
    return localStorage.getItem('botName') || 'Theodore';
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: clientsData, error } = await supabase
        .from('clients')
        .select('*, portfolio_holdings(current_value)');
      
      if (error) throw error;
      
      setClients(clientsData || []);
      
      // Calculate total AUM from all clients
      const totalAUM = clientsData?.reduce((sum, client) => {
        const portfolioValue = client.portfolio_holdings?.reduce((pSum: number, holding: any) => 
          pSum + (holding.current_value || 0), 0) || 0;
        return sum + portfolioValue + (client.net_worth || 0);
      }, 0) || 0;
      
      setTotalAUM(totalAUM);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCurrencyShort = (amount: number) => {
    if (amount >= 1000000) {
      return `£${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `£${(amount / 1000).toFixed(0)}K`;
    }
    return formatCurrency(amount);
  };

  const metrics = [
    {
      titleKey: "Active Clients",
      value: clients.filter(c => c.status === 'active').length.toString(),
      change: "+12%",
      trend: "up",
      icon: Users,
    },
    {
      titleKey: "Total AUM",
      value: formatCurrencyShort(totalAUM),
      change: "+3%",
      trend: "up",
      icon: DollarSign,
    },
    {
      titleKey: "Portfolio Holdings",
      value: clients.reduce((sum, client) => sum + (client.portfolio_holdings?.length || 0), 0).toString(),
      change: "+8%",
      trend: "up",
      icon: MessageSquare,
    },
    {
      titleKey: "Avg Client Value",
      value: clients.length > 0 ? formatCurrencyShort(totalAUM / clients.length) : "£0",
      change: "-2%",
      trend: "down",
      icon: Clock,
    },
  ];

  const quickActions = [
    { title: "Create Financial Plan", icon: FileText, description: "Build a new plan", path: "/financial-planning/new" },
    { title: "Add Client", icon: UserPlus, description: "Onboard a new client", path: "/onboarding" },
    { title: "Generate Report", icon: PieChart, description: "Create financial report", path: "/finance-ai-generator" },
    { title: "Schedule Meeting", icon: Calendar, description: "Plan client meeting", path: "/calendar" },
  ];

  const recentQueries = [
    {
      query: "What's the current P/E ratio for AAPL?",
      advisor: "Sarah Chen",
      time: "2 min ago",
      status: "resolved",
    },
    {
      query: "Generate Q3 portfolio performance report for client Johnson",
      advisor: "Michael Torres",
      time: "5 min ago",
      status: "processing",
    },
    {
      query: "Check compliance requirements for ESG fund recommendations",
      advisor: "Emma Davis",
      time: "8 min ago",
      status: "resolved",
    },
    {
      query: "Find similar risk profiles to client portfolio #4782",
      advisor: "David Kim",
      time: "12 min ago",
      status: "resolved",
    },
  ];

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img 
            src={flowpulseLogo} 
            alt="The Flowpulse Group" 
            className="h-14 w-14 rounded-lg object-contain cursor-pointer" 
            onClick={() => navigate('/')}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <TranslatedText>Back</TranslatedText>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight"><TranslatedText>Dashboard</TranslatedText></h1>
            <p className="text-sm text-muted-foreground mt-1">
              <TranslatedText>AI Assistant</TranslatedText>: {botName}
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="text-sm">
          <TranslatedText>Live Data</TranslatedText>
        </Badge>
      </div>

      <div className="space-y-6">
        {/* AI Summary Panel - Top Banner */}
        <AISummaryPanel />

        {/* Key Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <Card key={metric.titleKey}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  <TranslatedText>{metric.titleKey}</TranslatedText>
                </CardTitle>
                <metric.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {metric.trend === "up" ? (
                    <TrendingUp className="mr-1 h-3 w-3 text-success" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3 text-destructive" />
                  )}
                  <span className={metric.trend === "up" ? "text-success" : "text-destructive"}>
                    {metric.change}
                  </span>
                  <span className="ml-1"><TranslatedText>from last month</TranslatedText></span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Risk & Compliance Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ClientRiskRadar />
          <ComplianceHealth />
        </div>

        {/* Pipeline Overview */}
        <PipelineOverview />

        {/* Revenue & Goals Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AdvisoryRevenues />
          </div>
          <AdvisorGoals />
        </div>

        {/* Tasks & Alerts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          <AdvisorTasks />
          <DynamicAlerts />
        </div>

        {/* Watchlist & Calendar Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          <PortfolioWatchlist />
          <CalendarSnapshot />
        </div>

        {/* Activity Overview */}
        <ActivityOverview />

        {/* Quick Links Panel */}
        <QuickLinks />

        {/* Recent Queries - Collapsible */}
        <Card>
          <CardHeader>
            <CardTitle><TranslatedText>Recent AI Queries</TranslatedText></CardTitle>
            <CardDescription>
              <TranslatedText>Latest advisor interactions with the AI assistant</TranslatedText>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentQueries.map((query, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {query.query}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <TranslatedText>by</TranslatedText> {query.advisor} • {query.time}
                    </p>
                  </div>
                  <Badge
                    variant={
                      query.status === "resolved" ? "default" : "secondary"
                    }
                  >
                    <TranslatedText>{query.status}</TranslatedText>
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;