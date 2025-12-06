import type { Metadata } from "next";
import "./globals.css";
import TopNav from "@/components/TopNav";
import FolderSidebar from "@/components/FolderSidebar";

export const metadata: Metadata = {
  title: "CheckPoint",
  description: "Git for art creator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-[#0d1117] text-gray-100">
        <TopNav />
        <div className="mx-auto max-w-screen-2xl">
          <div className="flex">
            <FolderSidebar />
            <main className="min-w-0 flex-1">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}