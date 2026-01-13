import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { FinancialNewsFeed } from "@/components/news/FinancialNewsFeed";
import { supabase } from "@/integrations/supabase/client";

const AdminNews = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("news");

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin-login");
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          onLogout={handleLogout} 
        />
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <FinancialNewsFeed />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminNews;
