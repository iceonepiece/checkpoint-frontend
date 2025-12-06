"use client";

import Link from "next/link";
import React, { useMemo, useState } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";

/* ---------- Types & Mock Data ---------- */

type FileItem = {
  id: string;
  name: string;
  type: string;      // mime or "folder"
  sizeBytes: number; // for sorting by size
  modifiedAt: string;// ISO or readable
  thumb?: string;    // /samples/xyz.jpg for images
  isFolder?: boolean;
};


const MOCK_FILES: FileItem[] = [
  { id: "f1", name: "Pre-Alpha", type: "folder", sizeBytes: 0, modifiedAt: "2024-07-02", isFolder: true },
  { id: "f2", name: "UIs", type: "folder", sizeBytes: 0, modifiedAt: "2023-11-04", isFolder: true },

  // real image previews (put these files in /public/samples/)
  { id: "i1", name: "mech_concept.jpg", type: "image/jpeg", sizeBytes: 1780000, modifiedAt: "2025-01-15", thumb: "/samples/a.jpg" },
  { id: "i2", name: "forest_scene.png", type: "image/png", sizeBytes: 2100000, modifiedAt: "2025-01-03", thumb: "/samples/b.jpg" },

  // non-images
  { id: "v1", name: "turntable.mp4", type: "video/mp4", sizeBytes: 34600000, modifiedAt: "2024-06-12" },
  { id: "p1", name: "ExampleFinal.pdf", type: "application/pdf", sizeBytes: 1200000, modifiedAt: "2024-03-03" },
  { id: "d1", name: "brief.docx", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", sizeBytes: 214000, modifiedAt: "2024-05-09" },
  { id: "s1", name: "ui_icons.svg", type: "image/svg+xml", sizeBytes: 95000, modifiedAt: "2024-12-21" },
  { id: "v2", name: "turntable.mp4", type: "video/mp4", sizeBytes: 34600000, modifiedAt: "2024-06-12" },
  { id: "p2", name: "ExampleFinal.pdf", type: "application/pdf", sizeBytes: 1200000, modifiedAt: "2024-03-03" },
];

type ViewMode = "grid" | "list";
type SortKey = "name" | "type" | "modified" | "size";
type SortDir = "asc" | "desc";

/* ---------- Small utilities ---------- */

function Icon(props: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props} />;
}

function mimeBadge(type: string) {
  if (type === "folder") return { label: "Folder", dot: "bg-yellow-500" };
  if (type.startsWith("image/")) return { label: "Image", dot: "bg-blue-500" };
  if (type.startsWith("video/")) return { label: "Video", dot: "bg-purple-500" };
  if (type.includes("pdf")) return { label: "PDF", dot: "bg-red-500" };
  if (type.includes("word")) return { label: "Doc", dot: "bg-sky-500" };
  if (type.includes("sheet") || type.includes("excel")) return { label: "Sheet", dot: "bg-green-500" };
  return { label: "File", dot: "bg-gray-400" };
}

function fmtBytes(n: number) {
  if (!n) return "-";
  const u = ["B","KB","MB","GB"]; let i = 0; let x = n;
  while (x >= 1024 && i < u.length - 1) { x /= 1024; i++; }
  return `${x.toFixed(x < 10 && i > 0 ? 1 : 0)} ${u[i]}`;
}

/* ---------- Row/Card components ---------- */

function Kebab() {
  return (
    <Icon className="size-4 text-gray-400">
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </Icon>
  );
}

