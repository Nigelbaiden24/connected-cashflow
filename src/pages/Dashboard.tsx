import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Users, MessageSquare, Clock, DollarSign, ArrowLeft, FileText, Calendar, UserPlus, PieChart, Sparkles } from "lucide-react";
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
      gradient: "from-blue-500/20 to-cyan-500/10",
      iconColor: "text-blue-500",
      borderColor: "border-blue-500/20",
    },
    {
      titleKey: "Total AUM",
      value: formatCurrencyShort(totalAUM),
      change: "+3%",
      trend: "up",
      icon: DollarSign,
      gradient: "from-emerald-500/20 to-green-500/10",
      iconColor: "text-emerald-500",
      borderColor: "border-emerald-500/20",
    },
    {
      titleKey: "Portfolio Holdings",
      value: clients.reduce((sum, client) => sum + (client.portfolio_holdings?.length || 0), 0).toString(),
      change: "+8%",
      trend: "up",
      icon: MessageSquare,
      gradient: "from-violet-500/20 to-purple-500/10",
      iconColor: "text-violet-500",
      borderColor: "border-violet-500/20",
    },
    {
      titleKey: "Avg Client Value",
      value: clients.length > 0 ? formatCurrencyShort(totalAUM / clients.length) : "£0",
      change: "-2%",
      trend: "down",
      icon: Clock,
      gradient: "from-amber-500/20 to-orange-500/10",
      iconColor: "text-amber-500",
      borderColor: "border-amber-500/20",
    },
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
    <div className="flex-1 space-y-6 p-6 relative">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-violet-500/50 rounded-xl blur opacity-0 group-hover:opacity-75 transition-opacity duration-500" />
            <img 
              src={flowpulseLogo} 
              alt="The Flowpulse Group" 
              className="relative h-14 w-14 rounded-lg object-contain cursor-pointer" 
              onClick={() => navigate('/')}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2 backdrop-blur-sm bg-card/50 border-border/50 hover:bg-card/80 transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4" />
            <TranslatedText>Back</TranslatedText>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text">
              <TranslatedText>Dashboard</TranslatedText>
            </h1>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
              <TranslatedText>AI Assistant</TranslatedText>: {botName}
            </p>
          </div>
        </div>
        <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 backdrop-blur-sm animate-pulse">
          <span className="relative flex h-2 w-2 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <TranslatedText>Live Data</TranslatedText>
        </Badge>
      </div>

      <div className="space-y-6">
        {/* AI Summary Panel */}
        <AISummaryPanel />

        {/* Key Metrics Grid - Glassmorphic */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, index) => (
            <Card 
              key={metric.titleKey} 
              className={`relative overflow-hidden border ${metric.borderColor} bg-gradient-to-br ${metric.gradient} backdrop-blur-xl hover:shadow-lg hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1 group`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  <TranslatedText>{metric.titleKey}</TranslatedText>
                </CardTitle>
                <div className={`p-2 rounded-lg bg-background/50 backdrop-blur-sm border border-border/50`}>
                  <metric.icon className={`h-4 w-4 ${metric.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold tracking-tight">{metric.value}</div>
                <div className="flex items-center text-xs mt-1">
                  {metric.trend === "up" ? (
                    <TrendingUp className="mr-1 h-3 w-3 text-emerald-500" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3 text-destructive" />
                  )}
                  <span className={metric.trend === "up" ? "text-emerald-500" : "text-destructive"}>
                    {metric.change}
                  </span>
                  <span className="ml-1 text-muted-foreground"><TranslatedText>from last month</TranslatedText></span>
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

        {/* Featured Analyst Picks */}
        <FeaturedAnalystPicksSection />

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

        {/* Recent Queries */}
        <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-xl">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <TranslatedText>Recent AI Queries</TranslatedText>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              <TranslatedText>Latest advisor interactions with the AI assistant</TranslatedText>
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentQueries.map((query, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/30 backdrop-blur-sm hover:bg-muted/50 hover:border-primary/20 transition-all duration-300 group"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors">
                      {query.query}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <TranslatedText>by</TranslatedText> {query.advisor} • {query.time}
                    </p>
                  </div>
                  <Badge
                    variant={query.status === "resolved" ? "default" : "secondary"}
                    className={query.status === "resolved" 
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                      : "bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse"
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
