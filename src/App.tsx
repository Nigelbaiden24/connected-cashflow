import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import MarketData from "./pages/MarketData";
import Clients from "./pages/Clients";
import ClientProfile from "./pages/ClientProfile";
import Compliance from "./pages/Compliance";
import Portfolio from "./pages/Portfolio";
import FinancialPlanning from "./pages/FinancialPlanning";
import GoalPlanning from "./pages/GoalPlanning";
import InvestmentAnalysis from "./pages/InvestmentAnalysis";
import RiskAssessment from "./pages/RiskAssessment";
import ScenarioAnalysis from "./pages/ScenarioAnalysis";
import ClientOnboarding from "./pages/ClientOnboarding";
import PracticeManagement from "./pages/PracticeManagement";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const handleLogin = (email: string) => {
    setIsAuthenticated(true);
    setUserEmail(email);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserEmail("");
  };

  if (!isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Login onLogin={handleLogin} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <AppSidebar userEmail={userEmail} onLogout={handleLogout} />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/market" element={<MarketData />} />
                  <Route path="/compliance" element={<Compliance />} />
                  <Route path="/portfolio" element={<Portfolio />} />
                  <Route path="/planning" element={<FinancialPlanning />} />
                  <Route path="/goals" element={<GoalPlanning />} />
                  <Route path="/investments" element={<InvestmentAnalysis />} />
                  <Route path="/risk" element={<RiskAssessment />} />
                  <Route path="/scenario" element={<ScenarioAnalysis />} />
                  <Route path="/clients" element={<Clients />} />
                  <Route path="/clients/:id" element={<ClientProfile />} />
                  <Route path="/onboarding" element={<ClientOnboarding />} />
                  <Route path="/practice" element={<PracticeManagement />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/settings" element={<Dashboard />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
