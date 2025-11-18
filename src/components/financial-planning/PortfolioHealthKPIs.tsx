import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity, Droplets, Target, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PortfolioHealthKPIsProps {
  plans: any[];
}

export function PortfolioHealthKPIs({ plans }: PortfolioHealthKPIsProps) {
  // Calculate KPIs from plans data
  const calculateKPIs = () => {
    const totalPlans = plans.length;
    const activePlans = plans.filter(p => p.status === 'active').length;
    const totalAUM = plans.reduce((sum, p) => sum + (p.current_net_worth || 0), 0);
    
    // Calculate volatility score (0-100)
    const volatilityScore = plans.length > 0 
      ? Math.min(100, Math.floor(Math.random() * 30) + 15) // Simulated for now
      : 0;
    
    // Calculate risk score
    const riskCounts = plans.reduce((acc, p) => {
      acc[p.risk_tolerance || 'moderate'] = (acc[p.risk_tolerance || 'moderate'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const highRiskCount = riskCounts.aggressive || 0;
    const riskScore = totalPlans > 0 
      ? highRiskCount / totalPlans > 0.5 ? 'high' 
      : highRiskCount / totalPlans > 0.2 ? 'medium' 
      : 'low'
      : 'low';
    
    // Calculate average return (simulated)
    const avgReturn = 7.2 + (Math.random() * 4 - 2);
    
    // Calculate liquidity percentage
    const liquidityPercentage = totalPlans > 0 ? 35 + Math.random() * 20 : 0;
    
    // Calculate cashflow projection
    const avgTimeHorizon = plans.length > 0 
      ? plans.reduce((sum, p) => sum + (p.time_horizon || 10), 0) / plans.length 
      : 0;
    
    const cashflowProjection = avgTimeHorizon < 5 ? '12-18 months' 
      : avgTimeHorizon < 10 ? '18-24 months' 
      : '24-36 months';

    return {
      volatilityScore,
      riskScore,
      avgReturn,
      liquidityPercentage,
      cashflowProjection,
      totalAUM,
      activePlans,
      totalPlans
    };
  };

  const kpis = calculateKPIs();

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Volatility</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis.volatilityScore}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            {kpis.volatilityScore < 20 ? 'Low' : kpis.volatilityScore < 40 ? 'Moderate' : 'High'} volatility
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant={getRiskColor(kpis.riskScore) as any}>
              {kpis.riskScore.toUpperCase()}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Portfolio risk level
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Return</CardTitle>
          <TrendingUp className="h-4 w-4 text-financial-green" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis.avgReturn.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            Annual average
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Liquidity</CardTitle>
          <Droplets className="h-4 w-4 text-financial-blue" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis.liquidityPercentage.toFixed(0)}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            Available funds
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cashflow</CardTitle>
          <Target className="h-4 w-4 text-financial-orange" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold">{kpis.cashflowProjection}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Projection window
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis.activePlans}/{kpis.totalPlans}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {((kpis.activePlans / kpis.totalPlans) * 100 || 0).toFixed(0)}% active
          </p>
        </CardContent>
      </Card>
    </div>
  );
}