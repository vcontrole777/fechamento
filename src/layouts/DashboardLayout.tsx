
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/dashboard/Navbar";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TeamViewBanner } from "@/components/admin/TeamViewBanner";
import { NotificationPopup } from "@/components/NotificationPopup";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export function DashboardLayout() {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  // Close sidebar by default on mobile
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <NotificationPopup />
      <Sidebar 
        className={cn(
          "transition-all duration-300 fixed md:relative z-30",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )} 
      />
      
      {/* Overlay for mobile when sidebar is open */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar onToggleSidebar={toggleSidebar} />
        <TeamViewBanner />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
