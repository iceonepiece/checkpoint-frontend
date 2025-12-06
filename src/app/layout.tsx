import type { Metadata } from "next";
import "./globals.css";

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
      <body className="min-h-screen bg-[#0d1117] text-gray-100 selection:bg-blue-500/30">
        {children}
      </body>
    </html>
  );
}