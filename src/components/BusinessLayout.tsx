import { ReactNode } from "react";
import { BusinessSidebar } from "./BusinessSidebar";
import { SidebarProvider, SidebarTrigger } from "./ui/sidebar";

interface BusinessLayoutProps {
  children: ReactNode;
  userEmail: string;
  onLogout: () => void;
}

export function BusinessLayout({ children, userEmail, onLogout }: BusinessLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <BusinessSidebar userEmail={userEmail} onLogout={onLogout} />
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
