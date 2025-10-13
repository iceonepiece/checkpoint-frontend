"use client";

import Link from "next/link";

type Crumb = { label: string; href?: string };

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
      {items.map((c, i) => (
        <div key={i} className="flex items-center gap-2">
          {i > 0 && <span className="text-gray-500">▸</span>}
          {c.href ? (
            <Link
              href={c.href}
              className="rounded px-1 py-0.5 text-gray-300 hover:bg-white/5 hover:text-gray-100"
            >
              {c.label}
            </Link>
          ) : (
            <span className="px-1 py-0.5 font-medium text-gray-100">{c.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}