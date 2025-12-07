"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/Icon";

export default function TopNav() {
  const pathname = usePathname();
  
  const tabs = [
    { label: "Overview", href: "/overview" },
    { label: "Repository", href: "/" },
    { label: "Issues", href: "/issues" },
    { label: "Pull requests", href: "https://github.com/Example-User/Checkpoint-Project/pulls", external: true },
    { label: "Settings", href: "https://github.com/Example-User/Checkpoint-Project/settings", external: true },
  ];

  const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-50 border-b border-default bg-header/95 backdrop-blur">
      <div className="h-14 px-4 flex items-center gap-4 text-gray-200">
        <button className="sm:hidden text-gray-400"><Icon className="size-6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h16M4 18h16" /></Icon></button>

        <div className="hidden md:flex items-center gap-2 text-sm text-gray-300">
          <div className="size-6 bg-gray-700 rounded-full" />
          <span className="opacity-70">Example-User</span>
          <span className="opacity-50">/</span>
          <Link href="#" className="font-semibold text-white hover:underline">Checkpoint-Project</Link>
          <span className="ml-2 rounded-full border border-default px-2 py-0.5 text-xs text-gray-400">Public</span>
        </div>

        <div className="flex-1" /> 

        <div className="ml-auto flex items-center gap-2">
           <div className="size-8 rounded-full bg-green-600 border border-default" />
        </div>
      </div>
      
      <div className="px-4 flex gap-1 overflow-x-auto">
        {tabs.map((tab) => {
           if (!tab.external) {
             return (
               <Link key={tab.href} href={tab.href} className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${isActive(tab.href) ? "border-[#f78166] text-white" : "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-700"}`}>
                 {tab.label}
               </Link>
             );
           }
           return (
             <a 
                key={tab.href} 
                href={tab.href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-3 py-2 text-sm font-medium border-b-2 border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-700 flex items-center gap-1"
             >
               {tab.label}
               <Icon className="size-3 opacity-50"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></Icon>
             </a>
           );
        })}
      </div>
    </header>
  );
}