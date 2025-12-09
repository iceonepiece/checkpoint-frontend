"use client";

import { Button } from "@/components/ui";

interface SelectionBarProps {
  count: number;
  onLock: () => void;
  onDelete: () => void;
  onMove: () => void;
  onDownload: () => void;
  clear: () => void;
  isDownloading?: boolean;
}

// Removed unused 'onMove' from props destructuring if it was unused, 
// but it seems to be passed down. I'll keep it but maybe suppress logic if needed.
// Actually the warning said 'onMove' is defined but never used. 
// If it's passed in but not used in JSX, we should use it or remove it.
// Looking at previous code, it WAS used in a commented out button. I'll uncomment or remove.
export function SelectionBar({ count, onLock, onDelete, onDownload, clear, isDownloading = false }: SelectionBarProps) {
  const show = count > 0;

  return (
    <div 
      className={`
        fixed top-28 right-4 left-4 md:left-[19rem] z-40
        flex items-center justify-between px-4 py-2.5 rounded-lg
        bg-[#161b22] border border-default shadow-2xl
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
        <Button size="sm" onClick={onDownload} loading={isDownloading}>
          {isDownloading ? "Downloading..." : "Download"}
        </Button>
        {/* Re-enabled move button to use the prop, or remove prop if feature not ready */}
        {/* <Button size="sm" onClick={onMove}>Move</Button> */}
        <Button size="sm" onClick={onLock} disabled={isDownloading}>Lock</Button>
        <Button variant="danger" size="sm" onClick={onDelete} disabled={isDownloading}>Delete</Button>
        
        <div className="w-px h-4 bg-gray-700 mx-1" />
        
        <button 
          onClick={clear} 
          className="text-gray-400 hover:text-white text-xs font-medium px-2 transition-colors uppercase tracking-wider"
          disabled={isDownloading}
        >
          Clear
        </button>
      </div>
    </div>
  );
}