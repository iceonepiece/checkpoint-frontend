"use client";

import Link from "next/link";
import { Icon } from "@/components/Icon";
import { FileItem } from "@/lib/mockFiles";
import { CustomCheckbox, LockIcon, Kebab, mimeBadge, fmtBytes } from "./utils";

export function AssetCard({ file, selected, onToggle, size }: { file: FileItem, selected: boolean, onToggle: () => void, size: string }) {
  const badge = mimeBadge(file.type);
  const aspectClass = size === "comfortable" ? "aspect-[4/3]" : "aspect-video";
  const isLocked = !!file.lockedBy;
  const lockDate = file.lockedAt ? new Date(file.lockedAt).toLocaleString() : "";
  const lockTooltip = isLocked ? `Locked by ${file.lockedBy} on ${lockDate}` : "";

  // Helper to check if it's safe to display as an image
  // Now we strictly require it to be an image type AND have a thumb URL
  const showThumbnail = file.thumb && file.type.startsWith("image/");

  return (
    <div 
      onClick={onToggle}
      className={`group relative overflow-hidden rounded-xl border transition hover:shadow-md hover:shadow-black/30 surface-card cursor-pointer ${selected ? "ring-2 ring-blue-500 border-transparent" : "border-default"}`}
    >
      
      {/* Checkbox */}
      <div className="absolute left-2 top-2 z-30 flex gap-2">
        <CustomCheckbox checked={selected} onChange={onToggle} />
      </div>
      
      {/* Lock Indicator */}
      {isLocked && (
        <div className="absolute left-2 top-8 z-30" title={lockTooltip}>
          <div className="bg-red-500/90 text-white p-1 rounded-md shadow-sm">
            <LockIcon className="size-3" />
          </div>
        </div>
      )}

      {/* Kebab Menu */}
      {/* <button 
        onClick={(e) => e.stopPropagation()} 
        className="absolute right-2 top-2 z-30 rounded-md p-1 text-gray-400 hover:bg-black/50"
      >
        <Kebab />
      </button> */}

      {/* Thumbnail Preview */}
      <div className={`${aspectClass} w-full bg-background relative`}>
        {file.isFolder ? (
          <div className="h-full w-full grid place-items-center text-gray-500">
            <Icon className="size-8"><path d="M3 7h5l2 2h11v10H3z" /></Icon>
          </div>
        ) : showThumbnail ? (
          // FIXED: Only render img if it is actually an image type
          <img src={file.thumb} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="h-full w-full grid place-items-center text-gray-500">
            <Icon className="size-8"><rect x="4" y="4" width="16" height="20" rx="2" /></Icon>
          </div>
        )}
        
        {isLocked && (
           <div className="absolute inset-0 bg-black/40 grid place-items-center" title={lockTooltip}>
             <div className="text-red-400 font-semibold text-xs bg-black/60 px-2 py-1 rounded border border-red-500/30 flex items-center gap-1">
               <LockIcon className="size-3" /> Locked
             </div>
           </div>
        )}
      </div>

      {/* Metadata & Link */}
      <div className="relative flex items-center gap-2 px-3 py-2 bg-card">
        <span className={`inline-block size-2 rounded-full ${badge.dot}`} />
        <div className="min-w-0 flex-1">
          <Link 
            href={file.isFolder ? `/?path=${file.path}` : `/asset/${file.id}`} 
            onClick={(e) => e.stopPropagation()}
            className="truncate text-[15px] font-medium text-gray-200 hover:underline block"
            title={file.name}
          >
            {file.name}
          </Link>
          
          <div className="truncate text-xs text-gray-400 flex items-center gap-1">
            {badge.label} • {fmtBytes(file.sizeBytes)}
            {isLocked && <span className="text-red-400">• {file.lockedBy}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}