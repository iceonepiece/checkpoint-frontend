export default function TopNav() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-screen-2xl px-4 h-14 flex items-center gap-3">
        {/* Logo */}
        <div className="flex items-center gap-2 font-semibold">
          <div className="h-6 w-6 rounded-lg bg-black" />
          <span>ArtGit</span>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xl ml-2">
          <input
            type="text"
            placeholder="Search artworks, repos, users…"
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>

        {/* Right actions */}
        <nav className="ml-auto flex items-center gap-3">
          <button className="rounded-md border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50">
            New
          </button>
          <div className="h-8 w-8 rounded-full bg-gray-200" title="Profile" />
        </nav>
      </div>
    </header>
  );
}