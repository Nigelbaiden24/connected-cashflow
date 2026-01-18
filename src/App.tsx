import { useState, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { AppSidebar } from "@/components/AppSidebar";
import { BusinessLayout } from "@/components/BusinessLayout";
import { FinanceLayout } from "@/components/FinanceLayout";
import { InvestorLayout } from "@/components/InvestorLayout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import LoginBusiness from "./pages/LoginBusiness";
import LoginInvestor from "./pages/LoginInvestor";
import Dashboard from "./pages/Dashboard";
import InvestorDashboard from "./pages/InvestorDashboard";
import InvestorResearchReports from "./pages/investor/ResearchReports";
import ResearchReportsPage from "./pages/ResearchReports";
import OrchestratedReportsPage from "./pages/OrchestratedReports";
import AnalysisReports from "./pages/investor/AnalysisReports";
import MarketCommentary from "./pages/investor/MarketCommentary";
import ModelPortfolios from "./pages/investor/ModelPortfolios";
import SignalsAlerts from "./pages/investor/SignalsAlerts";
import Newsletters from "./pages/investor/Newsletters";
import BenchmarkingTrends from "./pages/investor/BenchmarkingTrends";
import ScreenersDiscovery from "./pages/investor/ScreenersDiscovery";
import AIAnalyst from "./pages/investor/AIAnalyst";
import LearningHub from "./pages/investor/LearningHub";
import MarketDataHub from "./pages/investor/MarketDataHub";
import ToolsCalculators from "./pages/investor/ToolsCalculators";
import RiskCompliance from "./pages/investor/RiskCompliance";
import Watchlists from "./pages/investor/Watchlists";
import Languages from "./pages/investor/Languages";
import BusinessLanguages from "./pages/business/Languages";
import FinanceLanguages from "./pages/finance/Languages";
import FinanceMarketCommentary from "./pages/finance/MarketCommentary";
import FinanceModelPortfolios from "./pages/finance/ModelPortfolios";
import FinanceBenchmarkingTrends from "./pages/finance/BenchmarkingTrends";
import FinanceAIAnalyst from "./pages/finance/AIAnalyst";
import FinanceWatchlists from "./pages/finance/Watchlists";
import FinanceScreenersDiscovery from "./pages/finance/ScreenersDiscovery";
import StocksCryptoDatabase from "./pages/StocksCryptoDatabase";
import RealTimeMarketDatabase from "./pages/RealTimeMarketDatabase";
import FinanceNews from "./pages/finance/News";
import FinanceFeaturedPicks from "./pages/finance/FeaturedPicks";
import InvestorNews from "./pages/investor/News";
import InvestorFeaturedPicks from "./pages/investor/FeaturedPicks";
import AdminNews from "./pages/admin/News";

// Lazy load heavy components with large data files
const FundETFDatabase = lazy(() => import("./pages/finance/FundETFDatabase"));
const InvestorFundETFDatabase = lazy(() => import("./pages/investor/FundETFDatabase"));
import InvestorTasks from "./pages/investor/Tasks";
import Opportunities from "./pages/Opportunities";
import OpportunityDetail from "./pages/OpportunityDetail";
import OpportunityIntelligence from "./pages/OpportunityIntelligence";
import Chat from "./pages/Chat";
import FinanceAIGenerator from "./pages/FinanceAIGenerator";
import BusinessAIGenerator from "./pages/BusinessAIGenerator";
import MarketData from "./pages/MarketData";
import Clients from "./pages/Clients";
import ClientProfile from "./pages/ClientProfile";
import Compliance from "./pages/Compliance";
import Portfolio from "./pages/Portfolio";
import GoalPlanning from "./pages/GoalPlanning";
import InvestmentAnalysis from "./pages/InvestmentAnalysis";
import RiskAssessment from "./pages/RiskAssessment";
import ScenarioAnalysis from "./pages/ScenarioAnalysis";
import ClientOnboarding from "./pages/ClientOnboarding";
import PracticeManagement from "./pages/PracticeManagement";
import Reports from "./pages/Reports";
import BusinessReports from "./pages/BusinessReports";
import Security from "./pages/Security";
import CRMContactDetail from "./pages/CRMContactDetail";
import Payroll from "./pages/Payroll";
import FinancePayroll from "./pages/FinancePayroll";
import FinancialPlanning from "./pages/FinancialPlanningEnhanced";
import FinancialPlanDetail from "./pages/FinancialPlanDetail";
import CreateFinancialPlan from "./pages/CreateFinancialPlan";
import BusinessDashboard from "./pages/BusinessDashboard";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import Calendar from "./pages/Calendar";
import BusinessPlanning from "./pages/BusinessPlanning";
import Analytics from "./pages/Analytics";
import Revenue from "./pages/Revenue";
import Team from "./pages/Team";
import TeamManagement from "./pages/TeamManagement";
import TeamProfile from "./pages/TeamProfile";
import TeamChat from "./pages/TeamChat";
import EnhancedTeamChat from "./components/EnhancedTeamChat";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";
import CRM from "./pages/CRM";
import NotFound from "./pages/NotFound";
import DocumentEditorPage from "./pages/DocumentEditorPage";
import AutomationCenter from "./pages/AutomationCenter";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";

import Features from "./pages/Features";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Pricing from "./pages/Pricing";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import PaymentSuccess from "./pages/PaymentSuccess";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import Install from "./pages/Install";
import PublicReports from "./pages/PublicReports";
import ReportDetail from "./pages/ReportDetail";

const queryClient = new QueryClient();

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
          <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/install" element={<Install />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/login-business" element={<LoginBusiness onLogin={handleLogin} />} />
          <Route path="/login-investor" element={<LoginInvestor onLogin={handleLogin} />} />
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
                  <Suspense fallback={
                    <div className="flex items-center justify-center min-h-[60vh]">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                        <p className="text-sm text-muted-foreground">Loading Fund Database...</p>
                      </div>
                    </div>
                  }>
                    <FundETFDatabase />
                  </Suspense>
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
                  <Suspense fallback={
                    <div className="flex items-center justify-center min-h-[60vh]">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                        <p className="text-sm text-muted-foreground">Loading Fund Database...</p>
                      </div>
                    </div>
                  }>
                    <InvestorFundETFDatabase />
                  </Suspense>
                </InvestorLayout>
              )
            } />
            <Route path="/investor/opportunities" element={
              !isAuthenticated ? <Navigate to="/login-investor" replace /> : <InvestorLayout userEmail={userEmail} onLogout={handleLogout}><OpportunityIntelligence /></InvestorLayout>
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
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
