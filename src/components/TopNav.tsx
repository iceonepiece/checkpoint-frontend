import Link from "next/link";

function Icon(props: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props} />;
}

export default function TopNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#30363d] bg-[#0d1117]/95 backdrop-blur">
      <div className="mx-auto max-w-screen-2xl h-14 px-3 sm:px-4 flex items-center gap-2 text-gray-200">
        {/* Left: hamburger + logo + path */}
        <button
          className="hidden sm:grid place-items-center size-8 rounded-md text-gray-300 hover:bg-white/5"
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
        >
          <Icon className="size-5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </Icon>
        </button>

        <Link href="/" className="grid place-items-center size-8 rounded-md hover:bg-white/5">
          {/* simple GH-like mark */}
          <Icon className="size-5" viewBox="0 0 16 16" stroke="none" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.22 1.87.88 2.33.67.07-.52.28-.88.51-1.08-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.01.08-2.11 0 0 .67-.21 2.2.82a7.52 7.52 0 0 1 4.01 0c1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.91.08 2.11.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.19 0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
          </Icon>
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-sm text-gray-300">
          <span className="opacity-70">Example-User</span>
          <span className="opacity-50">/</span>
          <Link href="#" className="font-medium hover:text-white">Example-Repository</Link>
          <span className="ml-2 rounded-full border border-[#30363d] px-1.5 py-0.5 text-[11px] leading-none text-gray-400">
            Public
          </span>
        </nav>

        {/* Search */}
        <div className="flex-1 flex justify-center md:justify-start">
          <div className="w-full md:max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Type / to search"
                className="w-full rounded-md bg-[#0d1117] border border-[#30363d] px-3 py-1.5 pl-9 text-sm text-gray-200 placeholder-gray-500 outline-none focus:ring-2 focus:ring-white/10"
              />
              <Icon className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-500">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </Icon>
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:block rounded border border-[#30363d] bg-[#0d1117] px-1.5 py-0.5 text-[10px] text-gray-400">
                /
              </kbd>
            </div>
          </div>
        </div>

        {/* Right controls */}
        <div className="ml-auto flex items-center gap-1">
          <button className="grid place-items-center size-8 rounded-md text-gray-300 hover:bg-white/5" title="Issues">
            <Icon className="size-5"><path d="M12 8v4M12 16h.01" /><circle cx="12" cy="12" r="9" /></Icon>
          </button>
          <button className="grid place-items-center size-8 rounded-md text-gray-300 hover:bg-white/5" title="Pull requests">
            <Icon className="size-5"><circle cx="6" cy="6" r="2" /><circle cx="18" cy="18" r="2" /><path d="M8 8v8a4 4 0 0 0 4 4h2" /></Icon>
          </button>
          <button className="grid place-items-center size-8 rounded-md text-gray-300 hover:bg-white/5" title="Notifications">
            <Icon className="size-5"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 1 0-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></Icon>
          </button>
          <button className="grid place-items-center size-8 rounded-md text-gray-300 hover:bg-white/5" title="Create new">
            <Icon className="size-5"><path d="M12 5v14M5 12h14" /></Icon>
          </button>
          <div className="ml-1 size-8 rounded-full bg-green-400/90 ring-2 ring-[#0d1117]" title="Profile" />
        </div>
      </div>
    </header>
  );
}