function DriveCard({
  file, selected, onToggle, size
}: {
  file: FileItem; selected: boolean; onToggle: () => void; size: "compact"|"cozy"|"comfortable";
}) {
  const badge = mimeBadge(file.type);
  const aspectClass = size === "comfortable" ? "aspect-[4/3]" : "aspect-video";
  return (
    <div className={`group relative overflow-hidden rounded-xl border border-[#30363d] bg-[#161b22] transition hover:shadow-md hover:shadow-black/30 ${selected ? "ring-2 ring-blue-500" : ""}`}>
      {/* FULL-CARD CLICK TARGET */}
      {!file.isFolder && (
        <Link
          href={`/asset/${file.id}`}
          className="absolute inset-0"
          aria-label={`Open ${file.name}`}
          // let checkboxes/menus take priority
          style={{ zIndex: 0 }}
        />
      )}

      {/* Controls (higher z-index) */}
      <div className="absolute left-2 top-2 z-10">
        <input type="checkbox" className="size-4 accent-blue-500" checked={selected} onChange={onToggle} />
      </div>
      <button className="absolute right-2 top-2 z-10 rounded-md p-1 text-gray-400 hover:bg-white/5" title="More actions">
        <Kebab />
      </button>

      {/* Preview */}
      <div className={`${aspectClass} w-full bg-[#0d1117]`}>
        {file.isFolder ? (
          <div className="h-full w-full grid place-items-center text-gray-500">
            <Icon className="size-8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h5l2 2h11v10H3z" /></Icon>
          </div>
        ) : file.thumb && file.type.startsWith("image/") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={file.thumb} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="h-full w-full grid place-items-center text-gray-500">
            <Icon className="size-8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="20" rx="2" /></Icon>
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="relative z-10 flex items-center gap-2 px-3 py-2">
        <span className={`inline-block size-2 rounded-full ${badge.dot}`} />
        <div className="min-w-0 flex-1">
          {file.isFolder ? (
            <div className="truncate text-[15px] font-medium text-gray-200">{file.name}</div>
          ) : (
            <Link href={`/asset/${file.id}`} className="truncate text-[15px] font-medium text-gray-200 hover:underline">
              {file.name}
            </Link>
          )}
          <div className="truncate text-xs text-gray-400">{badge.label} • {fmtBytes(file.sizeBytes)}</div>
        </div>
      </div>
    </div>
  );
}

function DriveRow({
  file, selected, onToggle
}: {
  file: FileItem; selected: boolean; onToggle: () => void;
}) {
  const badge = mimeBadge(file.type);
  return (
    <div className={`group grid grid-cols-[auto_minmax(0,1fr)_140px_120px_100px_40px] items-center gap-3 px-2 py-2 hover:bg-[#1c2128] ${selected ? "bg-[#1c2128]" : ""}`}>
      <input type="checkbox" className="size-4 accent-blue-500" checked={selected} onChange={onToggle} />
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid size-8 place-items-center rounded-md bg-[#0d1117] text-gray-400">
          {file.isFolder ? (
            <Icon className="size-5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h5l2 2h11v10H3z" /></Icon>
          ) : file.type.startsWith("image/") ? <span className="text-[10px]">IMG</span>
            : file.type.startsWith("video/") ? <span className="text-[10px]">VID</span>
            : <span className="text-[10px]">FILE</span>}
        </div>
        <div className="min-w-0">
          {file.isFolder ? (
            <div className="truncate font-medium text-gray-200">{file.name}</div>
          ) : (
            <Link href={`/asset/${file.id}`} className="truncate font-medium text-gray-200 hover:underline">
              {file.name}
            </Link>
          )}
          <div className="text-xs text-gray-500">{badge.label}</div>
        </div>
      </div>
      <div className="text-sm text-gray-400">{badge.label}</div>
      <div className="text-sm text-gray-400">{new Date(file.modifiedAt).toLocaleDateString()}</div>
      <div className="text-sm text-gray-400">{fmtBytes(file.sizeBytes)}</div>
      <div className="ml-auto">
        <button className="rounded-md p-1.5 text-gray-400 hover:bg-white/5"><Kebab /></button>
      </div>
    </div>
  );
}

/* ---------- Selection Bar ---------- */

function SelectionBar({
  count, clear
}: {
  count: number; clear: () => void;
}) {
  if (count === 0) return null;
  return (
    <div className="sticky top-[3.5rem] z-40 mb-2 rounded-lg border border-[#30363d] bg-[#161b22] px-3 py-2 text-sm text-gray-200">
      <div className="flex items-center justify-between">
        <div>{count} selected</div>
        <div className="flex items-center gap-2">
          <button className="rounded-md border border-[#30363d] bg-[#0d1117] px-2 py-1 hover:bg-[#1c2128]">Download</button>
          <button className="rounded-md border border-[#30363d] bg-[#0d1117] px-2 py-1 hover:bg-[#1c2128]">Move</button>
          <button className="rounded-md border border-[#30363d] bg-[#0d1117] px-2 py-1 hover:bg-[#1c2128]">Lock</button>
          <button className="rounded-md border border-[#30363d] bg-[#0d1117] px-2 py-1 hover:bg-[#1c2128]">Delete</button>
          <button onClick={clear} className="ml-2 rounded-md px-2 py-1 text-gray-400 hover:bg-white/5">Clear</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Main Browser ---------- */

export default function FileBrowser() {
  const [view, setView] = useState<ViewMode>("grid");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [density, setDensity] = useState<"compact"|"cozy"|"comfortable">("cozy");
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const path = [
    { label: "Root", href: "#" },
    { label: "Alpha", href: "#" },
    { label: "Assets" },
  ];

  // sort files
  const files = useMemo(() => {
    const arr = [...MOCK_FILES];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "type") cmp = a.type.localeCompare(b.type);
      else if (sortKey === "modified") cmp = new Date(a.modifiedAt).getTime() - new Date(b.modifiedAt).getTime();
      else cmp = a.sizeBytes - b.sizeBytes;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [sortKey, sortDir]);

  const selCount = Object.values(selected).filter(Boolean).length;

  const toggleOne = (id: string) =>
    setSelected((s) => ({ ...s, [id]: !s[id] }));

  const clearSelection = () => setSelected({});

  // grid columns adapt to density
  const gridCols =
    density === "compact" ? "sm:grid-cols-3 lg:grid-cols-5"
    : density === "comfortable" ? "sm:grid-cols-2 lg:grid-cols-3"
    : "sm:grid-cols-2 lg:grid-cols-4";

  return (
    <section className="space-y-4 px-6">
      {/* Breadcrumbs */}
      <div className="flex items-center justify-between">
        <Breadcrumbs items={path} />
      </div>

      {/* Selection summary bar */}
      <SelectionBar count={selCount} clear={clearSelection} />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Sort */}
          <div className="flex items-center gap-1 rounded-md border border-[#30363d] bg-[#161b22] px-2 py-1.5 text-sm text-gray-300">
            <span className="text-gray-400">Sort:</span>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="bg-transparent outline-none"
            >
              <option value="name">Name</option>
              <option value="type">Type</option>
              <option value="modified">Modified</option>
              <option value="size">Size</option>
            </select>
            <button
              onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
              className="ml-1 rounded p-1 hover:bg-white/5"
              title="Toggle direction"
            >
              <Icon className="size-4 text-gray-300">
                {sortDir === "asc" ? <path d="M6 15l6-6 6 6" /> : <path d="M6 9l6 6 6-6" />}
              </Icon>
            </button>
          </div>

          {/* Density */}
          <div className="flex items-center gap-2 rounded-md border border-[#30363d] bg-[#161b22] px-2 py-1.5 text-sm text-gray-300">
            <span className="text-gray-400">Density:</span>
            <select
              value={density}
              onChange={(e) => setDensity(e.target.value as any)}
              className="bg-transparent outline-none"
            >
              <option value="compact">Compact</option>
              <option value="cozy">Cozy</option>
              <option value="comfortable">Comfortable</option>
            </select>
          </div>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setView("list")}
            className={`grid size-9 place-items-center rounded-md border border-[#30363d] ${view === "list" ? "bg-[#161b22]" : "bg-[#0d1117]"} hover:bg-[#1c2128]`}
            title="List view"
          >
            <Icon className="size-5 text-gray-300"><path d="M8 6h12M4 6h1M8 12h12M4 12h1M8 18h12M4 18h1" /></Icon>
          </button>
          <button
            onClick={() => setView("grid")}
            className={`grid size-9 place-items-center rounded-md border border-[#30363d] ${view === "grid" ? "bg-[#161b22]" : "bg-[#0d1117]"} hover:bg-[#1c2128]`}
            title="Grid view"
          >
            <Icon className="size-5 text-gray-300">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
            </Icon>
          </button>
        </div>
      </div>

      {/* Content */}
      {view === "grid" ? (
        <div className={`grid grid-cols-1 ${gridCols} gap-4`}>
          {files.map((f) => (
            <DriveCard
              key={f.id}
              file={f}
              selected={!!selected[f.id]}
              onToggle={() => toggleOne(f.id)}
              size={density}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-[#30363d] bg-[#161b22]">
          <div className="grid grid-cols-[auto_minmax(0,1fr)_140px_120px_100px_40px] items-center gap-3 border-b border-[#30363d] px-2 py-2 text-xs font-semibold text-gray-400">
            <span />
            <button>Name</button>
            <button>Type</button>
            <button>Modified</button>
            <button>Size</button>
            <span />
          </div>
          <div className="divide-y divide-[#30363d]">
            {files.map((f) => (
              <DriveRow
                key={f.id}
                file={f}
                selected={!!selected[f.id]}
                onToggle={() => toggleOne(f.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Floating New Button (kept) */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="group relative">
          <button className="flex items-center gap-2 rounded-full bg-[#238636] px-4 py-3 text-sm font-medium text-white shadow-lg shadow-black/40 hover:bg-[#2ea043]">
            <Icon className="size-5 text-white"><path d="M12 5v14M5 12h14" /></Icon>
            New
          </button>
          <div className="invisible absolute bottom-12 right-0 w-44 translate-y-2 rounded-lg border border-[#30363d] bg-[#161b22] p-1 text-sm text-gray-200 opacity-0 shadow-lg shadow-black/30 transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
            <button className="w-full rounded-md px-3 py-2 text-left hover:bg-[#1c2128]">New folder</button>
            <button className="w-full rounded-md px-3 py-2 text-left hover:bg-[#1c2128]">Upload files</button>
            <button className="w-full rounded-md px-3 py-2 text-left hover:bg-[#1c2128]">Upload folder</button>
          </div>
        </div>
      </div>
    </section>
  );
}