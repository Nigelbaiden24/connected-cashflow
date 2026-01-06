import { ReactNode } from "react";
import { BusinessSidebar } from "./BusinessSidebar";
import { SidebarProvider, SidebarTrigger } from "./ui/sidebar";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";
import { TranslatedText } from "./TranslatedText";

interface BusinessLayoutProps {
  children: ReactNode;
  userEmail: string;
  onLogout: () => void;
  hideHeader?: boolean;
}

export function BusinessLayout({ children, userEmail, onLogout, hideHeader = false }: BusinessLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full business-theme">
        <BusinessSidebar userEmail={userEmail} onLogout={onLogout} />
        <div className="flex-1 flex flex-col min-w-0 md:pl-64 peer-data-[state=collapsed]:md:pl-16 transition-[padding] duration-200">
          {/* Mobile Header with Menu Trigger */}
          <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 md:hidden">
            <SidebarTrigger>
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            <TranslatedText as="h1" className="text-lg font-semibold">FlowPulse Business</TranslatedText>
          </header>
          
          <main className="flex-1 sidebar-layout-main">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
