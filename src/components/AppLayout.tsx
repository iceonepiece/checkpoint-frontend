"use client";

import { usePathname } from "next/navigation";
import FolderSidebar from "@/components/FolderSidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Define logic: Sidebar only appears on Root and Asset pages
  // Adjust this condition if you want it on other pages like /upload
  const showSidebar = pathname === "/" || pathname.startsWith("/asset");

  if (showSidebar) {
    return (
      <div className="flex h-full overflow-hidden">
        {/* Sidebar persists here */}
        <FolderSidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
           {children}
        </div>
      </div>
    );
  }

  // For pages like /issues or /overview, just render content full width
  return (
    <div className="flex h-full overflow-hidden bg-background">
        {children}
    </div>
  );
}