"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import { MOCK_REPOS } from "@/lib/mockRepos";

export default function TopNav() {
  const pathname = usePathname();
  const [repoOpen, setRepoOpen] = useState(false);
  // -----Mock-----
  const [currentRepo, setCurrentRepo] = useState(MOCK_REPOS[0]);

  // -----Mock-----
  const tabs = [
    { label: "Overview", href: "/overview" },
    { label: "Repository", href: "/" },
    { label: "Issues", href: "https://github.com/iceonepiece/checkpoint-frontend/issues", external: true },
    { label: "Pull requests", href: "https://github.com/iceonepiece/checkpoint-frontend/pulls", external: true },
    { label: "Settings", href: "https://github.com/iceonepiece/checkpoint-frontend/settings", external: true },
  ];
  // -----Real-----
  // const tabs = [
  //   { label: "Overview", href: "/overview" },
  //   { label: "Repository", href: "/" },
  //   { label: "Issues", href: `https://github.com/${currentRepo.fullName}/issues`, external: true },
  //   { label: "Pull requests", href: `https://github.com/${currentRepo.fullName}/pulls`, external: true },
  //   { label: "Settings", href: `https://github.com/${currentRepo.fullName}/settings`, external: true },
  // ];

  const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-50 border-b border-default bg-[var(--bg-header)] backdrop-blur">
      <div className="h-14 px-4 flex items-center gap-4">

        {/* LEFT: Site Logo & Name */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="size-8 rounded-md bg-white text-black flex items-center justify-center">
              <Icon className="size-5" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></Icon>
            </div>
            <span className="font-bold text-lg tracking-tight text-white hidden md:block">Checkpoint</span>
          </Link>
        </div>

        {/* CENTER: Repository Selector */}
        <div className="flex-1 flex justify-center min-w-0 px-2 md:px-6">
          <div className="relative w-full max-w-8xl">
            <button
              onClick={() => setRepoOpen(!repoOpen)}
              className="flex items-center justify-between w-full gap-2 text-sm font-medium text-gray-200 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-md transition-colors border border-transparent hover:border-default"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex items-center gap-1 truncate">
                  <span className="text-gray-400 font-normal shrink-0">{currentRepo.owner} /</span>
                  <span className="truncate">{currentRepo.name}</span>
                </div>
                <span className="rounded-full border border-default px-2 py-0.5 text-[10px] text-gray-400 shrink-0 font-medium">
                  {currentRepo.private ? "Private" : "Public"}
                </span>
              </div>

              <Icon className="size-3 text-gray-500 ml-1 shrink-0"><path d="m6 9 6 6 6-6" /></Icon>
            </button>

            {/* Dropdown Menu */}
            {repoOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setRepoOpen(false)} />

                <div className="absolute top-full mt-2 w-full z-50 rounded-lg surface-overlay bg-[var(--bg-card)] border border-default py-1 shadow-xl animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-default mb-1">
                    Switch Repository
                  </div>
                  {MOCK_REPOS.map((repo) => (
                    <button
                      key={repo.id}
                      onClick={() => { setCurrentRepo(repo); setRepoOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-[var(--bg-hover)] flex items-center gap-2"
                    >
                      <div className={`size-2 rounded-full ${repo.id === currentRepo.id ? "bg-green-500" : "bg-transparent border border-gray-600"}`} />
                      <span className="truncate">{repo.fullName}</span>
                      <span className="ml-auto text-xs text-gray-500">
                        {repo.private ? "Private" : "Public"}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT: Profile Picture */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="https://github.com/Example-User"
            target="_blank"
            rel="noopener noreferrer"
            className="size-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 border border-default hover:ring-2 hover:ring-blue-500/50 transition-all cursor-pointer overflow-hidden"
            title="View GitHub Profile"
          >
            <img src="/avatars/user_placeholder.jpg" alt="" className="w-full h-full object-cover opacity-0" />
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 flex gap-1 overflow-x-auto border-t border-default/20">
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