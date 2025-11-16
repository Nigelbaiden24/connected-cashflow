import { ReactNode } from "react";
import { InvestorSidebar } from "./InvestorSidebar";
import { SidebarProvider, SidebarTrigger } from "./ui/sidebar";

interface InvestorLayoutProps {
  children: ReactNode;
  userEmail: string;
  onLogout: () => void;
}

export function InvestorLayout({ children, userEmail, onLogout }: InvestorLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <InvestorSidebar userEmail={userEmail} onLogout={onLogout} />
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center gap-4 px-4">
              <SidebarTrigger />
            </div>
          </header>
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
