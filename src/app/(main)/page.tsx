"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import FileBrowser from "@/components/FileBrowser";
import FolderSidebar from "@/components/FolderSidebar";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="flex h-full">
      <FolderSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <FileBrowser />
      </div>
    </div>
  );
}