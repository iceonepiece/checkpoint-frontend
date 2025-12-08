"use client";

import { Button } from "@/components/ui";

interface SelectionBarProps {
  count: number;
  onLock: () => void;
  onDelete: () => void;
  onMove: () => void;
  onDownload: () => void;
  clear: () => void;
}

export function SelectionBar({ count, onLock, onMove, onDelete, onDownload, clear }: SelectionBarProps) {
  if (count === 0) return null;
  return (
    <div className="sticky top-2 z-40 mb-4 rounded-lg surface-overlay px-3 py-2 text-sm text-gray-200 flex items-center justify-between animate-in slide-in-from-top-2">
      <div className="font-medium pl-1">{count} selected</div>
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={onDownload}>Download</Button>
        {/* <Button size="sm" onClick={onMove}>Move</Button> */}
        <Button size="sm" onClick={onLock}>Lock / Unlock</Button>
        <Button variant="danger" size="sm" onClick={onDelete}>Delete</Button>
        <div className="w-px h-4 bg-gray-700 mx-1" />
        <button onClick={clear} className="text-gray-400 hover:text-white text-xs px-2">Clear</button>
      </div>
    </div>
  );
}