import { ReactNode } from "react";
import { BusinessSidebar } from "./BusinessSidebar";
import { SidebarProvider } from "./ui/sidebar";

interface BusinessLayoutProps {
  children: ReactNode;
  userEmail: string;
  onLogout: () => void;
  hideHeader?: boolean;
}

export function BusinessLayout({ children, userEmail, onLogout, hideHeader = false }: BusinessLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full business-theme">
        <BusinessSidebar userEmail={userEmail} onLogout={onLogout} />
        <div className="flex-1 flex flex-col ml-64">
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
