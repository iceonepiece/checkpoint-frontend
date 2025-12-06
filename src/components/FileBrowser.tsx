"use client";

import Link from "next/link";
import React, { useMemo, useState } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Button, Card } from "@/components/ui";
import { MOCK_FILES, type FileItem } from "@/lib/mockFiles"; // Import new data

/* ---------- Types & Data ---------- */
type ViewMode = "grid" | "list";
type Density = "compact" | "cozy" | "comfortable";

/* ---------- Small utilities ---------- */

function Icon(props: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props} />;
}

function LockIcon({ className }: { className?: string }) {
  return <Icon className={className}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></Icon>;
}

function mimeBadge(type: string) {
  if (type === "folder") return { label: "Folder", dot: "bg-yellow-500" };
  if (type.startsWith("image/")) return { label: "Image", dot: "bg-blue-500" };
  if (type.startsWith("video/")) return { label: "Video", dot: "bg-purple-500" };
  if (type.includes("pdf")) return { label: "PDF", dot: "bg-red-500" };
  if (type.includes("model") || type.includes("fbx")) return { label: "Model", dot: "bg-orange-500" };
  return { label: "File", dot: "bg-gray-400" };
}

function fmtBytes(n: number) {
  if (!n) return "-";
  const u = ["B", "KB", "MB", "GB"]; let i = 0; let x = n;
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
  file: FileItem; selected: boolean; onToggle: () => void; size: Density;
}) {
  const badge = mimeBadge(file.type);
  const aspectClass = size === "comfortable" ? "aspect-[4/3]" : "aspect-video";
  const isLocked = !!file.lockedBy;
  
  return (
    <div className={`group relative overflow-hidden rounded-xl border transition hover:shadow-md hover:shadow-black/30 surface-card ${selected ? "ring-2 ring-blue-500 border-transparent" : "border-default"}`}>
      {/* Click Target */}
      {!file.isFolder && (
        <Link href={`/asset/${file.id}`} className="absolute inset-0" style={{ zIndex: 0 }} aria-label={`Open ${file.name}`} />
      )}

      {/* Controls */}
      <div className="absolute left-2 top-2 z-10 flex gap-2">
        <input type="checkbox" className="size-4 accent-blue-500" checked={selected} onChange={onToggle} />
      </div>
      
      {/* Lock Indicator */}
      {isLocked && (
        <div className="absolute left-2 top-8 z-10" title={`Locked by ${file.lockedBy}`}>
          <div className="bg-red-500/90 text-white p-1 rounded-md shadow-sm">
            <LockIcon className="size-3" />
          </div>
        </div>
      )}

      <button className="absolute right-2 top-2 z-10 rounded-md p-1 text-gray-400 hover:bg-black/50" title="More actions">
        <Kebab />
      </button>

      {/* Preview */}
      <div className={`${aspectClass} w-full bg-[#0d1117] relative`}>
        {file.isFolder ? (
          <div className="h-full w-full grid place-items-center text-gray-500">
            <Icon className="size-8"><path d="M3 7h5l2 2h11v10H3z" /></Icon>
          </div>
        ) : file.thumb && file.type.startsWith("image/") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={file.thumb} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="h-full w-full grid place-items-center text-gray-500">
            <Icon className="size-8"><rect x="4" y="4" width="16" height="20" rx="2" /></Icon>
          </div>
        )}
        
        {/* Lock Overlay for Preview */}
        {isLocked && (
           <div className="absolute inset-0 bg-black/40 grid place-items-center">
             <div className="text-red-400 font-semibold text-xs bg-black/60 px-2 py-1 rounded border border-red-500/30 flex items-center gap-1">
               <LockIcon className="size-3" /> Locked
             </div>
           </div>
        )}
      </div>

      {/* Meta */}
      <div className="relative z-10 flex items-center gap-2 px-3 py-2 bg-[#161b22]">
        <span className={`inline-block size-2 rounded-full ${badge.dot}`} />
        <div className="min-w-0 flex-1">
          {file.isFolder ? (
            <div className="truncate text-[15px] font-medium text-gray-200">{file.name}</div>
          ) : (
            <Link href={`/asset/${file.id}`} className="truncate text-[15px] font-medium text-gray-200 hover:underline">
              {file.name}
            </Link>
          )}
          <div className="truncate text-xs text-gray-400 flex items-center gap-1">
            {badge.label} • {fmtBytes(file.sizeBytes)}
            {isLocked && <span className="text-red-400">• {file.lockedBy}</span>}
          </div>
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
  const isLocked = !!file.lockedBy;

  return (
    <div className={`group grid grid-cols-[auto_minmax(0,1fr)_140px_120px_100px_40px] items-center gap-3 px-2 py-2 hover:bg-[#1c2128] border-b border-[#30363d]/50 last:border-0 ${selected ? "bg-[#1c2128]" : ""}`}>
      <input type="checkbox" className="size-4 accent-blue-500" checked={selected} onChange={onToggle} />
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid size-8 place-items-center rounded-md bg-[#0d1117] text-gray-400 border border-[#30363d] relative">
          {file.isFolder ? (
             <Icon className="size-4"><path d="M3 7h5l2 2h11v10H3z" /></Icon>
          ) : <span className="text-[10px] font-bold">{file.type.split('/')[0].toUpperCase().slice(0,3)}</span>}
          
          {isLocked && (
            <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 border border-[#0d1117]">
              <LockIcon className="size-2 text-white" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <Link href={file.isFolder ? "#" : `/asset/${file.id}`} className="truncate font-medium text-gray-200 hover:underline">
            {file.name}
          </Link>
          <div className="text-xs text-gray-500 sm:hidden">
             {isLocked ? <span className="text-red-400 flex items-center gap-1"><LockIcon className="size-3"/> Locked by {file.lockedBy}</span> : badge.label}
          </div>
        </div>
      </div>
      <div className="text-sm text-gray-400 hidden sm:block">
        {isLocked ? <span className="text-red-400 flex items-center gap-1"><LockIcon className="size-3"/> {file.lockedBy}</span> : badge.label}
      </div>
      <div className="text-sm text-gray-400 hidden md:block">{new Date(file.modifiedAt).toLocaleDateString()}</div>
      <div className="text-sm text-gray-400 hidden sm:block">{fmtBytes(file.sizeBytes)}</div>
      <div className="ml-auto">
        <Button variant="ghost" size="icon"><Kebab /></Button>
      </div>
    </div>
  );
}

function SelectionBar({ count, onLock, clear }: { count: number; onLock: () => void; clear: () => void }) {
  if (count === 0) return null;
  return (
    <div className="sticky top-2 z-40 mb-4 rounded-lg surface-overlay px-3 py-2 text-sm text-gray-200 flex items-center justify-between animate-in slide-in-from-top-2">
      <div className="font-medium pl-1">{count} selected</div>
      <div className="flex items-center gap-2">
        <Button size="sm">Download</Button>
        <Button size="sm">Move</Button>
        <Button size="sm" onClick={onLock}>Lock / Unlock</Button>
        <Button variant="danger" size="sm">Delete</Button>
        <div className="w-px h-4 bg-gray-700 mx-1" />
        <button onClick={clear} className="text-gray-400 hover:text-white text-xs px-2">Clear</button>
      </div>
    </div>
  );
}

export default function FileBrowser() {
  const [view, setView] = useState<ViewMode>("grid");
  const [files, setFiles] = useState<FileItem[]>(MOCK_FILES);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const toggleOne = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));
  const clearSelection = () => setSelected({});

  // Mock Lock Functionality
  const handleLock = () => {
    const selectedIds = Object.keys(selected).filter(k => selected[k]);
    setFiles(prev => prev.map(f => {
      if (selectedIds.includes(f.id)) {
        // Toggle: If locked, unlock. If unlocked, lock as "Me".
        return { ...f, lockedBy: f.lockedBy ? undefined : "Me" };
      }
      return f;
    }));
    clearSelection();
  };

  return (
    <div className="flex-1 flex flex-col p-6 min-h-0 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <Breadcrumbs items={[{ label: "Root" }, { label: "Alpha" }, { label: "Assets" }]} />
        
        <div className="flex items-center gap-2">
           <div className="flex items-center rounded-md border border-default bg-[#0d1117] p-1">
            <button onClick={() => setView("grid")} className={`p-1.5 rounded ${view === "grid" ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"}`}>
               <Icon className="size-4"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></Icon>
            </button>
            <button onClick={() => setView("list")} className={`p-1.5 rounded ${view === "list" ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"}`}>
               <Icon className="size-4"><path d="M8 6h12M4 6h1M8 12h12M4 12h1M8 18h12M4 18h1" /></Icon>
            </button>
           </div>
           <Button variant="primary">
             <Icon className="size-4 mr-2"><path d="M12 5v14M5 12h14" /></Icon>
             Upload
           </Button>
        </div>
      </div>

      <SelectionBar 
        count={Object.values(selected).filter(Boolean).length} 
        onLock={handleLock}
        clear={clearSelection} 
      />

      {/* Grid / List */}
      {view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-20">
          {files.map((f) => (
            <DriveCard key={f.id} file={f} selected={!!selected[f.id]} onToggle={() => toggleOne(f.id)} size="cozy" />
          ))}
        </div>
      ) : (
        <Card className="flex flex-col">
          <div className="grid grid-cols-[auto_minmax(0,1fr)_140px_120px_100px_40px] gap-3 px-4 py-3 border-b border-[#30363d] text-xs font-semibold text-gray-400 uppercase tracking-wider">
             <span className="w-4" />
             <span>Name</span>
             <span className="hidden sm:block">Type</span>
             <span className="hidden md:block">Modified</span>
             <span className="hidden sm:block">Size</span>
          </div>
          <div>
            {files.map((f) => (
              <DriveRow key={f.id} file={f} selected={!!selected[f.id]} onToggle={() => toggleOne(f.id)} />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}