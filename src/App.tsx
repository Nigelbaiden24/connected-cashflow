import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { AppSidebar } from "@/components/AppSidebar";
import { BusinessLayout } from "@/components/BusinessLayout";
import { FinanceLayout } from "@/components/FinanceLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
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
  const [session, setSession] = useState<Session | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUserEmail(session?.user?.email || "");
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUserEmail(session?.user?.email || "");
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUserEmail("");
  };

  const isAuthenticated = !!session;

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
            <Route path="/auth" element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Auth />
            } />
            
            {/* Protected routes with sidebar */}
            <Route path="/dashboard" element={
              !isAuthenticated ? <Navigate to="/auth" replace /> : (
                <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                  <Dashboard />
                </FinanceLayout>
              )
            } />
            
            <Route path="/theodore" element={
              !isAuthenticated ? <Navigate to="/auth" replace /> : (
                <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                  <Chat />
                </FinanceLayout>
              )
            } />
            
            
            <Route path="/market" element={
              !isAuthenticated ? <Navigate to="/auth" replace /> : (
                <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                  <MarketData />
                </FinanceLayout>
              )
            } />
            
            <Route path="/compliance" element={
              !isAuthenticated ? <Navigate to="/auth" replace /> : (
                <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                  <Compliance />
                </FinanceLayout>
              )
            } />
            
            <Route path="/portfolio" element={
              !isAuthenticated ? <Navigate to="/auth" replace /> : (
                <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                  <Portfolio />
                </FinanceLayout>
              )
            } />
            
            <Route path="/financial-planning" element={
              !isAuthenticated ? <Navigate to="/auth" replace /> : (
                <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                  <FinancialPlanning />
                </FinanceLayout>
              )
            } />
            
            <Route path="/goals" element={
              !isAuthenticated ? <Navigate to="/auth" replace /> : (
                <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                  <GoalPlanning />
                </FinanceLayout>
              )
            } />
            
            <Route path="/investments" element={
              !isAuthenticated ? <Navigate to="/auth" replace /> : (
                <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                  <InvestmentAnalysis />
                </FinanceLayout>
              )
            } />
            
            <Route path="/risk" element={
              !isAuthenticated ? <Navigate to="/auth" replace /> : (
                <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                  <RiskAssessment />
                </FinanceLayout>
              )
            } />
            
            <Route path="/scenario" element={
              !isAuthenticated ? <Navigate to="/auth" replace /> : (
                <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                  <ScenarioAnalysis />
                </FinanceLayout>
              )
            } />
            
            <Route path="/clients" element={
              !isAuthenticated ? <Navigate to="/auth" replace /> : (
                <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                  <Clients />
                </FinanceLayout>
              )
            } />
            
            <Route path="/clients/:id" element={
              !isAuthenticated ? <Navigate to="/auth" replace /> : (
                <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                  <ClientProfile />
                </FinanceLayout>
              )
            } />
            
            <Route path="/onboarding" element={
              !isAuthenticated ? <Navigate to="/auth" replace /> : (
                <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                  <ClientOnboarding />
                </FinanceLayout>
              )
            } />
            
            <Route path="/practice" element={
              !isAuthenticated ? <Navigate to="/auth" replace /> : (
                <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                  <PracticeManagement />
                </FinanceLayout>
              )
            } />
            
            <Route path="/reports" element={
              !isAuthenticated ? <Navigate to="/auth" replace /> : (
                <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                  <Reports />
                </FinanceLayout>
              )
            } />
            
            <Route path="/finance-payroll" element={
              !isAuthenticated ? <Navigate to="/auth" replace /> : (
                <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                  <FinancePayroll />
                </FinanceLayout>
              )
            } />
            
            <Route path="/finance-crm" element={
              !isAuthenticated ? <Navigate to="/auth" replace /> : (
                <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                  <CRM />
                </FinanceLayout>
              )
            } />
            
            <Route path="/finance-crm/:id" element={
              !isAuthenticated ? <Navigate to="/auth" replace /> : (
                <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                  <CRMContactDetail />
                </FinanceLayout>
              )
            } />
            
            <Route path="/chat" element={<Chat />} />
            
            <Route path="/financial-planning/new" element={
              !isAuthenticated ? <Navigate to="/auth" replace /> : (
                <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                  <CreateFinancialPlan />
                </FinanceLayout>
              )
            } />
            
            <Route path="/financial-planning/:id" element={
              !isAuthenticated ? <Navigate to="/auth" replace /> : (
                <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                  <FinancialPlanDetail />
                </FinanceLayout>
              )
            } />
            
            <Route path="/security" element={
              !isAuthenticated ? <Navigate to="/auth" replace /> : (
                <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                  <Security />
                </FinanceLayout>
              )
            } />
            
            <Route path="/automation-center" element={
              !isAuthenticated ? <Navigate to="/auth" replace /> : (
                <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                  <AutomationCenter />
                </FinanceLayout>
              )
            } />
            
          {/* Business Routes - All prefixed with /business */}
          <Route path="/business/dashboard" element={
            !isAuthenticated ? <Navigate to="/auth" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleLogout}><BusinessDashboard /></BusinessLayout>
          } />
          <Route path="/business/projects" element={
            !isAuthenticated ? <Navigate to="/auth" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleLogout}><Projects /></BusinessLayout>
          } />
          <Route path="/business/tasks" element={
            !isAuthenticated ? <Navigate to="/auth" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleLogout}><Tasks /></BusinessLayout>
          } />
          <Route path="/business/chat" element={
            !isAuthenticated ? <Navigate to="/auth" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleLogout}><Chat /></BusinessLayout>
          } />
          <Route path="/business/calendar" element={
            !isAuthenticated ? <Navigate to="/auth" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleLogout}><Calendar /></BusinessLayout>
          } />
          <Route path="/business/planning" element={
            !isAuthenticated ? <Navigate to="/auth" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleLogout}><BusinessPlanning /></BusinessLayout>
          } />
          <Route path="/business/analytics" element={
            !isAuthenticated ? <Navigate to="/auth" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleLogout}><Analytics /></BusinessLayout>
          } />
          <Route path="/business/revenue" element={
            !isAuthenticated ? <Navigate to="/auth" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleLogout}><Revenue /></BusinessLayout>
          } />
          <Route path="/business/team" element={
            !isAuthenticated ? <Navigate to="/auth" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleLogout}><Team /></BusinessLayout>
          } />
          <Route path="/business/team/profile" element={
            !isAuthenticated ? <Navigate to="/auth" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleLogout}><TeamProfile /></BusinessLayout>
          } />
          <Route path="/business/team/chat" element={
            !isAuthenticated ? <Navigate to="/auth" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleLogout}><EnhancedTeamChat /></BusinessLayout>
          } />
          <Route path="/business/messages" element={
            !isAuthenticated ? <Navigate to="/auth" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleLogout}><Messages /></BusinessLayout>
          } />
          <Route path="/business/crm" element={
            !isAuthenticated ? <Navigate to="/auth" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleLogout}><CRM /></BusinessLayout>
          } />
          <Route path="/business/crm/:id" element={
            !isAuthenticated ? <Navigate to="/auth" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleLogout}><CRMContactDetail /></BusinessLayout>
          } />
          <Route path="/business/payroll" element={
            !isAuthenticated ? <Navigate to="/auth" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleLogout}><Payroll /></BusinessLayout>
          } />
          <Route path="/business/security" element={
            !isAuthenticated ? <Navigate to="/auth" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleLogout}><Security /></BusinessLayout>
          } />
          <Route path="/business/ai-generator" element={
            !isAuthenticated ? <Navigate to="/auth" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleLogout}><BusinessAIGenerator /></BusinessLayout>
          } />
          <Route path="/business/settings" element={
            !isAuthenticated ? <Navigate to="/auth" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleLogout}><Settings /></BusinessLayout>
          } />
          <Route path="/business/automation-center" element={
            !isAuthenticated ? <Navigate to="/auth" replace /> : <BusinessLayout userEmail={userEmail} onLogout={handleLogout}><AutomationCenter /></BusinessLayout>
          } />
          
          <Route path="/finance-ai-generator" element={
            !isAuthenticated ? <Navigate to="/auth" replace /> : (
              <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
                <FinanceAIGenerator />
              </FinanceLayout>
            )
          } />
          
          <Route path="/document-editor" element={
            !isAuthenticated ? <Navigate to="/auth" replace /> : (
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
