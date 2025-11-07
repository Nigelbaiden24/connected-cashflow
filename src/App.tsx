import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
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
import Recruitment from "./pages/Recruitment";
import Technology from "./pages/Technology";
import Finance from "./pages/Finance";
import AllSectors from "./pages/AllSectors";
import CandidateRegistration from "./pages/CandidateRegistration";
import EmployerVacancy from "./pages/EmployerVacancy";
import AdminJobs from "./pages/AdminJobs";
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

import AboutUs from "./pages/AboutUs";
import Pricing from "./pages/Pricing";

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
            <Route path="/" element={<Recruitment />} />
            <Route path="/recruitment" element={<Recruitment />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/technology" element={<Technology />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/all-sectors" element={<AllSectors />} />
            <Route path="/candidate-registration" element={<CandidateRegistration />} />
            <Route path="/employer-vacancy" element={<EmployerVacancy />} />
            <Route path="/admin/jobs" element={<AdminJobs />} />
            <Route path="/login" element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />
            } />
            <Route path="/business-login" element={
              isBusinessAuthenticated ? <Navigate to="/business-dashboard" replace /> : <LoginBusiness onLogin={handleBusinessLogin} />
            } />
            
            {/* Protected routes with sidebar */}
            <Route path="/dashboard" element={
              !isAuthenticated ? <Navigate to="/login" replace /> : (
                <SidebarProvider>
                  <div className="flex min-h-screen w-full">
                    <AppSidebar userEmail={userEmail} onLogout={handleLogout} />
                    <main className="flex-1">
                      <Dashboard />
                    </main>
                  </div>
                </SidebarProvider>
              )
            } />
            
            <Route path="/theodore" element={
              !isAuthenticated ? <Navigate to="/login" replace /> : (
                <SidebarProvider>
                  <div className="flex min-h-screen w-full">
                    <AppSidebar userEmail={userEmail} onLogout={handleLogout} />
                    <main className="flex-1">
                      <Chat />
                    </main>
                  </div>
                </SidebarProvider>
              )
            } />
            
            
            <Route path="/market" element={
              !isAuthenticated ? <Navigate to="/login" replace /> : (
                <SidebarProvider>
                  <div className="flex min-h-screen w-full">
                    <AppSidebar userEmail={userEmail} onLogout={handleLogout} />
                    <main className="flex-1">
                      <MarketData />
                    </main>
                  </div>
                </SidebarProvider>
              )
            } />
            
            <Route path="/compliance" element={
              !isAuthenticated ? <Navigate to="/login" replace /> : (
                <SidebarProvider>
                  <div className="flex min-h-screen w-full">
                    <AppSidebar userEmail={userEmail} onLogout={handleLogout} />
                    <main className="flex-1">
                      <Compliance />
                    </main>
                  </div>
                </SidebarProvider>
              )
            } />
            
            <Route path="/portfolio" element={
              !isAuthenticated ? <Navigate to="/login" replace /> : (
                <SidebarProvider>
                  <div className="flex min-h-screen w-full">
                    <AppSidebar userEmail={userEmail} onLogout={handleLogout} />
                    <main className="flex-1">
                      <Portfolio />
                    </main>
                  </div>
                </SidebarProvider>
              )
            } />
            
            <Route path="/financial-planning" element={
              !isAuthenticated ? <Navigate to="/login" replace /> : (
                <SidebarProvider>
                  <div className="flex min-h-screen w-full">
                    <AppSidebar userEmail={userEmail} onLogout={handleLogout} />
                    <main className="flex-1">
                      <FinancialPlanning />
                    </main>
                  </div>
                </SidebarProvider>
              )
            } />
            
            <Route path="/goals" element={
              !isAuthenticated ? <Navigate to="/login" replace /> : (
                <SidebarProvider>
                  <div className="flex min-h-screen w-full">
                    <AppSidebar userEmail={userEmail} onLogout={handleLogout} />
                    <main className="flex-1">
                      <GoalPlanning />
                    </main>
                  </div>
                </SidebarProvider>
              )
            } />
            
            <Route path="/investments" element={
              !isAuthenticated ? <Navigate to="/login" replace /> : (
                <SidebarProvider>
                  <div className="flex min-h-screen w-full">
                    <AppSidebar userEmail={userEmail} onLogout={handleLogout} />
                    <main className="flex-1">
                      <InvestmentAnalysis />
                    </main>
                  </div>
                </SidebarProvider>
              )
            } />
            
            <Route path="/risk" element={
              !isAuthenticated ? <Navigate to="/login" replace /> : (
                <SidebarProvider>
                  <div className="flex min-h-screen w-full">
                    <AppSidebar userEmail={userEmail} onLogout={handleLogout} />
                    <main className="flex-1">
                      <RiskAssessment />
                    </main>
                  </div>
                </SidebarProvider>
              )
            } />
            
            <Route path="/scenario" element={
              !isAuthenticated ? <Navigate to="/login" replace /> : (
                <SidebarProvider>
                  <div className="flex min-h-screen w-full">
                    <AppSidebar userEmail={userEmail} onLogout={handleLogout} />
                    <main className="flex-1">
                      <ScenarioAnalysis />
                    </main>
                  </div>
                </SidebarProvider>
              )
            } />
            
            <Route path="/clients" element={
              !isAuthenticated ? <Navigate to="/login" replace /> : (
                <SidebarProvider>
                  <div className="flex min-h-screen w-full">
                    <AppSidebar userEmail={userEmail} onLogout={handleLogout} />
                    <main className="flex-1">
                      <Clients />
                    </main>
                  </div>
                </SidebarProvider>
              )
            } />
            
            <Route path="/clients/:id" element={
              !isAuthenticated ? <Navigate to="/login" replace /> : (
                <SidebarProvider>
                  <div className="flex min-h-screen w-full">
                    <AppSidebar userEmail={userEmail} onLogout={handleLogout} />
                    <main className="flex-1">
                      <ClientProfile />
                    </main>
                  </div>
                </SidebarProvider>
              )
            } />
            
            <Route path="/onboarding" element={
              !isAuthenticated ? <Navigate to="/login" replace /> : (
                <SidebarProvider>
                  <div className="flex min-h-screen w-full">
                    <AppSidebar userEmail={userEmail} onLogout={handleLogout} />
                    <main className="flex-1">
                      <ClientOnboarding />
                    </main>
                  </div>
                </SidebarProvider>
              )
            } />
            
            <Route path="/practice" element={
              !isAuthenticated ? <Navigate to="/login" replace /> : (
                <SidebarProvider>
                  <div className="flex min-h-screen w-full">
                    <AppSidebar userEmail={userEmail} onLogout={handleLogout} />
                    <main className="flex-1">
                      <PracticeManagement />
                    </main>
                  </div>
                </SidebarProvider>
              )
            } />
            
            <Route path="/reports" element={
              !isAuthenticated ? <Navigate to="/login" replace /> : (
                <SidebarProvider>
                  <div className="flex min-h-screen w-full">
                    <AppSidebar userEmail={userEmail} onLogout={handleLogout} />
                    <main className="flex-1">
                      <Reports />
                    </main>
                  </div>
                </SidebarProvider>
              )
            } />
            
            <Route path="/finance-payroll" element={
              !isAuthenticated ? <Navigate to="/login" replace /> : (
                <SidebarProvider>
                  <div className="flex min-h-screen w-full">
                    <AppSidebar userEmail={userEmail} onLogout={handleLogout} />
                    <main className="flex-1">
                      <FinancePayroll />
                    </main>
                  </div>
                </SidebarProvider>
              )
            } />
            
            <Route path="/crm/:id" element={
              !isAuthenticated ? <Navigate to="/login" replace /> : (
                <SidebarProvider>
                  <div className="flex min-h-screen w-full">
                    <AppSidebar userEmail={userEmail} onLogout={handleLogout} />
                    <main className="flex-1">
                      <CRMContactDetail />
                    </main>
                  </div>
                </SidebarProvider>
              )
            } />
            
            <Route path="/chat" element={<Chat />} />
            
            <Route path="/financial-planning" element={
              !isAuthenticated ? <Navigate to="/login" replace /> : (
                <SidebarProvider>
                  <div className="flex min-h-screen w-full">
                    <AppSidebar userEmail={userEmail} onLogout={handleLogout} />
                    <main className="flex-1">
                      <FinancialPlanning />
                    </main>
                  </div>
                </SidebarProvider>
              )
            } />
            
            <Route path="/financial-planning/new" element={
              !isAuthenticated ? <Navigate to="/login" replace /> : (
                <SidebarProvider>
                  <div className="flex min-h-screen w-full">
                    <AppSidebar userEmail={userEmail} onLogout={handleLogout} />
                    <main className="flex-1">
                      <CreateFinancialPlan />
                    </main>
                  </div>
                </SidebarProvider>
              )
            } />
            
            <Route path="/financial-planning/:id" element={
              !isAuthenticated ? <Navigate to="/login" replace /> : (
                <SidebarProvider>
                  <div className="flex min-h-screen w-full">
                    <AppSidebar userEmail={userEmail} onLogout={handleLogout} />
                    <main className="flex-1">
                      <FinancialPlanDetail />
                    </main>
                  </div>
                </SidebarProvider>
              )
            } />
            
            <Route path="/settings" element={
              !isAuthenticated ? <Navigate to="/login" replace /> : (
                <SidebarProvider>
                  <div className="flex min-h-screen w-full">
                    <AppSidebar userEmail={userEmail} onLogout={handleLogout} />
                    <main className="flex-1">
                      <Dashboard />
                    </main>
                  </div>
                </SidebarProvider>
              )
            } />
            
          <Route path="/business-dashboard" element={
            !isBusinessAuthenticated ? <Navigate to="/business-login" replace /> : <BusinessDashboard />
          } />
          <Route path="/projects" element={<Projects />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/business-planning" element={<BusinessPlanning />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/revenue" element={<Revenue />} />
          <Route path="/team" element={<Team />} />
            <Route path="/team/profile" element={<TeamProfile />} />
            <Route path="/team/chat" element={<EnhancedTeamChat />} />
            <Route path="/messages" element={<Messages />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/crm" element={<CRM />} />
          <Route path="/crm/:id" element={<CRMContactDetail />} />
          <Route path="/payroll" element={<Payroll />} />
          <Route path="/security" element={<Security />} />
          <Route path="/business-ai-generator" element={<BusinessAIGenerator />} />
          
          <Route path="/finance-ai-generator" element={
            !isAuthenticated ? <Navigate to="/login" replace /> : (
              <SidebarProvider>
                <div className="flex min-h-screen w-full">
                  <main className="flex-1">
                    <FinanceAIGenerator />
                  </main>
                </div>
              </SidebarProvider>
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
