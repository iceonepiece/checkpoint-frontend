"use client";

// Removed imports for useEffect, useRouter, and localStorage logic
import FileBrowser from "@/components/FileBrowser";
import FolderSidebar from "@/components/FolderSidebar";

export default function Page() {
  // Middleware handles the protection now! 
  
  return (
    <div className="flex h-full">
      <FolderSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <FileBrowser />
      </div>
    </div>
  );
}