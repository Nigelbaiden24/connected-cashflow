import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { BusinessLayout } from "@/components/BusinessLayout";
import { FinanceLayout } from "@/components/FinanceLayout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import LoginBusiness from "./pages/LoginBusiness";
import Dashboard from "./pages/Dashboard";
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
import Security from "./pages/Security";
import CRMContactDetail from "./pages/CRMContactDetail";
import Payroll from "./pages/Payroll";
import FinancePayroll from "./pages/FinancePayroll";
import FinancialPlanning from "./pages/FinancialPlanning";
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
import TeamProfile from "./pages/TeamProfile";
import TeamChat from "./pages/TeamChat";
import EnhancedTeamChat from "./components/EnhancedTeamChat";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";
import CRM from "./pages/CRM";
import NotFound from "./pages/NotFound";
import DocumentEditorPage from "./pages/DocumentEditorPage";
import AutomationCenter from "./pages/AutomationCenter";

import AboutUs from "./pages/AboutUs";
import Pricing from "./pages/Pricing";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import PaymentSuccess from "./pages/PaymentSuccess";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isBusinessAuthenticated, setIsBusinessAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const handleLogin = (email: string) => {
    setIsAuthenticated(true);
    setUserEmail(email);
  };

  const handleBusinessLogin = (email: string) => {
    setIsBusinessAuthenticated(true);
    setUserEmail(email);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserEmail("");
  };

  const handleBusinessLogout = () => {
    setIsBusinessAuthenticated(false);
    setUserEmail("");
  };

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/subscription-success" element={<SubscriptionSuccess />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/login" element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />
            } />
            <Route path="/business-login" element={
              isBusinessAuthenticated ? <Navigate to="/business/dashboard" replace /> : <LoginBusiness onLogin={handleBusinessLogin} />
            } />
            
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
            
            <Route path="/reports" element={
              !isAuthenticated ? <Navigate to="/login" replace /> : (
                <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                  <Reports />
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
            
          {/* Business Routes - All prefixed with /business */}
          <Route path="/business/dashboard" element={
            !isBusinessAuthenticated ? <Navigate to="/business-login" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleBusinessLogout}><BusinessDashboard /></BusinessLayout>
          } />
          <Route path="/business/projects" element={
            !isBusinessAuthenticated ? <Navigate to="/business-login" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleBusinessLogout}><Projects /></BusinessLayout>
          } />
          <Route path="/business/tasks" element={
            !isBusinessAuthenticated ? <Navigate to="/business-login" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleBusinessLogout}><Tasks /></BusinessLayout>
          } />
          <Route path="/business/chat" element={
            !isBusinessAuthenticated ? <Navigate to="/business-login" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleBusinessLogout}><Chat /></BusinessLayout>
          } />
          <Route path="/business/calendar" element={
            !isBusinessAuthenticated ? <Navigate to="/business-login" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleBusinessLogout}><Calendar /></BusinessLayout>
          } />
          <Route path="/business/planning" element={
            !isBusinessAuthenticated ? <Navigate to="/business-login" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleBusinessLogout}><BusinessPlanning /></BusinessLayout>
          } />
          <Route path="/business/analytics" element={
            !isBusinessAuthenticated ? <Navigate to="/business-login" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleBusinessLogout}><Analytics /></BusinessLayout>
          } />
          <Route path="/business/revenue" element={
            !isBusinessAuthenticated ? <Navigate to="/business-login" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleBusinessLogout}><Revenue /></BusinessLayout>
          } />
          <Route path="/business/team" element={
            !isBusinessAuthenticated ? <Navigate to="/business-login" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleBusinessLogout}><Team /></BusinessLayout>
          } />
          <Route path="/business/team/profile" element={
            !isBusinessAuthenticated ? <Navigate to="/business-login" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleBusinessLogout}><TeamProfile /></BusinessLayout>
          } />
          <Route path="/business/team/chat" element={
            !isBusinessAuthenticated ? <Navigate to="/business-login" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleBusinessLogout}><EnhancedTeamChat /></BusinessLayout>
          } />
          <Route path="/business/messages" element={
            !isBusinessAuthenticated ? <Navigate to="/business-login" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleBusinessLogout}><Messages /></BusinessLayout>
          } />
          <Route path="/business/crm" element={
            !isBusinessAuthenticated ? <Navigate to="/business-login" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleBusinessLogout}><CRM /></BusinessLayout>
          } />
          <Route path="/business/crm/:id" element={
            !isBusinessAuthenticated ? <Navigate to="/business-login" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleBusinessLogout}><CRMContactDetail /></BusinessLayout>
          } />
          <Route path="/business/payroll" element={
            !isBusinessAuthenticated ? <Navigate to="/business-login" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleBusinessLogout}><Payroll /></BusinessLayout>
          } />
          <Route path="/business/security" element={
            !isBusinessAuthenticated ? <Navigate to="/business-login" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleBusinessLogout}><Security /></BusinessLayout>
          } />
          <Route path="/business/ai-generator" element={
            !isBusinessAuthenticated ? <Navigate to="/business-login" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleBusinessLogout}><BusinessAIGenerator /></BusinessLayout>
          } />
          <Route path="/business/settings" element={
            !isBusinessAuthenticated ? <Navigate to="/business-login" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleBusinessLogout}><Settings /></BusinessLayout>
          } />
          <Route path="/business/automation-center" element={
            !isBusinessAuthenticated ? <Navigate to="/business-login" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleBusinessLogout}><AutomationCenter /></BusinessLayout>
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
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
