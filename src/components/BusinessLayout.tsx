import { ReactNode, useState } from "react";
import { BusinessSidebar } from "./BusinessSidebar";
import { SidebarProvider } from "./ui/sidebar";
import { MobileHeader, MobileBottomNav, MobileSearchOverlay } from "./mobile";
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  BarChart3, 
  MessageSquare 
} from "lucide-react";

interface BusinessLayoutProps {
  children: ReactNode;
  userEmail: string;
  onLogout: () => void;
  hideHeader?: boolean;
}

const mobileNavItems = [
  { label: "Dashboard", path: "/business/dashboard", icon: LayoutDashboard },
  { label: "Projects", path: "/business/projects", icon: FolderKanban },
  { label: "CRM", path: "/business/crm", icon: Users },
  { label: "Analytics", path: "/business/analytics", icon: BarChart3 },
  { label: "Chat", path: "/business/chat", icon: MessageSquare },
];

export function BusinessLayout({ children, userEmail, onLogout, hideHeader = false }: BusinessLayoutProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full business-theme">
        <BusinessSidebar userEmail={userEmail} onLogout={onLogout} />
        <div className="flex-1 flex flex-col min-w-0 md:pl-64 peer-data-[state=collapsed]:md:pl-16 transition-[padding] duration-200">
          {/* Enterprise Mobile Header */}
          {!hideHeader && (
            <MobileHeader
              title="FlowPulse Business"
              userEmail={userEmail}
              onLogout={onLogout}
              variant="business"
              showSearch={true}
              onSearchClick={() => setSearchOpen(true)}
              notificationCount={5}
            />
          )}
          
          <main className="flex-1 sidebar-layout-main pb-20 md:pb-0">
            {children}
          </main>

          {/* Mobile Bottom Navigation */}
          <MobileBottomNav items={mobileNavItems} variant="business" />
        </div>
      </div>

      {/* Mobile Search Overlay */}
      <MobileSearchOverlay
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        placeholder="Search projects, tasks, contacts..."
        recentSearches={["Q4 Marketing", "Client Onboarding", "Budget Report"]}
        trendingSearches={["New Project", "Team Members", "Revenue Report"]}
      />
    </SidebarProvider>
  );
}
