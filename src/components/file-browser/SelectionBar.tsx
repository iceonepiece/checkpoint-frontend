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
  const show = count > 0;

  return (
    <div 
      className={`
        /* Positioning: Fixed below header, spanning content width */
        fixed top-28 right-4 left-4 md:left-[19rem] z-40
        
        /* Layout & Appearance */
        flex items-center justify-between px-4 py-2.5 rounded-lg
        bg-[#161b22] border border-default shadow-2xl
        
        /* Animation: Slide down smoothly */
        transition-all duration-300 ease-out origin-top
        ${show ? "translate-y-0 opacity-100" : "-translate-y-8 opacity-0 pointer-events-none"}
      `}
    >
      <div className="flex items-center gap-3">
        <span className="font-semibold text-white bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded text-xs border border-blue-600/30">
          {count} Selected
        </span>
        <span className="text-gray-500 text-xs hidden sm:inline border-l border-gray-700 pl-3">
          Select actions to perform
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={onDownload}>Download</Button>
        {/* <Button size="sm" onClick={onMove}>Move</Button> */}
        <Button size="sm" onClick={onLock}>Lock</Button>
        <Button variant="danger" size="sm" onClick={onDelete}>Delete</Button>
        
        <div className="w-px h-4 bg-gray-700 mx-1" />
        
        <button 
          onClick={clear} 
          className="text-gray-400 hover:text-white text-xs font-medium px-2 transition-colors uppercase tracking-wider"
        >
          Clear
        </button>
      </div>
    </div>
  );
}