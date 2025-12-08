"use client";

import { useState, useRef } from "react";

function DragHandle() {
  return (
    <div className="pointer-events-none absolute inset-y-0 -ml-[1px] w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-30">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-8 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-800 cursor-ew-resize pointer-events-auto">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
          <path d="M18 8L22 12L18 16" />
          <path d="M6 8L2 12L6 16" />
        </svg>
      </div>
    </div>
  );
}

type Props = {
  before: string;
  after: string;
  type: string;
};

export default function DiffViewer({ before, after, type }: Props) {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const isImage = type.startsWith("image/");

  if (!isImage) {
    return (
      <div className="grid grid-cols-2 gap-4 h-full">
        <div className="bg-background p-4 rounded border border-red-900/30 flex items-center justify-center text-red-400">
           Old Version (Non-visual diff)
        </div>
        <div className="bg-background p-4 rounded border border-green-900/30 flex items-center justify-center text-green-400">
           New Version
        </div>
      </div>
    );
  }

  const handleDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    
    // Calculate percentage and clamp between 0 and 100
    const pos = ((x - rect.left) / rect.width) * 100;
    setSliderPos(Math.min(100, Math.max(0, pos)));
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-[16/10] overflow-hidden rounded-md bg-background select-none touch-none group"
      onMouseMove={(e) => e.buttons === 1 && handleDrag(e)}
      onTouchMove={handleDrag}
      onClick={handleDrag}
    >
      {/* Background Image (New) */}
      <img 
        src={after} 
        alt="New" 
        className="absolute inset-0 w-full h-full object-contain pointer-events-none" 
      />
      <div className="absolute top-2 right-2 bg-green-600/90 text-white text-xs px-2 py-1 rounded shadow-sm z-10 font-medium">
        New (Head)
      </div>

      {/* Foreground Image (Old) */}
      <div 
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ 
          // Clip from the right side based on slider position
          clipPath: `inset(0 ${100 - sliderPos}% 0 0)` 
        }}
      >
        <img 
          src={before} 
          alt="Old" 
          className="absolute inset-0 w-full h-full object-contain" 
        />
        <div className="absolute top-2 left-2 bg-red-600/90 text-white text-xs px-2 py-1 rounded shadow-sm z-10 font-medium">
          Old (v1)
        </div>
        
        {/* Border line for the split */}
        <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-white/50"></div>
      </div>

      {/* Slider Handle */}
      <div 
        className="absolute inset-y-0"
        style={{ left: `${sliderPos}%` }}
      >
        <DragHandle />
      </div>
    </div>
  );
}