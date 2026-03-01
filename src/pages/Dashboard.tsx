import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Users, Clock, DollarSign, ArrowLeft, Sparkles } from "lucide-react";
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
import { FeaturedAnalystPicksSection } from "@/components/market/FeaturedAnalystPicksSection";

const Dashboard = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<any[]>([]);
  const [totalAUM, setTotalAUM] = useState(0);
  const [loading, setLoading] = useState(true);
  const [botName] = useState(() => {
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
      icon: TrendingUp,
    },
    {
      titleKey: "Avg Client Value",
      value: clients.length > 0 ? formatCurrencyShort(totalAUM / clients.length) : "£0",
      change: "-2%",
      trend: "down",
      icon: Clock,
    },
  ];

  return (
    <div className="flex-1 space-y-5 p-6 bg-background min-h-screen">
      {/* Header - Clean & Minimal */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src={flowpulseLogo} 
            alt="The Flowpulse Group" 
            className="h-10 w-10 rounded-lg object-contain cursor-pointer" 
            onClick={() => navigate('/')}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              <TranslatedText>Dashboard</TranslatedText>
            </h1>
            <p className="text-xs text-muted-foreground">
              <TranslatedText>Here's a snapshot of your advisory performance</TranslatedText>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-primary" />
            AI: {botName}
          </span>
          <Badge variant="outline" className="text-xs gap-1.5 border-emerald-500/30 text-emerald-600">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <TranslatedText>Live Data</TranslatedText>
          </Badge>
        </div>
      </div>

      {/* Top Metric Cards - Horizontal Strip */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.titleKey} className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <metric.icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className={`flex items-center gap-0.5 text-xs font-medium ${metric.trend === "up" ? "text-emerald-600" : "text-destructive"}`}>
                  {metric.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {metric.change}
                  <span className="text-muted-foreground font-normal ml-0.5"><TranslatedText>vs last month</TranslatedText></span>
                </div>
              </div>
              <div className="text-2xl font-bold tracking-tight text-foreground">{metric.value}</div>
              <p className="text-xs text-muted-foreground mt-0.5">
                <TranslatedText>{metric.titleKey}</TranslatedText>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Summary Panel */}
      <AISummaryPanel />

      {/* Risk & Compliance Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ClientRiskRadar />
        <ComplianceHealth />
      </div>

      {/* Pipeline Overview */}
      <PipelineOverview />

      {/* Featured Analyst Picks */}
      <FeaturedAnalystPicksSection />

      {/* Revenue & Goals Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AdvisoryRevenues />
        </div>
        <AdvisorGoals />
      </div>

      {/* Tasks & Alerts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <AdvisorTasks />
        <DynamicAlerts />
      </div>

      {/* Watchlist & Calendar Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <PortfolioWatchlist />
        <CalendarSnapshot />
      </div>

      {/* Activity Overview */}
      <ActivityOverview />

      {/* Quick Links Panel */}
      <QuickLinks />
    </div>
  );
};

export default Dashboard;
