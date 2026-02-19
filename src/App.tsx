import { useState, lazy, Suspense, memo } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { BusinessLayout } from "@/components/BusinessLayout";
import { FinanceLayout } from "@/components/FinanceLayout";
import { InvestorLayout } from "@/components/InvestorLayout";

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
const Index = lazy(() => import("./pages/Index"));
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min - avoid refetching fresh data
      gcTime: 10 * 60 * 1000, // 10 min garbage collection
      refetchOnWindowFocus: false, // prevent refetch on tab switch
      retry: 1, // single retry on failure
    },
  },
});

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");

  const handleLogin = (email: string) => {
    setIsAuthenticated(true);
    setUserEmail(email);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserEmail("");
  };

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
            <Route path="/reports" element={<PublicReports />} />
            <Route path="/reports/:id" element={<ReportDetail />} />
            <Route path="/subscription-success" element={<SubscriptionSuccess />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
              
            {/* Protected routes with sidebar */}
            <Route path="/dashboard" element={
              !isAuthenticated ? <Navigate to="/login" replace /> : (
                  <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                    <Dashboard />
                  </FinanceLayout>
                )
              } />
              
              <Route path="/theodore" element={
                !isAuthenticated ? <Navigate to="/login" replace /> : (
                  <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                    <Chat />
                  </FinanceLayout>
                )
              } />
              
              <Route path="/calendar" element={
                !isAuthenticated ? <Navigate to="/login" replace /> : (
                  <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                    <Calendar />
                  </FinanceLayout>
                )
              } />
              
              
              <Route path="/market" element={
                !isAuthenticated ? <Navigate to="/login" replace /> : (
                  <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                    <MarketData />
                  </FinanceLayout>
                )
              } />
              
              <Route path="/compliance" element={
                !isAuthenticated ? <Navigate to="/login" replace /> : (
                  <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                    <Compliance />
                  </FinanceLayout>
                )
              } />
              
              <Route path="/portfolio" element={
                !isAuthenticated ? <Navigate to="/login" replace /> : (
                  <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                    <Portfolio />
                  </FinanceLayout>
                )
              } />
              
              <Route path="/financial-planning" element={
                !isAuthenticated ? <Navigate to="/login" replace /> : (
                  <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                    <FinancialPlanning />
                  </FinanceLayout>
                )
              } />
              
              <Route path="/goals" element={
                !isAuthenticated ? <Navigate to="/login" replace /> : (
                  <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                    <GoalPlanning />
                  </FinanceLayout>
                )
              } />
              
              <Route path="/investments" element={
                !isAuthenticated ? <Navigate to="/login" replace /> : (
                  <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                    <InvestmentAnalysis />
                  </FinanceLayout>
                )
              } />
              
              <Route path="/risk" element={
                !isAuthenticated ? <Navigate to="/login" replace /> : (
                  <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                    <RiskAssessment />
                  </FinanceLayout>
                )
              } />
              
              <Route path="/scenario" element={
                !isAuthenticated ? <Navigate to="/login" replace /> : (
                  <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                    <ScenarioAnalysis />
                  </FinanceLayout>
                )
              } />
              
              <Route path="/clients" element={
                !isAuthenticated ? <Navigate to="/login" replace /> : (
                  <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                    <Clients />
                  </FinanceLayout>
                )
              } />
              
              <Route path="/clients/:id" element={
                !isAuthenticated ? <Navigate to="/login" replace /> : (
                  <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                    <ClientProfile />
                  </FinanceLayout>
                )
              } />
              
              <Route path="/onboarding" element={
                !isAuthenticated ? <Navigate to="/login" replace /> : (
                  <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                    <ClientOnboarding />
                  </FinanceLayout>
                )
              } />
              
              <Route path="/practice" element={
                !isAuthenticated ? <Navigate to="/login" replace /> : (
                  <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                    <PracticeManagement />
                  </FinanceLayout>
                )
              } />
              
              <Route path="/finance/reports" element={
                !isAuthenticated ? <Navigate to="/login" replace /> : (
                  <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                    <Reports />
                  </FinanceLayout>
                )
              } />
              
              <Route path="/analytics" element={
                !isAuthenticated ? <Navigate to="/login" replace /> : (
                  <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                    <AnalyticsDashboard />
                  </FinanceLayout>
                )
              } />
              
              <Route path="/finance-payroll" element={
                !isAuthenticated ? <Navigate to="/login" replace /> : (
                  <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                    <FinancePayroll />
                  </FinanceLayout>
                )
              } />
              
              <Route path="/finance-crm" element={
                !isAuthenticated ? <Navigate to="/login" replace /> : (
                  <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                    <CRM />
                  </FinanceLayout>
                )
              } />
              
              <Route path="/finance-crm/:id" element={
                !isAuthenticated ? <Navigate to="/login" replace /> : (
                  <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                    <CRMContactDetail />
                  </FinanceLayout>
                )
              } />
              
              <Route path="/chat" element={<Chat />} />
              
              <Route path="/financial-planning/new" element={
                !isAuthenticated ? <Navigate to="/login" replace /> : (
                  <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                    <CreateFinancialPlan />
                  </FinanceLayout>
                )
              } />
              
              <Route path="/financial-planning/:id" element={
                !isAuthenticated ? <Navigate to="/login" replace /> : (
                  <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                    <FinancialPlanDetail />
                  </FinanceLayout>
                )
              } />
              
              <Route path="/security" element={
                !isAuthenticated ? <Navigate to="/login" replace /> : (
                  <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                    <Security />
                  </FinanceLayout>
                )
              } />
              
              <Route path="/automation-center" element={
                !isAuthenticated ? <Navigate to="/login" replace /> : (
                  <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                    <AutomationCenter />
                  </FinanceLayout>
                )
              } />
              
              <Route path="/settings" element={
                !isAuthenticated ? <Navigate to="/login" replace /> : (
                  <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                    <Settings />
                  </FinanceLayout>
                )
              } />
              
              <Route path="/finance/commentary" element={
                !isAuthenticated ? <Navigate to="/login" replace /> : (
                  <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                    <FinanceMarketCommentary />
                  </FinanceLayout>
                )
              } />
              <Route path="/finance/portfolios" element={
                !isAuthenticated ? <Navigate to="/login" replace /> : (
                  <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                    <FinanceModelPortfolios />
                  </FinanceLayout>
                )
              } />
              <Route path="/finance/trends" element={
                !isAuthenticated ? <Navigate to="/login" replace /> : (
                  <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                    <FinanceBenchmarkingTrends />
                  </FinanceLayout>
                )
              } />
              <Route path="/finance/ai-analyst" element={
                !isAuthenticated ? <Navigate to="/login" replace /> : (
                  <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                    <FinanceAIAnalyst />
                  </FinanceLayout>
                )
              } />
              <Route path="/finance/watchlists" element={
                !isAuthenticated ? <Navigate to="/login" replace /> : (
                  <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                    <FinanceWatchlists />
                  </FinanceLayout>
                )
              } />
              <Route path="/finance/screeners" element={
                !isAuthenticated ? <Navigate to="/login" replace /> : (
                  <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                    <FinanceScreenersDiscovery />
                  </FinanceLayout>
                )
              } />
              <Route path="/finance/fund-database" element={
                !isAuthenticated ? <Navigate to="/login" replace /> : (
                  <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                    <FundETFDatabase />
                  </FinanceLayout>
                )
              } />
              <Route path="/finance/opportunities" element={
                !isAuthenticated ? <Navigate to="/login" replace /> : (
                  <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                    <OpportunityIntelligence />
                  </FinanceLayout>
                )
              } />
              <Route path="/finance/opportunities/:id" element={
                !isAuthenticated ? <Navigate to="/login" replace /> : (
                  <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                    <OpportunityDetailPage />
                  </FinanceLayout>
                )
              } />
              <Route path="/finance/stocks-crypto" element={
                !isAuthenticated ? <Navigate to="/login" replace /> : (
                  <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                    <RealTimeMarketDatabase />
                  </FinanceLayout>
                )
              } />
              <Route path="/finance/stocks-crypto-admin" element={
                !isAuthenticated ? <Navigate to="/login" replace /> : (
                  <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                    <StocksCryptoDatabase />
                  </FinanceLayout>
                )
              } />
              
              <Route path="/finance/languages" element={
                !isAuthenticated ? <Navigate to="/login" replace /> : (
                  <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                    <FinanceLanguages />
                  </FinanceLayout>
                )
              } />
              
              <Route path="/finance/news" element={<FinanceNews />} />
              
              <Route path="/finance/featured-picks" element={
                !isAuthenticated ? <Navigate to="/login" replace /> : (
                  <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                    <FinanceFeaturedPicks />
                  </FinanceLayout>
                )
              } />
              
              <Route path="/investor/featured-picks" element={
                !isAuthenticated ? <Navigate to="/login-investor" replace /> : (
                  <InvestorLayout userEmail={userEmail} onLogout={handleLogout}>
                    <InvestorFeaturedPicks />
                  </InvestorLayout>
                )
              } />
              
              <Route path="/investor/tasks" element={
                !isAuthenticated ? <Navigate to="/login-investor" replace /> : (
                  <InvestorLayout userEmail={userEmail} onLogout={handleLogout}>
                    <InvestorTasks />
                  </InvestorLayout>
                )
              } />
              
            {/* Business Routes - All prefixed with /business */}
            <Route path="/business/dashboard" element={
              !isAuthenticated ? <Navigate to="/login-business" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleLogout}><BusinessDashboard /></BusinessLayout>
            } />
            <Route path="/business/projects" element={
              !isAuthenticated ? <Navigate to="/login-business" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleLogout}><Projects /></BusinessLayout>
            } />
            <Route path="/business/tasks" element={
              !isAuthenticated ? <Navigate to="/login-business" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleLogout}><Tasks /></BusinessLayout>
            } />
            <Route path="/business/chat" element={
              !isAuthenticated ? <Navigate to="/login-business" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleLogout}><Chat /></BusinessLayout>
            } />
            <Route path="/business/calendar" element={
              !isAuthenticated ? <Navigate to="/login-business" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleLogout}><Calendar /></BusinessLayout>
            } />
            <Route path="/business/planning" element={
              !isAuthenticated ? <Navigate to="/login-business" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleLogout}><BusinessPlanning /></BusinessLayout>
            } />
            <Route path="/business/analytics" element={
              !isAuthenticated ? <Navigate to="/login-business" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleLogout}><AnalyticsDashboard /></BusinessLayout>
            } />
            <Route path="/business/reports" element={
              !isAuthenticated ? <Navigate to="/login-business" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleLogout}><BusinessReports /></BusinessLayout>
            } />
            <Route path="/business/revenue" element={
              !isAuthenticated ? <Navigate to="/login-business" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleLogout}><Revenue /></BusinessLayout>
            } />
            <Route path="/business/team" element={
              !isAuthenticated ? <Navigate to="/login-business" replace /> : <TeamManagement />
            } />
            <Route path="/business/team/profile" element={
              !isAuthenticated ? <Navigate to="/login-business" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleLogout}><TeamProfile /></BusinessLayout>
            } />
            <Route path="/business/team/chat" element={
              !isAuthenticated ? <Navigate to="/login-business" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleLogout}><EnhancedTeamChat /></BusinessLayout>
            } />
            <Route path="/business/messages" element={
              !isAuthenticated ? <Navigate to="/login-business" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleLogout}><Messages /></BusinessLayout>
            } />
            <Route path="/business/crm" element={
              !isAuthenticated ? <Navigate to="/login-business" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleLogout}><CRM /></BusinessLayout>
            } />
            <Route path="/business/crm/:id" element={
              !isAuthenticated ? <Navigate to="/login-business" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleLogout}><CRMContactDetail /></BusinessLayout>
            } />
            <Route path="/business/payroll" element={
              !isAuthenticated ? <Navigate to="/login-business" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleLogout}><Payroll /></BusinessLayout>
            } />
            <Route path="/business/security" element={
              !isAuthenticated ? <Navigate to="/login-business" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleLogout}><Security /></BusinessLayout>
            } />
            <Route path="/business/ai-generator" element={
              !isAuthenticated ? <Navigate to="/login-business" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleLogout}><BusinessAIGenerator /></BusinessLayout>
            } />
            <Route path="/business/settings" element={
              !isAuthenticated ? <Navigate to="/login-business" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleLogout}><Settings /></BusinessLayout>
            } />
            <Route path="/business/languages" element={
              !isAuthenticated ? <Navigate to="/login-business" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleLogout}><BusinessLanguages /></BusinessLayout>
            } />
            <Route path="/business/automation-center" element={
              !isAuthenticated ? <Navigate to="/login-business" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleLogout}><AutomationCenter /></BusinessLayout>
            } />
            
            <Route path="/finance-ai-generator" element={
              !isAuthenticated ? <Navigate to="/login" replace /> : (
                <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                  <FinanceAIGenerator />
                </FinanceLayout>
              )
            } />
            
            <Route path="/document-editor" element={
              !isAuthenticated ? <Navigate to="/login" replace /> : (
                <DocumentEditorPage />
              )
            } />
            
            {/* Investor Routes - All prefixed with /investor */}
            <Route path="/investor/dashboard" element={
              !isAuthenticated ? <Navigate to="/login-investor" replace /> : <InvestorLayout userEmail={userEmail} onLogout={handleLogout}><InvestorDashboard /></InvestorLayout>
            } />
            <Route path="/investor/research" element={
              !isAuthenticated ? <Navigate to="/login-investor" replace /> : <InvestorLayout userEmail={userEmail} onLogout={handleLogout}><InvestorResearchReports /></InvestorLayout>
            } />
            <Route path="/investor/analysis" element={
              !isAuthenticated ? <Navigate to="/login-investor" replace /> : <InvestorLayout userEmail={userEmail} onLogout={handleLogout}><AnalysisReports /></InvestorLayout>
            } />
            <Route path="/investor/commentary" element={
              !isAuthenticated ? <Navigate to="/login-investor" replace /> : <InvestorLayout userEmail={userEmail} onLogout={handleLogout}><MarketCommentary /></InvestorLayout>
            } />
            <Route path="/investor/portfolios" element={
              !isAuthenticated ? <Navigate to="/login-investor" replace /> : <InvestorLayout userEmail={userEmail} onLogout={handleLogout}><ModelPortfolios /></InvestorLayout>
            } />
            <Route path="/investor/alerts" element={
              !isAuthenticated ? <Navigate to="/login-investor" replace /> : <InvestorLayout userEmail={userEmail} onLogout={handleLogout}><SignalsAlerts /></InvestorLayout>
            } />
            <Route path="/investor/newsletters" element={
              !isAuthenticated ? <Navigate to="/login-investor" replace /> : <InvestorLayout userEmail={userEmail} onLogout={handleLogout}><Newsletters /></InvestorLayout>
            } />
            <Route path="/investor/trends" element={
              !isAuthenticated ? <Navigate to="/login-investor" replace /> : <InvestorLayout userEmail={userEmail} onLogout={handleLogout}><BenchmarkingTrends /></InvestorLayout>
            } />
            <Route path="/investor/screeners" element={
              !isAuthenticated ? <Navigate to="/login-investor" replace /> : <InvestorLayout userEmail={userEmail} onLogout={handleLogout}><ScreenersDiscovery /></InvestorLayout>
            } />
            <Route path="/investor/ai-analyst" element={
              !isAuthenticated ? <Navigate to="/login-investor" replace /> : <InvestorLayout userEmail={userEmail} onLogout={handleLogout}><AIAnalyst /></InvestorLayout>
            } />
            <Route path="/investor/learning" element={
              !isAuthenticated ? <Navigate to="/login-investor" replace /> : <InvestorLayout userEmail={userEmail} onLogout={handleLogout}><LearningHub /></InvestorLayout>
            } />
            <Route path="/investor/market-data" element={
              !isAuthenticated ? <Navigate to="/login-investor" replace /> : <InvestorLayout userEmail={userEmail} onLogout={handleLogout}><MarketDataHub /></InvestorLayout>
            } />
            <Route path="/investor/tools" element={
              !isAuthenticated ? <Navigate to="/login-investor" replace /> : <InvestorLayout userEmail={userEmail} onLogout={handleLogout}><ToolsCalculators /></InvestorLayout>
            } />
            <Route path="/investor/risk-compliance" element={
              !isAuthenticated ? <Navigate to="/login-investor" replace /> : <InvestorLayout userEmail={userEmail} onLogout={handleLogout}><RiskCompliance /></InvestorLayout>
            } />
            <Route path="/investor/watchlists" element={
              !isAuthenticated ? <Navigate to="/login-investor" replace /> : <InvestorLayout userEmail={userEmail} onLogout={handleLogout}><Watchlists /></InvestorLayout>
            } />
            <Route path="/investor/languages" element={
              !isAuthenticated ? <Navigate to="/login-investor" replace /> : <InvestorLayout userEmail={userEmail} onLogout={handleLogout}><Languages /></InvestorLayout>
            } />
              <Route path="/investor/fund-database" element={
                !isAuthenticated ? <Navigate to="/login-investor" replace /> : (
                  <InvestorLayout userEmail={userEmail} onLogout={handleLogout}>
                    <InvestorFundETFDatabase />
                  </InvestorLayout>
                )
              } />
              <Route path="/investor/opportunities" element={
                !isAuthenticated ? <Navigate to="/login-investor" replace /> : <InvestorLayout userEmail={userEmail} onLogout={handleLogout}><OpportunityIntelligence /></InvestorLayout>
              } />
              <Route path="/investor/opportunities/:id" element={
                !isAuthenticated ? <Navigate to="/login-investor" replace /> : <InvestorLayout userEmail={userEmail} onLogout={handleLogout}><OpportunityDetailPage /></InvestorLayout>
              } />
              <Route path="/investor/stocks-crypto" element={
                !isAuthenticated ? <Navigate to="/login-investor" replace /> : <InvestorLayout userEmail={userEmail} onLogout={handleLogout}><StocksCryptoDatabase /></InvestorLayout>
              } />
              <Route path="/investor/news" element={<InvestorNews />} />
              
              {/* Research Reports Page */}
              <Route path="/research-reports" element={<ResearchReportsPage />} />
              <Route path="/report-generator" element={<OrchestratedReportsPage />} />
              
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
