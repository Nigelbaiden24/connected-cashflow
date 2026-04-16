// Maps route URLs to their lazy-import functions so we can warm
// the chunk cache on hover/focus before the user actually clicks.
// Each value is a thunk that returns the dynamic import promise.

type Importer = () => Promise<unknown>;

const map: Record<string, Importer> = {
  // ===== Finance =====
  "/dashboard": () => import("@/pages/Dashboard"),
  "/clients": () => import("@/pages/Clients"),
  "/portfolio": () => import("@/pages/Portfolio"),
  "/goal-planning": () => import("@/pages/GoalPlanning"),
  "/investment-analysis": () => import("@/pages/InvestmentAnalysis"),
  "/risk-assessment": () => import("@/pages/RiskAssessment"),
  "/scenario-analysis": () => import("@/pages/ScenarioAnalysis"),
  "/financial-planning": () => import("@/pages/FinancialPlanningEnhanced"),
  "/client-onboarding": () => import("@/pages/ClientOnboarding"),
  "/practice-management": () => import("@/pages/PracticeManagement"),
  "/reports": () => import("@/pages/Reports"),
  "/compliance": () => import("@/pages/Compliance"),
  "/security": () => import("@/pages/Security"),
  "/market-data": () => import("@/pages/MarketData"),
  "/calendar": () => import("@/pages/Calendar"),
  "/messages": () => import("@/pages/Messages"),
  "/chat": () => import("@/pages/Chat"),
  "/crm": () => import("@/pages/CRM"),
  "/payroll": () => import("@/pages/FinancePayroll"),
  "/settings": () => import("@/pages/Settings"),
  "/automation-center": () => import("@/pages/AutomationCenter"),
  "/finance-ai-generator": () => import("@/pages/FinanceAIGenerator"),
  "/finance/market-commentary": () => import("@/pages/finance/MarketCommentary"),
  "/finance/model-portfolios": () => import("@/pages/finance/ModelPortfolios"),
  "/finance/benchmarking-trends": () => import("@/pages/finance/BenchmarkingTrends"),
  "/finance/ai-analyst": () => import("@/pages/finance/AIAnalyst"),
  "/finance/watchlists": () => import("@/pages/finance/Watchlists"),
  "/finance/screeners-discovery": () => import("@/pages/finance/ScreenersDiscovery"),
  "/finance/news": () => import("@/pages/finance/News"),
  "/finance/featured-picks": () => import("@/pages/finance/FeaturedPicks"),
  "/finance/fund-etf-database": () => import("@/pages/finance/FundETFDatabase"),
  "/finance/investor-finder": () => import("@/pages/finance/InvestorFinder"),
  "/finance/company-intelligence": () => import("@/pages/finance/CompanyIntelligence"),
  "/finance/languages": () => import("@/pages/finance/Languages"),
  "/research-reports": () => import("@/pages/ResearchReports"),
  "/orchestrated-reports": () => import("@/pages/OrchestratedReports"),
  "/opportunity-intelligence": () => import("@/pages/OpportunityIntelligence"),
  "/opportunities": () => import("@/pages/Opportunities"),

  // ===== Investor =====
  "/investor/dashboard": () => import("@/pages/InvestorDashboard"),
  "/investor/research": () => import("@/pages/investor/ResearchReports"),
  "/investor/analysis-reports": () => import("@/pages/investor/AnalysisReports"),
  "/investor/commentary": () => import("@/pages/investor/MarketCommentary"),
  "/investor/portfolios": () => import("@/pages/investor/ModelPortfolios"),
  "/investor/signals": () => import("@/pages/investor/SignalsAlerts"),
  "/investor/newsletters": () => import("@/pages/investor/Newsletters"),
  "/investor/benchmarking": () => import("@/pages/investor/BenchmarkingTrends"),
  "/investor/screeners": () => import("@/pages/investor/ScreenersDiscovery"),
  "/investor/ai-analyst": () => import("@/pages/investor/AIAnalyst"),
  "/investor/learning": () => import("@/pages/investor/LearningHub"),
  "/investor/market-data": () => import("@/pages/investor/MarketDataHub"),
  "/investor/tools": () => import("@/pages/investor/ToolsCalculators"),
  "/investor/risk": () => import("@/pages/investor/RiskCompliance"),
  "/investor/startup-discovery": () => import("@/pages/investor/StartupDiscovery"),
  "/investor/watchlists": () => import("@/pages/investor/Watchlists"),
  "/investor/languages": () => import("@/pages/investor/Languages"),
  "/investor/news": () => import("@/pages/investor/News"),
  "/investor/featured-picks": () => import("@/pages/investor/FeaturedPicks"),
  "/investor/fund-etf-database": () => import("@/pages/investor/FundETFDatabase"),
  "/investor/tasks": () => import("@/pages/investor/Tasks"),
};

const inFlight = new Set<string>();

/**
 * Warm the lazy-import cache for the given route URL.
 * Safe to call repeatedly — each route is only fetched once.
 */
export function prefetchRoute(url: string): void {
  if (!url || inFlight.has(url)) return;
  const importer = map[url];
  if (!importer) return;
  inFlight.add(url);
  // Fire and forget; failures are silent (will retry on real navigation).
  importer().catch(() => inFlight.delete(url));
}

/** Hover/focus handlers for nav links. */
export const prefetchHandlers = (url: string) => ({
  onMouseEnter: () => prefetchRoute(url),
  onFocus: () => prefetchRoute(url),
  onTouchStart: () => prefetchRoute(url),
});
