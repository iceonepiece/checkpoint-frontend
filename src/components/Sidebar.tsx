"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MOCK_REPOS, Repo } from "@/lib/mockRepos";

function Icon(props: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props} />;
}

function Avatar({ url, alt }: { url?: string; alt: string }) {
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={alt} className="h-6 w-6 rounded-full object-cover" />
  ) : (
    <div className="h-6 w-6 rounded-full bg-gray-600/40 grid place-items-center text-[11px] text-gray-300">
      {alt.slice(0,1).toUpperCase()}
    </div>
  );
}

export default function RepoSidebar({
  repos = MOCK_REPOS,
}: {
  repos?: Repo[];
}) {
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(7);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return repos;
    return repos.filter(
      r =>
        r.fullName.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.owner.toLowerCase().includes(q)
    );
  }, [repos, query]);

  const visible = filtered.slice(0, limit);

  return (
    <aside className="hidden md:flex w-80 shrink-0 flex-col border-r border-[#30363d] bg-[#0d1117]">
      <div className="px-3 pt-3 pb-2">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-200">Top repositories</h2>
          <Link
            href="#"
            className="inline-flex items-center gap-1 rounded-md bg-[#238636] px-2 py-1 text-xs font-medium text-white hover:bg-[#2ea043]"
            title="Create new repository"
          >
            <Icon className="h-4 w-4" stroke="currentColor"><path d="M12 5v14M5 12h14" /></Icon>
            New
          </Link>
        </div>

        <div className="relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a repository..."
            className="w-full rounded-md border border-[#30363d] bg-[#161b22] px-3 py-2 text-sm text-gray-200 placeholder-gray-500 outline-none focus:ring-2 focus:ring-white/10"
          />
          <Icon className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500">
            <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
          </Icon>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2">
        <ul className="space-y-1">
          {visible.map((r) => (
            <li key={r.id}>
              <Link
                href={`/${r.owner}/${r.name}`} // placeholder route
                className="flex items-center gap-3 rounded-md px-2.5 py-2 hover:bg-white/5"
                title={r.fullName}
              >
                <Avatar url={r.avatarUrl} alt={r.owner} />
                <div className="min-w-0">
                  <div className="truncate text-sm text-gray-200">
                    <span className="text-gray-300">{r.owner}</span>
                    <span className="text-gray-500">/</span>
                    <span className="font-medium">{r.name}</span>
                  </div>
                  {r.private && (
                    <span className="mt-0.5 inline-block rounded border border-[#30363d] px-1 text-[10px] text-gray-400">Private</span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>

        {filtered.length > limit && (
          <button
            onClick={() => setLimit((n) => n + 7)}
            className="mx-2 mt-2 w-auto rounded-md px-2.5 py-1.5 text-left text-sm text-gray-400 hover:bg-white/5"
          >
            Show more
          </button>
        )}
        {filtered.length === 0 && (
          <div className="mx-2 mt-3 rounded-md border border-[#30363d] bg-[#161b22] px-3 py-3 text-sm text-gray-400">
            No repositories match “{query}”.
          </div>
        )}
      </div>
    </aside>
  );
}