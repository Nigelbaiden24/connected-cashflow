import { ReactNode } from "react";
import { InvestorSidebar } from "./InvestorSidebar";
import { SidebarProvider, SidebarTrigger } from "./ui/sidebar";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";
import { TranslatedText } from "./TranslatedText";

interface InvestorLayoutProps {
  children: ReactNode;
  userEmail: string;
  onLogout: () => void;
}

export function InvestorLayout({ children, userEmail, onLogout }: InvestorLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full investor-theme">
        <InvestorSidebar userEmail={userEmail} onLogout={onLogout} />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header with Menu Trigger */}
          <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 md:hidden">
            <SidebarTrigger>
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            <TranslatedText as="h1" className="text-lg font-semibold">FlowPulse Investor</TranslatedText>
          </header>
          
          <main className="flex-1 sidebar-layout-main">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
