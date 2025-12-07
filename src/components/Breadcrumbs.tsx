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
              className="rounded px-2 py-1 text-gray-400 hover:bg-card-hover hover:text-foreground transition-colors"
            >
              {c.label}
            </Link>
          ) : (
            <span className="px-2 py-1 font-medium text-foreground">{c.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}