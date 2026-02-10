import { ReactNode, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { SidebarProvider } from "./ui/sidebar";
import { MobileHeader, MobileBottomNav, MobileSearchOverlay } from "./mobile";
import { FinanceNotificationsDropdown } from "@/components/notifications";
import { 
  LayoutDashboard, 
  Users, 
  Calculator, 
  FileText, 
  MessageSquare 
} from "lucide-react";

interface FinanceLayoutProps {
  children: ReactNode;
  userEmail: string;
  onLogout: () => void;
  hideHeader?: boolean;
}

const mobileNavItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Clients", path: "/clients", icon: Users },
  { label: "Planning", path: "/financial-planning", icon: Calculator },
  { label: "Reports", path: "/finance/reports", icon: FileText },
  { label: "Chat", path: "/theodore", icon: MessageSquare },
];

export function FinanceLayout({ children, userEmail, onLogout, hideHeader = false }: FinanceLayoutProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar userEmail={userEmail} onLogout={onLogout} />
        <div className="flex-1 flex flex-col min-w-0 md:pl-64 peer-data-[state=collapsed]:md:pl-16 transition-[padding] duration-200">
          {/* Enterprise Mobile Header */}
          {!hideHeader && (
            <MobileHeader
              title="FlowPulse Finance"
              userEmail={userEmail}
              onLogout={onLogout}
              variant="finance"
              showSearch={true}
              onSearchClick={() => setSearchOpen(true)}
              notificationCount={0}
              rightContent={<FinanceNotificationsDropdown variant="finance" />}
            />
          )}
          
          {/* Desktop notification bell */}
          <div className="hidden md:flex items-center justify-end px-4 py-2">
            <FinanceNotificationsDropdown variant="finance" className="text-foreground hover:bg-muted" />
          </div>

          <main className="flex-1 overflow-auto pb-20 md:pb-0">
            {children}
          </main>

          {/* Mobile Bottom Navigation */}
          <MobileBottomNav items={mobileNavItems} variant="finance" />
        </div>
      </div>

      {/* Mobile Search Overlay */}
      <MobileSearchOverlay
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        placeholder="Search clients, funds, reports..."
        recentSearches={["Client Portfolio", "FTSE 100", "Risk Assessment"]}
        trendingSearches={["Market Commentary", "ESG Funds", "Retirement Planning"]}
      />
    </SidebarProvider>
  );
}
