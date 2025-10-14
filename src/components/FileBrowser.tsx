"use client";

import React, { useMemo, useState } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";

type FileItem = {
  id: string;
  name: string;
  type: string;
  size: string;
  modified: string;
  thumb?: string; // image url
  isFolder?: boolean;
};

const MOCK_FILES: FileItem[] = [
  { id: "f1", name: "Folder A", type: "folder", size: "-", modified: "Jul 2, 2024", isFolder: true },
  { id: "f2", name: "Folder B", type: "folder", size: "-", modified: "Nov 4, 2023", isFolder: true },
  { id: "1", name: "File 1.jpg", type: "image/jpeg", size: "214 KB", modified: "May 9, 2024" },
  { id: "2", name: "File 2.mp4", type: "video/mp4", size: "34.6 MB", modified: "Jun 12, 2024", thumb: "/thumbs/video_placeholder.jpg" },
  { id: "3", name: "File 3.pdf", type: "application/pdf", size: "1.2 MB", modified: "Mar 3, 2024" },
  { id: "4", name: "File 4.jpg", type: "image/jpeg", size: "1.8 MB", modified: "Jan 15, 2025", thumb: "/thumbs/img_placeholder.jpg" },
  { id: "5", name: "File 5.svg", type: "image/svg+xml", size: "95 KB", modified: "Dec 21, 2024" },
];

type ViewMode = "grid" | "list";

function Icon(props: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props} />;
}

function mimeBadge(type: string) {
  if (type === "folder") return { label: "Folder", dot: "bg-yellow-500" };
  if (type.startsWith("image/")) return { label: "Image", dot: "bg-blue-500" };
  if (type.startsWith("video/")) return { label: "Video", dot: "bg-purple-500" };
  if (type.includes("pdf")) return { label: "PDF", dot: "bg-red-500" };
  if (type.includes("word")) return { label: "Doc", dot: "bg-sky-500" };
  if (type.includes("excel") || type.includes("sheet")) return { label: "Sheet", dot: "bg-green-500" };
  return { label: "File", dot: "bg-gray-400" };
}

function Kebab() {
  return (
    <Icon className="size-4 text-gray-400">
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </Icon>
  );
}

function DriveCard({ file }: { file: FileItem }) {
  const badge = mimeBadge(file.type);
  return (
    <div className="group relative overflow-hidden rounded-xl border border-[#30363d] bg-[#161b22] transition hover:shadow-md hover:shadow-black/30">
      <div className="absolute left-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition">
        <input type="checkbox" className="size-4 accent-blue-500" />
      </div>
      <button
        className="absolute right-2 top-2 z-10 rounded-md p-1 text-gray-400 opacity-0 hover:bg-white/5 group-hover:opacity-100"
        title="More actions"
      >
        <Kebab />
      </button>

      <div className="aspect-video w-full bg-[#0d1117]">
        {file.isFolder ? (
          <div className="h-full w-full grid place-items-center text-gray-500">
            <Icon className="size-8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7h5l2 2h11v10H3z" />
            </Icon>
          </div>
        ) : file.thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={file.thumb} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full grid place-items-center text-gray-500">
            <Icon className="size-8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="4" width="16" height="20" rx="2" />
            </Icon>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 px-3 py-2">
        <span className={`inline-block size-2 rounded-full ${badge.dot}`} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-medium text-gray-200">{file.name}</div>
          <div className="truncate text-xs text-gray-400">{badge.label} • {file.size}</div>
        </div>
      </div>
    </div>
  );
}

function DriveRow({ file }: { file: FileItem }) {
  const badge = mimeBadge(file.type);
  return (
    <div className="group grid grid-cols-[auto_minmax(0,1fr)_160px_120px_40px] items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-[#1c2128]">
      <input type="checkbox" className="size-4 accent-blue-500" />
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid size-8 place-items-center rounded-md bg-[#0d1117] text-gray-400">
          {file.isFolder ? (
            <Icon className="size-5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7h5l2 2h11v10H3z" />
            </Icon>
          ) : (
            <span className="text-xs">{badge.label}</span>
          )}
        </div>
        <div className="min-w-0">
          <div className="truncate font-medium text-gray-200">{file.name}</div>
          <div className="text-xs text-gray-500">{badge.label}</div>
        </div>
      </div>
      <div className="text-sm text-gray-400">{badge.label}</div>
      <div className="text-sm text-gray-400">{file.modified}</div>
      <div className="ml-auto">
        <button className="rounded-md p-1.5 text-gray-400 hover:bg-white/5">
          <Kebab />
        </button>
      </div>
    </div>
  );
}

export default function FileBrowser() {
  const [view, setView] = useState<ViewMode>("grid");

  // mock current path for breadcrumbs
  const path = [
    { label: "Breadcrumps I", href: "#" },
    { label: "Breadcrumps II", href: "#" },
    { label: "Breadcrumps III" }, // current folder (no href)
  ];

  const files = useMemo(() => MOCK_FILES, []);

  return (
    <section className="space-y-4">
      {/* Breadcrumbs */}
      <div className="flex items-center justify-between">
        <Breadcrumbs items={path} />
        {/* quick actions on the right of crumbs if needed */}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {["Type", "People", "Modified", "Source"].map((label) => (
            <button
              key={label}
              className="inline-flex items-center gap-2 rounded-md border border-[#30363d] bg-[#161b22] px-3 py-1.5 text-sm text-gray-300 hover:bg-[#1c2128]"
            >
              {label}
              <Icon className="size-4 text-gray-400">
                <path d="M6 9l6 6 6-6" />
              </Icon>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setView("list")}
            className={`grid size-9 place-items-center rounded-md border border-[#30363d] ${view === "list" ? "bg-[#161b22]" : "bg-[#0d1117]"} hover:bg-[#1c2128]`}
            title="List view"
          >
            <Icon className="size-5 text-gray-300">
              <path d="M8 6h12M4 6h1M8 12h12M4 12h1M8 18h12M4 18h1" />
            </Icon>
          </button>
          <button
            onClick={() => setView("grid")}
            className={`grid size-9 place-items-center rounded-md border border-[#30363d] ${view === "grid" ? "bg-[#161b22]" : "bg-[#0d1117]"} hover:bg-[#1c2128]`}
            title="Grid view"
          >
            <Icon className="size-5 text-gray-300">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </Icon>
          </button>
        </div>
      </div>

      {/* Content */}
      {view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {files.map((f) => (
            <DriveCard key={f.id} file={f} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-[#30363d] bg-[#161b22]">
          <div className="grid grid-cols-[auto_minmax(0,1fr)_160px_120px_40px] items-center gap-3 border-b border-[#30363d] px-2 py-2 text-xs font-semibold text-gray-400">
            <span />
            <button>Name</button>
            <button>Type</button>
            <button>Modified</button>
            <span />
          </div>
          <div className="divide-y divide-[#30363d]">
            {files.map((f) => (
              <DriveRow key={f.id} file={f} />
            ))}
          </div>
        </div>
      )}

      {/* Floating "New" button (bottom-right) */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="group relative">
          <button
            className="flex items-center gap-2 rounded-full bg-[#238636] px-4 py-3 text-sm font-medium text-white shadow-lg shadow-black/40 hover:bg-[#2ea043] focus:outline-none"
            title="Create new…"
          >
            <Icon className="size-5 text-white" stroke="currentColor">
              <path d="M12 5v14M5 12h14" />
            </Icon>
            New
          </button>

          {/* simple dropdown (placeholder actions) */}
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