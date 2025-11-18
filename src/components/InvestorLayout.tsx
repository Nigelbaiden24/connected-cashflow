import { ReactNode } from "react";
import { InvestorSidebar } from "./InvestorSidebar";
import { SidebarProvider } from "./ui/sidebar";

interface InvestorLayoutProps {
  children: ReactNode;
  userEmail: string;
  onLogout: () => void;
}

export function InvestorLayout({ children, userEmail, onLogout }: InvestorLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full investor-theme">
        <InvestorSidebar userEmail={userEmail} onLogout={onLogout} />
        <div className="flex-1 flex flex-col ml-64">
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
