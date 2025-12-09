"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Icon } from "@/components/Icon";
import type { AuthUser } from "@/lib/auth";
import { useRepo, type Repo } from "@/lib/RepoContext";

export default function TopNav({ user }: { user: AuthUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const [repoOpen, setRepoOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const repoRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const { repos, setRepos, currentRepo, setCurrentRepo, loading, setLoading } = useRepo();

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (repoRef.current && !repoRef.current.contains(event.target as Node)) {
        setRepoOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (repos.length > 0) return; 

    async function fetchRepos() {
      try {
        const res = await fetch("/api/repos");
        if (res.ok) {
          const data = await res.json();
          const mappedRepos: Repo[] = data.map((r: any) => ({
            id: r.id,
            owner: r.owner.login,
            name: r.name,
            fullName: r.full_name,
            private: r.private,
          }));
          
          setRepos(mappedRepos);
          
          if (mappedRepos.length > 0 && !currentRepo) {
            setCurrentRepo(mappedRepos[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch repos", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRepos();
  }, [repos.length, currentRepo, setRepos, setCurrentRepo, setLoading]);

  const repoBaseUrl = currentRepo ? `https://github.com/${currentRepo.fullName}` : "#";

  // Check if current user owns the repo
  const isOwner = currentRepo ? currentRepo.owner === user.username : false;

  const tabs = [
    { label: "View on GitHub", href: `${repoBaseUrl}`, external: true },
    // { label: "Overview", href: "/overview" },
    { label: "Repository", href: "/" },
    // { label: "View on GitHub", href: `${repoBaseUrl}`, external: true },
    { label: "Issues", href: `${repoBaseUrl}/issues`, external: true },
    { label: "Pull requests", href: `${repoBaseUrl}/pulls`, external: true },
    { label: "Settings", href: `${repoBaseUrl}/settings`, external: true, disabled: !isOwner },
  ];

  const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(href));

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh(); 
    } catch (error) {
      console.error("Logout failed", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-default bg-[var(--bg-header)] backdrop-blur">
      <div className="h-14 px-4 flex items-center gap-4">

        {/* LEFT: Site Logo */}
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
          <div className="relative w-full" ref={repoRef}>
            <button
              onClick={() => setRepoOpen(!repoOpen)}
              className="flex items-center justify-between w-full gap-2 text-sm font-medium text-gray-200 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-md transition-colors border border-transparent hover:border-default"
            >
              {loading ? (
                 <span className="text-gray-500 text-xs">Loading...</span>
              ) : currentRepo ? (
                <div className="flex items-center gap-2 min-w-0">
                    <div className="flex items-center gap-1 truncate">
                    <div className="size-2 rounded-full bg-green-500"/>
                    <span></span>
                    <span className="text-gray-400 font-normal shrink-0">{currentRepo.owner} /</span>
                    <span className="truncate">{currentRepo.name}</span>
                    </div>
                    <span className="rounded-full border border-default pt-1 px-2 py-0.5 text-[10px] text-gray-400 shrink-0 font-medium">
                    {currentRepo.private ? "Private" : "Public"}
                    </span>
                </div>
              ) : (
                <span className="text-gray-500 text-xs">No repositories found</span>
              )}
              
              <Icon className={`size-3 text-gray-500 ml-1 shrink-0 transition-transform duration-200 ${repoOpen ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6" /></Icon>
            </button>
            
            <div 
                className={`
                    absolute top-full mt-2 w-full z-50 rounded-lg surface-overlay bg-[var(--bg-card)] border border-default py-1 shadow-xl
                    transition-all duration-200 ease-out origin-top
                    ${repoOpen 
                        ? "opacity-100 scale-100 translate-y-0" 
                        : "opacity-0 scale-95 -translate-y-2 pointer-events-none"}
                `}
            >
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-default mb-1">
                Switch Repository
                </div>
                <div className="max-h-60 overflow-y-auto">
                {repos.map((repo) => (
                    <button
                    key={repo.id}
                    onClick={() => { 
                        setCurrentRepo(repo); 
                        setRepoOpen(false);
                        router.push("/"); 
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-[var(--bg-hover)] flex items-center gap-2"
                    >
                    <div className={`size-2 rounded-full ${currentRepo && repo.id === currentRepo.id ? "bg-green-500" : "bg-transparent border border-gray-600"}`} />
                    <span className="truncate">{repo.fullName}</span>
                    <span className="ml-auto text-xs text-gray-500">
                        {repo.private ? "Private" : "Public"}
                    </span>
                    </button>
                ))}
                </div>
            </div>
          </div>
        </div>

        {/* RIGHT: User Profile */}
        <div className="flex items-center gap-3 shrink-0 relative" ref={profileRef}>
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className={`size-8 rounded-full bg-gray-800 border transition-all cursor-pointer overflow-hidden relative ${profileOpen ? "ring-2 ring-blue-500/50 border-transparent" : "border-default hover:ring-2 hover:ring-blue-500/50"}`}
            title={user.username}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
          </button>

          <div 
            className={`
                absolute top-full right-0 mt-2 w-56 z-50 rounded-lg surface-overlay bg-[var(--bg-card)] border border-default py-1 shadow-xl
                transition-all duration-200 ease-out origin-top-right
                ${profileOpen 
                    ? "opacity-100 scale-100 translate-y-0" 
                    : "opacity-0 scale-95 -translate-y-2 pointer-events-none"}
            `}
          >
                <div className="px-4 py-2 border-b border-default mb-1">
                    <p className="text-xs text-gray-400">Signed in as</p>
                    <p className="text-sm font-bold text-gray-200 truncate">{user.username}</p>
                </div>

                <a
                    href={`https://github.com/${user.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-[var(--bg-hover)] flex items-center gap-2"
                    onClick={() => setProfileOpen(false)}
                >
                    <Icon className="size-4 text-gray-400"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></Icon>
                    View Profile on GitHub
                </a>

                <div className="border-t border-default my-1" />

                <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[var(--bg-hover)] flex items-center gap-2"
                >
                    <Icon className="size-4"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></Icon>
                    {isLoggingOut ? "Signing out..." : "Sign out"}
                </button>
            </div>
        </div>
      </div>

      <div className="px-4 flex gap-1 overflow-x-auto border-t border-default/20">
        {tabs.map((tab) => {
           if (!tab.external) {
             return (
               <Link key={tab.href} href={tab.href} className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${isActive(tab.href) ? "border-[#f78166] text-white" : "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-700"}`}>
                 {tab.label}
               </Link>
             );
           }
           
           // Logic to handle disabled state (e.g. Settings if not owner)
           const isDisabled = !currentRepo || (tab.disabled === true);

           return (
             <a 
                key={tab.label} 
                href={isDisabled ? undefined : tab.href} // Remove href if disabled
                target={isDisabled ? undefined : "_blank"}
                rel="noopener noreferrer"
                className={`
                    px-3 py-2 text-sm font-medium border-b-2 border-transparent flex items-center gap-1 transition-colors
                    ${isDisabled 
                        ? "opacity-40 cursor-not-allowed text-gray-600" 
                        : "hover:text-gray-200 hover:border-gray-700 text-gray-400"
                    }
                `}
                aria-disabled={isDisabled}
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