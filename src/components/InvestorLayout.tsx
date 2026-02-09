import { ReactNode, useState } from "react";
import { InvestorSidebar } from "./InvestorSidebar";
import { SidebarProvider } from "./ui/sidebar";
import { MobileHeader, MobileBottomNav, MobileSearchOverlay } from "./mobile";
import { InvestorNotificationsDropdown } from "@/components/notifications";
import { 
  LayoutDashboard, 
  FileText, 
  TrendingUp, 
  Eye, 
  Brain 
} from "lucide-react";

interface InvestorLayoutProps {
  children: ReactNode;
  userEmail: string;
  onLogout: () => void;
}

const mobileNavItems = [
  { label: "Dashboard", path: "/investor/dashboard", icon: LayoutDashboard },
  { label: "Research", path: "/investor/research", icon: FileText },
  { label: "Markets", path: "/investor/commentary", icon: TrendingUp },
  { label: "Watchlists", path: "/investor/watchlists", icon: Eye },
  { label: "AI Analyst", path: "/investor/ai-analyst", icon: Brain },
];

export function InvestorLayout({ children, userEmail, onLogout }: InvestorLayoutProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full investor-theme">
        <InvestorSidebar userEmail={userEmail} onLogout={onLogout} />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Enterprise Mobile Header */}
          <MobileHeader
            title="FlowPulse Investor"
            userEmail={userEmail}
            onLogout={onLogout}
            variant="investor"
            showSearch={true}
            onSearchClick={() => setSearchOpen(true)}
            notificationCount={0}
            rightContent={<InvestorNotificationsDropdown variant="investor" />}
          />
          
          <main className="flex-1 sidebar-layout-main pb-20 md:pb-0">
            {children}
          </main>

          {/* Mobile Bottom Navigation */}
          <MobileBottomNav items={mobileNavItems} variant="investor" />
        </div>
      </div>

      {/* Mobile Search Overlay */}
      <MobileSearchOverlay
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        placeholder="Search stocks, funds, research..."
        recentSearches={["Apple Inc", "S&P 500 ETF", "Tech Sector Analysis"]}
        trendingSearches={["AI Stocks", "Dividend Funds", "Market Outlook 2025"]}
      />
    </SidebarProvider>
  );
}
