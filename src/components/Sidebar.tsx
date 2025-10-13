import Link from "next/link";

type NavItem = { label: string; href: string };

const items: NavItem[] = [
  { label: "Overview", href: "#" },
  { label: "Repositories", href: "#" },
  { label: "Collections", href: "#" },
  { label: "Uploads", href: "#" },
  { label: "Settings", href: "#" },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:block w-64 shrink-0 border-r bg-white">
      <div className="p-3">
        <div className="text-xs font-semibold text-gray-500 px-2 mb-1">
          Navigation
        </div>
        <ul className="space-y-1">
          {items.map((it) => (
            <li key={it.label}>
              <Link
                href={it.href}
                className="block rounded-md px-2.5 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                {it.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}