"use client";

import Link from "next/link";
import { Icon } from "@/components/Icon";
import { FileItem } from "@/lib/mockFiles";
import { CustomCheckbox, LockIcon, mimeBadge, fmtBytes } from "./utils";

export function AssetCard({ file, selected, onToggle, size }: { file: FileItem, selected: boolean, onToggle: () => void, size: string }) {
  const badge = mimeBadge(file.type);
  const aspectClass = size === "comfortable" ? "aspect-[4/3]" : "aspect-video";
  const isLocked = !!file.lockedBy;
  const lockDate = file.lockedAt ? new Date(file.lockedAt).toLocaleString() : "";
  const lockTooltip = isLocked ? `Locked by ${file.lockedBy} on ${lockDate}` : "";
  const showThumbnail = file.thumb && file.type.startsWith("image/");

  return (
    <div 
      onClick={onToggle}
      className={`group relative overflow-hidden rounded-xl border transition hover:shadow-md hover:shadow-black/30 surface-card cursor-pointer ${selected ? "ring-2 ring-blue-500 border-transparent" : "border-default"}`}
    >
      <div className="absolute left-2 top-2 z-30 flex gap-2">
        <CustomCheckbox checked={selected} onChange={onToggle} />
      </div>
      
      {isLocked && (
        <div className="absolute left-2 top-10 z-30" title={lockTooltip}>
          <div className="bg-red-500/90 text-white p-1 rounded-md shadow-sm">
            <LockIcon className="size-4" />
          </div>
        </div>
      )}

      {/* Thumbnail */}
      <div className={`${aspectClass} w-full bg-background relative`}>
        {file.isFolder ? (
          <div className="h-full w-full grid place-items-center text-gray-500">
            <Icon className="size-8"><path d="M3 7h5l2 2h11v10H3z" /></Icon>
          </div>
        ) : showThumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
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

      {/* Metadata */}
      <div className="relative flex items-center gap-2 px-3 py-2 bg-card">
        <span className={`inline-block size-2 rounded-full ${badge.dot}`} />
        <div className="min-w-0 flex-1">
          <Link 
            href={file.isFolder ? `/?path=${file.path}` : `/asset/${encodeURIComponent(file.path || "")}`} 
            onClick={(e) => e.stopPropagation()}
            className="truncate text-[15px] font-medium text-gray-200 hover:underline block"
            title={file.name}
          >
            {file.name}
          </Link>
          
          <div className="truncate text-xs text-gray-400 flex items-center gap-1.5 h-4">
            <span>{badge.label}</span>
            <span className="text-gray-600">•</span>
            <span>{fmtBytes(file.sizeBytes)}</span>
            
            {isLocked && (
                <>
                    <span className="text-gray-600">•</span>
                    <span className="text-red-400 truncate max-w-[60px]">{file.lockedBy}</span>
                </>
            )}

            {/* NEW: Comment Count */}
            {file.commentsCount !== undefined && file.commentsCount > 0 && (
                <>
                    <span className="text-gray-600">•</span>
                    <div className="flex items-center gap-0.5 text-blue-400" title={`${file.commentsCount} comments`}>
                        <Icon className="size-3"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></Icon>
                        <span>{file.commentsCount}</span>
                    </div>
                </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}