"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function Icon(props: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props} />;
}

export default function TopNav() {
  const pathname = usePathname();
  const tabs = [
    { label: "Overview", href: "/overview" },
    { label: "Repository", href: "/" },
    { label: "Issues", href: "/issues" },
    { label: "Pull Requests", href: "/pulls" },
    { label: "Settings", href: "/settings" },
  ];

  const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-50 border-b border-default bg-[#0d1117]/95 backdrop-blur">
      <div className="mx-auto max-w-screen-2xl h-14 px-4 flex items-center gap-4 text-gray-200">
        <button className="sm:hidden text-gray-400"><Icon className="size-6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h16M4 18h16" /></Icon></button>

        <div className="hidden md:flex items-center gap-2 text-sm text-gray-300">
          <div className="size-6 bg-gray-700 rounded-full" />
          <span className="opacity-70">Example-User</span>
          <span className="opacity-50">/</span>
          <Link href="#" className="font-semibold text-white hover:underline">Checkpoint-Project</Link>
          <span className="ml-2 rounded-full border border-default px-2 py-0.5 text-xs text-gray-400">Public</span>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative group">
            <input type="text" placeholder="Type / to search" className="w-full rounded-md bg-[#0d1117] border border-default px-3 py-1.5 pl-9 text-sm text-gray-200 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all" />
            <Icon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-500 group-focus-within:text-blue-400"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Icon>
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:block rounded border border-gray-700 bg-gray-800 px-1.5 text-[10px] text-gray-400">/</kbd>
          </div>
        </div>

        {/* Right Actions */}
        <div className="ml-auto flex items-center gap-2">
           <button className="p-2 text-gray-400 hover:text-white"><Icon className="size-5"><path d="M12 5v14M5 12h14" /></Icon></button>
           <div className="size-8 rounded-full bg-green-600 border border-default" />
        </div>
      </div>
      
      {/* Tabs */}
      <div className="mx-auto max-w-screen-2xl px-4 flex gap-1 overflow-x-auto">
        {tabs.map((tab) => (
           <Link key={tab.href} href={tab.href} className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${isActive(tab.href) ? "border-[#f78166] text-white" : "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-700"}`}>
             {tab.label}
           </Link>
        ))}
      </div>
    </header>
  );
}