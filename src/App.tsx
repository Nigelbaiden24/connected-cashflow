import { useState, lazy, Suspense, memo, useCallback, ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";

// Lazy-load layout shells
const BusinessLayout = lazy(() => import("@/components/BusinessLayout").then(m => ({ default: m.BusinessLayout })));
const FinanceLayout = lazy(() => import("@/components/FinanceLayout").then(m => ({ default: m.FinanceLayout })));
const InvestorLayout = lazy(() => import("@/components/InvestorLayout").then(m => ({ default: m.InvestorLayout })));

// Global loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

// ============ Lazy-loaded pages ============
import Index from "./pages/Index";
const Login = lazy(() => import("./pages/Login"));
const LoginBusiness = lazy(() => import("./pages/LoginBusiness"));
const LoginInvestor = lazy(() => import("./pages/LoginInvestor"));
const LoginCRM = lazy(() => import("./pages/LoginCRM"));
const LoginJenrate = lazy(() => import("./pages/LoginJenrate"));
const CRMStandalone = lazy(() => import("./pages/CRMStandalone"));
const JenrateStandalone = lazy(() => import("./pages/JenrateStandalone"));

const Dashboard = lazy(() => import("./pages/Dashboard"));
const InvestorDashboard = lazy(() => import("./pages/InvestorDashboard"));
const InvestorResearchReports = lazy(() => import("./pages/investor/ResearchReports"));
const ResearchReportsPage = lazy(() => import("./pages/ResearchReports"));
const OrchestratedReportsPage = lazy(() => import("./pages/OrchestratedReports"));
const AnalysisReports = lazy(() => import("./pages/investor/AnalysisReports"));
const MarketCommentary = lazy(() => import("./pages/investor/MarketCommentary"));
const ModelPortfolios = lazy(() => import("./pages/investor/ModelPortfolios"));
const SignalsAlerts = lazy(() => import("./pages/investor/SignalsAlerts"));
const Newsletters = lazy(() => import("./pages/investor/Newsletters"));
const BenchmarkingTrends = lazy(() => import("./pages/investor/BenchmarkingTrends"));
const ScreenersDiscovery = lazy(() => import("./pages/investor/ScreenersDiscovery"));
const AIAnalyst = lazy(() => import("./pages/investor/AIAnalyst"));
const LearningHub = lazy(() => import("./pages/investor/LearningHub"));
const MarketDataHub = lazy(() => import("./pages/investor/MarketDataHub"));
const ToolsCalculators = lazy(() => import("./pages/investor/ToolsCalculators"));
const RiskCompliance = lazy(() => import("./pages/investor/RiskCompliance"));
const InvestorFinderPage = lazy(() => import("./pages/finance/InvestorFinder"));
const CompanyIntelligence = lazy(() => import("./pages/finance/CompanyIntelligence"));
const StartupDiscovery = lazy(() => import("./pages/investor/StartupDiscovery"));
const Watchlists = lazy(() => import("./pages/investor/Watchlists"));
const Languages = lazy(() => import("./pages/investor/Languages"));
const BusinessLanguages = lazy(() => import("./pages/business/Languages"));
const FinanceLanguages = lazy(() => import("./pages/finance/Languages"));
const FinanceMarketCommentary = lazy(() => import("./pages/finance/MarketCommentary"));
const FinanceModelPortfolios = lazy(() => import("./pages/finance/ModelPortfolios"));
const FinanceBenchmarkingTrends = lazy(() => import("./pages/finance/BenchmarkingTrends"));
const FinanceAIAnalyst = lazy(() => import("./pages/finance/AIAnalyst"));
const FinanceWatchlists = lazy(() => import("./pages/finance/Watchlists"));
const FinanceScreenersDiscovery = lazy(() => import("./pages/finance/ScreenersDiscovery"));
const StocksCryptoDatabase = lazy(() => import("./pages/StocksCryptoDatabase"));
const RealTimeMarketDatabase = lazy(() => import("./pages/RealTimeMarketDatabase"));
const FinanceNews = lazy(() => import("./pages/finance/News"));
const FinanceFeaturedPicks = lazy(() => import("./pages/finance/FeaturedPicks"));
const InvestorNews = lazy(() => import("./pages/investor/News"));
const InvestorFeaturedPicks = lazy(() => import("./pages/investor/FeaturedPicks"));
const AdminNews = lazy(() => import("./pages/admin/News"));
const FundETFDatabase = lazy(() => import("./pages/finance/FundETFDatabase"));
const InvestorFundETFDatabase = lazy(() => import("./pages/investor/FundETFDatabase"));
const InvestorTasks = lazy(() => import("./pages/investor/Tasks"));
const Opportunities = lazy(() => import("./pages/Opportunities"));
const OpportunityDetail = lazy(() => import("./pages/OpportunityDetail"));
const OpportunityIntelligence = lazy(() => import("./pages/OpportunityIntelligence"));
const OpportunityDetailPage = lazy(() => import("./pages/investor/OpportunityDetailPage"));
const Chat = lazy(() => import("./pages/Chat"));
const FinanceAIGenerator = lazy(() => import("./pages/FinanceAIGenerator"));
const BusinessAIGenerator = lazy(() => import("./pages/BusinessAIGenerator"));
const MarketData = lazy(() => import("./pages/MarketData"));
const Clients = lazy(() => import("./pages/Clients"));
const ClientProfile = lazy(() => import("./pages/ClientProfile"));
const Compliance = lazy(() => import("./pages/Compliance"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const GoalPlanning = lazy(() => import("./pages/GoalPlanning"));
const InvestmentAnalysis = lazy(() => import("./pages/InvestmentAnalysis"));
const RiskAssessment = lazy(() => import("./pages/RiskAssessment"));
const ScenarioAnalysis = lazy(() => import("./pages/ScenarioAnalysis"));
const ClientOnboarding = lazy(() => import("./pages/ClientOnboarding"));
const PracticeManagement = lazy(() => import("./pages/PracticeManagement"));
const Reports = lazy(() => import("./pages/Reports"));
const BusinessReports = lazy(() => import("./pages/BusinessReports"));
const Security = lazy(() => import("./pages/Security"));
const CRMContactDetail = lazy(() => import("./pages/CRMContactDetail"));
const Payroll = lazy(() => import("./pages/Payroll"));
const FinancePayroll = lazy(() => import("./pages/FinancePayroll"));
const FinancialPlanning = lazy(() => import("./pages/FinancialPlanningEnhanced"));
const FinancialPlanDetail = lazy(() => import("./pages/FinancialPlanDetail"));
const CreateFinancialPlan = lazy(() => import("./pages/CreateFinancialPlan"));
const BusinessDashboard = lazy(() => import("./pages/BusinessDashboard"));
const Projects = lazy(() => import("./pages/Projects"));
const Tasks = lazy(() => import("./pages/Tasks"));
const Calendar = lazy(() => import("./pages/Calendar"));
const BusinessPlanning = lazy(() => import("./pages/BusinessPlanning"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Revenue = lazy(() => import("./pages/Revenue"));
const Team = lazy(() => import("./pages/Team"));
const TeamManagement = lazy(() => import("./pages/TeamManagement"));
const TeamProfile = lazy(() => import("./pages/TeamProfile"));
const TeamChat = lazy(() => import("./pages/TeamChat"));
const EnhancedTeamChat = lazy(() => import("./components/EnhancedTeamChat"));
const Messages = lazy(() => import("./pages/Messages"));
const Settings = lazy(() => import("./pages/Settings"));
const CRM = lazy(() => import("./pages/CRM"));
const NotFound = lazy(() => import("./pages/NotFound"));
const DocumentEditorPage = lazy(() => import("./pages/DocumentEditorPage"));
const AutomationCenter = lazy(() => import("./pages/AutomationCenter"));
const AnalyticsDashboard = lazy(() => import("./pages/AnalyticsDashboard"));
const Features = lazy(() => import("./pages/Features"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Pricing = lazy(() => import("./pages/Pricing"));
const SubscriptionSuccess = lazy(() => import("./pages/SubscriptionSuccess"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const Install = lazy(() => import("./pages/Install"));
const PublicReports = lazy(() => import("./pages/PublicReports"));
const ReportDetail = lazy(() => import("./pages/ReportDetail"));
const OrganisationSettings = lazy(() => import("./pages/OrganisationSettings"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
      refetchOnMount: false,
    },
  },
});

// Memoized auth guard
const AuthGuard = memo(({ 
  isAuthenticated, 
  redirectTo, 
  children 
}: { 
  isAuthenticated: boolean; 
  redirectTo: string; 
  children: ReactNode;
}) => {
  if (!isAuthenticated) return <Navigate to={redirectTo} replace />;
  return <>{children}</>;
});
AuthGuard.displayName = "AuthGuard";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");

  const handleLogin = useCallback((email: string) => {
    setIsAuthenticated(true);
    setUserEmail(email);
  }, []);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    setUserEmail("");
  }, []);

  // Persistent layout element — same instance reused across child routes
  const financeLayoutElement = isAuthenticated ? (
    <FinanceLayout userEmail={userEmail} onLogout={handleLogout} />
  ) : (
    <Navigate to="/login" replace />
  );

  const businessLayoutElement = isAuthenticated ? (
    <BusinessLayout userEmail={userEmail} onLogout={handleLogout} />
  ) : (
    <Navigate to="/login-business" replace />
  );

  const investorLayoutElement = isAuthenticated ? (
    <InvestorLayout userEmail={userEmail} onLogout={handleLogout} />
  ) : (
    <Navigate to="/login-investor" replace />
  );

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <PWAInstallPrompt />
          <Toaster />
          <Sonner />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/install" element={<Install />} />
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route path="/login-business" element={<LoginBusiness onLogin={handleLogin} />} />
              <Route path="/login-investor" element={<LoginInvestor onLogin={handleLogin} />} />
              <Route path="/login-crm" element={<LoginCRM onLogin={handleLogin} />} />
              <Route path="/login-jenrate" element={<LoginJenrate onLogin={handleLogin} />} />
              <Route path="/crm-standalone" element={
                !isAuthenticated ? <Navigate to="/login-crm" replace /> : <CRMStandalone userEmail={userEmail} onLogout={handleLogout} />
              } />
              <Route path="/jenrate" element={
                !isAuthenticated ? <Navigate to="/login-jenrate" replace /> : <JenrateStandalone userEmail={userEmail} onLogout={handleLogout} />
              } />
              <Route path="/opportunities" element={<Opportunities />} />
              <Route path="/opportunities/:refNumber" element={<OpportunityDetail />} />
              <Route path="/about-us" element={<Features />} />
              <Route path="/features" element={<Features />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/organisation" element={<OrganisationSettings />} />
              <Route path="/reports" element={<PublicReports />} />
              <Route path="/reports/:id" element={<ReportDetail />} />
              <Route path="/subscription-success" element={<SubscriptionSuccess />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />

              {/* Opportunity Intelligence - standalone (no sidebar) */}
              <Route path="/finance/opportunities" element={<Suspense fallback={<PageLoader />}><OpportunityIntelligence /></Suspense>} />
              <Route path="/finance/opportunities/:id" element={<Suspense fallback={<PageLoader />}><OpportunityDetailPage /></Suspense>} />

              {/* ============ FINANCE LAYOUT (persistent) ============ */}
              <Route element={financeLayoutElement}>
                <Route path="/dashboard" element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
                <Route path="/theodore" element={<Suspense fallback={<PageLoader />}><Chat /></Suspense>} />
                <Route path="/calendar" element={<Suspense fallback={<PageLoader />}><Calendar /></Suspense>} />
                <Route path="/market" element={<Suspense fallback={<PageLoader />}><MarketData /></Suspense>} />
                <Route path="/compliance" element={<Suspense fallback={<PageLoader />}><Compliance /></Suspense>} />
                <Route path="/portfolio" element={<Suspense fallback={<PageLoader />}><Portfolio /></Suspense>} />
                <Route path="/financial-planning" element={<Suspense fallback={<PageLoader />}><FinancialPlanning /></Suspense>} />
                <Route path="/financial-planning/new" element={<Suspense fallback={<PageLoader />}><CreateFinancialPlan /></Suspense>} />
                <Route path="/financial-planning/:id" element={<Suspense fallback={<PageLoader />}><FinancialPlanDetail /></Suspense>} />
                <Route path="/goals" element={<Suspense fallback={<PageLoader />}><GoalPlanning /></Suspense>} />
                <Route path="/investments" element={<Suspense fallback={<PageLoader />}><InvestmentAnalysis /></Suspense>} />
                <Route path="/risk" element={<Suspense fallback={<PageLoader />}><RiskAssessment /></Suspense>} />
                <Route path="/scenario" element={<Suspense fallback={<PageLoader />}><ScenarioAnalysis /></Suspense>} />
                <Route path="/clients" element={<Suspense fallback={<PageLoader />}><Clients /></Suspense>} />
                <Route path="/clients/:id" element={<Suspense fallback={<PageLoader />}><ClientProfile /></Suspense>} />
                <Route path="/onboarding" element={<Suspense fallback={<PageLoader />}><ClientOnboarding /></Suspense>} />
                <Route path="/practice" element={<Suspense fallback={<PageLoader />}><PracticeManagement /></Suspense>} />
                <Route path="/finance/reports" element={<Suspense fallback={<PageLoader />}><Reports /></Suspense>} />
                <Route path="/analytics" element={<Suspense fallback={<PageLoader />}><AnalyticsDashboard /></Suspense>} />
                <Route path="/finance-payroll" element={<Suspense fallback={<PageLoader />}><FinancePayroll /></Suspense>} />
                <Route path="/finance-crm" element={<Suspense fallback={<PageLoader />}><CRM /></Suspense>} />
                <Route path="/finance-crm/:id" element={<Suspense fallback={<PageLoader />}><CRMContactDetail /></Suspense>} />
                <Route path="/security" element={<Suspense fallback={<PageLoader />}><Security /></Suspense>} />
                <Route path="/automation-center" element={<Suspense fallback={<PageLoader />}><AutomationCenter /></Suspense>} />
                <Route path="/settings" element={<Suspense fallback={<PageLoader />}><Settings /></Suspense>} />
                <Route path="/finance/commentary" element={<Suspense fallback={<PageLoader />}><FinanceMarketCommentary /></Suspense>} />
                <Route path="/finance/portfolios" element={<Suspense fallback={<PageLoader />}><FinanceModelPortfolios /></Suspense>} />
                <Route path="/finance/trends" element={<Suspense fallback={<PageLoader />}><FinanceBenchmarkingTrends /></Suspense>} />
                <Route path="/finance/ai-analyst" element={<Suspense fallback={<PageLoader />}><FinanceAIAnalyst /></Suspense>} />
                <Route path="/finance/watchlists" element={<Suspense fallback={<PageLoader />}><FinanceWatchlists /></Suspense>} />
                <Route path="/finance/screeners" element={<Suspense fallback={<PageLoader />}><FinanceScreenersDiscovery /></Suspense>} />
                <Route path="/finance/fund-database" element={<Suspense fallback={<PageLoader />}><FundETFDatabase /></Suspense>} />
                <Route path="/finance/opportunities" element={<Suspense fallback={<PageLoader />}><OpportunityIntelligence /></Suspense>} />
                <Route path="/finance/opportunities/:id" element={<Suspense fallback={<PageLoader />}><OpportunityDetailPage /></Suspense>} />
                <Route path="/finance/stocks-crypto" element={<Suspense fallback={<PageLoader />}><RealTimeMarketDatabase /></Suspense>} />
                <Route path="/finance/stocks-crypto-admin" element={<Suspense fallback={<PageLoader />}><StocksCryptoDatabase /></Suspense>} />
                <Route path="/finance/languages" element={<Suspense fallback={<PageLoader />}><FinanceLanguages /></Suspense>} />
                <Route path="/finance/featured-picks" element={<Suspense fallback={<PageLoader />}><FinanceFeaturedPicks /></Suspense>} />
                <Route path="/finance-ai-generator" element={<Suspense fallback={<PageLoader />}><FinanceAIGenerator /></Suspense>} />
              </Route>

              {/* Finance News has its own layout */}
              <Route path="/finance/news" element={<FinanceNews />} />

              <Route path="/chat" element={<Chat />} />

              <Route path="/document-editor" element={
                !isAuthenticated ? <Navigate to="/login" replace /> : <DocumentEditorPage />
              } />

              {/* ============ BUSINESS LAYOUT (persistent) ============ */}
              <Route element={businessLayoutElement}>
                <Route path="/business/dashboard" element={<Suspense fallback={<PageLoader />}><BusinessDashboard /></Suspense>} />
                <Route path="/business/projects" element={<Suspense fallback={<PageLoader />}><Projects /></Suspense>} />
                <Route path="/business/tasks" element={<Suspense fallback={<PageLoader />}><Tasks /></Suspense>} />
                <Route path="/business/chat" element={<Suspense fallback={<PageLoader />}><Chat /></Suspense>} />
                <Route path="/business/calendar" element={<Suspense fallback={<PageLoader />}><Calendar /></Suspense>} />
                <Route path="/business/planning" element={<Suspense fallback={<PageLoader />}><BusinessPlanning /></Suspense>} />
                <Route path="/business/analytics" element={<Suspense fallback={<PageLoader />}><AnalyticsDashboard /></Suspense>} />
                <Route path="/business/reports" element={<Suspense fallback={<PageLoader />}><BusinessReports /></Suspense>} />
                <Route path="/business/revenue" element={<Suspense fallback={<PageLoader />}><Revenue /></Suspense>} />
                <Route path="/business/team/profile" element={<Suspense fallback={<PageLoader />}><TeamProfile /></Suspense>} />
                <Route path="/business/team/chat" element={<Suspense fallback={<PageLoader />}><EnhancedTeamChat /></Suspense>} />
                <Route path="/business/messages" element={<Suspense fallback={<PageLoader />}><Messages /></Suspense>} />
                <Route path="/business/crm" element={<Suspense fallback={<PageLoader />}><CRM /></Suspense>} />
                <Route path="/business/crm/:id" element={<Suspense fallback={<PageLoader />}><CRMContactDetail /></Suspense>} />
                <Route path="/business/payroll" element={<Suspense fallback={<PageLoader />}><Payroll /></Suspense>} />
                <Route path="/business/security" element={<Suspense fallback={<PageLoader />}><Security /></Suspense>} />
                <Route path="/business/ai-generator" element={<Suspense fallback={<PageLoader />}><BusinessAIGenerator /></Suspense>} />
                <Route path="/business/settings" element={<Suspense fallback={<PageLoader />}><Settings /></Suspense>} />
                <Route path="/business/languages" element={<Suspense fallback={<PageLoader />}><BusinessLanguages /></Suspense>} />
                <Route path="/business/automation-center" element={<Suspense fallback={<PageLoader />}><AutomationCenter /></Suspense>} />
              </Route>

              <Route path="/business/team" element={
                !isAuthenticated ? <Navigate to="/login-business" replace /> : <TeamManagement />
              } />

              {/* ============ INVESTOR LAYOUT (persistent) ============ */}
              <Route element={investorLayoutElement}>
                <Route path="/investor/dashboard" element={<Suspense fallback={<PageLoader />}><InvestorDashboard /></Suspense>} />
                <Route path="/investor/research" element={<Suspense fallback={<PageLoader />}><InvestorResearchReports /></Suspense>} />
                <Route path="/investor/analysis" element={<Suspense fallback={<PageLoader />}><AnalysisReports /></Suspense>} />
                <Route path="/investor/commentary" element={<Suspense fallback={<PageLoader />}><MarketCommentary /></Suspense>} />
                <Route path="/investor/portfolios" element={<Suspense fallback={<PageLoader />}><ModelPortfolios /></Suspense>} />
                <Route path="/investor/alerts" element={<Suspense fallback={<PageLoader />}><SignalsAlerts /></Suspense>} />
                <Route path="/investor/newsletters" element={<Suspense fallback={<PageLoader />}><Newsletters /></Suspense>} />
                <Route path="/investor/trends" element={<Suspense fallback={<PageLoader />}><BenchmarkingTrends /></Suspense>} />
                <Route path="/investor/screeners" element={<Suspense fallback={<PageLoader />}><ScreenersDiscovery /></Suspense>} />
                <Route path="/investor/ai-analyst" element={<Suspense fallback={<PageLoader />}><AIAnalyst /></Suspense>} />
                <Route path="/investor/learning" element={<Suspense fallback={<PageLoader />}><LearningHub /></Suspense>} />
                <Route path="/investor/market-data" element={<Suspense fallback={<PageLoader />}><MarketDataHub /></Suspense>} />
                <Route path="/investor/tools" element={<Suspense fallback={<PageLoader />}><ToolsCalculators /></Suspense>} />
                <Route path="/investor/risk-compliance" element={<Suspense fallback={<PageLoader />}><RiskCompliance /></Suspense>} />
                <Route path="/investor/watchlists" element={<Suspense fallback={<PageLoader />}><Watchlists /></Suspense>} />
                <Route path="/investor/languages" element={<Suspense fallback={<PageLoader />}><Languages /></Suspense>} />
                <Route path="/investor/fund-database" element={<Suspense fallback={<PageLoader />}><InvestorFundETFDatabase /></Suspense>} />
                <Route path="/investor/opportunities" element={<Suspense fallback={<PageLoader />}><OpportunityIntelligence /></Suspense>} />
                <Route path="/investor/opportunities/:id" element={<Suspense fallback={<PageLoader />}><OpportunityDetailPage /></Suspense>} />
                <Route path="/investor/stocks-crypto" element={<Suspense fallback={<PageLoader />}><StocksCryptoDatabase /></Suspense>} />
                <Route path="/investor/featured-picks" element={<Suspense fallback={<PageLoader />}><InvestorFeaturedPicks /></Suspense>} />
                <Route path="/investor/tasks" element={<Suspense fallback={<PageLoader />}><InvestorTasks /></Suspense>} />
              </Route>

              <Route path="/investor/news" element={<InvestorNews />} />

              {/* Research Reports */}
              <Route path="/research-reports" element={<ResearchReportsPage />} />
              <Route path="/report-generator" element={<OrchestratedReportsPage />} />

              {/* Admin */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/news" element={<AdminNews />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
