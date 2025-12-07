"use client";

import Link from "next/link";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui";
import { FileItem } from "@/lib/mockFiles";
import { CustomCheckbox, LockIcon, Kebab, mimeBadge, fmtBytes } from "./utils";

export function AssetRow({ file, selected, onToggle }: { file: FileItem, selected: boolean, onToggle: () => void }) {
  const badge = mimeBadge(file.type);
  const isLocked = !!file.lockedBy;
  const lockDate = file.lockedAt ? new Date(file.lockedAt).toLocaleString() : "";
  const lockTooltip = isLocked ? `Locked by ${file.lockedBy} on ${lockDate}` : "";

  return (
    <div className={`group grid grid-cols-[auto_minmax(0,1fr)_140px_120px_100px_40px] items-center gap-3 px-2 py-2 hover:bg-card-hover border-b border-default/50 last:border-0 ${selected ? "bg-card-hover" : ""}`}>
      <CustomCheckbox checked={selected} onChange={onToggle} />
      
      {/* Icon & Name */}
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid size-8 place-items-center rounded-md bg-background text-gray-400 border border-default relative">
          {file.isFolder ? (
             <Icon className="size-4"><path d="M3 7h5l2 2h11v10H3z" /></Icon>
          ) : (
             <span className="text-[10px] font-bold">{file.name.split('.').pop()?.substring(0,3).toUpperCase()}</span>
          )}
          
          {/* Lock Badge on Icon */}
          {isLocked && (
            <div className="absolute -top-1 -right-2 bg-red-500 rounded-md p-0.5 border border-background z-10" title={lockTooltip}>
              <LockIcon className="size-4 text-white" />
            </div>
          )}
        </div>
        
        <div className="min-w-0">
          <Link href={file.isFolder ? `/?path=${file.path}` : `/asset/${file.id}`} className="truncate font-medium text-gray-200 hover:underline">
            {file.name}
          </Link>
        </div>
      </div>

      {/* Type Column */}
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

      {/* Date Column */}
      <div className="text-sm text-gray-400 hidden md:block">
        {new Date(file.modifiedAt).toLocaleDateString()}
      </div>

      {/* Size Column */}
      <div className="text-sm text-gray-400 hidden sm:block">
        {fmtBytes(file.sizeBytes)}
      </div>

      {/* Actions */}
      {/* <div className="ml-auto">
        <Button variant="ghost" size="icon"><Kebab /></Button>
      </div> */}
    </div>
  );
}