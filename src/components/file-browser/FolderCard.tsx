"use client";

import Link from "next/link";
import { Icon } from "@/components/Icon";
import { CustomCheckbox, Kebab, LockIcon } from "./utils";

export function FolderCard({ file, selected, onToggle }: any) {
  const isLocked = !!file.lockedBy;
  const lockDate = file.lockedAt ? new Date(file.lockedAt).toLocaleString() : "";
  const lockTooltip = isLocked ? `Locked by ${file.lockedBy} on ${lockDate}` : "";

  return (
    <div 
      onClick={onToggle}
      className={`group relative flex items-center gap-3 p-3 rounded-xl border transition hover:shadow-md hover:shadow-black/30 surface-card cursor-pointer ${selected ? "ring-2 ring-blue-500 border-transparent" : "border-default"}`}
    >
      {/* Selection Checkbox */}
      <div className="z-30 flex items-center pb-1">
          <CustomCheckbox checked={selected} onChange={onToggle} />
      </div>
      
      {/* Folder Icon */}
      <div className="size-10 rounded-lg flex items-center justify-center text-gray-400 shrink-0">
           <Icon className="size-10 pb-1.5" fill="currentColor"><path d="M3 7h5l2 2h11v10H3z" /></Icon>
      </div>

      {/* Name & Meta */}
      <div className="min-w-0">
          <Link 
              href={`/?path=${file.path}`} 
              onClick={(e) => e.stopPropagation()}
              className="truncate text-sm font-medium text-gray-200 hover:underline decoration-gray-500 underline-offset-2 block"
              title={file.name}
          >
              {file.name}
          </Link>
          
          {isLocked && (
              <div className="text-[10px] text-red-400 flex items-center gap-1 mt-0.5" title={lockTooltip}>
                  <LockIcon className="size-2.5" /> {file.lockedBy}
              </div>
          )}
      </div>

      {/* Kebab Menu */}
      {/* <button 
        onClick={(e) => e.stopPropagation()}
        className="z-30 p-1 text-gray-400 hover:bg-black/50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
      >
          <Kebab />
      </button> */}

      {/* Lock Overlay Icon */}
      {isLocked && (
          <div className="absolute top-2 right-2 text-red-500 pointer-events-none opacity-50">
              <LockIcon className="size-3" />
          </div>
      )}
    </div>
  );
}