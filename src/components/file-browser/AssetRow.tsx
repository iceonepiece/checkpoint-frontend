"use client";

import Link from "next/link";
import { Icon } from "@/components/Icon";
import { FileItem } from "@/lib/mockFiles";
import { CustomCheckbox, LockIcon, mimeBadge, fmtBytes } from "./utils";

export function AssetRow({ file, selected, onToggle }: { file: FileItem, selected: boolean, onToggle: () => void }) {
  const badge = mimeBadge(file.type);
  const isLocked = !!file.lockedBy;
  const lockDate = file.lockedAt ? new Date(file.lockedAt).toLocaleString() : "";
  const lockTooltip = isLocked ? `Locked by ${file.lockedBy} on ${lockDate}` : "";

  return (
    <div 
        onClick={onToggle}
        className={`group grid grid-cols-[auto_minmax(0,1fr)_140px_120px_100px_40px] items-center gap-3 px-2 py-2 hover:bg-card-hover border-b border-default/50 last:border-0 cursor-pointer ${selected ? "bg-card-hover" : ""}`}
    >
      <div className="z-30 flex items-center pb-1">
          <CustomCheckbox checked={selected} onChange={onToggle} />
      </div>
      
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid size-8 place-items-center rounded-md bg-background text-gray-400 border border-default relative">
          {file.isFolder ? (
             <Icon className="size-4" fill="currentColor"><path d="M3 7h5l2 2h11v10H3z" /></Icon>
          ) : (
             <span className="text-[10px] font-bold">{file.name.split('.').pop()?.substring(0,3).toUpperCase()}</span>
          )}
          
          {isLocked && (
            <div className="absolute -top-1 -right-2 bg-red-500 rounded-md p-0.5 border border-background z-10" title={lockTooltip}>
              <LockIcon className="size-4 text-white" />
            </div>
          )}
        </div>
        
        <div className="min-w-0 flex flex-col">
          <Link 
            href={file.isFolder ? `/?path=${file.path}` : `/asset/${encodeURIComponent(file.path || "")}`} 
            onClick={(e) => e.stopPropagation()}
            className="truncate font-medium text-gray-200 hover:underline"
          >
            {file.name}
          </Link>
          
          {/* NEW: Mobile Comment Count (visible on small screens only if you adjust classes, here sticking to basic layout) */}
        </div>

        {/* NEW: Comment Indicator next to name */}
        {file.commentsCount !== undefined && file.commentsCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded border border-blue-400/20" title={`${file.commentsCount} comments`}>
                <Icon className="size-3"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></Icon>
                <span className="font-medium">{file.commentsCount}</span>
            </div>
        )}
      </div>

      <div className="text-sm text-gray-400 hidden sm:block">
        {isLocked ? (
            <span className="text-red-400 flex items-center gap-1.5" title={lockTooltip}>
                <LockIcon className="size-3" /> 
                <span className="truncate max-w-[100px]">{file.lockedBy}</span>
            </span>
        ) : (
            badge.label
        )}
      </div>

      <div className="text-sm text-gray-400 hidden md:block">
        {new Date(file.modifiedAt).toLocaleDateString()}
      </div>

      <div className="text-sm text-gray-400 hidden sm:block">
        {fmtBytes(file.sizeBytes)}
      </div>
    </div>
  );
}